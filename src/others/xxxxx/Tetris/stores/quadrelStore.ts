import { observable, action, computed } from 'mobx';
import red from 'material-ui/colors/red';
import green from 'material-ui/colors/green';
import blue from 'material-ui/colors/blue';
import yellow from 'material-ui/colors/yellow';
import grey from 'material-ui/colors/grey';
import deepPurple from 'material-ui/colors/deepPurple';
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
  let S: Shape[] = [
    createShape(0, 0, 1, 0, -1, 1, 0, 1),
    createShape(0, -1, 0, 0, 1, 0, 1, 1),
    createShape(0, 0, 1, 0, -1, 1, 0, 1),
    createShape(0, -1, 0, 0, 1, 0, 1, 1),
  ];
  let Z: Shape[] = [
    createShape(-1, 0, 0, 0, 0, 1, 1, 1),
    createShape(0, -1, -1, 0, 0, 0, -1, 1),
    createShape(-1, 0, 0, 0, 0, 1, 1, 1),
    createShape(0, -1, -1, 0, 0, 0, -1, 1),
  ];
  let L: Shape[] = [
    createShape(0, -1, 0, 0, 0, 1, 1, 1),
    createShape(-1, 0, 0, 0, 1, 0, -1, 1),
    createShape(-1, -1, 0, -1, 0, 0, 0, 1),
    createShape(1, -1, -1, 0, 0, 0, 1, 0)
  ];
  let J: Shape[] = [
    createShape(0, -1, 0, 0, 0, 1, -1, 1),
    createShape(-1, -1, -1, 0, 0, 0, 1, 0),
    createShape(0, -1, 1, -1, 0, 0, 0, 1),
    createShape(-1, 0, 0, 0, 1, 0, 1, 1)
  ];
  let I: Shape[] = [
    createShape(-1, 0, 0, 0, 1, 0, 2, 0),
    createShape(0, -1, 0, 0, 0, 1, 0, 2),
    createShape(-1, 0, 0, 0, 1, 0, 2, 0),
    createShape(0, -1, 0, 0, 0, 1, 0, 2)
  ];
  let O: Shape[] = [
    createShape(0, 0, 1, 0, 0, 1, 1, 1),
    createShape(0, 0, 1, 0, 0, 1, 1, 1),
    createShape(0, 0, 1, 0, 0, 1, 1, 1),
    createShape(0, 0, 1, 0, 0, 1, 1, 1),
  ];
  let T: Shape[] = [
    createShape(-1, 0, 0, 0, 1, 0, 0, 1),
    createShape(0, -1, 0, 0, 0, 1, -1, 0),
    createShape(-1, 0, 0, 0, 1, 0, 0, -1),
    createShape(0, -1, 0, 0, 0, 1, 1, 0)
  ];
  return [S, Z, L, J, I, O, T];
})();

