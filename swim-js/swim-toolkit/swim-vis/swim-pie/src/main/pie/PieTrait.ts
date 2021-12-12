// Copyright 2015-2021 Swim.inc
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
import {MemberFastenerClass, Property} from "@swim/component";
import {Model, Trait, TraitSet} from "@swim/model";
import type {GraphicsView} from "@swim/graphics";
import {SliceTrait} from "../slice/SliceTrait";
import type {PieTraitObserver} from "./PieTraitObserver";

/** @public */
export type PieTitle = PieTitleFunction | string;
/** @public */
export type PieTitleFunction = (pieTrait: PieTrait) => GraphicsView | string | null;

/** @public */
export class PieTrait extends Trait {
  override readonly observerType?: Class<PieTraitObserver>;

  @Property<PieTrait, PieTitle | null>({
    value: null,
    willSetValue(newTitle: PieTitle | null, oldTitle: PieTitle | null): void {
      this.owner.callObservers("traitWillSetPieTitle", newTitle, oldTitle, this.owner);
    },
    didSetValue(newTitle: PieTitle | null, oldTitle: PieTitle | null): void {
      this.owner.callObservers("traitDidSetPieTitle", newTitle, oldTitle, this.owner);
    },
  })
  readonly title!: Property<this, PieTitle | null>;
  static readonly title: MemberFastenerClass<PieTrait, "title">;

  @TraitSet<PieTrait, SliceTrait>({
    type: SliceTrait,
    binds: true,
    willAttachTrait(sliceTrait: SliceTrait, targetTrait: Trait | null): void {
      this.owner.callObservers("traitWillAttachSlice", sliceTrait, targetTrait, this.owner);
    },
    didAttachTrait(sliceTrait: SliceTrait): void {
      if (this.owner.consuming) {
        sliceTrait.consume(this.owner);
      }
    },
    willDetachTrait(sliceTrait: SliceTrait): void {
      if (this.owner.consuming) {
        sliceTrait.unconsume(this.owner);
      }
    },
    didDetachTrait(sliceTrait: SliceTrait): void {
      this.owner.callObservers("traitDidDetachSlice", sliceTrait, this.owner);
    },
    detectModel(model: Model): SliceTrait | null {
      return model.getTrait(SliceTrait);
    },
  })
  readonly slices!: TraitSet<this, SliceTrait>;
  static readonly slices: MemberFastenerClass<PieTrait, "slices">;

  /** @internal */
  protected startConsumingSlices(): void {
    const sliceTraits = this.slices.traits;
    for (const traitId in sliceTraits) {
      const sliceTrait = sliceTraits[traitId]!;
      sliceTrait.consume(this);
    }
  }

  /** @internal */
  protected stopConsumingSlices(): void {
    const sliceTraits = this.slices.traits;
    for (const traitId in sliceTraits) {
      const sliceTrait = sliceTraits[traitId]!;
      sliceTrait.unconsume(this);
    }
  }

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.startConsumingSlices();
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    this.stopConsumingSlices();
  }
}
