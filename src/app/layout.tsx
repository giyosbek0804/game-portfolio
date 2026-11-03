import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/styles/exterior.css";

export const metadata: Metadata = {
  title: "Game-Style 3D Portfolio",
  description: "An interactive portfolio experienced as an exploratory 3D house.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
