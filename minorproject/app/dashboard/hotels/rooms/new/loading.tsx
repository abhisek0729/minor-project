
import LoadingSkeleton from "@/app/features/shared/components/skeletons/LoadingSkeletons";

export default function NewRoomLoading() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton type="page-header" />

      <LoadingSkeleton type="form" />
    </div>
  );
}