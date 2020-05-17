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

import {ConstrainVariable, Constraint, ConstraintSolver} from "@swim/constraint";
import {LayoutManager} from "../layout/LayoutManager";
import {LayoutSolver} from "../layout/LayoutSolver";
import {LayoutAnchor} from "../layout/LayoutAnchor";
import {ViewEdgeInsets} from "../ViewMetrics";
import {ViewportColorScheme, Viewport} from "../Viewport";
import {ViewIdiom} from "../ViewIdiom";
import {ViewContext} from "../ViewContext";
import {ViewFlags, View} from "../View";
import {ModalOptions, Modal} from "../modal/Modal";
import {RootView} from "../root/RootView";
import {RootViewObserver} from "../root/RootViewObserver";
import {ViewNode} from "../node/NodeView";
import {HtmlView} from "../html/HtmlView";
import {UiViewContext} from "./UiViewContext";
import {UiViewObserver} from "./UiViewObserver";
import {UiViewController} from "./UiViewController";

export class UiView extends HtmlView implements RootView, LayoutManager {
  /** @hidden */
  readonly _viewContext: UiViewContext;
  /** @hidden */
  _processTimer: number;
  /** @hidden */
  _displayFrame: number;
  /** @hidden */
  _updateDelay: number;
  /** @hidden */
  _reorientationTimer: number;
  /** @hidden */
  _layoutSolver: LayoutSolver | undefined;
  /** @hidden */
  _modals: Modal[] | undefined;

  constructor(node: HTMLElement) {
    super(node);
    this.runProcessPass = this.runProcessPass.bind(this);
    this.runDisplayPass = this.runDisplayPass.bind(this);
    this.throttleResize = this.throttleResize.bind(this);
    this.throttleScroll = this.throttleScroll.bind(this);
    this.debounceReorientation = this.debounceReorientation.bind(this);
    this.doReorientation = this.doReorientation.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this._processTimer = 0;
    this._displayFrame = 0;
    this._updateDelay = UiView.MinUpdateDelay;
    this._reorientationTimer = 0;
    this._viewContext = this.createViewContext();
    this.initUi();
  }

  protected initUi(): void {
    this.doRootMount();
  }

  get viewController(): UiViewController | null {
    return this._viewController;
  }

  @LayoutAnchor<UiView>({
    get(oldState: number): number {
      const newState = this.viewport.safeArea.insetTop;
      if (oldState !== newState) {
        this.requireUpdate(View.NeedsLayout);
      }
      return newState;
    },
    strength: "strong",
  })
  safeAreaInsetTop: LayoutAnchor<this>;

  @LayoutAnchor<UiView>({
    get(oldState: number): number {
      const newState = this.viewport.safeArea.insetRight;
      if (oldState !== newState) {
        this.requireUpdate(View.NeedsLayout);
      }
      return newState;
    },
    strength: "strong",
  })
  safeAreaInsetRight: LayoutAnchor<this>;

  @LayoutAnchor<UiView>({
    get(oldState: number): number {
      const newState = this.viewport.safeArea.insetBottom;
      if (oldState !== newState) {
        this.requireUpdate(View.NeedsLayout);
      }
      return newState;
    },
    strength: "strong",
  })
  safeAreaInsetBottom: LayoutAnchor<this>;

  @LayoutAnchor<UiView>({
    get(oldState: number): number {
      const newState = this.viewport.safeArea.insetLeft;
      if (oldState !== newState) {
        this.requireUpdate(View.NeedsLayout);
      }
      return newState;
    },
    strength: "strong",
  })
  safeAreaInsetLeft: LayoutAnchor<this>;

