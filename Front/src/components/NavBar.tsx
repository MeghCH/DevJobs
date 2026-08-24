"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api";

const baseLinks = [
  { label: "Accueil", href: "/" },
  { label: "Offres d'emplois", href: "/offres" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    authApi.me().then((res) => setRole(res?.success ? res.data.role : null)).catch(() => {});
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const links = role === "recruiter"
    ? [...baseLinks, { label: "Publier une offre", href: "/publier" }, { label: "Profil", href: "/profil" }]
    : [...baseLinks, { label: "Profil", href: "/profil" }];

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/" && pathname.startsWith(href + "/")) ||
    (href === "/profil" && role === "admin" && pathname === "/admin");

  return (
    <nav className="border-b border-gray-100 bg-white">
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 gap-12">
        <Link href="/" className="text-xl font-extrabold text-indigo-700 tracking-tight shrink-0">
          DevJobs
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm transition-colors",
                isActive(link.href)
                  ? "text-indigo-700 font-semibold"
                  : "text-gray-800 hover:text-indigo-500",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Hamburger */}
        <button
          className="sm:hidden p-1 text-gray-600 hover:text-indigo-600 transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden flex flex-col border-t border-gray-100 px-4 py-3 gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm py-2.5 px-3 rounded-lg transition-colors",
                isActive(link.href)
                  ? "text-indigo-700 font-semibold bg-indigo-50"
                  : "text-gray-800 hover:text-indigo-500 hover:bg-indigo-50/50",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
