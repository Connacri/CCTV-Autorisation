import { PdfFieldConfig } from '../data/pdfSchema';

export type MarketStrikeOption =
  | 'strike_external'
  | 'strike_national'
  | 'strike_both'
  | 'none';

export interface RenderOverlayOptions {
  inkColor: string;
  fontWeight: '400' | '600' | '700';
  globalOffsetX: number; // in % (-5 to +5)
  globalOffsetY: number; // in % (-5 to +5)
  fontSizeScale: number; // 0.8 to 1.3
  marketStrike: MarketStrikeOption;
  showFieldBoxes?: boolean;
  activeFieldId?: string | null;
}

/**
 * Draws the clean official background of the 3-page Wilaya PDF
 * onto a canvas when the user has not uploaded their local PDF file yet.
 * All gray scan highlight zones have been removed on Page 1, Page 2, and Page 3
 * for a crisp, print-ready administrative document.
 */
export function drawOfficialPageBackground(
  ctx: CanvasRenderingContext2D,
  pageNumber: 1 | 2 | 3,
  w: number,
  h: number
) {
  ctx.save();
  // Pure white paper background (no gray highlight zones)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  const px = (xPct: number) => (xPct / 100) * w;
  const py = (yPct: number) => (yPct / 100) * h;
  const fs = (pt: number) => (pt / 595.28) * w;

  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#0f172a';
  ctx.direction = 'rtl';

  if (pageNumber === 1) {
    // Top Republic Header (identical across all 3 pages, no underline)
    ctx.font = `700 ${fs(14.5)}px "Amiri", "Cairo", serif`;
    ctx.textAlign = 'center';
    ctx.fillText(
      'الجمهوريـــــــــــــة الجزائريـــــــــــــة الديمقراطيـــــــــــــة الشعبيـــــــــــــة',
      px(49.5),
      py(3.8)
    );

    // Right Administrative Block (Wilaya is drawn dynamically via p1_wilaya field)
    ctx.textAlign = 'right';
    ctx.font = `400 ${fs(10.5)}px "Amiri", "Cairo", serif`;
    ctx.fillText('مديرية التنظيم و الشؤون العامة', px(95.2), py(10.7));
    ctx.fillText('مصلحة التنظيم العام', px(92.2), py(13.2));
    ctx.fillText('مكتب تنظيم الأسلحة و المواد المتفجرة', px(95.2), py(15.6));
    ctx.fillText('قسم شركات الحراسة و التجهيزات الحساسة', px(95.2), py(18.0));

    // Center Title Block
    ctx.textAlign = 'center';
    ctx.font = `700 ${fs(14.5)}px "Amiri", "Cairo", serif`;
    ctx.fillText('تعهد بعدم ربط نظام المراقبة', px(49.5), py(25.8));
    ctx.fillText('عن طريق الفيديو بشبكة الانترنيت', px(49.5), py(29.8));
    ctx.fillText('أنها ليست بالأشعة الحمراء ( INFRAROUGE )', px(49.5), py(33.8));

    // Line 1 & 2 with dotted lines
    ctx.textAlign = 'right';
    ctx.font = `400 ${fs(13.5)}px "Amiri", "Cairo", serif`;
    ctx.fillText(
      'أنا الممضي أسفله (ة) (1)...............................................................................',
      px(95.2),
      py(41.2)
    );
    ctx.fillText(
      'عنوان مكان استغلال نظام كاميرات المراقبة (2): ...........................................................',
      px(95.2),
      py(46.3)
    );

    // Body commitments
    ctx.fillText(
      'أتعهد بأنني لن اربط نظام كاميرات المراقبة عن طريق الفيديو بشبكة الانترنيت.',
      px(83.5),
      py(51.4)
    );
    ctx.fillText(
      'و أتعهد بأن كاميرات المراقبة عن طريق الفيديو ليست بالأشعة الحمراء.',
      px(83.5),
      py(56.5)
    );

    // Note block (clean white background — gray highlight boxes removed)
    ctx.fillStyle = '#0f172a';
    ctx.font = `700 ${fs(14.5)}px "Amiri", "Cairo", serif`;
    ctx.fillText('ملاحظة:', px(95.2), py(65.5));
    // Underline under ملاحظة
    ctx.lineWidth = fs(0.8);
    ctx.beginPath();
    ctx.moveTo(px(87.2), py(66.2));
    ctx.lineTo(px(95.2), py(66.2));
    ctx.stroke();

    ctx.font = `400 ${fs(12.2)}px "Amiri", "Cairo", serif`;
    ctx.fillText(
      'تم إعلام الطالب بأن تسلم له رخصة اقتناء صالحة لمدة 06 أشهر ليكمل الملف للحصول على رخصة استغلال.',
      px(86.2),
      py(65.5)
    );

    // Place & Date
    ctx.font = `400 ${fs(12.5)}px "Amiri", "Cairo", serif`;
    ctx.fillText('حرر ب: ....................في....................', px(46.0), py(72.2));

    // Signature label
    ctx.textAlign = 'center';
    ctx.font = `400 ${fs(13.5)}px "Amiri", "Cairo", serif`;
    ctx.fillText('(امضاء و ختم المعني)', px(75.0), py(76.6));

    // Bottom separator & footnotes
    ctx.lineWidth = fs(0.7);
    ctx.beginPath();
    ctx.moveTo(px(67.2), py(88.6));
    ctx.lineTo(px(95.2), py(88.6));
    ctx.stroke();

    ctx.textAlign = 'right';
    ctx.font = `400 ${fs(10.5)}px "Amiri", "Cairo", serif`;
    ctx.fillText('1 -ذكر الاسم و اللقب أو عنوان الشركة.', px(95.2), py(91.3));
    ctx.fillText('2 -تعيين عنوان مكان استغلال نظام كاميرات المراقبة.', px(95.2), py(94.1));
  } else if (pageNumber === 2) {
    // Republic Header on Page 2 (identical across all 3 pages, no underline)
    ctx.fillStyle = '#0f172a';
    ctx.font = `700 ${fs(14.5)}px "Amiri", "Cairo", serif`;
    ctx.textAlign = 'center';
    ctx.fillText(
      'الجمهوريـــــــــــــة الجزائريـــــــــــــة الديمقراطيـــــــــــــة الشعبيـــــــــــــة',
      px(49.5),
      py(3.8)
    );

    // Right Administrative Block (Wilaya is drawn dynamically via p2_wilaya field)
    ctx.textAlign = 'right';
    ctx.font = `400 ${fs(10.5)}px "Amiri", "Cairo", serif`;
    ctx.fillText('مديرية التنظيم و الشؤون العامة', px(95.2), py(10.8));
    ctx.fillText('مصلحة التنظيم العام', px(92.2), py(13.3));
    ctx.fillText('مكتب تنظيم الأسلحة و المواد المتفجرة', px(95.2), py(15.7));
    ctx.fillText('قسم شركات الحراسة و التجهيزات الحساسة', px(95.2), py(18.1));

    // Underlined Centered Titles
    ctx.textAlign = 'center';
    ctx.font = `700 ${fs(14.5)}px "Amiri", "Cairo", serif`;
    ctx.fillText('استمارة معلومات خاصة', px(49.5), py(23.8));
    ctx.lineWidth = fs(0.8);
    ctx.beginPath();
    ctx.moveTo(px(38.8), py(24.9));
    ctx.lineTo(px(59.8), py(24.9));
    ctx.stroke();

    ctx.fillText('بطالب رخصة اقتناء تجهيزات حساسة', px(49.5), py(28.0));
    ctx.beginPath();
    ctx.moveTo(px(33.3), py(29.1));
    ctx.lineTo(px(65.3), py(29.1));
    ctx.stroke();

    // Section heading
    ctx.textAlign = 'right';
    ctx.font = `700 ${fs(14.5)}px "Amiri", "Cairo", serif`;
    ctx.fillText('انا الممضي أسفله', px(95.2), py(35.2));

    // 11 Dotted Form Lines
    ctx.font = `400 ${fs(12)}px "Amiri", "Cairo", serif`;
    const linesP2: Array<{ y: number; text: string }> = [
      {
        y: 38.7,
        text: 'هوية الطالب (1) ............................................................................................................',
      },
      {
        y: 42.1,
        text: 'ابن ..........................................................و ................................................................',
      },
      {
        y: 45.4,
        text: 'المولود (ة) في ................................................ب ..............................................................',
      },
      {
        y: 48.6,
        text: 'العنوان (2) .................................................................................................................',
      },
      {
        y: 51.8,
        text: 'بطاقة تعريف الوطنية رقم........................الصادرة عن..........................بتاريخ ..................................',
      },
      {
        y: 55.0,
        text: 'جواز سفر رقم..................................الصادر عن ....................................................................',
      },
      {
        y: 58.2,
        text: 'تاريخ الإصدار...................................تاريخ انتهاء مدة الصلاحية ..................................................',
      },
      {
        y: 61.4,
        text: 'الجنسية ......................................................................................................................',
      },
      {
        y: 64.6,
        text: 'بصفتي مسير للشركة..............................الكائنة ب ...................................................................',
      },
      {
        y: 67.8,
        text: 'رقم الهاتف........................الفاكس.........................البريد الالكتروني ...........................................',
      },
      {
        y: 71.0,
        text: 'اسم ولقب المساهمين ..........................................................................................................',
      },
    ];

    for (const l of linesP2) {
      ctx.fillText(l.text, px(95.2), py(l.y));
    }

    ctx.fillText('طلب رخصة اقتناء تجهيزات حساسة', px(95.2), py(74.4));
    ctx.fillText(
      'يتعهد الممضي أسفله بشرفه أن المعلومات المذكورة في الاستمارة صحيحة.',
      px(95.2),
      py(77.7)
    );

    ctx.fillText('حرر ب : ....................في.......................', px(41.5), py(81.6));

    ctx.textAlign = 'center';
    ctx.font = `400 ${fs(13)}px "Amiri", "Cairo", serif`;
    ctx.fillText('(امضاء و ختم المعني)', px(18.8), py(85.6));

    // Bottom separator & footnotes
    ctx.lineWidth = fs(0.7);
    ctx.beginPath();
    ctx.moveTo(px(67.2), py(88.6));
    ctx.lineTo(px(95.2), py(88.6));
    ctx.stroke();

    ctx.textAlign = 'right';
    ctx.font = `400 ${fs(9.8)}px "Amiri", "Cairo", serif`;
    ctx.fillText('1 -اذكر أسماء و ألقاب أو الغرض الاجتماعي لطالب', px(95.2), py(91.7));
    ctx.fillText('الرخصة .', px(95.2), py(94.1));
    ctx.fillText('2 -حدد العنوان الشخصي أو عنوان المقر الاجتماعي', px(95.2), py(96.6));
    ctx.fillText('لطالب الرخصة .', px(95.2), py(99.0));
  } else if (pageNumber === 3) {
    // Republic Header on Page 3 (identical across all 3 pages, no underline)
    ctx.fillStyle = '#0f172a';
    ctx.font = `700 ${fs(14.5)}px "Amiri", "Cairo", serif`;
    ctx.textAlign = 'center';
    ctx.fillText(
      'الجمهوريـــــــــــــة الجزائريـــــــــــــة الديمقراطيـــــــــــــة الشعبيـــــــــــــة',
      px(49.5),
      py(3.8)
    );

    // Right Admin Header (Wilaya is drawn dynamically via p3_wilaya field)
    ctx.textAlign = 'right';
    ctx.font = `700 ${fs(9.8)}px "Amiri", "Cairo", serif`;
    ctx.fillText('مديرية التنظيم و الشؤون العامة', px(95.2), py(7.9));
    ctx.fillText('مصلحة التنظيم العام', px(93.0), py(9.4));
    ctx.fillText('مكتب تنظيم الأسلحة و المواد المتفجرة', px(95.2), py(10.9));
    ctx.fillText('قسم شركات الحراسة و التجهيزات الحساسة', px(95.2), py(12.4));

    // Reference line on Page 3 ("رقم / 142 م ت ش ع / م ت ع / م ت ا م م / 2020")
    // Drawn in drawPage3ReferenceLine using the original "Amiri" serif font on y = 13.9
    drawPage3ReferenceLine(
      ctx,
      w,
      h,
      [],
      { p3_ref_number: '', p3_ref_year: '2020' },
      {
        inkColor: '#0f172a',
        fontWeight: '700',
        globalOffsetX: 0,
        globalOffsetY: 0,
        fontSizeScale: 1.0,
        marketStrike: 'none',
        showFieldBoxes: false,
      }
    );

    // Title (clean white background — gray highlight removed)
    ctx.fillStyle = '#0f172a';
    ctx.font = `700 ${fs(13.2)}px "Amiri", "Cairo", serif`;
    ctx.fillText('طلب رخصة اقتناء تجهيزات حساسة من السوق', px(71.5), py(16.4));
    ctx.fillText('– الوطنية.', px(29.2), py(16.4));
    ctx.fillText('–الخارجية (1)', px(27.5), py(19.8));

    // Applicant section
    ctx.font = `400 ${fs(13)}px "Amiri", "Cairo", serif`;
    ctx.fillText('الممضي أسفله', px(95.2), py(23.3));

    const linesP3: Array<{ y: number; text: string }> = [
      {
        y: 26.2,
        text: 'هوية الطالب (2) ..........................................................................................................',
      },
      {
        y: 29.0,
        text: 'المولود (ة) في.............................................ب..............................................................',
      },
      {
        y: 31.9,
        text: 'الجنسية ....................................................................................................................',
      },
      {
        y: 34.8,
        text: 'عنوان تركيب الكاميرات (3) ..............................................................................................',
      },
      {
        y: 37.7,
        text: 'المهنة (4) ..................................................................................................................',
      },
      {
        y: 40.5,
        text: 'نوع النشاطات (5) .........................................................................................................',
      },
      {
        y: 43.4,
        text: 'مرجع اعتماد و عنوان مؤسسة تركيب الكاميرات (6)......................................................................',
      },
    ];

    for (const l of linesP3) {
      ctx.fillText(l.text, px(95.2), py(l.y));
    }

    ctx.font = `700 ${fs(13)}px "Amiri", "Cairo", serif`;
    ctx.fillText('طلب رخصة اقتناء و تعيين حيازة التجهيزات الحساسة المبينة أدناه :', px(95.2), py(46.3));

    // ========================================================================
    // TABLE ON PAGE 3 (Exact coordinates matching scan, no gray highlight)
    // ========================================================================
    const tLeft = px(3.2);
    const tRight = px(96.2);
    const tTop = py(47.1);
    const tBottom = py(73.0);

    const c1 = px(76.2); // Between تعيين التجهيزات and طبيعة التجهيزات
    const c2 = px(47.7); // Between طبيعة التجهيزات and القسم
    const c3 = px(35.7); // Between القسم and القسم الفرعي
    const c4 = px(21.4); // Between القسم الفرعي and الكمية

    const rHeader = py(54.4);
    const rRow1 = py(60.6);
    const rRow2 = py(66.8);
    const rSubTotal = py(69.8);

    ctx.fillStyle = '#0f172a';

    // Outer table border
    ctx.lineWidth = fs(0.75);
    ctx.strokeRect(tLeft, tTop, tRight - tLeft, tBottom - tTop);

    // Vertical column lines
    [c1, c2, c3, c4].forEach((cx) => {
      ctx.beginPath();
      ctx.moveTo(cx, tTop);
      ctx.lineTo(cx, tBottom);
      ctx.stroke();
    });

    // Horizontal line below table header (spans full width)
    ctx.beginPath();
    ctx.moveTo(tLeft, rHeader);
    ctx.lineTo(tRight, rHeader);
    ctx.stroke();

    // Horizontal lines for Row 1 and Row 2 (spanning c1/c2 on right, and Quantity column on left, leaving القسم and القسم الفرعي tall!)
    [rRow1, rRow2].forEach((ry) => {
      // Right part (columns 1 & 2: from c2 to tRight)
      ctx.beginPath();
      ctx.moveTo(c2, ry);
      ctx.lineTo(tRight, ry);
      ctx.stroke();
      // Left part (column 5 Quantity: from tLeft to c4)
      ctx.beginPath();
      ctx.moveTo(tLeft, ry);
      ctx.lineTo(c4, ry);
      ctx.stroke();
    });

    // Sub-row in Quantity column for "المجموع"
    ctx.beginPath();
    ctx.moveTo(tLeft, rSubTotal);
    ctx.lineTo(c4, rSubTotal);
    ctx.stroke();

    // Vertical split inside "المجموع" row
    const cTotalSplit = px(12.5);
    ctx.beginPath();
    ctx.moveTo(cTotalSplit, rSubTotal);
    ctx.lineTo(cTotalSplit, tBottom);
    ctx.stroke();

    // Table Header Labels
    ctx.textAlign = 'center';
    ctx.font = `700 ${fs(11.5)}px "Amiri", "Cairo", serif`;
    ctx.fillText('تعيين التجهيزات', (c1 + tRight) / 2, py(49.2));

    ctx.fillText('طبيعة التجهيزات', (c2 + c1) / 2, py(49.0));
    ctx.fillText('(النوع و العلامة و النموذج)', (c2 + c1) / 2, py(51.3));
    ctx.fillText('الرقم التسلسلي', (c2 + c1) / 2, py(53.6));

    ctx.fillText('القسم', (c3 + c2) / 2, py(49.2));
    ctx.fillText('القسم الفرعي', (c4 + c3) / 2, py(49.2));
    ctx.fillText('الكمية', (tLeft + c4) / 2, py(49.0));

    // Pre-printed Table Cells
    ctx.font = `400 ${fs(11.5)}px "Amiri", "Cairo", serif`;
    ctx.fillText('كاميرات المراقبة', (c1 + tRight) / 2, py(56.2));
    ctx.fillText('الداخلية', (c1 + tRight) / 2, py(58.6));

    ctx.fillText('كاميرات المراقبة', (c1 + tRight) / 2, py(62.3));
    ctx.fillText('الخارجية', (c1 + tRight) / 2, py(64.7));

    ctx.font = `400 ${fs(13)}px "Amiri", "Cairo", serif`;
    ctx.fillText('نوع المسجل', (c1 + tRight) / 2, py(69.0));

    // Pre-printed Section "ج" and Sub-section "01"
    ctx.font = `700 ${fs(14.5)}px "Amiri", "Cairo", serif`;
    ctx.fillText('ج', (c3 + c2) / 2, py(64.2));
    ctx.fillText('01', (c4 + c3) / 2, py(63.8));

    // Pre-printed "المجموع"
    ctx.font = `400 ${fs(11.5)}px "Amiri", "Cairo", serif`;
    ctx.fillText('المجموع', (cTotalSplit + c4) / 2, py(71.6));

    // Signature & Date below table (placed cleanly below table bottom 73.0%)
    ctx.textAlign = 'right';
    ctx.font = `400 ${fs(10.5)}px "Amiri", "Cairo", serif`;
    ctx.fillText('حرر ب: .................في....................', px(30.4), py(75.3));

    ctx.textAlign = 'center';
    ctx.fillText('(امضاء و ختم المعني)', px(16.2), py(77.3));

    // 5 Bottom Logistics & Security Lines
    ctx.textAlign = 'right';
    ctx.font = `400 ${fs(9.8)}px "Amiri", "Cairo", serif`;
    const bottomLines: Array<{ y: number; text: string }> = [
      {
        y: 79.1,
        text: '-بلد منشأ التجهيزات .: ..........................................................................................................................................................',
      },
      {
        y: 81.2,
        text: '-بلد قدوم التجهيزات .: ..........................................................................................................................................................',
      },
      {
        y: 83.2,
        text: '-كيفيات نقل التجهيزات : ... ...................................................................................................................................................',
      },
      {
        y: 85.2,
        text: '-مكان و أماكن تخزين و استعمال التجهيزات : ....................................................................................................................................',
      },
      {
        y: 87.2,
        text: '-شروط حفظ التجهيزات في مأمن : ..............................................................................................................................................',
      },
    ];
    for (const bl of bottomLines) {
      ctx.fillText(bl.text, px(95.2), py(bl.y));
    }

    // Bottom separator & 5 Footnotes
    ctx.lineWidth = fs(0.7);
    ctx.beginPath();
    ctx.moveTo(px(30.0), py(88.0));
    ctx.lineTo(px(95.2), py(88.0));
    ctx.stroke();

    ctx.font = `700 ${fs(9.5)}px "Amiri", "Cairo", serif`;
    ctx.fillText('1 – اشطب العبارة المستغنى عنها.', px(95.2), py(89.3));
    ctx.fillText('2 – اذكر أسماء و ألقاب أو الغرض الاجتماعي لطالب الرخصة.', px(95.2), py(91.3));
    ctx.fillText('3 – حدد العنوان الشخصي أو عنوان المقر الاجتماعي لطالب الرخصة.', px(95.2), py(93.3));
    ctx.fillText('4 – عندما يقدم الطلب من شخص طبيعي أو معنوي غير متعامل.', px(95.2), py(95.3));
    ctx.fillText('5 و 6 – عندما يقدم الطلب من متعامل معتمد.', px(95.2), py(97.3));
  }

  ctx.restore();
}

