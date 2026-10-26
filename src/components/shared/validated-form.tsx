"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function messageFor(el: Field): string {
  const value = el.value.trim();
  const custom = el.getAttribute("data-msg");
  if (el instanceof HTMLInputElement && el.type === "checkbox") {
    return !el.required || el.checked
      ? ""
      : custom || "Please confirm to continue.";
  }
  if (el.required && !value) {
    return (
      custom ||
      (el instanceof HTMLSelectElement
        ? "Please choose an option."
        : "Please complete this field.")
    );
  }
  if (!value) return "";
  if (
    el instanceof HTMLInputElement &&
    el.type === "email" &&
    !EMAIL.test(value)
  )
    return "Please enter a valid email address.";
  if (el instanceof HTMLInputElement && el.type === "tel") {
    const digits = value.replace(/\D/g, "");
    if (
      digits.length < 10 ||
      digits.length > 13 ||
      !/^[+\d\s()-]+$/.test(value)
    )
      return "Please enter a valid phone number.";
  }
  const min = Number(el.getAttribute("minlength"));
  if (min && value.length < min)
    return custom || `Please enter at least ${min} characters.`;
  if (
    el instanceof HTMLInputElement &&
    el.hasAttribute("data-future") &&
    el.min &&
    value < el.min
  ) {
    return "Please choose a future date.";
  }
  return "";
}

function errorElementFor(el: Field): HTMLElement | null {
  if (el instanceof HTMLInputElement && el.type === "checkbox")
    return document.getElementById(`${el.id}-err`);
  return (
    el.closest(".field")?.querySelector<HTMLElement>(".field__err") ?? null
  );
}

interface ValidatedFormProps {
  id: string;
  className?: string;
  successId: string;
  submitLabel: React.ReactNode;
  submitClassName?: string;
  /** Success panel copy (Theme 1 "Thank you." panel) */
  successMessage: string;
  resetLabel: string;
  /** Receives the validated values. Defaults to a short simulated request. */
  onSubmit?: (data: FormData) => Promise<void> | void;
  children: React.ReactNode;
}

/**
 * Theme 1 form behaviour: inline validation driven by native attributes
 * (required, type, minlength) plus data-msg / data-future / data-prefill,
 * errors announced in `.field__err`, and a focusable success panel.
 */
export function ValidatedForm({
  id,
  className = "form",
  successId,
  submitLabel,
  submitClassName = "pill pill--lg",
  successMessage,
  resetLabel,
  onSubmit,
  children,
}: ValidatedFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const tried = useRef(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fields = (): Field[] =>
    Array.from(
      formRef.current?.querySelectorAll<Field>("input, select, textarea") ?? [],
    );

  const check = (el: Field): boolean => {
    const msg = messageFor(el);
    const ok = !msg;
    el.closest(".field")?.classList.toggle("is-invalid", !ok);
    el.setAttribute("aria-invalid", String(!ok));
    const err = errorElementFor(el);
    if (err) {
      err.textContent = msg;
      if (!err.id) err.id = `${el.id}-err`;
      if (ok) el.removeAttribute("aria-describedby");
      else el.setAttribute("aria-describedby", err.id);
    }
    return ok;
  };

  /* future-date minimums and ?param prefills */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const all = Array.from(
      formRef.current?.querySelectorAll<Field>("input, select, textarea") ?? [],
    );
    all.forEach((el) => {
      if (el instanceof HTMLInputElement && el.hasAttribute("data-future"))
        el.min = tomorrowISO();
      const key = el.getAttribute("data-prefill");
      const value = key ? params.get(key) : null;
      if (
        value &&
        el instanceof HTMLSelectElement &&
        Array.from(el.options).some((o) => o.value === value)
      ) {
        el.value = value;
      }
    });
  }, []);

  useEffect(() => {
    if (done) successRef.current?.focus();
  }, [done]);

  const onFieldEvent = (e: React.SyntheticEvent) => {
    const el = e.target as Field;
    if (!(
      el instanceof HTMLInputElement ||
      el instanceof HTMLSelectElement ||
      el instanceof HTMLTextAreaElement
    ))
      return;
    if (e.type === "blur" ? tried.current || el.value : tried.current)
      check(el);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    tried.current = true;
    let firstBad: Field | null = null;
    fields().forEach((el) => {
      if (!check(el) && !firstBad) firstBad = el;
    });
    if (firstBad) {
      (firstBad as Field).focus();
      return;
    }
    setSending(true);
    setSubmitError("");
    const data = new FormData(e.currentTarget);
    try {
      if (onSubmit) await onSubmit(data);
      else {
        const values = Object.fromEntries(data.entries());
        const response = await fetch("/api/enquiries", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            kind: id.includes("demo") ? "demonstration" : "contact",
            name: values.name,
            email: values.email,
            phone: values.phone || undefined,
            organisation: values.organisation || values.hospital || undefined,
            subject:
              values.topic ||
              values.department ||
              (id.includes("demo")
                ? "Surgical demonstration request"
                : "Website enquiry"),
            message:
              values.message || "Please contact me regarding this request.",
            website: values.website || "",
            metadata: Object.fromEntries(
              [
                "department",
                "city",
                "date_first",
                "date_alternative",
                "system",
              ].flatMap((key) =>
                values[key] ? [[key, String(values[key])]] : [],
              ),
            ),
          }),
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || "Your request could not be sent.");
      }
      setDone(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Your request could not be sent.",
      );
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    formRef.current?.reset();
    tried.current = false;
    fields().forEach((el) => {
      el.closest(".field")?.classList.remove("is-invalid");
      el.removeAttribute("aria-invalid");
      el.removeAttribute("aria-describedby");
      const err = errorElementFor(el);
      if (err) err.textContent = "";
    });
    setDone(false);
    window.requestAnimationFrame(() => fields()[0]?.focus());
  };

  return (
    <>
      <form
        ref={formRef}
        className={className}
        id={id}
        noValidate
        hidden={done}
        onSubmit={handleSubmit}
        onBlur={onFieldEvent}
        onInput={onFieldEvent}
        onChange={onFieldEvent}
      >
        {children}
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="sr-only"
        />
        {submitError ? (
          <p role="alert" className="form__error">
            {submitError}
          </p>
        ) : null}
        <button className={submitClassName} type="submit" disabled={sending}>
          {sending ? (
            "Sending…"
          ) : (
            <>
              {submitLabel} <ArrowRight className="i" aria-hidden="true" />
            </>
          )}
        </button>
      </form>
      <div
        className="form-done"
        id={successId}
        hidden={!done}
        tabIndex={-1}
        ref={successRef}
      >
        <span className="form-done__icon">
          <Check className="i" aria-hidden="true" />
        </span>
        <h3>
          Thank you<span className="dot">.</span>
        </h3>
        <p>{successMessage}</p>
        <button className="link-pill" type="button" onClick={reset}>
          {resetLabel} <ArrowRight className="i" aria-hidden="true" />
        </button>
      </div>
    </>
  );
}
