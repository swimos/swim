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

import {PointR2, BoxR2} from "@swim/math";
import {Transform} from "@swim/transform";
import {RenderingContext} from "@swim/render";
import {ViewEvent, ViewMouseEvent, ViewEventHandler} from "./ViewEvent";
import {View} from "./View";
import {ViewObserver} from "./ViewObserver";
import {AnimatedView} from "./AnimatedView";
import {AnimatedViewObserver} from "./AnimatedViewObserver";
import {RenderView} from "./RenderView";
import {RenderViewObserver} from "./RenderViewObserver";
import {GraphicViewController} from "./GraphicViewController";
import {CanvasView} from "./CanvasView";

export class GraphicView extends View implements RenderView {
  /** @hidden */
  _key: string | null;
  /** @hidden */
  _viewController: GraphicViewController | null;
  /** @hidden */
  readonly _viewObservers: ViewObserver[];
  /** @hidden */
  _parentView: View | null;
  /** @hidden */
  readonly _childViews: View[];
  /** @hidden */
  _bounds: BoxR2;
  /** @hidden */
  _anchor: PointR2;
  /** @hidden */
  _hidden: boolean;
  /** @hidden */
  _culled: boolean;
  /** @hidden */
  _dirty: boolean;
  /**
   * Whether or not the mouse is currently hovering over this `View`.
   * @hidden
   */
  _hover: boolean;
  /** @hidden */
  _eventHandlers: {[type: string]: ViewEventHandler[] | undefined};

  constructor(key: string | null = null) {
    super();
    this._key = key;
    this._viewController = null;
    this._viewObservers = [];
    this._parentView = null;
    this._childViews = [];
    this._bounds = BoxR2.empty();
    this._anchor = PointR2.origin();
    this._hidden = false;
    this._culled = false;
    this._dirty = true;
    this._hover = false;
    this._eventHandlers = {};
  }

  key(): string | null;
  key(key: string | null): this;
  key(key?: string | null): string | null | this {
    if (key === void 0) {
      return this._key;
    } else {
      this.willSetKey(key);
      this._key = key;
      this.onSetKey(key);
      this.didSetKey(key);
      return this;
    }
  }

  get viewController(): GraphicViewController | null {
    return this._viewController;
  }

  setViewController(viewController: GraphicViewController | null): void {
    if (this._viewController !== viewController) {
      this.willSetViewController(viewController);
      if (this._viewController) {
        this._viewController.setView(null);
      }
      this._viewController = viewController;
      if (this._viewController) {
        this._viewController.setView(this);
      }
      this.onSetViewController(viewController);
      this.didSetViewController(viewController);
    }
  }

  get viewObservers(): ReadonlyArray<ViewObserver> {
    return this._viewObservers;
  }

  addViewObserver(viewObserver: ViewObserver): void {
    const viewObservers = this._viewObservers;
    const index = viewObservers.indexOf(viewObserver);
    if (index < 0) {
      this.willAddViewObserver(viewObserver);
      viewObservers.push(viewObserver);
      this.onAddViewObserver(viewObserver);
      this.didAddViewObserver(viewObserver);
    }
  }

  removeViewObserver(viewObserver: ViewObserver): void {
    const viewObservers = this._viewObservers;
    const index = viewObservers.indexOf(viewObserver);
    if (index >= 0) {
      this.willRemoveViewObserver(viewObserver);
      viewObservers.splice(index, 1);
      this.onRemoveViewObserver(viewObserver);
      this.didRemoveViewObserver(viewObserver);
    }
  }

  get canvasView(): CanvasView | null {
    const parentView = this.parentView;
    return RenderView.is(parentView) ? parentView.canvasView : null;
  }

  get parentView(): View | null {
    return this._parentView;
  }

  setParentView(parentView: View | null) {
    this.willSetParentView(parentView);
    this._parentView = parentView;
    this.onSetParentView(parentView);
    this.didSetParentView(parentView);
  }

  get childViews(): ReadonlyArray<View> {
    return this._childViews;
  }

