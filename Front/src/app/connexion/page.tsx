"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi as api } from "@/lib/api";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

 const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      
      if (res.success) {
        localStorage.setItem("user", JSON.stringify(res.user));
        
        if (res.user && res.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/offres");
        }
        
      } else {
        setError(res.message);
      }
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <Link href="/" className="text-2xl font-extrabold text-indigo-600 mb-8">
        DevJobs
      </Link>

      <div className="w-full max-w-md border border-indigo-100 rounded-2xl p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Connexion à <span className="text-indigo-600">DevJobs</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pas encore de compte ?{" "}
            <Link
              href="/inscription"
              className="text-indigo-600 font-medium hover:underline"
            >
              S'inscrire
            </Link>
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@email.com"
              className="border border-indigo-100 bg-indigo-50/40 rounded-lg px-4 py-2.5 text-sm text-indigo-600 outline-none focus:border-indigo-600 transition-colors placeholder-indigo-600"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Mot de passe
              </label>
              <Link
                href="#"
                className="text-xs text-indigo-600 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="border border-indigo-100 bg-indigo-50/40 rounded-lg px-4 py-2.5 text-sm text-indigo-600 outline-none focus:border-indigo-600 transition-colors placeholder-indigo-500"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold py-3 rounded-lg transition-colors"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </div>
    </div>
  );
}
