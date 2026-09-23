import { redirect } from "next/navigation";

/**
 * Dead prototype removed. This route hit a hardcoded ws://localhost:3000 and
 * an authToken key the rest of the app never sets, so it never worked on the
 * deployed site — nothing on the site links here anymore. Kept as a redirect
 * (rather than deleting the folder) because this session has no
 * filesystem-delete access to the linked computer; delete src/app/chat/ by
 * hand if you want the route gone from disk too.
 */
export default function ChatPage() {
  redirect("/");
}
