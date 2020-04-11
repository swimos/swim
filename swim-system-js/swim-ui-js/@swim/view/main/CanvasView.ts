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

import {PointR2, BoxR2} from "@swim/math";
import {AnyRenderer, RendererType, Renderer, CanvasRenderer, WebGLRenderer} from "@swim/render";
import {ViewEvent, ViewMouseEvent, ViewTouch, ViewTouchEvent} from "./ViewEvent";
import {ViewContext} from "./ViewContext";
import {View} from "./View";
import {RenderedViewContext} from "./RenderedViewContext";
import {RenderedView} from "./RenderedView";
import {RenderedViewObserver} from "./RenderedViewObserver";
import {ViewNode, NodeView} from "./NodeView";
import {TextView} from "./TextView";
import {ElementViewClass, ElementView} from "./ElementView";
import {SvgView} from "./SvgView";
import {HtmlView} from "./HtmlView";
import {CanvasViewController} from "./CanvasViewController";

export interface ViewCanvas extends HTMLCanvasElement {
  view?: CanvasView;
}

export class CanvasView extends HtmlView implements RenderedView {
  /** @hidden */
  readonly _node: ViewCanvas;
  /** @hidden */
  _eventSurface: Node;
  /** @hidden */
  _viewController: CanvasViewController | null;
  /** @hidden */
  readonly _renderedViews: RenderedView[];
  /** @hidden */
  _renderer: Renderer | null | undefined;
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
   * The `RenderedView` over which the mouse is currently hovering.
   * @hidden
   */
  _hoverView: RenderedView | null;
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

