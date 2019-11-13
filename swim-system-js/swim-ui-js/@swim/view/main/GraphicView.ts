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
import {Animator} from "@swim/animate";
import {RenderingContext} from "@swim/render";
import {ViewEvent, ViewMouseEvent, ViewEventHandler} from "./ViewEvent";
import {View} from "./View";
import {ViewObserver} from "./ViewObserver";
import {AnimatedViewObserver} from "./AnimatedViewObserver";
import {RenderViewContext} from "./RenderViewContext";
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
  _updateFlags: number;
  /** @hidden */
  _bounds: BoxR2;
  /** @hidden */
  _anchor: PointR2;
  /** @hidden */
  _hidden: boolean;
  /** @hidden */
  _culled: boolean;
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
    this._updateFlags = 0;
    this._bounds = BoxR2.empty();
    this._anchor = PointR2.origin();
    this._hidden = false;
    this._culled = false;
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

  isMounted(): boolean {
    const parentView = this._parentView;
    return parentView ? parentView.isMounted() : false;
  }

  get canvasView(): CanvasView | null {
    const parentView = this.parentView;
    return RenderView.is(parentView) ? parentView.canvasView : null;
  }

  get renderingContext(): RenderingContext | null {
    const parentView = this.parentView;
    return RenderView.is(parentView) ? parentView.renderingContext : null;
  }

  get pixelRatio(): number {
    const parentView = this._parentView;
    if (RenderView.is(parentView)) {
      return parentView.pixelRatio;
    } else {
      return window.devicePixelRatio || 1;
    }
  }

  get parentView(): View | null {
    return this._parentView;
  }

  /** @hidden */
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

  cascadeMount(): void {
    this.doMountChildViews();
    this.doMount();
  }

  /** @hidden */
  doMountChildViews(): void {
    const childViews = this._childViews;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i];
      childView.cascadeMount();
    }
  }

  cascadeUnmount(): void {
    this._updateFlags = 0;
    this.doUnmountChildViews();
    this.doUnmount();
  }

  /** @hidden */
  doUnmountChildViews(): void {
    const childViews = this._childViews;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i];
      childView.cascadeUnmount();
    }
  }

  /** @hidden */
  get updateFlags(): number {
    return this._updateFlags;
  }

  /** @hidden */
  setUpdateFlags(updateFlags: number): void {
    this._updateFlags = updateFlags;
  }

  needsUpdate(updateFlags: number, viewContext: RenderViewContext): number {
    if ((updateFlags & (View.NeedsAnimate | View.NeedsLayout)) !== 0) {
      updateFlags = updateFlags | View.NeedsRender;
    }
    return updateFlags;
  }

  cascadeUpdate(updateFlags: number, viewContext: RenderViewContext): void {
    updateFlags = updateFlags | this.updateFlags;
    updateFlags = this.needsUpdate(updateFlags, viewContext);
    this.doUpdate(updateFlags, viewContext);
  }

  /** @hidden */
  doUpdate(updateFlags: number, viewContext: RenderViewContext): void {
    this.willUpdate(viewContext);
    if (((updateFlags | this._updateFlags) & View.NeedsCompute) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsCompute;
      this.doCompute(viewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsAnimate) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsAnimate;
      this.doAnimate(viewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsLayout) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsLayout;
      this.doLayout(viewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsScroll) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsScroll;
      this.doScroll(viewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsRender) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsRender;
      this.doRender(viewContext);
    }
    this.onUpdate(viewContext);
    this.doUpdateChildViews(updateFlags, viewContext);
    this.didUpdate(viewContext);
  }

  /** @hidden */
  doAnimate(viewContext: RenderViewContext): void {
    if (this.parentView) {
      this.willAnimate(viewContext);
      this.onAnimate(viewContext);
      this.didAnimate(viewContext);
    }
  }

  protected willAnimate(viewContext: RenderViewContext): void {
    this.willObserve(function (viewObserver: AnimatedViewObserver): void {
      if (viewObserver.viewWillAnimate) {
        viewObserver.viewWillAnimate(viewContext, this);
      }
    });
  }

  protected onAnimate(viewContext: RenderViewContext): void {
    // hook
  }

  protected didAnimate(viewContext: RenderViewContext): void {
    this.didObserve(function (viewObserver: AnimatedViewObserver): void {
      if (viewObserver.viewDidAnimate) {
        viewObserver.viewDidAnimate(viewContext, this);
      }
    });
  }

  /** @hidden */
  doRender(viewContext: RenderViewContext): void {
    if (this.parentView && !this.hidden && !this.culled) {
      this.willRender(viewContext);
      this.onRender(viewContext);
      this.didRender(viewContext);
    }
  }

  protected willRender(viewContext: RenderViewContext): void {
    this.willObserve(function (viewObserver: RenderViewObserver): void {
      if (viewObserver.viewWillRender) {
        viewObserver.viewWillRender(viewContext, this);
      }
    });
  }

  protected onRender(viewContext: RenderViewContext): void {
    // hook
  }

  protected didRender(viewContext: RenderViewContext): void {
    this.didObserve(function (viewObserver: RenderViewObserver): void {
      if (viewObserver.viewDidRender) {
        viewObserver.viewDidRender(viewContext, this);
      }
    });
  }

  /** @hidden */
  get hidden(): boolean {
    if (this._hidden) {
      return true;
    } else {
      const parentView = this._parentView;
      return RenderView.is(parentView) ? parentView.hidden : false;
    }
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
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetHidden(hidden: boolean): void {
    this.didObserve(function (viewObserver: RenderViewObserver): void {
      if (viewObserver.viewDidSetHidden) {
        viewObserver.viewDidSetHidden(hidden, this);
      }
    });
  }

  get culled(): boolean {
    if (this._culled) {
      return true;
    } else {
      const parentView = this._parentView;
      return RenderView.is(parentView) ? parentView.culled : false;
    }
  }

  setCulled(culled: boolean): void {
    const newCulled = this.willSetCulled(culled);
    if (newCulled !== void 0) {
      culled = newCulled;
    }
    if (this._culled !== culled) {
      this._culled = culled;
      this.onSetCulled(culled);
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
      this.requireUpdate(View.NeedsLayout);
    }
  }

  protected didSetCulled(culled: boolean): void {
    this.didObserve(function (viewObserver: RenderViewObserver): void {
      if (viewObserver.viewDidSetCulled) {
        viewObserver.viewDidSetCulled(culled, this);
      }
    });
  }

  protected onLayout(viewContext: RenderViewContext): void {
    super.onLayout(viewContext);
    this.layoutChildViews(viewContext);
  }

  protected layoutChildViews(viewContext: RenderViewContext): void {
    const childViews = this._childViews;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i];
      this.layoutChildView(childView, viewContext);
    }
  }

  protected layoutChildView(childView: View, viewContext: RenderViewContext): void {
    if (RenderView.is(childView)) {
      childView.setBounds(this._bounds);
      childView.setAnchor(this._anchor);
    }
  }

  /** @hidden */
  doUpdateChildViews(updateFlags: number, viewContext: RenderViewContext): void {
    this.willUpdateChildViews(viewContext);
    const childViews = this._childViews;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i];
      const childViewContext = this.childViewContext(childView, viewContext);
      childView.cascadeUpdate(updateFlags, childViewContext);
    }
    this.didUpdateChildViews(viewContext);
  }

  childViewContext(childView: View, viewContext: RenderViewContext): RenderViewContext {
    return viewContext;
  }

  animate(animator: Animator): void {
    this.requireUpdate(View.NeedsAnimate);
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
      this.requireUpdate(View.NeedsLayout);
    }
  }

  protected didSetBounds(newBounds: BoxR2, oldBounds: BoxR2): void {
    this.didObserve(function (viewObserver: RenderViewObserver): void {
      if (viewObserver.viewDidSetBounds) {
        viewObserver.viewDidSetBounds(newBounds, oldBounds, this);
      }
    });
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
    if (!newAnchor.equals(oldAnchor)) {
      this.requireUpdate(View.NeedsLayout);
    }
  }

  protected didSetAnchor(newAnchor: PointR2, oldAnchor: PointR2): void {
    this.didObserve(function (viewObserver: RenderViewObserver): void {
      if (viewObserver.viewDidSetAnchor) {
        viewObserver.viewDidSetAnchor(newAnchor, oldAnchor, this);
      }
    });
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
