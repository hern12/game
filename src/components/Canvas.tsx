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

const STYLES: CanvasStyles = {
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
  styles.font = styles.font || `${styles.fontStyle || STYLES.fontStyle} ${styles.fontVariant || STYLES.fontVariant} ${styles.fontWeight || STYLES.fontWeight} ${styles.fontSize || STYLES.fontSize}px ${styles.fontFamily || STYLES.fontFamily}`;
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

function isLayoutElement(node: CanvasElement): node is CanvasElement<LayoutProps> {
  return node.type.callName === 'Layout';
}

function isTextElement(node: CanvasElement): node is CanvasElement<TextProps> {
  return node.type.callName === 'Text';
}

function draw(ctx: CanvasRenderingContext2D, children: CanvasNode, parentProps: CanvasBaseProps) {
  React.Children.forEach(children, child => {
    if (isCanvasElement(child)) {
      const mergedProps = { ...parentProps, ...child.props };
      mergedProps.x = parentProps.x! + (child.props.x || 0);
      mergedProps.y = parentProps.y! + (child.props.y || 0);
      if (isLayoutElement(child)) {
        if (child.props.column) {
          let dx = 0;
          React.Children.forEach(child.props.children, _child => {
            mergedProps.x! += dx;
            dx = (_child.props.x || 0) + (_child.props.w || 0);
            draw(ctx, _child, mergedProps);
          });
        } else {
          let dy = 0;
          React.Children.forEach(child.props.children, _child => {
            mergedProps.y! += dy;
            dy = (_child.props.y || 0) + (_child.props.h || 0);
            draw(ctx, _child, mergedProps);
          });
        }
      } else if (isTextElement(child)) {
        draw(ctx, isCanvasText(child.props.text) ? child.props.text : child.props.children, mergedProps);
      } else {
        Canvas[child.type.callName].call(ctx, mergedProps);
        draw(ctx, child.props.children, mergedProps);
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
  const getContext2d = useMemo(() => () => canvasRef.current && canvasRef.current.getContext('2d'), []);

  useEffect(() => {
    const ctx = getContext2d();
    if (ctx) setCanvasStyles(ctx, { ...STYLES, ...canvasStyles });
  }, [canvasStyles, getContext2d]);

  useEffect(() => {
    const ctx = getContext2d();
    if (ctx) {
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      ctx.clearRect(0, 0, w, h);
      draw(ctx, children, { x: 0, y: 0, w, h });
    }
  });
  return <canvas ref={canvasRef} {...other} />;
}

export interface LayoutProps extends CanvasBaseProps {
  children: CanvasElement | CanvasElement[];
  column?: boolean;
}

export function Layout(this: CanvasRenderingContext2D, props: LayoutProps) {
  return null;
}

Layout.callName = 'Layout';
Canvas.Layout = Layout;

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
  if (styles.lineWidth) ctx.stroke();
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
  if (styles.lineWidth) ctx.strokeText(txt, x, y, maxWidth);
  ctx.restore();
  return null;
}

Text.callName = 'Text';
Canvas.Text = Text;

export default Canvas;
