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

import type {ControllerFastener} from "@swim/controller";
import type {GeoView} from "../geo/GeoView";
import type {GeoTrait} from "../geo/GeoTrait";
import type {GeoLayerControllerObserver} from "../layer/GeoLayerControllerObserver";
import type {GeoGridTrait} from "./GeoGridTrait";
import type {GeoGridController} from "./GeoGridController";

export interface GeoGridControllerObserver<C extends GeoGridController = GeoGridController> extends GeoLayerControllerObserver<C> {
  controllerWillSetGeoTrait?(newGeoTrait: GeoGridTrait | null, oldGeoTrait: GeoGridTrait | null, controller: C): void;

  controllerDidSetGeoTrait?(newGeoTrait: GeoGridTrait | null, oldGeoTrait: GeoGridTrait | null, controller: C): void;

  controllerWillSetTile?(newTileController: GeoGridController | null, oldTileController: GeoGridController | null, tileFastener: ControllerFastener<C, GeoGridController>): void;

  controllerDidSetTile(newTileController: GeoGridController | null, oldTileController: GeoGridController | null, tileFastener: ControllerFastener<C, GeoGridController>): void;

  controllerWillSetTileTrait?(newTileTrait: GeoTrait | null, oldTileTrait: GeoTrait | null, tileFastener: ControllerFastener<C, GeoGridController>): void;

  controllerDidSetTileTrait?(newTileTrait: GeoTrait | null, oldTileTrait: GeoTrait | null, tileFastener: ControllerFastener<C, GeoGridController>): void;

  controllerWillSetTileView?(newTileView: GeoView | null, oldTileView: GeoView | null, tileFastener: ControllerFastener<C, GeoGridController>): void;

  controllerDidSetTileView?(newTileView: GeoView | null, oldTileView: GeoView | null, tileFastener: ControllerFastener<C, GeoGridController>): void;
}
