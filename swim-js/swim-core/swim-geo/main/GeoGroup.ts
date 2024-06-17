// Copyright 2015-2024 Nstream, inc.
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
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {R2Shape} from "@swim/math";
import {R2Group} from "@swim/math";
import type {GeoProjection} from "./GeoProjection";
import type {GeoShapeLike} from "./GeoShape";
import {GeoShape} from "./GeoShape";
import {GeoBox} from "./GeoBox";

/** @public */
export class GeoGroup<S extends GeoShape = GeoShape> extends GeoShape implements Debug {
  constructor(shapes: readonly S[]) {
    super();
    this.shapes = shapes;
    this.boundingBox = null;
  }

  /** @internal */
  declare readonly typeid?: "GeoGroup";

  isDefined(): boolean {
    return this.shapes.length !== 0;
  }

  readonly shapes: readonly S[];

  override get lngMin(): number {
    return this.bounds.lngMin;
  }

  override get latMin(): number {
    return this.bounds.latMin;
  }

  override get lngMax(): number {
    return this.bounds.lngMax;
  }

  override get latMax(): number {
    return this.bounds.latMax;
  }

  override contains(that: GeoShapeLike): boolean;
  override contains(x: number, y: number): boolean;
  override contains(that: GeoShapeLike | number, y?: number): boolean {
    return false; // TODO
  }

  override intersects(that: GeoShapeLike): boolean {
    return false; // TODO
  }

  override project(f: GeoProjection): R2Group {
    const oldShapes = this.shapes;
    const n = oldShapes.length;
    if (n === 0) {
      return R2Group.empty();
    }
    const newShapes = new Array<R2Shape>(n);
    for (let i = 0; i < n; i += 1) {
      newShapes[i] = oldShapes[i]!.project(f);
    }
    return new R2Group(newShapes);
  }

  /** @internal */
  readonly boundingBox: GeoBox | null;

  override get bounds(): GeoBox {
    let boundingBox = this.boundingBox;
    if (boundingBox === null) {
      let lngMin = Infinity;
      let latMin = Infinity;
      let lngMax = -Infinity;
      let latMax = -Infinity;
      const shapes = this.shapes;
      for (let i = 0; i < shapes.length; i += 1) {
        const shape = shapes[i]!;
        lngMin = Math.min(lngMin, shape.lngMin);
        latMin = Math.min(latMin, shape.latMin);
        lngMax = Math.max(shape.lngMax, lngMax);
        latMax = Math.max(shape.latMax, latMax);
      }
      boundingBox = new GeoBox(lngMin, latMin, lngMax, latMax);
      (this as Mutable<this>).boundingBox = boundingBox;
    }
    return boundingBox;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GeoGroup) {
      return Arrays.equivalent(this.shapes, that.shapes, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GeoGroup) {
      return Arrays.equal(this.shapes, that.shapes);
    }
    return false;
  }

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    const shapes = this.shapes;
    const n = shapes.length;
    output = output.write("GeoGroup").write(46/*'.'*/);
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
  static empty<S extends GeoShape>(): GeoGroup<S> {
    return new GeoGroup<S>(Arrays.empty());
  }

  static of<S extends GeoShape>(...shapes: S[]): GeoGroup<S> {
    return new GeoGroup<S>(shapes);
  }
}
