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

import {Mutable, Class, Arrays, ObserverType} from "@swim/util";
import {Affinity, Provider} from "@swim/fastener";
import {R2Box, Transform} from "@swim/math";
import {
  ViewContextType,
  ViewContext,
  ViewFlags,
  AnyView,
  ViewCreator,
  View,
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
import {ViewNode, AnyNodeView, NodeView, HtmlViewInit, HtmlViewTagMap, HtmlView} from "@swim/dom";
import {SpriteService} from "../sprite/SpriteService";
import type {AnyGraphicsRenderer, GraphicsRendererType, GraphicsRenderer} from "../graphics/GraphicsRenderer";
import type {GraphicsViewContext} from "../graphics/GraphicsViewContext";
import {GraphicsView} from "../graphics/GraphicsView";
import {WebGLRenderer} from "../webgl/WebGLRenderer";
import {CanvasRenderer} from "./CanvasRenderer";
import type {CanvasViewObserver} from "./CanvasViewObserver";

export type CanvasFlags = number;

export interface CanvasViewInit extends HtmlViewInit {
  renderer?: AnyGraphicsRenderer;
  clickEventsEnabled?: boolean;
  wheelEventsEnabled?: boolean;
  mouseEventsEnabled?: boolean;
  pointerEventsEnabled?: boolean;
  touchEventsEnabled?: boolean;
}

export class CanvasView extends HtmlView {
  constructor(node: HTMLCanvasElement) {
    super(node);
    Object.defineProperty(this, "children", { // override getter
      value: [],
      writable: true,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "renderer", { // override getter
      value: this.createRenderer(),
      writable: true,
      enumerable: true,
      configurable: true,
    });
    this.viewFrame = R2Box.undefined();
    this.canvasFlags = CanvasView.ClickEventsFlag;
    this.eventNode = node;
    this.mouse = null;
    this.pointers = null;
    this.touches = null;

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

  override readonly observerType?: Class<CanvasViewObserver>;

  override readonly contextType?: Class<GraphicsViewContext>;

  override readonly node!: HTMLCanvasElement;

  protected initCanvas(): void {
    this.position.setState("absolute", Affinity.Intrinsic);
  }

  //override readonly children: ReadonlyArray<View>; // override getter

  override get childCount(): number {
    return this.children.length;
  }

  override firstChild(): View | null {
    const children = this.children;
    if (children.length !== 0) {
      return children[0]!;
    }
    return null;
  }

  override lastChild(): View | null {
    const children = this.children;
    const childCount = children.length;
    if (childCount !== 0) {
      return children[childCount - 1]!;
    }
    return null;
  }

  override nextChild(target: View): View | null {
    const children = this.children;
    const targetIndex = children.indexOf(target);
    if (targetIndex >= 0 && targetIndex + 1 < children.length) {
      return children[targetIndex + 1]!;
    }
    return null;
  }

  override previousChild(target: View): View | null {
    const children = this.children;
    const targetIndex = children.indexOf(target);
    if (targetIndex - 1 >= 0) {
      return children[targetIndex - 1]!;
    }
    return null;
  }

  override forEachChild<T>(callback: (child: View) => T | void): T | undefined;
  override forEachChild<T, S>(callback: (this: S, child: View) => T | void, thisArg: S): T | undefined;
  override forEachChild<T, S>(callback: (this: S | undefined, child: View) => T | void, thisArg?: S): T | undefined {
    let result: T | undefined;
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      result = callback.call(thisArg, child) as T | undefined;
      if (result !== void 0) {
        break;
      }
      if (children[i] === child) {
        i += 1;
      }
    }
    return result;
  }

  override getChild<F extends abstract new (...args: any[]) => View>(key: string, childBound: F): InstanceType<F> | null;
  override getChild(key: string, childBound?: abstract new (...args: any[]) => View): View | null;
  override getChild(key: string, childBound?: abstract new (...args: any[]) => View): View | null {
    const childMap = this.childMap;
    if (childMap !== null) {
      const child = childMap[key];
      if (child !== void 0 && (childBound === void 0 || child instanceof childBound)) {
        return child;
      }
    }
    return null;
  }

  override setChild<V extends View>(key: string, newChild: V): View | null;
  override setChild<F extends ViewCreator<F>>(key: string, factory: F): View | null;
  override setChild(key: string, newChild: AnyView | AnyNodeView | keyof HtmlViewTagMap | null): View | null;
  override setChild(key: string, newChild: AnyView | AnyNodeView | keyof HtmlViewTagMap | null): View | null {
    let newView: View | null;
    let newNode: Node | null;
    if (newChild === null) {
      newView = null;
      newNode = null;
    } else {
      if (typeof newChild === "string") {
        newView = HtmlView.fromTag(newChild);
      } else if (newChild instanceof Node) {
        newView = NodeView.fromNode(newChild);
      } else {
        newView = View.fromAny(newChild as AnyView);
      }
      if (newView instanceof NodeView) {
        newNode = newView.node;
      } else {
        newNode = null;
      }
    }
    const oldView = this.getChild(key);
    const oldNode = oldView !== null ? (oldView as NodeView).node : null;
    const children = this.children as View[];
    let index = -1;
    let targetView: View | null = null;
    let targetNode: Node | null = null;

    if (oldView !== null && newView !== null && oldView !== newView) { // replace
      newView.remove();
      index = children.indexOf(oldView);
      // assert(index >= 0);
      targetView = index + 1 < children.length ? children[index + 1]! : null;
      targetNode = targetView instanceof NodeView ? targetView.node : null;
      newView.setKey(oldView.key);
      this.willRemoveChild(oldView);
      this.willInsertChild(newView, targetView);
      oldView.detachParent(this);
      children[index] = newView;
      if (newNode !== null && oldView instanceof NodeView) {
        this.node.replaceChild(newNode, oldView.node);
      }
      this.replaceChildMap(newView, oldView);
      newView.attachParent(this);
      this.onRemoveChild(oldView);
      this.onInsertChild(newView, targetView);
      this.didRemoveChild(oldView);
      this.didInsertChild(newView, targetView);
      oldView.setKey(void 0);
      newView.cascadeInsert();
    } else if (newView !== oldView || newView !== null && newView.key !== key) {
      if (oldView !== null) { // remove
        this.willRemoveChild(oldView);
        oldView.detachParent(this);
        this.removeChildMap(oldView);
        if (oldNode !== null) {
          this.node.removeChild(oldNode);
        }
        index = children.indexOf(oldView);
        // assert(index >= 0);
        children.splice(index, 1);
        this.onRemoveChild(oldView);
        this.didRemoveChild(oldView);
        oldView.setKey(void 0);
        if (index < children.length) {
          targetView = children[index]!;
          targetNode = targetView instanceof NodeView ? targetView.node : null;
        }
      }
      if (newView !== null) { // insert
        newView.remove();
        newView.setKey(key);
        this.willInsertChild(newView, targetView);
        if (index >= 0) {
          children.splice(index, 0, newView);
        } else {
          children.push(newView);
        }
        if (newNode !== null) {
          this.node.insertBefore(newNode, targetNode);
        }
        this.insertChildMap(newView);
        newView.attachParent(this);
        this.onInsertChild(newView, targetView);
        this.didInsertChild(newView, targetView);
        newView.cascadeInsert();
      }
    }

    return oldView;
  }

  override appendChild<V extends View>(child: V, key?: string): V;
  override appendChild<F extends ViewCreator<F>>(factory: F, key?: string): InstanceType<F>;
  override appendChild<K extends keyof HtmlViewTagMap>(tag: K, key?: string): HtmlViewTagMap[K];
  override appendChild(child: AnyView | AnyNodeView | keyof HtmlViewTagMap, key?: string): View;
  override appendChild(child: AnyView | AnyNodeView | keyof HtmlViewTagMap, key?: string): View {
    let childView: View;
    let childNode: Node | null;
    if (typeof child === "string") {
      childView = HtmlView.fromTag(child);
      childNode = (childView as NodeView).node;
    } else if (child instanceof Node) {
      childView = NodeView.fromNode(child);
      childNode = child;
    } else {
      childView = View.fromAny(child as AnyView);
      if (childView instanceof NodeView) {
        childNode = childView.node;
      } else {
        childNode = null;
      }
    }

    childView.remove();
    if (key !== void 0) {
      this.removeChild(key);
      childView.setKey(key);
    }

    this.willInsertChild(childView, null);
    (this.children as View[]).push(childView);
    if (childNode !== null) {
      this.node.appendChild(childNode);
    }
    this.insertChildMap(childView);
    childView.attachParent(this);
    this.onInsertChild(childView, null);
    this.didInsertChild(childView, null);
    childView.cascadeInsert();

    return childView;
  }

  override prependChild<V extends View>(child: V, key?: string): V;
  override prependChild<F extends ViewCreator<F>>(factory: F, key?: string): InstanceType<F>;
  override prependChild<K extends keyof HtmlViewTagMap>(tag: K, key?: string): HtmlViewTagMap[K];
  override prependChild(child: AnyView | AnyNodeView | keyof HtmlViewTagMap, key?: string): View;
  override prependChild(child: AnyView | AnyNodeView | keyof HtmlViewTagMap, key?: string): View {
    let childView: View;
    let childNode: Node | null;
    if (typeof child === "string") {
      childView = HtmlView.fromTag(child);
      childNode = (childView as NodeView).node;
    } else if (child instanceof Node) {
      childView = NodeView.fromNode(child);
      childNode = child;
    } else {
      childView = View.fromAny(child as AnyView);
      if (childView instanceof NodeView) {
        childNode = childView.node;
      } else {
        childNode = null;
      }
    }

    childView.remove();
    if (key !== void 0) {
      this.removeChild(key);
      childView.setKey(key);
    }

    const children = this.children as View[];
    const targetView = children.length !== 0 ? children[0]! : null;
    const targetNode = this.node.firstChild;

    this.willInsertChild(childView, targetView);
    children.unshift(childView);
    if (childNode !== null) {
      this.node.insertBefore(childNode, targetNode);
    }
    this.insertChildMap(childView);
    childView.attachParent(this);
    this.onInsertChild(childView, targetView);
    this.didInsertChild(childView, targetView);
    childView.cascadeInsert();

    return childView;
  }

  override insertChild<V extends View>(child: V, target: View | Node | null, key?: string): V;
  override insertChild<F extends ViewCreator<F>>(factory: F, target: View | null, key?: string): InstanceType<F>;
  override insertChild<K extends keyof HtmlViewTagMap>(tag: K, target: View | Node | null, key?: string): HtmlViewTagMap[K];
  override insertChild(child: AnyView | AnyNodeView | keyof HtmlViewTagMap, target: View | Node | null, key?: string): View;
  override insertChild(child: AnyView | AnyNodeView | keyof HtmlViewTagMap, target: View | Node | null, key?: string): View {
    let targetView: View | null;
    let targetNode: Node | null;
    if (target === null) {
      targetView = null;
      targetNode = null;
    } else if (target instanceof View) {
      targetView = target;
      if (target instanceof NodeView) {
        targetNode = target.node;
      } else {
        targetNode = null;
      }
    } else if (target instanceof Node) {
      targetView = (target as ViewNode).view ?? null;
      targetNode = target;
    } else {
      throw new TypeError("" + target);
    }
    if (targetView !== null && targetView.parent !== this) {
      throw new TypeError("" + targetView);
    }

    let childView: View;
    let childNode: Node | null;
    if (typeof child === "string") {
      childView = HtmlView.fromTag(child);
      childNode = (childView as NodeView).node;
    } else if (child instanceof Node) {
      childView = NodeView.fromNode(child);
      childNode = child;
    } else {
      childView = View.fromAny(child as AnyView);
      if (childView instanceof NodeView) {
        childNode = childView.node;
      } else {
        childNode = null;
      }
    }

    childView.remove();
    if (key !== void 0) {
      this.removeChild(key);
      childView.setKey(key);
    }

    this.willInsertChild(childView, targetView);
    const children = this.children as View[];
    const index = targetView !== null ? children.indexOf(targetView) : -1;
    if (index >= 0) {
      children.splice(index, 0, childView);
    } else {
      children.push(childView);
    }
    if (childNode !== null) {
      this.node.insertBefore(childNode, targetNode);
    }
    this.insertChildMap(childView);
    childView.attachParent(this);
    this.onInsertChild(childView, targetView);
    this.didInsertChild(childView, targetView);
    childView.cascadeInsert();

    return childView;
  }

  override replaceChild<V extends View>(newChild: View, oldChild: V): V;
  override replaceChild<V extends View>(newChild: AnyView | AnyNodeView | keyof HtmlViewTagMap, oldChild: V): V;
  override replaceChild(newChild: AnyView | AnyNodeView | keyof HtmlViewTagMap, oldChild: View): View {
    const children = this.children as View[];
    if (oldChild.parent !== this) {
      throw new TypeError("" + oldChild);
    }

    let newView: View;
    let newNode: Node | null;
    if (typeof newChild === "string") {
      newView = HtmlView.fromTag(newChild);
      newNode = (newView as NodeView).node;
    } else if (newChild instanceof Node) {
      newView = NodeView.fromNode(newChild);
      newNode = newChild;
    } else {
      newView = View.fromAny(newChild as AnyView);
      if (newView instanceof NodeView) {
        newNode = newView.node;
      } else {
        newNode = null;
      }
    }

    if (newView !== oldChild) {
      newView.remove();

      const index = children.indexOf(oldChild);
      // assert(index >= 0);
      const targetView = index + 1 < children.length ? children[index + 1]! : null;
      newView.setKey(oldChild.key);
      this.willRemoveChild(oldChild);
      this.willInsertChild(newView, targetView);
      oldChild.detachParent(this);
      children[index] = newView;
      if (newNode !== null && oldChild instanceof NodeView) {
        this.node.replaceChild(newNode, oldChild.node);
      }
      this.replaceChildMap(newView, oldChild);
      newView.attachParent(this);
      this.onRemoveChild(oldChild);
      this.onInsertChild(newView, targetView);
      this.didRemoveChild(oldChild);
      this.didInsertChild(newView, targetView);
      oldChild.setKey(void 0);
      newView.cascadeInsert();
    }

    return oldChild;
  }

  override removeChild(key: string): View | null;
  override removeChild<V extends View>(child: V): V;
  override removeChild(child: Node): View;
  override removeChild(child: string | View | Node): View | null {
    let childView: View | null;
    let childNode: Node | null;
    if (typeof child === "string") {
      childView = this.getChild(child);
      if (childView === null) {
        return null;
      } else if (childView instanceof NodeView) {
        childNode = childView.node;
      } else {
        childNode = null;
      }
    } else {
      if (child instanceof View) {
        childView = child;
        if (child instanceof NodeView) {
          childNode = child.node;
        } else {
          childNode = null;
        }
      } else {
        childView = (child as ViewNode).view as NodeView;
        childNode = child;
        if (!(childView instanceof NodeView)) {
          throw new Error("not a child view");
        }
      }
      if (childView.parent !== this) {
        throw new Error("not a child view");
      }
    }

    this.willRemoveChild(childView);
    childView.detachParent(this);
    this.removeChildMap(childView);
    if (childNode !== null) {
      this.node.removeChild(childNode);
    }
    const children = this.children as View[];
    const index = children.indexOf(childView);
    // assert(index >= 0);
    children.splice(index, 1);
    this.onRemoveChild(childView);
    this.didRemoveChild(childView);
    childView.setKey(void 0);

    return childView;
  }

  override removeChildren(): void {
    const children = this.children as View[];
    let childCount: number;
    while (childCount = children.length, childCount !== 0) {
      const child: View = children[childCount - 1]!;
      this.willRemoveChild(child);
      child.detachParent(this);
      this.removeChildMap(child);
      if (child instanceof NodeView) {
        this.node.removeChild(child.node);
      }
      children.pop();
      this.onRemoveChild(child);
      this.didRemoveChild(child);
      child.setKey(void 0);
    }
  }

  protected override onMount(): void {
    super.onMount();
    this.attachEvents(this.eventNode);
  }

  /** @internal */
  protected override mountChildren(): void {
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      child.cascadeMount();
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }

  protected override onUnmount(): void {
    this.detachEvents(this.eventNode);
    super.onUnmount();
  }

  /** @internal */
  protected override unmountChildren(): void {
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      child.cascadeUnmount();
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }

  /** @internal */
  protected override cullChildren(): void {
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      child.cascadeCull();
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }

  /** @internal */
  protected override uncullChildren(): void {
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      child.cascadeUncull();
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }

  isHidden(): boolean {
    return (this.flags & View.HiddenFlag) !== 0
  }

  setHidden(newHidden: boolean): void {
    const oldHidden = (this.flags & View.HiddenFlag) !== 0;
    if (oldHidden !== newHidden) {
      this.willSetHidden(newHidden);
      if (newHidden) {
        this.setFlags(this.flags | View.HiddenFlag);
      } else {
        this.setFlags(this.flags & ~View.HiddenFlag);
      }
      this.onSetHidden(newHidden);
      this.didSetHidden(newHidden);
    }
  }

  protected willSetHidden(hidden: boolean): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length ; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetHidden !== void 0) {
        observer.viewWillSetHidden(hidden, this);
      }
    }
  }

  protected onSetHidden(hidden: boolean): void {
    if (!hidden) {
      this.requireUpdate(View.NeedsRender | View.NeedsComposite);
    }
  }

  protected didSetHidden(hidden: boolean): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetHidden !== void 0) {
        observer.viewDidSetHidden(hidden, this);
      }
    }
  }

  protected override needsUpdate(updateFlags: ViewFlags, immediate: boolean): ViewFlags {
    updateFlags = super.needsUpdate(updateFlags, immediate);
    updateFlags |= View.NeedsRender | View.NeedsComposite;
    this.setFlags(this.flags | (View.NeedsRender | View.NeedsComposite));
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

  protected override processChildren(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                                     processChild: (this: this, child: View, processFlags: ViewFlags,
                                                    viewContext: ViewContextType<this>) => void): void {
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      processChild.call(this, child, processFlags, viewContext);
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }

  override cascadeDisplay(displayFlags: ViewFlags, baseViewContext: ViewContext): void {
    const viewContext = this.extendViewContext(baseViewContext);
    const outerViewContext = ViewContext.current;
    try {
      ViewContext.current = viewContext;
      displayFlags &= ~View.NeedsDisplay;
      displayFlags |= this.flags & View.UpdateMask;
      displayFlags = this.needsDisplay(displayFlags, viewContext);
      if ((displayFlags & View.DisplayMask) !== 0) {
        let cascadeFlags = displayFlags;
        this.setFlags(this.flags & ~View.NeedsDisplay | (View.TraversingFlag | View.DisplayingFlag | View.ContextualFlag));
        this.willDisplay(cascadeFlags, viewContext);
        if (((this.flags | displayFlags) & View.NeedsLayout) !== 0) {
          cascadeFlags |= View.NeedsLayout;
          this.setFlags(this.flags & ~View.NeedsLayout);
          this.willLayout(viewContext);
        }
        if (((this.flags | displayFlags) & View.NeedsRender) !== 0) {
          cascadeFlags |= View.NeedsRender;
          this.setFlags(this.flags & ~View.NeedsRender);
          this.willRender(viewContext);
        }
        if (((this.flags | displayFlags) & View.NeedsRasterize) !== 0) {
          cascadeFlags |= View.NeedsRasterize;
          this.setFlags(this.flags & ~View.NeedsRasterize);
          this.willRasterize(viewContext);
        }
        if (((this.flags | displayFlags) & View.NeedsComposite) !== 0) {
          cascadeFlags |= View.NeedsComposite;
          this.setFlags(this.flags & ~View.NeedsComposite);
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

        if ((cascadeFlags & View.DisplayMask) !== 0 && !this.isHidden() && !this.culled) {
          this.setFlags(this.flags & ~View.ContextualFlag);
          this.displayChildren(cascadeFlags, viewContext, this.displayChild);
          this.setFlags(this.flags | View.ContextualFlag);
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
      }
    } finally {
      this.setFlags(this.flags & ~(View.TraversingFlag | View.DisplayingFlag | View.ContextualFlag));
      ViewContext.current = outerViewContext;
    }
  }

  protected override didDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    this.detectHitTargets();
    super.didDisplay(displayFlags, viewContext);
  }

  protected willRender(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewWillRenderObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewWillRender(viewContext, this);
      }
    }
  }

  protected onRender(viewContext: ViewContextType<this>): void {
    this.clearCanvas();
  }

  protected didRender(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewDidRenderObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewDidRender(viewContext, this);
      }
    }
  }

  protected willRasterize(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewWillRasterizeObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewWillRasterize(viewContext, this);
      }
    }
  }

  protected onRasterize(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didRasterize(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewDidRasterizeObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewDidRasterize(viewContext, this);
      }
    }
  }

  protected willComposite(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewWillCompositeObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewWillComposite(viewContext, this);
      }
    }
  }

  protected onComposite(viewContext: ViewContextType<this>): void {
    // hook
  }

  protected didComposite(viewContext: ViewContextType<this>): void {
    const observers = this.observerCache.viewDidCompositeObservers;
    if (observers !== void 0) {
      for (let i = 0; i < observers.length; i += 1) {
        const observer = observers[i]!;
        observer.viewDidComposite(viewContext, this);
      }
    }
  }

  protected override needsDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    displayFlags |= View.NeedsRender | View.NeedsComposite;
    return displayFlags;
  }

  protected override displayChildren(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                     displayChild: (this: this, child: View, displayFlags: ViewFlags,
                                                    viewContext: ViewContextType<this>) => void): void {
    const children = this.children;
    let i = 0;
    while (i < children.length) {
      const child = children[i]!;
      displayChild.call(this, child, displayFlags, viewContext);
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }

  @Provider({
    type: SpriteService,
    observes: false,
    service: SpriteService.global(),
  })
  readonly spriteProvider!: Provider<this, SpriteService>;

  get pixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  readonly renderer!: GraphicsRenderer | null;

  setRenderer(renderer: AnyGraphicsRenderer | null): void {
    if (typeof renderer === "string") {
      renderer = this.createRenderer(renderer as GraphicsRendererType);
    }
    (this as Mutable<this>).renderer = renderer;
    this.resetRenderer();
  }

  protected createRenderer(rendererType: GraphicsRendererType = "canvas"): GraphicsRenderer | null {
    if (rendererType === "canvas") {
      const context = this.node.getContext("2d");
      if (context !== null) {
        const pixelRatio = this.pixelRatio;
        const transform = Transform.affine(pixelRatio, 0, 0, pixelRatio, 0, 0);
        return new CanvasRenderer(context, transform, pixelRatio);
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

  /** @internal */
  readonly canvasFlags: number;

  /** @internal */
  setCanvasFlags(canvasFlags: number): void {
    (this as Mutable<this>).canvasFlags = canvasFlags;
  }

  override extendViewContext(viewContext: ViewContext): ViewContextType<this> {
    const canvasViewContext = Object.create(viewContext);
    canvasViewContext.viewFrame = this.viewFrame;
    canvasViewContext.renderer = this.renderer;
    return canvasViewContext;
  }

  /** @internal */
  readonly viewFrame: R2Box;

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
    if (!this.isHidden() && !this.culled && !this.intangible) {
      const hitBounds = this.hitBounds;
      if (hitBounds.contains(x, y)) {
        if (baseViewContext === void 0) {
          baseViewContext = this.superViewContext;
        }
        const viewContext = this.extendViewContext(baseViewContext);
        let hit = this.hitTestChildren(x, y, viewContext);
        if (hit === null) {
          const outerViewContext = ViewContext.current;
          try {
            ViewContext.current = viewContext;
            this.setFlags(this.flags | View.ContextualFlag);
            hit = this.hitTest(x, y, viewContext);
          } finally {
            this.setFlags(this.flags & ~View.ContextualFlag);
            ViewContext.current = outerViewContext;
          }
        }
        return hit;
      }
    }
    return null;
  }

  protected hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    return null;
  }

  protected hitTestChildren(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const children = this.children;
    for (let i = children.length - 1; i >= 0; i -= 1) {
      const child = children[i]!;
      if (child instanceof GraphicsView) {
        const hit = this.hitTestChild(child, x, y, viewContext);
        if (hit !== null) {
          return hit;
        }
      }
    }
    return null;
  }

  protected hitTestChild(childView: GraphicsView, x: number, y: number,
                         viewContext: ViewContextType<this>): GraphicsView | null {
    return childView.cascadeHitTest(x, y, viewContext);
  }

  /** @internal */
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

  readonly eventNode: HTMLElement;

  setEventNode(newEventNode: HTMLElement | null): void {
    if (newEventNode === null) {
      newEventNode = this.node;
    }
    const oldEventNode = this.eventNode;
    if (oldEventNode !== newEventNode) {
      this.detachEvents(oldEventNode);
      (this as Mutable<this>).eventNode = newEventNode;
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

  /** @internal */
  handleEvent(event: ViewEvent): void {
    // nop
  }

  /** @internal */
  bubbleEvent(event: ViewEvent): View | null {
    this.handleEvent(event);
    return this;
  }

  /** @internal */
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

  /** @internal */
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

  /** @internal */
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

  /** @internal */
  protected attachClickEvents(eventNode: HTMLElement): void {
    eventNode.addEventListener("click", this.onClick);
    eventNode.addEventListener("dblclick", this.onDblClick);
    eventNode.addEventListener("contextmenu", this.onContextMenu);
  }

  /** @internal */
  protected detachClickEvents(eventNode: HTMLElement): void {
    eventNode.removeEventListener("click", this.onClick);
    eventNode.removeEventListener("dblclick", this.onDblClick);
    eventNode.removeEventListener("contextmenu", this.onContextMenu);
  }

  /** @internal */
  protected attachWheelEvents(eventNode: HTMLElement): void {
    eventNode.addEventListener("wheel", this.onWheel);
  }

  /** @internal */
  protected detachWheelEvents(eventNode: HTMLElement): void {
    eventNode.removeEventListener("wheel", this.onWheel);
  }

  /** @internal */
  protected attachPassiveMouseEvents(eventNode: HTMLElement): void {
    eventNode.addEventListener("mouseenter", this.onMouseEnter);
    eventNode.addEventListener("mouseleave", this.onMouseLeave);
    eventNode.addEventListener("mousedown", this.onMouseDown);
  }

  /** @internal */
  protected detachPassiveMouseEvents(eventNode: HTMLElement): void {
    eventNode.removeEventListener("mouseenter", this.onMouseEnter);
    eventNode.removeEventListener("mouseleave", this.onMouseLeave);
    eventNode.removeEventListener("mousedown", this.onMouseDown);
  }

  /** @internal */
  protected attachActiveMouseEvents(eventNode: HTMLElement): void {
    document.body.addEventListener("mousemove", this.onMouseMove);
    document.body.addEventListener("mouseup", this.onMouseUp);
  }

  /** @internal */
  protected detachActiveMouseEvents(eventNode: HTMLElement): void {
    document.body.removeEventListener("mousemove", this.onMouseMove);
    document.body.removeEventListener("mouseup", this.onMouseUp);
  }

  /** @internal */
  readonly mouse: ViewMouseEventInit | null;

  /** @internal */
  protected updateMouse(mouse: ViewMouseEventInit, event: MouseEvent): void {
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

  /** @internal */
  protected fireMouseEvent(event: MouseEvent): GraphicsView | null {
    return this.fireEvent(event, event.clientX, event.clientY);
  }

  /** @internal */
  protected onClick(event: MouseEvent): void {
    const mouse = this.mouse;
    if (mouse !== null) {
      this.updateMouse(mouse, event);
    }
    this.fireMouseEvent(event);
  }

  /** @internal */
  protected onDblClick(event: MouseEvent): void {
    const mouse = this.mouse;
    if (mouse !== null) {
      this.updateMouse(mouse, event);
    }
    this.fireMouseEvent(event);
  }

  /** @internal */
  protected onContextMenu(event: MouseEvent): void {
    const mouse = this.mouse;
    if (mouse !== null) {
      this.updateMouse(mouse, event);
    }
    this.fireMouseEvent(event);
  }

  /** @internal */
  protected onWheel(event: WheelEvent): void {
    const mouse = this.mouse;
    if (mouse !== null) {
      this.updateMouse(mouse, event);
    }
    this.fireMouseEvent(event);
  }

  /** @internal */
  protected onMouseEnter(event: MouseEvent): void {
    let mouse = this.mouse;
    if (mouse === null) {
      this.attachActiveMouseEvents(this.eventNode);
      mouse = {};
      (this as Mutable<this>).mouse = mouse;
    }
    this.updateMouse(mouse, event);
  }

  /** @internal */
  protected onMouseLeave(event: MouseEvent): void {
    const mouse = this.mouse;
    if (mouse !== null) {
      (this as Mutable<this>).mouse = null;
      this.detachActiveMouseEvents(this.eventNode);
    }
  }

  /** @internal */
  protected onMouseDown(event: MouseEvent): void {
    let mouse = this.mouse;
    if (mouse === null) {
      this.attachActiveMouseEvents(this.eventNode);
      mouse = {};
      (this as Mutable<this>).mouse = mouse;
    }
    this.updateMouse(mouse, event);
    this.fireMouseEvent(event);
  }

  /** @internal */
  protected onMouseMove(event: MouseEvent): void {
    let mouse = this.mouse;
    if (mouse === null) {
      mouse = {};
      (this as Mutable<this>).mouse = mouse;
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

  /** @internal */
  protected onMouseUp(event: MouseEvent): void {
    const mouse = this.mouse;
    if (mouse !== null) {
      this.updateMouse(mouse, event);
    }
    this.fireMouseEvent(event);
  }

  /** @internal */
  protected onMouseTargetChange(mouse: ViewMouseEventInit, newTargetView: GraphicsView | undefined,
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

  /** @internal */
  protected detectMouseTarget(mouse: ViewMouseEventInit, clientBounds: R2Box): void {
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

  /** @internal */
  protected attachPassivePointerEvents(eventNode: HTMLElement): void {
    eventNode.addEventListener("pointerenter", this.onPointerEnter);
    eventNode.addEventListener("pointerleave", this.onPointerLeave);
    eventNode.addEventListener("pointerdown", this.onPointerDown);
  }

  /** @internal */
  protected detachPassivePointerEvents(eventNode: HTMLElement): void {
    eventNode.removeEventListener("pointerenter", this.onPointerEnter);
    eventNode.removeEventListener("pointerleave", this.onPointerLeave);
    eventNode.removeEventListener("pointerdown", this.onPointerDown);
  }

  /** @internal */
  protected attachActivePointerEvents(eventNode: HTMLElement): void {
    document.body.addEventListener("pointermove", this.onPointerMove);
    document.body.addEventListener("pointerup", this.onPointerUp);
    document.body.addEventListener("pointercancel", this.onPointerCancel);
  }

  /** @internal */
  protected detachActivePointerEvents(eventNode: HTMLElement): void {
    document.body.removeEventListener("pointermove", this.onPointerMove);
    document.body.removeEventListener("pointerup", this.onPointerUp);
    document.body.removeEventListener("pointercancel", this.onPointerCancel);
  }

  /** @internal */
  readonly pointers: {[id: string]: ViewPointerEventInit | undefined} | null;

  /** @internal */
  protected updatePointer(pointer: ViewPointerEventInit, event: PointerEvent): void {
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

  /** @internal */
  protected firePointerEvent(event: PointerEvent): GraphicsView | null {
    return this.fireEvent(event, event.clientX, event.clientY);
  }

  /** @internal */
  protected onPointerEnter(event: PointerEvent): void {
    const id = "" + event.pointerId;
    let pointers = this.pointers;
    if (pointers === null) {
      pointers = {};
      (this as Mutable<this>).pointers = pointers;
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

  /** @internal */
  protected onPointerLeave(event: PointerEvent): void {
    const id = "" + event.pointerId;
    let pointers = this.pointers;
    if (pointers === null) {
      pointers = {};
      (this as Mutable<this>).pointers = pointers;
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

  /** @internal */
  protected onPointerDown(event: PointerEvent): void {
    const id = "" + event.pointerId;
    let pointers = this.pointers;
    if (pointers === null) {
      pointers = {};
      (this as Mutable<this>).pointers = pointers;
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

  /** @internal */
  protected onPointerMove(event: PointerEvent): void {
    const id = "" + event.pointerId;
    let pointers = this.pointers;
    if (pointers === null) {
      pointers = {};
      (this as Mutable<this>).pointers = pointers;
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

  /** @internal */
  protected onPointerUp(event: PointerEvent): void {
    const id = "" + event.pointerId;
    let pointers = this.pointers;
    if (pointers === null) {
      pointers = {};
      (this as Mutable<this>).pointers = pointers;
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

  /** @internal */
  protected onPointerCancel(event: PointerEvent): void {
    const id = "" + event.pointerId;
    let pointers = this.pointers;
    if (pointers === null) {
      pointers = {};
      (this as Mutable<this>).pointers = pointers;
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

  /** @internal */
  protected onPointerTargetChange(pointer: ViewPointerEventInit, newTargetView: GraphicsView | undefined,
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

  /** @internal */
  protected detectPointerTarget(pointer: ViewPointerEventInit, clientBounds: R2Box): void {
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

  /** @internal */
  protected attachPassiveTouchEvents(eventNode: HTMLElement): void {
    eventNode.addEventListener("touchstart", this.onTouchStart);
  }

  /** @internal */
  protected detachPassiveTouchEvents(eventNode: HTMLElement): void {
    eventNode.removeEventListener("touchstart", this.onTouchStart);
  }

  /** @internal */
  protected attachActiveTouchEvents(eventNode: HTMLElement): void {
    eventNode.addEventListener("touchmove", this.onTouchMove);
    eventNode.addEventListener("touchend", this.onTouchEnd);
    eventNode.addEventListener("touchcancel", this.onTouchCancel);
  }

  /** @internal */
  protected detachActiveTouchEvents(eventNode: HTMLElement): void {
    eventNode.removeEventListener("touchmove", this.onTouchMove);
    eventNode.removeEventListener("touchend", this.onTouchEnd);
    eventNode.removeEventListener("touchcancel", this.onTouchCancel);
  }

  /** @internal */
  readonly touches: {[id: string]: ViewTouchInit | undefined} | null;

  /** @internal */
  protected updateTouch(touch: ViewTouchInit, event: Touch): void {
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

  /** @internal */
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

  /** @internal */
  protected onTouchStart(event: TouchEvent): void {
    let clientBounds: R2Box | undefined;
    let touches = this.touches;
    if (touches === null) {
      touches = {};
      (this as Mutable<this>).touches = touches;
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

  /** @internal */
  protected onTouchMove(event: TouchEvent): void {
    let touches = this.touches;
    if (touches === null) {
      touches = {};
      (this as Mutable<this>).touches = touches;
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

  /** @internal */
  protected onTouchEnd(event: TouchEvent): void {
    let touches = this.touches;
    if (touches === null) {
      touches = {};
      (this as Mutable<this>).touches = touches;
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

  /** @internal */
  protected onTouchCancel(event: TouchEvent): void {
    let touches = this.touches;
    if (touches === null) {
      touches = {};
      (this as Mutable<this>).touches = touches;
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
    (this as Mutable<this>).viewFrame = new R2Box(0, 0, width, height);
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

  protected override onObserve(observer: ObserverType<this>): void {
    super.onObserve(observer);
    if (observer.viewWillRender !== void 0) {
      this.observerCache.viewWillRenderObservers = Arrays.inserted(observer as ViewWillRender, this.observerCache.viewWillRenderObservers);
    }
    if (observer.viewDidRender !== void 0) {
      this.observerCache.viewDidRenderObservers = Arrays.inserted(observer as ViewDidRender, this.observerCache.viewDidRenderObservers);
    }
    if (observer.viewWillRasterize !== void 0) {
      this.observerCache.viewWillRasterizeObservers = Arrays.inserted(observer as ViewWillRasterize, this.observerCache.viewWillRasterizeObservers);
    }
    if (observer.viewDidRasterize !== void 0) {
      this.observerCache.viewDidRasterizeObservers = Arrays.inserted(observer as ViewDidRasterize, this.observerCache.viewDidRasterizeObservers);
    }
    if (observer.viewWillComposite !== void 0) {
      this.observerCache.viewWillCompositeObservers = Arrays.inserted(observer as ViewWillComposite, this.observerCache.viewWillCompositeObservers);
    }
    if (observer.viewDidComposite !== void 0) {
      this.observerCache.viewDidCompositeObservers = Arrays.inserted(observer as ViewDidComposite, this.observerCache.viewDidCompositeObservers);
    }
  }

  protected override onUnobserve(observer: ObserverType<this>): void {
    super.onUnobserve(observer);
    if (observer.viewWillRender !== void 0) {
      this.observerCache.viewWillRenderObservers = Arrays.removed(observer as ViewWillRender, this.observerCache.viewWillRenderObservers);
    }
    if (observer.viewDidRender !== void 0) {
      this.observerCache.viewDidRenderObservers = Arrays.removed(observer as ViewDidRender, this.observerCache.viewDidRenderObservers);
    }
    if (observer.viewWillRasterize !== void 0) {
      this.observerCache.viewWillRasterizeObservers = Arrays.removed(observer as ViewWillRasterize, this.observerCache.viewWillRasterizeObservers);
    }
    if (observer.viewDidRasterize !== void 0) {
      this.observerCache.viewDidRasterizeObservers = Arrays.removed(observer as ViewDidRasterize, this.observerCache.viewDidRasterizeObservers);
    }
    if (observer.viewWillComposite !== void 0) {
      this.observerCache.viewWillCompositeObservers = Arrays.removed(observer as ViewWillComposite, this.observerCache.viewWillCompositeObservers);
    }
    if (observer.viewDidComposite !== void 0) {
      this.observerCache.viewDidCompositeObservers = Arrays.removed(observer as ViewDidComposite, this.observerCache.viewDidCompositeObservers);
    }
  }

  override init(init: CanvasViewInit): void {
    super.init(init);
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

  /** @internal */
  static override readonly tag: string = "canvas";

  /** @internal */
  static readonly ClickEventsFlag: CanvasFlags = 1 << 0;
  /** @internal */
  static readonly WheelEventsFlag: CanvasFlags = 1 << 1;
  /** @internal */
  static readonly MouseEventsFlag: CanvasFlags = 1 << 2;
  /** @internal */
  static readonly PointerEventsFlag: CanvasFlags = 1 << 3;
  /** @internal */
  static readonly TouchEventsFlag: CanvasFlags = 1 << 4;
  /** @internal */
  static readonly EventsMask: CanvasFlags = CanvasView.ClickEventsFlag
                                          | CanvasView.WheelEventsFlag
                                          | CanvasView.MouseEventsFlag
                                          | CanvasView.PointerEventsFlag
                                          | CanvasView.TouchEventsFlag;

  static override readonly UncullFlags: ViewFlags = HtmlView.UncullFlags | View.NeedsRender | View.NeedsComposite;
}
