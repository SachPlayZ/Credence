"use client";

import { useRouter } from "next/navigation";

export function SuccessModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-zinc-900 p-6 rounded-xl shadow-lg text-center border border-orange-500/20">
        <h2 className="text-2xl font-bold mb-4 text-orange-400">Feedback Submitted Successfully!</h2>
        <p className="text-zinc-300 mb-6">Thank you for your feedback. We appreciate your input!</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              router.push("/");
            }}
            className="px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg hover:from-orange-500 hover:to-red-600 transition-all"
          >
            Go to Home
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
