const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function getMyApplications() {
  const res = await fetch(`${API_URL}/api/applications`, {
    credentials: "include",
  });
  return res.json();
}

export async function getApplicationById(id: string) {
  const res = await fetch(`${API_URL}/api/applications/${id}`, {
    credentials: "include",
  });
  return res.json();
}

export async function getApplicationsByJob(jobId: string) {
  const res = await fetch(`${API_URL}/api/applications/job/${jobId}`, {
    credentials: "include",
  });
  return res.json();
}

export async function apply(
  job_id: number | string,
  job_source: string,
  files?: { cv?: File | null; cover_letter?: File | null; extra_documents?: File | null },
  formData?: { firstname?: string; name?: string; gender?: string; email?: string; phone?: string; postal_code?: string; city?: string }
) {
  const body = new FormData();
  body.append("job_id", String(job_id));
  body.append("job_source", job_source);
  if (files?.cv) body.append("cv", files.cv);
  if (files?.cover_letter) body.append("cover_letter", files.cover_letter);
  if (files?.extra_documents) body.append("extra_documents", files.extra_documents);
  if (formData?.firstname) body.append("firstname", formData.firstname);
  if (formData?.name) body.append("name", formData.name);
  if (formData?.gender) body.append("gender", formData.gender);
  if (formData?.email) body.append("email", formData.email);
  if (formData?.phone) body.append("phone", formData.phone);
  if (formData?.postal_code) body.append("postal_code", formData.postal_code);
  if (formData?.city) body.append("city", formData.city);

  const res = await fetch(`${API_URL}/api/applications`, {
    method: "POST",
    credentials: "include",
    body,
  });
  return res.json();
}

export async function deleteApplication(id: number | string) {
  const res = await fetch(`${API_URL}/api/applications/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return res.json();
}

export async function updateApplicationStatus(
  id: number | string,
  status: "pending" | "accepted" | "rejected"
) {
  const res = await fetch(`${API_URL}/api/applications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  return res.json();
}
