// Copyright 2015-2020 Swim inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Numbers} from "@swim/util";
import {Debug, Format, Output} from "@swim/codec";
import type {R2Function} from "./R2Function";
import type {AnyShapeR2} from "./ShapeR2";
import {PointR2} from "./PointR2";
import type {CurveR2Context} from "./CurveR2Context";
import {BezierCurveR2} from "./BezierCurveR2";

export class QuadraticCurveR2 extends BezierCurveR2 implements Debug {
  constructor(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number) {
    super();
    Object.defineProperty(this, "x0", {
      value: x0,
      enumerable: true,
    });
    Object.defineProperty(this, "y0", {
      value: y0,
      enumerable: true,
    });
    Object.defineProperty(this, "x1", {
      value: x1,
      enumerable: true,
    });
    Object.defineProperty(this, "y1", {
      value: y1,
      enumerable: true,
    });
    Object.defineProperty(this, "x2", {
      value: x2,
      enumerable: true,
    });
    Object.defineProperty(this, "y2", {
      value: y2,
      enumerable: true,
    });
  }

  isDefined(): boolean {
    return isFinite(this.x0) && isFinite(this.y0)
        && isFinite(this.x1) && isFinite(this.y1)
        && isFinite(this.x2) && isFinite(this.y2);
  }

  declare readonly x0: number;

  declare readonly y0: number;

  declare readonly x1: number;

  declare readonly y1: number;

  declare readonly x2: number;

  declare readonly y2: number;

  get xMin(): number {
    return Math.min(this.x0, this.x1, this.x2);
  }

  get yMin(): number {
    return Math.min(this.y0, this.y1, this.y2);
  }

  get xMax(): number {
    return Math.max(this.x0, this.x1, this.x2);
  }

  get yMax(): number {
    return Math.max(this.y0, this.y1, this.y2);
  }

  interpolateX(u: number): number {
    const v = 1.0 - u;
    const x01 = v * this.x0 + u * this.x1;
    const x12 = v * this.x1 + u * this.x2;
    return v * x01 + u * x12;
  }

  interpolateY(u: number): number {
    const v = 1.0 - u;
    const y01 = v * this.y0 + u * this.y1;
    const y12 = v * this.y1 + u * this.y2;
    return v * y01 + u * y12;
  }

  interpolate(u: number): PointR2 {
    const v = 1.0 - u;
    const x01 = v * this.x0 + u * this.x1;
    const y01 = v * this.y0 + u * this.y1;
    const x12 = v * this.x1 + u * this.x2;
    const y12 = v * this.y1 + u * this.y2;
    const x02 = v * x01 + u * x12;
    const y02 = v * y01 + u * y12;
    return new PointR2(x02, y02);
  }

  contains(that: AnyShapeR2): boolean;
  contains(x: number, y: number): boolean;
  contains(that: AnyShapeR2 | number, y?: number): boolean {
    return false; // TODO
  }

  intersects(that: AnyShapeR2): boolean {
    return false; // TODO
  }

  split(u: number): [QuadraticCurveR2, QuadraticCurveR2] {
    const v = 1.0 - u;
    const x01 = v * this.x0 + u * this.x1;
    const y01 = v * this.y0 + u * this.y1;
    const x12 = v * this.x1 + u * this.x2;
    const y12 = v * this.y1 + u * this.y2;
    const x02 = v * x01 + u * x12;
    const y02 = v * y01 + u * y12;
    const c0 = new QuadraticCurveR2(this.x0, this.y0, x01, y01, x02, y02);
    const c1 = new QuadraticCurveR2(x02, y02, x12, y12, this.x2, this.y2);
    return [c0, c1];
  }

  transform(f: R2Function): QuadraticCurveR2 {
    return new QuadraticCurveR2(f.transformX(this.x0, this.y0), f.transformY(this.x0, this.y0),
                                f.transformX(this.x1, this.y1), f.transformY(this.x1, this.y1),
                                f.transformX(this.x2, this.y2), f.transformY(this.x2, this.y2));
  }

  drawMove(context: CurveR2Context): void {
    context.moveTo(this.x0, this.y0);
  }

  drawRest(context: CurveR2Context): void {
    context.quadraticCurveTo(this.x1, this.y1, this.x2, this.y2);
  }

  transformDrawMove(context: CurveR2Context, f: R2Function): void {
    context.moveTo(f.transformX(this.x0, this.y0), f.transformY(this.x0, this.y0));
  }

  transformDrawRest(context: CurveR2Context, f: R2Function): void {
    context.quadraticCurveTo(f.transformX(this.x1, this.y1), f.transformY(this.x1, this.y1),
                             f.transformX(this.x2, this.y2), f.transformY(this.x2, this.y2));
  }

  writeMove(output: Output): void {
    output.write(77/*'M'*/);
    Format.displayNumber(this.x0, output)
    output.write(44/*','*/)
    Format.displayNumber(this.y0, output);
  }

  writeRest(output: Output): void {
    output.write(81/*'Q'*/);
    Format.displayNumber(this.x1, output)
    output.write(44/*','*/)
    Format.displayNumber(this.y1, output);
    output.write(44/*','*/)
    Format.displayNumber(this.x2, output)
    output.write(44/*','*/)
    Format.displayNumber(this.y2, output);
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof QuadraticCurveR2) {
      return Numbers.equivalent(this.x0, that.x0, epsilon)
          && Numbers.equivalent(this.y0, that.y0, epsilon)
          && Numbers.equivalent(this.x1, that.x1, epsilon)
          && Numbers.equivalent(this.y1, that.y1, epsilon)
          && Numbers.equivalent(this.x2, that.x2, epsilon)
          && Numbers.equivalent(this.y2, that.y2, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof QuadraticCurveR2) {
      return this.x0 === that.x0 && this.y0 === that.y0
          && this.x1 === that.x1 && this.y1 === that.y1
          && this.x2 === that.x2 && this.y2 === that.y2;
    }
    return false;
  }

  debug(output: Output): void {
    output.write("CurveR2").write(46/*'.'*/).write("quadratic").write(40/*'('*/)
        .debug(this.x0).write(", ").debug(this.y0).write(", ")
        .debug(this.x1).write(", ").debug(this.y1).write(", ")
        .debug(this.x2).write(", ").debug(this.y2).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }
}
