"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function ProfilRedirect() {
  const router = useRouter();

  useEffect(() => {
    authApi.me().then((res) => {
      if (!res?.success) {
        router.replace("/connexion");
        return;
      }
      const role = res.data?.role;
      if (role === "admin") router.replace("/admin");
      else if (role === "recruiter") router.replace("/profil/company");
      else router.replace("/profil/user");
    }).catch(() => router.replace("/connexion"));
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-400">Chargement...</p>
    </div>
  );
}
