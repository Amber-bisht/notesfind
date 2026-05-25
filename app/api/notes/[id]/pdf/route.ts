import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import sharp from 'sharp';
import { JSDOM } from 'jsdom';
// @ts-ignore
import htmlToPdfmake from 'html-to-pdfmake';
import pdfmake from 'pdfmake';
import { marked } from 'marked';

const TRANSPARENT_PLACEHOLDER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Define fonts paths relative to process.cwd() (project root)
const fonts = {
    Roboto: {
        normal: path.resolve(process.cwd(), 'public/fonts/Roboto-Regular.ttf'),
        bold: path.resolve(process.cwd(), 'public/fonts/Roboto-Bold.ttf'),
        italics: path.resolve(process.cwd(), 'public/fonts/Roboto-Italic.ttf'),
        bolditalics: path.resolve(process.cwd(), 'public/fonts/Roboto-BoldItalic.ttf')
    },
    Monospace: {
        normal: path.resolve(process.cwd(), 'public/fonts/Roboto-Regular.ttf'),
        bold: path.resolve(process.cwd(), 'public/fonts/Roboto-Bold.ttf'),
        italics: path.resolve(process.cwd(), 'public/fonts/Roboto-Italic.ttf'),
        bolditalics: path.resolve(process.cwd(), 'public/fonts/Roboto-BoldItalic.ttf')
    },
    Courier: {
        normal: path.resolve(process.cwd(), 'public/fonts/Roboto-Regular.ttf'),
        bold: path.resolve(process.cwd(), 'public/fonts/Roboto-Bold.ttf'),
        italics: path.resolve(process.cwd(), 'public/fonts/Roboto-Italic.ttf'),
        bolditalics: path.resolve(process.cwd(), 'public/fonts/Roboto-BoldItalic.ttf')
    }
};

// Helper function to download and convert remote images to base64 PNG
async function getBase64Image(url: string): Promise<string> {
    if (!url) return TRANSPARENT_PLACEHOLDER;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`Failed to fetch image: ${url}, status: ${response.status}`);
            return TRANSPARENT_PLACEHOLDER;
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const pngBuffer = await sharp(buffer).png().toBuffer();
        return `data:image/png;base64,${pngBuffer.toString('base64')}`;
    } catch (e) {
        console.error(`Error processing image ${url}:`, e);
        return TRANSPARENT_PLACEHOLDER;
    }
}

