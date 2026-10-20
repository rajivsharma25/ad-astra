import { notFound } from "next/navigation";
import { WorkspaceSettings, type SettingsSection } from "@/components/settings/workspace-settings";

const sections = new Set<SettingsSection>(["account", "appearance", "ai", "notifications"]);

export default async function SettingsSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.has(section as SettingsSection)) notFound();
  return <WorkspaceSettings section={section as SettingsSection} />;
}
