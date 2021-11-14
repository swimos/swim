// Copyright 2015-2021 Swim Inc.
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

import {Mutable, Class, AnyTiming, Timing} from "@swim/util";
import {Affinity, FastenerOwner, Property} from "@swim/fastener";
import {Length} from "@swim/math";
import {Look, Mood, ThemeAnimator} from "@swim/theme";
import {ViewportInsets, ViewContextType, ViewContext, View, ViewRefFactory, ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {DeckBar} from "./DeckBar";
import {DeckCard} from "./DeckCard";
import type {DeckViewObserver} from "./DeckViewObserver";

/** @public */
export class DeckView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.cardCount = 0;
    this.card = null;
    this.initDeck();
  }

  protected initDeck(): void {
    this.addClass("deck");
    this.position.setState("relative", Affinity.Intrinsic);
    this.overflowX.setState("hidden", Affinity.Intrinsic);
    this.overflowY.setState("hidden", Affinity.Intrinsic);
  }

  override readonly observerType?: Class<DeckViewObserver>;

  @ThemeAnimator({type: Number, state: 0, updateFlags: View.NeedsLayout})
  readonly deckPhase!: ThemeAnimator<this, number>;

  @Property({type: Number, state: 1})
  readonly inAlign!: Property<this, number>;

  @Property({type: Number, state: 1 / 3})
  readonly outAlign!: Property<this, number>;

  @Property({type: Object, inherits: true, state: null, updateFlags: View.NeedsResize})
  readonly edgeInsets!: Property<this, ViewportInsets | null>;

  /** @internal */
  readonly bar!: DeckViewBar<this, DeckBar>; // defined by DeckViewBar

  /** @internal */
  cardCount: number;

  card: ViewRef<this, DeckCard> | null;

  pushCard(newCardView: DeckCard, timing?: AnyTiming | boolean): void {
    if (this.deckPhase.tweening) {
      return;
    }

    const oldCardCount = this.cardCount;
    const newCardCount = oldCardCount + 1;
    this.cardCount = newCardCount;

    const oldCardKey = "card" + oldCardCount;
    const oldCardRef = this.getFastener(oldCardKey, ViewRef) as DeckViewCard<this, DeckCard> | null;
    const oldCardView = oldCardRef !== null ? oldCardRef.view : null;

    const newCardKey = "card" + newCardCount;
    const newCardRef = DeckViewCardRef.create(this) as DeckViewCard<this, DeckCard>;
    Object.defineProperty(newCardRef, "name", {
      value: newCardKey,
      configurable: true,
    })
    newCardRef.cardIndex = newCardCount;
    this.willPushCard(newCardView, oldCardView);
    this.card = newCardRef;

    this.setFastener(newCardKey, newCardRef);
    newCardRef.setView(newCardView);
    newCardRef.insertView();

    if (timing === void 0 && oldCardCount === 0) {
      timing = false;
    } else if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, Mood.navigating, false);
    } else {
      timing = Timing.fromAny(timing);
    }

    this.deckPhase.setState(newCardCount, timing);
    this.onPushCard(newCardView, oldCardView);
    if (timing === false) {
      this.didPushCard(newCardView, oldCardView);
    }
  }

  protected willPushCard(newCardView: DeckCard, oldCardView: DeckCard | null): void {
    this.forEachObserver(function (observer: DeckViewObserver): void {
      if (observer.deckWillPushCard !== void 0) {
        observer.deckWillPushCard(newCardView, oldCardView, this);
      }
    });
  }

  protected onPushCard(newCardView: DeckCard, oldCardView: DeckCard | null): void {
    // hook
  }

  protected didPushCard(newCardView: DeckCard, oldCardView: DeckCard | null): void {
    if (oldCardView !== null && oldCardView.parent === this) {
      oldCardView.remove();
    }
    this.forEachObserver(function (observer: DeckViewObserver): void {
      if (observer.deckDidPushCard !== void 0) {
        observer.deckDidPushCard(newCardView, oldCardView, this);
      }
    });
  }

  popCard(timing?: AnyTiming | boolean): DeckCard | null {
    if (this.deckPhase.tweening) {
      return null;
    }

    const oldCardCount = this.cardCount;
    const newCardCount = oldCardCount - 1;
    this.cardCount = newCardCount;

    const oldCardKey = "card" + oldCardCount;
    const oldCardRef = this.getFastener(oldCardKey, ViewRef) as DeckViewCard<this, DeckCard> | null;
    const oldCardView = oldCardRef !== null ? oldCardRef.view : null;

    if (oldCardView !== null) {
      const newCardKey = "card" + newCardCount;
      const newCardRef = this.getFastener(newCardKey, ViewRef) as DeckViewCard<this, DeckCard> | null;
      const newCardView = newCardRef !== null ? newCardRef.view : null;
      this.willPopCard(newCardView, oldCardView);
      this.card = newCardRef;
      if (newCardRef !== null) {
        newCardRef.insertView();
      }

      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, Mood.navigating, false);
      } else {
        timing = Timing.fromAny(timing);
      }

      this.deckPhase.setState(newCardCount, timing);
      this.onPopCard(newCardView, oldCardView);
      if (timing === false) {
        this.didPopCard(newCardView, oldCardView);
      }
    }

    return oldCardView;
  }

  protected willPopCard(newCardView: DeckCard | null, oldCardView: DeckCard): void {
    this.forEachObserver(function (observer: DeckViewObserver): void {
      if (observer.deckWillPopCard !== void 0) {
        observer.deckWillPopCard(newCardView, oldCardView, this);
      }
    });
  }

  protected onPopCard(newCardView: DeckCard | null, oldCardView: DeckCard): void {
    // hook
  }

  protected didPopCard(newCardView: DeckCard | null, oldCardView: DeckCard): void {
    const oldCardKey = oldCardView.key;
    oldCardView.remove();
    if (oldCardKey !== void 0) {
      const oldCardRef = this.getFastener(oldCardKey, ViewRef) as DeckViewCard<this, DeckCard> | null;
      if (oldCardRef !== null && oldCardRef.cardIndex > this.cardCount) {
        this.setFastener(oldCardKey, null);
      }
    }
    this.forEachObserver(function (observer: DeckViewObserver): void {
      if (observer.deckDidPopCard !== void 0) {
        observer.deckDidPopCard(newCardView, oldCardView, this);
      }
    });
  }

  protected override didLayout(viewContext: ViewContextType<this>): void {
    if (!this.deckPhase.tweening) {
      const deckPhase = this.deckPhase.value;
      if (deckPhase !== void 0) {
        const nextCardIndex = Math.round(deckPhase + 1);
        const nextCardKey = "card" + nextCardIndex;
        const nextCardRef = this.getFastener(nextCardKey, ViewRef) as DeckViewCard<this, DeckCard> | null;
        const nextCardView = nextCardRef !== null ? nextCardRef.view : null;
        if (nextCardView !== null) {
          this.didPopCard(this.card !== null ? this.card.view : null, nextCardView);
        } else if (this.card !== null && this.card.view !== null && Math.round(deckPhase) > 0) {
          const prevCardIndex = Math.round(deckPhase - 1);
          const prevCardKey = "card" + prevCardIndex;
          const prevCardRef = this.getFastener(prevCardKey, ViewRef) as DeckViewCard<this, DeckCard> | null;
          const catdCardView = prevCardRef !== null ? prevCardRef.view : null;
          this.didPushCard(this.card.view, catdCardView);
        }
      }
    }
    super.didLayout(viewContext);
  }

  /** @internal */
  didPressBackButton(event: Event | null): void {
    this.forEachObserver(function (observer: DeckViewObserver): void {
      if (observer.deckDidPressBackButton !== void 0) {
        observer.deckDidPressBackButton(event, this);
      }
    });
  }

  /** @internal */
  didPressCloseButton(event: Event | null): void {
    this.forEachObserver(function (observer: DeckViewObserver): void {
      if (observer.deckDidPressCloseButton !== void 0) {
        observer.deckDidPressCloseButton(event, this);
      }
    });
  }
}

