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
import type {GeoTile, GeoBox} from "@swim/geo";
import {Model, GenericModel, Trait, TraitFastener} from "@swim/model";
import {GeoLayerTrait} from "../layer/GeoLayerTrait";
import type {GeoGridTraitObserver} from "./GeoGridTraitObserver";

export class GeoGridTrait extends GeoLayerTrait {
  constructor(geoTile: GeoTile) {
    super();
    this.geoTile = geoTile;
    this.geoBounds = geoTile.bounds;
    this.tileFasteners = [];
  }

  override readonly observerType?: Class<GeoGridTraitObserver>;

  readonly geoTile: GeoTile;

  override readonly geoBounds: GeoBox;

  override setGeoBounds(newGeoBounds: GeoBox): void {
    // immutable
  }

  insertTile(tileTrait: GeoGridTrait, targetTrait: Trait | null = null): void {
    const tileFasteners = this.tileFasteners as TraitFastener<this, GeoGridTrait>[];
    let targetIndex = tileFasteners.length;
    for (let i = 0, n = tileFasteners.length; i < n; i += 1) {
      const tileFastener = tileFasteners[i]!;
      if (tileFastener.trait === tileTrait) {
        return;
      } else if (tileFastener.trait === targetTrait) {
        targetIndex = i;
      }
    }
    const tileFastener = this.createTileFastener(tileTrait);
    tileFasteners.splice(targetIndex, 0, tileFastener);
    tileFastener.setTrait(tileTrait, targetTrait);
    if (this.mounted) {
      tileFastener.mount();
    }
  }

  removeTile(tileTrait: GeoGridTrait): void {
    const tileFasteners = this.tileFasteners as TraitFastener<this, GeoGridTrait>[];
    for (let i = 0, n = tileFasteners.length; i < n; i += 1) {
      const tileFastener = tileFasteners[i]!;
      if (tileFastener.trait === tileTrait) {
        tileFastener.setTrait(null);
        if (this.mounted) {
          tileFastener.unmount();
        }
        tileFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected initTile(tileTrait: GeoGridTrait, tileFastener: TraitFastener<this, GeoGridTrait>): void {
    // hook
  }

  protected attachTile(tileTrait: GeoGridTrait, tileFastener: TraitFastener<this, GeoGridTrait>): void {
    // hook
  }

  protected detachTile(tileTrait: GeoGridTrait, tileFastener: TraitFastener<this, GeoGridTrait>): void {
    // hook
  }

  protected willSetTile(newTileTrait: GeoGridTrait | null, oldTileTrait: GeoGridTrait | null,
                        targetTrait: Trait | null, tileFastener: TraitFastener<this, GeoGridTrait>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitWillSetTile !== void 0) {
        traitObserver.traitWillSetTile(newTileTrait, oldTileTrait, targetTrait, this);
      }
    }
  }

  protected onSetTile(newTileTrait: GeoGridTrait | null, oldTileTrait: GeoGridTrait | null,
                      targetTrait: Trait | null, tileFastener: TraitFastener<this, GeoGridTrait>): void {
    if (oldTileTrait !== null) {
      this.detachTile(oldTileTrait, tileFastener);
    }
    if (newTileTrait !== null) {
      this.attachTile(newTileTrait, tileFastener);
      this.initTile(newTileTrait, tileFastener);
    }
  }

  protected didSetTile(newTileTrait: GeoGridTrait | null, oldTileTrait: GeoGridTrait | null,
                       targetTrait: Trait | null, tileFastener: TraitFastener<this, GeoGridTrait>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetTile !== void 0) {
        traitObserver.traitDidSetTile(newTileTrait, oldTileTrait, targetTrait, this);
      }
    }
  }

  /** @internal */
  static TileFastener = TraitFastener.define<GeoGridTrait, GeoGridTrait>({
    type: GeoGridTrait,
    sibling: false,
    willSetTrait(newTileTrait: GeoGridTrait | null, oldTileTrait: GeoGridTrait | null, targetTrait: Trait | null): void {
      this.owner.willSetTile(newTileTrait, oldTileTrait, targetTrait, this);
    },
    onSetTrait(newTileTrait: GeoGridTrait | null, oldTileTrait: GeoGridTrait | null, targetTrait: Trait | null): void {
      this.owner.onSetTile(newTileTrait, oldTileTrait, targetTrait, this);
    },
    didSetTrait(newTileTrait: GeoGridTrait | null, oldTileTrait: GeoGridTrait | null, targetTrait: Trait | null): void {
      this.owner.didSetTile(newTileTrait, oldTileTrait, targetTrait, this);
    },
  });

  protected createTileFastener(tileTrait: GeoGridTrait): TraitFastener<this, GeoGridTrait> {
    return GeoGridTrait.TileFastener.create(this, tileTrait.key ?? "tile");
  }

  /** @internal */
  readonly tileFasteners: ReadonlyArray<TraitFastener<this, GeoGridTrait>>;

  /** @internal */
  protected mountTileFasteners(): void {
    const tileFasteners = this.tileFasteners;
    for (let i = 0, n = tileFasteners.length; i < n; i += 1) {
      const tileFastener = tileFasteners[i]!;
      tileFastener.mount();
    }
  }

  /** @internal */
  protected unmountTileFasteners(): void {
    const tileFasteners = this.tileFasteners;
    for (let i = 0, n = tileFasteners.length; i < n; i += 1) {
      const tileFastener = tileFasteners[i]!;
      tileFastener.unmount();
    }
  }

  protected createTileTrait(geoTile: GeoTile): GeoGridTrait | null {
    return new GeoGridTrait(geoTile);
  }

  protected createTileModel(geoTile: GeoTile): Model | null {
    const tileTrait = this.createTileTrait(geoTile);
    if (tileTrait !== null) {
      const tileModel = new GenericModel();
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

  protected detectTileModel(model: Model): GeoGridTrait | null {
    return model.getTrait(GeoGridTrait);
  }

  protected override detectChildModel(child: Model): void {
    const tileTrait = this.detectTileModel(child);
    if (tileTrait !== null) {
      this.insertTile(tileTrait);
    } else {
      super.detectChildModel(child);
    }
  }

  protected override detectInsertChildModel(child: Model, target: Model | null): void {
    const tileTrait = this.detectTileModel(child);
    if (tileTrait !== null) {
      const targetTrait = target !== null ? this.detectTileModel(target) : null;
      this.insertTile(tileTrait, targetTrait);
    } else {
      super.detectInsertChildModel(child, target);
    }
  }

  protected override detectRemoveChildModel(child: Model): void {
    const tileTrait = this.detectTileModel(child);
    if (tileTrait !== null) {
      this.removeTile(tileTrait);
    } else {
      super.detectRemoveChildModel(child);
    }
  }

  /** @internal */
  protected override mountFasteners(): void {
    super.mountFasteners();
    this.mountTileFasteners();
  }

  /** @internal */
  protected override unmountFasteners(): void {
    this.unmountTileFasteners();
    super.unmountFasteners();
  }

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.initTiles();
  }
}
