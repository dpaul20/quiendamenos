import Image from "next/image";
import MissionModal from "@/components/MissionModal";
import { ModeToggle } from "@/components/DarkMode";

export function Header() {
  return (
    <header className="w-full bg-background shadow-[0_1px_4px_0_rgba(0,0,0,0.05)] shrink-0">
      {/* Mobile header */}
      <div className="flex sm:hidden h-14 items-center justify-between px-4">
        <div className="flex items-center justify-center size-[39.6px] shrink-0">
          <div className="rotate-45">
            <div className="size-7 overflow-hidden">
              <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" />
            </div>
          </div>
        </div>
        <span className="text-base font-bold text-foreground">Scraping</span>
        <div className="size-7 shrink-0" />
      </div>

      {/* Desktop header */}
      <div className="hidden sm:flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center size-[56.57px] shrink-0">
            <div className="rotate-45">
              <div className="size-10 overflow-hidden">
                <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
              </div>
            </div>
          </div>
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
