import type { Preview } from "@storybook/nextjs-vite";
import React from "react";
import { ThemeProvider } from "../src/components/theme-provider";
// @ts-expect-error: No type declarations for CSS imports
import "../src/app/globals.css";
const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        <div className="min-h-screen bg-background p-4 text-foreground">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "error",
    },
  },
};

export default preview;
