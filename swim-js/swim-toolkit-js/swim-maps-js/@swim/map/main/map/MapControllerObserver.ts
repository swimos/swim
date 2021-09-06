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
import type {HtmlView} from "@swim/dom";
import type {CanvasView} from "@swim/graphics";
import type {ControllerObserver, ControllerFastener} from "@swim/controller";
import type {GeoViewport} from "../geo/GeoViewport";
import type {GeoView} from "../geo/GeoView";
import type {GeoTrait} from "../geo/GeoTrait";
import type {GeoController} from "../geo/GeoController";
import type {MapView} from "./MapView";
import type {MapTrait} from "./MapTrait";
import type {MapController} from "./MapController";

export interface MapControllerObserver<C extends MapController = MapController> extends ControllerObserver<C> {
  controllerWillSetMapTrait?(newMapTrait: MapTrait | null, oldMapTrait: MapTrait | null, controller: C): void;

  controllerDidSetMapTrait?(newMapTrait: MapTrait | null, oldMapTrait: MapTrait | null, controller: C): void;

  controllerWillSetMapView?(newMapView: MapView | null, oldMapView: MapView | null, controller: C): void;

  controllerDidSetMapView?(newMapView: MapView | null, oldMapView: MapView | null, controller: C): void;

  controllerWillSetCanvasView?(newCanvasView: CanvasView | null, oldCanvasView: CanvasView | null, controller: C): void;

  controllerDidSetCanvasView?(newCanvasView: CanvasView | null, oldCanvasView: CanvasView | null, controller: C): void;

  controllerWillSetContainerView?(newContainerView: HtmlView | null, oldContainerView: HtmlView | null, controller: C): void;

  controllerDidSetContainerView?(newContainerView: HtmlView | null, oldContainerView: HtmlView | null, controller: C): void;

  controllerWillSetGeoViewport?(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport, controller: C): void;

  controllerDidSetGeoViewport?(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport, controller: C): void;

  controllerWillSetLayer?(newLayerController: GeoController | null, oldLayerController: GeoController | null, layerFastener: ControllerFastener<C, GeoController>): void;

  controllerDidSetLayer(newLayerController: GeoController | null, oldLayerController: GeoController | null, layerFastener: ControllerFastener<C, GeoController>): void;

  controllerWillSetLayerTrait?(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null, layerFastener: ControllerFastener<C, GeoController>): void;

  controllerDidSetLayerTrait?(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null, layerFastener: ControllerFastener<C, GeoController>): void;

  controllerWillSetLayerView?(newLayerView: GeoView | null, oldLayerView: GeoView | null, layerFastener: ControllerFastener<C, GeoController>): void;

  controllerDidSetLayerView?(newLayerView: GeoView | null, oldLayerView: GeoView | null, layerFastener: ControllerFastener<C, GeoController>): void;

  controllerWillSetLayerGeoBounds?(newLayerGeoBounds: GeoBox, oldLayerGeoBounds: GeoBox, layerFastener: ControllerFastener<C, GeoController>): void;

  controllerDidSetLayerGeoBounds?(newLayerGeoBounds: GeoBox, oldLayerGeoBounds: GeoBox, layerFastener: ControllerFastener<C, GeoController>): void;
}
