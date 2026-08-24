"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/NavBar";
import { Euro, Briefcase, MapPin, Clock, Flag } from "lucide-react";
import { api } from "@/lib/api/jobs";
import { reportJob } from "@/lib/api/reports";

const REMOTE_LABELS: Record<string, string> = {
  onsite: "Présentiel",
  hybrid: "Partiel remote",
  remote: "Full remote",
};

type Job = {
  id: string | number;
  title: string;
  company_name: string;
  company_id: string;
  description: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  contract_type: string | null;
  remote_type: string | null;
  location: string | null;
  skills: string | string[] | null;
  experience_years: number | null;
  created_at: string;
  source: string;
};

function OffreDetail() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const source = searchParams.get("source") ?? undefined;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState("");

  useEffect(() => {
    api
      .getById(id, source)
      .then((res) => {
        if (res.success) {
          setJob(res.data);
        } else {
          setError(res.message || "Offre introuvable.");
        }
      })
      .catch(() => setError("Impossible de charger l'offre."))
      .finally(() => setLoading(false));
  }, [id, source]);

  const parsedSkills = (): string[] => {
    if (!job?.skills) return [];
    if (Array.isArray(job.skills)) return job.skills;
    try {
      return JSON.parse(job.skills);
    } catch {
      return (job.skills as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  };

  const formatSalary = () => {
    if (!job?.salary_min && !job?.salary_max) return null;
    const currency = job?.currency || "€";
    if (job?.salary_min && job?.salary_max)
      return `${job.salary_min.toLocaleString("fr-FR")} - ${job.salary_max.toLocaleString("fr-FR")} ${currency} / an`;
    return `${(job?.salary_min || job?.salary_max)?.toLocaleString("fr-FR")} ${currency} / an`;
  };

  const applyHref = `/candidature?job_id=${encodeURIComponent(id)}&job_source=${encodeURIComponent(source ?? job?.source ?? "wld")}`;

  const handleReport = async () => {
    if (!job) return;
    setReportLoading(true);
    setReportSuccess(false);
    setReportError("");
    try {
      const res = await reportJob(
        Number(job.id),
        job.source ?? (source || "wld"),
        reportReason.trim() || undefined,
      );
      if (res.success) {
        setReportSuccess(true);
        setReportReason("");
        setTimeout(() => setShowReportModal(false), 1500);
      } else {
        setReportError(res.message || "Erreur lors du signalement.");
      }
    } catch {
      setReportError("Impossible de contacter le serveur.");
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <p className="text-center py-20 text-sm text-gray-400">
        Chargement de l'offre...
      </p>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-20 flex flex-col gap-3">
        <p className="text-sm text-red-500">{error || "Offre introuvable."}</p>
        <Link
          href="/offres"
          className="text-sm text-indigo-500 hover:underline"
        >
          Retour aux offres
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
        <p className="text-sm text-gray-600">
          {job.company_name || job.company_id}
        </p>
        {job.location && (
          <p className="text-sm text-gray-500">{job.location}</p>
        )}
        <div className="mt-2 flex items-center gap-3">
          <Link
            href={applyHref}
            className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Continuer pour postuler
          </Link>
          <button
            onClick={() => {
              setShowReportModal(true);
              setReportSuccess(false);
              setReportError("");
            }}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
            title="Signaler cette offre"
            aria-label="Signaler cette offre"
          >
            <Flag className="w-4 h-4" />
            <span className="hidden sm:inline">Signaler</span>
          </button>
        </div>
      </div>

      <hr className="border-gray-100" />

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900">
          Détails de <span className="text-indigo-600">l'offre</span>
        </h2>
        <div className="flex flex-col gap-3">
          {formatSalary() && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Euro className="w-4 h-4 text-gray-500 shrink-0" />
              {formatSalary()}
            </div>
          )}
          {job.contract_type && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Briefcase className="w-4 h-4 text-gray-500 shrink-0" />
              {job.contract_type}
            </div>
          )}
          {job.remote_type && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
              {REMOTE_LABELS[job.remote_type] ?? job.remote_type}
            </div>
          )}
          {job.experience_years != null && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-500 shrink-0" />
              {job.experience_years} an{job.experience_years > 1 ? "s" : ""}{" "}
              d'expérience
            </div>
          )}
        </div>
      </div>

      {parsedSkills().length > 0 && (
        <>
          <hr className="border-gray-100" />
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-gray-900">
              Compétences <span className="text-indigo-600">requises</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {parsedSkills().map((skill) => (
                <span
                  key={skill}
                  className="text-xs bg-indigo-500 text-white px-2.5 py-1 rounded-md font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

       {job.description && (
        <>
          <hr className="border-gray-100" />
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">
              Description du <span className="text-indigo-600">poste</span>
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>
        </>
      )}

      <div className="flex justify-center pt-2">
        <Link
          href={applyHref}
          className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-12 py-3 rounded-lg transition-colors"
        >
          Postuler à cette offre
        </Link>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-500" />
              Signaler cette offre
            </h3>
            <p className="text-sm text-gray-500">
              Veuillez indiquer pourquoi vous signalez cette offre. Notre équipe
              de modération l'examinera.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Raison du signalement (optionnel)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 resize-none h-24"
            />
            {reportSuccess && (
              <div className="text-sm text-green-600 font-medium">
                Signalement envoyé avec succès.
              </div>
            )}
            {reportError && (
              <div className="text-sm text-red-600">{reportError}</div>
            )}
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => setShowReportModal(false)}
                className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg transition-colors"
                disabled={reportLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleReport}
                disabled={reportLoading}
                className="text-sm bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {reportLoading ? "Envoi..." : "Signaler"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OffreDetailPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Suspense
        fallback={
          <p className="text-center py-20 text-sm text-gray-400">
            Chargement...
          </p>
        }
      >
        <OffreDetail />
      </Suspense>
    </div>
  );
}
