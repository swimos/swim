// Copyright 2015-2020 SWIM.AI inc.
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

import {AnyLength, Length} from "@swim/length";
import {Color} from "@swim/color";
import {BoxShadow} from "@swim/shadow";
import {Ease, Tween, Transition} from "@swim/transition";
import {
  ViewScope,
  ViewEdgeInsets,
  ViewContext,
  View,
  ModalState,
  Modal,
  MemberAnimator,
  HtmlView,
} from "@swim/view";
import {DrawerViewObserver} from "./DrawerViewObserver";
import {DrawerViewController} from "./DrawerViewController";

export type DrawerPlacement = "top" | "right" | "bottom" | "left";

export type DrawerState = "shown" | "showing"
                        | "hidden" | "hiding"
                        | "collapsed" | "collapsing";

export class DrawerView extends HtmlView implements Modal {
  /** @hidden */
  _drawerPlacement: DrawerPlacement;
  /** @hidden */
  _drawerState: DrawerState;
  /** @hidden */
  _drawerTransition: Transition<any>;

  constructor(node: HTMLElement) {
    super(node);
    this.collapsedWidth.setAutoState(Length.px(60));
    this.expandedWidth.setAutoState(Length.px(200));
    this.drawerSlide.setState(0);
    this.drawerSlide.update = this.updateDrawerSlide.bind(this);
    this.drawerStretch.setState(1);
    this.drawerStretch.update = this.updateDrawerStretch.bind(this);
    this._drawerPlacement = "left";
    this._drawerState = "hidden";
    this._drawerTransition = Transition.duration(250, Ease.cubicOut);
  }

  protected initNode(node: HTMLElement): void {
    this.addClass("drawer")
        .display("none")
        .flexDirection("column")
        .overflowX("hidden")
        .overflowY("auto")
        .overscrollBehaviorY("contain")
        .webkitOverflowScrolling("touch")
        .backgroundColor("#26282a");
  }

  get viewController(): DrawerViewController | null {
    return this._viewController;
  }

  get drawerState(): DrawerState {
    return this._drawerState;
  }

  isShown(): boolean {
    return this._drawerState === "shown" || this._drawerState === "showing";
  }

  isHidden(): boolean {
    return this._drawerState === "hidden" || this._drawerState === "hiding";
  }

  isCollapsed(): boolean {
    return this._drawerState === "collapsed" || this._drawerState === "collapsing";
  }

