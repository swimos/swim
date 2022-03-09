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

import {Mutable, Class, AnyTiming, Timing} from "@swim/util";
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
import {
  ViewportInsets,
  ViewContextType,
  View,
  ModalOptions,
  ModalState,
  Modal,
} from "@swim/view";
import {HtmlViewInit, HtmlView} from "@swim/dom";
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
export class DrawerView extends HtmlView implements Modal {
  constructor(node: HTMLElement) {
    super(node);
    this.modality = true;
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

  @ThemeConstraintAnimator({type: Length, value: Length.px(60)})
  readonly collapsedWidth!: ThemeConstraintAnimator<this, Length, AnyLength>;

  @ThemeConstraintAnimator({type: Length, value: Length.px(200)})
  readonly expandedWidth!: ThemeConstraintAnimator<this, Length, AnyLength>;

  @ConstraintProperty<DrawerView, Length | null, AnyLength | null>({
    type: Length,
    value: null,
    toNumber(value: Length | null): number {
      return value !== null ? value.pxValue() : 0;
    },
  })
  readonly effectiveWidth!: ConstraintProperty<this, Length | null, AnyLength | null>;

  @ConstraintProperty<DrawerView, Length | null, AnyLength | null>({
    type: Length,
    value: null,
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

  @Property<DrawerView, DrawerPlacement>({
    type: String,
    value: "left",
    updateFlags: View.NeedsResize | View.NeedsLayout,
    willSetValue(newPlacement: DrawerPlacement, oldPlacement: DrawerPlacement): void {
      this.owner.callObservers("viewWillSetPlacement", newPlacement, oldPlacement, this.owner);
    },
    didSetValue(newPlacement: DrawerPlacement, oldPlacement: DrawerPlacement): void {
      this.owner.callObservers("viewDidSetPlacement", newPlacement, oldPlacement, this.owner);
    },
  })
  readonly placement!: Property<this, DrawerPlacement>;

  @PresenceAnimator<DrawerView, Presence, AnyPresence>({
    type: Presence,
    value: Presence.presented(),
    updateFlags: View.NeedsLayout,
    get transition(): Timing | null {
      return this.owner.getLookOr(Look.timing, null);
    },
    willPresent(): void {
      this.owner.callObservers("viewWillPresent", this.owner);
    },
    didPresent(): void {
      this.owner.callObservers("viewDidPresent", this.owner);
    },
    willDismiss(): void {
      const modalService = this.owner.modalProvider.service;
      if (modalService !== void 0 && modalService !== null) {
        modalService.dismissModal(this.owner);
      }
      this.owner.callObservers("viewWillDismiss", this.owner);
    },
    didDismiss(): void {
      this.owner.callObservers("viewDidDismiss", this.owner);
    },
  })
  readonly slide!: PresenceAnimator<this, Presence, AnyPresence>;

  @ExpansionAnimator<DrawerView, Expansion, AnyExpansion>({
    type: Expansion,
    value: Expansion.expanded(),
    updateFlags: View.NeedsResize | View.NeedsLayout,
    get transition(): Timing | null {
      return this.owner.getLookOr(Look.timing, null);
    },
    willExpand(): void {
      const modalService = this.owner.modalProvider.service;
      if (modalService !== void 0 && modalService !== null) {
        modalService.dismissModal(this.owner);
      }
      this.owner.callObservers("viewWillExpand", this.owner);
    },
    didExpand(): void {
      this.owner.callObservers("viewDidExpand", this.owner);
    },
    willCollapse(): void {
      const modalService = this.owner.modalProvider.service;
      if (modalService !== void 0 && modalService !== null) {
        modalService.dismissModal(this.owner);
      }
      this.owner.callObservers("viewWillCollapse", this.owner);
    },
    didCollapse(): void {
      this.owner.callObservers("viewDidCollapse", this.owner);
    },
  })
  readonly stretch!: ExpansionAnimator<this, Expansion, AnyExpansion>;

  @Property({type: Object, inherits: true, value: null})
  readonly edgeInsets!: Property<this, ViewportInsets | null>;

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.display.setState(!this.slide.dismissed ? "flex" : "none", Affinity.Intrinsic);
    this.layoutDrawer(viewContext);

    if (viewContext.viewportIdiom === "mobile") {
      this.boxShadow.setState(this.getLookOr(Look.shadow, Mood.floating, null), Affinity.Intrinsic);
    } else {
      this.boxShadow.setState(this.getLookOr(Look.shadow, null), Affinity.Intrinsic);
    }
  }

  protected layoutDrawer(viewContext: ViewContextType<this>): void {
    const placement = this.placement.value;
    if (placement === "top") {
      this.layoutDrawerTop(viewContext);
    } else if (placement === "right") {
      this.layoutDrawerRight(viewContext);
    } else if (placement === "bottom") {
      this.layoutDrawerBottom(viewContext);
    } else if (placement === "left") {
      this.layoutDrawerLeft(viewContext);
    }
  }

  protected layoutDrawerTop(viewContext: ViewContextType<this>): void {
    const slidePhase = this.slide.getPhase();

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
    this.top.setState(height.times(slidePhase - 1), Affinity.Intrinsic);

    this.effectiveWidth.setValue(this.width.value);
    this.effectiveHeight.setValue(height.times(slidePhase), Affinity.Intrinsic);

    let edgeInsets = this.edgeInsets.superValue;
    if (edgeInsets === void 0 || edgeInsets === null) {
      edgeInsets = viewContext.viewport.safeArea;
    }
    this.edgeInsets.setValue({
      insetTop: 0,
      insetRight: edgeInsets.insetRight,
      insetBottom: 0,
      insetLeft: edgeInsets.insetLeft,
    }, Affinity.Intrinsic);

    if (this.stretch.collapsed) {
      this.expand();
    }
  }

  protected layoutDrawerRight(viewContext: ViewContextType<this>): void {
    const stretchPhase = this.stretch.getPhase();
    const slidePhase = this.slide.getPhase();

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
    this.right.setState(width.times(slidePhase - 1), Affinity.Intrinsic);

    this.effectiveWidth.setValue(width.times(slidePhase), Affinity.Intrinsic);
    this.effectiveHeight.setValue(this.height.value, Affinity.Intrinsic);

    let edgeInsets = this.edgeInsets.superValue;
    if ((edgeInsets === void 0 || edgeInsets === null) || edgeInsets === null) {
      edgeInsets = viewContext.viewport.safeArea;
    }
    this.paddingTop.setState(Length.px(edgeInsets.insetTop), Affinity.Intrinsic);
    this.paddingBottom.setState(Length.px(edgeInsets.insetBottom), Affinity.Intrinsic);
    this.edgeInsets.setValue({
      insetTop: 0,
      insetRight: edgeInsets.insetRight,
      insetBottom: 0,
      insetLeft: 0,
    }, Affinity.Intrinsic);
  }

  protected layoutDrawerBottom(viewContext: ViewContextType<this>): void {
    const slidePhase = this.slide.getPhase();

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
    this.bottom.setState(height.times(slidePhase - 1), Affinity.Intrinsic);

    this.effectiveWidth.setValue(this.width.value, Affinity.Intrinsic);
    this.effectiveHeight.setValue(height.times(slidePhase), Affinity.Intrinsic);

    let edgeInsets = this.edgeInsets.superValue;
    if ((edgeInsets === void 0 || edgeInsets === null) || edgeInsets === null) {
      edgeInsets = viewContext.viewport.safeArea;
    }
    this.edgeInsets.setValue({
      insetTop: 0,
      insetRight: edgeInsets.insetRight,
      insetBottom: 0,
      insetLeft: edgeInsets.insetLeft,
    }, Affinity.Intrinsic);

    if (this.stretch.collapsed) {
      this.expand();
    }
  }

  protected layoutDrawerLeft(viewContext: ViewContextType<this>): void {
    const stretchPhase = this.stretch.getPhase();
    const slidePhase = this.slide.getPhase();

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
    this.left.setState(width.times(slidePhase - 1), Affinity.Intrinsic);

    this.effectiveWidth.setValue(width.times(slidePhase), Affinity.Intrinsic);
    this.effectiveHeight.setValue(this.height.value, Affinity.Intrinsic);

    let edgeInsets = this.edgeInsets.superValue;
    if ((edgeInsets === void 0 || edgeInsets === null) || edgeInsets === null) {
      edgeInsets = viewContext.viewport.safeArea;
    }
    this.paddingTop.setState(Length.px(edgeInsets.insetTop), Affinity.Intrinsic);
    this.paddingBottom.setState(Length.px(edgeInsets.insetBottom), Affinity.Intrinsic);
    this.edgeInsets.setValue({
      insetTop: 0,
      insetRight: 0,
      insetBottom: 0,
      insetLeft: edgeInsets.insetLeft,
    }, Affinity.Intrinsic);
  }

  get modalView(): View | null {
    return this;
  }

  get modalState(): ModalState {
    return this.slide.modalState as ModalState;
  }

  readonly modality: boolean | number;

  showModal(options: ModalOptions, timing?: AnyTiming | boolean): void {
    if (options.modal !== void 0) {
      (this as Mutable<this>).modality = options.modal;
    }
    this.present(timing);
  }

  hideModal(timing?: AnyTiming | boolean): void {
    this.dismiss(timing);
  }

  present(timing?: AnyTiming | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromAny(timing);
    }
    this.slide.present(timing);
  }

  dismiss(timing?: AnyTiming | boolean): void {
    if (timing === void 0 || timing === true) {
      timing = this.getLookOr(Look.timing, false);
    } else {
      timing = Timing.fromAny(timing);
    }
    this.slide.dismiss(timing);
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
    if (this.viewportIdiom === "mobile" || this.isHorizontal()) {
      if (this.slide.presented) {
        this.slide.dismiss(timing);
      } else {
        this.stretch.expand(timing);
        this.slide.present(timing);
        const modalService = this.modalProvider.service;
        if (modalService !== void 0 && modalService !== null) {
          modalService.presentModal(this, {modal: true});
        }
      }
    } else {
      this.stretch.toggle(timing);
      this.slide.present(timing);
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
