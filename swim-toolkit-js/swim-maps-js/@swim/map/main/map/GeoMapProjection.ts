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

import type {AnyPointR2, PointR2, BoxR2} from "@swim/math";
import {AnyGeoPoint, GeoPoint, GeoBox, GeoProjection} from "@swim/geo";

export abstract class GeoMapProjection implements GeoProjection {
  abstract readonly frame: BoxR2;

  abstract withFrame(frame: BoxR2): GeoMapProjection;

  get bounds(): GeoBox {
    return GeoBox.globe();
  }

  abstract project(geoPoint: AnyGeoPoint): PointR2;
  abstract project(lng: number, lat: number): PointR2;

  abstract unproject(viewPoint: AnyPointR2): GeoPoint;
  abstract unproject(x: number, y: number): GeoPoint;
}
