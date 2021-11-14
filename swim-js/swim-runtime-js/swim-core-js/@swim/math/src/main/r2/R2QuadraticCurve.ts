// Copyright 2015-2021 Swim Inc.
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
import type {AnyR2Shape} from "./R2Shape";
import {R2Point} from "./R2Point";
import type {R2CurveContext} from "./R2CurveContext";
import {R2BezierCurve} from "./R2BezierCurve";

/** @public */
export class R2QuadraticCurve extends R2BezierCurve implements Debug {
  constructor(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number) {
    super();
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  isDefined(): boolean {
    return isFinite(this.x0) && isFinite(this.y0)
        && isFinite(this.x1) && isFinite(this.y1)
        && isFinite(this.x2) && isFinite(this.y2);
  }

  readonly x0: number;

  readonly y0: number;

  readonly x1: number;

  readonly y1: number;

  readonly x2: number;

  readonly y2: number;

  override get xMin(): number {
    return Math.min(this.x0, this.x1, this.x2);
  }

  override get yMin(): number {
    return Math.min(this.y0, this.y1, this.y2);
  }

  override get xMax(): number {
    return Math.max(this.x0, this.x1, this.x2);
  }

  override get yMax(): number {
    return Math.max(this.y0, this.y1, this.y2);
  }

  override interpolateX(u: number): number {
    const v = 1.0 - u;
    const x01 = v * this.x0 + u * this.x1;
    const x12 = v * this.x1 + u * this.x2;
    return v * x01 + u * x12;
  }

  override interpolateY(u: number): number {
    const v = 1.0 - u;
    const y01 = v * this.y0 + u * this.y1;
    const y12 = v * this.y1 + u * this.y2;
    return v * y01 + u * y12;
  }

  override interpolate(u: number): R2Point {
    const v = 1.0 - u;
    const x01 = v * this.x0 + u * this.x1;
    const y01 = v * this.y0 + u * this.y1;
    const x12 = v * this.x1 + u * this.x2;
    const y12 = v * this.y1 + u * this.y2;
    const x02 = v * x01 + u * x12;
    const y02 = v * y01 + u * y12;
    return new R2Point(x02, y02);
  }

  override contains(that: AnyR2Shape): boolean;
  override contains(x: number, y: number): boolean;
  override contains(that: AnyR2Shape | number, y?: number): boolean {
    return false; // TODO
  }

  override intersects(that: AnyR2Shape): boolean {
    return false; // TODO
  }

  override split(u: number): [R2QuadraticCurve, R2QuadraticCurve] {
    const v = 1.0 - u;
    const x01 = v * this.x0 + u * this.x1;
    const y01 = v * this.y0 + u * this.y1;
    const x12 = v * this.x1 + u * this.x2;
    const y12 = v * this.y1 + u * this.y2;
    const x02 = v * x01 + u * x12;
    const y02 = v * y01 + u * y12;
    const c0 = new R2QuadraticCurve(this.x0, this.y0, x01, y01, x02, y02);
    const c1 = new R2QuadraticCurve(x02, y02, x12, y12, this.x2, this.y2);
    return [c0, c1];
  }

  override transform(f: R2Function): R2QuadraticCurve {
    return new R2QuadraticCurve(f.transformX(this.x0, this.y0), f.transformY(this.x0, this.y0),
                                f.transformX(this.x1, this.y1), f.transformY(this.x1, this.y1),
                                f.transformX(this.x2, this.y2), f.transformY(this.x2, this.y2));
  }

  override drawMove(context: R2CurveContext): void {
    context.moveTo(this.x0, this.y0);
  }

  override drawRest(context: R2CurveContext): void {
    context.quadraticCurveTo(this.x1, this.y1, this.x2, this.y2);
  }

  override transformDrawMove(context: R2CurveContext, f: R2Function): void {
    context.moveTo(f.transformX(this.x0, this.y0), f.transformY(this.x0, this.y0));
  }

  override transformDrawRest(context: R2CurveContext, f: R2Function): void {
    context.quadraticCurveTo(f.transformX(this.x1, this.y1), f.transformY(this.x1, this.y1),
                             f.transformX(this.x2, this.y2), f.transformY(this.x2, this.y2));
  }

  override writeMove<T>(output: Output<T>): Output<T> {
    output = output.write(77/*'M'*/);
    output = Format.displayNumber(output, this.x0);
    output = output.write(44/*','*/);
    output = Format.displayNumber(output, this.y0);
    return output;
  }

  override writeRest<T>(output: Output<T>): Output<T> {
    output = output.write(81/*'Q'*/);
    output = Format.displayNumber(output, this.x1);
    output = output.write(44/*','*/);
    output = Format.displayNumber(output, this.y1);
    output = output.write(44/*','*/);
    output = Format.displayNumber(output, this.x2);
    output = output.write(44/*','*/);
    output = Format.displayNumber(output, this.y2);
    return output;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2QuadraticCurve) {
      return Numbers.equivalent(this.x0, that.x0, epsilon)
          && Numbers.equivalent(this.y0, that.y0, epsilon)
          && Numbers.equivalent(this.x1, that.x1, epsilon)
          && Numbers.equivalent(this.y1, that.y1, epsilon)
          && Numbers.equivalent(this.x2, that.x2, epsilon)
          && Numbers.equivalent(this.y2, that.y2, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2QuadraticCurve) {
      return this.x0 === that.x0 && this.y0 === that.y0
          && this.x1 === that.x1 && this.y1 === that.y1
          && this.x2 === that.x2 && this.y2 === that.y2;
    }
    return false;
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("R2Curve").write(46/*'.'*/).write("quadratic").write(40/*'('*/)
                   .debug(this.x0).write(", ").debug(this.y0).write(", ")
                   .debug(this.x1).write(", ").debug(this.y1).write(", ")
                   .debug(this.x2).write(", ").debug(this.y2).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return Format.debug(this);
  }
}
