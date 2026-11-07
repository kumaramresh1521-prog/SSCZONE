import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-800">
      <div className="text-center space-y-3">
        <h2 className="text-6xl font-black text-slate-300">404</h2>
        <p className="text-base font-bold text-slate-700">Page not found</p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The page or resource you are looking for does not exist or has been moved.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
