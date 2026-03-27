"use client";

import { useState } from "react";
import { API_URL } from "@/lib/utils";
import { toast } from "sonner";
import { Scissors, Play, FileText, Copy, CheckCheck, Loader2 } from "lucide-react";
const PlayCircle = Play;
import { cn } from "@/lib/utils";

interface ContentPiece {
  id: number;
  content_type: string;
  title: string;
  body: string;
  platform: string;
}

interface ResultData {
  episode_id: number;
  content: ContentPiece[];
}

const contentTabs = [
  { key: "clip", label: "Clips", emoji: "📱" },
  { key: "linkedin", label: "LinkedIn", emoji: "💼" },
  { key: "twitter", label: "Twitter", emoji: "🐦" },
  { key: "newsletter", label: "Newsletter", emoji: "📧" },
];

const platformBadgeColors: Record<string, string> = {
  "TikTok/Reels": "bg-purple-100 text-purple-700",
  LinkedIn: "bg-blue-100 text-blue-700",
  "Twitter/X": "bg-sky-100 text-sky-700",
  Newsletter: "bg-amber-100 text-amber-700",
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
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
    >
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function RepurposePage() {
  const [inputTab, setInputTab] = useState<"transcript" | "youtube">("transcript");
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [youtubeUrl, setPlayCircleUrl] = useState("");
  const [youtubeTitle, setPlayCircleTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [activeContentTab, setActiveContentTab] = useState("clip");

  const handleTranscriptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !transcript.trim()) {
      toast.error("Please fill in both title and transcript.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, transcript }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      // Fetch content
      const contentRes = await fetch(`${API_URL}/api/episodes/${data.episode_id}/content`);
      const contentData = await contentRes.json();
      setResult({ episode_id: data.episode_id, content: contentData.content });
      toast.success(`Generated ${data.content_pieces} content pieces!`);
    } catch {
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayCircleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) {
      toast.error("Please enter a YouTube URL.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/ingest-youtube`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: youtubeUrl, title: youtubeTitle || undefined }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const contentRes = await fetch(`${API_URL}/api/episodes/${data.episode_id}/content`);
      const contentData = await contentRes.json();
      setResult({ episode_id: data.episode_id, content: contentData.content });
      toast.success(`Fetched & generated content for: ${data.title}`);
    } catch {
      toast.error("Failed to process YouTube URL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = result?.content.filter((p) => p.content_type === activeContentTab) ?? [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Scissors className="w-6 h-6 text-indigo-600" />
          Repurpose with AI
        </h1>
        <p className="text-slate-500 mt-1">Paste a transcript or YouTube URL to generate 6 pieces of content</p>
      </div>

      {/* Input section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        {/* Input tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit mb-6">
          <button
            onClick={() => setInputTab("transcript")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              inputTab === "transcript" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <FileText className="w-4 h-4" />
            Paste Transcript
          </button>
          <button
            onClick={() => setInputTab("youtube")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              inputTab === "youtube" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <PlayCircle className="w-4 h-4" />
            YouTube URL
          </button>
        </div>

        {inputTab === "transcript" ? (
          <form onSubmit={handleTranscriptSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Episode Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. How AI is changing the startup landscape"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Transcript *</label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your full podcast transcript here..."
                rows={10}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400 resize-none"
              />
              {transcript && (
                <p className="text-xs text-slate-400 mt-1">{transcript.split(/\s+/).filter(Boolean).length} words</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating 6 content pieces...
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4" />
                  Repurpose with AI
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePlayCircleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Custom Title (optional)</label>
              <input
                type="text"
                value={youtubeTitle}
                onChange={(e) => setPlayCircleTitle(e.target.value)}
                placeholder="Leave blank to auto-detect"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">YouTube URL *</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setPlayCircleUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Fetching &amp; generating content...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  Fetch &amp; Repurpose
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 font-medium">Generating 6 content pieces with AI...</p>
          <p className="text-slate-400 text-sm mt-1">This usually takes 15–30 seconds</p>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {["3 Clip Scripts", "LinkedIn Post", "Twitter Thread", "Newsletter Section"].map((item) => (
              <span key={item} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">{item}</span>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Generated Content</h2>

          {/* Content type tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit mb-6 flex-wrap">
            {contentTabs.map(({ key, label, emoji }) => {
              const count = result.content.filter((p) => p.content_type === key).length;
              if (count === 0) return null;
              return (
                <button
                  key={key}
                  onClick={() => setActiveContentTab(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    activeContentTab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {emoji} {label} {count > 1 && <span className="bg-indigo-100 text-indigo-600 text-xs px-1.5 py-0.5 rounded-full">{count}</span>}
                </button>
              );
            })}
          </div>

          {/* Content pieces */}
          <div className="space-y-4">
            {filteredContent.length === 0 ? (
              <p className="text-slate-400 text-sm">No content of this type.</p>
            ) : (
              filteredContent.map((piece) => (
                <div key={piece.id} className="border border-slate-200 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">{piece.title}</h3>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full mt-1 inline-block", platformBadgeColors[piece.platform] ?? "bg-slate-100 text-slate-600")}>
                        {piece.platform}
                      </span>
                    </div>
                    <CopyButton text={piece.body} />
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed bg-slate-50 rounded-lg p-4">
                    {piece.body}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
