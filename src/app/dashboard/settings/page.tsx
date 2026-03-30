"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Profile {
  companyName?: string;
  freelancerName?: string;
  contactEmail?: string;
  logoUrl?: string;
  defaultCurrency?: string;
  emailNotifications?: boolean;
  hidePoweredBy?: boolean;
  planTier?: string;
}

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "SGD", "NZD"];

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPro = profile.planTier === "PRO" || profile.planTier === "AGENCY";

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setProfile(data))
      .catch(console.error);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save");
        return;
      }
      const updated = await res.json();
      setProfile((p) => ({ ...p, ...updated }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/logo/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Upload failed");
        return;
      }
      const { url } = await res.json();
      setProfile((p) => ({ ...p, logoUrl: url }));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
          ProposalForge
        </Link>
        <span className="text-gray-300">/</span>
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 text-sm">
          Dashboard
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600 text-sm">Settings</span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Company branding and profile used in your proposals.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">
            Settings saved successfully.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Company & Profile */}
          <div className="bg-white rounded-xl border shadow-sm p-8 space-y-6">
            <h2 className="font-semibold text-gray-900">Company &amp; Profile</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  value={profile.companyName ?? ""}
                  onChange={(e) => update("companyName", e.target.value)}
                  placeholder="Acme Studio"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  value={profile.freelancerName ?? ""}
                  onChange={(e) => update("freelancerName", e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={profile.contactEmail ?? ""}
                onChange={(e) => update("contactEmail", e.target.value)}
                placeholder="you@company.com"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Shown on proposals as the sender contact address.
              </p>
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo
                {!isPro && (
                  <span className="ml-2 text-xs text-gray-400 font-normal">
                    (file upload available on Pro)
                  </span>
                )}
              </label>
              {isPro ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition"
                    >
                      {uploading ? "Uploading…" : "Upload PNG/JPG"}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    {profile.logoUrl && (
                      <button
                        type="button"
                        onClick={() => update("logoUrl", "")}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    value={profile.logoUrl ?? ""}
                    onChange={(e) => update("logoUrl", e.target.value)}
                    placeholder="or paste a public HTTPS URL"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <input
                  type="url"
                  value={profile.logoUrl ?? ""}
                  onChange={(e) => update("logoUrl", e.target.value)}
                  placeholder="https://yoursite.com/logo.png"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
              <p className="text-xs text-gray-400 mt-1">
                Displayed in the client portal header and on the proposal cover.
              </p>
              {profile.logoUrl && (
                <div className="mt-2 p-3 border rounded-lg inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.logoUrl}
                    alt="Logo preview"
                    className="h-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Currency
              </label>
              <select
                value={profile.defaultCurrency ?? "USD"}
                onChange={(e) => update("defaultCurrency", e.target.value)}
                className="w-48 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl border shadow-sm p-8 space-y-4">
            <h2 className="font-semibold text-gray-900">Email Notifications</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.emailNotifications ?? true}
                onChange={(e) => update("emailNotifications", e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm text-gray-700">
                Send me email notifications (signatures, payments
                {isPro ? ", and views" : ""})
              </span>
            </label>
            {!isPro && (
              <p className="text-xs text-gray-400">
                View notifications are available on Pro and Agency plans.
              </p>
            )}
          </div>

          {/* Branding (Pro only) */}
          {isPro && (
            <div className="bg-white rounded-xl border shadow-sm p-8 space-y-4">
              <h2 className="font-semibold text-gray-900">Client Portal Branding</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.hidePoweredBy ?? false}
                  onChange={(e) => update("hidePoweredBy", e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm text-gray-700">
                  Hide &ldquo;Powered by ProposalForge&rdquo; in client portal footer
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
