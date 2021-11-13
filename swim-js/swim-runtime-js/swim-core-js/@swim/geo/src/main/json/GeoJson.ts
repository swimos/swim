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

import type {GeoShape} from "../GeoShape";
import type {GeoJsonBbox} from "./GeoJsonBbox";
import type {GeoJsonGeometryType} from "./GeoJsonGeometry";
import {GeoJsonGeometry} from "./"; // forward import
import {GeoJsonFeature} from "./"; // forward import
import {GeoJsonFeatureCollection} from "./"; // forward import

export type GeoJsonType = GeoJsonGeometryType
                        | "Feature"
                        | "FeatureCollection";

export interface GeoJsonObject {
  type: GeoJsonType;
  bbox?: GeoJsonBbox;
}

export type GeoJson = GeoJsonGeometry
                    | GeoJsonFeature
                    | GeoJsonFeatureCollection;

export const GeoJson = (function () {
  const GeoJson = {} as {
    is(value: unknown): value is GeoJson;
    toShape(geometry: GeoJsonGeometry): GeoShape;
    toShape(feature: GeoJsonFeature): GeoShape | null;
    toShape(collection: GeoJsonFeatureCollection): Array<GeoShape | null>;
    toShape(object: GeoJson): GeoShape | null | Array<GeoShape | null>;
  };

  GeoJson.is = function (value: unknown): value is GeoJson {
    return GeoJsonGeometry.is(value)
        || GeoJsonFeature.is(value)
        || GeoJsonFeatureCollection.is(value);
  };

  GeoJson.toShape = function (object: GeoJson): GeoShape | null | Array<GeoShape | null> {
    if (object.type === "Feature") {
      return GeoJsonFeature.toShape(object);
    } else if (object.type === "FeatureCollection") {
      return GeoJsonFeatureCollection.toShapes(object);
    } else {
      return GeoJsonGeometry.toShape(object);
    }
  } as typeof GeoJson.toShape;

  return GeoJson;
})();
