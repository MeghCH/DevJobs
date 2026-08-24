"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/NavBar";
import {
  Briefcase,
  MapPin,
  Euro,
  FileText,
  Download,
  User,
  Mail,
  Phone,
  MapPin as Pin,
} from "lucide-react";
import {
  getApplicationById,
  updateApplicationStatus,
} from "@/lib/api/candidatures";
import { authApi } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type Application = {
  id: number;
  job_id: number;
  job_source: string;
  applied_at: string;
  status: "pending" | "accepted" | "rejected";
  title: string;
  company_name: string;
  contract_type: string;
  remote_type: string;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  skills: string | string[] | null;
  cv_path: string | null;
  cover_letter_path: string | null;
  extra_documents_path: string | null;
  applicant_firstname: string | null;
  applicant_name: string | null;
  applicant_gender: string | null;
  applicant_email: string | null;
  applicant_phone: string | null;
  applicant_postal_code: string | null;
  applicant_city: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  accepted: "Acceptée",
  rejected: "Refusée",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function DocLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      download
      className="flex items-center gap-2 text-xs text-indigo-600 border border-indigo-200 bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
    >
      <Download className="w-3.5 h-3.5" />
      {label}
    </a>
  );
}

export default function CandidatureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getApplicationById(id), authApi.me()])
      .then(([appRes, meRes]) => {
        if (appRes.success) setApplication(appRes.data);
        else setError(appRes.message || "Candidature introuvable");
        if (meRes?.success) setRole(meRes.data.role);
      })
      .catch(() => setError("Erreur lors du chargement"))
      .finally(() => setLoading(false));
  }, [id]);

  const isRecruiter = role === "recruiter" || role === "admin";

  const formatSalary = () => {
    if (!application?.salary_min && !application?.salary_max) return null;
    const c = application?.currency || "€";
    if (application?.salary_min && application?.salary_max)
      return `${application.salary_min} - ${application.salary_max} ${c}`;
    return `${application?.salary_min || application?.salary_max} ${c}`;
  };

  const handleStatus = async (status: "accepted" | "rejected") => {
    if (!application) return;
    setStatusLoading(true);
    setStatusError(null);
    try {
      const res = await updateApplicationStatus(application.id, status);
      if (res.success)
        setApplication((prev) => (prev ? { ...prev, status } : prev));
      else setStatusError(res.message || "Erreur lors de la mise à jour.");
    } catch {
      setStatusError("Impossible de contacter le serveur.");
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6">
        {loading && (
          <p className="text-center text-gray-500 text-sm">Chargement...</p>
        )}
        {error && <p className="text-center text-red-500 text-sm">{error}</p>}

        {application && (
          <div className="border border-indigo-200 rounded-xl p-4 sm:p-6 flex flex-col gap-6">
            {/* Offre */}
            <div className="flex flex-col gap-2">
              <h1 className="text-lg font-bold text-gray-900">
                {application.title || "Poste non renseigné"}
              </h1>
              <p className="text-sm text-gray-500">
                {application.company_name || "-"}
              </p>
              <div className="flex flex-wrap gap-3 mt-1">
                {application.contract_type && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                    {application.contract_type}
                  </span>
                )}
                {application.remote_type && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    {application.remote_type}
                  </span>
                )}
                {formatSalary() && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Euro className="w-3.5 h-3.5 text-indigo-400" />
                    {formatSalary()}
                  </span>
                )}
              </div>
            </div>

            {/* Statut */}
            <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
              <span className="text-sm font-medium text-gray-700">
                Statut :
              </span>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[application.status ?? "pending"]}`}
              >
                {STATUS_LABELS[application.status ?? "pending"]}
              </span>
              <span className="text-xs text-gray-500 ml-auto">
                Envoyée le{" "}
                {new Date(application.applied_at).toLocaleDateString("fr-FR")}
              </span>
            </div>

            {/* Infos personnelles */}
            {(application.applicant_firstname ||
              application.applicant_name) && (
              <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  Informations renseignées
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                  {(application.applicant_firstname ||
                    application.applicant_name) && (
                    <span>
                      {application.applicant_gender === "femme"
                        ? "Femme"
                        : "Homme"}{" "}
                      - {application.applicant_firstname}{" "}
                      {application.applicant_name}
                    </span>
                  )}
                  {application.applicant_email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      {application.applicant_email}
                    </span>
                  )}
                  {application.applicant_phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                      {application.applicant_phone}
                    </span>
                  )}
                  {(application.applicant_postal_code ||
                    application.applicant_city) && (
                    <span className="flex items-center gap-1">
                      <Pin className="w-3.5 h-3.5 text-indigo-400" />
                      {application.applicant_postal_code}{" "}
                      {application.applicant_city}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Documents */}
            {(application.cv_path ||
              application.cover_letter_path ||
              application.extra_documents_path) && (
              <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Documents
                </span>
                <div className="flex flex-wrap gap-3">
                  {application.cv_path && (
                    <DocLink
                      href={`${API_URL}/uploads/${application.cv_path}`}
                      label="CV"
                    />
                  )}
                  {application.cover_letter_path && (
                    <DocLink
                      href={`${API_URL}/uploads/${application.cover_letter_path}`}
                      label="Lettre de motivation"
                    />
                  )}
                  {application.extra_documents_path && (
                    <DocLink
                      href={`${API_URL}/uploads/${application.extra_documents_path}`}
                      label="Documents complémentaires"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Actions recruteur uniquement */}
            {isRecruiter && application.status === "pending" && (
              <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                {statusError && (
                  <p className="text-xs text-red-500">{statusError}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStatus("accepted")}
                    disabled={statusLoading}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => handleStatus("rejected")}
                    disabled={statusLoading}
                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
