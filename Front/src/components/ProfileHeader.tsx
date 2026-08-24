"use client";

import { useState, useEffect } from "react";
import { Mail, MapPin, Pencil, X, Check } from "lucide-react";
import { authApi } from "@/lib/api";

const AVAILABLE_SKILLS = [
  // Langages
  "TypeScript", "JavaScript", "Python", "Java", "C", "C++", "C#", "Go",
  "Rust", "PHP", "Ruby", "Swift", "Kotlin", "Scala", "R", "Dart",
  // Frontend
  "React", "Next.js", "Vue.js", "Nuxt.js", "Angular", "Svelte",
  "Tailwind CSS", "Sass", "HTML", "CSS", "Figma", "Redux",
  // Backend
  "Node.js", "Express", "NestJS", "Django", "FastAPI", "Flask",
  "Spring Boot", "Laravel", "Ruby on Rails", "GraphQL", "REST API", "gRPC",
  // Bases de données
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Elasticsearch",
  "Cassandra", "DynamoDB", "Prisma", "Supabase", "Firebase",
  // DevOps / Cloud
  "Docker", "Kubernetes", "Git", "Linux", "AWS", "GCP", "Azure",
  "Terraform", "CI/CD", "GitHub Actions", "Jenkins", "Nginx",
  // Data / IA
  "Machine Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy",
  "SQL", "Power BI", "Tableau", "Spark", "Airflow",
  // Mobile
  "React Native", "Flutter", "Android", "iOS",
];

type Props = {
  name?: string;
  firstname?: string;
  email?: string;
  skills?: string[];
  location?: string;
  showSkills?: boolean;
  showOpportunities?: boolean;
};

export default function ProfileHeader({ name, firstname, email, skills: initialSkills = [], location: initialLocation = "", showSkills = true, showOpportunities = true }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: name ?? "", firstname: firstname ?? "", email: email ?? "", location: initialLocation });
  const [saved, setSaved] = useState({ name: name ?? "", firstname: firstname ?? "", email: email ?? "", location: initialLocation });

  useEffect(() => {
    const updated = { name: name ?? "", firstname: firstname ?? "", email: email ?? "", location: initialLocation };
    setForm(updated);
    setSaved(updated);
  }, [name, firstname, email, initialLocation]);
  const [skills, setSkills] = useState<string[]>(initialSkills);

  useEffect(() => {
    setSkills(initialSkills);
  }, [initialSkills]);

  const handleSave = async () => {
    await authApi.updateMe({ ...form, skills }).catch(() => {});
    setSaved(form);
    setEditing(false);
  };

  const handleCancel = () => {
    setForm(saved);
    setEditing(false);
  };

  const handleAdd = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value || skills.includes(value)) return;
    const newSkills = [...skills, value];
    setSkills(newSkills);
    e.target.value = "";
    await authApi.updateMe({ skills: newSkills }).catch(() => {});
  };

  const handleRemove = async (skill: string) => {
    const newSkills = skills.filter((s) => s !== skill);
    setSkills(newSkills);
    await authApi.updateMe({ skills: newSkills }).catch(() => {});
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">
        {saved.firstname && <span>{saved.firstname} </span>}
        <span className="text-indigo-500">{saved.name}</span>
      </h1>

      <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 w-full justify-center items-center sm:items-start px-2 sm:px-0">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 uppercase font-semibold tracking-widest">
              <Pencil className="w-3.5 h-3.5" />
              Informations
            </div>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
                Modifier
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} aria-label="Sauvegarder" className="text-green-500 hover:text-green-700 transition-colors">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={handleCancel} aria-label="Annuler" className="text-gray-500 hover:text-gray-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="flex flex-col gap-2">
              <input
                value={form.firstname}
                onChange={(e) => setForm((f) => ({ ...f, firstname: e.target.value }))}
                placeholder="Prénom"
                className="border border-indigo-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-indigo-400"
              />
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nom"
                className="border border-indigo-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-indigo-400"
              />
              <input
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Email"
                type="email"
                className="border border-indigo-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-indigo-400"
              />
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Ville, pays..."
                className="border border-indigo-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-indigo-400"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="w-4 h-4 text-indigo-400" />
                {saved.email || "-"}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-indigo-400" />
                {saved.location || <span className="italic text-gray-500">Non renseignée</span>}
              </div>
            </div>
          )}
        </div>

        {showSkills && (
          <div className="flex flex-col gap-3">
            <div className="text-sm text-gray-500 uppercase font-semibold tracking-widest">
              Compétences
            </div>
            <label htmlFor="competences" className="sr-only">Ajouter une compétence</label>
            <select
              id="competences"
              onChange={handleAdd}
              defaultValue=""
              className="border border-indigo-200 rounded-lg px-3 py-1.5 text-sm text-gray-500 outline-none cursor-pointer"
            >
              <option value="" disabled>Choisir une compétence</option>
              {AVAILABLE_SKILLS.filter((s) => !skills.includes(s)).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2 max-w-xs sm:max-w-65">
              {skills.map((skill) => (
                <span key={skill} className="flex items-center gap-1.5 text-sm text-indigo-600 font-medium bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-1.5">
                  {skill}
                  <button onClick={() => handleRemove(skill)} aria-label={`Supprimer ${skill}`} className="text-indigo-300 hover:text-indigo-500 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {showOpportunities && (
        <button className="bg-green-200 hover:bg-green-300 text-gray-700 text-sm font-medium px-8 sm:px-10 py-2.5 rounded-full transition-colors w-full sm:w-auto text-center">
          Ouvert aux opportunités
        </button>
      )}
    </div>
  );
}
