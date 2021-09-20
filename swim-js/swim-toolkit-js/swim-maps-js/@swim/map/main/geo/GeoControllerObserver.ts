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

import type {GeoBox} from "@swim/geo";
import type {ControllerObserver} from "@swim/controller";
import type {GeoView} from "./GeoView";
import type {GeoTrait} from "./GeoTrait";
import type {GeoController} from "./GeoController";

export interface GeoControllerObserver<C extends GeoController = GeoController> extends ControllerObserver<C> {
  controllerWillSetGeoTrait?(newGeoTrait: GeoTrait | null, oldGeoTrait: GeoTrait | null, controller: C): void;

  controllerDidSetGeoTrait?(newGeoTrait: GeoTrait | null, oldGeoTrait: GeoTrait | null, controller: C): void;

  controllerWillSetGeoView?(newGeoView: GeoView | null, oldGeoView: GeoView | null, controller: C): void;

  controllerDidSetGeoView?(newGeoView: GeoView | null, oldGeoView: GeoView | null, controller: C): void;

  controllerWillSetGeoBounds?(newGeoBounds: GeoBox, oldGeoBounds: GeoBox, controller: C): void;

  controllerDidSetGeoBounds?(newGeoBounds: GeoBox, oldGeoBounds: GeoBox, controller: C): void;
}