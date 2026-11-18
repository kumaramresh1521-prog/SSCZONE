// Auto-generated SEO Paper Slugs Mapping for SSCZone
// Provides high-performance, collision-free bidirectional lookup between numeric paper IDs and readable SEO slugs.

export function slugifyPaperTitle(title: string, year?: number | string): string {
  if (!title) return `paper-${year || 2025}`;

  let s = title.toLowerCase();

  s = s.replace(/tier[- ]?i\b/g, 'tier-1');
  s = s.replace(/tier[- ]?ii\b/g, 'tier-2');
  s = s.replace(/\(held on\s+/g, '');
  s = s.replace(/\bheld on\s+/g, '');
  s = s.replace(/[\(\)]/g, ' ');
  s = s.replace(/\bshift\s*(\d+)/g, 'shift-$1');
  s = s.replace(/\bsept\b/g, 'september');
  s = s.replace(/\baug\b/g, 'august');
  s = s.replace(/\boct\b/g, 'october');
  s = s.replace(/\bnov\b/g, 'november');
  s = s.replace(/\bdec\b/g, 'december');
  s = s.replace(/\bjan\b/g, 'january');
  s = s.replace(/\bfeb\b/g, 'february');
  s = s.replace(/\bmar\b/g, 'march');
  s = s.replace(/\bapr\b/g, 'april');

  return s
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const PAPER_ID_TO_SLUG: Record<number, string> = {
  "1": "ssc-cgl-2025-tier-1-12-september-2025-shift-1",
  "4": "ssc-cgl-2025-tier-1-12-september-2025-shift-2",
  "5": "ssc-cgl-2025-tier-1-12-september-2025-shift-3",
  "6": "ssc-cgl-2025-tier-1-13-september-2025-shift-1",
  "7": "ssc-cgl-2025-tier-1-13-september-2025-shift-2",
  "8": "ssc-cgl-2025-tier-1-13-september-2025-shift-3",
  "9": "ssc-cgl-2025-tier-1-14-september-2025-shift-1",
  "10": "ssc-cgl-2025-tier-1-14-september-2025-shift-2",
  "11": "ssc-cgl-2025-tier-1-14-september-2025-shift-3",
  "12": "ssc-cgl-2025-tier-1-15-september-2025-shift-1",
  "13": "ssc-cgl-2025-tier-1-15-september-2025-shift-2",
  "14": "ssc-cgl-2025-tier-1-15-september-2025-shift-3",
  "15": "ssc-cgl-2025-tier-1-16-september-2025-shift-1",
  "16": "ssc-cgl-2025-tier-1-16-september-2025-shift-2",
  "17": "ssc-cgl-2025-tier-1-16-september-2025-shift-3",
  "18": "ssc-cgl-2025-tier-1-17-september-2025-shift-1",
  "19": "ssc-cgl-2025-tier-1-17-september-2025-shift-2",
  "20": "ssc-cgl-2025-tier-1-17-september-2025-shift-3",
  "21": "ssc-cgl-2025-tier-1-18-september-2025-shift-1",
  "22": "ssc-cgl-2025-tier-1-18-september-2025-shift-2",
  "23": "ssc-cgl-2025-tier-1-18-september-2025-shift-3",
  "25": "ssc-cgl-2026-tier-1-30-september-2026-shift-2",
  "26": "ssc-cgl-2026-tier-1-30-september-2026-shift-3",
  "27": "ssc-cgl-2026-tier-1-1-october-2026-shift-1",
  "28": "ssc-cgl-2026-tier-1-1-october-2026-shift-2",
  "29": "ssc-cgl-2026-tier-1-1-october-2026-shift-3",
  "30": "ssc-cgl-2026-tier-1-5-october-2026-shift-1",
  "31": "ssc-cgl-2026-tier-1-5-october-2026-shift-2",
  "32": "ssc-cgl-2026-tier-1-5-october-2026-shift-3",
  "33": "ssc-cgl-2026-tier-1-6-october-2026-shift-1",
  "34": "ssc-cgl-2026-tier-1-6-october-2026-shift-2",
  "35": "ssc-cgl-2026-tier-1-6-october-2026-shift-3",
  "36": "ssc-cgl-2026-tier-1-7-october-2026-shift-1",
  "37": "ssc-cgl-2026-tier-1-7-october-2026-shift-2",
  "38": "ssc-cgl-2026-tier-1-7-october-2026-shift-3",
  "39": "ssc-cgl-2026-tier-1-8-october-2026-shift-1",
  "40": "ssc-cgl-2026-tier-1-8-october-2026-shift-2",
  "41": "ssc-cgl-2026-tier-1-8-october-2026-shift-3",
  "42": "ssc-cgl-2026-tier-1-9-october-2026-shift-1",
  "43": "ssc-cgl-2026-tier-1-9-october-2026-shift-2",
  "44": "ssc-cgl-2026-tier-1-9-october-2026-shift-3",
  "45": "ssc-cgl-2026-tier-1-10-october-2026-shift-1",
  "46": "ssc-cgl-2026-tier-1-10-october-2026-shift-2",
  "47": "ssc-cgl-2026-tier-1-10-october-2026-shift-3",
  "48": "ssc-cgl-2026-tier-1-12-october-2026-shift-1",
  "49": "ssc-cgl-2026-tier-1-12-october-2026-shift-2",
  "50": "ssc-cgl-2026-tier-1-12-october-2026-shift-3",
  "51": "ssc-cgl-2026-tier-1-13-october-2026-shift-1",
  "52": "ssc-cgl-2026-tier-1-13-october-2026-shift-2",
  "53": "ssc-cgl-2026-tier-1-13-october-2026-shift-3",
  "58": "ssc-cgl-2024-tier-1-18-september-2024-shift-3",
  "59": "ssc-cgl-2024-tier-1-9-september-2024-shift-1",
  "60": "ssc-cgl-2024-tier-1-9-september-2024-shift-2",
  "61": "ssc-cgl-2024-tier-1-9-september-2024-shift-3",
  "62": "ssc-cgl-2024-tier-1-10-september-2024-shift-1",
  "63": "ssc-cgl-2024-tier-1-10-september-2024-shift-2",
  "64": "ssc-cgl-2024-tier-1-10-september-2024-shift-3",
  "65": "ssc-cgl-2024-tier-1-11-september-2024-shift-1",
  "66": "ssc-cgl-2024-tier-1-11-september-2024-shift-2",
  "67": "ssc-cgl-2024-tier-1-11-september-2024-shift-3",
  "68": "ssc-cgl-2024-tier-1-12-september-2024-shift-1",
  "69": "ssc-cgl-2024-tier-1-12-september-2024-shift-2",
  "70": "ssc-cgl-2024-tier-1-12-september-2024-shift-3",
  "71": "ssc-cgl-2024-tier-1-13-september-2024-shift-1",
  "72": "ssc-cgl-2024-tier-1-13-september-2024-shift-2",
  "73": "ssc-cgl-2024-tier-1-13-september-2024-shift-3",
  "74": "ssc-cgl-2024-tier-1-17-september-2024-shift-1",
  "75": "ssc-cgl-2024-tier-1-17-september-2024-shift-2",
  "76": "ssc-cgl-2024-tier-1-17-september-2024-shift-3",
  "77": "ssc-cgl-2024-tier-1-18-september-2024-shift-1",
  "78": "ssc-cgl-2024-tier-1-18-september-2024-shift-2",
  "79": "ssc-cgl-2024-tier-1-19-september-2024-shift-1",
  "80": "ssc-cgl-2024-tier-1-19-september-2024-shift-2",
  "81": "ssc-cgl-2024-tier-1-19-september-2024-shift-3",
  "82": "ssc-cgl-2024-tier-1-23-september-2024-shift-1",
  "83": "ssc-cgl-2024-tier-1-23-september-2024-shift-2",
  "84": "ssc-cgl-2024-tier-1-23-september-2024-shift-3",
  "85": "ssc-cgl-2024-tier-1-24-september-2024-shift-1",
  "86": "ssc-cgl-2024-tier-1-24-september-2024-shift-2",
  "87": "ssc-cgl-2024-tier-1-24-september-2024-shift-3",
  "88": "ssc-cgl-2024-tier-1-25-september-2024-shift-1",
  "89": "ssc-cgl-2024-tier-1-25-september-2024-shift-2",
  "90": "ssc-cgl-2024-tier-1-25-september-2024-shift-3",
  "91": "ssc-cgl-2024-tier-1-26-september-2024-shift-1",
  "92": "ssc-cgl-2024-tier-1-26-september-2024-shift-2",
  "93": "ssc-cgl-2024-tier-1-26-september-2024-shift-3",
  "94": "ssc-cgl-2023-tier-1-25-july-2023-shift-4",
  "95": "ssc-cgl-2023-tier-1-21-july-2023-shift-1",
  "96": "ssc-cgl-2023-tier-1-14-july-2023-shift-2",
  "97": "ssc-cgl-2023-tier-1-26-july-2023-shift-1",
  "98": "ssc-cgl-2023-tier-1-25-july-2023-shift-3",
  "99": "ssc-cgl-2023-tier-1-26-july-2023-shift-3",
  "100": "ssc-cgl-2023-tier-1-27-july-2023-shift-1",
  "101": "ssc-cgl-2023-tier-1-27-july-2023-shift-2",
  "102": "ssc-cgl-2023-tier-1-27-july-2023-shift-3",
  "103": "ssc-cgl-2023-tier-1-14-july-2023-shift-1",
  "104": "ssc-cgl-2023-tier-1-26-july-2023-shift-4",
  "105": "ssc-cgl-2023-tier-1-26-july-2023-shift-2",
  "106": "ssc-cgl-2023-tier-1-25-july-2023-shift-2",
  "107": "ssc-cgl-2023-tier-1-25-july-2023-shift-1",
  "108": "ssc-cgl-2023-tier-1-18-july-2023-shift-2",
  "109": "ssc-cgl-2023-tier-1-17-july-2023-shift-2",
  "110": "ssc-cgl-2023-tier-1-20-july-2023-shift-1",
  "111": "ssc-cgl-2023-tier-1-19-july-2023-shift-3",
  "112": "ssc-cgl-2023-tier-1-18-july-2023-shift-4",
  "113": "ssc-cgl-2023-tier-1-24-july-2023-shift-3",
  "114": "ssc-cgl-2023-tier-1-24-july-2023-shift-2",
  "115": "ssc-cgl-2023-tier-1-21-july-2023-shift-2",
  "116": "ssc-cgl-2023-tier-1-19-july-2023-shift-4",
  "117": "ssc-cgl-2023-tier-1-17-july-2023-shift-3",
  "118": "ssc-cgl-2023-tier-1-14-july-2023-shift-3",
  "119": "ssc-cgl-2023-tier-1-21-july-2023-shift-3",
  "120": "ssc-cgl-2023-tier-1-24-july-2023-shift-4",
  "121": "ssc-cgl-2023-tier-1-21-july-2023-shift-4",
  "122": "ssc-cgl-2023-tier-1-20-july-2023-shift-4",
  "123": "ssc-cgl-2023-tier-1-17-july-2023-shift-4",
  "124": "ssc-cgl-2023-tier-1-20-july-2023-shift-2",
  "125": "ssc-cgl-2023-tier-1-14-july-2023-shift-4",
  "126": "ssc-cgl-2023-tier-1-18-july-2023-shift-3",
  "127": "ssc-cgl-2023-tier-1-24-july-2023-shift-1",
  "128": "ssc-cgl-2023-tier-1-19-july-2023-shift-2",
  "129": "ssc-cgl-2023-tier-1-18-july-2023-shift-1",
  "130": "ssc-cgl-2023-tier-1-20-july-2023-shift-3",
  "131": "ssc-cgl-2023-tier-1-17-july-2023-shift-1",
  "132": "ssc-cgl-2023-tier-1-19-july-2023-shift-1"
};

export const PAPER_SLUG_TO_ID: Record<string, number> = {
  "ssc-cgl-2025-tier-1-12-september-2025-shift-1": 1,
  "ssc-cgl-2025-tier-1-12-september-2025-shift-2": 4,
  "ssc-cgl-2025-tier-1-12-september-2025-shift-3": 5,
  "ssc-cgl-2025-tier-1-13-september-2025-shift-1": 6,
  "ssc-cgl-2025-tier-1-13-september-2025-shift-2": 7,
  "ssc-cgl-2025-tier-1-13-september-2025-shift-3": 8,
  "ssc-cgl-2025-tier-1-14-september-2025-shift-1": 9,
  "ssc-cgl-2025-tier-1-14-september-2025-shift-2": 10,
  "ssc-cgl-2025-tier-1-14-september-2025-shift-3": 11,
  "ssc-cgl-2025-tier-1-15-september-2025-shift-1": 12,
  "ssc-cgl-2025-tier-1-15-september-2025-shift-2": 13,
  "ssc-cgl-2025-tier-1-15-september-2025-shift-3": 14,
  "ssc-cgl-2025-tier-1-16-september-2025-shift-1": 15,
  "ssc-cgl-2025-tier-1-16-september-2025-shift-2": 16,
  "ssc-cgl-2025-tier-1-16-september-2025-shift-3": 17,
  "ssc-cgl-2025-tier-1-17-september-2025-shift-1": 18,
  "ssc-cgl-2025-tier-1-17-september-2025-shift-2": 19,
  "ssc-cgl-2025-tier-1-17-september-2025-shift-3": 20,
  "ssc-cgl-2025-tier-1-18-september-2025-shift-1": 21,
  "ssc-cgl-2025-tier-1-18-september-2025-shift-2": 22,
  "ssc-cgl-2025-tier-1-18-september-2025-shift-3": 23,
  "ssc-cgl-2026-tier-1-30-september-2026-shift-2": 25,
  "ssc-cgl-2026-tier-1-30-september-2026-shift-3": 26,
  "ssc-cgl-2026-tier-1-1-october-2026-shift-1": 27,
  "ssc-cgl-2026-tier-1-1-october-2026-shift-2": 28,
  "ssc-cgl-2026-tier-1-1-october-2026-shift-3": 29,
  "ssc-cgl-2026-tier-1-5-october-2026-shift-1": 30,
  "ssc-cgl-2026-tier-1-5-october-2026-shift-2": 31,
  "ssc-cgl-2026-tier-1-5-october-2026-shift-3": 32,
  "ssc-cgl-2026-tier-1-6-october-2026-shift-1": 33,
  "ssc-cgl-2026-tier-1-6-october-2026-shift-2": 34,
  "ssc-cgl-2026-tier-1-6-october-2026-shift-3": 35,
  "ssc-cgl-2026-tier-1-7-october-2026-shift-1": 36,
  "ssc-cgl-2026-tier-1-7-october-2026-shift-2": 37,
  "ssc-cgl-2026-tier-1-7-october-2026-shift-3": 38,
  "ssc-cgl-2026-tier-1-8-october-2026-shift-1": 39,
  "ssc-cgl-2026-tier-1-8-october-2026-shift-2": 40,
  "ssc-cgl-2026-tier-1-8-october-2026-shift-3": 41,
  "ssc-cgl-2026-tier-1-9-october-2026-shift-1": 42,
  "ssc-cgl-2026-tier-1-9-october-2026-shift-2": 43,
  "ssc-cgl-2026-tier-1-9-october-2026-shift-3": 44,
  "ssc-cgl-2026-tier-1-10-october-2026-shift-1": 45,
  "ssc-cgl-2026-tier-1-10-october-2026-shift-2": 46,
  "ssc-cgl-2026-tier-1-10-october-2026-shift-3": 47,
  "ssc-cgl-2026-tier-1-12-october-2026-shift-1": 48,
  "ssc-cgl-2026-tier-1-12-october-2026-shift-2": 49,
  "ssc-cgl-2026-tier-1-12-october-2026-shift-3": 50,
  "ssc-cgl-2026-tier-1-13-october-2026-shift-1": 51,
  "ssc-cgl-2026-tier-1-13-october-2026-shift-2": 52,
  "ssc-cgl-2026-tier-1-13-october-2026-shift-3": 53,
  "ssc-cgl-2024-tier-1-18-september-2024-shift-3": 58,
  "ssc-cgl-2024-tier-1-9-september-2024-shift-1": 59,
  "ssc-cgl-2024-tier-1-9-september-2024-shift-2": 60,
  "ssc-cgl-2024-tier-1-9-september-2024-shift-3": 61,
  "ssc-cgl-2024-tier-1-10-september-2024-shift-1": 62,
  "ssc-cgl-2024-tier-1-10-september-2024-shift-2": 63,
  "ssc-cgl-2024-tier-1-10-september-2024-shift-3": 64,
  "ssc-cgl-2024-tier-1-11-september-2024-shift-1": 65,
  "ssc-cgl-2024-tier-1-11-september-2024-shift-2": 66,
  "ssc-cgl-2024-tier-1-11-september-2024-shift-3": 67,
  "ssc-cgl-2024-tier-1-12-september-2024-shift-1": 68,
  "ssc-cgl-2024-tier-1-12-september-2024-shift-2": 69,
  "ssc-cgl-2024-tier-1-12-september-2024-shift-3": 70,
  "ssc-cgl-2024-tier-1-13-september-2024-shift-1": 71,
  "ssc-cgl-2024-tier-1-13-september-2024-shift-2": 72,
  "ssc-cgl-2024-tier-1-13-september-2024-shift-3": 73,
  "ssc-cgl-2024-tier-1-17-september-2024-shift-1": 74,
  "ssc-cgl-2024-tier-1-17-september-2024-shift-2": 75,
  "ssc-cgl-2024-tier-1-17-september-2024-shift-3": 76,
  "ssc-cgl-2024-tier-1-18-september-2024-shift-1": 77,
  "ssc-cgl-2024-tier-1-18-september-2024-shift-2": 78,
  "ssc-cgl-2024-tier-1-19-september-2024-shift-1": 79,
  "ssc-cgl-2024-tier-1-19-september-2024-shift-2": 80,
  "ssc-cgl-2024-tier-1-19-september-2024-shift-3": 81,
  "ssc-cgl-2024-tier-1-23-september-2024-shift-1": 82,
  "ssc-cgl-2024-tier-1-23-september-2024-shift-2": 83,
  "ssc-cgl-2024-tier-1-23-september-2024-shift-3": 84,
  "ssc-cgl-2024-tier-1-24-september-2024-shift-1": 85,
  "ssc-cgl-2024-tier-1-24-september-2024-shift-2": 86,
  "ssc-cgl-2024-tier-1-24-september-2024-shift-3": 87,
  "ssc-cgl-2024-tier-1-25-september-2024-shift-1": 88,
  "ssc-cgl-2024-tier-1-25-september-2024-shift-2": 89,
  "ssc-cgl-2024-tier-1-25-september-2024-shift-3": 90,
  "ssc-cgl-2024-tier-1-26-september-2024-shift-1": 91,
  "ssc-cgl-2024-tier-1-26-september-2024-shift-2": 92,
  "ssc-cgl-2024-tier-1-26-september-2024-shift-3": 93,
  "ssc-cgl-2023-tier-1-25-july-2023-shift-4": 94,
  "ssc-cgl-2023-tier-1-21-july-2023-shift-1": 95,
  "ssc-cgl-2023-tier-1-14-july-2023-shift-2": 96,
  "ssc-cgl-2023-tier-1-26-july-2023-shift-1": 97,
  "ssc-cgl-2023-tier-1-25-july-2023-shift-3": 98,
  "ssc-cgl-2023-tier-1-26-july-2023-shift-3": 99,
  "ssc-cgl-2023-tier-1-27-july-2023-shift-1": 100,
  "ssc-cgl-2023-tier-1-27-july-2023-shift-2": 101,
  "ssc-cgl-2023-tier-1-27-july-2023-shift-3": 102,
  "ssc-cgl-2023-tier-1-14-july-2023-shift-1": 103,
  "ssc-cgl-2023-tier-1-26-july-2023-shift-4": 104,
  "ssc-cgl-2023-tier-1-26-july-2023-shift-2": 105,
  "ssc-cgl-2023-tier-1-25-july-2023-shift-2": 106,
  "ssc-cgl-2023-tier-1-25-july-2023-shift-1": 107,
  "ssc-cgl-2023-tier-1-18-july-2023-shift-2": 108,
  "ssc-cgl-2023-tier-1-17-july-2023-shift-2": 109,
  "ssc-cgl-2023-tier-1-20-july-2023-shift-1": 110,
  "ssc-cgl-2023-tier-1-19-july-2023-shift-3": 111,
  "ssc-cgl-2023-tier-1-18-july-2023-shift-4": 112,
  "ssc-cgl-2023-tier-1-24-july-2023-shift-3": 113,
  "ssc-cgl-2023-tier-1-24-july-2023-shift-2": 114,
  "ssc-cgl-2023-tier-1-21-july-2023-shift-2": 115,
  "ssc-cgl-2023-tier-1-19-july-2023-shift-4": 116,
  "ssc-cgl-2023-tier-1-17-july-2023-shift-3": 117,
  "ssc-cgl-2023-tier-1-14-july-2023-shift-3": 118,
  "ssc-cgl-2023-tier-1-21-july-2023-shift-3": 119,
  "ssc-cgl-2023-tier-1-24-july-2023-shift-4": 120,
  "ssc-cgl-2023-tier-1-21-july-2023-shift-4": 121,
  "ssc-cgl-2023-tier-1-20-july-2023-shift-4": 122,
  "ssc-cgl-2023-tier-1-17-july-2023-shift-4": 123,
  "ssc-cgl-2023-tier-1-20-july-2023-shift-2": 124,
  "ssc-cgl-2023-tier-1-14-july-2023-shift-4": 125,
  "ssc-cgl-2023-tier-1-18-july-2023-shift-3": 126,
  "ssc-cgl-2023-tier-1-24-july-2023-shift-1": 127,
  "ssc-cgl-2023-tier-1-19-july-2023-shift-2": 128,
  "ssc-cgl-2023-tier-1-18-july-2023-shift-1": 129,
  "ssc-cgl-2023-tier-1-20-july-2023-shift-3": 130,
  "ssc-cgl-2023-tier-1-17-july-2023-shift-1": 131,
  "ssc-cgl-2023-tier-1-19-july-2023-shift-1": 132
};

/**
 * Returns the canonical SEO slug for a paper.
 * Falls back to dynamic slugify if not in static pre-compiled map.
 */
export function getPaperSlug(paper: { id: number; title?: string; year?: number | string }): string {
  if (!paper) return '';
  if (PAPER_ID_TO_SLUG[paper.id]) {
    return PAPER_ID_TO_SLUG[paper.id];
  }
  if (paper.title) {
    return slugifyPaperTitle(paper.title, paper.year);
  }
  return String(paper.id);
}

/**
 * Resolves a paper identifier (which can be either a numeric ID like '58' or an SEO slug like 'ssc-cgl-2024-tier-1-18-september-2024-shift-3').
 * Returns the resolved numeric paper ID.
 */
export function resolvePaperId(param: string | number): number | null {
  if (!param) return null;
  const str = String(param).trim();

  // If purely numeric, return integer
  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  // Check slug dictionary
  if (PAPER_SLUG_TO_ID[str]) {
    return PAPER_SLUG_TO_ID[str];
  }

  // Partial match or suffix match
  const lower = str.toLowerCase();
  for (const [slug, id] of Object.entries(PAPER_SLUG_TO_ID)) {
    if (slug === lower || slug.endsWith(lower) || lower.endsWith(slug)) {
      return id;
    }
  }

  return null;
}
