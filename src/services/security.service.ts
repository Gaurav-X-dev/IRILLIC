import "server-only";
import { and, count, desc, eq, gte, ilike, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { adminSessions, auditLogs, securityEvents } from "@/db/schema/cms";
import { users } from "@/db/schema/users";

export interface PageRequest {
  page: number;
  pageSize: number;
  search?: string;
  /** Narrows to a single action, event or user, depending on the query. */
  filter?: string;
  /** Only records newer than this many days. */
  days?: number;
}

export interface Paged<Row> {
  rows: Row[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

function paging({ page, pageSize }: PageRequest) {
  const safeSize = Math.min(Math.max(pageSize || 25, 5), 100);
  const safePage = Math.max(page || 1, 1);
  return {
    limit: safeSize,
    offset: (safePage - 1) * safeSize,
    safeSize,
    safePage,
  };
}

function paged<Row>(
  rows: Row[],
  total: number,
  safePage: number,
  safeSize: number,
): Paged<Row> {
  return {
    rows,
    total,
    page: safePage,
    pageSize: safeSize,
    pageCount: Math.max(1, Math.ceil(total / safeSize)),
  };
}

function since(days?: number) {
  return days && days > 0 ? new Date(Date.now() - days * 86400000) : undefined;
}

/* ------------------------------------------------------------------ audit */

export interface AuditRow {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  changes: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: Date;
  userName: string | null;
  userEmail: string | null;
}

/**
 * Audit history, newest first. Paging happens in the database so the panel
 * stays responsive once the trail runs to thousands of rows.
 */
export async function listAuditLogs(
  request: PageRequest,
): Promise<Paged<AuditRow>> {
  const { limit, offset, safeSize, safePage } = paging(request);
  const term = request.search?.trim();
  const from = since(request.days);

  const conditions = [
    request.filter && request.filter !== "all"
      ? eq(auditLogs.action, request.filter)
      : undefined,
    from ? gte(auditLogs.createdAt, from) : undefined,
    term
      ? or(
          ilike(auditLogs.entityType, `%${term}%`),
          ilike(auditLogs.entityId, `%${term}%`),
          ilike(auditLogs.action, `%${term}%`),
          ilike(users.name, `%${term}%`),
          ilike(users.email, `%${term}%`),
        )
      : undefined,
  ].filter(Boolean);
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, totals] = await Promise.all([
    db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        changes: auditLogs.changes,
        ipAddress: auditLogs.ipAddress,
        createdAt: auditLogs.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(auditLogs)
      .leftJoin(users, eq(users.id, auditLogs.userId))
      .where(where)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ value: count() })
      .from(auditLogs)
      .leftJoin(users, eq(users.id, auditLogs.userId))
      .where(where),
  ]);

  return paged(rows, totals[0]?.value ?? 0, safePage, safeSize);
}

/** The distinct actions present, for the filter control. */
export async function auditActions(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ action: auditLogs.action })
    .from(auditLogs)
    .orderBy(auditLogs.action);
  return rows.map((row) => row.action);
}

/* --------------------------------------------------------------- sessions */

export interface SessionRow {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastSeenAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  userName: string | null;
  userEmail: string | null;
  userRole: string | null;
}

/**
 * Sign-in sessions with the account they belong to. Expired and revoked
 * sessions are kept so the history stays auditable; the caller decides
 * whether to show them.
 */
