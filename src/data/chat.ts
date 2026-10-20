export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type ChatConversation = {
  id: string;
  title: string;
  updatedAt: string;
  favorite: boolean;
  messages: ChatMessage[];
};

const today = new Date();

export const initialConversations: ChatConversation[] = [
  {
    id: "launch-strategy",
    title: "Q3 launch strategy",
    updatedAt: today.toISOString(),
    favorite: true,
    messages: [
      { id: "launch-u1", role: "user", content: "Help me shape a launch strategy for our new team workspace. We want it to feel calm and useful, not noisy.", createdAt: today.toISOString() },
      { id: "launch-a1", role: "assistant", content: "A calm launch can still create momentum. I’d build the plan around a clear promise, a small set of proof points, and a focused first week.\n\n### A simple launch shape\n\n1. **Lead with the outcome:** help teams make room for focused work.\n2. **Show the product in context:** a short walkthrough of chat, documents, and shared prompts.\n3. **Invite a small first cohort:** ask them to try one real workflow and share where it felt effortless or confusing.\n\nFor the first week, keep the message consistent across the landing page, launch email, and product tour. Measure activation and repeat use before adding more channels.", createdAt: today.toISOString() },
    ],
  },
  { id: "product-roadmap", title: "Product roadmap", updatedAt: new Date(today.getTime() - 86400000).toISOString(), favorite: false, messages: [{ id: "roadmap-u1", role: "user", content: "What should we prioritize in our next product planning session?", createdAt: new Date(today.getTime() - 86400000).toISOString() }, { id: "roadmap-a1", role: "assistant", content: "Start with customer friction and usage patterns. Bring three things to the session: the moments users return for, the places they get stuck, and the smallest improvements that could make those moments better.", createdAt: new Date(today.getTime() - 86400000).toISOString() }] },
  { id: "research-notes", title: "Research notes", updatedAt: new Date(today.getTime() - 3 * 86400000).toISOString(), favorite: false, messages: [{ id: "research-u1", role: "user", content: "Can you help me organize interview notes into themes?", createdAt: new Date(today.getTime() - 3 * 86400000).toISOString() }, { id: "research-a1", role: "assistant", content: "Absolutely. Group observations by the user need behind them, then separate recurring patterns from one-off requests. A useful summary includes the theme, supporting evidence, and an open question for the team.", createdAt: new Date(today.getTime() - 3 * 86400000).toISOString() }] },
];

export function createMockReply(prompt: string) {
  const lower = prompt.toLowerCase();
  if (lower.includes("summar")) return "Here’s a concise way to move forward:\n\n- **Core idea:** identify the main point and who it helps.\n- **Supporting details:** keep the two or three facts that change the decision.\n- **Next step:** turn the conclusion into one clear action.\n\nShare the material you’re working from and I can make this specific.";
  if (lower.includes("plan") || lower.includes("strategy")) return "Let’s make this practical. Start with the outcome you want, the people it needs to serve, and the one constraint that matters most. Then turn that into a short sequence of steps with a clear owner and a way to tell whether each step worked.\n\nIf you share your timeline and audience, I can tailor the plan.";
  return "That’s a good place to start. I’d break it into a few manageable pieces, decide what a useful outcome looks like, and take the smallest next step that gives you new information.\n\nTell me a little more about your context and I can make the suggestions more specific.";
}
