import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import Note from '@/models/Note';
import { FileText, Eye, ChevronRight, BookOpen, ArrowLeft } from 'lucide-react';
import { ViewTracker } from '@/components/ViewTracker';
import { NoteViewer } from '@/components/NoteViewer';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

interface Params {
    params: Promise<{ category: string; slug2: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
    try {
        await dbConnect();
        
        // 1. All Category/SubCategory pairs (usually limited in number)
        const subCategories = await SubCategory.find({}).populate('categoryId', 'slug').lean() as any[];
        const subRoutes = subCategories
            .filter((sub) => sub.categoryId && sub.categoryId.slug)
            .map((sub) => ({
                category: sub.categoryId.slug,
                slug2: sub.slug,
            }));

        // 2. Limit Note Routes to recent 100 to prevent build timeouts at scale
        const notes = await Note.find({ isPublished: true })
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('subCategoryId', 'slug')
            .lean() as any[];
            
        const noteRoutes = notes
            .filter((n) => n.subCategoryId && n.subCategoryId.slug)
            .map((n) => ({
                category: n.subCategoryId.slug,
                slug2: n.slug,
            }));

        return [...subRoutes, ...noteRoutes];
    } catch (e) {
        console.warn('DB connection failed during SSG for dual routes', e);
        return [];
    }
}

export async function generateMetadata(props: Params) {
    const params = await props.params;
    await dbConnect();

    // Check if it's a SubCategory page first (category is Category slug)
    const category = await Category.findOne({ slug: params.category }).select('_id').lean();
    if (category) {
        const subCategory = await SubCategory.findOne({ slug: params.slug2, categoryId: category._id }).lean() as any;
        if (subCategory) {
            return {
                title: `${subCategory.name} Notes - NotesFind`,
                description: `Best notes for ${subCategory.name}`,
            };
        }
    }

    // Check if it's a Note page (category is SubCategory slug)
    const subCategory = await SubCategory.findOne({ slug: params.category }).select('_id').lean();
    if (subCategory) {
        const note = await Note.findOne({ slug: params.slug2, subCategoryId: subCategory._id }).lean() as any;
        if (note) {
            return {
                title: `${note.title}`,
                description: note.content?.substring(0, 160),
            };
        }
    }

    return { title: 'Not Found' };
}

export default async function DualRoutePage(props: Params) {
    const params = await props.params;
    await dbConnect();

    // 1. DETECT TYPE: Check if slug1 is a Category
    const category = await Category.findOne({ slug: params.category }).lean() as any;
    
    if (category) {
        // If slug1 is a category, then slug2 must be a subcategory
        const subCategory = await SubCategory.findOne({ slug: params.slug2, categoryId: category._id }).lean() as any;
        if (subCategory) {
            return renderSubCategoryPage(category, subCategory);
        }
    }

    // 2. DETECT TYPE: Check if slug1 is a SubCategory
    const subCategory = await SubCategory.findOne({ slug: params.category })
        .populate('categoryId', 'slug name')
        .lean() as any;
    
    if (subCategory) {
        // If slug1 is a subcategory, then slug2 must be a note
        const note = await Note.findOne({ slug: params.slug2, subCategoryId: subCategory._id })
            .populate('authorId')
            .populate({
                path: 'subCategoryId',
                populate: { path: 'categoryId' }
            })
            .lean() as any;
        
        if (note) {
            return renderNotePage(note);
        }
    }

    return notFound();
}

async function renderSubCategoryPage(category: any, subCategory: any) {
    const notes = await Note.find({ subCategoryId: subCategory._id, isPublished: true })
        .sort({ createdAt: -1 })
        .populate('authorId', 'name image')
        .lean() as any[];

    return (
        <div className="space-y-8">
            <ViewTracker id={subCategory._id.toString()} type="subcategory" />
            <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground space-x-2">
                    <Link href={`/${category.slug}`} className="hover:text-primary transition-colors">{category.name}</Link>
                    <span>/</span>
                    <span className="text-foreground">{subCategory.name}</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight">{subCategory.name} Notes</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                    <Link key={note._id} href={`/${subCategory.slug}/${note.slug}`} className="group rounded-2xl border border-border bg-card text-card-foreground shadow transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-foreground hover:ring-1 hover:ring-foreground/10 block overflow-hidden h-full flex flex-col">
                        <div className="relative aspect-video w-full overflow-hidden bg-muted border-b border-border transition-colors group-hover:border-foreground">
                            {note.images?.[0] ? (
                                <Image
                                    src={note.images[0]}
                                    alt={note.title}
                                    width={400}
                                    height={225}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                    <FileText className="h-10 w-10 text-primary/40" />
                                </div>
                            )}
                        </div>
                        <div className="p-6 flex flex-col flex-1 space-y-4">
                            <div>
                                <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">{note.title}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-3 mt-2">{note.content}</p>
                            </div>
                            <div className="mt-auto pt-2 flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    {note.authorId?.image ?
                                        <Image src={note.authorId.image} width={24} height={24} className="rounded-full object-cover border border-border" alt={note.authorId.name} /> :
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                                            {note.authorId?.name?.[0] || 'A'}
                                        </div>
                                    }
                                    <span className="font-medium">{note.authorId?.name || 'Admin'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        <span>{note.views || 0}</span>
                                    </div>
                                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
                {notes.length === 0 && (
                    <p className="text-muted-foreground col-span-full py-12 text-center">No notes available yet.</p>
                )}
            </div>
        </div>
    );
}

async function renderNotePage(note: any) {
    const categorySlug = note.subCategoryId?.categoryId?.slug;
    const subCategorySlug = note.subCategoryId?.slug;

    // Fetch related notes in the same subcategory
    const relatedNotes = await Note.find({
        subCategoryId: note.subCategoryId?._id,
        _id: { $ne: note._id },
        isPublished: true
    })
        .sort({ rank: 1, createdAt: -1 })
        .limit(3)
        .populate('authorId', 'name')
        .lean();

    const serializedNote = JSON.parse(JSON.stringify(note));
    const serializedRelated = JSON.parse(JSON.stringify(relatedNotes));

    // Get current user for PDF tracking etc if needed
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    let currentUserId = "";

    if (token) {
        const payload = await verifyToken(token);
        if (payload) {
            currentUserId = payload.userId;
        }
    }

    return (
        <div className="bg-background min-h-screen pb-20">
            {/* Custom Header / Breadcrumb for Blog */}
            <div className="bg-muted/30 border-b">
                <div className="container mx-auto px-4 h-16 flex items-center text-sm text-muted-foreground overflow-x-auto whitespace-nowrap">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4 mx-2" />
                    {categorySlug && (
                        <>
                            <Link href={`/${categorySlug}`} className="hover:text-primary transition-colors">{note.subCategoryId?.categoryId?.name}</Link>
                            <ChevronRight className="w-4 h-4 mx-2" />
                        </>
                    )}
                    {subCategorySlug && (
                        <>
                            <Link href={`/${categorySlug}/${subCategorySlug}`} className="hover:text-primary transition-colors">{note.subCategoryId?.name}</Link>
                            <ChevronRight className="w-4 h-4 mx-2" />
                        </>
                    )}
                    <span className="font-semibold text-foreground truncate max-w-[200px]">{note.title}</span>
                </div>
            </div>

            {/* Main Content */}
            <NoteViewer
                note={serializedNote}
                categorySlug={categorySlug}
                subCategorySlug={subCategorySlug}
                currentUser={currentUserId}
            />

            {/* "More in this topic" Section */}
            {serializedRelated.length > 0 && (
                <div className="container mx-auto px-4 max-w-4xl mt-16 border-t pt-12">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold">More in {note.subCategoryId?.name}</h3>
                        <Link href={`/${categorySlug ?? ''}/${subCategorySlug ?? ''}`} className="text-primary font-medium hover:underline flex items-center">
                            View All <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {serializedRelated.map((rel: any) => (
                            <Link key={rel._id} href={`/${subCategorySlug}/${rel.slug}`} className="group border border-border rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-foreground hover:ring-1 hover:ring-foreground/10 bg-card">
                                <div className="aspect-video bg-muted relative border-b border-border transition-colors group-hover:border-foreground">
                                    {rel.images?.[0] ? (
                                        <Image src={rel.images[0]} alt={rel.title} width={400} height={225} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary/40"><BookOpen className="w-8 h-8" /></div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h4 className="font-bold line-clamp-2 group-hover:text-primary transition-colors mb-2 text-sm md:text-base leading-tight">{rel.title}</h4>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{new Date(rel.createdAt).toLocaleDateString()}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Back Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-4 md:hidden z-40">
                <Link href={`/${categorySlug}/${subCategorySlug}`} className="flex items-center justify-center w-full py-3 bg-secondary text-secondary-foreground rounded-lg font-bold">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to {note.subCategoryId?.name}
                </Link>
            </div>
        </div>
    );
}
