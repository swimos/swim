// Copyright 2015-2019 SWIM.AI inc.
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

import {ConstrainVariable, Constraint, ConstraintSolver} from "@swim/constraint";
import {LayoutManager} from "./layout/LayoutManager";
import {LayoutSolver} from "./layout/LayoutSolver";
import {LayoutAnchor} from "./layout/LayoutAnchor";
import {View} from "./View";
import {AppView} from "./AppView";
import {AppViewObserver} from "./AppViewObserver";
import {ViewNode} from "./NodeView";
import {HtmlView} from "./HtmlView";
import {HtmlAppViewController} from "./HtmlAppViewController";
import {PopoverOptions, Popover} from "./Popover";

export interface HtmlAppViewSafeArea {
  insetTop: number;
  insetRight: number;
  insetBottom: number;
  insetLeft: number;
}

export interface HtmlAppViewport {
  width: number;
  height: number;
  orientation: OrientationType;
  safeArea: HtmlAppViewSafeArea;
}

export class HtmlAppView extends HtmlView implements AppView, LayoutManager {
  /** @hidden */
  _viewController: HtmlAppViewController | null;
  /** @hidden */
  readonly _popovers: Popover[];
  /** @hidden */
  _viewport: HtmlAppViewport | null;
  /** @hidden */
  _solver: LayoutSolver | null;
  /** @hidden */
  _flags: number;
  /** @hidden */
  _updateTimer: number;
  /** @hidden */
  _updateDelay: number;
  /** @hidden */
  _reorientationTimer: number;

  constructor(node: HTMLElement, key: string | null = null) {
    super(node, key);
    this.doUpdate = this.doUpdate.bind(this);
    this.throttleResize = this.throttleResize.bind(this);
    this.throttleScroll = this.throttleScroll.bind(this);
    this.debounceReorientation = this.debounceReorientation.bind(this);
    this.doReorientation = this.doReorientation.bind(this);
    this.onClick = this.onClick.bind(this);
    this._popovers = [];
    this._viewport = null;
    this._solver = null;
    this._flags = HtmlAppView.NeedsResize | HtmlAppView.NeedsScroll | HtmlAppView.NeedsLayout;
    this._updateTimer = 0;
    this._updateDelay = 16;
    this._reorientationTimer = 0;
    if (this.isRootView() && this.isMounted()) {
      setTimeout(this.cascadeRootMount.bind(this));
    }
  }

  get viewController(): HtmlAppViewController | null {
    return this._viewController;
  }

  get appView(): this {
    return this;
  }

  isRootView(): boolean {
    let node = this._node as Node;
    do {
      const parentNode = node.parentNode as ViewNode | null;
      if (parentNode) {
        const parentView = parentNode.view;
        if (parentView instanceof View) {
          return false;
        }
        node = parentNode;
        continue;
      }
      break;
    } while (true);
    return true;
  }

  get popovers(): ReadonlyArray<Popover> {
    return this._popovers;
  }

  togglePopover(popover: Popover, options?: PopoverOptions): void {
    const popoverState = popover.popoverState;
    if (popoverState === "hidden" || popoverState === "hiding") {
      this.showPopover(popover, options);
    } else if (popoverState === "shown" || popoverState === "showing") {
      this.hidePopover(popover);
    }
  }

  showPopover(popover: Popover, options: PopoverOptions = {}): void {
    this.willShowPopover(popover, options);
    if (options && !options.multi) {
      this.hidePopovers();
    }
    if (this._popovers.indexOf(popover) < 0) {
      this._popovers.push(popover);
    }
    const popoverView = popover.popoverView;
    if (popoverView && !popoverView.isMounted()) {
      this.insertPopoverView(popoverView);
    }
    this.onShowPopover(popover, options);
    popover.showPopover(true);
    this.didShowPopover(popover, options);
  }

  protected insertPopoverView(popoverView: View): void {
    // subclasses can override to change popover container
    this.appendChildView(popoverView);
  }

  protected willShowPopover(popover: Popover, options: PopoverOptions): void {
    this.willObserve(function (viewObserver: AppViewObserver): void {
      if (viewObserver.viewWillShowPopover) {
        viewObserver.viewWillShowPopover(popover, options, this);
      }
    });
  }

  protected onShowPopover(popover: Popover, options: PopoverOptions): void {
    // hook
  }

  protected didShowPopover(popover: Popover, options: PopoverOptions): void {
    this.didObserve(function (viewObserver: AppViewObserver): void {
      if (viewObserver.viewDidShowPopover) {
        viewObserver.viewDidShowPopover(popover, options, this);
      }
    });
  }

  hidePopover(popover: Popover): void {
    const popovers = this._popovers;
    const index = popovers.indexOf(popover);
    if (index >= 0) {
      this.willHidePopover(popover);
      popovers.splice(index, 1);
      this.onHidePopover(popover);
      popover.hidePopover(true);
      this.didHidePopover(popover);
    }
  }

  protected willHidePopover(popover: Popover): void {
    this.willObserve(function (viewObserver: AppViewObserver): void {
      if (viewObserver.viewWillHidePopover) {
        viewObserver.viewWillHidePopover(popover, this);
      }
    });
  }

