// Copyright 2015-2020 Swim inc.
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
import {Tween, Transition} from "@swim/transition";
import {
  ViewContextType,
  View,
  ViewEdgeInsets,
  ViewScope,
  ViewAnimator,
  ViewNodeType,
} from "@swim/view";
import {
  Look,
  Feel,
  Mood,
  MoodVector,
  ThemeMatrix,
  ThemedHtmlViewInit,
  ThemedHtmlView,
} from "@swim/theme";
import {ModalOptions, ModalState, Modal} from "@swim/modal";
import {DrawerViewObserver} from "./DrawerViewObserver";
import {DrawerViewController} from "./DrawerViewController";

export type DrawerPlacement = "top" | "right" | "bottom" | "left";

export type DrawerState = "shown" | "showing"
                        | "hidden" | "hiding"
                        | "collapsed" | "collapsing";

export interface DrawerViewInit extends ThemedHtmlViewInit {
  viewController?: DrawerViewController;
  drawerPlacement?: DrawerPlacement;
  collapsedWidth?: AnyLength;
  expandedWidth?: AnyLength;
}

export class DrawerView extends ThemedHtmlView implements Modal {
  /** @hidden */
  _drawerPlacement: DrawerPlacement;
  /** @hidden */
  _drawerState: DrawerState;
  /** @hidden */
  _modality: boolean | number;

  constructor(node: HTMLElement) {
    super(node);
    this._drawerPlacement = "left";
    this._drawerState = "hidden";
    this._modality = true;
    this.initTheme();
  }

  protected initNode(node: ViewNodeType<this>): void {
    super.initNode(node);
    this.addClass("drawer");
    this.display.setAutoState("none");
    this.flexDirection.setAutoState("column");
    this.overflowX.setAutoState("hidden");
    this.overflowY.setAutoState("auto");
    this.overscrollBehaviorY.setAutoState("contain");
    this.overflowScrolling.setAutoState("touch");
  }

  protected initTheme(): void {
    this.modifyTheme(Feel.default, [Feel.overlay, 1]);
  }

  // @ts-ignore
  declare readonly viewController: DrawerViewController | null;

  // @ts-ignore
  declare readonly viewObservers: ReadonlyArray<DrawerViewObserver>;

