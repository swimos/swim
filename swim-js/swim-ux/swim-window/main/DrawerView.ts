// Copyright 2015-2024 Nstream, inc.
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
import type {TimingLike} from "@swim/util";
import {Timing} from "@swim/util";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import {ConstraintProperty} from "@swim/constraint";
import {Length} from "@swim/math";
import {Presence} from "@swim/style";
import {PresenceAnimator} from "@swim/style";
import {Expansion} from "@swim/style";
import {ExpansionAnimator} from "@swim/style";
import {Look} from "@swim/theme";
import {Mood} from "@swim/theme";
import {ThemeConstraintAnimator} from "@swim/theme";
import type {ViewInsets} from "@swim/view";
import {View} from "@swim/view";
import type {HtmlViewObserver} from "@swim/dom";
import {HtmlView} from "@swim/dom";
import type {ModalViewObserver} from "@swim/dom";
import type {ModalView} from "@swim/dom";

/** @public */
export type DrawerPlacement = "top" | "right" | "bottom" | "left";

/** @public */
export interface DrawerViewObserver<V extends DrawerView = DrawerView> extends HtmlViewObserver<V>, ModalViewObserver<V> {
  viewDidSetPlacement?(placement: DrawerPlacement, view: V): void;

  viewDidSetEffectiveWidth?(effectiveWidth: Length | null, view: V): void;

  viewDidSetEffectiveHeight?(effectiveHeight: Length | null, view: V): void;

  viewWillPresent?(view: V): void;

  viewDidPresent?(view: V): void;

  viewWillDismiss?(view: V): void;

  viewDidDismiss?(view: V): void;

  viewWillExpand?(view: V): void;

  viewDidExpand?(view: V): void;

  viewWillCollapse?(view: V): void;

  viewDidCollapse?(view: V): void;
}

/** @public */
export class DrawerView extends HtmlView implements ModalView {
  constructor(node: HTMLElement) {
    super(node);
    this.initDrawer();
  }

  declare readonly observerType?: Class<DrawerViewObserver>;

  protected initDrawer(): void {
    this.setIntrinsic<DrawerView>({
      classList: ["drawer"],
      style: {
        display: "flex",
        overflowX: "hidden",
        overflowY: "auto",
        overscrollBehaviorY: "contain",
        overflowScrolling: "touch",
      },
    });
  }

  @ThemeConstraintAnimator({valueType: Length, value: Length.px(60)})
  readonly collapsedWidth!: ThemeConstraintAnimator<this, Length>;

  @ThemeConstraintAnimator({valueType: Length, value: Length.px(200)})
  readonly expandedWidth!: ThemeConstraintAnimator<this, Length>;

  @ConstraintProperty({
    valueType: Length,
    value: null,
    didSetValue(newValue: Length | null, oldValue: Length | null): void {
      this.owner.callObservers("viewDidSetEffectiveWidth", newValue, this.owner);
    },
    toNumber(value: Length | null): number {
      return value !== null ? value.pxValue() : 0;
    },
  })
  readonly effectiveWidth!: ConstraintProperty<this, Length | null>;

  @ConstraintProperty({
    valueType: Length,
    value: null,
    didSetValue(newValue: Length | null, oldValue: Length | null): void {
      this.owner.callObservers("viewDidSetEffectiveHeight", newValue, this.owner);
    },
    toNumber(value: Length | null): number {
      return value !== null ? value.pxValue() : 0;
    },
  })
  readonly effectiveHeight!: ConstraintProperty<this, Length | null>;

  isHorizontal(): boolean {
    return this.placement.value === "top" || this.placement.value === "bottom";
  }

  isVertical(): boolean {
    return this.placement.value === "left" || this.placement.value === "right";
  }

