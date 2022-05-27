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

import type {GeoBox} from "@swim/geo";
import type {HtmlView} from "@swim/dom";
import type {CanvasView} from "@swim/graphics";
import type {ControllerObserver} from "@swim/controller";
import type {GeoViewport} from "../geo/GeoViewport";
import type {GeoView} from "../geo/GeoView";
import type {GeoTrait} from "../geo/GeoTrait";
import type {GeoController} from "../geo/GeoController";
import type {MapView} from "./MapView";
import type {MapTrait} from "./MapTrait";
import type {MapController} from "./MapController";

/** @public */
export interface MapControllerObserver<C extends MapController = MapController> extends ControllerObserver<C> {
  controllerWillAttachMapTrait?(mapTrait: MapTrait, controller: C): void;

  controllerDidDetachMapTrait?(mapTrait: MapTrait, controller: C): void;

  controllerWillAttachMapView?(mapView: MapView, controller: C): void;

  controllerDidDetachMapView?(mapView: MapView, controller: C): void;

  controllerWillAttachMapCanvasView?(mapCanvasView: CanvasView, controller: C): void;

  controllerDidDetachMapCanvasView?(mapCanvasView: CanvasView, controller: C): void;

  controllerWillAttachMapContainerView?(mapContainerView: HtmlView, controller: C): void;

  controllerDidDetachMapContainerView?(mapContainerView: HtmlView, controller: C): void;

  controllerWillSetGeoViewport?(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport, controller: C): void;

  controllerDidSetGeoViewport?(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport, controller: C): void;

  controllerWillAttachLayer?(layerController: GeoController, controller: C): void;

  controllerDidDetachLayer?(layerController: GeoController, controller: C): void;

  controllerWillAttachLayerTrait?(layerTrait: GeoTrait, layerController: GeoController, controller: C): void;

  controllerDidDetachLayerTrait?(layerTrait: GeoTrait, layerController: GeoController, controller: C): void;

  controllerWillAttachLayerView?(layerView: GeoView, layerController: GeoController, controller: C): void;

  controllerDidDetachLayerView?(layerView: GeoView, layerController: GeoController, controller: C): void;

  controllerWillSetLayerGeoBounds?(newGeoBounds: GeoBox, oldGeoBounds: GeoBox, layerController: GeoController, controller: C): void;

  controllerDidSetLayerGeoBounds?(newGeoBounds: GeoBox, oldGeoBounds: GeoBox, layerController: GeoController, controller: C): void;
}
