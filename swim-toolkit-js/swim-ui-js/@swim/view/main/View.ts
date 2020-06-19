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

import {BoxR2} from "@swim/math";
import {Transform} from "@swim/transform";
import {AnimatorContext, Animator} from "@swim/animate";
import {
  Constrain,
  ConstrainVariable,
  ConstrainBinding,
  ConstraintRelation,
  AnyConstraintStrength,
  ConstraintStrength,
  Constraint,
} from "@swim/constraint";
import {Viewport} from "./viewport/Viewport";
import {ViewIdiom} from "./viewport/ViewIdiom";
import {ViewContext} from "./ViewContext";
import {ViewObserver} from "./ViewObserver";
import {ViewController} from "./ViewController";
import {RootView} from "./root/RootView";
import {ViewScopeDescriptor, ViewScopeConstructor, ViewScope} from "./scope/ViewScope";
import {ViewAnimatorDescriptor, ViewAnimatorConstructor, ViewAnimator} from "./animator/ViewAnimator";
import {LayoutContext} from "./layout/LayoutContext";
import {LayoutAnchor} from "./layout/LayoutAnchor";
import {GraphicsView} from "./graphics/GraphicsView";
import {GraphicsNodeView} from "./graphics/GraphicsNodeView";
import {GraphicsLeafView} from "./graphics/GraphicsLeafView";
import {RasterView} from "./raster/RasterView";
import {ViewNode, NodeView} from "./node/NodeView";
import {TextView} from "./text/TextView";
import {ElementViewTagMap, ElementViewConstructor, ElementView} from "./element/ElementView";
import {SvgView} from "./svg/SvgView";
import {HtmlView} from "./html/HtmlView";
import {CanvasView} from "./canvas/CanvasView";
import {UiView} from "./ui/UiView";

export type ViewControllerType<V extends View> = V extends {readonly viewController: infer VC} ? VC : unknown;

export type ViewFlags = number;

export interface ViewInit {
}

export interface ViewConstructor<V extends View = View> {
  new(): V;
}

export interface ViewClass {
  /** @hidden */
  _viewScopeDescriptors?: {[scopeName: string]: ViewScopeDescriptor<View, unknown> | undefined};

  /** @hidden */
  _viewAnimatorDescriptors?: {[animatorName: string]: ViewAnimatorDescriptor<View, unknown> | undefined};
}

export abstract class View implements AnimatorContext, LayoutContext {
  abstract get viewController(): ViewController | null;

  abstract setViewController(viewController: ViewControllerType<this> | null): void;

  protected willSetViewController(viewController: ViewControllerType<this> | null): void {
    // hook
  }

  protected onSetViewController(viewController: ViewControllerType<this> | null): void {
    // hook
  }

  protected didSetViewController(viewController: ViewControllerType<this> | null): void {
    // hook
  }

  abstract get viewObservers(): ReadonlyArray<ViewObserver>;

  abstract addViewObserver(viewObserver: ViewObserver): void;

  protected willAddViewObserver(viewObserver: ViewObserver): void {
    // hook
  }

  protected onAddViewObserver(viewObserver: ViewObserver): void {
    // hook
  }

  protected didAddViewObserver(viewObserver: ViewObserver): void {
    // hook
  }

  abstract removeViewObserver(viewObserver: ViewObserver): void;

  protected willRemoveViewObserver(viewObserver: ViewObserver): void {
    // hook
  }

  protected onRemoveViewObserver(viewObserver: ViewObserver): void {
    // hook
  }

  protected didRemoveViewObserver(viewObserver: ViewObserver): void {
    // hook
  }

  protected willObserve(callback: (this: this, viewObserver: ViewObserver) => void): void {
    const viewController = this.viewController;
    if (viewController !== null) {
      callback.call(this, viewController);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      callback.call(this, viewObservers[i]);
    }
  }

