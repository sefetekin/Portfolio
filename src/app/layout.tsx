import type { Metadata, Viewport } from "next";
import { Chakra_Petch, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const body = IBM_Plex_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-body",
});

const mono = JetBrains_Mono({
    subsets: ["latin"],
    weight: ["400", "600"],
    variable: "--font-mono",
});

const description =
    "Servet Efe Tekin: MSc AI & ML student at Imperial College London and software engineer. Slide the objects on my desk onto the projection pad to read about my experience, research, projects, CV and pin collection.";

const display = Chakra_Petch({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
    variable: "--font-display",
});

export const metadata: Metadata = {
    title: "Servet Efe Tekin",
    description,
    authors: [{ name: "Servet Efe Tekin" }],
    creator: "Servet Efe Tekin",
    openGraph: {
        title: "Servet Efe Tekin",
        description,
        type: "website",
        locale: "en_US",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#06080b",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${body.variable} ${mono.variable} ${display.variable}`} suppressHydrationWarning>
            <head>
                {/* first visit only: play the boot sequence (set before paint so the desk doesn't flash) */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `try{if(!localStorage.getItem("desk-booted")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("boot")}catch(e){}`,
                    }}
                />
            </head>
            <body>
                {children}
            </body>
        </html>
    );
}
