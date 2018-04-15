import * as React from 'react';

export interface CanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  children?: (ctx: CanvasRenderingContext2D, funs: {
    setRoundedRectPath: (ctx: CanvasRenderingContext2D, x?: number, y?: number, width?: number, height?: number, radius?: number) => void;
  }) => void;
}

class Canvas extends React.Component<CanvasProps> {
  private canvasRefObject: React.RefObject<HTMLCanvasElement>;

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
    const { children } = this.props;
    if (children && typeof children === 'function') {
      // 把canvas实例的ctx对象，和一些绘制方法传递给children方法
      children(this.getCanvasContext2D(), { setRoundedRectPath: this.setRoundedRectPath });
    }
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

  // 公开一个绘制圆角矩形路径的方法
  setRoundedRectPath(ctx: CanvasRenderingContext2D, x = 0, y = 0, width = 0, height = 0, radius = 0) {
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
  }

  render() {
    const { width, height, style, children, ...other } = this.props;
    return (
      <canvas
        ref={this.canvasRefObject}
        width={width}
        height={height}
        style={{ width, height, ...style }}
        {...other}
      />
    );
  }
}

export default Canvas;
