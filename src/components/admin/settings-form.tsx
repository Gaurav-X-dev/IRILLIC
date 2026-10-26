"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  Globe,
  ImageIcon,
  Mail,
  Palette,
  Search,
  Send,
  ServerCog,
  Settings2,
  Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type FieldType =
  "text" | "email" | "number" | "password" | "textarea" | "asset" | "color";

interface Field {
  name: string;
  label: string;
  placeholder?: string;
  type: FieldType;
  hint?: string;
  /** Where on the live site this value appears. */
  usedOn?: string;
  full?: boolean;
}

interface FieldGroup {
  title: string;
  description: string;
  icon: LucideIcon;
  fields: Field[];
}

export interface MediaOption {
  id: string;
  name: string;
  url: string;
  mimeType: string;
}

const SMTP_GROUPS: FieldGroup[] = [
  {
    title: "Mail server",
    description:
      "The SMTP account used for enquiry notifications and password recovery.",
    icon: ServerCog,
    fields: [
      {
        name: "host",
        label: "SMTP host",
        placeholder: "smtp.example.com",
        type: "text",
      },
      { name: "port", label: "Port", placeholder: "587", type: "number" },
      {
        name: "username",
        label: "Username",
        placeholder: "mailer@irillic.com",
        type: "text",
      },
      {
        name: "password",
        label: "Password",
        placeholder: "••••••••",
        type: "password",
        hint: "Stored encrypted. Leave it untouched to keep the current password.",
      },
    ],
  },
  {
    title: "Sender and recipients",
    description:
      "How outgoing email identifies itself, and where alerts arrive.",
    icon: Mail,
    fields: [
      {
        name: "fromName",
        label: "From name",
        placeholder: "IRILLIC",
        type: "text",
      },
      {
        name: "fromEmail",
        label: "From email",
        placeholder: "no-reply@irillic.com",
        type: "email",
      },
      {
        name: "notificationEmail",
        label: "Enquiry notification email",
        placeholder: "info@irillic.com",
        type: "email",
        hint: "Every website enquiry is copied to this address.",
        full: true,
      },
    ],
  },
];

/**
 * Every value below is read by the public website through `lib/branding.ts`,
 * so a change here reaches the live pages without a deployment. `usedOn` says
 * where, because these are the values that repeat across the whole site.
 */
