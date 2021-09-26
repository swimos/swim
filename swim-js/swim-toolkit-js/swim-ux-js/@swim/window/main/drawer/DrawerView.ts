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

import type {Mutable} from "@swim/util";
import {AnyTiming, Timing} from "@swim/mapping";
import {AnyLength, Length} from "@swim/math";
import {AnyPresence, Presence, AnyExpansion, Expansion} from "@swim/style";
import {Look, Mood} from "@swim/theme";
import {
  ViewContextType,
  View,
  ViewEdgeInsets,
  ModalOptions,
  ModalState,
  Modal,
  ViewProperty,
  ViewPropertyConstraint,
  ViewAnimator,
  ViewAnimatorConstraint,
  PresenceViewAnimator,
  ExpansionViewAnimator,
} from "@swim/view";
import {HtmlViewInit, HtmlView} from "@swim/dom";
import type {DrawerViewObserver} from "./DrawerViewObserver";

export type DrawerPlacement = "top" | "right" | "bottom" | "left";

export interface DrawerViewInit extends HtmlViewInit {
  placement?: DrawerPlacement;
  collapsedWidth?: AnyLength;
  expandedWidth?: AnyLength;
}

export class DrawerView extends HtmlView implements Modal {
  constructor(node: HTMLElement) {
    super(node);
    this.modality = true;
    this.initDrawer();
  }

  protected initDrawer(): void {
    this.addClass("drawer");
    this.display.setState("flex", View.Intrinsic);
    this.overflowX.setState("hidden", View.Intrinsic);
    this.overflowY.setState("auto", View.Intrinsic);
    this.overscrollBehaviorY.setState("contain", View.Intrinsic);
    this.overflowScrolling.setState("touch", View.Intrinsic);
  }

  override readonly viewObservers!: ReadonlyArray<DrawerViewObserver>;

