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

import type {GeoCurve} from "./GeoCurve";
import {GeoSegment} from "./GeoSegment";
import type {GeoSplineContext} from "./GeoSplineContext";
import {GeoSpline} from "./GeoSpline";

export class GeoSplineBuilder implements GeoSplineContext {
  /** @hidden */
  curves: GeoCurve[];
  /** @hidden */
  closed: boolean;
  /** @hidden */
  aliased: boolean;
  /** @hidden */
  lng0: number;
  /** @hidden */
  lat0: number;
  /** @hidden */
  lng: number;
  /** @hidden */
  lat: number;

  constructor() {
    this.curves = [];
    this.closed = false;
    this.aliased = false;
    this.lng0 = 0;
    this.lat0 = 0;
    this.lng = 0;
    this.lat = 0;
  }

  private dealias(): void {
    if (this.aliased) {
      this.curves = this.curves.slice(0);
      this.aliased = false;
    }
  }

  moveTo(lng: number, lat: number): void {
    if (this.aliased) {
      this.curves = [];
      this.aliased = false;
    } else {
      this.curves.length = 0;
    }
    this.closed = false;
    this.lng0 = lng;
    this.lat0 = lat;
    this.lng = lng;
    this.lat = lat;
  }

  closePath(): void {
    this.dealias();
    this.curves.push(new GeoSegment(this.lng, this.lat, this.lng0, this.lat0));
    this.closed = true;
    this.lng = this.lng0;
    this.lat = this.lat0;
  }

  lineTo(lng: number, lat: number): void {
    this.dealias();
    this.curves.push(new GeoSegment(this.lng, this.lat, lng, lat));
    this.lng = lng;
    this.lat = lat;
  }

  bind(): GeoSpline {
    this.aliased = true;
    return new GeoSpline(this.curves, this.closed);
  }
}
