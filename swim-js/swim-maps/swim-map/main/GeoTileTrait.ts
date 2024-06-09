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
import type {GeoTile} from "@swim/geo";
import {Model} from "@swim/model";
import {TraitModelRef} from "@swim/model";
import type {GeoLayerTraitObserver} from "./GeoLayerTrait";
import {GeoLayerTrait} from "./GeoLayerTrait";
import type {GeoLayerController} from "./GeoLayerController";
import {GeoTileController} from "./"; // forward import

/** @public */
export interface GeoTileTraitObserver<T extends GeoTileTrait = GeoTileTrait> extends GeoLayerTraitObserver<T> {
}

/** @public */
export class GeoTileTrait extends GeoLayerTrait {
  constructor(geoTile: GeoTile) {
    super();
    this.geoTile = geoTile;
  }

  declare readonly observerType?: Class<GeoTileTraitObserver>;

  readonly geoTile: GeoTile;

  @TraitModelRef({
    get traitType(): typeof GeoTileTrait {
      return GeoTileTrait;
    },
    traitKey: "layer",
    modelType: Model,
    modelKey: "southWest",
    binds: true,
    createTrait(): GeoTileTrait {
      return this.owner.createTileTrait(this.owner.geoTile.southWestTile);
    },
  })
  readonly southWest!: TraitModelRef<this, GeoTileTrait, Model>;

  @TraitModelRef({
    get traitType(): typeof GeoTileTrait {
      return GeoTileTrait;
    },
    traitKey: "layer",
    modelType: Model,
    modelKey: "northWest",
    binds: true,
    createTrait(): GeoTileTrait {
      return this.owner.createTileTrait(this.owner.geoTile.northWestTile);
    },
  })
  readonly northWest!: TraitModelRef<this, GeoTileTrait, Model>;

  @TraitModelRef({
    get traitType(): typeof GeoTileTrait {
      return GeoTileTrait;
    },
    traitKey: "layer",
    modelType: Model,
    modelKey: "southEast",
    binds: true,
    createTrait(): GeoTileTrait {
      return this.owner.createTileTrait(this.owner.geoTile.southEastTile);
    },
  })
  readonly southEast!: TraitModelRef<this, GeoTileTrait, Model>;

  @TraitModelRef({
    get traitType(): typeof GeoTileTrait {
      return GeoTileTrait;
    },
    traitKey: "layer",
    modelType: Model,
    modelKey: "northEast",
    binds: true,
    createTrait(): GeoTileTrait {
      return this.owner.createTileTrait(this.owner.geoTile.northEastTile);
    },
  })
  readonly northEast!: TraitModelRef<this, GeoTileTrait, Model>;

  protected createTileTrait(geoTile: GeoTile): GeoTileTrait {
    return new (this.constructor as typeof GeoTileTrait)(geoTile);
  }

  override consumeLayers(): void {
    this.southWest.insertModel();
    this.northWest.insertModel();
    this.southEast.insertModel();
    this.northEast.insertModel();
  }

  override unconsumeLayers(): void {
    this.southWest.deleteModel();
    this.northWest.deleteModel();
    this.southEast.deleteModel();
    this.northEast.deleteModel();
  }

  override createGeoController(): GeoLayerController {
    return new GeoTileController(this.geoTile);
  }
}
