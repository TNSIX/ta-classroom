import type { Metadata } from "next";
import { Geist, Geist_Mono, Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Teacher Assistant Classroom",
  description: "Powered by Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${prompt.className} antialiased h-full`}
      >
        {children}
      </body>
    </html>
  );
}
