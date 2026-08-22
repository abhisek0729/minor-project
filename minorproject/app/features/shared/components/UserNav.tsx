"use client";

import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface UserNavProps {
  name: string;
  email: string;
}

export function UserNav({ name, email }: UserNavProps) {
  const router = useRouter();
  const initials =
    name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  async function handleLogout() {
    await signOut({
      redirect: false,
    });

    router.replace("/sign-in");
    router.refresh();
  }

  return (
    <Popover>
      <PopoverTrigger>
        <Avatar className="h-10 w-10 cursor-pointer transition-opacity hover:opacity-90">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 p-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate font-medium">{name}</p>

              <p className="truncate text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          <div className="border-t" />

          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
