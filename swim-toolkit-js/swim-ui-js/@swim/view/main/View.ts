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

import {BoxR2} from "@swim/math";
import {Transform} from "@swim/transform";
import {ConstraintStrength} from "@swim/constraint";
import {ViewScopeDescriptor, ViewScopeConstructor, ViewScope} from "./scope/ViewScope";
import {Viewport} from "./Viewport";
import {ViewIdiom} from "./ViewIdiom";
import {ViewContext} from "./ViewContext";
import {ViewObserver} from "./ViewObserver";
import {ViewController} from "./ViewController";
import {RootView} from "./root/RootView";
import {LayoutAnchorDescriptor, LayoutAnchorConstructor, LayoutAnchor} from "./layout/LayoutAnchor";
import {LayoutView} from "./layout/LayoutView";
import {AnimatedView} from "./animated/AnimatedView";
import {RenderedViewConstructor, RenderedView} from "./rendered/RenderedView";
import {GraphicsView} from "./graphics/GraphicsView";
import {CompositedView} from "./composited/CompositedView";
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

export interface ViewClass {
  /** @hidden */
  _viewScopeDescriptors?: {[scopeName: string]: ViewScopeDescriptor<View, unknown> | undefined};
}

export abstract class View {
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

  abstract get childViews(): ReadonlyArray<View>;

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
    this.requireUpdate(View.NeedsLayout);
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
    this.requireUpdate(View.NeedsLayout);
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
    updateFlags &= ~View.LifecycleMask;
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
    additionalFlags &= ~View.LifecycleMask;
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

