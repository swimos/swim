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

import {Mutable, Class, AnyTiming, Timing} from "@swim/util";
import {Affinity, FastenerOwner, Property} from "@swim/component";
import {AnyLength, Length} from "@swim/math";
import type {Color} from "@swim/style";
import {Look, Mood, MoodVector, ThemeMatrix, ThemeAnimator} from "@swim/theme";
import {ViewContextType, ViewContext, View, ViewRefFactory, ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {SvgIconView} from "@swim/graphics";
import {DeckSlot} from "./DeckSlot";
import type {DeckButtonObserver} from "./DeckButtonObserver";

/** @public */
export class DeckButton extends DeckSlot {
  constructor(node: HTMLElement) {
    super(node);
    this.labelCount = 0;
    this.label = null;
    this.initButton();
  }

  protected initButton(): void {
    this.addClass("deck-button");
    this.position.setState("relative", Affinity.Intrinsic);
    this.userSelect.setState("none", Affinity.Intrinsic);
    this.cursor.setState("pointer", Affinity.Intrinsic);
  }

  override readonly observerType?: Class<DeckButtonObserver>;

  @Property({type: Length, value: Length.px(12)})
  readonly iconPadding!: Property<this, Length, AnyLength>;

  @ThemeAnimator({type: Number, inherits: true, updateFlags: View.NeedsLayout})
  readonly deckPhase!: ThemeAnimator<this, number | undefined>;

  @ThemeAnimator({type: Number, value: 0})
  readonly slotAlign!: ThemeAnimator<this, number>;

  override get colorLook(): Look<Color> {
    return Look.accentColor;
  }

  /** @internal */
  readonly closeIcon!: DeckButtonCloseIcon<this, SvgIconView>; // defined by DeckButtonCloseIcon

  /** @internal */
  readonly backIcon!: DeckButtonBackIcon<this, SvgIconView>; // defined by DeckButtonBackIcon

  /** @internal */
  labelCount: number;

  /** @internal */
  label: DeckButtonLabel<this, HtmlView> | null;

  protected createLabel(value: string): HtmlView {
    const labelView = HtmlView.fromTag("span");
    labelView.display.setState("flex", Affinity.Intrinsic);
    labelView.alignItems.setState("center", Affinity.Intrinsic);
    labelView.whiteSpace.setState("nowrap", Affinity.Intrinsic);
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
    const oldLabelRef = this.getFastener(oldLabelKey, ViewRef) as DeckButtonLabel<this, HtmlView> | null;
    const oldLabelView = oldLabelRef !== null ? oldLabelRef.view : null;

    const newLabelKey = "label" + newLabelCount;
    const newLabelRef = DeckButtonLabelRef.create(this) as DeckButtonLabel<this, HtmlView>;
    Object.defineProperty(newLabelRef, "name", {
      value: newLabelKey,
      configurable: true,
    })
    newLabelRef.labelIndex = newLabelCount;
    this.willPushLabel(newLabelView, oldLabelView);
    this.label = newLabelRef;

    this.setFastener(newLabelKey, newLabelRef);
    newLabelRef.setView(newLabelView);
    newLabelRef.insertView();

    if (timing === void 0 && oldLabelCount === 0) {
      timing = false;
    } else if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, Mood.navigating, false);
    } else {
      timing = Timing.fromAny(timing);
    }

    //if (this.deckPhase.superFastener === null) {
    //  this.deckPhase.setState(newLabelCount, timing);
    //}
    if (timing === false) {
      this.didPushLabel(newLabelView, oldLabelView);
    }
  }

  protected willPushLabel(newLabelView: HtmlView, oldLabelView: HtmlView | null): void {
    this.forEachObserver(function (observer: DeckButtonObserver): void {
      if (observer.deckButtonWillPushLabel !== void 0) {
        observer.deckButtonWillPushLabel(newLabelView, oldLabelView, this);
      }
    });
  }

  protected didPushLabel(newLabelView: HtmlView, oldLabelView: HtmlView | null): void {
    if (oldLabelView !== null && oldLabelView.parent === this) {
      oldLabelView.remove();
    }
    this.forEachObserver(function (observer: DeckButtonObserver): void {
      if (observer.deckButtonDidPushLabel !== void 0) {
        observer.deckButtonDidPushLabel(newLabelView, oldLabelView, this);
      }
    });
  }

  popLabel(timing?: AnyTiming | boolean): HtmlView | null {
    const oldLabelCount = this.labelCount;
    const newLabelCount = oldLabelCount - 1;
    this.labelCount = newLabelCount;

    const oldLabelKey = "label" + oldLabelCount;
    const oldLabelRef = this.getFastener(oldLabelKey, ViewRef) as DeckButtonLabel<this, HtmlView> | null;
    const oldLabelView = oldLabelRef !== null ? oldLabelRef.view : null;

    if (oldLabelView !== null) {
      const newLabelKey = "label" + newLabelCount;
      const newLabelRef = this.getFastener(newLabelKey, ViewRef) as DeckButtonLabel<this, HtmlView> | null;
      const newLabelView = newLabelRef !== null ? newLabelRef.view : null;
      this.willPopLabel(newLabelView, oldLabelView);
      this.label = newLabelRef;
      if (newLabelRef !== null) {
        newLabelRef.insertView();
      }

      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, Mood.navigating, false);
      } else {
        timing = Timing.fromAny(timing);
      }

      //if (this.deckPhase.superFastener === null) {
      //  this.deckPhase.setState(newLabelCount, timing);
      //}
      if (timing === false) {
        this.didPopLabel(newLabelView, oldLabelView);
      }
    }

    return oldLabelView;
  }

  protected willPopLabel(newLabelView: HtmlView | null, oldLabelView: HtmlView): void {
    this.forEachObserver(function (observer: DeckButtonObserver): void {
      if (observer.deckButtonWillPopLabel !== void 0) {
        observer.deckButtonWillPopLabel(newLabelView, oldLabelView, this);
      }
    });
  }

  protected didPopLabel(newLabelView: HtmlView | null, oldLabelView: HtmlView): void {
    const oldLabelKey = oldLabelView.key;
    oldLabelView.remove();
    if (oldLabelKey !== void 0) {
      const oldLabelRef = this.getFastener(oldLabelKey, ViewRef) as DeckButtonLabel<this, HtmlView> | null;
      if (oldLabelRef !== null && oldLabelRef.labelIndex > this.labelCount) {
        this.setFastener(oldLabelKey, null);
      }
    }
    this.forEachObserver(function (observer: DeckButtonObserver): void {
      if (observer.deckButtonDidPopLabel !== void 0) {
        observer.deckButtonDidPopLabel(newLabelView, oldLabelView, this);
      }
    });
  }

  protected override didLayout(viewContext: ViewContextType<this>): void {
    if (!this.deckPhase.tweening) {
      const deckPhase = this.deckPhase.value;
      if (deckPhase !== void 0) {
        const nextLabelIndex = Math.round(deckPhase + 1);
        const nextLabelKey = "label" + nextLabelIndex;
        const nextLabelRef = this.getFastener(nextLabelKey, ViewRef) as DeckButtonLabel<this, HtmlView> | null;
        const nextLabelView = nextLabelRef !== null ? nextLabelRef.view : null;
        if (nextLabelView !== null) {
          this.didPopLabel(this.label !== null ? this.label.view : null, nextLabelView);
        } else if (this.label !== null && this.label.view !== null && Math.round(deckPhase) > 0) {
          const prevLabelIndex = Math.round(deckPhase - 1);
          const prevLabelKey = "label" + prevLabelIndex;
          const prevLabelRef = this.getFastener(prevLabelKey, ViewRef) as DeckButtonLabel<this, HtmlView> | null;
          const prevLabelView = prevLabelRef !== null ? prevLabelRef.view : null;
          this.didPushLabel(this.label.view, prevLabelView);
        }
      }
    }
    super.didLayout(viewContext);
  }
}

