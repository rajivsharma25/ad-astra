export type WorkspaceDocument = {
  id: string;
  name: string;
  type: "PDF" | "DOCX" | "TXT" | "CSV";
  size: string;
  updatedAt: string;
  category: string;
  excerpt: string;
  localOnly?: boolean;
};

export const initialDocuments: WorkspaceDocument[] = [
  { id: "brand-voice", name: "Brand voice guidelines.pdf", type: "PDF", size: "2.4 MB", updatedAt: "Oct 8, 2026", category: "Brand & marketing", excerpt: "A practical guide to the Ad Astra voice: clear, warm, thoughtful, and never in a hurry. Use plain language, offer useful next steps, and leave room for the reader to think." },
  { id: "launch-brief", name: "Q3 launch brief.docx", type: "DOCX", size: "842 KB", updatedAt: "Oct 7, 2026", category: "Product", excerpt: "The Q3 launch introduces a shared AI workspace for focused teams. Initial goals include a guided first session, reusable team prompts, and a small cohort of early users." },
  { id: "interview-notes", name: "Customer interview notes.txt", type: "TXT", size: "18 KB", updatedAt: "Oct 5, 2026", category: "Research", excerpt: "Participants value having a calm place to work through unfinished ideas. Several described switching between notes, chat, and shared docs as a source of friction." },
  { id: "usage-snapshot", name: "Usage snapshot.csv", type: "CSV", size: "64 KB", updatedAt: "Oct 2, 2026", category: "Analytics", excerpt: "A sample usage export with weekly active workspaces, returning users, and messages per workspace. This is demonstration data for the UI." },
];

export type PromptCategory = "Coding" | "Writing" | "Career" | "Marketing" | "Productivity" | "Education";

export type WorkspacePrompt = {
  id: string;
  title: string;
  description: string;
  category: PromptCategory;
  content: string;
  favorite: boolean;
};

export const promptCategories: PromptCategory[] = ["Coding", "Writing", "Career", "Marketing", "Productivity", "Education"];

export const initialPrompts: WorkspacePrompt[] = [
  { id: "clear-writing", title: "Make this clearer", description: "Turn a rough draft into a clear, natural message.", category: "Writing", content: "Rewrite this to be clear, warm, and concise. Keep my meaning and voice.\n\nDraft:\n[Paste your draft]", favorite: true },
  { id: "weekly-focus", title: "Plan a focused week", description: "Choose priorities while leaving room for deep work.", category: "Productivity", content: "Help me plan a realistic week. Ask about my fixed commitments, then suggest three priorities and protected focus blocks. Leave breathing room.\n\nMy commitments and tasks:\n[Add details]", favorite: true },
  { id: "launch-message", title: "Find the launch story", description: "Shape product details into a useful customer story.", category: "Marketing", content: "Help me explain this product launch in a customer-centered way. Identify the audience, the problem, the promise, and one proof point. Avoid hype.\n\nProduct details:\n[Add details]", favorite: false },
  { id: "debug-companion", title: "Debug with me", description: "Work through a bug step by step without guessing.", category: "Coding", content: "Help me debug this issue. First restate what the code should do, then inspect the error and propose the smallest testable fix. Ask for missing context instead of guessing.\n\nCode and error:\n[Paste here]", favorite: false },
  { id: "interview-prep", title: "Practice an interview", description: "Build confidence with a focused practice round.", category: "Career", content: "Run a short interview practice for this role. Ask one question at a time, wait for my answer, then give specific feedback and a stronger example.\n\nRole:\n[Add role]", favorite: false },
  { id: "study-guide", title: "Teach me the essentials", description: "Learn a topic through a short, structured lesson.", category: "Education", content: "Teach me this topic in plain language. Start with the core idea, give a concrete example, then ask me one question to check my understanding.\n\nTopic:\n[Add topic]", favorite: false },
];
