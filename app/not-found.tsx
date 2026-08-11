'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#181d2a] text-white p-4">
      <h1 className="text-4xl font-bold mb-2 font-jakarta">404</h1>
      <h2 className="text-xl font-semibold mb-4 font-jakarta text-slate-300">Page Not Found</h2>
      <p className="text-slate-400 mb-6 text-center max-w-md font-sub text-sm">
        The page or resource you requested could not be found.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
