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

import {AnyTiming, Timing} from "@swim/util";
import {AnyLength, Length} from "@swim/math";
import type {Color} from "@swim/style";
import {Look, Mood, MoodVector, ThemeMatrix} from "@swim/theme";
import {ViewContextType, ViewContext, View, ViewProperty, ViewAnimator, ViewFastener} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {SvgIconView} from "@swim/graphics";
import {DeckSlot} from "./DeckSlot";
import type {DeckButtonObserver} from "./DeckButtonObserver";

export class DeckButton extends DeckSlot {
  constructor(node: HTMLElement) {
    super(node);
    this.labelCount = 0;
    this.label = null;
    this.initButton();
  }

  protected initButton(): void {
    this.addClass("deck-button");
    this.position.setState("relative", View.Intrinsic);
    this.userSelect.setState("none", View.Intrinsic);
    this.cursor.setState("pointer", View.Intrinsic);
  }

  override readonly viewObservers!: ReadonlyArray<DeckButtonObserver>;

  @ViewProperty({type: Length, state: Length.px(12)})
  readonly iconPadding!: ViewProperty<this, Length, AnyLength>;

  @ViewAnimator({type: Number, inherit: true, updateFlags: View.NeedsLayout})
  readonly deckPhase!: ViewAnimator<this, number | undefined>;

  @ViewAnimator({type: Number, state: 0})
  readonly slotAlign!: ViewAnimator<this, number>;

  override get colorLook(): Look<Color> {
    return Look.accentColor;
  }

  readonly closeIcon!: DeckButtonCloseIcon<this, SvgIconView>; // defined by DeckButtonCloseIcon

  readonly backIcon!: DeckButtonBackIcon<this, SvgIconView>; // defined by DeckButtonBackIcon

  /** @hidden */
  labelCount: number;

  label: DeckButtonLabel<this, HtmlView> | null;

  protected createLabel(value: string): HtmlView {
    const labelView = HtmlView.span.create();
    labelView.display.setState("flex", View.Intrinsic);
    labelView.alignItems.setState("center", View.Intrinsic);
    labelView.whiteSpace.setState("nowrap", View.Intrinsic);
    labelView.text(value);
    return labelView;
  }

