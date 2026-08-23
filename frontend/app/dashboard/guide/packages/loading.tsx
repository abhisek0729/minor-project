import LoadingSkeleton from "@/app/features/shared/components/skeletons/LoadingSkeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton type="page-header" />
      <LoadingSkeleton type="table" rows={5} />
    </div>
  );
}
