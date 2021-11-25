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

import {Class, AnyTiming, Timing} from "@swim/util";
import {MemberFastenerClass, Property} from "@swim/component";
import type {GeoBox} from "@swim/geo";
import type {Trait} from "@swim/model";
import {ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {CanvasView} from "@swim/graphics";
import {Controller, TraitViewRef, TraitViewControllerSet} from "@swim/controller";
import type {GeoPerspective} from "../geo/GeoPerspective";
import type {GeoViewport} from "../geo/GeoViewport";
import type {GeoView} from "../geo/GeoView";
import type {GeoTrait} from "../geo/GeoTrait";
import {GeoController} from "../geo/GeoController";
import {MapView} from "./MapView";
import {MapTrait} from "./MapTrait";
import type {MapControllerObserver} from "./MapControllerObserver";

/** @public */
export interface MapControllerLayerExt {
  attachLayerTrait(layerTrait: GeoTrait, layerController: GeoController): void;
  detachLayerTrait(layerTrait: GeoTrait, layerController: GeoController): void;
  attachLayerView(layerView: GeoView, layerController: GeoController): void;
  detachLayerView(layerView: GeoView, layerController: GeoController): void;
}

/** @public */
export abstract class MapController extends Controller {
  override readonly observerType?: Class<MapControllerObserver>;

  protected abstract createMapView(containerView: HtmlView): MapView;

  protected setGeoPerspective(geoPerspective: GeoPerspective | null): void {
    if (geoPerspective !== null) {
      const mapView = this.map.view;
      if (mapView !== null) {
        mapView.moveTo(geoPerspective);
      }
    }
  }

  @TraitViewRef<MapController, MapTrait, MapView>({
    traitType: MapTrait,
    observesTrait: true,
    willAttachTrait(mapTrait: MapTrait): void {
      this.owner.callObservers("controllerWillAttachMapTrait", mapTrait, this.owner);
    },
    didAttachTrait(mapTrait: MapTrait): void {
      const mapView = this.view;
      if (mapView !== null) {
        this.owner.setGeoPerspective(mapTrait.geoPerspective.state);
      }
      const layerTraits = mapTrait.layers.traits;
      for (const traitId in layerTraits) {
        const layerTrait = layerTraits[traitId]!;
        this.owner.layers.addTraitController(layerTrait);
      }
    },
    willDetachTrait(mapTrait: MapTrait): void {
      const layerTraits = mapTrait.layers.traits;
      for (const traitId in layerTraits) {
        const layerTrait = layerTraits[traitId]!;
        this.owner.layers.deleteTraitController(layerTrait);
      }
    },
    didDetachTrait(mapTrait: MapTrait): void {
      this.owner.callObservers("controllerDidDetachMapTrait", mapTrait, this.owner);
    },
    traitDidSetGeoPerspective(newGeoPerspective: GeoPerspective | null, oldGeoPerspective: GeoPerspective | null): void {
      this.owner.setGeoPerspective(newGeoPerspective);
    },
    traitWillAttachLayer(layerTrait: GeoTrait, targetTrait: Trait): void {
      this.owner.layers.addTraitController(layerTrait, targetTrait);
    },
    traitDidDetachLayer(layerTrait: GeoTrait): void {
      this.owner.layers.deleteTraitController(layerTrait);
    },
    viewType: MapView,
    observesView: true,
    willAttachView(mapView: MapView): void {
      this.owner.callObservers("controllerWillAttachMapView", mapView, this.owner);
    },
    didAttachView(mapView: MapView): void {
      this.owner.canvas.setView(mapView.canvas.view);
      this.owner.container.setView(mapView.container.view);
      const mapTrait = this.trait;
      if (mapTrait !== null) {
        this.owner.setGeoPerspective(mapTrait.geoPerspective.state);
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
  readonly map!: TraitViewRef<this, MapTrait, MapView>;
  static readonly map: MemberFastenerClass<MapController, "map">;

  @ViewRef<MapController, CanvasView>({
    type: CanvasView,
    willAttachView(mapCanvasView: CanvasView): void {
      this.owner.callObservers("controllerWillAttachMapCanvasView", mapCanvasView, this.owner);
    },
    didDetachView(mapCanvasView: CanvasView): void {
      this.owner.callObservers("controllerDidDetachMapCanvasView", mapCanvasView, this.owner);
    },
  })
  readonly canvas!: ViewRef<this, CanvasView>;
  static readonly canvas: MemberFastenerClass<MapController, "canvas">;

  @ViewRef<MapController, HtmlView>({
    type: HtmlView,
    willAttachView(mapContainerView: HtmlView): void {
      this.owner.callObservers("controllerWillAttachMapContainerView", mapContainerView, this.owner);
    },
    didAttachView(containerView: HtmlView): void {
      const mapView = this.owner.createMapView(containerView);
      mapView.container.setView(containerView);
      this.owner.map.setView(mapView);
    },
    didDetachView(mapContainerView: HtmlView): void {
      this.owner.callObservers("controllerDidDetachMapContainerView", mapContainerView, this.owner);
    },
  })
  readonly container!: ViewRef<this, HtmlView>;
  static readonly container: MemberFastenerClass<MapController, "container">;

  @Property({type: Timing, state: true})
  readonly geoTiming!: Property<this, Timing | boolean | undefined, AnyTiming>;

  @TraitViewControllerSet<MapController, GeoTrait, GeoView, GeoController, MapControllerLayerExt>({
    type: GeoController,
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
      // hook
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
      // hook
    },
    detachLayerView(layerView: GeoView, layerController: GeoController): void {
      layerView.remove();
    },
    controllerWillSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox, layerController: GeoController): void {
      this.owner.callObservers("controllerWillSetLayerGeoBounds", newGeoBounds, oldGeoBounds, layerController, this.owner);
    },
    controllerDidSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox, layerController: GeoController): void {
      this.owner.callObservers("controllerDidSetLayerGeoBounds", newGeoBounds, oldGeoBounds, layerController, this.owner);
    },
    createController(layerTrait?: GeoTrait): GeoController {
      if (layerTrait !== void 0) {
        return GeoController.fromTrait(layerTrait);
      } else {
        return TraitViewControllerSet.prototype.createController.call(this);
      }
    },
  })
  readonly layers!: TraitViewControllerSet<this, GeoTrait, GeoView, GeoController> & MapControllerLayerExt;
  static readonly layers: MemberFastenerClass<MapController, "layers">;
}
