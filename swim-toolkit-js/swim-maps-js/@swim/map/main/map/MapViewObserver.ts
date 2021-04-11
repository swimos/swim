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

import type {HtmlView} from "@swim/dom";
import type {CanvasView} from "@swim/graphics";
import type {GeoViewport} from "../geo/GeoViewport";
import type {GeoViewObserver} from "../geo/GeoViewObserver";
import type {MapView} from "./MapView";

export interface MapViewObserver<V extends MapView = MapView> extends GeoViewObserver<V> {
  viewWillSetGeoViewport?(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport, view: V): void;

  viewDidSetGeoViewport?(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport, view: V): void;

  viewWillSetMapCanvas?(newMapCanvasView: CanvasView | null, oldMapCanvasView: CanvasView | null, view: V): void;

  viewDidSetMapCanvas?(newMapCanvasView: CanvasView | null, oldMapCanvasView: CanvasView | null, view: V): void;

  viewWillSetMapContainer?(newMapContainerView: HtmlView | null, oldMapContainerView: HtmlView | null, view: V): void;

  viewDidSetMapContainer?(newMapContainerView: HtmlView | null, oldMapContainerView: HtmlView | null, view: V): void;
}
