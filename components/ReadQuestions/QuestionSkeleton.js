// components/QuestionComponents/QuestionSkeleton.jsx
export function QuestionSkeleton() {
  return (
    <div className="card rounded-xl p-4 border border-base-300 bg-base-100 animate-pulse">
      <div className="h-6 bg-base-300 rounded w-3/4 mb-3"></div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-base-300 rounded w-full"></div>
        <div className="h-4 bg-base-300 rounded w-5/6"></div>
        <div className="h-4 bg-base-300 rounded w-4/6"></div>
      </div>
      <div className="flex justify-between">
        <div className="flex space-x-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 w-6 bg-base-300 rounded"></div>
          ))}
        </div>
        <div className="h-6 w-16 bg-base-300 rounded"></div>
      </div>
    </div>
  );
}