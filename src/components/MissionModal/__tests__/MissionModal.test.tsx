/** @jest-environment node */
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

// Mock Radix Dialog primitives
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "dialog" }, children),
  DialogTrigger: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "dialog-trigger" }, children),
  DialogContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) =>
    React.createElement(
      "div",
      { "data-testid": "dialog-content", className },
      children,
    ),
  DialogHeader: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) =>
    React.createElement(
      "div",
      { "data-testid": "dialog-header", className },
      children,
    ),
  DialogTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) =>
    React.createElement(
      "h2",
      { "data-testid": "dialog-title", className },
      children,
    ),
  DialogClose: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) =>
    React.createElement(
      "button",
      { "data-testid": "dialog-close", className },
      children,
    ),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href }, children),
}));

import MissionModal from "../MissionModal";

describe("MissionModal", () => {
  it("title and close button are rendered inside the same dialog-header container", () => {
    const html = renderToStaticMarkup(React.createElement(MissionModal));
    // Find the header block — everything between data-testid="dialog-header" open and next closing tag
    const headerMatch = html.match(
      /data-testid="dialog-header"[^>]*>([\s\S]*?)<\/div>/,
    );
    expect(headerMatch).not.toBeNull();
    const headerContent = headerMatch![0];
    expect(headerContent).toContain('data-testid="dialog-title"');
    expect(headerContent).toContain('data-testid="dialog-close"');
  });

  it("the close button renders the × character", () => {
    const html = renderToStaticMarkup(React.createElement(MissionModal));
    // × is rendered as × or as the entity in attributes; in text content it stays as ×
    expect(html).toContain("×");
  });

  it("the DialogContent className contains the Tailwind modifier to hide the default close button", () => {
    const html = renderToStaticMarkup(React.createElement(MissionModal));
    // renderToStaticMarkup HTML-encodes & in attributes: [&>...] becomes [&amp;>...]
    expect(html).toContain("button.absolute]:hidden");
  });
});
