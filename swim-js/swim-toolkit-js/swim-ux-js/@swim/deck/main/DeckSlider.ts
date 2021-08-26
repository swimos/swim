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

import {AnyTiming, Timing} from "@swim/mapping";
import {Length} from "@swim/math";
import type {Color} from "@swim/style";
import {Look, Mood, MoodVector, ThemeMatrix} from "@swim/theme";
import {ViewContextType, ViewContext, View, ViewAnimator, ViewFastener} from "@swim/view";
import {HtmlView, HtmlViewController} from "@swim/dom";
import {DeckSlot} from "./DeckSlot";
import type {DeckSliderObserver} from "./DeckSliderObserver";

export class DeckSlider extends DeckSlot {
  constructor(node: HTMLElement) {
    super(node);
    this.itemCount = 0;
    this.item = null;
    this.initSlider();
  }

  initSlider(): void {
    this.addClass("deck-slider");
    this.position.setState("relative", View.Intrinsic);
  }

  override readonly viewController!: HtmlViewController & DeckSliderObserver | null;

  override readonly viewObservers!: ReadonlyArray<DeckSliderObserver>;

  @ViewAnimator({type: Number, inherit: true, updateFlags: View.NeedsLayout})
  override readonly deckPhase!: ViewAnimator<this, number | undefined>;

  @ViewAnimator({type: Number, state: 0.5})
  override readonly slotAlign!: ViewAnimator<this, number>;

  override get colorLook(): Look<Color> {
    return Look.color;
  }

  /** @hidden */
  itemCount: number;

  item: DeckSliderItem<this, HtmlView> | null;

  protected createItem(value: string): HtmlView {
    const itemView = HtmlView.span.create();
    itemView.display.setState("flex", View.Intrinsic);
    itemView.alignItems.setState("center", View.Intrinsic);
    itemView.whiteSpace.setState("nowrap", View.Intrinsic);
    itemView.text(value);
    return itemView;
  }