/** @internal */
export interface DeckViewBar<O extends DeckView = DeckView, V extends DeckBar = DeckBar> extends ViewRef<O, V> {
  /** @override */
  didAttachView(barView: V): void;

  /** @override */
  insertChild(parent: View, childView: V, targetView: View | null, key: string | undefined): void;

  viewDidResize(viewContext: ViewContext, barView: V): void;

  /** @protected */
  initBar(barView: V): void;

  /** @protected */
  resizeBar(barView: V): void;

  deckBarDidPressBackButton(event: Event | null, view: O): void;

  deckBarDidPressCloseButton(event: Event | null, view: O): void;
}
/** @internal */
export const DeckViewBar = (function (_super: typeof ViewRef) {
  const DeckViewBar = _super.extend("DeckSliderItem") as ViewRefFactory<DeckViewBar<any, any>>;

  DeckViewBar.prototype.didAttachView = function (this: DeckViewBar, barView: DeckBar): void {
    this.initBar(barView);
  };

  DeckViewBar.prototype.insertChild = function (this: DeckViewBar, parent: View, childView: DeckBar, targetView: View | null, key: string | undefined): void {
    parent.prependChild(childView, key);
  };

  DeckViewBar.prototype.viewDidResize = function (this: DeckViewBar, viewContext: ViewContext, barView: DeckBar): void {
    this.resizeBar(barView);
  };

  DeckViewBar.prototype.initBar = function (this: DeckViewBar, barView: DeckBar): void {
    let deckWidth = this.owner.width.state;
    deckWidth = deckWidth instanceof Length ? deckWidth : Length.px(this.owner.node.offsetWidth);
    barView.position.setState("absolute", Affinity.Intrinsic);
    barView.left.setState(0, Affinity.Intrinsic);
    barView.top.setState(0, Affinity.Intrinsic);
    barView.width.setState(deckWidth, Affinity.Intrinsic);
    barView.zIndex.setState(1, Affinity.Intrinsic);
  };

  DeckViewBar.prototype.resizeBar = function (this: DeckViewBar, barView: DeckBar): void {
    let deckWidth = this.owner.width.state;
    deckWidth = deckWidth instanceof Length ? deckWidth : Length.px(this.owner.node.offsetWidth);
    barView.width.setState(deckWidth, Affinity.Intrinsic);
  };

  DeckViewBar.prototype.deckBarDidPressBackButton = function (this: DeckViewBar, event: Event | null): void {
    this.owner.didPressBackButton(event);
  };

  DeckViewBar.prototype.deckBarDidPressCloseButton = function (this: DeckViewBar, event: Event | null): void {
    this.owner.didPressCloseButton(event);
  };

  return DeckViewBar;
})(ViewRef);
ViewRef({
  extends: DeckViewBar,
  key: true,
  type: DeckBar,
  binds: true,
  observes: true,
})(DeckView.prototype, "bar");

