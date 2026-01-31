import { Scale, BookOpen, UserCheck, AlertTriangle, ShieldAlert, Mail } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Terms and Conditions - NotesFind",
    description: "Read our terms and conditions for using NotesFind.",
};

export default function TermsPage() {
    const lastUpdated = "January 31, 2026";

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                        <Scale className="w-12 h-12" />
                    </div>
                </div>
                <h1 className="text-4xl font-black tracking-tight mb-4">Terms and Conditions</h1>
                <p className="text-muted-foreground text-lg">
                    Last updated: {lastUpdated}
                </p>
            </div>

            <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-xl space-y-12">
                {/* Agreement to Terms */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/5 rounded-lg text-primary">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold">Agreement to Terms</h2>
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-4">
                        <p>
                            Welcome to NotesFind. These terms and conditions outline the rules and regulations for the use of NotesFind&apos;s Website, located at notesfind.com.
                        </p>
                        <p>
                            By accessing this website we assume you accept these terms and conditions. Do not continue to use NotesFind if you do not agree to take all of the terms and conditions stated on this page.
                        </p>
                    </div>
                </section>

                {/* User Accounts */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/5 rounded-lg text-primary">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold">User Accounts</h2>
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-4">
                        <p>
                            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                        </p>
                        <p>
                            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
                        </p>
                    </div>
                </section>

                {/* Intellectual Property */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/5 rounded-lg text-primary">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold">Intellectual Property</h2>
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-4">
                        <p>
                            The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of NotesFind and its licensors.
                        </p>
                        <p>
                            Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of NotesFind.
                        </p>
                    </div>
                </section>

                {/* Limitation of Liability */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/5 rounded-lg text-primary">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold">Limitation of Liability</h2>
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                        <p>
                            In no event shall NotesFind, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
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
                        If you have any questions about these Terms, please contact us:
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
