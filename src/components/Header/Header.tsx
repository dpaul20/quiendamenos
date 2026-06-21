import Image from "next/image";
import MissionModal from "@/components/MissionModal";
import { ModeToggle } from "@/components/DarkMode";

export function Header() {
  return (
    <header className="w-full shrink-0 bg-card shadow-[0_1px_4px_0_rgba(0,0,0,0.05)]">
      {/* Mobile header */}
      <div className="flex h-14 items-center justify-between px-4 sm:hidden">
        <div className="flex items-center gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={28}
              height={28}
              className="rotate-[30deg] object-contain"
            />
          </div>
          <span className="text-[15px] font-semibold text-foreground">
            Quién Da Menos
          </span>
        </div>
        <ModeToggle />
      </div>

      {/* Desktop header */}
      <div className="hidden h-14 items-center justify-between px-6 sm:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={36}
              height={36}
              className="rotate-[30deg] object-contain"
            />
          </div>
          <span className="text-xl font-semibold leading-7 text-foreground">
            Quién Da Menos
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
