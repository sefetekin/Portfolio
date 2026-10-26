import type { Metadata, Viewport } from "next";
import { Caveat, Inter } from "next/font/google";
import "./globals.css";

const body = Inter({
    subsets: ["latin"],
    variable: "--font-body",
});

const hand = Caveat({
    subsets: ["latin"],
    weight: ["500", "700"],
    variable: "--font-hand",
});

const description =
    "Servet Efe Tekin: Computer Science student at UCL and software engineer. Drag a pin across the board to read about my experience, projects and CV.";

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
    themeColor: "#6b4423",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${body.variable} ${hand.variable}`}>
                {children}
            </body>
        </html>
    );
}