  protected didObserve(callback: (this: this, viewObserver: ViewObserver) => void): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      callback.call(this, viewObservers[i]);
    }
    const viewController = this.viewController;
    if (viewController !== null) {
      callback.call(this, viewController);
    }
  }

  abstract get key(): string | null;

  /** @hidden */
  abstract setKey(key: string | null): void;

  abstract get parentView(): View | null;

  /** @hidden */
  abstract setParentView(newParentView: View | null, oldParentView: View | null): void;

  protected willSetParentView(newParentView: View | null, oldParentView: View | null): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillSetParentView !== void 0) {
        viewObserver.viewWillSetParentView(newParentView, oldParentView, this);
      }
    });
  }

  protected onSetParentView(newParentView: View | null, oldParentView: View | null): void {
    if (newParentView !== null) {
      if (newParentView.isMounted()) {
        this.cascadeMount();
        if (newParentView.isPowered()) {
          this.cascadePower();
        }
      }
    } else if (this.isMounted()) {
      try {
        if (this.isPowered()) {
          this.cascadeUnpower();
        }
      } finally {
        this.cascadeUnmount();
      }
    }
  }

  protected didSetParentView(newParentView: View | null, oldParentView: View | null): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidSetParentView !== void 0) {
        viewObserver.viewDidSetParentView(newParentView, oldParentView, this);
      }
    });
  }

  abstract get childViewCount(): number;

  abstract get childViews(): ReadonlyArray<View>;

  abstract forEachChildView<T, S = unknown>(callback: (this: S, childView: View) => T | void,
                                            thisArg?: S): T | undefined;

  abstract getChildView(key: string): View | null;

  abstract setChildView(key: string, newChildView: View | null): View | null;

  abstract appendChildView(childView: View, key?: string): void;

  abstract prependChildView(childView: View, key?: string): void;

  abstract insertChildView(childView: View, targetView: View | null, key?: string): void;

  protected willInsertChildView(childView: View, targetView: View | null | undefined): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillInsertChildView !== void 0) {
        viewObserver.viewWillInsertChildView(childView, targetView, this);
      }
    });
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    // hook
  }

  protected didInsertChildView(childView: View, targetView: View | null | undefined): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidInsertChildView !== void 0) {
        viewObserver.viewDidInsertChildView(childView, targetView, this);
      }
    });
  }

  abstract removeChildView(key: string): View | null;
  abstract removeChildView(childView: View): void;

  abstract removeAll(): void;

  abstract remove(): void;

  protected willRemoveChildView(childView: View): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillRemoveChildView !== void 0) {
        viewObserver.viewWillRemoveChildView(childView, this);
      }
    });
  }

  protected onRemoveChildView(childView: View): void {
    // hook
  }

  protected didRemoveChildView(childView: View): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidRemoveChildView !== void 0) {
        viewObserver.viewDidRemoveChildView(childView, this);
      }
    });
  }

  /** @hidden */
  abstract get viewFlags(): ViewFlags;

  /** @hidden */
  abstract setViewFlags(viewFlags: ViewFlags): void;

  isMounted(): boolean {
    return (this.viewFlags & View.MountedFlag) !== 0;
  }

  abstract cascadeMount(): void;

  protected willMount(): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillMount !== void 0) {
        viewObserver.viewWillMount(this);
      }
    });
  }

  protected onMount(): void {
    // hook
  }

  protected didMount(): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidMount !== void 0) {
        viewObserver.viewDidMount(this);
      }
    });
  }

  abstract cascadeUnmount(): void;

  protected willUnmount(): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillUnmount !== void 0) {
        viewObserver.viewWillUnmount(this);
      }
    });
  }

  protected onUnmount(): void {
    // hook
  }

  protected didUnmount(): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidUnmount !== void 0) {
        viewObserver.viewDidUnmount(this);
      }
    });
  }

  isPowered(): boolean {
    return (this.viewFlags & View.PoweredFlag) !== 0;
  }

  abstract cascadePower(): void;

  protected willPower(): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillPower !== void 0) {
        viewObserver.viewWillPower(this);
      }
    });
  }

  protected onPower(): void {
    // hook
  }

  protected didPower(): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidPower !== void 0) {
        viewObserver.viewDidPower(this);
      }
    });
  }

  abstract cascadeUnpower(): void;

  protected willUnpower(): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillUnpower !== void 0) {
        viewObserver.viewWillUnpower(this);
      }
    });
  }

  protected onUnpower(): void {
    // hook
  }

  protected didUnpower(): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidUnpower !== void 0) {
        viewObserver.viewDidUnpower(this);
      }
    });
  }

  get updateTime(): number {
    const parentView = this.parentView;
    return parentView !== null ? parentView.updateTime : performance.now();
  }

  requireUpdate(updateFlags: ViewFlags, immediate: boolean = false): void {
    updateFlags &= ~View.StatusMask;
    this.willRequireUpdate(updateFlags, immediate);
    const oldUpdateFlags = this.viewFlags;
    const newUpdateFlags = oldUpdateFlags | updateFlags;
    const deltaUpdateFlags = newUpdateFlags & ~oldUpdateFlags;
    if (deltaUpdateFlags !== 0) {
      this.setViewFlags(newUpdateFlags);
      this.requestUpdate(deltaUpdateFlags, immediate);
    }
    this.didRequireUpdate(updateFlags, immediate);
  }

  protected willRequireUpdate(updateFlags: ViewFlags, immediate: boolean): void {
    // hook
  }

  protected didRequireUpdate(updateFlags: ViewFlags, immediate: boolean): void {
    // hook
  }

  requestUpdate(updateFlags: ViewFlags, immediate: boolean): void {
    updateFlags = this.willRequestUpdate(updateFlags, immediate);
    const parentView = this.parentView;
    if (parentView !== null) {
      parentView.requestUpdate(updateFlags, immediate);
    }
    this.didRequestUpdate(updateFlags, immediate);
  }

  protected willRequestUpdate(updateFlags: ViewFlags, immediate: boolean): ViewFlags {
    let additionalFlags = this.modifyUpdate(updateFlags);
    additionalFlags &= ~View.StatusMask;
    if (additionalFlags !== 0) {
      updateFlags |= additionalFlags;
      this.setViewFlags(this.viewFlags | additionalFlags);
    }
    return updateFlags;
  }

  protected didRequestUpdate(updateFlags: ViewFlags, immediate: boolean): void {
    // hook
  }

  protected modifyUpdate(updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & View.ProcessMask) !== 0) {
      additionalFlags |= View.NeedsProcess;
    }
    if ((updateFlags & View.DisplayMask) !== 0) {
      additionalFlags |= View.NeedsDisplay;
    }
    return additionalFlags;
  }

  isUpdating(): boolean {
    return (this.viewFlags & View.UpdatingMask) !== 0;
  }

  isProcessing(): boolean {
    return (this.viewFlags & View.ProcessingFlag) !== 0;
  }

  needsProcess(processFlags: ViewFlags, viewContext: ViewContext): ViewFlags {
    return processFlags;
  }

  abstract cascadeProcess(processFlags: ViewFlags, viewContext: ViewContext): void;

  /** @hidden */
  protected abstract doProcess(processFlags: ViewFlags, viewContext: ViewContext): void;

  protected willProcess(viewContext: ViewContext): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillProcess !== void 0) {
        viewObserver.viewWillProcess(viewContext, this);
      }
    });
  }

  protected onProcess(viewContext: ViewContext): void {
    // hook
  }

  protected didProcess(viewContext: ViewContext): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidProcess !== void 0) {
        viewObserver.viewDidProcess(viewContext, this);
      }
    });
  }

  protected willResize(viewContext: ViewContext): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillResize !== void 0) {
        viewObserver.viewWillResize(viewContext, this);
      }
    });
  }

  protected onResize(viewContext: ViewContext): void {
    // hook
  }

  protected didResize(viewContext: ViewContext): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidResize !== void 0) {
        viewObserver.viewDidResize(viewContext, this);
      }
    });
  }

  protected willScroll(viewContext: ViewContext): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillScroll !== void 0) {
        viewObserver.viewWillScroll(viewContext, this);
      }
    });
  }

  protected onScroll(viewContext: ViewContext): void {
    // hook
  }

  protected didScroll(viewContext: ViewContext): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidScroll !== void 0) {
        viewObserver.viewDidScroll(viewContext, this);
      }
    });
  }

  protected willCompute(viewContext: ViewContext): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillCompute !== void 0) {
        viewObserver.viewWillCompute(viewContext, this);
      }
    });
  }

  protected onCompute(viewContext: ViewContext): void {
    // hook
  }

  protected didCompute(viewContext: ViewContext): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidCompute !== void 0) {
        viewObserver.viewDidCompute(viewContext, this);
      }
    });
  }

  protected willAnimate(viewContext: ViewContext): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillAnimate !== void 0) {
        viewObserver.viewWillAnimate(viewContext, this);
      }
    });
  }

  protected onAnimate(viewContext: ViewContext): void {
    // hook
  }

  protected didAnimate(viewContext: ViewContext): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidAnimate !== void 0) {
        viewObserver.viewDidAnimate(viewContext, this);
      }
    });
  }

  protected willLayout(viewContext: ViewContext): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillLayout !== void 0) {
        viewObserver.viewWillLayout(viewContext, this);
      }
    });
  }

  protected onLayout(viewContext: ViewContext): void {
    // hook
  }

  protected didLayout(viewContext: ViewContext): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidLayout !== void 0) {
        viewObserver.viewDidLayout(viewContext, this);
      }
    });
  }

  /** @hidden */
  protected doProcessChildViews(processFlags: ViewFlags, viewContext: ViewContext): void {
    const childViews = this.childViews;
    if ((processFlags & View.ProcessMask) !== 0 && childViews.length !== 0) {
      this.willProcessChildViews(viewContext);
      for (let i = 0; i < childViews.length; i += 1) {
        const childView = childViews[i];
        const childViewContext = this.childViewContext(childView, viewContext);
        this.doProcessChildView(childView, processFlags, childViewContext);
      }
      this.didProcessChildViews(viewContext);
    }
  }

  /** @hidden */
  protected doProcessChildView(childView: View, processFlags: ViewFlags, viewContext: ViewContext): void {
    childView.cascadeProcess(processFlags, viewContext);
  }

  /** @hidden */
  protected willProcessChildViews(viewContext: ViewContext): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillProcessChildViews !== void 0) {
        viewObserver.viewWillProcessChildViews(viewContext, this);
      }
    });
  }

  /** @hidden */
  protected didProcessChildViews(viewContext: ViewContext): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidProcessChildViews !== void 0) {
        viewObserver.viewDidProcessChildViews(viewContext, this);
      }
    });
  }

  isDisplaying(): boolean {
    return (this.viewFlags & View.DisplayingFlag) !== 0;
  }

  needsDisplay(displayFlags: ViewFlags, viewContext: ViewContext): ViewFlags {
    return displayFlags;
  }

  abstract cascadeDisplay(displayFlags: ViewFlags, viewContext: ViewContext): void;

  /** @hidden */
  protected abstract doDisplay(displayFlags: ViewFlags, viewContext: ViewContext): void;

  protected willDisplay(viewContext: ViewContext): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillDisplay !== void 0) {
        viewObserver.viewWillDisplay(viewContext, this);
      }
    });
  }

  protected onDisplay(viewContext: ViewContext): void {
    // hook
  }

  protected didDisplay(viewContext: ViewContext): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidDisplay !== void 0) {
        viewObserver.viewDidDisplay(viewContext, this);
      }
    });
  }

  /** @hidden */
  protected doDisplayChildViews(displayFlags: ViewFlags, viewContext: ViewContext): void {
    const childViews = this.childViews;
    if ((displayFlags & View.DisplayMask) !== 0 && childViews.length !== 0) {
      this.willDisplayChildViews(viewContext);
      for (let i = 0; i < childViews.length; i += 1) {
        const childView = childViews[i];
        const childViewContext = this.childViewContext(childView, viewContext);
        this.doDisplayChildView(childView, displayFlags, childViewContext);
      }
      this.didDisplayChildViews(viewContext);
    }
  }

  /** @hidden */
  protected doDisplayChildView(childView: View, displayFlags: ViewFlags, viewContext: ViewContext): void {
    childView.cascadeDisplay(displayFlags, viewContext);
  }

  /** @hidden */
  protected willDisplayChildViews(viewContext: ViewContext): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillDisplayChildViews !== void 0) {
        viewObserver.viewWillDisplayChildViews(viewContext, this);
      }
    });
  }

  /** @hidden */
  protected didDisplayChildViews(viewContext: ViewContext): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidDisplayChildViews !== void 0) {
        viewObserver.viewDidDisplayChildViews(viewContext, this);
      }
    });
  }

  childViewContext(childView: View, viewContext: ViewContext): ViewContext {
    return viewContext;
  }

  abstract hasViewScope(scopeName: string): boolean;

  abstract getViewScope(scopeName: string): ViewScope<this, unknown> | null;

  abstract setViewScope(scopeName: string, viewScope: ViewScope<this, unknown> | null): void;

  /** @hidden */
  getLazyViewScope(scopeName: string): ViewScope<this, unknown> | null {
    let viewScope = this.getViewScope(scopeName);
    if (viewScope === null) {
      const viewClass = (this as any).__proto__ as ViewClass;
      const descriptor = View.getViewScopeDescriptor(scopeName, viewClass);
      if (descriptor !== null && descriptor.scopeType !== void 0) {
        const ViewScope = descriptor.scopeType;
        viewScope = new ViewScope<this>(this, scopeName, descriptor);
        this.setViewScope(scopeName, viewScope);
      }
    }
    return viewScope
  }

  /** @hidden */
  viewScopeDidSetAuto<T, U>(viewScope: ViewScope<View, T, U>, auto: boolean): void {
    if (auto) {
      this.requireUpdate(View.NeedsCompute);
    }
  }

  /** @hidden */
  viewScopeDidSetState<T, U>(viewScope: ViewScope<View, T, U>, newState: T | undefined, oldState: T | undefined): void {
    this.requireUpdate(View.NeedsCompute);
  }

  abstract hasViewAnimator(animatorName: string): boolean;

  abstract getViewAnimator(animatorName: string): ViewAnimator<this, unknown> | null;

  abstract setViewAnimator(animatorName: string, animator: ViewAnimator<this, unknown> | null): void;

  /** @hidden */
  getLazyViewAnimator(animatorName: string): ViewAnimator<this, unknown> | null {
    let viewAnimator = this.getViewAnimator(animatorName);
    if (viewAnimator === null) {
      const viewClass = (this as any).__proto__ as ViewClass;
      const descriptor = View.getViewAnimatorDescriptor(animatorName, viewClass);
      if (descriptor !== null && descriptor.animatorType !== void 0) {
        const ViewAnimator = descriptor.animatorType;
        viewAnimator = new ViewAnimator<this>(this, animatorName, descriptor);
        this.setViewAnimator(animatorName, viewAnimator);
      }
    }
    return viewAnimator;
  }

  /** @hidden */
  animatorDidSetAuto(animator: Animator, auto: boolean): void {
    if (auto && animator instanceof View.Animator) {
      this.requireUpdate(View.NeedsCompute);
    }
  }

  /** @hidden */
  animate(animator: Animator): void {
    this.requireUpdate(View.NeedsAnimate);
  }

  abstract hasLayoutAnchor(anchorName: string): boolean;

  abstract getLayoutAnchor(anchorName: string): LayoutAnchor<this> | null;

  abstract setLayoutAnchor(anchorName: string, layoutAnchor: LayoutAnchor<this> | null): void;

  constraint(lhs: Constrain | number, relation: ConstraintRelation,
             rhs?: Constrain | number, strength?: AnyConstraintStrength): Constraint {
    if (typeof lhs === "number") {
      lhs = Constrain.constant(lhs);
    }
    if (typeof rhs === "number") {
      rhs = Constrain.constant(rhs);
    }
    const constrain = rhs !== void 0 ? lhs.minus(rhs) : lhs;
    if (strength === void 0) {
      strength = ConstraintStrength.Required;
    } else {
      strength = ConstraintStrength.fromAny(strength);
    }
    return new Constraint(this, constrain, relation, strength);
  }

  abstract get constraints(): ReadonlyArray<Constraint>;

  abstract hasConstraint(constraint: Constraint): boolean;

  abstract addConstraint(constraint: Constraint): void;

  abstract removeConstraint(constraint: Constraint): void;

  /** @hidden */
  activateConstraint(constraint: Constraint): void {
    const rootView = this.rootView;
    if (rootView !== null) {
      rootView.activateConstraint(constraint);
      this.requireUpdate(View.NeedsLayout);
    }
  }

  /** @hidden */
  deactivateConstraint(constraint: Constraint): void {
    const rootView = this.rootView;
    if (rootView !== null) {
      rootView.deactivateConstraint(constraint);
      this.requireUpdate(View.NeedsLayout);
    }
  }

  constraintVariable(name: string, value?: number, strength?: AnyConstraintStrength): ConstrainVariable {
    if (value === void 0) {
      value = 0;
    }
    if (strength === void 0) {
      strength = ConstraintStrength.Strong;
    } else {
      strength = ConstraintStrength.fromAny(strength);
    }
    return new ConstrainBinding(this, name, value, strength);
  }

  abstract get constraintVariables(): ReadonlyArray<ConstrainVariable>;

  abstract hasConstraintVariable(constraintVariable: ConstrainVariable): boolean;

  abstract addConstraintVariable(constraintVariable: ConstrainVariable): void;

  abstract removeConstraintVariable(constraintVariable: ConstrainVariable): void;

  /** @hidden */
  activateConstraintVariable(constraintVariable: ConstrainVariable): void {
    const rootView = this.rootView;
    if (rootView !== null) {
      rootView.activateConstraintVariable(constraintVariable);
      this.requireUpdate(View.NeedsLayout);
    }
  }

  /** @hidden */
  deactivateConstraintVariable(constraintVariable: ConstrainVariable): void {
    const rootView = this.rootView;
    if (rootView !== null) {
      rootView.deactivateConstraintVariable(constraintVariable);
      this.requireUpdate(View.NeedsLayout);
    }
  }

  /** @hidden */
  setConstraintVariable(constraintVariable: ConstrainVariable, state: number): void {
    const rootView = this.rootView;
    if (rootView !== null) {
      rootView.setConstraintVariable(constraintVariable, state);
    }
  }

  get viewport(): Viewport | null {
    const parentView = this.parentView;
    return parentView !== null ? parentView.viewport : null;
  }

  get viewIdiom(): ViewIdiom {
    const parentView = this.parentView;
    return parentView !== null ? parentView.viewIdiom : "unspecified";
  }

  get rootView(): RootView | null {
    const parentView = this.parentView;
    return parentView !== null ? parentView.rootView : null;
  }

  /**
   * Returns the transformation from the parent view coordinates to view
   * coordinates.
   */
  abstract get parentTransform(): Transform;

  /**
   * Returns the transformation from page coordinates to view coordinates.
   */
  get pageTransform(): Transform {
    const parentView = this.parentView;
    if (parentView !== null) {
      return parentView.pageTransform.transform(this.parentTransform);
    } else {
      return Transform.identity();
    }
  }

  get pageBounds(): BoxR2 {
    const clientBounds = this.clientBounds;
    const clientTransform = this.clientTransform;
    return clientBounds.transform(clientTransform);
  }

  /**
   * Returns the bounding box, in page coordinates, the edges to which attached
   * popovers should point.
   */
  get popoverFrame(): BoxR2 {
    return this.pageBounds;
  }

  /**
   * Returns the transformation from viewport coordinates to view coordinates.
   */
  get clientTransform(): Transform {
    let clientTransform: Transform;
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;
    if (scrollX !== 0 || scrollY !== 0) {
      clientTransform = Transform.translate(scrollX, scrollY);
    } else {
      clientTransform = Transform.identity();
    }
    const pageTransform = this.pageTransform;
    return clientTransform.transform(pageTransform);
  }

  abstract get clientBounds(): BoxR2;

  intersectsViewport(): boolean {
    const bounds = this.clientBounds;
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    return (bounds.top <= 0 && 0 < bounds.bottom || 0 <= bounds.top && bounds.top < viewportHeight)
        && (bounds.left <= 0 && 0 < bounds.right || 0 <= bounds.left && bounds.left < viewportWidth);
  }

  abstract dispatchEvent(event: Event): boolean;

  abstract on(type: string, listener: EventListenerOrEventListenerObject,
              options?: AddEventListenerOptions | boolean): this;

  abstract off(type: string, listener: EventListenerOrEventListenerObject,
               options?: EventListenerOptions | boolean): this;

  /** @hidden */
  static getViewScopeDescriptor<V extends View>(scopeName: string, viewClass: ViewClass | null = null): ViewScopeDescriptor<V, unknown> | null {
    if (viewClass === null) {
      viewClass = this.prototype as unknown as ViewClass;
    }
    do {
      if (viewClass.hasOwnProperty("_viewScopeDescriptors")) {
        const descriptor = viewClass._viewScopeDescriptors![scopeName];
        if (descriptor !== void 0) {
          return descriptor;
        }
      }
      viewClass = (viewClass as any).__proto__ as ViewClass | null;
    } while (viewClass !== null);
    return null;
  }

  /** @hidden */
  static decorateViewScope<V extends View, T, U>(ViewScope: ViewScopeConstructor<T, U>,
                                                 descriptor: ViewScopeDescriptor<V, T, U> | undefined,
                                                 viewClass: ViewClass, scopeName: string): void {
    if (!viewClass.hasOwnProperty("_viewScopeDescriptors")) {
      viewClass._viewScopeDescriptors = {};
    }
    viewClass._viewScopeDescriptors![scopeName] = descriptor;
    Object.defineProperty(viewClass, scopeName, {
      get: function (this: V): ViewScope<V, T, U> {
        let viewScope = this.getViewScope(scopeName) as ViewScope<V, T, U> | null;
        if (viewScope === null) {
          viewScope = new ViewScope<V>(this, scopeName, descriptor);
          this.setViewScope(scopeName, viewScope);
        }
        return viewScope;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static getViewAnimatorDescriptor<V extends View>(animatorName: string, viewClass: ViewClass | null): ViewAnimatorDescriptor<V, unknown> | null {
    while (viewClass !== null) {
      if (viewClass.hasOwnProperty("_viewAnimatorDescriptors")) {
        const descriptor = viewClass._viewAnimatorDescriptors![animatorName];
        if (descriptor !== void 0) {
          return descriptor;
        }
      }
      viewClass = (viewClass as any).__proto__ as ViewClass | null;
    }
    return null;
  }

  /** @hidden */
  static decorateViewAnimator<V extends View, T, U>(ViewAnimator: ViewAnimatorConstructor<T, U>,
                                                    descriptor: ViewAnimatorDescriptor<V, T, U> | undefined,
                                                    viewClass: ViewClass, animatorName: string): void {
    if (!viewClass.hasOwnProperty("_viewAnimatorDescriptors")) {
      viewClass._viewAnimatorDescriptors = {};
    }
    viewClass._viewAnimatorDescriptors![animatorName] = descriptor;
    Object.defineProperty(viewClass, animatorName, {
      get: function (this: V): ViewAnimator<V, T, U> {
        let animator = this.getViewAnimator(animatorName) as ViewAnimator<V, T, U> | null;
        if (animator === null) {
          animator = new ViewAnimator<V>(this, animatorName, descriptor);
          this.setViewAnimator(animatorName, animator);
        }
        return animator;
      },
      configurable: true,
      enumerable: true,
    });
  }

  static fromTag<T extends keyof ElementViewTagMap>(tag: T): ElementViewTagMap[T];
  static fromTag(tag: string): ElementView;
  static fromTag(tag: string): ElementView {
    if (tag === "svg") {
      return new View.Svg(document.createElementNS(View.Svg.namespace, tag) as SVGElement);
    } else if (tag === "canvas") {
      return new View.Canvas(document.createElement(tag) as HTMLCanvasElement);
    } else {
      return new View.Html(document.createElement(tag));
    }
  }

  static fromNode(node: HTMLCanvasElement): CanvasView;
  static fromNode(node: HTMLElement): HtmlView;
  static fromNode(node: SVGElement): SvgView;
  static fromNode(node: Element): ElementView;
  static fromNode(node: Text): TextView;
  static fromNode(node: Node): NodeView;
  static fromNode(node: ViewNode): NodeView {
    if (node.view instanceof View) {
      return node.view;
    } else {
      let view: NodeView;
      if (node instanceof Element) {
        if (node instanceof HTMLElement) {
          if (node instanceof HTMLCanvasElement) {
            view = new View.Canvas(node);
          } else {
            view = new View.Html(node);
          }
        } else if (node instanceof SVGElement) {
          view = new View.Svg(node);
        } else {
          view = new View.Element(node);
        }
      } else if (node instanceof Text) {
        view = new View.Text(node);
      } else {
        view = new View.Node(node);
      }
      const parentView = view.parentView;
      if (parentView !== null) {
        view.setParentView(parentView, null);
      }
      return view;
    }
  }

  static fromConstructor<C extends ElementViewConstructor | ViewConstructor>(viewConstructor: C): InstanceType<C>;
  static fromConstructor(viewConstructor: ElementViewConstructor | ViewConstructor): View {
    if (View.Element.isConstructor(viewConstructor)) {
      if (viewConstructor.namespace === void 0) {
        return new viewConstructor(document.createElement(viewConstructor.tag));
      } else {
        return new viewConstructor(document.createElementNS(viewConstructor.namespace, viewConstructor.tag));
      }
    } else if (typeof viewConstructor === "function") {
      return new viewConstructor();
    }
    throw new TypeError("" + viewConstructor);
  }

  static create<T extends keyof ElementViewTagMap>(tag: T): ElementViewTagMap[T];
  static create(tag: string): ElementView;
  static create(node: HTMLElement): HtmlView;
  static create(node: SVGElement): SvgView;
  static create(node: Element): ElementView;
  static create(node: Text): TextView;
  static create(node: Node): NodeView;
  static create<C extends ElementViewConstructor>(viewConstructor: C): InstanceType<C>;
  static create<C extends ViewConstructor>(viewConstructor: C): InstanceType<C>;
  static create(source: string | Node | ElementViewConstructor | ViewConstructor): View {
    if (typeof source === "string") {
      return View.fromTag(source);
    } else if (source instanceof Node) {
      return View.fromNode(source);
    } else if (typeof source === "function") {
      return View.fromConstructor(source);
    }
    throw new TypeError("" + source);
  }

  /** @hidden */
  static readonly MountedFlag: ViewFlags = 1 << 0;
  /** @hidden */
  static readonly PoweredFlag: ViewFlags = 1 << 1;
  /** @hidden */
  static readonly HiddenFlag: ViewFlags = 1 << 2;
  /** @hidden */
  static readonly CulledFlag: ViewFlags = 1 << 3;
  /** @hidden */
  static readonly ProcessingFlag: ViewFlags = 1 << 4;
  /** @hidden */
  static readonly DisplayingFlag: ViewFlags = 1 << 5;
  /** @hidden */
  static readonly ImmediateFlag: ViewFlags = 1 << 6;
  /** @hidden */
  static readonly RemovingFlag: ViewFlags = 1 << 7;
  /** @hidden */
  static readonly UpdatingMask: ViewFlags = View.ProcessingFlag
                                          | View.DisplayingFlag;
  /** @hidden */
  static readonly StatusMask: ViewFlags = View.MountedFlag
                                        | View.PoweredFlag
                                        | View.HiddenFlag
                                        | View.CulledFlag
                                        | View.ProcessingFlag
                                        | View.DisplayingFlag
                                        | View.RemovingFlag;

  static readonly NeedsProcess: ViewFlags = 1 << 8;
  static readonly NeedsResize: ViewFlags = 1 << 9;
  static readonly NeedsScroll: ViewFlags = 1 << 10;
  static readonly NeedsCompute: ViewFlags = 1 << 11;
  static readonly NeedsAnimate: ViewFlags = 1 << 12;
  static readonly NeedsProject: ViewFlags = 1 << 13;
  /** @hidden */
  static readonly ProcessMask: ViewFlags = View.NeedsProcess
                                         | View.NeedsResize
                                         | View.NeedsScroll
                                         | View.NeedsCompute
                                         | View.NeedsAnimate
                                         | View.NeedsProject;

  static readonly NeedsDisplay: ViewFlags = 1 << 14;
  static readonly NeedsLayout: ViewFlags = 1 << 15;
  static readonly NeedsRender: ViewFlags = 1 << 16;
  static readonly NeedsComposite: ViewFlags = 1 << 17;
  /** @hidden */
  static readonly DisplayMask: ViewFlags = View.NeedsDisplay
                                         | View.NeedsLayout
                                         | View.NeedsRender
                                         | View.NeedsComposite;

  /** @hidden */
  static readonly UpdateMask: ViewFlags = View.ProcessMask
                                        | View.DisplayMask;

  /** @hidden */
  static readonly ViewFlagShift: ViewFlags = 24;
  /** @hidden */
  static readonly ViewFlagMask: ViewFlags = (1 << View.ViewFlagShift) - 1;

  // Forward type declarations
  /** @hidden */
  static Animator: typeof ViewAnimator; // defined by ViewAnimator
  /** @hidden */
  static Root: typeof RootView; // defined by RootView
  /** @hidden */
  static Graphics: typeof GraphicsView; // defined by GraphicsView
  /** @hidden */
  static GraphicsNode: typeof GraphicsNodeView; // defined by GraphicsNodeView
  /** @hidden */
  static GraphicsLeaf: typeof GraphicsLeafView; // defined by GraphicsLeafView
  /** @hidden */
  static Raster: typeof RasterView; // defined by RasterView
  /** @hidden */
  static Node: typeof NodeView; // defined by NodeView
  /** @hidden */
  static Text: typeof TextView; // defined by TextView
  /** @hidden */
  static Element: typeof ElementView; // defined by ElementView
  /** @hidden */
  static Svg: typeof SvgView; // defined by SvgView
  /** @hidden */
  static Html: typeof HtmlView; // defined by HtmlView
  /** @hidden */
  static Canvas: typeof CanvasView; // defined by CanvasView
  /** @hidden */
  static Ui: typeof UiView; // defined by UiView
}
