const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface AdminUser {
  id: number;
  name: string;
  firstname: string;
  email: string;
  role: string;
  company: string | null;
  siret: string | null;
  created_at: string;
  banned_at: string | null;
}

export async function getAdminUsers(): Promise<{ success: boolean; count: number; data: AdminUser[] }> {
  const res = await fetch(`${API_URL}/api/admin/users`, {
    credentials: "include",
  });
  return res.json();
}

export async function updateAdminUser(
  id: number,
  data: Partial<Pick<AdminUser, "role" | "name" | "firstname" | "email" | "banned_at">>
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteAdminUser(id: number): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return res.json();
}

export async function getAdminUserById(id: number): Promise<{ success: boolean; data: AdminUser }> {
  const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
    credentials: "include",
  });
  return res.json();
}

export interface AdminJob {
  id: number;
  external_id: string;
  title: string;
  company_name: string | null;
  location: string | null;
  contract_type: string | null;
  remote_type: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export async function getAdminJobs(): Promise<{ success: boolean; jobs: AdminJob[] }> {
  const res = await fetch(`${API_URL}/api/admin/jobs`, {
    credentials: "include",
  });
  return res.json();
}

export async function updateAdminJobStatus(
  externalId: string,
  status: "approved" | "rejected" | "pending"
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/api/admin/jobs/${encodeURIComponent(externalId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function deleteAdminJob(externalId: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/api/admin/jobs/${encodeURIComponent(externalId)}`, {
    method: "DELETE",
    credentials: "include",
  });
  return res.json();
}
