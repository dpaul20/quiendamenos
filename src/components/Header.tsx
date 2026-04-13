import Image from "next/image";
import MissionModal from "./MissionModal";
import { ModeToggle } from "./DarkMode";

export function Header() {
  return (
    <header className="w-full bg-background h-16 flex items-center justify-between px-6 shadow-[0_1px_4px_0_rgba(0,0,0,0.05)] shrink-0">
      <div className="flex items-center gap-2.5">
        <Image src="/logo.png" alt="Logo" width={36} height={36} />
        <span className="text-xl font-semibold text-foreground">
          Scraping Electronica
        </span>
      </div>

      <div className="flex items-center gap-2">
        <MissionModal />
        <ModeToggle />
      </div>
    </header>
  );
}
