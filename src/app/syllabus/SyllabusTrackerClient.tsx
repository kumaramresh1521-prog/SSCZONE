"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ALL_EXAM_SYLLABUSES,
  getExamSyllabus,
  ChapterItem,
  SubjectCategory,
  ExamSyllabus,
  UserChapterProgress,
  CustomTopicItem,
  CustomSubjectItem,
  ChapterAttachment,
} from "@/lib/syllabus-master-data";
import {
  Calculator,
  Brain,
  BookA,
  Landmark,
  Laptop,
  CheckCircle2,
  Circle,
  RotateCw,
  Star,
  Flame,
  Zap,
  ExternalLink,
  StickyNote,
  Edit3,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Printer,
  Sparkles,
  Share2,
  Check,
  Calendar,
  FileText,
  Bookmark,
  Plus,
  Trash2,
  Cloud,
  BookOpen,
  Paperclip,
  Youtube,
  Folder,
  Link2,
  Eye,
  EyeOff,
  Play,
  Pause,
  Timer,
  Download,
  Upload,
  LayoutGrid,
  Clock,
  ArrowUpDown,
  Tag,
  X,
  Trophy,
} from "lucide-react";

// Subject icon resolver
function getSubjectIcon(iconName: string, className: string = "w-5 h-5") {
  switch (iconName) {
    case "Calculator":
      return <Calculator className={className} />;
    case "Brain":
      return <Brain className={className} />;
    case "BookA":
      return <BookA className={className} />;
    case "Landmark":
      return <Landmark className={className} />;
    case "Laptop":
      return <Laptop className={className} />;
    case "Star":
      return <Star className={className} />;
    case "Trophy":
      return <Trophy className={className} />;
    case "Sparkles":
      return <Sparkles className={className} />;
    default:
      return <BookOpen className={className} />;
  }
}

// Subject color theme classes
function getSubjectTheme(color: string) {
  switch (color) {
    case "blue":
      return {
        tabActive: "bg-blue-600 text-white shadow-md shadow-blue-200 border-blue-600",
        tabInactive: "text-slate-700 hover:bg-blue-50 border-transparent hover:border-blue-200",
        badge: "bg-blue-100 text-blue-800 border-blue-200",
        progress: "bg-blue-600",
        ring: "text-blue-600",
        accent: "border-l-blue-600",
      };
    case "purple":
      return {
        tabActive: "bg-purple-600 text-white shadow-md shadow-purple-200 border-purple-600",
        tabInactive: "text-slate-700 hover:bg-purple-50 border-transparent hover:border-purple-200",
        badge: "bg-purple-100 text-purple-800 border-purple-200",
        progress: "bg-purple-600",
        ring: "text-purple-600",
        accent: "border-l-purple-600",
      };
    case "emerald":
      return {
        tabActive: "bg-emerald-600 text-white shadow-md shadow-emerald-200 border-emerald-600",
        tabInactive: "text-slate-700 hover:bg-emerald-50 border-transparent hover:border-emerald-200",
        badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
        progress: "bg-emerald-600",
        ring: "text-emerald-600",
        accent: "border-l-emerald-600",
      };
    case "amber":
      return {
        tabActive: "bg-amber-600 text-white shadow-md shadow-amber-200 border-amber-600",
        tabInactive: "text-slate-700 hover:bg-amber-50 border-transparent hover:border-amber-200",
        badge: "bg-amber-100 text-amber-800 border-amber-200",
        progress: "bg-amber-600",
        ring: "text-amber-600",
        accent: "border-l-amber-600",
      };
    case "sky":
      return {
        tabActive: "bg-sky-600 text-white shadow-md shadow-sky-200 border-sky-600",
        tabInactive: "text-slate-700 hover:bg-sky-50 border-transparent hover:border-sky-200",
        badge: "bg-sky-100 text-sky-800 border-sky-200",
        progress: "bg-sky-600",
        ring: "text-sky-600",
        accent: "border-l-sky-600",
      };
    case "rose":
      return {
        tabActive: "bg-rose-600 text-white shadow-md shadow-rose-200 border-rose-600",
        tabInactive: "text-slate-700 hover:bg-rose-50 border-transparent hover:border-rose-200",
        badge: "bg-rose-100 text-rose-800 border-rose-200",
        progress: "bg-rose-600",
        ring: "text-rose-600",
        accent: "border-l-rose-600",
      };
    case "teal":
      return {
        tabActive: "bg-teal-600 text-white shadow-md shadow-teal-200 border-teal-600",
        tabInactive: "text-slate-700 hover:bg-teal-50 border-transparent hover:border-teal-200",
        badge: "bg-teal-100 text-teal-800 border-teal-200",
        progress: "bg-teal-600",
        ring: "text-teal-600",
        accent: "border-l-teal-600",
      };
    default:
      return {
        tabActive: "bg-slate-900 text-white border-slate-900",
        tabInactive: "text-slate-700 hover:bg-slate-100 border-transparent",
        badge: "bg-slate-100 text-slate-800 border-slate-200",
        progress: "bg-slate-900",
        ring: "text-slate-900",
        accent: "border-l-slate-900",
      };
  }
}

// Attachment icon resolver
function getAttachmentIcon(type: ChapterAttachment["type"]) {
  switch (type) {
    case "youtube":
      return <Youtube className="w-3.5 h-3.5 text-red-600" />;
    case "pdf":
      return <FileText className="w-3.5 h-3.5 text-blue-600" />;
    case "drive":
      return <Folder className="w-3.5 h-3.5 text-amber-600" />;
    default:
      return <Link2 className="w-3.5 h-3.5 text-emerald-600" />;
  }
}

