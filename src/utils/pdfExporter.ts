import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { INITIAL_PDF_FIELDS, PdfFieldConfig } from '../data/pdfSchema';
import {
  drawOfficialPageBackground,
  RenderOverlayOptions,
} from './pdfTemplateRenderer';

// Configure PDF.js worker using Vite's asset URL import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

/**
 * Renders the pages of an uploaded original PDF file into HTMLImageElements
 * so they can be used as the exact unmodified background in the interactive preview.
 */
export async function renderUploadedPdfPagesToImages(
  pdfBuffer: ArrayBuffer
): Promise<HTMLImageElement[]> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(pdfBuffer.slice(0)),
  });
  const pdf = await loadingTask.promise;
  const images: HTMLImageElement[] = [];

  const numPages = Math.min(pdf.numPages, 3);
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    await page.render({
      canvasContext: ctx,
      viewport,
      canvas,
    }).promise;

    // Remove light-gray highlight boxes on Page 1, 2, 3 while preserving dark ink & lines
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    for (let p = 0; p < data.length; p += 4) {
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      // Neutral light-gray background highlight (typical Word/PDF gray shading ~160..242)
      if (
        r >= 150 &&
        g >= 150 &&
        b >= 150 &&
        Math.abs(r - g) <= 12 &&
        Math.abs(g - b) <= 12
      ) {
        data[p] = 255;
        data[p + 1] = 255;
        data[p + 2] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const dataUrl = canvas.toDataURL('image/png');
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = dataUrl;
    });
    images.push(img);
  }

  return images;
}

/**
 * Generates and downloads the final filled 3-page PDF using `jspdf` and the
 * exact field coordinates (`xLeft`, `xRight`, `y`, `fontSize`, `align`, `dir`)
 * defined in `pdfSchema.ts`.
 */
