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

import type {Class} from "@swim/util";
import type {MemberFastenerClass} from "@swim/fastener";
import type {GeoTile} from "@swim/geo";
import type {Trait} from "@swim/model";
import type {View} from "@swim/view";
import {Controller, TraitViewRef, TraitViewControllerSet} from "@swim/controller";
import type {GeoViewport} from "../geo/GeoViewport";
import type {GeoViewContext} from "../geo/GeoViewContext";
import type {GeoView} from "../geo/GeoView";
import type {GeoTrait} from "../geo/GeoTrait";
import {GeoController} from "../geo/GeoController";
import {GeoLayerControllerFeatureExt, GeoLayerController} from "../layer/GeoLayerController";
import {GeoGridView} from "./GeoGridView";
import {GeoGridTrait} from "./GeoGridTrait";
import type {GeoGridControllerObserver} from "./GeoGridControllerObserver";

/** @public */
export interface GeoGridControllerTileExt {
  attachTileTrait(tileTrait: GeoGridTrait, tileController: GeoGridController): void;
  detachTileTrait(tileTrait: GeoGridTrait, tileController: GeoGridController): void;
  attachTileView(tileView: GeoView, tileController: GeoGridController): void;
  detachTileView(tileView: GeoView, tileController: GeoGridController): void;
}

/** @public */
export class GeoGridController extends GeoLayerController {
  constructor(geoTile: GeoTile) {
    super();
    this.geoTile = geoTile;
  }

  override readonly observerType?: Class<GeoGridControllerObserver>;

  readonly geoTile: GeoTile;

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
        geoTrait.consume(this);
      } else {
        geoTrait.unconsume(this);
      }
    }
  }

  @TraitViewRef<GeoGridController, GeoGridTrait, GeoView>({
    extends: true,
    traitType: GeoGridTrait,
    observesTrait: true,
    didAttachTrait(geoTrait: GeoGridTrait, targetTrait: Trait | null): void {
      const tileTraits = geoTrait.tiles.traits;
      for (const traitId in tileTraits) {
        const tileTrait = tileTraits[traitId]!;
        this.owner.tiles.addTraitController(tileTrait);
      }
      const geoView = this.view;
      if (geoView !== null && !geoView.culled) {
        geoTrait.consume(this.owner);
      }
      GeoLayerController.geo.prototype.didAttachTrait.call(this, geoTrait, targetTrait);
    },
    willDetachTrait(geoTrait: GeoGridTrait): void {
      GeoLayerController.geo.prototype.willDetachTrait.call(this, geoTrait);
      geoTrait.unconsume(this.owner);
      const tileTraits = geoTrait.tiles.traits;
      for (const traitId in tileTraits) {
        const tileTrait = tileTraits[traitId]!;
        this.owner.tiles.deleteTraitController(tileTrait);
      }
    },
    traitWillAttachTile(tileTrait: GeoGridTrait, targetTrait: Trait): void {
      this.owner.tiles.addTraitController(tileTrait, targetTrait);
    },
    traitDidDetachTile(tileTrait: GeoGridTrait): void {
      this.owner.tiles.deleteTraitController(tileTrait);
    },
    viewType: GeoGridView,
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
    viewDidProject(viewContext: GeoViewContext, geoView: GeoView): void {
      this.owner.autoCullGeoView(viewContext.geoViewport, geoView);
      this.owner.autoConsumeGeoView(viewContext.geoViewport, geoView);
    },
    createView(): GeoGridView {
      return new GeoGridView(this.owner.geoTile);
    },
  })
  override readonly geo!: TraitViewRef<this, GeoGridTrait, GeoView>;
  static override readonly geo: MemberFastenerClass<GeoGridController, "geo">;

  @TraitViewControllerSet<GeoGridController, GeoTrait, GeoView, GeoController, GeoLayerControllerFeatureExt>({
    extends: true,
    detectController(controller: Controller): GeoController | null {
      return controller instanceof GeoController && !(controller instanceof GeoGridController) ? controller : null;
    },
  })
  override readonly features!: TraitViewControllerSet<this, GeoTrait, GeoView, GeoController> & GeoLayerControllerFeatureExt;
  static override readonly features: MemberFastenerClass<GeoGridController, "features">;

  @TraitViewControllerSet<GeoGridController, GeoGridTrait, GeoView, GeoGridController, GeoGridControllerTileExt>({
    type: GeoGridController,
    binds: true,
    observes: true,
    get parentView(): GeoView | null {
      return this.owner.geo.view;
    },
    getTraitViewRef(tileController: GeoGridController): TraitViewRef<unknown, GeoGridTrait, GeoView> {
      return tileController.geo;
    },
    willAttachController(tileController: GeoGridController): void {
      this.owner.callObservers("controllerWillAttachTile", tileController, this.owner);
    },
    didAttachController(tileController: GeoGridController): void {
      const tileTrait = tileController.geo.trait;
      if (tileTrait !== null) {
        this.attachTileTrait(tileTrait, tileController);
      }
      const tileView = tileController.geo.view;
      if (tileView !== null) {
        this.attachTileView(tileView, tileController);
      }
    },
    willDetachController(tileController: GeoGridController): void {
      const tileView = tileController.geo.view;
      if (tileView !== null) {
        this.detachTileView(tileView, tileController);
      }
      const tileTrait = tileController.geo.trait;
      if (tileTrait !== null) {
        this.detachTileTrait(tileTrait, tileController);
      }
    },
    didDetachController(tileController: GeoGridController): void {
      this.owner.callObservers("controllerDidDetachTile", tileController, this.owner);
    },
    controllerWillAttachGeoTrait(tileTrait: GeoGridTrait, tileController: GeoGridController): void {
      this.owner.callObservers("controllerWillAttachTileTrait", tileTrait, tileController, this.owner);
      this.attachTileTrait(tileTrait, tileController);
    },
    controllerDidDetachGeoTrait(tileTrait: GeoGridTrait, tileController: GeoGridController): void {
      this.detachTileTrait(tileTrait, tileController);
      this.owner.callObservers("controllerDidDetachTileTrait", tileTrait, tileController, this.owner);
    },
    attachTileTrait(tileTrait: GeoGridTrait, tileController: GeoGridController): void {
      // hook
    },
    detachTileTrait(tileTrait: GeoGridTrait, tileController: GeoGridController): void {
      // hook
    },
    controllerWillAttachGeoView(tileView: GeoView, tileController: GeoGridController): void {
      this.owner.callObservers("controllerWillAttachTileView", tileView, tileController, this.owner);
      this.attachTileView(tileView, tileController);
    },
    controllerDidDetachGeoView(tileView: GeoView, tileController: GeoGridController): void {
      this.detachTileView(tileView, tileController);
      this.owner.callObservers("controllerDidDetachTileView", tileView, tileController, this.owner);
    },
    attachTileView(tileView: GeoView, tileController: GeoGridController): void {
      // hook
    },
    detachTileView(tileView: GeoView, tileController: GeoGridController): void {
      tileView.remove();
    },
    createController(tileTrait?: GeoGridTrait): GeoGridController {
      if (tileTrait !== void 0) {
        return new GeoGridController(tileTrait.geoTile);
      } else {
        return TraitViewControllerSet.prototype.createController.call(this);
      }
    },
  })
  readonly tiles!: TraitViewControllerSet<this, GeoGridTrait, GeoView, GeoGridController> & GeoGridControllerTileExt;
  static readonly tiles: MemberFastenerClass<GeoGridController, "tiles">;
}
