import JsBarcode from 'jsbarcode';

export interface BarcodeLabel {
  name: string;
  barcode: string;
  price?: number | null;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

function buildSvg(code: string): string {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const base = { height: 40, margin: 0, fontSize: 12, width: 1.5 };
  try {
    JsBarcode(svg, code, { ...base, format: /^\d{13}$/.test(code) ? 'EAN13' : 'CODE128' });
  } catch {
    JsBarcode(svg, code, { ...base, format: 'CODE128' });
  }
  svg.setAttribute('style', 'width:44mm;height:12mm');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  return svg.outerHTML;
}

export function printBarcodeLabels(labels: BarcodeLabel[], copies = 1): void {
  const valid = labels.filter((l) => l.barcode?.trim());
  if (!valid.length) return;

  const items = valid
    .flatMap((l) => Array.from({ length: Math.max(1, copies) }, () => l))
    .map(
      (l) => `
      <div class="label">
        <div class="name">${escapeHtml(l.name)}</div>
        ${buildSvg(l.barcode.trim())}
        ${l.price != null ? `<div class="price">${l.price} EGP</div>` : ''}
      </div>`
    )
    .join('');

  const win = window.open('', '_blank', 'width=480,height=360');
  if (!win) {
    alert('المتصفح حجب نافذة الطباعة. اسمح بالنوافذ المنبثقة وجرب تاني.');
    return;
  }

  win.document.write(`<!doctype html><html dir="ltr"><head><meta charset="utf-8">
    <title>Barcode labels</title>
    <style>
      @page { size: 50mm 30mm landscape; margin: 0; }
      html, body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
      .label { width: 50mm; height: 30mm; box-sizing: border-box; padding: 2mm;
               display: flex; flex-direction: column; align-items: center;
               justify-content: center; page-break-after: always; overflow: hidden; }
      .name { font-size: 9pt; font-weight: 600; max-width: 100%; white-space: nowrap;
              overflow: hidden; text-overflow: ellipsis; }
      .price { font-size: 9pt; }
    </style></head><body>${items}</body></html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); }, 300);
}