  pushItem(newItemView: HtmlView | string, timing?: AnyTiming | boolean): void {
    if (typeof newItemView === "string") {
      newItemView = this.createItem(newItemView);
    }

    const oldItemCount = this.itemCount;
    const newItemCount = oldItemCount + 1;
    this.itemCount = newItemCount;

    const oldItemKey = "item" + oldItemCount;
    const oldItemFastener = this.getViewFastener(oldItemKey) as DeckSliderItem<this, HtmlView> | null;
    const oldItemView = oldItemFastener !== null ? oldItemFastener.view : null;

    const newItemKey = "item" + newItemCount;
    const newItemFastener = new DeckSliderItemFastener(this, newItemKey, newItemKey) as unknown as DeckSliderItem<this, HtmlView>;
    newItemFastener.itemIndex = newItemCount;
    this.willPushItem(newItemView, oldItemView);
    this.item = newItemFastener;

    this.setViewFastener(newItemKey, newItemFastener);
    newItemFastener.setView(newItemView);
    newItemFastener.injectView();

    if (timing === void 0 && oldItemCount === 0) {
      timing = false;
    } else if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, Mood.navigating, false);
    } else {
      timing = Timing.fromAny(timing);
    }

    //if (this.deckPhase.superAnimator === null) {
    //  this.deckPhase.setState(newItemCount, timing);
    //}
    if (timing === false) {
      this.didPushItem(newItemView, oldItemView);
    }
  }

  protected willPushItem(newItemView: HtmlView, oldItemView: HtmlView | null): void {
    this.willObserve(function (viewObserver: DeckSliderObserver): void {
      if (viewObserver.deckSliderWillPushItem !== void 0) {
        viewObserver.deckSliderWillPushItem(newItemView, oldItemView, this);
      }
    });
  }

  protected didPushItem(newItemView: HtmlView, oldItemView: HtmlView | null): void {
    if (oldItemView !== null && oldItemView.parentView === this) {
      oldItemView.remove();
    }
    this.didObserve(function (viewObserver: DeckSliderObserver): void {
      if (viewObserver.deckSliderDidPushItem !== void 0) {
        viewObserver.deckSliderDidPushItem(newItemView, oldItemView, this);
      }
    });
  }

  popItem(timing?: AnyTiming | boolean): HtmlView | null {
    const oldItemCount = this.itemCount;
    const newItemCount = oldItemCount - 1;
    this.itemCount = newItemCount;

    const oldItemKey = "item" + oldItemCount;
    const oldItemFastener = this.getViewFastener(oldItemKey) as DeckSliderItem<this, HtmlView> | null;
    const oldItemView = oldItemFastener !== null ? oldItemFastener.view : null;

    if (oldItemView !== null) {
      const newItemKey = "item" + newItemCount;
      const newItemFastener = this.getViewFastener(newItemKey) as DeckSliderItem<this, HtmlView> | null;
      const newItemView = newItemFastener !== null ? newItemFastener.view : null;
      this.willPopItem(newItemView, oldItemView);
      this.item = newItemFastener;
      if (newItemFastener !== null) {
        newItemFastener.injectView();
      }

      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, Mood.navigating, false);
      } else {
        timing = Timing.fromAny(timing);
      }

      //if (this.deckPhase.superAnimator === null) {
      //  this.deckPhase.setState(newItemCount, timing);
      //}
      if (timing === false) {
        this.didPopItem(newItemView, oldItemView);
      }
    }

    return oldItemView;
  }

  protected willPopItem(newItemView: HtmlView | null, oldItemView: HtmlView): void {
    this.willObserve(function (viewObserver: DeckSliderObserver): void {
      if (viewObserver.deckSliderWillPopItem !== void 0) {
        viewObserver.deckSliderWillPopItem(newItemView, oldItemView, this);
      }
    });
  }

  protected didPopItem(newItemView: HtmlView | null, oldItemView: HtmlView): void {
    const oldItemKey = oldItemView.key;
    oldItemView.remove();
    if (oldItemKey !== void 0) {
      const oldItemFastener = this.getViewFastener(oldItemKey) as DeckSliderItem<this, HtmlView> | null;
      if (oldItemFastener !== null && oldItemFastener.itemIndex > this.itemCount) {
        this.setViewFastener(oldItemKey, null);
      }
    }
    this.didObserve(function (viewObserver: DeckSliderObserver): void {
      if (viewObserver.deckSliderDidPopItem !== void 0) {
        viewObserver.deckSliderDidPopItem(newItemView, oldItemView, this);
      }
    });
  }

  protected override didLayout(viewContext: ViewContextType<this>): void {
    if (!this.deckPhase.isAnimating()) {
      const deckPhase = this.deckPhase.takeUpdatedValue();
      if (deckPhase !== void 0) {
        const nextItemIndex = Math.round(deckPhase + 1);
        const nextItemKey = "item" + nextItemIndex;
        const nextItemFastener = this.getViewFastener(nextItemKey) as DeckSliderItem<this, HtmlView> | null;
        const nextItemView = nextItemFastener !== null ? nextItemFastener.view : null;
        if (nextItemView !== null) {
          this.didPopItem(this.item !== null ? this.item.view : null, nextItemView);
        } else if (this.item !== null && this.item.view !== null && Math.round(deckPhase) > 0) {
          const prevItemIndex = Math.round(deckPhase - 1);
          const prevItemKey = "item" + prevItemIndex;
          const prevItemFastener = this.getViewFastener(prevItemKey) as DeckSliderItem<this, HtmlView> | null;
          const prevItemView = prevItemFastener !== null ? prevItemFastener.view : null;
          this.didPushItem(this.item.view, prevItemView);
        }
      }
    }
    super.didLayout(viewContext);
  }
}

/** @hidden */
export abstract class DeckSliderItem<V extends DeckSlider, S extends HtmlView> extends ViewFastener<V, S> {
  constructor(owner: V, key: string | undefined, fastenerName: string | undefined) {
    super(owner, key, fastenerName);
    this.itemIndex = 0;
    this.itemWidth = null;
  }

  itemIndex: number;