  @MemberAnimator(Length)
  collapsedWidth: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length)
  expandedWidth: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Number)
  drawerSlide: MemberAnimator<this, number>; // 0 = hidden; 1 = shown

  @MemberAnimator(Number)
  drawerStretch: MemberAnimator<this, number>; // 0 = collapsed; 1 = expanded

  drawerPlacement(): DrawerPlacement;
  drawerPlacement(drawerPlacement: DrawerPlacement): this;
  drawerPlacement(newPlacement?: DrawerPlacement): DrawerPlacement | this {
    const oldPlacement = this._drawerPlacement;
    if (newPlacement === void 0) {
      return oldPlacement;
    } else {
      if (oldPlacement !== newPlacement) {
        this.willSetDrawerPlacement(newPlacement, oldPlacement);
        this._drawerPlacement = newPlacement;
        this.onSetDrawerPlacement(newPlacement, oldPlacement);
        this.didSetDrawerPlacement(newPlacement, oldPlacement);
      }
      return this;
    }
  }

  isHorizontal(): boolean {
    return this._drawerPlacement === "top" || this._drawerPlacement === "bottom";
  }

  isVertical(): boolean {
    return this._drawerPlacement === "left" || this._drawerPlacement === "right";
  }

  @ViewScope
  edgeInsets: ViewScope<this, ViewEdgeInsets>;

  protected willSetDrawerPlacement(newPlacement: DrawerPlacement, oldPlacement: DrawerPlacement): void {
    this.willObserve(function (viewObserver: DrawerViewObserver): void {
      if (viewObserver.drawerWillSetPlacement !== void 0) {
        viewObserver.drawerWillSetPlacement(newPlacement, oldPlacement, this);
      }
    });
  }

  protected onSetDrawerPlacement(newPlacement: DrawerPlacement, oldPlacement: DrawerPlacement): void {
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetDrawerPlacement(newPlacement: DrawerPlacement, oldPlacement: DrawerPlacement): void {
    this.didObserve(function (viewObserver: DrawerViewObserver): void {
      if (viewObserver.drawerDidSetPlacement !== void 0) {
        viewObserver.drawerDidSetPlacement(newPlacement, oldPlacement, this);
      }
    });
  }

  /** @hidden */
  protected updateDrawerSlide(drawerSlide: number): void {
    const drawerPlacement = this._drawerPlacement;
    if (drawerPlacement === "top") {
      this.updateDrawerSlideTop(drawerSlide);
    } else if (drawerPlacement === "right") {
      this.updateDrawerSlideRight(drawerSlide);
    } else if (drawerPlacement === "bottom") {
      this.updateDrawerSlideBottom(drawerSlide);
    } else if (drawerPlacement === "left") {
      this.updateDrawerSlideLeft(drawerSlide);
    }
  }

  /** @hidden */
  protected updateDrawerSlideTop(drawerSlide: number): void {
    this.top.setAutoState(Length.px((drawerSlide - 1) * this._node.offsetHeight));
  }

  /** @hidden */
  protected updateDrawerSlideRight(drawerSlide: number): void {
    this.right.setAutoState(Length.px((drawerSlide - 1) * this._node.offsetWidth));
  }

  /** @hidden */
  protected updateDrawerSlideBottom(drawerSlide: number): void {
    this.bottom.setAutoState(Length.px((drawerSlide - 1) * this._node.offsetHeight));
  }

  /** @hidden */
  protected updateDrawerSlideLeft(drawerSlide: number): void {
    this.left.setAutoState(Length.px((drawerSlide - 1) * this._node.offsetWidth));
  }

  /** @hidden */
  protected updateDrawerStretch(drawerStretch: number): void {
    if (this.isVertical()) {
      const collapsedWidth = this.collapsedWidth.value!;
      const expandedWidth = this.expandedWidth.value!;
      const width = collapsedWidth.times(1 - drawerStretch).plus(expandedWidth.times(drawerStretch));
      this.width.setAutoState(width);
    }
  }

  protected onLayout(viewContext: ViewContext): void {
    super.onLayout(viewContext);
    this.place(viewContext);
    if (viewContext.viewIdiom === "mobile") {
      this.borderRightColor(Color.transparent());
      this.boxShadow.setState(BoxShadow.of(0, 2, 4, 0, Color.black(0.5)));
    } else {
      this.borderRightColor(Color.black());
      this.boxShadow.setState(void 0);
    }
  }

  protected place(viewContext: ViewContext): void {
    const drawerPlacement = this._drawerPlacement;
    if (drawerPlacement === "top") {
      this.placeTop(viewContext);
    } else if (drawerPlacement === "right") {
      this.placeRight(viewContext);
    } else if (drawerPlacement === "bottom") {
      this.placeBottom(viewContext);
    } else if (drawerPlacement === "left") {
      this.placeLeft(viewContext);
    }
  }

  /** @hidden */
  protected placeTop(viewContext: ViewContext): void {
    this.addClass("drawer-top")
        .removeClass("drawer-right")
        .removeClass("drawer-bottom")
        .removeClass("drawer-left");

    this.position.setAutoState("fixed");
    this.width.setAutoState(void 0);
    this.height.setAutoState(void 0);
    this.top.setAutoState(void 0);
    this.right.setAutoState(Length.zero());
    this.bottom.setAutoState(void 0);
    this.left.setAutoState(Length.zero());
    this.updateDrawerSlideTop(this.drawerSlide.value!);

    const safeArea = viewContext.viewport.safeArea;
    this.edgeInsets.setState({
      insetTop: 0,
      insetRight: safeArea.insetRight,
      insetBottom: 0,
      insetLeft: safeArea.insetLeft,
    });

    if (this.isCollapsed()) {
      this.expand();
    }
  }

  /** @hidden */
  protected placeRight(viewContext: ViewContext): void {
    this.removeClass("drawer-top")
        .addClass("drawer-right")
        .removeClass("drawer-bottom")
        .removeClass("drawer-left");

    this.position.setAutoState("fixed");
    this.width.setAutoState(void 0);
    this.height.setAutoState(void 0);
    this.top.setAutoState(Length.zero());
    this.right.setAutoState(void 0);
    this.bottom.setAutoState(Length.zero());
    this.left.setAutoState(void 0);
    this.updateDrawerSlideRight(this.drawerSlide.value!);
    this.updateDrawerStretch(this.drawerStretch.value!);

    const safeArea = viewContext.viewport.safeArea;
    this.paddingTop.setAutoState(Length.px(safeArea.insetTop));
    this.paddingBottom.setAutoState(Length.px(safeArea.insetBottom));
    this.edgeInsets.setState({
      insetTop: 0,
      insetRight: safeArea.insetRight,
      insetBottom: 0,
      insetLeft: 0,
    });
  }

  /** @hidden */
  protected placeBottom(viewContext: ViewContext): void {
    this.removeClass("drawer-top")
        .removeClass("drawer-right")
        .addClass("drawer-bottom")
        .removeClass("drawer-left");

    this.position.setAutoState("fixed");
    this.width.setAutoState(void 0);
    this.height.setAutoState(void 0);
    this.top.setAutoState(void 0);
    this.right.setAutoState(Length.zero());
    this.bottom.setAutoState(void 0);
    this.left.setAutoState(Length.zero());
    this.updateDrawerSlideBottom(this.drawerSlide.value!);

    const safeArea = viewContext.viewport.safeArea;
    this.edgeInsets.setState({
      insetTop: 0,
      insetRight: safeArea.insetRight,
      insetBottom: 0,
      insetLeft: safeArea.insetLeft,
    });

    if (this.isCollapsed()) {
      this.expand();
    }
  }

  /** @hidden */
  protected placeLeft(viewContext: ViewContext): void {
    this.removeClass("drawer-top")
        .removeClass("drawer-right")
        .removeClass("drawer-bottom")
        .addClass("drawer-left");

    this.position.setAutoState("fixed");
    this.width.setAutoState(void 0);
    this.height.setAutoState(void 0);
    this.top.setAutoState(Length.zero());
    this.right.setAutoState(void 0);
    this.bottom.setAutoState(Length.zero());
    this.left.setAutoState(void 0);
    this.updateDrawerSlideLeft(this.drawerSlide.value!);
    this.updateDrawerStretch(this.drawerStretch.value!);

    const safeArea = viewContext.viewport.safeArea;
    this.paddingTop.setAutoState(Length.px(safeArea.insetTop));
    this.paddingBottom.setAutoState(Length.px(safeArea.insetBottom));
    this.edgeInsets.setState({
      insetTop: 0,
      insetRight: 0,
      insetBottom: 0,
      insetLeft: safeArea.insetLeft,
    });
  }

  get modalState(): ModalState {
    const drawerState = this._drawerState;
    if (drawerState === "collapsed" || drawerState === "collapsing") {
      return "shown";
    } else {
      return drawerState;
    }
  }

  get modalView(): View | null {
    return this;
  }

  showModal(tween?: Tween<any>): void {
    this.show(tween);
  }

  hideModal(tween?: Tween<any>): void {
    this.hide(tween);
  }

  show(tween?: Tween<any>): void {
    if (!this.isShown() || this.drawerSlide.value !== 1 || this.drawerStretch.value !== 1) {
      if (tween === void 0 || tween === true) {
        tween = this._drawerTransition;
      } else {
        tween = Transition.forTween(tween);
      }
      this.willShow();
      if (tween !== null) {
        this.drawerStretch(1, tween)
            .drawerSlide(1, tween.onEnd(this.didShow.bind(this)));
      } else {
        this.drawerStretch(1)
            .drawerSlide(1);
        this.didShow();
      }
    }
  }

  protected willShow(): void {
    this.willObserve(function (viewObserver: DrawerViewObserver): void {
      if (viewObserver.drawerWillShow !== void 0) {
        viewObserver.drawerWillShow(this);
      }
    });
    this._drawerState = "showing";
    this.display("flex");
  }

  protected didShow(): void {
    this._drawerState = "shown";
    this.didObserve(function (viewObserver: DrawerViewObserver): void {
      if (viewObserver.drawerDidShow !== void 0) {
        viewObserver.drawerDidShow(this);
      }
    });
  }

  hide(tween?: Tween<any>): void {
    if (!this.isHidden() || this.drawerSlide.value !== 0) {
      if (tween === void 0 || tween === true) {
        tween = this._drawerTransition;
      } else {
        tween = Transition.forTween(tween);
      }
      this.willHide();
      if (tween !== null) {
        this.drawerSlide(0, tween.onEnd(this.didHide.bind(this)));
      } else {
        this.drawerSlide(0);
        this.didHide();
      }
    }
  }

  protected willHide(): void {
    this.willObserve(function (viewObserver: DrawerViewObserver): void {
      if (viewObserver.drawerWillHide !== void 0) {
        viewObserver.drawerWillHide(this);
      }
    });
    this._drawerState = "hiding";
  }

  protected didHide(): void {
    this.display("none");
    this._drawerState = "hidden";
    this.didObserve(function (viewObserver: DrawerViewObserver): void {
      if (viewObserver.drawerDidHide !== void 0) {
        viewObserver.drawerDidHide(this);
      }
    });
  }

  expand(tween?: Tween<any>): void {
    if (!this.isShown() || this.drawerSlide.value !== 1 || this.drawerStretch.value !== 1) {
      if (tween === void 0 || tween === true) {
        tween = this._drawerTransition;
      } else {
        tween = Transition.forTween(tween);
      }
      this.willExpand();
      if (tween !== null) {
        this.drawerSlide(1, tween)
            .drawerStretch(1, tween.onEnd(this.didExpand.bind(this)));
      } else {
        this.drawerSlide(1)
            .drawerStretch(1);
        this.didExpand();
      }
    }
  }

  protected willExpand(): void {
    this.willObserve(function (viewObserver: DrawerViewObserver): void {
      if (viewObserver.drawerWillExpand !== void 0) {
        viewObserver.drawerWillExpand(this);
      }
    });
    this._drawerState = "showing";
  }

  protected didExpand(): void {
    this._drawerState = "shown";
    this.didObserve(function (viewObserver: DrawerViewObserver): void {
      if (viewObserver.drawerDidExpand !== void 0) {
        viewObserver.drawerDidExpand(this);
      }
    });
  }

  collapse(tween?: Tween<any>): void {
    if (this.isVertical() && (!this.isCollapsed() || this.drawerSlide.value !== 1 || this.drawerStretch.value !== 0)) {
      if (tween === void 0 || tween === true) {
        tween = this._drawerTransition;
      } else {
        tween = Transition.forTween(tween);
      }
      this.willCollapse();
      if (tween !== null) {
        this.drawerSlide(1, tween)
            .drawerStretch(0, tween.onEnd(this.didCollapse.bind(this)));
      } else {
        this.drawerSlide(1)
            .drawerStretch(0);
        this.didCollapse();
      }
    }
  }

  protected willCollapse(): void {
    this.willObserve(function (viewObserver: DrawerViewObserver): void {
      if (viewObserver.drawerWillCollapse !== void 0) {
        viewObserver.drawerWillCollapse(this);
      }
    });
    this._drawerState = "collapsing";
    this.display("flex");
  }

  protected didCollapse(): void {
    this._drawerState = "collapsed";
    this.didObserve(function (viewObserver: DrawerViewObserver): void {
      if (viewObserver.drawerDidCollapse !== void 0) {
        viewObserver.drawerDidCollapse(this);
      }
    });
  }

  toggle(tween?: Tween<any>): void {
    const drawerState = this._drawerState;
    if (drawerState === "hidden" || drawerState === "hiding") {
      this.show(tween);
    } else if (drawerState === "collapsed" || drawerState === "collapsing") {
      this.expand(tween);
    } else if (this.viewIdiom === "mobile") {
      this.hide(tween);
    } else {
      this.collapse(tween);
    }
  }
}
