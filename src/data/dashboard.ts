export type DashboardIconName = "conversation" | "messages" | "documents" | "document";

export type DashboardStat = {
  icon: DashboardIconName;
  tone: string;
  value: string;
  label: string;
  delta: string;
};

export type RecentWorkspaceItem = {
  href: string;
  icon: DashboardIconName;
  color: string;
  title: string;
  category: string;
  time: string;
  text: string;
};

export type RecentActivityItem = { id: string; title: string; detail: string; time: string; href: string; icon: DashboardIconName };

export const dashboardStats: DashboardStat[] = [
  { icon: "conversation", tone: "bg-app-accent-soft text-app-accent", value: "24", label: "Conversations", delta: "6 this week" },
  { icon: "messages", tone: "bg-orange-50 text-orange-900 dark:bg-orange-950/40 dark:text-orange-200", value: "186", label: "AI messages", delta: "12% from last week" },
  { icon: "documents", tone: "bg-green-50 text-green-900 dark:bg-green-950/40 dark:text-green-200", value: "8", label: "Documents", delta: "A tidy little library" },
];

export type UsagePeriod = "day" | "week" | "month";
export type UsagePoint = { label: string; messages: number };
export type UsageRange = { total: number; change: string; comparison: string; data: UsagePoint[] };

export const usageByPeriod: Record<UsagePeriod, UsageRange> = {
  day: {
    total: 26,
    change: "8%",
    comparison: "vs yesterday",
    data: [
      { label: "9 AM", messages: 3 }, { label: "11 AM", messages: 5 },
      { label: "1 PM", messages: 4 }, { label: "3 PM", messages: 6 },
      { label: "5 PM", messages: 5 }, { label: "7 PM", messages: 3 },
    ],
  },
  week: {
    total: 186,
    change: "12%",
    comparison: "vs last week",
    data: [
      { label: "Mon", messages: 18 }, { label: "Tue", messages: 24 },
      { label: "Wed", messages: 19 }, { label: "Thu", messages: 33 },
      { label: "Fri", messages: 27 }, { label: "Sat", messages: 38 },
      { label: "Sun", messages: 27 },
    ],
  },
  month: {
    total: 824,
    change: "9%",
    comparison: "vs last month",
    data: [
      { label: "Week 1", messages: 182 }, { label: "Week 2", messages: 206 },
      { label: "Week 3", messages: 194 }, { label: "Week 4", messages: 242 },
    ],
  },
};

export const recentWorkspaceItems: RecentWorkspaceItem[] = [
  { href: "/app/chat?new=1&prompt=Help%20me%20make%20a%20weekly%20plan%20that%20leaves%20room%20for%20deep%20work.", icon: "conversation", color: "bg-app-accent-soft text-app-accent", title: "A better rhythm for my week", category: "PERSONAL", time: "12 min ago", text: "Help me make a weekly plan that leaves room for deep work…" },
  { href: "/app/chat?new=1&prompt=Can%20you%20help%20me%20find%20a%20clearer%20way%20to%20talk%20about%20this%20feature%3F", icon: "conversation", color: "bg-orange-50 text-orange-900 dark:bg-orange-950/40 dark:text-orange-200", title: "Q3 launch: messaging ideas", category: "WORK", time: "Yesterday", text: "Can you help me find a clearer way to talk about this feature?" },
  { href: "/app/documents/brand-voice", icon: "document", color: "bg-green-50 text-green-900 dark:bg-green-950/40 dark:text-green-200", title: "Brand voice guidelines.pdf", category: "DOCUMENT", time: "Yesterday", text: "A 12-page guide to how we sound, and why it matters." },
];

export const recentActivity: RecentActivityItem[] = [
  { id: "activity-chat", title: "Conversation started", detail: "A better rhythm for my week", time: "12 min ago", href: "/app/chat?new=1&prompt=Help%20me%20make%20a%20weekly%20plan.", icon: "conversation" },
  { id: "activity-document", title: "Document opened", detail: "Brand voice guidelines.pdf", time: "Yesterday", href: "/app/documents/brand-voice", icon: "document" },
  { id: "activity-prompt", title: "Prompt saved", detail: "Plan a focused week", time: "Yesterday", href: "/app/prompts/weekly-focus", icon: "messages" },
];

export const starterPrompts = [
  { title: "Untangle my to-do list", sub: "Find the first thing to focus on" },
  { title: "Give me a fresh perspective", sub: "Look at a tricky problem differently" },
  { title: "Make this sound like me", sub: "Bring a draft, find your voice" },
];
