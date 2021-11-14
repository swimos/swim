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
import type {GeoView} from "../geo/GeoView";
import type {GeoTrait} from "../geo/GeoTrait";
import type {GeoController} from "../geo/GeoController";
import type {GeoControllerObserver} from "../geo/GeoControllerObserver";
import type {GeoLayerTrait} from "./GeoLayerTrait";
import type {GeoLayerController} from "./GeoLayerController";

/** @public */
export interface GeoLayerControllerObserver<C extends GeoLayerController = GeoLayerController> extends GeoControllerObserver<C> {
  controllerWillAttachGeoTrait?(geoTrait: GeoLayerTrait, controller: C): void;

  controllerDidDetachGeoTrait?(geoTrait: GeoLayerTrait, controller: C): void;

  controllerWillAttachGeoView?(geoView: GeoView, controller: C): void;

  controllerDidDetachGeoView?(geoView: GeoView, controller: C): void;

  controllerWillAttachFeature?(featureController: GeoController, controller: C): void;

  controllerDidDetachFeature(featureController: GeoController, controller: C): void;

  controllerWillAttachFeatureTrait?(featureTrait: GeoTrait, featureController: GeoController, controller: C): void;

  controllerDidDetachFeatureTrait?(featureTrait: GeoTrait, featureController: GeoController, controller: C): void;

  controllerWillAttachFeatureView?(featureView: GeoView, featureController: GeoController, controller: C): void;

  controllerDidDetachFeatureView?(featureView: GeoView, featureController: GeoController, controller: C): void;

  controllerWillSetFeatureGeoBounds?(newGeoBounds: GeoBox, oldGeoBounds: GeoBox, featureController: GeoController, controller: C): void;

  controllerDidSetFeatureGeoBounds?(newGeoBounds: GeoBox, oldGeoBounds: GeoBox, featureController: GeoController, controller: C): void;
}
