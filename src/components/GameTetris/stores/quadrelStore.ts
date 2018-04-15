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
    window.clearInterval(this.timer);
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
      let newPoint = { x: this.fallPoint.x - 1, y: this.fallPoint.y };
      if (this.testQuadrelsType(newPoint, this.nowQuadrelsType)) {
        this.fallPoint = newPoint;
      }
    }
  }

  @action onRight() {
    if (!this.pause && !this.heapStore.gameover) {
      let newPoint = { x: this.fallPoint.x + 1, y: this.fallPoint.y };
      if (this.testQuadrelsType(newPoint, this.nowQuadrelsType)) {
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
    if (this.rate > this.full) {
      this.rate = 0;
      let newPoint = { x: this.fallPoint.x, y: this.fallPoint.y + 1 };
      if (this.testQuadrelsType(newPoint, this.nowQuadrelsType)) {
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

  getRealQuadrelsType(fallPoint: Point, quadrelsType: Point[]): Point[] {
    return quadrelsType.map(p => ({ x: p.x + fallPoint.x, y: p.y + fallPoint.y }));
  }

  includeHeap(point: Point) {
    return this.heapStore.heap.some(({ point: { x, y } }) => point.x === x && point.y === y);
  }

  testQuadrelsType(fallPoint: Point, quadrelsType: Point[]) {
    return this.getRealQuadrelsType(fallPoint, quadrelsType).every(point => !this.includeHeap(point) && point.x >= 0 && point.x < this.boardStore.col && point.y < this.boardStore.row)
  }

  canChangeType(fallPoint: Point, quadrelsType: Point[]): Point | null {
    if (this.testQuadrelsType(fallPoint, quadrelsType)) {
      return fallPoint;
    }
    const { x, y } = fallPoint;
    const farLeftX = quadrelsType.reduce<number>((prev, curr) => prev < curr.x ? prev : curr.x, 0);
    const farLeftPoints = quadrelsType.filter(point => point.x === farLeftX);
    let leftX = x;
    let i = 3;
    while (i-- > 0) {
      leftX--;
      if (this.testQuadrelsType({ x: leftX, y }, quadrelsType)) {
        return { x: leftX, y };
      }
      if (farLeftPoints.some(point => this.includeHeap({ x: point.x + leftX, y: point.y + y }))) {
        break;
      }
    }
    let rightX = x;
    const farRightX = quadrelsType.reduce<number>((prev, curr) => prev > curr.x ? prev : curr.x, 0);
    const farRightPoints = quadrelsType.filter(point => point.x === farRightX);
    i = 3;
    while (i-- > 0) {
      rightX++;
      if (this.testQuadrelsType({ x: rightX, y }, quadrelsType)) {
        return { x: rightX, y };
      }
      if (farRightPoints.some(point => this.includeHeap({ x: point.x + rightX, y: point.y + y }))) {
        break;
      }
    }
    return null;
    // const { x, y } = fallPoint;
    // const { heap } = this.heapStore;
    // let newPoint = { x, y };
    // let leftBoundary = x;
    // let rightBoundary = x;
    // while (leftBoundary > 0) {
    //   if (heap.some(({ point }) => point.x === leftBoundary && point.y === y)) {
    //     break;
    //   }
    //   leftBoundary--;
    // }
    // while (rightBoundary < this.boardStore.col - 1) {
    //   if (heap.some(({ point }) => point.x === rightBoundary && point.y === y)) {
    //     break;
    //   }
    //   rightBoundary++;
    // }
    // const activitySpace = rightBoundary - leftBoundary + 1;
    // console.log(activitySpace);
    // const farLeftPoint = quadrelsType.reduce((prev, curr) => curr.x < prev.x ? curr : prev);
    // const farRightPoint = quadrelsType.reduce((prev, curr) => curr.x > prev.x ? curr : prev);
    // const quadrelsTypeSpace = farRightPoint.x - farLeftPoint.x + 1;
    // const farLeftRealPoint = farLeftPoint.x + x;
    // const farRightRealPoint = farRightPoint.x + x;
    // if (quadrelsTypeSpace <= activitySpace) {
    //   if (farLeftRealPoint < leftBoundary) {
    //     newPoint.x += leftBoundary - farLeftRealPoint;
    //   } else if (farRightRealPoint > rightBoundary) {
    //     newPoint.x -= farRightRealPoint - rightBoundary;
    //   }
    //   const farBottomPoint = quadrelsType.reduce((prev, curr) => curr.y > prev.y ? curr : prev);
    //   if (farBottomPoint.y + newPoint.y + 2 > this.boardStore.row) {
    //     return null;
    //   }
    //   const bottomMovedQuadrelsType = quadrelsType.map(p => ({ x: p.x + newPoint.x, y: p.y + newPoint.y + 1 }));
    //   if (bottomMovedQuadrelsType.every(p => !heap.some(({ point: { x, y } }) => p.x === x && p.y === y))) {
    //     return newPoint;
    //   }
    // }
    // return null;
  };
}

const quadrelStore = new QuadrelStore();

export default quadrelStore;