  initView(init: DrawerViewInit): void {
    super.initView(init);
    if (init.drawerPlacement !== void 0) {
      this.drawerPlacement(init.drawerPlacement);
    }
    if (init.collapsedWidth !== void 0) {
      this.collapsedWidth(init.collapsedWidth);
    }
    if (init.expandedWidth !== void 0) {
      this.expandedWidth(init.expandedWidth);
    }
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

  @ViewAnimator({type: Length, state: Length.px(60)})
  collapsedWidth: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, state: Length.px(200)})
  expandedWidth: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Number, state: 0})
  drawerSlide: ViewAnimator<this, number>; // 0 = hidden; 1 = shown

  @ViewAnimator({type: Number, state: 1})
  drawerStretch: ViewAnimator<this, number>; // 0 = collapsed; 1 = expanded

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

  get effectiveWidth(): Length {
    const width = this.width.value;
    if (this._drawerPlacement === "left") {
      const left = this.left.value;
      if (width instanceof Length && left instanceof Length) {
        return width.plus(left);
      }
    } else if (this._drawerPlacement === "right") {
      const right = this.left.value;
      if (width instanceof Length && right instanceof Length) {
        return width.plus(right);
      }
    }
    if (width instanceof Length) {
      return width;
    } else {
      return Length.px(this.clientBounds.width);
    }
  }

  get effectiveHeight(): Length {
    const height = this.height.value;
    if (this._drawerPlacement === "top") {
      const top = this.top.value;
      if (height instanceof Length && top instanceof Length) {
        return height.plus(top);
      }
    } else if (this._drawerPlacement === "bottom") {
      const bottom = this.bottom.value;
      if (height instanceof Length && bottom instanceof Length) {
        return height.plus(bottom);
      }
    }
    if (height instanceof Length) {
      return height;
    } else {
      return Length.px(this.clientBounds.height);
    }
  }

  @ViewScope({type: Object, inherit: true})
  edgeInsets: ViewScope<this, ViewEdgeInsets | undefined>;

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
      const collapsedWidth = this.collapsedWidth.getValue();
      const expandedWidth = this.expandedWidth.getValue();
      const width = collapsedWidth.times(1 - drawerStretch).plus(expandedWidth.times(drawerStretch));
      this.width.setAutoState(width);
    }
  }

  protected onApplyTheme(theme: ThemeMatrix, mood: MoodVector,
                         transition: Transition<any> | null): void {
    super.onApplyTheme(theme, mood, transition);
    if (this.backgroundColor.isAuto()) {
      this.backgroundColor.setAutoState(theme.inner(mood, Look.backgroundColor), transition);
    }
  }

  protected onAnimate(viewContext: ViewContextType<this>): void {
    super.onAnimate(viewContext);
    if (this.drawerSlide.isUpdated()) {
      this.updateDrawerSlide(this.drawerSlide.getValue());
    }
    if (this.drawerStretch.isUpdated()) {
      this.updateDrawerStretch(this.drawerStretch.getValue());
    }
  }

  protected onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.place(viewContext);
    if (viewContext.viewIdiom === "mobile") {
      this.borderRightColor.setAutoState(Color.transparent());
      this.boxShadow.setAutoState(this.getLook(Look.shadow, Mood.floating));
    } else {
      this.borderRightColor.setAutoState(this.getLook(Look.borderColor));
      this.boxShadow.setAutoState(this.getLook(Look.shadow));
    }
  }

  protected place(viewContext: ViewContextType<this>): void {
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
  protected placeTop(viewContext: ViewContextType<this>): void {
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
    this.updateDrawerSlideTop(this.drawerSlide.getValue());

    let edgeInsets = this.edgeInsets.superState;
    if (edgeInsets === void 0) {
      edgeInsets = viewContext.viewport.safeArea;
    }
    this.edgeInsets.setAutoState({
      insetTop: 0,
      insetRight: edgeInsets.insetRight,
      insetBottom: 0,
      insetLeft: edgeInsets.insetLeft,
    });

    if (this.isCollapsed()) {
      this.expand();
    }
  }

  /** @hidden */
  protected placeRight(viewContext: ViewContextType<this>): void {
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
    this.updateDrawerSlideRight(this.drawerSlide.getValue());
    this.updateDrawerStretch(this.drawerStretch.getValue());

    let edgeInsets = this.edgeInsets.superState;
    if (edgeInsets === void 0) {
      edgeInsets = viewContext.viewport.safeArea;
    }
    this.paddingTop.setAutoState(Length.px(edgeInsets.insetTop));
    this.paddingBottom.setAutoState(Length.px(edgeInsets.insetBottom));
    this.edgeInsets.setAutoState({
      insetTop: 0,
      insetRight: edgeInsets.insetRight,
      insetBottom: 0,
      insetLeft: 0,
    });
  }

  /** @hidden */
  protected placeBottom(viewContext: ViewContextType<this>): void {
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
    this.updateDrawerSlideBottom(this.drawerSlide.getValue());

    let edgeInsets = this.edgeInsets.superState;
    if (edgeInsets === void 0) {
      edgeInsets = viewContext.viewport.safeArea;
    }
    this.edgeInsets.setAutoState({
      insetTop: 0,
      insetRight: edgeInsets.insetRight,
      insetBottom: 0,
      insetLeft: edgeInsets.insetLeft,
    });

    if (this.isCollapsed()) {
      this.expand();
    }
  }

  /** @hidden */
  protected placeLeft(viewContext: ViewContextType<this>): void {
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
    this.updateDrawerSlideLeft(this.drawerSlide.getValue());
    this.updateDrawerStretch(this.drawerStretch.getValue());

    let edgeInsets = this.edgeInsets.superState;
    if (edgeInsets === void 0) {
      edgeInsets = viewContext.viewport.safeArea;
    }
    this.paddingTop.setAutoState(Length.px(edgeInsets.insetTop));
    this.paddingBottom.setAutoState(Length.px(edgeInsets.insetBottom));
    this.edgeInsets.setAutoState({
      insetTop: 0,
      insetRight: 0,
      insetBottom: 0,
      insetLeft: edgeInsets.insetLeft,
    });
  }

  get modalView(): View | null {
    return this;
  }

  get modalState(): ModalState {
    const drawerState = this._drawerState;
    if (drawerState === "collapsed" || drawerState === "collapsing") {
      return "shown";
    } else {
      return drawerState;
    }
  }

  get modality(): boolean | number {
    return this._modality;
  }

  showModal(options: ModalOptions, tween?: Tween<any>): void {
    if (options.modal !== void 0) {
      this._modality = options.modal;
    }
    this.show(tween);
  }

  hideModal(tween?: Tween<any>): void {
    this.hide(tween);
  }

  show(tween?: Tween<any>): void {
    if (!this.isShown() || this.drawerSlide.value !== 1 || this.drawerStretch.value !== 1) {
      if (tween === void 0 || tween === true) {
        tween = this.getLookOr(Look.transition, null);
      } else {
        tween = Transition.forTween(tween);
      }
      this._drawerState = "showing";
      if (tween !== null) {
        if (this.drawerSlide.value !== 1) {
          this.drawerStretch.setAutoState(1, tween);
          this.drawerSlide.setAutoState(1, tween.onBegin(this.willShow.bind(this)).onEnd(this.didShow.bind(this)));
        } else {
          this.drawerStretch.setAutoState(1, tween.onBegin(this.willShow.bind(this)).onEnd(this.didShow.bind(this)));
        }
      } else {
        this.willShow();
        this.drawerStretch.setAutoState(1);
        this.drawerSlide.setAutoState(1);
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
    this.display.setAutoState("flex");
    this.place(this.viewContext as ViewContextType<this>);
  }

  protected didShow(): void {
    this._drawerState = "shown";
    this.requireUpdate(View.NeedsAnimate);
    this.didObserve(function (viewObserver: DrawerViewObserver): void {
      if (viewObserver.drawerDidShow !== void 0) {
        viewObserver.drawerDidShow(this);
      }
    });
  }

  hide(tween?: Tween<any>): void {
    if (!this.isHidden() || this.drawerSlide.value !== 0) {
      if (tween === void 0 || tween === true) {
        tween = this.getLookOr(Look.transition, null);
      } else {
        tween = Transition.forTween(tween);
      }
      this._drawerState = "hiding";
      this.modalService.dismissModal(this);
      if (tween !== null) {
        this.drawerSlide.setAutoState(0, tween.onBegin(this.willHide.bind(this)).onEnd(this.didHide.bind(this)));
      } else {
        this.willHide();
        this.drawerSlide.setAutoState(0);
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
  }

  protected didHide(): void {
    this.display.setAutoState("none");
    this._drawerState = "hidden";
    this.requireUpdate(View.NeedsAnimate);
    this.didObserve(function (viewObserver: DrawerViewObserver): void {
      if (viewObserver.drawerDidHide !== void 0) {
        viewObserver.drawerDidHide(this);
      }
    });
  }

  expand(tween?: Tween<any>): void {
    if (!this.isShown() || this.drawerSlide.value !== 1 || this.drawerStretch.value !== 1) {
      if (tween === void 0 || tween === true) {
        tween = this.getLookOr(Look.transition, null);
      } else {
        tween = Transition.forTween(tween);
      }
      this._drawerState = "showing";
      this.modalService.dismissModal(this);
      if (tween !== null) {
        if (this.drawerStretch.value !== 1) {
          this.drawerSlide.setAutoState(1, tween);
          this.drawerStretch.setAutoState(1, tween.onBegin(this.willExpand.bind(this)).onEnd(this.didExpand.bind(this)));
        } else {
          this.drawerSlide.setAutoState(1, tween.onBegin(this.willExpand.bind(this)).onEnd(this.didExpand.bind(this)));
        }
      } else {
        this.willExpand();
        this.drawerSlide.setAutoState(1)
        this.drawerStretch.setAutoState(1);
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
  }

  protected didExpand(): void {
    this._drawerState = "shown";
    this.requireUpdate(View.NeedsAnimate);
    this.didObserve(function (viewObserver: DrawerViewObserver): void {
      if (viewObserver.drawerDidExpand !== void 0) {
        viewObserver.drawerDidExpand(this);
      }
    });
  }

  collapse(tween?: Tween<any>): void {
    if (this.isVertical() && (!this.isCollapsed() || this.drawerSlide.value !== 1 || this.drawerStretch.value !== 0)) {
      if (tween === void 0 || tween === true) {
        tween = this.getLookOr(Look.transition, null);
      } else {
        tween = Transition.forTween(tween);
      }
      this._drawerState = "collapsing";
      this.modalService.dismissModal(this);
      if (this.drawerSlide.value === 0) {
        this.drawerStretch.setAutoState(0);
      }
      if (tween !== null) {
        if (this.drawerStretch.value !== 0) {
          this.drawerSlide.setAutoState(1, tween);
          this.drawerStretch.setAutoState(0, tween.onBegin(this.willCollapse.bind(this)).onEnd(this.didCollapse.bind(this)));
        } else {
          this.drawerSlide.setAutoState(1, tween.onBegin(this.willCollapse.bind(this)).onEnd(this.didCollapse.bind(this)));
        }
      } else {
        this.willCollapse();
        this.drawerSlide.setAutoState(1);
        this.drawerStretch.setAutoState(0);
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
    this.display.setAutoState("flex");
  }

  protected didCollapse(): void {
    this._drawerState = "collapsed";
    this.requireUpdate(View.NeedsAnimate);
    this.didObserve(function (viewObserver: DrawerViewObserver): void {
      if (viewObserver.drawerDidCollapse !== void 0) {
        viewObserver.drawerDidCollapse(this);
      }
    });
  }

  toggle(tween?: Tween<any>): void {
    const drawerState = this._drawerState;
    if (this.viewIdiom === "mobile" && (drawerState === "hidden" || drawerState === "hiding")) {
      this.modalService.presentModal(this, {modal: true});
    } else if (drawerState === "hidden" || drawerState === "hiding") {
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