/**
 * Renders the complete Page 3 administrative registration reference line:
 *   رقم / 142 م ت ش ع / م ت ع / م ت ا م م / 2020
 * on a single continuous baseline (y = 13.9%) using the original serif font
 * ("Amiri", "Cairo", serif) so that the Arabic labels, slashes, registration
 * number (p3_ref_number = 142), and reference year (p3_ref_year = 2020) are
 * 100% collinear on the exact same line with the original font.
 */
export function drawPage3ReferenceLine(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  fields: PdfFieldConfig[],
  values: Record<string, string>,
  options: RenderOverlayOptions
) {
  const px = (xPct: number) => (xPct / 100) * w;
  const py = (yPct: number) => (yPct / 100) * h;
  const fs = (pt: number) => (pt / 595.28) * w;

  const refNumField = fields.find((f) => f.id === 'p3_ref_number');
  const refYearField = fields.find((f) => f.id === 'p3_ref_year');

  const baseYPct = (refNumField?.y ?? 13.9) + options.globalOffsetY;
  const yLine = py(baseYPct);
  const fontPt = (refNumField?.fontSize ?? 9.8) * options.fontSizeScale;
  const fontPx = fs(fontPt);
  const originalFont = `700 ${fontPx}px "Amiri", "Cairo", serif`;

  const refNumVal = (values['p3_ref_number'] ?? '').trim();
  const refYearVal =
    values['p3_ref_year'] !== undefined ? values['p3_ref_year'].trim() : '2020';

  ctx.save();
  ctx.font = originalFont;
  ctx.textBaseline = 'alphabetic';

  // Cleanly mask the entire reference line strip on Page 3 (covers uploaded scan or background)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(px(58.0), yLine - fontPx * 1.05, px(37.6), fontPx * 1.45);

  let cursorX = px(95.2 + options.globalOffsetX);

  const drawToken = (
    text: string,
    dir: 'rtl' | 'ltr',
    color: string,
    gapAfterPt = 2.0
  ) => {
    ctx.direction = dir;
    ctx.textAlign = 'right';
    ctx.fillStyle = color;
    ctx.fillText(text, cursorX, yLine);
    const width = ctx.measureText(text).width;
    cursorX -= width + fs(gapAfterPt);
  };

  // 1. "رقم" + "/"
  drawToken('رقم', 'rtl', '#0f172a', 1.2);
  drawToken('/', 'ltr', '#0f172a', 2.2);

  // 2. Modifiable registration number (e.g. "142") in original font on the exact same line
  const numShiftX = refNumField ? px(refNumField.xLeft - 87.2) : 0;
  const numShiftY = refNumField ? py(refNumField.y - 13.9) : 0;
  const numTextWidth = refNumVal ? ctx.measureText(refNumVal).width : fs(15);
  const numSlotWidth = Math.max(fs(16), numTextWidth + fs(4));
  const numRightX = cursorX + numShiftX;
  const numLeftX = numRightX - numSlotWidth;

  if (options.showFieldBoxes) {
    const isSel = options.activeFieldId === 'p3_ref_number';
    ctx.save();
    ctx.fillStyle = isSel ? 'rgba(37, 99, 235, 0.12)' : 'rgba(37, 99, 235, 0.06)';
    ctx.strokeStyle = isSel ? 'rgba(37, 99, 235, 0.65)' : 'rgba(37, 99, 235, 0.35)';
    ctx.lineWidth = isSel ? 1.5 : 1;
    ctx.setLineDash([3, 2]);
    ctx.fillRect(numLeftX, yLine + numShiftY - fontPx * 0.95, numSlotWidth, fontPx * 1.3);
    ctx.strokeRect(numLeftX, yLine + numShiftY - fontPx * 0.95, numSlotWidth, fontPx * 1.3);
    ctx.restore();
  }

  if (refNumVal) {
    ctx.direction = 'ltr';
    ctx.textAlign = 'center';
    ctx.fillStyle = options.inkColor || '#0f172a';
    ctx.fillText(refNumVal, (numLeftX + numRightX) / 2, yLine + numShiftY);
  }
  cursorX -= numSlotWidth + fs(2.2);

  // 3. "م ت ش ع / م ت ع / م ت ا م م /"
  drawToken('م ت ش ع', 'rtl', '#0f172a', 1.8);
  drawToken('/', 'ltr', '#0f172a', 1.8);
  drawToken('م ت ع', 'rtl', '#0f172a', 1.8);
  drawToken('/', 'ltr', '#0f172a', 1.8);
  drawToken('م ت ا م م', 'rtl', '#0f172a', 1.8);
  drawToken('/', 'ltr', '#0f172a', 2.2);

  // 4. Modifiable reference year (e.g. "2020") in original font on the exact same line
  const yearShiftX = refYearField ? px(refYearField.xLeft - 64.2) : 0;
  const yearShiftY = refYearField ? py(refYearField.y - 13.9) : 0;
  const yearTextWidth = refYearVal ? ctx.measureText(refYearVal).width : fs(22);
  const yearSlotWidth = Math.max(fs(22), yearTextWidth + fs(4));
  const yearRightX = cursorX + yearShiftX;
  const yearLeftX = yearRightX - yearSlotWidth;

  if (options.showFieldBoxes) {
    const isSel = options.activeFieldId === 'p3_ref_year';
    ctx.save();
    ctx.fillStyle = isSel ? 'rgba(37, 99, 235, 0.12)' : 'rgba(37, 99, 235, 0.06)';
    ctx.strokeStyle = isSel ? 'rgba(37, 99, 235, 0.65)' : 'rgba(37, 99, 235, 0.35)';
    ctx.lineWidth = isSel ? 1.5 : 1;
    ctx.setLineDash([3, 2]);
    ctx.fillRect(yearLeftX, yLine + yearShiftY - fontPx * 0.95, yearSlotWidth, fontPx * 1.3);
    ctx.strokeRect(yearLeftX, yLine + yearShiftY - fontPx * 0.95, yearSlotWidth, fontPx * 1.3);
    ctx.restore();
  }

  if (refYearVal) {
    ctx.direction = 'ltr';
    ctx.textAlign = 'center';
    ctx.fillStyle = options.inkColor || '#0f172a';
    ctx.fillText(refYearVal, (yearLeftX + yearRightX) / 2, yLine + yearShiftY);
  }

  ctx.restore();
}

