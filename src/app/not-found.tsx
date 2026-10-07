import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-5">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-black text-[#F5A623] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-[#2C1A0E] mb-3">Oops! Page Not Found</h2>
        <p className="text-[15px] text-[#6B5744] mb-8 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let's get you back on track!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href="/"
            className="bg-[#F5A623] text-[#2C1A0E] font-bold px-6 py-3 rounded-xl hover:bg-[#E09615] hover:-translate-y-0.5 transition-all shadow-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
