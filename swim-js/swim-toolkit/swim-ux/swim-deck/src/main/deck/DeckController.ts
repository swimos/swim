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

import type {Class, ObserverType, AnyTiming} from "@swim/util";
import type {MemberFastenerClass} from "@swim/component";
import type {Trait} from "@swim/model";
import type {PositionGestureInput} from "@swim/view";
import {
  Controller,
  TraitViewRef,
  TraitViewControllerRef,
  TraitViewControllerSet,
} from "@swim/controller";
import {ToolView, BarView, BarTrait, BarController} from "@swim/toolbar";
import type {CardView} from "../card/CardView";
import type {CardTrait} from "../card/CardTrait";
import {CardController} from "../card/CardController";
import {DeckBarController} from "./DeckBarController";
import {DeckView} from "./DeckView";
import {DeckTrait} from "./DeckTrait";
import type {DeckControllerObserver} from "./DeckControllerObserver";

/** @public */
export interface DeckControllerBarExt {
  attachBarTrait(barTrait: BarTrait, barController: BarController): void;
  detachBarTrait(barTrait: BarTrait, barController: BarController): void;
  attachBarView(barView: BarView, barController: BarController): void;
  detachBarView(barView: BarView, barController: BarController): void;
}

/** @public */
export type DeckControllerCardExt = {
  attachCardTrait(cardTrait: CardTrait, cardController: CardController): void;
  detachCardTrait(cardTrait: CardTrait, cardController: CardController): void;
  attachCardView(cardView: CardView, cardController: CardController): void;
  detachCardView(cardView: CardView, cardController: CardController): void;
  attachCardTitleView(cardTitleView: ToolView, cardController: CardController): void;
  detachCardTitleView(cardTitleView: ToolView, cardController: CardController): void;
};

/** @public */
export type DeckControllerTopCardExt = {
  dismiss(timing?: AnyTiming | boolean): CardView | null;
};

/** @public */
export class DeckController extends Controller {
  override readonly observerType?: Class<DeckControllerObserver>;

  @TraitViewRef<DeckController, DeckTrait, DeckView>({
    traitType: DeckTrait,
    observesTrait: true,
    willAttachTrait(deckTrait: DeckTrait): void {
      this.owner.callObservers("controllerWillAttachDeckTrait", deckTrait, this.owner);
    },
    didAttachTrait(deckTrait: DeckTrait): void {
      const barTrait = deckTrait.bar.trait;
      if (barTrait !== null) {
        this.owner.bar.setTrait(barTrait);
      }
      const cardTraits = deckTrait.cards.traits;
      for (const traitId in cardTraits) {
        const cardTrait = cardTraits[traitId]!;
        this.owner.cards.addTraitController(cardTrait);
      }
    },
    willDetachTrait(deckTrait: DeckTrait): void {
      const cardTraits = deckTrait.cards.traits;
      for (const traitId in cardTraits) {
        const cardTrait = cardTraits[traitId]!;
        this.owner.cards.deleteTraitController(cardTrait);
      }
      const barTrait = deckTrait.bar.trait;
      if (barTrait !== null) {
        this.owner.bar.deleteTrait(barTrait);
      }
    },
    didDetachTrait(deckTrait: DeckTrait): void {
      this.owner.callObservers("controllerDidDetachDeckTrait", deckTrait, this.owner);
    },
    traitWillAttachBar(barTrait: BarTrait): void {
      this.owner.bar.setTrait(barTrait);
    },
    traitDidDetachBar(barTrait: BarTrait): void {
      this.owner.bar.deleteTrait(barTrait);
    },
    traitWillAttachCard(cardTrait: CardTrait, targetTrait: Trait): void {
      this.owner.cards.addTraitController(cardTrait, targetTrait);
    },
    traitDidDetachCard(cardTrait: CardTrait): void {
      this.owner.cards.deleteTraitController(cardTrait);
    },
    viewType: DeckView,
    observesView: true,
    initView(deckView: DeckView): void {
      const barController = this.owner.bar.controller;
      if (barController !== null) {
        barController.bar.insertView(deckView);
        if (deckView.bar.view === null) {
          deckView.bar.setView(barController.bar.view);
        }
      }
      const cardControllers = this.owner.cards.controllers;
      for (const controllerId in cardControllers) {
        const cardController = cardControllers[controllerId]!;
        const cardView = cardController.card.view;
        if (cardView !== null && cardView.parent === null) {
          const cardTrait = cardController.card.trait;
          if (cardTrait !== null) {
            cardController.card.insertView(deckView, void 0, void 0, cardTrait.key);
          }
        }
      }
    },
    willAttachView(deckView: DeckView): void {
      this.owner.callObservers("controllerWillAttachDeckView", deckView, this.owner);
    },
    didDetachView(deckView: DeckView): void {
      this.owner.callObservers("controllerDidDetachDeckView", deckView, this.owner);
    },
    viewWillAttachBar(barView: BarView): void {
      const barController = this.owner.bar.controller;
      if (barController !== null) {
        barController.bar.setView(barView);
      }
    },
    viewDidDetachBar(barView: BarView): void {
      const barController = this.owner.bar.controller;
      if (barController !== null) {
        barController.bar.setView(null);
      }
    },
  })
  readonly deck!: TraitViewRef<this, DeckTrait, DeckView>;
  static readonly deck: MemberFastenerClass<DeckController, "deck">;

