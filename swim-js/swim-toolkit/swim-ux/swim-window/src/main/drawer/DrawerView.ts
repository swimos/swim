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

import {Class, AnyTiming, Timing} from "@swim/util";
import {Affinity, Property} from "@swim/component";
import {ConstraintProperty} from "@swim/constraint";
import {AnyLength, Length} from "@swim/math";
import {
  AnyPresence,
  Presence,
  PresenceAnimator,
  AnyExpansion,
  Expansion,
  ExpansionAnimator,
} from "@swim/style";
import {Look, Mood, ThemeConstraintAnimator} from "@swim/theme";
import {ViewInsets, View} from "@swim/view";
import {HtmlViewInit, HtmlView, ModalView} from "@swim/dom";
import type {DrawerViewObserver} from "./DrawerViewObserver";

/** @public */
export type DrawerPlacement = "top" | "right" | "bottom" | "left";

/** @public */
export interface DrawerViewInit extends HtmlViewInit {
  placement?: DrawerPlacement;
  collapsedWidth?: AnyLength;
  expandedWidth?: AnyLength;
}

/** @public */
export class DrawerView extends HtmlView implements ModalView {
  constructor(node: HTMLElement) {
    super(node);
    this.initDrawer();
  }

  override readonly observerType?: Class<DrawerViewObserver>;

  protected initDrawer(): void {
    this.addClass("drawer");
    this.display.setState("flex", Affinity.Intrinsic);
    this.overflowX.setState("hidden", Affinity.Intrinsic);
    this.overflowY.setState("auto", Affinity.Intrinsic);
    this.overscrollBehaviorY.setState("contain", Affinity.Intrinsic);
    this.overflowScrolling.setState("touch", Affinity.Intrinsic);
  }

  @ThemeConstraintAnimator({valueType: Length, value: Length.px(60)})
  readonly collapsedWidth!: ThemeConstraintAnimator<this, Length, AnyLength>;

  @ThemeConstraintAnimator({valueType: Length, value: Length.px(200)})
  readonly expandedWidth!: ThemeConstraintAnimator<this, Length, AnyLength>;

  @ConstraintProperty<DrawerView["effectiveWidth"]>({
    valueType: Length,
    value: null,
    didSetValue(newValue: Length | null, oldValue: Length | null): void {
      this.owner.callObservers("viewDidSetEffectiveWidth", newValue, this.owner);
    },
    toNumber(value: Length | null): number {
      return value !== null ? value.pxValue() : 0;
    },
  })
  readonly effectiveWidth!: ConstraintProperty<this, Length | null, AnyLength | null>;

  @ConstraintProperty<DrawerView["effectiveHeight"]>({
    valueType: Length,
    value: null,
    didSetValue(newValue: Length | null, oldValue: Length | null): void {
      this.owner.callObservers("viewDidSetEffectiveHeight", newValue, this.owner);
    },
    toNumber(value: Length | null): number {
      return value !== null ? value.pxValue() : 0;
    },
  })
  readonly effectiveHeight!: ConstraintProperty<this, Length | null, AnyLength | null>;

  isHorizontal(): boolean {
    return this.placement.value === "top" || this.placement.value === "bottom";
  }

  isVertical(): boolean {
    return this.placement.value === "left" || this.placement.value === "right";
  }

  @Property<DrawerView["placement"]>({
    valueType: String,
    value: "left",
    updateFlags: View.NeedsResize | View.NeedsLayout,
    didSetValue(placement: DrawerPlacement): void {
      this.owner.callObservers("viewDidSetPlacement", placement, this.owner);
      this.owner.edgeInsets.decohereOutlets();
    },
  })
  readonly placement!: Property<this, DrawerPlacement>;

  /** @override */
  @PresenceAnimator<DrawerView["presence"]>({
    value: Presence.presented(),
    updateFlags: View.NeedsLayout,
    get transition(): Timing | null {
      return this.owner.getLookOr(Look.timing, null);
    },
    didSetValue(presence: Presence): void {
      this.owner.callObservers("viewDidSetPresence", presence, this.owner);
    },
    willPresent(): void {
      this.owner.callObservers("viewWillPresent", this.owner);
    },
    didPresent(): void {
      this.owner.callObservers("viewDidPresent", this.owner);
    },
    willDismiss(): void {
      this.owner.callObservers("viewWillDismiss", this.owner);
    },
    didDismiss(): void {
      this.owner.callObservers("viewDidDismiss", this.owner);
    },
  })
  readonly presence!: PresenceAnimator<this, Presence, AnyPresence>;

