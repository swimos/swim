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
import {RenderingContext} from "@swim/render";
import {ViewEvent, ViewMouseEvent, ViewTouch, ViewTouchEvent} from "./ViewEvent";
import {View} from "./View";
import {RenderView} from "./RenderView";
import {RenderViewObserver} from "./RenderViewObserver";
import {ViewNode, NodeView} from "./NodeView";
import {TextView} from "./TextView";
import {ElementViewClass, ElementView} from "./ElementView";
import {SvgView} from "./SvgView";
import {HtmlView} from "./HtmlView";
import {CanvasViewController} from "./CanvasViewController";

export interface ViewCanvas extends HTMLCanvasElement {
  view?: CanvasView;
}

export class CanvasView extends HtmlView implements RenderView {
  /** @hidden */
  readonly _node: ViewCanvas;
  /** @hidden */
  _viewController: CanvasViewController | null;
  /** @hidden */
  readonly _renderViews: RenderView[];
  /** @hidden */
  _bounds: BoxR2;
  /** @hidden */
  _anchor: PointR2;
  /** @hidden */
  _clientX: number;
  /** @hidden */
  _clientY: number;
  /** @hidden */
  _screenX: number;
  /** @hidden */
  _screenY: number;
  /**
   * The `RenderView` over which the mouse is currently hovering.
   * @hidden
   */
  _hoverView: RenderView | null;
  /**
   * The currently active touches.
   * @hidden
   */
  readonly _touches: {[identifier: string]: ViewTouch | undefined};

  constructor(node: HTMLCanvasElement, key: string | null = null) {
    super(node, key);
    this.onClick = this.onClick.bind(this);
    this.onDblClick = this.onDblClick.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchCancel = this.onTouchCancel.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    this._renderViews = [];
    this._bounds = BoxR2.empty();
    this._anchor = PointR2.origin();
    this._dirty = true;
    this._clientX = 0;
    this._clientY = 0;
    this._screenX = 0;
    this._screenY = 0;
    this._hoverView = null;
    this._touches = {};
  }

  get node(): ViewCanvas {
    return this._node;
  }

  protected initNode(node: ViewCanvas): void {
    node.style.position = "absolute";
  }

  get viewController(): CanvasViewController | null {
    return this._viewController;
  }

  get canvasView(): CanvasView | null {
    return this;
  }