  @TraitViewControllerRef<DeckController, BarTrait, BarView, BarController, DeckControllerBarExt & ObserverType<BarController | DeckBarController>>({
    implements: true,
    type: BarController,
    binds: true,
    observes: true,
    get parentView(): DeckView | null {
      return this.owner.deck.view;
    },
    getTraitViewRef(barController: BarController): TraitViewRef<unknown, BarTrait, BarView> {
      return barController.bar;
    },
    initController(barController: BarController): void {
      const deckTrait = this.owner.deck.trait;
      if (deckTrait !== null) {
        const barTrait = deckTrait.bar.trait;
        if (barTrait !== null) {
          barController.bar.setTrait(barTrait);
        }
      }
    },
    willAttachController(barController: BarController): void {
      this.owner.callObservers("controllerWillAttachBar", barController, this.owner);
    },
    didAttachController(barController: BarController): void {
      const barTrait = barController.bar.trait;
      if (barTrait !== null) {
        this.attachBarTrait(barTrait, barController);
      }
      barController.bar.insertView();
    },
    willDetachController(barController: BarController): void {
      const barView = barController.bar.view;
      if (barView !== null) {
        this.detachBarView(barView, barController);
      }
      const barTrait = barController.bar.trait;
      if (barTrait !== null) {
        this.detachBarTrait(barTrait, barController);
      }
    },
    didDetachController(barController: BarController): void {
      this.owner.callObservers("controllerDidDetachBar", barController, this.owner);
    },
    controllerWillAttachBarTrait(barTrait: BarTrait, barController: BarController): void {
      this.owner.callObservers("controllerWillAttachBarTrait", barTrait, this.owner);
      this.attachBarTrait(barTrait, barController);
    },
    controllerDidDetachBarTrait(barTrait: BarTrait, barController: BarController): void {
      this.detachBarTrait(barTrait, barController);
      this.owner.callObservers("controllerDidDetachBarTrait", barTrait, this.owner);
    },
    attachBarTrait(barTrait: BarTrait, barController: BarController): void {
      // hook
    },
    detachBarTrait(barTrait: BarTrait, barController: BarController): void {
      // hook
    },
    controllerWillAttachBarView(barView: BarView, barController: BarController): void {
      this.owner.callObservers("controllerWillAttachBarView", barView, this.owner);
      this.attachBarView(barView, barController);
    },
    controllerDidDetachBarView(barView: BarView, barController: BarController): void {
      this.detachBarView(barView, barController);
      this.owner.callObservers("controllerDidDetachBarView", barView, this.owner);
    },
    attachBarView(barView: BarView, barController: BarController): void {
      const deckView = this.owner.deck.view;
      if (deckView !== null && deckView.bar.view === null) {
        deckView.bar.setView(barView);
      }
    },
    detachBarView(barView: BarView, barController: BarController): void {
      barView.remove();
    },
    controllerDidPressClose(input: PositionGestureInput, event: Event | null): void {
      this.owner.callObservers("controllerDidPressClose", input, event, this.owner);
    },
    controllerDidPressBack(input: PositionGestureInput, event: Event | null): void {
      this.owner.topCard.dismiss();
      this.owner.callObservers("controllerDidPressBack", input, event, this.owner);
    },
    controllerDidPressMenu(input: PositionGestureInput, event: Event | null): void {
      this.owner.callObservers("controllerDidPressMenu", input, event, this.owner);
    },
    detectController(controller: Controller): BarController | null {
      return controller instanceof BarController ? controller : null;
    },
    createController(): BarController {
      return new DeckBarController();
    },
  })
  readonly bar!: TraitViewControllerRef<this, BarTrait, BarView, BarController>;
  static readonly bar: MemberFastenerClass<DeckController, "bar">;

