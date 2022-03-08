// Copyright 2015-2022 Swim.inc
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
import type {GeoJsonGeometry} from "./GeoJsonGeometry";
import {GeoJsonProperties, GeoJsonFeature} from "./GeoJsonFeature";

/** @public */
export interface GeoJsonFeatureCollection<G extends GeoJsonGeometry = GeoJsonGeometry, P = GeoJsonProperties> extends GeoJsonObject {
  type: "FeatureCollection";
  features: GeoJsonFeature<G, P>[];
}

/** @public */
export const GeoJsonFeatureCollection = (function () {
  const GeoJsonFeatureCollection = {} as {
    is(value: unknown): value is GeoJsonFeatureCollection;
    toShapes(object: GeoJsonFeatureCollection): Array<GeoShape | null>;
  };

  GeoJsonFeatureCollection.is = function (value: unknown): value is GeoJsonFeatureCollection {
    if (typeof value === "object" && value !== null) {
      const object = value as GeoJsonFeatureCollection;
      return object.type === "FeatureCollection"
          && Array.isArray(object.features);
    }
    return false;
  };

  GeoJsonFeatureCollection.toShapes = function (object: GeoJsonFeatureCollection): Array<GeoShape | null> {
    const features = object.features;
    const n = features.length;
    const shapes = new Array<GeoShape | null>(n);
    for (let i = 0; i < n; i += 1) {
      shapes[i] = GeoJsonFeature.toShape(features[i]!);
    }
    return shapes;
  };

  return GeoJsonFeatureCollection;
})();
