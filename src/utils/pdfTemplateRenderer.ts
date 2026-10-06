import { PdfFieldConfig } from '../data/pdfSchema';

export type MarketStrikeOption = 'strike_external' | 'strike_national' | 'none';

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
 * Draws the exact, unmodified background of the 3-page Wilaya d'Oran PDF
 * onto a canvas when the user has not uploaded their local PDF file yet.
 * Every header, gray highlight, dotted line, table border, and footnote
 * mirrors the original scanned 3-page document.
 */
export function drawOfficialPageBackground(
  ctx: CanvasRenderingContext2D,
  pageNumber: 1 | 2 | 3,
  w: number,
  h: number
) {
  ctx.save();
  // Pure white paper background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  const px = (xPct: number) => (xPct / 100) * w;
  const py = (yPct: number) => (yPct / 100) * h;
  const fs = (pt: number) => (pt / 595.28) * w;

  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#0f172a';
  ctx.direction = 'rtl';

  if (pageNumber === 1) {
    // Top Republic Header
    ctx.font = `700 ${fs(15)}px "Amiri", "Cairo", serif`;
    ctx.textAlign = 'center';
    ctx.fillText(
      'الجمهوريـــــــــــــة الجزائريـــــــــــــة الديمقراطيـــــــــــــة الشعبيـــــــــــــة',
      px(49.5),
      py(3.8)
    );

    // Right Administrative Block
    ctx.textAlign = 'right';
    ctx.font = `700 ${fs(13)}px "Amiri", "Cairo", serif`;
    ctx.fillText('ولاية وهران', px(90.5), py(8.1));

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

    // Gray highlight boxes on "ملاحظة", "رخصة اقتناء", "رخصة استغلال" (exact replica of scan)
    ctx.fillStyle = '#d1d5db';
    ctx.fillRect(px(86.8), py(62.5), px(8.4), py(4.6)); // ملاحظة
    ctx.fillRect(px(54.8), py(62.5), px(8.8), py(4.6)); // رخصة اقتناء
    ctx.fillRect(px(5.8), py(62.5), px(11.4), py(4.6)); // رخصة استغلال

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
    // Gray highlight behind Republic Header on Page 2
    ctx.fillStyle = '#d1d5db';
    ctx.fillRect(px(25.8), py(1.6), px(47.2), py(4.2));

    ctx.fillStyle = '#0f172a';
    ctx.font = `700 ${fs(14.5)}px "Amiri", "Cairo", serif`;
    ctx.textAlign = 'center';
    ctx.fillText(
      'الجمهوريـــــــــــــة الجزائريـــــــــــــة الديمقراطيــــــــــــة الشعبيـــــــــــة',
      px(49.5),
      py(4.3)
    );

    // Right Administrative Block
    ctx.textAlign = 'right';
    ctx.font = `700 ${fs(13)}px "Amiri", "Cairo", serif`;
    ctx.fillText('ولاية وهران', px(90.5), py(8.3));

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
    // Page 3 Header with gray highlight
    ctx.fillStyle = '#d1d5db';
    ctx.fillRect(px(13.2), py(0.9), px(72.4), py(3.2));

    ctx.fillStyle = '#0f172a';
    ctx.font = `700 ${fs(14.5)}px "Amiri", "Cairo", serif`;
    ctx.textAlign = 'center';
    ctx.fillText(
      'الـجـمـهوريــة الجــزائــريــة الـديـمقــراطيــة الشــعبيــة',
      px(49.5),
      py(3.3)
    );
    ctx.lineWidth = fs(0.7);
    ctx.beginPath();
    ctx.moveTo(px(13.2), py(3.7));
    ctx.lineTo(px(85.6), py(3.7));
    ctx.stroke();

    // Right Admin Header
    ctx.textAlign = 'right';
    ctx.font = `700 ${fs(13)}px "Amiri", "Cairo", serif`;
    ctx.fillText('ولاية وهران', px(90.5), py(6.1));

    ctx.font = `700 ${fs(9.8)}px "Amiri", "Cairo", serif`;
    ctx.fillText('مديرية التنظيم و الشؤون العامة', px(95.2), py(7.9));
    ctx.fillText('مصلحة التنظيم العام', px(93.0), py(9.4));
    ctx.fillText('مكتب تنظيم الأسلحة و المواد المتفجرة', px(95.2), py(10.9));
    ctx.fillText('قسم شركات الحراسة و التجهيزات الحساسة', px(95.2), py(12.4));
    ctx.fillText('رقم/        م ت ش ع / م ت ع / م ت ا م م / 2020', px(95.2), py(13.9));

    // Title with gray box
    ctx.fillStyle = '#d1d5db';
    ctx.fillRect(px(35.6), py(14.3), px(36.2), py(3.1));

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
    // TABLE ON PAGE 3 (Exact coordinates matching scan)
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

    // Gray highlight for "الرقم التسلسلي" in table header
    ctx.fillStyle = '#d1d5db';
    ctx.fillRect(px(57.2), py(52.0), px(9.2), py(2.3));
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

    // Signature & Date below table
    ctx.textAlign = 'right';
    ctx.font = `400 ${fs(10.5)}px "Amiri", "Cairo", serif`;
    ctx.fillText('حرر ب: .................في....................', px(30.4), py(74.3));

    ctx.textAlign = 'center';
    ctx.fillText('(امضاء و ختم المعني)', px(16.2), py(76.8));

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

  // Optional Market Strikethrough on Page 3 ("اشطب العبارة المستغنى عنها")
  if (pageNumber === 3 && options.marketStrike !== 'none') {
    ctx.save();
    ctx.strokeStyle = options.inkColor;
    ctx.lineWidth = fs(1.6);
    if (options.marketStrike === 'strike_external') {
      // Cross out "- الخارجية (1)"
      ctx.beginPath();
      ctx.moveTo(px(19.5), py(19.3));
      ctx.lineTo(px(27.5), py(19.3));
      ctx.stroke();
    } else if (options.marketStrike === 'strike_national') {
      // Cross out "- الوطنية."
      ctx.beginPath();
      ctx.moveTo(px(21.2), py(16.0));
      ctx.lineTo(px(29.0), py(16.0));
      ctx.stroke();
    }
    ctx.restore();
  }

  const pageFields = fields.filter((f) => f.page === pageNumber);

  for (const field of pageFields) {
    const rawVal = values[field.id] || '';
    const xL = px(field.xLeft + options.globalOffsetX);
    const xR = px(field.xRight + options.globalOffsetX);
    const yBase = py(field.y + options.globalOffsetY);
    const boxWidth = Math.max(20, xR - xL);
    const scaledPt = field.fontSize * options.fontSizeScale;
    const fontPx = fs(scaledPt);

    // Optional interactive highlight boxes during live preview / calibration
    if (options.showFieldBoxes) {
      const isSelected = options.activeFieldId === field.id;
      const boxH = field.multiline ? py(field.height || 5.2) : fontPx * 1.45;
      const boxTop = field.multiline ? yBase - fontPx * 0.95 : yBase - fontPx * 1.05;

      ctx.save();
      ctx.fillStyle = isSelected
        ? 'rgba(16, 185, 129, 0.16)'
        : rawVal.trim()
        ? 'rgba(37, 99, 235, 0.06)'
        : 'rgba(245, 158, 11, 0.08)';
      ctx.strokeStyle = isSelected
        ? 'rgba(5, 150, 105, 0.9)'
        : rawVal.trim()
        ? 'rgba(37, 99, 235, 0.35)'
        : 'rgba(217, 119, 6, 0.45)';
      ctx.lineWidth = isSelected ? 2 : 1;
      if (!isSelected) {
        ctx.setLineDash([3, 2]);
      }
      ctx.fillRect(xL, boxTop, boxWidth, boxH);
      ctx.strokeRect(xL, boxTop, boxWidth, boxH);
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

      const lineHeight = fontPx * 1.28;
      wrappedLines.slice(0, 3).forEach((line, idx) => {
        ctx.fillText(line, anchorX, yBase + idx * lineHeight, boxWidth - fs(4));
      });
    } else {
      // Single-line field with automatic width fitting if very long
      ctx.fillText(rawVal, anchorX, yBase, boxWidth - fs(2));
    }

    ctx.restore();
  }

  ctx.restore();
}
