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

import type {MapGraphicsViewInit, MapGraphicsView} from "../graphics/MapGraphicsView";
import type {MapGraphicsViewController} from "../graphics/MapGraphicsViewController";
import type {GeoViewObserver} from "./GeoViewObserver";

export interface GeoViewInit extends MapGraphicsViewInit {
}

export interface GeoView extends MapGraphicsView {
  readonly viewController: MapGraphicsViewController<GeoView> & GeoViewObserver | null;

  readonly viewObservers: ReadonlyArray<GeoViewObserver>;
}