/** @internal */
export interface DeckButtonCloseIcon<O extends DeckButton = DeckButton, V extends SvgIconView = SvgIconView> extends ViewRef<O, V> {
  /** @override */
  didAttachView(iconView: V): void;

  /** @override */
  insertChild(parent: View, child: V, target: View | number | null, key: string | undefined): void;

  viewDidLayout(viewContext: ViewContext, iconView: V): void;

  /** @protected */
  initIcon(iconView: V): void;

  /** @protected */
  layoutIcon(iconView: V): void;
}
/** @internal */
export const DeckButtonCloseIcon = (function (_super: typeof ViewRef) {
  const DeckButtonCloseIcon = _super.extend("DeckButtonCloseIcon") as ViewRefFactory<DeckButtonCloseIcon<any, any>>;

  DeckButtonCloseIcon.prototype.didAttachView = function (this: DeckButtonCloseIcon, iconView: SvgIconView): void {
    this.initIcon(iconView);
  };

  DeckButtonCloseIcon.prototype.insertChild = function (this: DeckButtonCloseIcon, parent: View, child: SvgIconView, target: View | number | null, key: string | undefined): void {
    parent.prependChild(child, key);
  };

  DeckButtonCloseIcon.prototype.viewDidLayout = function (this: DeckButtonCloseIcon, viewContext: ViewContext, iconView: SvgIconView): void {
    this.layoutIcon(iconView);
  };

  DeckButtonCloseIcon.prototype.initIcon = function (this: DeckButtonCloseIcon, iconView: SvgIconView): void {
    iconView.addClass("close-icon");
    iconView.setStyle("position", "absolute");
    iconView.pointerEvents.setState("none", Affinity.Intrinsic);
  };

  DeckButtonCloseIcon.prototype.layoutIcon = function (this: DeckButtonCloseIcon, iconView: SvgIconView): void {
    const slotAlign = this.owner.slotAlign.getValue();
    let slotWidth: Length | number | null = this.owner.width.state;
    slotWidth = slotWidth instanceof Length ? slotWidth.pxValue() : this.owner.node.offsetWidth;
    let slotHeight: Length | number | null = this.owner.height.state;
    slotHeight = slotHeight instanceof Length ? slotHeight.pxValue() : this.owner.node.offsetHeight;

    const iconPadding = this.owner.iconPadding.getValue().pxValue(slotWidth);
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
    iconView.viewBox.setState("0 0 " + iconWidth + " " + iconHeight, Affinity.Intrinsic);
    iconView.opacity.setState(1 - iconPhase, Affinity.Intrinsic);
  };

  return DeckButtonCloseIcon;
})(ViewRef);
ViewRef({
  extends: DeckButtonCloseIcon,
  key: true,
  type: SvgIconView,
  observes: true,
})(DeckButton.prototype, "closeIcon");

