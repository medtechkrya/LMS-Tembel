'use client'

interface LoadingStateProps {
  className?: string
}

export default function LoadingState({ className = 'py-24' }: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center select-none ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div className="flex items-center gap-3 mb-4 animate-loading-breathe">
        <img
          src="/Logo-Teman-Belajar.png"
          alt="Teman Belajar"
          className="h-8 w-auto object-contain"
        />
        <div className="w-px h-5 bg-[#E8D5B7] rounded" />
        <img
          src="/krya-logo.png"
          alt="Krya"
          className="h-6 w-auto object-contain"
        />
      </div>
      <div className="w-28 h-1 bg-[#E8D5B7]/50 rounded-full overflow-hidden mb-2.5">
        <div className="w-12 h-full bg-[#F5A623] rounded-full animate-loading-slide" />
      </div>
      <p className="text-[12px] font-semibold tracking-wider uppercase text-[#8a7662]">
        Loading...
      </p>
    </div>
  )
}