const GENERAL_GROUPS: FieldGroup[] = [
  {
    title: "Brand identity",
    description: "The name and words that repeat on every page of the website.",
    icon: Settings2,
    fields: [
      {
        name: "siteName",
        label: "Website name",
        placeholder: "IRILLIC",
        type: "text",
        usedOn: "Browser tab, admin panel, sign-in screen, footer",
      },
      {
        name: "legalName",
        label: "Legal entity name",
        placeholder: "Irillic Private Limited",
        type: "text",
        usedOn: "Footer copyright line",
      },
      {
        name: "tagline",
        label: "Tagline",
        placeholder: "A Global Pioneer in Optical Surgical Imaging",
        type: "text",
        full: true,
      },
      {
        name: "brandDescription",
        label: "Footer brand description",
        placeholder: "Pioneering real-time ICG fluorescence imaging…",
        type: "textarea",
        usedOn: "The paragraph beside the footer logo",
        full: true,
      },
    ],
  },
  {
    title: "Logos and icon",
    description:
      "Used in the header, the footer, the sign-in screen and the browser tab.",
    icon: ImageIcon,
    fields: [
      {
        name: "logo",
        label: "Primary logo",
        type: "asset",
        usedOn: "Website header, admin sidebar, sign-in screen",
      },
      {
        name: "logoWhite",
        label: "Logo for dark backgrounds",
        type: "asset",
        usedOn: "The dark panel on the sign-in screen",
      },
      {
        name: "logoFooter",
        label: "Footer logo",
        type: "asset",
        usedOn: "Website footer — clear it to reuse the primary logo",
      },
      {
        name: "favicon",
        label: "Browser icon (favicon)",
        type: "asset",
        usedOn: "The browser tab and bookmarks",
      },
    ],
  },
  {
    title: "Appearance",
    description: "How the browser frames the site on mobile devices.",
    icon: Palette,
    fields: [
      {
        name: "themeColor",
        label: "Browser theme colour",
        type: "color",
        hint: "Tints the browser chrome on Android and iOS.",
      },
    ],
  },
  {
    title: "Search engine defaults",
    description:
      "Applied to any page that does not define its own SEO title or description.",
    icon: Search,
    fields: [
      {
        name: "seoTitle",
        label: "Default SEO title",
        type: "text",
        usedOn: "Search results and link previews",
        full: true,
      },
      {
        name: "seoDescription",
        label: "Default meta description",
        type: "textarea",
        usedOn: "The grey text under your link in search results",
        full: true,
      },
      {
        name: "seoKeywords",
        label: "Keywords",
        placeholder: "ICG fluorescence imaging, laparoscopic imaging",
        type: "text",
        hint: "Separate keywords with commas.",
        full: true,
      },
    ],
  },
  {
    title: "Public contact details",
    description: "Where visitors and enquiry notifications are directed.",
    icon: Globe,
    fields: [
      {
        name: "supportEmail",
        label: "Support email",
        placeholder: "info@irillic.com",
        type: "email",
        usedOn: "Homepage, contact page, footer and enquiry notifications",
      },
      {
        name: "phone",
        label: "Contact phone",
        placeholder: "+91 …",
        type: "text",
        hint: "Include the country code, for example +91 76520 68867.",
        usedOn: "Homepage, contact page and global footer",
      },
    ],
  },
];

const INPUT_CLASS =
  "h-11 w-full rounded-xl bg-ad-surface px-3.5 text-sm text-ad-ink outline-none ring-1 ring-ad-line placeholder:text-ad-faint focus:ring-ad-accent";

