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
import {Renderer} from "@swim/render";
import {ConstrainVariable, Constraint} from "@swim/constraint";
import {
  ViewContextType,
  ViewContext,
  ViewInit,
  ViewFlags,
  ViewConstructor,
  ViewClass,
  View,
  ViewObserverType,
  ViewControllerType,
  Subview,
  ViewEvent,
  ViewMouseEvent,
  ViewPointerEvent,
  ViewEventHandler,
  ViewService,
  ViewScope,
  ViewAnimator,
  LayoutAnchor,
} from "@swim/view";
import {GraphicsViewContext} from "./GraphicsViewContext";
import {GraphicsViewObserver} from "./GraphicsViewObserver";
import {GraphicsViewController} from "./GraphicsViewController";
import {LayerView} from "./LayerView";
import {RasterView} from "./raster/RasterView";
import {CanvasView} from "./canvas/CanvasView";

export interface GraphicsViewInit extends ViewInit {
  viewController?: GraphicsViewController;
  hidden?: boolean;
}

export interface GraphicsViewConstructor<V extends GraphicsView = GraphicsView> {
  new(): V;
  prototype: V;
}

export interface GraphicsViewClass extends ViewClass {
}

export abstract class GraphicsView extends View {
  /** @hidden */
  _key?: string;
  /** @hidden */
  _parentView: View | null;
  /** @hidden */
  _viewController: ViewControllerType<this> | null;
  /** @hidden */
  _viewObservers?: ViewObserverType<this>[];
  /** @hidden */
  _viewFlags: ViewFlags;
  /** @hidden */
  _subviews?: {[subviewName: string]: Subview<View, View> | undefined};
  /** @hidden */
  _viewServices?: {[serviceName: string]: ViewService<View, unknown> | undefined};
  /** @hidden */
  _viewScopes?: {[scopeName: string]: ViewScope<View, unknown> | undefined};
  /** @hidden */
  _viewAnimators?: {[animatorName: string]: ViewAnimator<View, unknown> | undefined};
  /** @hidden */
  _layoutAnchors?: {[anchorName: string]: LayoutAnchor<View> | undefined};
  /** @hidden */
  _viewFrame?: BoxR2;
  /** @hidden */
  _hoverSet?: {[id: string]: null | undefined};
  /** @hidden */
  _eventHandlers?: {[type: string]: ViewEventHandler[] | undefined};
  /** @hidden */
  _constraints?: Constraint[];
  /** @hidden */
  _constraintVariables?: ConstrainVariable[];

  constructor() {
    super();
    this._parentView = null;
    this._viewController = null;
    this._viewFlags = 0;
  }

  initView(init: GraphicsViewInit): void {
    super.initView(init);
    if (init.hidden !== void 0) {
      this.setHidden(init.hidden);
    }
  }

  get viewController(): GraphicsViewController | null {
    return this._viewController;
  }

  setViewController(newViewController: ViewControllerType<this> | null): void {
    const oldViewController = this._viewController;
    if (oldViewController !== newViewController) {
      this.willSetViewController(newViewController);
      if (oldViewController !== null) {
        oldViewController.setView(null);
      }
      this._viewController = newViewController;
      if (newViewController !== null) {
        newViewController.setView(this);
      }
      this.onSetViewController(newViewController);
      this.didSetViewController(newViewController);
    }
  }

  get viewObservers(): ReadonlyArray<GraphicsViewObserver> {
    let viewObservers = this._viewObservers;
    if (viewObservers === void 0) {
      viewObservers = [];
      this._viewObservers = viewObservers;
    }
    return viewObservers;
  }

  addViewObserver(viewObserver: ViewObserverType<this>): void {
    let viewObservers = this._viewObservers;
    let index: number;
    if (viewObservers === void 0) {
      viewObservers = [];
      this._viewObservers = viewObservers;
      index = -1;
    } else {
      index = viewObservers.indexOf(viewObserver);
    }
    if (index < 0) {
      this.willAddViewObserver(viewObserver);
      viewObservers.push(viewObserver);
      this.onAddViewObserver(viewObserver);
      this.didAddViewObserver(viewObserver);
    }
  }

  removeViewObserver(viewObserver: ViewObserverType<this>): void {
    const viewObservers = this._viewObservers;
    if (viewObservers !== void 0) {
      const index = viewObservers.indexOf(viewObserver);
      if (index >= 0) {
        this.willRemoveViewObserver(viewObserver);
        viewObservers.splice(index, 1);
        this.onRemoveViewObserver(viewObserver);
        this.didRemoveViewObserver(viewObserver);
      }
    }
  }

