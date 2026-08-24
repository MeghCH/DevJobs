"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/NavBar";
import CandidateCard from "@/components/CandidateCard";
import JobCardCompany from "@/components/JobCardCompany";
import LogoutButton from "@/components/LogoutButton";
import { Mail, MapPin, Pencil, Check, X } from "lucide-react";
import Link from "next/link";
import { authApi, jobsApi } from "@/lib/api";
import { getApplicationsByJob, deleteApplication } from "@/lib/api/candidatures";

type Job = {
  id: string;
  company_id: string;
  title: string;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  contract_type: string | null;
  remote_type: string | null;
  location: string | null;
  skills: string | null;
  created_at: string;
};

type Candidat = {
  id: number;
  job_id: string;
  job_source: string;
  applied_at: string;
  user_id: number;
  firstname: string;
  name: string;
  candidate_skills: string | null;
  location: string | null;
  jobTitle: string;
};

export default function ProfilAdminPage() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState({ company: "", email: "", location: "" });
  const [form, setForm] = useState(saved);
  const [offres, setOffres] = useState<Job[]>([]);
  const [candidats, setCandidats] = useState<Candidat[]>([]);

  useEffect(() => {
    authApi.me().then((res) => {
      if (res?.success) {
        const { company, email, location } = res.data;
        const profile = { company: company || "", email: email || "", location: location || "" };
        setSaved(profile);
        setForm(profile);
      }
    });

    jobsApi.getRecruiterJobs().then((res) => {
      if (res?.success) setOffres(res.data);
    });
  }, []);

  useEffect(() => {
    if (offres.length === 0) return;
    Promise.all(
      offres.map((offre) =>
        getApplicationsByJob(offre.id).then((res) =>
          res.success ? res.data.map((c: Candidat) => ({ ...c, jobTitle: offre.title })) : []
        )
      )
    ).then((results) => setCandidats(results.flat()));
  }, [offres]);

  const handleSave = () => { setSaved(form); setEditing(false); };
  const handleCancel = () => { setForm(saved); setEditing(false); };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex justify-end pt-6">
          <LogoutButton />
        </div>

        <div className="flex flex-col items-center gap-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {saved.company.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="text-indigo-600">{saved.company.split(" ").at(-1)}</span>
          </h1>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 uppercase font-semibold tracking-widest">
                <Pencil className="w-3.5 h-3.5" />
                Informations
              </div>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
                  Modifier
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSave} aria-label="Sauvegarder" className="text-green-500 hover:text-green-700 transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={handleCancel} aria-label="Annuler" className="text-gray-500 hover:text-gray-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="flex flex-col gap-2">
                <input
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  placeholder="Nom de l'entreprise"
                  className="border border-indigo-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-indigo-400"
                />
                <input
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="Email"
                  type="email"
                  className="border border-indigo-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-indigo-400"
                />
                <input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Localisation"
                  className="border border-indigo-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-indigo-400"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  {saved.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  {saved.location || <span className="italic text-gray-500">Non renseignée</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        <hr className="border-gray-100 mb-8" />

        <div className="flex flex-col gap-4 mb-12">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest text-center">
            Mes offres
          </h2>
          <div className="flex flex-col gap-3">
            {offres.length === 0 && (
              <p className="text-sm text-gray-500 text-center">Aucune offre publiée.</p>
            )}
            {offres.map((offre) => {
              const skills = (() => {
                try { return JSON.parse(offre.skills || "[]"); } catch { return []; }
              })();
              const salary = offre.salary_min || offre.salary_max
                ? `${offre.salary_min ?? ""} - ${offre.salary_max ?? ""} ${offre.currency ?? "€"}`.trim()
                : "";
              return (
                <JobCardCompany
                  key={offre.id}
                  href={`/offres/${offre.id}?source=dj`}
                  title={offre.title}
                  company={saved.company}
                  location={offre.location ?? ""}
                  salary={salary}
                  contractType={offre.contract_type || ""}
                  tags={skills}
                  postedAt={new Date(offre.created_at).toLocaleDateString("fr-FR")}
                  remote={offre.remote_type || ""}
                  publishedAt={new Date(offre.created_at).toLocaleDateString("fr-FR")}
                  onDelete={async () => {
                    const res = await jobsApi.deleteJob(offre.id);
                    if (res?.success) setOffres((prev) => prev.filter((o) => o.id !== offre.id));
                  }}
                />
              );
            })}
          </div>
        </div>

        <hr className="border-gray-100 mb-8" />

        <div className="flex flex-col gap-4 mb-12 mt-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest text-center">
            Candidats
          </h2>
          <div className="flex flex-col gap-3 mt-2">
            {candidats.length === 0 && (
              <p className="text-sm text-gray-500 text-center">Aucune candidature reçue.</p>
            )}
            {candidats.map((candidat) => {
              const tags = (() => {
                try { return JSON.parse(candidat.candidate_skills || "[]"); } catch { return []; }
              })();
              return (
                <Link key={candidat.id} href={`/candidature/${candidat.id}`}>
                  <CandidateCard
                    name={`${candidat.firstname} ${candidat.name}`}
                    title={candidat.jobTitle}
                    experience=""
                    tags={tags}
                    availability=""
                    location={candidat.location || ""}
                    appliedTo={candidat.job_source}
                    sentAt={new Date(candidat.applied_at).toLocaleDateString("fr-FR")}
                    onDelete={async () => {
                      const res = await deleteApplication(candidat.id);
                      if (res?.success) setCandidats((prev) => prev.filter((c) => c.id !== candidat.id));
                    }}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
