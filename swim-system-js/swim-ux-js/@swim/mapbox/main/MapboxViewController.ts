// Copyright 2015-2020 SWIM.AI inc.
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

import {MapGraphicsViewController} from "@swim/map";
import {MapboxProjection} from "./MapboxProjection";
import {MapboxView} from "./MapboxView";
import {MapboxViewObserver} from "./MapboxViewObserver";

export class MapboxViewController<V extends MapboxView = MapboxView> extends MapGraphicsViewController<V> implements MapboxViewObserver<V> {
  viewWillSetProjection(projection: MapboxProjection, view: V): void {
    // hook
  }

  viewDidSetProjection(projection: MapboxProjection, view: V): void {
    // hook
  }

  viewWillSetZoom(zoom: number, view: V): void {
    // hook
  }

  viewDidSetZoom(newZoom: number, oldZoom: number, view: V): void {
    // hook
  }
}