export default function SyllabusTrackerClient() {
  const [selectedExamSlug, setSelectedExamSlug] = useState<string>("ssc-cgl");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("quant");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "high_weightage" | "pending" | "mastered">("all");
  const [viewMode, setViewMode] = useState<"binder" | "kanban" | "deadlines">("binder");
  
  // Progress state keyed by chapterId
  const [progressMap, setProgressMap] = useState<Record<string, UserChapterProgress>>({});
  
  // Custom user-added topics keyed by subjectId
  const [customTopics, setCustomTopics] = useState<Record<string, CustomTopicItem[]>>({});
  
  // Custom user-added subjects (e.g. Current Affairs, General Science special)
  const [customSubjects, setCustomSubjects] = useState<CustomSubjectItem[]>([]);

  // Hidden/Archived standard chapters (aspirant can delete/hide chapters they don't want)
  const [hiddenChapterIds, setHiddenChapterIds] = useState<string[]>([]);
  const [showArchivedModal, setShowArchivedModal] = useState<boolean>(false);

  // Scratchpad drawer open states
  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({});

  // Sync state: "synced" | "saving" | "offline" | "guest"
  const [syncStatus, setSyncStatus] = useState<"synced" | "saving" | "offline" | "guest">("offline");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Modals
  const [showAddCustomModal, setShowAddCustomModal] = useState<boolean>(false);
  const [newTopicName, setNewTopicName] = useState<string>("");
  const [newTopicHindi, setNewTopicHindi] = useState<string>("");
  const [newTopicCategory, setNewTopicCategory] = useState<string>("Custom Topics");
  const [newTopicWeightage, setNewTopicWeightage] = useState<boolean>(false);
  const [newTopicTargetDate, setNewTopicTargetDate] = useState<string>("");

  const [showAddSubjectModal, setShowAddSubjectModal] = useState<boolean>(false);
  const [newSubjectName, setNewSubjectName] = useState<string>("");
  const [newSubjectHindi, setNewSubjectHindi] = useState<string>("");
  const [newSubjectColor, setNewSubjectColor] = useState<CustomSubjectItem["color"]>("rose");
  const [newSubjectIcon, setNewSubjectIcon] = useState<string>("BookOpen");
  const [newSubjectDesc, setNewSubjectDesc] = useState<string>("");

  // Attachment Modal
  const [activeAttachmentChapter, setActiveAttachmentChapter] = useState<string | null>(null);
  const [attachType, setAttachType] = useState<ChapterAttachment["type"]>("youtube");
  const [attachTitle, setAttachTitle] = useState<string>("");
  const [attachUrl, setAttachUrl] = useState<string>("");

  // Study Stopwatch State
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stopwatch effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Base Exam Syllabus
  const baseExam: ExamSyllabus = useMemo(() => {
    return getExamSyllabus(selectedExamSlug);
  }, [selectedExamSlug]);

  // Combined Subjects (Base Exam Subjects + User-Added Custom Subjects)
  const allSubjects: SubjectCategory[] = useMemo(() => {
    const customConverted: SubjectCategory[] = customSubjects.map((cs) => ({
      id: cs.id as any,
      name: cs.name,
      hindi_name: cs.hindi_name,
      color: (cs.color === "rose" || cs.color === "teal" ? "purple" : cs.color) as any,
      icon: cs.icon,
      description: cs.description || "Custom study notebook",
      chapters: [],
    }));
    return [...baseExam.subjects, ...customConverted];
  }, [baseExam, customSubjects]);

  // Current active subject
  const activeSubject: SubjectCategory = useMemo(() => {
    const found = allSubjects.find((s) => s.id === selectedSubjectId);
    return found || allSubjects[0] || baseExam.subjects[0];
  }, [allSubjects, selectedSubjectId, baseExam]);

  // Load progress, custom topics, custom subjects & hidden chapters from localStorage
  useEffect(() => {
    const storageKey = `ssczone_syllabus_${selectedExamSlug}`;
    const customKey = `ssczone_custom_topics_${selectedExamSlug}`;
    const subjectKey = `ssczone_custom_subjects_${selectedExamSlug}`;
    const hiddenKey = `ssczone_hidden_chapters_${selectedExamSlug}`;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setProgressMap(JSON.parse(saved));
      else setProgressMap({});

      const savedCustom = localStorage.getItem(customKey);
      if (savedCustom) setCustomTopics(JSON.parse(savedCustom));
      else setCustomTopics({});

      const savedSubjects = localStorage.getItem(subjectKey);
      if (savedSubjects) setCustomSubjects(JSON.parse(savedSubjects));
      else setCustomSubjects([]);

      const savedHidden = localStorage.getItem(hiddenKey);
      if (savedHidden) setHiddenChapterIds(JSON.parse(savedHidden));
      else setHiddenChapterIds([]);
    } catch (e) {
      console.warn("Error reading localStorage:", e);
    }

    // Check Cloud Sync
    fetch(`/api/syllabus?exam=${selectedExamSlug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          setSyncStatus("synced");
          if (Array.isArray(data.progress) && data.progress.length > 0) {
            setProgressMap((prev) => {
              const merged = { ...prev };
              data.progress.forEach((p: any) => {
                merged[p.chapter_id] = {
                  chapter_id: p.chapter_id,
                  theory_done: p.theory_done,
                  practice_done: p.practice_done,
                  revision_count: p.revision_count ?? 0,
                  confidence: p.confidence || "unrated",
                  notes: p.notes || "",
                  attachments: Array.isArray(p.attachments) ? p.attachments : [],
                  target_date: p.target_date || undefined,
                  updated_at: p.updated_at || new Date().toISOString(),
                };
              });
              try {
                localStorage.setItem(storageKey, JSON.stringify(merged));
              } catch (_) {}
              return merged;
            });
          }
        } else {
          setIsAuthenticated(false);
          setSyncStatus("guest");
        }
      })
      .catch(() => {
        setSyncStatus("offline");
      });
  }, [selectedExamSlug]);

  // Helper to persist to localStorage & cloud
  const updateProgress = (chapterId: string, patch: Partial<UserChapterProgress>) => {
    setProgressMap((prev) => {
      const current = prev[chapterId] || {
        chapter_id: chapterId,
        theory_done: false,
        practice_done: false,
        revision_count: 0,
        confidence: "unrated",
        notes: "",
        attachments: [],
        updated_at: new Date().toISOString(),
      };

      const updated: UserChapterProgress = {
        ...current,
        ...patch,
        updated_at: new Date().toISOString(),
      };

      const nextMap = { ...prev, [chapterId]: updated };

      // Persist locally
      try {
        localStorage.setItem(`ssczone_syllabus_${selectedExamSlug}`, JSON.stringify(nextMap));
      } catch (_) {}

      // Cloud sync debounced if authenticated
      if (isAuthenticated) {
        setSyncStatus("saving");
        if (debounceTimers.current[chapterId]) {
          clearTimeout(debounceTimers.current[chapterId]);
        }
        debounceTimers.current[chapterId] = setTimeout(() => {
          fetch("/api/syllabus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              exam_slug: selectedExamSlug,
              ...updated,
            }),
          })
            .then((r) => r.json())
            .then((res) => {
              if (res.success) setSyncStatus("synced");
            })
            .catch(() => setSyncStatus("offline"));
        }, 600);
      }

      return nextMap;
    });
  };

  // Toggle Theory Check
  const handleToggleTheory = (chapterId: string) => {
    const cur = progressMap[chapterId]?.theory_done || false;
    updateProgress(chapterId, { theory_done: !cur });
  };

  // Toggle Practice (50+ PYQs) Check
  const handleTogglePractice = (chapterId: string) => {
    const cur = progressMap[chapterId]?.practice_done || false;
    updateProgress(chapterId, { practice_done: !cur });
  };

  // Step Revision Count: 0 -> 1 -> 2 -> 3 -> 0
  const handleStepRevision = (chapterId: string) => {
    const cur = progressMap[chapterId]?.revision_count || 0;
    const next = (cur + 1) % 4;
    updateProgress(chapterId, { revision_count: next });
  };

  // Cycle Confidence: unrated -> low -> medium -> high -> unrated
  const handleCycleConfidence = (chapterId: string) => {
    const cur = progressMap[chapterId]?.confidence || "unrated";
    const order: UserChapterProgress["confidence"][] = ["unrated", "low", "medium", "high"];
    const nextIdx = (order.indexOf(cur) + 1) % order.length;
    updateProgress(chapterId, { confidence: order[nextIdx] });
  };

  // Add Attachment to Chapter
  const handleSaveAttachment = () => {
    if (!activeAttachmentChapter || !attachTitle.trim() || !attachUrl.trim()) return;

    const newAttach: ChapterAttachment = {
      id: `att_${Date.now()}`,
      type: attachType,
      title: attachTitle.trim(),
      url: attachUrl.trim().startsWith("http") ? attachUrl.trim() : `https://${attachUrl.trim()}`,
      created_at: new Date().toISOString(),
    };

    const currentList = progressMap[activeAttachmentChapter]?.attachments || [];
    updateProgress(activeAttachmentChapter, {
      attachments: [...currentList, newAttach],
    });

    setAttachTitle("");
    setAttachUrl("");
    setActiveAttachmentChapter(null);
  };

  // Remove Attachment from Chapter
  const handleRemoveAttachment = (chapterId: string, attachId: string) => {
    const currentList = progressMap[chapterId]?.attachments || [];
    updateProgress(chapterId, {
      attachments: currentList.filter((a) => a.id !== attachId),
    });
  };

  // Quick Append Scratchpad Formula / Trap Tag
  const handleAppendNoteTag = (chapterId: string, tag: string) => {
    const curNotes = progressMap[chapterId]?.notes || "";
    const updated = curNotes ? `${curNotes}\n${tag} ` : `${tag} `;
    updateProgress(chapterId, { notes: updated });
  };

  // Add Custom Chapter
  const handleAddCustomTopic = () => {
    if (!newTopicName.trim()) return;
    const item: CustomTopicItem = {
      id: `custom_${Date.now()}`,
      subject_id: activeSubject.id,
      name: newTopicName.trim(),
      hindi_name: newTopicHindi.trim() || undefined,
      category: newTopicCategory.trim() || "Custom Topics",
      high_weightage: newTopicWeightage,
      practice_query: newTopicName.trim(),
      target_date: newTopicTargetDate || undefined,
      created_at: new Date().toISOString(),
    };

    setCustomTopics((prev) => {
      const subjectList = prev[activeSubject.id] || [];
      const updated = { ...prev, [activeSubject.id]: [...subjectList, item] };
      try {
        localStorage.setItem(`ssczone_custom_topics_${selectedExamSlug}`, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    if (newTopicTargetDate) {
      updateProgress(item.id, { target_date: newTopicTargetDate });
    }

    setNewTopicName("");
    setNewTopicHindi("");
    setNewTopicCategory("Custom Topics");
    setNewTopicWeightage(false);
    setNewTopicTargetDate("");
    setShowAddCustomModal(false);
  };

  // Delete Custom Chapter
  const handleDeleteCustomTopic = (topicId: string) => {
    if (!confirm("Are you sure you want to delete this custom chapter?")) return;
    setCustomTopics((prev) => {
      const subjectList = prev[activeSubject.id] || [];
      const updated = {
        ...prev,
        [activeSubject.id]: subjectList.filter((t) => t.id !== topicId),
      };
      try {
        localStorage.setItem(`ssczone_custom_topics_${selectedExamSlug}`, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  // Hide / Delete standard chapter
  const handleHideStandardChapter = (chapterId: string) => {
    const next = [...hiddenChapterIds, chapterId];
    setHiddenChapterIds(next);
    try {
      localStorage.setItem(`ssczone_hidden_chapters_${selectedExamSlug}`, JSON.stringify(next));
    } catch (_) {}
  };

  // Restore hidden chapter
  const handleRestoreChapter = (chapterId: string) => {
    const next = hiddenChapterIds.filter((id) => id !== chapterId);
    setHiddenChapterIds(next);
    try {
      localStorage.setItem(`ssczone_hidden_chapters_${selectedExamSlug}`, JSON.stringify(next));
    } catch (_) {}
  };

  // Restore all hidden chapters
  const handleRestoreAllChapters = () => {
    setHiddenChapterIds([]);
    try {
      localStorage.removeItem(`ssczone_hidden_chapters_${selectedExamSlug}`);
    } catch (_) {}
    setShowArchivedModal(false);
  };

  // Add Custom Subject Notebook
  const handleAddCustomSubject = () => {
    if (!newSubjectName.trim()) return;
    const item: CustomSubjectItem = {
      id: `cs_${Date.now()}`,
      name: newSubjectName.trim(),
      hindi_name: newSubjectHindi.trim() || newSubjectName.trim(),
      color: newSubjectColor,
      icon: newSubjectIcon,
      description: newSubjectDesc.trim() || "Candidate custom revision notebook",
      created_at: new Date().toISOString(),
    };

    const next = [...customSubjects, item];
    setCustomSubjects(next);
    try {
      localStorage.setItem(`ssczone_custom_subjects_${selectedExamSlug}`, JSON.stringify(next));
    } catch (_) {}

    setSelectedSubjectId(item.id);
    setNewSubjectName("");
    setNewSubjectHindi("");
    setNewSubjectDesc("");
    setShowAddSubjectModal(false);
  };

  // Delete Custom Subject Notebook
  const handleDeleteCustomSubject = (subjectId: string) => {
    if (!confirm("Delete this custom notebook and its chapters?")) return;
    const next = customSubjects.filter((s) => s.id !== subjectId);
    setCustomSubjects(next);
    try {
      localStorage.setItem(`ssczone_custom_subjects_${selectedExamSlug}`, JSON.stringify(next));
    } catch (_) {}
    setSelectedSubjectId(baseExam.subjects[0].id);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const backupData = {
      exam_slug: selectedExamSlug,
      exported_at: new Date().toISOString(),
      progress: progressMap,
      custom_topics: customTopics,
      custom_subjects: customSubjects,
      hidden_chapters: hiddenChapterIds,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ssczone_syllabus_notebook_${selectedExamSlug}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.progress) {
          setProgressMap(parsed.progress);
          localStorage.setItem(`ssczone_syllabus_${selectedExamSlug}`, JSON.stringify(parsed.progress));
        }
        if (parsed.custom_topics) {
          setCustomTopics(parsed.custom_topics);
          localStorage.setItem(`ssczone_custom_topics_${selectedExamSlug}`, JSON.stringify(parsed.custom_topics));
        }
        if (parsed.custom_subjects) {
          setCustomSubjects(parsed.custom_subjects);
          localStorage.setItem(`ssczone_custom_subjects_${selectedExamSlug}`, JSON.stringify(parsed.custom_subjects));
        }
        if (parsed.hidden_chapters) {
          setHiddenChapterIds(parsed.hidden_chapters);
          localStorage.setItem(`ssczone_hidden_chapters_${selectedExamSlug}`, JSON.stringify(parsed.hidden_chapters));
        }
        alert("Syllabus notebook restored successfully!");
      } catch (err) {
        alert("Invalid backup file. Please upload a valid SSCZone JSON backup.");
      }
    };
    reader.readAsText(file);
  };

  // Calculate overall syllabus stats
  const overallStats = useMemo(() => {
    let totalChapters = 0;
    let completedPoints = 0;
    let masteredChapters = 0;

    allSubjects.forEach((subj) => {
      const customSubj = customTopics[subj.id] || [];
      const visibleStandard = subj.chapters.filter((c) => !hiddenChapterIds.includes(c.id));
      const totalInSubj = visibleStandard.length + customSubj.length;
      totalChapters += totalInSubj;

      visibleStandard.forEach((ch) => {
        const p = progressMap[ch.id];
        if (p) {
          let chPoints = 0;
          if (p.theory_done) chPoints += 1;
          if (p.practice_done) chPoints += 1;
          if (p.revision_count > 0) chPoints += 1;
          completedPoints += chPoints;
          if (chPoints === 3 || p.confidence === "high") masteredChapters += 1;
        }
      });

      customSubj.forEach((c) => {
        const p = progressMap[c.id];
        if (p) {
          let chPoints = 0;
          if (p.theory_done) chPoints += 1;
          if (p.practice_done) chPoints += 1;
          if (p.revision_count > 0) chPoints += 1;
          completedPoints += chPoints;
          if (chPoints === 3 || p.confidence === "high") masteredChapters += 1;
        }
      });
    });

    const maxPoints = Math.max(1, totalChapters * 3);
    const overallPercentage = Math.round((completedPoints / maxPoints) * 100);

    return {
      totalChapters,
      overallPercentage,
      masteredChapters,
      completedPoints,
    };
  }, [allSubjects, progressMap, customTopics, hiddenChapterIds]);

  // Calculate per-subject stats
  const subjectStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; percentage: number }> = {};
    allSubjects.forEach((subj) => {
      const customSubj = customTopics[subj.id] || [];
      const visibleStandard = subj.chapters.filter((c) => !hiddenChapterIds.includes(c.id));
      const total = visibleStandard.length + customSubj.length;
      let points = 0;

      visibleStandard.forEach((ch) => {
        const p = progressMap[ch.id];
        if (p) {
          if (p.theory_done) points += 1;
          if (p.practice_done) points += 1;
          if (p.revision_count > 0) points += 1;
        }
      });

      customSubj.forEach((c) => {
        const p = progressMap[c.id];
        if (p) {
          if (p.theory_done) points += 1;
          if (p.practice_done) points += 1;
          if (p.revision_count > 0) points += 1;
        }
      });

      const maxPts = Math.max(1, total * 3);
      const pct = Math.round((points / maxPts) * 100);
      stats[subj.id] = { total, completed: points, percentage: pct };
    });
    return stats;
  }, [allSubjects, progressMap, customTopics, hiddenChapterIds]);

  // Combined chapters for active subject (filtered and unhidden)
  const activeSubjectChapters = useMemo(() => {
    const customForThis = customTopics[activeSubject.id] || [];
    const visibleStandard = activeSubject.chapters.filter((c) => !hiddenChapterIds.includes(c.id));

    const combined: Array<ChapterItem & { isCustom?: boolean }> = [
      ...visibleStandard,
      ...customForThis.map((c) => ({
        id: c.id,
        name: c.name,
        hindi_name: c.hindi_name || "कस्टम टॉपिक",
        category: c.category,
        high_weightage: c.high_weightage,
        practice_query: c.practice_query || c.name,
        isCustom: true,
      })),
    ];

    return combined;
  }, [activeSubject, customTopics, hiddenChapterIds]);

  // Grouped chapters for binder view
  const displayedCategories = useMemo(() => {
    // Search query
    const searchFiltered = activeSubjectChapters.filter((ch) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        ch.name.toLowerCase().includes(q) ||
        (ch.hindi_name && ch.hindi_name.toLowerCase().includes(q)) ||
        ch.category.toLowerCase().includes(q)
      );
    });

    // Filter pill
    const statusFiltered = searchFiltered.filter((ch) => {
      const p = progressMap[ch.id];
      if (filterType === "all") return true;
      if (filterType === "high_weightage") return Boolean(ch.high_weightage);
      if (filterType === "pending") {
        return !(p?.theory_done && p?.practice_done && (p?.revision_count || 0) > 0);
      }
      if (filterType === "mastered") {
        return p?.confidence === "high" || (p?.theory_done && p?.practice_done && (p?.revision_count || 0) >= 1);
      }
      return true;
    });

    const grouped: Record<string, Array<ChapterItem & { isCustom?: boolean }>> = {};
    statusFiltered.forEach((ch) => {
      const cat = ch.category || "General";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(ch);
    });

    return grouped;
  }, [activeSubjectChapters, searchQuery, filterType, progressMap]);

  // Kanban view columns
  const kanbanColumns = useMemo(() => {
    const toStart: Array<ChapterItem & { isCustom?: boolean }> = [];
    const inProgress: Array<ChapterItem & { isCustom?: boolean }> = [];
    const mastered: Array<ChapterItem & { isCustom?: boolean }> = [];

    activeSubjectChapters.forEach((ch) => {
      const p = progressMap[ch.id];
      const points = (p?.theory_done ? 1 : 0) + (p?.practice_done ? 1 : 0) + ((p?.revision_count || 0) > 0 ? 1 : 0);
      if (points === 0) {
        toStart.push(ch);
      } else if (points === 3 || p?.confidence === "high") {
        mastered.push(ch);
      } else {
        inProgress.push(ch);
      }
    });

    return { toStart, inProgress, mastered };
  }, [activeSubjectChapters, progressMap]);

  // Deadlines view list
  const deadlineChapters = useMemo(() => {
    const list: Array<ChapterItem & { isCustom?: boolean; targetDate: string; isPast: boolean; daysDiff: number }> = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    activeSubjectChapters.forEach((ch) => {
      const p = progressMap[ch.id];
      const target = p?.target_date;
      if (target) {
        const d = new Date(target);
        d.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        list.push({
          ...ch,
          targetDate: target,
          isPast: diffDays < 0,
          daysDiff: diffDays,
        });
      }
    });

    return list.sort((a, b) => a.daysDiff - b.daysDiff);
  }, [activeSubjectChapters, progressMap]);

  // Handle Share / Copy Link
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Handle Print Checklist
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const theme = getSubjectTheme(activeSubject.color);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ── TOP ANNOUNCEMENT & TITLE HERO ── */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white border-b border-slate-800 pt-7 pb-9 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>OneNote-Style Interactive Syllabus Tracker & Digital Notebook</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <span>SSC Master Syllabus Checklist</span>
                <span className="text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Customizable Pro 2026
                </span>
              </h1>
              <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
                Add custom chapters, attach YouTube videos & PDFs, delete or hide topics, track 3-Pillar progress (Theory, 50+ PYQs, Revisions), and save personal formulas.
              </p>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              
              {/* Study Stopwatch Widget */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-mono">
                <Timer className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-bold text-white">{formatTimer(timerSeconds)}</span>
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`p-1 rounded-md ${isTimerRunning ? "text-amber-400 hover:bg-slate-700" : "text-emerald-400 hover:bg-slate-700"}`}
                  title={isTimerRunning ? "Pause Study Stopwatch" : "Start Study Stopwatch"}
                >
                  {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
                {timerSeconds > 0 && !isTimerRunning && (
                  <button
                    onClick={() => setTimerSeconds(0)}
                    className="text-[10px] text-slate-400 hover:text-slate-200 underline ml-0.5"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Print A4 Sheet */}
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all shadow-xs"
                title="Print clean A4 checklist for your study wall"
              >
                <Printer className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden sm:inline">Print A4</span>
              </button>

              {/* Export / Import Backup */}
              <button
                onClick={handleExportBackup}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                title="Download JSON backup of your notes & customized syllabus"
              >
                <Download className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden sm:inline">Export Backup</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                title="Restore from JSON backup"
              >
                <Upload className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden sm:inline">Import</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportBackup}
                accept=".json"
                className="hidden"
              />

              {/* Archived chapters count pill */}
              {hiddenChapterIds.length > 0 && (
                <button
                  onClick={() => setShowArchivedModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 text-purple-300 border border-purple-800/50 text-xs font-medium hover:bg-purple-900/60 transition-all"
                >
                  <EyeOff className="w-3.5 h-3.5 text-purple-400" />
                  <span>Hidden ({hiddenChapterIds.length})</span>
                </button>
              )}

              {/* Sync Pill */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                  syncStatus === "synced"
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/50"
                    : syncStatus === "saving"
                    ? "bg-amber-950/60 text-amber-300 border-amber-800/50"
                    : syncStatus === "guest"
                    ? "bg-slate-800 text-slate-300 border-slate-700"
                    : "bg-red-950/60 text-red-300 border-red-800/50"
                }`}
              >
                {syncStatus === "synced" && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Cloud Synced</span>
                  </>
                )}
                {syncStatus === "saving" && (
                  <>
                    <RotateCw className="w-3 h-3 text-amber-400 animate-spin" />
                    <span>Saving...</span>
                  </>
                )}
                {syncStatus === "guest" && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Browser Saved (Guest)</span>
                  </>
                )}
                {syncStatus === "offline" && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── EXAM PICKER & OVERALL PROGRESS BAR ── */}
          <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Exam selector buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase font-bold text-slate-400 mr-1">Target Exam:</span>
              {ALL_EXAM_SYLLABUSES.map((exam) => {
                const isActive = exam.exam_slug === selectedExamSlug;
                return (
                  <button
                    key={exam.exam_slug}
                    onClick={() => {
                      setSelectedExamSlug(exam.exam_slug);
                      const hasQuant = exam.subjects.some((s) => s.id === "quant");
                      setSelectedSubjectId(hasQuant ? "quant" : exam.subjects[0].id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      isActive
                        ? "bg-white text-slate-900 border-white shadow-xs"
                        : "bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span>{exam.short_code}</span>
                    <span className="ml-1.5 opacity-70 text-[10px] font-normal">{exam.badge}</span>
                  </button>
                );
              })}
            </div>

            {/* Overall Progress Meter */}
            <div className="bg-slate-800/80 backdrop-blur border border-slate-700/70 rounded-2xl p-3.5 flex items-center gap-4 min-w-[280px]">
              <div className="flex-1">
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">Overall Syllabus Progress</span>
                  <span className="text-white font-mono text-sm">{overallStats.overallPercentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-700/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, overallStats.overallPercentage))}%` }}
                  />
                </div>
              </div>
              <div className="text-right pl-3 border-l border-slate-700 shrink-0">
                <div className="text-base font-extrabold text-white font-mono leading-none">
                  {overallStats.masteredChapters}
                  <span className="text-xs text-slate-400 font-normal"> / {overallStats.totalChapters}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Mastered</div>
              </div>
            </div>

          </div>

          {/* ── VIEW SWITCHER PILLS (BINDER / KANBAN / DEADLINES) ── */}
          <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-4">
            <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setViewMode("binder")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === "binder" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>OneNote Binder</span>
              </button>

              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === "kanban" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban Board</span>
              </button>

              <button
                onClick={() => setViewMode("deadlines")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === "deadlines" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Deadlines & Targets</span>
              </button>
            </div>

            <button
              onClick={handleShare}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? "Link Copied!" : "Share Tracker"}</span>
            </button>
          </div>

        </div>
      </section>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* ======================================================== */}
        {/* VIEW 1: ONENOTE BINDER VIEW (2-COLUMN NOTEBOOK CANVAS)   */}
        {/* ======================================================== */}
        {viewMode === "binder" && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[800px]">
              
              {/* ── LEFT COLUMN: SUBJECT NOTEBOOK TABS (4 COLS) ── */}
              <aside className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/70 p-4 sm:p-5 flex flex-col justify-between">
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Subject Notebooks
                      </h2>
                    </div>

                    {/* Add Custom Subject Button */}
                    <button
                      onClick={() => setShowAddSubjectModal(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md transition-all"
                      title="Add a custom notebook section (e.g. Current Affairs, General Science)"
                    >
                      <Plus className="w-3 h-3" />
                      <span>New Notebook</span>
                    </button>
                  </div>

                  {/* Subject Tab Cards */}
                  <div className="space-y-2.5">
                    {allSubjects.map((subj) => {
                      const isSelected = subj.id === activeSubject.id;
                      const subjTheme = getSubjectTheme(subj.color);
                      const stats = subjectStats[subj.id] || { total: subj.chapters.length, completed: 0, percentage: 0 };
                      const isCustom = customSubjects.some((cs) => cs.id === subj.id);

                      return (
                        <div
                          key={subj.id}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 group relative ${
                            isSelected
                              ? "bg-white border-slate-300 shadow-md ring-2 ring-blue-500/10"
                              : "bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300 text-slate-700"
                          }`}
                        >
                          {/* Colored Left Tab Notch (OneNote Vibe) */}
                          <div
                            className={`w-1.5 absolute left-0 top-2 bottom-2 rounded-r transition-all ${
                              isSelected ? subjTheme.progress : "bg-transparent group-hover:bg-slate-300"
                            }`}
                          />

                          {/* Subject Icon */}
                          <button
                            onClick={() => setSelectedSubjectId(subj.id)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? `${subjTheme.badge} shadow-xs`
                                : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                            }`}
                          >
                            {getSubjectIcon(subj.icon, "w-5 h-5")}
                          </button>

                          {/* Subject Info */}
                          <button
                            onClick={() => setSelectedSubjectId(subj.id)}
                            className="flex-1 min-w-0 pr-1 text-left"
                          >
                            <div className="flex items-center justify-between">
                              <h3 className={`text-sm font-bold truncate ${isSelected ? "text-slate-900" : "text-slate-800"}`}>
                                {subj.name}
                              </h3>
                              <span className="text-xs font-mono font-bold text-slate-700">
                                {stats.percentage}%
                              </span>
                            </div>
                            
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {subj.hindi_name}
                            </p>

                            {/* Mini Progress Bar */}
                            <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${subjTheme.progress} transition-all duration-300 rounded-full`}
                                style={{ width: `${stats.percentage}%` }}
                              />
                            </div>

                            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                              <span>{stats.total} Chapters</span>
                              <span>{subj.chapters.filter((c) => c.high_weightage).length} High-Yield 🔥</span>
                            </div>
                          </button>

                          {/* Delete custom subject button */}
                          {isCustom && (
                            <button
                              onClick={() => handleDeleteCustomSubject(subj.id)}
                              className="text-slate-300 hover:text-red-500 p-1 shrink-0"
                              title="Delete custom notebook"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Study Tip Box in Sidebar */}
                <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-200/60 text-slate-700">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>3-Pillar Mastery Rule</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Target <strong>Theory + 50 PYQs + 2 Revisions</strong> for each chapter before moving on. Attach YouTube lectures or formulas for fast retrieval!
                  </p>
                  <div className="mt-3 pt-3 border-t border-blue-200/50 flex items-center justify-between text-[11px]">
                    <Link
                      href={`/speed-test`}
                      className="font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                    >
                      <span>Speed Test</span>
                      <Zap className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/notes`}
                      className="font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                      <span>Subject Notes</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

              </aside>

              {/* ── RIGHT COLUMN: INTERACTIVE CHECKLIST CANVAS (8 COLS) ── */}
              <section className="lg:col-span-8 p-4 sm:p-7 flex flex-col justify-between">
                
                <div>
                  {/* Active Subject Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${theme.badge}`}>
                          {activeSubject.name}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {activeSubject.hindi_name}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        {activeSubject.description}
                      </p>
                    </div>

                    {/* Add Custom Chapter Button */}
                    <button
                      onClick={() => setShowAddCustomModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all self-start sm:self-auto shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Custom Chapter</span>
                    </button>
                  </div>

                  {/* Filter and Search Bar */}
                  <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search ${activeSubject.name} chapters or topics...`}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Quick Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      <button
                        onClick={() => setFilterType("all")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                          filterType === "all"
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilterType("high_weightage")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                          filterType === "high_weightage"
                            ? "bg-amber-600 text-white"
                            : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                        }`}
                      >
                        <Flame className="w-3 h-3 text-amber-500" />
                        <span>High Weightage 🔥</span>
                      </button>
                      <button
                        onClick={() => setFilterType("pending")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                          filterType === "pending"
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100"
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => setFilterType("mastered")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                          filterType === "mastered"
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                        }`}
                      >
                        <Star className="w-3 h-3 text-emerald-600" />
                        <span>Mastered ⭐</span>
                      </button>
                    </div>

                  </div>

                  {/* ── CHAPTER GROUPS / SECTIONS ── */}
                  <div className="mt-6 space-y-6">
                    {Object.keys(displayedCategories).length === 0 ? (
                      <div className="p-12 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-300">
                        <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-700">No chapters found</p>
                        <p className="text-xs text-slate-500 mt-1">Try adjusting your search query, active filter, or click &quot;Add Custom Chapter&quot;.</p>
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setFilterType("all");
                          }}
                          className="mt-3 px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg"
                        >
                          Clear Filters
                        </button>
                      </div>
                    ) : (
                      Object.entries(displayedCategories).map(([categoryName, chapters]) => {
                        return (
                          <div key={categoryName} className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
                            
                            {/* Category Header */}
                            <div className="bg-slate-100/70 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-700" />
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                  {categoryName}
                                </h4>
                              </div>
                              <span className="text-[11px] font-semibold text-slate-500">
                                {chapters.length} {chapters.length === 1 ? "Chapter" : "Chapters"}
                              </span>
                            </div>

                            {/* Chapter Rows */}
                            <div className="divide-y divide-slate-100">
                              {chapters.map((chapter) => {
                                const p = progressMap[chapter.id] || {
                                  chapter_id: chapter.id,
                                  theory_done: false,
                                  practice_done: false,
                                  revision_count: 0,
                                  confidence: "unrated",
                                  notes: "",
                                  attachments: [],
                                  updated_at: "",
                                };

                                const isAllDone = p.theory_done && p.practice_done && p.revision_count > 0;
                                const isNotesOpen = openNotes[chapter.id] || false;
                                const hasPersonalNotes = Boolean(p.notes && p.notes.trim().length > 0);
                                const attachments = p.attachments || [];

                                return (
                                  <div
                                    key={chapter.id}
                                    className={`p-3.5 sm:p-4 transition-colors ${
                                      isAllDone ? "bg-emerald-50/20" : "hover:bg-slate-50/60"
                                    }`}
                                  >
                                    {/* Top Row: Chapter Title, Badges, Weightage */}
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                                      
                                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                        {/* Chapter Mastery State Indicator */}
                                        <button
                                          onClick={() => handleCycleConfidence(chapter.id)}
                                          title={`Confidence: ${p.confidence}. Click to cycle (Low / Medium / High)`}
                                          className="mt-0.5 shrink-0"
                                        >
                                          {p.confidence === "high" ? (
                                            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                                          ) : p.confidence === "medium" ? (
                                            <Star className="w-4 h-4 text-blue-500" />
                                          ) : p.confidence === "low" ? (
                                            <Star className="w-4 h-4 text-slate-300" />
                                          ) : (
                                            <Circle className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                                          )}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <h5 className={`text-sm font-bold ${isAllDone ? "text-slate-900 line-through decoration-emerald-500/50" : "text-slate-900"}`}>
                                              {chapter.name}
                                            </h5>
                                            
                                            {chapter.hindi_name && (
                                              <span className="text-xs text-slate-500 font-normal">
                                                ({chapter.hindi_name})
                                              </span>
                                            )}

                                            {chapter.high_weightage && (
                                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                                                <Flame className="w-3 h-3 text-red-500" />
                                                <span>High Weightage 🔥</span>
                                              </span>
                                            )}

                                            {chapter.isCustom && (
                                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                                                Custom
                                              </span>
                                            )}

                                            {p.target_date && (
                                              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                                <Calendar className="w-3 h-3 text-blue-500" />
                                                <span>Target: {p.target_date}</span>
                                              </span>
                                            )}
                                          </div>

                                          {chapter.expected_questions && (
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                              Expected in Exam: <span className="font-semibold text-slate-700">{chapter.expected_questions}</span>
                                            </p>
                                          )}

                                          {/* ── ATTACHMENTS CHIP LIST ── */}
                                          {attachments.length > 0 && (
                                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                              {attachments.map((att) => (
                                                <div
                                                  key={att.id}
                                                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all group/att"
                                                >
                                                  {getAttachmentIcon(att.type)}
                                                  <a
                                                    href={att.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline flex items-center gap-0.5"
                                                    title={att.url}
                                                  >
                                                    <span>{att.title}</span>
                                                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                                  </a>
                                                  <button
                                                    onClick={() => handleRemoveAttachment(chapter.id, att.id)}
                                                    className="ml-0.5 text-slate-400 hover:text-red-500 transition-colors"
                                                    title="Remove attachment"
                                                  >
                                                    <X className="w-3 h-3" />
                                                  </button>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Action Links & Buttons */}
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        
                                        {/* Attach Resource Button */}
                                        <button
                                          onClick={() => {
                                            setActiveAttachmentChapter(chapter.id);
                                            setAttachTitle("");
                                            setAttachUrl("");
                                          }}
                                          className="text-[11px] font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100"
                                          title="Attach YouTube video, PDF or Drive notes"
                                        >
                                          <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                                          <span className="hidden sm:inline">Attach</span>
                                        </button>

                                        {chapter.notes_slug && (
                                          <Link
                                            href={`/blog/notes/${chapter.notes_slug}`}
                                            target="_blank"
                                            className="text-[11px] font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100"
                                            title="Open chapter notes & formula sheet"
                                          >
                                            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                                            <span className="hidden sm:inline">Notes</span>
                                          </Link>
                                        )}

                                        {chapter.practice_query && (
                                          <Link
                                            href={`/speed-test?mode=topic&topicTitle=${encodeURIComponent(chapter.practice_query)}`}
                                            target="_blank"
                                            className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 border border-blue-200/60"
                                            title="Launch direct PYQ Speed Test drill on this topic"
                                          >
                                            <Zap className="w-3.5 h-3.5 text-blue-600" />
                                            <span>Practice</span>
                                          </Link>
                                        )}

                                        {/* OneNote Scratchpad Toggle */}
                                        <button
                                          onClick={() => setOpenNotes((prev) => ({ ...prev, [chapter.id]: !prev[chapter.id] }))}
                                          className={`text-[11px] font-medium flex items-center gap-1 px-2 py-1 rounded transition-all ${
                                            hasPersonalNotes
                                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                                              : isNotesOpen
                                              ? "bg-slate-200 text-slate-800"
                                              : "text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200"
                                          }`}
                                          title="Open personal formula scratchpad"
                                        >
                                          <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                                          <span className="hidden sm:inline">{hasPersonalNotes ? "Notes" : "+ Note"}</span>
                                          {isNotesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        </button>

                                        {/* Delete Custom or Hide Standard */}
                                        {chapter.isCustom ? (
                                          <button
                                            onClick={() => handleDeleteCustomTopic(chapter.id)}
                                            className="text-slate-400 hover:text-red-500 p-1"
                                            title="Delete custom topic"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => handleHideStandardChapter(chapter.id)}
                                            className="text-slate-300 hover:text-slate-500 p-1"
                                            title="Hide chapter from checklist"
                                          >
                                            <EyeOff className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>

                                    </div>

                                    {/* Bottom Row: The 3 Action Pillars (Theory, Practice, Revision) */}
                                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                                      
                                      {/* Pillar 1: Theory Done */}
                                      <button
                                        onClick={() => handleToggleTheory(chapter.id)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium border transition-all ${
                                          p.theory_done
                                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                            : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                                        }`}
                                      >
                                        {p.theory_done ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Circle className="w-4 h-4 text-slate-400" />}
                                        <span>📖 Theory Done</span>
                                      </button>

                                      {/* Pillar 2: 50+ PYQ Practice Done */}
                                      <button
                                        onClick={() => handleTogglePractice(chapter.id)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium border transition-all ${
                                          p.practice_done
                                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                            : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                                        }`}
                                      >
                                        {p.practice_done ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Circle className="w-4 h-4 text-slate-400" />}
                                        <span>⚡ 50+ PYQs Done</span>
                                      </button>

                                      {/* Pillar 3: Revision Stepper Badge */}
                                      <button
                                        onClick={() => handleStepRevision(chapter.id)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                                          p.revision_count >= 3
                                            ? "bg-purple-600 text-white border-purple-600"
                                            : p.revision_count === 2
                                            ? "bg-purple-100 text-purple-900 border-purple-300"
                                            : p.revision_count === 1
                                            ? "bg-blue-100 text-blue-900 border-blue-300"
                                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                        }`}
                                        title="Click to advance revision counter (0x -> 1x -> 2x -> 3x)"
                                      >
                                        <RotateCw className={`w-3.5 h-3.5 ${p.revision_count > 0 ? "text-current" : "text-slate-400"}`} />
                                        <span>
                                          {p.revision_count === 0 ? "🔄 Revise: 0x" : `🔄 Revised: ${p.revision_count}x`}
                                        </span>
                                      </button>

                                      {/* Confidence Status Pill */}
                                      <button
                                        onClick={() => handleCycleConfidence(chapter.id)}
                                        className={`ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-all ${
                                          p.confidence === "high"
                                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                            : p.confidence === "medium"
                                            ? "bg-blue-100 text-blue-800 border-blue-200"
                                            : p.confidence === "low"
                                            ? "bg-amber-100 text-amber-800 border-amber-200"
                                            : "bg-slate-100 text-slate-500 border-slate-200"
                                        }`}
                                      >
                                        {p.confidence === "high" && "⭐⭐⭐ Mastered"}
                                        {p.confidence === "medium" && "⭐⭐ Moderate"}
                                        {p.confidence === "low" && "⭐ Needs Practice"}
                                        {p.confidence === "unrated" && "Unrated Confidence"}
                                      </button>

                                    </div>

                                    {/* ── EXPANDABLE ONENOTE SCRATCHPAD DRAWER ── */}
                                    {isNotesOpen && (
                                      <div className="mt-3 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/90 animate-in fade-in duration-200">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                                            <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                                            <span>Personal OneNote Scratchpad & Mistake Log</span>
                                          </div>

                                          {/* Quick Insert Formatting Chips */}
                                          <div className="flex items-center gap-1 text-[10px]">
                                            <button
                                              onClick={() => handleAppendNoteTag(chapter.id, "📐 [Formula]:")}
                                              className="px-2 py-0.5 rounded bg-amber-200/70 text-amber-900 font-semibold hover:bg-amber-300"
                                            >
                                              + Formula
                                            </button>
                                            <button
                                              onClick={() => handleAppendNoteTag(chapter.id, "⚠️ [TCS Trap]:")}
                                              className="px-2 py-0.5 rounded bg-amber-200/70 text-amber-900 font-semibold hover:bg-amber-300"
                                            >
                                              + TCS Trap
                                            </button>
                                            <button
                                              onClick={() => handleAppendNoteTag(chapter.id, "🎯 [Key Rule]:")}
                                              className="px-2 py-0.5 rounded bg-amber-200/70 text-amber-900 font-semibold hover:bg-amber-300"
                                            >
                                              + Key Rule
                                            </button>
                                          </div>
                                        </div>

                                        <textarea
                                          value={p.notes || ""}
                                          onChange={(e) => updateProgress(chapter.id, { notes: e.target.value })}
                                          placeholder="Jot down personal shortcut formulas, tricky TCS question traps, recurring mistakes, or book page numbers..."
                                          rows={3}
                                          className="w-full text-xs font-mono p-2.5 rounded-lg bg-white border border-amber-300/80 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-slate-800 placeholder:text-slate-400 resize-y"
                                        />

                                        {/* Target Date Setter */}
                                        <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs">
                                          <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-amber-800" />
                                            <span className="text-[11px] text-amber-900 font-medium">Target Completion Date:</span>
                                            <input
                                              type="date"
                                              value={p.target_date || ""}
                                              onChange={(e) => updateProgress(chapter.id, { target_date: e.target.value })}
                                              className="text-xs px-2 py-1 rounded border border-amber-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                            />
                                          </div>

                                          <span className="text-[10px] text-amber-700 font-medium">
                                            Auto-saves instantly
                                          </span>
                                        </div>

                                        {chapter.default_tips && (
                                          <div className="mt-2 text-[11px] text-amber-800/90 bg-amber-100/60 p-2 rounded border border-amber-200/60">
                                            💡 <strong>SSCZone Expert Tip:</strong> {chapter.default_tips}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                  </div>
                                );
                              })}
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Bottom Subject Summary Bar */}
                <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                  <div>
                    Active Syllabus: <strong className="text-slate-800">{baseExam.title}</strong> • Notebook:{" "}
                    <strong className="text-slate-800">{activeSubject.name}</strong>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        activeSubjectChapters.forEach((c) => {
                          updateProgress(c.id, { theory_done: true });
                        });
                      }}
                      className="text-slate-600 hover:text-blue-600 font-medium underline"
                    >
                      Mark All Theory Done
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Reset progress for ${activeSubject.name}?`)) {
                          activeSubjectChapters.forEach((c) => {
                            updateProgress(c.id, {
                              theory_done: false,
                              practice_done: false,
                              revision_count: 0,
                              confidence: "unrated",
                            });
                          });
                        }
                      }}
                      className="text-slate-400 hover:text-red-500"
                    >
                      Reset Notebook
                    </button>
                  </div>
                </div>

              </section>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: KANBAN BOARD VIEW (TO START / IN PROGRESS / DONE)*/}
        {/* ======================================================== */}
        {viewMode === "kanban" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeSubject.name} — Progress Board
                </h3>
                <p className="text-xs text-slate-500">
                  Move chapters from To Start → In Progress → Mastered
                </p>
              </div>

              <button
                onClick={() => setShowAddCustomModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Chapter</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Column 1: To Start */}
              <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      To Start ({kanbanColumns.toStart.length})
                    </h4>
                  </div>
                </div>

                <div className="space-y-2.5 min-h-[400px]">
                  {kanbanColumns.toStart.map((ch) => (
                    <div key={ch.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-bold text-slate-900">{ch.name}</h5>
                        {ch.high_weightage && <Flame className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{ch.category}</p>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => handleToggleTheory(ch.id)}
                          className="text-[11px] text-blue-600 font-semibold hover:underline"
                        >
                          Start Theory →
                        </button>
                        <span className="text-[10px] text-slate-400">0%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: In Progress */}
              <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-200/80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                      In Progress ({kanbanColumns.inProgress.length})
                    </h4>
                  </div>
                </div>

                <div className="space-y-2.5 min-h-[400px]">
                  {kanbanColumns.inProgress.map((ch) => {
                    const p = progressMap[ch.id];
                    return (
                      <div key={ch.id} className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-900">{ch.name}</h5>
                          {ch.high_weightage && <Flame className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                          <span className={`px-1.5 py-0.5 rounded font-medium ${p?.theory_done ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                            Theory: {p?.theory_done ? "✓" : "–"}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded font-medium ${p?.practice_done ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-500"}`}>
                            PYQ: {p?.practice_done ? "✓" : "–"}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded font-medium ${(p?.revision_count || 0) > 0 ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-500"}`}>
                            Rev: {p?.revision_count || 0}x
                          </span>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <button
                            onClick={() => {
                              updateProgress(ch.id, {
                                theory_done: true,
                                practice_done: true,
                                revision_count: Math.max(1, p?.revision_count || 1),
                                confidence: "high",
                              });
                            }}
                            className="text-[11px] text-emerald-600 font-semibold hover:underline"
                          >
                            Mark Mastered →
                          </button>
                          <Link
                            href={`/speed-test?mode=topic&topicTitle=${encodeURIComponent(ch.practice_query)}`}
                            target="_blank"
                            className="text-[11px] text-blue-600 flex items-center gap-0.5"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Drill</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Column 3: Mastered */}
              <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                      Mastered ({kanbanColumns.mastered.length})
                    </h4>
                  </div>
                </div>

                <div className="space-y-2.5 min-h-[400px]">
                  {kanbanColumns.mastered.map((ch) => (
                    <div key={ch.id} className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-bold text-slate-900 line-through decoration-emerald-500">
                          {ch.name}
                        </h5>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                      </div>
                      <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                        ✓ All 3 Pillars Completed
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: DEADLINES & TARGETS VIEW                        */}
        {/* ======================================================== */}
        {viewMode === "deadlines" && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Target Completion Deadlines
                </h3>
                <p className="text-xs text-slate-500">
                  Chapters scheduled with specific target dates
                </p>
              </div>

              <button
                onClick={() => setShowAddCustomModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Target Chapter</span>
              </button>
            </div>

            {deadlineChapters.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No Target Dates Set</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Open any chapter in the OneNote Binder view and pick a &quot;Target Completion Date&quot; to track your exam schedule!
                </p>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {deadlineChapters.map((ch) => {
                  const p = progressMap[ch.id];
                  const isDone = p?.theory_done && p?.practice_done;

                  return (
                    <div key={ch.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold ${isDone ? "text-slate-500 line-through" : "text-slate-900"}`}>
                            {ch.name}
                          </h4>
                          <span className="text-xs text-slate-500">({ch.category})</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Scheduled for: <strong className="text-slate-700">{ch.targetDate}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {isDone ? (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
                            Completed ✓
                          </span>
                        ) : ch.isPast ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-red-100 text-red-700">
                            Overdue ({Math.abs(ch.daysDiff)} days ago)
                          </span>
                        ) : ch.daysDiff === 0 ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 animate-pulse">
                            Due Today!
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            Due in {ch.daysDiff} days
                          </span>
                        )}

                        <button
                          onClick={() => handleToggleTheory(ch.id)}
                          className="text-xs px-3 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 font-medium text-slate-700"
                        >
                          {p?.theory_done ? "Theory ✓" : "Mark Theory"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ── MODAL: ADD CUSTOM TOPIC / CHAPTER ── */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900">
                Add Custom Chapter to {activeSubject.name}
              </h3>
              <button onClick={() => setShowAddCustomModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Add coaching-specific topics, extra formulas, or custom mock revision areas.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chapter / Topic Name (English) *
                </label>
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="e.g. Successive Discount Advanced Variations"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hindi Name (Optional)
                </label>
                <input
                  type="text"
                  value={newTopicHindi}
                  onChange={(e) => setNewTopicHindi(e.target.value)}
                  placeholder="e.g. क्रमिक छूट अग्रिम प्रश्न"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category Section
                  </label>
                  <input
                    type="text"
                    value={newTopicCategory}
                    onChange={(e) => setNewTopicCategory(e.target.value)}
                    placeholder="e.g. Arithmetic, Special Focus"
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newTopicTargetDate}
                    onChange={(e) => setNewTopicTargetDate(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newTopicWeightage}
                  onChange={(e) => setNewTopicWeightage(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Mark as High Weightage Chapter 🔥
                </span>
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddCustomModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomTopic}
                disabled={!newTopicName.trim()}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-all"
              >
                Add Topic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD CUSTOM SUBJECT NOTEBOOK ── */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900">
                Create New Subject Notebook
              </h3>
              <button onClick={() => setShowAddSubjectModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Create a dedicated notebook tab (e.g. Current Affairs 2026, General Science Special, Statistics).
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notebook Name *
                </label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g. Current Affairs 2026 Special"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hindi Subtitle
                </label>
                <input
                  type="text"
                  value={newSubjectHindi}
                  onChange={(e) => setNewSubjectHindi(e.target.value)}
                  placeholder="e.g. समसामयिकी 2026"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Theme Color
                </label>
                <div className="flex items-center gap-2">
                  {(["rose", "blue", "purple", "emerald", "amber", "sky", "teal"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewSubjectColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        c === "rose" ? "bg-rose-500" :
                        c === "blue" ? "bg-blue-500" :
                        c === "purple" ? "bg-purple-500" :
                        c === "emerald" ? "bg-emerald-500" :
                        c === "amber" ? "bg-amber-500" :
                        c === "sky" ? "bg-sky-500" : "bg-teal-500"
                      } ${newSubjectColor === c ? "ring-2 ring-slate-900 ring-offset-2 scale-110" : "opacity-80 hover:opacity-100"}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notebook Description
                </label>
                <input
                  type="text"
                  value={newSubjectDesc}
                  onChange={(e) => setNewSubjectDesc(e.target.value)}
                  placeholder="e.g. Monthly sports, awards, summits & schemes"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddSubjectModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomSubject}
                disabled={!newSubjectName.trim()}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-all"
              >
                Create Notebook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ATTACH RESOURCE (YOUTUBE / PDF / DRIVE / LINK) ── */}
      {activeAttachmentChapter && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Attach Study Resource
                </h3>
              </div>
              <button onClick={() => setActiveAttachmentChapter(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Pin YouTube lectures, PDF sheets, or Drive links directly to this chapter.
            </p>

            <div className="space-y-3.5">
              {/* Resource Type Pills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Resource Type
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setAttachType("youtube")}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      attachType === "youtube" ? "bg-red-50 border-red-300 text-red-700 shadow-xs" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Youtube className="w-4 h-4 text-red-600" />
                    <span className="text-[10px]">YouTube</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttachType("pdf")}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      attachType === "pdf" ? "bg-blue-50 border-blue-300 text-blue-700 shadow-xs" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px]">PDF Notes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttachType("drive")}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      attachType === "drive" ? "bg-amber-50 border-amber-300 text-amber-700 shadow-xs" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Folder className="w-4 h-4 text-amber-600" />
                    <span className="text-[10px]">Google Drive</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttachType("link")}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      attachType === "link" ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Link2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px]">Web Link</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  value={attachTitle}
                  onChange={(e) => setAttachTitle(e.target.value)}
                  placeholder="e.g. Gagan Sir Percentages Marathon Class"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL / Link Address *
                </label>
                <input
                  type="url"
                  value={attachUrl}
                  onChange={(e) => setAttachUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or https://drive.google.com/..."
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveAttachmentChapter(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAttachment}
                disabled={!attachTitle.trim() || !attachUrl.trim()}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-all"
              >
                Attach Resource
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ARCHIVED / HIDDEN CHAPTERS RESTORE ── */}
      {showArchivedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Archived / Hidden Chapters ({hiddenChapterIds.length})
                </h3>
              </div>
              <button onClick={() => setShowArchivedModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Chapters you chose to hide from your active checklist. You can restore them anytime.
            </p>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {hiddenChapterIds.map((hid) => {
                // Find chapter name across all subjects
                let name = hid;
                for (const s of baseExam.subjects) {
                  const match = s.chapters.find((c) => c.id === hid);
                  if (match) {
                    name = match.name;
                    break;
                  }
                }

                return (
                  <div key={hid} className="p-2.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate mr-2">{name}</span>
                    <button
                      onClick={() => handleRestoreChapter(hid)}
                      className="text-xs text-purple-600 font-bold hover:underline shrink-0"
                    >
                      Restore
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={handleRestoreAllChapters}
                className="text-xs font-bold text-purple-700 hover:underline"
              >
                Restore All Chapters
              </button>
              <button
                onClick={() => setShowArchivedModal(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRINT STYLESHEET (CLEAN A4 SHEET) ── */}
      <style jsx global>{`
        @media print {
          nav, header, footer, aside, button, .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .max-w-7xl {
            max-width: 100% !important;
            padding: 0 !important;
          }
          main {
            padding: 0 !important;
          }
          .lg\\:col-span-8 {
            width: 100% !important;
          }
        }
      `}</style>

    </div>
  );
}
