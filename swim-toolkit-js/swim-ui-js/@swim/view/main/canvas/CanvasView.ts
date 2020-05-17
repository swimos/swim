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
import {AnyRenderer, RendererType, Renderer, CanvasRenderer, WebGLRenderer} from "@swim/render";
import {ViewEvent, ViewMouseEvent, ViewTouch, ViewTouchEvent} from "../ViewEvent";
import {ViewContext} from "../ViewContext";
import {ViewFlags, View} from "../View";
import {RenderedViewContext} from "../rendered/RenderedViewContext";
import {RenderedView} from "../rendered/RenderedView";
import {RenderedViewObserver} from "../rendered/RenderedViewObserver";
import {ViewNode, ViewNodeType, NodeView} from "../node/NodeView";
import {TextView} from "../text/TextView";
import {ElementViewConstructor, ElementView} from "../element/ElementView";
import {HtmlChildViewTagMap, HtmlView} from "../html/HtmlView";
import {CanvasViewObserver} from "./CanvasViewObserver";
import {CanvasViewController} from "./CanvasViewController";

export interface ViewCanvas extends HTMLCanvasElement {
  view?: CanvasView;
}

export class CanvasView extends HtmlView implements RenderedView {
  /** @hidden */
  _eventSurface: Node;
  /** @hidden */
  readonly _renderedViews: RenderedView[];
  /** @hidden */
  _renderer: Renderer | null | undefined;
  /** @hidden */
  _viewFrame: BoxR2;
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

  constructor(node: HTMLCanvasElement) {
    super(node);
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
    this._viewFrame = BoxR2.empty();
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

  protected initNode(node: ViewNodeType<this>): void {
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
      if (childView !== void 0) {
        childViews.push(childView);
      }
    }
    childViews.push.apply(childViews, this._renderedViews);
    return childViews;
  }

  setChildView(key: string, newChildView: View | null): View | null {
    if (RenderedView.is(newChildView)) {
      return this.setRenderedView(key, newChildView);
    } else {
      return super.setChildView(key, newChildView);
    }
  }

  setRenderedView(key: string, newChildView: RenderedView | null): View | null {
    if (newChildView !== null && !RenderedView.is(newChildView)) {
      throw new TypeError("" + newChildView);
    }
    let index = -1;
    let oldChildView: View | null = null;
    let targetView: View | null = null;
    const childViews = this._renderedViews;
    const childViewMap = this._childViewMap;
    if (childViewMap !== void 0) {
      const childView = childViewMap[key];
      if (RenderedView.is(childView)) {
        index = childViews.indexOf(childView);
        // assert(index >= 0);
        oldChildView = childView;
        targetView = childViews[index + 1];
        this.willRemoveChildView(childView);
        childView.setParentView(null, this);
        this.removeChildViewMap(childView);
        childViews.splice(index, 1);
        this.onRemoveChildView(childView);
        this.didRemoveChildView(childView);
        childView.setKey(null);
      } else if (childView !== void 0) {
        oldChildView = childView;
        if (!(childView instanceof NodeView)) {
          throw new TypeError("" + childView);
        }
        const childNode = childView._node;
        const targetNode = childNode.nextSibling;
        targetView = targetNode !== null ? (targetNode as ViewNode).view || null : null;
        this.willRemoveChildView(childView);
        this.willRemoveChildNode(childNode);
        childView.setParentView(null, this);
        this.removeChildViewMap(childView);
        this._node.removeChild(childNode);
        this.onRemoveChildNode(childNode);
        this.onRemoveChildView(childView);
        this.didRemoveChildNode(childNode);
        this.didRemoveChildView(childView);
        childView.setKey(null);
      }
    }
    if (newChildView !== null) {
      newChildView.setKey(key);
      this.willInsertChildView(newChildView, targetView);
      if (index >= 0) {
        childViews.splice(index, 0, newChildView);
      } else {
        childViews.push(newChildView);
      }
      this.insertChildViewMap(newChildView);
      newChildView.setParentView(this, null);
      this.onInsertChildView(newChildView, targetView);
      this.didInsertChildView(newChildView, targetView);
    }
    return oldChildView;
  }

