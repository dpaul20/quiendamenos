import Link from "next/link";
import { Coffee } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-green-50 h-[64px] flex items-center justify-end px-6 overflow-hidden shrink-0">
      <Link
        href="https://cafecito.app/quien-da-menos"
        rel="noopener noreferrer"
        target="_blank"
        className="bg-amber-300 rounded-lg flex gap-2 items-center justify-center px-4 py-2"
      >
        <Coffee className="text-amber-900 shrink-0" style={{ width: 18, height: 18 }} />
        <span className="text-sm font-medium text-amber-900">Invitame un Cafecito</span>
      </Link>
    </footer>
  );
}