/** @internal */
export interface DeckButtonBackIcon<O extends DeckButton = DeckButton, V extends SvgIconView = SvgIconView> extends ViewRef<O, V> {
  /** @override */
  didAttachView(iconView: V): void;

  /** @override */
  insertChild(parent: View, child: V, target: View | number | null, key: string | undefined): void;

  viewDidLayout(viewContext: ViewContext, iconView: V): void;

  /** @protected */
  initIcon(iconView: V): void;

  /** @protected */
  layoutIcon(iconView: V): void;
}
/** @internal */
export const DeckButtonBackIcon = (function (_super: typeof ViewRef) {
  const DeckButtonBackIcon = _super.extend("DeckButtonBackIcon") as ViewRefFactory<DeckButtonBackIcon<any, any>>;

  DeckButtonBackIcon.prototype.didAttachView = function (this: DeckButtonBackIcon, iconView: SvgIconView): void {
    this.initIcon(iconView);
  };

  DeckButtonBackIcon.prototype.insertChild = function (this: DeckButtonBackIcon, parent: View, child: SvgIconView, target: View | number | null, key: string | undefined): void {
    parent.prependChild(child, key);
  };

  DeckButtonBackIcon.prototype.viewDidLayout = function (this: DeckButtonBackIcon, viewContext: ViewContext, iconView: SvgIconView): void {
    this.layoutIcon(iconView);
  };

  DeckButtonBackIcon.prototype.initIcon = function (this: DeckButtonBackIcon, iconView: SvgIconView): void {
    iconView.addClass("back-icon");
    iconView.setStyle("position", "absolute");
    iconView.pointerEvents.setState("none", Affinity.Intrinsic);
  };

  DeckButtonBackIcon.prototype.layoutIcon = function (this: DeckButtonBackIcon, iconView: SvgIconView): void {
    const slotAlign = this.owner.slotAlign.getValue();
    let slotWidth: Length | number | null = this.owner.width.state;
    slotWidth = slotWidth instanceof Length ? slotWidth.pxValue() : this.owner.node.offsetWidth;
    let slotHeight: Length | number | null = this.owner.height.state;
    slotHeight = slotHeight instanceof Length ? slotHeight.pxValue() : this.owner.node.offsetHeight;

    const iconPadding = this.owner.iconPadding.getValue().pxValue(slotWidth);
    let iconWidth: Length | number | null = iconView.width.state;
    iconWidth = iconWidth instanceof Length ? iconWidth.pxValue() : 0;
    let iconHeight: Length | number | null = iconView.height.state;
    iconHeight = iconHeight instanceof Length ? iconHeight.pxValue() : 0;

    const deckPhase = this.owner.deckPhase.getValueOr(0);
    const nextIndex = Math.max(this.owner.labelCount, Math.ceil(deckPhase));
    const labelKey = "label" + nextIndex;
    const labelView = this.owner.getChild(labelKey) as HtmlView | null;
    const slotSpace = slotWidth - iconWidth - iconPadding;
    let iconLeft = iconPadding + slotSpace * slotAlign;
    const iconTop = (slotHeight - iconHeight) / 2;
    let iconOpacity: number | undefined;
    if (deckPhase <= 1) {
      iconOpacity = 0;
      iconView.iconColor.setState(null, Affinity.Intrinsic);
    } else if (labelView !== null && deckPhase < 2) {
      const parent = this.owner.parent;
      const nextPost = this.owner.nextPost.value;
      const nextSlot = parent !== null && nextPost !== null ? parent.getChild(nextPost.key) : null;
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
        iconView.iconColor.setState(nextColor.interpolateTo(thisColor)(labelPhase), Affinity.Intrinsic);
      } else {
        iconView.iconColor.setState(thisColor, Affinity.Intrinsic);
      }
    }
    iconView.setStyle("left", iconLeft + "px");
    iconView.setStyle("top", iconTop + "px");
    iconView.viewBox.setState("0 0 " + iconWidth + " " + iconHeight, Affinity.Intrinsic);
    iconView.opacity.setState(iconOpacity, Affinity.Intrinsic);
  };

  return DeckButtonBackIcon;
})(ViewRef);
ViewRef({
  extends: DeckButtonBackIcon,
  key: true,
  type: SvgIconView,
  observes: true,
})(DeckButton.prototype, "backIcon");

