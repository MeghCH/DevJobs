"use client";

import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    router.push("/connexion");
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-red-600 border border-red-400 px-4 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
    >
      Déconnexion
    </button>
  );
}
