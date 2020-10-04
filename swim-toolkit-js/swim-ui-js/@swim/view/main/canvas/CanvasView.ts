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
import {AnyRenderer, RendererType, Renderer, CanvasRenderer, WebGLRenderer} from "@swim/render";
import {ViewEvent} from "../event/ViewEvent";
import {ViewMouseEventInit, ViewMouseEvent} from "../event/ViewMouseEvent";
import {ViewPointerEventInit, ViewPointerEvent} from "../event/ViewPointerEvent";
import {ViewTouchInit, ViewTouch, ViewTouchEvent} from "../event/ViewTouchEvent";
import {ViewContextType, ViewContext} from "../ViewContext";
import {ViewFlags, View} from "../View";
import {GraphicsViewContext} from "../graphics/GraphicsViewContext";
import {GraphicsView} from "../graphics/GraphicsView";
import {ViewNode, ViewNodeType, NodeView} from "../node/NodeView";
import {TextView} from "../text/TextView";
import {ElementViewConstructor, ElementView} from "../element/ElementView";
import {HtmlChildViewTagMap, HtmlViewInit, HtmlView} from "../html/HtmlView";
import {CanvasViewObserver} from "./CanvasViewObserver";
import {CanvasViewController} from "./CanvasViewController";

export type CanvasFlags = number;

export interface CanvasViewMouse extends ViewMouseEventInit {
}

export interface CanvasViewPointer extends ViewPointerEventInit {
}

export interface CanvasViewTouch extends ViewTouchInit {
}

export interface ViewCanvas extends HTMLCanvasElement {
  view?: CanvasView;
}

export interface CanvasViewInit extends HtmlViewInit {
  viewController?: CanvasViewController;
  renderer?: AnyRenderer;
  clickEventsEnabled?: boolean;
  wheelEventsEnabled?: boolean;
  mouseEventsEnabled?: boolean;
  pointerEventsEnabled?: boolean;
  touchEventsEnabled?: boolean;
}

export class CanvasView extends HtmlView {
  /** @hidden */
  readonly _graphicsViews: GraphicsView[];
  /** @hidden */
  _renderer: Renderer | null | undefined;
  /** @hidden */
  _viewFrame: BoxR2;
  /** @hidden */
  _canvasFlags: number;
  /** @hidden */
  _eventNode: Node;
  /** @hidden */
  _mouse: CanvasViewMouse | null;
  /** @hidden */
  readonly _pointers: {[id: string]: CanvasViewPointer | undefined};
  /** @hidden */
  readonly _touches: {[id: string]: CanvasViewTouch | undefined};

  constructor(node: HTMLCanvasElement) {
    super(node);

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

    this._graphicsViews = [];
    this._renderer = void 0;
    this._viewFrame = BoxR2.undefined();
    this._canvasFlags = CanvasView.ClickEventsFlag;

    this._eventNode = this._node;
    this._mouse = null;
    this._pointers = {};
    this._touches = {};
  }

  protected initNode(node: ViewNodeType<this>): void {
    super.initNode(node);
    this.position.setAutoState("absolute");
  }

  // @ts-ignore
  declare readonly node: ViewCanvas;

  // @ts-ignore
  declare readonly viewController: CanvasViewController | null;

  // @ts-ignore
  declare readonly viewObservers: ReadonlyArray<CanvasViewObserver>;

  initView(init: CanvasViewInit): void {
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

  get childViewCount(): number {
    let childViewCount = 0;
    const childNodes = this._node.childNodes;
    for (let i = 0, n = childNodes.length; i < n; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView !== void 0) {
        childViewCount += 1;
      }
    }
    childViewCount += this._graphicsViews.length;
    return childViewCount;
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
    childViews.push.apply(childViews, this._graphicsViews);
    return childViews;
  }

