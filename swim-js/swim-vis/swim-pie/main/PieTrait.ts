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
import {Property} from "@swim/component";
import type {Model} from "@swim/model";
import type {TraitObserver} from "@swim/model";
import {Trait} from "@swim/model";
import {TraitSet} from "@swim/model";
import {SliceTrait} from "./SliceTrait";

/** @public */
export interface PieTraitObserver<T extends PieTrait = PieTrait> extends TraitObserver<T> {
  traitDidSetTitle?(title: string | undefined, trait: T): void;

  traitWillAttachSlice?(sliceTrait: SliceTrait, targetTrait: Trait | null, trait: T): void;

  traitDidDetachSlice?(sliceTrait: SliceTrait, trait: T): void;
}

/** @public */
export class PieTrait extends Trait {
  declare readonly observerType?: Class<PieTraitObserver>;

  @Property({
    valueType: String,
    didSetValue(title: string | undefined): void {
      this.owner.callObservers("traitDidSetTitle", title, this.owner);
    },
  })
  readonly title!: Property<this, string | undefined>;

  @TraitSet({
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

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.slices.consumeTraits(this);
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    this.slices.unconsumeTraits(this);
  }
}
