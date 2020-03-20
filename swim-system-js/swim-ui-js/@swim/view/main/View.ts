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
import {Transition} from "@swim/transition";
import {ConstraintStrength} from "@swim/constraint";
import {MemberAnimatorDescriptor, MemberAnimatorConstructor, MemberAnimator} from "./member/MemberAnimator";
import {LayoutAnchorDescriptor, LayoutAnchorConstructor, LayoutAnchor} from "./layout/LayoutAnchor";
import {ViewScopeDescriptor, ViewScopeConstructor, ViewScope} from "./ViewScope";
import {Viewport} from "./Viewport";
import {ViewIdiom} from "./ViewIdiom";
import {ViewContext} from "./ViewContext";
import {ViewObserver} from "./ViewObserver";
import {ViewController} from "./ViewController";
import {AppView} from "./AppView";
import {LayoutView} from "./LayoutView";
import {AnimatedView} from "./AnimatedView";
import {RenderedView} from "./RenderedView";
import {GraphicsView} from "./GraphicsView";
import {LayerView} from "./LayerView";
import {ViewNode, NodeView} from "./NodeView";
import {TextView} from "./TextView";
import {ElementViewClass, ElementView} from "./ElementView";
import {SvgView} from "./SvgView";
import {HtmlView} from "./HtmlView";
import {CanvasView} from "./CanvasView";

export interface ViewInit {
  key?: string;
}

export abstract class View {
  abstract key(): string | null;
  abstract key(key: string | null): this;

