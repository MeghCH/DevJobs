import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function computeRelevanceScore(
  userSkills: string[],
  userLocation: string,
  jobSkills: string[],
  jobLocation: string | null,
  jobRemoteType: string | null
): number {
  let score = 0;

  const userSet = new Set(userSkills.map((s) => s.toLowerCase().trim()));
  const jobSet = new Set(jobSkills.map((s) => s.toLowerCase().trim()));

  // Skills match (0-60 pts)
  if (userSet.size > 0 && jobSet.size > 0) {
    let matches = 0;
    for (const skill of userSet) {
      for (const tag of jobSet) {
        if (tag.includes(skill) || skill.includes(tag)) {
          matches++;
          break;
        }
      }
    }
    score += Math.min(Math.round((matches / userSet.size) * 60), 60);
  }

  // Location match (0-25 pts)
  const remoteType = (jobRemoteType ?? "").toLowerCase();
  if (remoteType === "remote" || remoteType === "full_remote") {
    score += 25;
  } else if (userLocation && jobLocation) {
    const uLoc = userLocation.toLowerCase().trim();
    const jLoc = jobLocation.toLowerCase().trim();
    if (uLoc === jLoc || uLoc.includes(jLoc) || jLoc.includes(uLoc)) {
      score += 25;
    } else {
      const uWords = uLoc.split(/[\s,]+/).filter((w) => w.length > 3);
      const jWords = jLoc.split(/[\s,]+/).filter((w) => w.length > 3);
      if (uWords.some((w) => jWords.some((jw) => jw.includes(w) || w.includes(jw)))) {
        score += 12;
      }
    }
  }

  // Remote bonus (0-15 pts)
  if (remoteType === "remote" || remoteType === "full_remote") {
    score += 15;
  } else if (remoteType === "hybrid") {
    score += 8;
  }

  return Math.min(score, 100);
}

export function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