  override initView(init: DrawerViewInit): void {
    super.initView(init);
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

  @ViewAnimatorConstraint({type: Length, state: Length.px(60)})
  readonly collapsedWidth!: ViewAnimatorConstraint<this, Length, AnyLength>;

  @ViewAnimatorConstraint({type: Length, state: Length.px(200)})
  readonly expandedWidth!: ViewAnimatorConstraint<this, Length, AnyLength>;

  @ViewPropertyConstraint({type: Length, state: null})
  readonly effectiveWidth!: ViewPropertyConstraint<this, Length | null, AnyLength | null>;

  @ViewPropertyConstraint({type: Length, state: null})
  readonly effectiveHeight!: ViewPropertyConstraint<this, Length | null, AnyLength | null>;

  isHorizontal(): boolean {
    return this.placement.state === "top" || this.placement.state === "bottom";
  }

  isVertical(): boolean {
    return this.placement.state === "left" || this.placement.state === "right";
  }

  protected willSetPlacement(newPlacement: DrawerPlacement, oldPlacement: DrawerPlacement): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetPlacement !== void 0) {
        viewObserver.viewWillSetPlacement(newPlacement, oldPlacement, this);
      }
    }
  }

  protected onSetPlacement(newPlacement: DrawerPlacement, oldPlacement: DrawerPlacement): void {
    // hook
  }

  protected didSetPlacement(newPlacement: DrawerPlacement, oldPlacement: DrawerPlacement): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetPlacement !== void 0) {
        viewObserver.viewDidSetPlacement(newPlacement, oldPlacement, this);
      }
    }
  }

  @ViewProperty<DrawerView, DrawerPlacement>({
    type: String,
    state: "left",
    updateFlags: View.NeedsResize | View.NeedsLayout,
    willSetState(newPlacement: DrawerPlacement, oldPlacement: DrawerPlacement): void {
      this.owner.willSetPlacement(newPlacement, oldPlacement);
    },
    didSetState(newPlacement: DrawerPlacement, oldPlacement: DrawerPlacement): void {
      this.owner.onSetPlacement(newPlacement, oldPlacement);
      this.owner.didSetPlacement(newPlacement, oldPlacement);
    },
  })
  readonly placement!: ViewProperty<this, DrawerPlacement>;

  protected willPresent(): void {
    const viewObservers = this.viewObservers!;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillPresent !== void 0) {
        viewObserver.viewWillPresent(this);
      }
    }
  }

  protected didPresent(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidPresent !== void 0) {
        viewObserver.viewDidPresent(this);
      }
    }
  }

  protected willDismiss(): void {
    const modalManager = this.modalService.manager;
    if (modalManager !== void 0 && modalManager !== null) {
      modalManager.dismissModal(this);
    }

    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillDismiss !== void 0) {
        viewObserver.viewWillDismiss(this);
      }
    }
  }

  protected didDismiss(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidDismiss !== void 0) {
        viewObserver.viewDidDismiss(this);
      }
    }
  }

  @ViewAnimator<DrawerView, Presence, AnyPresence>({
    type: Presence,
    state: Presence.presented(),
    updateFlags: View.NeedsLayout,
    willPresent(): void {
      this.owner.willPresent();
    },
    didPresent(): void {
      this.owner.didPresent();
    },
    willDismiss(): void {
      this.owner.willDismiss();
    },
    didDismiss(): void {
      this.owner.didDismiss();
    },
  })
  readonly slide!: PresenceViewAnimator<this, Presence, AnyPresence>;

  protected willExpand(): void {
    const modalManager = this.modalService.manager;
    if (modalManager !== void 0 && modalManager !== null) {
      modalManager.dismissModal(this);
    }

    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillExpand !== void 0) {
        viewObserver.viewWillExpand(this);
      }
    }
  }

  protected didExpand(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidExpand !== void 0) {
        viewObserver.viewDidExpand(this);
      }
    }
  }

  protected willCollapse(): void {
    const modalManager = this.modalService.manager;
    if (modalManager !== void 0 && modalManager !== null) {
      modalManager.dismissModal(this);
    }

    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillCollapse !== void 0) {
        viewObserver.viewWillCollapse(this);
      }
    }
  }

  protected didCollapse(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidCollapse !== void 0) {
        viewObserver.viewDidCollapse(this);
      }
    }
  }

  @ViewAnimator<DrawerView, Expansion, AnyExpansion>({
    type: Expansion,
    state: Expansion.expanded(),
    updateFlags: View.NeedsResize | View.NeedsLayout,
    willExpand(): void {
      this.owner.willExpand();
    },
    didExpand(): void {
      this.owner.didExpand();
    },
    willCollapse(): void {
      this.owner.willCollapse();
    },
    didCollapse(): void {
      this.owner.didCollapse();
    },
  })
  readonly stretch!: ExpansionViewAnimator<this, Expansion, AnyExpansion>;

  @ViewProperty({type: Object, inherit: true, state: null})
  readonly edgeInsets!: ViewProperty<this, ViewEdgeInsets | null>;

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.display.setState(!this.slide.isDismissed() ? "flex" : "none", View.Intrinsic);
    this.layoutDrawer(viewContext);

    if (viewContext.viewIdiom === "mobile") {
      this.boxShadow.setState(this.getLookOr(Look.shadow, Mood.floating, null), View.Intrinsic);
    } else {
      this.boxShadow.setState(this.getLookOr(Look.shadow, null), View.Intrinsic);
    }
  }

  protected layoutDrawer(viewContext: ViewContextType<this>): void {
    const placement = this.placement.state;
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

    this.position.setState("fixed", View.Intrinsic);
    this.width.setState(null, View.Intrinsic);
    this.height.setState(null, View.Intrinsic);
    this.left.setState(Length.zero(), View.Intrinsic);
    this.right.setState(Length.zero(), View.Intrinsic);
    this.bottom.setState(null, View.Intrinsic);

    let height: Length | null = this.height.value;
    if (height === null) {
      height = Length.px(this.node.offsetHeight);
    }
    this.top.setState(height.times(slidePhase - 1), View.Intrinsic);

    this.effectiveWidth.setState(this.width.value);
    this.effectiveHeight.setState(height.times(slidePhase), View.Intrinsic);

    let edgeInsets = this.edgeInsets.superState;
    if (edgeInsets === void 0 || edgeInsets === null) {
      edgeInsets = viewContext.viewport.safeArea;
    }
    this.edgeInsets.setState({
      insetTop: 0,
      insetRight: edgeInsets.insetRight,
      insetBottom: 0,
      insetLeft: edgeInsets.insetLeft,
    }, View.Intrinsic);

    if (this.stretch.isCollapsed()) {
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

    this.position.setState("fixed", View.Intrinsic);
    this.height.setState(null, View.Intrinsic);
    this.top.setState(Length.zero(), View.Intrinsic);
    this.bottom.setState(Length.zero(), View.Intrinsic);
    this.left.setState(null, View.Intrinsic);

    let width: Length | null;
    if (this.width.takesPrecedence(View.Intrinsic)) {
      const collapsedWidth = this.collapsedWidth.getValue();
      const expandedWidth = this.expandedWidth.getValue();
      width = collapsedWidth.times(1 - stretchPhase).plus(expandedWidth.times(stretchPhase));
    } else {
      width = this.width.value;
      if (width === null) {
        width = Length.px(this.node.offsetWidth);
      }
    }
    this.width.setState(width, View.Intrinsic);
    this.right.setState(width.times(slidePhase - 1), View.Intrinsic);

    this.effectiveWidth.setState(width.times(slidePhase), View.Intrinsic);
    this.effectiveHeight.setState(this.height.value, View.Intrinsic);

    let edgeInsets = this.edgeInsets.superState;
    if ((edgeInsets === void 0 || edgeInsets === null) || edgeInsets === null) {
      edgeInsets = viewContext.viewport.safeArea;
    }
    this.paddingTop.setState(Length.px(edgeInsets.insetTop), View.Intrinsic);
    this.paddingBottom.setState(Length.px(edgeInsets.insetBottom), View.Intrinsic);
    this.edgeInsets.setState({
      insetTop: 0,
      insetRight: edgeInsets.insetRight,
      insetBottom: 0,
      insetLeft: 0,
    }, View.Intrinsic);
  }

  protected layoutDrawerBottom(viewContext: ViewContextType<this>): void {
    const slidePhase = this.slide.getPhase();

    this.removeClass("drawer-top")
        .removeClass("drawer-right")
        .addClass("drawer-bottom")
        .removeClass("drawer-left");

    this.position.setState("fixed", View.Intrinsic);
    this.width.setState(null, View.Intrinsic);
    this.height.setState(null, View.Intrinsic);
    this.left.setState(Length.zero(), View.Intrinsic);
    this.right.setState(Length.zero(), View.Intrinsic);
    this.top.setState(null, View.Intrinsic);

    let height: Length | null = this.height.value;
    if (height === null) {
      height = Length.px(this.node.offsetHeight);
    }
    this.bottom.setState(height.times(slidePhase - 1), View.Intrinsic);

    this.effectiveWidth.setState(this.width.value, View.Intrinsic);
    this.effectiveHeight.setState(height.times(slidePhase), View.Intrinsic);

    let edgeInsets = this.edgeInsets.superState;
    if ((edgeInsets === void 0 || edgeInsets === null) || edgeInsets === null) {
      edgeInsets = viewContext.viewport.safeArea;
    }
    this.edgeInsets.setState({
      insetTop: 0,
      insetRight: edgeInsets.insetRight,
      insetBottom: 0,
      insetLeft: edgeInsets.insetLeft,
    }, View.Intrinsic);

    if (this.stretch.isCollapsed()) {
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

    this.position.setState("fixed", View.Intrinsic);
    this.height.setState(null, View.Intrinsic);
    this.top.setState(Length.zero(), View.Intrinsic);
    this.bottom.setState(Length.zero(), View.Intrinsic);
    this.right.setState(null, View.Intrinsic);

    let width: Length | null;
    if (this.width.takesPrecedence(View.Intrinsic)) {
      const collapsedWidth = this.collapsedWidth.getValue();
      const expandedWidth = this.expandedWidth.getValue();
      width = collapsedWidth.times(1 - stretchPhase).plus(expandedWidth.times(stretchPhase));
    } else {
      width = this.width.value;
      if (width === null) {
        width = Length.px(this.node.offsetWidth);
      }
    }
    this.width.setState(width, View.Intrinsic);
    this.left.setState(width.times(slidePhase - 1), View.Intrinsic);

    this.effectiveWidth.setState(width.times(slidePhase), View.Intrinsic);
    this.effectiveHeight.setState(this.height.value, View.Intrinsic);

    let edgeInsets = this.edgeInsets.superState;
    if ((edgeInsets === void 0 || edgeInsets === null) || edgeInsets === null) {
      edgeInsets = viewContext.viewport.safeArea;
    }
    this.paddingTop.setState(Length.px(edgeInsets.insetTop), View.Intrinsic);
    this.paddingBottom.setState(Length.px(edgeInsets.insetBottom), View.Intrinsic);
    this.edgeInsets.setState({
      insetTop: 0,
      insetRight: 0,
      insetBottom: 0,
      insetLeft: edgeInsets.insetLeft,
    }, View.Intrinsic);
  }

  get modalView(): View | null {
    return this;
  }

  get modalState(): ModalState {
    return this.slide.modalState!;
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
    if (this.viewIdiom === "mobile" || this.isHorizontal()) {
      if (this.slide.isPresented()) {
        this.slide.dismiss(timing);
      } else {
        this.stretch.expand(timing);
        this.slide.present(timing);
        const modalManager = this.modalService.manager;
        if (modalManager !== void 0 && modalManager !== null) {
          modalManager.presentModal(this, {modal: true});
        }
      }
    } else {
      this.stretch.toggle(timing);
      this.slide.present(timing);
    }
  }
}
