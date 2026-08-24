const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const api = {
  async getRecruiterJobs() {
    const res = await fetch(`${API_URL}/api/jobs/recruiter`, {
      credentials: "include",
    });
    return res.json();
  },

  async getAll() {
    const res = await fetch(`${API_URL}/api/jobs`);
    return res.json();
  },

  async createJob(data: {
    title: string;
    description?: string;
    location?: string;
    contract_type?: string;
    salary_min?: number;
    salary_max?: number;
    currency?: string;
    experience_years?: number;
    remote_type?: "remote" | "hybrid" | "onsite";
    skills?: string[];
  }) {
    const res = await fetch(`${API_URL}/api/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getById(id: string | number, source?: string) {
    const params = source ? `?source=${encodeURIComponent(source)}` : "";
    const res = await fetch(`${API_URL}/api/jobs/${encodeURIComponent(id)}${params}`);
    return res.json();
  },

  async summarizeJob(description: string) {
    const res = await fetch(`${API_URL}/api/jobs/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ description }),
    });
    return res.json();
  },

   async analyzeJob(description: string) {
    const res = await fetch(`${API_URL}/api/jobs/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ description }),
    });
    return res.json();
  },

  async deleteJob(id: string | number) {
    const res = await fetch(`${API_URL}/api/jobs/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    return res.json();
  },

  async getScoredJobs() {
    const res = await fetch(`${API_URL}/api/jobs/scored`, {
      credentials: "include",
    });
    return res.json();
  },
};
// Dans ton fichier de requêtes frontend (ex: lib/api/jobs.ts ou @/lib/api)
export async function summarizeJobWithAI(description: string) {
  try {
    // On appelle ton backend Express (port 3000) sur la route qu'on a créée
    const response = await fetch("http://localhost:3000/api/jobs/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur serveur backend : ${response.status}`);
    }

    return await response.json(); // Retourne { success: true, summary: "..." }
  } catch (error) {
    console.error("Erreur lors de l'appel de la passerelle IA :", error);
    return { success: false, error: "Impossible de générer le résumé." };
  }
}