import { redirect } from "next/navigation";

/**
 * Dead prototype removed. This route used to read a session from
 * localStorage instead of the real cloud account, so it was never actually
 * connected to sign-in/plan state — nothing on the site links here anymore.
 * Kept as a redirect (rather than deleting the folder) because this session
 * has no filesystem-delete access to the linked computer; delete
 * src/app/dashboard/ by hand if you want the route gone from disk too.
 */
export default function DashboardPage() {
  redirect("/");
}
