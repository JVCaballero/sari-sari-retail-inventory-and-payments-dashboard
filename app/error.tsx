'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#181d2a] text-white p-4">
      <h2 className="text-xl font-bold mb-2 font-jakarta">Something went wrong!</h2>
      <p className="text-slate-400 mb-6 text-center max-w-md font-sub text-sm">
        An unhandled error occurred in the application.
      </p>
      <button
        onClick={() => reset()}
        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