  get childViews(): ReadonlyArray<View> {
    const childNodes = this._node.childNodes;
    const childViews = [];
    for (let i = 0, n = childNodes.length; i < n; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView) {
        childViews.push(childView);
      }
    }
    childViews.push.apply(childViews, this._renderViews);
    return childViews;
  }

  getChildView(key: string): View | null {
    const renderViews = this._renderViews;
    for (let i = renderViews.length - 1; i >= 0; i -= 1) {
      const renderView = renderViews[i];
      if (renderView.key() === key) {
        return renderView;
      }
    }
    const childNodes = this._node.childNodes;
    for (let i = childNodes.length - 1; i >= 0; i -= 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView && childView.key() === key) {
        return childView;
      }
    }
    return null;
  }

  setChildView(key: string, newChildView: View | null): View | null {
    if (RenderView.is(newChildView)) {
      return this.setRenderView(key, newChildView);
    } else {
      return super.setChildView(key, newChildView);
    }
  }

  setRenderView(key: string, newChildView: RenderView | null): RenderView | null {
    if (!RenderView.is(newChildView)) {
      throw new TypeError("" + newChildView);
    }
    let oldChildView: RenderView | null = null;
    let targetView: RenderView | null = null;
    const renderViews = this._renderViews;
    let index = renderViews.length - 1;
    while (index >= 0) {
      const childView = renderViews[index];
      if (childView.key() === key) {
        oldChildView = childView;
        targetView = renderViews[index + 1] || null;
        this.willRemoveChildView(childView);
        childView.setParentView(null);
        renderViews.splice(index, 1);
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
        renderViews.splice(index, 0, newChildView);
      } else {
        renderViews.push(newChildView);
      }
      newChildView.setParentView(this);
      this.onInsertChildView(newChildView, targetView);
      this.didInsertChildView(newChildView, targetView);
      this.animate();
    }
    return oldChildView;
  }

  get renderViews(): ReadonlyArray<RenderView> {
    return this._renderViews;
  }

  append(child: "svg"): SvgView;
  append(child: "canvas"): CanvasView;
  append(tag: string): HtmlView;
  append(child: HTMLElement): HtmlView;
  append(child: Element): ElementView;
  append(child: Text): TextView;
  append(child: Node): NodeView;
  append(child: NodeView): typeof child;
  append(child: RenderView): typeof child;
  append<V extends ElementView>(child: ElementViewClass<Element, V>, key?: string): V;
  append<V extends ElementView>(child: string | Node | View | ElementViewClass<Element, V>, key?: string): View {
    if (typeof child === "string") {
      child = HtmlView.create(child);
    }
    if (child instanceof Node) {
      child = View.fromNode(child);
    }
    if (typeof child === "function") {
      child = View.create(child, key);
    }
    this.appendChildView(child);
    return child;
  }

  appendChildView(childView: View): void {
    if (RenderView.is(childView)) {
      this.appendRenderView(childView);
    } else {
      super.appendChildView(childView);
    }
  }

  appendRenderView(renderView: RenderView): void {
    this.willInsertChildView(renderView, null);
    this._renderViews.push(renderView);
    renderView.setParentView(this);
    this.onInsertChildView(renderView, null);
    this.didInsertChildView(renderView, null);
    this.animate();
  }

  prepend(child: "svg"): SvgView;
  prepend(child: "canvas"): CanvasView;
  prepend(tag: string): HtmlView;
  prepend(child: HTMLElement): HtmlView;
  prepend(child: Element): ElementView;
  prepend(child: Text): TextView;
  prepend(child: Node): NodeView;
  prepend(child: NodeView): typeof child;
  prepend(child: RenderView): typeof child;
  prepend<V extends ElementView>(child: ElementViewClass<Element, V>, key?: string): V;
  prepend<V extends ElementView>(child: string | Node | View | ElementViewClass<Element, V>, key?: string): View {
    if (typeof child === "string") {
      child = HtmlView.create(child);
    }
    if (child instanceof Node) {
      child = View.fromNode(child);
    }
    if (typeof child === "function") {
      child = View.create(child, key);
    }
    this.prependChildView(child);
    return child;
  }

  prependChildView(childView: View): void {
    if (RenderView.is(childView)) {
      this.prependRenderView(childView);
    } else {
      super.prependChildView(childView);
    }
  }

  prependRenderView(renderView: RenderView): void {
    this.willInsertChildView(renderView, null);
    this._renderViews.unshift(renderView);
    renderView.setParentView(this);
    this.onInsertChildView(renderView, null);
    this.didInsertChildView(renderView, null);
    this.animate();
  }

  insert(child: "svg", target: View | Node | null): SvgView;
  insert(child: "canvas", target: View | Node | null): CanvasView;
  insert(tag: string, target: View | Node | null): HtmlView;
  insert(child: HTMLElement, target: View | Node | null): HtmlView;
  insert(child: Element, target: View | Node | null): ElementView;
  insert(child: Text, target: View | Node | null): TextView;
  insert(child: Node, target: View | Node | null): NodeView;
  insert(child: NodeView, target: View | Node | null): typeof child;
  insert(child: RenderView, target: View | Node | null): typeof child;
  insert<V extends ElementView>(child: ElementViewClass<Element, V>,
                                target: View | Node | null, key?: string): V;
  insert<V extends ElementView>(child: string | Node | View | ElementViewClass<Element, V>,
                                target: View | Node | null, key?: string): View {
    if (typeof child === "string") {
      child = HtmlView.create(child);
    }
    if (child instanceof Node) {
      child = View.fromNode(child);
    }
    if (typeof child === "function") {
      child = View.create(child, key);
    }
    this.insertChild(child, target);
    return child;
  }

  insertChildView(childView: View, targetView: View | null): void {
    if (RenderView.is(childView) && RenderView.is(targetView)) {
      this.insertRenderView(childView, targetView);
    } else {
      super.insertChildView(childView, targetView);
    }
  }

  insertRenderView(renderView: RenderView, targetView: View | null): void {
    if (targetView !== null && !RenderView.is(targetView)) {
      throw new TypeError("" + targetView);
    }
    if (targetView !== null && targetView.parentView !== this) {
      throw new TypeError("" + targetView);
    }
    const renderViews = this._renderViews;
    this.willInsertChildView(renderView, targetView);
    const index = targetView ? renderViews.indexOf(targetView) : -1;
    if (index >= 0) {
      renderViews.splice(index, 0, renderView);
    } else {
      renderViews.push(renderView);
    }
    renderView.setParentView(this);
    this.onInsertChildView(renderView, targetView);
    this.didInsertChildView(renderView, targetView);
    this.animate();
  }

  protected onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    if (RenderView.is(childView)) {
      this.setChildViewBounds(childView, this._bounds);
      this.setChildViewAnchor(childView, this._anchor);
    }
  }

  removeChildView(childView: View): void {
    if (RenderView.is(childView)) {
      this.removeRenderView(childView);
    } else {
      super.removeChildView(childView);
    }
  }

  removeRenderView(renderView: RenderView): void {
    if (renderView.parentView !== this) {
      throw new TypeError("" + renderView);
    }
    const renderViews = this._renderViews;
    this.willRemoveChildView(renderView);
    renderView.setParentView(null);
    const index = renderViews.indexOf(renderView);
    if (index >= 0) {
      renderViews.splice(index, 1);
    }
    this.onRemoveChildView(renderView);
    this.didRemoveChildView(renderView);
    this.animate();
  }

  removeAll(): void {
    super.removeAll();
    const renderViews = this._renderViews;
    do {
      const count = renderViews.length;
      if (count > 0) {
        const childView = renderViews[count - 1];
        this.willRemoveChildView(childView);
        childView.setParentView(null);
        renderViews.pop();
        this.onRemoveChildView(childView);
        this.didRemoveChildView(childView);
        this.animate();
        continue;
      }
      break;
    } while (true);
  }

  cascadeMount(): void {
    this.willMount();
    this.onMount();
    const childNodes = this._node.childNodes;
    for (let i = 0, n = childNodes.length; i < n; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView) {
        childView.cascadeMount();
      }
    }
    const renderViews = this._renderViews;
    for (let i = 0, n = renderViews.length; i < n; i += 1) {
      const renderView = renderViews[i];
      renderView.cascadeMount();
    }
    this.didMount();
  }

  protected onMount(): void {
    super.onMount();
    this.resizeCanvas(this._node);
    this.animate();
    this.addEventListeners(this._node);
  }

  cascadeUnmount(): void {
    this.willUnmount();
    this.onUnmount();
    const childNodes = this._node.childNodes;
    for (let i = 0, n = childNodes.length; i < n; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView) {
        childView.cascadeUnmount();
      }
    }
    const renderViews = this._renderViews;
    for (let i = 0, n = renderViews.length; i < n; i += 1) {
      const renderView = renderViews[i];
      renderView.cascadeUnmount();
    }
    this.didUnmount();
  }

  protected onUnmount(): void {
    this.removeEventListeners(this._node);
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
      this._animationFrame = 0;
    }
    super.onUnmount();
  }

  cascadeResize(): void {
    this.willResize();
    this.onResize();
    const childNodes = this._node.childNodes;
    for (let i = 0, n = childNodes.length; i < n; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView) {
        childView.cascadeResize();
      }
    }
    const renderViews = this._renderViews;
    for (let i = 0, n = renderViews.length; i < n; i += 1) {
      const renderView = renderViews[i];
      renderView.cascadeResize();
    }
    this.didResize();
  }

  protected onResize(): void {
    super.onResize();
    this.resizeCanvas(this._node);
    this.setDirty(true);
  }

  protected didResize(): void {
    this.cascadeRender();
    super.didResize();
  }

  cascadeLayout(): void {
    this.willLayout();
    this.onLayout();
    const childNodes = this._node.childNodes;
    for (let i = 0, n = childNodes.length; i < n; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView) {
        childView.cascadeLayout();
      }
    }
    const renderViews = this._renderViews;
    for (let i = 0, n = renderViews.length; i < n; i += 1) {
      const renderView = renderViews[i];
      renderView.cascadeLayout();
    }
    this.didLayout();
  }

  cascadeScroll(): void {
    this.willScroll();
    this.onScroll();
    const childNodes = this._node.childNodes;
    for (let i = 0, n = childNodes.length; i < n; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView) {
        childView.cascadeScroll();
      }
    }
    const renderViews = this._renderViews;
    for (let i = 0, n = renderViews.length; i < n; i += 1) {
      const renderView = renderViews[i];
      renderView.cascadeScroll();
    }
    this.didScroll();
  }

  protected onAnimationFrame(timestamp: number): void {
    this._animationFrame = 0;
    this.cascadeAnimate(timestamp);
    this.cascadeCull();
    this.cascadeRender();

    this.detectMouseHover();
  }

  cascadeAnimate(frame: number): void {
    this.willAnimate(frame);
    this.onAnimate(frame);
    const renderViews = this._renderViews;
    for (let i = 0, n = renderViews.length; i < n; i += 1) {
      const renderView = renderViews[i];
      renderView.cascadeAnimate(frame);
    }
    this.didAnimate(frame);
  }

  cascadeRender(context: RenderingContext = this.getContext()): void {
    this.willRender(context);
    this.onRender(context);
    const renderViews = this._renderViews;
    for (let i = 0, n = renderViews.length; i < n; i += 1) {
      const renderView = renderViews[i];
      renderView.cascadeRender(context);
    }
    this.didRender(context);
  }

  protected willRender(context: RenderingContext): void {
    this.willObserve(function (viewObserver: RenderViewObserver): void {
      if (viewObserver.viewWillRender) {
        viewObserver.viewWillRender(context, this);
      }
    });
  }

  protected onRender(context: RenderingContext): void {
    const bounds = this._bounds;
    context.clearRect(0, 0, bounds.width, bounds.height);
  }

  protected didRender(context: RenderingContext): void {
    this.didObserve(function (viewObserver: RenderViewObserver): void {
      if (viewObserver.viewDidRender) {
        viewObserver.viewDidRender(context, this);
      }
    });
  }

  get hidden(): boolean {
    return false;
  }

  setHidden(hidden: boolean): void {
    // nop
  }

  cascadeCull(): void {
    this.willCull();
    this.onCull();
    const childViews = this.childViews;
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
    // hook
  }

  protected didCull(): void {
    this.didObserve(function (viewObserver: RenderViewObserver): void {
      if (viewObserver.viewDidCull) {
        viewObserver.viewDidCull(this);
      }
    });
  }

  get culled(): boolean {
    return false;
  }

  setCulled(culled: boolean): void {
    // nop
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
    const renderViews = this._renderViews;
    for (let i = 0, n = renderViews.length; i < n; i += 1) {
      this.setChildViewBounds(renderViews[i], bounds);
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
    // hook
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
    const renderViews = this._renderViews;
    for (let i = 0, n = renderViews.length; i < n; i += 1) {
      this.setChildViewAnchor(renderViews[i], anchor);
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
    return window.devicePixelRatio || 1;
  }

  get hitBounds(): BoxR2 | null {
    return null;
  }

  hitTest(x: number, y: number, context: RenderingContext = this.getContext()): RenderView | null {
    let hit: RenderView | null = null;
    const renderViews = this._renderViews;
    for (let i = renderViews.length - 1; i >= 0; i -= 1) {
      const renderView = renderViews[i];
      if (!renderView.hidden && !renderView.culled) {
        const hitBounds = renderView.hitBounds || renderView.bounds;
        if (hitBounds.contains(x, y)) {
          hit = renderView.hitTest(x, y, context);
          if (hit !== null) {
            break;
          }
        }
      }
    }
    return hit;
  }

  /** @hidden */
  handleEvent(event: ViewEvent): void {
    // nop
  }

  /** @hidden */
  bubbleEvent(event: ViewEvent): View | null {
    return this;
  }

  /** @hidden */
  addEventListeners(node: Node): void {
    node.addEventListener("click", this.onClick);
    node.addEventListener("dblclick", this.onDblClick);
    node.addEventListener("contextmenu", this.onContextMenu);
    node.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mousemove", this.onMouseMove);
    node.addEventListener("mouseup", this.onMouseUp);
    node.addEventListener("wheel", this.onWheel);

    node.addEventListener("touchstart", this.onTouchStart);
    node.addEventListener("touchmove", this.onTouchMove);
    node.addEventListener("touchcancel", this.onTouchCancel);
    node.addEventListener("touchend", this.onTouchEnd);
  }

  /** @hidden */
  removeEventListeners(node: Node): void {
    node.removeEventListener("click", this.onClick);
    node.removeEventListener("dblclick", this.onDblClick);
    node.removeEventListener("contextmenu", this.onContextMenu);
    node.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mousemove", this.onMouseMove);
    node.removeEventListener("mouseup", this.onMouseUp);
    node.removeEventListener("wheel", this.onWheel);

    node.removeEventListener("touchstart", this.onTouchStart);
    node.removeEventListener("touchmove", this.onTouchMove);
    node.removeEventListener("touchcancel", this.onTouchCancel);
    node.removeEventListener("touchend", this.onTouchEnd);
  }

  /** @hidden */
  fireEvent(event: ViewEvent, clientX: number, clientY: number): RenderView | null {
    const bounds = this.clientBounds;
    if (bounds.contains(clientX, clientY)) {
      const x = clientX - bounds.x;
      const y = clientY - bounds.y;
      const hit = this.hitTest(x, y);
      if (hit) {
        event.targetView = hit;
        hit.bubbleEvent(event);
        return hit;
      }
    }
    return null;
  }

  /** @hidden */
  private fireMouseEvent(event: MouseEvent): RenderView | null {
    return this.fireEvent(event, event.clientX, event.clientY);
  }

  /** @hidden */
  protected onClick(event: MouseEvent): void {
    this.fireMouseEvent(event);
  }

  /** @hidden */
  protected onDblClick(event: MouseEvent): void {
    this.fireMouseEvent(event);
  }

  /** @hidden */
  protected onContextMenu(event: MouseEvent): void {
    this.fireMouseEvent(event);
  }

  /** @hidden */
  protected onMouseDown(event: MouseEvent): void {
    this.fireMouseEvent(event);
  }

  /** @hidden */
  protected onMouseMove(event: MouseEvent): void {
    this._clientX = event.clientX;
    this._clientY = event.clientY;
    this._screenX = event.screenX;
    this._screenY = event.screenY;
    const oldHoverView = this._hoverView;
    const newHoverView = this.fireMouseEvent(event);
    if (newHoverView !== this._hoverView) {
      this.onMouseHoverChange(newHoverView, oldHoverView);
    }
  }

  /** @hidden */
  protected onMouseUp(event: MouseEvent): void {
    this.fireMouseEvent(event);
  }

  /** @hidden */
  protected onWheel(event: WheelEvent): void {
    this.fireMouseEvent(event);
  }

  /** @hidden */
  protected onMouseHoverChange(newHoverView: RenderView | null, oldHoverView: RenderView | null): void {
    const eventInit: MouseEventInit = {
      clientX: this._clientX,
      clientY: this._clientY,
      screenX: this._screenX,
      screenY: this._screenY,
      bubbles: true,
    };
    if (oldHoverView) {
      const outEvent = new MouseEvent("mouseout", eventInit) as ViewMouseEvent;
      outEvent.targetView = oldHoverView;
      outEvent.relatedTargetView = newHoverView;
      oldHoverView.bubbleEvent(outEvent);
    }
    this._hoverView = newHoverView;
    if (newHoverView) {
      const overEvent = new MouseEvent("mouseover", eventInit) as ViewMouseEvent;
      overEvent.targetView = newHoverView;
      overEvent.relatedTargetView = oldHoverView;
      newHoverView.bubbleEvent(overEvent);
    }
  }

  /** @hidden */
  protected detectMouseHover(): void {
    const bounds = this.clientBounds;
    if (bounds.contains(this._clientX, this._clientY)) {
      const x = this._clientX - bounds.x;
      const y = this._clientY - bounds.y;
      const oldHoverView = this._hoverView;
      const newHoverView = this.hitTest(x, y);
      if (newHoverView !== this._hoverView) {
        this.onMouseHoverChange(newHoverView, oldHoverView);
      }
    }
  }

  /** @hidden */
  private fireTouchEvent(type: string, originalEvent: TouchEvent, dispatched: RenderView[]): void {
    const changedTouches = originalEvent.changedTouches;
    for (let i = 0, n = changedTouches.length; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
      const targetView = changedTouch.targetView as RenderView | undefined;
      if (targetView && dispatched.indexOf(targetView) < 0) {
        const startEvent = new TouchEvent(type, {
          changedTouches: changedTouches as unknown as Touch[],
          targetTouches: originalEvent.targetTouches as unknown as Touch[],
          touches: originalEvent.touches as unknown as Touch[],
          bubbles: true,
        }) as ViewTouchEvent;
        startEvent.targetView = targetView;
        const targetViewTouches: Touch[] = [changedTouch];
        for (let j = i + 1; j < n; j += 1) {
          const nextTouch = changedTouches[j] as ViewTouch;
          if (nextTouch.targetView === targetView) {
            targetViewTouches.push(nextTouch);
          }
        }
        startEvent.targetViewTouches = document.createTouchList(...targetViewTouches);
        targetView.bubbleEvent(startEvent);
        dispatched.push(targetView);
      }
    }
  }

  /** @hidden */
  protected onTouchStart(event: TouchEvent): void {
    const bounds = this.clientBounds;
    const changedTouches = event.changedTouches;
    for (let i = 0, n = changedTouches.length; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
      const clientX = changedTouch.clientX;
      const clientY = changedTouch.clientY;
      if (bounds.contains(clientX, clientY)) {
        const x = clientX - bounds.x;
        const y = clientY - bounds.y;
        const hit = this.hitTest(x, y);
        if (hit) {
          changedTouch.targetView = hit;
        }
      }
      this._touches[changedTouch.identifier] = changedTouch;
    }
    const dispatched: RenderView[] = [];
    this.fireTouchEvent("touchstart", event, dispatched);
  }

  /** @hidden */
  protected onTouchMove(event: TouchEvent): void {
    const changedTouches = event.changedTouches;
    for (let i = 0, n = changedTouches.length; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
      const touch = this._touches[changedTouch.identifier];
      if (touch) {
        changedTouch.targetView = touch.targetView;
      }
    }
    const dispatched: RenderView[] = [];
    this.fireTouchEvent("touchmove", event, dispatched);
  }

  /** @hidden */
  protected onTouchCancel(event: TouchEvent): void {
    const changedTouches = event.changedTouches;
    const n = changedTouches.length;
    for (let i = 0; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
      const touch = this._touches[changedTouch.identifier];
      if (touch) {
        changedTouch.targetView = touch.targetView;
      }
    }
    const dispatched: RenderView[] = [];
    this.fireTouchEvent("touchcancel", event, dispatched);
    for (let i = 0; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
      delete this._touches[changedTouch.identifier];
    }
  }

  /** @hidden */
  protected onTouchEnd(event: TouchEvent): void {
    const changedTouches = event.changedTouches;
    const n = changedTouches.length;
    for (let i = 0; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
      const touch = this._touches[changedTouch.identifier];
      if (touch) {
        changedTouch.targetView = touch.targetView;
      }
    }
    const dispatched: RenderView[] = [];
    this.fireTouchEvent("touchend", event, dispatched);
    for (let i = 0; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
      delete this._touches[changedTouch.identifier];
    }
  }

  getContext(): RenderingContext {
    return this._node.getContext("2d")!;
  }

  protected resizeCanvas(node: ViewCanvas): void {
    let width: number;
    let height: number;
    let pixelRatio: number;
    let parentNode = node.parentNode;
    if (parentNode instanceof HTMLElement) {
      let bounds: ClientRect | DOMRect;
      do {
        bounds = parentNode.getBoundingClientRect();
        if (bounds.width && bounds.height) {
          break;
        }
        parentNode = parentNode.parentNode;
      } while (parentNode instanceof HTMLElement);
      width = Math.floor(bounds.width);
      height = Math.floor(bounds.height);
      pixelRatio = this.pixelRatio;
      node.width = width * pixelRatio;
      node.height = height * pixelRatio;
      node.style.width = width + "px";
      node.style.height = height + "px";
    } else {
      width = Math.floor(node.width);
      height = Math.floor(node.height);
      pixelRatio = 1;
    }
    const context = this.getContext();
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    this.setBounds(new BoxR2(0, 0, width, height));
    this.setAnchor(new PointR2(width / 2, height / 2));
  }

  /** @hidden */
  static readonly tag: string = "canvas";
}
View.Canvas = CanvasView;
