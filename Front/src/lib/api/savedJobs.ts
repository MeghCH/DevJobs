const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function getSavedJobs() {
    const res = await fetch(`${API_URL}/api/saved`, { credentials: "include" });
    return res.json();
}

export async function getSavedJobIds(): Promise<number[]> {
    const res = await fetch(`${API_URL}/api/saved/ids`, { credentials: "include" });
    const json = await res.json();
    return json?.success ? json.data : [];
}

export async function saveJob(job_id: number, job_source: string) {
    const res = await fetch(`${API_URL}/api/saved`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ job_id, job_source }),
    });
    return res.json();
}

export async function unsaveJob(job_id: number) {
    const res = await fetch(`${API_URL}/api/saved/${job_id}`, {
        method: "DELETE",
        credentials: "include",
    });
    return res.json();
}
