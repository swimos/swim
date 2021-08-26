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

import type {GeoTile} from "@swim/geo";
import type {Trait} from "@swim/model";
import {
  Component,
  ComponentViewTraitConstructor,
  ComponentViewTrait,
  ComponentFastener,
} from "@swim/component";
import type {GeoViewport} from "../geo/GeoViewport";
import type {GeoViewContext} from "../geo/GeoViewContext";
import type {GeoView} from "../geo/GeoView";
import {GeoLayerComponent} from "../layer/GeoLayerComponent";
import {GeoGridView} from "./GeoGridView";
import {GeoGridTrait} from "./GeoGridTrait";
import type {GeoGridComponentObserver} from "./GeoGridComponentObserver";

export class GeoGridComponent extends GeoLayerComponent {
  constructor(geoTile: GeoTile) {
    super();
    Object.defineProperty(this, "geoTile", {
      value: geoTile,
      enumerable: true,
    });
    Object.defineProperty(this, "tileFasteners", {
      value: [],
      enumerable: true,
    });
  }

  override readonly componentObservers!: ReadonlyArray<GeoGridComponentObserver>;

  readonly geoTile!: GeoTile;

  protected override initGeoTrait(geoTrait: GeoGridTrait): void {
    super.initGeoTrait(geoTrait);
  }

  protected override attachGeoTrait(geoTrait: GeoGridTrait): void {
    super.attachGeoTrait(geoTrait);
    const tileFasteners = geoTrait.tileFasteners;
    for (let i = 0, n = tileFasteners.length; i < n; i += 1) {
      const tileTrait = tileFasteners[i]!.trait;
      if (tileTrait !== null) {
        this.insertTileTrait(tileTrait);
      }
    }
    const geoView = this.geo.view;
    if (geoView !== null && !geoView.isCulled()) {
      geoTrait.addTraitConsumer(this);
    }
  }

  protected override detachGeoTrait(geoTrait: GeoGridTrait): void {
    geoTrait.removeTraitConsumer(this);
    const tileFasteners = geoTrait.tileFasteners;
    for (let i = 0, n = tileFasteners.length; i < n; i += 1) {
      const tileTrait = tileFasteners[i]!.trait;
      if (tileTrait !== null) {
        this.removeTileTrait(tileTrait);
      }
    }
    super.detachGeoTrait(geoTrait);
  }

  protected override willSetGeoTrait(newGeoTrait: GeoGridTrait | null, oldGeoTrait: GeoGridTrait | null): void {
    super.willSetGeoTrait(newGeoTrait, oldGeoTrait);
  }

  protected override onSetGeoTrait(newGeoTrait: GeoGridTrait | null, oldGeoTrait: GeoGridTrait | null): void {
    super.onSetGeoTrait(newGeoTrait, oldGeoTrait);
  }

  protected override didSetGeoTrait(newGeoTrait: GeoGridTrait | null, oldGeoTrait: GeoGridTrait | null): void {
    super.didSetGeoTrait(newGeoTrait, oldGeoTrait);
  }

  protected override createGeoView(): GeoView | null {
    return new GeoGridView(this.geoTile);
  }

  protected override initGeoView(geoView: GeoView): void {
    super.initGeoView(geoView);
    geoView.setCulled(true);
  }

  protected override attachGeoView(geoView: GeoView): void {
    super.attachGeoView(geoView);
    const tileFasteners = this.tileFasteners;
    for (let i = 0, n = tileFasteners.length; i < n; i += 1) {
      const tileComponent = tileFasteners[i]!.component;
      if (tileComponent !== null) {
        const tileView = tileComponent.geo.view;
        if (tileView !== null && tileView.parentView === null) {
          tileComponent.geo.injectView(geoView);
        }
      }
    }
  }

  protected override detachGeoView(geoView: GeoView): void {
    super.detachGeoView(geoView);
  }

