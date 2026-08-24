const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export type IngestResult = {
  inserted: number;
  skipped: number;
  errors: number;
  pagesFetched: number;
};

export async function triggerIngestion(): Promise<{ success: boolean; data?: IngestResult; message?: string }> {
  const res = await fetch(`${API_URL}/api/ingest`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}
