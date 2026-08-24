const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface ReportedJob {
  report_id: number;
  job_id: number;
  job_source: string;
  reason: string | null;
  report_status: string;
  reported_at: string;
  resolved_at: string | null;
  job_title: string;
  company_name: string;
  contract_type: string;
  location: string;
  job_status: string;
  reporter_id: number;
  reporter_name: string;
  reporter_email: string;
}

export async function reportJob(
  job_id: number,
  job_source: string,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/api/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ job_id, job_source, reason }),
  });
  return res.json();
}

export async function getReportedJobs(): Promise<{
  success: boolean;
  count: number;
  data: ReportedJob[];
}> {
  const res = await fetch(`${API_URL}/api/reports`, {
    credentials: "include",
  });
  return res.json();
}

export async function updateReportStatus(
  id: number,
  status: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/api/reports/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function deleteReport(id: number): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/api/reports/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return res.json();
}
