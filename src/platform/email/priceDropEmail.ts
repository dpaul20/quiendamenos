export interface PriceDropEmailInput {
  productName: string;
  productUrl: string;
  oldPrice: number;
  newPrice: number;
  unsubscribeUrl: string;
}

function formatARS(cents: number): string {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents);
}

function calcDropPercent(oldPrice: number, newPrice: number): number {
  if (oldPrice === 0) return 0;
  return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
}

export function renderPriceDropEmail(input: PriceDropEmailInput): {
  subject: string;
  html: string;
} {
  const { productName, productUrl, oldPrice, newPrice, unsubscribeUrl } = input;
  const subject = `El precio de ${productName} bajó`;
  const drop = calcDropPercent(oldPrice, newPrice);

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="font-family:sans-serif;background:#f4f4f5;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#18181b;padding:24px;text-align:center;">
              <span style="color:#fff;font-size:20px;font-weight:700;">quiendamenos</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="font-size:22px;color:#18181b;margin:0 0 16px;">${subject}</h1>
              <p style="color:#52525b;margin:0 0 24px;">
                El producto <strong>${productName}</strong> que estás siguiendo bajó de precio.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;border-radius:6px;padding:20px;margin:0 0 24px;">
                <tr>
                  <td style="color:#71717a;font-size:14px;">Precio anterior</td>
                  <td align="right" style="color:#71717a;font-size:14px;text-decoration:line-through;">$ ${formatARS(oldPrice)}</td>
                </tr>
                <tr>
                  <td style="color:#18181b;font-size:22px;font-weight:700;padding-top:8px;">Nuevo precio</td>
                  <td align="right" style="color:#16a34a;font-size:22px;font-weight:700;padding-top:8px;">$ ${formatARS(newPrice)}</td>
                </tr>
                ${drop > 0 ? `<tr><td colspan="2" style="color:#16a34a;font-size:13px;padding-top:4px;">▼ ${drop}% de descuento</td></tr>` : ""}
              </table>
              <div style="text-align:center;margin:0 0 32px;">
                <a href="${productUrl}" style="display:inline-block;background:#18181b;color:#fff;font-size:16px;font-weight:600;padding:14px 32px;border-radius:6px;text-decoration:none;">Ver oferta</a>
              </div>
              <hr style="border:none;border-top:1px solid #e4e4e7;margin:0 0 24px;" />
              <p style="color:#a1a1aa;font-size:12px;text-align:center;margin:0;">
                Recibís este email porque seguís el precio de <strong>${productName}</strong> en quiendamenos.<br />
                <a href="${unsubscribeUrl}" style="color:#a1a1aa;">Dejar de seguir este producto</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
