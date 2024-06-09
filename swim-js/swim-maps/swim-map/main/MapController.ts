// Copyright 2015-2024 Nstream, inc.
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

import type {Class} from "@swim/util";
import type {Observes} from "@swim/util";
import type {Trait} from "@swim/model";
import {ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {CanvasView} from "@swim/graphics";
import type {ControllerObserver} from "@swim/controller";
import {Controller} from "@swim/controller";
import {TraitViewRef} from "@swim/controller";
import {TraitViewControllerSet} from "@swim/controller";
import type {GeoPerspective} from "./GeoPerspective";
import type {GeoViewport} from "./GeoViewport";
import type {GeoView} from "./GeoView";
import type {GeoTrait} from "./GeoTrait";
import {GeoController} from "./GeoController";
import {MapView} from "./MapView";
import {MapTrait} from "./MapTrait";

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

  controllerDidSetLayerGeoPerspective?(geoPerspective: GeoPerspective | null, layerController: GeoController, controller: C): void;
}

/** @public */
export class MapController extends Controller {
  declare readonly observerType?: Class<MapControllerObserver>;

  protected createMapView(containerView: HtmlView): MapView | null {
    return null;
  }

  protected setGeoPerspective(geoPerspective: GeoPerspective | null): void {
    if (geoPerspective === null) {
      return;
    }
    const mapView = this.map.view;
    if (mapView !== null) {
      mapView.moveTo(geoPerspective);
    }
  }

  @TraitViewRef({
    consumed: true,
    traitType: MapTrait,
    observesTrait: true,
    willAttachTrait(mapTrait: MapTrait): void {
      this.owner.callObservers("controllerWillAttachMapTrait", mapTrait, this.owner);
    },
    initTrait(mapTrait: MapTrait): void {
      const mapView = this.view;
      if (mapView !== null) {
        this.owner.setGeoPerspective(mapTrait.geoPerspective.value);
      }
      this.owner.layers.addTraits(mapTrait.layers.traits);
    },
    deinitTrait(mapTrait: MapTrait): void {
      this.owner.layers.deleteTraits(mapTrait.layers.traits);
    },
    didDetachTrait(mapTrait: MapTrait): void {
      this.owner.callObservers("controllerDidDetachMapTrait", mapTrait, this.owner);
    },
    traitDidSetGeoPerspective(geoPerspective: GeoPerspective | null): void {
      this.owner.setGeoPerspective(geoPerspective);
    },
    traitWillAttachLayer(layerTrait: GeoTrait, targetTrait: Trait): void {
      this.owner.layers.addTrait(layerTrait, targetTrait);
    },
    traitDidDetachLayer(layerTrait: GeoTrait): void {
      this.owner.layers.deleteTrait(layerTrait);
    },
    viewType: MapView,
    observesView: true,
    initView(mapView: MapView): void {
      const mapTrait = this.trait;
      if (mapTrait !== null) {
        this.owner.setGeoPerspective(mapTrait.geoPerspective.value);
      }
      const layerControllers = this.owner.layers.controllers;
      for (const controllerId in layerControllers) {
        const layerController = layerControllers[controllerId]!;
        const layerView = layerController.geo.view;
        if (layerView !== null && layerView.parent === null) {
          layerController.geo.insertView(mapView);
        }
      }
    },
    willAttachView(mapView: MapView): void {
      this.owner.callObservers("controllerWillAttachMapView", mapView, this.owner);
    },
    didAttachView(mapView: MapView): void {
      this.owner.canvas.setView(mapView.canvas.view);
      this.owner.container.setView(mapView.container.view);
    },
    willDetachView(mapView: MapView): void {
      this.owner.canvas.setView(null);
      this.owner.container.setView(null);
    },
    didDetachView(mapView: MapView): void {
      this.owner.callObservers("controllerDidDetachMapView", mapView, this.owner);
    },
    viewWillSetGeoViewport(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport): void {
      this.owner.callObservers("controllerWillSetGeoViewport", newGeoViewport, oldGeoViewport, this.owner);
    },
    viewDidSetGeoViewport(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport): void {
      this.owner.callObservers("controllerDidSetGeoViewport", newGeoViewport, oldGeoViewport, this.owner);
    },
    viewWillAttachMapCanvas(mapCanvasView: CanvasView): void {
      this.owner.canvas.setView(mapCanvasView);
    },
    viewDidDetachMapCanvas(mapCanvasView: CanvasView): void {
      this.owner.canvas.setView(null);
    },
    viewWillAttachMapContainer(mapContainerView: HtmlView): void {
      this.owner.container.setView(mapContainerView);
    },
    viewDidDetachMapContainer(mapContainerView: HtmlView): void {
      this.owner.container.setView(null);
    },
  })
  readonly map!: TraitViewRef<this, MapTrait, MapView> & Observes<MapTrait> & Observes<MapView>;

