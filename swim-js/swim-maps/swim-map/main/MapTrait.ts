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
import {Property} from "@swim/component";
import type {Model} from "@swim/model";
import type {TraitObserver} from "@swim/model";
import {Trait} from "@swim/model";
import {TraitSet} from "@swim/model";
import {GeoTrait} from "./GeoTrait";
import {GeoPerspective} from "./GeoPerspective";

/** @public */
export interface MapTraitObserver<T extends MapTrait = MapTrait> extends TraitObserver<T> {
  traitDidSetGeoPerspective?(geoPerspective: GeoPerspective | null, trait: T): void;

  traitWillAttachLayer?(layerTrait: GeoTrait, targetTrait: Trait | null, trait: T): void;

  traitDidDetachLayer?(layerTrait: GeoTrait, trait: T): void;
}

/** @public */
export class MapTrait extends Trait {
  declare readonly observerType?: Class<MapTraitObserver>;

  @Property({
    valueType: GeoPerspective,
    value: null,
    didSetValue(geoPerspective: GeoPerspective | null): void {
      this.owner.callObservers("traitDidSetGeoPerspective", geoPerspective, this.owner);
    },
  })
  readonly geoPerspective!: Property<this, GeoPerspective | null>;

  @TraitSet({
    traitType: GeoTrait,
    binds: true,
    willAttachTrait(newLayerTrait: GeoTrait, targetTrait: Trait | null): void {
      this.owner.callObservers("traitWillAttachLayer", newLayerTrait, targetTrait, this.owner);
    },
    didAttachTrait(layerTrait: GeoTrait): void {
      if (this.owner.consuming) {
        layerTrait.consume(this.owner);
      }
    },
    willDetachTrait(layerTrait: GeoTrait): void {
      if (this.owner.consuming) {
        layerTrait.unconsume(this.owner);
      }
    },
    didDetachTrait(newLayerTrait: GeoTrait): void {
      this.owner.callObservers("traitDidDetachLayer", newLayerTrait, this.owner);
    },
    detectModel(model: Model): GeoTrait | null {
      return model.getTrait(GeoTrait);
    },
    detectTrait(trait: Trait): GeoTrait | null {
      return null;
    },
  })
  readonly layers!: TraitSet<this, GeoTrait>;

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.layers.consumeTraits(this);
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    this.layers.unconsumeTraits(this);
  }
}
