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
import type {MemberFastenerClass} from "@swim/component";
import {Model, Trait, TraitRef, TraitSet} from "@swim/model";
import {BarTrait} from "@swim/toolbar";
import {CardTrait} from "../card/CardTrait";
import type {DeckTraitObserver} from "./DeckTraitObserver";

/** @public */
export class DeckTrait extends Trait {
  override readonly observerType?: Class<DeckTraitObserver>;

  @TraitRef<DeckTrait, BarTrait>({
    type: BarTrait,
    binds: true,
    willAttachTrait(barTrait: BarTrait): void {
      this.owner.callObservers("traitWillAttachBar", barTrait, this.owner);
    },
    didDetachTrait(barTrait: BarTrait): void {
      this.owner.callObservers("traitDidDetachBar", barTrait, this.owner);
    },
    detectTrait(trait: Trait): BarTrait | null {
      return trait instanceof BarTrait ? trait : null;
    },
  })
  readonly bar!: TraitRef<this, BarTrait>;
  static readonly bar: MemberFastenerClass<DeckTrait, "bar">;

  @TraitSet<DeckTrait, CardTrait>({
    type: CardTrait,
    binds: true,
    willAttachTrait(cardTrait: CardTrait, targetTrait: Trait | null): void {
      this.owner.callObservers("traitWillAttachCard", cardTrait, targetTrait, this.owner);
    },
    didDetachTrait(cardTrait: CardTrait): void {
      this.owner.callObservers("traitDidDetachCard", cardTrait, this.owner);
    },
    detectModel(model: Model): CardTrait | null {
      return model.getTrait(CardTrait);
    },
  })
  readonly cards!: TraitSet<this, CardTrait>;
  static readonly cards: MemberFastenerClass<DeckTrait, "cards">;
}