  protected override projectGeoView(viewContext: GeoViewContext, geoView: GeoView): void {
    super.projectGeoView(viewContext, geoView);
    this.autoCullGeoView(viewContext.geoViewport, geoView);
    this.autoConsumeGeoView(viewContext.geoViewport, geoView);
  }

  get minCullZoom(): number {
    return this.geoTile.z;
  }

  get maxCullZoom(): number {
    return Infinity;
  }

  protected autoCullGeoView(geoViewport: GeoViewport, geoView: GeoView): void {
    const tileIsVisible = this.minCullZoom <= geoViewport.zoom && geoViewport.zoom < this.maxCullZoom
                       && geoViewport.geoFrame.intersects(geoView.geoBounds);
    geoView.setCulled(!tileIsVisible);
  }

  get minConsumeZoom(): number {
    return this.geoTile.z;
  }

  get maxConsumeZoom(): number {
    return Infinity;
  }

  protected autoConsumeGeoView(geoViewport: GeoViewport, geoView: GeoView): void {
    const geoTrait = this.geo.trait;
    if (geoTrait !== null) {
      const viewIsVisible = this.minConsumeZoom <= geoViewport.zoom && geoViewport.zoom < this.maxConsumeZoom
                         && geoViewport.geoFrame.intersects(geoView.geoBounds);
      if (viewIsVisible) {
        geoTrait.addTraitConsumer(this);
      } else {
        geoTrait.removeTraitConsumer(this);
      }
    }
  }

  /** @hidden */
  static override GeoFastener = ComponentViewTrait.define<GeoGridComponent, GeoView, GeoGridTrait>({
    extends: GeoLayerComponent.GeoFastener,
    traitType: GeoGridTrait,
    observeTrait: true,
    traitWillSetTile(newTileTrait: GeoGridTrait | null, oldTileTrait: GeoGridTrait | null, targetTrait: Trait): void {
      if (oldTileTrait !== null) {
        this.owner.removeTileTrait(oldTileTrait);
      }
    },
    traitDidSetTile(newTileTrait: GeoGridTrait | null, oldTileTrait: GeoGridTrait | null, targetTrait: Trait): void {
      if (newTileTrait !== null) {
        this.owner.insertTileTrait(newTileTrait, targetTrait);
      }
    },
  }) as ComponentViewTraitConstructor<GeoLayerComponent, GeoView, GeoGridTrait>;

  @ComponentViewTrait<GeoGridComponent, GeoView, GeoGridTrait>({
    extends: GeoGridComponent.GeoFastener,
  })
  override readonly geo!: ComponentViewTrait<this, GeoView, GeoGridTrait>;

  insertTile(tileComponent: GeoGridComponent, targetComponent: Component | null = null): void {
    const tileFasteners = this.tileFasteners as ComponentFastener<this, GeoGridComponent>[];
    let targetIndex = tileFasteners.length;
    for (let i = 0, n = tileFasteners.length; i < n; i += 1) {
      const tileFastener = tileFasteners[i]!;
      if (tileFastener.component === tileComponent) {
        return;
      } else if (tileFastener.component === targetComponent) {
        targetIndex = i;
      }
    }
    const tileFastener = this.createTileFastener(tileComponent);
    tileFasteners.splice(targetIndex, 0, tileFastener);
    tileFastener.setComponent(tileComponent, targetComponent);
    if (this.isMounted()) {
      tileFastener.mount();
    }
  }

