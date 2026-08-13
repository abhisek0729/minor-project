import LoadingSkeleton from "@/app/features/shared/components/skeletons/LoadingSkeletons";

export default function RoomsLoading() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton
        type="page-header"
      />

      <LoadingSkeleton
        type="table"
        rows={6}
      />
    </div>
  );
}