/** @internal */
export interface DeckButtonLabel<O extends DeckButton = DeckButton, V extends HtmlView = HtmlView> extends ViewRef<O, V> {
  labelIndex: number;

  /** @internal */
  labelWidth: Length | string | null;

  /** @internal */
  layoutWidth: number;

  /** @override */
  didAttachView(labelView: V): void;

  /** @override */
  insertChild(parent: View, child: V, target: View | number | null, key: string | undefined): void;

  /** @protected */
  viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, labelView: V): void;

  viewDidLayout(viewContext: ViewContext, labelView: V): void;

  /** @protected */
  initLabel(labelView: V): void;

  /** @protected */
  layoutLabel(labelView: V): void;
}
/** @internal */
export const DeckButtonLabel = (function (_super: typeof ViewRef) {
  const DeckButtonLabel = _super.extend("DeckButtonLabel") as ViewRefFactory<DeckButtonLabel<any, any>>;

  DeckButtonLabel.prototype.didAttachView = function (this: DeckButtonLabel, labelView: HtmlView): void {
    this.initLabel(labelView);
  };

  DeckButtonLabel.prototype.insertChild = function (this: DeckButtonLabel, parent: View, child: HtmlView, target: View | number | null, key: string | undefined): void {
    const targetKey = "label" + (this.labelIndex + 1);
    target = parent.getChild(targetKey);
    parent.insertChild(child, target, key);
  };

  DeckButtonLabel.prototype.viewDidApplyTheme = function (this: DeckButtonLabel, theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, labelView: HtmlView): void {
    if (labelView.color.hasAffinity(Affinity.Intrinsic)) {
      labelView.color.setState(theme.getOr(this.owner.colorLook, mood, null), timing, Affinity.Intrinsic);
    }
  };

  DeckButtonLabel.prototype.viewDidLayout = function (this: DeckButtonLabel, viewContext: ViewContext, labelView: HtmlView): void {
    this.layoutLabel(labelView);
  };

  DeckButtonLabel.prototype.initLabel = function (this: DeckButtonLabel, labelView: HtmlView): void {
    labelView.position.setState("absolute", Affinity.Intrinsic);
    labelView.pointerEvents.setState("none", Affinity.Intrinsic);
  };

  DeckButtonLabel.prototype.layoutLabel = function (this: DeckButtonLabel, labelView: HtmlView): void {
    const labelIndex = this.labelIndex;
    const slotAlign = this.owner.slotAlign.getValue();
    let slotWidth: Length | number | null = this.owner.width.state;
    slotWidth = slotWidth instanceof Length ? slotWidth.pxValue() : this.owner.node.offsetWidth;
    let slotHeight: Length | number | null = this.owner.height.state;
    slotHeight = slotHeight instanceof Length ? slotHeight.pxValue() : this.owner.node.offsetHeight;

    const parent = this.owner.parent;
    const nextPost = this.owner.nextPost.value;
    const nextSlot = parent !== null && nextPost !== null ? parent.getChild(nextPost.key) : null;
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

    const iconPadding = this.owner.iconPadding.getValue().pxValue(slotWidth);
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
      if (this.owner.deckPhase.tweening) {
        labelView.width.setState(labelWidth, Affinity.Intrinsic);
      } else {
        labelView.width.setState(this.labelWidth, Affinity.Intrinsic);
      }
    }

    const slotSpace = slotWidth - iconWidth - iconPadding;
    const iconLeft = iconPadding + slotSpace * slotAlign;
    const iconTop = (slotHeight - iconHeight) / 2;
    const labelSlotSpace = slotWidth - iconLeft - iconWidth + (nextSlotWidth - labelWidth) * nextSlotAlign;
    if (labelIndex < prevIndex || labelIndex === prevIndex && labelPhase === 1) { // under
      labelView.left.setState(iconLeft + iconWidth, Affinity.Intrinsic);
      labelView.top.setState(iconTop, Affinity.Intrinsic);
      labelView.height.setState(iconHeight, Affinity.Intrinsic);
      labelView.opacity.setState(0, Affinity.Intrinsic);
      labelView.setCulled(true);
    } else if (labelIndex === prevIndex) { // out
      labelView.left.setState(iconLeft + iconWidth + (labelSlotSpace * slotAlign * (1 - labelPhase)), Affinity.Intrinsic);
      labelView.top.setState(iconTop, Affinity.Intrinsic);
      labelView.height.setState(iconHeight, Affinity.Intrinsic);
      labelView.opacity.setState(1 - labelPhase, Affinity.Intrinsic);
      labelView.setCulled(false);
    } else if (labelIndex === nextIndex) { // in
      labelView.left.setState(iconLeft + iconWidth + (labelSlotSpace * (1 - labelPhase) + labelSlotSpace * slotAlign * labelPhase), Affinity.Intrinsic);
      labelView.top.setState(iconTop, Affinity.Intrinsic);
      labelView.height.setState(iconHeight, Affinity.Intrinsic);
      const nextColor = nextSlot instanceof DeckSlot ? nextSlot.getLookOr(nextSlot.colorLook, null) : null;
      const thisColor = this.owner.getLookOr(this.owner.colorLook, null);
      if (nextColor !== null && thisColor !== null) {
        labelView.color.setState(nextColor.interpolateTo(thisColor)(labelPhase), Affinity.Intrinsic);
      } else {
        labelView.color.setState(thisColor, Affinity.Intrinsic);
      }
      labelView.opacity.setState(1, Affinity.Intrinsic);
      labelView.setCulled(false);
    } else { // over
      labelView.left.setState(iconLeft + iconWidth + labelSlotSpace, Affinity.Intrinsic);
      labelView.top.setState(iconTop, Affinity.Intrinsic);
      labelView.height.setState(iconHeight, Affinity.Intrinsic);
      labelView.opacity.setState(0, Affinity.Intrinsic);
      labelView.setCulled(true);
    }
    this.layoutWidth = iconLeft + iconWidth + labelWidth + iconPadding;
  };

  DeckButtonLabel.construct = function <F extends DeckButtonLabel<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).labelIndex = 0;
    (fastener as Mutable<typeof fastener>).labelWidth = null;
    (fastener as Mutable<typeof fastener>).layoutWidth = 0;
    return fastener;
  };

  return DeckButtonLabel;
})(ViewRef);
/** @internal */
export const DeckButtonLabelRef = ViewRef.define<DeckButton, HtmlView>("DeckButtonLabelRef", {
  extends: DeckButtonLabel,
  key: true,
  type: HtmlView,
  observes: true,
});
