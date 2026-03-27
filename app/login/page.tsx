"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mic2, Zap, Clock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (email === "demo@podcastclip.ai" && password === "demo123") {
      toast.success("Welcome back!");
      router.push("/dashboard");
    } else {
      toast.error("Invalid credentials. Use demo@podcastclip.ai / demo123");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Mic2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xl font-bold">PodcastClip</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            One Podcast Episode<br />
            <span className="text-indigo-400">→ 6 Pieces of Content</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Paste a transcript or YouTube URL and get TikTok clip scripts, LinkedIn posts, Twitter threads &amp; newsletters — instantly powered by AI.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 mb-8">
            {["TikTok/Reels", "LinkedIn", "Twitter/X", "Newsletter"].map((p) => (
              <span key={p} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm border border-slate-700">
                {p}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-xl p-4 text-center border border-slate-700">
              <div className="text-2xl font-bold text-indigo-400">3</div>
              <div className="text-slate-400 text-xs mt-1">Clip Scripts</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 text-center border border-slate-700">
              <div className="text-2xl font-bold text-indigo-400">4</div>
              <div className="text-slate-400 text-xs mt-1">Platforms</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 text-center border border-slate-700">
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span className="text-lg font-bold text-indigo-400">&lt;30s</span>
              </div>
              <div className="text-slate-400 text-xs mt-1">Generate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Mic2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-slate-900 text-xl font-bold">PodcastClip</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in</h2>
          <p className="text-slate-500 mb-8">Access your content repurposing dashboard</p>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span className="text-indigo-700 font-medium text-sm">Demo credentials</span>
            </div>
            <p className="text-indigo-600 text-sm">demo@podcastclip.ai / demo123</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@podcastclip.ai"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
