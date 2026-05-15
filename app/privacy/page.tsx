import { Shield, Lock, Eye, FileText, Globe, Mail } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Privacy Policy - NotesFind",
    description: "Learn how NotesFind protects your privacy and handles your data.",
};

export default function PrivacyPage() {
    const lastUpdated = "January 31, 2026";

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                        <Shield className="w-12 h-12" />
                    </div>
                </div>
                <h1 className="text-4xl font-black tracking-tight mb-4">Privacy Policy</h1>
                <p className="text-muted-foreground text-lg">
                    Last updated: {lastUpdated}
                </p>
            </div>

            <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-xl space-y-12">
                {/* Introduction */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/5 rounded-lg text-primary">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold">Introduction</h2>
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-4">
                        <p>
                            At NotesFind, accessible from notesfind.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by NotesFind and how we use it.
                        </p>
                        <p>
                            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
                        </p>
                    </div>
                </section>

                {/* Data We Collect */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/5 rounded-lg text-primary">
                            <Eye className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold">Information We Collect</h2>
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-4">
                        <p>
                            The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Account Information:</strong> When you register for an Account, we may ask for your contact information, including items such as name and email address.</li>
                            <li><strong>Contact Information:</strong> If you contact us directly, we may receive additional information about you such as your name, email address, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.</li>
                            <li><strong>Usage Data:</strong> Like many other websites, NotesFind makes use of log files. These files merely logs visitors to the site - usually a standard procedure for hosting companies and a part of hosting services&apos; analytics.</li>
                        </ul>
                    </div>
                </section>

                {/* How We Use Information */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/5 rounded-lg text-primary">
                            <Globe className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold">How We Use Your Information</h2>
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-4">
                        <p>We use the information we collect in various ways, including to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide, operate, and maintain our website</li>
                            <li>Improve, personalize, and expand our website</li>
                            <li>Understand and analyze how you use our website</li>
                            <li>Develop new products, services, features, and functionality</li>
                            <li>Communicate with you, either directly or through one of our partners</li>
                            <li>Send you emails</li>
                            <li>Find and prevent fraud</li>
                        </ul>
                    </div>
                </section>

                {/* Security */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/5 rounded-lg text-primary">
                            <Lock className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold">Security of Your Data</h2>
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                        <p>
                            The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
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
                        If you have any questions about this Privacy Policy, you can contact us:
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