    this._eventSurface = this._node;
    this._renderedViews = [];
    this._renderer = void 0;
    this._bounds = BoxR2.empty();
    this._anchor = PointR2.origin();
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
    childViews.push.apply(childViews, this._renderedViews);
    return childViews;
  }

  getChildView(key: string): View | null {
    const renderedViews = this._renderedViews;
    for (let i = renderedViews.length - 1; i >= 0; i -= 1) {
      const renderedView = renderedViews[i];
      if (renderedView.key() === key) {
        return renderedView;
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
    if (RenderedView.is(newChildView)) {
      return this.setRenderedView(key, newChildView);
    } else {
      return super.setChildView(key, newChildView);
    }
  }

  setRenderedView(key: string, newChildView: RenderedView | null): RenderedView | null {
    if (!RenderedView.is(newChildView)) {
      throw new TypeError("" + newChildView);
    }
    let oldChildView: RenderedView | null = null;
    let targetView: RenderedView | null = null;
    const renderedViews = this._renderedViews;
    let index = renderedViews.length - 1;
    while (index >= 0) {
      const childView = renderedViews[index];
      if (childView.key() === key) {
        oldChildView = childView;
        targetView = renderedViews[index + 1] || null;
        this.willRemoveChildView(childView);
        childView.setParentView(null);
        renderedViews.splice(index, 1);
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
        renderedViews.splice(index, 0, newChildView);
      } else {
        renderedViews.push(newChildView);
      }
      newChildView.setParentView(this);
      this.onInsertChildView(newChildView, targetView);
      this.didInsertChildView(newChildView, targetView);
    }
    return oldChildView;
  }

  get renderedViews(): ReadonlyArray<RenderedView> {
    return this._renderedViews;
  }

  append(child: "svg"): SvgView;
  append(child: "canvas"): CanvasView;
  append(tag: string): HtmlView;
  append(child: HTMLElement): HtmlView;
  append(child: Element): ElementView;
  append(child: Text): TextView;
  append(child: Node): NodeView;
  append(child: NodeView): typeof child;
  append(child: RenderedView): typeof child;
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
    if (RenderedView.is(childView)) {
      this.appendRenderedView(childView);
    } else {
      super.appendChildView(childView);
    }
  }

  appendRenderedView(renderedView: RenderedView): void {
    this.willInsertChildView(renderedView, null);
    this._renderedViews.push(renderedView);
    renderedView.setParentView(this);
    this.onInsertChildView(renderedView, null);
    this.didInsertChildView(renderedView, null);
  }

  prepend(child: "svg"): SvgView;
  prepend(child: "canvas"): CanvasView;
  prepend(tag: string): HtmlView;
  prepend(child: HTMLElement): HtmlView;
  prepend(child: Element): ElementView;
  prepend(child: Text): TextView;
  prepend(child: Node): NodeView;
  prepend(child: NodeView): typeof child;
  prepend(child: RenderedView): typeof child;
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
    if (RenderedView.is(childView)) {
      this.prependRenderedView(childView);
    } else {
      super.prependChildView(childView);
    }
  }

  prependRenderedView(renderedView: RenderedView): void {
    this.willInsertChildView(renderedView, null);
    this._renderedViews.unshift(renderedView);
    renderedView.setParentView(this);
    this.onInsertChildView(renderedView, null);
    this.didInsertChildView(renderedView, null);
  }

  insert(child: "svg", target: View | Node | null): SvgView;
  insert(child: "canvas", target: View | Node | null): CanvasView;
  insert(tag: string, target: View | Node | null): HtmlView;
  insert(child: HTMLElement, target: View | Node | null): HtmlView;
  insert(child: Element, target: View | Node | null): ElementView;
  insert(child: Text, target: View | Node | null): TextView;
  insert(child: Node, target: View | Node | null): NodeView;
  insert(child: NodeView, target: View | Node | null): typeof child;
  insert(child: RenderedView, target: View | Node | null): typeof child;
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
    if (RenderedView.is(childView) && RenderedView.is(targetView)) {
      this.insertRenderedView(childView, targetView);
    } else {
      super.insertChildView(childView, targetView);
    }
  }

  insertRenderedView(renderedView: RenderedView, targetView: View | null): void {
    if (targetView !== null && !RenderedView.is(targetView)) {
      throw new TypeError("" + targetView);
    }
    if (targetView !== null && targetView.parentView !== this) {
      throw new TypeError("" + targetView);
    }
    const renderedViews = this._renderedViews;
    this.willInsertChildView(renderedView, targetView);
    const index = targetView ? renderedViews.indexOf(targetView) : -1;
    if (index >= 0) {
      renderedViews.splice(index, 0, renderedView);
    } else {
      renderedViews.push(renderedView);
    }
    renderedView.setParentView(this);
    this.onInsertChildView(renderedView, targetView);
    this.didInsertChildView(renderedView, targetView);
  }

  protected onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    if (RenderedView.is(childView)) {
      this.setChildViewBounds(childView, this._bounds);
      this.setChildViewAnchor(childView, this._anchor);
    }
  }

  removeChildView(childView: View): void {
    if (RenderedView.is(childView)) {
      this.removeRenderedView(childView);
    } else {
      super.removeChildView(childView);
    }
  }

  removeRenderedView(renderedView: RenderedView): void {
    if (renderedView.parentView !== this) {
      throw new TypeError("" + renderedView);
    }
    const renderedViews = this._renderedViews;
    this.willRemoveChildView(renderedView);
    renderedView.setParentView(null);
    const index = renderedViews.indexOf(renderedView);
    if (index >= 0) {
      renderedViews.splice(index, 1);
    }
    this.onRemoveChildView(renderedView);
    this.didRemoveChildView(renderedView);
  }

  removeAll(): void {
    super.removeAll();
    const renderedViews = this._renderedViews;
    do {
      const count = renderedViews.length;
      if (count > 0) {
        const childView = renderedViews[count - 1];
        this.willRemoveChildView(childView);
        childView.setParentView(null);
        renderedViews.pop();
        this.onRemoveChildView(childView);
        this.didRemoveChildView(childView);
        continue;
      }
      break;
    } while (true);
  }

  get pixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  get renderer(): Renderer | null {
    let renderer = this._renderer;
    if (renderer === void 0) {
      renderer = this.createRenderer();
      this._renderer = renderer;
    }
    return renderer;
  }

  setRenderer(renderer: AnyRenderer | null): void {
    if (typeof renderer === "string") {
      renderer = this.createRenderer(renderer as RendererType);
    }
    this._renderer = renderer;
    this.resetRenderer();
  }

  protected createRenderer(rendererType: RendererType = "canvas"): Renderer | null {
    if (rendererType === "canvas") {
      const context = this._node.getContext("2d");
      if (context) {
        return new CanvasRenderer(context, this.pixelRatio);
      } else {
        throw new Error("Failed to create canvas rendering context");
      }
    } else if (rendererType === "webgl") {
      const context = this._node.getContext("webgl");
      if (context) {
        return new WebGLRenderer(context, this.pixelRatio);
      } else {
        throw new Error("Failed to create webgl rendering context");
      }
    } else {
      throw new Error("Failed to create " + rendererType + " renderer");
    }
  }

  requireUpdate(updateFlags: number, immediate: boolean = false): void {
    this.requestUpdate(updateFlags, immediate);
  }

  requestUpdate(updateFlags: number, immediate: boolean): void {
    const oldUpdateFlags = this.updateFlags;
    const newUpdateFlags = oldUpdateFlags | updateFlags;
    const deltaUpdateFlags = newUpdateFlags & ~oldUpdateFlags;
    if (deltaUpdateFlags !== 0) {
      this.setUpdateFlags(newUpdateFlags);
      const parentView = this.parentView;
      if (parentView) {
        parentView.requestUpdate(updateFlags, immediate);
      }
    }
  }

  needsUpdate(updateFlags: number, viewContext: RenderedViewContext): number {
    if ((updateFlags & (View.NeedsAnimate | View.NeedsLayout | ~View.UpdateFlagsMask)) !== 0) {
      updateFlags = updateFlags | View.NeedsRender;
    }
    return updateFlags;
  }

  /** @hidden */
  doUpdate(updateFlags: number, viewContext: ViewContext): void {
    const canvasViewContext = this.canvasViewContext(viewContext);
    // Clear any unknown update flags.
    this._updateFlags = this._updateFlags & (View.NeedsCompute | View.NeedsAnimate | View.NeedsLayout | View.NeedsScroll | View.NeedsRender);
    this.willUpdate(canvasViewContext);
    if (((updateFlags | this._updateFlags) & View.NeedsCompute) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsCompute;
      this.doCompute(canvasViewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsAnimate) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsAnimate;
      this.doAnimate(canvasViewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsLayout) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsLayout;
      this.doLayout(canvasViewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsScroll) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsScroll;
      this.doScroll(canvasViewContext);
    }
    if (((updateFlags | this._updateFlags) & View.NeedsRender) !== 0) {
      this._updateFlags = this._updateFlags & ~View.NeedsRender;
      this.doRender(canvasViewContext);
    }
    this.onUpdate(canvasViewContext);
    this.doUpdateChildViews(updateFlags, canvasViewContext);
    this.didUpdate(canvasViewContext);
  }

  /** @hidden */
  doLayout(viewContext: RenderedViewContext): void {
    if (this.parentView) {
      this.resizeCanvas(this._node);
      this.resetRenderer();
      this.willLayout(viewContext);
      this.onLayout(viewContext);
      this.didLayout(viewContext);
    }
  }

  /** @hidden */
  doRender(viewContext: RenderedViewContext): void {
    if (this.parentView) {
      this.willRender(viewContext);
      this.onRender(viewContext);
      this.didRender(viewContext);
    }
  }

  protected willRender(viewContext: RenderedViewContext): void {
    this.willObserve(function (viewObserver: RenderedViewObserver): void {
      if (viewObserver.viewWillRender) {
        viewObserver.viewWillRender(viewContext, this);
      }
    });
  }

  protected onRender(viewContext: RenderedViewContext): void {
    this.clearCanvas();
  }

  protected didRender(viewContext: RenderedViewContext): void {
    this.didObserve(function (viewObserver: RenderedViewObserver): void {
      if (viewObserver.viewDidRender) {
        viewObserver.viewDidRender(viewContext, this);
      }
    });
  }

  get hidden(): boolean {
    return false;
  }

  setHidden(hidden: boolean): void {
    // nop
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
    const renderedViews = this._renderedViews;
    for (let i = 0, n = renderedViews.length; i < n; i += 1) {
      this.setChildViewBounds(renderedViews[i], bounds);
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
      const viewObserver = viewObservers[i] as RenderedViewObserver;
      if (viewObserver.viewWillSetBounds) {
        viewObserver.viewWillSetBounds(bounds, this);
      }
    }
  }

  protected onSetBounds(newBounds: BoxR2, oldBounds: BoxR2): void {
    // hook
  }

  protected didSetBounds(newBounds: BoxR2, oldBounds: BoxR2): void {
    this.didObserve(function (viewObserver: RenderedViewObserver): void {
      if (viewObserver.viewDidSetBounds) {
        viewObserver.viewDidSetBounds(newBounds, oldBounds, this);
      }
    });
  }

  protected setChildViewBounds(childView: RenderedView, bounds: BoxR2): void {
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
    const renderedViews = this._renderedViews;
    for (let i = 0, n = renderedViews.length; i < n; i += 1) {
      this.setChildViewAnchor(renderedViews[i], anchor);
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
      const viewObserver = viewObservers[i] as RenderedViewObserver;
      if (viewObserver.viewWillSetAnchor) {
        viewObserver.viewWillSetAnchor(anchor, this);
      }
    }
  }

  protected onSetAnchor(newAnchor: PointR2, oldAnchor: PointR2): void {
    // hook
  }

  protected didSetAnchor(newAnchor: PointR2, oldAnchor: PointR2): void {
    this.didObserve(function (viewObserver: RenderedViewObserver): void {
      if (viewObserver.viewDidSetAnchor) {
        viewObserver.viewDidSetAnchor(newAnchor, oldAnchor, this);
      }
    });
  }

  protected setChildViewAnchor(childView: RenderedView, anchor: PointR2): void {
    childView.setAnchor(anchor);
  }

  protected onMount(): void {
    this.addEventListeners(this._eventSurface);
  }

  protected onUnmount(): void {
    this.removeEventListeners(this._eventSurface);
    super.onUnmount();
  }

  /** @hidden */
  doMountChildViews(): void {
    const childNodes = this._node.childNodes;
    for (let i = 0; i < childNodes.length; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView) {
        childView.cascadeMount();
      }
    }
    const renderedViews = this._renderedViews;
    for (let i = 0; i < renderedViews.length; i += 1) {
      const renderedView = renderedViews[i];
      renderedView.cascadeMount();
    }
  }

  /** @hidden */
  doUnmountChildViews(): void {
    const childNodes = this._node.childNodes;
    for (let i = 0; i < childNodes.length; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView) {
        childView.cascadeUnmount();
      }
    }
    const renderedViews = this._renderedViews;
    for (let i = 0; i < renderedViews.length; i += 1) {
      const renderedView = renderedViews[i];
      renderedView.cascadeUnmount();
    }
  }

  protected didUpdate(viewContext: RenderedViewContext): void {
    super.didUpdate(viewContext);
    this.detectMouseHover();
  }

  protected onLayout(viewContext: RenderedViewContext): void {
    super.onLayout(viewContext);
    this.layoutChildViews(viewContext);
  }

  protected layoutChildViews(viewContext: RenderedViewContext): void {
    const renderedViews = this._renderedViews;
    for (let i = 0; i < renderedViews.length; i += 1) {
      const renderedView = renderedViews[i];
      this.layoutChildView(renderedView, viewContext);
    }
  }

  protected layoutChildView(childView: View, viewContext: RenderedViewContext): void {
    if (RenderedView.is(childView)) {
      childView.setBounds(this._bounds);
      childView.setAnchor(this._anchor);
    }
  }

  /** @hidden */
  doUpdateChildViews(updateFlags: number, viewContext: RenderedViewContext): void {
    this.willUpdateChildViews(viewContext);
    const childNodes = this._node.childNodes;
    for (let i = 0; i < childNodes.length; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView) {
        const childViewContext = this.childViewContext(childView, viewContext);
        childView.cascadeUpdate(updateFlags, childViewContext);
      }
    }
    const renderedViews = this._renderedViews;
    for (let i = 0; i < renderedViews.length; i += 1) {
      const renderedView = renderedViews[i];
      const renderedViewContext = this.childViewContext(renderedView, viewContext);
      renderedView.cascadeUpdate(updateFlags, renderedViewContext);
    }
    this.didUpdateChildViews(viewContext);
  }

  childViewContext(childView: View, viewContext: RenderedViewContext): RenderedViewContext {
    return viewContext;
  }

  canvasViewContext(viewContext?: ViewContext): RenderedViewContext {
    if (viewContext === void 0) {
      viewContext = this.appView!.appViewContext();
    }
    return {
      updateTime: viewContext.updateTime,
      viewport: viewContext.viewport,
      viewIdiom: viewContext.viewIdiom,
      renderer: this.renderer,
    };
  }

  get hitBounds(): BoxR2 | null {
    return null;
  }

  hitTest(x: number, y: number, viewContext?: RenderedViewContext): RenderedView | null {
    if (viewContext === void 0) {
      viewContext = this.canvasViewContext();
    }
    let hit: RenderedView | null = null;
    const renderedViews = this._renderedViews;
    for (let i = renderedViews.length - 1; i >= 0; i -= 1) {
      const renderedView = renderedViews[i];
      if (!renderedView.hidden && !renderedView.culled) {
        const hitBounds = renderedView.hitBounds || renderedView.bounds;
        if (hitBounds.contains(x, y)) {
          hit = renderedView.hitTest(x, y, viewContext);
          if (hit !== null) {
            break;
          }
        }
      }
    }
    return hit;
  }

  get eventSurface(): Node {
    return this._eventSurface;
  }

  setEventSurface(eventSurface?: Node): void {
    if (eventSurface === void 0) {
      eventSurface = this._node;
    }
    if (this._eventSurface !== eventSurface) {
      this.removeEventListeners(this._eventSurface);
      this._eventSurface = eventSurface;
      this.addEventListeners(this._eventSurface);
    }
  }

  /** @hidden */
  handleEvent(event: ViewEvent): void {
    // nop
  }

  /** @hidden */
  bubbleEvent(event: ViewEvent): View | null {
    this.handleEvent(event);
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
    node.addEventListener("wheel", this.onWheel, {passive: true});

    node.addEventListener("touchstart", this.onTouchStart, {passive: true});
    node.addEventListener("touchmove", this.onTouchMove, {passive: true});
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
  fireEvent(event: ViewEvent, clientX: number, clientY: number): RenderedView | null {
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
  private fireMouseEvent(event: MouseEvent): RenderedView | null {
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
  protected onMouseHoverChange(newHoverView: RenderedView | null, oldHoverView: RenderedView | null): void {
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
      if (newHoverView !== oldHoverView) {
        this.onMouseHoverChange(newHoverView, oldHoverView);
      }
    }
  }

  /** @hidden */
  private fireTouchEvent(type: string, originalEvent: TouchEvent, dispatched: RenderedView[]): void {
    const changedTouches = originalEvent.changedTouches;
    for (let i = 0, n = changedTouches.length; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
      const targetView = changedTouch.targetView as RenderedView | undefined;
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
        if (typeof (document as any).createTouchList) {
          startEvent.targetViewTouches = (document as any).createTouchList(...targetViewTouches);
        } else {
          (targetViewTouches as unknown as TouchList).item = function (index: number): Touch {
            return targetViewTouches[index];
          };
          startEvent.targetViewTouches = targetViewTouches as unknown as TouchList;
        }
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
    const dispatched: RenderedView[] = [];
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
    const dispatched: RenderedView[] = [];
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
    const dispatched: RenderedView[] = [];
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
    const dispatched: RenderedView[] = [];
    this.fireTouchEvent("touchend", event, dispatched);
    for (let i = 0; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
      delete this._touches[changedTouch.identifier];
    }
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
    this.setBounds(new BoxR2(0, 0, width, height));
    this.setAnchor(new PointR2(width / 2, height / 2));
  }

  clearCanvas(): void {
    const renderer = this.renderer;
    if (renderer instanceof CanvasRenderer) {
      const bounds = this._bounds;
      renderer.context.clearRect(0, 0, bounds.width, bounds.height);
    } else if (renderer instanceof WebGLRenderer) {
      const context = renderer.context;
      context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
    }
  }

  resetRenderer(): void {
    const renderer = this.renderer;
    if (renderer instanceof CanvasRenderer) {
      const pixelRatio = this.pixelRatio;
      renderer.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    } else if (renderer instanceof WebGLRenderer) {
      const bounds = this._bounds;
      renderer.context.viewport(0, 0, bounds.width, bounds.height);
    }
  }

  /** @hidden */
  static readonly tag: string = "canvas";
}
View.Canvas = CanvasView;
