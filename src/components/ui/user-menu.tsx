"use client";

import { useRouter } from "next/navigation";
import { CircleUserRound, CreditCard, Download, LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Account, displayName, initials, signOut } from "@/lib/auth";
import { useT } from "@/lib/i18n";

export function UserMenu({ account }: { account: Account }) {
  const router = useRouter();
  const { t } = useT();
  const name = displayName(account);

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Меню аккаунта" className="block rounded-full">
          <Avatar className="size-8">
            <AvatarFallback className="bg-foreground text-[13px] text-black">
              {initials(account)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="flex items-center gap-3 px-3 py-2.5">
            <span className="relative">
              <Avatar className="size-10">
                <AvatarFallback className="bg-foreground text-black">{initials(account)}</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 size-2 rounded-full bg-green-600 ring-2 ring-popover" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-popover-foreground">{name}</span>
              <span className="truncate text-sm text-muted-foreground">{account.email ?? "—"}</span>
            </span>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={() => router.push("/profile")}>
            <CircleUserRound size={20} />
            <span>{t("menu.profile")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push("/profile?tab=subscription")}>
            <CreditCard size={20} />
            <span>{t("menu.subscription")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push("/profile?tab=download")}>
            <Download size={20} />
            <span>{t("menu.download")}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            destructive
            onSelect={() => {
              signOut();
              router.push("/");
            }}
          >
            <LogOut size={20} />
            <span>{t("menu.signout")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
