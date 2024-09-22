import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import KeyConstants from "@/components/key_constants";

const inter = Inter({ subsets: ["latin"] });
const constants = KeyConstants();

export const metadata: Metadata = {
  title: "Kai's AI projects - Pohakoo",
  description: "Get AI to review your word choices from your writing. Generate your own neural network. Try an AI-powered Siri. Get natural-language analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content={`${constants["adsense_account"]}`}/>
        <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${constants["adsense_account"]}`} crossOrigin="anonymous"></script>
      </head>
      <body className={inter.className}>
        <Nav/>
        {children}
        <div className="fixed bottom-0 min-h-12 h-fit bg-white w-full flex items-center">
          <div className="ml-4 max-w-[75vw] pointer-events-none">
              © Pohakoo, LLC. Designed and coded by Kai Sereni.
          </div>
          <a className="ml-auto" href="https://github.com/KaiSereni/fai">
              <div className="p-2 w-12 h-12">
                  <img src="https://seeklogo.com/images/G/github-logo-7880D80B8D-seeklogo.com.png" className="w-full h-full rounded-full shadow-xl cursor-pointer duration-200 hover:scale-105"/>
              </div>
          </a>
        </div>
      </body>
    </html>
  );
}
