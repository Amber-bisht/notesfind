import { Copyright, Shield, FileCheck, Info, Mail, ExternalLink } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Copyright Notice - NotesFind",
    description: "Intellectual property and copyright information for NotesFind.",
};

export default function CopyrightPage() {
    const currentYear = new Date().getFullYear();

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                        <Copyright className="w-12 h-12" />
                    </div>
                </div>
                <h1 className="text-4xl font-black tracking-tight mb-4">Copyright Notice</h1>
                <p className="text-muted-foreground text-lg">
                    &copy; {currentYear} NotesFind. All rights reserved.
                </p>
            </div>

            <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-xl space-y-12">
                {/* Ownership */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/5 rounded-lg text-primary">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold">Ownership of Copyright</h2>
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-4">
                        <p>
                            The copyright in this website and the material on this website (including without limitation the text, computer code, artwork, photographs, images, music, audio material, video material and audio-visual material on this website) is owned by NotesFind and its licensors.
                        </p>
                    </div>
                </section>

                {/* Copyright License */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/5 rounded-lg text-primary">
                            <FileCheck className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold">Copyright License</h2>
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-4">
                        <p>NotesFind grants to you a worldwide non-exclusive royalty-free revocable license to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>View this website and the material on this website on a computer or mobile device via a web browser;</li>
                            <li>Copy and store this website and the material on this website in your web browser cache memory; and</li>
                            <li>Print pages from this website for your own personal and non-commercial use.</li>
                        </ul>
                        <p>NotesFind does not grant you any other rights in relation to this website or the material on this website. In other words, all other rights are reserved.</p>
                    </div>
                </section>

                {/* Permissions */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/5 rounded-lg text-primary">
                            <Info className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold">Permissions</h2>
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-4">
                        <p>
                            You may request permission to use the copyright materials on this website by writing to <span className="font-semibold">chankyafoundation14@gmail.com</span>.
                        </p>
                    </div>
                </section>

                {/* Enforcement */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/5 rounded-lg text-primary">
                            <ExternalLink className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold">Enforcement of Copyright</h2>
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-4">
                        <p>
                            NotesFind takes the protection of its copyright very seriously.
                        </p>
                        <p>
                            If NotesFind discovers that you have used its copyright materials in contravention of the license above, NotesFind may bring legal proceedings against you seeking monetary damages and an injunction to stop you using those materials. You could also be ordered to pay legal costs.
                        </p>
                    </div>
                </section>

                {/* Contact Us */}
                <section className="bg-muted/30 p-8 rounded-2xl border border-dashed">
                    <div className="flex items-center gap-3 mb-4">
                        <Mail className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold">Contact Us</h2>
                    </div>
                    <p className="text-muted-foreground mb-4">
                        If you have any questions about this Copyright Notice, please contact us:
                    </p>
                    <ul className="space-y-4 text-sm">
                        <li className="flex items-center gap-2">
                            <span className="font-semibold">By email:</span>
                            <a href="mailto:chankyafoundation14@gmail.com" className="text-primary hover:underline">chankyafoundation14@gmail.com</a>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="font-semibold">By visiting our contact page:</span>
                            <Link href="/contact" className="text-primary hover:underline">NotesFind.com/contact</Link>
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
