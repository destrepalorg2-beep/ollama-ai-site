import { redirect } from "next/navigation";

/**
 * Dead prototype removed. This route read a session from localStorage
 * ("authToken") instead of the real cloud account and hit the same dead
 * localhost:3000 API as the old /chat and /dashboard prototypes, so it was
 * never actually wired to sign-in/plan state — nothing on the site links
 * here anymore (real account settings live on /profile). Kept as a redirect
 * (rather than deleting the folder) because this session has no
 * filesystem-delete access to the linked computer; delete src/app/settings/
 * by hand if you want the route gone from disk too.
 */
export default function SettingsPage() {
  redirect("/profile");
}