  pushLabel(newLabelView: HtmlView | string, timing?: AnyTiming | boolean): void {
    if (typeof newLabelView === "string") {
      newLabelView = this.createLabel(newLabelView);
    }

    const oldLabelCount = this.labelCount;
    const newLabelCount = oldLabelCount + 1;
    this.labelCount = newLabelCount;

    const oldLabelKey = "label" + oldLabelCount;
    const oldLabelFastener = this.getViewFastener(oldLabelKey) as DeckButtonLabel<this, HtmlView> | null;
    const oldLabelView = oldLabelFastener !== null ? oldLabelFastener.view : null;

    const newLabelKey = "label" + newLabelCount;
    const newLabelFastener = new DeckButtonLabelFastener(this, newLabelKey, newLabelKey) as unknown as DeckButtonLabel<this, HtmlView>;
    newLabelFastener.labelIndex = newLabelCount;
    this.willPushLabel(newLabelView, oldLabelView);
    this.label = newLabelFastener;

    this.setViewFastener(newLabelKey, newLabelFastener);
    newLabelFastener.setView(newLabelView);
    newLabelFastener.injectView();

    if (timing === void 0 && oldLabelCount === 0) {
      timing = false;
    } else if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, Mood.navigating, false);
    } else {
      timing = Timing.fromAny(timing);
    }

    //if (this.deckPhase.superAnimator === null) {
    //  this.deckPhase.setState(newLabelCount, timing);
    //}
    if (timing === false) {
      this.didPushLabel(newLabelView, oldLabelView);
    }
  }

  protected willPushLabel(newLabelView: HtmlView, oldLabelView: HtmlView | null): void {
    this.willObserve(function (viewObserver: DeckButtonObserver): void {
      if (viewObserver.deckButtonWillPushLabel !== void 0) {
        viewObserver.deckButtonWillPushLabel(newLabelView, oldLabelView, this);
      }
    });
  }

  protected didPushLabel(newLabelView: HtmlView, oldLabelView: HtmlView | null): void {
    if (oldLabelView !== null && oldLabelView.parentView === this) {
      oldLabelView.remove();
    }
    this.didObserve(function (viewObserver: DeckButtonObserver): void {
      if (viewObserver.deckButtonDidPushLabel !== void 0) {
        viewObserver.deckButtonDidPushLabel(newLabelView, oldLabelView, this);
      }
    });
  }

  popLabel(timing?: AnyTiming | boolean): HtmlView | null {
    const oldLabelCount = this.labelCount;
    const newLabelCount = oldLabelCount - 1;
    this.labelCount = newLabelCount;

    const oldLabelKey = "label" + oldLabelCount;
    const oldLabelFastener = this.getViewFastener(oldLabelKey) as DeckButtonLabel<this, HtmlView> | null;
    const oldLabelView = oldLabelFastener !== null ? oldLabelFastener.view : null;

    if (oldLabelView !== null) {
      const newLabelKey = "label" + newLabelCount;
      const newLabelFastener = this.getViewFastener(newLabelKey) as DeckButtonLabel<this, HtmlView> | null;
      const newLabelView = newLabelFastener !== null ? newLabelFastener.view : null;
      this.willPopLabel(newLabelView, oldLabelView);
      this.label = newLabelFastener;
      if (newLabelFastener !== null) {
        newLabelFastener.injectView();
      }

      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, Mood.navigating, false);
      } else {
        timing = Timing.fromAny(timing);
      }

      //if (this.deckPhase.superAnimator === null) {
      //  this.deckPhase.setState(newLabelCount, timing);
      //}
      if (timing === false) {
        this.didPopLabel(newLabelView, oldLabelView);
      }
    }

    return oldLabelView;
  }

  protected willPopLabel(newLabelView: HtmlView | null, oldLabelView: HtmlView): void {
    this.willObserve(function (viewObserver: DeckButtonObserver): void {
      if (viewObserver.deckButtonWillPopLabel !== void 0) {
        viewObserver.deckButtonWillPopLabel(newLabelView, oldLabelView, this);
      }
    });
  }

  protected didPopLabel(newLabelView: HtmlView | null, oldLabelView: HtmlView): void {
    const oldLabelKey = oldLabelView.key;
    oldLabelView.remove();
    if (oldLabelKey !== void 0) {
      const oldLabelFastener = this.getViewFastener(oldLabelKey) as DeckButtonLabel<this, HtmlView> | null;
      if (oldLabelFastener !== null && oldLabelFastener.labelIndex > this.labelCount) {
        this.setViewFastener(oldLabelKey, null);
      }
    }
    this.didObserve(function (viewObserver: DeckButtonObserver): void {
      if (viewObserver.deckButtonDidPopLabel !== void 0) {
        viewObserver.deckButtonDidPopLabel(newLabelView, oldLabelView, this);
      }
    });
  }

  protected override didLayout(viewContext: ViewContextType<this>): void {
    if (!this.deckPhase.isAnimating()) {
      const deckPhase = this.deckPhase.takeUpdatedValue();
      if (deckPhase !== void 0) {
        const nextLabelIndex = Math.round(deckPhase + 1);
        const nextLabelKey = "label" + nextLabelIndex;
        const nextLabelFastener = this.getViewFastener(nextLabelKey) as DeckButtonLabel<this, HtmlView> | null;
        const nextLabelView = nextLabelFastener !== null ? nextLabelFastener.view : null;
        if (nextLabelView !== null) {
          this.didPopLabel(this.label !== null ? this.label.view : null, nextLabelView);
        } else if (this.label !== null && this.label.view !== null && Math.round(deckPhase) > 0) {
          const prevLabelIndex = Math.round(deckPhase - 1);
          const prevLabelKey = "label" + prevLabelIndex;
          const prevLabelFastener = this.getViewFastener(prevLabelKey) as DeckButtonLabel<this, HtmlView> | null;
          const prevLabelView = prevLabelFastener !== null ? prevLabelFastener.view : null;
          this.didPushLabel(this.label.view, prevLabelView);
        }
      }
    }
    super.didLayout(viewContext);
  }
}

/** @hidden */
export abstract class DeckButtonCloseIcon<V extends DeckButton, S extends SvgIconView> extends ViewFastener<V, S> {
  override onSetView(iconView: S | null): void {
    if (iconView !== null) {
      this.initIcon(iconView);
    }
  }

  override insertView(parentView: View, childView: S, targetView: View | null, key: string | undefined): void {
    parentView.prependChildView(childView, key);
  }

  viewDidLayout(viewContext: ViewContext, iconView: S): void {
    this.layoutIcon(iconView);
  }

  protected initIcon(iconView: S): void {
    iconView.addClass("close-icon");
    iconView.setStyle("position", "absolute");
    iconView.pointerEvents.setState("none", View.Intrinsic);
  }

