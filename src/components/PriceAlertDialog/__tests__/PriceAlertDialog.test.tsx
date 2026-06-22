/** @jest-environment node */
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

// Radix Dialog uses browser APIs — stub them for node env
jest.mock("@/components/ui/dialog", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  return {
    Dialog: ({
      open,
      children,
    }: {
      open?: boolean;
      children?: React.ReactNode;
    }) => (open ? React.createElement(React.Fragment, null, children) : null),
    DialogContent: ({ children }: { children?: React.ReactNode }) =>
      React.createElement("div", { "data-testid": "dialog-content" }, children),
    DialogHeader: ({ children }: { children?: React.ReactNode }) =>
      React.createElement("div", null, children),
    DialogTitle: ({ children }: { children?: React.ReactNode }) =>
      React.createElement("h2", null, children),
    DialogDescription: ({ children }: { children?: React.ReactNode }) =>
      React.createElement("p", null, children),
  };
});

import { PriceAlertDialog } from "../PriceAlertDialog";

const noop = () => {};
const noopAsync = async () => {};

describe("PriceAlertDialog", () => {
  it("renders nothing when open={false}", () => {
    const html = renderToStaticMarkup(
      React.createElement(PriceAlertDialog, {
        open: false,
        onOpenChange: noop,
        onSubmit: noopAsync,
      }),
    );
    expect(html).toBe("");
  });

  it("renders dialog content when open={true}", () => {
    const html = renderToStaticMarkup(
      React.createElement(PriceAlertDialog, {
        open: true,
        onOpenChange: noop,
        onSubmit: noopAsync,
      }),
    );
    expect(html).toContain("dialog-content");
    expect(html).toContain("Recibí alertas de precio");
    expect(html).toContain("Seguir precio");
  });

  it("shows product name in content when provided", () => {
    const html = renderToStaticMarkup(
      React.createElement(PriceAlertDialog, {
        open: true,
        onOpenChange: noop,
        onSubmit: noopAsync,
        productName: "iPhone 15 Pro",
      }),
    );
    expect(html).toContain("iPhone 15 Pro");
  });

  it("shows error message when error prop is set", () => {
    const html = renderToStaticMarkup(
      React.createElement(PriceAlertDialog, {
        open: true,
        onOpenChange: noop,
        onSubmit: noopAsync,
        error: "No pudimos registrar tu email. Intentá de nuevo.",
      }),
    );
    expect(html).toContain("No pudimos registrar tu email. Intentá de nuevo.");
  });

  it("submit button is disabled when loading={true}", () => {
    const html = renderToStaticMarkup(
      React.createElement(PriceAlertDialog, {
        open: true,
        onOpenChange: noop,
        onSubmit: noopAsync,
        loading: true,
      }),
    );
    expect(html).toContain("disabled");
  });
});
