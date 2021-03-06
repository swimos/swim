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

import {MapViewController} from "@swim/map";
import type {MapboxViewport} from "./MapboxViewport";
import type {MapboxView} from "./MapboxView";
import type {MapboxViewObserver} from "./MapboxViewObserver";

export class MapboxViewController<V extends MapboxView = MapboxView> extends MapViewController<V> implements MapboxViewObserver<V> {
  override viewWillSetGeoViewport(newGeoViewport: MapboxViewport, oldGeoViewport: MapboxViewport, view: V): void {
    // hook
  }

  override viewDidSetGeoViewport(newGeoViewport: MapboxViewport, oldGeoViewport: MapboxViewport, view: V): void {
    // hook
  }

  viewWillMoveMap(view: V): void {
    // hook
  }

  viewDidMoveMap(view: V): void {
    // hook
  }
}