  protected layoutIcon(iconView: S): void {
    const slotAlign = this.owner.slotAlign.getValue();
    let slotWidth: Length | number | null = this.owner.width.state;
    slotWidth = slotWidth instanceof Length ? slotWidth.pxValue() : this.owner.node.offsetWidth;
    let slotHeight: Length | number | null = this.owner.height.state;
    slotHeight = slotHeight instanceof Length ? slotHeight.pxValue() : this.owner.node.offsetHeight;

    const iconPadding = this.owner.iconPadding.getState().pxValue(slotWidth);
    let iconWidth: Length | number | null = iconView.width.state;
    iconWidth = iconWidth instanceof Length ? iconWidth.pxValue() : 0;
    let iconHeight: Length | number | null = iconView.height.state;
    iconHeight = iconHeight instanceof Length ? iconHeight.pxValue() : 0;

    const deckPhase = this.owner.deckPhase.getValueOr(0);
    const iconPhase = Math.min(Math.max(0, deckPhase - 1), 1);
    const slotSpace = slotWidth - iconWidth - iconPadding;
    const iconLeft = iconPadding + slotSpace * slotAlign;
    const iconTop = (slotHeight - iconHeight) / 2;
    iconView.setStyle("left", iconLeft + "px");
    iconView.setStyle("top", iconTop + "px");
    iconView.viewBox.setState("0 0 " + iconWidth + " " + iconHeight, View.Intrinsic);
    iconView.opacity.setState(1 - iconPhase, View.Intrinsic);
  }
}
ViewFastener({
  extends: DeckButtonCloseIcon,
  key: true,
  type: SvgIconView,
  observe: true,
})(DeckButton.prototype, "closeIcon");

/** @hidden */
export abstract class DeckButtonBackIcon<V extends DeckButton, S extends SvgIconView> extends ViewFastener<V, S> {
  override onSetView(iconView: S | null): void {
    if (iconView !== null) {
      this.initIcon(iconView);
    }
  }

  override insertView(parentView: View, childView: S, targetView: View | null, key: string | undefined): void {
    parentView.prependChildView(childView, key);
  }

  viewDidLayout(viewContext: ViewContext, iconView: S): void {
    this.layoutIcon(iconView);
  }

  protected initIcon(iconView: S): void {
    iconView.addClass("back-icon");
    iconView.setStyle("position", "absolute");
    iconView.pointerEvents.setState("none", View.Intrinsic);
  }

  protected layoutIcon(iconView: S): void {
    const slotAlign = this.owner.slotAlign.getValue();
    let slotWidth: Length | number | null = this.owner.width.state;
    slotWidth = slotWidth instanceof Length ? slotWidth.pxValue() : this.owner.node.offsetWidth;
    let slotHeight: Length | number | null = this.owner.height.state;
    slotHeight = slotHeight instanceof Length ? slotHeight.pxValue() : this.owner.node.offsetHeight;

    const iconPadding = this.owner.iconPadding.getState().pxValue(slotWidth);
    let iconWidth: Length | number | null = iconView.width.state;
    iconWidth = iconWidth instanceof Length ? iconWidth.pxValue() : 0;
    let iconHeight: Length | number | null = iconView.height.state;
    iconHeight = iconHeight instanceof Length ? iconHeight.pxValue() : 0;

    const deckPhase = this.owner.deckPhase.getValueOr(0);
    const nextIndex = Math.max(this.owner.labelCount, Math.ceil(deckPhase));
    const labelKey = "label" + nextIndex;
    const labelView = this.owner.getChildView(labelKey) as HtmlView | null;
    const slotSpace = slotWidth - iconWidth - iconPadding;
    let iconLeft = iconPadding + slotSpace * slotAlign;
    const iconTop = (slotHeight - iconHeight) / 2;
    let iconOpacity: number | undefined;
    if (deckPhase <= 1) {
      iconOpacity = 0;
      iconView.iconColor.setState(null, View.Intrinsic);
    } else if (labelView !== null && deckPhase < 2) {
      const parentView = this.owner.parentView;
      const nextPost = this.owner.nextPost.state;
      const nextSlot = parentView !== null && nextPost !== null ? parentView.getChildView(nextPost.key) : null;
      let nextSlotAlign: number;
      let nextSlotWidth: Length | number | null;
      if (nextSlot instanceof DeckSlot) {
        nextSlotAlign = nextSlot.slotAlign.value;
        nextSlotWidth = nextSlot.width.state;
        nextSlotWidth = nextSlotWidth instanceof Length ? nextSlotWidth.pxValue() : nextSlot.node.offsetWidth;
        let nextSlotLeft: Length | number | null = nextSlot.left.state;
        nextSlotLeft = nextSlotLeft instanceof Length ? nextSlotLeft.pxValue() : nextSlot.node.offsetLeft;
        let slotLeft: Length | number | null = this.owner.left.state;
        slotLeft = slotLeft instanceof Length ? slotLeft.pxValue() : this.owner.node.offsetLeft;
        const slotGap = nextSlotLeft - (slotLeft + slotWidth);
        nextSlotWidth += slotGap;
      } else {
        nextSlotAlign = 0;
        nextSlotWidth = 0;
      }
      const prevIndex = nextIndex - 1;
      const labelPhase = deckPhase - prevIndex;
      let labelWidth: Length | number | null = labelView.width.state;
      if (labelWidth instanceof Length) {
        labelWidth = labelWidth.pxValue(slotWidth);
      } else {
        labelWidth = labelView.node.offsetWidth;
      }
      const labelSlotSpace = slotWidth - iconLeft - iconWidth + (nextSlotWidth - labelWidth) * nextSlotAlign;
      iconLeft += (labelSlotSpace * (1 - labelPhase) + labelSlotSpace * slotAlign * labelPhase);
      iconOpacity = labelPhase;
      const nextColor = nextSlot instanceof DeckSlot ? nextSlot.getLookOr(nextSlot.colorLook, null) : null;
      const thisColor = this.owner.getLookOr(this.owner.colorLook, null);
      if (nextColor !== null && thisColor !== null) {
        iconView.iconColor.setState(nextColor.interpolateTo(thisColor)(labelPhase), View.Intrinsic);
      } else {
        iconView.iconColor.setState(thisColor, View.Intrinsic);
      }
    }
    iconView.setStyle("left", iconLeft + "px");
    iconView.setStyle("top", iconTop + "px");
    iconView.viewBox.setState("0 0 " + iconWidth + " " + iconHeight, View.Intrinsic);
    iconView.opacity.setState(iconOpacity, View.Intrinsic);
  }
}
ViewFastener({
  extends: DeckButtonBackIcon,
  key: true,
  type: SvgIconView,
  observe: true,
})(DeckButton.prototype, "backIcon");

