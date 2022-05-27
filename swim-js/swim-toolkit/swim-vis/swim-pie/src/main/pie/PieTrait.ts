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
import {SliceTrait} from "../slice/SliceTrait";
import type {PieTraitObserver} from "./PieTraitObserver";

/** @public */
export class PieTrait extends Trait {
  override readonly observerType?: Class<PieTraitObserver>;

  @Property<PieTrait["title"]>({
    valueType: String,
    didSetValue(title: string | undefined): void {
      this.owner.callObservers("traitDidSetTitle", title, this.owner);
    },
  })
  readonly title!: Property<this, string | undefined>;
  static readonly title: FastenerClass<PieTrait["title"]>;

  @TraitSet<PieTrait["slices"]>({
    traitType: SliceTrait,
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
  static readonly slices: FastenerClass<PieTrait["slices"]>;

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.slices.consumeTraits(this);
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    this.slices.unconsumeTraits(this);
  }
}
