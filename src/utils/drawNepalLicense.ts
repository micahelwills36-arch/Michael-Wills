import { NepalDrivingLicenseState, NepalDrivingLicenseDetails } from '../types';

export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 630;

/**
 * Helper to asynchronously load an HTMLImageElement
 */
export const loadCanvasImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error('Empty image src'));
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src.substring(0, 40)}...`));
    img.src = src;
  });
};

/**
 * Draw photo strictly inside the white box: [X: 765, Y: 140, Width: 180, Height: 220]
 * Filter: grayscale(100%) contrast(110%)
 */
export const drawPassportPhoto = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number = 765,
  y: number = 140,
  w: number = 180,
  h: number = 220
) => {
  ctx.save();

  // Clip to designated photo box with subtle rounded corners
  ctx.beginPath();
  const radius = 4;
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
  ctx.clip();

  // Apply required photo filter
  ctx.filter = 'grayscale(100%) contrast(110%)';

  // Object-fit: cover scaling
  const imgAspect = img.width / img.height;
  const frameAspect = w / h;
  let drawW = w;
  let drawH = h;
  if (imgAspect > frameAspect) {
    drawH = h;
    drawW = h * imgAspect;
  } else {
    drawW = w;
    drawH = w / imgAspect;
  }

  const drawX = x + (w - drawW) / 2;
  const drawY = y + (h - drawH) / 2;

  ctx.drawImage(img, drawX, drawY, drawW, drawH);

  // Reset filter
  ctx.filter = 'none';
  ctx.restore();
};

/**
 * Draw a signature image fitted inside the specified bounding box
 */
export const drawSignatureBox = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number
) => {
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.filter = 'contrast(1.25) brightness(0.95)';

  const imgAspect = img.width / img.height;
  const boxAspect = boxW / boxH;
  let drawW = boxW;
  let drawH = boxH;

  if (imgAspect > boxAspect) {
    drawW = boxW;
    drawH = boxW / imgAspect;
  } else {
    drawH = boxH;
    drawW = boxH * imgAspect;
  }

  const drawX = boxX + (boxW - drawW) / 2;
  const drawY = boxY + (boxH - drawH) / 2;

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();
};

/**
 * Word wrap helper for the Address field (max 2 lines)
 */
const drawWrappedAddress = (
  ctx: CanvasRenderingContext2D,
  text: string,
  startX: number,
  startY: number,
  maxWidth: number = 270,
  lineHeight: number = 22
) => {
  if (!text) return;

  // Clean and split lines if user explicitly typed newlines
  const rawLines = text.split('\n');
  const lines: string[] = [];

  for (const rawLine of rawLines) {
    const words = rawLine.trim().split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = ctx.measureText(testLine).width;
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
        if (lines.length >= 2) break;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine && lines.length < 2) {
      lines.push(currentLine);
    }
    if (lines.length >= 2) break;
  }

  // Draw up to 2 lines
  lines.slice(0, 2).forEach((line, index) => {
    ctx.fillText(line, startX, startY + index * lineHeight);
  });
};

/**
 * Pure Rendering Function for Nepal Driving License (Front)
 *
 * Strictly draws ONLY dynamic values, photo, and signatures.
 * NO static headers, NO static labels, NO static chip/boxes.
 * Everything is placed at exact coordinates matching the pre-printed template.
 */
export const renderCanvas = async (
  ctx: CanvasRenderingContext2D,
  state: NepalDrivingLicenseState | NepalDrivingLicenseDetails,
  bgImage?: HTMLImageElement | null
) => {
  // Clear canvas
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 1. Draw pre-printed background template
  if (bgImage) {
    ctx.drawImage(bgImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // 2. Set default typography for dynamic text values
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // ==========================================
  // 1. LEFT COLUMN VALUES ONLY
  // ==========================================
  // D.L. No. Value: Draw at [X: 135, Y: 120] (Right after pre-printed "D.L.No.:")
  const dlNoValue = state.dlNo || '';
  if (dlNoValue) {
    ctx.fillText(dlNoValue, 135, 120);
  }

  // Blood Group Value: Draw at [X: 135, Y: 155] (Right after pre-printed "B.G.:")
  const bgValue = state.bg || (state as NepalDrivingLicenseDetails).bloodGroup || '';
  if (bgValue) {
    ctx.fillText(bgValue, 135, 155);
  }

  // D.O.I. Value: Draw at [X: 145, Y: 390] (Right after pre-printed "D.O.I.:")
  const doiValue = state.doi || '';
  if (doiValue) {
    ctx.fillText(doiValue, 145, 390);
  }

  // D.O.E. Value: Draw at [X: 145, Y: 430] (Right after pre-printed "D.O.E.:")
  const doeValue = state.doe || '';
  if (doeValue) {
    ctx.fillText(doeValue, 145, 430);
  }

  // ==========================================
  // 2. CENTER COLUMN VALUES ONLY
  // ==========================================
  // Name Value: Draw at [X: 435, Y: 180] (Right after "Name:")
  const nameValue = (state.fullName || '').toUpperCase();
  if (nameValue) {
    ctx.fillText(nameValue, 435, 180);
  }

  // Address Value: Draw at [X: 465, Y: 220] (Support word wrap across 2 lines)
  const addressValue = state.address || '';
  if (addressValue) {
    drawWrappedAddress(ctx, addressValue, 465, 220, 270, 22);
  }

  // License Office Value: Draw at [X: 535, Y: 275] (Right after "License Office:")
  const officeValue = state.licenseOffice || '';
  if (officeValue) {
    ctx.fillText(officeValue, 535, 275);
  }

  // D.O.B. Value: Draw at [X: 440, Y: 315] (Right after "D.O.B.:")
  const dobValue = state.dob || '';
  if (dobValue) {
    ctx.fillText(dobValue, 440, 315);
  }

  // F/H Name Value: Draw at [X: 480, Y: 355] (Right after "F/H Name:")
  const fhNameValue = (state.fhName || '').toUpperCase();
  if (fhNameValue) {
    ctx.fillText(fhNameValue, 480, 355);
  }

  // Citizenship No. Value: Draw at [X: 520, Y: 395] (Right after "Citizenship No.:")
  const citizenValue = state.citizenshipNo || '';
  if (citizenValue) {
    ctx.fillText(citizenValue, 520, 395);
  }

  // Passport No. Value: Draw at [X: 500, Y: 435] (Right after "Passport No.:")
  const passportValue = state.passportNo !== undefined ? state.passportNo : '0';
  if (passportValue) {
    ctx.fillText(passportValue, 500, 435);
  }

  // Contact No. Value: Draw at [X: 480, Y: 475] (Right after "Contact No.:")
  const contactValue = state.contactNo || '';
  if (contactValue) {
    ctx.fillText(contactValue, 480, 475);
  }

  // ==========================================
  // 3. RIGHT COLUMN VALUES & PHOTO
  // ==========================================
  // Category Value: Draw at [X: 875, Y: 415] in bold 22px Arial (Right after "Category:")
  const categoryValue = state.category || (state as NepalDrivingLicenseDetails).categories || 'A, B';
  if (categoryValue) {
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText(categoryValue, 875, 415);
  }

  ctx.restore(); // Restore font and style

  // Passport Photo: Place INSIDE the blank white box on top right:
  // [X: 765, Y: 140, Width: 180, Height: 220]
  const photoSource = state.userPhoto || (state as NepalDrivingLicenseDetails).photoUrl;
  if (photoSource) {
    try {
      const photoImg = await loadCanvasImage(photoSource);
      drawPassportPhoto(ctx, photoImg, 765, 140, 180, 220);
    } catch (e) {
      console.warn('Could not load user photo:', e);
    }
  }

  // ==========================================
  // 4. SIGNATURES
  // ==========================================
  // Issued By Signature: Place inside bottom-left box at [X: 65, Y: 490, Width: 240, Height: 70]
  const issuedBySource =
    state.issuedBySignature || (state as NepalDrivingLicenseDetails).issuedBySignUrl;
  if (issuedBySource) {
    try {
      const issuedImg = await loadCanvasImage(issuedBySource);
      drawSignatureBox(ctx, issuedImg, 65, 490, 240, 70);
    } catch (e) {
      console.warn('Could not load issuedBySignature:', e);
    }
  }

  // Holder Signature: Place inside bottom-right box at [X: 680, Y: 490, Width: 260, Height: 70]
  const holderSource =
    state.holderSignature || (state as NepalDrivingLicenseDetails).holderSignUrl;
  if (holderSource) {
    try {
      const holderImg = await loadCanvasImage(holderSource);
      drawSignatureBox(ctx, holderImg, 680, 490, 260, 70);
    } catch (e) {
      console.warn('Could not load holderSignature:', e);
    }
  }
};

/**
 * Backward compatibility alias for drawLicenseCard
 */
export const drawLicenseCard = renderCanvas;

