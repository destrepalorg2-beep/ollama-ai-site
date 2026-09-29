/**
 * Read-only trail of admin actions — backs the "who did what" console in
 * the desktop app's Site statistics panel. Any admin route that changes
 * something (grants a plan, deletes accounts, ...) calls logAdminAction()
 * after the change succeeds; nothing here ever updates or deletes a row,
 * only appends and lists.
 */
import { randomUUID } from "crypto";
import { sql, ensureSchema } from "./db";

export interface AuditLogRow {
  id: string;
  adminEmail: string;
  action: string;
  details: string | null;
  createdAt: string;
}

export async function logAdminAction(adminEmail: string, action: string, details?: string): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO admin_audit_log (id, admin_email, action, details)
    VALUES (${randomUUID()}, ${adminEmail}, ${action}, ${details ?? null})
  `;
}

export async function listAuditLog(limit = 100): Promise<AuditLogRow[]> {
  await ensureSchema();
  const r = await sql`
    SELECT id, admin_email, action, details, created_at
    FROM admin_audit_log
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return r.rows.map((row) => ({
    id: row.id as string,
    adminEmail: row.admin_email as string,
    action: row.action as string,
    details: (row.details as string | null) ?? null,
    createdAt: row.created_at as string,
  }));
}
