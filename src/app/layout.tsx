import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "./Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "ENT-Завоеватель",
  description: "Завоюй карту Казахстана знаниями",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="ru">
        <body className="bg-slate-950 text-white antialiased">
          <Header />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}