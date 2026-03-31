"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProposalButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/proposals/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        setLoading(false);
        setConfirming(false);
      }
    } catch {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-red-600 hover:text-red-800 text-xs font-medium disabled:opacity-50"
        >
          {loading ? "Deleting…" : "Confirm"}
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={() => setConfirming(false)}
          className="text-gray-400 hover:text-gray-600 text-xs"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-gray-300 hover:text-red-500 text-xs transition"
      title="Delete proposal"
    >
      Delete
    </button>
  );
}