  firstChildView(): View | null {
    const childNodes = this._node.childNodes;
    for (let i = 0, n = childNodes.length; i < n; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView !== void 0) {
        return childView;
      }
    }
    const graphicsViews = this._graphicsViews;
    if (graphicsViews.length !== 0) {
      return graphicsViews[0];
    }
    return null;
  }

  lastChildView(): View | null {
    const graphicsViews = this._graphicsViews;
    if (graphicsViews.length !== 0) {
      return graphicsViews[graphicsViews.length - 1];
    }
    const childNodes = this._node.childNodes;
    for (let i = childNodes.length - 1; i >= 0; i -= 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView !== void 0) {
        return childView;
      }
    }
    return null;
  }

  nextChildView(targetView: View): View | null {
    const graphicsViews = this._graphicsViews;
    if (targetView instanceof NodeView && targetView.parentView === this) {
      let targetNode: ViewNode | null = targetView._node;
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
        return graphicsViews[0];
      }
    } else if (targetView instanceof GraphicsView) {
      const targetIndex = graphicsViews.indexOf(targetView);
      if (targetIndex >= 0 && targetIndex + 1 < graphicsViews.length) {
        return graphicsViews[targetIndex + 1];
      }
    }
    return null;
  }

  previousChildView(targetView: View): View | null {
    let targetNode: ViewNode | null = null;
    if (targetView instanceof GraphicsView) {
      const graphicsViews = this._graphicsViews;
      const targetIndex = graphicsViews.indexOf(targetView);
      if (targetIndex - 1 >= 0) {
        return graphicsViews[targetIndex - 1];
      } else if (targetIndex === 0) {
        targetNode = this._node.lastChild;
        if (targetNode !== null && targetNode.view !== void 0) {
          return targetNode.view;
        }
      }
    } else if (targetView instanceof NodeView && targetView.parentView === this) {
      targetNode = targetView._node;
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

  forEachChildView<T, S = unknown>(callback: (this: S, childView: View) => T | void,
                                   thisArg?: S): T | undefined {
    let result: T | undefined;
    const childNodes = this._node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childNode = childNodes[i] as ViewNode;
      const childView = childNode.view;
      if (childView !== void 0) {
        result = callback.call(thisArg, childView);
        if (result !== void 0) {
          break;
        }
      }
      if (childNodes[i] === childNode) {
        i += 1;
      }
    }
    const graphicsViews = this._graphicsViews;
    i = 0;
    while (i < graphicsViews.length) {
      const childView = graphicsViews[i];
      result = callback.call(thisArg, childView);
      if (result !== void 0) {
        break;
      }
      if (graphicsViews[i] === childView) {
        i += 1;
      }
    }
    return result;
  }

  setChildView(key: string, newChildView: View | null): View | null {
    if (newChildView instanceof GraphicsView) {
      return this.setGraphicsView(key, newChildView);
    } else {
      return super.setChildView(key, newChildView);
    }
  }

  setGraphicsView(key: string, newChildView: GraphicsView | null): View | null {
    let index = -1;
    let oldChildView: View | null = null;
    let targetView: View | null = null;
    const childViews = this._graphicsViews;
    const childViewMap = this._childViewMap;
    if (childViewMap !== void 0) {
      const childView = childViewMap[key];
      if (childView instanceof GraphicsView) {
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
        childView.setKey(void 0);
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
        childView.setKey(void 0);
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
      newChildView.cascadeInsert();
    }
    return oldChildView;
  }

  get graphicsViews(): ReadonlyArray<GraphicsView> {
    return this._graphicsViews;
  }

  append<T extends keyof HtmlChildViewTagMap>(tag: T, key?: string): HtmlChildViewTagMap[T];
  append(tag: string, key?: string): HtmlView;
  append(childNode: HTMLElement, key?: string): HtmlView;
  append(childNode: Element, key?: string): ElementView;
  append(childNode: Text, key?: string): TextView;
  append(childNode: Node, key?: string): NodeView;
  append<V extends NodeView | GraphicsView>(childView: V, key?: string): V;
  append<VC extends ElementViewConstructor>(viewConstructor: VC, key?: string): InstanceType<VC>;
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
    this._graphicsViews.push(childView);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildView(childView, null);
    this.didInsertChildView(childView, null);
    childView.cascadeInsert();
  }

  prepend<T extends keyof HtmlChildViewTagMap>(tag: T, key?: string): HtmlChildViewTagMap[T];
  prepend(tag: string, key?: string): HtmlView;
  prepend(childNode: HTMLElement, key?: string): HtmlView;
  prepend(childNode: Element, key?: string): ElementView;
  prepend(childNode: Text, key?: string): TextView;
  prepend(childNode: Node, key?: string): NodeView;
  prepend<V extends NodeView | GraphicsView>(childView: V, key?: string): V;
  prepend<VC extends ElementViewConstructor>(viewConstructor: VC, key?: string): InstanceType<VC>;
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
    const graphicsViews = this._graphicsViews;
    const targetView = graphicsViews.length !== 0 ? graphicsViews[0] : null;
    this.willInsertChildView(childView, targetView);
    graphicsViews.unshift(childView);
    this.insertChildViewMap(childView);
    childView.setParentView(this, targetView);
    this.onInsertChildView(childView, targetView);
    this.didInsertChildView(childView, targetView);
    childView.cascadeInsert();
  }

  insert<T extends keyof HtmlChildViewTagMap>(tag: T, target: View | Node | null, key?: string): HtmlChildViewTagMap[T];
  insert(tag: string, target: View | Node | null, key?: string): HtmlView;
  insert(childNode: HTMLElement, target: View | Node | null, key?: string): HtmlView;
  insert(childNode: Element, target: View | Node | null, key?: string): ElementView;
  insert(childNode: Text, target: View | Node | null, key?: string): TextView;
  insert(childNode: Node, target: View | Node | null, key?: string): NodeView;
  insert<V extends NodeView | GraphicsView>(childView: V, target: View | Node | null, key?: string): V;
  insert<VC extends ElementViewConstructor>(viewConstructor: VC, target: View | Node | null, key?: string): InstanceType<VC>;
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
    if (childView instanceof GraphicsView && targetView instanceof GraphicsView) {
      this.insertGraphicsView(childView, targetView, key);
    } else {
      super.insertChildView(childView, targetView, key);
    }
  }

  insertGraphicsView(childView: GraphicsView, targetView: GraphicsView | null, key?: string): void {
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
    const graphicsViews = this._graphicsViews;
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
    const graphicsViews = this._graphicsViews;
    const index = graphicsViews.indexOf(childView);
    if (index >= 0) {
      graphicsViews.splice(index, 1);
    }
    this.onRemoveChildView(childView);
    this.didRemoveChildView(childView);
    childView.setKey(void 0);
  }

  removeAll(): void {
    super.removeAll();
    const graphicsViews = this._graphicsViews;
    do {
      const count = graphicsViews.length;
      if (count > 0) {
        const childView = graphicsViews[count - 1];
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
    this.attachEvents(this._eventNode);
  }

  /** @hidden */
  doMountChildViews(): void {
    const childNodes = this._node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView !== void 0) {
        childView.cascadeMount();
        if ((childView._viewFlags & View.RemovingFlag) !== 0) {
          childView._viewFlags &= ~View.RemovingFlag;
          this.removeChildView(childView);
          continue;
        }
      }
      i += 1;
    }
    const graphicsViews = this._graphicsViews;
    i = 0;
    while (i < graphicsViews.length) {
      const childView = graphicsViews[i];
      childView.cascadeMount();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
        continue;
      }
      i += 1;
    }
  }

  protected onUnmount(): void {
    this.detachEvents(this._eventNode);
    super.onUnmount();
  }

  /** @hidden */
  doUnmountChildViews(): void {
    const childNodes = this._node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView !== void 0) {
        childView.cascadeUnmount();
        if ((childView._viewFlags & View.RemovingFlag) !== 0) {
          childView._viewFlags &= ~View.RemovingFlag;
          this.removeChildView(childView);
          continue;
        }
      }
      i += 1;
    }
    const graphicsViews = this._graphicsViews;
    i = 0;
    while (i < graphicsViews.length) {
      const childView = graphicsViews[i];
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
  doPowerChildViews(): void {
    const childNodes = this._node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView !== void 0) {
        childView.cascadePower();
        if ((childView._viewFlags & View.RemovingFlag) !== 0) {
          childView._viewFlags &= ~View.RemovingFlag;
          this.removeChildView(childView);
          continue;
        }
      }
      i += 1;
    }
    const graphicsViews = this._graphicsViews;
    i = 0;
    while (i < graphicsViews.length) {
      const childView = graphicsViews[i];
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
  doUnpowerChildViews(): void {
    const childNodes = this._node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView !== void 0) {
        childView.cascadeUnpower();
        if ((childView._viewFlags & View.RemovingFlag) !== 0) {
          childView._viewFlags &= ~View.RemovingFlag;
          this.removeChildView(childView);
          continue;
        }
      }
      i += 1;
    }
    const graphicsViews = this._graphicsViews;
    i = 0;
    while (i < graphicsViews.length) {
      const childView = graphicsViews[i];
      childView.cascadeUnpower();
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
        continue;
      }
      i += 1;
    }
  }

  protected modifyUpdate(targetView: View, updateFlags: ViewFlags): ViewFlags {
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

  needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((processFlags & View.ProcessMask) !== 0) {
      this.requireUpdate(View.NeedsRender);
    }
    return processFlags;
  }

  protected onResize(viewContext: ViewContextType<this>): void {
    super.onResize(viewContext);
    this.resizeCanvas(this._node);
    this.resetRenderer();
  }

  protected onScroll(viewContext: ViewContextType<this>): void {
    super.onScroll(viewContext);
    this.setCulled(!this.intersectsViewport());
  }

  /** @hidden */
  protected doProcessChildViews(processFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    if ((processFlags & View.ProcessMask) !== 0 &&
        (this._graphicsViews.length !== 0 || this._node.childNodes.length !== 0)) {
      this.willProcessChildViews(processFlags, viewContext);
      this.onProcessChildViews(processFlags, viewContext);
      this.didProcessChildViews(processFlags, viewContext);
    }
  }

  protected processChildViews(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                              callback?: (this: this, childView: View) => void): void {
    const childNodes = this._node.childNodes;
    const graphicsViews = this._graphicsViews;
    let i = 0;
    while (i < childNodes.length) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView !== void 0) {
        this.processChildView(childView, processFlags, viewContext);
        if ((childView._viewFlags & View.RemovingFlag) !== 0) {
          childView._viewFlags &= ~View.RemovingFlag;
          this.removeChildView(childView);
          continue;
        } else if (callback !== void 0) {
          callback.call(this, childView);
        }
      }
      i += 1;
    }
    i = 0;
    while (i < graphicsViews.length) {
      const childView = graphicsViews[i];
      this.processChildView(childView, processFlags, viewContext);
      if (callback !== void 0) {
        callback.call(this, childView);
      }
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
        continue;
      }
      i += 1;
    }
  }

  needsDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    displayFlags |= View.NeedsRender;
    return displayFlags;
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

  protected didDisplay(viewContext: ViewContextType<this>): void {
    this.detectHitTargets();
    super.didDisplay(viewContext);
  }

  protected willRender(viewContext: ViewContextType<this>): void {
    this.willObserve(function (viewObserver: CanvasViewObserver): void {
      if (viewObserver.viewWillRender !== void 0) {
        viewObserver.viewWillRender(viewContext, this);
      }
    });
  }

  protected onRender(viewContext: ViewContextType<this>): void {
    this.clearCanvas();
  }

  protected didRender(viewContext: ViewContextType<this>): void {
    this.didObserve(function (viewObserver: CanvasViewObserver): void {
      if (viewObserver.viewDidRender !== void 0) {
        viewObserver.viewDidRender(viewContext, this);
      }
    });
  }

  /** @hidden */
  protected doDisplayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    if ((displayFlags & View.DisplayMask) !== 0 &&
        (this._graphicsViews.length !== 0 || this._node.childNodes.length !== 0)) {
      this.willDisplayChildViews(displayFlags, viewContext);
      this.onDisplayChildViews(displayFlags, viewContext);
      this.didDisplayChildViews(displayFlags, viewContext);
    }
  }

  protected displayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                              callback?: (this: this, childView: View) => void): void {
    const childNodes = this._node.childNodes;
    const graphicsViews = this._graphicsViews;
    let i = 0;
    while (i < childNodes.length) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView !== void 0) {
        this.displayChildView(childView, displayFlags, viewContext);
        if (callback !== void 0) {
          callback.call(this, childView);
        }
        if ((childView._viewFlags & View.RemovingFlag) !== 0) {
          childView._viewFlags &= ~View.RemovingFlag;
          this.removeChildView(childView);
          continue;
        }
      }
      i += 1;
    }
    i = 0;
    while (i < graphicsViews.length) {
      const childView = graphicsViews[i];
      this.displayChildView(childView, displayFlags, viewContext);
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
        continue;
      } else if (callback !== void 0) {
        callback.call(this, childView);
      }
      i += 1;
    }
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
    if (!hidden) {
      this.requireUpdate(View.NeedsRender);
    }
  }

  protected didSetHidden(hidden: boolean): void {
    this.didObserve(function (viewObserver: CanvasViewObserver): void {
      if (viewObserver.viewDidSetHidden !== void 0) {
        viewObserver.viewDidSetHidden(hidden, this);
      }
    });
  }

  extendViewContext(viewContext: ViewContext): ViewContextType<this> {
    const canvasViewContext = Object.create(viewContext);
    canvasViewContext.renderer = this.renderer;
    return canvasViewContext;
  }

  // @ts-ignore
  declare readonly viewContext: GraphicsViewContext;

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

  hitTest(x: number, y: number, viewContext?: ViewContext): GraphicsView | null {
    if (viewContext === void 0) {
      viewContext = this.superViewContext;
    }
    const extendedViewContext = this.extendViewContext(viewContext);
    return this.doHitTest(x, y, extendedViewContext);
  }

  protected doHitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    let hit: GraphicsView | null = null;
    const graphicsViews = this._graphicsViews;
    for (let i = graphicsViews.length - 1; i >= 0; i -= 1) {
      const childView = graphicsViews[i];
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

  /** @hidden */
  protected detectHitTargets(clientBounds?: BoxR2): void {
    if ((this._canvasFlags & CanvasView.MouseEventsFlag) !== 0) {
      const mouse = this._mouse;
      if (mouse !== null) {
        if (clientBounds === void 0) {
          clientBounds = this.clientBounds;
        }
        this.detectMouseTarget(mouse, this.clientBounds);
      }
    }
    if ((this._canvasFlags & CanvasView.PointerEventsFlag) !== 0) {
      const pointers = this._pointers;
      for (const id in pointers) {
        const pointer = pointers[id]!;
        if (clientBounds === void 0) {
          clientBounds = this.clientBounds;
        }
        this.detectPointerTarget(pointer, clientBounds);
      }
    }
  }

  get eventNode(): Node {
    return this._eventNode;
  }

  setEventNode(eventNode: Node | null): void {
    if (eventNode === null) {
      eventNode = this._node;
    }
    if (this._eventNode !== eventNode) {
      this.detachEvents(this._eventNode);
      this._eventNode = eventNode;
      this.attachEvents(this._eventNode);
    }
  }

  clickEventsEnabled(): boolean;
  clickEventsEnabled(clickEvents: boolean): this;
  clickEventsEnabled(newClickEvents?: boolean): boolean | this {
    const oldClickEvents = (this._canvasFlags & CanvasView.ClickEventsFlag) !== 0;
    if (newClickEvents === void 0) {
      return oldClickEvents;
    } else {
      if (newClickEvents && !oldClickEvents) {
        this._canvasFlags |= CanvasView.ClickEventsFlag;
        this.attachClickEvents(this._eventNode);
      } else if (!newClickEvents && oldClickEvents) {
        this._canvasFlags &= ~CanvasView.ClickEventsFlag;
        this.detachClickEvents(this._eventNode);
      }
      return this;
    }
  }

  wheelEventsEnabled(): boolean;
  wheelEventsEnabled(wheelEvents: boolean): this;
  wheelEventsEnabled(newWheelEvents?: boolean): boolean | this {
    const oldWheelEvents = (this._canvasFlags & CanvasView.WheelEventsFlag) !== 0;
    if (newWheelEvents === void 0) {
      return oldWheelEvents;
    } else {
      if (newWheelEvents && !oldWheelEvents) {
        this._canvasFlags |= CanvasView.WheelEventsFlag;
        this.attachWheelEvents(this._eventNode);
      } else if (!newWheelEvents && oldWheelEvents) {
        this._canvasFlags &= ~CanvasView.WheelEventsFlag;
        this.detachWheelEvents(this._eventNode);
      }
      return this;
    }
  }

  mouseEventsEnabled(): boolean;
  mouseEventsEnabled(mouseEvents: boolean): this;
  mouseEventsEnabled(newMouseEvents?: boolean): boolean | this {
    const oldMouseEvents = (this._canvasFlags & CanvasView.MouseEventsFlag) !== 0;
    if (newMouseEvents === void 0) {
      return oldMouseEvents;
    } else {
      if (newMouseEvents && !oldMouseEvents) {
        this._canvasFlags |= CanvasView.MouseEventsFlag;
        this.attachPassiveMouseEvents(this._eventNode);
      } else if (!newMouseEvents && oldMouseEvents) {
        this._canvasFlags &= ~CanvasView.MouseEventsFlag;
        this.detachPassiveMouseEvents(this._eventNode);
      }
      return this;
    }
  }

  pointerEventsEnabled(): boolean;
  pointerEventsEnabled(pointerEvents: boolean): this;
  pointerEventsEnabled(newPointerEvents?: boolean): boolean | this {
    const oldPointerEvents = (this._canvasFlags & CanvasView.PointerEventsFlag) !== 0;
    if (newPointerEvents === void 0) {
      return oldPointerEvents;
    } else {
      if (newPointerEvents && !oldPointerEvents) {
        this._canvasFlags |= CanvasView.PointerEventsFlag;
        this.attachPassivePointerEvents(this._eventNode);
      } else if (!newPointerEvents && oldPointerEvents) {
        this._canvasFlags &= ~CanvasView.PointerEventsFlag;
        this.detachPassivePointerEvents(this._eventNode);
      }
      return this;
    }
  }

  touchEventsEnabled(): boolean;
  touchEventsEnabled(touchEvents: boolean): this;
  touchEventsEnabled(newTouchEvents?: boolean): boolean | this {
    const oldTouchEvents = (this._canvasFlags & CanvasView.TouchEventsFlag) !== 0;
    if (newTouchEvents === void 0) {
      return oldTouchEvents;
    } else {
      if (newTouchEvents && !oldTouchEvents) {
        this._canvasFlags |= CanvasView.TouchEventsFlag;
        this.attachPassiveTouchEvents(this._eventNode);
      } else if (!newTouchEvents && oldTouchEvents) {
        this._canvasFlags &= ~CanvasView.TouchEventsFlag;
        this.detachPassiveTouchEvents(this._eventNode);
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
  protected attachEvents(eventNode: Node): void {
    if ((this._canvasFlags & CanvasView.ClickEventsFlag) !== 0) {
      this.attachClickEvents(eventNode);
    }

    if ((this._canvasFlags & CanvasView.WheelEventsFlag) !== 0) {
      this.attachWheelEvents(eventNode);
    }

    if ((this._canvasFlags & CanvasView.MouseEventsFlag) !== 0) {
      this.attachPassiveMouseEvents(eventNode);
    }

    if ((this._canvasFlags & CanvasView.PointerEventsFlag) !== 0) {
      this.attachPassivePointerEvents(eventNode);
    }

    if ((this._canvasFlags & CanvasView.TouchEventsFlag) !== 0) {
      this.attachPassiveTouchEvents(eventNode);
    }
  }

  /** @hidden */
  protected detachEvents(eventNode: Node): void {
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
  protected attachClickEvents(eventNode: Node): void {
    eventNode.addEventListener("click", this.onClick);
    eventNode.addEventListener("dblclick", this.onDblClick);
    eventNode.addEventListener("contextmenu", this.onContextMenu);
  }

  /** @hidden */
  protected detachClickEvents(eventNode: Node): void {
    eventNode.removeEventListener("click", this.onClick);
    eventNode.removeEventListener("dblclick", this.onDblClick);
    eventNode.removeEventListener("contextmenu", this.onContextMenu);
  }

  /** @hidden */
  protected attachWheelEvents(eventNode: Node): void {
    eventNode.addEventListener("wheel", this.onWheel);
  }

  /** @hidden */
  protected detachWheelEvents(eventNode: Node): void {
    eventNode.removeEventListener("wheel", this.onWheel);
  }

  /** @hidden */
  protected attachPassiveMouseEvents(eventNode: Node): void {
    eventNode.addEventListener("mouseenter", this.onMouseEnter);
    eventNode.addEventListener("mouseleave", this.onMouseLeave);
    eventNode.addEventListener("mousedown", this.onMouseDown);
  }

  /** @hidden */
  protected detachPassiveMouseEvents(eventNode: Node): void {
    eventNode.removeEventListener("mouseenter", this.onMouseEnter);
    eventNode.removeEventListener("mouseleave", this.onMouseLeave);
    eventNode.removeEventListener("mousedown", this.onMouseDown);
  }

  /** @hidden */
  protected attachActiveMouseEvents(eventNode: Node): void {
    document.body.addEventListener("mousemove", this.onMouseMove);
    document.body.addEventListener("mouseup", this.onMouseUp);
  }

  /** @hidden */
  protected detachActiveMouseEvents(eventNode: Node): void {
    document.body.removeEventListener("mousemove", this.onMouseMove);
    document.body.removeEventListener("mouseup", this.onMouseUp);
  }

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
    const mouse = this._mouse;
    if (mouse !== null) {
      this.updateMouse(mouse, event);
    }
    this.fireMouseEvent(event);
  }

  /** @hidden */
  protected onDblClick(event: MouseEvent): void {
    const mouse = this._mouse;
    if (mouse !== null) {
      this.updateMouse(mouse, event);
    }
    this.fireMouseEvent(event);
  }

  /** @hidden */
  protected onContextMenu(event: MouseEvent): void {
    const mouse = this._mouse;
    if (mouse !== null) {
      this.updateMouse(mouse, event);
    }
    this.fireMouseEvent(event);
  }

  /** @hidden */
  protected onWheel(event: WheelEvent): void {
    const mouse = this._mouse;
    if (mouse !== null) {
      this.updateMouse(mouse, event);
    }
    this.fireMouseEvent(event);
  }

  /** @hidden */
  protected onMouseEnter(event: MouseEvent): void {
    let mouse = this._mouse;
    if (mouse === null) {
      this.attachActiveMouseEvents(this._eventNode);
      mouse = {};
      this._mouse = mouse;
    }
    this.updateMouse(mouse, event);
  }

  /** @hidden */
  protected onMouseLeave(event: MouseEvent): void {
    const mouse = this._mouse;
    if (mouse !== null) {
      this._mouse = null;
      this.detachActiveMouseEvents(this._eventNode);
    }
  }

  /** @hidden */
  protected onMouseDown(event: MouseEvent): void {
    let mouse = this._mouse;
    if (mouse === null) {
      this.attachActiveMouseEvents(this._eventNode);
      mouse = {};
      this._mouse = mouse;
    }
    this.updateMouse(mouse, event);
    this.fireMouseEvent(event);
  }

  /** @hidden */
  protected onMouseMove(event: MouseEvent): void {
    let mouse = this._mouse;
    if (mouse === null) {
      mouse = {};
      this._mouse = mouse;
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
    const mouse = this._mouse;
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
  protected detectMouseTarget(mouse: CanvasViewMouse, clientBounds: BoxR2): void {
    const clientX = mouse.clientX!;
    const clientY = mouse.clientY!;
    if (clientBounds.contains(clientX, clientY)) {
      const x = clientX - clientBounds.x;
      const y = clientY - clientBounds.y;
      const oldTargetView = mouse.targetView as GraphicsView | undefined;
      let newTargetView: GraphicsView | null | undefined = this.hitTest(x, y);
      if (newTargetView === null) {
        newTargetView = void 0;
      }
      if (newTargetView !== oldTargetView) {
        this.onMouseTargetChange(mouse, newTargetView, oldTargetView);
      }
    }
  }

  /** @hidden */
  protected attachPassivePointerEvents(eventNode: Node): void {
    eventNode.addEventListener("pointerenter", this.onPointerEnter);
    eventNode.addEventListener("pointerleave", this.onPointerLeave);
    eventNode.addEventListener("pointerdown", this.onPointerDown);
  }

  /** @hidden */
  protected detachPassivePointerEvents(eventNode: Node): void {
    eventNode.removeEventListener("pointerenter", this.onPointerEnter);
    eventNode.removeEventListener("pointerleave", this.onPointerLeave);
    eventNode.removeEventListener("pointerdown", this.onPointerDown);
  }

  /** @hidden */
  protected attachActivePointerEvents(eventNode: Node): void {
    document.body.addEventListener("pointermove", this.onPointerMove);
    document.body.addEventListener("pointerup", this.onPointerUp);
    document.body.addEventListener("pointercancel", this.onPointerCancel);
  }

  /** @hidden */
  protected detachActivePointerEvents(eventNode: Node): void {
    document.body.removeEventListener("pointermove", this.onPointerMove);
    document.body.removeEventListener("pointerup", this.onPointerUp);
    document.body.removeEventListener("pointercancel", this.onPointerCancel);
  }

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
    const pointers = this._pointers;
    let pointer = pointers[id];
    if (pointer === void 0) {
      if (Object.keys(pointers).length === 0) {
        this.attachActivePointerEvents(this._eventNode);
      }
      pointer = {};
      pointers[id] = pointer;
    }
    this.updatePointer(pointer, event);
  }

  /** @hidden */
  protected onPointerLeave(event: PointerEvent): void {
    const id = "" + event.pointerId;
    const pointers = this._pointers;
    const pointer = pointers[id];
    if (pointer !== void 0) {
      if (pointer.targetView !== void 0) {
        this.onPointerTargetChange(pointer, void 0, pointer.targetView as GraphicsView);
      }
      delete pointers[id];
      if (Object.keys(pointers).length === 0) {
        this.detachActivePointerEvents(this._eventNode);
      }
    }
  }

  /** @hidden */
  protected onPointerDown(event: PointerEvent): void {
    const id = "" + event.pointerId;
    const pointers = this._pointers;
    let pointer = pointers[id];
    if (pointer === void 0) {
      if (Object.keys(pointers).length === 0) {
        this.attachActivePointerEvents(this._eventNode);
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
    const pointers = this._pointers;
    let pointer = pointers[id];
    if (pointer === void 0) {
      if (Object.keys(pointers).length === 0) {
        this.attachActivePointerEvents(this._eventNode);
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
    const pointers = this._pointers;
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
        this.detachActivePointerEvents(this._eventNode);
      }
    }
  }

  /** @hidden */
  protected onPointerCancel(event: PointerEvent): void {
    const id = "" + event.pointerId;
    const pointers = this._pointers;
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
        this.detachActivePointerEvents(this._eventNode);
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
  protected detectPointerTarget(pointer: CanvasViewPointer, clientBounds: BoxR2): void {
    const clientX = pointer.clientX!;
    const clientY = pointer.clientY!;
    if (clientBounds.contains(clientX, clientY)) {
      const x = clientX - clientBounds.x;
      const y = clientY - clientBounds.y;
      const oldTargetView = pointer.targetView as GraphicsView | undefined;
      let newTargetView: GraphicsView | null | undefined = this.hitTest(x, y);
      if (newTargetView === null) {
        newTargetView = void 0;
      }
      if (newTargetView !== oldTargetView) {
        this.onPointerTargetChange(pointer, newTargetView, oldTargetView);
      }
    }
  }

  /** @hidden */
  protected attachPassiveTouchEvents(eventNode: Node): void {
    eventNode.addEventListener("touchstart", this.onTouchStart);
  }

  /** @hidden */
  protected detachPassiveTouchEvents(eventNode: Node): void {
    eventNode.removeEventListener("touchstart", this.onTouchStart);
  }

  /** @hidden */
  protected attachActiveTouchEvents(eventNode: Node): void {
    eventNode.addEventListener("touchmove", this.onTouchMove);
    eventNode.addEventListener("touchend", this.onTouchEnd);
    eventNode.addEventListener("touchcancel", this.onTouchCancel);
  }

  /** @hidden */
  protected detachActiveTouchEvents(eventNode: Node): void {
    eventNode.removeEventListener("touchmove", this.onTouchMove);
    eventNode.removeEventListener("touchend", this.onTouchEnd);
    eventNode.removeEventListener("touchcancel", this.onTouchCancel);
  }

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
    touch.altitudeAngle = event.altitudeAngle;
    touch.azimuthAngle = event.azimuthAngle;
    touch.rotationAngle = event.rotationAngle;
    touch.force = event.force;
  }

  /** @hidden */
  protected fireTouchEvent(type: string, originalEvent: TouchEvent): void {
    const changedTouches = originalEvent.changedTouches;
    const dispatched: GraphicsView[] = [];
    for (let i = 0, n = changedTouches.length; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
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
    let clientBounds: BoxR2 | undefined;
    const touches = this._touches;
    const changedTouches = event.changedTouches;
    for (let i = 0, n = changedTouches.length; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
      const id = "" + changedTouch.identifier;
      let touch = touches[id];
      if (touch === void 0) {
        if (Object.keys(touches).length === 0) {
          this.attachActiveTouchEvents(this._eventNode);
        }
        touch = {
          identifier: changedTouch.identifier,
          touchType: changedTouch.touchType,
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
        const hit = this.hitTest(x, y);
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
    const touches = this._touches;
    const changedTouches = event.changedTouches;
    for (let i = 0, n = changedTouches.length; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
      const id = "" + changedTouch.identifier;
      let touch = touches[id];
      if (touch === void 0) {
        touch = {
          identifier: changedTouch.identifier,
          touchType: changedTouch.touchType,
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
    const touches = this._touches;
    const changedTouches = event.changedTouches;
    const n = changedTouches.length;
    for (let i = 0; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
      const id = "" + changedTouch.identifier;
      let touch = touches[id];
      if (touch === void 0) {
        touch = {
          identifier: changedTouch.identifier,
          touchType: changedTouch.touchType,
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
        this.detachActiveTouchEvents(this._eventNode);
      }
    }
  }

  /** @hidden */
  protected onTouchCancel(event: TouchEvent): void {
    const touches = this._touches;
    const changedTouches = event.changedTouches;
    const n = changedTouches.length;
    for (let i = 0; i < n; i += 1) {
      const changedTouch = changedTouches[i] as ViewTouch;
      const id = "" + changedTouch.identifier;
      let touch = touches[id];
      if (touch === void 0) {
        touch = {
          identifier: changedTouch.identifier,
          touchType: changedTouch.touchType,
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
        this.detachActiveTouchEvents(this._eventNode);
      }
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

  static readonly powerFlags: ViewFlags = HtmlView.powerFlags | View.NeedsRender;
  static readonly uncullFlags: ViewFlags = HtmlView.uncullFlags | View.NeedsRender;
}
View.Canvas = CanvasView;
