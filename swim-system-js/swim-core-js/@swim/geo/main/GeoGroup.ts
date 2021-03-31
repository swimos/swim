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
import {ShapeR2, GroupR2} from "@swim/math";
import type {GeoProjection} from "./GeoProjection";
import {AnyGeoShape, GeoShape} from "./GeoShape";
import {GeoBox} from "./GeoBox";

export class GeoGroup<S extends GeoShape = GeoShape> extends GeoShape implements Equals, Equivalent, Debug {
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

  isDefined(): boolean {
    return this.shapes.length !== 0;
  }

  declare readonly shapes: ReadonlyArray<S>;

  get lngMin(): number {
    return this.bounds.lngMin;
  }

  get latMin(): number {
    return this.bounds.latMin;
  }

  get lngMax(): number {
    return this.bounds.lngMax;
  }

  get latMax(): number {
    return this.bounds.latMax;
  }

  contains(that: AnyGeoShape): boolean;
  contains(x: number, y: number): boolean;
  contains(that: AnyGeoShape | number, y?: number): boolean {
    return false; // TODO
  }

  intersects(that: AnyGeoShape): boolean {
    return false; // TODO
  }

  project(f: GeoProjection): GroupR2 {
    const oldShapes = this.shapes;
    const n = oldShapes.length;
    if (n > 0) {
      const newShapes = new Array<ShapeR2>(n);
      for (let i = 0; i < n; i += 1) {
        newShapes[i] = oldShapes[i]!.project(f);
      }
      return new GroupR2(newShapes);
    } else {
      return GroupR2.empty();
    }
  }

  /** @hidden */
  declare readonly boundingBox: GeoBox | null;

  get bounds(): GeoBox {
    let boundingBox = this.boundingBox;
    if (boundingBox === null) {
      let lngMin = Infinity;
      let latMin = Infinity;
      let lngMax = -Infinity;
      let latMax = -Infinity;
      const shapes = this.shapes;
      for (let i = 0, n = shapes.length; i < n; i += 1) {
        const shape = shapes[i]!;
        lngMin = Math.min(lngMin, shape.lngMin);
        latMin = Math.min(latMin, shape.latMin);
        lngMax = Math.max(shape.lngMax, lngMax);
        latMax = Math.max(shape.latMax, latMax);
      }
      boundingBox = new GeoBox(lngMin, latMin, lngMax, latMax);
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
    } else if (that instanceof GeoGroup) {
      return Arrays.equivalent(this.shapes, that.shapes, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GeoGroup) {
      return Arrays.equal(this.shapes, that.shapes);
    }
    return false;
  }

  debug(output: Output): void {
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
  }

  toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static empty<S extends GeoShape>(): GeoGroup<S> {
    return new GeoGroup(Arrays.empty);
  }

  static of<S extends GeoShape>(...shapes: S[]): GeoGroup<S> {
    return new GeoGroup(shapes);
  }
}
