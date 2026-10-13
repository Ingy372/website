// The ONE set of safety rules, shown on /facility, /birthday-parties, and
// /faq (SafetyRules.astro, and the FAQ "Is it safe?" answer).
// Confirmed rules are restated from what the site already says or Jay has
// confirmed. Add a rule here only once it is confirmed.
// Per the brief: do not add "background-checked instructors" or other
// privacy/data claims; the client removed those deliberately.

export const safetyRules: string[] = [
  "Every class is led and supervised by our instructors, at a level right for each student's age and rank.",
  "Beginners do not spar. We teach control long before we teach contact.",
  "The throwing wall is used only under close instructor supervision.",
  "Parents are always welcome to watch class.",
  // Confirmed by Jay: a parent supervises siblings on the outdoor playground.
  "Siblings can play on our outdoor playground with a parent supervising.",
];

// Party version for /birthday-parties: only what is confirmed for parties.
export const partySafetyRules: string[] = [
  "Every party activity is run and supervised by our instructors.",
  "The throwing wall is used only under close instructor supervision.",
  "The sword cake cut is guided by an instructor every step of the way.",
];
