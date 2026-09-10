import { Requirement, Question, Schedule, ScheduleDay } from "@/lib/validation/kitSchema";

export function allocateSchedule(
  requirements: Requirement[],
  questions: Question[],
  daysAvailable: number
): Schedule {
  if (!Number.isInteger(daysAvailable) || daysAvailable < 1 || daysAvailable > 60) {
    throw new Error(`days_available must be an integer between 1 and 60. Got: ${daysAvailable}`);
  }

  const totalDays = daysAvailable;

  if (questions.length === 0) {
    const emptyDays: ScheduleDay[] = [];
    for (let i = 1; i <= totalDays; i++) {
      emptyDays.push({
        day: i,
        focus: `Day ${i}: General Prep & Review`,
        question_ids: [],
        minutes: 30,
      });
    }
    return { days_available: totalDays, days: emptyDays };
  }

  // Create requirement priority map
  const reqPriorityMap = new Map<string, "must" | "nice">();
  requirements.forEach((req) => reqPriorityMap.set(req.id, req.priority));

  // Score questions for priority sorting (higher score = earlier in schedule)
  const scoredQuestions = questions.map((q) => {
    let priorityScore = 0;
    // Check if linked to any MUST requirement
    const hasMustReq = q.requirement_ids.some(
      (reqId) => reqPriorityMap.get(reqId) === "must"
    );
    if (hasMustReq) priorityScore += 10;

    // Difficulty score: 3 (Hard) -> +5, 2 (Medium) -> +3, 1 (Easy) -> +1
    priorityScore += q.difficulty * 2;

    return {
      question: q,
      score: priorityScore,
    };
  });

  // Sort questions descending by score so harder & must-have questions land earlier
  scoredQuestions.sort((a, b) => b.score - a.score);

  // Initialize schedule days array
  const days: ScheduleDay[] = Array.from({ length: totalDays }, (_, i) => ({
    day: i + 1,
    focus: "",
    question_ids: [],
    minutes: 0,
  }));

  // Distribute questions across available days using round-robin / bucket allocation
  scoredQuestions.forEach((item, index) => {
    const dayIndex = index % totalDays;
    days[dayIndex].question_ids.push(item.question.id);
  });

  // Ensure every day has a descriptive focus and integer minutes
  const categoryFocusMap: Record<string, string> = {
    technical: "Core Technical Concepts & Problem Solving",
    "system-design": "System Design Architecture & Scalability",
    behavioural: "Behavioural Interview Scenarios & Soft Skills",
    "company-fit": "Company Culture, Values & Role Alignment",
  };

  days.forEach((day) => {
    if (day.question_ids.length === 0) {
      day.focus = `Day ${day.day}: Review & Mock Practice`;
      day.minutes = 30;
    } else {
      // Find predominant category for the day
      const dayQuestions = questions.filter((q) => day.question_ids.includes(q.id));
      const categoryCounts: Record<string, number> = {};
      let totalEstMinutes = 0;

      dayQuestions.forEach((q) => {
        categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
        // Allocate ~15-25 minutes per question based on difficulty
        totalEstMinutes += (q.difficulty || 2) * 15;
      });

      const topCategory = Object.entries(categoryCounts).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0];

      day.focus =
        categoryFocusMap[topCategory] || `Day ${day.day}: Focused Study & Problem Solving`;
      day.minutes = Math.max(30, Math.round(totalEstMinutes));
    }
  });

  return {
    days_available: totalDays,
    days,
  };
}