  get renderedViews(): ReadonlyArray<RenderedView> {
    return this._renderedViews;
  }

  append<T extends keyof HtmlChildViewTagMap>(tag: T, key?: string): HtmlChildViewTagMap[T];
  append(tag: string, key?: string): HtmlView;
  append(childNode: HTMLElement, key?: string): HtmlView;
  append(childNode: Element, key?: string): ElementView;
  append(childNode: Text, key?: string): TextView;
  append(childNode: Node, key?: string): NodeView;
  append<V extends NodeView | RenderedView>(childView: V, key?: string): V;
  append<C extends ElementViewConstructor>(viewConstructor: C, key?: string): InstanceType<C>;
  append(child: string | Node | View | ElementViewConstructor, key?: string): View {
    if (typeof child === "string") {
      child = View.fromTag(child);
    } else if (child instanceof Node) {
      child = View.fromNode(child);
    } else if (typeof child === "function") {
      child = View.fromConstructor(child);
    }
    this.appendChildView(child, key);
    return child;
  }

  appendChildView(childView: View, key?: string): void {
    if (RenderedView.is(childView)) {
      this.appendRenderedView(childView, key);
    } else {
      super.appendChildView(childView, key);
    }
  }

  appendRenderedView(childView: RenderedView, key?: string): void {
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    this.willInsertChildView(childView, null);
    this._renderedViews.push(childView);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, null);
    this.didInsertChildView(childView, null);
  }

  prepend<T extends keyof HtmlChildViewTagMap>(tag: T, key?: string): HtmlChildViewTagMap[T];
  prepend(tag: string, key?: string): HtmlView;
  prepend(childNode: HTMLElement, key?: string): HtmlView;
  prepend(childNode: Element, key?: string): ElementView;
  prepend(childNode: Text, key?: string): TextView;
  prepend(childNode: Node, key?: string): NodeView;
  prepend<V extends NodeView | RenderedView>(childView: V, key?: string): V;
  prepend<C extends ElementViewConstructor>(viewConstructor: C, key?: string): InstanceType<C>;
  prepend(child: string | Node | View | ElementViewConstructor, key?: string): View {
    if (typeof child === "string") {
      child = View.fromTag(child);
    } else if (child instanceof Node) {
      child = View.fromNode(child);
    } else if (typeof child === "function") {
      child = View.fromConstructor(child);
    }
    this.prependChildView(child, key);
    return child;
  }

  prependChildView(childView: View, key?: string): void {
    if (RenderedView.is(childView)) {
      this.prependRenderedView(childView);
    } else {
      super.prependChildView(childView);
    }
  }

  prependRenderedView(childView: RenderedView, key?: string): void {
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    this.willInsertChildView(childView, null);
    this._renderedViews.unshift(childView);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, null);
    this.didInsertChildView(childView, null);
  }

  insert<T extends keyof HtmlChildViewTagMap>(tag: T, target: View | Node | null, key?: string): HtmlChildViewTagMap[T];
  insert(tag: string, target: View | Node | null, key?: string): HtmlView;
  insert(childNode: HTMLElement, target: View | Node | null, key?: string): HtmlView;
  insert(childNode: Element, target: View | Node | null, key?: string): ElementView;
  insert(childNode: Text, target: View | Node | null, key?: string): TextView;
  insert(childNode: Node, target: View | Node | null, key?: string): NodeView;
  insert<V extends NodeView | RenderedView>(childView: V, target: View | Node | null, key?: string): V;
  insert<C extends ElementViewConstructor>(viewConstructor: C, target: View | Node | null, key?: string): InstanceType<C>;
  insert(child: string | Node | View | ElementViewConstructor, target: View | Node | null, key?: string): View {
    if (typeof child === "string") {
      child = View.fromTag(child);
    } else if (child instanceof Node) {
      child = View.fromNode(child);
    } else if (typeof child === "function") {
      child = View.fromConstructor(child);
    }
    this.insertChild(child, target);
    return child;
  }

  insertChildView(childView: View, targetView: View | null, key?: string): void {
    if (RenderedView.is(childView) && RenderedView.is(targetView)) {
      this.insertRenderedView(childView, targetView, key);
    } else {
      super.insertChildView(childView, targetView, key);
    }
  }

  insertRenderedView(childView: RenderedView, targetView: View | null, key?: string): void {
    if (targetView !== null && !RenderedView.is(targetView)) {
      throw new TypeError("" + targetView);
    }
    if (targetView !== null && targetView.parentView !== this) {
      throw new TypeError("" + targetView);
    }
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    this.willInsertChildView(childView, targetView);
    const renderedViews = this._renderedViews;
    const index = targetView !== null ? renderedViews.indexOf(targetView) : -1;
    if (index >= 0) {
      renderedViews.splice(index, 0, childView);
    } else {
      renderedViews.push(childView);
    }
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, targetView);
    this.didInsertChildView(childView, targetView);
  }

  removeChildView(key: string): View | null;
  removeChildView(childView: View): void;
  removeChildView(key: string | View): View | null | void {
    let childView: View | null;
    if (typeof key === "string") {
      childView = this.getChildView(key);
      if (childView === null) {
        return null;
      }
    } else {
      childView = key;
    }
    if (RenderedView.is(childView)) {
      this.removeRenderedView(childView);
    } else {
      super.removeChildView(childView);
    }
    if (typeof key === "string") {
      return childView;
    }
  }

  removeRenderedView(childView: RenderedView): void {
    if (childView.parentView !== this) {
      throw new Error("not a child view");
    }
    this.willRemoveChildView(childView);
    childView.setParentView(null, this);
    this.removeChildViewMap(childView);
    const renderedViews = this._renderedViews;
    const index = renderedViews.indexOf(childView);
    if (index >= 0) {
      renderedViews.splice(index, 1);
    }
    this.onRemoveChildView(childView);
    this.didRemoveChildView(childView);
    childView.setKey(null);
  }

  removeAll(): void {
    super.removeAll();
    const renderedViews = this._renderedViews;
    do {
      const count = renderedViews.length;
      if (count > 0) {
        const childView = renderedViews[count - 1];
        this.willRemoveChildView(childView);
        childView.setParentView(null, this);
        this.removeChildViewMap(childView);
        renderedViews.pop();
        this.onRemoveChildView(childView);
        this.didRemoveChildView(childView);
        childView.setKey(null);
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
      if (context !== null) {
        return new CanvasRenderer(context, this.pixelRatio);
      } else {
        throw new Error("Failed to create canvas rendering context");
      }
    } else if (rendererType === "webgl") {
      const context = this._node.getContext("webgl");
      if (context !== null) {
        return new WebGLRenderer(context, this.pixelRatio);
      } else {
        throw new Error("Failed to create webgl rendering context");
      }
    } else {
      throw new Error("Failed to create " + rendererType + " renderer");
    }
  }

  protected onMount(): void {
    super.onMount();
    this.addEventListeners(this._eventSurface);
  }

  /** @hidden */
  doMountChildViews(): void {
    const childNodes = this._node.childNodes;
    for (let i = 0; i < childNodes.length; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView !== void 0) {
        childView.cascadeMount();
      }
    }
    const renderedViews = this._renderedViews;
    for (let i = 0; i < renderedViews.length; i += 1) {
      const childView = renderedViews[i];
      childView.cascadeMount();
    }
  }

  protected onUnmount(): void {
    this.removeEventListeners(this._eventSurface);
    super.onUnmount();
  }

  /** @hidden */
  doUnmountChildViews(): void {
    const childNodes = this._node.childNodes;
    for (let i = 0; i < childNodes.length; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView !== void 0) {
        childView.cascadeUnmount();
      }
    }
    const renderedViews = this._renderedViews;
    for (let i = 0; i < renderedViews.length; i += 1) {
      const childView = renderedViews[i];
      childView.cascadeUnmount();
    }
  }

  /** @hidden */
  doPowerChildViews(): void {
    const childNodes = this._node.childNodes;
    for (let i = 0; i < childNodes.length; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView !== void 0) {
        childView.cascadePower();
      }
    }
    const renderedViews = this._renderedViews;
    for (let i = 0; i < renderedViews.length; i += 1) {
      const childView = renderedViews[i];
      childView.cascadePower();
    }
  }

  /** @hidden */
  doUnpowerChildViews(): void {
    const childNodes = this._node.childNodes;
    for (let i = 0; i < childNodes.length; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView !== void 0) {
        childView.cascadeUnpower();
      }
    }
    const renderedViews = this._renderedViews;
    for (let i = 0; i < renderedViews.length; i += 1) {
      const childView = renderedViews[i];
      childView.cascadeUnpower();
    }
  }

  protected modifyUpdate(updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & View.UpdateMask) !== 0) {
      if ((updateFlags & View.ProcessMask) !== 0) {
        additionalFlags |= View.NeedsProcess;
      }
      if ((updateFlags & View.DisplayMask) !== 0) {
        additionalFlags |= View.NeedsDisplay;
      }
      additionalFlags |= View.NeedsRender;
    }
    return additionalFlags;
  }

  cascadeProcess(processFlags: ViewFlags, viewContext: RenderedViewContext): void {
    viewContext = this.canvasViewContext(viewContext);
    super.cascadeProcess(processFlags, viewContext);
  }

  protected onScroll(viewContext: RenderedViewContext): void {
    super.onScroll(viewContext);
    this.setCulled(!this.intersectsViewport());
  }

  /** @hidden */
  protected doProcessChildViews(processFlags: ViewFlags, viewContext: RenderedViewContext): void {
    const childNodes = this._node.childNodes;
    const renderedViews = this._renderedViews;
    if ((processFlags & View.ProcessMask) !== 0 && (childNodes.length !== 0 || renderedViews.length !== 0)) {
      this.willProcessChildViews(viewContext);
      let i = 0;
      while (i < childNodes.length) {
        const childView = (childNodes[i] as ViewNode).view;
        if (childView !== void 0) {
          const childViewContext = this.childViewContext(childView, viewContext);
          this.doProcessChildView(childView, processFlags, childViewContext);
          if ((childView._viewFlags & View.RemovingFlag) !== 0) {
            childView._viewFlags &= ~View.RemovingFlag;
            this.removeChildView(childView);
            continue;
          }
        }
        i += 1;
      }
      i = 0;
      while (i < renderedViews.length) {
        const childView = renderedViews[i];
        const childViewContext = this.childViewContext(childView, viewContext);
        this.doProcessChildView(childView, processFlags, childViewContext);
        if ((childView.viewFlags & View.RemovingFlag) !== 0) {
          childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
          this.removeChildView(childView);
          continue;
        }
        i += 1;
      }
      this.didProcessChildViews(viewContext);
    }
  }

  cascadeDisplay(displayFlags: ViewFlags, viewContext: RenderedViewContext): void {
    viewContext = this.canvasViewContext(viewContext);
    super.cascadeDisplay(displayFlags, viewContext);
  }

  /** @hidden */
  protected doDisplay(displayFlags: ViewFlags, viewContext: RenderedViewContext): void {
    let cascadeFlags = displayFlags;
    this._viewFlags &= ~(View.NeedsDisplay | View.NeedsComposite);
    this.willDisplay(viewContext);
    this._viewFlags |= View.DisplayingFlag;
    try {
      if (((this._viewFlags | displayFlags) & View.NeedsLayout) !== 0) {
        cascadeFlags |= View.NeedsLayout;
        this._viewFlags &= ~View.NeedsLayout;
        this.willLayout(viewContext);
      }
      if (((this._viewFlags | displayFlags) & View.NeedsRender) !== 0) {
        cascadeFlags |= View.NeedsRender;
        this._viewFlags &= ~View.NeedsRender;
        this.willRender(viewContext);
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
    } finally {
      this._viewFlags &= ~View.DisplayingFlag;
      this.didDisplay(viewContext);
    }
  }

  protected didDisplay(viewContext: RenderedViewContext): void {
    this.detectMouseHover();
    super.didDisplay(viewContext);
  }

  protected onLayout(viewContext: RenderedViewContext): void {
    super.onLayout(viewContext);
    this.resizeCanvas(this._node);
    this.resetRenderer();
  }

  protected willRender(viewContext: RenderedViewContext): void {
    this.willObserve(function (viewObserver: RenderedViewObserver): void {
      if (viewObserver.viewWillRender !== void 0) {
        viewObserver.viewWillRender(viewContext, this);
      }
    });
  }

  protected onRender(viewContext: RenderedViewContext): void {
    this.clearCanvas();
  }

  protected didRender(viewContext: RenderedViewContext): void {
    this.didObserve(function (viewObserver: RenderedViewObserver): void {
      if (viewObserver.viewDidRender !== void 0) {
        viewObserver.viewDidRender(viewContext, this);
      }
    });
  }

  /** @hidden */
  protected doDisplayChildViews(displayFlags: ViewFlags, viewContext: RenderedViewContext): void {
    const childNodes = this._node.childNodes;
    const renderedViews = this._renderedViews;
    if ((displayFlags & View.DisplayMask) !== 0 && (childNodes.length !== 0 || renderedViews.length !== 0)) {
      this.willDisplayChildViews(viewContext);
      let i = 0;
      while (i < childNodes.length) {
        const childView = (childNodes[i] as ViewNode).view;
        if (childView !== void 0) {
          const childViewContext = this.childViewContext(childView, viewContext);
          this.doDisplayChildView(childView, displayFlags, childViewContext);
          if ((childView._viewFlags & View.RemovingFlag) !== 0) {
            childView._viewFlags &= ~View.RemovingFlag;
            this.removeChildView(childView);
            continue;
          }
        }
        i += 1;
      }
      i = 0;
      while (i < renderedViews.length) {
        const childView = renderedViews[i];
        const childViewContext = this.childViewContext(childView, viewContext);
        this.doDisplayChildView(childView, displayFlags, childViewContext);
        if ((childView.viewFlags & View.RemovingFlag) !== 0) {
          childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
          this.removeChildView(childView);
          continue;
        }
        i += 1;
      }
      this.didDisplayChildViews(viewContext);
    }
  }

  childViewContext(childView: View, viewContext: RenderedViewContext): RenderedViewContext {
    return viewContext;
  }

  canvasViewContext(viewContext?: ViewContext): RenderedViewContext {
    if (viewContext === void 0) {
      viewContext = this.rootView!.viewContext;
    }
    return {
      updateTime: viewContext.updateTime,
      viewport: viewContext.viewport,
      viewIdiom: viewContext.viewIdiom,
      renderer: this.renderer,
    };
  }

  isHidden(): boolean {
    return (this._viewFlags & View.HiddenFlag) !== 0
  }

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
    this.willObserve(function (viewObserver: CanvasViewObserver): void {
      if (viewObserver.viewWillSetHidden !== void 0) {
        viewObserver.viewWillSetHidden(hidden, this);
      }
    });
  }

  protected onSetHidden(hidden: boolean): void {
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetHidden(hidden: boolean): void {
    this.didObserve(function (viewObserver: CanvasViewObserver): void {
      if (viewObserver.viewDidSetHidden !== void 0) {
        viewObserver.viewDidSetHidden(hidden, this);
      }
    });
  }

  isCulled(): boolean {
    return (this._viewFlags & View.CulledFlag) !== 0;
  }

  setCulled(newCulled: boolean): void {
    const oldCulled = (this._viewFlags & View.CulledFlag) !== 0;
    if (oldCulled !== newCulled) {
      this.willSetCulled(newCulled);
      if (newCulled) {
        this._viewFlags |= View.CulledFlag;
      } else {
        this._viewFlags &= ~View.CulledFlag;
      }
      this.onSetCulled(newCulled);
      this.didSetCulled(newCulled);
    }
  }

  protected willSetCulled(culled: boolean): void {
    this.willObserve(function (viewObserver: CanvasViewObserver): void {
      if (viewObserver.viewWillSetCulled !== void 0) {
        viewObserver.viewWillSetCulled(culled, this);
      }
    });
  }

  protected onSetCulled(culled: boolean): void {
    if (!culled) {
      this.requireUpdate(View.NeedsLayout);
    }
  }

  protected didSetCulled(culled: boolean): void {
    this.didObserve(function (viewObserver: CanvasViewObserver): void {
      if (viewObserver.viewDidSetCulled !== void 0) {
        viewObserver.viewDidSetCulled(culled, this);
      }
    });
  }

  get viewFrame(): BoxR2 {
    return this._viewFrame;
  }

  setViewFrame(viewFrame: BoxR2 | null): void {
    // nop
  }

  get viewBounds(): BoxR2 {
    return this._viewFrame;
  }

  get hitBounds(): BoxR2 {
    return this._viewFrame;
  }

  hitTest(x: number, y: number, viewContext?: RenderedViewContext): RenderedView | null {
    if (viewContext === void 0) {
      viewContext = this.canvasViewContext();
    }
    let hit: RenderedView | null = null;
    const renderedViews = this._renderedViews;
    for (let i = renderedViews.length - 1; i >= 0; i -= 1) {
      const childView = renderedViews[i];
      if (!childView.isHidden() && !childView.isCulled()) {
        const hitBounds = childView.hitBounds;
        if (hitBounds.contains(x, y)) {
          hit = childView.hitTest(x, y, viewContext);
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
  protected addEventListeners(node: Node): void {
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
  protected removeEventListeners(node: Node): void {
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
    const clientBounds = this.clientBounds;
    if (clientBounds.contains(clientX, clientY)) {
      const x = clientX - clientBounds.x;
      const y = clientY - clientBounds.y;
      const hit = this.hitTest(x, y);
      if (hit !== null) {
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
    if (oldHoverView !== null) {
      const outEvent = new MouseEvent("mouseout", eventInit) as ViewMouseEvent;
      outEvent.targetView = oldHoverView;
      outEvent.relatedTargetView = newHoverView;
      oldHoverView.bubbleEvent(outEvent);
    }
    this._hoverView = newHoverView;
    if (newHoverView !== null) {
      const overEvent = new MouseEvent("mouseover", eventInit) as ViewMouseEvent;
      overEvent.targetView = newHoverView;
      overEvent.relatedTargetView = oldHoverView;
      newHoverView.bubbleEvent(overEvent);
    }
  }

  /** @hidden */
  protected detectMouseHover(): void {
    const clientBounds = this.clientBounds;
    if (clientBounds.contains(this._clientX, this._clientY)) {
      const x = this._clientX - clientBounds.x;
      const y = this._clientY - clientBounds.y;
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
      if (targetView !== void 0 && dispatched.indexOf(targetView) < 0) {
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
    const clientBounds = this.clientBounds;
    const changedTouches = event.changedTouches;
    for (let i = 0, n = changedTouches.length; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
      const clientX = changedTouch.clientX;
      const clientY = changedTouch.clientY;
      if (clientBounds.contains(clientX, clientY)) {
        const x = clientX - clientBounds.x;
        const y = clientY - clientBounds.y;
        const hit = this.hitTest(x, y);
        if (hit !== null) {
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
      if (touch !== void 0) {
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
      if (touch !== void 0) {
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
      if (touch !== void 0) {
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
        if (bounds.width !== 0 && bounds.height !== 0) {
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
    this._viewFrame = new BoxR2(0, 0, width, height);
  }

  clearCanvas(): void {
    const renderer = this.renderer;
    if (renderer instanceof CanvasRenderer) {
      const frame = this._viewFrame;
      renderer.context.clearRect(0, 0, frame.width, frame.height);
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
      const frame = this._viewFrame;
      renderer.context.viewport(0, 0, frame.width, frame.height);
    }
  }

  /** @hidden */
  static readonly tag: string = "canvas";
}
View.Canvas = CanvasView;