// Convert all remote images in HTML string to base64 PNG
async function processInlineImages(htmlString: string): Promise<string> {
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
    let match;
    let newHtml = htmlString;
    const cache: { [key: string]: string } = {};

    while ((match = imgRegex.exec(htmlString)) !== null) {
        const url = match[1];
        if (url.startsWith('http://') || url.startsWith('https://')) {
            if (!cache[url]) {
                const base64 = await getBase64Image(url);
                if (base64) cache[url] = base64;
            }
            if (cache[url]) {
                newHtml = newHtml.replaceAll(url, cache[url]);
            }
        }
    }
    return newHtml;
}

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    try {
        // 1. Authenticate User
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
        }

        const session = await verifyToken(token);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }

        await dbConnect();

        // 2. Fetch User and Note details
        const user = await User.findOne({ email: session.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const note = await Note.findById(id).populate('authorId', 'name image socials').populate('subCategoryId').lean() as any;
        if (!note) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }

        if (note.type === 'external') {
            return NextResponse.json({ error: 'Cannot download external resources as PDF' }, { status: 400 });
        }

        // 3. Clean Content (Strip emojis to prevent unsupported font square box rendering)
        const cleanTitle = note.title.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
        const cleanContent = (note.content || '').replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');

        // Construct actual Note link on the web
        const subCategorySlug = note.subCategoryId?.slug || 'notes';
        const noteUrl = `https://notesfind.com/${subCategorySlug}/${note.slug}`;
        const authorLinkedin = note.authorId?.socials?.linkedin || 'https://www.linkedin.com/company/notesfind/';

        // 4. Render Markdown to HTML using marked
        const rawHtmlContent = await marked.parse(cleanContent);

        // 5. Pre-process HTML images into Base64 PNGs
        const htmlContent = await processInlineImages(rawHtmlContent);

        // 6. Setup JSDOM to parse HTML to pdfmake JSON
        const { window } = new JSDOM('');
        const pdfContent = htmlToPdfmake(htmlContent, { window });

        // 7. Process note gallery images
        const galleryImagesPdf = [];
        if (note.images && note.images.length > 0) {
            for (const imgUrl of note.images) {
                const base64 = await getBase64Image(imgUrl);
                if (base64) {
                    galleryImagesPdf.push({
                        image: base64,
                        width: 450,
                        alignment: 'center',
                        margin: [0, 10, 0, 10]
                    });
                }
            }
        }

        // 8. Build the pdfmake document definition
        const docDefinition: any = {
            content: [
                { text: cleanTitle, style: 'title', link: noteUrl },
                {
                    text: [
                        { text: 'Author: ' },
                        { text: note.authorId?.name || 'Admin', link: authorLinkedin, style: 'metaLink' },
                        { text: `  |  Date: ${new Date(note.createdAt).toLocaleDateString()}` }
                    ],
                    style: 'meta'
                },
                { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#e2e8f0' }], margin: [0, 5, 0, 15] },
                pdfContent,
                ...galleryImagesPdf,
                // Add Footer note
                { text: ' ', margin: [0, 0, 0, 20] },
                {
                    text: [
                        { text: 'Downloaded from ' },
                        { text: 'notesfind.com', link: 'https://notesfind.com', style: 'footerLink' },
                        { text: '  •  Follow us on ' },
                        { text: 'LinkedIn', link: 'https://www.linkedin.com/company/notesfind/', style: 'footerLink' }
                    ],
                    style: 'footer',
                    alignment: 'center'
                }
            ],
            watermark: {
                text: 'notesfind.com',
                color: 'blue',
                opacity: 0.08,
                bold: true,
                fontSize: 36,
                angle: 45
            },
            defaultStyle: {
                font: 'Roboto'
            },
            styles: {
                title: { fontSize: 24, bold: true, color: '#2563eb', decoration: 'underline', marginBottom: 5 },
                meta: { fontSize: 10, color: '#666666', italics: true },
                metaLink: { color: '#2563eb', decoration: 'underline' },
                h1: { fontSize: 20, bold: true, marginTop: 15, marginBottom: 5 },
                h2: { fontSize: 16, bold: true, marginTop: 12, marginBottom: 5 },
                h3: { fontSize: 14, bold: true, marginTop: 10, marginBottom: 4 },
                p: { fontSize: 11, lineHeight: 1.4, marginBottom: 8 },
                ul: { marginBottom: 10 },
                li: { fontSize: 11, marginBottom: 4 },
                footer: { fontSize: 9, color: '#999999', italics: true },
                footerLink: { color: '#2563eb', decoration: 'underline' }
            }
        };

        // 9. Generate the PDF buffer using pdfmake
        pdfmake.addFonts(fonts);
        const pdf = pdfmake.createPdf(docDefinition);
        const buffer = await pdf.getBuffer();

        // 10. Track the download and write an audit log
        const alreadyDownloaded = user.downloads.some((d: any) => d.noteId?.toString() === id);
        if (!alreadyDownloaded) {
            user.downloads.push({
                noteId: note._id,
                slug: note.slug,
                downloadedAt: new Date()
            });
            await user.save();

            await createAuditLog(user._id.toString(), {
                action: 'note_download',
                details: `User downloaded note as PDF from backend: ${note.slug}`,
                targetId: note._id.toString(),
                metadata: { slug: note.slug }
            });
        }

        // 11. Return PDF file response
        const filename = `${cleanTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        return new Response(new Uint8Array(buffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error('PDF download API error:', error);
        return NextResponse.json({ error: 'Internal server error during PDF generation', details: (error as Error).message }, { status: 500 });
    }
}