  getChildView(key: string): View | null {
    const childViews = this._childViews;
    for (let i = childViews.length - 1; i >= 0; i -= 1) {
      const childView = childViews[i];
      if (childView.key() === key) {
        return childView;
      }
    }
    return null;
  }

  setChildView(key: string, newChildView: View | null): View | null {
    if (newChildView !== null && !RenderView.is(newChildView)) {
      throw new TypeError("" + newChildView);
    }
    let oldChildView: View | null = null;
    let targetView: View | null = null;
    const childViews = this._childViews;
    let index = childViews.length - 1;
    while (index >= 0) {
      const childView = childViews[index];
      if (childView.key() === key) {
        oldChildView = childView;
        targetView = childViews[index + 1] || null;
        this.willRemoveChildView(childView);
        childView.setParentView(null);
        childViews.splice(index, 1);
        this.onRemoveChildView(childView);
        this.didRemoveChildView(childView);
        break;
      }
      index -= 1;
    }
    if (newChildView) {
      newChildView.key(key);
      this.willInsertChildView(newChildView, targetView);
      if (index >= 0) {
        childViews.splice(index, 0, newChildView);
      } else {
        childViews.push(newChildView);
      }
      newChildView.setParentView(this);
      this.onInsertChildView(newChildView, targetView);
      this.didInsertChildView(newChildView, targetView);
      this.setDirty(true);
      this.animate();
    }
    return oldChildView;
  }

  append(child: RenderView): typeof child {
    this.appendChildView(child);
    return child;
  }

  appendChildView(childView: View): void {
    if (!RenderView.is(childView)) {
      throw new TypeError("" + childView);
    }
    this.willInsertChildView(childView, null);
    this._childViews.push(childView);
    childView.setParentView(this);
    this.onInsertChildView(childView, null);
    this.didInsertChildView(childView, null);
    this.setDirty(true);
    this.animate();
  }

  prepend(child: RenderView): typeof child {
    this.prependChildView(child);
    return child;
  }

  prependChildView(childView: View): void {
    if (!RenderView.is(childView)) {
      throw new TypeError("" + childView);
    }
    this.willInsertChildView(childView, null);
    this._childViews.unshift(childView);
    childView.setParentView(this);
    this.onInsertChildView(childView, null);
    this.didInsertChildView(childView, null);
    this.setDirty(true);
    this.animate();
  }

  insert(child: RenderView, target: View | null): typeof child {
    this.insertChildView(child, target);
    return child;
  }

  insertChildView(childView: View, targetView: View | null): void {
    if (!RenderView.is(childView)) {
      throw new TypeError("" + childView);
    }
    if (targetView !== null && !RenderView.is(childView)) {
      throw new TypeError("" + targetView);
    }
    if (targetView !== null && targetView.parentView !== this) {
      throw new TypeError("" + targetView);
    }
    const childViews = this._childViews;
    this.willInsertChildView(childView, targetView);
    const index = targetView ? childViews.indexOf(targetView) : -1;
    if (index >= 0) {
      childViews.splice(index, 0, childView);
    } else {
      childViews.push(childView);
    }
    childView.setParentView(this);
    this.onInsertChildView(childView, targetView);
    this.didInsertChildView(childView, targetView);
    this.setDirty(true);
    this.animate();
  }

  protected onInsertChildView(childView: View, targetView: View | null): void {
    if (RenderView.is(childView)) {
      this.setChildViewBounds(childView, this._bounds);
      this.setChildViewAnchor(childView, this._anchor);
      if (this._culled) {
        childView.setCulled(true);
      }
    }
  }

  removeChildView(childView: View): void {
    if (!RenderView.is(childView)) {
      throw new TypeError("" + childView);
    }
    if (childView.parentView !== this) {
      throw new TypeError("" + childView);
    }
    const childViews = this._childViews;
    this.willRemoveChildView(childView);
    childView.setParentView(null);
    const index = childViews.indexOf(childView);
    if (index >= 0) {
      childViews.splice(index, 1);
    }
    this.onRemoveChildView(childView);
    this.didRemoveChildView(childView);
    this.setDirty(true);
    this.animate();
  }

