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
import {Property} from "@swim/fastener";
import type {GeoBox} from "@swim/geo";
import type {Trait} from "@swim/model";
import {ViewFastener} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {CanvasView} from "@swim/graphics";
import {Controller, TraitViewFastener, ControllerFastener, GenericController} from "@swim/controller";
import type {GeoPerspective} from "../geo/GeoPerspective";
import type {GeoViewport} from "../geo/GeoViewport";
import type {GeoView} from "../geo/GeoView";
import type {GeoTrait} from "../geo/GeoTrait";
import {GeoController} from "../geo/GeoController";
import {MapView} from "./MapView";
import {MapTrait} from "./MapTrait";
import type {MapControllerObserver} from "./MapControllerObserver";

export abstract class MapController extends GenericController {
  constructor() {
    super();
    this.layerFasteners = [];
  }

  override readonly observerType?: Class<MapControllerObserver>;

  protected initMapTrait(mapTrait: MapTrait): void {
    // hook
  }

  protected attachMapTrait(mapTrait: MapTrait): void {
    const mapView = this.map.view;
    if (mapView !== null) {
      this.setGeoPerspective(mapTrait.geoPerspective.state, mapTrait);
    }

    const layerFasteners = mapTrait.layerFasteners;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerTrait = layerFasteners[i]!.trait;
      if (layerTrait !== null) {
        this.insertLayerTrait(layerTrait);
      }
    }
  }

  protected detachMapTrait(mapTrait: MapTrait): void {
    const layerFasteners = mapTrait.layerFasteners;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerTrait = layerFasteners[i]!.trait;
      if (layerTrait !== null) {
        this.removeLayerTrait(layerTrait);
      }
    }
  }

  protected willSetMapTrait(newMapTrait: MapTrait | null, oldMapTrait: MapTrait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetMapTrait !== void 0) {
        observer.controllerWillSetMapTrait(newMapTrait, oldMapTrait, this);
      }
    }
  }

  protected onSetMapTrait(newMapTrait: MapTrait | null, oldMapTrait: MapTrait | null): void {
    if (oldMapTrait !== null) {
      this.detachMapTrait(oldMapTrait);
    }
    if (newMapTrait !== null) {
      this.attachMapTrait(newMapTrait);
      this.initMapTrait(newMapTrait);
    }
  }

  protected didSetMapTrait(newMapTrait: MapTrait | null, oldMapTrait: MapTrait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetMapTrait !== void 0) {
        observer.controllerDidSetMapTrait(newMapTrait, oldMapTrait, this);
      }
    }
  }

  protected abstract createMapView(containerView: HtmlView): MapView;

  protected initMapView(mapView: MapView): void {
    // hook
  }

  protected attachMapView(mapView: MapView): void {
    this.canvas.setView(mapView.canvas.view);
    this.container.setView(mapView.container.view);

    const mapTrait = this.map.trait;
    if (mapTrait !== null) {
      this.setGeoPerspective(mapTrait.geoPerspective.state, mapTrait);
    }

    const layerFasteners = this.layerFasteners;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerController = layerFasteners[i]!.controller;
      if (layerController !== null) {
        const layerView = layerController.geo.view;
        if (layerView !== null && layerView.parent === null) {
          layerController.geo.injectView(mapView);
        }
      }
    }
  }

  protected detachMapView(mapView: MapView): void {
    this.canvas.setView(null);
    this.container.setView(null);
  }

  protected willSetMapView(newMapView: MapView | null, oldMapView: MapView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetMapView !== void 0) {
        observer.controllerWillSetMapView(newMapView, oldMapView, this);
      }
    }
  }

  protected onSetMapView(newMapView: MapView | null, oldMapView: MapView | null): void {
    if (oldMapView !== null) {
      this.detachMapView(oldMapView);
    }
    if (newMapView !== null) {
      this.attachMapView(newMapView);
      this.initMapView(newMapView);
    }
  }

  protected didSetMapView(newMapView: MapView | null, oldMapView: MapView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetMapView !== void 0) {
        observer.controllerDidSetMapView(newMapView, oldMapView, this);
      }
    }
  }

  protected setGeoPerspective(geoPerspective: GeoPerspective | null, mapTrait: MapTrait): void {
    if (geoPerspective !== null) {
      const mapView = this.map.view;
      if (mapView !== null) {
        mapView.moveTo(geoPerspective);
      }
    }
  }

  protected willSetGeoViewport(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport, mapView: MapView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetGeoViewport !== void 0) {
        observer.controllerWillSetGeoViewport(newGeoViewport, oldGeoViewport, this);
      }
    }
  }

  protected onSetGeoViewport(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport, mapView: MapView): void {
    // hook
  }

  protected didSetGeoViewport(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport, mapView: MapView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetGeoViewport !== void 0) {
        observer.controllerDidSetGeoViewport(newGeoViewport, oldGeoViewport, this);
      }
    }
  }

  /** @internal */
  static MapFastener = TraitViewFastener.define<MapController, MapTrait, MapView>({
    traitType: MapTrait,
    observesTrait: true,
    willSetTrait(newMapTrait: MapTrait | null, oldMapTrait: MapTrait | null): void {
      this.owner.willSetMapTrait(newMapTrait, oldMapTrait);
    },
    onSetTrait(newMapTrait: MapTrait | null, oldMapTrait: MapTrait | null): void {
      this.owner.onSetMapTrait(newMapTrait, oldMapTrait);
    },
    didSetTrait(newMapTrait: MapTrait | null, oldMapTrait: MapTrait | null): void {
      this.owner.didSetMapTrait(newMapTrait, oldMapTrait);
    },
    traitDidSetGeoPerspective(newGeoPerspective: GeoPerspective | null, oldGeoPerspective: GeoPerspective | null, mapTrait: MapTrait): void {
      this.owner.setGeoPerspective(newGeoPerspective, mapTrait);
    },
    traitWillSetLayer(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null, targetTrait: Trait): void {
      if (oldLayerTrait !== null) {
        this.owner.removeLayerTrait(oldLayerTrait);
      }
    },
    traitDidSetLayer(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null, targetTrait: Trait): void {
      if (newLayerTrait !== null) {
        this.owner.insertLayerTrait(newLayerTrait, targetTrait);
      }
    },
    viewType: MapView,
    observesView: true,
    willSetView(newMapView: MapView | null, oldMapView: MapView | null): void {
      this.owner.willSetMapView(newMapView, oldMapView);
    },
    onSetView(newMapView: MapView | null, oldMapView: MapView | null): void {
      this.owner.onSetMapView(newMapView, oldMapView);
    },
    didSetView(newMapView: MapView | null, oldMapView: MapView | null): void {
      this.owner.didSetMapView(newMapView, oldMapView);
    },
    viewWillSetGeoViewport(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport, mapView: MapView): void {
      this.owner.willSetGeoViewport(newGeoViewport, oldGeoViewport, mapView);
    },
    viewDidSetGeoViewport(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport, mapView: MapView): void {
      this.owner.onSetGeoViewport(newGeoViewport, oldGeoViewport, mapView);
      this.owner.didSetGeoViewport(newGeoViewport, oldGeoViewport, mapView);
    },
    viewDidSetMapCanvas(newMapCanvasView: CanvasView | null, oldMapCanvasView: CanvasView | null, mapView: MapView): void {
      this.owner.canvas.setView(newMapCanvasView);
    },
    viewDidSetMapContainer(newMapContainerView: HtmlView | null, oldMapContainerView: HtmlView | null, mapView: MapView): void {
      this.owner.container.setView(newMapContainerView);
    },
  });

  @TraitViewFastener<MapController, MapTrait, MapView>({
    extends: MapController.MapFastener,
  })
  readonly map!: TraitViewFastener<this, MapTrait, MapView>;

  protected initCanvasView(canvasView: CanvasView): void {
    // hook
  }

  protected attachCanvasView(canvasView: CanvasView): void {
    // hook
  }

  protected detachCanvasView(canvasView: CanvasView): void {
    // hook
  }

  protected willSetCanvasView(newCanvasView: CanvasView | null, oldCanvasView: CanvasView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetCanvasView !== void 0) {
        observer.controllerWillSetCanvasView(newCanvasView, oldCanvasView, this);
      }
    }
  }

  protected onSetCanvasView(newCanvasView: CanvasView | null, oldCanvasView: CanvasView | null): void {
    if (oldCanvasView !== null) {
      this.detachCanvasView(oldCanvasView);
    }
    if (newCanvasView !== null) {
      this.attachCanvasView(newCanvasView);
      this.initCanvasView(newCanvasView);
    }
  }

  protected didSetCanvasView(newCanvasView: CanvasView | null, oldCanvasView: CanvasView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetCanvasView !== void 0) {
        observer.controllerDidSetCanvasView(newCanvasView, oldCanvasView, this);
      }
    }
  }

  /** @internal */
  static CanvasFastener = ViewFastener.define<MapController, CanvasView>({
    type: CanvasView,
    willSetView(newCanvasView: CanvasView | null, oldCanvasView: CanvasView | null): void {
      this.owner.willSetCanvasView(newCanvasView, oldCanvasView);
    },
    onSetView(newCanvasView: CanvasView | null, oldCanvasView: CanvasView | null): void {
      this.owner.onSetCanvasView(newCanvasView, oldCanvasView);
    },
    didSetView(newCanvasView: CanvasView | null, oldCanvasView: CanvasView | null): void {
      this.owner.didSetCanvasView(newCanvasView, oldCanvasView);
    },
  });

  @ViewFastener<MapController, CanvasView>({
    extends: MapController.CanvasFastener,
  })
  readonly canvas!: ViewFastener<this, CanvasView>;

  protected initContainerView(containerView: HtmlView): void {
    const mapView = this.createMapView(containerView);
    mapView.container.setView(containerView);
    this.map.setView(mapView);
  }

  protected attachContainerView(containerView: HtmlView): void {
    // hook
  }

  protected detachContainerView(containerView: HtmlView): void {
    // hook
  }

  protected willSetContainerView(newContainerView: HtmlView | null, oldCanvasView: HtmlView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetContainerView !== void 0) {
        observer.controllerWillSetContainerView(newContainerView, oldCanvasView, this);
      }
    }
  }

  protected onSetContainerView(newContainerView: HtmlView | null, oldContainerView: HtmlView | null): void {
    if (oldContainerView !== null) {
      this.detachContainerView(oldContainerView);
    }
    if (newContainerView !== null) {
      this.attachContainerView(newContainerView);
      this.initContainerView(newContainerView);
    }
  }

  protected didSetContainerView(newContainerView: HtmlView | null, oldContainerView: HtmlView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetContainerView !== void 0) {
        observer.controllerDidSetContainerView(newContainerView, oldContainerView, this);
      }
    }
  }

  /** @internal */
  static ContainerFastener = ViewFastener.define<MapController, HtmlView>({
    type: HtmlView,
    willSetView(newContainerView: HtmlView | null, oldContainerView: HtmlView | null): void {
      this.owner.willSetContainerView(newContainerView, oldContainerView);
    },
    onSetView(newContainerView: HtmlView | null, oldContainerView: HtmlView | null): void {
      this.owner.onSetContainerView(newContainerView, oldContainerView);
    },
    didSetView(newContainerView: HtmlView | null, oldContainerView: HtmlView | null): void {
      this.owner.didSetContainerView(newContainerView, oldContainerView);
    },
  });

  @ViewFastener<MapController, HtmlView>({
    extends: MapController.ContainerFastener,
  })
  readonly container!: ViewFastener<this, HtmlView>;

  insertLayer(layerController: GeoController, targetController: Controller | null = null): void {
    const layerFasteners = this.layerFasteners as ControllerFastener<this, GeoController>[];
    let targetIndex = layerFasteners.length;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerFastener = layerFasteners[i]!;
      if (layerFastener.controller === layerController) {
        return;
      } else if (layerFastener.controller === targetController) {
        targetIndex = i;
      }
    }
    const layerFastener = this.createLayerFastener(layerController);
    layerFasteners.splice(targetIndex, 0, layerFastener);
    layerFastener.setController(layerController, targetController);
    if (this.mounted) {
      layerFastener.mount();
    }
  }

  removeLayer(layerController: GeoController): void {
    const layerFasteners = this.layerFasteners as ControllerFastener<this, GeoController>[];
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerFastener = layerFasteners[i]!;
      if (layerFastener.controller === layerController) {
        layerFastener.setController(null);
        if (this.mounted) {
          layerFastener.unmount();
        }
        layerFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected createLayer(layerTrait: GeoTrait): GeoController | null {
    return GeoController.fromTrait(layerTrait);
  }

  protected initLayer(layerController: GeoController, layerFastener: ControllerFastener<this, GeoController>): void {
    const layerTrait = layerController.geo.trait;
    if (layerTrait !== null) {
      this.initLayerTrait(layerTrait, layerFastener);
    }
    const layerView = layerController.geo.view;
    if (layerView !== null) {
      this.initLayerView(layerView, layerFastener);
    }
  }

  protected attachLayer(layerController: GeoController, layerFastener: ControllerFastener<this, GeoController>): void {
    const layerTrait = layerController.geo.trait;
    if (layerTrait !== null) {
      this.attachLayerTrait(layerTrait, layerFastener);
    }
    const layerView = layerController.geo.view;
    if (layerView !== null) {
      this.attachLayerView(layerView, layerFastener);
    }
  }

  protected detachLayer(layerController: GeoController, layerFastener: ControllerFastener<this, GeoController>): void {
    const layerView = layerController.geo.view;
    if (layerView !== null) {
      this.detachLayerView(layerView, layerFastener);
    }
    const layerTrait = layerController.geo.trait;
    if (layerTrait !== null) {
      this.detachLayerTrait(layerTrait, layerFastener);
    }
  }

  protected willSetLayer(newLayerController: GeoController | null, oldLayerController: GeoController | null,
                         layerFastener: ControllerFastener<this, GeoController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetLayer !== void 0) {
        observer.controllerWillSetLayer(newLayerController, oldLayerController, layerFastener);
      }
    }
  }

  protected onSetLayer(newLayerController: GeoController | null, oldLayerController: GeoController | null,
                       layerFastener: ControllerFastener<this, GeoController>): void {
    if (oldLayerController !== null) {
      this.detachLayer(oldLayerController, layerFastener);
    }
    if (newLayerController !== null) {
      this.attachLayer(newLayerController, layerFastener);
      this.initLayer(newLayerController, layerFastener);
    }
  }

  protected didSetLayer(newLayerController: GeoController | null, oldLayerController: GeoController | null,
                        layerFastener: ControllerFastener<this, GeoController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetLayer !== void 0) {
        observer.controllerDidSetLayer(newLayerController, oldLayerController, layerFastener);
      }
    }
  }

  insertLayerTrait(layerTrait: GeoTrait, targetTrait: Trait | null = null): void {
    const layerFasteners = this.layerFasteners as ControllerFastener<this, GeoController>[];
    let targetController: GeoController | null = null;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerController = layerFasteners[i]!.controller;
      if (layerController !== null) {
        if (layerController.geo.trait === layerTrait) {
          return;
        } else if (layerController.geo.trait === targetTrait) {
          targetController = layerController;
        }
      }
    }
    const layerController = this.createLayer(layerTrait);
    if (layerController !== null) {
      layerController.geo.setTrait(layerTrait);
      this.insertChild(layerController, targetController);
      if (layerController.geo.view === null) {
        const layerView = this.createLayerView(layerController);
        let targetView: GeoView | null = null;
        if (targetController !== null) {
          targetView = targetController.geo.view;
        }
        const mapView = this.map.view;
        if (mapView !== null) {
          layerController.geo.injectView(mapView, layerView, targetView, null);
        } else {
          layerController.geo.setView(layerView, targetView);
        }
      }
    }
  }

  removeLayerTrait(layerTrait: GeoTrait): void {
    const layerFasteners = this.layerFasteners as ControllerFastener<this, GeoController>[];
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerFastener = layerFasteners[i]!;
      const layerController = layerFastener.controller;
      if (layerController !== null && layerController.geo.trait === layerTrait) {
        layerFastener.setController(null);
        if (this.mounted) {
          layerFastener.unmount();
        }
        layerFasteners.splice(i, 1);
        layerController.remove();
        return;
      }
    }
  }

  protected initLayerTrait(layerTrait: GeoTrait, layerFastener: ControllerFastener<this, GeoController>): void {
    // hook
  }

  protected attachLayerTrait(layerTrait: GeoTrait, layerFastener: ControllerFastener<this, GeoController>): void {
    // hook
  }

  protected detachLayerTrait(layerTrait: GeoTrait, layerFastener: ControllerFastener<this, GeoController>): void {
    // hook
  }

  protected willSetLayerTrait(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null,
                              layerFastener: ControllerFastener<this, GeoController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetLayerTrait !== void 0) {
        observer.controllerWillSetLayerTrait(newLayerTrait, oldLayerTrait, layerFastener);
      }
    }
  }

  protected onSetLayerTrait(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null,
                            layerFastener: ControllerFastener<this, GeoController>): void {
    if (oldLayerTrait !== null) {
      this.detachLayerTrait(oldLayerTrait, layerFastener);
    }
    if (newLayerTrait !== null) {
      this.attachLayerTrait(newLayerTrait, layerFastener);
      this.initLayerTrait(newLayerTrait, layerFastener);
    }
  }

  protected didSetLayerTrait(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null,
                             layerFastener: ControllerFastener<this, GeoController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetLayerTrait !== void 0) {
        observer.controllerDidSetLayerTrait(newLayerTrait, oldLayerTrait, layerFastener);
      }
    }
  }

  protected createLayerView(layerController: GeoController): GeoView | null {
    return layerController.geo.createView();
  }

  protected initLayerView(layerView: GeoView, layerFastener: ControllerFastener<this, GeoController>): void {
    // hook
  }

  protected attachLayerView(layerView: GeoView, layerFastener: ControllerFastener<this, GeoController>): void {
    // hook
  }

  protected detachLayerView(layerView: GeoView, layerFastener: ControllerFastener<this, GeoController>): void {
    layerView.remove();
  }

  protected willSetLayerView(newLayerView: GeoView | null, oldLayerView: GeoView | null,
                             layerFastener: ControllerFastener<this, GeoController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetLayerView !== void 0) {
        observer.controllerWillSetLayerView(newLayerView, oldLayerView, layerFastener);
      }
    }
  }

  protected onSetLayerView(newLayerView: GeoView | null, oldLayerView: GeoView | null,
                           layerFastener: ControllerFastener<this, GeoController>): void {
    if (oldLayerView !== null) {
      this.detachLayerView(oldLayerView, layerFastener);
    }
    if (newLayerView !== null) {
      this.attachLayerView(newLayerView, layerFastener);
      this.initLayerView(newLayerView, layerFastener);
    }
  }

  protected didSetLayerView(newLayerView: GeoView | null, oldLayerView: GeoView | null,
                            layerFastener: ControllerFastener<this, GeoController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetLayerView !== void 0) {
        observer.controllerDidSetLayerView(newLayerView, oldLayerView, layerFastener);
      }
    }
  }

  protected willSetLayerGeoBounds(newLayerGeoBounds: GeoBox, oldLayerGeoBounds: GeoBox,
                                  layerFastener: ControllerFastener<this, GeoController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetLayerGeoBounds !== void 0) {
        observer.controllerWillSetLayerGeoBounds(newLayerGeoBounds, oldLayerGeoBounds, layerFastener);
      }
    }
  }

  protected onSetLayerGeoBounds(newLayerGeoBounds: GeoBox, oldLayerGeoBounds: GeoBox,
                                layerFastener: ControllerFastener<this, GeoController>): void {
    // hook
  }

  protected didSetLayerGeoBounds(newLayerGeoBounds: GeoBox, oldLayerGeoBounds: GeoBox,
                                 layerFastener: ControllerFastener<this, GeoController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetLayerGeoBounds !== void 0) {
        observer.controllerDidSetLayerGeoBounds(newLayerGeoBounds, oldLayerGeoBounds, layerFastener);
      }
    }
  }

  @Property({type: Timing, state: true})
  readonly geoTiming!: Property<this, Timing | boolean | undefined, AnyTiming>;

  /** @internal */
  static LayerFastener = ControllerFastener.define<MapController, GeoController>({
    type: GeoController,
    child: false,
    observes: true,
    willSetController(newLayerController: GeoController | null, oldLayerController: GeoController | null): void {
      this.owner.willSetLayer(newLayerController, oldLayerController, this);
    },
    onSetController(newLayerController: GeoController | null, oldLayerController: GeoController | null): void {
      this.owner.onSetLayer(newLayerController, oldLayerController, this);
    },
    didSetController(newLayerController: GeoController | null, oldLayerController: GeoController | null): void {
      this.owner.didSetLayer(newLayerController, oldLayerController, this);
    },
    controllerWillSetGeoTrait(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null): void {
      this.owner.willSetLayerTrait(newLayerTrait, oldLayerTrait, this);
    },
    controllerDidSetGeoTrait(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null): void {
      this.owner.onSetLayerTrait(newLayerTrait, oldLayerTrait, this);
      this.owner.didSetLayerTrait(newLayerTrait, oldLayerTrait, this);
    },
    controllerWillSetGeoView(newLayerView: GeoView | null, oldLayerView: GeoView | null): void {
      this.owner.willSetLayerView(newLayerView, oldLayerView, this);
    },
    controllerDidSetGeoView(newLayerView: GeoView | null, oldLayerView: GeoView | null): void {
      this.owner.onSetLayerView(newLayerView, oldLayerView, this);
      this.owner.didSetLayerView(newLayerView, oldLayerView, this);
    },
    controllerWillSetGeoBounds(newLayerGeoBounds: GeoBox, oldLayerGeoBounds: GeoBox): void {
      this.owner.willSetLayerGeoBounds(newLayerGeoBounds, oldLayerGeoBounds, this);
    },
    controllerDidSetGeoBounds(newLayerGeoBounds: GeoBox, oldLayerGeoBounds: GeoBox): void {
      this.owner.onSetLayerGeoBounds(newLayerGeoBounds, oldLayerGeoBounds, this);
      this.owner.didSetLayerGeoBounds(newLayerGeoBounds, oldLayerGeoBounds, this);
    },
  });

  protected createLayerFastener(layerController: GeoController): ControllerFastener<this, GeoController> {
    return MapController.LayerFastener.create(this, layerController.key ?? "layer");
  }

  /** @internal */
  readonly layerFasteners: ReadonlyArray<ControllerFastener<this, GeoController>>;

  protected getLayerFastener(layerTrait: GeoTrait): ControllerFastener<this, GeoController> | null {
    const layerFasteners = this.layerFasteners;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerFastener = layerFasteners[i]!;
      const layerController = layerFastener.controller;
      if (layerController !== null && layerController.geo.trait === layerTrait) {
        return layerFastener;
      }
    }
    return null;
  }

  /** @internal */
  protected mountLayerFasteners(): void {
    const layerFasteners = this.layerFasteners;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerFastener = layerFasteners[i]!;
      layerFastener.mount();
    }
  }

  /** @internal */
  protected unmountLayerFasteners(): void {
    const layerFasteners = this.layerFasteners;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerFastener = layerFasteners[i]!;
      layerFastener.unmount();
    }
  }

  protected detectLayerController(controller: Controller): GeoController | null {
    return controller instanceof GeoController ? controller : null;
  }

  protected override onInsertChild(childController: Controller, targetController: Controller | null): void {
    super.onInsertChild(childController, targetController);
    const layerController = this.detectLayerController(childController);
    if (layerController !== null) {
      this.insertLayer(layerController, targetController);
    }
  }

  protected override onRemoveChild(childController: Controller): void {
    super.onRemoveChild(childController);
    const layerController = this.detectLayerController(childController);
    if (layerController !== null) {
      this.removeLayer(layerController);
    }
  }

  /** @internal */
  protected override mountFasteners(): void {
    super.mountFasteners();
    this.mountLayerFasteners();
  }

  /** @internal */
  protected override unmountFasteners(): void {
    this.unmountLayerFasteners();
    super.unmountFasteners();
  }
}
