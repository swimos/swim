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

import type {Class} from "@swim/util";
import {FastenerClass, Property} from "@swim/component";
import {Model, Trait, TraitSet} from "@swim/model";
import {GeoTrait} from "../geo/GeoTrait";
import {AnyGeoPerspective, GeoPerspective} from "../geo/GeoPerspective";
import type {MapTraitObserver} from "./MapTraitObserver";

/** @public */
export class MapTrait extends Trait {
  override readonly observerType?: Class<MapTraitObserver>;

  @Property<MapTrait["geoPerspective"]>({
    valueType: GeoPerspective,
    value: null,
    didSetValue(geoPerspective: GeoPerspective | null): void {
      this.owner.callObservers("traitDidSetGeoPerspective", geoPerspective, this.owner);
    },
  })
  readonly geoPerspective!: Property<this, GeoPerspective | null, AnyGeoPerspective | null>;

  @TraitSet<MapTrait["layers"]>({
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
  static readonly layers: FastenerClass<MapTrait["layers"]>;

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.layers.consumeTraits(this);
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    this.layers.unconsumeTraits(this);
  }
}
