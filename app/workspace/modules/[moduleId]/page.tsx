import { ModuleScreen } from "@/components/workspace/module-screen";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;

  return <ModuleScreen moduleId={moduleId} />;
}
