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

import type {Class, Observes} from "@swim/util";
import type {FastenerClass} from "@swim/component";
import type {GeoTile} from "@swim/geo";
import type {Trait} from "@swim/model";
import type {View} from "@swim/view";
import {Controller, TraitViewRef, TraitViewControllerRef, TraitViewControllerSet} from "@swim/controller";
import type {GeoViewport} from "../geo/GeoViewport";
import type {GeoView} from "../geo/GeoView";
import type {GeoTrait} from "../geo/GeoTrait";
import {GeoController} from "../geo/GeoController";
import {GeoLayerController} from "../layer/GeoLayerController";
import {GeoTileView} from "./GeoTileView";
import {GeoTileTrait} from "./GeoTileTrait";
import type {GeoTileControllerObserver} from "./GeoTileControllerObserver";

/** @public */
export class GeoTileController extends GeoLayerController {
  constructor(geoTile: GeoTile) {
    super();
    this.geoTile = geoTile;
  }

  override readonly observerType?: Class<GeoTileControllerObserver>;

  readonly geoTile: GeoTile;

  get minCullZoom(): number {
    return this.geoTile.z;
  }

  get maxCullZoom(): number {
    return Infinity;
  }

  protected autoCullGeoView(geoViewport: GeoViewport, geoView: GeoView): void {
    const tileIsVisible = this.minCullZoom <= geoViewport.zoom
                       && geoViewport.zoom < this.maxCullZoom
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
    const viewIsVisible = geoView.mounted
                       && this.minConsumeZoom <= geoViewport.zoom
                       && geoViewport.zoom < this.maxConsumeZoom
                       && geoViewport.geoFrame.intersects(geoView.geoBounds);
    if (viewIsVisible) {
      this.consume(geoView);
    } else {
      this.unconsume(geoView);
    }
  }

  @TraitViewRef<GeoTileController["geo"]>({
    extends: true,
    consumed: true,
    traitType: GeoTileTrait,
    observesTrait: true,
    didAttachTrait(geoTrait: GeoTileTrait, targetTrait: Trait | null): void {
      this.owner.tiles.addTraits(geoTrait.tiles.traits);
      GeoLayerController.geo.prototype.didAttachTrait.call(this, geoTrait, targetTrait);
    },
    willDetachTrait(geoTrait: GeoTileTrait): void {
      GeoLayerController.geo.prototype.willDetachTrait.call(this, geoTrait);
      this.owner.tiles.deleteTraits(geoTrait.tiles.traits);
    },
    traitWillAttachTile(tileTrait: GeoTileTrait, targetTrait: Trait): void {
      this.owner.tiles.addTrait(tileTrait, targetTrait);
    },
    traitDidDetachTile(tileTrait: GeoTileTrait): void {
      this.owner.tiles.deleteTrait(tileTrait);
    },
    viewType: GeoTileView,
    observesView: true,
    didAttachView(geoView: GeoView, targetView: View | null): void {
      GeoLayerController.geo.prototype.didAttachView.call(this, geoView, targetView);
      geoView.setCulled(true);
      const tileControllers = this.owner.tiles.controllers;
      for (const controllerId in tileControllers) {
        const tileController = tileControllers[controllerId]!;
        const tileView = tileController.geo.view;
        if (tileView !== null && tileView.parent === null) {
          tileController.geo.insertView(geoView);
        }
      }
    },
    willDetachView(geoView: GeoView): void {
      GeoLayerController.geo.prototype.willDetachView.call(this, geoView);
      this.owner.unconsume(geoView);
    },
    viewDidProject(geoView: GeoView): void {
      const geoViewport = geoView.geoViewport.value;
      this.owner.autoCullGeoView(geoViewport, geoView);
      this.owner.autoConsumeGeoView(geoViewport, geoView);
    },
    createView(): GeoTileView {
      return new GeoTileView(this.owner.geoTile);
    },
  })
  override readonly geo!: TraitViewRef<this, GeoTileTrait, GeoView> & GeoLayerController["geo"] & Observes<GeoTileTrait & GeoView>;
  static override readonly geo: FastenerClass<GeoTileController["geo"]>;

  @TraitViewControllerSet<GeoTileController["features"]>({
    extends: true,
    detectController(controller: Controller): GeoController | null {
      return controller instanceof GeoController && !(controller instanceof GeoTileController) ? controller : null;
    },
  })
  override readonly features!: TraitViewControllerSet<this, GeoTrait, GeoView, GeoController> & GeoLayerController["features"];
  static override readonly features: FastenerClass<GeoTileController["features"]>;