  @ExpansionAnimator<DrawerView["stretch"]>({
    value: Expansion.expanded(),
    updateFlags: View.NeedsResize | View.NeedsLayout,
    get transition(): Timing | null {
      return this.owner.getLookOr(Look.timing, null);
    },
    willExpand(): void {
      this.owner.modal.dismiss();
      this.owner.callObservers("viewWillExpand", this.owner);
    },
    didExpand(): void {
      this.owner.callObservers("viewDidExpand", this.owner);
    },
    willCollapse(): void {
      this.owner.modal.dismiss();
      this.owner.callObservers("viewWillCollapse", this.owner);
    },
    didCollapse(): void {
      this.owner.callObservers("viewDidCollapse", this.owner);
    },
  })
  readonly stretch!: ExpansionAnimator<this, Expansion, AnyExpansion>;

  @Property<DrawerView["edgeInsets"]>({
    extends: true,
    getOutletValue(outlet: Property<unknown, ViewInsets>): ViewInsets {
      let edgeInsets = this.value;
      let insetTop = edgeInsets.insetTop;
      let insetRight = edgeInsets.insetRight;
      let insetBottom = edgeInsets.insetBottom;
      let insetLeft = edgeInsets.insetLeft;
      const placement = this.owner.placement.value;
      if (placement === "top" && insetBottom !== 0) {
        insetBottom = 0;
        edgeInsets = {insetTop, insetRight, insetBottom, insetLeft};
      } else if (placement === "right" && insetLeft !== 0) {
        insetLeft = 0;
        edgeInsets = {insetTop, insetRight, insetBottom, insetLeft};
      } else if (placement === "bottom" && insetTop !== 0) {
        insetTop = 0;
        edgeInsets = {insetTop, insetRight, insetBottom, insetLeft};
      } else if (placement === "left" && insetRight !== 0) {
        insetRight = 0;
        edgeInsets = {insetTop, insetRight, insetBottom, insetLeft};
      }
      return edgeInsets;
    },
  })
  override readonly edgeInsets!: Property<this, ViewInsets>;

  protected override onLayout(): void {
    super.onLayout();
    this.display.setState(!this.presence.dismissed ? "flex" : "none", Affinity.Intrinsic);
    this.layoutDrawer();

    if (this.viewIdiom === "mobile") {
      this.boxShadow.setState(this.getLookOr(Look.shadow, Mood.floating, null), Affinity.Intrinsic);
    } else {
      this.boxShadow.setState(this.getLookOr(Look.shadow, null), Affinity.Intrinsic);
    }
  }

  protected layoutDrawer(): void {
    const placement = this.placement.value;
    if (placement === "top") {
      this.layoutDrawerTop();
    } else if (placement === "right") {
      this.layoutDrawerRight();
    } else if (placement === "bottom") {
      this.layoutDrawerBottom();
    } else if (placement === "left") {
      this.layoutDrawerLeft();
    }
  }

  protected layoutDrawerTop(): void {
    const presencePhase = this.presence.getPhase();

    this.addClass("drawer-top")
        .removeClass("drawer-right")
        .removeClass("drawer-bottom")
        .removeClass("drawer-left");

    this.position.setState("fixed", Affinity.Intrinsic);
    this.width.setState(null, Affinity.Intrinsic);
    this.height.setState(null, Affinity.Intrinsic);
    this.left.setState(Length.zero(), Affinity.Intrinsic);
    this.right.setState(Length.zero(), Affinity.Intrinsic);
    this.bottom.setState(null, Affinity.Intrinsic);

    let height: Length | null = this.height.value;
    if (height === null) {
      height = Length.px(this.node.offsetHeight);
    }
    this.top.setState(height.times(presencePhase - 1), Affinity.Intrinsic);

    this.effectiveWidth.setValue(this.width.value);
    this.effectiveHeight.setValue(height.times(presencePhase), Affinity.Intrinsic);

    if (this.stretch.collapsed) {
      this.expand();
    }
  }

  protected layoutDrawerRight(): void {
    const stretchPhase = this.stretch.getPhase();
    const presencePhase = this.presence.getPhase();

    this.removeClass("drawer-top")
        .addClass("drawer-right")
        .removeClass("drawer-bottom")
        .removeClass("drawer-left");

    this.position.setState("fixed", Affinity.Intrinsic);
    this.height.setState(null, Affinity.Intrinsic);
    this.top.setState(Length.zero(), Affinity.Intrinsic);
    this.bottom.setState(Length.zero(), Affinity.Intrinsic);
    this.left.setState(null, Affinity.Intrinsic);

    let width: Length | null;
    if (this.width.hasAffinity(Affinity.Intrinsic)) {
      const collapsedWidth = this.collapsedWidth.getValue();
      const expandedWidth = this.expandedWidth.getValue();
      width = collapsedWidth.times(1 - stretchPhase).plus(expandedWidth.times(stretchPhase));
    } else {
      width = this.width.value;
      if (width === null) {
        width = Length.px(this.node.offsetWidth);
      }
    }
    this.width.setState(width, Affinity.Intrinsic);
    this.right.setState(width.times(presencePhase - 1), Affinity.Intrinsic);

    this.effectiveWidth.setValue(width.times(presencePhase), Affinity.Intrinsic);
    this.effectiveHeight.setValue(this.height.value, Affinity.Intrinsic);
  }

