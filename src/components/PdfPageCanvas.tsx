import React, { useEffect, useRef, useState } from 'react';
import { PdfFieldConfig } from '../data/pdfSchema';
import {
  drawFilledFieldsOverlay,
  drawOfficialPageBackground,
  MarketStrikeOption,
  RenderOverlayOptions,
} from '../utils/pdfTemplateRenderer';

interface PdfPageCanvasProps {
  pageNumber: 1 | 2 | 3;
  fields: PdfFieldConfig[];
  values: Record<string, string>;
  options: RenderOverlayOptions;
  uploadedPageImage?: HTMLImageElement | null;
  activeFieldId: string | null;
  onSelectField: (fieldId: string) => void;
  onUpdateValue: (fieldId: string, newValue: string) => void;
  onChangeMarketStrike?: (nextStrike: MarketStrikeOption) => void;
  onNudgeField?: (fieldId: string, dxPct: number, dyPct: number) => void;
  zoom: number;
  directEditOnPdf: boolean;
}

export const PdfPageCanvas: React.FC<PdfPageCanvasProps> = ({
  pageNumber,
  fields,
  values,
  options,
  uploadedPageImage,
  activeFieldId,
  onSelectField,
  onUpdateValue,
  onChangeMarketStrike,
  zoom,
  directEditOnPdf,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Base internal resolution for crisp display
  const BASE_W = 893; // 1.5x A4 pt
  const BASE_H = 1263;

  useEffect(() => {
    let mounted = true;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (mounted) setFontsLoaded(true);
      });
    } else {
      setFontsLoaded(true);
    }
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, BASE_W, BASE_H);

    // 1. Draw untouched background (uploaded PDF page or built-in 1:1 replica)
    if (uploadedPageImage) {
      ctx.drawImage(uploadedPageImage, 0, 0, BASE_W, BASE_H);
    } else {
      drawOfficialPageBackground(ctx, pageNumber, BASE_W, BASE_H);
    }

    // 2. Draw Cairo Arabic text overlay
    drawFilledFieldsOverlay(ctx, pageNumber, BASE_W, BASE_H, fields, values, {
      ...options,
      activeFieldId,
    });
  }, [pageNumber, fields, values, options, uploadedPageImage, activeFieldId, fontsLoaded]);

  const pageFields = fields.filter((f) => f.page === pageNumber);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickXPct = ((e.clientX - rect.left) / rect.width) * 100;
    const clickYPct = ((e.clientY - rect.top) / rect.height) * 100;

    // On Page 3, allow clicking directly on "– الوطنية." or "–الخارجية (1)" to bar/unbar
    if (pageNumber === 3 && onChangeMarketStrike) {
      if (clickXPct >= 19.5 && clickXPct <= 30.2 && clickYPct >= 14.3 && clickYPct <= 17.2) {
        onChangeMarketStrike(
          options.marketStrike === 'strike_national' ? 'strike_external' : 'strike_national'
        );
        return;
      }
      if (clickXPct >= 15.5 && clickXPct <= 28.5 && clickYPct >= 17.6 && clickYPct <= 20.6) {
        onChangeMarketStrike(
          options.marketStrike === 'strike_external' ? 'strike_national' : 'strike_external'
        );
        return;
      }
    }

    // Find closest matching field on this page
    let matched: PdfFieldConfig | null = null;
    for (const f of pageFields) {
      const xL = f.xLeft + options.globalOffsetX - 1.5;
      const xR = f.xRight + options.globalOffsetX + 1.5;
      const yTop = f.y + options.globalOffsetY - (f.multiline ? 1.8 : 2.2);
      const yBot = f.y + options.globalOffsetY + (f.multiline ? (f.height || 5.5) : 1.2);

      if (clickXPct >= xL && clickXPct <= xR && clickYPct >= yTop && clickYPct <= yBot) {
        matched = f;
        break;
      }
    }

    if (matched) {
      onSelectField(matched.id);
    }
  };

  const displayWidth = Math.round(595 * zoom);

  return (
    <div
      className="relative mx-auto w-full bg-white shadow-sm border border-slate-300 select-none transition-all duration-150"
      style={{
        maxWidth: `${displayWidth}px`,
        aspectRatio: '595.28 / 841.89',
      }}
    >
      <canvas
        ref={canvasRef}
        width={BASE_W}
        height={BASE_H}
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-pointer"
      />

      {/* Interactive direct-on-PDF Cairo input overlays when Direct Edit Mode is enabled */}
      {directEditOnPdf &&
        pageFields.map((field) => {
          const isSelected = activeFieldId === field.id;
          const leftPct = Math.max(0, field.xLeft + options.globalOffsetX);
          const widthPct = Math.max(4, field.xRight - field.xLeft);
          const heightPct = field.multiline ? field.height || 5.5 : 2.4;
          const topPct = field.multiline
            ? field.y + options.globalOffsetY - 1.3
            : field.y + options.globalOffsetY - 1.85;

          const val =
            values[field.id] !== undefined
              ? values[field.id]
              : field.id === 'p3_ref_year'
              ? '2020'
              : '';
          const scaledFontSizePx = Math.max(
            9,
            field.fontSize * options.fontSizeScale * zoom * 0.96
          );

          return (
            <div
              key={field.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectField(field.id);
              }}
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: `${widthPct}%`,
                height: `${heightPct}%`,
              }}
              className={`group rounded-xs transition-colors ${
                isSelected
                  ? 'z-20'
                  : 'hover:bg-slate-100/30 z-10'
              }`}
              title={`${field.labelAr} — ${field.labelFr}`}
            >
              {isSelected ? (
                field.multiline ? (
                  <textarea
                    autoFocus
                    dir={field.dir}
                    value={val}
                    placeholder={field.placeholderAr}
                    onChange={(e) => onUpdateValue(field.id, e.target.value)}
                    style={{
                      fontSize: `${scaledFontSizePx}px`,
                      textAlign: field.align,
                      color: options.inkColor,
                    }}
                    className="w-full h-full px-1 py-0.5 bg-white/95 font-cairo font-semibold leading-tight resize-none focus:outline-none"
                  />
                ) : (
                  <input
                    autoFocus
                    type="text"
                    dir={field.dir}
                    value={val}
                    placeholder={field.placeholderAr}
                    onChange={(e) => onUpdateValue(field.id, e.target.value)}
                    style={{
                      fontSize: `${scaledFontSizePx}px`,
                      textAlign: field.align,
                      color: options.inkColor,
                    }}
                    className={`w-full h-full px-1 bg-white/95 leading-none focus:outline-none ${
                      field.id === 'p3_ref_number' || field.id === 'p3_ref_year'
                        ? 'font-amiri font-bold'
                        : 'font-cairo font-semibold'
                    }`}
                  />
                )
              ) : null}
            </div>
          );
        })}
    </div>
  );
};
