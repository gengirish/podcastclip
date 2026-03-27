"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/utils";
import { Library, Mic2, ChevronDown, ChevronUp, Copy, CheckCheck, Play, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const Youtube = Play;

interface Episode {
  id: number;
  title: string;
  source_type: string;
  source_url?: string;
  word_count: number;
  content_count: number;
  created_at: string;
}

interface ContentPiece {
  id: number;
  content_type: string;
  title: string;
  body: string;
  platform: string;
  created_at: string;
}

interface EpisodeDetail {
  episode: Episode;
  content: ContentPiece[];
}

const platformBadgeColors: Record<string, string> = {
  "TikTok/Reels": "bg-purple-100 text-purple-700",
  LinkedIn: "bg-blue-100 text-blue-700",
  "Twitter/X": "bg-sky-100 text-sky-700",
  Newsletter: "bg-amber-100 text-amber-700",
};

const typeColors: Record<string, string> = {
  transcript: "bg-slate-100 text-slate-700",
  youtube: "bg-red-100 text-red-700",
};

const typeLabels: Record<string, string> = {
  clip: "Clips",
  linkedin: "LinkedIn",
  twitter: "Twitter",
  newsletter: "Newsletter",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
    >
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function EpisodeCard({ episode }: { episode: Episode }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<EpisodeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState<string>("clip");

  const handleExpand = async () => {
    if (!expanded && !detail) {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/episodes/${episode.id}/content`);
        const data = await res.json();
        setDetail(data);
        const typeSet: string[] = [];
        data.content.forEach((p: ContentPiece) => { if (!typeSet.includes(p.content_type)) typeSet.push(p.content_type); });
        const types = typeSet;
        if (types.length > 0) setActiveType(types[0] as string);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    setExpanded((prev) => !prev);
  };

  const groupedContent = detail?.content.reduce<Record<string, ContentPiece[]>>((acc, p) => {
    if (!acc[p.content_type]) acc[p.content_type] = [];
    acc[p.content_type].push(p);
    return acc;
  }, {}) ?? {};

  const contentTypes = Object.keys(groupedContent);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div
        className="flex items-start gap-4 p-5 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={handleExpand}
      >
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
          {episode.source_type === "youtube" ? (
            <Youtube className="w-5 h-5 text-red-500" />
          ) : (
            <FileText className="w-5 h-5 text-indigo-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{episode.title}</h3>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={cn("text-xs px-2 py-0.5 rounded-full", typeColors[episode.source_type] ?? "bg-slate-100 text-slate-600")}>
              {episode.source_type}
            </span>
            <span className="text-xs text-slate-400">{episode.word_count.toLocaleString()} words</span>
            <span className="text-xs text-slate-400">{Number(episode.content_count)} content pieces</span>
            <span className="text-xs text-slate-400">{new Date(episode.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex-shrink-0 text-slate-400">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-200 p-5">
          {loading ? (
            <p className="text-slate-400 text-sm text-center py-4">Loading content...</p>
          ) : contentTypes.length === 0 ? (
            <p className="text-slate-400 text-sm">No content pieces yet.</p>
          ) : (
            <>
              {/* Type tabs */}
              <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit mb-5 flex-wrap">
                {contentTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                      activeType === type ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {typeLabels[type] ?? type}
                    {groupedContent[type].length > 1 && (
                      <span className="ml-1 bg-indigo-100 text-indigo-600 text-xs px-1.5 py-0.5 rounded-full">
                        {groupedContent[type].length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Content pieces */}
              <div className="space-y-3">
                {(groupedContent[activeType] ?? []).map((piece) => (
                  <div key={piece.id} className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{piece.title}</span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", platformBadgeColors[piece.platform] ?? "bg-slate-100 text-slate-600")}>
                          {piece.platform}
                        </span>
                      </div>
                      <CopyButton text={piece.body} />
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-slate-600 font-sans leading-relaxed bg-slate-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                      {piece.body}
                    </pre>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function LibraryPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/episodes`)
      .then((r) => r.json())
      .then(setEpisodes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Library className="w-6 h-6 text-indigo-600" />
          Content Library
        </h1>
        <p className="text-slate-500 mt-1">All your repurposed podcast content</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : episodes.length === 0 ? (
        <div className="text-center py-16">
          <Mic2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-600 font-medium mb-2">No episodes yet</h3>
          <p className="text-slate-400 text-sm mb-4">Head over to Repurpose to create your first content</p>
          <a
            href="/dashboard/repurpose"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
          >
            Start Repurposing
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 mb-2">{episodes.length} episode{episodes.length !== 1 ? "s" : ""} total</p>
          {episodes.map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} />
          ))}
        </div>
      )}
    </div>
  );
}
