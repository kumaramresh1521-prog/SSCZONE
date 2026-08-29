"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, LoaderCircle, Tag, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

type BookmarkButtonProps = {
  questionId: number;
};

const TAG_OPTIONS = [
  { label: "📌 Standard", value: "Standard" },
  { label: "🔥 High Priority", value: "High Priority" },
  { label: "⚠️ Tricky / Hard", value: "Tricky" },
  { label: "📐 Formula", value: "Formula" },
];

export default function BookmarkButton({ questionId }: BookmarkButtonProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [bookmarkId, setBookmarkId] = useState<number | null>(null);
  const [currentTag, setCurrentTag] = useState<string>("Standard");
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadBookmark(nextUserId: string) {
      setChecking(true);
      const { data, error } = await supabase
        .from("bookmarks")
        .select("id, tag")
        .eq("user_id", nextUserId)
        .eq("question_id", questionId)
        .maybeSingle();

      if (cancelled) return;
      setBookmarkId(error ? null : data?.id ?? null);
      if (data?.tag) setCurrentTag(data.tag);
      setChecking(false);
    }

    async function syncSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;

      const nextUserId = session?.user?.id ?? null;
      setUserId(nextUserId);
      if (nextUserId) {
        await loadBookmark(nextUserId);
      } else {
        setBookmarkId(null);
        setChecking(false);
      }
    }

    void syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUserId = session?.user?.id ?? null;
      setUserId(nextUserId);
      if (nextUserId) {
        void loadBookmark(nextUserId);
      } else {
        setBookmarkId(null);
        setChecking(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [questionId]);

  async function toggleBookmark() {
    if (!userId) {
      toast.error("Sign in to save questions for revision.");
      return;
    }
    if (checking || saving) return;

    setSaving(true);
    try {
      if (bookmarkId) {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("id", bookmarkId)
          .eq("user_id", userId);

        if (error) throw error;
        setBookmarkId(null);
        setShowTagMenu(false);
        toast.success("Removed from saved revision list.");
        return;
      }

      const { data, error } = await supabase
        .from("bookmarks")
        .insert({ user_id: userId, question_id: questionId, tag: currentTag || "Standard" })
        .select("id, tag")
        .single();

      if (error) {
        if (error.code === "23505") {
          const { data: existing } = await supabase
            .from("bookmarks")
            .select("id, tag")
            .eq("user_id", userId)
            .eq("question_id", questionId)
            .maybeSingle();

          if (existing) {
            setBookmarkId(existing.id);
            if (existing.tag) setCurrentTag(existing.tag);
            toast.success("Question is already saved.");
            return;
          }
        }
        throw error;
      }

      setBookmarkId(data.id);
      toast.success("Question saved! (Solutions hidden in revision mode)");
    } catch {
      toast.error("Could not save question. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function selectTag(newTag: string) {
    setCurrentTag(newTag);
    setShowTagMenu(false);

    if (!userId) return;

    if (bookmarkId) {
      try {
        await supabase
          .from("bookmarks")
          .update({ tag: newTag })
          .eq("id", bookmarkId);
        toast.success(`Tagged as ${newTag} 🏷️`);
      } catch {}
    } else {
      // Save directly with this tag
      try {
        const { data } = await supabase
          .from("bookmarks")
          .insert({ user_id: userId, question_id: questionId, tag: newTag })
          .select("id")
          .single();
        if (data) {
          setBookmarkId(data.id);
          toast.success(`Saved under ${newTag} 🏷️`);
        }
      } catch {}
    }
  }

  const saved = bookmarkId !== null;
  const busy = checking || saving;

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleBookmark}
        disabled={busy}
        aria-label={saved ? "Remove saved question" : "Save question"}
        aria-pressed={saved}
        title={saved ? "Saved for revision (Click to remove)" : "Save question for revision"}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all cursor-pointer disabled:cursor-wait ${
          saved
            ? "border-amber-300 bg-amber-50 text-amber-600 shadow-2xs"
            : "border-gray-200 bg-white text-gray-400 hover:border-amber-300 hover:bg-amber-50/60 hover:text-amber-600"
        }`}
      >
        {busy ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : saved ? (
          <Bookmark className="h-4 w-4 fill-amber-500 text-amber-500" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </button>

      {/* Small Tag Quick-Picker Dropdown Toggle */}
      {saved && (
        <button
          type="button"
          onClick={() => setShowTagMenu((prev) => !prev)}
          className="ml-1 flex h-9 px-1.5 items-center justify-center rounded-lg border border-amber-200 bg-amber-50/80 text-amber-700 text-[10px] font-black hover:bg-amber-100 cursor-pointer"
          title="Change revision category tag"
        >
          <span>🏷️</span>
          <ChevronDown className="h-3 w-3 ml-0.5" />
        </button>
      )}

      {/* Tag Selection Popup Menu */}
      {showTagMenu && (
        <div className="absolute right-0 top-11 z-30 w-44 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl space-y-0.5 animate-fadeIn">
          <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-gray-400">
            Set Revision Tag
          </div>
          {TAG_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => selectTag(opt.value)}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                currentTag === opt.value
                  ? "bg-amber-50 text-amber-900 font-black"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>{opt.label}</span>
              {currentTag === opt.value && <span className="text-amber-600 font-black">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
