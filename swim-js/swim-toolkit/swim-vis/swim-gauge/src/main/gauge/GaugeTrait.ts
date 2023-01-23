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
import {FastenerClass, Property} from "@swim/component";
import {Model, Trait, TraitSet} from "@swim/model";
import {DialTrait} from "../dial/DialTrait";
import type {GaugeTraitObserver} from "./GaugeTraitObserver";

/** @public */
export class GaugeTrait extends Trait {
  override readonly observerType?: Class<GaugeTraitObserver>;

  @Property<GaugeTrait["title"]>({
    valueType: String,
    didSetValue(title: string | undefined): void {
      this.owner.callObservers("traitDidSetTitle", title, this.owner);
    },
  })
  readonly title!: Property<this, string | undefined>;
  static readonly title: FastenerClass<GaugeTrait["title"]>;

  @Property<GaugeTrait["limit"]>({
    valueType: Number,
    value: 0,
    didSetValue(limit: number): void {
      this.owner.callObservers("traitDidSetLimit", limit, this.owner);
    },
  })
  readonly limit!: Property<this, number>;
  static readonly limit: FastenerClass<GaugeTrait["limit"]>;

  @TraitSet<GaugeTrait["dials"]>({
    traitType: DialTrait,
    binds: true,
    willAttachTrait(dialTrait: DialTrait, targetTrait: Trait | null): void {
      this.owner.callObservers("traitWillAttachDial", dialTrait, targetTrait, this.owner);
    },
    didAttachTrait(dialTrait: DialTrait): void {
      if (this.owner.consuming) {
        dialTrait.consume(this.owner);
      }
    },
    willDetachTrait(dialTrait: DialTrait): void {
      if (this.owner.consuming) {
        dialTrait.unconsume(this.owner);
      }
    },
    didDetachTrait(dialTrait: DialTrait): void {
      this.owner.callObservers("traitDidDetachDial", dialTrait, this.owner);
    },
    detectModel(model: Model): DialTrait | null {
      return model.getTrait(DialTrait);
    },
  })
  readonly dials!: TraitSet<this, DialTrait>;
  static readonly dials: FastenerClass<GaugeTrait["dials"]>;

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.dials.consumeTraits(this);
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    this.dials.unconsumeTraits(this);
  }
}