  removeTile(tileComponent: GeoGridComponent): void {
    const tileFasteners = this.tileFasteners as ComponentFastener<this, GeoGridComponent>[];
    for (let i = 0, n = tileFasteners.length; i < n; i += 1) {
      const tileFastener = tileFasteners[i]!;
      if (tileFastener.component === tileComponent) {
        tileFastener.setComponent(null);
        if (this.isMounted()) {
          tileFastener.unmount();
        }
        tileFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected createTile(tileTrait: GeoGridTrait): GeoGridComponent | null {
    return new GeoGridComponent(tileTrait.geoTile);
  }

  protected initTile(tileComponent: GeoGridComponent, tileFastener: ComponentFastener<this, GeoGridComponent>): void {
    const tileTrait = tileComponent.geo.trait;
    if (tileTrait !== null) {
      this.initTileTrait(tileTrait, tileFastener);
    }
    const tileView = tileComponent.geo.view;
    if (tileView !== null) {
      this.initTileView(tileView, tileFastener);
    }
  }

  protected attachTile(tileComponent: GeoGridComponent, tileFastener: ComponentFastener<this, GeoGridComponent>): void {
    const tileTrait = tileComponent.geo.trait;
    if (tileTrait !== null) {
      this.attachTileTrait(tileTrait, tileFastener);
    }
    const tileView = tileComponent.geo.view;
    if (tileView !== null) {
      this.attachTileView(tileView, tileFastener);
    }
  }

  protected detachTile(tileComponent: GeoGridComponent, tileFastener: ComponentFastener<this, GeoGridComponent>): void {
    const tileView = tileComponent.geo.view;
    if (tileView !== null) {
      this.detachTileView(tileView, tileFastener);
    }
    const tileTrait = tileComponent.geo.trait;
    if (tileTrait !== null) {
      this.detachTileTrait(tileTrait, tileFastener);
    }
  }

  protected willSetTile(newTileComponent: GeoGridComponent | null, oldTileComponent: GeoGridComponent | null,
                        tileFastener: ComponentFastener<this, GeoGridComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetTile !== void 0) {
        componentObserver.componentWillSetTile(newTileComponent, oldTileComponent, tileFastener);
      }
    }
  }

  protected onSetTile(newTileComponent: GeoGridComponent | null, oldTileComponent: GeoGridComponent | null,
                      tileFastener: ComponentFastener<this, GeoGridComponent>): void {
    if (oldTileComponent !== null) {
      this.detachTile(oldTileComponent, tileFastener);
    }
    if (newTileComponent !== null) {
      this.attachTile(newTileComponent, tileFastener);
      this.initTile(newTileComponent, tileFastener);
    }
  }

  protected didSetTile(newTileComponent: GeoGridComponent | null, oldTileComponent: GeoGridComponent | null,
                       tileFastener: ComponentFastener<this, GeoGridComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetTile !== void 0) {
        componentObserver.componentDidSetTile(newTileComponent, oldTileComponent, tileFastener);
      }
    }
  }

  insertTileTrait(tileTrait: GeoGridTrait, targetTrait: Trait | null = null): void {
    const tileFasteners = this.tileFasteners as ComponentFastener<this, GeoGridComponent>[];
    let targetComponent: GeoGridComponent | null = null;
    for (let i = 0, n = tileFasteners.length; i < n; i += 1) {
      const tileComponent = tileFasteners[i]!.component;
      if (tileComponent !== null) {
        if (tileComponent.geo.trait === tileTrait) {
          return;
        } else if (tileComponent.geo.trait === targetTrait) {
          targetComponent = tileComponent;
        }
      }
    }
    const tileComponent = this.createTile(tileTrait);
    if (tileComponent !== null) {
      tileComponent.geo.setTrait(tileTrait);
      this.insertChildComponent(tileComponent, targetComponent);
      if (tileComponent.geo.view === null) {
        const tileView = this.createTileView(tileComponent);
        let targetView: GeoView | null = null;
        if (targetComponent !== null) {
          targetView = targetComponent.geo.view;
        }
        const geoView = this.geo.view;
        if (geoView !== null) {
          tileComponent.geo.injectView(geoView, tileView, targetView, null);
        } else {
          tileComponent.geo.setView(tileView, targetView);
        }
      }
    }
  }

  removeTileTrait(tileTrait: GeoGridTrait): void {
    const tileFasteners = this.tileFasteners as ComponentFastener<this, GeoGridComponent>[];
    for (let i = 0, n = tileFasteners.length; i < n; i += 1) {
      const tileFastener = tileFasteners[i]!;
      const tileComponent = tileFastener.component;
      if (tileComponent !== null && tileComponent.geo.trait === tileTrait) {
        tileFastener.setComponent(null);
        if (this.isMounted()) {
          tileFastener.unmount();
        }
        tileFasteners.splice(i, 1);
        tileComponent.remove();
        return;
      }
    }
  }

  protected initTileTrait(tileTrait: GeoGridTrait, tileFastener: ComponentFastener<this, GeoGridComponent>): void {
    // hook
  }

  protected attachTileTrait(tileTrait: GeoGridTrait, tileFastener: ComponentFastener<this, GeoGridComponent>): void {
    // hook
  }

  protected detachTileTrait(tileTrait: GeoGridTrait, tileFastener: ComponentFastener<this, GeoGridComponent>): void {
    // hook
  }

  protected willSetTileTrait(newTileTrait: GeoGridTrait | null, oldTileTrait: GeoGridTrait | null,
                             tileFastener: ComponentFastener<this, GeoGridComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetTileTrait !== void 0) {
        componentObserver.componentWillSetTileTrait(newTileTrait, oldTileTrait, tileFastener);
      }
    }
  }

  protected onSetTileTrait(newTileTrait: GeoGridTrait | null, oldTileTrait: GeoGridTrait | null,
                           tileFastener: ComponentFastener<this, GeoGridComponent>): void {
    if (oldTileTrait !== null) {
      this.detachTileTrait(oldTileTrait, tileFastener);
    }
    if (newTileTrait !== null) {
      this.attachTileTrait(newTileTrait, tileFastener);
      this.initTileTrait(newTileTrait, tileFastener);
    }
  }

  protected didSetTileTrait(newTileTrait: GeoGridTrait | null, oldTileTrait: GeoGridTrait | null,
                            tileFastener: ComponentFastener<this, GeoGridComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetTileTrait !== void 0) {
        componentObserver.componentDidSetTileTrait(newTileTrait, oldTileTrait, tileFastener);
      }
    }
  }

  protected createTileView(tileComponent: GeoGridComponent): GeoView | null {
    return tileComponent.geo.createView();
  }

  protected initTileView(tileView: GeoView, tileFastener: ComponentFastener<this, GeoGridComponent>): void {
    // hook
  }

  protected attachTileView(tileView: GeoView, tileFastener: ComponentFastener<this, GeoGridComponent>): void {
    // hook
  }

  protected detachTileView(tileView: GeoView, tileFastener: ComponentFastener<this, GeoGridComponent>): void {
    tileView.remove();
  }

  protected willSetTileView(newTileView: GeoView | null, oldTileView: GeoView | null,
                            tileFastener: ComponentFastener<this, GeoGridComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetTileView !== void 0) {
        componentObserver.componentWillSetTileView(newTileView, oldTileView, tileFastener);
      }
    }
  }

  protected onSetTileView(newTileView: GeoView | null, oldTileView: GeoView | null,
                          tileFastener: ComponentFastener<this, GeoGridComponent>): void {
    if (oldTileView !== null) {
      this.detachTileView(oldTileView, tileFastener);
    }
    if (newTileView !== null) {
      this.attachTileView(newTileView, tileFastener);
      this.initTileView(newTileView, tileFastener);
    }
  }

  protected didSetTileView(newTileView: GeoView | null, oldTileView: GeoView | null,
                           tileFastener: ComponentFastener<this, GeoGridComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetTileView !== void 0) {
        componentObserver.componentDidSetTileView(newTileView, oldTileView, tileFastener);
      }
    }
  }

  /** @hidden */
  static TileFastener = ComponentFastener.define<GeoGridComponent, GeoGridComponent>({
    type: GeoGridComponent,
    child: false,
    observe: true,
    willSetComponent(newTileComponent: GeoGridComponent | null, oldTileComponent: GeoGridComponent | null): void {
      this.owner.willSetTile(newTileComponent, oldTileComponent, this);
    },
    onSetComponent(newTileComponent: GeoGridComponent | null, oldTileComponent: GeoGridComponent | null): void {
      this.owner.onSetTile(newTileComponent, oldTileComponent, this);
    },
    didSetComponent(newTileComponent: GeoGridComponent | null, oldTileComponent: GeoGridComponent | null): void {
      this.owner.didSetTile(newTileComponent, oldTileComponent, this);
    },
    componentWillSetGeoTrait(newTileTrait: GeoGridTrait | null, oldTileTrait: GeoGridTrait | null): void {
      this.owner.willSetTileTrait(newTileTrait, oldTileTrait, this);
    },
    componentDidSetGeoTrait(newTileTrait: GeoGridTrait | null, oldTileTrait: GeoGridTrait | null): void {
      this.owner.onSetTileTrait(newTileTrait, oldTileTrait, this);
      this.owner.didSetTileTrait(newTileTrait, oldTileTrait, this);
    },
    componentWillSetGeoView(newTileView: GeoView | null, oldTileView: GeoView | null): void {
      this.owner.willSetTileView(newTileView, oldTileView, this);
    },
    componentDidSetGeoView(newTileView: GeoView | null, oldTileView: GeoView | null): void {
      this.owner.onSetTileView(newTileView, oldTileView, this);
      this.owner.didSetTileView(newTileView, oldTileView, this);
    },
  });

  protected createTileFastener(tileComponent: GeoGridComponent): ComponentFastener<this, GeoGridComponent> {
    return new GeoGridComponent.TileFastener(this, tileComponent.key, "tile");
  }

  /** @hidden */
  readonly tileFasteners!: ReadonlyArray<ComponentFastener<this, GeoGridComponent>>;

  protected getTileFastener(tileTrait: GeoGridTrait): ComponentFastener<this, GeoGridComponent> | null {
    const tileFasteners = this.tileFasteners;
    for (let i = 0, n = tileFasteners.length; i < n; i += 1) {
      const tileFastener = tileFasteners[i]!;
      const tileComponent = tileFastener.component;
      if (tileComponent !== null && tileComponent.geo.trait === tileTrait) {
        return tileFastener;
      }
    }
    return null;
  }

  /** @hidden */
  protected mountTileFasteners(): void {
    const tileFasteners = this.tileFasteners;
    for (let i = 0, n = tileFasteners.length; i < n; i += 1) {
      const tileFastener = tileFasteners[i]!;
      tileFastener.mount();
    }
  }

  /** @hidden */
  protected unmountTileFasteners(): void {
    const tileFasteners = this.tileFasteners;
    for (let i = 0, n = tileFasteners.length; i < n; i += 1) {
      const tileFastener = tileFasteners[i]!;
      tileFastener.unmount();
    }
  }

  protected detectTileComponent(component: Component): GeoGridComponent | null {
    return component instanceof GeoGridComponent ? component : null;
  }

  protected override detectInsertChildComponent(childComponent: Component, targetComponent: Component | null): void {
    const tileComponent = this.detectTileComponent(childComponent);
    if (tileComponent !== null) {
      this.insertTile(tileComponent, targetComponent);
    } else {
      super.detectInsertChildComponent(childComponent, targetComponent);
    }
  }

  protected override detectRemoveChildComponent(childComponent: Component): void {
    const tileComponent = this.detectTileComponent(childComponent);
    if (tileComponent !== null) {
      this.removeTile(tileComponent);
    } else {
      super.detectRemoveChildComponent(childComponent);
    }
  }

  /** @hidden */
  protected override mountComponentFasteners(): void {
    super.mountComponentFasteners();
    this.mountTileFasteners();
  }

  /** @hidden */
  protected override unmountComponentFasteners(): void {
    this.unmountTileFasteners();
    super.unmountComponentFasteners();
  }
}