  removeAll(): void {
    const childViews = this._childViews;
    do {
      const count = childViews.length;
      if (count > 0) {
        const childView = childViews[count - 1];
        this.willRemoveChildView(childView);
        childView.setParentView(null);
        childViews.pop();
        this.onRemoveChildView(childView);
        this.didRemoveChildView(childView);
        this.setDirty(true);
        this.animate();
        continue;
      }
      break;
    } while (true);
  }

  remove(): void {
    if (this._parentView) {
      this._parentView.removeChildView(this);
    }
  }

  isMounted(): boolean {
    const parentView = this._parentView;
    return parentView ? parentView.isMounted() : false;
  }

  cascadeMount(): void {
    this.willMount();
    this.onMount();
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      childView.cascadeMount();
    }
    this.didMount();
  }

  protected onMount(): void {
    super.onMount();
    this.setDirty(true);
  }

  cascadeUnmount(): void {
    this.willUnmount();
    this.onUnmount();
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      childView.cascadeUnmount();
    }
    this.didUnmount();
  }

  cascadeResize(): void {
    this.willResize();
    this.onResize();
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      childView.cascadeResize();
    }
    this.didResize();
  }

  cascadeLayout(): void {
    this.willLayout();
    this.onLayout();
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      childView.cascadeLayout();
    }
    this.didLayout();
  }

  cascadeScroll(): void {
    this.willScroll();
    this.onScroll();
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      childView.cascadeScroll();
    }
    this.didScroll();
  }

  animate(): void {
    const parentView = this._parentView;
    if (AnimatedView.is(parentView)) {
      parentView.animate();
    }
  }

  cascadeAnimate(frame: number): void {
    this.willAnimate(frame);
    this.onAnimate(frame);
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (AnimatedView.is(childView)) {
        childView.cascadeAnimate(frame);
      }
    }
    this.didAnimate(frame);
  }

  protected willAnimate(frame: number): void {
    this.willObserve(function (viewObserver: AnimatedViewObserver): void {
      if (viewObserver.viewWillAnimate) {
        viewObserver.viewWillAnimate(frame, this);
      }
    });
  }

  protected onAnimate(frame: number): void {
    // stub
  }

  protected didAnimate(frame: number): void {
    this.didObserve(function (viewObserver: AnimatedViewObserver): void {
      if (viewObserver.viewDidAnimate) {
        viewObserver.viewDidAnimate(frame, this);
      }
    });
    this.setDirty(false);
  }

  cascadeRender(context: RenderingContext): void {
    if (!this._hidden && !this._culled) {
      this.willRender(context);
      this.onRender(context);
      const childViews = this._childViews;
      for (let i = 0, n = childViews.length; i < n; i += 1) {
        const childView = childViews[i];
        if (RenderView.is(childView)) {
          childView.cascadeRender(context);
        }
      }
      this.didRender(context);
    }
  }

  protected willRender(context: RenderingContext): void {
    this.willObserve(function (viewObserver: RenderViewObserver): void {
      if (viewObserver.viewWillRender) {
        viewObserver.viewWillRender(context, this);
      }
    });
  }

  protected onRender(context: RenderingContext): void {
    // hook
  }

  protected didRender(context: RenderingContext): void {
    this.didObserve(function (viewObserver: RenderViewObserver): void {
      if (viewObserver.viewDidRender) {
        viewObserver.viewDidRender(context, this);
      }
    });
  }

  /** @hidden */
  get hidden(): boolean {
    return this._hidden;
  }

  setHidden(hidden: boolean): void {
    const newHidden = this.willSetHidden(hidden);
    if (newHidden !== void 0) {
      hidden = newHidden;
    }
    if (this._hidden !== hidden) {
      this._hidden = hidden;
      this.onSetHidden(hidden);
    }
    this.didSetHidden(hidden);
  }

  protected willSetHidden(hidden: boolean): boolean | void {
    const viewController = this._viewController;
    if (viewController) {
      const newHidden = viewController.viewWillSetHidden(hidden, this);
      if (newHidden !== void 0) {
        hidden = newHidden;
      }
    }
    const viewObservers = this._viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i] as RenderViewObserver;
      if (viewObserver.viewWillSetHidden) {
        viewObserver.viewWillSetHidden(hidden, this);
      }
    }
    return hidden;
  }

  protected onSetHidden(hidden: boolean): void {
    this.setDirty(true);
  }

  protected didSetHidden(hidden: boolean): void {
    this.didObserve(function (viewObserver: RenderViewObserver): void {
      if (viewObserver.viewDidSetHidden) {
        viewObserver.viewDidSetHidden(hidden, this);
      }
    });
  }

  cascadeCull(): void {
    this.willCull();
    this.onCull();
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (RenderView.is(childView)) {
        childView.cascadeCull();
      }
    }
    this.didCull();
  }

  protected willCull(): void {
    this.willObserve(function (viewObserver: RenderViewObserver): void {
      if (viewObserver.viewWillCull) {
        viewObserver.viewWillCull(this);
      }
    });
  }

  protected onCull(): void {
    // stub
  }

  protected didCull(): void {
    this.didObserve(function (viewObserver: RenderViewObserver): void {
      if (viewObserver.viewDidCull) {
        viewObserver.viewDidCull(this);
      }
    });
  }

  get culled(): boolean {
    return this._culled;
  }

  setCulled(culled: boolean): void {
    const newCulled = this.willSetCulled(culled);
    if (newCulled !== void 0) {
      culled = newCulled;
    }
    if (this._culled !== culled) {
      this._culled = culled;
      this.onSetCulled(culled);
      const childViews = this._childViews;
      for (let i = 0, n = childViews.length; i < n; i += 1) {
        const childView = childViews[i];
        if (RenderView.is(childView)) {
          this.setChildViewCulled(childView, culled);
        }
      }
    }
    this.didSetCulled(culled);
  }

  protected willSetCulled(culled: boolean): boolean | void {
    const viewController = this._viewController;
    if (viewController) {
      const newCulled = viewController.viewWillSetCulled(culled, this);
      if (newCulled !== void 0) {
        culled = newCulled;
      }
    }
    const viewObservers = this._viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i] as RenderViewObserver;
      if (viewObserver.viewWillSetCulled) {
        viewObserver.viewWillSetCulled(culled, this);
      }
    }
    return culled;
  }

  protected onSetCulled(culled: boolean): void {
    if (!culled) {
      this.setDirty(true);
    }
  }

  protected didSetCulled(culled: boolean): void {
    this.didObserve(function (viewObserver: RenderViewObserver): void {
      if (viewObserver.viewDidSetCulled) {
        viewObserver.viewDidSetCulled(culled, this);
      }
    });
  }

  protected setChildViewCulled(childView: RenderView, culled: boolean): void {
    childView.setCulled(culled);
  }

  get parentTransform(): Transform {
    const parentView = this._parentView;
    if (RenderView.is(parentView)) {
      const parentBounds = parentView.bounds;
      const bounds = this.bounds;
      const dx = bounds.x - parentBounds.x;
      const dy = bounds.y - parentBounds.y;
      if (dx !== 0 || dy !== 0) {
        return Transform.translate(dx, dy);
      }
    }
    return Transform.identity();
  }

  get clientBounds(): BoxR2 {
    const inverseClientTransform = this.clientTransform.inverse();
    return this.bounds.transform(inverseClientTransform);
  }

  get popoverBounds(): BoxR2 {
    const inversePageTransform = this.pageTransform.inverse();
    const pageAnchor = this.anchor.transform(inversePageTransform);
    const pageX = Math.round(pageAnchor.x);
    const pageY = Math.round(pageAnchor.y);
    return new BoxR2(pageX, pageY, pageX, pageY);
  }

  get bounds(): BoxR2 {
    return this._bounds;
  }

  setBounds(bounds: BoxR2): void {
    const newBounds = this.willSetBounds(bounds);
    if (newBounds !== void 0) {
      bounds = newBounds;
    }
    const oldBounds = this._bounds;
    this._bounds = bounds;
    this.onSetBounds(bounds, oldBounds);
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (RenderView.is(childView)) {
        this.setChildViewBounds(childView, bounds);
      }
    }
    this.didSetBounds(bounds, oldBounds);
  }

  protected willSetBounds(bounds: BoxR2): BoxR2 | void {
    const viewController = this._viewController;
    if (viewController) {
      const newBounds = viewController.viewWillSetBounds(bounds, this);
      if (newBounds !== void 0) {
        bounds = newBounds;
      }
    }
    const viewObservers = this._viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i] as RenderViewObserver;
      if (viewObserver.viewWillSetBounds) {
        viewObserver.viewWillSetBounds(bounds, this);
      }
    }
  }

  protected onSetBounds(newBounds: BoxR2, oldBounds: BoxR2): void {
    if (!newBounds.equals(oldBounds)) {
      this.setDirty(true);
    }
  }

  protected didSetBounds(newBounds: BoxR2, oldBounds: BoxR2): void {
    this.didObserve(function (viewObserver: RenderViewObserver): void {
      if (viewObserver.viewDidSetBounds) {
        viewObserver.viewDidSetBounds(newBounds, oldBounds, this);
      }
    });
  }

  protected setChildViewBounds(childView: RenderView, bounds: BoxR2): void {
    childView.setBounds(bounds);
  }

  get anchor(): PointR2 {
    return this._anchor;
  }

  setAnchor(anchor: PointR2): void {
    const newAnchor = this.willSetAnchor(anchor);
    if (newAnchor !== void 0) {
      anchor = newAnchor;
    }
    const oldAnchor = this._anchor;
    this._anchor = anchor;
    this.onSetAnchor(anchor, oldAnchor);
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (RenderView.is(childView)) {
        this.setChildViewAnchor(childView, anchor);
      }
    }
    this.didSetAnchor(anchor, oldAnchor);
  }

  protected willSetAnchor(anchor: PointR2): PointR2 | void {
    const viewController = this._viewController;
    if (viewController) {
      const newAnchor = viewController.viewWillSetAnchor(anchor, this);
      if (newAnchor !== void 0) {
        anchor = newAnchor;
      }
    }
    const viewObservers = this._viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i] as RenderViewObserver;
      if (viewObserver.viewWillSetAnchor) {
        viewObserver.viewWillSetAnchor(anchor, this);
      }
    }
  }

  protected onSetAnchor(newAnchor: PointR2, oldAnchor: PointR2): void {
    // hook
  }

  protected didSetAnchor(newAnchor: PointR2, oldAnchor: PointR2): void {
    this.didObserve(function (viewObserver: RenderViewObserver): void {
      if (viewObserver.viewDidSetAnchor) {
        viewObserver.viewDidSetAnchor(newAnchor, oldAnchor, this);
      }
    });
  }

  protected setChildViewAnchor(childView: RenderView, anchor: PointR2): void {
    childView.setAnchor(anchor);
  }

  get pixelRatio(): number {
    const parentView = this._parentView;
    if (RenderView.is(parentView)) {
      return parentView.pixelRatio;
    } else {
      return window.devicePixelRatio || 1;
    }
  }

  get dirty(): boolean {
    return this._dirty;
  }

  setDirty(dirty: boolean): void {
    if (this._dirty !== dirty) {
      this._dirty = dirty;
      this.didSetDirty(dirty);
    }
  }

  protected didSetDirty(dirty: boolean): void {
    if (dirty) {
      const parentView = this._parentView;
      if (RenderView.is(parentView)) {
        parentView.setDirty(dirty);
      }
    }
  }

  get hitBounds(): BoxR2 | null {
    return null;
  }

  hitTest(x: number, y: number, context: RenderingContext): RenderView | null {
    let hit: RenderView | null = null;
    const childViews = this._childViews;
    for (let i = childViews.length - 1; i >= 0; i -= 1) {
      const childView = childViews[i];
      if (RenderView.is(childView) && !childView.culled) {
        const hitBounds = childView.hitBounds || childView.bounds;
        if (hitBounds.contains(x, y)) {
          hit = childView.hitTest(x, y, context);
          if (hit !== null) {
            break;
          }
        }
      }
    }
    return hit;
  }

  on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this {
    let handlers = this._eventHandlers[type];
    const capture = typeof options === "boolean" ? options : options && typeof options === "object" && options.capture || false;
    const passive = options && typeof options === "object" && options.passive || false;
    const once = options && typeof options === "object" && options.once || false;
    let handler: ViewEventHandler | undefined;
    if (handlers === void 0) {
      handler = {listener, capture, passive, once};
      handlers = [handler];
      this._eventHandlers[type] = handlers;
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

  off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this {
    const handlers = this._eventHandlers[type];
    if (handlers !== void 0) {
      const capture = typeof options === "boolean" ? options : options && typeof options === "object" && options.capture || false;
      const n = handlers.length;
      let i = 0;
      while (i < n) {
        const handler = handlers[i];
        if (handler.listener === listener && handler.capture === capture) {
          handlers.splice(i, 1);
          if (handlers.length === 0) {
            delete this._eventHandlers[type];
          }
          break;
        }
        i += 1;
      }
    }
    return this;
  }

  /** @hidden */
  handleEvent(event: ViewEvent): void {
    const type = event.type;
    const handlers = this._eventHandlers[type];
    if (handlers !== void 0) {
      let i = 0;
      while (i < handlers.length) {
        const handler = handlers[i];
        if (!handler.capture) {
          const listener = handler.listener;
          if (typeof listener === "function") {
            listener(event);
          } else if (listener && typeof listener === "object") {
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
        delete this._eventHandlers[type];
      }
    }
    if (type === "mouseover") {
      this.onMouseOver(event as MouseEvent);
    } else if (type === "mouseout") {
      this.onMouseOut(event as MouseEvent);
    }
  }

  /** @hidden */
  bubbleEvent(event: ViewEvent): View | null {
    this.handleEvent(event);
    if (event.bubbles && !event.cancelBubble) {
      const parentView = this._parentView;
      if (RenderView.is(parentView)) {
        return parentView.bubbleEvent(event);
      } else {
        return parentView;
      }
    } else {
      return null;
    }
  }

  dispatchEvent(event: ViewEvent): boolean {
    event.targetView = this;
    const next = this.bubbleEvent(event);
    if (next) {
      return next.dispatchEvent(event);
    } else {
      return !event.cancelBubble;
    }
  }

  get hover(): boolean {
    return this._hover;
  }

  /** @hidden */
  protected onMouseOver(event: ViewMouseEvent): void {
    if (!this._hover) {
      this._hover = true;
      if (this._eventHandlers.mouseenter !== void 0) {
        const enterEvent = new MouseEvent("mouseenter", {
          clientX: event.clientX,
          clientY: event.clientY,
          screenX: event.screenX,
          screenY: event.screenY,
          bubbles: false,
        }) as ViewMouseEvent;
        enterEvent.targetView = this;
        enterEvent.relatedTargetView = event.relatedTargetView;
        this.handleEvent(enterEvent);
      }
    }
  }

  /** @hidden */
  protected onMouseOut(event: ViewMouseEvent): void {
    if (this._hover) {
      this._hover = false;
      if (this._eventHandlers.mouseleave !== void 0) {
        const leaveEvent = new MouseEvent("mouseleave", {
          clientX: event.clientX,
          clientY: event.clientY,
          screenX: event.screenX,
          screenY: event.screenY,
          bubbles: false,
        }) as ViewMouseEvent;
        leaveEvent.targetView = this;
        leaveEvent.relatedTargetView = event.relatedTargetView;
        this.handleEvent(leaveEvent);
      }
    }
  }
}
View.Graphic = GraphicView;
