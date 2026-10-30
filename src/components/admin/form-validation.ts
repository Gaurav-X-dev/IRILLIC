type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/**
 * The browser's own validation bubble names the site, not the field, points at
 * whatever is on screen rather than the problem, and cannot be themed. The
 * panel reports its own failures instead, so this reads the constraints already
 * declared on the markup and turns the first failure into a sentence.
 */

/** "supportEmail" and "Display name" both become "Display name"-ish text. */
function labelFor(el: Field) {
  const explicit =
    el.getAttribute("aria-label") ??
    el.getAttribute("placeholder") ??
    el.closest("label")?.textContent?.trim().split("\n")[0];
  if (explicit) return explicit.replace(/[:*]\s*$/, "").trim();
  const spaced = el.name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function problemWith(el: Field): string | null {
  if (el.disabled || el.type === "hidden") return null;
  const label = labelFor(el);

  if (el instanceof HTMLInputElement && el.type === "file") {
    if (el.required && !el.files?.length)
      return "Choose at least one file to upload.";
    return null;
  }

  if (el instanceof HTMLInputElement && el.type === "checkbox")
    return el.required && !el.checked ? `${label} must be ticked.` : null;

  const value = el.value.trim();
  if (el.required && !value)
    return el instanceof HTMLSelectElement
      ? `Choose a ${label.toLowerCase()}.`
      : `${label} is required.`;
  if (!value) return null;

  if (el instanceof HTMLInputElement) {
    if (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value))
      return `${label} must be a valid email address.`;
    if (el.type === "number") {
      const n = Number(value);
      if (Number.isNaN(n)) return `${label} must be a number.`;
      if (el.min !== "" && n < Number(el.min))
        return `${label} must be ${el.min} or more.`;
      if (el.max !== "" && n > Number(el.max))
        return `${label} must be ${el.max} or less.`;
    }
    if (el.pattern && !new RegExp(`^(?:${el.pattern})$`).test(value))
      return el.title || `${label} is not in the expected format.`;
  }

  const min = Number(el.getAttribute("minlength") ?? 0);
  if (min && value.length < min)
    return `${label} must be at least ${min} characters.`;
  const max = Number(el.getAttribute("maxlength") ?? 0);
  if (max && value.length > max)
    return `${label} must be ${max} characters or fewer.`;

  return null;
}

/**
 * The first field that fails, with the message to show for it. Returning one
 * at a time keeps the report to the thing to fix next, rather than a list.
 */
export function firstProblem(form: HTMLFormElement) {
  for (const el of Array.from(form.elements) as Field[]) {
    if (!("name" in el) || !el.name) continue;
    const message = problemWith(el);
    if (message) return { el, message };
  }
  return null;
}

/** Focuses the offending field and returns its message, or null if valid. */
export function checkForm(form: HTMLFormElement) {
  const problem = firstProblem(form);
  if (!problem) return null;
  problem.el.focus();
  problem.el.scrollIntoView({ block: "center", behavior: "smooth" });
  return problem.message;
}
