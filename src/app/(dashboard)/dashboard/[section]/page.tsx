import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, LockKeyhole, ShieldCheck } from "lucide-react";
import { ContentManager } from "@/components/admin/content-manager";
import { SettingsForm } from "@/components/admin/settings-form";
import { MediaManager } from "@/components/admin/media-manager";
import { PasswordForm } from "@/components/admin/password-form";
import { PageBuilder } from "@/components/admin/page-builder";
import { NavigationManager } from "@/components/admin/navigation-manager";
import { EnquiryManager } from "@/components/admin/enquiry-manager";
import { ProfileForm } from "@/components/admin/profile-form";
import { UserRoleManager } from "@/components/admin/user-role-manager";
import { AuditLogViewer } from "@/components/admin/audit-log-viewer";
import { SessionManager } from "@/components/admin/session-manager";
import { SecurityEventViewer } from "@/components/admin/security-event-viewer";
import { userService } from "@/services/user.service";
import { hasPermission } from "@/lib/rbac";
import { PageHeader } from "@/components/admin/ui";
import type { MegaSection } from "@/types/site.types";
import { cmsService, type CmsType } from "@/services/cms.service";
import { getSettingGroup } from "@/services/settings.service";
import { requireAdmin } from "@/lib/auth";

const sections = {
  pages: {
    title: "Website pages",
    eyebrow: "Content management",
    description:
      "Manage page content, visibility and search metadata from one place.",
    type: "page",
  },
  products: {
    title: "Products",
    eyebrow: "Product catalogue",
    description:
      "Maintain surgical imaging systems, galleries, specifications and documents.",
    type: "product",
  },
  applications: {
    title: "Clinical applications",
    eyebrow: "Clinical content",
    description:
      "Manage procedure-focused content and linked product solutions.",
    type: "application",
  },
  resources: {
    title: "Resources",
    eyebrow: "Knowledge centre",
    description:
      "Publish brochures, manuals, clinical resources and downloadable assets.",
    type: "resource",
  },
} as const;

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (section.startsWith("page-")) {
    const slug = section.slice(5);
    const pages = (await cmsService.list("page")).filter(
      (page) => page.slug === slug,
    );
    if (!pages.length) notFound();
    const pageSections = (
      await Promise.all(pages.map((page) => cmsService.pageSections(page.id)))
    ).flat();
    return (
      <PageFrame
        info={{
          title: `${pages[0].title} management`,
          eyebrow: "Website page",
          description:
            "Edit this page section by section. Every saved change is loaded dynamically by the public website.",
        }}
      >
        <div className="rounded-xl bg-ad-sunken p-4 text-xs leading-6 text-ad-muted ring-1 ring-ad-line">
          Select a section from the left, update its fields, and press{" "}
          <strong>Save section</strong>. You do not need to edit code.
        </div>
        <PageBuilder pages={pages} initialSections={pageSections} />
      </PageFrame>
    );
  }
  if (section === "navigation") {
    const chromePages = (await cmsService.list("page")).filter(
      (page) => page.slug === "site-chrome",
    );
    const navigationSections = (
      await Promise.all(
        chromePages.map((page) => cmsService.pageSections(page.id)),
      )
    ).flat();
    const megaMenuSection = navigationSections.find(
      (item) => item.sectionKey === "megaMenu",
    );
    if (!megaMenuSection) notFound();
    return (
      <PageFrame
        info={{
          title: "Frontend navigation",
          eyebrow: "Website header",
          description:
            "Add, edit, reorder or remove navbar tabs and manage every mega-menu link, heading and featured card. Changes appear on the public website after saving.",
        }}
      >
        <NavigationManager
          sectionId={megaMenuSection.id}
          initialMenus={megaMenuSection.data as MegaSection[]}
        />
      </PageFrame>
    );
  }
  if (section in sections) {
    const info = sections[section as keyof typeof sections];
    const rows = await cmsService.list(info.type as CmsType);
    if (section === "pages") {
      const pageSectionRows = (
        await Promise.all(rows.map((page) => cmsService.pageSections(page.id)))
      ).flat();
      return (
        <PageFrame info={info}>
          <PageBuilder pages={rows} initialSections={pageSectionRows} />
        </PageFrame>
      );
    }
    return (
      <PageFrame info={info}>
        <ContentManager type={info.type} initialRows={rows} />
      </PageFrame>
    );
  }
  if (section === "smtp") {
    const initial = await getSettingGroup("smtp");
    return (
      <PageFrame
        info={{
          title: "SMTP configuration",
          eyebrow: "Email delivery",
          description:
            "Configure transactional email delivery for forms and account recovery.",
        }}
      >
        <SettingsForm group="smtp" initial={initial} />
      </PageFrame>
    );
  }
  if (section === "settings") {
    const [initial, media] = await Promise.all([
      getSettingGroup("general"),
      cmsService.listMedia(),
    ]);
    return (
      <PageFrame
        info={{
          title: "General settings",
          eyebrow: "Website configuration",
          description:
            "Brand identity, logos, SEO defaults and contact details. Every value here is read live by the public website.",
        }}
      >
        <SettingsForm
          group="general"
          initial={initial}
          media={media.map((asset) => ({
            id: asset.id,
            name: asset.name,
            url: asset.url,
            mimeType: asset.mimeType,
          }))}
        />
      </PageFrame>
    );
  }
  if (section === "users") {
    const admin = await requireAdmin();
    // The sidebar hides this entry for a reader, but a typed URL must not.
    if (!hasPermission(admin.role, "users:manage")) notFound();
    const accounts = await userService.getAll();
    return (
      <PageFrame
        info={{
          title: "Users & roles",
          eyebrow: "Access control",
          description:
            "Administrators have full control. Content Readers can sign in and read content, but cannot change anything.",
        }}
      >
        <UserRoleManager
          users={accounts.map((account) => ({
            ...account,
            createdAt: account.createdAt,
          }))}
          currentUserId={admin.userId}
        />
      </PageFrame>
    );
  }
  if (section === "audit") {
    const admin = await requireAdmin();
    if (!hasPermission(admin.role, "users:manage")) notFound();
    return (
      <PageFrame
        info={{
          title: "Audit trail",
          eyebrow: "Accountability",
          description:
            "Every content, settings and account change, with who made it, when, and from which address.",
        }}
      >
        <AuditLogViewer />
      </PageFrame>
    );
  }
  if (section === "sessions") {
    const admin = await requireAdmin();
    if (!hasPermission(admin.role, "users:manage")) notFound();
    return (
      <PageFrame
        info={{
          title: "Login sessions",
          eyebrow: "Access control",
          description:
            "Who is signed in, on which device and from where. End any session immediately.",
        }}
      >
        <SessionManager />
      </PageFrame>
    );
  }
  if (section === "security-events") {
    const admin = await requireAdmin();
    if (!hasPermission(admin.role, "users:manage")) notFound();
    return (
      <PageFrame
        info={{
          title: "Security events",
          eyebrow: "Monitoring",
          description:
            "Sign-in attempts, lockouts and rate-limited requests, with the device behind each one.",
        }}
      >
        <SecurityEventViewer />
      </PageFrame>
    );
  }
  if (section === "security") return <SecurityPage />;
  if (section === "profile") {
    const admin = await requireAdmin();
    return (
      <PageFrame
        info={{
          title: "My profile",
          eyebrow: "Administrator account",
          description:
            "Update the administrator name, email address and profile photograph.",
        }}
      >
        <ProfileForm
          profile={{
            name: admin.name,
            email: admin.email,
            avatar: admin.avatar,
            role: admin.role,
          }}
        />
      </PageFrame>
    );
  }
  if (section === "enquiries") {
    const rows = await cmsService.listEnquiries();
    return (
      <PageFrame
        info={{
          title: "Enquiries",
          eyebrow: "Engagement",
          description:
            "Review incoming contact, product and support enquiries, track their status and reply directly.",
        }}
      >
        <EnquiryManager rows={rows} />
      </PageFrame>
    );
  }
  if (section === "media") {
    const [rows, admin] = await Promise.all([
      cmsService.listMedia(),
      requireAdmin(),
    ]);
    // A Content Reader may look at the library but not add to it.
    const readOnly = !hasPermission(admin.role, "media:write");
    return (
      <PageFrame
        info={{
          title: "Media library",
          eyebrow: "Digital assets",
          description:
            "Organise approved images, videos, documents and brand files.",
        }}
      >
        <MediaManager assets={rows} readOnly={readOnly} />
      </PageFrame>
    );
  }
  notFound();
}