/** @internal */
export interface DeckViewCard<O extends DeckView = DeckView, V extends DeckCard = DeckCard> extends ViewRef<O, V> {
  cardIndex: number;

  /** @override */
  didAttachView(cardView: V): void;

  /** @override */
  insertChild(parent: View, childView: V, targetView: View | null, key: string | undefined): void;

  viewDidResize(viewContext: ViewContext, cardView: V): void;

  viewDidLayout(viewContext: ViewContext, cardView: V): void;

  /** @protected */
  initCard(cardView: V): void;

  /** @protected */
  resizeCard(cardView: V, viewContext: ViewContext): void;

  /** @protected */
  layoutCard(cardView: V, viewContext: ViewContext): void;
}
/** @internal */
export const DeckViewCard = (function (_super: typeof ViewRef) {
  const DeckViewCard = _super.extend("DeckSliderItem") as ViewRefFactory<DeckViewCard<any, any>>;

  DeckViewCard.prototype.didAttachView = function (this: DeckViewCard, cardView: DeckCard): void {
    this.initCard(cardView);
  };

  DeckViewCard.prototype.insertChild = function (this: DeckViewCard, parent: View, childView: DeckCard, targetView: View | null, key: string | undefined): void {
    const targetKey = "card" + (this.cardIndex + 1);
    targetView = parent.getChild(targetKey);
    parent.insertChild(childView, targetView, key);
  };

  DeckViewCard.prototype.viewDidResize = function (this: DeckViewCard, viewContext: ViewContext, cardView: DeckCard): void {
    this.resizeCard(cardView, viewContext);
  };

  DeckViewCard.prototype.viewDidLayout = function (this: DeckViewCard, viewContext: ViewContext, cardView: DeckCard): void {
    this.layoutCard(cardView, viewContext);
  };

  DeckViewCard.prototype.initCard = function (this: DeckViewCard, cardView: DeckCard): void {
    let edgeInsets = this.owner.edgeInsets.state;
    if (edgeInsets === void 0 && this.owner.edgeInsets.hasAffinity(Affinity.Intrinsic)) {
      edgeInsets = this.owner.viewport.safeArea;
    }

    let deckWidth = this.owner.width.state;
    deckWidth = deckWidth instanceof Length ? deckWidth : Length.px(this.owner.node.offsetWidth);
    let deckHeight = this.owner.height.state;
    deckHeight = deckHeight instanceof Length ? deckHeight : Length.px(this.owner.node.offsetHeight);

    let barHeight: Length | null = null;
    const barView = this.owner.bar.view;
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

    cardView.edgeInsets.setState(edgeInsets, Affinity.Intrinsic);
    cardView.position.setState("absolute", Affinity.Intrinsic);
    cardView.left.setState(deckWidth, Affinity.Intrinsic);
    cardView.top.setState(0, Affinity.Intrinsic);
    cardView.width.setState(deckWidth, Affinity.Intrinsic);
    cardView.height.setState(deckHeight, Affinity.Intrinsic);
    cardView.paddingTop.setState(barHeight, Affinity.Intrinsic);
    cardView.boxSizing.setState("border-box", Affinity.Intrinsic);
    cardView.zIndex.setState(0, Affinity.Intrinsic);
    cardView.visibility.setState("hidden", Affinity.Intrinsic);
  };

  DeckViewCard.prototype.resizeCard = function (this: DeckViewCard, cardView: DeckCard, viewContext: ViewContext): void {
    let edgeInsets = this.owner.edgeInsets.state;
    if (edgeInsets === void 0 && this.owner.edgeInsets.hasAffinity(Affinity.Intrinsic)) {
      edgeInsets = viewContext.viewport.safeArea;
    }

    let deckWidth = this.owner.width.state;
    deckWidth = deckWidth instanceof Length ? deckWidth : Length.px(this.owner.node.offsetWidth);
    let deckHeight = this.owner.height.state;
    deckHeight = deckHeight instanceof Length ? deckHeight : Length.px(this.owner.node.offsetHeight);

    let barHeight: Length | null = null;
    const barView = this.owner.bar.view;
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

    cardView.edgeInsets.setState(edgeInsets, Affinity.Intrinsic);
    cardView.width.setState(deckWidth, Affinity.Intrinsic);
    cardView.height.setState(deckHeight, Affinity.Intrinsic);
    cardView.paddingTop.setState(barHeight, Affinity.Intrinsic);
  };

  DeckViewCard.prototype.layoutCard = function (this: DeckViewCard, cardView: DeckCard, viewContext: ViewContext): void {
    let cardWidth = cardView.width.state;
    cardWidth = cardWidth instanceof Length ? cardWidth : Length.px(cardView.node.offsetWidth);

    const inAlign = this.owner.inAlign.state;
    const outAlign = this.owner.outAlign.state;
    const deckPhase = this.owner.deckPhase.getValue();
    const nextIndex = Math.max(this.owner.cardCount, Math.ceil(deckPhase));
    const prevIndex = nextIndex - 1;
    const cardPhase = deckPhase - prevIndex;

    const cardIndex = this.cardIndex;
    if (cardIndex < prevIndex || cardIndex === prevIndex && cardPhase === 1) { // under
      cardView.left.setState(-cardWidth.pxValue() * outAlign, Affinity.Intrinsic);
      cardView.visibility.setState("hidden", Affinity.Intrinsic);
      cardView.setCulled(true);
    } else if (cardIndex === prevIndex) { // out
      cardView.left.setState(-cardWidth.pxValue() * outAlign * cardPhase, Affinity.Intrinsic);
      cardView.visibility.setState(void 0, Affinity.Intrinsic);
      cardView.setCulled(false);
    } else if (cardIndex === nextIndex) { // in
      cardView.left.setState(cardWidth.pxValue() * inAlign * (1 - cardPhase), Affinity.Intrinsic);
      cardView.visibility.setState(void 0, Affinity.Intrinsic);
      cardView.setCulled(false);
    } else { // over
      cardView.left.setState(cardWidth.pxValue() * inAlign, Affinity.Intrinsic);
      cardView.visibility.setState("hidden", Affinity.Intrinsic);
      cardView.setCulled(true);
    }
  };

  DeckViewCard.construct = function <F extends DeckViewCard<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).cardIndex = 0;
    return fastener;
  };

  return DeckViewCard;
})(ViewRef);
/** @internal */
export const DeckViewCardRef = ViewRef.define<DeckView, DeckCard>("DeckViewCardRef", {
  extends: DeckViewCard,
  key: true,
  type: DeckCard,
  observes: true,
});
