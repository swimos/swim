// Copyright 2015-2021 Swim inc.
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

import type {R2Spline} from "./R2Spline";
import {R2SplineBuilder} from "./R2SplineBuilder";
import type {R2PathContext} from "./R2PathContext";
import {R2Path} from "./R2Path";

export class R2PathBuilder implements R2PathContext {
  /** @hidden */
  splines: R2Spline[];
  /** @hidden */
  builder: R2SplineBuilder | null;

  constructor() {
    this.splines = [];
    this.builder = null;
  }

  moveTo(x: number, y: number): void {
    let builder = this.builder;
    if (builder !== null) {
      const spline = builder.bind();
      if (spline.isDefined()) {
        this.splines.push(spline);
      }
    }
    builder = new R2SplineBuilder();
    this.builder = builder;
    builder.moveTo(x, y);
  }

  closePath(): void {
    const builder = this.builder;
    if (builder !== null) {
      builder.closePath();
    } else {
      throw new Error();
    }
  }

  lineTo(x: number, y: number): void {
    const builder = this.builder;
    if (builder !== null) {
      builder.lineTo(x, y);
    } else {
      throw new Error();
    }
  }

  quadraticCurveTo(x1: number, y1: number, x: number, y: number): void {
    const builder = this.builder;
    if (builder !== null) {
      builder.quadraticCurveTo(x1, y1, x, y);
    } else {
      throw new Error();
    }
  }

  bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): void {
    const builder = this.builder;
    if (builder !== null) {
      builder.bezierCurveTo(x1, y1, x2, y2, x, y);
    } else {
      throw new Error();
    }
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, r: number): void {
    const builder = this.builder;
    if (builder !== null) {
      builder.arcTo(x1, y1, x2, y2, r);
    } else {
      throw new Error();
    }
  }

  arc(cx: number, cy: number, r: number, a0: number, a1: number, ccw?: boolean): void {
    const builder = this.builder;
    if (builder !== null) {
      builder.arc(cx, cy, r, a0, a1, ccw);
    } else {
      throw new Error();
    }
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, phi: number, a0: number, a1: number, ccw?: boolean): void {
    const builder = this.builder;
    if (builder !== null) {
      builder.ellipse(cx, cy, rx, ry, phi, a0, a1, ccw);
    } else {
      throw new Error();
    }
  }

  rect(x: number, y: number, w: number, h: number): void {
    const builder = this.builder;
    if (builder !== null) {
      builder.rect(x, y, w, h);
    } else {
      throw new Error();
    }
  }

  bind(): R2Path {
    const splines = this.splines.slice(0);
    const builder = this.builder;
    if (builder !== null) {
      const spline = builder.bind();
      if (spline.isDefined()) {
        splines.push(spline);
      }
    }
    return new R2Path(splines);
  }
}