  @ViewRef({
    viewType: CanvasView,
    willAttachView(mapCanvasView: CanvasView): void {
      this.owner.callObservers("controllerWillAttachMapCanvasView", mapCanvasView, this.owner);
    },
    didDetachView(mapCanvasView: CanvasView): void {
      this.owner.callObservers("controllerDidDetachMapCanvasView", mapCanvasView, this.owner);
    },
  })
  readonly canvas!: ViewRef<this, CanvasView>;

  @ViewRef({
    viewType: HtmlView,
    willAttachView(mapContainerView: HtmlView): void {
      this.owner.callObservers("controllerWillAttachMapContainerView", mapContainerView, this.owner);
    },
    didAttachView(containerView: HtmlView): void {
      let mapView = this.owner.map.view;
      if (mapView === null) {
        mapView = this.owner.createMapView(containerView);
        this.owner.map.setView(mapView);
      }
      if (mapView !== null) {
        mapView.container.setView(containerView);
      }
    },
    didDetachView(mapContainerView: HtmlView): void {
      this.owner.callObservers("controllerDidDetachMapContainerView", mapContainerView, this.owner);
    },
  })
  readonly container!: ViewRef<this, HtmlView>;

  @TraitViewControllerSet({
    controllerType: GeoController,
    binds: true,
    observes: true,
    get parentView(): MapView | null {
      return this.owner.map.view;
    },
    getTraitViewRef(layerController: GeoController): TraitViewRef<unknown, GeoTrait, GeoView> {
      return layerController.geo;
    },
    willAttachController(layerController: GeoController): void {
      this.owner.callObservers("controllerWillAttachLayer", layerController, this.owner);
    },
    didAttachController(layerController: GeoController): void {
      const layerTrait = layerController.geo.trait;
      if (layerTrait !== null) {
        this.attachLayerTrait(layerTrait, layerController);
      }
      const layerView = layerController.geo.view;
      if (layerView !== null) {
        this.attachLayerView(layerView, layerController);
      }
    },
    willDetachController(layerController: GeoController): void {
      const layerView = layerController.geo.view;
      if (layerView !== null) {
        this.detachLayerView(layerView, layerController);
      }
      const layerTrait = layerController.geo.trait;
      if (layerTrait !== null) {
        this.detachLayerTrait(layerTrait, layerController);
      }
    },
    didDetachController(layerController: GeoController): void {
      this.owner.callObservers("controllerDidDetachLayer", layerController, this.owner);
    },
    controllerWillAttachGeoTrait(layerTrait: GeoTrait, layerController: GeoController): void {
      this.owner.callObservers("controllerWillAttachLayerTrait", layerTrait, layerController, this.owner);
      this.attachLayerTrait(layerTrait, layerController);
    },
    controllerDidDetachGeoTrait(layerTrait: GeoTrait, layerController: GeoController): void {
      this.detachLayerTrait(layerTrait, layerController);
      this.owner.callObservers("controllerDidDetachLayerTrait", layerTrait, layerController, this.owner);
    },
    attachLayerTrait(layerTrait: GeoTrait, layerController: GeoController): void {
      // hook
    },
    detachLayerTrait(layerTrait: GeoTrait, layerController: GeoController): void {
      this.deleteController(layerController);
    },
    controllerWillAttachGeoView(layerView: GeoView, layerController: GeoController): void {
      this.owner.callObservers("controllerWillAttachLayerView", layerView, layerController, this.owner);
      this.attachLayerView(layerView, layerController);
    },
    controllerDidDetachGeoView(layerView: GeoView, layerController: GeoController): void {
      this.detachLayerView(layerView, layerController);
      this.owner.callObservers("controllerDidDetachLayerView", layerView, layerController, this.owner);
    },
    attachLayerView(layerView: GeoView, layerController: GeoController): void {
      const mapView = this.owner.map.view;
      if (mapView !== null && layerView.parent === null) {
        layerController.geo.insertView(mapView);
      }
    },
    detachLayerView(layerView: GeoView, layerController: GeoController): void {
      layerView.remove();
    },
    controllerDidSetGeoPerspective(geoPerspective: GeoPerspective | null, layerController: GeoController): void {
      this.owner.callObservers("controllerDidSetLayerGeoPerspective", geoPerspective, layerController, this.owner);
    },
    createController(layerTrait?: GeoTrait): GeoController {
      if (layerTrait !== void 0) {
        return layerTrait.createGeoController();
      }
      return super.createController();
    },
  })
  readonly layers!: TraitViewControllerSet<this, GeoTrait, GeoView, GeoController> & Observes<GeoController> & {
    attachLayerTrait(layerTrait: GeoTrait, layerController: GeoController): void,
    detachLayerTrait(layerTrait: GeoTrait, layerController: GeoController): void,
    attachLayerView(layerView: GeoView, layerController: GeoController): void,
    detachLayerView(layerView: GeoView, layerController: GeoController): void,
  };
}
