// Copyright 2015-2022 Swim.inc
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

import type {GeoView} from "../geo/GeoView";
import type {GeoTrait} from "../geo/GeoTrait";
import type {GeoLayerControllerObserver} from "../layer/GeoLayerControllerObserver";
import type {GeoGridTrait} from "./GeoGridTrait";
import type {GeoGridController} from "./GeoGridController";

/** @public */
export interface GeoGridControllerObserver<C extends GeoGridController = GeoGridController> extends GeoLayerControllerObserver<C> {
  controllerWillAttachGeoTrait?(geoTrait: GeoGridTrait, controller: C): void;

  controllerDidDetachGeoTrait?(geoTrait: GeoGridTrait, controller: C): void;

  controllerWillAttachTile?(tileController: GeoGridController, controller: C): void;

  controllerDidDetachTile(tileController: GeoGridController, controller: C): void;

  controllerWillAttachTileTrait?(tileTrait: GeoTrait, tileController: GeoGridController, controller: C): void;

  controllerDidDetachTileTrait?(tileTrait: GeoTrait, tileController: GeoGridController, controller: C): void;

  controllerWillAttachTileView?(tileView: GeoView, tileController: GeoGridController, controller: C): void;

  controllerDidDetachTileView?(tileView: GeoView, tileController: GeoGridController, controller: C): void;
}
