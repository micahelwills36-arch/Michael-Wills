import { toPng, toJpeg } from 'html-to-image';

export interface ExportImageOptions {
  quality?: number;
  pixelRatio?: number;
  cacheBust?: boolean;
  filter?: (node: HTMLElement) => boolean;
  backgroundColor?: string;
  width?: number;
  height?: number;
  style?: Partial<CSSStyleDeclaration>;
}

export async function safeToPng(
  node: HTMLElement,
  options?: ExportImageOptions
): Promise<string> {
  try {
    return await toPng(node, options);
  } catch (error) {
    console.warn('safeToPng first attempt failed, retrying with fallback options...', error);
    try {
      return await toPng(node, {
        ...options,
        cacheBust: false,
        skipFonts: true,
      });
    } catch (fallbackError) {
      console.error('safeToPng failed completely', fallbackError);
      throw fallbackError;
    }
  }
}

export async function safeToJpeg(
  node: HTMLElement,
  options?: ExportImageOptions
): Promise<string> {
  try {
    return await toJpeg(node, options);
  } catch (error) {
    console.warn('safeToJpeg first attempt failed, retrying with fallback options...', error);
    try {
      return await toJpeg(node, {
        ...options,
        cacheBust: false,
        skipFonts: true,
      });
    } catch (fallbackError) {
      console.error('safeToJpeg failed completely', fallbackError);
      throw fallbackError;
    }
  }
}
