# Accessibility Audit — WCAG 2.1 Level AA

## Tool Used
axe DevTools v4.10.3 — Firefox/Chrome browser extension

## Audited Page
URL: http://localhost:3000/offres
Date: 28/04/2026

---

## Audit Results

### 10 issues detected

| #  | Rule                                                       | Impact   | Element                                                        | Detail                                                                                      |
| -- | ---------------------------------------------------------- | -------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1  | Elements must meet minimum color contrast ratio thresholds | Serious  | `<span class="bg-brand-500 text-white">JS</span>`              | Insufficient contrast: 2.74 (expected: 4.5:1). Color `#ffffff` on background `#9893e7`     |
| 2  | Elements must meet minimum color contrast ratio thresholds | Serious  | `<span class="bg-brand-500 text-white">React</span>`           | Insufficient contrast: 2.74 (expected: 4.5:1). Color `#ffffff` on background `#9893e7`     |
| 3  | Elements must meet minimum color contrast ratio thresholds | Serious  | `<span class="bg-brand-500 text-white">Next JS</span>`         | Insufficient contrast: 2.74 (expected: 4.5:1). Color `#ffffff` on background `#9893e7`     |
| 4  | Elements must meet minimum color contrast ratio thresholds | Serious  | `<p class="text-gray-400">Il y a 3h / Partiel remote</p>`      | Insufficient contrast: 2.49 (expected: 4.5:1). Color `#99a1af` on background `#f8faff`     |
| 5  | Elements must meet minimum color contrast ratio thresholds | Serious  | `<span class="bg-brand-500 text-white">JS</span>` (card 2)     | Insufficient contrast: 2.74 (expected: 4.5:1). Color `#ffffff` on background `#9893e7`     |
| 6  | Elements must meet minimum color contrast ratio thresholds | Serious  | `<span class="bg-brand-500 text-white">React</span>` (card 2)  | Insufficient contrast: 2.74 (expected: 4.5:1). Color `#ffffff` on background `#9893e7`     |
| 7  | Elements must meet minimum color contrast ratio thresholds | Serious  | `<span class="bg-brand-500 text-white">Next JS</span>` (card 2)| Insufficient contrast: 2.74 (expected: 4.5:1). Color `#ffffff` on background `#9893e7`     |
| 8  | Elements must meet minimum color contrast ratio thresholds | Serious  | `<p class="text-gray-400">Il y a 5h / Full remote</p>`         | Insufficient contrast: 2.49 (expected: 4.5:1). Color `#99a1af` on background `#f8faff`     |
| 9  | Buttons must have discernible text                         | Critical | `<button class="p-2 border border-indigo-200 bg-indigo-100">` (card 1) | Button does not have inner text visible to screen readers, no `aria-label` or `title` |
| 10 | Buttons must have discernible text                         | Critical | `<button class="p-2 border border-indigo-200 bg-indigo-100">` (card 2) | Button does not have inner text visible to screen readers, no `aria-label` or `title` |

---

## Fixes Applied

### Fix 1, 2, 3, 5, 6, 7 — Skill tag contrast in JobCard
```tsx
// Before
className="text-xs bg-brand-500 text-white px-2.5 py-1 rounded-md font-medium"

// After
className="text-xs bg-indigo-700 text-white px-2.5 py-1 rounded-md font-medium"
```
Applied to all skill tags across all `JobCard` components.

### Fix 4, 8 — Posted date / remote text contrast in JobCard
```tsx
// Before
<p className="text-xs text-gray-400">{postedAt} / {remote}</p>

// After
<p className="text-xs text-gray-500">{postedAt} / {remote}</p>
```

### Fix 9, 10 — Save button missing accessible name
```tsx
// Before
<button className="p-2 border border-indigo-200 bg-indigo-100 rounded-lg ...">
  <Heart className="w-4 h-4 text-indigo-400" />
</button>

// After
<button
  aria-label="Sauvegarder cette offre"
  className="p-2 border border-indigo-200 bg-indigo-100 rounded-lg ..."
>
  <Heart className="w-4 h-4 text-indigo-400" />
</button>
```

---

## Final Result
**0 issues** after fixes — WCAG 2.1 Level AA validated on the Job Search flow.

## Summary of Fixes

| Issue                              | Before                  | After                   |
| ---------------------------------- | ----------------------- | ----------------------- |
| Skill tag contrast too low         | `bg-brand-500`          | `bg-indigo-700`         |
| Posted date / remote text too light | `text-gray-400`        | `text-gray-500`         |
| Save button no accessible name     | No `aria-label`         | `aria-label="Sauvegarder cette offre"` |

### Screen

![alt text](<Offres.png>)
![alt text](<Offres2.png>)
![alt text](<Offres3.png>)
![alt text](<Offres4.png>)
![alt text](<Offres5.png>)
![alt text](<Offres6.png>)
![alt text](<Offres7.png>)
![alt text](<Offres8.png>)
![alt text](<Offres9.png>)
![alt text](<Offres10.png>)