  protected layoutDrawerBottom(): void {
    const presencePhase = this.presence.getPhase();

    this.removeClass("drawer-top")
        .removeClass("drawer-right")
        .addClass("drawer-bottom")
        .removeClass("drawer-left");

    this.position.setState("fixed", Affinity.Intrinsic);
    this.width.setState(null, Affinity.Intrinsic);
    this.height.setState(null, Affinity.Intrinsic);
    this.left.setState(Length.zero(), Affinity.Intrinsic);
    this.right.setState(Length.zero(), Affinity.Intrinsic);
    this.top.setState(null, Affinity.Intrinsic);

    let height: Length | null = this.height.value;
    if (height === null) {
      height = Length.px(this.node.offsetHeight);
    }
    this.bottom.setState(height.times(presencePhase - 1), Affinity.Intrinsic);

    this.effectiveWidth.setValue(this.width.value, Affinity.Intrinsic);
    this.effectiveHeight.setValue(height.times(presencePhase), Affinity.Intrinsic);

    if (this.stretch.collapsed) {
      this.expand();
    }
  }

  protected layoutDrawerLeft(): void {
    const stretchPhase = this.stretch.getPhase();
    const presencePhase = this.presence.getPhase();

    this.removeClass("drawer-top")
        .removeClass("drawer-right")
        .removeClass("drawer-bottom")
        .addClass("drawer-left");

    this.position.setState("fixed", Affinity.Intrinsic);
    this.height.setState(null, Affinity.Intrinsic);
    this.top.setState(Length.zero(), Affinity.Intrinsic);
    this.bottom.setState(Length.zero(), Affinity.Intrinsic);
    this.right.setState(null, Affinity.Intrinsic);

    let width: Length | null;
    if (this.width.hasAffinity(Affinity.Intrinsic)) {
      const collapsedWidth = this.collapsedWidth.getValue();
      const expandedWidth = this.expandedWidth.getValue();
      width = collapsedWidth.times(1 - stretchPhase).plus(expandedWidth.times(stretchPhase));
    } else {
      width = this.width.value;
      if (width === null) {
        width = Length.px(this.node.offsetWidth);
      }
    }
    this.width.setState(width, Affinity.Intrinsic);
    this.left.setState(width.times(presencePhase - 1), Affinity.Intrinsic);

    this.effectiveWidth.setValue(width.times(presencePhase), Affinity.Intrinsic);
    this.effectiveHeight.setValue(this.height.value, Affinity.Intrinsic);
  }

  /** @override */
  @Property<DrawerView["modality"]>({
    valueType: Number,
    value: 0,
    didSetValue(modality: number): void {
      this.owner.callObservers("viewDidSetModality", modality, this.owner);
    },
  })
  readonly modality!: Property<this, number>;

  present(timing?: AnyTiming | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromAny(timing);
    }
    this.presence.present(timing);
  }

  dismiss(timing?: AnyTiming | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromAny(timing);
    }
    this.presence.dismiss(timing);
  }

  expand(timing?: AnyTiming | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromAny(timing);
    }
    this.stretch.expand(timing);
  }

  collapse(timing?: AnyTiming | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromAny(timing);
    }
    this.stretch.collapse(timing);
  }

  toggle(timing?: AnyTiming | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromAny(timing);
    }
    if (this.viewIdiom === "mobile" || this.isHorizontal()) {
      if (this.presence.presented) {
        this.presence.dismiss(timing);
      } else {
        this.stretch.expand(timing);
        this.presence.present(timing);
        this.modal.present(this, {modal: true});
      }
    } else {
      this.stretch.toggle(timing);
      this.presence.present(timing);
    }
  }

  override init(init: DrawerViewInit): void {
    super.init(init);
    if (init.placement !== void 0) {
      this.placement(init.placement);
    }
    if (init.collapsedWidth !== void 0) {
      this.collapsedWidth(init.collapsedWidth);
    }
    if (init.expandedWidth !== void 0) {
      this.expandedWidth(init.expandedWidth);
    }
  }
}
