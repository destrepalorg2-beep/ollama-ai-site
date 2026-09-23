import { redirect } from "next/navigation";

/**
 * Section removed from the site. The route stays as a redirect so any old
 * link or bookmark lands somewhere sensible instead of on a 404.
 * The folder can be deleted outright once nothing points here.
 */
export default function Page() {
  redirect("/");
}
