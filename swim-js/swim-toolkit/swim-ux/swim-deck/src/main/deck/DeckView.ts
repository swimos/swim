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
import {Affinity, MemberFastenerClass, Property} from "@swim/component";
import {Length} from "@swim/math";
import {ViewportInsets, ViewContextType, View, ViewRef, ViewSet} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {BarView} from "@swim/toolbar";
import {CardView} from "../card/CardView";
import type {DeckViewObserver} from "./DeckViewObserver";

/** @public */
export class DeckView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initDeck();
  }

  protected initDeck(): void {
    this.addClass("deck");
    this.position.setState("relative", Affinity.Intrinsic);
    this.overflowX.setState("hidden", Affinity.Intrinsic);
    this.overflowY.setState("hidden", Affinity.Intrinsic);
  }

  override readonly observerType?: Class<DeckViewObserver>;

  @Property({type: Object, inherits: true, value: null, updateFlags: View.NeedsResize})
  readonly edgeInsets!: Property<this, ViewportInsets | null>;

  @ViewRef<DeckView, BarView>({
    type: BarView,
    binds: true,
    initView(barView: BarView): void {
      let deckWidth = this.owner.width.state;
      deckWidth = deckWidth instanceof Length ? deckWidth : Length.px(this.owner.node.offsetWidth);
      barView.position.setState("absolute", Affinity.Intrinsic);
      barView.left.setState(0, Affinity.Intrinsic);
      barView.top.setState(0, Affinity.Intrinsic);
      barView.width.setState(deckWidth, Affinity.Intrinsic);
      barView.zIndex.setState(1, Affinity.Intrinsic);
    },
    willAttachView(barView: BarView, target: View | null): void {
      this.owner.callObservers("viewWillAttachBar", barView, target, this.owner);
    },
    didDetachView(barView: BarView): void {
      this.owner.callObservers("viewDidDetachBar", barView, this.owner);
    },
  })
  readonly bar!: ViewRef<this, BarView>;
  static readonly bar: MemberFastenerClass<DeckView, "bar">;

  @ViewSet<DeckView, CardView>({
    implements: true,
    type: CardView,
    binds: true,
    observes: true,
    initView(cardView: CardView): void {
      let deckWidth = this.owner.width.state;
      deckWidth = deckWidth instanceof Length ? deckWidth : Length.px(this.owner.node.offsetWidth);
      let deckHeight = this.owner.height.state;
      deckHeight = deckHeight instanceof Length ? deckHeight : Length.px(this.owner.node.offsetHeight);
      let edgeInsets = this.owner.edgeInsets.value;
      if (edgeInsets === void 0 && this.owner.edgeInsets.hasAffinity(Affinity.Intrinsic)) {
        edgeInsets = this.owner.viewport.safeArea;
      }

      const barView = this.owner.bar.view;
      let barHeight: Length | null = null;
      if (barView !== null) {
        barHeight = barView.height.state;
        barHeight = barHeight instanceof Length ? barHeight : Length.px(barView.node.offsetHeight);
        if (edgeInsets !== null) {
          edgeInsets = {
            insetTop: 0,
            insetRight: edgeInsets.insetRight,
            insetBottom: edgeInsets.insetBottom,
            insetLeft: edgeInsets.insetLeft,
          };
        }
      }

      cardView.position.setState("absolute", Affinity.Intrinsic);
      cardView.left.setState(deckWidth, Affinity.Intrinsic);
      cardView.top.setState(0, Affinity.Intrinsic);
      cardView.width.setState(deckWidth, Affinity.Intrinsic);
      cardView.height.setState(deckHeight, Affinity.Intrinsic);
      cardView.paddingTop.setState(barHeight, Affinity.Intrinsic);
      cardView.boxSizing.setState("border-box", Affinity.Intrinsic);
      cardView.zIndex.setState(0, Affinity.Intrinsic);
      cardView.edgeInsets.setValue(edgeInsets, Affinity.Intrinsic);
    },
    willAttachView(cardView: CardView, target: View | null): void {
      this.owner.callObservers("viewWillAttachCard", cardView, target, this.owner);
      const backCardView = this.owner.topCard.view;
      cardView.setBackCardView(backCardView);
      if (backCardView !== null) {
        backCardView.setFrontCardView(cardView);
      }
      this.owner.topCard.setView(cardView);
    },
    didDetachView(cardView: CardView): void {
      const backCardView = cardView.backCardView;
      const frontCardView = cardView.frontCardView;
      if (cardView === this.owner.topCard.view) {
        this.owner.topCard.setView(backCardView, frontCardView);
      }
      if (backCardView !== null) {
        backCardView.setFrontCardView(frontCardView);
        cardView.setBackCardView(null);
      }
      if (frontCardView !== null) {
        cardView.setFrontCardView(null);
        frontCardView.setBackCardView(backCardView);
      }
      this.owner.callObservers("viewDidDetachCard", cardView, this.owner);
    },
    viewWillPresent(cardView: CardView): void {
      this.owner.callObservers("viewWillPresentCard", cardView, this.owner);
    },
    viewDidPresent(cardView: CardView): void {
      this.owner.callObservers("viewDidPresentCard", cardView, this.owner);
    },
    viewWillDismiss(cardView: CardView): void {
      this.owner.callObservers("viewWillDismissCard", cardView, this.owner);
      if (cardView === this.owner.topCard.view) {
        this.owner.topCard.setView(null);
        const backCardView = cardView.backCardView;
        if (backCardView !== null) {
          this.owner.topCard.setView(backCardView, cardView);
          backCardView.setFrontCardView(null);
          cardView.setBackCardView(null);
        }
      }
    },
    viewDidDismiss(cardView: CardView): void {
      if (cardView.frontCardView !== null) {
        this.removeView(cardView);
      } else {
        this.deleteView(cardView);
      }
      this.owner.callObservers("viewDidDismissCard", cardView, this.owner);
    },
    detectView(view: View): CardView | null {
      return view instanceof CardView && view.frontCardView === null ? view : null;
    },
  })
  readonly cards!: ViewSet<this, CardView>;
  static readonly cards: MemberFastenerClass<DeckView, "cards">;

  @ViewRef<DeckView, CardView>({
    type: CardView,
    binds: false,
    willAttachView(cardView: CardView, target: View | null): void {
      if (cardView.parent === null) {
        this.owner.insertChild(cardView, target);
      }
      if (cardView.frontCardView === null) {
        if (cardView.presence.presented) {
          cardView.dismiss(false);
        }
        cardView.cardAlign.setValue(1, Affinity.Intrinsic);
        cardView.present(cardView.backCardView !== null);
      } else {
        cardView.cardAlign.setValue(-(1 / 3), Affinity.Intrinsic);
        cardView.present();
      }
    },
    didDetachView(cardView: CardView): void {
      if (cardView.frontCardView !== null) {
        cardView.cardAlign.setValue(-(1 / 3), Affinity.Intrinsic);
        cardView.dismiss();
      } else {
        cardView.cardAlign.setValue(1, Affinity.Intrinsic);
        cardView.dismiss();
      }
    },
  })
  readonly topCard!: ViewRef<this, CardView>;
  static readonly topCard: MemberFastenerClass<DeckView, "topCard">;

  protected override didResize(viewContext: ViewContextType<this>): void {
    this.resizeDeck(viewContext);
    super.didResize(viewContext);
  }

  protected resizeDeck(viewContext: ViewContextType<this>): void {
    let deckWidth = this.width.state;
    deckWidth = deckWidth instanceof Length ? deckWidth : Length.px(this.node.offsetWidth);
    let deckHeight = this.height.state;
    deckHeight = deckHeight instanceof Length ? deckHeight : Length.px(this.node.offsetHeight);
    let edgeInsets = this.edgeInsets.value;
    if (edgeInsets === void 0 && this.edgeInsets.hasAffinity(Affinity.Intrinsic)) {
      edgeInsets = viewContext.viewport.safeArea;
    }

    const barView = this.bar.view;
    let barHeight: Length | null = null;
    if (barView !== null) {
      barView.width.setState(deckWidth, Affinity.Intrinsic);
      barHeight = barView.height.state;
      barHeight = barHeight instanceof Length ? barHeight : Length.px(barView.node.offsetHeight);
      if (edgeInsets !== null) {
        edgeInsets = {
          insetTop: 0,
          insetRight: edgeInsets.insetRight,
          insetBottom: edgeInsets.insetBottom,
          insetLeft: edgeInsets.insetLeft,
        };
      }
    }

    const cardViews = this.cards.views;
    for (const viewId in cardViews) {
      const cardView = cardViews[viewId]!;
      cardView.width.setState(deckWidth, Affinity.Intrinsic);
      cardView.height.setState(deckHeight, Affinity.Intrinsic);
      cardView.paddingTop.setState(barHeight, Affinity.Intrinsic);
      cardView.edgeInsets.setValue(edgeInsets, Affinity.Intrinsic);
    }
  }
}
