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

import type {GeoSpline} from "./GeoSpline";
import {GeoSplineBuilder} from "./GeoSplineBuilder";
import type {GeoPathContext} from "./GeoPathContext";
import {GeoPath} from "./GeoPath";

export class GeoPathBuilder implements GeoPathContext {
  /** @hidden */
  splines: GeoSpline[];
  /** @hidden */
  builder: GeoSplineBuilder | null;

  constructor() {
    this.splines = [];
    this.builder = null;
  }

  moveTo(lng: number, lat: number): void {
    let builder = this.builder;
    if (builder !== null) {
      const spline = builder.bind();
      if (spline.isDefined()) {
        this.splines.push(spline);
      }
    }
    builder = new GeoSplineBuilder();
    this.builder = builder;
    builder.moveTo(lng, lat);
  }

  closePath(): void {
    const builder = this.builder;
    if (builder !== null) {
      builder.closePath();
    } else {
      throw new Error();
    }
  }

  lineTo(lng: number, lat: number): void {
    const builder = this.builder;
    if (builder !== null) {
      builder.lineTo(lng, lat);
    } else {
      throw new Error();
    }
  }

  bind(): GeoPath {
    const splines = this.splines.slice(0);
    const builder = this.builder;
    if (builder !== null) {
      const spline = builder.bind();
      if (spline.isDefined()) {
        splines.push(spline);
      }
    }
    return new GeoPath(splines);
  }
}
