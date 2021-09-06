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
import type {ControllerFastener} from "@swim/controller";
import type {GeoView} from "../geo/GeoView";
import type {GeoTrait} from "../geo/GeoTrait";
import type {GeoController} from "../geo/GeoController";
import type {GeoControllerObserver} from "../geo/GeoControllerObserver";
import type {GeoLayerTrait} from "./GeoLayerTrait";
import type {GeoLayerController} from "./GeoLayerController";

export interface GeoLayerControllerObserver<C extends GeoLayerController = GeoLayerController> extends GeoControllerObserver<C> {
  controllerWillSetGeoTrait?(newGeoTrait: GeoLayerTrait | null, oldGeoTrait: GeoLayerTrait | null, controller: C): void;

  controllerDidSetGeoTrait?(newGeoTrait: GeoLayerTrait | null, oldGeoTrait: GeoLayerTrait | null, controller: C): void;

  controllerWillSetGeoView?(newGeoView: GeoView | null, oldGeoView: GeoView | null, controller: C): void;

  controllerDidSetGeoView?(newGeoView: GeoView | null, oldGeoView: GeoView | null, controller: C): void;

  controllerWillSetFeature?(newFeatureController: GeoController | null, oldFeatureController: GeoController | null, featureFastener: ControllerFastener<C, GeoController>): void;

  controllerDidSetFeature(newFeatureController: GeoController | null, oldFeatureController: GeoController | null, featureFastener: ControllerFastener<C, GeoController>): void;

  controllerWillSetFeatureTrait?(newFeatureTrait: GeoTrait | null, oldFeatureTrait: GeoTrait | null, featureFastener: ControllerFastener<C, GeoController>): void;

  controllerDidSetFeatureTrait?(newFeatureTrait: GeoTrait | null, oldFeatureTrait: GeoTrait | null, featureFastener: ControllerFastener<C, GeoController>): void;

  controllerWillSetFeatureView?(newFeatureView: GeoView | null, oldFeatureView: GeoView | null, featureFastener: ControllerFastener<C, GeoController>): void;

  controllerDidSetFeatureView?(newFeatureView: GeoView | null, oldFeatureView: GeoView | null, featureFastener: ControllerFastener<C, GeoController>): void;

  controllerWillSetFeatureGeoBounds?(newFeatureGeoBounds: GeoBox, oldFeatureGeoBounds: GeoBox, featureFastener: ControllerFastener<C, GeoController>): void;

  controllerDidSetFeatureGeoBounds?(newFeatureGeoBounds: GeoBox, oldFeatureGeoBounds: GeoBox, featureFastener: ControllerFastener<C, GeoController>): void;
}
