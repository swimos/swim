// Copyright 2015-2021 Swim inc.
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

import {AnyTiming, Timing} from "@swim/mapping";
import type {GeoBox} from "@swim/geo";
import type {Trait} from "@swim/model";
import type {MoodVector, ThemeMatrix} from "@swim/theme";
import {HtmlView} from "@swim/dom";
import {CanvasView} from "@swim/graphics";
import {
  Component,
  ComponentProperty,
  ComponentView,
  ComponentViewTrait,
  ComponentFastener,
  CompositeComponent,
} from "@swim/component";
import type {GeoPerspective} from "../geo/GeoPerspective";
import type {GeoViewport} from "../geo/GeoViewport";
import type {GeoView} from "../geo/GeoView";
import type {GeoTrait} from "../geo/GeoTrait";
import {GeoComponent} from "../geo/GeoComponent";
import type {MapView} from "./MapView";
import {MapTrait} from "./MapTrait";
import type {MapComponentObserver} from "./MapComponentObserver";

export abstract class MapComponent extends CompositeComponent {
  constructor() {
    super();
    Object.defineProperty(this, "layerFasteners", {
      value: [],
      enumerable: true,
    });
  }

  override readonly componentObservers!: ReadonlyArray<MapComponentObserver>;

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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetMapTrait !== void 0) {
        componentObserver.componentWillSetMapTrait(newMapTrait, oldMapTrait, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetMapTrait !== void 0) {
        componentObserver.componentDidSetMapTrait(newMapTrait, oldMapTrait, this);
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
      const layerComponent = layerFasteners[i]!.component;
      if (layerComponent !== null) {
        const layerView = layerComponent.geo.view;
        if (layerView !== null && layerView.parentView === null) {
          layerComponent.geo.injectView(mapView);
        }
      }
    }
  }

  protected detachMapView(mapView: MapView): void {
    this.canvas.setView(null);
    this.container.setView(null);
  }

  protected willSetMapView(newMapView: MapView | null, oldMapView: MapView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetMapView !== void 0) {
        componentObserver.componentWillSetMapView(newMapView, oldMapView, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetMapView !== void 0) {
        componentObserver.componentDidSetMapView(newMapView, oldMapView, this);
      }
    }
  }

  protected themeMapView(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, mapView: MapView): void {
    // hook
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetGeoViewport !== void 0) {
        componentObserver.componentWillSetGeoViewport(newGeoViewport, oldGeoViewport, this);
      }
    }
  }

  protected onSetGeoViewport(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport, mapView: MapView): void {
    // hook
  }

  protected didSetGeoViewport(newGeoViewport: GeoViewport, oldGeoViewport: GeoViewport, mapView: MapView): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetGeoViewport !== void 0) {
        componentObserver.componentDidSetGeoViewport(newGeoViewport, oldGeoViewport, this);
      }
    }
  }

  /** @hidden */
  static MapFastener = ComponentViewTrait.define<MapComponent, MapView, MapTrait>({
    observeView: true,
    willSetView(newMapView: MapView | null, oldMapView: MapView | null): void {
      this.owner.willSetMapView(newMapView, oldMapView);
    },
    onSetView(newMapView: MapView | null, oldMapView: MapView | null): void {
      this.owner.onSetMapView(newMapView, oldMapView);
    },
    didSetView(newMapView: MapView | null, oldMapView: MapView | null): void {
      this.owner.didSetMapView(newMapView, oldMapView);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, mapView: MapView): void {
      this.owner.themeMapView(theme, mood, timing, mapView);
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
    traitType: MapTrait,
    observeTrait: true,
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
  });

  @ComponentViewTrait<MapComponent, MapView, MapTrait>({
    extends: MapComponent.MapFastener,
  })
  readonly map!: ComponentViewTrait<this, MapView, MapTrait>;

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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetCanvasView !== void 0) {
        componentObserver.componentWillSetCanvasView(newCanvasView, oldCanvasView, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetCanvasView !== void 0) {
        componentObserver.componentDidSetCanvasView(newCanvasView, oldCanvasView, this);
      }
    }
  }

  /** @hidden */
  static CanvasFastener = ComponentView.define<MapComponent, CanvasView>({
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

  @ComponentView<MapComponent, CanvasView>({
    extends: MapComponent.CanvasFastener,
  })
  readonly canvas!: ComponentView<this, CanvasView>;

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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetContainerView !== void 0) {
        componentObserver.componentWillSetContainerView(newContainerView, oldCanvasView, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetContainerView !== void 0) {
        componentObserver.componentDidSetContainerView(newContainerView, oldContainerView, this);
      }
    }
  }

  /** @hidden */
  static ContainerFastener = ComponentView.define<MapComponent, HtmlView>({
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

  @ComponentView<MapComponent, HtmlView>({
    extends: MapComponent.ContainerFastener,
  })
  readonly container!: ComponentView<this, HtmlView>;

  insertLayer(layerComponent: GeoComponent, targetComponent: Component | null = null): void {
    const layerFasteners = this.layerFasteners as ComponentFastener<this, GeoComponent>[];
    let targetIndex = layerFasteners.length;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerFastener = layerFasteners[i]!;
      if (layerFastener.component === layerComponent) {
        return;
      } else if (layerFastener.component === targetComponent) {
        targetIndex = i;
      }
    }
    const layerFastener = this.createLayerFastener(layerComponent);
    layerFasteners.splice(targetIndex, 0, layerFastener);
    layerFastener.setComponent(layerComponent, targetComponent);
    if (this.isMounted()) {
      layerFastener.mount();
    }
  }

  removeLayer(layerComponent: GeoComponent): void {
    const layerFasteners = this.layerFasteners as ComponentFastener<this, GeoComponent>[];
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerFastener = layerFasteners[i]!;
      if (layerFastener.component === layerComponent) {
        layerFastener.setComponent(null);
        if (this.isMounted()) {
          layerFastener.unmount();
        }
        layerFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected createLayer(layerTrait: GeoTrait): GeoComponent | null {
    return GeoComponent.fromTrait(layerTrait);
  }

  protected initLayer(layerComponent: GeoComponent, layerFastener: ComponentFastener<this, GeoComponent>): void {
    const layerTrait = layerComponent.geo.trait;
    if (layerTrait !== null) {
      this.initLayerTrait(layerTrait, layerFastener);
    }
    const layerView = layerComponent.geo.view;
    if (layerView !== null) {
      this.initLayerView(layerView, layerFastener);
    }
  }

  protected attachLayer(layerComponent: GeoComponent, layerFastener: ComponentFastener<this, GeoComponent>): void {
    const layerTrait = layerComponent.geo.trait;
    if (layerTrait !== null) {
      this.attachLayerTrait(layerTrait, layerFastener);
    }
    const layerView = layerComponent.geo.view;
    if (layerView !== null) {
      this.attachLayerView(layerView, layerFastener);
    }
  }

  protected detachLayer(layerComponent: GeoComponent, layerFastener: ComponentFastener<this, GeoComponent>): void {
    const layerView = layerComponent.geo.view;
    if (layerView !== null) {
      this.detachLayerView(layerView, layerFastener);
    }
    const layerTrait = layerComponent.geo.trait;
    if (layerTrait !== null) {
      this.detachLayerTrait(layerTrait, layerFastener);
    }
  }

  protected willSetLayer(newLayerComponent: GeoComponent | null, oldLayerComponent: GeoComponent | null,
                         layerFastener: ComponentFastener<this, GeoComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetLayer !== void 0) {
        componentObserver.componentWillSetLayer(newLayerComponent, oldLayerComponent, layerFastener);
      }
    }
  }

  protected onSetLayer(newLayerComponent: GeoComponent | null, oldLayerComponent: GeoComponent | null,
                       layerFastener: ComponentFastener<this, GeoComponent>): void {
    if (oldLayerComponent !== null) {
      this.detachLayer(oldLayerComponent, layerFastener);
    }
    if (newLayerComponent !== null) {
      this.attachLayer(newLayerComponent, layerFastener);
      this.initLayer(newLayerComponent, layerFastener);
    }
  }

  protected didSetLayer(newLayerComponent: GeoComponent | null, oldLayerComponent: GeoComponent | null,
                        layerFastener: ComponentFastener<this, GeoComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetLayer !== void 0) {
        componentObserver.componentDidSetLayer(newLayerComponent, oldLayerComponent, layerFastener);
      }
    }
  }

  insertLayerTrait(layerTrait: GeoTrait, targetTrait: Trait | null = null): void {
    const layerFasteners = this.layerFasteners as ComponentFastener<this, GeoComponent>[];
    let targetComponent: GeoComponent | null = null;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerComponent = layerFasteners[i]!.component;
      if (layerComponent !== null) {
        if (layerComponent.geo.trait === layerTrait) {
          return;
        } else if (layerComponent.geo.trait === targetTrait) {
          targetComponent = layerComponent;
        }
      }
    }
    const layerComponent = this.createLayer(layerTrait);
    if (layerComponent !== null) {
      layerComponent.geo.setTrait(layerTrait);
      this.insertChildComponent(layerComponent, targetComponent);
      if (layerComponent.geo.view === null) {
        const layerView = this.createLayerView(layerComponent);
        let targetView: GeoView | null = null;
        if (targetComponent !== null) {
          targetView = targetComponent.geo.view;
        }
        const mapView = this.map.view;
        if (mapView !== null) {
          layerComponent.geo.injectView(mapView, layerView, targetView, null);
        } else {
          layerComponent.geo.setView(layerView, targetView);
        }
      }
    }
  }

  removeLayerTrait(layerTrait: GeoTrait): void {
    const layerFasteners = this.layerFasteners as ComponentFastener<this, GeoComponent>[];
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerFastener = layerFasteners[i]!;
      const layerComponent = layerFastener.component;
      if (layerComponent !== null && layerComponent.geo.trait === layerTrait) {
        layerFastener.setComponent(null);
        if (this.isMounted()) {
          layerFastener.unmount();
        }
        layerFasteners.splice(i, 1);
        layerComponent.remove();
        return;
      }
    }
  }

  protected initLayerTrait(layerTrait: GeoTrait, layerFastener: ComponentFastener<this, GeoComponent>): void {
    // hook
  }

  protected attachLayerTrait(layerTrait: GeoTrait, layerFastener: ComponentFastener<this, GeoComponent>): void {
    // hook
  }

  protected detachLayerTrait(layerTrait: GeoTrait, layerFastener: ComponentFastener<this, GeoComponent>): void {
    // hook
  }

  protected willSetLayerTrait(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null,
                              layerFastener: ComponentFastener<this, GeoComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetLayerTrait !== void 0) {
        componentObserver.componentWillSetLayerTrait(newLayerTrait, oldLayerTrait, layerFastener);
      }
    }
  }

  protected onSetLayerTrait(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null,
                            layerFastener: ComponentFastener<this, GeoComponent>): void {
    if (oldLayerTrait !== null) {
      this.detachLayerTrait(oldLayerTrait, layerFastener);
    }
    if (newLayerTrait !== null) {
      this.attachLayerTrait(newLayerTrait, layerFastener);
      this.initLayerTrait(newLayerTrait, layerFastener);
    }
  }

  protected didSetLayerTrait(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null,
                             layerFastener: ComponentFastener<this, GeoComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetLayerTrait !== void 0) {
        componentObserver.componentDidSetLayerTrait(newLayerTrait, oldLayerTrait, layerFastener);
      }
    }
  }

  protected createLayerView(layerComponent: GeoComponent): GeoView | null {
    return layerComponent.geo.createView();
  }

  protected initLayerView(layerView: GeoView, layerFastener: ComponentFastener<this, GeoComponent>): void {
    // hook
  }

  protected attachLayerView(layerView: GeoView, layerFastener: ComponentFastener<this, GeoComponent>): void {
    // hook
  }

  protected detachLayerView(layerView: GeoView, layerFastener: ComponentFastener<this, GeoComponent>): void {
    layerView.remove();
  }

  protected willSetLayerView(newLayerView: GeoView | null, oldLayerView: GeoView | null,
                             layerFastener: ComponentFastener<this, GeoComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetLayerView !== void 0) {
        componentObserver.componentWillSetLayerView(newLayerView, oldLayerView, layerFastener);
      }
    }
  }

  protected onSetLayerView(newLayerView: GeoView | null, oldLayerView: GeoView | null,
                           layerFastener: ComponentFastener<this, GeoComponent>): void {
    if (oldLayerView !== null) {
      this.detachLayerView(oldLayerView, layerFastener);
    }
    if (newLayerView !== null) {
      this.attachLayerView(newLayerView, layerFastener);
      this.initLayerView(newLayerView, layerFastener);
    }
  }

  protected didSetLayerView(newLayerView: GeoView | null, oldLayerView: GeoView | null,
                            layerFastener: ComponentFastener<this, GeoComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetLayerView !== void 0) {
        componentObserver.componentDidSetLayerView(newLayerView, oldLayerView, layerFastener);
      }
    }
  }

  protected willSetLayerGeoBounds(newLayerGeoBounds: GeoBox, oldLayerGeoBounds: GeoBox,
                                  layerFastener: ComponentFastener<this, GeoComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetLayerGeoBounds !== void 0) {
        componentObserver.componentWillSetLayerGeoBounds(newLayerGeoBounds, oldLayerGeoBounds, layerFastener);
      }
    }
  }

  protected onSetLayerGeoBounds(newLayerGeoBounds: GeoBox, oldLayerGeoBounds: GeoBox,
                                layerFastener: ComponentFastener<this, GeoComponent>): void {
    // hook
  }

  protected didSetLayerGeoBounds(newLayerGeoBounds: GeoBox, oldLayerGeoBounds: GeoBox,
                                 layerFastener: ComponentFastener<this, GeoComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetLayerGeoBounds !== void 0) {
        componentObserver.componentDidSetLayerGeoBounds(newLayerGeoBounds, oldLayerGeoBounds, layerFastener);
      }
    }
  }

  @ComponentProperty({type: Timing, state: true})
  readonly geoTiming!: ComponentProperty<this, Timing | boolean | undefined, AnyTiming>;

  /** @hidden */
  static LayerFastener = ComponentFastener.define<MapComponent, GeoComponent>({
    type: GeoComponent,
    child: false,
    observe: true,
    willSetComponent(newLayerComponent: GeoComponent | null, oldLayerComponent: GeoComponent | null): void {
      this.owner.willSetLayer(newLayerComponent, oldLayerComponent, this);
    },
    onSetComponent(newLayerComponent: GeoComponent | null, oldLayerComponent: GeoComponent | null): void {
      this.owner.onSetLayer(newLayerComponent, oldLayerComponent, this);
    },
    didSetComponent(newLayerComponent: GeoComponent | null, oldLayerComponent: GeoComponent | null): void {
      this.owner.didSetLayer(newLayerComponent, oldLayerComponent, this);
    },
    componentWillSetGeoTrait(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null): void {
      this.owner.willSetLayerTrait(newLayerTrait, oldLayerTrait, this);
    },
    componentDidSetGeoTrait(newLayerTrait: GeoTrait | null, oldLayerTrait: GeoTrait | null): void {
      this.owner.onSetLayerTrait(newLayerTrait, oldLayerTrait, this);
      this.owner.didSetLayerTrait(newLayerTrait, oldLayerTrait, this);
    },
    componentWillSetGeoView(newLayerView: GeoView | null, oldLayerView: GeoView | null): void {
      this.owner.willSetLayerView(newLayerView, oldLayerView, this);
    },
    componentDidSetGeoView(newLayerView: GeoView | null, oldLayerView: GeoView | null): void {
      this.owner.onSetLayerView(newLayerView, oldLayerView, this);
      this.owner.didSetLayerView(newLayerView, oldLayerView, this);
    },
    componentWillSetGeoBounds(newLayerGeoBounds: GeoBox, oldLayerGeoBounds: GeoBox): void {
      this.owner.willSetLayerGeoBounds(newLayerGeoBounds, oldLayerGeoBounds, this);
    },
    componentDidSetGeoBounds(newLayerGeoBounds: GeoBox, oldLayerGeoBounds: GeoBox): void {
      this.owner.onSetLayerGeoBounds(newLayerGeoBounds, oldLayerGeoBounds, this);
      this.owner.didSetLayerGeoBounds(newLayerGeoBounds, oldLayerGeoBounds, this);
    },
  });

  protected createLayerFastener(layerComponent: GeoComponent): ComponentFastener<this, GeoComponent> {
    return new MapComponent.LayerFastener(this, layerComponent.key, "layer");
  }

  /** @hidden */
  readonly layerFasteners!: ReadonlyArray<ComponentFastener<this, GeoComponent>>;

  protected getLayerFastener(layerTrait: GeoTrait): ComponentFastener<this, GeoComponent> | null {
    const layerFasteners = this.layerFasteners;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerFastener = layerFasteners[i]!;
      const layerComponent = layerFastener.component;
      if (layerComponent !== null && layerComponent.geo.trait === layerTrait) {
        return layerFastener;
      }
    }
    return null;
  }

  /** @hidden */
  protected mountLayerFasteners(): void {
    const layerFasteners = this.layerFasteners;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerFastener = layerFasteners[i]!;
      layerFastener.mount();
    }
  }

  /** @hidden */
  protected unmountLayerFasteners(): void {
    const layerFasteners = this.layerFasteners;
    for (let i = 0, n = layerFasteners.length; i < n; i += 1) {
      const layerFastener = layerFasteners[i]!;
      layerFastener.unmount();
    }
  }

  protected detectLayerComponent(component: Component): GeoComponent | null {
    return component instanceof GeoComponent ? component : null;
  }

  protected override onInsertChildComponent(childComponent: Component, targetComponent: Component | null): void {
    super.onInsertChildComponent(childComponent, targetComponent);
    const layerComponent = this.detectLayerComponent(childComponent);
    if (layerComponent !== null) {
      this.insertLayer(layerComponent, targetComponent);
    }
  }

  protected override onRemoveChildComponent(childComponent: Component): void {
    super.onRemoveChildComponent(childComponent);
    const layerComponent = this.detectLayerComponent(childComponent);
    if (layerComponent !== null) {
      this.removeLayer(layerComponent);
    }
  }

  /** @hidden */
  protected override mountComponentFasteners(): void {
    super.mountComponentFasteners();
    this.mountLayerFasteners();
  }

  /** @hidden */
  protected override unmountComponentFasteners(): void {
    this.unmountLayerFasteners();
    super.unmountComponentFasteners();
  }
}
