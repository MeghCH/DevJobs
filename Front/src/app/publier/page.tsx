"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import FormField from "@/components/FormField";
import { authApi, jobsApi } from "@/lib/api";

const CONTRACT_TYPES = ["CDI", "CDD", "Stage", "Alternance"];
const REMOTE_TYPES = [
  { label: "Présentiel", value: "onsite" },
  { label: "Partiel remote", value: "hybrid" },
  { label: "Full remote", value: "remote" },
];

export default function PublierPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    contract_type: "",
    location: "",
    remote_type: "",
    salary_min: "",
    salary_max: "",
    experience_years: "",
    description: "",
    profile: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authApi
      .me()
      .then((res) => {
        if (!res?.success || res.data.role !== "recruiter") router.replace("/");
      })
      .catch(() => router.replace("/"));
  }, [router]);

  const set = (field: string) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const addSkill = (skill: string) => {
    if (skill.trim() && !skills.includes(skill.trim()))
      setSkills((prev) => [...prev, skill.trim()]);
    setSkillInput("");
  };

  const removeSkill = (skill: string) =>
    setSkills((prev) => prev.filter((s) => s !== skill));

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!form.title) {
      setError("L'intitulé du poste est requis.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await jobsApi.createJob({
        title: form.title,
        description: form.description || undefined,
        location: form.location || undefined,
        contract_type: form.contract_type || undefined,
        salary_min: form.salary_min ? Number(form.salary_min) : undefined,
        salary_max: form.salary_max ? Number(form.salary_max) : undefined,
        experience_years: form.experience_years
          ? Number(form.experience_years)
          : undefined,
        remote_type:
          (form.remote_type as "remote" | "hybrid" | "onsite") || undefined,
        skills: skills.length ? skills : undefined,
      });
      if (res.success) {
        router.push("/profil/company");
      } else {
        setError(res.message || "Une erreur est survenue.");
      }
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "border border-indigo-100 bg-indigo-50/40 rounded-lg px-4 py-2.5 text-sm text-indigo-700 outline-none focus:border-indigo-400 transition-colors placeholder-indigo-600";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Publier une <span className="text-indigo-600">offre d'emploi</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Remplis les informations ci-dessous pour diffuser ton offre auprès
            de milliers de développeurs.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Informations générales
          </span>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Intitulé du poste" required>
              <input
                type="text"
                value={form.title}
                onChange={set("title")}
                placeholder="Ex: Developpeur Python"
                className={inputClass}
              />
            </FormField>
            <FormField label="Localisation" required>
              <input
                type="text"
                value={form.location}
                onChange={set("location")}
                placeholder="Ex: Paris, France"
                className={inputClass}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type de contrat" required id="contrat">
              <select
                id="contrat"
                value={form.contract_type}
                onChange={set("contract_type")}
                className={inputClass}
              >
                <option value="">Choisir</option>
                {CONTRACT_TYPES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Télétravail" id="remote">
              <select
                id="remote"
                value={form.remote_type}
                onChange={set("remote_type")}
                className={inputClass}
              >
                <option value="">Choisir</option>
                {REMOTE_TYPES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        <hr className="border-gray-100" />

        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Rémunération
          </span>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Salaire min (€/an)">
              <input
                type="number"
                value={form.salary_min}
                onChange={set("salary_min")}
                placeholder="Ex: 40000"
                className={inputClass}
              />
            </FormField>
            <FormField label="Salaire max (€/an)">
              <input
                type="number"
                value={form.salary_max}
                onChange={set("salary_max")}
                placeholder="Ex: 55000"
                className={inputClass}
              />
            </FormField>
            <FormField label="Expérience (années)">
              <input
                type="number"
                value={form.experience_years}
                onChange={set("experience_years")}
                placeholder="Ex: 2"
                className={inputClass}
              />
            </FormField>
          </div>
        </div>

        <hr className="border-gray-100" />

        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Compétences & description
          </span>

          <FormField label="Compétences techniques" required>
            <div className="border border-indigo-100 bg-indigo-50/40 rounded-lg px-4 py-3 flex flex-col gap-3 min-h-10">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
                placeholder="Ajouter une compétence et appuyer sur Entrée..."
                className="bg-transparent border-none outline-none text-sm text-indigo-700 placeholder-indigo-400 flex-1"
              />
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      onClick={() => removeSkill(skill)}
                      className="text-xs text-indigo-600 font-medium bg-white border border-indigo-100 rounded-lg px-3 py-1 cursor-pointer hover:bg-red-50 hover:border-red-200 hover:text-red-400 transition-colors"
                    >
                      {skill} ×
                    </span>
                  ))}
                </div>
              )}
            </div>
          </FormField>

           <FormField label="Description du poste" required>
             <textarea
               value={form.description}
               onChange={set("description")}
               placeholder="Décris les missions, les attentes, le contexte..."
               className={`${inputClass} min-h-[140px] resize-none`}
             />
           </FormField>
        </div>

        <hr className="border-gray-100" />

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Les champs marqués * sont obligatoires
          </p>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white text-sm font-semibold px-10 py-3 rounded-lg transition-colors"
          >
            {loading ? "Publication en cours..." : "Publier l'offre"}
          </button>
        </div>
      </form>
    </div>
  );
}
