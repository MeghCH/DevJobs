const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const api = {
  async register(data: {
    name: string;
    firstname: string;
    email: string;
    password: string;
    role: "user" | "recruiter";
    company?: string;
    siret?: string;
  }) {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async login(data: { email: string; password: string }) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async me() {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      credentials: "include",
    });
    return res.json();
  },

  async updateMe(data: { name?: string; firstname?: string; email?: string; skills?: string[]; location?: string }) {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async logout() {
    const res = await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    return res.json();
  },
};
