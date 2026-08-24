# Accessibility Audit — WCAG 2.1 Level AA

## Tool Used

axe DevTools v4.10.3 — Firefox/Chrome browser extension

## Audited Page

URL: http://localhost:3000/connexion
Date: 27/04/2026

---

## Audit Results

### 4 issues detected

| #   | Rule                                                       | Impact  | Element                                   | Detail                                                                                |
| --- | ---------------------------------------------------------- | ------- | ----------------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | Elements must meet minimum color contrast ratio thresholds | Serious | `<p class="text-gray-400">`               | Insufficient contrast: 2.6 (expected: 4.5:1). Color `#99a1af` on background `#ffffff` |
| 2   | Elements must meet minimum color contrast ratio thresholds | Serious | `<input placeholder="exemple@email.com">` | Insufficient contrast on placeholder                                                  |
| 3   | Elements must meet minimum color contrast ratio thresholds | Serious | `<input>`                                 | Color `#615fff` on background `#f8faff`, ratio 4.35                                   |
| 4   | Elements must meet minimum color contrast ratio thresholds | Serious | Secondary text                            | Insufficient contrast                                                                 |

**Fix applied:** `text-gray-400` replaced with `text-gray-500`, `placeholder-indigo-300` replaced with `placeholder-indigo-500`

**Fix applied:** `placeholder-indigo-400` replaced with `placeholder-indigo-700`

---

### 2 issues detected

| #   | Rule                                                       | Impact  | Element                | Detail                                                               |
| --- | ---------------------------------------------------------- | ------- | ---------------------- | -------------------------------------------------------------------- |
| 1   | Elements must meet minimum color contrast ratio thresholds | Serious | `.text-indigo-500`     | Color `#615fff` on background `#f8faff`, ratio 4.35 (expected 4.5:1) |
| 2   | Elements must meet minimum color contrast ratio thresholds | Serious | `<input type="email">` | Insufficient contrast                                                |

**Fix applied:** `text-indigo-500` replaced with `text-indigo-700`

---

### Iteration 4 — 1 issue detected

| #   | Rule                                                       | Impact  | Element            | Detail                                               |
| --- | ---------------------------------------------------------- | ------- | ------------------ | ---------------------------------------------------- |
| 1   | Documents must have `<title>` element to aid in navigation | Serious | `<html lang="fr">` | Document does not have a non-empty `<title>` element |

**Fix applied:** Added `export const metadata = { title: "Connexion · DevJobs" }` in `src/app/connexion/page.tsx`

---

## Final Result

**0 issues** after fixes — WCAG 2.1 Level AA validated on the Login flow.

## Summary of Fixes

| Issue                    | Before                   | After                  |
| ------------------------ | ------------------------ | ---------------------- |
| Secondary text too light | `text-gray-400`          | `text-gray-500`        |
| Placeholder too light    | `placeholder-indigo-300` | `placeholder-gray-500` |
| Input text too light     | `text-indigo-500`        | `text-indigo-700`      |
| Missing title tag        | None                     | `Connexion · DevJobs`  |

### Screen

![alt text](<Connexion.png>)
![alt text](<Connexion2.png>)
![alt text](<Connexion3.png>)
