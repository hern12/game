import React, { useEffect, useRef } from 'react';

export type PropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];

export type Properties<T> = Pick<T, PropertyNames<T>>;

export interface CanvasFontStyles {
  fontStyle?: 'normal' | 'italic' | 'oblique';
  fontVariant?: 'normal' | 'small-caps';
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontSize?: number;
  fontFamily?: string;
}

export interface CanvasStyles extends Partial<Properties<CanvasFillStrokeStyles & CanvasPathDrawingStyles & CanvasShadowStyles & CanvasTextDrawingStyles>>, CanvasFontStyles {
}

// const canvasStylesKey: Array<keyof CanvasStyles> = ['direction', 'fillStyle', 'font', 'lineCap', 'lineDashOffset', 'lineJoin', 'lineWidth', 'miterLimit', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY', 'strokeStyle', 'textAlign', 'textBaseline'];

const _styles: CanvasStyles = {
  fillStyle: 'rgba(0,0,0,0)',
  strokeStyle: 'rgba(0,0,0,0)',
  lineWidth: 0,
  textAlign: 'start',
  textBaseline: 'top',
  fontStyle: 'normal',
  fontVariant: 'normal',
  fontWeight: 'normal',
  fontSize: 16,
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
};

export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce((result, key) => {
    result[key] = obj[key];
    return result;
  }, {} as Pick<T, K>);
}

function setCanvasStyles(ctx: CanvasRenderingContext2D, styles: CanvasStyles) {
  styles.font = styles.font || `${styles.fontStyle || _styles.fontStyle} ${styles.fontVariant || _styles.fontVariant} ${styles.fontWeight || _styles.fontWeight} ${styles.fontSize || _styles.fontSize}px ${styles.fontFamily || _styles.fontFamily}`;
  Object.keys(styles).forEach(key => {
    if (key in ctx && styles[key]) ctx[key] = styles[key];
  });
}

function draw(ctx: CanvasRenderingContext2D, children: React.ReactNode) {
  if (!children) return;
  React.Children.forEach(children, child => {
    if (React.isValidElement(child)) {
      const props = child.props as any;
      const callName = (child.type as any).callName
      if (callName) {
        Canvas[callName].call(ctx, props);
      }
      draw(ctx, props.children);
    }
  });
}

export interface CanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  children?: React.ReactNode;
  canvasStyles?: CanvasStyles;
}

function Canvas(props: CanvasProps) {
  const { children, canvasStyles, ...other } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current && canvasRef.current.getContext('2d');
    if (ctx) setCanvasStyles(ctx, { ..._styles, ...canvasStyles });
  }, [canvasStyles])

  useEffect(() => {
    const ctx = canvasRef.current && canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      draw(ctx, children);
    }
  });

  return <canvas ref={canvasRef} {...other} />;
}

export interface RectProps extends CanvasStyles {
  children?: React.ReactNode;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  r?: number;
}

export function Rect(this: CanvasRenderingContext2D, props: RectProps) {
  const { children, x = 0, y = 0, w = 0, h = 0, r, ...styles } = props;
  this.save();
  setCanvasStyles(this, styles);
  if (r) {
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
  } else {
    this.rect(x, y, w, h);
  }
  this.fill();
  this.stroke();
  this.restore();
  return null;
};

Rect.callName = 'Rect';
Canvas.Rect = Rect;

export interface TextProps extends CanvasStyles, CanvasFontStyles {
  children?: string;
  text?: string;
  x?: number;
  y?: number;
  maxWidth?: number;
}

export function Text(this: CanvasRenderingContext2D, props: TextProps) {
  const { children = '', text, x = 0, y = 0, maxWidth, ...styles } = props;
  this.save();
  setCanvasStyles(this, styles);
  this.fillText(text || children, x, y, maxWidth);
  this.strokeText(text || children, x, y, maxWidth);
  this.restore();
  return null;
}

Text.callName = 'Text';
Canvas.Text = Text;

export default Canvas;
