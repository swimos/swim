// Copyright 2015-2021 Swim Inc.
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

import {Arrays} from "@swim/util";
import {R2Box} from "@swim/math";
import {
  ViewContextType,
  ViewContext,
  ViewConstructor,
  ViewFlags,
  View,
  ViewObserverType,
  ViewWillRender,
  ViewDidRender,
  ViewWillRasterize,
  ViewDidRasterize,
  ViewWillComposite,
  ViewDidComposite,
  ViewEvent,
  ViewMouseEventInit,
  ViewMouseEvent,
  ViewPointerEventInit,
  ViewPointerEvent,
  ViewTouchInit,
  ViewTouch,
  ViewTouchEvent,
} from "@swim/view";
import {
  ViewNode,
  NodeViewConstructor,
  NodeView,
  ElementView,
  HtmlViewInit,
  HtmlViewTagMap,
  HtmlView,
} from "@swim/dom";
import type {AnyGraphicsRenderer, GraphicsRendererType, GraphicsRenderer} from "../graphics/GraphicsRenderer";
import type {GraphicsViewContext} from "../graphics/GraphicsViewContext";
import {GraphicsView} from "../graphics/GraphicsView";
import {WebGLRenderer} from "../webgl/WebGLRenderer";
import {CanvasRenderer} from "./CanvasRenderer";
import type {CanvasViewObserver} from "./CanvasViewObserver";

/** @hidden */
export interface CanvasViewMouse extends ViewMouseEventInit {
}

/** @hidden */
export interface CanvasViewPointer extends ViewPointerEventInit {
}

/** @hidden */
export interface CanvasViewTouch extends ViewTouchInit {
}

export interface CanvasViewInit extends HtmlViewInit {
  renderer?: AnyGraphicsRenderer;
  clickEventsEnabled?: boolean;
  wheelEventsEnabled?: boolean;
  mouseEventsEnabled?: boolean;
  pointerEventsEnabled?: boolean;
  touchEventsEnabled?: boolean;
}

export type CanvasFlags = number;

