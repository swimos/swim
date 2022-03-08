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

import type {Trait, TraitObserver} from "@swim/model";
import type {BarTrait} from "@swim/toolbar";
import type {CardTrait} from "../card/CardTrait";
import type {DeckTrait} from "./DeckTrait";

/** @public */
export interface DeckTraitObserver<T extends DeckTrait = DeckTrait> extends TraitObserver<T> {
  traitWillAttachBar?(barTrait: BarTrait, trait: T): void;

  traitDidDetachBar?(barTrait: BarTrait, trait: T): void;

  traitWillAttachCard?(cardTrait: CardTrait, targetTrait: Trait | null, trait: T): void;

  traitDidDetachCard?(cardTrait: CardTrait, trait: T): void;
}
