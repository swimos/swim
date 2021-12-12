// Copyright 2015-2021 Swim.inc
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

import type {GeoShape} from "../GeoShape";
import type {GeoJsonObject} from "./GeoJson";
import {GeoJsonGeometry} from "./GeoJsonGeometry";

/** @public */
export type GeoJsonProperties = {[name: string]: unknown};

/** @public */
export interface GeoJsonFeature<G extends GeoJsonGeometry = GeoJsonGeometry, P = GeoJsonProperties> extends GeoJsonObject {
  type: "Feature";
  geometry: G | null;
  properties: P | null;
  id?: string | number;
}

/** @public */
export const GeoJsonFeature = (function () {
  const GeoJsonFeature = {} as {
    is(value: unknown): value is GeoJsonFeature;
    toShape(feature: GeoJsonFeature): GeoShape | null;
  };

  GeoJsonFeature.is = function (value: unknown): value is GeoJsonFeature {
    if (typeof value === "object" && value !== null) {
      const object = value as GeoJsonFeature;
      return object.type === "Feature"
          && GeoJsonGeometry.is(object.geometry)
          && typeof object.properties === "object";
    }
    return false;
  };

  GeoJsonFeature.toShape = function (feature: GeoJsonFeature): GeoShape | null {
    const geometry = feature.geometry;
    return geometry !== null ? GeoJsonGeometry.toShape(geometry) : null;
  };

  return GeoJsonFeature;
})();