function PageFrame({
  info,
  children,
}: {
  info: { title: string; eyebrow: string; description: string };
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-w-0 max-w-[1600px] space-y-5">
      <PageHeader
        eyebrow={info.eyebrow}
        title={info.title}
        description={info.description}
      />
      {children}
    </div>
  );
}

function SecurityPage() {
  const info = {
    title: "Security",
    eyebrow: "Account protection",
    description: "Review administrator access, sessions and security controls.",
  };
  return (
    <PageFrame info={info}>
      <div className="grid gap-5 md:grid-cols-3">
        {[
          {
            Icon: ShieldCheck,
            title: "Single administrator",
            copy: "Only the configured owner account can authenticate. Roles and permissions are not enabled.",
            badge: "Enforced",
          },
          {
            Icon: LockKeyhole,
            title: "Secure sessions",
            copy: "Random server-side session tokens expire automatically and are stored in HTTP-only cookies.",
            badge: "8 hour expiry",
          },
          {
            Icon: Archive,
            title: "Audit history",
            copy: "Content and configuration changes are recorded with administrator and request metadata.",
            badge: "Enabled",
          },
        ].map(({ Icon, title, copy, badge }) => (
          <article
            key={title}
            className="ad-card rounded-2xl bg-ad-surface p-5 shadow-ad-sm ring-1 ring-ad-line"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-ad-accent-soft text-ad-accent">
              <Icon size={18} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-sm font-semibold text-ad-ink">{title}</h2>
            <p className="mt-1.5 text-xs leading-6 text-ad-muted">{copy}</p>
            <span className="mt-4 inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
              {badge}
            </span>
          </article>
        ))}
      </div>
      <PasswordForm />
    </PageFrame>
  );
}
