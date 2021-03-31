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

import type {AnyTiming} from "@swim/mapping";
import type {GeoProjection, AnyGeoPoint, GeoPoint} from "@swim/geo";
import type {MapGraphicsView} from "../graphics/MapGraphicsView";
import type {MapViewObserver} from "./MapViewObserver";
import type {MapViewController} from "./MapViewController";

export interface MapView extends MapGraphicsView {
  readonly viewController: MapViewController | null;

  readonly viewObservers: ReadonlyArray<MapViewObserver>;

  readonly geoProjection: GeoProjection | null

  readonly mapCenter: GeoPoint;

  readonly mapZoom: number;

  readonly mapHeading: number;

  readonly mapTilt: number;

  moveTo(mapCenter: AnyGeoPoint | undefined, mapZoom: number | undefined,
         timing?: AnyTiming | boolean): void;
}
