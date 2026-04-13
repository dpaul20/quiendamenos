import Image from "next/image";
import MissionModal from "./MissionModal";
import { ModeToggle } from "./DarkMode";

export function Header() {
  return (
    <header className="w-full bg-background shadow-[0_1px_4px_0_rgba(0,0,0,0.05)] shrink-0">
      {/* Mobile header */}
      <div className="flex sm:hidden h-14 items-center justify-between px-4">
        <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded-lg shrink-0" />
        <span className="text-base font-bold text-foreground">Scraping</span>
        <div className="size-7 shrink-0" />
      </div>

      {/* Desktop header */}
      <div className="hidden sm:flex h-10 items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-lg" />
          <span className="text-xl font-semibold leading-7 text-foreground">
            Scraping Electronica
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MissionModal />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
