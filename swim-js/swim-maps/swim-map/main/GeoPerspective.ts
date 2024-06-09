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

import type {Uninitable} from "@swim/util";
import {Objects} from "@swim/util";
import type {GeoPointLike} from "@swim/geo";
import {GeoShape} from "@swim/geo";
import {GeoPoint} from "@swim/geo";
import {GeoBoxLike} from "@swim/geo";
import {GeoBoxInit} from "@swim/geo";
import {GeoBox} from "@swim/geo";

/** @public */
export type GeoPerspectiveLike = GeoPerspective | GeoShape | GeoPerspectiveInit | GeoBoxInit;

/** @public */
export const GeoPerspectiveLike = {
  [Symbol.hasInstance](instance: unknown): instance is GeoPerspectiveLike {
    return GeoPerspective[Symbol.hasInstance](instance)
        || instance instanceof GeoShape
        || GeoPerspectiveInit[Symbol.hasInstance](instance)
        || GeoBoxInit[Symbol.hasInstance](instance);
  },
};

/** @public */
export interface GeoPerspectiveInit {
  /** @internal */
  readonly typeid?: "GeoPerspectivInite";
  geoFrame?: GeoBoxLike | null;
  geoCenter?: GeoPointLike | null;
  zoom?: number;
  heading?: number;
  tilt?: number;
}

/** @public */
export const GeoPerspectiveInit = {
  [Symbol.hasInstance](instance: unknown): instance is GeoPerspectiveInit {
    return Objects.hasAnyKey<GeoPerspectiveInit>(instance, "geoFrame", "geoCenter");
  },
};

/** @public */
export interface GeoPerspective {
  /** @internal */
  readonly typeid?: "GeoPerspective";

  likeType?(like: GeoShape | GeoPerspectiveInit | GeoBoxInit): void;

  readonly geoFrame: GeoBox | null;

  readonly geoCenter: GeoPoint | null;

  readonly zoom: number | undefined;

  readonly heading: number | undefined;

  readonly tilt: number | undefined;
}

/** @public */
export const GeoPerspective = {
  fromLike<T extends GeoPerspectiveLike | null | undefined>(value: T): GeoPerspective | Uninitable<T> {
    if (value === void 0 || value === null || GeoPerspective[Symbol.hasInstance](value)) {
      return value as GeoPerspective | Uninitable<T>;
    } else if (value instanceof GeoShape || GeoBoxLike[Symbol.hasInstance](value)) {
      return {
        geoFrame: GeoBox.fromLike(value),
        geoCenter: null,
        zoom: void 0,
        heading: void 0,
        tilt: void 0,
      };
    }
    return {
      geoFrame: value.geoFrame !== void 0 && value.geoFrame !== null
              ? GeoBox.fromLike(value.geoFrame) : null,
      geoCenter: value.geoCenter !== void 0 && value.geoCenter !== null
               ? GeoPoint.fromLike(value.geoCenter) : null,
      zoom: value.zoom,
      heading: value.heading,
      tilt: value.tilt,
    };
  },

  [Symbol.hasInstance](instance: unknown): instance is GeoPerspective {
    return Objects.hasAllKeys<GeoPerspective>(instance, "geoFrame", "geoCenter", "zoom", "heading", "tilt");
  },
};
