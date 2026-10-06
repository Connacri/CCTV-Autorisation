import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { PdfFieldConfig } from '../data/pdfSchema';
import {
  drawFilledFieldsOverlay,
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
 * Generates and downloads the final filled 3-page PDF.
 * - If `originalPdfBuffer` is provided, it loads the exact original PDF without
 *   altering its background and overlays ONLY the transparent Cairo Arabic text layer
 *   at the exact field coordinates.
 * - Otherwise, it generates the 3-page A4 official Wilaya d'Oran document with the
 *   Cairo Arabic text layer overlaid.
 */
export async function exportFilledPdf(params: {
  originalPdfBuffer: ArrayBuffer | null;
  fields: PdfFieldConfig[];
  values: Record<string, string>;
  options: RenderOverlayOptions;
  filename?: string;
}): Promise<void> {
  const { originalPdfBuffer, fields, values, options, filename } = params;

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

  const exportOptions: RenderOverlayOptions = {
    ...options,
    showFieldBoxes: false,
    activeFieldId: null,
  };

  let pdfDoc: PDFDocument;

  if (originalPdfBuffer) {
    // Load the user's untouched original PDF
    pdfDoc = await PDFDocument.load(originalPdfBuffer.slice(0));
    const pages = pdfDoc.getPages();

    for (let i = 0; i < Math.min(pages.length, 3); i++) {
      const pageNum = (i + 1) as 1 | 2 | 3;
      const pdfPage = pages[i];
      const { width: pageW, height: pageH } = pdfPage.getSize();

      // Create a transparent canvas containing ONLY the filled Cairo Arabic text
      const overlayCanvas = document.createElement('canvas');
      overlayCanvas.width = canvasW;
      overlayCanvas.height = canvasH;
      const ctx = overlayCanvas.getContext('2d');
      if (!ctx) continue;

      ctx.clearRect(0, 0, canvasW, canvasH);
      drawFilledFieldsOverlay(
        ctx,
        pageNum,
        canvasW,
        canvasH,
        fields,
        values,
        exportOptions
      );

      const pngDataUrl = overlayCanvas.toDataURL('image/png');
      const pngImage = await pdfDoc.embedPng(pngDataUrl);

      pdfPage.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: pageW,
        height: pageH,
      });
    }
  } else {
    // Create a 3-page A4 PDF using our 1:1 faithful Wilaya d'Oran background + Cairo Arabic overlay
    pdfDoc = await PDFDocument.create();

    for (const pageNum of [1, 2, 3] as const) {
      const pdfPage = pdfDoc.addPage([A4_WIDTH_PT, A4_HEIGHT_PT]);
      const fullCanvas = document.createElement('canvas');
      fullCanvas.width = canvasW;
      fullCanvas.height = canvasH;
      const ctx = fullCanvas.getContext('2d');
      if (!ctx) continue;

      drawOfficialPageBackground(ctx, pageNum, canvasW, canvasH);
      drawFilledFieldsOverlay(
        ctx,
        pageNum,
        canvasW,
        canvasH,
        fields,
        values,
        exportOptions
      );

      const pngDataUrl = fullCanvas.toDataURL('image/png');
      const pngImage = await pdfDoc.embedPng(pngDataUrl);

      pdfPage.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: A4_WIDTH_PT,
        height: A4_HEIGHT_PT,
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'Dossier_Equipements_Sensibles_Oran_Cairo.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
