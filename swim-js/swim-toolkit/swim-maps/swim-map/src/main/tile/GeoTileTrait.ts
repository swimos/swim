// Copyright 2015-2023 Swim.inc
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
import type {FastenerClass} from "@swim/component";
import type {GeoTile, GeoBox} from "@swim/geo";
import {Model, Trait, TraitSet} from "@swim/model";
import {GeoTrait} from "../geo/GeoTrait";
import {GeoLayerTrait} from "../layer/GeoLayerTrait";
import type {GeoTileTraitObserver} from "./GeoTileTraitObserver";

/** @public */
export class GeoTileTrait extends GeoLayerTrait {
  constructor(geoTile: GeoTile) {
    super();
    this.geoTile = geoTile;
    this.geoBounds = geoTile.bounds;
  }

  override readonly observerType?: Class<GeoTileTraitObserver>;

  readonly geoTile: GeoTile;

  override readonly geoBounds: GeoBox;

  override setGeoBounds(newGeoBounds: GeoBox): void {
    // immutable
  }

  @TraitSet<GeoTileTrait["features"]>({
    extends: true,
    detectModel(model: Model): GeoTrait | null {
      const geoTrait = model.getTrait(GeoTrait);
      return !(geoTrait instanceof GeoTileTrait) ? geoTrait : null;
    },
  })
  override readonly features!: TraitSet<this, GeoTrait> & GeoLayerTrait["features"];
  static override readonly features: FastenerClass<GeoTileTrait["features"]>;

  @TraitSet<GeoTileTrait["tiles"]>({
    traitType: GeoTileTrait,
    binds: true,
    willAttachTrait(tileTrait: GeoTileTrait): void {
      this.owner.callObservers("traitWillAttachTile", tileTrait, this.owner);
    },
    didDetachTrait(tileTrait: GeoTileTrait): void {
      this.owner.callObservers("traitDidDetachTile", tileTrait, this.owner);
    },
    detectModel(model: Model): GeoTileTrait | null {
      return model.getTrait(GeoTileTrait);
    },
    detectTrait(trait: Trait): GeoTileTrait | null {
      return null;
    },
  })
  readonly tiles!: TraitSet<this, GeoTileTrait>;
  static readonly tiles: FastenerClass<GeoTileTrait["tiles"]>;

  protected createTileTrait(geoTile: GeoTile): GeoTileTrait | null {
    return new GeoTileTrait(geoTile);
  }

  protected createTileModel(geoTile: GeoTile): Model | null {
    const tileTrait = this.createTileTrait(geoTile);
    if (tileTrait !== null) {
      const tileModel = new Model();
      tileModel.setTrait("tile", tileTrait);
      return tileModel;
    } else {
      return null;
    }
  }

  protected initTiles(): void {
    let southWestModel = this.getChild("southWest");
    if (southWestModel === null) {
      southWestModel = this.createTileModel(this.geoTile.southWestTile);
      if (southWestModel !== null) {
        this.setChild("southWest", southWestModel);
      }
    }

    let northWestModel = this.getChild("northWest");
    if (northWestModel === null) {
      northWestModel = this.createTileModel(this.geoTile.northWestTile);
      if (northWestModel !== null) {
        this.setChild("northWest", northWestModel);
      }
    }

    let southEastModel = this.getChild("southEast");
    if (southEastModel === null) {
      southEastModel = this.createTileModel(this.geoTile.southEastTile);
      if (southEastModel !== null) {
        this.setChild("southEast", southEastModel);
      }
    }

    let northEastTile = this.getChild("northEast");
    if (northEastTile === null) {
      northEastTile = this.createTileModel(this.geoTile.northEastTile);
      if (northEastTile !== null) {
        this.setChild("northEast", northEastTile);
      }
    }
  }

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.initTiles();
  }
}
