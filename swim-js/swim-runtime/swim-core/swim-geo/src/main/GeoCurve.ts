// Copyright 2015-2023 Swim.inc
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

import type {Equivalent, Equals} from "@swim/util";
import type {R2Curve} from "@swim/math";
import type {GeoProjection} from "./GeoProjection";
import {GeoShape} from "./GeoShape";
import type {GeoPoint} from "./GeoPoint";

/** @public */
export abstract class GeoCurve extends GeoShape implements Equals, Equivalent {
  abstract interpolateLng(u: number): number;

  abstract interpolateLat(u: number): number;

  abstract interpolate(u: number): GeoPoint;

  abstract split(u: number): [GeoCurve, GeoCurve];

  abstract override project(f: GeoProjection): R2Curve;

  abstract forEachCoord<R>(callback: (lng: number, lat: number) => R | void): R | undefined;
  abstract forEachCoord<R, S>(callback: (this: S, lng: number, lat: number) => R | void,
                              thisArg: S): R | undefined;

  abstract forEachCoordRest<R>(callback: (lng: number, lat: number) => R | void): R | undefined;
  abstract forEachCoordRest<R, S>(callback: (this: S, lng: number, lat: number) => R | void,
                                  thisArg: S): R | undefined;

  abstract equivalentTo(that: unknown, epsilon?: number): boolean;

  abstract override equals(that: unknown): boolean;
}
