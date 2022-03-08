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

import type {PositionGestureInput} from "@swim/view";
import type {ControllerObserver} from "@swim/controller";
import type {ToolView, BarView, BarTrait, BarController} from "@swim/toolbar";
import type {CardView} from "../card/CardView";
import type {CardTrait} from "../card/CardTrait";
import type {CardController} from "../card/CardController";
import type {DeckView} from "./DeckView";
import type {DeckTrait} from "./DeckTrait";
import type {DeckController} from "./DeckController";

/** @public */
export interface DeckControllerObserver<C extends DeckController = DeckController> extends ControllerObserver<C> {
  controllerWillAttachDeckTrait?(deckTrait: DeckTrait, controller: C): void;

  controllerDidDetachDeckTrait?(deckTrait: DeckTrait, controller: C): void;

  controllerWillAttachDeckView?(deckView: DeckView, controller: C): void;

  controllerDidDetachDeckView?(deckView: DeckView, controller: C): void;

  controllerWillAttachBar?(barController: BarController, controller: C): void;

  controllerDidDetachBar?(barController: BarController, controller: C): void;

  controllerWillAttachBarTrait?(barTrait: BarTrait, controller: C): void;

  controllerDidDetachBarTrait?(barTrait: BarTrait, controller: C): void;

  controllerWillAttachBarView?(barView: BarView, controller: C): void;

  controllerDidDetachBarView?(barView: BarView, controller: C): void;

  controllerDidPressClose?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerDidPressBack?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerDidPressMenu?(input: PositionGestureInput, event: Event | null, controller: C): void;

  controllerWillAttachCard?(cardController: CardController, controller: C): void;

  controllerDidDetachCard?(cardController: CardController, controller: C): void;

  controllerWillAttachCardTrait?(cardTrait: CardTrait, cardController: CardController, controller: C): void;

  controllerDidDetachCardTrait?(cardTrait: CardTrait, cardController: CardController, controller: C): void;

  controllerWillAttachCardView?(cardView: CardView, cardController: CardController, controller: C): void;

  controllerDidDetachCardView?(cardView: CardView, cardController: CardController, controller: C): void;

  controllerWillAttachCardTitleView?(cardTitleView: ToolView, cardController: CardController, controller: C): void;

  controllerDidDetachCardTitleView?(cardTitleView: ToolView, cardController: CardController, controller: C): void;

  controllerWillAttachTopCard?(cardController: CardController, controller: C): void;

  controllerDidDetachTopCard?(cardController: CardController, controller: C): void;
}
