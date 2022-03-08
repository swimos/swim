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
import {Property} from "@swim/component";
import {Trait} from "@swim/model";
import type {ToolView} from "@swim/toolbar";
import type {CardTraitObserver} from "./CardTraitObserver";

/** @public */
export type CardTraitTitle = CardTraitTitleFunction | string;
/** @public */
export type CardTraitTitleFunction = (cardTrait: CardTrait) => ToolView | string | null;

/** @public */
export class CardTrait extends Trait {
  override readonly observerType?: Class<CardTraitObserver>;

  @Property<CardTrait, CardTraitTitle | null>({
    value: null,
    willSetValue(newTitle: CardTraitTitle | null, oldTitle: CardTraitTitle | null): void {
      this.owner.callObservers("traitWillSetTitle", newTitle, oldTitle, this.owner);
    },
    didSetValue(newTitle: CardTraitTitle | null, oldTitle: CardTraitTitle | null): void {
      this.owner.callObservers("traitDidSetTitle", newTitle, oldTitle, this.owner);
    },
  })
  readonly title!: Property<this, CardTraitTitle | null>;
}
