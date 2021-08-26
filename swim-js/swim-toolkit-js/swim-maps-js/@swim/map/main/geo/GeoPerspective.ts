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

import {AnyGeoPoint, GeoPoint, AnyGeoBox, GeoBox} from "@swim/geo";

export type AnyGeoPerspective = GeoPerspective | GeoPerspectiveInit;

export interface GeoPerspectiveInit {
  geoFrame?: AnyGeoBox | null;
  geoCenter?: AnyGeoPoint | null;
  zoom?: number;
  heading?: number;
  tilt?: number;
}

export interface GeoPerspective {
  readonly geoFrame: GeoBox | null;

  readonly geoCenter: GeoPoint | null;

  readonly zoom: number | undefined;

  readonly heading: number | undefined;

  readonly tilt: number | undefined;
}

export const GeoPerspective = {} as {
  fromAny(value: AnyGeoPerspective): GeoPerspective;

  is(object: unknown): object is GeoPerspective;
};

GeoPerspective.fromAny = function (value: AnyGeoPerspective): GeoPerspective {
  if (value === void 0 || value === null) {
    return value;
  } else {
    let geoFrame: GeoBox | null;
    if (value.geoFrame !== void 0 && value.geoFrame !== null) {
      geoFrame = GeoBox.fromAny(value.geoFrame);
    } else {
      geoFrame = null;
    }
    let geoCenter: GeoPoint | null;
    if (value.geoCenter !== void 0 && value.geoCenter !== null) {
      geoCenter = GeoPoint.fromAny(value.geoCenter);
    } else {
      geoCenter = null;
    }
    const zoom = value.zoom;
    const heading = value.heading;
    const tilt = value.tilt;
    return {geoFrame, geoCenter, zoom, heading, tilt};
  }
};

GeoPerspective.is = function (object: unknown): object is GeoPerspective {
  if (object !== void 0 && object !== null) {
    const viewport = object as GeoPerspective;
    return "geoFrame" in viewport
        && "geoCenter" in viewport
        && "zoom" in viewport
        && "heading" in viewport
        && "tilt" in viewport;
  }
  return false;
};
