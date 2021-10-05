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
import {GeoGroup} from "../GeoGroup";
import {GeoJsonGeometryObject, GeoJsonGeometry} from "./GeoJsonGeometry";

export interface GeoJsonGeometryCollection extends GeoJsonGeometryObject {
  readonly type: "GeometryCollection";
  geometries: GeoJsonGeometry[];
}

export const GeoJsonGeometryCollection = (function () {
  const GeoJsonGeometryCollection = {} as {
    is(value: unknown): value is GeoJsonGeometryCollection;
    toShape(object: GeoJsonGeometryCollection): GeoGroup;
  };

  GeoJsonGeometryCollection.is = function (value: unknown): value is GeoJsonGeometryCollection {
    if (typeof value === "object" && value !== null) {
      const object = value as GeoJsonGeometryCollection;
      return object.type === "GeometryCollection"
          && Array.isArray(object.geometries);
    }
    return false;
  };

  GeoJsonGeometryCollection.toShape = function (object: GeoJsonGeometryCollection): GeoGroup {
    const geometries = object.geometries;
    const n = geometries.length;
    const shapes = new Array<GeoShape>(n);
    for (let i = 0; i < n; i += 1) {
      shapes[i] = GeoJsonGeometry.toShape(geometries[i]!);
    }
    return new GeoGroup(shapes);
  };

  return GeoJsonGeometryCollection;
})();
