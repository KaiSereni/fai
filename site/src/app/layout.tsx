import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import KeyConstants from "@/components/key_constants";

const inter = Inter({ subsets: ["latin"] });
const constants = KeyConstants();

export const metadata: Metadata = {
  title: "AI Writing Reviewer - Review Word Choices with AI",
  description: "See how strongly AI agrees with your word choices. GPT AI-powered essay tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content={`ca-pub-${constants["adsense_account"]}`}/>
        <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${constants["adsense_account"]}`} crossOrigin="anonymous"></script>
      </head>
      <body className={inter.className}>
        <Nav/>
        {children}
      </body>
    </html>
  );
}
