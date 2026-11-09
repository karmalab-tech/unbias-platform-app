import PublicHeader from "~/components/public/PublicHeader";
import BiasExperience from "~/components/experience/BiasExperience";
import useQueryFlag from "~/hooks/useQueryFlag";

// Online: under the public header. Exhibition (?present=true): full screen, touch first, resets when idle.
export default function Experience() {
  const presentation = useQueryFlag("present");

  if (presentation) {
    return (
      <div className="bg-canvas text-ink flex h-dvh touch-manipulation flex-col overflow-hidden select-none">
        <BiasExperience presentation />
      </div>
    );
  }

  return (
    <div className="bg-canvas text-ink flex min-h-dvh flex-col lg:h-dvh">
      <PublicHeader />
      <BiasExperience />
    </div>
  );
}
