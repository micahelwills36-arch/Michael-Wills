/**
 * Studio-Grade Signature Cleaning & Dark Ink Engine
 * 
 * Transforms any uploaded photo, scan, or scribble on paper into an authentic,
 * 100% real, deep dark archival ink signature with zero paper background,
 * no dirty rectangular photo box, smooth anti-aliased pen strokes, and auto-trimmed margins.
 */

export interface SignatureProcessOptions {
  inkTone?: 'deep_dark' | 'midnight_black' | 'royal_blue' | 'preserve';
  darknessBoost?: number; // default 1.4
  autoCropMargins?: boolean; // default true
  cropPadding?: number; // default 14px
}

export async function processSignatureTransparent(
  imageUrl: string,
  options: SignatureProcessOptions | number = {}
): Promise<string> {
  // Backward compatibility if second argument is numeric threshold
  const opts: SignatureProcessOptions =
    typeof options === 'number'
      ? { inkTone: 'deep_dark', autoCropMargins: true }
      : { inkTone: 'deep_dark', autoCropMargins: true, ...options };

  const {
    inkTone = 'deep_dark',
    autoCropMargins = true,
    cropPadding = 14,
  } = opts;

  return new Promise((resolve) => {
    if (!imageUrl) {
      resolve('');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let origW = img.naturalWidth || img.width;
        let origH = img.naturalHeight || img.height;

        if (origW === 0 || origH === 0) {
          resolve(imageUrl);
          return;
        }

        // Limit huge camera photo dimensions (e.g. 4000x3000) for performance while keeping super crisp detail
        const MAX_DIM = 1600;
        let scale = 1;
        if (origW > MAX_DIM || origH > MAX_DIM) {
          scale = Math.min(MAX_DIM / origW, MAX_DIM / origH);
        }

        const width = Math.max(1, Math.round(origW * scale));
        const height = Math.max(1, Math.round(origH * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const totalPixels = width * height;

        // 1. Check if image already contains alpha transparency (e.g. existing PNG)
        let transparentPixelCount = 0;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 40) {
            transparentPixelCount++;
          }
        }
        const isAlreadyTransparent = transparentPixelCount > totalPixels * 0.15;

        // Target ink RGB
        let targetR = 8;
        let targetG = 12;
        let targetB = 22; // 100% Deep dark archival ink
        if (inkTone === 'midnight_black') {
          targetR = 0;
          targetG = 0;
          targetB = 0; // Pure 100% black
        } else if (inkTone === 'royal_blue') {
          targetR = 15;
          targetG = 38;
          targetB = 92; // Deep registrar royal blue
        }

        if (isAlreadyTransparent) {
          // Already transparent: boost ink darkness to 100% crisp, rich dark ink
          for (let i = 0; i < data.length; i += 4) {
            const a = data[i + 3];
            if (a < 20) {
              data[i + 3] = 0;
              continue;
            }

            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;

            if (inkTone !== 'preserve') {
              data[i] = targetR;
              data[i + 1] = targetG;
              data[i + 2] = targetB;
            }

            // Darken ink intensity to 100% solid
            if (lum < 160) {
              data[i + 3] = Math.min(255, Math.round(a * 1.35));
            }
          }
        } else {
          // Photo/Scan on paper: calculate adaptive 2D background luminance grid
          // to eliminate paper shadows, uneven phone lighting, flash glare, and gray tints.
          const gridCols = 16;
          const gridRows = 16;
          const cellW = width / gridCols;
          const cellH = height / gridRows;
          const bgGrid: number[][] = [];

          for (let gy = 0; gy < gridRows; gy++) {
            bgGrid[gy] = [];
            for (let gx = 0; gx < gridCols; gx++) {
              const startX = Math.floor(gx * cellW);
              const endX = Math.floor((gx + 1) * cellW);
              const startY = Math.floor(gy * cellH);
              const endY = Math.floor((gy + 1) * cellH);

              const lums: number[] = [];
              const step = Math.max(1, Math.floor((endX - startX) / 12));

              for (let y = startY; y < endY; y += step) {
                for (let x = startX; x < endX; x += step) {
                  const idx = (y * width + x) * 4;
                  const r = data[idx];
                  const g = data[idx + 1];
                  const b = data[idx + 2];
                  lums.push(0.299 * r + 0.587 * g + 0.114 * b);
                }
              }

              if (lums.length > 0) {
                lums.sort((a, b) => a - b);
                // 90th percentile represents the local paper background color
                const p90 = lums[Math.floor(lums.length * 0.9)] || 230;
                bgGrid[gy][gx] = Math.max(120, p90);
              } else {
                bgGrid[gy][gx] = 235;
              }
            }
          }

          // Smooth background grid with 3x3 box blur
          const smoothedBgGrid: number[][] = [];
          for (let gy = 0; gy < gridRows; gy++) {
            smoothedBgGrid[gy] = [];
            for (let gx = 0; gx < gridCols; gx++) {
              let sum = 0;
              let count = 0;
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  const ny = gy + dy;
                  const nx = gx + dx;
                  if (ny >= 0 && ny < gridRows && nx >= 0 && nx < gridCols) {
                    sum += bgGrid[ny][nx];
                    count++;
                  }
                }
              }
              smoothedBgGrid[gy][gx] = sum / count;
            }
          }

          // Process every pixel: remove paper background and render 100% crisp dark ink
          for (let y = 0; y < height; y++) {
            const gyFloat = (y / height) * (gridRows - 1);
            const gy0 = Math.floor(gyFloat);
            const gy1 = Math.min(gridRows - 1, gy0 + 1);
            const fy = gyFloat - gy0;

            for (let x = 0; x < width; x++) {
              const gxFloat = (x / width) * (gridCols - 1);
              const gx0 = Math.floor(gxFloat);
              const gx1 = Math.min(gridCols - 1, gx0 + 1);
              const fx = gxFloat - gx0;

              // Bilinear interpolation of local paper background luminance
              const bgTop = smoothedBgGrid[gy0][gx0] * (1 - fx) + smoothedBgGrid[gy0][gx1] * fx;
              const bgBtm = smoothedBgGrid[gy1][gx0] * (1 - fx) + smoothedBgGrid[gy1][gx1] * fx;
              const localBg = bgTop * (1 - fy) + bgBtm * fy;

              const idx = (y * width + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;

              const darkness = localBg - lum;
              // Noise floor to eliminate paper grain / slight shadows
              const noiseFloor = Math.max(14, localBg * 0.08);

              if (darkness <= noiseFloor) {
                // Paper background -> 100% transparent!
                data[idx + 3] = 0;
              } else {
                // Genuine handwritten ink stroke detected!
                // Normalize darkness into stroke core vs smooth edge
                const maxRange = Math.max(26, localBg * 0.32);
                const rawStrength = Math.min(1, Math.max(0, (darkness - noiseFloor) / maxRange));

                // Contrast S-curve boost for 100% dark solid ink
                const boostedStrength = Math.min(1, Math.pow(rawStrength, 0.65) * 1.35);

                if (inkTone !== 'preserve') {
                  data[idx] = targetR;
                  data[idx + 1] = targetG;
                  data[idx + 2] = targetB;
                } else {
                  // Darken original ink color deeply
                  data[idx] = Math.round(r * 0.3);
                  data[idx + 1] = Math.round(g * 0.3);
                  data[idx + 2] = Math.round(b * 0.3);
                }

                if (boostedStrength >= 0.55) {
                  // Core stroke is 100% solid real dark ink!
                  data[idx + 3] = 255;
                } else {
                  // Anti-aliased stroke contour (smooth pen tip edge)
                  data[idx + 3] = Math.min(255, Math.round((boostedStrength / 0.55) * 255));
                }
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);

        // 3. Auto-crop margins if enabled (crops out huge blank margins from phone photos)
        if (autoCropMargins) {
          let minX = width;
          let minY = height;
          let maxX = 0;
          let maxY = 0;
          let inkCount = 0;

          // Re-scan alpha to find tight ink bounding box
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const alpha = data[(y * width + x) * 4 + 3];
              if (alpha > 30) {
                inkCount++;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }

          // If ink was found, crop tightly with clean padding
          if (inkCount > 15 && maxX > minX && maxY > minY) {
            const cropX = Math.max(0, minX - cropPadding);
            const cropY = Math.max(0, minY - cropPadding);
            const cropW = Math.min(width - cropX, maxX - minX + cropPadding * 2);
            const cropH = Math.min(height - cropY, maxY - minY + cropPadding * 2);

            if (cropW > 10 && cropH > 10) {
              const cropCanvas = document.createElement('canvas');
              cropCanvas.width = cropW;
              cropCanvas.height = cropH;
              const cropCtx = cropCanvas.getContext('2d');
              if (cropCtx) {
                cropCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
                resolve(cropCanvas.toDataURL('image/png'));
                return;
              }
            }
          }
        }

        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Transparent signature processing fallback:', err);
        resolve(imageUrl);
      }
    };

    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
}
