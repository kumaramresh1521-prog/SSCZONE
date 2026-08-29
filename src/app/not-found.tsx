import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-400">404</h2>
        <p className="mt-2 text-gray-600">Page not found</p>
        <Link href="/" className="mt-6 inline-block rounded-lg bg-primary px-6 py-2 text-white">Go Home</Link>
      </div>
    </div>
  );
}
