import * as React from 'react';

export interface RectProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  lineWidth?: number;
  fill?: CanvasRenderingContext2D['fillStyle'];
  stroke?: CanvasRenderingContext2D['strokeStyle'];
}

export interface RoundedRectProps extends RectProps {
  radius?: number;
}

export interface CanvasProps {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

class Canvas extends React.Component<CanvasProps> {
  static Rect = class Rect extends React.Component<RectProps> { };
  static RoundedRect = class RoundedRect extends React.Component<RoundedRectProps> { };

  private canvasRefObject: React.RefObject<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;

  constructor(props: CanvasProps) {
    super(props);
    this.canvasRefObject = React.createRef();
  }

  componentDidMount() {
    this.draw();
  }

  componentDidUpdate(prevProps: Readonly<CanvasProps>) {
    this.draw();
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(error, info.componentStack);
  }

  draw() {
    this.ctx = this.getCanvasContext2D();
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    const { children } = this.props;
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        const name = (child.type as any).name;
        if (name in this) {
          this[name](child.props);
        }  
      }
    });
  }

  getCanvasContext2D() {
    const canvas = this.canvasRefObject.current;
    let ctx: CanvasRenderingContext2D | null;
    if (canvas && canvas.getContext) {
      ctx = canvas.getContext('2d');
      if (!ctx) {
        throw (new Error('Getting the CanvasRenderingContext2D failed!'));
      }
    } else {
      throw (new Error('Getting the <canvas> failed!'));
    }
    return ctx;
  }

  Rect({ x = 0, y = 0, width = 0, height = 0, lineWidth = 1, stroke, fill }: RectProps) {
    const { ctx } = this;
    ctx.save();
    if (stroke) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = stroke;
      ctx.strokeRect(x, y, width, height);
    }
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fillRect(x, y, width, height);
    }
    ctx.restore();
  }

  RoundedRect({ x = 0, y = 0, width = 0, height = 0, radius = 0, lineWidth = 1, stroke, fill }: RoundedRectProps) {
    const { ctx } = this;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
    ctx.lineTo(x + width - radius, y + height);
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    ctx.lineTo(x + width, y + radius);
    ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
    ctx.lineTo(x + radius, y);
    ctx.quadraticCurveTo(x, y, x, y + radius);
    ctx.closePath();
    if (stroke) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    ctx.restore();
  }

  render() {
    const { width, height, className, style } = this.props;
    return (
      <canvas
        ref={this.canvasRefObject}
        moz-opaque=""
        width={width}
        height={height}
        className={className}
        style={{ width, height, ...style }}
      />
    );
  }
}

export default Canvas;