  @TraitViewControllerSet<DeckController, CardTrait, CardView, CardController, DeckControllerCardExt>({
    implements: true,
    type: CardController,
    binds: true,
    observes: true,
    get parentView(): DeckView | null {
      return this.owner.deck.view;
    },
    getTraitViewRef(cardController: CardController): TraitViewRef<unknown, CardTrait, CardView> {
      return cardController.card;
    },
    willAttachController(cardController: CardController): void {
      this.owner.callObservers("controllerWillAttachCard", cardController, this.owner);
    },
    didAttachController(cardController: CardController): void {
      const cardTrait = cardController.card.trait;
      if (cardTrait !== null) {
        this.attachCardTrait(cardTrait, cardController);
      }
      const cardView = cardController.card.view;
      if (cardView !== null) {
        this.attachCardView(cardView, cardController);
      }
    },
    willDetachController(cardController: CardController): void {
      const cardView = cardController.card.view;
      if (cardView !== null) {
        this.detachCardView(cardView, cardController);
      }
      const cardTrait = cardController.card.trait;
      if (cardTrait !== null) {
        this.detachCardTrait(cardTrait, cardController);
      }
    },
    didDetachController(cardController: CardController): void {
      this.owner.callObservers("controllerDidDetachCard", cardController, this.owner);
    },
    controllerWillAttachCardTrait(cardTrait: CardTrait, cardController: CardController): void {
      this.owner.callObservers("controllerWillAttachCardTrait", cardTrait, cardController, this.owner);
      this.attachCardTrait(cardTrait, cardController);
    },
    controllerDidDetachCardTrait(cardTrait: CardTrait, cardController: CardController): void {
      this.detachCardTrait(cardTrait, cardController);
      this.owner.callObservers("controllerDidDetachCardTrait", cardTrait, cardController, this.owner);
    },
    attachCardTrait(cardTrait: CardTrait, cardController: CardController): void {
      // hook
    },
    detachCardTrait(cardTrait: CardTrait, cardController: CardController): void {
      // hook
    },
    controllerWillAttachCardView(cardView: CardView, cardController: CardController): void {
      this.owner.callObservers("controllerWillAttachCardView", cardView, cardController, this.owner);
      this.attachCardView(cardView, cardController);
    },
    controllerDidDetachCardView(cardView: CardView, cardController: CardController): void {
      this.detachCardView(cardView, cardController);
      this.owner.callObservers("controllerDidDetachCardView", cardView, cardController, this.owner);
    },
    attachCardView(cardView: CardView, cardController: CardController): void {
      const cardTitleView = cardView.cardTitle.view;
      if (cardTitleView !== null) {
        this.attachCardTitleView(cardTitleView, cardController);
      }
      const deckView = this.owner.deck.view;
      if (deckView !== null) {
        deckView.cards.addView(cardView);
      }
      if (this.owner.topCard.controller === null && cardView.presence.presented) {
        this.owner.topCard.setController(cardController);
      }
    },
    detachCardView(cardView: CardView, cardController: CardController): void {
      const cardTitleView = cardView.cardTitle.view;
      if (cardTitleView !== null) {
        this.detachCardTitleView(cardTitleView, cardController);
      }
      cardView.remove();
    },
    controllerWillAttachCardTitleView(cardTitleView: ToolView, cardController: CardController): void {
      this.owner.callObservers("controllerWillAttachCardTitleView", cardTitleView, cardController, this.owner);
      this.attachCardTitleView(cardTitleView, cardController);
    },
    controllerDidDetachCardTitleView(cardTitleView: ToolView, cardController: CardController): void {
      this.detachCardTitleView(cardTitleView, cardController);
      this.owner.callObservers("controllerDidDetachCardTitleView", cardTitleView, cardController, this.owner);
    },
    attachCardTitleView(cardTitleView: ToolView, cardController: CardController): void {
      // hook
    },
    detachCardTitleView(cardTitleView: ToolView, cardController: CardController): void {
      cardTitleView.remove();
    },
    controllerWillPresentCardView(cardView: CardView, cardController: CardController): void {
      if (this.owner.topCard.controller === null) {
        this.owner.topCard.setController(cardController);
      }
    },
    controllerDidPresentCardView(cardView: CardView, cardController: CardController): void {
      // hook
    },
    controllerWillDismissCardView(cardView: CardView, cardController: CardController): void {
      if (this.owner.topCard.controller === cardController) {
        this.owner.topCard.setController(null);
      }
    },
    controllerDidDismissCardView(cardView: CardView, cardController: CardController): void {
      const topCardController = this.owner.topCard.controller;
      if (topCardController !== null && topCardController !== cardController
          && cardView.backCardView === null && cardView.frontCardView === null) {
        this.removeController(cardController);
      }
    },
  })
  readonly cards!: TraitViewControllerSet<this, CardTrait, CardView, CardController>;
  static readonly cards: MemberFastenerClass<DeckController, "cards">;

  @TraitViewControllerRef<DeckController, CardTrait, CardView, CardController, DeckControllerTopCardExt>({
    implements: true,
    type: CardController,
    binds: false,
    getTraitViewRef(cardController: CardController): TraitViewRef<unknown, CardTrait, CardView> {
      return cardController.card;
    },
    willAttachController(cardController: CardController): void {
      this.owner.callObservers("controllerWillAttachTopCard", cardController, this.owner);
    },
    didDetachController(cardController: CardController): void {
      this.owner.callObservers("controllerDidDetachTopCard", cardController, this.owner);
    },
    dismiss(timing?: AnyTiming | boolean): CardView | null {
      const cardView = this.view;
      if (cardView !== null) {
        cardView.dismiss(timing);
      }
      return cardView;
    },
  })
  readonly topCard!: TraitViewControllerRef<this, CardTrait, CardView, CardController> & DeckControllerTopCardExt;
  static readonly topCard: MemberFastenerClass<DeckController, "topCard">;
}