  protected willObserve<T>(callback: (this: this, viewObserver: ViewObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const viewController = this._viewController;
    if (viewController !== null) {
      result = callback.call(this, viewController);
      if (result !== void 0) {
        return result;
      }
    }
    const viewObservers = this._viewObservers;
    if (viewObservers !== void 0) {
      let i = 0;
      while (i < viewObservers.length) {
        const viewObserver = viewObservers[i];
        result = callback.call(this, viewObserver);
        if (result !== void 0) {
          return result;
        }
        if (viewObserver === viewObservers[i]) {
          i += 1;
        }
      }
    }
    return result;
  }

  protected didObserve<T>(callback: (this: this, viewObserver: ViewObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const viewObservers = this._viewObservers;
    if (viewObservers !== void 0) {
      let i = 0;
      while (i < viewObservers.length) {
        const viewObserver = viewObservers[i];
        result = callback.call(this, viewObserver);
        if (result !== void 0) {
          return result;
        }
        if (viewObserver === viewObservers[i]) {
          i += 1;
        }
      }
    }
    const viewController = this._viewController;
    if (viewController !== null) {
      result = callback.call(this, viewController);
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  get key(): string | undefined {
    return this._key;
  }

  /** @hidden */
  setKey(key: string | undefined): void {
    if (key !== void 0) {
      this._key = key;
    } else if (this._key !== void 0) {
      this._key = void 0;
    }
  }

  get parentView(): View | null {
    return this._parentView;
  }

  /** @hidden */
  setParentView(newParentView: View | null, oldParentView: View | null) {
    this.willSetParentView(newParentView, oldParentView);
    this._parentView = newParentView;
    this.onSetParentView(newParentView, oldParentView);
    this.didSetParentView(newParentView, oldParentView);
  }

  abstract get childViewCount(): number;

  abstract get childViews(): ReadonlyArray<View>;

  abstract firstChildView(): View | null;

  abstract lastChildView(): View | null;

  abstract nextChildView(targetView: View): View | null;

  abstract previousChildView(targetView: View): View | null;

  abstract forEachChildView<T, S = unknown>(callback: (this: S, childView: View) => T | void,
                                            thisArg?: S): T | undefined;

  abstract getChildView(key: string): View | null;

  abstract setChildView(key: string, newChildView: View | null): View | null;

  append<V extends View>(childView: V, key?: string): V;
  append<V extends GraphicsView>(viewConstructor: GraphicsViewConstructor<V>, key?: string): V
  append<V extends View>(viewConstructor: ViewConstructor<V>, key?: string): V;
  append(child: View | ViewConstructor, key?: string): View {
    if (typeof child === "function") {
      child = GraphicsView.fromConstructor(child);
    }
    this.appendChildView(child, key);
    return child;
  }

  abstract appendChildView(childView: View, key?: string): void;

  prepend<V extends View>(childView: V, key?: string): V;
  prepend<V extends GraphicsView>(viewConstructor: GraphicsViewConstructor<V>, key?: string): V
  prepend<V extends View>(viewConstructor: ViewConstructor<V>, key?: string): V;
  prepend(child: View | ViewConstructor, key?: string): View {
    if (typeof child === "function") {
      child = GraphicsView.fromConstructor(child);
    }
    this.prependChildView(child, key);
    return child;
  }

  abstract prependChildView(childView: View, key?: string): void;

  insert<V extends View>(childView: V, target: View | null, key?: string): V;
  insert<V extends GraphicsView>(viewConstructor: GraphicsViewConstructor<V>, target: View | null, key?: string): V
  insert<V extends View>(viewConstructor: ViewConstructor<V>, target: View | null, key?: string): V;
  insert(child: View | ViewConstructor, target: View | null, key?: string): View {
    if (typeof child === "function") {
      child = GraphicsView.fromConstructor(child);
    }
    this.insertChildView(child, target, key);
    return child;
  }

  abstract insertChildView(childView: View, targetView: View | null, key?: string): void;

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    super.onInsertChildView(childView, targetView);
    this.insertSubview(childView);
  }

  cascadeInsert(updateFlags?: ViewFlags, viewContext?: ViewContext): void {
    const viewFlags = this._viewFlags;
    if ((viewFlags & (View.MountedFlag | View.PoweredFlag)) === (View.MountedFlag | View.PoweredFlag)) {
      if (updateFlags === void 0) {
        updateFlags = 0;
      }
      updateFlags |= viewFlags & View.UpdateMask;
      if ((updateFlags & View.ProcessMask) !== 0) {
        if (viewContext === void 0) {
          viewContext = this.superViewContext;
        }
        this.cascadeProcess(updateFlags, viewContext);
      }
    }
  }

  abstract removeChildView(key: string): View | null;
  abstract removeChildView(childView: View): void;

  protected onRemoveChildView(childView: View): void {
    super.onRemoveChildView(childView);
    this.removeSubview(childView);
  }

  abstract removeAll(): void;

  remove(): void {
    const parentView = this._parentView;
    if (parentView !== null) {
      if ((this._viewFlags & View.TraversingFlag) === 0) {
        parentView.removeChildView(this);
      } else {
        this._viewFlags |= View.RemovingFlag;
      }
    }
  }

  get viewClass(): GraphicsViewClass {
    return this.constructor as unknown as GraphicsViewClass;
  }

  /** @hidden */
  get viewFlags(): ViewFlags {
    return this._viewFlags;
  }

  /** @hidden */
  setViewFlags(viewFlags: ViewFlags): void {
    this._viewFlags = viewFlags;
  }

  cascadeMount(): void {
    if ((this._viewFlags & View.MountedFlag) === 0) {
      this._viewFlags |= View.MountedFlag;
      this._viewFlags |= View.TraversingFlag;
      try {
        this.willMount();
        this.onMount();
        this.doMountChildViews();
        this.didMount();
      } finally {
        this._viewFlags &= ~View.TraversingFlag;
      }
    } else {
      throw new Error("already mounted");
    }
  }

  protected onMount(): void {
    super.onMount();
    this.mountServices();
    this.mountScopes();
    this.mountAnimators();
    this.mountSubviews();
  }

  protected didMount(): void {
    this.activateLayout();
    super.didMount();
  }

  /** @hidden */
  protected doMountChildViews(): void {
    this.forEachChildView(function (childView: View): void {
      childView.cascadeMount();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
      }
    }, this);
  }

  cascadeUnmount(): void {
    if ((this._viewFlags & View.MountedFlag) !== 0) {
      this._viewFlags &= ~View.MountedFlag
      this._viewFlags |= View.TraversingFlag;
      try {
        this.willUnmount();
        this.doUnmountChildViews();
        this.onUnmount();
        this.didUnmount();
      } finally {
        this._viewFlags &= ~View.TraversingFlag;
      }
    } else {
      throw new Error("already unmounted");
    }
  }

  protected willUnmount(): void {
    super.willUnmount();
    this.deactivateLayout();
  }

  protected onUnmount(): void {
    this.unmountSubviews();
    this.unmountAnimators();
    this.unmountScopes();
    this.unmountServices();
    this._viewFlags &= ~View.ViewFlagMask | View.RemovingFlag;
  }

  /** @hidden */
  protected doUnmountChildViews(): void {
    this.forEachChildView(function (childView: View): void {
      childView.cascadeUnmount();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
      }
    }, this);
  }

  cascadePower(): void {
    if ((this._viewFlags & View.PoweredFlag) === 0) {
      this._viewFlags |= View.PoweredFlag;
      this._viewFlags |= View.TraversingFlag;
      try {
        this.willPower();
        this.onPower();
        this.doPowerChildViews();
        this.didPower();
      } finally {
        this._viewFlags &= ~View.TraversingFlag;
      }
    } else {
      throw new Error("already powered");
    }
  }

  /** @hidden */
  protected doPowerChildViews(): void {
    this.forEachChildView(function (childView: View): void {
      childView.cascadePower();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
      }
    }, this);
  }

  cascadeUnpower(): void {
    if ((this._viewFlags & View.PoweredFlag) !== 0) {
      this._viewFlags &= ~View.PoweredFlag
      this._viewFlags |= View.TraversingFlag;
      try {
        this.willUnpower();
        this.doUnpowerChildViews();
        this.onUnpower();
        this.didUnpower();
      } finally {
        this._viewFlags &= ~View.TraversingFlag;
      }
    } else {
      throw new Error("already unpowered");
    }
  }

