export function ArticleSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video bg-gray-200 rounded-xl mb-3" />
      <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
      <div className="h-5 bg-gray-200 rounded mb-2" />
      <div className="h-5 bg-gray-200 rounded w-4/5 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-3/5" />
    </div>
  )
}

export function HorizontalSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-20 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
      <div className="flex-1">
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded mb-1" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
      </div>
    </div>
  )
}
