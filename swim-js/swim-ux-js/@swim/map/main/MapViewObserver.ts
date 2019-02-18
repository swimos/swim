// Copyright 2015-2019 SWIM.AI inc.
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

import {RenderViewObserver} from "@swim/view";
import {MapProjection} from "./MapProjection";
import {MapView} from "./MapView";

export interface MapViewObserver<V extends MapView = MapView> extends RenderViewObserver<V> {
  viewWillSetProjection?(projection: MapProjection, view: V): void;

  viewDidSetProjection?(projection: MapProjection, view: V): void;

  viewWillSetZoom?(zoom: number, view: V): void;

  viewDidSetZoom?(newZoom: number, oldZoom: number, view: V): void;
}