  /** @hidden */
  protected doUnpowerChildViews(): void {
    this.forEachChildView(function (childView: View): void {
      childView.cascadeUnpower();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
      }
    }, this);
  }

  setCulled(culled: boolean): void {
    const viewFlags = this._viewFlags;
    if (culled && (viewFlags & View.CulledFlag) === 0) {
      this._viewFlags = viewFlags | View.CulledFlag;
      if ((viewFlags & View.CullFlag) === 0) {
        this.doCull();
      }
    } else if (!culled && (viewFlags & View.CulledFlag) !== 0) {
      this._viewFlags = viewFlags & ~View.CulledFlag;
      if ((viewFlags & View.CullFlag) === 0) {
        this.doUncull();
      }
    }
  }

  cascadeCull(): void {
    if ((this._viewFlags & View.CullFlag) === 0) {
      this._viewFlags |= View.CullFlag;
      if ((this._viewFlags & View.CulledFlag) === 0) {
        this.doCull();
      }
    } else {
      throw new Error("already culled");
    }
  }

  /** @hidden */
  protected doCull(): void {
    this._viewFlags |= View.TraversingFlag;
    try {
      this.willCull();
      this.onCull();
      this.doCullChildViews();
      this.didCull();
    } finally {
      this._viewFlags &= ~View.TraversingFlag;
    }
  }

  /** @hidden */
  protected doCullChildViews(): void {
    this.forEachChildView(function (childView: View): void {
      childView.cascadeCull();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
      }
    }, this);
  }

  cascadeUncull(): void {
    if ((this._viewFlags & View.CullFlag) !== 0) {
      this._viewFlags &= ~View.CullFlag
      if ((this._viewFlags & View.CulledFlag) === 0) {
        this.doUncull();
      }
    } else {
      throw new Error("already unculled");
    }
  }

  /** @hidden */
  protected doUncull(): void {
    this._viewFlags |= View.TraversingFlag;
    try {
      this.willUncull();
      this.doUncullChildViews();
      this.onUncull();
      this.didUncull();
    } finally {
      this._viewFlags &= ~View.TraversingFlag;
    }
  }

  /** @hidden */
  protected doUncullChildViews(): void {
    this.forEachChildView(function (childView: View): void {
      childView.cascadeUncull();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
      }
    }, this);
  }

  cullViewFrame(viewFrame: BoxR2 = this.viewFrame): void {
    this.setCulled(!viewFrame.intersects(this.viewBounds));
  }

  get renderer(): Renderer | null {
    const parentView = this._parentView;
    if (parentView instanceof GraphicsView || parentView instanceof GraphicsView.Canvas) {
      return parentView.renderer;
    } else {
      return null;
    }
  }

  needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((this._viewFlags & View.NeedsAnimate) === 0) {
      processFlags &= ~View.NeedsAnimate;
    }
    return processFlags;
  }

  cascadeProcess(processFlags: ViewFlags, viewContext: ViewContext): void {
    const extendedViewContext = this.extendViewContext(viewContext);
    processFlags |= this._viewFlags & View.UpdateMask;
    processFlags = this.needsProcess(processFlags, extendedViewContext);
    this.doProcess(processFlags, extendedViewContext);
  }

  /** @hidden */
  protected doProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    let cascadeFlags = processFlags;
    this._viewFlags |= View.TraversingFlag | View.ProcessingFlag;
    this._viewFlags &= ~(View.NeedsProcess | View.NeedsProject);
    try {
      this.willProcess(viewContext);
      if (((this._viewFlags | processFlags) & View.NeedsResize) !== 0) {
        this.willResize(viewContext);
        cascadeFlags |= View.NeedsResize;
        this._viewFlags &= ~View.NeedsResize;
      }
      if (((this._viewFlags | processFlags) & View.NeedsScroll) !== 0) {
        this.willScroll(viewContext);
        cascadeFlags |= View.NeedsScroll;
        this._viewFlags &= ~View.NeedsScroll;
      }
      if (((this._viewFlags | processFlags) & View.NeedsChange) !== 0) {
        this.willChange(viewContext);
        cascadeFlags |= View.NeedsChange;
        this._viewFlags &= ~View.NeedsChange;
      }
      if (((this._viewFlags | processFlags) & View.NeedsAnimate) !== 0) {
        this.willAnimate(viewContext);
        cascadeFlags |= View.NeedsAnimate;
        this._viewFlags &= ~View.NeedsAnimate;
      }

      this.onProcess(viewContext);
      if ((cascadeFlags & View.NeedsResize) !== 0) {
        this.onResize(viewContext);
      }
      if ((cascadeFlags & View.NeedsScroll) !== 0) {
        this.onScroll(viewContext);
      }
      if ((cascadeFlags & View.NeedsChange) !== 0) {
        this.onChange(viewContext);
      }
      if ((cascadeFlags & View.NeedsAnimate) !== 0) {
        this.onAnimate(viewContext);
      }

      this.doProcessChildViews(cascadeFlags, viewContext);

      if ((cascadeFlags & View.NeedsAnimate) !== 0) {
        this.didAnimate(viewContext);
      }
      if ((cascadeFlags & View.NeedsChange) !== 0) {
        this.didChange(viewContext);
      }
      if ((cascadeFlags & View.NeedsScroll) !== 0) {
        this.didScroll(viewContext);
      }
      if ((cascadeFlags & View.NeedsResize) !== 0) {
        this.didResize(viewContext);
      }
      this.didProcess(viewContext);
    } finally {
      this._viewFlags &= ~(View.TraversingFlag | View.ProcessingFlag);
    }
  }

  protected onChange(viewContext: ViewContextType<this>): void {
    super.onChange(viewContext);
    this.updateScopes();
  }

  protected onAnimate(viewContext: ViewContextType<this>): void {
    super.onAnimate(viewContext);
    this.updateAnimators(viewContext.updateTime);
  }

  protected willLayout(viewContext: ViewContextType<this>): void {
    super.willLayout(viewContext);
    this.updateConstraints();
  }

  protected didLayout(viewContext: ViewContextType<this>): void {
    this.updateConstraintVariables();
    super.didLayout(viewContext);
  }

  /** @hidden */
  protected doProcessChildViews(processFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    if ((processFlags & View.ProcessMask) !== 0 && this.childViewCount !== 0) {
      this.willProcessChildViews(processFlags, viewContext);
      this.onProcessChildViews(processFlags, viewContext);
      this.didProcessChildViews(processFlags, viewContext);
    }
  }

  cascadeDisplay(displayFlags: ViewFlags, viewContext: ViewContext): void {
    const extendedViewContext = this.extendViewContext(viewContext);
    displayFlags |= this._viewFlags & View.UpdateMask;
    displayFlags = this.needsDisplay(displayFlags, extendedViewContext);
    this.doDisplay(displayFlags, extendedViewContext);
  }

  /** @hidden */
  protected doDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    let cascadeFlags = displayFlags;
    this._viewFlags |= View.TraversingFlag | View.DisplayingFlag;
    this._viewFlags &= ~(View.NeedsDisplay | View.NeedsComposite);
    try {
      this.willDisplay(viewContext);
      if (((this._viewFlags | displayFlags) & View.NeedsLayout) !== 0) {
        this.willLayout(viewContext);
        cascadeFlags |= View.NeedsLayout;
        this._viewFlags &= ~View.NeedsLayout;
      }
      if (((this._viewFlags | displayFlags) & View.NeedsRender) !== 0) {
        this.willRender(viewContext);
        cascadeFlags |= View.NeedsRender;
        this._viewFlags &= ~View.NeedsRender;
      }

      this.onDisplay(viewContext);
      if ((cascadeFlags & View.NeedsLayout) !== 0) {
        this.onLayout(viewContext);
      }
      if ((cascadeFlags & View.NeedsRender) !== 0) {
        this.onRender(viewContext);
      }

      this.doDisplayChildViews(cascadeFlags, viewContext);

      if ((cascadeFlags & View.NeedsRender) !== 0) {
        this.didRender(viewContext);
      }
      if ((cascadeFlags & View.NeedsLayout) !== 0) {
        this.didLayout(viewContext);
      }
      this.didDisplay(viewContext);
    } finally {
      this._viewFlags &= ~(View.TraversingFlag | View.DisplayingFlag);
    }
  }

  protected willRender(viewContext: ViewContextType<this>): void {
    this.willObserve(function (viewObserver: GraphicsViewObserver): void {
      if (viewObserver.viewWillRender !== void 0) {
        viewObserver.viewWillRender(viewContext, this);
      }
    });
  }

  protected onRender(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didRender(viewContext: ViewContextType<this>): void {
    this.didObserve(function (viewObserver: GraphicsViewObserver): void {
      if (viewObserver.viewDidRender !== void 0) {
        viewObserver.viewDidRender(viewContext, this);
      }
    });
  }

  /** @hidden */
  protected doDisplayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    if ((displayFlags & View.DisplayMask) !== 0 && this.childViewCount !== 0
        && !this.isHidden() && !this.isCulled()) {
      this.willDisplayChildViews(displayFlags, viewContext);
      this.onDisplayChildViews(displayFlags, viewContext);
      this.didDisplayChildViews(displayFlags, viewContext);
    }
  }

  /**
   * Returns `true` if this view is ineligible for rendering and hit testing,
   * and should be excluded from its parent's layout and hit bounds.
   */
  isHidden(): boolean {
    if ((this._viewFlags & View.HiddenFlag) !== 0) {
      return true;
    } else {
      const parentView = this._parentView;
      if (parentView instanceof GraphicsView || parentView instanceof GraphicsView.Canvas) {
        return parentView.isHidden();
      } else {
        return false;
      }
    }
  }

  /**
   * Makes this view ineligible for rendering and hit testing, and excludes
   * this view from its parent's layout and hit bounds, when `hidden` is `true`.
   * Makes this view eligible for rendering and hit testing, and includes this
   * view in its parent's layout and hit bounds, when `hidden` is `false`.
   */
  setHidden(newHidden: boolean): void {
    const oldHidden = (this._viewFlags & View.HiddenFlag) !== 0;
    if (oldHidden !== newHidden) {
      this.willSetHidden(newHidden);
      if (newHidden) {
        this._viewFlags |= View.HiddenFlag;
      } else {
        this._viewFlags &= ~View.HiddenFlag;
      }
      this.onSetHidden(newHidden);
      this.didSetHidden(newHidden);
    }
  }

  protected willSetHidden(hidden: boolean): void {
    this.willObserve(function (viewObserver: GraphicsViewObserver): void {
      if (viewObserver.viewWillSetHidden !== void 0) {
        viewObserver.viewWillSetHidden(hidden, this);
      }
    });
  }

  protected onSetHidden(hidden: boolean): void {
    if (!hidden) {
      this.requireUpdate(View.NeedsRender);
    }
  }

  protected didSetHidden(hidden: boolean): void {
    this.didObserve(function (viewObserver: GraphicsViewObserver): void {
      if (viewObserver.viewDidSetHidden !== void 0) {
        viewObserver.viewDidSetHidden(hidden, this);
      }
    });
  }

  hasSubview(subviewName: string): boolean {
    const subviews = this._subviews;
    return subviews !== void 0 && subviews[subviewName] !== void 0;
  }

  getSubview(subviewName: string): Subview<this, View> | null {
    const subviews = this._subviews;
    if (subviews !== void 0) {
      const subview = subviews[subviewName];
      if (subview !== void 0) {
        return subview as Subview<this, View>;
      }
    }
    return null;
  }

  setSubview(subviewName: string, newSubview: Subview<this, View> | null): void {
    let subviews = this._subviews;
    if (subviews === void 0) {
      subviews = {};
      this._subviews = subviews;
    }
    const oldSubview = subviews[subviewName];
    if (oldSubview !== void 0 && this.isMounted()) {
      oldSubview.unmount();
    }
    if (newSubview !== null) {
      subviews[subviewName] = newSubview;
      if (this.isMounted()) {
        newSubview.mount();
      }
    } else {
      delete subviews[subviewName];
    }
  }

  /** @hidden */
  protected mountSubviews(): void {
    const subviews = this._subviews;
    if (subviews !== void 0) {
      for (const subviewName in subviews) {
        const subview = subviews[subviewName]!;
        subview.mount();
      }
    }
  }

  /** @hidden */
  protected unmountSubviews(): void {
    const subviews = this._subviews;
    if (subviews !== void 0) {
      for (const subviewName in subviews) {
        const subview = subviews[subviewName]!;
        subview.unmount();
      }
    }
  }

  /** @hidden */
  protected insertSubview(childView: View): void {
    const subviewName = childView.key;
    if (subviewName !== void 0) {
      const subview = this.getLazySubview(subviewName);
      if (subview !== null && subview.child) {
        subview.doSetSubview(childView);
      }
    }
  }

  /** @hidden */
  protected removeSubview(childView: View): void {
    const subviewName = childView.key;
    if (subviewName !== void 0) {
      const subview = this.getSubview(subviewName);
      if (subview !== null && subview.child) {
        subview.doSetSubview(null);
      }
    }
  }

  hasViewService(serviceName: string): boolean {
    const viewServices = this._viewServices;
    return viewServices !== void 0 && viewServices[serviceName] !== void 0;
  }

  getViewService(serviceName: string): ViewService<this, unknown> | null {
    const viewServices = this._viewServices;
    if (viewServices !== void 0) {
      const viewService = viewServices[serviceName];
      if (viewService !== void 0) {
        return viewService as ViewService<this, unknown>;
      }
    }
    return null;
  }

  setViewService(serviceName: string, newViewService: ViewService<this, unknown> | null): void {
    let viewServices = this._viewServices;
    if (viewServices === void 0) {
      viewServices = {};
      this._viewServices = viewServices;
    }
    const oldViewService = viewServices[serviceName];
    if (oldViewService !== void 0 && this.isMounted()) {
      oldViewService.unmount();
    }
    if (newViewService !== null) {
      viewServices[serviceName] = newViewService;
      if (this.isMounted()) {
        newViewService.mount();
      }
    } else {
      delete viewServices[serviceName];
    }
  }

  /** @hidden */
  protected mountServices(): void {
    const viewServices = this._viewServices;
    if (viewServices !== void 0) {
      for (const serviceName in viewServices) {
        const viewService = viewServices[serviceName]!;
        viewService.mount();
      }
    }
  }

  /** @hidden */
  protected unmountServices(): void {
    const viewServices = this._viewServices;
    if (viewServices !== void 0) {
      for (const serviceName in viewServices) {
        const viewService = viewServices[serviceName]!;
        viewService.unmount();
      }
    }
  }

  hasViewScope(scopeName: string): boolean {
    const viewScopes = this._viewScopes;
    return viewScopes !== void 0 && viewScopes[scopeName] !== void 0;
  }

  getViewScope(scopeName: string): ViewScope<this, unknown> | null {
    const viewScopes = this._viewScopes;
    if (viewScopes !== void 0) {
      const viewScope = viewScopes[scopeName];
      if (viewScope !== void 0) {
        return viewScope as ViewScope<this, unknown>;
      }
    }
    return null;
  }

  setViewScope(scopeName: string, newViewScope: ViewScope<this, unknown> | null): void {
    let viewScopes = this._viewScopes;
    if (viewScopes === void 0) {
      viewScopes = {};
      this._viewScopes = viewScopes;
    }
    const oldViewScope = viewScopes[scopeName];
    if (oldViewScope !== void 0 && this.isMounted()) {
      oldViewScope.unmount();
    }
    if (newViewScope !== null) {
      viewScopes[scopeName] = newViewScope;
      if (this.isMounted()) {
        newViewScope.mount();
      }
    } else {
      delete viewScopes[scopeName];
    }
  }

  /** @hidden */
  updateScopes(): void {
    const viewScopes = this._viewScopes;
    if (viewScopes !== void 0) {
      for (const scopeName in viewScopes) {
        const viewScope = viewScopes[scopeName]!;
        viewScope.onChange();
      }
    }
  }

  /** @hidden */
  protected mountScopes(): void {
    const viewScopes = this._viewScopes;
    if (viewScopes !== void 0) {
      for (const scopeName in viewScopes) {
        const viewScope = viewScopes[scopeName]!;
        viewScope.mount();
      }
    }
  }

  /** @hidden */
  protected unmountScopes(): void {
    const viewScopes = this._viewScopes;
    if (viewScopes !== void 0) {
      for (const scopeName in viewScopes) {
        const viewScope = viewScopes[scopeName]!;
        viewScope.unmount();
      }
    }
  }

  hasViewAnimator(animatorName: string): boolean {
    const viewAnimators = this._viewAnimators;
    return viewAnimators !== void 0 && viewAnimators[animatorName] !== void 0;
  }

  getViewAnimator(animatorName: string): ViewAnimator<this, unknown> | null {
    const viewAnimators = this._viewAnimators;
    if (viewAnimators !== void 0) {
      const viewAnimator = viewAnimators[animatorName];
      if (viewAnimator !== void 0) {
        return viewAnimator as ViewAnimator<this, unknown>;
      }
    }
    return null;
  }

  setViewAnimator(animatorName: string, newViewAnimator: ViewAnimator<this, unknown> | null): void {
    let viewAnimators = this._viewAnimators;
    if (viewAnimators === void 0) {
      viewAnimators = {};
      this._viewAnimators = viewAnimators;
    }
    const oldViewAnimator = viewAnimators[animatorName];
    if (oldViewAnimator !== void 0 && this.isMounted()) {
      oldViewAnimator.unmount();
    }
    if (newViewAnimator !== null) {
      viewAnimators[animatorName] = newViewAnimator;
      if (this.isMounted()) {
        newViewAnimator.mount();
      }
    } else {
      delete viewAnimators[animatorName];
    }
  }

  /** @hidden */
  updateAnimators(t: number): void {
    this.updateViewAnimators(t);
  }

  /** @hidden */
  updateViewAnimators(t: number): void {
    const viewAnimators = this._viewAnimators;
    if (viewAnimators !== void 0) {
      for (const animatorName in viewAnimators) {
        const viewAnimator = viewAnimators[animatorName]!;
        viewAnimator.onAnimate(t);
      }
    }
  }

  /** @hidden */
  protected mountAnimators(): void {
    this.mountViewAnimators();
  }

  /** @hidden */
  protected mountViewAnimators(): void {
    const viewAnimators = this._viewAnimators;
    if (viewAnimators !== void 0) {
      for (const animatorName in viewAnimators) {
        const viewAnimator = viewAnimators[animatorName]!;
        viewAnimator.mount();
      }
    }
  }

  /** @hidden */
  protected unmountAnimators(): void {
    this.unmountViewAnimators();
  }

  /** @hidden */
  protected unmountViewAnimators(): void {
    const viewAnimators = this._viewAnimators;
    if (viewAnimators !== void 0) {
      for (const animatorName in viewAnimators) {
        const viewAnimator = viewAnimators[animatorName]!;
        viewAnimator.unmount();
      }
    }
  }

  hasLayoutAnchor(anchorName: string): boolean {
    const layoutAnchors = this._layoutAnchors;
    return layoutAnchors !== void 0 && layoutAnchors[anchorName] !== void 0;
  }

  getLayoutAnchor(anchorName: string): LayoutAnchor<this> | null {
    const layoutAnchors = this._layoutAnchors;
    if (layoutAnchors !== void 0) {
      const layoutAnchor = layoutAnchors[anchorName];
      if (layoutAnchor !== void 0) {
        return layoutAnchor as LayoutAnchor<this>;
      }
    }
    return null;
  }

  setLayoutAnchor(anchorName: string, layoutAnchor: LayoutAnchor<this> | null): void {
    let layoutAnchors = this._layoutAnchors;
    if (layoutAnchors === void 0) {
      layoutAnchors = {};
      this._layoutAnchors = layoutAnchors;
    }
    if (layoutAnchor !== null) {
      layoutAnchors[anchorName] = layoutAnchor;
    } else {
      delete layoutAnchors[anchorName];
    }
  }

  get constraints(): ReadonlyArray<Constraint> {
    let constraints = this._constraints;
    if (constraints === void 0) {
      constraints = [];
      this._constraints = constraints;
    }
    return constraints;
  }

  hasConstraint(constraint: Constraint): boolean {
    const constraints = this._constraints;
    return constraints !== void 0 && constraints.indexOf(constraint) >= 0;
  }

  addConstraint(constraint: Constraint): void {
    let constraints = this._constraints;
    if (constraints === void 0) {
      constraints = [];
      this._constraints = constraints;
    }
    if (constraints.indexOf(constraint) < 0) {
      constraints.push(constraint);
      this.activateConstraint(constraint);
    }
  }

  removeConstraint(constraint: Constraint): void {
    const constraints = this._constraints;
    if (constraints !== void 0) {
      const index = constraints.indexOf(constraint);
      if (index >= 0) {
        constraints.splice(index, 1);
        this.deactivateConstraint(constraint);
      }
    }
  }

  get constraintVariables(): ReadonlyArray<ConstrainVariable> {
    let constraintVariables = this._constraintVariables;
    if (constraintVariables === void 0) {
      constraintVariables = [];
      this._constraintVariables = constraintVariables;
    }
    return constraintVariables;
  }

  hasConstraintVariable(constraintVariable: ConstrainVariable): boolean {
    const constraintVariables = this._constraintVariables;
    return constraintVariables !== void 0 && constraintVariables.indexOf(constraintVariable) >= 0;
  }

  addConstraintVariable(constraintVariable: ConstrainVariable): void {
    let constraintVariables = this._constraintVariables;
    if (constraintVariables === void 0) {
      constraintVariables = [];
      this._constraintVariables = constraintVariables;
    }
    if (constraintVariables.indexOf(constraintVariable) < 0) {
      constraintVariables.push(constraintVariable);
      this.activateConstraintVariable(constraintVariable);
    }
  }

  removeConstraintVariable(constraintVariable: ConstrainVariable): void {
    const constraintVariables = this._constraintVariables;
    if (constraintVariables !== void 0) {
      const index = constraintVariables.indexOf(constraintVariable);
      if (index >= 0) {
        this.deactivateConstraintVariable(constraintVariable);
        constraintVariables.splice(index, 1);
      }
    }
  }

  protected updateConstraints(): void {
    this.updateLayoutAnchors();
  }

  /** @hidden */
  updateLayoutAnchors(): void {
    const layoutAnchors = this._layoutAnchors;
    if (layoutAnchors !== void 0) {
      for (const anchorName in layoutAnchors) {
        const layoutAnchor = layoutAnchors[anchorName]!;
        layoutAnchor.updateState();
      }
    }
  }

  /** @hidden */
  activateLayout(): void {
    const constraints = this._constraints;
    const constraintVariables = this._constraintVariables;
    if (constraints !== void 0 || constraintVariables !== void 0) {
      const layoutManager = this.layoutService.manager;
      if (layoutManager !== void 0) {
        if (constraintVariables !== void 0) {
          for (let i = 0, n = constraintVariables.length; i < n; i += 1) {
            const constraintVariable = constraintVariables[i];
            if (constraintVariable instanceof LayoutAnchor) {
              layoutManager.activateConstraintVariable(constraintVariable);
              this.requireUpdate(View.NeedsLayout);
            }
          }
        }
        if (constraints !== void 0) {
          for (let i = 0, n = constraints.length; i < n; i += 1) {
            layoutManager.activateConstraint(constraints[i]);
            this.requireUpdate(View.NeedsLayout);
          }
        }
      }
    }
  }

  /** @hidden */
  deactivateLayout(): void {
    const constraints = this._constraints;
    const constraintVariables = this._constraintVariables;
    if (constraints !== void 0 || constraintVariables !== void 0) {
      const layoutManager = this.layoutService.manager;
      if (layoutManager !== void 0) {
        if (constraints !== void 0) {
          for (let i = 0, n = constraints.length; i < n; i += 1) {
            layoutManager.deactivateConstraint(constraints[i]);
            this.requireUpdate(View.NeedsLayout);
          }
        }
        if (constraintVariables !== void 0) {
          for (let i = 0, n = constraintVariables.length; i < n; i += 1) {
            layoutManager.deactivateConstraintVariable(constraintVariables[i]);
            this.requireUpdate(View.NeedsLayout);
          }
        }
      }
    }
  }

  // @ts-ignore
  declare readonly viewContext: GraphicsViewContext;

  /**
   * The parent-specified view-coordinate bounding box in which this view
   * should layout and render graphics.
   */
  get viewFrame(): BoxR2 {
    let viewFrame = this._viewFrame;
    if (viewFrame === void 0) {
      const parentView = this._parentView;
      if (parentView instanceof GraphicsView || parentView instanceof GraphicsView.Canvas) {
        viewFrame = parentView.viewFrame;
      } else {
        viewFrame = BoxR2.undefined();
      }
    }
    return viewFrame;
  }

  /**
   * Sets the view-coordinate bounding box in which this view should layout
   * and render graphics.  Should only be invoked by the view's parent view.
   */
  setViewFrame(viewFrame: BoxR2 | null): void {
    if (viewFrame !== null) {
      this._viewFrame = viewFrame;
    } else if (this._viewFrame !== void 0) {
      this._viewFrame = void 0;
    }
  }

  /**
   * The self-defined view-coordinate bounding box surrounding all graphics
   * this view could possibly render.  Views with view bounds that don't
   * overlap their view frames may be culled from rendering and hit testing.
   */
  get viewBounds(): BoxR2 {
    return this.viewFrame;
  }

  deriveViewBounds(): BoxR2 {
    let viewBounds: BoxR2 | undefined;
    this.forEachChildView(function (childView: View): void {
      if (childView instanceof GraphicsView && !childView.isHidden()) {
        const childViewBounds = childView.viewBounds;
        if (childViewBounds.isDefined()) {
          if (viewBounds !== void 0) {
            viewBounds = viewBounds.union(childViewBounds);
          } else {
            viewBounds = childViewBounds;
          }
        }
      }
    }, this);
    if (viewBounds === void 0) {
      viewBounds = this.viewFrame;
    }
    return viewBounds;
  }

  /**
   * The self-defined view-coordinate bounding box surrounding all hit regions
   * in this view.
   */
  get hitBounds(): BoxR2 {
    return this.viewBounds;
  }

  deriveHitBounds(): BoxR2 {
    let hitBounds: BoxR2 | undefined;
    this.forEachChildView(function (childView: View): void {
      if (childView instanceof GraphicsView && !childView.isHidden()) {
        const childHitBounds = childView.hitBounds;
        if (hitBounds === void 0) {
          hitBounds = childHitBounds;
        } else {
          hitBounds = hitBounds.union(childHitBounds);
        }
      }
    }, this);
    if (hitBounds === void 0) {
      hitBounds = this.viewBounds;
    }
    return hitBounds;
  }

  hitTest(x: number, y: number, viewContext: ViewContext): GraphicsView | null {
    const extendedViewContext = this.extendViewContext(viewContext);
    return this.doHitTest(x, y, extendedViewContext);
  }

  protected doHitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    return this.forEachChildView(function (childView: View): GraphicsView | void {
      if (childView instanceof GraphicsView && !childView.isHidden() && !childView.isCulled()) {
        const hitBounds = childView.hitBounds;
        if (hitBounds.contains(x, y)) {
          const hit = childView.hitTest(x, y, viewContext);
          if (hit !== null) {
            return hit;
          }
        }
      }
    }, this) || null;
  }

  get parentTransform(): Transform {
    return Transform.identity();
  }

  get clientBounds(): BoxR2 {
    const inverseClientTransform = this.clientTransform.inverse();
    return this.viewBounds.transform(inverseClientTransform);
  }

  get popoverFrame(): BoxR2 {
    const inversePageTransform = this.pageTransform.inverse();
    return this.viewBounds.transform(inversePageTransform);
  }

  on(type: string, listener: EventListenerOrEventListenerObject,
     options?: AddEventListenerOptions | boolean): this {
    let eventHandlers = this._eventHandlers;
    if (eventHandlers === void 0) {
      eventHandlers = {};
      this._eventHandlers = eventHandlers;
    }
    let handlers = eventHandlers[type];
    const capture = typeof options === "boolean" ? options
                  : typeof options === "object" && options !== null && options.capture || false;
    const passive = options && typeof options === "object" && options.passive || false;
    const once = options && typeof options === "object" && options.once || false;
    let handler: ViewEventHandler | undefined;
    if (handlers === void 0) {
      handler = {listener, capture, passive, once};
      handlers = [handler];
      eventHandlers[type] = handlers;
    } else {
      const n = handlers.length;
      let i = 0;
      while (i < n) {
        handler = handlers[i];
        if (handler.listener === listener && handler.capture === capture) {
          break;
        }
        i += 1;
      }
      if (i < n) {
        handler!.passive = passive;
        handler!.once = once;
      } else {
        handler = {listener, capture, passive, once};
        handlers.push(handler);
      }
    }
    return this;
  }

  off(type: string, listener: EventListenerOrEventListenerObject,
      options?: EventListenerOptions | boolean): this {
    const eventHandlers = this._eventHandlers;
    if (eventHandlers !== void 0) {
      const handlers = eventHandlers[type];
      if (handlers !== void 0) {
        const capture = typeof options === "boolean" ? options
                      : typeof options === "object" && options !== null && options.capture || false;
        const n = handlers.length;
        let i = 0;
        while (i < n) {
          const handler = handlers[i];
          if (handler.listener === listener && handler.capture === capture) {
            handlers.splice(i, 1);
            if (handlers.length === 0) {
              delete eventHandlers[type];
            }
            break;
          }
          i += 1;
        }
      }
    }
    return this;
  }

  /** @hidden */
  handleEvent(event: ViewEvent): void {
    const type = event.type;
    const eventHandlers = this._eventHandlers;
    if (eventHandlers !== void 0) {
      const handlers = eventHandlers[type];
      if (handlers !== void 0) {
        let i = 0;
        while (i < handlers.length) {
          const handler = handlers[i];
          if (!handler.capture) {
            const listener = handler.listener;
            if (typeof listener === "function") {
              listener(event);
            } else if (typeof listener === "object" && listener !== null) {
              listener.handleEvent(event);
            }
            if (handler.once) {
              handlers.splice(i, 1);
              continue;
            }
          }
          i += 1;
        }
        if (handlers.length === 0) {
          delete eventHandlers[type];
        }
      }
    }
    if (type === "mouseover") {
      this.onMouseOver(event as ViewMouseEvent);
    } else if (type === "mouseout") {
      this.onMouseOut(event as ViewMouseEvent);
    } else if (type === "pointerover") {
      this.onPointerOver(event as ViewPointerEvent);
    } else if (type === "pointerout") {
      this.onPointerOut(event as ViewPointerEvent);
    }
  }

  /**
   * Invokes event handlers registered with this `View` before propagating the
   * `event` up the view hierarchy.  Returns a `View`, without invoking any
   * registered event handlers, on which `dispatchEvent` should be called to
   * continue event propagation.
   * @hidden
   */
  bubbleEvent(event: ViewEvent): View | null {
    this.handleEvent(event);
    let next: View | null;
    if (event.bubbles && !event.cancelBubble) {
      const parentView = this._parentView;
      if (parentView instanceof GraphicsView || parentView instanceof GraphicsView.Canvas) {
        next = parentView.bubbleEvent(event);
      } else {
        next = parentView;
      }
    } else {
      next = null;
    }
    return next;
  }

  dispatchEvent(event: ViewEvent): boolean {
    event.targetView = this;
    const next = this.bubbleEvent(event);
    if (next !== null) {
      return next.dispatchEvent(event);
    } else {
      return !event.cancelBubble;
    }
  }

  isHovering(): boolean {
    const hoverSet = this._hoverSet;
    return hoverSet !== void 0 && Object.keys(hoverSet).length !== 0;
  }

  /** @hidden */
  protected onMouseOver(event: ViewMouseEvent): void {
    let hoverSet = this._hoverSet;
    if (hoverSet === void 0) {
      hoverSet = {};
      this._hoverSet = hoverSet;
    }
    if (hoverSet.mouse === void 0) {
      hoverSet.mouse = null;
      const eventHandlers = this._eventHandlers;
      if (eventHandlers !== void 0 && eventHandlers.mouseenter !== void 0) {
        const enterEvent = new MouseEvent("mouseenter", {
          bubbles: false,
          button: event.button,
          buttons: event.buttons,
          altKey: event.altKey,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
          clientX: event.clientX,
          clientY: event.clientY,
          screenX: event.screenX,
          screenY: event.screenY,
          movementX: event.movementX,
          movementY: event.movementY,
          view: event.view,
          detail: event.detail,
          relatedTarget: event.relatedTarget,
        }) as ViewMouseEvent;
        enterEvent.targetView = this;
        enterEvent.relatedTargetView = event.relatedTargetView;
        this.handleEvent(enterEvent);
      }
    }
  }

  /** @hidden */
  protected onMouseOut(event: ViewMouseEvent): void {
    const hoverSet = this._hoverSet;
    if (hoverSet !== void 0 && hoverSet.mouse !== void 0) {
      delete hoverSet.mouse;
      const eventHandlers = this._eventHandlers;
      if (eventHandlers !== void 0 && eventHandlers.mouseleave !== void 0) {
        const leaveEvent = new MouseEvent("mouseleave", {
          bubbles: false,
          button: event.button,
          buttons: event.buttons,
          altKey: event.altKey,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
          clientX: event.clientX,
          clientY: event.clientY,
          screenX: event.screenX,
          screenY: event.screenY,
          movementX: event.movementX,
          movementY: event.movementY,
          view: event.view,
          detail: event.detail,
          relatedTarget: event.relatedTarget,
        }) as ViewMouseEvent;
        leaveEvent.targetView = this;
        leaveEvent.relatedTargetView = event.relatedTargetView;
        this.handleEvent(leaveEvent);
      }
    }
  }

  /** @hidden */
  protected onPointerOver(event: ViewPointerEvent): void {
    let hoverSet = this._hoverSet;
    if (hoverSet === void 0) {
      hoverSet = {};
      this._hoverSet = hoverSet;
    }
    const id = "" + event.pointerId;
    if (hoverSet[id] === void 0) {
      hoverSet[id] = null;
      const eventHandlers = this._eventHandlers;
      if (eventHandlers !== void 0 && eventHandlers.pointerenter !== void 0) {
        const enterEvent = new PointerEvent("pointerenter", {
          bubbles: false,
          pointerId: event.pointerId,
          pointerType: event.pointerType,
          isPrimary: event.isPrimary,
          button: event.button,
          buttons: event.buttons,
          altKey: event.altKey,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
          clientX: event.clientX,
          clientY: event.clientY,
          screenX: event.screenX,
          screenY: event.screenY,
          movementX: event.movementX,
          movementY: event.movementY,
          tiltX: event.tiltX,
          tiltY: event.tiltY,
          twist: event.twist,
          width: event.width,
          height: event.height,
          pressure: event.pressure,
          tangentialPressure: event.tangentialPressure,
          view: event.view,
          detail: event.detail,
          relatedTarget: event.relatedTarget,
        }) as ViewPointerEvent;
        enterEvent.targetView = this;
        enterEvent.relatedTargetView = event.relatedTargetView;
        this.handleEvent(enterEvent);
      }
    }
  }

  /** @hidden */
  protected onPointerOut(event: ViewPointerEvent): void {
    const hoverSet = this._hoverSet;
    if (hoverSet !== void 0) {
      const id = "" + event.pointerId;
      if (hoverSet[id] !== void 0) {
        delete hoverSet[id];
        const eventHandlers = this._eventHandlers;
        if (eventHandlers !== void 0 && eventHandlers.pointerleave !== void 0) {
          const leaveEvent = new PointerEvent("pointerleave", {
            bubbles: false,
            pointerId: event.pointerId,
            pointerType: event.pointerType,
            isPrimary: event.isPrimary,
            button: event.button,
            buttons: event.buttons,
            altKey: event.altKey,
            ctrlKey: event.ctrlKey,
            metaKey: event.metaKey,
            shiftKey: event.shiftKey,
            clientX: event.clientX,
            clientY: event.clientY,
            screenX: event.screenX,
            screenY: event.screenY,
            movementX: event.movementX,
            movementY: event.movementY,
            tiltX: event.tiltX,
            tiltY: event.tiltY,
            twist: event.twist,
            width: event.width,
            height: event.height,
            pressure: event.pressure,
            tangentialPressure: event.tangentialPressure,
            view: event.view,
            detail: event.detail,
            relatedTarget: event.relatedTarget,
          }) as ViewPointerEvent;
          leaveEvent.targetView = this;
          leaveEvent.relatedTargetView = event.relatedTargetView;
          this.handleEvent(leaveEvent);
        }
      }
    }
  }

  static fromConstructor(viewConstructor: ViewConstructor): View {
    if (viewConstructor.prototype instanceof View) {
      return new viewConstructor();
    } else {
      throw new TypeError("" + viewConstructor);
    }
  }

  static readonly uncullFlags: ViewFlags = View.uncullFlags | View.NeedsRender;
  static readonly insertChildFlags: ViewFlags = View.insertChildFlags | View.NeedsRender;
  static readonly removeChildFlags: ViewFlags = View.removeChildFlags | View.NeedsRender;

  // Forward type declarations
  /** @hidden */
  static Layer: typeof LayerView; // defined by LayerView
  /** @hidden */
  static Raster: typeof RasterView; // defined by RasterView
  /** @hidden */
  static Canvas: typeof CanvasView; // defined by CanvasView
}
