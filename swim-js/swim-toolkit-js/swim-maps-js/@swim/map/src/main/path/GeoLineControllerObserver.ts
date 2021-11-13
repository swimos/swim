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
import type {GeoLineView} from "./GeoLineView";
import type {GeoLineTrait} from "./GeoLineTrait";
import type {GeoPathControllerObserver} from "./GeoPathControllerObserver";
import type {GeoLineController} from "./GeoLineController";

export interface GeoLineControllerObserver<C extends GeoLineController = GeoLineController> extends GeoPathControllerObserver<C> {
  controllerWillAttachGeoTrait?(geoTrait: GeoLineTrait, controller: C): void;

  controllerDidDetachGeoTrait?(geoTrait: GeoLineTrait, controller: C): void;

  controllerWillAttachGeoView?(geoView: GeoLineView, controller: C): void;

  controllerDidDetachGeoView?(geoView: GeoLineView, controller: C): void;

  controllerWillSetStroke?(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, controller: C): void;

  controllerDidSetStroke?(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, controller: C): void;

  controllerWillSetStrokeWidth?(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, controller: C): void;

  controllerDidSetStrokeWidth?(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, controller: C): void;
}
