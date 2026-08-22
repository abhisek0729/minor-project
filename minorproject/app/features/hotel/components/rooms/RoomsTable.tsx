import {
  BedDouble,
  Users,
} from "lucide-react";

import RoomActions from "./RoomActions";

import { StatusBadge } from "@/app/features/shared/components/StatusBadge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Room {
  id: number;
  roomNumber: string;
  roomType: string;
  capacity: number;
  pricePerNight: string;
  status: string;
}

interface RoomsTableProps {
  rooms: Room[];
}

function formatRoomType(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function RoomsTable({
  rooms,
}: RoomsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-55">
                Room
              </TableHead>

              <TableHead>
                Type
              </TableHead>

              <TableHead>
                Capacity
              </TableHead>

              <TableHead>
                Price / Night
              </TableHead>

              <TableHead>
                Status
              </TableHead>

              <TableHead className="text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rooms.map((room) => (
              <TableRow
                key={room.id}
                className="transition-colors hover:bg-muted/40"
              >
                {/* Room */}

                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <BedDouble className="size-5 text-primary" />
                    </div>

                    <div>
                      <p className="font-semibold">
                        Room {room.roomNumber}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Type */}

                <TableCell>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    {formatRoomType(room.roomType)}
                  </span>
                </TableCell>

                {/* Capacity */}

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />

                    <span>
                      {room.capacity}
                    </span>
                  </div>
                </TableCell>

                {/* Price */}

                <TableCell>
                  <div className="font-semibold">
                    NPR{" "}
                    {Number(
                      room.pricePerNight,
                    ).toLocaleString()}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    per night
                  </div>
                </TableCell>

                {/* Status */}

                <TableCell>
                  <StatusBadge
                    status={room.status}
                  />
                </TableCell>

                {/* Actions */}

                <TableCell className="text-right">
                  <RoomActions roomId={room.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}