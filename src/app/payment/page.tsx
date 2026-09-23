import { redirect } from "next/navigation";

/**
 * Payment is a dialog now, not a page. The route stays as a redirect so an old
 * link still lands somewhere sensible; the folder can be deleted once nothing
 * points here.
 */
export default function Page() {
  redirect("/");
}