  @TraitViewControllerSet<GeoTileController["tiles"]>({
    controllerType: GeoTileController,
    binds: true,
    observes: true,
    get parentView(): GeoView | null {
      return this.owner.geo.view;
    },
    getTraitViewRef(tileController: GeoTileController): TraitViewRef<unknown, GeoTileTrait, GeoView> {
      return tileController.geo;
    },
    willAttachController(tileController: GeoTileController): void {
      this.owner.callObservers("controllerWillAttachTile", tileController, this.owner);
    },
    didAttachController(tileController: GeoTileController): void {
      const tileTrait = tileController.geo.trait;
      if (tileTrait !== null) {
        this.attachTileTrait(tileTrait, tileController);
      }
      const tileView = tileController.geo.view;
      if (tileView !== null) {
        this.attachTileView(tileView, tileController);
      }
    },
    willDetachController(tileController: GeoTileController): void {
      const tileView = tileController.geo.view;
      if (tileView !== null) {
        this.detachTileView(tileView, tileController);
      }
      const tileTrait = tileController.geo.trait;
      if (tileTrait !== null) {
        this.detachTileTrait(tileTrait, tileController);
      }
    },
    didDetachController(tileController: GeoTileController): void {
      this.owner.callObservers("controllerDidDetachTile", tileController, this.owner);
    },
    controllerWillAttachGeoTrait(tileTrait: GeoTileTrait, tileController: GeoTileController): void {
      this.owner.callObservers("controllerWillAttachTileTrait", tileTrait, tileController, this.owner);
      this.attachTileTrait(tileTrait, tileController);
    },
    controllerDidDetachGeoTrait(tileTrait: GeoTileTrait, tileController: GeoTileController): void {
      this.detachTileTrait(tileTrait, tileController);
      this.owner.callObservers("controllerDidDetachTileTrait", tileTrait, tileController, this.owner);
    },
    attachTileTrait(tileTrait: GeoTileTrait, tileController: GeoTileController): void {
      // hook
    },
    detachTileTrait(tileTrait: GeoTileTrait, tileController: GeoTileController): void {
      // hook
    },
    controllerWillAttachGeoView(tileView: GeoView, tileController: GeoTileController): void {
      this.owner.callObservers("controllerWillAttachTileView", tileView, tileController, this.owner);
      this.attachTileView(tileView, tileController);
    },
    controllerDidDetachGeoView(tileView: GeoView, tileController: GeoTileController): void {
      this.detachTileView(tileView, tileController);
      this.owner.callObservers("controllerDidDetachTileView", tileView, tileController, this.owner);
    },
    attachTileView(tileView: GeoView, tileController: GeoTileController): void {
      const geoView = this.owner.geo.view;
      if (geoView !== null && tileView.parent === null) {
        tileController.geo.insertView(geoView);
      }
    },
    detachTileView(tileView: GeoView, tileController: GeoTileController): void {
      tileView.remove();
    },
    createController(tileTrait?: GeoTileTrait): GeoTileController {
      if (tileTrait !== void 0) {
        return this.owner.createTileController(tileTrait.geoTile);
      } else {
        return TraitViewControllerSet.prototype.createController.call(this);
      }
    },
  })
  readonly tiles!: TraitViewControllerSet<this, GeoTileTrait, GeoView, GeoTileController> & Observes<GeoTileController> & {
    attachTileTrait(tileTrait: GeoTileTrait, tileController: GeoTileController): void,
    detachTileTrait(tileTrait: GeoTileTrait, tileController: GeoTileController): void,
    attachTileView(tileView: GeoView, tileController: GeoTileController): void,
    detachTileView(tileView: GeoView, tileController: GeoTileController): void,
  };
  static readonly tiles: FastenerClass<GeoTileController["tiles"]>;

  @TraitViewControllerRef<GeoTileController["southWest"]>({
    controllerType: GeoTileController,
    controllerKey: true,
    binds: true,
    get parentView(): GeoView | null {
      return this.owner.geo.view;
    },
    getTraitViewRef(tileController: GeoTileController): TraitViewRef<unknown, GeoTileTrait, GeoView> {
      return tileController.geo;
    },
    createController(tileTrait?: GeoTileTrait): GeoTileController {
      return this.owner.createTileController(this.owner.geoTile.southWestTile);
    },
  })
  readonly southWest!: TraitViewControllerRef<this, GeoTileTrait, GeoView, GeoTileController>;
  static readonly southWest: FastenerClass<GeoTileController["southWest"]>;

  @TraitViewControllerRef<GeoTileController["northWest"]>({
    controllerType: GeoTileController,
    controllerKey: true,
    binds: true,
    get parentView(): GeoView | null {
      return this.owner.geo.view;
    },
    getTraitViewRef(tileController: GeoTileController): TraitViewRef<unknown, GeoTileTrait, GeoView> {
      return tileController.geo;
    },
    createController(tileTrait?: GeoTileTrait): GeoTileController {
      return this.owner.createTileController(this.owner.geoTile.northWestTile);
    },
  })
  readonly northWest!: TraitViewControllerRef<this, GeoTileTrait, GeoView, GeoTileController>;
  static readonly northWest: FastenerClass<GeoTileController["northWest"]>;

  @TraitViewControllerRef<GeoTileController["southEast"]>({
    controllerType: GeoTileController,
    controllerKey: true,
    binds: true,
    get parentView(): GeoView | null {
      return this.owner.geo.view;
    },
    getTraitViewRef(tileController: GeoTileController): TraitViewRef<unknown, GeoTileTrait, GeoView> {
      return tileController.geo;
    },
    createController(tileTrait?: GeoTileTrait): GeoTileController {
      return this.owner.createTileController(this.owner.geoTile.southEastTile);
    },
  })
  readonly southEast!: TraitViewControllerRef<this, GeoTileTrait, GeoView, GeoTileController>;
  static readonly southEast: FastenerClass<GeoTileController["southEast"]>;

  @TraitViewControllerRef<GeoTileController["northEast"]>({
    controllerType: GeoTileController,
    controllerKey: true,
    binds: true,
    get parentView(): GeoView | null {
      return this.owner.geo.view;
    },
    getTraitViewRef(tileController: GeoTileController): TraitViewRef<unknown, GeoTileTrait, GeoView> {
      return tileController.geo;
    },
    createController(tileTrait?: GeoTileTrait): GeoTileController {
      return this.owner.createTileController(this.owner.geoTile.northEastTile);
    },
  })
  readonly northEast!: TraitViewControllerRef<this, GeoTileTrait, GeoView, GeoTileController>;
  static readonly northEast: FastenerClass<GeoTileController["northEast"]>;

  protected createTileController(geoTile: GeoTile): GeoTileController {
    return new GeoTileController(geoTile);
  }

  protected initTiles(): void {
    this.southWest.insertController();
    this.northWest.insertController();
    this.southEast.insertController();
    this.northEast.insertController();
  }

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.initTiles();
  }
}
