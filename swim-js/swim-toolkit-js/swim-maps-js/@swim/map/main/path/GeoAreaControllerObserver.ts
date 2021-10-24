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

import type {Length} from "@swim/math";
import type {Color} from "@swim/style";
import type {Look} from "@swim/theme";
import type {GeoAreaView} from "./GeoAreaView";
import type {GeoAreaTrait} from "./GeoAreaTrait";
import type {GeoPathControllerObserver} from "./GeoPathControllerObserver";
import type {GeoAreaController} from "./GeoAreaController";

export interface GeoAreaControllerObserver<C extends GeoAreaController = GeoAreaController> extends GeoPathControllerObserver<C> {
  controllerWillAttachGeoTrait?(geoTrait: GeoAreaTrait, controller: C): void;

  controllerDidDetachGeoTrait?(geoTrait: GeoAreaTrait, controller: C): void;

  controllerWillAttachGeoView?(geoView: GeoAreaView, controller: C): void;

  controllerDidDetachGeoView?(geoView: GeoAreaView, controller: C): void;

  controllerWillSetFill?(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null, controller: C): void;

  controllerDidSetFill?(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null, controller: C): void;

  controllerWillSetStroke?(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, controller: C): void;

  controllerDidSetStroke?(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, controller: C): void;

  controllerWillSetStrokeWidth?(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, controller: C): void;

  controllerDidSetStrokeWidth?(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, controller: C): void;
}
