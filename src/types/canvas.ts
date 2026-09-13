export type CanvasElementType =
  | 'text'
  | 'photo'
  | 'logo'
  | 'shape'
  | 'signature'
  | 'stamp'
  | 'barcode'
  | 'watermark'
  | 'image'
  | 'badge';

export type ResizeHandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export interface CanvasElementStyle {
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: string;
  borderRadius?: number | string;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: string;
  opacity?: number;
  padding?: number | string;
  boxShadow?: string;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  filter?: string;
  lineHeight?: number | string;
  objectFit?: 'contain' | 'cover' | 'fill';
}

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  isLocked: boolean;
  isHidden: boolean;
  content: string;
  style: CanvasElementStyle;
}