  /** @hidden */
  isRootView(): boolean {
    let node = this._node as Node;
    do {
      const parentNode: ViewNode | null = node.parentNode;
      if (parentNode !== null) {
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

  /** @hidden */
  protected doRootMount(): void {
    if (this.isRootView()) {
      if (!this.isMounted() && this.isNodeMounted()) {
        this.cascadeMount();
      }
      if (this.isMounted() && !this.isPowered() && this.isUiPowered()) {
        this.cascadePower();
      }
    }
  }

  protected onMount(): void {
    super.onMount();
    this.addEventListeners(this._node);
  }

  protected onUnmount(): void {
    this.removeEventListeners(this._node);
    super.onUnmount();
  }

  /** @hidden */
  isUiPowered(): boolean {
    return document.visibilityState === "visible";
  }

  protected onPower(): void {
    super.onPower();
    this.requireUpdate(View.NeedsResize | View.NeedsScroll);
  }

  protected onUnpower(): void {
    this.cancelUpdate();
    if (this._reorientationTimer !== 0) {
      clearTimeout(this._reorientationTimer);
      this._reorientationTimer = 0;
    }
    this._updateDelay = UiView.MinUpdateDelay;
    super.onUnpower();
  }

  protected modifyUpdate(updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = super.modifyUpdate(updateFlags);
    if ((updateFlags & View.NeedsResize) !== 0) {
      additionalFlags |= View.NeedsLayout;
    }
    return additionalFlags;
  }

  requestUpdate(updateFlags: ViewFlags, immediate: boolean): void {
    updateFlags = this.willRequestUpdate(updateFlags, immediate);
    if (immediate && this._updateDelay <= UiView.MaxProcessInterval) {
      this.runImmediatePass();
    } else {
      this.scheduleUpdate();
    }
    this.didRequestUpdate(updateFlags, immediate);
  }

  /** @hidden */
  protected scheduleUpdate(): void {
    const viewFlags = this._viewFlags;
    if (this._displayFrame === 0 && this._processTimer === 0
        && (viewFlags & (View.ProcessingFlag | View.DisplayingFlag)) === 0) {
      if ((viewFlags & View.ProcessMask) !== 0) {
        this._processTimer = setTimeout(this.runProcessPass, this._updateDelay) as any;
      } else if ((viewFlags & View.DisplayMask) !== 0) {
        this._displayFrame = requestAnimationFrame(this.runDisplayPass);
      }
    }
  }

  /** @hidden */
  protected cancelUpdate(): void {
    if (this._processTimer !== 0) {
      clearTimeout(this._processTimer);
      this._processTimer = 0;
    }
    if (this._displayFrame !== 0) {
      cancelAnimationFrame(this._displayFrame);
      this._displayFrame = 0;
    }
  }

  protected runImmediatePass(): void {
    if ((this._viewFlags & View.ProcessMask) !== 0) {
      this.cancelUpdate();
      this.runProcessPass(true);
    }
    if ((this._viewFlags & View.DisplayMask) !== 0 && this._updateDelay <= UiView.MaxProcessInterval) {
      this.cancelUpdate();
      this.runDisplayPass(void 0, true);
    }
  }

  /** @hidden */
  runProcessPass(immediate: boolean = false): void {
    if (immediate) {
      this._viewFlags |= View.ImmediateFlag;
    }

    const viewContext = this._viewContext;
    const t0 = performance.now();
    viewContext.updateTime = t0;
    let processFlags = this._viewFlags;
    processFlags = this.needsProcess(processFlags, viewContext);
    this.doProcess(processFlags, viewContext);

    const t1 = performance.now();
    let processDelay = Math.max(UiView.MinProcessInterval, this._updateDelay);
    if (t1 - t0 > processDelay) {
      this._updateDelay = Math.min(Math.max(2, this._updateDelay << 1), UiView.MaxUpdateDelay);
    } else {
      this._updateDelay = Math.min(UiView.MinUpdateDelay, this._updateDelay >>> 1);
    }

    this.cancelUpdate();
    if ((this._viewFlags & View.DisplayMask) !== 0) {
      this._displayFrame = requestAnimationFrame(this.runDisplayPass);
    } else if ((this._viewFlags & View.ProcessMask) !== 0) {
      if ((this._viewFlags & View.ImmediateFlag) !== 0) {
        processDelay = Math.max(UiView.MaxProcessInterval, processDelay);
      }
      this._processTimer = setTimeout(this.runProcessPass, processDelay) as any;
    }

    if (!immediate) {
      this._viewFlags &= ~View.ImmediateFlag;
    }
  }

  /** @hidden */
  runDisplayPass(time?: number, immediate: boolean = false): void {
    if (immediate) {
      this._viewFlags |= View.ImmediateFlag;
    }

    const viewContext = this._viewContext;
    let displayFlags = this._viewFlags;
    displayFlags = this.needsDisplay(displayFlags, viewContext);
    this.doDisplay(displayFlags, viewContext);

    this.cancelUpdate();
    if ((this._viewFlags & View.ProcessMask) !== 0) {
      let processDelay = this._updateDelay;
      if ((this._viewFlags & View.ImmediateFlag) !== 0) {
        processDelay = Math.max(UiView.MaxProcessInterval, processDelay);
      }
      this._processTimer = setTimeout(this.runProcessPass, processDelay) as any;
    } else if ((this._viewFlags & View.DisplayMask) !== 0) {
      this._displayFrame = requestAnimationFrame(this.runDisplayPass);
    }

    if (!immediate) {
      this._viewFlags &= ~View.ImmediateFlag;
    }
  }

  cascadeProcess(processFlags: ViewFlags, viewContext: ViewContext): void {
    // ignore ancestor updates
  }

  /** @hidden */
  protected doProcess(processFlags: ViewFlags, viewContext: UiViewContext): void {
    let cascadeFlags = processFlags;
    this._viewFlags &= ~(View.NeedsProcess | View.NeedsProject);
    this.willProcess(viewContext);
    this._viewFlags |= View.ProcessingFlag;
    try {
      if (((this._viewFlags | processFlags) & View.NeedsResize) !== 0) {
        cascadeFlags |= View.NeedsResize;
        this._viewFlags &= ~View.NeedsResize;
        this.willResize(viewContext);
      }
      if (((this._viewFlags | processFlags) & View.NeedsScroll) !== 0) {
        cascadeFlags |= View.NeedsScroll;
        this._viewFlags &= ~View.NeedsScroll;
        this.willScroll(viewContext);
      }
      if (((this._viewFlags | processFlags) & View.NeedsDerive) !== 0) {
        cascadeFlags |= View.NeedsDerive;
        this._viewFlags &= ~View.NeedsDerive;
        this.willDerive(viewContext);
      }
      if (((this._viewFlags | processFlags) & View.NeedsAnimate) !== 0) {
        cascadeFlags |= View.NeedsAnimate;
        this._viewFlags &= ~View.NeedsAnimate;
        this.willAnimate(viewContext);
      }

      this.onProcess(viewContext);
      if ((cascadeFlags & View.NeedsResize) !== 0) {
        this.onResize(viewContext);
      }
      if ((cascadeFlags & View.NeedsScroll) !== 0) {
        this.onScroll(viewContext);
      }
      if ((cascadeFlags & View.NeedsDerive) !== 0) {
        this.onDerive(viewContext);
      }
      if ((cascadeFlags & View.NeedsAnimate) !== 0) {
        this.onAnimate(viewContext);
      }

      this.doProcessChildViews(cascadeFlags, viewContext);

      if ((cascadeFlags & View.NeedsAnimate) !== 0) {
        this.didAnimate(viewContext);
      }
      if ((cascadeFlags & View.NeedsDerive) !== 0) {
        this.didDerive(viewContext);
      }
      if ((cascadeFlags & View.NeedsScroll) !== 0) {
        this.didScroll(viewContext);
      }
      if ((cascadeFlags & View.NeedsResize) !== 0) {
        this.didResize(viewContext);
      }
    } finally {
      this._viewFlags &= ~View.ProcessingFlag;
      this.didProcess(viewContext);
    }
  }

  cascadeDisplay(displayFlags: ViewFlags, viewContext: ViewContext): void {
    // ignore ancestor updates
  }

  protected updateLayoutStates(): void {
    super.updateLayoutStates();
    const safeAreaInsetTop = this.getLayoutAnchor("safeAreaInsetTop");
    if (safeAreaInsetTop !== null) {
      this.safeAreaInsetTop.updateState();
    }
    const safeAreaInsetRight = this.getLayoutAnchor("safeAreaInsetRight");
    if (safeAreaInsetRight !== null) {
      safeAreaInsetRight.updateState();
    }
    const safeAreaInsetBottom = this.getLayoutAnchor("safeAreaInsetBottom");
    if (safeAreaInsetBottom !== null) {
      safeAreaInsetBottom.updateState();
    }
    const safeAreaInsetLeft = this.getLayoutAnchor("safeAreaInsetLeft");
    if (safeAreaInsetLeft !== null) {
      safeAreaInsetLeft.updateState();
    }
  }

  protected willResize(viewContext: UiViewContext): void {
    this.willObserve(function (viewObserver: UiViewObserver): void {
      if (viewObserver.viewWillResize !== void 0) {
        viewObserver.viewWillResize(viewContext, this);
      }
    });
  }

  protected onResize(viewContext: UiViewContext): void {
    this._viewContext.viewport = this.detectViewport();
  }

  protected didResize(viewContext: UiViewContext): void {
    this.didObserve(function (viewObserver: UiViewObserver): void {
      if (viewObserver.viewDidResize !== void 0) {
        viewObserver.viewDidResize(viewContext, this);
      }
    });
  }

  /** @hidden */
  get layoutSolver(): ConstraintSolver | null {
    const layoutSolver = this._layoutSolver;
    return layoutSolver !== void 0 ? layoutSolver : null;
  }

  /** @hidden */
  activateConstraint(constraint: Constraint): void {
    let layoutSolver = this._layoutSolver;
    if (layoutSolver === void 0) {
      layoutSolver = new LayoutSolver(this);
      this._layoutSolver = layoutSolver;
    }
    layoutSolver.addConstraint(constraint);
  }

  /** @hidden */
  deactivateConstraint(constraint: Constraint): void {
    const layoutSolver = this._layoutSolver;
    if (layoutSolver !== void 0) {
      layoutSolver.removeConstraint(constraint);
    }
  }

  /** @hidden */
  activateConstraintVariable(constraintVariable: ConstrainVariable): void {
    let layoutSolver = this._layoutSolver;
    if (layoutSolver === void 0) {
      layoutSolver = new LayoutSolver(this);
      this._layoutSolver = layoutSolver;
    }
    layoutSolver.addConstraintVariable(constraintVariable);
  }

  /** @hidden */
  deactivateConstraintVariable(constraintVariable: ConstrainVariable): void {
    const layoutSolver = this._layoutSolver;
    if (layoutSolver !== void 0) {
      layoutSolver.removeConstraintVariable(constraintVariable);
    }
  }

  /** @hidden */
  setConstraintVariable(constraintVariable: ConstrainVariable, state: number): void {
    const layoutSolver = this._layoutSolver;
    if (layoutSolver !== void 0) {
      layoutSolver.setConstraintVariable(constraintVariable, state);
    }
  }

  /** @hidden */
  updateConstraintVariables(): void {
    const layoutSolver = this._layoutSolver;
    if (layoutSolver !== void 0) {
      layoutSolver.updateConstraintVariables();
    }
  }

  /** @hidden */
  didAddConstraint(constraint: Constraint): void {
    this.requireUpdate(View.NeedsLayout);
  }

  /** @hidden */
  didRemoveConstraint(constraint: Constraint): void {
    this.requireUpdate(View.NeedsLayout);
  }

  /** @hidden */
  didAddConstraintVariable(constraintVariable: ConstrainVariable): void {
    this.requireUpdate(View.NeedsLayout);
  }

  /** @hidden */
  didRemoveConstraintVariable(constraintVariable: ConstrainVariable): void {
    this.requireUpdate(View.NeedsLayout);
  }

  /** @hidden */
  didUpdateConstraintVariable(constraintVariable: ConstrainVariable, newValue: number, oldValue: number): void {
    if (oldValue !== newValue) {
      this.requireUpdate(View.NeedsLayout);
    }
  }

  get modals(): ReadonlyArray<Modal> {
    let modals = this._modals;
    if (modals === void 0) {
      modals = [];
      this._modals = modals;
    }
    return modals;
  }

  toggleModal(modal: Modal, options?: ModalOptions): void {
    const modalState = modal.modalState;
    if (modalState === "hidden" || modalState === "hiding") {
      this.presentModal(modal, options);
    } else if (modalState === "shown" || modalState === "showing") {
      this.dismissModal(modal);
    }
  }

  presentModal(modal: Modal, options: ModalOptions = {}): void {
    let modals = this._modals;
    if (modals === void 0) {
      modals = [];
      this._modals = modals;
    }
    if (modals.indexOf(modal) < 0) {
      if (!options.multi) {
        this.dismissModals();
      }
      this.willPresentModal(modal, options);
      modals.push(modal);
      const modalView = modal.modalView;
      if (modalView !== null && !modalView.isMounted()) {
        this.insertModalView(modalView);
      }
      this.onPresentModal(modal, options);
      modal.showModal(true);
      this.didPresentModal(modal, options);
    }
  }

  protected insertModalView(modalView: View): void {
    // subclasses can override to change modal container
    this.appendChildView(modalView);
  }

  protected willPresentModal(modal: Modal, options: ModalOptions): void {
    this.willObserve(function (viewObserver: RootViewObserver): void {
      if (viewObserver.viewWillPresentModal !== void 0) {
        viewObserver.viewWillPresentModal(modal, options, this);
      }
    });
  }

  protected onPresentModal(modal: Modal, options: ModalOptions): void {
    // hook
  }

  protected didPresentModal(modal: Modal, options: ModalOptions): void {
    this.didObserve(function (viewObserver: RootViewObserver): void {
      if (viewObserver.viewDidPresentModal !== void 0) {
        viewObserver.viewDidPresentModal(modal, options, this);
      }
    });
  }

  dismissModal(modal: Modal): void {
    const modals = this._modals;
    if (modals !== void 0) {
      const index = modals.indexOf(modal);
      if (index >= 0) {
        this.willDismissModal(modal);
        modals.splice(index, 1);
        this.onDismissModal(modal);
        modal.hideModal(true);
        this.didDismissModal(modal);
      }
    }
  }

  protected willDismissModal(modal: Modal): void {
    this.willObserve(function (viewObserver: RootViewObserver): void {
      if (viewObserver.viewWillDismissModal !== void 0) {
        viewObserver.viewWillDismissModal(modal, this);
      }
    });
  }

  protected onDismissModal(modal: Modal): void {
    // hook
  }

  protected didDismissModal(modal: Modal): void {
    this.didObserve(function (viewObserver: RootViewObserver): void {
      if (viewObserver.viewDidDismissModal !== void 0) {
        viewObserver.viewDidDismissModal(modal, this);
      }
    });
  }

  dismissModals(): void {
    const modals = this._modals;
    if (modals !== void 0) {
      while (modals.length !== 0) {
        const modal = modals[0];
        this.willDismissModal(modal);
        modals.shift();
        this.onDismissModal(modal);
        modal.hideModal(true);
        this.didDismissModal(modal);
      }
    }
  }

  get viewport(): Viewport {
    return this._viewContext.viewport;
  }

  /** @hidden */
  protected detectViewport(): Viewport {
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
    const safeArea: ViewEdgeInsets = {insetTop, insetRight, insetBottom, insetLeft};
    let orientation: OrientationType | undefined =
        (screen as any).msOrientation ||
        (screen as any).mozOrientation ||
        (screen.orientation || {}).type;
    if (orientation === void 0) {
      switch (window.orientation) {
        case 0: orientation = "portrait-primary"; break;
        case 180: orientation = "portrait-secondary"; break;
        case -90: orientation = "landscape-primary"; break;
        case 90: orientation = "landscape-secondary"; break;
        default: orientation = "landscape-primary";
      }
    }
    let colorScheme: ViewportColorScheme;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      colorScheme = "dark";
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      colorScheme = "light";
    } else {
      colorScheme = "no-preference";
    }
    return {width, height, safeArea, orientation, colorScheme};
  }

  get viewIdiom(): ViewIdiom {
    return this._viewContext.viewIdiom;
  }

  setViewIdiom(newViewIdiom: ViewIdiom): void {
    const viewContext = this._viewContext;
    const oldViewIdiom = viewContext.viewIdiom;
    if (oldViewIdiom !== newViewIdiom) {
      this.willSetViewIdiom(newViewIdiom, oldViewIdiom);
      viewContext.viewIdiom = newViewIdiom;
      this.onSetViewIdiom(newViewIdiom, oldViewIdiom);
      this.didSetViewIdiom(newViewIdiom, oldViewIdiom);
    }
  }

  protected willSetViewIdiom(newViewIdiom: ViewIdiom, oldViewIdiom: ViewIdiom): void {
    // hook
  }

  protected onSetViewIdiom(newViewIdiom: ViewIdiom, oldViewIdiom: ViewIdiom): void {
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetViewIdiom(newViewIdiom: ViewIdiom, oldViewIdiom: ViewIdiom): void {
    // hook
  }

  get viewContext(): ViewContext {
    return this._viewContext;
  }

  protected createViewContext(): UiViewContext {
    return {
      updateTime: performance.now(),
      viewport: this.detectViewport(),
      viewIdiom: "unspecified",
    };
  }

  get rootView(): this {
    return this;
  }

  /** @hidden */
  protected addEventListeners(node: Node): void {
    if (typeof window !== "undefined") {
      window.addEventListener("resize", this.throttleResize);
      window.addEventListener("scroll", this.throttleScroll, {passive: true});
      window.addEventListener("orientationchange", this.debounceReorientation);
    }
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.onVisibilityChange);
    }
    node.addEventListener('click', this.onClick);
  }

  /** @hidden */
  protected removeEventListeners(node: Node): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", this.throttleResize);
      window.removeEventListener("scroll", this.throttleScroll);
      window.removeEventListener("orientationchange", this.debounceReorientation);
    }
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.onVisibilityChange);
    }
    node.removeEventListener('click', this.onClick);
  }

  /** @hidden */
  throttleResize(): void {
    this.requireUpdate(View.NeedsResize | View.NeedsLayout);
  }

  /** @hidden */
  throttleScroll(): void {
    this.requireUpdate(View.NeedsScroll);
  }

  /** @hidden */
  protected debounceReorientation(): void {
    if (this._reorientationTimer !== 0) {
      clearTimeout(this._reorientationTimer);
      this._reorientationTimer = 0;
    }
    this._reorientationTimer = setTimeout(this.doReorientation, 500) as any;
  }

  /** @hidden */
  protected doReorientation(): void {
    if (this._reorientationTimer !== 0) {
      clearTimeout(this._reorientationTimer);
      this._reorientationTimer = 0;
    }
    this.throttleResize();
  }

  /** @hidden */
  protected onVisibilityChange(): void {
    if (this.isMounted()) {
      const powered = this.isPowered();
      const visibilityState = document.visibilityState;
      if (!powered && visibilityState === "visible") {
        this.cascadePower();
      } else if (powered && visibilityState !== "visible") {
        this.cascadeUnpower();
      }
    }
  }

  protected onClick(event: Event): void {
    this.onFallthroughClick(event);
  }

  onFallthroughClick(event: Event): void {
    this.dismissModals();
  }

  /** @hidden */
  static MinUpdateDelay: number = 0;
  /** @hidden */
  static MaxUpdateDelay: number = 167;
  /** @hidden */
  static MinProcessInterval: number = 12;
  /** @hidden */
  static MaxProcessInterval: number = 33;
}
View.Ui = UiView;
