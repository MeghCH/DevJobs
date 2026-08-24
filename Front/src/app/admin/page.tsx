"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import LogoutButton from "@/components/LogoutButton";
import ProfileHeader from "@/components/ProfileHeader";
import { Search, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  AdminUser,
} from "@/lib/api/admin";
import { triggerIngestion, IngestResult } from "@/lib/api/ingestion";
import { authApi, jobsApi } from "@/lib/api";
import {
  getReportedJobs,
  updateReportStatus,
  ReportedJob,
} from "@/lib/api/reports";
import { formatDate } from "@/lib/utils";

function getInitials(user: AdminUser) {
  return `${user.firstname?.[0] ?? ""}${user.name?.[0] ?? ""}`.toUpperCase();
}

const ROLE_LABELS: Record<string, string> = {
  user: "Utilisateur",
  recruiter: "Entreprise",
  admin: "Admin",
  banned: "Banni",
};

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"offres" | "users">(() => {
    try {
      const saved = localStorage.getItem("adminTab");
      return saved === "users" ? "users" : "offres";
    } catch {
      return "offres";
    }
  });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestResult, setIngestResult] = useState<IngestResult | null>(null);
  const [ingestError, setIngestError] = useState("");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [roleEditing, setRoleEditing] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");
  const [adminProfile, setAdminProfile] = useState<{
    firstname: string;
    name: string;
    email: string;
    skills: string[];
    location: string;
  } | null>(null);

  const [reports, setReports] = useState<ReportedJob[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");

  const [totalJobs, setTotalJobs] = useState<number | null>(null);

  useEffect(() => {
    authApi
      .me()
      .then((res) => {
        if (res?.success) {
          const { firstname, name, email, skills, location } = res.data;
          setAdminProfile({
            firstname,
            name,
            email,
            skills: skills ?? [],
            location: location ?? "",
          });
        }
      })
      .catch(() => {});

    jobsApi
      .getAll()
      .then((res) => {
        if (res?.success) setTotalJobs(res.count);
      })
      .catch(() => {});
  }, []);

  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    setReportsError("");
    try {
      const res = await getReportedJobs();
      if (res.success) {
        setReports(res.data);
      } else {
        setReportsError("Impossible de charger les signalements.");
      }
    } catch {
      setReportsError("Impossible de contacter le serveur.");
    } finally {
      setReportsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const res = await getAdminUsers();
      if (res.success) {
        setUsers(res.data);
      } else {
        setUsersError("Impossible de charger les utilisateurs.");
      }
    } catch {
      setUsersError("Impossible de contacter le serveur.");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (id: number, role: string) => {
    setActionError("");
    const res = await updateAdminUser(id, { role });
    if (!res.success)
      setActionError(res.message || "Erreur lors du changement de rôle.");
    setRoleEditing(null);
    fetchUsers();
  };

  const handleBan = async (id: number) => {
    setActionError("");
    const res = await updateAdminUser(id, { role: "banned" });
    if (!res.success)
      setActionError(res.message || "Erreur lors du bannissement.");
    fetchUsers();
  };

  const handleUnban = async (id: number) => {
    setActionError("");
    const res = await updateAdminUser(id, { role: "user" });
    if (!res.success)
      setActionError(res.message || "Erreur lors du débannissement.");
    fetchUsers();
  };

  const handleDelete = async (id: number) => {
    setActionError("");
    const res = await deleteAdminUser(id);
    if (!res.success)
      setActionError(res.message || "Erreur lors de la suppression.");
    fetchUsers();
  };

  const handleIngest = async () => {
    setIngestLoading(true);
    setIngestResult(null);
    setIngestError("");
    try {
      const data = await triggerIngestion();
      if (data.success) {
        setIngestResult(data.data ?? null);
      } else {
        setIngestError(data.message || "Échec de l'ingestion.");
      }
    } catch {
      setIngestError("Impossible de contacter le serveur.");
    } finally {
      setIngestLoading(false);
    }
  };

  const filterUsers = useCallback(
    (list: AdminUser[]) =>
      list.filter((u) => {
        const matchesSearch =
          search === "" ||
          `${u.firstname} ${u.name}`
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole =
          roleFilter === "all" ||
          (roleFilter === "recruiter" && u.role === "recruiter") ||
          u.role === roleFilter;
        return matchesSearch && matchesRole;
      }),
    [search, roleFilter],
  );

  const regularUsers = filterUsers(users.filter((u) => u.role === "user"));
  const recruiterUsers = filterUsers(
    users.filter((u) => u.role === "recruiter"),
  );
  const bannedUsers = filterUsers(users.filter((u) => u.role === "banned"));
  const adminUsers = filterUsers(users.filter((u) => u.role === "admin"));

  const stats = [
    { n: totalJobs === null ? "…" : String(totalJobs), l: "Offres totales" },
    { n: usersLoading ? "…" : String(users.length), l: "Utilisateurs" },
    { n: reportsLoading ? "…" : String(reports.length), l: "Signalements" },
  ];

  useEffect(() => {
    if (activeTab === "offres") {
      fetchReports();
    }
  }, [activeTab, fetchReports]);

  const handleResolveReport = async (id: number) => {
    const res = await updateReportStatus(id, "resolved");
    if (res.success) {
      setReports((prev) => prev.filter((r) => r.report_id !== id));
    } else {
      setReportsError(res.message || "Erreur lors de la mise à jour.");
    }
  };

  const handleDismissReport = async (id: number) => {
    const res = await updateReportStatus(id, "dismissed");
    if (res.success) {
      setReports((prev) => prev.filter((r) => r.report_id !== id));
    } else {
      setReportsError(res.message || "Erreur lors de la mise à jour.");
    }
  };


  const UserRow = ({
    u,
    section,
  }: {
    u: AdminUser;
    section: "user" | "recruiter" | "banned";
  }) => (
    <div
      key={u.id}
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border rounded-xl px-5 py-3",
        section === "banned"
          ? "border-red-200 bg-red-100/30"
          : "border-indigo-100 bg-indigo-50/40",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
            section === "banned"
              ? "bg-red-200 text-red-1000"
              : section === "recruiter"
                ? "bg-green-200 text-green-800"
                : "bg-indigo-100 text-indigo-600",
          )}
        >
          {getInitials(u)}
        </div>
        <div>
          <p
            className={cn(
              "text-sm font-semibold",
              section === "banned" ? "text-red-1000" : "text-gray-900",
            )}
          >
            {u.firstname} {u.name}
          </p>
          <p className="text-xs text-gray-500">
            {u.email} ·{" "}
            {section === "banned"
              ? `Banni le ${u.banned_at ? formatDate(u.banned_at) : "-"}`
              : `Inscrit le ${formatDate(u.created_at)}`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        {section !== "banned" && (
          <>
            <span
              className={cn(
                "text-xs px-2.5 py-0.5 rounded-full font-medium border",
                u.role === "admin"
                  ? "bg-purple-100 text-purple-800 border-purple-200"
                  : section === "recruiter"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-indigo-50 text-indigo-600 border-indigo-100",
              )}
            >
              {ROLE_LABELS[u.role] ?? u.role}
            </span>

            {roleEditing === u.id ? (
              <select
                autoFocus
                defaultValue={u.role}
                onBlur={() => setRoleEditing(null)}
                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                className="border border-indigo-200 bg-white rounded-lg px-2 py-1 text-xs text-gray-700 outline-none"
              >
                <option value="user">Utilisateur</option>
                <option value="recruiter">Entreprise</option>
                <option value="admin">Admin</option>
              </select>
            ) : (
              <button
                onClick={() => setRoleEditing(u.id)}
                className="text-xs bg-gray-50 text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-100 transition-colors"
              >
                Changer rôle
              </button>
            )}

            <button
              onClick={() => handleBan(u.id)}
              className="text-xs bg-red-100 text-red-700 border border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-200 transition-colors"
            >
              Bannir
            </button>
          </>
        )}

        {section === "banned" && (
          <>
            <span className="text-xs bg-red-100 text-red-700 border border-red-300 px-2.5 py-0.5 rounded-full font-medium">
              Banni
            </span>
            <button
              onClick={() => handleUnban(u.id)}
              className="text-xs bg-green-100 text-green-800 border border-green-300 rounded-lg px-3 py-1.5 hover:bg-green-200 transition-colors"
            >
              Débannir
            </button>
            <button
              onClick={() => handleDelete(u.id)}
              className="text-xs bg-gray-50 text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-100 transition-colors"
            >
              Supprimer
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">
        <div className="flex justify-end">
          <LogoutButton />
        </div>

        <ProfileHeader
          name={adminProfile?.name}
          firstname={adminProfile?.firstname}
          email={adminProfile?.email}
          skills={adminProfile?.skills ?? []}
          location={adminProfile?.location ?? ""}
          showSkills={false}
          showOpportunities={false}
        />

        <hr className="border-gray-100" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">
            Interface{" "}
            <span className="text-indigo-600">d&apos;administration</span>
          </h2>
          <button
            onClick={handleIngest}
            disabled={ingestLoading}
            className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer w-full sm:w-auto"
          >
            <RefreshCw
              className={cn("w-4 h-4", ingestLoading && "animate-spin")}
            />
            {ingestLoading
              ? "Ingestion en cours..."
              : "Ingérer offres WeLoveDevs"}
          </button>
        </div>

        {ingestResult && (
          <div className="bg-green-100 border border-green-300 rounded-xl px-5 py-3 text-sm text-green-800 flex flex-wrap gap-3 sm:gap-6">
            <span>
              <span className="font-semibold">{ingestResult.inserted}</span>{" "}
              insérées
            </span>
            <span>
              <span className="font-semibold">{ingestResult.skipped}</span>{" "}
              ignorées
            </span>
            <span>
              <span className="font-semibold">{ingestResult.errors}</span>{" "}
              erreurs
            </span>
            <span>
              <span className="font-semibold">{ingestResult.pagesFetched}</span>{" "}
              pages récupérées
            </span>
          </div>
        )}
        {ingestError && (
          <div className="bg-red-100 border border-red-300 rounded-xl px-5 py-3 text-sm text-red-700">
            {ingestError}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div
              key={s.l}
              className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4"
            >
              <div className="text-2xl font-bold text-indigo-600">{s.n}</div>
              <div className="text-xs text-gray-500 mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="flex border-b border-gray-100">
          {[
            { key: "offres", label: "Modération des offres" },
            { key: "users", label: "Gestion des utilisateurs" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                const t = tab.key as "offres" | "users";
                try { localStorage.setItem("adminTab", t); } catch {}
                setActiveTab(t);
              }}
              className={cn(
                "text-sm px-5 py-3 border-b-2 transition-colors",
                activeTab === tab.key
                  ? "border-indigo-600 text-indigo-600 font-semibold"
                  : "border-transparent text-gray-500 hover:text-indigo-500",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "offres" && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                Offres signalées
              </p>
              {reportsLoading && (
                <div className="text-sm text-gray-500 text-center py-4">
                  Chargement des signalements…
                </div>
              )}
              {reportsError && (
                <div className="bg-red-100 border border-red-300 rounded-xl px-5 py-3 text-sm text-red-700">
                  {reportsError}
                </div>
              )}
              <div className="flex flex-col gap-2">
                {!reportsLoading && reports.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Aucune offre signalée.
                  </p>
                )}
                {reports.map((r) => (
                  <div
                    key={r.report_id}
                    onClick={() =>
                      router.push(`/offres/${r.job_id}?source=${r.job_source}`)
                    }
                    className="relative cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-red-200 bg-red-100/30 rounded-xl px-5 py-4 hover:border-red-400 hover:bg-red-100/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {r.job_title || `Offre #${r.job_id}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {r.company_name || "Entreprise inconnue"}
                        {r.location ? ` · ${r.location}` : ""}
                        {` · Signalé le ${formatDate(r.reported_at)}`}
                        {r.reporter_name && ` par ${r.reporter_name}`}
                      </p>
                      {r.reason && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          "{r.reason}"
                        </p>
                      )}
                      {r.contract_type && (
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-indigo-100 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded-md">
                            {r.contract_type}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 sm:shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismissReport(r.report_id);
                        }}
                        className="text-xs bg-green-100 text-green-800 border border-green-400 rounded-lg px-3 py-1.5 hover:bg-green-200 transition-colors"
                      >
                        Garder
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolveReport(r.report_id);
                        }}
                        className="text-xs bg-red-100 text-red-800 border border-red-400 rounded-lg px-3 py-1.5 hover:bg-red-200 transition-colors"
                      >
                        Refuser
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2 border border-indigo-100 bg-indigo-50/40 rounded-lg px-3 h-10">
                <Search className="w-4 h-4 text-indigo-300 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un utilisateur..."
                  className="bg-transparent border-none outline-none text-sm text-indigo-600 placeholder-indigo-300 flex-1"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                aria-label="Filtrer par rôle"
                className="border border-indigo-100 bg-indigo-50/40 rounded-lg px-3 h-10 text-sm text-gray-500 outline-none w-full sm:w-auto"
              >
                <option value="all">Tous les rôles</option>
                <option value="user">Utilisateur</option>
                <option value="recruiter">Entreprise</option>
                <option value="admin">Admin</option>
                <option value="banned">Banni</option>
              </select>
            </div>

            {actionError && (
              <div className="bg-red-100 border border-red-300 rounded-xl px-5 py-3 text-sm text-red-700">
                {actionError}
              </div>
            )}

            {usersError && (
              <div className="bg-red-100 border border-red-300 rounded-xl px-5 py-3 text-sm text-red-700">
                {usersError}
              </div>
            )}

            {usersLoading && (
              <div className="text-sm text-gray-500 text-center py-4">
                Chargement des utilisateurs…
              </div>
            )}

            {!usersLoading && (
              <>
                {(roleFilter === "all" || roleFilter === "user") && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                      Utilisateurs
                    </p>
                    <div className="flex flex-col gap-2">
                      {regularUsers.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          Aucun utilisateur trouvé.
                        </p>
                      ) : (
                        regularUsers.map((u) => (
                          <UserRow key={u.id} u={u} section="user" />
                        ))
                      )}
                    </div>
                  </div>
                )}

                {(roleFilter === "all" || roleFilter === "recruiter") && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                      Entreprises
                    </p>
                    <div className="flex flex-col gap-2">
                      {recruiterUsers.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          Aucune entreprise trouvée.
                        </p>
                      ) : (
                        recruiterUsers.map((u) => (
                          <UserRow key={u.id} u={u} section="recruiter" />
                        ))
                      )}
                    </div>
                  </div>
                )}

                {(roleFilter === "all" || roleFilter === "admin") && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                      Administrateurs
                    </p>
                    <div className="flex flex-col gap-2">
                      {adminUsers.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          Aucun administrateur trouvé.
                        </p>
                      ) : (
                        adminUsers.map((u) => (
                          <UserRow key={u.id} u={u} section="user" />
                        ))
                      )}
                    </div>
                  </div>
                )}

                {(roleFilter === "all" || roleFilter === "banned") && (
                  <div>
                    <hr className="border-gray-100 mb-6" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                      Comptes bannis
                    </p>
                    <div className="flex flex-col gap-2">
                      {bannedUsers.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          Aucun compte banni.
                        </p>
                      ) : (
                        bannedUsers.map((u) => (
                          <UserRow key={u.id} u={u} section="banned" />
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