  /** @hidden */
  itemWidth: Length | string | null;

  override onSetView(itemView: S | null): void {
    if (itemView !== null) {
      this.initItem(itemView);
    }
  }

  override insertView(parentView: View, childView: S, targetView: View | null, key: string | undefined): void {
    const targetKey = "item" + (this.itemIndex + 1);
    targetView = parentView.getChildView(targetKey);
    parentView.insertChildView(childView, targetView, key);
  }

  protected viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, itemView: S): void {
    if (itemView.color.takesPrecedence(View.Intrinsic)) {
      itemView.color.setState(theme.getOr(this.owner.colorLook, mood, null), timing, View.Intrinsic);
    }
  }

  viewDidLayout(viewContext: ViewContext, itemView: S): void {
    this.layoutItem(itemView);
  }

  protected initItem(itemView: S): void {
    itemView.position.setState("absolute", View.Intrinsic);
  }

  protected layoutItem(itemView: S): void {
    const itemIndex = this.itemIndex;
    const slotAlign = this.owner.slotAlign.getValue();
    let slotWidth: Length | number | null = this.owner.width.state;
    slotWidth = slotWidth instanceof Length ? slotWidth.pxValue() : this.owner.node.offsetWidth;
    let slotHeight: Length | number | null = this.owner.height.state;
    slotHeight = slotHeight instanceof Length ? slotHeight.pxValue() : this.owner.node.offsetHeight;
    const deckPhase = this.owner.deckPhase.getValueOr(0);
    const nextIndex = Math.max(this.owner.itemCount, Math.ceil(deckPhase));
    const prevIndex = nextIndex - 1;
    const itemPhase = deckPhase - prevIndex;

    let itemWidth: Length | number | null = itemView.width.state;
    this.itemWidth = itemWidth;
    if (itemWidth instanceof Length) {
      itemWidth = itemWidth.pxValue(slotWidth);
    } else {
      itemWidth = itemView.node.offsetWidth;
      // Memoize computed item width while animating
      // to avoid style recalculation in animation frames.
      if (this.owner.deckPhase.isAnimating()) {
        itemView.width.setState(itemWidth, View.Intrinsic);
      } else {
        itemView.width.setState(this.itemWidth, View.Intrinsic);
      }
    }

    const slotSpace = slotWidth - itemWidth;
    if (itemIndex < prevIndex || itemIndex === prevIndex && itemPhase === 1) { // under
      itemView.left.setState(0, View.Intrinsic);
      itemView.top.setState(0, View.Intrinsic);
      itemView.height.setState(slotHeight, View.Intrinsic);
      itemView.opacity.setState(0, View.Intrinsic);
      itemView.setCulled(true);
    } else if (itemIndex === prevIndex) { // out
      itemView.left.setState(slotSpace * slotAlign * (1 - itemPhase), View.Intrinsic);
      itemView.top.setState(0, View.Intrinsic);
      itemView.height.setState(slotHeight, View.Intrinsic);
      itemView.opacity.setState(1 - itemPhase, View.Intrinsic);
      itemView.setCulled(false);
    } else if (itemIndex === nextIndex) { // in
      itemView.left.setState(slotSpace * (1 - itemPhase) + slotSpace * slotAlign * itemPhase, View.Intrinsic);
      itemView.top.setState(0, View.Intrinsic);
      itemView.height.setState(slotHeight, View.Intrinsic);
      itemView.opacity.setState(itemPhase, View.Intrinsic);
      itemView.setCulled(false);
    } else { // over
      itemView.left.setState(slotSpace, View.Intrinsic);
      itemView.top.setState(0, View.Intrinsic);
      itemView.height.setState(slotHeight, View.Intrinsic);
      itemView.opacity.setState(0, View.Intrinsic);
      itemView.setCulled(true);
    }
  }
}

/** @hidden */
export const DeckSliderItemFastener = ViewFastener.define<DeckSlider, HtmlView>({
  extends: DeckSliderItem,
  type: HtmlView,
  child: false,
  observe: true,
});
