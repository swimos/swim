// Copyright 2015-2023 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import {Lazy} from "@swim/util";
import {Arrays} from "@swim/util";
import type {Equals} from "@swim/util";
import type {Equivalent} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {R2Function} from "./R2Function";
import type {R2ShapeLike} from "./R2Shape";
import {R2Shape} from "./R2Shape";
import {R2Box} from "./R2Box";

/** @public */
export class R2Group<S extends R2Shape = R2Shape> extends R2Shape implements Equals, Equivalent, Debug {
  constructor(shapes: readonly S[]) {
    super();
    this.shapes = shapes;
    this.boundingBox = null;
  }

  readonly shapes: readonly S[];

  override isDefined(): boolean {
    return this.shapes.length !== 0;
  }

  override get xMin(): number {
    return this.bounds.xMin;
  }

  override get yMin(): number {
    return this.bounds.yMin;
  }

  override get xMax(): number {
    return this.bounds.xMax;
  }

  override get yMax(): number {
    return this.bounds.yMax;
  }

  override contains(that: R2ShapeLike): boolean;
  override contains(x: number, y: number): boolean;
  override contains(that: R2ShapeLike | number, y?: number): boolean {
    return false; // TODO
  }

  override intersects(that: R2ShapeLike): boolean {
    return false; // TODO
  }

  override transform(f: R2Function): R2Group {
    const oldShapes = this.shapes;
    const n = oldShapes.length;
    if (n === 0) {
      return R2Group.empty();
    }
    const newShapes = new Array<R2Shape>(n);
    for (let i = 0; i < n; i += 1) {
      newShapes[i] = oldShapes[i]!.transform(f);
    }
    return new R2Group(newShapes);
  }

  /** @internal */
  readonly boundingBox: R2Box | null;

  override get bounds(): R2Box {
    let boundingBox = this.boundingBox;
    if (boundingBox === null) {
      let xMin = Infinity;
      let yMin = Infinity;
      let xMax = -Infinity;
      let yMax = -Infinity;
      const shapes = this.shapes;
      for (let i = 0; i < shapes.length; i += 1) {
        const shape = shapes[i]!;
        xMin = Math.min(xMin, shape.xMin);
        yMin = Math.min(yMin, shape.yMin);
        xMax = Math.max(shape.xMax, xMax);
        yMax = Math.max(shape.yMax, yMax);
      }
      boundingBox = new R2Box(xMin, yMin, xMax, yMax);
      (this as Mutable<this>).boundingBox = boundingBox;
    }
    return boundingBox;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Group) {
      return Arrays.equivalent(this.shapes, that.shapes, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Group) {
      return Arrays.equal(this.shapes, that.shapes);
    }
    return false;
  }

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    const shapes = this.shapes;
    const n = shapes.length;
    output = output.write("R2Group").write(46/*'.'*/);
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
    return output;
  }

  override toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static empty<S extends R2Shape>(): R2Group<S> {
    return new R2Group(Arrays.empty());
  }

  static of<S extends R2Shape>(...shapes: S[]): R2Group<S> {
    return new R2Group(shapes);
  }
}