  protected willDerive(viewContext: ViewContext): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillDerive !== void 0) {
        viewObserver.viewWillDerive(viewContext, this);
      }
    });
  }

  protected onDerive(viewContext: ViewContext): void {
    // hook
  }

  protected didDerive(viewContext: ViewContext): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidDerive !== void 0) {
        viewObserver.viewDidDerive(viewContext, this);
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

  abstract getViewScope(scopeName: string): ViewScope<View, unknown> | null;

  abstract setViewScope(scopeName: string, viewScope: ViewScope<View, unknown> | null): void;

  /** @hidden */
  getLazyViewScope(scopeName: string): ViewScope<View, unknown> | null {
    let viewScope = this.getViewScope(scopeName);
    if (viewScope === null) {
      const viewClass = (this as any).__proto__ as ViewClass;
      const descriptor = View.getViewScopeDescriptor(scopeName, viewClass);
      if (descriptor !== null && descriptor.scopeType !== void 0) {
        viewScope = View.initViewScope(descriptor.scopeType, this, scopeName, descriptor);
        this.setViewScope(scopeName, viewScope);
      }
    }
    return viewScope
  }

  /** @hidden */
  viewScopeDidSetState<T>(viewScope: ViewScope<View, T>, newState: T | undefined, oldState: T | undefined): void {
    this.requireUpdate(View.NeedsDerive);
  }

  abstract hasLayoutAnchor(anchorName: string): boolean;

  abstract getLayoutAnchor(anchorName: string): LayoutAnchor<LayoutView> | null;

  abstract setLayoutAnchor(anchorName: string, layoutAnchor: LayoutAnchor<LayoutView> | null): void;

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
  static getViewScopeDescriptor(scopeName: string, viewClass: ViewClass | null = null): ViewScopeDescriptor<View, unknown> | null {
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
  static initViewScope<V extends View, T>(ViewScope: ViewScopeConstructor, view: V, scopeName: string,
                                          descriptor: ViewScopeDescriptor<V, T>): ViewScope<V, T> {
    let value: T | undefined;
    let inherit: string | null | undefined;
    if (descriptor.init !== void 0) {
      value = descriptor.init.call(view)
    } else {
      value = descriptor.value;
    }
    if (typeof descriptor.inherit === "string") {
      inherit = descriptor.inherit;
    } else if (descriptor.inherit === true) {
      inherit = scopeName;
    }
    return new ViewScope<V, T>(view, scopeName, value, inherit);
  }

  /** @hidden */
  static decorateViewScope<V extends View, T>(
      ViewScope: ViewScopeConstructor, descriptor: ViewScopeDescriptor<V, T>,
      viewClass: ViewClass, scopeName: string): void {
    if (!viewClass.hasOwnProperty("_viewScopeDescriptors")) {
      viewClass._viewScopeDescriptors = {};
    }
    viewClass._viewScopeDescriptors![scopeName] = descriptor;
    Object.defineProperty(viewClass, scopeName, {
      get: function (this: V): ViewScope<V, T> {
        let viewScope = this.getViewScope(scopeName) as ViewScope<V, T> | null;
        if (viewScope === null) {
          viewScope = View.initViewScope(ViewScope, this, scopeName, descriptor);
          this.setViewScope(scopeName, viewScope);
        }
        return viewScope;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static initLayoutAnchor<V extends LayoutView>(LayoutAnchor: LayoutAnchorConstructor, view: V, anchorName: string,
                                                descriptor: LayoutAnchorDescriptor<V> | undefined): LayoutAnchor<V> {
    let value: number;
    let strength: ConstraintStrength;
    if (descriptor !== void 0 && descriptor.value !== void 0) {
      value = descriptor.value;
    } else {
      value = NaN;
    }
    if (descriptor !== void 0 && descriptor.strength !== void 0 && descriptor.strength !== null) {
      strength = ConstraintStrength.fromAny(descriptor.strength);
    } else {
      strength = ConstraintStrength.Strong;
    }
    const enabled = descriptor !== void 0 ? !!descriptor.enabled : false;
    const getState = descriptor !== void 0 ? descriptor.get : void 0;
    const setValue = descriptor !== void 0 ? descriptor.set : void 0;
    const layoutAnchor =  new LayoutAnchor<V>(view, anchorName, value, strength, enabled);
    layoutAnchor.getState = getState;
    layoutAnchor.setValue = setValue;
    return layoutAnchor;
  }

  /** @hidden */
  static decorateLayoutAnchor<V extends LayoutView>(
      LayoutAnchor: LayoutAnchorConstructor, descriptor: LayoutAnchorDescriptor<V> | undefined,
      viewClass: unknown, anchorName: string): void {
    Object.defineProperty(viewClass, anchorName, {
      get: function (this: V): LayoutAnchor<V> {
        let layoutAnchor = this.getLayoutAnchor(anchorName) as LayoutAnchor<V> | null;
        if (layoutAnchor === null) {
          layoutAnchor = View.initLayoutAnchor(LayoutAnchor, this, anchorName, descriptor);
          this.setLayoutAnchor(anchorName, layoutAnchor);
        }
        return layoutAnchor;
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

  static fromConstructor<C extends ElementViewConstructor | RenderedViewConstructor>(viewConstructor: C): InstanceType<C>;
  static fromConstructor(viewConstructor: ElementViewConstructor | RenderedViewConstructor): View {
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
  static create<C extends RenderedViewConstructor>(viewConstructor: C): InstanceType<C>;
  static create(source: string | Node | ElementViewConstructor | RenderedViewConstructor): View {
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
  static readonly HoveringFlag: ViewFlags = 1 << 4;
  /** @hidden */
  static readonly ProcessingFlag: ViewFlags = 1 << 5;
  /** @hidden */
  static readonly DisplayingFlag: ViewFlags = 1 << 6;
  /** @hidden */
  static readonly ImmediateFlag: ViewFlags = 1 << 7;
  /** @hidden */
  static readonly RemovingFlag: ViewFlags = 1 << 8;
  /** @hidden */
  static readonly UpdatingMask: ViewFlags = View.ProcessingFlag
                                          | View.DisplayingFlag;
  /** @hidden */
  static readonly LifecycleMask: ViewFlags = View.MountedFlag
                                           | View.PoweredFlag
                                           | View.HiddenFlag
                                           | View.CulledFlag
                                           | View.HoveringFlag
                                           | View.ProcessingFlag
                                           | View.DisplayingFlag
                                           | View.RemovingFlag;

  static readonly NeedsProcess: ViewFlags = 1 << 9;
  static readonly NeedsResize: ViewFlags = 1 << 10;
  static readonly NeedsScroll: ViewFlags = 1 << 11;
  static readonly NeedsDerive: ViewFlags = 1 << 12;
  static readonly NeedsAnimate: ViewFlags = 1 << 13;
  static readonly NeedsProject: ViewFlags = 1 << 14;
  /** @hidden */
  static readonly ProcessMask: ViewFlags = View.NeedsProcess
                                         | View.NeedsResize
                                         | View.NeedsScroll
                                         | View.NeedsDerive
                                         | View.NeedsAnimate
                                         | View.NeedsProject;

  static readonly NeedsDisplay: ViewFlags = 1 << 15;
  static readonly NeedsLayout: ViewFlags = 1 << 16;
  static readonly NeedsRender: ViewFlags = 1 << 17;
  static readonly NeedsComposite: ViewFlags = 1 << 18;
  /** @hidden */
  static readonly DisplayMask: ViewFlags = View.NeedsDisplay
                                         | View.NeedsLayout
                                         | View.NeedsRender
                                         | View.NeedsComposite;

  /** @hidden */
  static readonly UpdateMask: ViewFlags = View.ProcessMask
                                        | View.DisplayMask;

  /** @hidden */
  static readonly ViewFlagShift: ViewFlags = 19;
  /** @hidden */
  static readonly ViewFlagMask: ViewFlags = (1 << View.ViewFlagShift) - 1;

  // Forward type declarations
  /** @hidden */
  static Root: typeof RootView; // defined by RootView
  /** @hidden */
  static Layout: typeof LayoutView; // defined by LayoutView
  /** @hidden */
  static Animated: typeof AnimatedView; // defined by AnimatedView
  /** @hidden */
  static Rendered: typeof RenderedView; // defined by RenderedView
  /** @hidden */
  static Graphics: typeof GraphicsView; // defined by GraphicsView
  /** @hidden */
  static Composited: typeof CompositedView; // defined by CompositedView
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
