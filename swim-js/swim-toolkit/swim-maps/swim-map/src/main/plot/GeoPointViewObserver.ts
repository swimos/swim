// Copyright 2015-2021 Swim.inc
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

import type {GeoPoint} from "@swim/geo";
import type {GraphicsView} from "@swim/graphics";
import type {GeoViewObserver} from "../geo/GeoViewObserver";
import type {GeoPointView} from "./GeoPointView";

/** @public */
export interface GeoPointViewObserver<V extends GeoPointView = GeoPointView> extends GeoViewObserver<V> {
  viewWillSetGeoPoint?(newGeoPoint: GeoPoint, oldGeoPoint: GeoPoint, view: V): void;

  viewDidSetGeoPoint?(newGeoPoint: GeoPoint, oldGeoPoint: GeoPoint, view: V): void;

  viewWillAttachGeoLabel?(labelView: GraphicsView, view: V): void;

  viewDidDetachGeoLabel?(labelView: GraphicsView, view: V): void;
}
