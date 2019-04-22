import React, { useEffect, useRef, useMemo } from 'react';

export type PropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];

export type Properties<T> = Pick<T, PropertyNames<T>>;

export interface CanvasStyles extends Partial<Properties<CanvasFillStrokeStyles & CanvasPathDrawingStyles & CanvasShadowStyles & CanvasTextDrawingStyles>> {
  fontStyle?: 'normal' | 'italic' | 'oblique';
  fontVariant?: 'normal' | 'small-caps';
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontSize?: number;
  fontFamily?: string;
  fontFillStyle?: CanvasFillStrokeStyles['fillStyle'];
  fontStrokeStyle?: CanvasFillStrokeStyles['strokeStyle'];
}

export interface CanvasBaseProps extends CanvasStyles {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  children?: CanvasNode;
}

// const canvasStylesKey: Array<keyof CanvasStyles> = ['direction', 'fillStyle', 'font', 'lineCap', 'lineDashOffset', 'lineJoin', 'lineWidth', 'miterLimit', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY', 'strokeStyle', 'textAlign', 'textBaseline'];

// export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
//   return keys.reduce((result, key) => {
//     result[key] = obj[key];
//     return result;
//   }, {} as Pick<T, K>);
// }

const _styles: CanvasStyles = {
  fillStyle: 'rgba(0, 0, 0, 0)',
  strokeStyle: 'rgba(0, 0, 0, 0)',
  lineWidth: 0,
  textAlign: 'start',
  textBaseline: 'top',
  fontStyle: 'normal',
  fontVariant: 'normal',
  fontWeight: 'normal',
  fontSize: 16,
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
};

function setCanvasStyles(ctx: CanvasRenderingContext2D, styles: CanvasStyles) {
  styles.font = styles.font || `${styles.fontStyle || _styles.fontStyle} ${styles.fontVariant || _styles.fontVariant} ${styles.fontWeight || _styles.fontWeight} ${styles.fontSize || _styles.fontSize}px ${styles.fontFamily || _styles.fontFamily}`;
  Object.keys(styles).forEach(key => {
    if (key in ctx && styles[key]) ctx[key] = styles[key];
  });
}

interface CanvasElementConstructor<P extends CanvasBaseProps> {
  (props: P): React.ReactElement | null;
  callName: string;
}

interface CanvasElement<P extends CanvasBaseProps = CanvasBaseProps, T extends CanvasElementConstructor<P> = CanvasElementConstructor<P>> {
  type: T;
  props: P;
  key: React.Key | null;
}

type CanvasText = string | number;

type CanvasChild = CanvasElement | CanvasText;

interface CanvasNodeArray extends Array<CanvasNode> {}

type CanvasFragment = {} | CanvasNodeArray;

type CanvasNode = CanvasChild | CanvasFragment | boolean | null | undefined;

function isCanvasText(node: CanvasNode): node is CanvasText {
  return typeof node === 'string' || typeof node === 'number';
}

function isCanvasElement<P extends CanvasBaseProps>(node: CanvasNode): node is CanvasElement<P> {
  return React.isValidElement(node) && !!node.type.callName;
}

function draw(ctx: CanvasRenderingContext2D, children: CanvasNode, parentProps: CanvasBaseProps) {
  if (!children) return;
  React.Children.forEach(children, child => {
    if (isCanvasElement(child)) {
      const props = { ...parentProps, ...child.props };
      const callName = child.type.callName;
      props.x = (parentProps.x || 0) + (child.props.x || 0);
      props.y = (parentProps.y || 0) + (child.props.y || 0);
      if (callName === 'Text') {
        draw(ctx, isCanvasText((props as TextProps).text) ? (props as TextProps).text : props.children, props);
      } else {
        Canvas[callName].call(ctx, props);
        draw(ctx, child.props.children, props);
      }
    } else if (isCanvasText(child)) {
      const props = { ...parentProps, text: child };
      if (parentProps.textAlign === 'center') props.x = (parentProps.x || 0) + (parentProps.w || 0) / 2;
      if (parentProps.textBaseline === 'middle') props.y = (parentProps.y || 0) + (parentProps.h || 0) / 2;
      if (parentProps.fontFillStyle) props.fillStyle = parentProps.fontFillStyle;
      if (parentProps.fontStrokeStyle) props.strokeStyle = parentProps.fontStrokeStyle;
      Canvas.Text.call(ctx, props);
    }
  });
}

export interface CanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  children?: CanvasNode;
  canvasStyles?: CanvasStyles;
}

function Canvas(props: CanvasProps) {
  const { children, canvasStyles, ...other } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const getCtx = useMemo(() => () => canvasRef.current && canvasRef.current.getContext('2d'), [canvasRef.current]);

  useEffect(() => {
    const ctx = getCtx();
    if (ctx) setCanvasStyles(ctx, { ..._styles, ...canvasStyles });
  }, [canvasStyles]);

  useEffect(() => {
    const ctx = getCtx();
    if (ctx) {
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      draw(ctx, children, { x: 0, y: 0, w, h });
    }
  });

  return <canvas ref={canvasRef} {...other} />;
}

export interface RectProps extends CanvasBaseProps {
  children?: CanvasNode;
  r?: number;
}

export function Rect(this: CanvasRenderingContext2D, props: RectProps) {
  const { children, x = 0, y = 0, w = 0, h = 0, r, ...styles } = props;
  const ctx = this;
  ctx.save();
  setCanvasStyles(ctx, styles);
  ctx.beginPath();
  if (r) {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  return null;
};

Rect.callName = 'Rect';
Canvas.Rect = Rect;

export interface TextProps extends CanvasBaseProps {
  children?: CanvasText;
  text?: CanvasText;
  maxWidth?: number;
}

export function Text(this: CanvasRenderingContext2D, props: TextProps) {
  const { children, text, x = 0, y = 0, maxWidth, ...styles } = props;
  const ctx = this;
  const txt = isCanvasText(text) ? text.toString() : isCanvasText(children) ? children.toString() : '';
  ctx.save();
  setCanvasStyles(ctx, styles);
  ctx.fillText(txt, x, y, maxWidth);
  ctx.strokeText(txt, x, y, maxWidth);
  ctx.restore();
  return null;
}

Text.callName = 'Text';
Canvas.Text = Text;

export default Canvas;
