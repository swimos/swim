// Copyright 2015-2023 Nstream, inc.
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
import {Property} from "@swim/component";
import type {GeoTile} from "@swim/geo";
import {TraitViewRef} from "@swim/controller";
import {TraitViewControllerRef} from "@swim/controller";
import {TraitViewControllerSet} from "@swim/controller";
import type {GeoView} from "./GeoView";
import type {GeoLayerTrait} from "./GeoLayerTrait";
import type {GeoLayerControllerObserver} from "./GeoLayerController";
import {GeoLayerController} from "./GeoLayerController";
import {GeoTileView} from "./GeoTileView";
import {GeoTileTrait} from "./GeoTileTrait";

/** @public */
export interface GeoTileControllerObserver<C extends GeoTileController = GeoTileController> extends GeoLayerControllerObserver<C> {
  controllerWillAttachGeoTrait?(geoTrait: GeoTileTrait, controller: C): void;

  controllerDidDetachGeoTrait?(geoTrait: GeoTileTrait, controller: C): void;

  controllerWillAttachGeoView?(geoView: GeoTileView, controller: C): void;

  controllerDidDetachGeoView?(geoView: GeoTileView, controller: C): void;
}

/** @public */
export class GeoTileController extends GeoLayerController {
  constructor(geoTile: GeoTile) {
    super();
    this.geoTile = geoTile;
    this.visibleRange.setIntrinsic([geoTile.z, geoTile.z + 1]);
    this.consumeRange.setIntrinsic([geoTile.z, geoTile.z + 1]);
  }

  declare readonly observerType?: Class<GeoTileControllerObserver>;

  readonly geoTile: GeoTile;

  @Property({extends: true, inherits: false})
  override get visibleRange(): Property<this, readonly [minZoom: number, maxZoom: number]> & GeoLayerController["visibleRange"] {
    return Property.getter();
  }

  @Property({extends: true, inherits: false})
  override get consumeRange(): Property<this, readonly [minZoom: number, maxZoom: number]> & GeoLayerController["consumeRange"] {
    return Property.getter();
  }

  @TraitViewRef({
    extends: true,
    traitType: GeoTileTrait,
    viewType: GeoTileView,
    createView(): GeoTileView {
      return new GeoTileView(this.owner.geoTile);
    },
  })
  override readonly geo!: TraitViewRef<this, GeoTileTrait, GeoTileView> & GeoLayerController["geo"] & Observes<GeoTileTrait>;

  @TraitViewControllerSet({
    extends: true,
    createController(layerTrait?: GeoLayerTrait): GeoLayerController {
      if (layerTrait instanceof GeoTileTrait) {
        return this.owner.createTileController(layerTrait.geoTile, layerTrait);
      }
      return super.createController();
    },
  })
  override readonly layers!: TraitViewControllerSet<this, GeoLayerTrait, GeoView, GeoLayerController> & GeoLayerController["layers"];

  @TraitViewControllerRef({
    get controllerType(): typeof GeoTileController {
      return GeoTileController;
    },
    controllerKey: true,
    binds: true,
    get parentView(): GeoView | null {
      return this.owner.geo.attachView();
    },
    getTraitViewRef(tileController: GeoTileController): TraitViewRef<unknown, GeoTileTrait, GeoView> {
      return tileController.geo;
    },
    createController(tileTrait?: GeoTileTrait): GeoTileController {
      return this.owner.createTileController(this.owner.geoTile.southWestTile, tileTrait);
    },
  })
  readonly southWest!: TraitViewControllerRef<this, GeoTileTrait, GeoView, GeoTileController>;

  @TraitViewControllerRef({
    get controllerType(): typeof GeoTileController {
      return GeoTileController;
    },
    controllerKey: true,
    binds: true,
    get parentView(): GeoView | null {
      return this.owner.geo.attachView();
    },
    getTraitViewRef(tileController: GeoTileController): TraitViewRef<unknown, GeoTileTrait, GeoView> {
      return tileController.geo;
    },
    createController(tileTrait?: GeoTileTrait): GeoTileController {
      return this.owner.createTileController(this.owner.geoTile.northWestTile, tileTrait);
    },
  })
  readonly northWest!: TraitViewControllerRef<this, GeoTileTrait, GeoView, GeoTileController>;

  @TraitViewControllerRef({
    get controllerType(): typeof GeoTileController {
      return GeoTileController;
    },
    controllerKey: true,
    binds: true,
    get parentView(): GeoView | null {
      return this.owner.geo.attachView();
    },
    getTraitViewRef(tileController: GeoTileController): TraitViewRef<unknown, GeoTileTrait, GeoView> {
      return tileController.geo;
    },
    createController(tileTrait?: GeoTileTrait): GeoTileController {
      return this.owner.createTileController(this.owner.geoTile.southEastTile, tileTrait);
    },
  })
  readonly southEast!: TraitViewControllerRef<this, GeoTileTrait, GeoView, GeoTileController>;

  @TraitViewControllerRef({
    get controllerType(): typeof GeoTileController {
      return GeoTileController;
    },
    controllerKey: true,
    binds: true,
    get parentView(): GeoView | null {
      return this.owner.geo.attachView();
    },
    getTraitViewRef(tileController: GeoTileController): TraitViewRef<unknown, GeoTileTrait, GeoView> {
      return tileController.geo;
    },
    createController(tileTrait?: GeoTileTrait): GeoTileController {
      return this.owner.createTileController(this.owner.geoTile.northEastTile, tileTrait);
    },
  })
  readonly northEast!: TraitViewControllerRef<this, GeoTileTrait, GeoView, GeoTileController>;

  protected createTileController(geoTile: GeoTile, tileTrait?: GeoTileTrait | null): GeoTileController {
    return new (this.constructor as typeof GeoTileController)(geoTile);
  }

  override consumeLayers(): void {
    this.southWest.insertController();
    this.northWest.insertController();
    this.southEast.insertController();
    this.northEast.insertController();
  }

  override unconsumeLayers(): void {
    this.southWest.deleteController();
    this.northWest.deleteController();
    this.southEast.deleteController();
    this.northEast.deleteController();
  }
}
