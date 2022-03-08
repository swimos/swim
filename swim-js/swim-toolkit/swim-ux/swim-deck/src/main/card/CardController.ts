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
import type {MemberFastenerClass} from "@swim/component";
import {ViewRef} from "@swim/view";
import {Controller, TraitViewRef} from "@swim/controller";
import {ToolView} from "@swim/toolbar";
import {CardView} from "./CardView";
import {CardTraitTitle, CardTrait} from "./CardTrait";
import type {CardControllerObserver} from "./CardControllerObserver";

/** @public */
export class CardController extends Controller {
  override readonly observerType?: Class<CardControllerObserver>;

  @TraitViewRef<CardController, CardTrait, CardView>({
    traitType: CardTrait,
    observesTrait: true,
    initTrait(cardTrait: CardTrait): void {
      this.owner.setTitleView(cardTrait.title.value, cardTrait);
    },
    deinitTrait(cardTrait: CardTrait): void {
      this.owner.setTitleView(null, cardTrait);
    },
    willAttachTrait(cardTrait: CardTrait): void {
      this.owner.callObservers("controllerWillAttachCardTrait", cardTrait, this.owner);
    },
    didDetachTrait(cardTrait: CardTrait): void {
      this.owner.callObservers("controllerDidDetachCardTrait", cardTrait, this.owner);
    },
    traitDidSetTitle(newTitle: CardTraitTitle | null, oldTitle: CardTraitTitle | null, cardTrait: CardTrait): void {
      this.owner.setTitleView(newTitle, cardTrait);
    },
    viewType: CardView,
    observesView: true,
    initView(cardView: CardView): void {
      this.owner.title.setView(cardView.cardTitle.view);
      const cardTrait = this.trait;
      if (cardTrait !== null) {
        this.owner.setTitleView(cardTrait.title.value, cardTrait);
      }
    },
    deinitView(cardView: CardView): void {
      this.owner.title.setView(null);
    },
    willAttachView(cardView: CardView): void {
      this.owner.callObservers("controllerWillAttachCardView", cardView, this.owner);
    },
    didDetachView(cardView: CardView): void {
      this.owner.callObservers("controllerDidDetachCardView", cardView, this.owner);
    },
    viewWillAttachTitle(titleView: ToolView): void {
      this.owner.title.setView(titleView);
    },
    viewDidDetachTitle(titleView: ToolView): void {
      this.owner.title.setView(null);
    },
    viewWillPresent(cardView: CardView): void {
      this.owner.callObservers("controllerWillPresentCardView", cardView, this.owner);
    },
    viewDidPresent(cardView: CardView): void {
      this.owner.callObservers("controllerDidPresentCardView", cardView, this.owner);
    },
    viewWillDismiss(cardView: CardView): void {
      this.owner.callObservers("controllerWillDismissCardView", cardView, this.owner);
    },
    viewDidDismiss(cardView: CardView): void {
      this.owner.callObservers("controllerDidDismissCardView", cardView, this.owner);
    },
  })
  readonly card!: TraitViewRef<this, CardTrait, CardView>;
  static readonly card: MemberFastenerClass<CardController, "card">;

  protected createTitleView(title: CardTraitTitle, cardTrait: CardTrait): ToolView | string | null {
    if (typeof title === "function") {
      return title(cardTrait);
    } else {
      return title;
    }
  }

  protected setTitleView(title: CardTraitTitle | null, cardTrait: CardTrait): void {
    const cardView = this.card.view;
    if (cardView !== null) {
      const titleView = title !== null ? this.createTitleView(title, cardTrait) : null;
      cardView.cardTitle.setView(titleView);
    }
  }

  @ViewRef<CardController, ToolView>({
    type: ToolView,
    willAttachView(titleView: ToolView): void {
      this.owner.callObservers("controllerWillAttachCardTitleView", titleView, this.owner);
    },
    didDetachView(titleView: ToolView): void {
      this.owner.callObservers("controllerDidDetachCardTitleView", titleView, this.owner);
    },
  })
  readonly title!: ViewRef<this, ToolView>;
  static readonly title: MemberFastenerClass<CardController, "title">;
}
