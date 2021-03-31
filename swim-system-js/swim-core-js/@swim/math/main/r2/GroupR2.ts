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

import {Equivalent, Equals, Lazy, Arrays} from "@swim/util";
import {Debug, Format, Output} from "@swim/codec";
import type {R2Function} from "./R2Function";
import {AnyShapeR2, ShapeR2} from "./ShapeR2";
import {BoxR2} from "./BoxR2";

export class GroupR2<S extends ShapeR2 = ShapeR2> extends ShapeR2 implements Equals, Equivalent, Debug {
  constructor(shapes: ReadonlyArray<S>) {
    super();
    Object.defineProperty(this, "shapes", {
      value: shapes,
      enumerable: true,
    });
    Object.defineProperty(this, "boundingBox", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly shapes: ReadonlyArray<S>;

  isDefined(): boolean {
    return this.shapes.length !== 0;
  }

  get xMin(): number {
    return this.bounds.xMin;
  }

  get yMin(): number {
    return this.bounds.yMin;
  }

  get xMax(): number {
    return this.bounds.xMax;
  }

  get yMax(): number {
    return this.bounds.yMax;
  }

  contains(that: AnyShapeR2): boolean;
  contains(x: number, y: number): boolean;
  contains(that: AnyShapeR2 | number, y?: number): boolean {
    return false; // TODO
  }

  intersects(that: AnyShapeR2): boolean {
    return false; // TODO
  }

  transform(f: R2Function): GroupR2 {
    const oldShapes = this.shapes;
    const n = oldShapes.length;
    if (n > 0) {
      const newShapes = new Array<ShapeR2>(n);
      for (let i = 0; i < n; i += 1) {
        newShapes[i] = oldShapes[i]!.transform(f);
      }
      return new GroupR2(newShapes);
    } else {
      return GroupR2.empty();
    }
  }

  /** @hidden */
  declare readonly boundingBox: BoxR2 | null;

  get bounds(): BoxR2 {
    let boundingBox = this.boundingBox;
    if (boundingBox === null) {
      let xMin = Infinity;
      let yMin = Infinity;
      let xMax = -Infinity;
      let yMax = -Infinity;
      const shapes = this.shapes;
      for (let i = 0, n = shapes.length; i < n; i += 1) {
        const shape = shapes[i]!;
        xMin = Math.min(xMin, shape.xMin);
        yMin = Math.min(yMin, shape.yMin);
        xMax = Math.max(shape.xMax, xMax);
        yMax = Math.max(shape.yMax, yMax);
      }
      boundingBox = new BoxR2(xMin, yMin, xMax, yMax);
      Object.defineProperty(this, "boundingBox", {
        value: boundingBox,
        enumerable: true,
        configurable: true,
      });
    }
    return boundingBox;
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GroupR2) {
      return Arrays.equivalent(this.shapes, that.shapes, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GroupR2) {
      return Arrays.equal(this.shapes, that.shapes);
    }
    return false;
  }

  debug(output: Output): void {
    const shapes = this.shapes;
    const n = shapes.length;
    output = output.write("GroupR2").write(46/*'.'*/);
    if (n === 0) {
      output = output.write("empty").write(40/*'('*/);
    } else {
      output = output.write("of").write(40/*'('*/);
      output = output.debug(shapes[0]!);
      for (let i = 1; i < n; i += 1) {
        output = output.write(", ").debug(shapes[i]!);
      }
    }
    output = output.write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static empty<S extends ShapeR2>(): GroupR2<S> {
    return new GroupR2(Arrays.empty);
  }

  static of<S extends ShapeR2>(...shapes: S[]): GroupR2<S> {
    return new GroupR2(shapes);
  }
}
