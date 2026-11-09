// FAQ entries are written once and used twice: rendered by FAQGroup.astro
// and emitted as schema.org FAQPage data by BaseLayout (`faq` prop).
// Answers may hold simple HTML (links, <strong>, lists); the structured data
// gets plain text.

export interface FaqItem {
  question: string;
  answer: string[];
}

const decode = (s: string) =>
  s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

export const toPlainText = (html: string) =>
  decode(html.replace(/<li>/g, "• ").replace(/<\/li>/g, " ").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((qa) => ({
      "@type": "Question",
      name: qa.question,
      acceptedAnswer: { "@type": "Answer", text: qa.answer.map(toPlainText).join(" ") },
    })),
  };
}
