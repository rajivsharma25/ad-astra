"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { usageByPeriod, type UsagePeriod } from "@/data/dashboard";

const periods: { key: UsagePeriod; label: string }[] = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

export function UsageChart() {
  const [period, setPeriod] = useState<UsagePeriod>("week");
  const usage = usageByPeriod[period];

  return (
    <section className="rounded-lg border border-app-line bg-app-panel p-3.5 sm:p-4">
      <div className="flex items-center justify-between">
        <div><span className="font-mono text-xs tracking-wide text-app-faint">{`A LOOK AT YOUR ${period.toUpperCase()}`}</span><h3 className="mt-1 font-display text-base font-semibold">Your workspace is in motion.</h3></div>
        <div className="flex items-center rounded-md border border-app-line p-0.5" aria-label="Usage chart time range" role="group">
          {periods.map((option) => <button key={option.key} type="button" aria-pressed={period === option.key} onClick={() => setPeriod(option.key)} className={`rounded px-2 py-1 text-xs transition-colors ${period === option.key ? "bg-app-accent-soft font-semibold text-app-accent" : "text-app-muted hover:bg-app-bg"}`}>{option.label}</button>)}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2.5"><b className="font-display text-xl">{usage.total} <small className="font-body text-xs font-normal text-app-muted">messages</small></b><span className="text-xs text-green-800 dark:text-green-300">↑ {usage.change} <span className="text-app-faint">{usage.comparison}</span></span></div>
      <div className="mt-3 h-40 w-full" role="img" aria-label={`Bar chart showing AI messages ${period === "day" ? "by hour today" : period === "week" ? "by day this week" : "by week this month"}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={usage.data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
            <CartesianGrid vertical={false} stroke="var(--app-line)" strokeDasharray="3 5" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--app-faint)", fontSize: 12 }} dy={8} />
            <YAxis hide domain={[0, "auto"]} />
            <Tooltip cursor={false} contentStyle={{ backgroundColor: "var(--app-panel)", border: "1px solid var(--app-line)", borderRadius: 8, color: "var(--app-text)" }} labelStyle={{ color: "var(--app-muted)" }} formatter={(value) => [`${value} messages`, "AI usage"]} />
            <Bar dataKey="messages" name="AI messages" fill="var(--app-accent)" radius={[4, 4, 0, 0]} maxBarSize={34}>
              {usage.data.map((point, index) => <Cell key={point.label} fill="var(--app-accent)" fillOpacity={index === usage.data.length - 1 ? 1 : 0.45} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default UsageChart;