export type QuadrelCode = {
  shapeCode: number;
  typeCode: number;
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
    this.nowQuadrelCode = {
      shapeCode: this.getShapeCode(),
      typeCode: this.getTypeCode(),
      colorCode: this.getColorCode(),
    };
    this.nextQuadrelCode = {
      shapeCode: this.getShapeCode(),
      typeCode: this.getTypeCode(),
      colorCode: this.getColorCode(),
    };
    this.fallPoint = {
      x: boardStore.col / 2 - 1,
      y: -this.nowQuadrelsType.reduce<number>((prev, curr) => prev > curr.y ? prev : curr.y, 0) - 1,
    }
    this.pause = true;
    this.rate = 0;
    this.up = 0;
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

  @action onChangeType() {
    if (!this.pause && !this.heapStore.gameover) {
      let code = this.nowQuadrelCode.typeCode + 1;
      code = code > 3 ? 0 : code;
      const quadrelType = this.shapes[this.nowQuadrelCode.shapeCode][code];
      const newPoint = this.canChangeType(this.fallPoint, quadrelType);
      if (newPoint) {
        this.nowQuadrelCode.typeCode = code;
        this.fallPoint = newPoint;
      }
    }  
  }

  @action onLeft() {
    if (!this.pause && !this.heapStore.gameover) {
      const newPoint = this.canToLeft();
      if (newPoint) {
        this.fallPoint = newPoint;
      }
    }
  }

  @action onRight() {
    if (!this.pause && !this.heapStore.gameover) {
      const newPoint = this.canToRigth();
      if (newPoint) {
        this.fallPoint = newPoint;
      }
    }
  }

  @action onSpeedUp() {
    this.up += 10;
  }

  @action onSpeedRecover() {
    this.up = 0;
  }

  @action.bound onDecline() {
    this.rate = this.rate + this.plusRate + this.up;
    if (this.rate > 100) {
      this.rate = 0;
      const newPoint = this.canToBottom();
      if (newPoint) {
        this.fallPoint = newPoint;
      } else {
        const nowQuadrels = this.nowQuadrels;
        if (this.heapStore.onAddQuadrels(nowQuadrels)) {
          this.nowQuadrelCode = this.nextQuadrelCode;
          this.nextQuadrelCode = {
            shapeCode: this.getShapeCode(),
            typeCode: this.getTypeCode(),
            colorCode: this.getColorCode(),
          };
          this.fallPoint = {
            x: boardStore.col / 2 - 1,
            y: -this.nowQuadrelsType.reduce<number>((prev, curr) => prev > curr.y ? prev : curr.y, 0) - 1,
          }
          this.up = 0;
        } else {
          this.pause = true;
          this.rate = 0;
          this.up = 0;
          window.clearInterval(this.timer);
        }
      }
    }  
  }

  @computed get nowQuadrelsType() {
    const { shapeCode, typeCode } = this.nowQuadrelCode;
    return this.shapes[shapeCode][typeCode];
  }

  @computed get nowQuadrels() {
    const { shapeCode, typeCode, colorCode } = this.nowQuadrelCode;
    const color = this.colors[colorCode];
    const { x, y } = this.fallPoint;
    return this.shapes[shapeCode][typeCode].map<Quadrel>(p => ({ point: { x: p.x + x, y: p.y + y }, color }));
  }

  @computed get nextQuadrels() {
    const { shapeCode, typeCode, colorCode } = this.nextQuadrelCode;
    const color = this.colors[colorCode];
    return this.shapes[shapeCode][typeCode].map<Quadrel>(point => ({ point, color }));
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

  getTypeCode(code?: number) {
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

  include(point: Point) {
    return this.heapStore.heap.some(({ point: { x, y } }) => point.x === x && point.y === y);
  }

  getRealQuadrelsType(fallPoint: Point, quadrelsType: Point[]): Point[] {
    return quadrelsType.map(p => ({ x: p.x + fallPoint.x, y: p.y + fallPoint.y }));
  }

  canToLeft(): Point | null {
    const quadrelsType = this.getRealQuadrelsType(this.fallPoint, this.nowQuadrelsType);
    const farLeftPoint = quadrelsType.reduce((prev, curr) => curr.x < prev.x ? curr : prev);
    if (farLeftPoint.x < 1) {
      return null;
    }
    const leftMovedQuadrelsType = quadrelsType.map(({ x, y }) => ({ x: x - 1, y: y }));
    if (leftMovedQuadrelsType.every(point => !this.include(point))) {
      return { x: this.fallPoint.x - 1, y: this.fallPoint.y };
    }
    return null
  }

  canToRigth(): Point | null {
    const quadrelsType = this.getRealQuadrelsType(this.fallPoint, this.nowQuadrelsType);
    const farRightQuadrel = quadrelsType.reduce((prev, curr) => curr.x > prev.x ? curr : prev);
    if (farRightQuadrel.x > this.boardStore.col - 2) {
      return null;
    }
    const rightMovedQuadrelsType = quadrelsType.map(({ x, y }) => ({ x: x + 1, y: y }));
    if (rightMovedQuadrelsType.every(point => !this.include(point))) {
      return { x: this.fallPoint.x + 1, y: this.fallPoint.y };
    }
    return null
  }

  canToBottom(): Point | null {
    const quadrelsType = this.getRealQuadrelsType(this.fallPoint, this.nowQuadrelsType);
    const farBottomPoint = quadrelsType.reduce((prev, curr) => curr.y > prev.y ? curr : prev);
    if (farBottomPoint.y > this.boardStore.row - 2) {
      return null;
    }
    const bottomMovedQuadrelsType = quadrelsType.map(({ x, y }) => ({ x: x, y: y + 1 }));
    if (bottomMovedQuadrelsType.every(point => !this.include(point))) {
      return { x: this.fallPoint.x, y: this.fallPoint.y + 1 };
    }
    return null;
  }

  canChangeType(fallPoint: Point, quadrelsType: Point[]): Point | null {
    const { x, y } = fallPoint;
    const { heap } = this.heapStore;
    let newPoint = { x, y };
    let leftBoundary = x;
    let rightBoundary = x;
    while (leftBoundary > 0) {
      leftBoundary--;
      if (heap.some(({ point }) => point.x === leftBoundary && point.y === y)) {
        break;
      }
    }
    while (rightBoundary < this.boardStore.col - 1) {
      rightBoundary++;
      if (heap.some(({ point }) => point.x === rightBoundary && point.y === y)) {
        break;
      }
    }
    const activitySpace = rightBoundary - leftBoundary + 1;
    const farLeftPoint = quadrelsType.reduce((prev, curr) => curr.x < prev.x ? curr : prev);
    const farRightPoint = quadrelsType.reduce((prev, curr) => curr.x > prev.x ? curr : prev);
    const quadrelsTypeSpace = farRightPoint.x - farLeftPoint.x + 1;
    const farLeftRealPoint = farLeftPoint.x + x;
    const farRightRealPoint = farRightPoint.x + x;
    if (quadrelsTypeSpace <= activitySpace) {
      if (farLeftRealPoint < leftBoundary) {
        newPoint.x += leftBoundary - farLeftRealPoint;
      } else if (farRightRealPoint > rightBoundary) {
        newPoint.x -= farRightRealPoint - rightBoundary;
      }
      const farBottomPoint = quadrelsType.reduce((prev, curr) => curr.y > prev.y ? curr : prev);
      if (farBottomPoint.y + newPoint.y + 2 > this.boardStore.row) {
        return null;
      }
      const bottomMovedQuadrelsType = quadrelsType.map(p => ({ x: p.x + newPoint.x, y: p.y + newPoint.y + 1 }));
      if (bottomMovedQuadrelsType.every(p => !heap.some(({ point: { x, y } }) => p.x === x && p.y === y))) {
        return newPoint;
      }
    }
    return null;
  };
}

const quadrelStore = new QuadrelStore();

export default quadrelStore;
