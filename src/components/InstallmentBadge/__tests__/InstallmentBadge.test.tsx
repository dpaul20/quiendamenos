/**
 * @jest-environment node
 */
import { renderToStaticMarkup } from "react-dom/server";
import { InstallmentBadge } from "../InstallmentBadge";

describe("InstallmentBadge", () => {
  it('renders "{n} CSI" where n is the installment prop', () => {
    const html = renderToStaticMarkup(InstallmentBadge({ installment: 12 }));
    expect(html).toContain("12 CSI");
  });

  it("renders with installment=1 without crashing", () => {
    expect(() =>
      renderToStaticMarkup(InstallmentBadge({ installment: 1 })),
    ).not.toThrow();
  });
});
