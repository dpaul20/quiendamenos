import Link from "next/link";
import { Alert, AlertDescription } from "./ui/alert";
import Image from "next/image";
import { MoveRight } from "lucide-react";

export default function Cafecito() {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-center gap-2">
      <Alert className="flex flex-row items-center gap-2 px-2 py-1 lg:px-4 lg:py-3">
        <AlertDescription className="text-xs text-center">
          ¿Conseguiste el mejor precio?
        </AlertDescription>
        <div className="hidden lg:block h-4 w-4">
          <MoveRight className="h-full w-full top-1/2 right-2" />
        </div>
      </Alert>
      <Link
        href="https://cafecito.app/quien-da-menos"
        rel="noopener"
        target="_blank"
      >
        <Image
          src="https://cdn.cafecito.app/imgs/buttons/button_4.png"
          width={192}
          height={40}
          alt="Invitame un café en cafecito.app"
          className="h-9 lg:h-auto max-h-full max-w-48"
        />
      </Link>
    </div>
  );
}
