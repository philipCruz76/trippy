export default function TripDetailsSkeleton() {
  return (
    <div className="flex flex-col min-h-[100dvh] px-container pt-16 animate-pulse">
      <div className="w-full h-[300px] bg-gray-200 rounded-lg" />
      <div className="mx-auto w-full max-w-5xl space-y-8 mt-8">
        <div className="h-12 bg-gray-200 rounded-md" />
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}
