import React from "react";

import Cafecito from "./Cafecito";

export function Footer() {
  return (
    <footer className="bg-green-200 dark:bg-inherit order-2 bottom-0 left-0 w-full py-4 px-6 flex justify-end items-center">
      <div className="flex items-center space-x-4">
        <Cafecito />
      </div>
    </footer>
  );
}