export function SettingsForm({
  group,
  initial,
  media = [],
}: {
  group: "general" | "smtp";
  initial: Record<string, unknown>;
  media?: MediaOption[];
}) {
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const groups = group === "smtp" ? SMTP_GROUPS : GENERAL_GROUPS;

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setFailed(false);
    const entries = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    const values: Record<string, string | number | boolean> =
      Object.fromEntries(
        Object.entries(entries).map(([key, value]) => [key, String(value)]),
      );
    if (group === "smtp") {
      values.port = Number(values.port || 587);
      values.requireTls = values.requireTls === "on";
      values.secure = values.secure === "on";
    }
    try {
      const response = await fetch(`/api/admin/settings/${group}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ values }),
      });
      const result = await response.json();
      setFailed(!response.ok);
      setMessage(
        response.ok
          ? "Saved. The website picks these up immediately."
          : result.error || "Unable to save settings",
      );
      setSavedAt(Date.now());
    } catch {
      setFailed(true);
      setMessage("Unable to reach the settings service.");
    } finally {
      setBusy(false);
    }
  }

  async function testSmtp() {
    setBusy(true);
    setMessage("");
    setFailed(false);
    try {
      const response = await fetch("/api/admin/smtp/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      setFailed(!response.ok);
      setMessage(
        response.ok
          ? "Test email sent to the administrator."
          : result.error || "Test email failed.",
      );
      setSavedAt(Date.now());
    } catch {
      setFailed(true);
      setMessage("Unable to reach the email service.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="max-w-5xl space-y-4 pb-4">
      {group === "general" ? <BrandPreview initial={initial} /> : null}

      <div className="stagger space-y-4">
        {groups.map((fieldGroup) => (
          <SettingsSection
            key={fieldGroup.title}
            fieldGroup={fieldGroup}
            initial={initial}
            media={media}
          />
        ))}
      </div>

      {group === "smtp" ? (
        <div className="flex flex-wrap gap-6 rounded-2xl bg-ad-surface p-4 ring-1 ring-ad-line">
          <label className="flex items-center gap-2 text-xs">
            <input
              name="requireTls"
              type="checkbox"
              defaultChecked={initial.requireTls !== false}
              className="h-4 w-4 accent-sky-500"
            />
            Require TLS
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              name="secure"
              type="checkbox"
              defaultChecked={Boolean(initial.secure)}
              className="h-4 w-4 accent-sky-500"
            />
            Implicit SSL
          </label>
        </div>
      ) : null}

      {/* The save bar follows the editor down a long form. */}
      <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ad-surface/90 px-4 py-3 shadow-ad-lg ring-1 ring-ad-line backdrop-blur-xl">
        {message ? (
          <span
            key={savedAt}
            role={failed ? "alert" : "status"}
            className={`animate-rise flex items-center gap-2 text-xs font-medium ${failed ? "text-rose-500" : "text-emerald-600"}`}
          >
            <CheckCircle2 size={15} aria-hidden="true" />
            {message}
          </span>
        ) : (
          <span className="text-xs text-ad-faint">
            Changes apply to the live website as soon as they are saved.
          </span>
        )}
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          {group === "smtp" ? (
            <button
              type="button"
              onClick={testSmtp}
              disabled={busy}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold text-ad-muted ring-1 ring-ad-line transition-colors hover:text-ad-accent hover:ring-ad-accent/60 disabled:opacity-50 sm:flex-none"
            >
              <Send size={14} aria-hidden="true" /> Send test email
            </button>
          ) : null}
          <button
            disabled={busy}
            className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold text-white transition-colors disabled:opacity-50 sm:flex-none ${busy ? "is-busy bg-ad-accent" : "bg-ad-accent hover:brightness-110"}`}
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}

/** A collapsible group of related settings. */
function SettingsSection({
  fieldGroup,
  initial,
  media,
}: {
  fieldGroup: FieldGroup;
  initial: Record<string, unknown>;
  media: MediaOption[];
}) {
  const [open, setOpen] = useState(true);
  const Icon = fieldGroup.icon;

  return (
    <section className="ad-card overflow-hidden rounded-2xl bg-ad-surface shadow-ad-sm ring-1 ring-ad-line">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-ad-sunken"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ad-accent-soft text-ad-accent">
          <Icon size={18} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ad-ink">
            {fieldGroup.title}
          </span>
          <span className="mt-0.5 block text-xs text-ad-muted">
            {fieldGroup.description}
          </span>
        </span>
        <ChevronDown
          size={17}
          aria-hidden="true"
          className={`shrink-0 text-ad-faint transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div className="collapse-panel" data-open={open}>
        <div>
          <div className="grid gap-5 border-t border-ad-hairline p-5 sm:grid-cols-2">
            {fieldGroup.fields.map((field) => (
              <SettingField
                key={field.name}
                field={field}
                value={initial[field.name]}
                media={media}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Shows the brand as a visitor sees it, before any field is touched. */
function BrandPreview({ initial }: { initial: Record<string, unknown> }) {
  const logo = String(initial.logo ?? "");
  const logoWhite = String(initial.logoWhite ?? "");
  const name = String(initial.siteName ?? "IRILLIC");
  const tagline = String(initial.tagline ?? "");

  return (
    <section className="ad-card overflow-hidden rounded-2xl bg-ad-surface shadow-ad-sm ring-1 ring-ad-line">
      <div className="border-b border-ad-hairline px-5 py-3.5">
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-ad-faint">
          Live preview
        </p>
        <h2 className="mt-0.5 text-sm font-semibold text-ad-ink">
          How the brand appears today
        </h2>
      </div>
      <div className="grid gap-px bg-ad-hairline sm:grid-cols-2">
        <div className="bg-white p-5">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">
            On a light background
          </p>
          <div className="flex items-center gap-3">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="h-8 w-auto object-contain" />
            ) : (
              <span className="text-xs text-slate-400">No logo set</span>
            )}
            <span className="text-sm font-semibold text-slate-900">{name}</span>
          </div>
          {tagline ? (
            <p className="mt-3 text-xs text-slate-500">{tagline}</p>
          ) : null}
        </div>
        <div className="bg-slate-950 p-5">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">
            On a dark background
          </p>
          <div className="flex items-center gap-3">
            {logoWhite ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoWhite}
                alt=""
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span className="text-xs text-slate-500">No white logo set</span>
            )}
            <span className="text-sm font-semibold text-white">{name}</span>
          </div>
          {tagline ? (
            <p className="mt-3 text-xs text-slate-400">{tagline}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function SettingField({
  field,
  value,
  media,
}: {
  field: Field;
  value: unknown;
  media: MediaOption[];
}) {
  const initialValue = String(value ?? "");

  return (
    <label className={field.full ? "sm:col-span-2" : undefined}>
      <span className="mb-1.5 block text-xs font-semibold text-ad-muted">
        {field.label}
      </span>
      {field.type === "textarea" ? (
        <textarea
          name={field.name}
          rows={3}
          defaultValue={initialValue}
          placeholder={field.placeholder}
          className="w-full rounded-xl bg-ad-surface p-3.5 text-sm leading-6 text-ad-ink outline-none ring-1 ring-ad-line placeholder:text-ad-faint focus:ring-ad-accent"
        />
      ) : field.type === "asset" ? (
        <AssetField
          name={field.name}
          initialValue={initialValue}
          media={media}
        />
      ) : field.type === "color" ? (
        <span className="flex items-center gap-3">
          <input
            name={field.name}
            type="color"
            defaultValue={initialValue || "#ffffff"}
            className="h-11 w-20 cursor-pointer rounded-xl bg-ad-surface p-1 ring-1 ring-ad-line"
          />
          <span className="font-mono text-xs text-ad-faint">
            {initialValue || "#ffffff"}
          </span>
        </span>
      ) : (
        <input
          name={field.name}
          type={field.type}
          defaultValue={initialValue}
          placeholder={field.placeholder}
          className={INPUT_CLASS}
        />
      )}
      {field.hint ? (
        <span className="mt-1.5 block text-[11px] leading-5 text-ad-faint">
          {field.hint}
        </span>
      ) : null}
      {field.usedOn ? (
        <span className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-5 text-ad-faint">
          <Globe size={11} className="mt-[3px] shrink-0" aria-hidden="true" />
          {field.usedOn}
        </span>
      ) : null}
    </label>
  );
}

/**
 * An image path with a live thumbnail. Uploaded assets are offered through a
 * datalist, so the path can either be chosen or typed by hand.
 */
function AssetField({
  name,
  initialValue,
  media,
}: {
  name: string;
  initialValue: string;
  media: MediaOption[];
}) {
  const [value, setValue] = useState(initialValue);
  const listId = `${name}-assets`;
  const images = media.filter((asset) => asset.mimeType.startsWith("image/"));

  return (
    <>
      <span className="flex items-center gap-3">
        <span className="grid h-11 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-ad-sunken ring-1 ring-ad-line">
          {value ? (
            // The asset is served from the CMS at its original URL.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <ImageIcon size={15} className="text-ad-faint" aria-hidden="true" />
          )}
        </span>
        <input
          name={name}
          type="text"
          list={images.length ? listId : undefined}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="/images/logo/irillic-logo-blue.png"
          className={INPUT_CLASS}
        />
      </span>
      {images.length ? (
        <datalist id={listId}>
          {images.map((asset) => (
            <option key={asset.id} value={asset.url}>
              {asset.name}
            </option>
          ))}
        </datalist>
      ) : (
        <span className="mt-1.5 flex items-center gap-1.5 text-[11px] text-ad-faint">
          <Upload size={11} aria-hidden="true" />
          <Link href="/dashboard/media" className="text-ad-accent underline">
            Upload to the media library
          </Link>{" "}
          to pick files here.
        </span>
      )}
    </>
  );
}
