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
  Controller,
  ControllerViewTraitConstructor,
  ControllerViewTrait,
  ControllerFastener,
} from "@swim/controller";
import type {GeoViewport} from "../geo/GeoViewport";
import type {GeoViewContext} from "../geo/GeoViewContext";
import type {GeoView} from "../geo/GeoView";
import {GeoLayerController} from "../layer/GeoLayerController";
import {GeoGridView} from "./GeoGridView";
import {GeoGridTrait} from "./GeoGridTrait";
import type {GeoGridControllerObserver} from "./GeoGridControllerObserver";

export class GeoGridController extends GeoLayerController {
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

  override readonly controllerObservers!: ReadonlyArray<GeoGridControllerObserver>;

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
      const tileController = tileFasteners[i]!.controller;
      if (tileController !== null) {
        const tileView = tileController.geo.view;
        if (tileView !== null && tileView.parentView === null) {
          tileController.geo.injectView(geoView);
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
  static override GeoFastener = ControllerViewTrait.define<GeoGridController, GeoView, GeoGridTrait>({
    extends: GeoLayerController.GeoFastener,
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
  }) as ControllerViewTraitConstructor<GeoLayerController, GeoView, GeoGridTrait>;

  @ControllerViewTrait<GeoGridController, GeoView, GeoGridTrait>({
    extends: GeoGridController.GeoFastener,
  })
  override readonly geo!: ControllerViewTrait<this, GeoView, GeoGridTrait>;

  insertTile(tileController: GeoGridController, targetController: Controller | null = null): void {
    const tileFasteners = this.tileFasteners as ControllerFastener<this, GeoGridController>[];
    let targetIndex = tileFasteners.length;
    for (let i = 0, n = tileFasteners.length; i < n; i += 1) {
      const tileFastener = tileFasteners[i]!;
      if (tileFastener.controller === tileController) {
        return;
      } else if (tileFastener.controller === targetController) {
        targetIndex = i;
      }
    }
    const tileFastener = this.createTileFastener(tileController);
    tileFasteners.splice(targetIndex, 0, tileFastener);
    tileFastener.setController(tileController, targetController);
    if (this.isMounted()) {
      tileFastener.mount();
    }
  }

  removeTile(tileController: GeoGridController): void {
    const tileFasteners = this.tileFasteners as ControllerFastener<this, GeoGridController>[];
    for (let i = 0, n = tileFasteners.length; i < n; i += 1) {
      const tileFastener = tileFasteners[i]!;
      if (tileFastener.controller === tileController) {
        tileFastener.setController(null);
        if (this.isMounted()) {
          tileFastener.unmount();
        }
        tileFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected createTile(tileTrait: GeoGridTrait): GeoGridController | null {
    return new GeoGridController(tileTrait.geoTile);
  }

  protected initTile(tileController: GeoGridController, tileFastener: ControllerFastener<this, GeoGridController>): void {
    const tileTrait = tileController.geo.trait;
    if (tileTrait !== null) {
      this.initTileTrait(tileTrait, tileFastener);
    }
    const tileView = tileController.geo.view;
    if (tileView !== null) {
      this.initTileView(tileView, tileFastener);
    }
  }

  protected attachTile(tileController: GeoGridController, tileFastener: ControllerFastener<this, GeoGridController>): void {
    const tileTrait = tileController.geo.trait;
    if (tileTrait !== null) {
      this.attachTileTrait(tileTrait, tileFastener);
    }
    const tileView = tileController.geo.view;
    if (tileView !== null) {
      this.attachTileView(tileView, tileFastener);
    }
  }

  protected detachTile(tileController: GeoGridController, tileFastener: ControllerFastener<this, GeoGridController>): void {
    const tileView = tileController.geo.view;
    if (tileView !== null) {
      this.detachTileView(tileView, tileFastener);
    }
    const tileTrait = tileController.geo.trait;
    if (tileTrait !== null) {
      this.detachTileTrait(tileTrait, tileFastener);
    }
  }

  protected willSetTile(newTileController: GeoGridController | null, oldTileController: GeoGridController | null,
                        tileFastener: ControllerFastener<this, GeoGridController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetTile !== void 0) {
        controllerObserver.controllerWillSetTile(newTileController, oldTileController, tileFastener);
      }
    }
  }

  protected onSetTile(newTileController: GeoGridController | null, oldTileController: GeoGridController | null,
                      tileFastener: ControllerFastener<this, GeoGridController>): void {
    if (oldTileController !== null) {
      this.detachTile(oldTileController, tileFastener);
    }
    if (newTileController !== null) {
      this.attachTile(newTileController, tileFastener);
      this.initTile(newTileController, tileFastener);
    }
  }

  protected didSetTile(newTileController: GeoGridController | null, oldTileController: GeoGridController | null,
                       tileFastener: ControllerFastener<this, GeoGridController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetTile !== void 0) {
        controllerObserver.controllerDidSetTile(newTileController, oldTileController, tileFastener);
      }
    }
  }

  insertTileTrait(tileTrait: GeoGridTrait, targetTrait: Trait | null = null): void {
    const tileFasteners = this.tileFasteners as ControllerFastener<this, GeoGridController>[];
    let targetController: GeoGridController | null = null;
    for (let i = 0, n = tileFasteners.length; i < n; i += 1) {
      const tileController = tileFasteners[i]!.controller;
      if (tileController !== null) {
        if (tileController.geo.trait === tileTrait) {
          return;
        } else if (tileController.geo.trait === targetTrait) {
          targetController = tileController;
        }
      }
    }
    const tileController = this.createTile(tileTrait);
    if (tileController !== null) {
      tileController.geo.setTrait(tileTrait);
      this.insertChildController(tileController, targetController);
      if (tileController.geo.view === null) {
        const tileView = this.createTileView(tileController);
        let targetView: GeoView | null = null;
        if (targetController !== null) {
          targetView = targetController.geo.view;
        }
        const geoView = this.geo.view;
        if (geoView !== null) {
          tileController.geo.injectView(geoView, tileView, targetView, null);
        } else {
          tileController.geo.setView(tileView, targetView);
        }
      }
    }
  }

  removeTileTrait(tileTrait: GeoGridTrait): void {
    const tileFasteners = this.tileFasteners as ControllerFastener<this, GeoGridController>[];
    for (let i = 0, n = tileFasteners.length; i < n; i += 1) {
      const tileFastener = tileFasteners[i]!;
      const tileController = tileFastener.controller;
      if (tileController !== null && tileController.geo.trait === tileTrait) {
        tileFastener.setController(null);
        if (this.isMounted()) {
          tileFastener.unmount();
        }
        tileFasteners.splice(i, 1);
        tileController.remove();
        return;
      }
    }
  }

  protected initTileTrait(tileTrait: GeoGridTrait, tileFastener: ControllerFastener<this, GeoGridController>): void {
    // hook
  }

  protected attachTileTrait(tileTrait: GeoGridTrait, tileFastener: ControllerFastener<this, GeoGridController>): void {
    // hook
  }

  protected detachTileTrait(tileTrait: GeoGridTrait, tileFastener: ControllerFastener<this, GeoGridController>): void {
    // hook
  }

  protected willSetTileTrait(newTileTrait: GeoGridTrait | null, oldTileTrait: GeoGridTrait | null,
                             tileFastener: ControllerFastener<this, GeoGridController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetTileTrait !== void 0) {
        controllerObserver.controllerWillSetTileTrait(newTileTrait, oldTileTrait, tileFastener);
      }
    }
  }

  protected onSetTileTrait(newTileTrait: GeoGridTrait | null, oldTileTrait: GeoGridTrait | null,
                           tileFastener: ControllerFastener<this, GeoGridController>): void {
    if (oldTileTrait !== null) {
      this.detachTileTrait(oldTileTrait, tileFastener);
    }
    if (newTileTrait !== null) {
      this.attachTileTrait(newTileTrait, tileFastener);
      this.initTileTrait(newTileTrait, tileFastener);
    }
  }

  protected didSetTileTrait(newTileTrait: GeoGridTrait | null, oldTileTrait: GeoGridTrait | null,
                            tileFastener: ControllerFastener<this, GeoGridController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetTileTrait !== void 0) {
        controllerObserver.controllerDidSetTileTrait(newTileTrait, oldTileTrait, tileFastener);
      }
    }
  }

  protected createTileView(tileController: GeoGridController): GeoView | null {
    return tileController.geo.createView();
  }

  protected initTileView(tileView: GeoView, tileFastener: ControllerFastener<this, GeoGridController>): void {
    // hook
  }

  protected attachTileView(tileView: GeoView, tileFastener: ControllerFastener<this, GeoGridController>): void {
    // hook
  }

  protected detachTileView(tileView: GeoView, tileFastener: ControllerFastener<this, GeoGridController>): void {
    tileView.remove();
  }

  protected willSetTileView(newTileView: GeoView | null, oldTileView: GeoView | null,
                            tileFastener: ControllerFastener<this, GeoGridController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetTileView !== void 0) {
        controllerObserver.controllerWillSetTileView(newTileView, oldTileView, tileFastener);
      }
    }
  }

  protected onSetTileView(newTileView: GeoView | null, oldTileView: GeoView | null,
                          tileFastener: ControllerFastener<this, GeoGridController>): void {
    if (oldTileView !== null) {
      this.detachTileView(oldTileView, tileFastener);
    }
    if (newTileView !== null) {
      this.attachTileView(newTileView, tileFastener);
      this.initTileView(newTileView, tileFastener);
    }
  }

  protected didSetTileView(newTileView: GeoView | null, oldTileView: GeoView | null,
                           tileFastener: ControllerFastener<this, GeoGridController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetTileView !== void 0) {
        controllerObserver.controllerDidSetTileView(newTileView, oldTileView, tileFastener);
      }
    }
  }

  /** @hidden */
  static TileFastener = ControllerFastener.define<GeoGridController, GeoGridController>({
    type: GeoGridController,
    child: false,
    observe: true,
    willSetController(newTileController: GeoGridController | null, oldTileController: GeoGridController | null): void {
      this.owner.willSetTile(newTileController, oldTileController, this);
    },
    onSetController(newTileController: GeoGridController | null, oldTileController: GeoGridController | null): void {
      this.owner.onSetTile(newTileController, oldTileController, this);
    },
    didSetController(newTileController: GeoGridController | null, oldTileController: GeoGridController | null): void {
      this.owner.didSetTile(newTileController, oldTileController, this);
    },
    controllerWillSetGeoTrait(newTileTrait: GeoGridTrait | null, oldTileTrait: GeoGridTrait | null): void {
      this.owner.willSetTileTrait(newTileTrait, oldTileTrait, this);
    },
    controllerDidSetGeoTrait(newTileTrait: GeoGridTrait | null, oldTileTrait: GeoGridTrait | null): void {
      this.owner.onSetTileTrait(newTileTrait, oldTileTrait, this);
      this.owner.didSetTileTrait(newTileTrait, oldTileTrait, this);
    },
    controllerWillSetGeoView(newTileView: GeoView | null, oldTileView: GeoView | null): void {
      this.owner.willSetTileView(newTileView, oldTileView, this);
    },
    controllerDidSetGeoView(newTileView: GeoView | null, oldTileView: GeoView | null): void {
      this.owner.onSetTileView(newTileView, oldTileView, this);
      this.owner.didSetTileView(newTileView, oldTileView, this);
    },
  });

  protected createTileFastener(tileController: GeoGridController): ControllerFastener<this, GeoGridController> {
    return new GeoGridController.TileFastener(this, tileController.key, "tile");
  }

  /** @hidden */
  readonly tileFasteners!: ReadonlyArray<ControllerFastener<this, GeoGridController>>;

  protected getTileFastener(tileTrait: GeoGridTrait): ControllerFastener<this, GeoGridController> | null {
    const tileFasteners = this.tileFasteners;
    for (let i = 0, n = tileFasteners.length; i < n; i += 1) {
      const tileFastener = tileFasteners[i]!;
      const tileController = tileFastener.controller;
      if (tileController !== null && tileController.geo.trait === tileTrait) {
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

  protected detectTileController(controller: Controller): GeoGridController | null {
    return controller instanceof GeoGridController ? controller : null;
  }

  protected override detectInsertChildController(childController: Controller, targetController: Controller | null): void {
    const tileController = this.detectTileController(childController);
    if (tileController !== null) {
      this.insertTile(tileController, targetController);
    } else {
      super.detectInsertChildController(childController, targetController);
    }
  }

  protected override detectRemoveChildController(childController: Controller): void {
    const tileController = this.detectTileController(childController);
    if (tileController !== null) {
      this.removeTile(tileController);
    } else {
      super.detectRemoveChildController(childController);
    }
  }

  /** @hidden */
  protected override mountControllerFasteners(): void {
    super.mountControllerFasteners();
    this.mountTileFasteners();
  }

  /** @hidden */
  protected override unmountControllerFasteners(): void {
    this.unmountTileFasteners();
    super.unmountControllerFasteners();
  }
}