/** @hidden */
export abstract class DeckButtonLabel<V extends DeckButton, S extends HtmlView> extends ViewFastener<V, S> {
  constructor(owner: V, key: string | undefined, fastenerName: string | undefined) {
    super(owner, key, fastenerName);
    this.labelIndex = 0;
    this.labelWidth = null;
    this.layoutWidth = 0;
  }

  labelIndex: number;

  /** @hidden */
  labelWidth: Length | string | null;

  /** @hidden */
  layoutWidth: number;

  override onSetView(labelView: S | null): void {
    if (labelView !== null) {
      this.initLabel(labelView);
    }
  }

  override insertView(parentView: View, childView: S, targetView: View | null, key: string | undefined): void {
    const targetKey = "label" + (this.labelIndex + 1);
    targetView = parentView.getChildView(targetKey);
    parentView.insertChildView(childView, targetView, key);
  }

  protected viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, labelView: S): void {
    if (labelView.color.takesPrecedence(View.Intrinsic)) {
      labelView.color.setState(theme.getOr(this.owner.colorLook, mood, null), timing, View.Intrinsic);
    }
  }

  viewDidLayout(viewContext: ViewContext, labelView: S): void {
    this.layoutLabel(labelView);
  }

  protected initLabel(labelView: S): void {
    labelView.position.setState("absolute", View.Intrinsic);
    labelView.pointerEvents.setState("none", View.Intrinsic);
  }

  protected layoutLabel(labelView: S): void {
    const labelIndex = this.labelIndex;
    const slotAlign = this.owner.slotAlign.getValue();
    let slotWidth: Length | number | null = this.owner.width.state;
    slotWidth = slotWidth instanceof Length ? slotWidth.pxValue() : this.owner.node.offsetWidth;
    let slotHeight: Length | number | null = this.owner.height.state;
    slotHeight = slotHeight instanceof Length ? slotHeight.pxValue() : this.owner.node.offsetHeight;

    const parentView = this.owner.parentView;
    const nextPost = this.owner.nextPost.state;
    const nextSlot = parentView !== null && nextPost !== null ? parentView.getChildView(nextPost.key) : null;
    let nextSlotAlign: number;
    let nextSlotWidth: Length | number | null;
    if (nextSlot instanceof DeckSlot) {
      nextSlotAlign = nextSlot.slotAlign.value;
      nextSlotWidth = nextSlot.width.state;
      nextSlotWidth = nextSlotWidth instanceof Length ? nextSlotWidth.pxValue() : nextSlot.node.offsetWidth;
      let nextSlotLeft: Length | number | null = nextSlot.left.state;
      nextSlotLeft = nextSlotLeft instanceof Length ? nextSlotLeft.pxValue() : nextSlot.node.offsetLeft;
      let slotLeft: Length | number | null = this.owner.left.state;
      slotLeft = slotLeft instanceof Length ? slotLeft.pxValue() : this.owner.node.offsetLeft;
      const slotGap = nextSlotLeft - (slotLeft + slotWidth);
      nextSlotWidth += slotGap;
    } else {
      nextSlotAlign = 0;
      nextSlotWidth = 0;
    }

    const iconPadding = this.owner.iconPadding.getState().pxValue(slotWidth);
    let iconWidth: Length | number | null;
    let iconHeight: Length | number | null;
    const iconView = this.owner.backIcon.view;
    if (iconView !== null) {
      iconWidth = iconView.width.state;
      iconWidth = iconWidth instanceof Length ? iconWidth.pxValue() : 0;
      iconHeight = iconView.height.state;
      iconHeight = iconHeight instanceof Length ? iconHeight.pxValue() : 0;
    } else {
      iconWidth = 0;
      iconHeight = 0;
    }

    const deckPhase = this.owner.deckPhase.getValueOr(0);
    const nextIndex = Math.max(this.owner.labelCount, Math.ceil(deckPhase));
    const prevIndex = nextIndex - 1;
    const labelPhase = deckPhase - prevIndex;
    let labelWidth: Length | number | null = labelView.width.state;
    this.labelWidth = labelWidth;
    if (labelWidth instanceof Length) {
      labelWidth = labelWidth.pxValue(slotWidth);
    } else {
      labelWidth = labelView.node.offsetWidth;
      // Memoize computed label width while animating
      // to avoid style recalculation in animation frames.
      if (this.owner.deckPhase.isAnimating()) {
        labelView.width.setState(labelWidth, View.Intrinsic);
      } else {
        labelView.width.setState(this.labelWidth, View.Intrinsic);
      }
    }

    const slotSpace = slotWidth - iconWidth - iconPadding;
    const iconLeft = iconPadding + slotSpace * slotAlign;
    const iconTop = (slotHeight - iconHeight) / 2;
    const labelSlotSpace = slotWidth - iconLeft - iconWidth + (nextSlotWidth - labelWidth) * nextSlotAlign;
    if (labelIndex < prevIndex || labelIndex === prevIndex && labelPhase === 1) { // under
      labelView.left.setState(iconLeft + iconWidth, View.Intrinsic);
      labelView.top.setState(iconTop, View.Intrinsic);
      labelView.height.setState(iconHeight, View.Intrinsic);
      labelView.opacity.setState(0, View.Intrinsic);
      labelView.setCulled(true);
    } else if (labelIndex === prevIndex) { // out
      labelView.left.setState(iconLeft + iconWidth + (labelSlotSpace * slotAlign * (1 - labelPhase)), View.Intrinsic);
      labelView.top.setState(iconTop, View.Intrinsic);
      labelView.height.setState(iconHeight, View.Intrinsic);
      labelView.opacity.setState(1 - labelPhase, View.Intrinsic);
      labelView.setCulled(false);
    } else if (labelIndex === nextIndex) { // in
      labelView.left.setState(iconLeft + iconWidth + (labelSlotSpace * (1 - labelPhase) + labelSlotSpace * slotAlign * labelPhase), View.Intrinsic);
      labelView.top.setState(iconTop, View.Intrinsic);
      labelView.height.setState(iconHeight, View.Intrinsic);
      const nextColor = nextSlot instanceof DeckSlot ? nextSlot.getLookOr(nextSlot.colorLook, null) : null;
      const thisColor = this.owner.getLookOr(this.owner.colorLook, null);
      if (nextColor !== null && thisColor !== null) {
        labelView.color.setState(nextColor.interpolateTo(thisColor)(labelPhase), View.Intrinsic);
      } else {
        labelView.color.setState(thisColor, View.Intrinsic);
      }
      labelView.opacity.setState(1, View.Intrinsic);
      labelView.setCulled(false);
    } else { // over
      labelView.left.setState(iconLeft + iconWidth + labelSlotSpace, View.Intrinsic);
      labelView.top.setState(iconTop, View.Intrinsic);
      labelView.height.setState(iconHeight, View.Intrinsic);
      labelView.opacity.setState(0, View.Intrinsic);
      labelView.setCulled(true);
    }
    this.layoutWidth = iconLeft + iconWidth + labelWidth + iconPadding;
  }
}

/** @hidden */
export const DeckButtonLabelFastener = ViewFastener.define<DeckButton, HtmlView>({
  extends: DeckButtonLabel,
  type: HtmlView,
  child: false,
  observe: true,
});
