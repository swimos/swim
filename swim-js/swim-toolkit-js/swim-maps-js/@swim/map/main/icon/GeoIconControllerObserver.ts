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

import type {GeoPoint} from "@swim/geo";
import type {Graphics} from "@swim/graphics";
import type {GeoIconView} from "./GeoIconView";
import type {GeoIconTrait} from "./GeoIconTrait";
import type {GeoControllerObserver} from "../geo/GeoControllerObserver";
import type {GeoIconController} from "./GeoIconController";

export interface GeoIconControllerObserver<C extends GeoIconController = GeoIconController> extends GeoControllerObserver<C> {
  controllerWillAttachGeoTrait?(geoTrait: GeoIconTrait, controller: C): void;

  controllerDidDetachGeoTrait?(geoTrait: GeoIconTrait, controller: C): void;

  controllerWillAttachGeoView?(geoView: GeoIconView, controller: C): void;

  controllerDidDetachGeoView?(geoView: GeoIconView, controller: C): void;

  controllerWillSetGeoCenter?(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null, controller: C): void;

  controllerDidSetGeoCenter?(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null, controller: C): void;

  controllerWillSetGraphics?(newGraphics: Graphics | null, oldGraphics: Graphics | null, controller: C): void;

  controllerDidSetGraphics?(newGraphics: Graphics | null, oldGraphics: Graphics | null, controller: C): void;
}
