"use client";

import { useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import { apply } from "@/lib/api/candidatures";
import { Paperclip, X } from "lucide-react";

type FileState = { cv: File | null; cover_letter: File | null; extra_documents: File | null };

function FileButton({ label, field, file, onChange }: {
  label: string;
  field: keyof FileState;
  file: File | null;
  onChange: (field: keyof FileState, file: File | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => ref.current?.click()}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors">
          <Paperclip className="w-4 h-4" />
          {label}
        </button>
        {file && (
          <button type="button" onClick={() => onChange(field, null)} aria-label="Supprimer"
            className="text-gray-400 hover:text-red-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {file && <span className="text-xs text-gray-500 truncate max-w-55">{file.name}</span>}
      <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden"
        onChange={(e) => onChange(field, e.target.files?.[0] ?? null)} />
    </div>
  );
}

function CandidatureForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const job_id = searchParams.get("job_id") ?? "";
  const job_source = searchParams.get("job_source") ?? "wld";

  const [form, setForm] = useState({
    firstname: "", name: "", gender: "", email: "", phone: "+33", postal_code: "", city: "",
  });
  const [files, setFiles] = useState<FileState>({ cv: null, cover_letter: null, extra_documents: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: string) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  function handleFileChange(field: keyof FileState, file: File | null) {
    setFiles((prev) => ({ ...prev, [field]: file }));
  }

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!job_id) { setError("Offre introuvable. Veuillez revenir à la liste des offres."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await apply(job_id, job_source, files, form);
      if (res.success) {
        router.push("/profil/user");
      } else {
        setError(res.message || "Une erreur est survenue.");
      }
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "border border-indigo-100 bg-indigo-50/40 rounded-lg px-4 py-2.5 text-sm text-indigo-600 outline-none focus:border-indigo-400 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-10">
      <div className="flex flex-col gap-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Information concernant <span className="text-indigo-600">la candidature.</span>
        </h1>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="prenom" className="text-sm font-medium text-gray-700">Prénom :*</label>
            <input id="prenom" type="text" value={form.firstname} onChange={set("firstname")} className={inputClass} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="nom" className="text-sm font-medium text-gray-700">Nom :*</label>
            <input id="nom" type="text" value={form.name} onChange={set("name")} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="sexe" className="text-sm font-medium text-gray-700">Sexe :*</label>
            <select id="sexe" value={form.gender} onChange={set("gender")} className={inputClass}>
              <option value="">-- Sélectionner --</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email :*</label>
            <input id="email" type="email" value={form.email} onChange={set("email")} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="telephone" className="text-sm font-medium text-gray-700">Téléphone :*</label>
            <input id="telephone" type="tel" value={form.phone} onChange={set("phone")} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="codepostal" className="text-sm font-medium text-gray-700">Code Postal :*</label>
              <input id="codepostal" type="text" value={form.postal_code} onChange={set("postal_code")} className={inputClass} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="ville" className="text-sm font-medium text-gray-700">Ville :*</label>
              <input id="ville" type="text" value={form.city} onChange={set("city")} className={inputClass} />
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Documents de <span className="text-indigo-600">candidature.</span>
        </h2>
        <p className="text-xs text-gray-400">Formats acceptés : PDF, JPG, PNG, DOC, DOCX - 5 Mo max par fichier</p>
        <div className="flex flex-wrap gap-6">
          <FileButton label="CV" field="cv" file={files.cv} onChange={handleFileChange} />
          <FileButton label="Lettre de motivation" field="cover_letter" file={files.cover_letter} onChange={handleFileChange} />
          <FileButton label="Documents complémentaires" field="extra_documents" file={files.extra_documents} onChange={handleFileChange} />
        </div>
      </div>

      <hr className="border-gray-100" />

      <div className="flex justify-center">
        <button type="submit" disabled={loading}
          className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white text-sm font-medium px-12 py-3 rounded-lg transition-colors">
          {loading ? "Envoi en cours..." : "Postuler"}
        </button>
      </div>
    </form>
  );
}

export default function CandidaturePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Suspense fallback={<p className="text-center py-10 text-sm text-gray-400">Chargement...</p>}>
        <CandidatureForm />
      </Suspense>
    </div>
  );
}
