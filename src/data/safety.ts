// The ONE set of safety rules, shown on /facility, /birthday-parties, /faq,
// and Home (SafetyRules.astro, and the FAQ "Is it safe?" answer).
// Confirmed rules are restated from what the site already says; anything
// not yet confirmed is a TODO(JAY) and renders as a marker until filled in.
// Per the brief: do not add "background-checked instructors" or other
// privacy/data claims; the client removed those deliberately.

import { todo } from "./business";

export const safetyRules: string[] = [
  "Every class is led and supervised by our instructors, at a level right for each student's age and rank.",
  "Beginners do not spar. We teach control long before we teach contact.",
  "The throwing wall is used only under close instructor supervision.",
  "At birthday parties, an instructor guides the birthday child through every move of the sword cake cutting.",
  "Parents are always welcome to watch class.",
  todo("outdoor playground and trampoline rule: who supervises siblings and guests outside"),
  todo("any other rule to state, e.g. waiver, first aid, or student-to-instructor ratio; delete this line if none"),
];