  @Property({
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
  @PresenceAnimator({
    value: Presence.presented(),
    updateFlags: View.NeedsLayout,
    get transition(): Timing | boolean | null {
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
  readonly presence!: PresenceAnimator<this, Presence>;

  @ExpansionAnimator({
    value: Expansion.expanded(),
    updateFlags: View.NeedsResize | View.NeedsLayout,
    get transition(): Timing | boolean | null {
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
  readonly stretch!: ExpansionAnimator<this, Expansion>;

  @Property({
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
  override get edgeInsets(): Property<this, ViewInsets> {
    return Property.getter();
  }

  protected override onLayout(): void {
    super.onLayout();
    this.style.display.setIntrinsic(!this.presence.dismissed ? "flex" : "none");
    this.layoutDrawer();

    if (this.viewIdiom === "mobile") {
      this.style.boxShadow.setIntrinsic(this.getLookOr(Look.shadow, Mood.floating, null));
    } else {
      this.style.boxShadow.setIntrinsic(this.getLookOr(Look.shadow, null));
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

    this.classList.add("drawer-top");
    this.classList.remove("drawer-right");
    this.classList.remove("drawer-bottom");
    this.classList.remove("drawer-left");

    this.style.setIntrinsic({
      position: "fixed",
      width: null,
      height: null,
      left: Length.zero(),
      right: Length.zero(),
      bottom: null,
    });

    const height = this.style.height.getCssValue();
    this.style.top.setIntrinsic(height.times(presencePhase - 1));

    this.effectiveWidth.setIntrinsic(this.style.width.value);
    this.effectiveHeight.setIntrinsic(height.times(presencePhase));

    if (this.stretch.collapsed) {
      this.expand();
    }
  }

  protected layoutDrawerRight(): void {
    const stretchPhase = this.stretch.getPhase();
    const presencePhase = this.presence.getPhase();

    this.classList.remove("drawer-top");
    this.classList.add("drawer-right");
    this.classList.remove("drawer-bottom");
    this.classList.remove("drawer-left");

    this.style.setIntrinsic({
      position: "fixed",
      height: null,
      top: Length.zero(),
      bottom: Length.zero(),
      left: null,
    });

    let width: Length | null;
    if (this.style.width.hasAffinity(Affinity.Intrinsic)) {
      const collapsedWidth = this.collapsedWidth.getValue();
      const expandedWidth = this.expandedWidth.getValue();
      width = collapsedWidth.times(1 - stretchPhase).plus(expandedWidth.times(stretchPhase));
    } else {
      width = this.style.width.getCssValue();
    }
    this.style.width.setIntrinsic(width);
    this.style.right.setIntrinsic(width.times(presencePhase - 1));

    this.effectiveWidth.setIntrinsic(width.times(presencePhase));
    this.effectiveHeight.setIntrinsic(this.style.height.value);
  }

  protected layoutDrawerBottom(): void {
    const presencePhase = this.presence.getPhase();

    this.classList.remove("drawer-top");
    this.classList.remove("drawer-right");
    this.classList.add("drawer-bottom");
    this.classList.remove("drawer-left");

    this.style.setIntrinsic({
      position: "fixed",
      width: null,
      height: null,
      left: Length.zero(),
      right: Length.zero(),
      top: null,
    });

    const height = this.style.height.getCssValue();
    this.style.bottom.setIntrinsic(height.times(presencePhase - 1));

    this.effectiveWidth.setIntrinsic(this.style.width.value);
    this.effectiveHeight.setIntrinsic(height.times(presencePhase));

    if (this.stretch.collapsed) {
      this.expand();
    }
  }

  protected layoutDrawerLeft(): void {
    const stretchPhase = this.stretch.getPhase();
    const presencePhase = this.presence.getPhase();

    this.classList.remove("drawer-top");
    this.classList.remove("drawer-right");
    this.classList.remove("drawer-bottom");
    this.classList.add("drawer-left");

    this.style.setIntrinsic({
      position: "fixed",
      height: null,
      top: Length.zero(),
      bottom: Length.zero(),
      right: null,
    });

    let width: Length | null;
    if (this.style.width.hasAffinity(Affinity.Intrinsic)) {
      const collapsedWidth = this.collapsedWidth.getValue();
      const expandedWidth = this.expandedWidth.getValue();
      width = collapsedWidth.times(1 - stretchPhase).plus(expandedWidth.times(stretchPhase));
    } else {
      width = this.style.width.getCssValue();
    }
    this.style.width.setIntrinsic(width);
    this.style.left.setIntrinsic(width.times(presencePhase - 1));

    this.effectiveWidth.setIntrinsic(width.times(presencePhase));
    this.effectiveHeight.setIntrinsic(this.style.height.value);
  }

  /** @override */
  @Property({
    valueType: Number,
    value: 0,
    didSetValue(modality: number): void {
      this.owner.callObservers("viewDidSetModality", modality, this.owner);
    },
  })
  readonly modality!: Property<this, number>;

  present(timing?: TimingLike | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromLike(timing);
    }
    this.presence.present(timing);
  }

  dismiss(timing?: TimingLike | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromLike(timing);
    }
    this.presence.dismiss(timing);
  }

  expand(timing?: TimingLike | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromLike(timing);
    }
    this.stretch.expand(timing);
  }

  collapse(timing?: TimingLike | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromLike(timing);
    }
    this.stretch.collapse(timing);
  }

  toggle(timing?: TimingLike | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromLike(timing);
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
}
