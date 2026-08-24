# Accessibility Audit — WCAG 2.1 Level AA

## Tool Used

axe DevTools v4.10.3 — Firefox/Chrome browser extension

## Audited Page

URL: http://localhost:3000/inscription
Date: 28/04/2026

---

## Audit Results

### 6 issues detected

| #   | Rule                                                       | Impact   | Element                                  | Detail                                                                                    |
| --- | ---------------------------------------------------------- | -------- | ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | Elements must meet minimum color contrast ratio thresholds | Serious  | `<p class="text-gray-400">`              | Insufficient contrast: 2.6 (expected: 4.5:1). Color `#99a1af` on background `#ffffff`     |
| 2   | Elements must meet minimum color contrast ratio thresholds | Serious  | `input[placeholder="Clara"]`             | Insufficient contrast: 1.12 (expected: 4.5:1). Color `#ededed` on background `#f8faff`    |
| 3   | Elements must meet minimum color contrast ratio thresholds | Serious  | `input[placeholder="Demoy"]`             | Insufficient contrast: 1.12 (expected: 4.5:1). Color `#ededed` on background `#f8faff`    |
| 4   | Elements must meet minimum color contrast ratio thresholds | Serious  | `input[placeholder="exemple@email.com"]` | Insufficient contrast: 1.12 (expected: 4.5:1). Color `#ededed` on background `#f8faff`    |
| 5   | Elements must meet minimum color contrast ratio thresholds | Serious  | `input[placeholder="••••••••"]`          | Insufficient contrast: 1.12 (expected: 4.5:1). Color `#ededed` on background `#f8faff`    |
| 6   | Select element must have an accessible name                | Critical | `<select>`                               | Select "Je suis" does not have an associated `<label>`, `aria-label` or `title` attribute |

---

## Fixes Applied

### Fix 1 — Secondary text contrast

```tsx
// Before
<p className="text-sm text-gray-400 mt-1">

// After
<p className="text-sm text-gray-500 mt-1">
```

### Fix 2, 3, 4, 5 — Placeholder contrast on all inputs

```tsx
// Before
className = "... placeholder-indigo-300";

// After
className = "... placeholder-indigo-600";
```

Applied to all 4 inputs: First name, Last name, Email, Password.

### Fix 6 — Missing accessible label on select

```tsx
// Before
<label className="...">Je suis</label>
<select className="...">

// After
<label htmlFor="role" className="...">Je suis</label>
<select id="role" className="...">
```

Also applied `htmlFor` / `id` association to all other inputs:

| Input        | id         |
| ------------ | ---------- |
| Prénom       | `prenom`   |
| Nom          | `nom`      |
| Email        | `email`    |
| Mot de passe | `password` |
| Je suis      | `role`     |

---

## Final Result

**0 issues** after fixes — WCAG 2.1 Level AA validated on the Registration flow.

## Summary of Fixes

| Issue                          | Before                   | After                  |
| ------------------------------ | ------------------------ | ---------------------- |
| Secondary text too light       | `text-gray-400`          | `text-gray-500`        |
| All placeholders too light     | `placeholder-indigo-300` | `placeholder-gray-500` |
| Select missing accessible name | No `label` association   | `htmlFor` + `id` added |

### Screen

![alt text](<Inscription.png>)
![alt text](<Inscription2.png>)
![alt text](<Inscription3.png>)
![alt text](<Inscription4.png>)
![alt text](<Inscription5.png>)
![alt text](<Inscription6.png>)
