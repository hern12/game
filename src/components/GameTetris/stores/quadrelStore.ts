import { observable, action, computed } from 'mobx';
import red from '@material-ui/core//colors/red';
import green from '@material-ui/core//colors/green';
import blue from '@material-ui/core//colors/blue';
import yellow from '@material-ui/core//colors/yellow';
import grey from '@material-ui/core//colors/grey';
import deepPurple from '@material-ui/core//colors/deepPurple';
import boardStore from './boardStore';
import heapStore from './heapStore';

export type Point = {
  x: number;
  y: number;
};

export type Shape = [Point, Point, Point, Point];

const COLORS = [red[800], green[400], blue[900], yellow[700], grey[600], deepPurple[500]];

const SHAPES = (() => {
  const createShape = (...args: number[]): Shape => {
    return [{ x: args[0], y: args[1] }, { x: args[2], y: args[3] }, { x: args[4], y: args[5] }, { x: args[6], y: args[7] }];
  };
  const S: Shape[] = [
    createShape(0, 0, 1, 0, -1, 1, 0, 1),
    createShape(0, -1, 0, 0, 1, 0, 1, 1),
    createShape(0, 0, 1, 0, -1, 1, 0, 1),
    createShape(0, -1, 0, 0, 1, 0, 1, 1),
  ];
  const Z: Shape[] = [
    createShape(-1, 0, 0, 0, 0, 1, 1, 1),
    createShape(0, -1, -1, 0, 0, 0, -1, 1),
    createShape(-1, 0, 0, 0, 0, 1, 1, 1),
    createShape(0, -1, -1, 0, 0, 0, -1, 1),
  ];
  const L: Shape[] = [
    createShape(0, -1, 0, 0, 0, 1, 1, 1),
    createShape(-1, 0, 0, 0, 1, 0, -1, 1),
    createShape(-1, -1, 0, -1, 0, 0, 0, 1),
    createShape(1, -1, -1, 0, 0, 0, 1, 0)
  ];
  const J: Shape[] = [
    createShape(0, -1, 0, 0, 0, 1, -1, 1),
    createShape(-1, -1, -1, 0, 0, 0, 1, 0),
    createShape(0, -1, 1, -1, 0, 0, 0, 1),
    createShape(-1, 0, 0, 0, 1, 0, 1, 1)
  ];
  const I: Shape[] = [
    createShape(-1, 0, 0, 0, 1, 0, 2, 0),
    createShape(0, -1, 0, 0, 0, 1, 0, 2),
    createShape(-1, 0, 0, 0, 1, 0, 2, 0),
    createShape(0, -1, 0, 0, 0, 1, 0, 2)
  ];
  const O: Shape[] = [
    createShape(0, 0, 1, 0, 0, 1, 1, 1),
    createShape(0, 0, 1, 0, 0, 1, 1, 1),
    createShape(0, 0, 1, 0, 0, 1, 1, 1),
    createShape(0, 0, 1, 0, 0, 1, 1, 1),
  ];
  const T: Shape[] = [
    createShape(-1, 0, 0, 0, 1, 0, 0, 1),
    createShape(0, -1, 0, 0, 0, 1, -1, 0),
    createShape(-1, 0, 0, 0, 1, 0, 0, -1),
    createShape(0, -1, 0, 0, 0, 1, 1, 0)
  ];
  return [S, Z, L, J, I, O, T];
})();

export type QuadrelCode = {
  shapeCode: number;
  formCode: number;
  colorCode: number;
}

export type Quadrel = {
  point: Point;
  color: string;
};

export class QuadrelStore {
  @observable nowQuadrelCode: QuadrelCode;
  @observable nextQuadrelCode: QuadrelCode;
  @observable fallPoint: Point;
  @observable pause: boolean;
  @observable up: number;
  @observable show: boolean;

  readonly boardStore: typeof boardStore;
  readonly heapStore: typeof heapStore;

  readonly shapes: Shape[][];
  readonly colors: string[];

  private timer: number;
  private rate: number;
  private full: number;
  private intervalTime: number;
  private fallTime: number;
  private plusRate: number;

  constructor() {
    this.boardStore = boardStore;
    this.heapStore = heapStore;
    this.shapes = SHAPES;
    this.colors = COLORS;
    this.rate = 0;
    this.full = 100;
    this.intervalTime = Math.floor(1000 / 60);
    this.fallTime = 400;
    this.plusRate = this.full / (this.fallTime / this.intervalTime);
    this.onReStart();
  }

  @action onReStart() {
    window.clearInterval(this.timer);
    this.nowQuadrelCode = {
      shapeCode: this.getShapeCode(),
      formCode: this.getFormCode(),
      colorCode: this.getColorCode(),
    };
    this.nextQuadrelCode = {
      shapeCode: this.getShapeCode(),
      formCode: this.getFormCode(),
      colorCode: this.getColorCode(),
    };
    this.fallPoint = {
      x: boardStore.col / 2 - 1,
      y: -this.nowQuadrelsForm.reduce<number>((prev, curr) => prev > curr.y ? prev : curr.y, 0) - 1,
    }
    this.pause = true;
    this.rate = 0;
    this.up = 0;
    this.show = false;
    this.heapStore.onRestart();
  }

  @action onTogglePause() {
    if (!this.heapStore.gameover) {
      if (this.pause) {
        this.pause = false;
        this.timer = window.setInterval(this.onDecline, this.intervalTime);
      } else {
        this.pause = true;
        window.clearInterval(this.timer);
      }
    }  
  }

