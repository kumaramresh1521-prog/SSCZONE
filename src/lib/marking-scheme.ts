export interface MarkingScheme {
  positive: number;
  negative: number;
  maxMarks: number;
}

interface MarkingSchemeInput {
  paperTitle?: string | null;
  examTitle?: string | null;
  questionCount?: number | null;
}

/**
 * Standard SSC marking schemes.
 *
 * CGL Tier 1   : +2.00 / -0.50  (100 Q, 200 marks)
 * CGL Tier 2   : +3.00 / -1.00  (130 Q, 390 marks)
 * CHSL Tier 1  : +2.00 / -0.50  (100 Q, 200 marks)
 * CPO          : +1.00 / -0.25  (200 Q, 200 marks)
 * MTS          : +3.00 /  0.00  (no negative marking, 90 Q, 270 marks)
 * GD Constable : +2.00 / -0.25  (80 Q, 160 marks)
 * Stenographer : +1.00 / -0.25  (200 Q, 200 marks)
 * Selection Post: +2.00 / -0.50 (100 Q, 200 marks)
 *
 * maxMarks is derived from the actual question count so partial papers and
 * per-session MTS papers (120 / 150) also show the correct total.
 */
export function getMarkingScheme({
  paperTitle,
  examTitle,
  questionCount,
}: MarkingSchemeInput): MarkingScheme {
  const paper = (paperTitle || "").toLowerCase();
  const exam = (examTitle || "").toLowerCase();
  const count = Math.max(0, Number(questionCount) || 0);

  const build = (
    positive: number,
    negative: number,
    officialMaxMarks: number
  ): MarkingScheme => ({
    positive,
    negative,
    maxMarks:
      count > 0 ? Number((count * positive).toFixed(2)) : officialMaxMarks,
  });

  const isCgl = exam.includes("ssc cgl") || paper.startsWith("ssc cgl");
  const isSscMts = exam.includes("ssc mts") || paper.startsWith("ssc mts");
  const isSscGd =
    exam.includes("ssc gd") ||
    paper.startsWith("ssc gd") ||
    paper.includes("gd constable");
  const isCpo = exam.includes("ssc cpo") || paper.startsWith("ssc cpo");
  const isChsl = exam.includes("ssc chsl") || paper.startsWith("ssc chsl");
  const isSteno = exam.includes("steno") || paper.includes("steno");
  const isSelectionPost =
    exam.includes("selection post") || paper.includes("selection post");

  // CGL Tier 2 / Mains (must be checked before the generic CGL Tier 1 rule)
  const isTier2 =
    paper.includes("tier-ii") ||
    paper.includes("tier-2") ||
    paper.includes("tier 2") ||
    (isCgl && paper.includes("mains"));

  if (isTier2) return build(3, 1, 390);

  // SSC MTS: 3 marks per correct answer, NO negative marking.
  if (isSscMts) return build(3, 0, 270);

  // SSC GD Constable: +2 / -0.25, 160 marks.
  if (isSscGd) return build(2, 0.25, 160);

  // SSC CPO: +1 / -0.25, 200 marks.
  if (isCpo) return build(1, 0.25, 200);

  // SSC CHSL Tier 1: +2 / -0.5, 200 marks.
  if (isChsl) return build(2, 0.5, 200);

  // SSC Stenographer: +1 / -0.25, 200 marks.
  if (isSteno) return build(1, 0.25, 200);

  // SSC Selection Post: +2 / -0.5, 200 marks.
  if (isSelectionPost) return build(2, 0.5, 200);

  // SSC CGL Tier 1 and any other CGL paper: +2 / -0.5, 200 marks.
  if (isCgl) return build(2, 0.5, 200);

  // Unknown exam: preserve the previous default behaviour.
  return build(2, 0.5, 200);
}
