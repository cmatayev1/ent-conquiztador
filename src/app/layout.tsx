import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "./ConvexClientProvider";
import StoreUser from "./StoreUser";
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
      <ConvexClientProvider>
        <html lang="ru">
          <body className="bg-slate-950 text-white antialiased">
            <StoreUser />
            <Header />
            {children}
          </body>
        </html>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}