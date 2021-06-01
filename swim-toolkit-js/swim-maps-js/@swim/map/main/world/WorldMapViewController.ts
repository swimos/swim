// Copyright 2015-2021 Swim inc.
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

import {MapViewController} from "../map/MapViewController";
import type {WorldMapViewport} from "./WorldMapViewport";
import type {WorldMapView} from "./WorldMapView";
import type {WorldMapViewObserver} from "./WorldMapViewObserver";

export class WorldMapViewController<V extends WorldMapView = WorldMapView> extends MapViewController<V> implements WorldMapViewObserver<V> {
  override viewWillSetGeoViewport(newGeoViewport: WorldMapViewport, oldGeoViewport: WorldMapViewport, view: V): void {
    // hook
  }

  override viewDidSetGeoViewport(newGeoViewport: WorldMapViewport, oldGeoViewport: WorldMapViewport, view: V): void {
    // hook
  }
}
