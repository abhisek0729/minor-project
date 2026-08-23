"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteRoomButton from "./DeleteRoomButton";

interface RoomActionsProps {
  roomId: number;
  onDelete?: (roomId: number) => void;
}

export default function RoomActions({
  roomId,
  onDelete,
}: RoomActionsProps) {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-48"
      >
        <Link href={`/dashboard/hotels/rooms/${roomId}/edit`}>
          <DropdownMenuItem>
            <Pencil className="size-4" />
            Edit Room
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <DeleteRoomButton roomId={roomId} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}