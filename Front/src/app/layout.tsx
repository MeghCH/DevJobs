import type { ReactNode } from "react";
import "./globals.css";

export const metadata = { title: "DevJobs" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="flex flex-col min-h-screen">
        <div className="flex-1">{children}</div>
        <footer className="mt-auto border-t border-gray-200 text-center text-xs text-gray-500 py-6">
          © 2026 DevJobs - Tous droits réservés
        </footer>
      </body>
    </html>
  );
}
