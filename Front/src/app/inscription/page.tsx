"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi as api } from "@/lib/api";

export default function InscriptionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstname: "",
    name: "",
    email: "",
    password: "",
    role: "user" as "user" | "recruiter",
    company: "",
    siret: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.register(form);
      if (res.success) {
        router.push("/connexion");
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
            Créer un <span className="text-indigo-600">compte</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Déjà un compte ?{" "}
            <Link
              href="/connexion"
              className="text-indigo-600 font-medium hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="prenom"
                className="text-sm font-medium text-gray-700"
              >
                Prénom
              </label>
              <input
                id="prenom"
                type="text"
                value={form.firstname}
                onChange={(e) =>
                  setForm({ ...form, firstname: e.target.value })
                }
                placeholder="Clara"
                className="border border-indigo-100 bg-indigo-50/40 rounded-lg px-4 py-2.5 text-sm text-indigo-600 outline-none focus:border-indigo-400 transition-colors placeholder-indigo-600"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="nom"
                className="text-sm font-medium text-gray-700"
              >
                Nom
              </label>
              <input
                id="nom"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Demoy"
                className="border border-indigo-100 bg-indigo-50/40 rounded-lg px-4 py-2.5 text-sm text-indigo-600 outline-none focus:border-indigo-400 transition-colors placeholder-indigo-600"
              />
            </div>
          </div>

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
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="exemple@email.com"
              className="border border-indigo-100 bg-indigo-50/40 rounded-lg px-4 py-2.5 text-sm text-indigo-600 outline-none focus:border-indigo-400 transition-colors placeholder-indigo-600"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="border border-indigo-100 bg-indigo-50/40 rounded-lg px-4 py-2.5 text-sm text-indigo-600 outline-none focus:border-indigo-400 transition-colors placeholder-indigo-600"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className="text-sm font-medium text-gray-700">
              Je suis
            </label>
            <select
              id="role"
              value={form.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value as "user" | "recruiter",
                  company: "",
                  siret: "",
                })
              }
              className="border border-indigo-100 bg-indigo-50/40 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-400 text-gray-500 transition-colors"
            >
              <option value="user">Un candidat</option>
              <option value="recruiter">Une entreprise</option>
            </select>
          </div>

          {form.role === "recruiter" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="company"
                  className="text-sm font-medium text-gray-700"
                >
                  Nom de l&apos;entreprise
                </label>
                <input
                  id="company"
                  type="text"
                  value={form.company}
                  onChange={(e) =>
                    setForm({ ...form, company: e.target.value })
                  }
                  placeholder="Acme Corp"
                  className="border border-indigo-100 bg-indigo-50/40 rounded-lg px-4 py-2.5 text-sm text-indigo-600 outline-none focus:border-indigo-400 transition-colors placeholder-indigo-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="siret"
                  className="text-sm font-medium text-gray-700"
                >
                  SIRET
                </label>
                <input
                  id="siret"
                  type="text"
                  value={form.siret}
                  onChange={(e) =>
                    setForm({ ...form, siret: e.target.value })
                  }
                  placeholder="123 456 789 00012"
                  maxLength={17}
                  className="border border-indigo-100 bg-indigo-50/40 rounded-lg px-4 py-2.5 text-sm text-indigo-600 outline-none focus:border-indigo-400 transition-colors placeholder-indigo-600"
                />
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold py-3 rounded-lg transition-colors"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </div>
    </div>
  );
}