  @action onChangeForm() {
    if (!this.pause && !this.heapStore.gameover) {
      let code = this.nowQuadrelCode.formCode + 1;
      code = code > 3 ? 0 : code;
      const quadrelForm = this.shapes[this.nowQuadrelCode.shapeCode][code];
      const newPoint = this.canChangeForm(this.fallPoint, quadrelForm);
      if (newPoint) {
        this.nowQuadrelCode.formCode = code;
        this.fallPoint = newPoint;
      }
    }  
  }

  @action onLeft() {
    if (!this.pause && !this.heapStore.gameover) {
      const newPoint = { x: this.fallPoint.x - 1, y: this.fallPoint.y };
      if (this.testQuadrelsForm(newPoint, this.nowQuadrelsForm)) {
        this.fallPoint = newPoint;
      }
    }
  }

  @action onRight() {
    if (!this.pause && !this.heapStore.gameover) {
      const newPoint = { x: this.fallPoint.x + 1, y: this.fallPoint.y };
      if (this.testQuadrelsForm(newPoint, this.nowQuadrelsForm)) {
        this.fallPoint = newPoint;
      }
    }
  }

  @action onSpeedUp(up?: number) {
    this.up += up || 10;
  }

  @action onSpeedRecover() {
    this.up = 0;
  }

  @action.bound onDecline() {
    this.rate = this.rate + this.plusRate + this.up;
    if (this.rate > this.full) {
      this.rate = 0;
      const newPoint = { x: this.fallPoint.x, y: this.fallPoint.y + 1 };
      if (this.testQuadrelsForm(newPoint, this.nowQuadrelsForm)) {
        this.fallPoint = newPoint;
        this.show = true;
      } else {
        if (this.heapStore.onAddQuadrels(this.nowQuadrels)) {
          this.nowQuadrelCode = this.nextQuadrelCode;
          this.nextQuadrelCode = {
            shapeCode: this.getShapeCode(),
            formCode: this.getFormCode(),
            colorCode: this.getColorCode(),
          };
          this.fallPoint = {
            x: boardStore.col / 2 - 1,
            y: -this.nowQuadrelsForm.reduce<number>((prev, curr) => prev > curr.y ? prev : curr.y, 0) - 1,
          };
          this.show = false;
        } else {
          this.pause = true;
          this.rate = 0;
          this.up = 0;
          window.clearInterval(this.timer);
        }
      }
    }  
  }

  @computed get nowQuadrelsForm() {
    const { shapeCode, formCode } = this.nowQuadrelCode;
    return this.shapes[shapeCode][formCode];
  }

  @computed get nowQuadrels() {
    const { shapeCode, formCode, colorCode } = this.nowQuadrelCode;
    const { x, y } = this.fallPoint;
    const color = this.colors[colorCode];
    return this.shapes[shapeCode][formCode].map<Quadrel>(p => ({ point: { x: p.x + x, y: p.y + y }, color }));
  }

  @computed get nextQuadrels() {
    const { shapeCode, formCode, colorCode } = this.nextQuadrelCode;
    const color = this.colors[colorCode];
    return this.shapes[shapeCode][formCode].map<Quadrel>(point => ({ point, color }));
  }

  randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getShapeCode(code?: number) {
    if (code === undefined || (code < 0 && code >= 7)) {
      return this.randomInt(0, 6);
    }
    return code;
  }

  getFormCode(code?: number) {
    if (code === undefined || (code < 0 && code >= 4)) {
      return this.randomInt(0, 3)
    }
    return code;
  }

  getColorCode(code?: number) {
    if (code === undefined || (code < 0 && code >= 6)) {
      return this.randomInt(0, 5);
    }
    return code;
  }

  getRealQuadrelsForm(fallPoint: Point, quadrelsForm: Point[]): Point[] {
    return quadrelsForm.map(p => ({ x: p.x + fallPoint.x, y: p.y + fallPoint.y }));
  }

  includeHeap(point: Point) {
    return this.heapStore.heap.some(({ point: { x, y } }) => point.x === x && point.y === y);
  }

  testQuadrelsForm(fallPoint: Point, quadrelsForm: Point[]) {
    return this.getRealQuadrelsForm(fallPoint, quadrelsForm).every(point => !this.includeHeap(point) && point.x >= 0 && point.x < this.boardStore.col && point.y < this.boardStore.row)
  }

  canChangeForm(fallPoint: Point, quadrelsForm: Point[]): Point | null {
    if (this.testQuadrelsForm(fallPoint, quadrelsForm)) {
      return fallPoint;
    }
    const { x, y } = fallPoint;
    const farLeftX = quadrelsForm.reduce<number>((prev, curr) => prev < curr.x ? prev : curr.x, 0);
    const farLeftPoints = quadrelsForm.filter(point => point.x === farLeftX);
    let leftX = x;
    let i = 3;
    while (i-- > 0) {
      leftX--;
      if (this.testQuadrelsForm({ x: leftX, y }, quadrelsForm)) {
        return { x: leftX, y };
      }
      if (farLeftPoints.some(point => this.includeHeap({ x: point.x + leftX, y: point.y + y }))) {
        break;
      }
    }
    let rightX = x;
    const farRightX = quadrelsForm.reduce<number>((prev, curr) => prev > curr.x ? prev : curr.x, 0);
    const farRightPoints = quadrelsForm.filter(point => point.x === farRightX);
    i = 3;
    while (i-- > 0) {
      rightX++;
      if (this.testQuadrelsForm({ x: rightX, y }, quadrelsForm)) {
        return { x: rightX, y };
      }
      if (farRightPoints.some(point => this.includeHeap({ x: point.x + rightX, y: point.y + y }))) {
        break;
      }
    }
    return null;
  };
}

const quadrelStore = new QuadrelStore();

export default quadrelStore;