  protected willSetKey(key: string | null): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillSetKey) {
        viewObserver.viewWillSetKey(key, this);
      }
    });
  }

  protected onSetKey(key: string | null): void {
    // hook
  }

  protected didSetKey(key: string | null): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidSetKey) {
        viewObserver.viewDidSetKey(key, this);
      }
    });
  }

  abstract get viewController(): ViewController | null;

  abstract setViewController(viewController: ViewController | null): void;

  protected willSetViewController(viewController: ViewController | null): void {
    // hook
  }

  protected onSetViewController(viewController: ViewController | null): void {
    // hook
  }

  protected didSetViewController(viewController: ViewController | null): void {
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
    if (viewController) {
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
    if (viewController) {
      callback.call(this, viewController);
    }
  }

  isMounted(): boolean {
    const parentView = this.parentView;
    return parentView ? parentView.isMounted() : false;
  }

  get viewport(): Viewport | null {
    const parentView = this.parentView;
    return parentView ? parentView.viewport : null;
  }

  get viewIdiom(): ViewIdiom {
    const parentView = this.parentView;
    return parentView ? parentView.viewIdiom : "unspecified";
  }

  get appView(): AppView | null {
    const parentView = this.parentView;
    return parentView ? parentView.appView : null;
  }

  abstract get parentView(): View | null;

  /** @hidden */
  abstract setParentView(parentView: View | null): void;

  protected willSetParentView(parentView: View | null): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillSetParentView) {
        viewObserver.viewWillSetParentView(parentView, this);
      }
    });
  }

  protected onSetParentView(parentView: View | null): void {
    if (parentView) {
      if (parentView.isMounted()) {
        this.cascadeMount();
      }
    } else {
      this.cascadeUnmount();
    }
  }

  protected didSetParentView(parentView: View | null): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidSetParentView) {
        viewObserver.viewDidSetParentView(parentView, this);
      }
    });
  }

  abstract get childViews(): ReadonlyArray<View>;

  getChildView(key: string): View | null {
    const childViews = this.childViews;
    for (let i = childViews.length - 1; i >= 0; i -= 1) {
      const childView = childViews[i];
      if (childView.key() === key) {
        return childView;
      }
    }
    return null;
  }

  abstract setChildView(key: string, newChildView: View | null): View | null;

  abstract appendChildView(childView: View): void;

  abstract prependChildView(childView: View): void;

  abstract insertChildView(childView: View, targetView: View | null): void;

  protected willInsertChildView(childView: View, targetView: View | null | undefined): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillInsertChildView) {
        viewObserver.viewWillInsertChildView(childView, targetView, this);
      }
    });
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    this.requireUpdate(View.NeedsLayout);
  }

  protected didInsertChildView(childView: View, targetView: View | null | undefined): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidInsertChildView) {
        viewObserver.viewDidInsertChildView(childView, targetView, this);
      }
    });
  }

  abstract removeChildView(childView: View): void;

  abstract removeAll(): void;

  abstract remove(): void;

  protected willRemoveChildView(childView: View): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillRemoveChildView) {
        viewObserver.viewWillRemoveChildView(childView, this);
      }
    });
  }

  protected onRemoveChildView(childView: View): void {
    this.requireUpdate(View.NeedsLayout);
  }

  protected didRemoveChildView(childView: View): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidRemoveChildView) {
        viewObserver.viewDidRemoveChildView(childView, this);
      }
    });
  }

  abstract cascadeMount(): void;

  /** @hidden */
  doMount(): void {
    this.willMount();
    this.onMount();
    this.didMount();
  }

  protected willMount(): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillMount) {
        viewObserver.viewWillMount(this);
      }
    });
  }

  protected onMount(): void {
    // hook
  }

  protected didMount(): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidMount) {
        viewObserver.viewDidMount(this);
      }
    });
  }

  abstract cascadeUnmount(): void;

  /** @hidden */
  doUnmount(): void {
    this.willUnmount();
    this.onUnmount();
    this.didUnmount();
  }

  protected willUnmount(): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillUnmount) {
        viewObserver.viewWillUnmount(this);
      }
    });
  }

  protected onUnmount(): void {
    // hook
  }

  protected didUnmount(): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidUnmount) {
        viewObserver.viewDidUnmount(this);
      }
    });
  }

  get updateTime(): number {
    const parentView = this.parentView;
    return parentView ? parentView.updateTime : performance.now();
  }

  /** @hidden */
  abstract get updateFlags(): number;

  /** @hidden */
  abstract setUpdateFlags(updateFlags: number): void;

  requireUpdate(updateFlags: number, immediate: boolean = false): void {
    const oldUpdateFlags = this.updateFlags;
    const newUpdateFlags = oldUpdateFlags | updateFlags;
    const deltaUpdateFlags = newUpdateFlags & ~oldUpdateFlags;
    if (deltaUpdateFlags !== 0) {
      this.setUpdateFlags(newUpdateFlags);
      this.requestUpdate(deltaUpdateFlags, immediate);
    }
  }

  requestUpdate(updateFlags: number, immediate: boolean): void {
    const parentView = this.parentView;
    if (parentView) {
      parentView.requestUpdate(updateFlags, immediate);
    }
  }

  needsUpdate(updateFlags: number, viewContext: ViewContext): number {
    return updateFlags;
  }

  abstract cascadeUpdate(updateFlags: number, viewContext: ViewContext): void;

  /** @hidden */
  abstract doUpdate(updateFlags: number, viewContext: ViewContext): void;

  protected willUpdate(viewContext: ViewContext): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillUpdate) {
        viewObserver.viewWillUpdate(viewContext, this);
      }
    });
  }

  protected onUpdate(viewContext: ViewContext): void {
    // hook
  }

  protected didUpdate(viewContext: ViewContext): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidUpdate) {
        viewObserver.viewDidUpdate(viewContext, this);
      }
    });
  }

  /** @hidden */
  doCompute(viewContext: ViewContext): void {
    this.willCompute(viewContext);
    this.onCompute(viewContext);
    this.didCompute(viewContext);
  }

  protected willCompute(viewContext: ViewContext): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillCompute) {
        viewObserver.viewWillCompute(viewContext, this);
      }
    });
  }

  protected onCompute(viewContext: ViewContext): void {
    // hook
  }

  protected didCompute(viewContext: ViewContext): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidCompute) {
        viewObserver.viewDidCompute(viewContext, this);
      }
    });
  }

  /** @hidden */
  doLayout(viewContext: ViewContext): void {
    this.willLayout(viewContext);
    this.onLayout(viewContext);
    this.didLayout(viewContext);
  }

  protected willLayout(viewContext: ViewContext): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillLayout) {
        viewObserver.viewWillLayout(viewContext, this);
      }
    });
  }

  protected onLayout(viewContext: ViewContext): void {
    // hook
  }

  protected didLayout(viewContext: ViewContext): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidLayout) {
        viewObserver.viewDidLayout(viewContext, this);
      }
    });
  }

  /** @hidden */
  doScroll(viewContext: ViewContext): void {
    this.willScroll(viewContext);
    this.onScroll(viewContext);
    this.didScroll(viewContext);
  }

  protected willScroll(viewContext: ViewContext): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillScroll) {
        viewObserver.viewWillScroll(viewContext, this);
      }
    });
  }

  protected onScroll(viewContext: ViewContext): void {
    // hook
  }

  protected didScroll(viewContext: ViewContext): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidScroll) {
        viewObserver.viewDidScroll(viewContext, this);
      }
    });
  }

  /** @hidden */
  doUpdateChildViews(updateFlags: number, viewContext: ViewContext): void {
    this.willUpdateChildViews(viewContext);
    const childViews = this.childViews;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i];
      const childViewContext = this.childViewContext(childView, viewContext);
      childView.cascadeUpdate(updateFlags, childViewContext);
    }
    this.didUpdateChildViews(viewContext);
  }

  /** @hidden */
  protected willUpdateChildViews(viewContext: ViewContext): void {
    this.willObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewWillUpdateChildViews) {
        viewObserver.viewWillUpdateChildViews(viewContext, this);
      }
    });
  }

  /** @hidden */
  protected didUpdateChildViews(viewContext: ViewContext): void {
    this.didObserve(function (viewObserver: ViewObserver): void {
      if (viewObserver.viewDidUpdateChildViews) {
        viewObserver.viewDidUpdateChildViews(viewContext, this);
      }
    });
  }

  childViewContext(childView: View, viewContext: ViewContext): ViewContext {
    return viewContext;
  }

  /** @hidden */
  didSetViewScope<V extends View, T>(scope: ViewScope<V, T>, newState: T | null, oldState: T | null): void {
    this.requireUpdate(View.NeedsCompute);
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
    if (parentView) {
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
   * Returns the bounding box, in page coordinates, to the edges of which
   * attached popovers should point.
   */
  get popoverBounds(): BoxR2 {
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

  isVisible(): boolean {
    const bounds = this.clientBounds;
    const windowWidth = document.documentElement.clientWidth;
    const windowHeight = document.documentElement.clientHeight;
    return (bounds.top <= 0 && 0 < bounds.bottom || 0 <= bounds.top && bounds.top < windowHeight)
        && (bounds.left <= 0 && 0 < bounds.right || 0 <= bounds.left && bounds.left < windowWidth);
  }

  abstract dispatchEvent(event: Event): boolean;

  abstract on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this;

  abstract off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this;

  static fromNode(node: HTMLCanvasElement): CanvasView;
  static fromNode(node: HTMLElement): HtmlView;
  static fromNode(node: SVGElement): SvgView;
  static fromNode(node: Element): ElementView;
  static fromNode(node: Text): TextView;
  static fromNode(node: Node): NodeView;
  static fromNode(node: ViewNode): NodeView {
    if (node.view instanceof View) {
      return node.view;
    } else if (node instanceof Element) {
      if (node instanceof HTMLElement) {
        if (node instanceof HTMLCanvasElement) {
          return new View.Canvas(node);
        } else {
          return new View.Html(node);
        }
      } else if (node instanceof SVGElement) {
        return new View.Svg(node);
      } else {
        return new View.Element(node);
      }
    } else if (node instanceof Text) {
      return new View.Text(node);
    } else {
      return new View.Node(node);
    }
  }

  static create(tag: "svg"): SvgView;
  static create(tag: "canvas"): CanvasView;
  static create<K extends keyof HTMLElementTagNameMap>(tag: K): HtmlView;
  static create(tag: string): ElementView;
  static create<V extends ElementView>(tag: ElementViewClass<Element, V>, key?: string): V;
  static create<V extends ElementView>(tag: string | ElementViewClass<Element, V>, key?: string): ElementView {
    if (typeof tag === "string") {
      if (tag === "svg") {
        return new View.Svg(document.createElementNS(View.Svg.NS, tag) as SVGElement);
      } else if (tag === "canvas") {
        return new View.Canvas(document.createElement(tag) as HTMLCanvasElement);
      } else {
        return View.fromNode(document.createElement(tag));
      }
    } else if (typeof tag === "function") {
      const ns = tag.NS;
      let view: V;
      if (ns === void 0) {
        view = new tag(document.createElement(tag.tag));
      } else {
        view = new tag(document.createElementNS(ns, tag.tag));
      }
      if (key !== void 0) {
        view = view.key(key);
      }
      return view;
    }
    throw new TypeError("" + tag);
  }

  /** @hidden */
  static decorateMemberAnimator<V extends AnimatedView, T, U>(MemberAnimator: MemberAnimatorConstructor<T, U>,
                                                              descriptor: MemberAnimatorDescriptor<T, U> | undefined,
                                                              target: unknown, key: string): void {
    let value: T | U | null | undefined;
    let transition: Transition<T> | null | undefined;
    let inherit: string | null | undefined;
    if (descriptor) {
      value = descriptor.value;
      if (descriptor.transition !== void 0 && descriptor.transition !== null) {
        transition = Transition.fromAny(descriptor.transition);
      }
      if (typeof descriptor.inherit === "string") {
        inherit = descriptor.inherit;
      } else if (descriptor.inherit === true) {
        inherit = key;
      }
    }
    Object.defineProperty(target, key, {
      get: function (this: V): MemberAnimator<V, T, U> {
        const animator = new MemberAnimator<V>(this, value, transition, inherit);
        Object.defineProperty(animator, "name", {
          value: key,
          enumerable: true,
          configurable: true,
        });
        Object.defineProperty(this, key, {
          value: animator,
          configurable: true,
          enumerable: true,
        });
        return animator;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static decorateLayoutAnchor<V extends LayoutView>(LayoutAnchor: LayoutAnchorConstructor,
                                                    descriptor: LayoutAnchorDescriptor<V> | undefined,
                                                    target: unknown, key: string): void {
    let value: number;
    let strength: ConstraintStrength;
    if (descriptor && descriptor.value !== void 0) {
      value = descriptor.value;
    } else {
      value = NaN;
    }
    if (descriptor && descriptor.strength !== void 0 && descriptor.strength !== null) {
      strength = ConstraintStrength.fromAny(descriptor.strength);
    } else {
      strength = ConstraintStrength.Strong;
    }
    const enabled = descriptor ? !!descriptor.enabled : false;
    const getState = descriptor ? descriptor.get : void 0;
    const setValue = descriptor ? descriptor.set : void 0;
    Object.defineProperty(target, key, {
      get: function (this: V): LayoutAnchor<V> {
        const anchor = new LayoutAnchor<V>(this, key, value, strength, enabled);
        anchor.getState = getState;
        anchor.setValue = setValue;
        Object.defineProperty(this, key, {
          value: anchor,
          configurable: true,
          enumerable: true,
        });
        return anchor;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static decorateViewScope<V extends View, T>(ViewScope: ViewScopeConstructor,
                                              descriptor: ViewScopeDescriptor<T> | undefined,
                                              target: unknown, key: string): void {
    let state: T | null | undefined;
    let inherit: string | null | undefined;
    if (descriptor) {
      state = descriptor.state;
      if (typeof descriptor.inherit === "string") {
        inherit = descriptor.inherit;
      } else if (descriptor.inherit === true) {
        inherit = key;
      }
    }
    Object.defineProperty(target, key, {
      get: function (this: V): ViewScope<V, T> {
        const scope = new ViewScope<V, T>(this, key, state, inherit);
        Object.defineProperty(this, key, {
          value: scope,
          configurable: true,
          enumerable: true,
        });
        return scope;
      },
      configurable: true,
      enumerable: true,
    });
  }

  static readonly NeedsCompute: number = 1 << 0;
  static readonly NeedsAnimate: number = 1 << 1;
  static readonly NeedsLayout: number = 1 << 2;
  static readonly NeedsScroll: number = 1 << 3;
  static readonly NeedsRender: number = 1 << 4;
  static readonly UpdateFlagsMask: number = (1 << 5) - 1;

  // Forward type declarations
  /** @hidden */
  static App: typeof AppView; // defined by AppView
  /** @hidden */
  static Layout: typeof LayoutView; // defined by LayoutView
  /** @hidden */
  static Animated: typeof AnimatedView; // defined by AnimatedView
  /** @hidden */
  static Rendered: typeof RenderedView; // defined by RenderedView
  /** @hidden */
  static Graphics: typeof GraphicsView; // defined by GraphicsView
  /** @hidden */
  static Layer: typeof LayerView; // defined by LayerView
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
}