export async function listSessions(
  request: PageRequest & { status?: "active" | "ended" | "all" },
): Promise<Paged<SessionRow>> {
  const { limit, offset, safeSize, safePage } = paging(request);
  const term = request.search?.trim();
  const now = new Date();

  const conditions = [
    request.status === "active"
      ? and(isNull(adminSessions.revokedAt), gte(adminSessions.expiresAt, now))
      : request.status === "ended"
        ? or(
            sql`${adminSessions.revokedAt} is not null`,
            sql`${adminSessions.expiresAt} < ${now}`,
          )
        : undefined,
    term
      ? or(
          ilike(adminSessions.ipAddress, `%${term}%`),
          ilike(adminSessions.userAgent, `%${term}%`),
          ilike(users.name, `%${term}%`),
          ilike(users.email, `%${term}%`),
        )
      : undefined,
  ].filter(Boolean);
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, totals] = await Promise.all([
    db
      .select({
        id: adminSessions.id,
        ipAddress: adminSessions.ipAddress,
        userAgent: adminSessions.userAgent,
        lastSeenAt: adminSessions.lastSeenAt,
        expiresAt: adminSessions.expiresAt,
        revokedAt: adminSessions.revokedAt,
        createdAt: adminSessions.createdAt,
        userName: users.name,
        userEmail: users.email,
        userRole: users.role,
      })
      .from(adminSessions)
      .leftJoin(users, eq(users.id, adminSessions.userId))
      .where(where)
      .orderBy(desc(adminSessions.lastSeenAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ value: count() })
      .from(adminSessions)
      .leftJoin(users, eq(users.id, adminSessions.userId))
      .where(where),
  ]);

  return paged(rows, totals[0]?.value ?? 0, safePage, safeSize);
}

/** Counts for the session screen's summary tiles. */
export async function sessionSummary() {
  const now = new Date();
  const [active, total, signIns] = await Promise.all([
    db
      .select({ value: count() })
      .from(adminSessions)
      .where(
        and(isNull(adminSessions.revokedAt), gte(adminSessions.expiresAt, now)),
      ),
    db.select({ value: count() }).from(adminSessions),
    db
      .select({ value: count() })
      .from(securityEvents)
      .where(
        and(
          eq(securityEvents.event, "login_success"),
          gte(securityEvents.createdAt, new Date(Date.now() - 7 * 86400000)),
        ),
      ),
  ]);
  return {
    active: active[0]?.value ?? 0,
    total: total[0]?.value ?? 0,
    signInsThisWeek: signIns[0]?.value ?? 0,
  };
}

/* -------------------------------------------------------- security events */

export interface SecurityEventRow {
  id: string;
  event: string;
  email: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean;
  createdAt: Date;
}

/** Sign-in attempts and other security events, newest first. */
export async function listSecurityEvents(
  request: PageRequest,
): Promise<Paged<SecurityEventRow>> {
  const { limit, offset, safeSize, safePage } = paging(request);
  const term = request.search?.trim();
  const from = since(request.days);

  const conditions = [
    request.filter && request.filter !== "all"
      ? eq(securityEvents.event, request.filter)
      : undefined,
    from ? gte(securityEvents.createdAt, from) : undefined,
    term
      ? or(
          ilike(securityEvents.email, `%${term}%`),
          ilike(securityEvents.ipAddress, `%${term}%`),
          ilike(securityEvents.event, `%${term}%`),
        )
      : undefined,
  ].filter(Boolean);
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, totals] = await Promise.all([
    db
      .select({
        id: securityEvents.id,
        event: securityEvents.event,
        email: securityEvents.email,
        ipAddress: securityEvents.ipAddress,
        userAgent: securityEvents.userAgent,
        success: securityEvents.success,
        createdAt: securityEvents.createdAt,
      })
      .from(securityEvents)
      .where(where)
      .orderBy(desc(securityEvents.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(securityEvents).where(where),
  ]);

  return paged(rows, totals[0]?.value ?? 0, safePage, safeSize);
}

/** The distinct event names present, for the filter control. */
export async function securityEventNames(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ event: securityEvents.event })
    .from(securityEvents)
    .orderBy(securityEvents.event);
  return rows.map((row) => row.event);
}

/** Revokes one session immediately. */
export async function revokeSession(id: string) {
  const [revoked] = await db
    .update(adminSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(adminSessions.id, id), isNull(adminSessions.revokedAt)))
    .returning({ id: adminSessions.id, userId: adminSessions.userId });
  return revoked ?? null;
}