  protected onHidePopover(popover: Popover): void {
    // hook
  }

  protected didHidePopover(popover: Popover): void {
    this.didObserve(function (viewObserver: AppViewObserver): void {
      if (viewObserver.viewDidHidePopover) {
        viewObserver.viewDidHidePopover(popover, this);
      }
    });
  }

  hidePopovers(): void {
    const popovers = this._popovers;
    while (popovers.length) {
      const popover = popovers[0];
      this.willHidePopover(popover);
      popovers.shift();
      this.onHidePopover(popover);
      popover.hidePopover(true);
      this.didHidePopover(popover);
    }
  }

  get viewport(): HtmlAppViewport {
    let viewport = this._viewport;
    if (viewport === null) {
      let insetTop = 0;
      let insetRight = 0;
      let insetBottom = 0;
      let insetLeft = 0;
      const documentWidth = document.documentElement.style.width;
      const documentHeight = document.documentElement.style.height;
      document.documentElement.style.width = "100%";
      document.documentElement.style.height = "100%";
      const div = document.createElement("div");
      div.style.setProperty("position", "fixed");
      div.style.setProperty("top", "0");
      div.style.setProperty("right", "0");
      div.style.setProperty("width", window.innerWidth === document.documentElement.offsetWidth ? "100%" : "100vw");
      div.style.setProperty("height", window.innerHeight === document.documentElement.offsetHeight ? "100%" : "100vh");
      div.style.setProperty("box-sizing", "border-box");
      div.style.setProperty("padding-top", "env(safe-area-inset-top)");
      div.style.setProperty("padding-right", "env(safe-area-inset-right)");
      div.style.setProperty("padding-bottom", "env(safe-area-inset-bottom)");
      div.style.setProperty("padding-left", "env(safe-area-inset-left)");
      div.style.setProperty("overflow", "hidden");
      div.style.setProperty("visibility", "hidden");
      document.body.appendChild(div);
      const style = window.getComputedStyle(div);
      const width = parseFloat(style.getPropertyValue("width"));
      const height = parseFloat(style.getPropertyValue("height"));
      if (typeof CSS !== "undefined" && typeof CSS.supports === "function"
          && CSS.supports("padding-top: env(safe-area-inset-top)")) {
        insetTop = parseFloat(style.getPropertyValue("padding-top"));
        insetRight = parseFloat(style.getPropertyValue("padding-right"));
        insetBottom = parseFloat(style.getPropertyValue("padding-bottom"));
        insetLeft = parseFloat(style.getPropertyValue("padding-left"));
      }
      document.body.removeChild(div);
      document.documentElement.style.width = documentWidth;
      document.documentElement.style.height = documentHeight;
      let orientation: OrientationType | undefined =
          (screen as any).msOrientation ||
          (screen as any).mozOrientation ||
          (screen.orientation || {}).type;
      if (!orientation) {
        switch (window.orientation) {
          case 0: orientation = "portrait-primary"; break;
          case 180: orientation = "portrait-secondary"; break;
          case -90: orientation = "landscape-primary"; break;
          case 90: orientation = "landscape-secondary"; break;
          default: orientation = "landscape-primary";
        }
      }
      const safeArea = {insetTop, insetRight, insetBottom, insetLeft};
      viewport = {width, height, orientation, safeArea};
      this._viewport = viewport;
    }
    return viewport;
  }

  /** @hidden */
  get solver(): ConstraintSolver | null {
    return this._solver || null;
  }

  /** @hidden */
  activateVariable(variable: ConstrainVariable): void {
    if (this._solver === null) {
      this._solver = new LayoutSolver(this);
    }
    this._solver.addVariable(variable);
  }

  /** @hidden */
  deactivateVariable(variable: ConstrainVariable): void {
    if (this._solver !== null) {
      this._solver.removeVariable(variable);
    }
  }

  /** @hidden */
  setVariableState(variable: ConstrainVariable, state: number): void {
    if (this._solver !== null) {
      this._solver.setVariableState(variable, state);
    }
  }

  /** @hidden */
  activateConstraint(constraint: Constraint): void {
    if (this._solver === null) {
      this._solver = new LayoutSolver(this);
    }
    this._solver.addConstraint(constraint);
  }

  /** @hidden */
  deactivateConstraint(constraint: Constraint): void {
    if (this._solver !== null) {
      this._solver.removeConstraint(constraint);
    }
  }

