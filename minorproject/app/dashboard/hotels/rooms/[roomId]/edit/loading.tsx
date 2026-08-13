import LoadingSkeleton from "@/app/features/shared/components/skeletons/LoadingSkeletons";

export default function EditRoomLoading() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton type="page-header" />

      <LoadingSkeleton type="form" />
    </div>
  );
}