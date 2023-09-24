// Copyright 2015-2023 Nstream, inc.
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

import {GeoProjection} from "@swim/geo";
import type {GeoPoint} from "@swim/geo";
import type {GeoBox} from "@swim/geo";
import {GeoPerspective} from "./GeoPerspective";

/** @public */
export interface GeoViewport extends GeoProjection, GeoPerspective {
  readonly geoFrame: GeoBox;

  readonly geoCenter: GeoPoint;

  readonly zoom: number;

  readonly heading: number;

  readonly tilt: number;
}

/** @public */
export const GeoViewport = {
  [Symbol.hasInstance](instance: unknown): instance is GeoViewport {
    return GeoProjection[Symbol.hasInstance](instance)
        && GeoPerspective[Symbol.hasInstance](instance);
  },
};