  /** @hidden */
  updateLayoutStates(): void {
    super.updateLayoutStates();
    const viewport = this.viewport;
    const safeAreaInsetTop = this.hasOwnProperty("safeAreaInsetTop") ? this.safeAreaInsetTop : void 0;
    const safeAreaInsetRight = this.hasOwnProperty("safeAreaInsetRight") ? this.safeAreaInsetRight : void 0;
    const safeAreaInsetBottom = this.hasOwnProperty("safeAreaInsetBottom") ? this.safeAreaInsetBottom : void 0;
    const safeAreaInsetLeft = this.hasOwnProperty("safeAreaInsetLeft") ? this.safeAreaInsetLeft : void 0;
    if (safeAreaInsetTop && !safeAreaInsetTop.enabled()) {
      safeAreaInsetTop.setState(viewport.safeArea.insetTop);
    }
    if (safeAreaInsetRight && !safeAreaInsetRight.enabled()) {
      safeAreaInsetRight.setState(viewport.safeArea.insetRight);
    }
    if (safeAreaInsetBottom && !safeAreaInsetBottom.enabled()) {
      safeAreaInsetBottom.setState(viewport.safeArea.insetBottom);
    }
    if (safeAreaInsetLeft && !safeAreaInsetLeft.enabled()) {
      safeAreaInsetLeft.setState(viewport.safeArea.insetLeft);
    }
  }

  @LayoutAnchor("strong")
  safeAreaInsetTop: LayoutAnchor<this>;

  @LayoutAnchor("strong")
  safeAreaInsetRight: LayoutAnchor<this>;

  @LayoutAnchor("strong")
  safeAreaInsetBottom: LayoutAnchor<this>;

  @LayoutAnchor("strong")
  safeAreaInsetLeft: LayoutAnchor<this>;

  /** @hidden */
  throttleUpdate(): void {
    if (!this._updateTimer) {
      this._updateTimer = setTimeout(this.doUpdate, this._updateDelay) as any;
    }
  }

  /** @hidden */
  doUpdate(): void {
    if (this._updateTimer) {
      clearTimeout(this._updateTimer);
      this._updateTimer = 0;
    }
    const t0 = performance.now();
    if ((this._flags & HtmlAppView.NeedsResize) !== 0) {
      this.doResize();
    }
    if ((this._flags & HtmlAppView.NeedsScroll) !== 0) {
      this.doScroll();
    }
    if ((this._flags & HtmlAppView.NeedsLayout) !== 0) {
      this.doLayout();
    }
    const t1 = performance.now();
    this._updateDelay = Math.min(t1 - t0 > this._updateDelay ? 2 * this._updateDelay : 16, 166);
  }

  /** @hidden */
  throttleResize(): void {
    if ((this._flags & HtmlAppView.NeedsResize) === 0) {
      this._flags |= HtmlAppView.NeedsResize | HtmlAppView.NeedsLayout;
      this.throttleUpdate();
    }
  }

  /** @hidden */
  doResize(): void {
    this._flags &= ~HtmlAppView.NeedsResize;
    this._viewport = null;
    this.cascadeResize();
  }

  /** @hidden */
  throttleScroll(): void {
    if ((this._flags & HtmlAppView.NeedsScroll) === 0) {
      this._flags |= HtmlAppView.NeedsScroll;
      this.throttleUpdate();
    }
  }

  /** @hidden */
  doScroll(): void {
    this._flags &= ~HtmlAppView.NeedsScroll;
    this.cascadeScroll();
  }

  /** @hidden */
  throttleLayout(): void {
    if ((this._flags & HtmlAppView.NeedsLayout) === 0) {
      this._flags |= HtmlAppView.NeedsLayout;
      this.throttleUpdate();
    }
  }

  /** @hidden */
  doLayout(): void {
    this._flags &= ~HtmlAppView.NeedsLayout;
    if (this._solver !== null) {
      this._solver.updateVariables();
      this.cascadeLayout();
    }
  }

  /** @hidden */
  protected debounceReorientation(): void {
    if (this._reorientationTimer) {
      clearTimeout(this._reorientationTimer);
      this._reorientationTimer = 0;
    }
    this._reorientationTimer = setTimeout(this.doReorientation, 500) as any;
  }

  /** @hidden */
  protected doReorientation(): void {
    if (this._reorientationTimer) {
      clearTimeout(this._reorientationTimer);
      this._reorientationTimer = 0;
    }
    this.throttleResize();
  }

  cascadeRootMount(): void {
    if (this.isRootView() && this.isMounted()) {
      this.cascadeMount();
    }
  }

  protected onMount(): void {
    super.onMount();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", this.throttleResize);
      window.addEventListener("scroll", this.throttleScroll, {passive: true});
      window.addEventListener("orientationchange", this.debounceReorientation);
      this.on('click', this.onClick);
    }
    this.doUpdate();
  }

  protected onUnmount(): void {
    if (this._updateTimer) {
      clearTimeout(this._updateTimer);
      this._updateTimer = 0;
    }
    if (this._reorientationTimer) {
      clearTimeout(this._reorientationTimer);
      this._reorientationTimer = 0;
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", this.throttleResize);
      window.removeEventListener("scroll", this.throttleScroll);
      window.removeEventListener("orientationchange", this.debounceReorientation);
      this.off('click', this.onClick);
    }
    super.onUnmount();
  }

  protected onClick(event: Event): void {
    this.onFallthroughClick(event);
  }

  onFallthroughClick(event: Event): void {
    this.hidePopovers();
  }

  /** @hidden */
  static readonly NeedsResize: number = 1 << 0;
  /** @hidden */
  static readonly NeedsScroll: number = 1 << 1;
  /** @hidden */
  static readonly NeedsLayout: number = 1 << 2;
}
