// Copyright 2015-2020 Swim inc.
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
import type {ComponentObserver, ComponentFastener} from "@swim/component";
import type {GeoViewport} from "../geo/GeoViewport";
import type {GeoView} from "../geo/GeoView";
import type {GeoTrait} from "../geo/GeoTrait";
import type {GeoComponent} from "../geo/GeoComponent";
import type {MapView} from "./MapView";
import type {MapTrait} from "./MapTrait";
import type {MapComponent} from "./MapComponent";

export interface MapComponentObserver<C extends MapComponent = MapComponent> extends ComponentObserver<C> {
  componentWillSetMapTrait?(newMapTrait: MapTrait | null, oldMapTrait: MapTrait | null, component: C): void;

  componentDidSetMapTrait?(newMapTrait: MapTrait | null, oldMapTrait: MapTrait | null, component: C): void;

  componentWillSetMapView?(newMapView: MapView | null, oldMapView: MapView | null, component: C): void;

  componentDidSetMapView?(newMapView: MapView | null, oldMapView: MapView | null, component: C): void;

  componentWillSetCanvasView?(newCanvasView: CanvasView | null, oldCanvasView: CanvasView | null, component: C): void;

  componentDidSetCanvasView?(newCanvasView: CanvasView | null, oldCanvasView: CanvasView | null, component: C): void;

  componentWillSetContainerView?(newContainerView: HtmlView | null, oldContainerView: HtmlView | null, component: C): void;

  componentDidSetContainerView?(newContainerView: HtmlView | null, oldContainerView: HtmlView | null, component: C): void;

  componentWillSetGeoViewport?(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport, component: C): void;

  componentDidSetGeoViewport?(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport, component: C): void;

  componentWillSetLayer?(newLayerComponent: GeoComponent | null, oldLayerComponent: GeoComponent | null, layerFastener: ComponentFastener<C, GeoComponent>): void;

  componentDidSetLayer(newLayerComponent: GeoComponent | null, oldLayerComponent: GeoComponent | null, layerFastener: ComponentFastener<C, GeoComponent>): void;

  componentWillSetLayerTrait?(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null, layerFastener: ComponentFastener<C, GeoComponent>): void;

  componentDidSetLayerTrait?(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null, layerFastener: ComponentFastener<C, GeoComponent>): void;

  componentWillSetLayerView?(newLayerView: GeoView | null, oldLayerView: GeoView | null, layerFastener: ComponentFastener<C, GeoComponent>): void;

  componentDidSetLayerView?(newLayerView: GeoView | null, oldLayerView: GeoView | null, layerFastener: ComponentFastener<C, GeoComponent>): void;

  componentWillSetLayerGeoBounds?(newLayerGeoBounds: GeoBox, oldLayerGeoBounds: GeoBox, layerFastener: ComponentFastener<C, GeoComponent>): void;

  componentDidSetLayerGeoBounds?(newLayerGeoBounds: GeoBox, oldLayerGeoBounds: GeoBox, layerFastener: ComponentFastener<C, GeoComponent>): void;
}
