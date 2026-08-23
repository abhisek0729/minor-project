"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteRoom } from "../../actions/deleteRoom";
import { ConfirmDialog } from "@/app/features/shared/components/ConfirmDialog";

interface DeleteRoomButtonProps {
  roomId: number;
}

export default function DeleteRoomButton({
  roomId,
}: DeleteRoomButtonProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteRoom(roomId);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Room deleted successfully.");

      setOpen(false);

      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
      >
        Delete Room
      </button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Room"
        description="This action cannot be undone. The room and its images will be permanently deleted."
        confirmText="Delete"
        cancelText="Cancel"
        loading={isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}