/**
 * Draws the user's Arabic/French values in the Cairo font directly at the
 * mapped field coordinates for the specified page.
 */
export function drawFilledFieldsOverlay(
  ctx: CanvasRenderingContext2D,
  pageNumber: 1 | 2 | 3,
  w: number,
  h: number,
  fields: PdfFieldConfig[],
  values: Record<string, string>,
  options: RenderOverlayOptions
) {
  ctx.save();
  const px = (xPct: number) => (xPct / 100) * w;
  const py = (yPct: number) => (yPct / 100) * h;
  const fs = (pt: number) => (pt / 595.28) * w;

  if (pageNumber === 3) {
    // Mask any underline under the Republic header on Page 3 (e.g. from an uploaded PDF scan)
    // and redraw the clean un-underlined Republic header identical to Pages 1 and 2
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px(10.0), py(1.2), px(80.0), py(3.4));
    ctx.fillStyle = '#0f172a';
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.font = `700 ${fs(14.5)}px "Amiri", "Cairo", serif`;
    ctx.fillText(
      'الجمهوريـــــــــــــة الجزائريـــــــــــــة الديمقراطيـــــــــــــة الشعبيـــــــــــــة',
      px(49.5),
      py(3.8)
    );
    ctx.restore();

    // Draw the unified Page 3 registration reference line ("رقم / 142 م ت ش ع / م ت ع / م ت ا م م / 2020")
    // in the original Amiri serif font on a single exact baseline
    drawPage3ReferenceLine(ctx, w, h, fields, values, options);
  }

  // Market Strikethrough on Page 3 ("1 – اشطب العبارة المستغنى عنها")
  if (pageNumber === 3) {
    if (options.showFieldBoxes) {
      ctx.save();
      ctx.setLineDash([3, 2]);
      ctx.lineWidth = 1;
      // Box around "– الوطنية."
      const isNatStruck =
        options.marketStrike === 'strike_national' ||
        options.marketStrike === 'strike_both';
      ctx.fillStyle = isNatStruck
        ? 'rgba(220, 38, 38, 0.08)'
        : 'rgba(16, 185, 129, 0.08)';
      ctx.strokeStyle = isNatStruck
        ? 'rgba(220, 38, 38, 0.5)'
        : 'rgba(5, 150, 105, 0.5)';
      ctx.fillRect(px(19.8), py(14.5), px(10.0), py(2.5));
      ctx.strokeRect(px(19.8), py(14.5), px(10.0), py(2.5));

      // Box around "–الخارجية (1)"
      const isExtStruck =
        options.marketStrike === 'strike_external' ||
        options.marketStrike === 'strike_both';
      ctx.fillStyle = isExtStruck
        ? 'rgba(220, 38, 38, 0.08)'
        : 'rgba(16, 185, 129, 0.08)';
      ctx.strokeStyle = isExtStruck
        ? 'rgba(220, 38, 38, 0.5)'
        : 'rgba(5, 150, 105, 0.5)';
      ctx.fillRect(px(15.8), py(17.9), px(12.4), py(2.5));
      ctx.strokeRect(px(15.8), py(17.9), px(12.4), py(2.5));
      ctx.restore();
    }

    if (options.marketStrike !== 'none') {
      ctx.save();
      ctx.strokeStyle = options.inkColor;
      ctx.lineWidth = fs(2.1);
      ctx.lineCap = 'round';

      if (
        options.marketStrike === 'strike_external' ||
        options.marketStrike === 'strike_both'
      ) {
        // Cross out "–الخارجية (1)"
        ctx.beginPath();
        ctx.moveTo(px(16.2), py(19.25));
        ctx.lineTo(px(27.8), py(19.25));
        ctx.stroke();
      }

      if (
        options.marketStrike === 'strike_national' ||
        options.marketStrike === 'strike_both'
      ) {
        // Cross out "– الوطنية."
        ctx.beginPath();
        ctx.moveTo(px(20.2), py(15.85));
        ctx.lineTo(px(29.4), py(15.85));
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  const pageFields = fields.filter(
    (f) =>
      f.page === pageNumber &&
      f.id !== 'p3_ref_number' &&
      f.id !== 'p3_ref_year'
  );

  for (const field of pageFields) {
    const isWilayaHeader =
      field.syncKey === 'wilaya_header' ||
      field.id === 'p1_wilaya' ||
      field.id === 'p2_wilaya' ||
      field.id === 'p3_wilaya';
    const rawVal =
      values[field.id] !== undefined && values[field.id].trim() !== ''
        ? values[field.id]
        : isWilayaHeader
        ? values['p1_wilaya'] || 'ولاية وهران'
        : '';
    const xL = px(field.xLeft + options.globalOffsetX);
    const xR = px(field.xRight + options.globalOffsetX);
    const yBase = py(field.y + options.globalOffsetY);
    const boxWidth = Math.max(20, xR - xL);
    const scaledPt = isWilayaHeader
      ? field.fontSize
      : field.fontSize * options.fontSizeScale;
    const fontPx = fs(scaledPt);

    // Paint clean white mask over static printed text (e.g. "ولاية وهران" on uploaded PDFs)
    if (field.maskBackground) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(xL - fs(2), yBase - fontPx * 1.1, boxWidth + fs(4), fontPx * 1.45);
      ctx.restore();
    }

    // Optional interactive highlight boxes during live preview / calibration
    if (options.showFieldBoxes && field.id !== 'p1_applicant_name') {
      const isSelected = options.activeFieldId === field.id;
      const boxH = field.multiline ? py(field.height || 5.2) : fontPx * 1.45;
      const boxTop = field.multiline ? yBase - fontPx * 0.95 : yBase - fontPx * 1.05;

      ctx.save();
      ctx.fillStyle = isSelected
        ? 'rgba(37, 99, 235, 0.10)'
        : rawVal.trim()
        ? 'rgba(37, 99, 235, 0.06)'
        : 'rgba(245, 158, 11, 0.08)';
      ctx.strokeStyle = isSelected
        ? 'rgba(37, 99, 235, 0.65)'
        : rawVal.trim()
        ? 'rgba(37, 99, 235, 0.35)'
        : 'rgba(217, 119, 6, 0.45)';
      ctx.lineWidth = isSelected ? 1.5 : 1;
      ctx.setLineDash([3, 2]);
      ctx.fillRect(xL, boxTop, boxWidth, boxH);
      ctx.strokeRect(xL, boxTop, boxWidth, boxH);
      ctx.restore();
    }

    if (!rawVal.trim()) continue;

    const headerWeight = field.page === 3 ? '700' : '400';

    ctx.save();
    ctx.fillStyle = isWilayaHeader ? '#0f172a' : options.inkColor;
    ctx.font = isWilayaHeader
      ? `${headerWeight} ${fontPx}px "Amiri", "Cairo", serif`
      : `${options.fontWeight} ${fontPx}px "Cairo", sans-serif`;
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
      // Split lines or wrap within boxWidth
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
      // Single-line field centered in its dotted segment / box
      ctx.fillText(rawVal, anchorX, yBase, boxWidth - fs(2));
    }

    ctx.restore();
  }

  ctx.restore();
}
