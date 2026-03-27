"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/utils";
import { Mic2, FileText, Scissors, PenLine, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Stats {
  total_episodes: number;
  total_content_pieces: number;
  by_type: { content_type: string; count: number }[];
}

interface Episode {
  id: number;
  title: string;
  source_type: string;
  word_count: number;
  content_count: number;
  created_at: string;
}

const typeLabels: Record<string, string> = {
  clip: "Clips",
  linkedin: "LinkedIn",
  twitter: "Twitter",
  newsletter: "Newsletter",
};

const typeColors: Record<string, string> = {
  clip: "bg-purple-100 text-purple-700",
  linkedin: "bg-blue-100 text-blue-700",
  twitter: "bg-sky-100 text-sky-700",
  newsletter: "bg-amber-100 text-amber-700",
  transcript: "bg-slate-100 text-slate-700",
  youtube: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/stats`).then((r) => r.json()).then(setStats).catch(() => {});
    fetch(`${API_URL}/api/episodes`).then((r) => r.json()).then(setEpisodes).catch(() => {});
  }, []);

  const clipCount = stats?.by_type.find((b) => b.content_type === "clip")?.count ?? 0;
  const postCount = (stats?.by_type.filter((b) => b.content_type !== "clip").reduce((a, b) => a + Number(b.count), 0)) ?? 0;

  const chartData = stats?.by_type.map((b) => ({
    name: typeLabels[b.content_type] ?? b.content_type,
    count: Number(b.count),
  })) ?? [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500 mt-1">Your podcast content repurposing stats</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Episodes", value: stats?.total_episodes ?? "—", icon: Mic2, color: "text-indigo-600 bg-indigo-50" },
          { label: "Content Pieces", value: stats?.total_content_pieces ?? "—", icon: FileText, color: "text-emerald-600 bg-emerald-50" },
          { label: "Clips Created", value: clipCount || "—", icon: Scissors, color: "text-purple-600 bg-purple-50" },
          { label: "Posts Written", value: postCount || "—", icon: PenLine, color: "text-amber-600 bg-amber-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-slate-500 text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Content by Type</h2>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
              No data yet
            </div>
          )}
        </div>

        {/* Recent Episodes */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Recent Episodes</h2>
          {episodes.length === 0 ? (
            <p className="text-slate-400 text-sm">No episodes yet. Go repurpose!</p>
          ) : (
            <div className="space-y-3">
              {episodes.slice(0, 5).map((ep) => (
                <div key={ep.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mic2 className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{ep.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[ep.source_type] ?? "bg-slate-100 text-slate-600"}`}>
                        {ep.source_type}
                      </span>
                      <span className="text-xs text-slate-400">{ep.word_count} words</span>
                      <span className="text-xs text-slate-400">{Number(ep.content_count)} pieces</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