export class CanvasView extends HtmlView {
  constructor(node: HTMLCanvasElement) {
    super(node);
    Object.defineProperty(this, "graphicsViews", {
      value: [],
      enumerable: true,
    });
    Object.defineProperty(this, "renderer", {
      value: this.createRenderer(),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "viewFrame", {
      value: R2Box.undefined(),
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "canvasFlags", {
      value: CanvasView.ClickEventsFlag,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(this, "eventNode", {
      value: node,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "mouse", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "pointers", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "touches", {
      value: null,
      enumerable: true,
      configurable: true,
    });

    this.onClick = this.onClick.bind(this);
    this.onDblClick = this.onDblClick.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);

    this.onWheel = this.onWheel.bind(this);

    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    this.onPointerEnter = this.onPointerEnter.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerCancel = this.onPointerCancel.bind(this);

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTouchCancel = this.onTouchCancel.bind(this);

    this.initCanvas();
  }

  protected initCanvas(): void {
    this.position.setState("absolute", View.Intrinsic);
  }

  override readonly node!: HTMLCanvasElement;

  override readonly viewObservers!: ReadonlyArray<CanvasViewObserver>;

  override initView(init: CanvasViewInit): void {
    super.initView(init);
    if (init.renderer !== void 0) {
      this.setRenderer(init.renderer);
    }
    if (init.clickEventsEnabled !== void 0) {
      this.clickEventsEnabled(init.clickEventsEnabled);
    }
    if (init.wheelEventsEnabled !== void 0) {
      this.wheelEventsEnabled(init.wheelEventsEnabled);
    }
    if (init.mouseEventsEnabled !== void 0) {
      this.mouseEventsEnabled(init.mouseEventsEnabled);
    }
    if (init.pointerEventsEnabled !== void 0) {
      this.pointerEventsEnabled(init.pointerEventsEnabled);
    }
    if (init.touchEventsEnabled !== void 0) {
      this.touchEventsEnabled(init.touchEventsEnabled);
    }
  }

  protected override onAddViewObserver(viewObserver: ViewObserverType<this>): void {
    super.onAddViewObserver(viewObserver);
    if (viewObserver.viewWillRender !== void 0) {
      this.viewObserverCache.viewWillRenderObservers = Arrays.inserted(viewObserver as ViewWillRender, this.viewObserverCache.viewWillRenderObservers);
    }
    if (viewObserver.viewDidRender !== void 0) {
      this.viewObserverCache.viewDidRenderObservers = Arrays.inserted(viewObserver as ViewDidRender, this.viewObserverCache.viewDidRenderObservers);
    }
    if (viewObserver.viewWillRasterize !== void 0) {
      this.viewObserverCache.viewWillRasterizeObservers = Arrays.inserted(viewObserver as ViewWillRasterize, this.viewObserverCache.viewWillRasterizeObservers);
    }
    if (viewObserver.viewDidRasterize !== void 0) {
      this.viewObserverCache.viewDidRasterizeObservers = Arrays.inserted(viewObserver as ViewDidRasterize, this.viewObserverCache.viewDidRasterizeObservers);
    }
    if (viewObserver.viewWillComposite !== void 0) {
      this.viewObserverCache.viewWillCompositeObservers = Arrays.inserted(viewObserver as ViewWillComposite, this.viewObserverCache.viewWillCompositeObservers);
    }
    if (viewObserver.viewDidComposite !== void 0) {
      this.viewObserverCache.viewDidCompositeObservers = Arrays.inserted(viewObserver as ViewDidComposite, this.viewObserverCache.viewDidCompositeObservers);
    }
  }

  protected override onRemoveViewObserver(viewObserver: ViewObserverType<this>): void {
    super.onRemoveViewObserver(viewObserver);
    if (viewObserver.viewWillRender !== void 0) {
      this.viewObserverCache.viewWillRenderObservers = Arrays.removed(viewObserver as ViewWillRender, this.viewObserverCache.viewWillRenderObservers);
    }
    if (viewObserver.viewDidRender !== void 0) {
      this.viewObserverCache.viewDidRenderObservers = Arrays.removed(viewObserver as ViewDidRender, this.viewObserverCache.viewDidRenderObservers);
    }
    if (viewObserver.viewWillRasterize !== void 0) {
      this.viewObserverCache.viewWillRasterizeObservers = Arrays.removed(viewObserver as ViewWillRasterize, this.viewObserverCache.viewWillRasterizeObservers);
    }
    if (viewObserver.viewDidRasterize !== void 0) {
      this.viewObserverCache.viewDidRasterizeObservers = Arrays.removed(viewObserver as ViewDidRasterize, this.viewObserverCache.viewDidRasterizeObservers);
    }
    if (viewObserver.viewWillComposite !== void 0) {
      this.viewObserverCache.viewWillCompositeObservers = Arrays.removed(viewObserver as ViewWillComposite, this.viewObserverCache.viewWillCompositeObservers);
    }
    if (viewObserver.viewDidComposite !== void 0) {
      this.viewObserverCache.viewDidCompositeObservers = Arrays.removed(viewObserver as ViewDidComposite, this.viewObserverCache.viewDidCompositeObservers);
    }
  }

  /** @hidden */
  readonly graphicsViews!: ReadonlyArray<GraphicsView>;

  override get childViewCount(): number {
    let childViewCount = 0;
    const childNodes = this.node.childNodes;
    for (let i = 0, n = childNodes.length; i < n; i += 1) {
      const childView = (childNodes[i]! as ViewNode).view;
      if (childView !== void 0) {
        childViewCount += 1;
      }
    }
    childViewCount += this.graphicsViews.length;
    return childViewCount;
  }

  override get childViews(): ReadonlyArray<View> {
    const childNodes = this.node.childNodes;
    const childViews: View[] = [];
    for (let i = 0, n = childNodes.length; i < n; i += 1) {
      const childView = (childNodes[i]! as ViewNode).view;
      if (childView !== void 0) {
        childViews.push(childView);
      }
    }
    childViews.push(...this.graphicsViews);
    return childViews;
  }

  override firstChildView(): View | null {
    const childNodes = this.node.childNodes;
    for (let i = 0, n = childNodes.length; i < n; i += 1) {
      const childView = (childNodes[i]! as ViewNode).view;
      if (childView !== void 0) {
        return childView;
      }
    }
    const graphicsViews = this.graphicsViews;
    if (graphicsViews.length !== 0) {
      return graphicsViews[0]!;
    }
    return null;
  }

  override lastChildView(): View | null {
    const graphicsViews = this.graphicsViews;
    if (graphicsViews.length !== 0) {
      return graphicsViews[graphicsViews.length - 1]!;
    }
    const childNodes = this.node.childNodes;
    for (let i = childNodes.length - 1; i >= 0; i -= 1) {
      const childView = (childNodes[i]! as ViewNode).view;
      if (childView !== void 0) {
        return childView;
      }
    }
    return null;
  }

  override nextChildView(targetView: View): View | null {
    const graphicsViews = this.graphicsViews;
    if (targetView instanceof NodeView && targetView.parentView === this) {
      let targetNode: ViewNode | null = targetView.node;
      do {
        targetNode = targetNode!.nextSibling;
        if (targetNode !== null) {
          if (targetNode.view !== void 0) {
            return targetNode.view;
          }
          continue;
        }
        break;
      } while (true);
      if (graphicsViews.length !== 0) {
        return graphicsViews[0]!;
      }
    } else if (targetView instanceof GraphicsView) {
      const targetIndex = graphicsViews.indexOf(targetView);
      if (targetIndex >= 0 && targetIndex + 1 < graphicsViews.length) {
        return graphicsViews[targetIndex + 1]!;
      }
    }
    return null;
  }

  override previousChildView(targetView: View): View | null {
    let targetNode: ViewNode | null = null;
    if (targetView instanceof GraphicsView) {
      const graphicsViews = this.graphicsViews;
      const targetIndex = graphicsViews.indexOf(targetView);
      if (targetIndex - 1 >= 0) {
        return graphicsViews[targetIndex - 1]!;
      } else if (targetIndex === 0) {
        targetNode = this.node.lastChild;
        if (targetNode !== null && targetNode.view !== void 0) {
          return targetNode.view;
        }
      }
    } else if (targetView instanceof NodeView && targetView.parentView === this) {
      targetNode = targetView.node;
    }
    if (targetNode !== null) {
      do {
        targetNode = targetNode!.previousSibling;
        if (targetNode !== null) {
          if (targetNode.view !== void 0) {
            return targetNode.view;
          }
          continue;
        }
        break;
      } while (true);
    }
    return null;
  }

  override forEachChildView<T>(callback: (childView: View) => T | void): T | undefined;
  override forEachChildView<T, S>(callback: (this: S, childView: View) => T | void,
                                  thisArg: S): T | undefined;
  override forEachChildView<T, S>(callback: (this: S | undefined, childView: View) => T | void,
                                  thisArg?: S): T | undefined {
    let result: T | undefined;
    const childNodes = this.node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childNode = childNodes[i]! as ViewNode;
      const childView = childNode.view;
      if (childView !== void 0) {
        result = callback.call(thisArg, childView) as T | undefined;
        if (result !== void 0) {
          break;
        }
      }
      if (childNodes[i] === childNode) {
        i += 1;
      }
    }
    const graphicsViews = this.graphicsViews;
    i = 0;
    while (i < graphicsViews.length) {
      const childView = graphicsViews[i]!;
      result = callback.call(thisArg, childView) as T | undefined;
      if (result !== void 0) {
        break;
      }
      if (graphicsViews[i] === childView) {
        i += 1;
      }
    }
    return result;
  }

  override setChildView(key: string, newChildView: View | null): View | null {
    if (newChildView instanceof GraphicsView) {
      return this.setGraphicsView(key, newChildView);
    } else {
      return super.setChildView(key, newChildView);
    }
  }

  setGraphicsView(key: string, newChildView: GraphicsView | null): View | null {
    let targetView: View | null = null;
    const childViews = this.graphicsViews as GraphicsView[];
    if (newChildView !== null) {
      if (newChildView.parentView === this) {
        targetView = childViews[childViews.indexOf(newChildView) + 1] || null;
      }
      newChildView.remove();
    }
    let index = -1;
    const oldChildView = this.getChildView(key);
    if (oldChildView instanceof GraphicsView) {
      index = childViews.indexOf(oldChildView);
      // assert(index >= 0);
      targetView = childViews[index + 1]!;
      this.willRemoveChildView(oldChildView);
      oldChildView.setParentView(null, this);
      this.removeChildViewMap(oldChildView);
      childViews.splice(index, 1);
      this.onRemoveChildView(oldChildView);
      this.didRemoveChildView(oldChildView);
      oldChildView.setKey(void 0);
    } else if (oldChildView instanceof NodeView) {
      const oldChildNode = oldChildView.node;
      const targetNode = oldChildNode.nextSibling;
      targetView = targetNode !== null ? (targetNode as ViewNode).view || null : null;
      this.willRemoveChildView(oldChildView);
      this.willRemoveChildNode(oldChildNode);
      oldChildView.setParentView(null, this);
      this.removeChildViewMap(oldChildView);
      this.node.removeChild(oldChildNode);
      this.onRemoveChildNode(oldChildNode);
      this.onRemoveChildView(oldChildView);
      this.didRemoveChildNode(oldChildNode);
      this.didRemoveChildView(oldChildView);
      oldChildView.setKey(void 0);
    } else if (oldChildView !== null) {
      throw new TypeError("" + oldChildView);
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
      newChildView.cascadeInsert();
    }
    return oldChildView;
  }

  override append<V extends View>(childView: V, key?: string): V;
  override append<V extends NodeView>(viewConstructor: NodeViewConstructor<V>, key?: string): V;
  override append<V extends View>(viewConstructor: ViewConstructor<V>, key?: string): V;
  override append(childNode: HTMLElement, key?: string): HtmlView;
  override append(childNode: Element, key?: string): ElementView;
  override append(childNode: Node, key?: string): NodeView;
  override append<T extends keyof HtmlViewTagMap>(tag: T, key?: string): HtmlViewTagMap[T];
  override append(tag: string, key?: string): ElementView;
  override append(child: Node | string, key?: string): NodeView;
  override append(child: View | NodeViewConstructor | Node | string, key?: string): View {
    if (child instanceof Node) {
      child = NodeView.fromNode(child);
    } else if (typeof child === "function") {
      child = NodeView.fromConstructor(child);
    } else if (typeof child === "string") {
      child = HtmlView.fromTag(child);
    }
    this.appendChildView(child, key);
    return child;
  }

  override appendChildView(childView: View, key?: string): void {
    if (childView instanceof GraphicsView) {
      this.appendGraphicsView(childView, key);
    } else {
      super.appendChildView(childView, key);
    }
  }

  appendGraphicsView(childView: GraphicsView, key?: string): void {
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    this.willInsertChildView(childView, null);
    (this.graphicsViews as GraphicsView[]).push(childView);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, null);
    this.didInsertChildView(childView, null);
    childView.cascadeInsert();
  }

  override prepend<V extends View>(childView: V, key?: string): V;
  override prepend<V extends NodeView>(viewConstructor: NodeViewConstructor<V>, key?: string): V;
  override prepend<V extends View>(viewConstructor: ViewConstructor<V>, key?: string): V;
  override prepend(childNode: HTMLElement, key?: string): HtmlView;
  override prepend(childNode: Element, key?: string): ElementView;
  override prepend(childNode: Node, key?: string): NodeView;
  override prepend<T extends keyof HtmlViewTagMap>(tag: T, key?: string): HtmlViewTagMap[T];
  override prepend(tag: string, key?: string): ElementView;
  override prepend(child: Node | string, key?: string): NodeView;
  override prepend(child: View | NodeViewConstructor | Node | string, key?: string): View {
    if (child instanceof Node) {
      child = NodeView.fromNode(child);
    } else if (typeof child === "function") {
      child = NodeView.fromConstructor(child);
    } else if (typeof child === "string") {
      child = HtmlView.fromTag(child);
    }
    this.prependChildView(child, key);
    return child;
  }

  override prependChildView(childView: View, key?: string): void {
    if (childView instanceof GraphicsView) {
      this.prependGraphicsView(childView);
    } else {
      super.prependChildView(childView);
    }
  }

  prependGraphicsView(childView: GraphicsView, key?: string): void {
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    const graphicsViews = this.graphicsViews as GraphicsView[];
    const targetView = graphicsViews.length !== 0 ? graphicsViews[0]! : null;
    this.willInsertChildView(childView, targetView);
    graphicsViews.unshift(childView);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, targetView);
    this.didInsertChildView(childView, targetView);
    childView.cascadeInsert();
  }

  override insert<V extends View>(childView: V, target: View | Node | null, key?: string): V;
  override insert<V extends NodeView>(viewConstructor: NodeViewConstructor<V>, target: View | Node | null, key?: string): V;
  override insert<V extends View>(viewConstructor: ViewConstructor<V>, target: View | Node | null, key?: string): V;
  override insert(childNode: HTMLElement, target: View | Node | null, key?: string): HtmlView;
  override insert(childNode: Element, target: View | Node | null, key?: string): ElementView;
  override insert(childNode: Node, target: View | Node | null, key?: string): NodeView;
  override insert<T extends keyof HtmlViewTagMap>(tag: T, target: View | Node | null, key?: string): HtmlViewTagMap[T];
  override insert(tag: string, target: View | Node | null, key?: string): ElementView;
  override insert(child: Node | string, target: View | Node | null, key?: string): NodeView;
  override insert(child: View | NodeViewConstructor | Node | string, target: View | Node | null, key?: string): View {
    if (child instanceof Node) {
      child = NodeView.fromNode(child);
    } else if (typeof child === "function") {
      child = NodeView.fromConstructor(child);
    } else if (typeof child === "string") {
      child = HtmlView.fromTag(child);
    }
    this.insertChild(child, target, key);
    return child;
  }

  override insertChildView(childView: View, targetView: View | null, key?: string): void {
    if (childView instanceof GraphicsView) {
      this.insertGraphicsView(childView, targetView, key);
    } else {
      super.insertChildView(childView, targetView, key);
    }
  }

  insertGraphicsView(childView: GraphicsView, targetView: View | null, key?: string): void {
    if (targetView !== null && !(targetView instanceof GraphicsView)) {
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
    const graphicsViews = this.graphicsViews as GraphicsView[];
    const index = targetView !== null ? graphicsViews.indexOf(targetView) : -1;
    if (index >= 0) {
      graphicsViews.splice(index, 0, childView);
    } else {
      graphicsViews.push(childView);
    }
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, targetView);
    this.didInsertChildView(childView, targetView);
    childView.cascadeInsert();
  }

  override removeChildView(key: string): View | null;
  override removeChildView(childView: View): void;
  override removeChildView(key: string | View): View | null | void {
    let childView: View | null;
    if (typeof key === "string") {
      childView = this.getChildView(key);
      if (childView === null) {
        return null;
      }
    } else {
      childView = key;
    }
    if (childView instanceof GraphicsView) {
      this.removeGraphicsView(childView);
    } else {
      super.removeChildView(childView);
    }
    if (typeof key === "string") {
      return childView;
    }
  }

  removeGraphicsView(childView: GraphicsView): void {
    if (childView.parentView !== this) {
      throw new Error("not a child view");
    }
    this.willRemoveChildView(childView);
    childView.setParentView(null, this);
    this.removeChildViewMap(childView);
    const graphicsViews = this.graphicsViews as GraphicsView[];
    const index = graphicsViews.indexOf(childView);
    if (index >= 0) {
      graphicsViews.splice(index, 1);
    }
    this.onRemoveChildView(childView);
    this.didRemoveChildView(childView);
    childView.setKey(void 0);
  }

  override removeAll(): void {
    super.removeAll();
    const graphicsViews = this.graphicsViews as GraphicsView[];
    do {
      const count = graphicsViews.length;
      if (count > 0) {
        const childView = graphicsViews[count - 1]!;
        this.willRemoveChildView(childView);
        childView.setParentView(null, this);
        this.removeChildViewMap(childView);
        graphicsViews.pop();
        this.onRemoveChildView(childView);
        this.didRemoveChildView(childView);
        childView.setKey(void 0);
        continue;
      }
      break;
    } while (true);
  }

  get pixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  readonly renderer!: GraphicsRenderer | null;

  setRenderer(renderer: AnyGraphicsRenderer | null): void {
    if (typeof renderer === "string") {
      renderer = this.createRenderer(renderer as GraphicsRendererType);
    }
    Object.defineProperty(this, "renderer", {
      value: renderer,
      enumerable: true,
      configurable: true,
    });
    this.resetRenderer();
  }

  protected createRenderer(rendererType: GraphicsRendererType = "canvas"): GraphicsRenderer | null {
    if (rendererType === "canvas") {
      const context = this.node.getContext("2d");
      if (context !== null) {
        return new CanvasRenderer(context, this.pixelRatio, this.theme.state, this.mood.state);
      } else {
        throw new Error("Failed to create canvas rendering context");
      }
    } else if (rendererType === "webgl") {
      const context = this.node.getContext("webgl");
      if (context !== null) {
        return new WebGLRenderer(context, this.pixelRatio);
      } else {
        throw new Error("Failed to create webgl rendering context");
      }
    } else {
      throw new Error("Failed to create " + rendererType + " renderer");
    }
  }

  /** @hidden */
  readonly canvasFlags!: number;

  /** @hidden */
  setCanvasFlags(canvasFlags: number): void {
    Object.defineProperty(this, "canvasFlags", {
      value: canvasFlags,
      enumerable: true,
      configurable: true,
    });
  }

  protected override onMount(): void {
    super.onMount();
    this.attachEvents(this.eventNode);
  }

  /** @hidden */
  override mountChildViews(): void {
    const childNodes = this.node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = (childNodes[i]! as ViewNode).view;
      if (childView !== void 0) {
        childView.cascadeMount();
        if ((childView.viewFlags & View.RemovingFlag) !== 0) {
          childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
          this.removeChildView(childView);
          continue;
        }
      }
      i += 1;
    }
    const graphicsViews = this.graphicsViews;
    i = 0;
    while (i < graphicsViews.length) {
      const childView = graphicsViews[i]!;
      childView.cascadeMount();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
        continue;
      }
      i += 1;
    }
  }

  protected override onUnmount(): void {
    this.detachEvents(this.eventNode);
    super.onUnmount();
  }

  /** @hidden */
  override unmountChildViews(): void {
    const childNodes = this.node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = (childNodes[i]! as ViewNode).view;
      if (childView !== void 0) {
        childView.cascadeUnmount();
        if ((childView.viewFlags & View.RemovingFlag) !== 0) {
          childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
          this.removeChildView(childView);
          continue;
        }
      }
      i += 1;
    }
    const graphicsViews = this.graphicsViews;
    i = 0;
    while (i < graphicsViews.length) {
      const childView = graphicsViews[i]!;
      childView.cascadeUnmount();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
        continue;
      }
      i += 1;
    }
  }

  /** @hidden */
  override powerChildViews(): void {
    const childNodes = this.node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = (childNodes[i]! as ViewNode).view;
      if (childView !== void 0) {
        childView.cascadePower();
        if ((childView.viewFlags & View.RemovingFlag) !== 0) {
          childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
          this.removeChildView(childView);
          continue;
        }
      }
      i += 1;
    }
    const graphicsViews = this.graphicsViews;
    i = 0;
    while (i < graphicsViews.length) {
      const childView = graphicsViews[i]!;
      childView.cascadePower();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
        continue;
      }
      i += 1;
    }
  }

  /** @hidden */
  override unpowerChildViews(): void {
    const childNodes = this.node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = (childNodes[i]! as ViewNode).view;
      if (childView !== void 0) {
        childView.cascadeUnpower();
        if ((childView.viewFlags & View.RemovingFlag) !== 0) {
          childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
          this.removeChildView(childView);
          continue;
        }
      }
      i += 1;
    }
    const graphicsViews = this.graphicsViews;
    i = 0;
    while (i < graphicsViews.length) {
      const childView = graphicsViews[i]!;
      childView.cascadeUnpower();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
        continue;
      }
      i += 1;
    }
  }

  override cascadeInsert(updateFlags?: ViewFlags, viewContext?: ViewContext): void {
    if ((this.viewFlags & (View.MountedFlag | View.PoweredFlag)) === (View.MountedFlag | View.PoweredFlag)) {
      if (updateFlags === void 0) {
        updateFlags = 0;
      }
      updateFlags |= this.viewFlags & View.UpdateMask;
      if ((updateFlags & View.ProcessMask) !== 0) {
        if (viewContext === void 0) {
          viewContext = this.superViewContext;
        }
        this.cascadeProcess(updateFlags, viewContext);
      }
    }
  }

  protected override needsUpdate(targetView: View, updateFlags: ViewFlags, immediate: boolean): ViewFlags {
    updateFlags = super.needsUpdate(targetView, updateFlags, immediate);
    updateFlags |= View.NeedsRender | View.NeedsComposite;
    this.setViewFlags(this.viewFlags | (View.NeedsRender | View.NeedsComposite));
    return updateFlags;
  }

  protected override needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((processFlags & View.ProcessMask) !== 0) {
      this.requireUpdate(View.NeedsRender | View.NeedsComposite);
    }
    return processFlags;
  }

  protected override onResize(viewContext: ViewContextType<this>): void {
    super.onResize(viewContext);
    this.resizeCanvas(this.node);
    this.resetRenderer();
    this.requireUpdate(View.NeedsLayout | View.NeedsRender | View.NeedsComposite);
  }

  protected override onScroll(viewContext: ViewContextType<this>): void {
    super.onScroll(viewContext);
    this.setCulled(!this.intersectsViewport());
  }

  protected override processChildViews(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                                       processChildView: (this: this, childView: View, processFlags: ViewFlags,
                                                          viewContext: ViewContextType<this>) => void): void {
    const childNodes = this.node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = (childNodes[i]! as ViewNode).view;
      if (childView !== void 0) {
        processChildView.call(this, childView, processFlags, viewContext);
        if ((childView.viewFlags & View.RemovingFlag) !== 0) {
          childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
          this.removeChildView(childView);
          continue;
        }
      }
      i += 1;
    }
    const graphicsViews = this.graphicsViews;
    i = 0;
    while (i < graphicsViews.length) {
      const childView = graphicsViews[i]!;
      processChildView.call(this, childView, processFlags, viewContext);
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
        continue;
      }
      i += 1;
    }
  }

  protected override needsDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    displayFlags |= View.NeedsRender | View.NeedsComposite;
    return displayFlags;
  }

  override cascadeDisplay(displayFlags: ViewFlags, baseViewContext: ViewContext): void {
    const viewContext = this.extendViewContext(baseViewContext);
    displayFlags &= ~View.NeedsDisplay;
    displayFlags |= this.viewFlags & View.UpdateMask;
    displayFlags = this.needsDisplay(displayFlags, viewContext);
    if ((displayFlags & View.DisplayMask) !== 0) {
      let cascadeFlags = displayFlags;
      this.setViewFlags(this.viewFlags & ~View.NeedsDisplay | (View.TraversingFlag | View.DisplayingFlag));
      try {
        this.willDisplay(cascadeFlags, viewContext);
        if (((this.viewFlags | displayFlags) & View.NeedsLayout) !== 0) {
          cascadeFlags |= View.NeedsLayout;
          this.setViewFlags(this.viewFlags & ~View.NeedsLayout);
          this.willLayout(viewContext);
        }
        if (((this.viewFlags | displayFlags) & View.NeedsRender) !== 0) {
          cascadeFlags |= View.NeedsRender;
          this.setViewFlags(this.viewFlags & ~View.NeedsRender);
          this.willRender(viewContext);
        }
        if (((this.viewFlags | displayFlags) & View.NeedsRasterize) !== 0) {
          cascadeFlags |= View.NeedsRasterize;
          this.setViewFlags(this.viewFlags & ~View.NeedsRasterize);
          this.willRasterize(viewContext);
        }
        if (((this.viewFlags | displayFlags) & View.NeedsComposite) !== 0) {
          cascadeFlags |= View.NeedsComposite;
          this.setViewFlags(this.viewFlags & ~View.NeedsComposite);
          this.willComposite(viewContext);
        }

        this.onDisplay(cascadeFlags, viewContext);
        if ((cascadeFlags & View.NeedsLayout) !== 0) {
          this.onLayout(viewContext);
        }
        if ((cascadeFlags & View.NeedsRender) !== 0) {
          this.onRender(viewContext);
        }
        if ((cascadeFlags & View.NeedsRasterize) !== 0) {
          this.onRasterize(viewContext);
        }
        if ((cascadeFlags & View.NeedsComposite) !== 0) {
          this.onComposite(viewContext);
        }

        if ((cascadeFlags & View.DisplayMask) !== 0 && !this.isHidden() && !this.isCulled()) {
          this.displayChildViews(cascadeFlags, viewContext, this.displayChildView);
        }

        if ((cascadeFlags & View.NeedsComposite) !== 0) {
          this.didComposite(viewContext);
        }
        if ((cascadeFlags & View.NeedsRasterize) !== 0) {
          this.didRasterize(viewContext);
        }
        if ((cascadeFlags & View.NeedsRender) !== 0) {
          this.didRender(viewContext);
        }
        if ((cascadeFlags & View.NeedsLayout) !== 0) {
          this.didLayout(viewContext);
        }
        this.didDisplay(cascadeFlags, viewContext);
      } finally {
        this.setViewFlags(this.viewFlags & ~(View.TraversingFlag | View.DisplayingFlag));
      }
    }
  }

  protected override didDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    this.detectHitTargets();
    super.didDisplay(displayFlags, viewContext);
  }

  protected willRender(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewWillRenderObservers;
    if (viewObservers !== void 0) {
      for (let i = 0; i < viewObservers.length; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewWillRender(viewContext, this);
      }
    }
  }

  protected onRender(viewContext: ViewContextType<this>): void {
    this.clearCanvas();
  }

  protected didRender(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewDidRenderObservers;
    if (viewObservers !== void 0) {
      for (let i = 0; i < viewObservers.length; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewDidRender(viewContext, this);
      }
    }
  }

  protected willRasterize(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewWillRasterizeObservers;
    if (viewObservers !== void 0) {
      for (let i = 0; i < viewObservers.length; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewWillRasterize(viewContext, this);
      }
    }
  }

  protected onRasterize(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didRasterize(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewDidRasterizeObservers;
    if (viewObservers !== void 0) {
      for (let i = 0; i < viewObservers.length; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewDidRasterize(viewContext, this);
      }
    }
  }

  protected willComposite(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewWillCompositeObservers;
    if (viewObservers !== void 0) {
      for (let i = 0; i < viewObservers.length; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewWillComposite(viewContext, this);
      }
    }
  }

  protected onComposite(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didComposite(viewContext: ViewContextType<this>): void {
    const viewObservers = this.viewObserverCache.viewDidCompositeObservers;
    if (viewObservers !== void 0) {
      for (let i = 0; i < viewObservers.length; i += 1) {
        const viewObserver = viewObservers[i]!;
        viewObserver.viewDidComposite(viewContext, this);
      }
    }
  }

  protected override displayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                       displayChildView: (this: this, childView: View, displayFlags: ViewFlags,
                                                          viewContext: ViewContextType<this>) => void): void {
    const childNodes = this.node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = (childNodes[i]! as ViewNode).view;
      if (childView !== void 0) {
        displayChildView.call(this, childView, displayFlags, viewContext);
        if ((childView.viewFlags & View.RemovingFlag) !== 0) {
          childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
          this.removeChildView(childView);
          continue;
        }
      }
      i += 1;
    }
    const graphicsViews = this.graphicsViews;
    i = 0;
    while (i < graphicsViews.length) {
      const childView = graphicsViews[i]!;
      displayChildView.call(this, childView, displayFlags, viewContext);
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
        continue;
      }
      i += 1;
    }
  }

  isHidden(): boolean {
    return (this.viewFlags & View.HiddenFlag) !== 0
  }

  setHidden(newHidden: boolean): void {
    const oldHidden = (this.viewFlags & View.HiddenFlag) !== 0;
    if (oldHidden !== newHidden) {
      this.willSetHidden(newHidden);
      if (newHidden) {
        this.setViewFlags(this.viewFlags | View.HiddenFlag);
      } else {
        this.setViewFlags(this.viewFlags & ~View.HiddenFlag);
      }
      this.onSetHidden(newHidden);
      this.didSetHidden(newHidden);
    }
  }

  protected willSetHidden(hidden: boolean): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length ; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetHidden !== void 0) {
        viewObserver.viewWillSetHidden(hidden, this);
      }
    }
  }

  protected onSetHidden(hidden: boolean): void {
    if (!hidden) {
      this.requireUpdate(View.NeedsRender | View.NeedsComposite);
    }
  }

  protected didSetHidden(hidden: boolean): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetHidden !== void 0) {
        viewObserver.viewDidSetHidden(hidden, this);
      }
    }
  }

  override extendViewContext(viewContext: ViewContext): ViewContextType<this> {
    const canvasViewContext = Object.create(viewContext);
    canvasViewContext.renderer = this.renderer;
    return canvasViewContext;
  }

  override readonly viewContext!: GraphicsViewContext;

  /** @hidden */
  readonly viewFrame!: R2Box;

  setViewFrame(viewFrame: R2Box | null): void {
    // nop
  }

  get viewBounds(): R2Box {
    return this.viewFrame;
  }

  get hitBounds(): R2Box {
    return this.viewFrame;
  }

  cascadeHitTest(x: number, y: number, baseViewContext?: ViewContext): GraphicsView | null {
    if (!this.isHidden() && !this.isCulled()) {
      const hitBounds = this.hitBounds;
      if (hitBounds.contains(x, y)) {
        if (baseViewContext === void 0) {
          baseViewContext = this.superViewContext;
        }
        const viewContext = this.extendViewContext(baseViewContext);
        let hit = this.hitTestChildViews(x, y, viewContext);
        if (hit === null) {
          hit = this.hitTest(x, y, viewContext);
        }
        return hit;
      }
    }
    return null;
  }

  protected hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    return null;
  }

  protected hitTestChildViews(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const graphicsViews = this.graphicsViews;
    for (let i = graphicsViews.length - 1; i >= 0; i -= 1) {
      const childView = graphicsViews[i]!;
      const hit = this.hitTestChildView(childView, x, y, viewContext);
      if (hit !== null) {
        return hit;
      }
    }
    return null;
  }

  protected hitTestChildView(childView: GraphicsView, x: number, y: number,
                             viewContext: ViewContextType<this>): GraphicsView | null {
    return childView.cascadeHitTest(x, y, viewContext);
  }

  /** @hidden */
  protected detectHitTargets(clientBounds?: R2Box): void {
    if ((this.canvasFlags & CanvasView.MouseEventsFlag) !== 0) {
      const mouse = this.mouse;
      if (mouse !== null) {
        if (clientBounds === void 0) {
          clientBounds = this.clientBounds;
        }
        this.detectMouseTarget(mouse, this.clientBounds);
      }
    }
    if ((this.canvasFlags & CanvasView.PointerEventsFlag) !== 0) {
      const pointers = this.pointers;
      for (const id in pointers) {
        const pointer = pointers[id]!;
        if (clientBounds === void 0) {
          clientBounds = this.clientBounds;
        }
        this.detectPointerTarget(pointer, clientBounds);
      }
    }
  }

  readonly eventNode!: HTMLElement;

  setEventNode(newEventNode: HTMLElement | null): void {
    if (newEventNode === null) {
      newEventNode = this.node;
    }
    const oldEventNode = this.eventNode;
    if (oldEventNode !== newEventNode) {
      this.detachEvents(oldEventNode);
      Object.defineProperty(this, "eventNode", {
        value: newEventNode,
        enumerable: true,
        configurable: true,
      });
      this.attachEvents(newEventNode);
    }
  }

  clickEventsEnabled(): boolean;
  clickEventsEnabled(clickEvents: boolean): this;
  clickEventsEnabled(newClickEvents?: boolean): boolean | this {
    const oldClickEvents = (this.canvasFlags & CanvasView.ClickEventsFlag) !== 0;
    if (newClickEvents === void 0) {
      return oldClickEvents;
    } else {
      if (newClickEvents && !oldClickEvents) {
        this.setCanvasFlags(this.canvasFlags | CanvasView.ClickEventsFlag);
        this.attachClickEvents(this.eventNode);
      } else if (!newClickEvents && oldClickEvents) {
        this.setCanvasFlags(this.canvasFlags & ~CanvasView.ClickEventsFlag);
        this.detachClickEvents(this.eventNode);
      }
      return this;
    }
  }

  wheelEventsEnabled(): boolean;
  wheelEventsEnabled(wheelEvents: boolean): this;
  wheelEventsEnabled(newWheelEvents?: boolean): boolean | this {
    const oldWheelEvents = (this.canvasFlags & CanvasView.WheelEventsFlag) !== 0;
    if (newWheelEvents === void 0) {
      return oldWheelEvents;
    } else {
      if (newWheelEvents && !oldWheelEvents) {
        this.setCanvasFlags(this.canvasFlags | CanvasView.WheelEventsFlag);
        this.attachWheelEvents(this.eventNode);
      } else if (!newWheelEvents && oldWheelEvents) {
        this.setCanvasFlags(this.canvasFlags & ~CanvasView.WheelEventsFlag);
        this.detachWheelEvents(this.eventNode);
      }
      return this;
    }
  }

  mouseEventsEnabled(): boolean;
  mouseEventsEnabled(mouseEvents: boolean): this;
  mouseEventsEnabled(newMouseEvents?: boolean): boolean | this {
    const oldMouseEvents = (this.canvasFlags & CanvasView.MouseEventsFlag) !== 0;
    if (newMouseEvents === void 0) {
      return oldMouseEvents;
    } else {
      if (newMouseEvents && !oldMouseEvents) {
        this.setCanvasFlags(this.canvasFlags | CanvasView.MouseEventsFlag);
        this.attachPassiveMouseEvents(this.eventNode);
      } else if (!newMouseEvents && oldMouseEvents) {
        this.setCanvasFlags(this.canvasFlags & ~CanvasView.MouseEventsFlag);
        this.detachPassiveMouseEvents(this.eventNode);
      }
      return this;
    }
  }

  pointerEventsEnabled(): boolean;
  pointerEventsEnabled(pointerEvents: boolean): this;
  pointerEventsEnabled(newPointerEvents?: boolean): boolean | this {
    const oldPointerEvents = (this.canvasFlags & CanvasView.PointerEventsFlag) !== 0;
    if (newPointerEvents === void 0) {
      return oldPointerEvents;
    } else {
      if (newPointerEvents && !oldPointerEvents) {
        this.setCanvasFlags(this.canvasFlags | CanvasView.PointerEventsFlag);
        this.attachPassivePointerEvents(this.eventNode);
      } else if (!newPointerEvents && oldPointerEvents) {
        this.setCanvasFlags(this.canvasFlags & ~CanvasView.PointerEventsFlag);
        this.detachPassivePointerEvents(this.eventNode);
      }
      return this;
    }
  }

  touchEventsEnabled(): boolean;
  touchEventsEnabled(touchEvents: boolean): this;
  touchEventsEnabled(newTouchEvents?: boolean): boolean | this {
    const oldTouchEvents = (this.canvasFlags & CanvasView.TouchEventsFlag) !== 0;
    if (newTouchEvents === void 0) {
      return oldTouchEvents;
    } else {
      if (newTouchEvents && !oldTouchEvents) {
        this.setCanvasFlags(this.canvasFlags | CanvasView.TouchEventsFlag);
        this.attachPassiveTouchEvents(this.eventNode);
      } else if (!newTouchEvents && oldTouchEvents) {
        this.setCanvasFlags(this.canvasFlags & ~CanvasView.TouchEventsFlag);
        this.detachPassiveTouchEvents(this.eventNode);
      }
      return this;
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
  protected attachEvents(eventNode: HTMLElement): void {
    if ((this.canvasFlags & CanvasView.ClickEventsFlag) !== 0) {
      this.attachClickEvents(eventNode);
    }
    if ((this.canvasFlags & CanvasView.WheelEventsFlag) !== 0) {
      this.attachWheelEvents(eventNode);
    }
    if ((this.canvasFlags & CanvasView.MouseEventsFlag) !== 0) {
      this.attachPassiveMouseEvents(eventNode);
    }
    if ((this.canvasFlags & CanvasView.PointerEventsFlag) !== 0) {
      this.attachPassivePointerEvents(eventNode);
    }
    if ((this.canvasFlags & CanvasView.TouchEventsFlag) !== 0) {
      this.attachPassiveTouchEvents(eventNode);
    }
  }

  /** @hidden */
  protected detachEvents(eventNode: HTMLElement): void {
    this.detachClickEvents(eventNode);

    this.detachWheelEvents(eventNode);

    this.detachPassiveMouseEvents(eventNode);
    this.detachActiveMouseEvents(eventNode);

    this.detachPassivePointerEvents(eventNode);
    this.detachActivePointerEvents(eventNode);

    this.detachPassiveTouchEvents(eventNode);
    this.detachActiveTouchEvents(eventNode);
  }

  /** @hidden */
  fireEvent(event: ViewEvent, clientX: number, clientY: number): GraphicsView | null {
    const clientBounds = this.clientBounds;
    if (clientBounds.contains(clientX, clientY)) {
      const x = clientX - clientBounds.x;
      const y = clientY - clientBounds.y;
      const hit = this.cascadeHitTest(x, y);
      if (hit !== null) {
        event.targetView = hit;
        hit.bubbleEvent(event);
        return hit;
      }
    }
    return null;
  }

  /** @hidden */
  protected attachClickEvents(eventNode: HTMLElement): void {
    eventNode.addEventListener("click", this.onClick);
    eventNode.addEventListener("dblclick", this.onDblClick);
    eventNode.addEventListener("contextmenu", this.onContextMenu);
  }

  /** @hidden */
  protected detachClickEvents(eventNode: HTMLElement): void {
    eventNode.removeEventListener("click", this.onClick);
    eventNode.removeEventListener("dblclick", this.onDblClick);
    eventNode.removeEventListener("contextmenu", this.onContextMenu);
  }

  /** @hidden */
  protected attachWheelEvents(eventNode: HTMLElement): void {
    eventNode.addEventListener("wheel", this.onWheel);
  }

  /** @hidden */
  protected detachWheelEvents(eventNode: HTMLElement): void {
    eventNode.removeEventListener("wheel", this.onWheel);
  }

  /** @hidden */
  protected attachPassiveMouseEvents(eventNode: HTMLElement): void {
    eventNode.addEventListener("mouseenter", this.onMouseEnter);
    eventNode.addEventListener("mouseleave", this.onMouseLeave);
    eventNode.addEventListener("mousedown", this.onMouseDown);
  }

  /** @hidden */
  protected detachPassiveMouseEvents(eventNode: HTMLElement): void {
    eventNode.removeEventListener("mouseenter", this.onMouseEnter);
    eventNode.removeEventListener("mouseleave", this.onMouseLeave);
    eventNode.removeEventListener("mousedown", this.onMouseDown);
  }

  /** @hidden */
  protected attachActiveMouseEvents(eventNode: HTMLElement): void {
    document.body.addEventListener("mousemove", this.onMouseMove);
    document.body.addEventListener("mouseup", this.onMouseUp);
  }

  /** @hidden */
  protected detachActiveMouseEvents(eventNode: HTMLElement): void {
    document.body.removeEventListener("mousemove", this.onMouseMove);
    document.body.removeEventListener("mouseup", this.onMouseUp);
  }

  /** @hidden */
  readonly mouse!: CanvasViewMouse | null;

  /** @hidden */
  protected updateMouse(mouse: CanvasViewMouse, event: MouseEvent): void {
    mouse.button = event.button;
    mouse.buttons = event.buttons;
    mouse.altKey = event.altKey;
    mouse.ctrlKey = event.ctrlKey;
    mouse.metaKey = event.metaKey;
    mouse.shiftKey = event.shiftKey;

    mouse.clientX = event.clientX;
    mouse.clientY = event.clientY;
    mouse.screenX = event.screenX;
    mouse.screenY = event.screenY;
    mouse.movementX = event.movementX;
    mouse.movementY = event.movementY;

    mouse.view = event.view;
    mouse.detail = event.detail;
    mouse.relatedTarget = event.relatedTarget;
  }

  /** @hidden */
  protected fireMouseEvent(event: MouseEvent): GraphicsView | null {
    return this.fireEvent(event, event.clientX, event.clientY);
  }

  /** @hidden */
  protected onClick(event: MouseEvent): void {
    const mouse = this.mouse;
    if (mouse !== null) {
      this.updateMouse(mouse, event);
    }
    this.fireMouseEvent(event);
  }

  /** @hidden */
  protected onDblClick(event: MouseEvent): void {
    const mouse = this.mouse;
    if (mouse !== null) {
      this.updateMouse(mouse, event);
    }
    this.fireMouseEvent(event);
  }

  /** @hidden */
  protected onContextMenu(event: MouseEvent): void {
    const mouse = this.mouse;
    if (mouse !== null) {
      this.updateMouse(mouse, event);
    }
    this.fireMouseEvent(event);
  }

  /** @hidden */
  protected onWheel(event: WheelEvent): void {
    const mouse = this.mouse;
    if (mouse !== null) {
      this.updateMouse(mouse, event);
    }
    this.fireMouseEvent(event);
  }

  /** @hidden */
  protected onMouseEnter(event: MouseEvent): void {
    let mouse = this.mouse;
    if (mouse === null) {
      this.attachActiveMouseEvents(this.eventNode);
      mouse = {};
      Object.defineProperty(this, "mouse", {
        value: mouse,
        enumerable: true,
        configurable: true,
      });
    }
    this.updateMouse(mouse, event);
  }

  /** @hidden */
  protected onMouseLeave(event: MouseEvent): void {
    const mouse = this.mouse;
    if (mouse !== null) {
      Object.defineProperty(this, "mouse", {
        value: null,
        enumerable: true,
        configurable: true,
      });
      this.detachActiveMouseEvents(this.eventNode);
    }
  }

  /** @hidden */
  protected onMouseDown(event: MouseEvent): void {
    let mouse = this.mouse;
    if (mouse === null) {
      this.attachActiveMouseEvents(this.eventNode);
      mouse = {};
      Object.defineProperty(this, "mouse", {
        value: mouse,
        enumerable: true,
        configurable: true,
      });
    }
    this.updateMouse(mouse, event);
    this.fireMouseEvent(event);
  }

  /** @hidden */
  protected onMouseMove(event: MouseEvent): void {
    let mouse = this.mouse;
    if (mouse === null) {
      mouse = {};
      Object.defineProperty(this, "mouse", {
        value: mouse,
        enumerable: true,
        configurable: true,
      });
    }
    this.updateMouse(mouse, event);
    const oldTargetView = mouse.targetView as GraphicsView | undefined;
    let newTargetView: GraphicsView | null | undefined = this.fireMouseEvent(event);
    if (newTargetView === null) {
      newTargetView = void 0;
    }
    if (newTargetView !== oldTargetView) {
      this.onMouseTargetChange(mouse, newTargetView, oldTargetView);
    }
  }

  /** @hidden */
  protected onMouseUp(event: MouseEvent): void {
    const mouse = this.mouse;
    if (mouse !== null) {
      this.updateMouse(mouse, event);
    }
    this.fireMouseEvent(event);
  }

  /** @hidden */
  protected onMouseTargetChange(mouse: CanvasViewMouse, newTargetView: GraphicsView | undefined,
                                oldTargetView: GraphicsView | undefined): void {
    mouse.bubbles = true;
    if (oldTargetView !== void 0) {
      const outEvent = new MouseEvent("mouseout", mouse) as ViewMouseEvent;
      outEvent.targetView = oldTargetView;
      outEvent.relatedTargetView = newTargetView;
      oldTargetView.bubbleEvent(outEvent);
    }
    mouse.targetView = newTargetView;
    if (newTargetView !== void 0) {
      const overEvent = new MouseEvent("mouseover", mouse) as ViewMouseEvent;
      overEvent.targetView = newTargetView;
      overEvent.relatedTargetView = oldTargetView;
      newTargetView.bubbleEvent(overEvent);
    }
  }

  /** @hidden */
  protected detectMouseTarget(mouse: CanvasViewMouse, clientBounds: R2Box): void {
    const clientX = mouse.clientX!;
    const clientY = mouse.clientY!;
    if (clientBounds.contains(clientX, clientY)) {
      const x = clientX - clientBounds.x;
      const y = clientY - clientBounds.y;
      const oldTargetView = mouse.targetView as GraphicsView | undefined;
      let newTargetView: GraphicsView | null | undefined = this.cascadeHitTest(x, y);
      if (newTargetView === null) {
        newTargetView = void 0;
      }
      if (newTargetView !== oldTargetView) {
        this.onMouseTargetChange(mouse, newTargetView, oldTargetView);
      }
    }
  }

  /** @hidden */
  protected attachPassivePointerEvents(eventNode: HTMLElement): void {
    eventNode.addEventListener("pointerenter", this.onPointerEnter);
    eventNode.addEventListener("pointerleave", this.onPointerLeave);
    eventNode.addEventListener("pointerdown", this.onPointerDown);
  }

  /** @hidden */
  protected detachPassivePointerEvents(eventNode: HTMLElement): void {
    eventNode.removeEventListener("pointerenter", this.onPointerEnter);
    eventNode.removeEventListener("pointerleave", this.onPointerLeave);
    eventNode.removeEventListener("pointerdown", this.onPointerDown);
  }

  /** @hidden */
  protected attachActivePointerEvents(eventNode: HTMLElement): void {
    document.body.addEventListener("pointermove", this.onPointerMove);
    document.body.addEventListener("pointerup", this.onPointerUp);
    document.body.addEventListener("pointercancel", this.onPointerCancel);
  }

  /** @hidden */
  protected detachActivePointerEvents(eventNode: HTMLElement): void {
    document.body.removeEventListener("pointermove", this.onPointerMove);
    document.body.removeEventListener("pointerup", this.onPointerUp);
    document.body.removeEventListener("pointercancel", this.onPointerCancel);
  }

  /** @hidden */
  readonly pointers!: {[id: string]: CanvasViewPointer | undefined} | null;

  /** @hidden */
  protected updatePointer(pointer: CanvasViewPointer, event: PointerEvent): void {
    pointer.pointerId = event.pointerId;
    pointer.pointerType = event.pointerType;
    pointer.isPrimary = event.isPrimary;

    pointer.button = event.button;
    pointer.buttons = event.buttons;
    pointer.altKey = event.altKey;
    pointer.ctrlKey = event.ctrlKey;
    pointer.metaKey = event.metaKey;
    pointer.shiftKey = event.shiftKey;

    pointer.clientX = event.clientX;
    pointer.clientY = event.clientY;
    pointer.screenX = event.screenX;
    pointer.screenY = event.screenY;
    pointer.movementX = event.movementX;
    pointer.movementY = event.movementY;

    pointer.width = event.width;
    pointer.height = event.height;
    pointer.tiltX = event.tiltX;
    pointer.tiltY = event.tiltY;
    pointer.twist = event.twist;
    pointer.pressure = event.pressure;
    pointer.tangentialPressure = event.tangentialPressure;

    pointer.view = event.view;
    pointer.detail = event.detail;
    pointer.relatedTarget = event.relatedTarget;
  }

  /** @hidden */
  protected firePointerEvent(event: PointerEvent): GraphicsView | null {
    return this.fireEvent(event, event.clientX, event.clientY);
  }

  /** @hidden */
  protected onPointerEnter(event: PointerEvent): void {
    const id = "" + event.pointerId;
    let pointers = this.pointers;
    if (pointers === null) {
      pointers = {};
      Object.defineProperty(this, "pointers", {
        value: pointers,
        enumerable: true,
        configurable: true,
      });
    }
    let pointer = pointers[id];
    if (pointer === void 0) {
      if (Object.keys(pointers).length === 0) {
        this.attachActivePointerEvents(this.eventNode);
      }
      pointer = {};
      pointers[id] = pointer;
    }
    this.updatePointer(pointer, event);
  }

  /** @hidden */
  protected onPointerLeave(event: PointerEvent): void {
    const id = "" + event.pointerId;
    let pointers = this.pointers;
    if (pointers === null) {
      pointers = {};
      Object.defineProperty(this, "pointers", {
        value: pointers,
        enumerable: true,
        configurable: true,
      });
    }
    const pointer = pointers[id];
    if (pointer !== void 0) {
      if (pointer.targetView !== void 0) {
        this.onPointerTargetChange(pointer, void 0, pointer.targetView as GraphicsView);
      }
      delete pointers[id];
      if (Object.keys(pointers).length === 0) {
        this.detachActivePointerEvents(this.eventNode);
      }
    }
  }

  /** @hidden */
  protected onPointerDown(event: PointerEvent): void {
    const id = "" + event.pointerId;
    let pointers = this.pointers;
    if (pointers === null) {
      pointers = {};
      Object.defineProperty(this, "pointers", {
        value: pointers,
        enumerable: true,
        configurable: true,
      });
    }
    let pointer = pointers[id];
    if (pointer === void 0) {
      if (Object.keys(pointers).length === 0) {
        this.attachActivePointerEvents(this.eventNode);
      }
      pointer = {};
      pointers[id] = pointer;
    }
    this.updatePointer(pointer, event);
    this.firePointerEvent(event);
  }

  /** @hidden */
  protected onPointerMove(event: PointerEvent): void {
    const id = "" + event.pointerId;
    let pointers = this.pointers;
    if (pointers === null) {
      pointers = {};
      Object.defineProperty(this, "pointers", {
        value: pointers,
        enumerable: true,
        configurable: true,
      });
    }
    let pointer = pointers[id];
    if (pointer === void 0) {
      if (Object.keys(pointers).length === 0) {
        this.attachActivePointerEvents(this.eventNode);
      }
      pointer = {};
      pointers[id] = pointer;
    }
    this.updatePointer(pointer, event);
    const oldTargetView = pointer.targetView as GraphicsView | undefined;
    let newTargetView: GraphicsView | null | undefined = this.firePointerEvent(event);
    if (newTargetView === null) {
      newTargetView = void 0;
    }
    if (newTargetView !== oldTargetView) {
      this.onPointerTargetChange(pointer, newTargetView, oldTargetView);
    }
  }

  /** @hidden */
  protected onPointerUp(event: PointerEvent): void {
    const id = "" + event.pointerId;
    let pointers = this.pointers;
    if (pointers === null) {
      pointers = {};
      Object.defineProperty(this, "pointers", {
        value: pointers,
        enumerable: true,
        configurable: true,
      });
    }
    const pointer = pointers[id];
    if (pointer !== void 0) {
      this.updatePointer(pointer, event);
    }
    this.firePointerEvent(event);
    if (pointer !== void 0 && event.pointerType !== "mouse") {
      if (pointer.targetView !== void 0) {
        this.onPointerTargetChange(pointer, void 0, pointer.targetView as GraphicsView);
      }
      delete pointers[id];
      if (Object.keys(pointers).length === 0) {
        this.detachActivePointerEvents(this.eventNode);
      }
    }
  }

  /** @hidden */
  protected onPointerCancel(event: PointerEvent): void {
    const id = "" + event.pointerId;
    let pointers = this.pointers;
    if (pointers === null) {
      pointers = {};
      Object.defineProperty(this, "pointers", {
        value: pointers,
        enumerable: true,
        configurable: true,
      });
    }
    const pointer = pointers[id];
    if (pointer !== void 0) {
      this.updatePointer(pointer, event);
    }
    this.firePointerEvent(event);
    if (pointer !== void 0 && event.pointerType !== "mouse") {
      if (pointer.targetView !== void 0) {
        this.onPointerTargetChange(pointer, void 0, pointer.targetView as GraphicsView);
      }
      delete pointers[id];
      if (Object.keys(pointers).length === 0) {
        this.detachActivePointerEvents(this.eventNode);
      }
    }
  }

  /** @hidden */
  protected onPointerTargetChange(pointer: CanvasViewPointer, newTargetView: GraphicsView | undefined,
                                  oldTargetView: GraphicsView | undefined): void {
    pointer.bubbles = true;
    if (oldTargetView !== void 0) {
      const outEvent = new PointerEvent("pointerout", pointer) as ViewPointerEvent;
      outEvent.targetView = oldTargetView;
      outEvent.relatedTargetView = newTargetView;
      oldTargetView.bubbleEvent(outEvent);
    }
    pointer.targetView = newTargetView;
    if (newTargetView !== void 0) {
      const overEvent = new PointerEvent("pointerover", pointer) as ViewPointerEvent;
      overEvent.targetView = newTargetView;
      overEvent.relatedTargetView = oldTargetView;
      newTargetView.bubbleEvent(overEvent);
    }
  }

  /** @hidden */
  protected detectPointerTarget(pointer: CanvasViewPointer, clientBounds: R2Box): void {
    const clientX = pointer.clientX!;
    const clientY = pointer.clientY!;
    if (clientBounds.contains(clientX, clientY)) {
      const x = clientX - clientBounds.x;
      const y = clientY - clientBounds.y;
      const oldTargetView = pointer.targetView as GraphicsView | undefined;
      let newTargetView: GraphicsView | null | undefined = this.cascadeHitTest(x, y);
      if (newTargetView === null) {
        newTargetView = void 0;
      }
      if (newTargetView !== oldTargetView) {
        this.onPointerTargetChange(pointer, newTargetView, oldTargetView);
      }
    }
  }

  /** @hidden */
  protected attachPassiveTouchEvents(eventNode: HTMLElement): void {
    eventNode.addEventListener("touchstart", this.onTouchStart);
  }

  /** @hidden */
  protected detachPassiveTouchEvents(eventNode: HTMLElement): void {
    eventNode.removeEventListener("touchstart", this.onTouchStart);
  }

  /** @hidden */
  protected attachActiveTouchEvents(eventNode: HTMLElement): void {
    eventNode.addEventListener("touchmove", this.onTouchMove);
    eventNode.addEventListener("touchend", this.onTouchEnd);
    eventNode.addEventListener("touchcancel", this.onTouchCancel);
  }

  /** @hidden */
  protected detachActiveTouchEvents(eventNode: HTMLElement): void {
    eventNode.removeEventListener("touchmove", this.onTouchMove);
    eventNode.removeEventListener("touchend", this.onTouchEnd);
    eventNode.removeEventListener("touchcancel", this.onTouchCancel);
  }

  /** @hidden */
  readonly touches!: {[id: string]: CanvasViewTouch | undefined} | null;

  /** @hidden */
  protected updateTouch(touch: CanvasViewTouch, event: Touch): void {
    touch.clientX = event.clientX;
    touch.clientY = event.clientY;
    touch.screenX = event.screenX;
    touch.screenY = event.screenY;
    touch.pageX = event.pageX;
    touch.pageY = event.pageY;

    touch.radiusX = event.radiusX;
    touch.radiusY = event.radiusY;
    touch.rotationAngle = event.rotationAngle;
    touch.force = event.force;
  }

  /** @hidden */
  protected fireTouchEvent(type: string, originalEvent: TouchEvent): void {
    const changedTouches = originalEvent.changedTouches;
    const dispatched: GraphicsView[] = [];
    for (let i = 0, n = changedTouches.length; i < n; i += 1) {
      const changedTouch = changedTouches[i]! as ViewTouch;
      const targetView = changedTouch.targetView as GraphicsView | undefined;
      if (targetView !== void 0 && dispatched.indexOf(targetView) < 0) {
        const startEvent: ViewTouchEvent = new TouchEvent(type, {
          changedTouches: changedTouches as unknown as Touch[],
          targetTouches: originalEvent.targetTouches as unknown as Touch[],
          touches: originalEvent.touches as unknown as Touch[],
          bubbles: true,
        });
        startEvent.targetView = targetView;
        const targetViewTouches: Touch[] = [changedTouch];
        for (let j = i + 1; j < n; j += 1) {
          const nextTouch = changedTouches[j]! as ViewTouch;
          if (nextTouch.targetView === targetView) {
            targetViewTouches.push(nextTouch);
          }
        }
        if (document.createTouchList !== void 0) {
          startEvent.targetViewTouches = document.createTouchList(...targetViewTouches);
        } else {
          (targetViewTouches as unknown as TouchList).item = function (index: number): Touch {
            return targetViewTouches[index]!;
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
    let clientBounds: R2Box | undefined;
    let touches = this.touches;
    if (touches === null) {
      touches = {};
      Object.defineProperty(this, "touches", {
        value: touches,
        enumerable: true,
        configurable: true,
      });
    }
    const changedTouches = event.changedTouches;
    for (let i = 0, n = changedTouches.length; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
      const id = "" + changedTouch.identifier;
      let touch = touches[id];
      if (touch === void 0) {
        if (Object.keys(touches).length === 0) {
          this.attachActiveTouchEvents(this.eventNode);
        }
        touch = {
          identifier: changedTouch.identifier,
          target: changedTouch.target,
        };
        touches[id] = touch;
      }
      this.updateTouch(touch, changedTouch);
      const clientX = touch.clientX!;
      const clientY = touch.clientY!;
      if (clientBounds === void 0) {
        clientBounds = this.clientBounds;
      }
      if (clientBounds.contains(clientX, clientY)) {
        const x = clientX - clientBounds.x;
        const y = clientY - clientBounds.y;
        const hit = this.cascadeHitTest(x, y);
        if (hit !== null) {
          touch.targetView = hit;
          changedTouch.targetView = hit;
        }
      }
    }
    this.fireTouchEvent("touchstart", event);
  }

  /** @hidden */
  protected onTouchMove(event: TouchEvent): void {
    let touches = this.touches;
    if (touches === null) {
      touches = {};
      Object.defineProperty(this, "touches", {
        value: touches,
        enumerable: true,
        configurable: true,
      });
    }
    const changedTouches = event.changedTouches;
    for (let i = 0, n = changedTouches.length; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
      const id = "" + changedTouch.identifier;
      let touch = touches[id];
      if (touch === void 0) {
        touch = {
          identifier: changedTouch.identifier,
          target: changedTouch.target,
        };
        touches[id] = touch;
      }
      this.updateTouch(touch, changedTouch);
      changedTouch.targetView = touch.targetView;
    }
    this.fireTouchEvent("touchmove", event);
  }

  /** @hidden */
  protected onTouchEnd(event: TouchEvent): void {
    let touches = this.touches;
    if (touches === null) {
      touches = {};
      Object.defineProperty(this, "touches", {
        value: touches,
        enumerable: true,
        configurable: true,
      });
    }
    const changedTouches = event.changedTouches;
    const n = changedTouches.length;
    for (let i = 0; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
      const id = "" + changedTouch.identifier;
      let touch = touches[id];
      if (touch === void 0) {
        touch = {
          identifier: changedTouch.identifier,
          target: changedTouch.target,
        };
        touches[id] = touch;
      }
      this.updateTouch(touch, changedTouch);
      changedTouch.targetView = touch.targetView;
    }
    this.fireTouchEvent("touchend", event);
    for (let i = 0; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
      const id = "" + changedTouch.identifier;
      delete touches[id];
      if (Object.keys(touches).length === 0) {
        this.detachActiveTouchEvents(this.eventNode);
      }
    }
  }

  /** @hidden */
  protected onTouchCancel(event: TouchEvent): void {
    let touches = this.touches;
    if (touches === null) {
      touches = {};
      Object.defineProperty(this, "touches", {
        value: touches,
        enumerable: true,
        configurable: true,
      });
    }
    const changedTouches = event.changedTouches;
    const n = changedTouches.length;
    for (let i = 0; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
      const id = "" + changedTouch.identifier;
      let touch = touches[id];
      if (touch === void 0) {
        touch = {
          identifier: changedTouch.identifier,
          target: changedTouch.target,
        };
        touches[id] = touch;
      }
      this.updateTouch(touch, changedTouch);
      changedTouch.targetView = touch.targetView;
    }
    this.fireTouchEvent("touchcancel", event);
    for (let i = 0; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
      const id = "" + changedTouch.identifier;
      delete touches[id];
      if (Object.keys(touches).length === 0) {
        this.detachActiveTouchEvents(this.eventNode);
      }
    }
  }

  protected resizeCanvas(canvas: HTMLCanvasElement): void {
    let width: number;
    let height: number;
    let pixelRatio: number;
    let parentNode = canvas.parentNode;
    if (parentNode instanceof HTMLElement) {
      do {
        width = Math.floor(parentNode.offsetWidth);
        height = Math.floor(parentNode.offsetHeight);
        if (width !== 0 && height !== 0) {
          break;
        } else if ((width === 0 || height === 0) && HtmlView.isPositioned(parentNode)) {
          this.requireUpdate(View.NeedsResize); // view might not yet have been laid out
        }
        parentNode = parentNode.parentNode;
      } while (parentNode instanceof HTMLElement);
      pixelRatio = this.pixelRatio;
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
    } else {
      width = Math.floor(canvas.width);
      height = Math.floor(canvas.height);
      pixelRatio = 1;
    }
    Object.defineProperty(this, "viewFrame", {
      value: new R2Box(0, 0, width, height),
      enumerable: true,
      configurable: true,
    });
  }

  clearCanvas(): void {
    const renderer = this.renderer;
    if (renderer instanceof CanvasRenderer) {
      const frame = this.viewFrame;
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
      const frame = this.viewFrame;
      renderer.context.viewport(0, 0, frame.width, frame.height);
    }
  }

  /** @hidden */
  static override readonly tag: string = "canvas";

  /** @hidden */
  static readonly ClickEventsFlag: CanvasFlags = 1 << 0;
  /** @hidden */
  static readonly WheelEventsFlag: CanvasFlags = 1 << 1;
  /** @hidden */
  static readonly MouseEventsFlag: CanvasFlags = 1 << 2;
  /** @hidden */
  static readonly PointerEventsFlag: CanvasFlags = 1 << 3;
  /** @hidden */
  static readonly TouchEventsFlag: CanvasFlags = 1 << 4;
  /** @hidden */
  static readonly EventsMask: CanvasFlags = CanvasView.ClickEventsFlag
                                          | CanvasView.WheelEventsFlag
                                          | CanvasView.MouseEventsFlag
                                          | CanvasView.PointerEventsFlag
                                          | CanvasView.TouchEventsFlag;

  static override readonly powerFlags: ViewFlags = HtmlView.powerFlags | View.NeedsRender | View.NeedsComposite;
  static override readonly uncullFlags: ViewFlags = HtmlView.uncullFlags | View.NeedsRender | View.NeedsComposite;
}

HtmlView.Tag("canvas")(CanvasView, "canvas");
