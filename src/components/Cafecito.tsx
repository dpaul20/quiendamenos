import Link from "next/link";
import Image from "next/image";
import { MoveRight } from "lucide-react";

export default function Cafecito() {
  return (
    <div className="flex flex-row items-center gap-2">
      <div className="flex flex-row items-center gap-2">
        <span className="text-xs text-center font-semibold">¿Conseguiste el mejor precio?</span>
        <div className="hidden lg:block h-4 w-4">
          <MoveRight className="h-full w-full" />
        </div>
      </div>
      <Link
        href="https://cafecito.app/quien-da-menos"
        rel="noopener"
        target="_blank"
      >
        <Image
          src="https://cdn.cafecito.app/imgs/buttons/button_1.png"
          alt="Invitame un café en cafecito.app"
          width={192}
          height={40}
        />
      </Link>
    </div>
  );
}