export async function exportFilledPdf(params: {
  originalPdfBuffer: ArrayBuffer | null;
  uploadedPageImages?: HTMLImageElement[];
  fields?: PdfFieldConfig[];
  values: Record<string, string>;
  options: RenderOverlayOptions;
  filename?: string;
}): Promise<void> {
  const {
    originalPdfBuffer,
    uploadedPageImages,
    fields = INITIAL_PDF_FIELDS,
    values,
    options,
    filename,
  } = params;

  // Ensure Google Font 'Cairo' is completely loaded before rendering text onto the PDF
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // Standard A4 in points: 595.28 x 841.89
  const A4_WIDTH_PT = 595.28;
  const A4_HEIGHT_PT = 841.89;
  const HIGH_DPI_SCALE = 3.0; // ~216 DPI for crisp print-grade Arabic typography
  const canvasW = Math.round(A4_WIDTH_PT * HIGH_DPI_SCALE);
  const canvasH = Math.round(A4_HEIGHT_PT * HIGH_DPI_SCALE);

  const schemaFields = fields.length > 0 ? fields : INITIAL_PDF_FIELDS;

  // Resolve uploaded page backgrounds if an original PDF was loaded
  let pageImages: HTMLImageElement[] = uploadedPageImages || [];
  if (pageImages.length === 0 && originalPdfBuffer) {
    pageImages = await renderUploadedPdfPagesToImages(originalPdfBuffer);
  }

  // Create standard A4 portrait PDF document with jsPDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
    compress: true,
  });

  const px = (xPct: number) => (xPct / 100) * canvasW;
  const py = (yPct: number) => (yPct / 100) * canvasH;
  const fs = (pt: number) => (pt / A4_WIDTH_PT) * canvasW;

  for (const pageNum of [1, 2, 3] as const) {
    if (pageNum > 1) {
      doc.addPage('a4', 'portrait');
    }

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvasW;
    pageCanvas.height = canvasH;
    const ctx = pageCanvas.getContext('2d');
    if (!ctx) continue;

    // 1. Draw the page background (uploaded PDF page or 1:1 official template)
    const uploadedImg = pageImages[pageNum - 1];
    if (uploadedImg) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasW, canvasH);
      ctx.drawImage(uploadedImg, 0, 0, canvasW, canvasH);
    } else {
      drawOfficialPageBackground(ctx, pageNum, canvasW, canvasH);
    }

    // 2. Render Market Strikethrough on Page 3 ("1 – اشطب العبارة المستغنى عنها")
    if (pageNum === 3 && options.marketStrike !== 'none') {
      ctx.save();
      ctx.strokeStyle = options.inkColor;
      ctx.lineWidth = fs(2.1);
      ctx.lineCap = 'round';

      if (
        options.marketStrike === 'strike_external' ||
        options.marketStrike === 'strike_both'
      ) {
        ctx.beginPath();
        ctx.moveTo(px(16.2), py(19.25));
        ctx.lineTo(px(27.8), py(19.25));
        ctx.stroke();
      }

      if (
        options.marketStrike === 'strike_national' ||
        options.marketStrike === 'strike_both'
      ) {
        ctx.beginPath();
        ctx.moveTo(px(20.2), py(15.85));
        ctx.lineTo(px(29.4), py(15.85));
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Position and draw each field for this page using exact coordinates from pdfSchema.ts
    const pageFields = schemaFields.filter((f) => f.page === pageNum);

    for (const field of pageFields) {
      const rawVal =
        values[field.id] !== undefined
          ? values[field.id]
          : field.id === 'p3_ref_year'
          ? '2020'
          : '';
      let xL = px(field.xLeft + options.globalOffsetX);
      let xR = px(field.xRight + options.globalOffsetX);
      const yBase = py(field.y + options.globalOffsetY);

      if (field.id === 'p3_ref_year') {
        ctx.save();
        ctx.font = `700 ${fs(9.8)}px "Cairo", sans-serif`;
        const acronymW = ctx.measureText('م ت ش ع / م ت ع / م ت ا م م /\u200F').width;
        ctx.restore();
        const customShiftPx = px(field.xRight - 68.6);
        xR = px(87.0 + options.globalOffsetX) - acronymW - fs(2.0) + customShiftPx;
        xL = xR - px(Math.max(3.8, field.xRight - field.xLeft));
      }

      const boxWidth = Math.max(20, xR - xL);
      const scaledPt = field.fontSize * options.fontSizeScale;
      const fontPx = fs(scaledPt);

      if (field.maskBackground) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(xL - fs(2), yBase - fontPx * 1.1, boxWidth + fs(4), fontPx * 1.45);
        ctx.restore();
      }

      if (!rawVal.trim()) continue;

      ctx.save();
      ctx.fillStyle = options.inkColor;
      ctx.font = `${options.fontWeight} ${fontPx}px "Cairo", sans-serif`;
      ctx.direction = field.dir;

      let anchorX = xR;
      if (field.align === 'right') {
        ctx.textAlign = 'right';
        anchorX = xR - fs(2);
      } else if (field.align === 'center') {
        ctx.textAlign = 'center';
        anchorX = (xL + xR) / 2;
      } else {
        ctx.textAlign = 'left';
        anchorX = xL + fs(2);
      }

      if (field.multiline) {
        const paragraphs = rawVal.split('\n');
        const wrappedLines: string[] = [];
        for (const p of paragraphs) {
          const words = p.trim().split(/\s+/);
          let currentLine = '';
          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (ctx.measureText(testLine).width > boxWidth - fs(6) && currentLine) {
              wrappedLines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) wrappedLines.push(currentLine);
        }

        const visibleLines = wrappedLines.slice(0, 3);
        const lineHeight = fontPx * 1.25;
        const cellHeightPx = py(field.height || 5.5);
        const cellTopPx = yBase - fontPx * 0.95;
        const cellCenterY = cellTopPx + cellHeightPx / 2;
        const totalBlockH = (visibleLines.length - 1) * lineHeight;
        const firstLineY = cellCenterY - totalBlockH / 2 + fontPx * 0.32;

        visibleLines.forEach((line, idx) => {
          ctx.fillText(line, anchorX, firstLineY + idx * lineHeight, boxWidth - fs(4));
        });
      } else {
        ctx.fillText(rawVal, anchorX, yBase, boxWidth - fs(2));
      }

      ctx.restore();
    }

    const pageDataUrl = pageCanvas.toDataURL('image/png');
    doc.addImage(
      pageDataUrl,
      'PNG',
      0,
      0,
      A4_WIDTH_PT,
      A4_HEIGHT_PT,
      `page_${pageNum}`,
      'FAST'
    );
  }

  doc.save(filename || 'Dossier_Equipements_Sensibles_Oran_Cairo.pdf');
}

