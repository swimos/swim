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

import {Mutable, Class, Creatable, Dictionary, MutableDictionary} from "@swim/util";
import {R2Box, Transform} from "@swim/math";
import {
  ViewContextType,
  ViewContext,
  ViewFlags,
  AnyView,
  ViewInit,
  ViewFactory,
  ViewClass,
  ViewCreator,
  View,
  ModalService,
} from "@swim/view";
import type {NodeViewObserver} from "./NodeViewObserver";
import type {DomProvider} from "../service/DomProvider";
import {TextView} from "../"; // forward import
import {ViewElement, ElementView} from "../"; // forward import

export type ViewNodeType<V extends NodeView> =
  V extends {readonly node: infer N} ? N : never;

export interface ViewNode extends Node {
  view?: NodeView;
}

export type AnyNodeView<V extends NodeView = NodeView> = AnyView<V> | ViewNodeType<V>;

export interface NodeViewInit extends ViewInit {
  text?: string;
}

export interface NodeViewFactory<V extends NodeView = NodeView, U = AnyNodeView<V>> extends ViewFactory<V, U> {
  fromNode(node: ViewNodeType<V>): V
}

export interface NodeViewClass<V extends NodeView = NodeView, U = AnyNodeView<V>> extends ViewClass<V, U>, NodeViewFactory<V, U> {
}

export interface NodeViewConstructor<V extends NodeView = NodeView, U = AnyNodeView<V>> extends NodeViewClass<V, U> {
  new(node: ViewNodeType<V>): V;
}

export class NodeView extends View {
  constructor(node: Node) {
    super();
    this.node = node;
    this.childMap = null;
    (node as ViewNode).view = this;
  }

  override readonly observerType?: Class<NodeViewObserver>;

  readonly node: Node;

  override get parent(): View | null {
    const parentNode: ViewNode | null = this.node.parentNode;
    if (parentNode !== null) {
      const parentView = parentNode.view;
      if (parentView !== void 0) {
        return parentView;
      }
    }
    return null;
  }

  override get childCount(): number {
    let childCount = 0;
    const childNodes: NodeListOf<ViewNode> = this.node.childNodes;
    for (let i = 0, n = childNodes.length; i < n; i += 1) {
      const childView = childNodes[i]!.view;
      if (childView !== void 0) {
        childCount += 1;
      }
    }
    return childCount;
  }

  override get children(): ReadonlyArray<View> {
    const childNodes: NodeListOf<ViewNode> = this.node.childNodes;
    const children: View[] = [];
    for (let i = 0, n = childNodes.length; i < n; i += 1) {
      const childView = childNodes[i]!.view;
      if (childView !== void 0) {
        children.push(childView);
      }
    }
    return children;
  }

  override firstChild(): View | null {
    const childNodes: NodeListOf<ViewNode> = this.node.childNodes;
    for (let i = 0, n = childNodes.length; i < n; i += 1) {
      const childView = childNodes[i]!.view;
      if (childView !== void 0) {
        return childView;
      }
    }
    return null;
  }

  override lastChild(): View | null {
    const childNodes: NodeListOf<ViewNode> = this.node.childNodes;
    for (let i = childNodes.length - 1; i >= 0; i -= 1) {
      const childView = childNodes[i]!.view;
      if (childView !== void 0) {
        return childView;
      }
    }
    return null;
  }

  override nextChild(targetView: View): View | null {
    if (targetView instanceof NodeView && targetView.parent === this) {
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
    }
    return null;
  }

  override previousChild(targetView: View): View | null {
    if (targetView instanceof NodeView && targetView.parent === this) {
      let targetNode: ViewNode | null = targetView.node;
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

  override forEachChild<T>(callback: (child: View) => T | void): T | undefined;
  override forEachChild<T, S>(callback: (this: S, child: View) => T | void, thisArg: S): T | undefined;
  override forEachChild<T, S>(callback: (this: S | undefined, child: View) => T | void, thisArg?: S): T | undefined {
    let result: T | undefined;
    const childNodes: NodeListOf<ViewNode> = this.node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childNode = childNodes[i]!;
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
    return result;
  }

  /** @internal */
  readonly childMap: Dictionary<View> | null;

  /** @internal */
  protected insertChildMap(child: View): void {
    const key = child.key;
    if (key !== void 0) {
      let childMap = this.childMap as MutableDictionary<View>;
      if (childMap === null) {
        childMap = {};
        (this as Mutable<this>).childMap = childMap;
      }
      childMap[key] = child;
    }
  }

  /** @internal */
  protected removeChildMap(child: View): void {
    const key = child.key;
    if (key !== void 0) {
      const childMap = this.childMap as MutableDictionary<View>;
      if (childMap !== null) {
        delete childMap[key];
      }
    }
  }

  /** @internal */
  protected replaceChildMap(newChild: View, oldChild: View): void {
    const key = oldChild.key;
    if (key !== void 0) {
      let childMap = this.childMap as MutableDictionary<View>;
      if (childMap === null) {
        childMap = {};
        (this as Mutable<this>).childMap = childMap;
      }
      childMap[key] = newChild;
    }
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

  override setChild<V extends NodeView>(key: string, newChild: V): View | null;
  override setChild<F extends ViewCreator<F, NodeView>>(key: string, factory: F): View | null;
  override setChild(key: string, newChild: AnyNodeView | null): View | null;
  override setChild(key: string, newChild: AnyNodeView | null): View | null {
    let newView: NodeView | null;
    let newNode: Node | null;
    if (newChild === null) {
      newView = null;
      newNode = null;
    } else {
      newView = NodeView.fromAny(newChild);
      newNode = newView.node;
    }
    const oldView = this.getChild(key);
    const oldNode = oldView !== null ? (oldView as NodeView).node : null;
    let targetView: View | null = null;
    let targetNode: Node | null = null;

    if (oldView !== null && newView !== null && oldView !== newView) { // replace
      newView.remove();
      targetNode = oldNode!.nextSibling;
      targetView = targetNode !== null ? (targetNode as ViewNode).view ?? null : null;
      newView.setKey(oldView.key);
      this.willRemoveChild(oldView);
      this.willInsertChild(newView, targetView);
      oldView.detachParent(this);
      this.node.replaceChild(newNode!, oldNode!);
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
        targetNode = oldNode!.nextSibling;
        targetView = targetNode !== null ? (targetNode as ViewNode).view ?? null : null;
        this.willRemoveChild(oldView);
        oldView.detachParent(this);
        this.removeChildMap(oldView);
        this.node.removeChild(oldNode!);
        this.onRemoveChild(oldView);
        this.didRemoveChild(oldView);
        oldView.setKey(void 0);
      }
      if (newView !== null) { // insert
        newView.remove();
        newView.setKey(key);
        this.willInsertChild(newView, null);
        this.node.appendChild(newNode!);
        this.insertChildMap(newView);
        newView.attachParent(this);
        this.onInsertChild(newView, null);
        this.didInsertChild(newView, null);
        newView.cascadeInsert();
      }
    }

    return oldView;
  }

  override appendChild<V extends NodeView>(child: V, key?: string): V;
  override appendChild<F extends ViewCreator<F, NodeView>>(factory: F, key?: string): InstanceType<F>;
  override appendChild(child: AnyNodeView, key?: string): NodeView;
  override appendChild(child: AnyNodeView, key?: string): NodeView {
    const childView = NodeView.fromAny(child);
    const childNode = childView.node;

    childView.remove();
    if (key !== void 0) {
      this.removeChild(key);
      childView.setKey(key);
    }

    this.willInsertChild(childView, null);
    this.node.appendChild(childNode);
    this.insertChildMap(childView);
    childView.attachParent(this);
    this.onInsertChild(childView, null);
    this.didInsertChild(childView, null);
    childView.cascadeInsert();

    return childView;
  }

  override prependChild<V extends NodeView>(child: V, key?: string): V;
  override prependChild<F extends ViewCreator<F, NodeView>>(factory: F, key?: string): InstanceType<F>;
  override prependChild(child: AnyNodeView, key?: string): NodeView;
  override prependChild(child: AnyNodeView, key?: string): NodeView {
    const childView = NodeView.fromAny(child);
    const childNode = childView.node;

    childView.remove();
    if (key !== void 0) {
      this.removeChild(key);
      childView.setKey(key);
    }

    let targetView: View | null | undefined = null;
    const targetNode = this.node.firstChild as ViewNode | null;
    if (targetNode !== null) {
      targetView = targetNode.view;
      if (targetView === void 0) {
        targetView = null;
      }
    }

    this.willInsertChild(childView, targetView);
    this.node.insertBefore(childNode, targetNode);
    this.insertChildMap(childView);
    childView.attachParent(this);
    this.onInsertChild(childView, targetView);
    this.didInsertChild(childView, targetView);
    childView.cascadeInsert();

    return childView;
  }

  override insertChild<V extends NodeView>(child: V, target: View | Node | null, key?: string): V;
  override insertChild<F extends ViewCreator<F, NodeView>>(factory: F, target: View | null, key?: string): InstanceType<F>;
  override insertChild(child: AnyNodeView, target: View | Node | null, key?: string): NodeView;
  override insertChild(child: AnyNodeView, target: View | Node | null, key?: string): NodeView {
    let targetView: NodeView | null;
    let targetNode: Node | null;
    if (target === null) {
      targetView = null;
      targetNode = null;
    } else if (target instanceof NodeView) {
      targetView = target;
      targetNode = target.node;
    } else if (target instanceof Node) {
      targetView = (target as ViewNode).view ?? null;
      targetNode = target;
    } else {
      throw new TypeError("" + target);
    }
    if (targetNode !== null && targetNode.parentNode !== this.node) {
      throw new TypeError("" + targetNode);
    }

    const childView = NodeView.fromAny(child);
    const childNode = childView.node;

    childView.remove();
    if (key !== void 0) {
      this.removeChild(key);
      childView.setKey(key);
    }

    this.willInsertChild(childView, targetView);
    this.node.insertBefore(childNode, targetNode);
    this.insertChildMap(childView);
    childView.attachParent(this);
    this.onInsertChild(childView, targetView);
    this.didInsertChild(childView, targetView);
    childView.cascadeInsert();

    return childView;
  }

  override replaceChild<V extends NodeView>(newChild: NodeView, oldChild: V): V;
  override replaceChild<V extends NodeView>(newChild: AnyNodeView, oldChild: V): V;
  override replaceChild(newChild: AnyNodeView, oldChild: NodeView): NodeView {
    const oldNode = oldChild.node;
    if (oldNode.parentNode !== this.node) {
      throw new TypeError("" + oldChild);
    }

    newChild = NodeView.fromAny(newChild);
    const newNode = newChild.node;
    if (newChild !== oldChild) {
      newChild.remove();
      const targetNode = oldNode.nextSibling;
      const targetView = targetNode !== null ? (targetNode as ViewNode).view ?? null : null;
      newChild.setKey(oldChild.key);
      this.willRemoveChild(oldChild);
      this.willInsertChild(newChild, targetView);
      oldChild.detachParent(this);
      this.node.replaceChild(newNode, oldNode);
      this.replaceChildMap(newChild, oldChild);
      newChild.attachParent(this);
      this.onRemoveChild(oldChild);
      this.onInsertChild(newChild, targetView);
      this.didRemoveChild(oldChild);
      this.didInsertChild(newChild, targetView);
      oldChild.setKey(void 0);
      newChild.cascadeInsert();
    }

    return oldChild;
  }

  /** @internal */
  injectChild(child: View | Node, target: View | Node | null, key?: string): void {
    let targetView: NodeView | null;
    let targetNode: Node | null;
    if (target === null) {
      targetView = null;
      targetNode = null;
    } else if (target instanceof NodeView) {
      targetView = target;
      targetNode = target.node;
    } else if (target instanceof Node) {
      targetView = null;
      targetNode = target;
    } else {
      throw new TypeError("" + target);
    }
    if (targetNode !== null && targetNode.parentNode !== this.node) {
      throw new TypeError("" + targetNode);
    }

    let childView: NodeView;
    if (child instanceof NodeView) {
      childView = child;
    } else if (child instanceof Node) {
      childView = NodeView.fromNode(child);
    } else {
      throw new TypeError("" + child);
    }

    if (key !== void 0) {
      this.removeChild(key);
      childView.setKey(key);
    }

    this.willInsertChild(childView, targetView);
    this.insertChildMap(childView);
    childView.attachParent(this);
    this.onInsertChild(childView, targetView);
    this.didInsertChild(childView, targetView);
    childView.cascadeInsert();
  }

  override removeChild(key: string): View | null;
  override removeChild<V extends View>(child: V): V;
  override removeChild(child: Node): View;
  override removeChild(child: string | View | Node): View | null {
    let childView: View | null;
    let childNode: Node;
    if (typeof child === "string") {
      childView = this.getChild(child);
      if (childView === null) {
        return null;
      }
      childNode = (childView as NodeView).node;
    } else {
      if (child instanceof View) {
        childView = child;
        childNode = (child as NodeView).node;
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
    this.node.removeChild(childNode);
    this.onRemoveChild(childView);
    this.didRemoveChild(childView);
    childView.setKey(void 0);

    return childView;
  }

  override removeChildren(): void {
    let childNode: ViewNode | null;
    while (childNode = this.node.lastChild, childNode !== null) {
      const childView = childNode.view;
      if (childView !== void 0) {
        this.willRemoveChild(childView);
        childView.detachParent(this);
        this.removeChildMap(childView);
      }
      this.node.removeChild(childNode);
      if (childView !== void 0) {
        this.onRemoveChild(childView);
        this.didRemoveChild(childView);
        childView.setKey(void 0);
      }
    }
  }

  override remove(): void {
    const node = this.node;
    const parentNode: ViewNode | null = node.parentNode;
    if (parentNode !== null) {
      const parentView = parentNode.view;
      if (parentView !== void 0) {
        if (!this.traversing) {
          parentView.removeChild(this);
        } else {
          this.setFlags(this.flags | View.RemovingFlag);
        }
      } else {
        parentNode.removeChild(node);
        this.detachParent(this);
        this.setKey(void 0);
      }
    }
  }

  /** @internal */
  static isRootView(node: Node): boolean {
    do {
      const parentNode: ViewNode | null = node.parentNode;
      if (parentNode !== null) {
        const parentView = parentNode.view;
        if (parentView !== void 0) {
          return false;
        }
        node = parentNode;
        continue;
      }
      break;
    } while (true);
    return true;
  }

  /** @internal */
  static isNodeMounted(node: Node): boolean {
    let isConnected: boolean | undefined = node.isConnected;
    if (typeof isConnected !== "boolean") {
      const ownerDocument = node.ownerDocument;
      if (ownerDocument !== null) {
        const position = ownerDocument.compareDocumentPosition(node);
        isConnected = (position & node.DOCUMENT_POSITION_DISCONNECTED) === 0;
      } else {
        isConnected = false;
      }
    }
    return isConnected;
  }

  /** @internal */
  static mount(view: NodeView): void {
    const parentView = view.parent;
    if (parentView !== null) {
      view.attachParent(parentView);
      view.cascadeInsert();
    } else {
      view.mount();
    }
  }

  /** @internal */
  mount(): void {
    if (!this.mounted && NodeView.isNodeMounted(this.node) && NodeView.isRootView(this.node)) {
      this.cascadeMount();
      this.cascadeInsert();
    }
  }

  /** @internal */
  protected override mountChildren(): void {
    const childNodes: NodeListOf<ViewNode> = this.node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = childNodes[i]!.view;
      if (childView !== void 0) {
        childView.cascadeMount();
        if ((childView.flags & View.RemovingFlag) !== 0) {
          childView.setFlags(childView.flags & ~View.RemovingFlag);
          this.removeChild(childView);
          continue;
        }
      }
      i += 1;
    }
  }

  /** @internal */
  protected override unmountChildren(): void {
    const childNodes: NodeListOf<ViewNode> = this.node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = childNodes[i]!.view;
      if (childView !== void 0) {
        childView.cascadeUnmount();
        if ((childView.flags & View.RemovingFlag) !== 0) {
          childView.setFlags(childView.flags & ~View.RemovingFlag);
          this.removeChild(childView);
          continue;
        }
      }
      i += 1;
    }
  }

  /** @internal */
  protected override cullChildren(): void {
    const childNodes: NodeListOf<ViewNode> = this.node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = childNodes[i]!.view;
      if (childView !== void 0) {
        childView.cascadeCull();
        if ((childView.flags & View.RemovingFlag) !== 0) {
          childView.setFlags(childView.flags & ~View.RemovingFlag);
          this.removeChild(childView);
          continue;
        }
      }
      i += 1;
    }
  }

  /** @internal */
  protected override uncullChildren(): void {
    const childNodes: NodeListOf<ViewNode> = this.node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = childNodes[i]!.view;
      if (childView !== void 0) {
        childView.cascadeUncull();
        if ((childView.flags & View.RemovingFlag) !== 0) {
          childView.setFlags(childView.flags & ~View.RemovingFlag);
          this.removeChild(childView);
          continue;
        }
      }
      i += 1;
    }
  }

  override cascadeProcess(processFlags: ViewFlags, baseViewContext: ViewContext): void {
    const viewContext = this.extendViewContext(baseViewContext);
    const outerViewContext = ViewContext.current;
    try {
      ViewContext.current = viewContext;
      processFlags &= ~View.NeedsProcess;
      processFlags |= this.flags & View.UpdateMask;
      processFlags = this.needsProcess(processFlags, viewContext);
      if ((processFlags & View.ProcessMask) !== 0) {
        let cascadeFlags = processFlags;
        this.setFlags(this.flags & ~(View.NeedsProcess | View.NeedsProject) | (View.TraversingFlag | View.ProcessingFlag | View.ContextualFlag));
        this.willProcess(cascadeFlags, viewContext);
        if (((this.flags | processFlags) & View.NeedsResize) !== 0) {
          cascadeFlags |= View.NeedsResize;
          this.setFlags(this.flags & ~View.NeedsResize);
          this.willResize(viewContext);
        }
        if (((this.flags | processFlags) & View.NeedsScroll) !== 0) {
          cascadeFlags |= View.NeedsScroll;
          this.setFlags(this.flags & ~View.NeedsScroll);
          this.willScroll(viewContext);
        }
        if (((this.flags | processFlags) & View.NeedsChange) !== 0) {
          cascadeFlags |= View.NeedsChange;
          this.setFlags(this.flags & ~View.NeedsChange);
          this.willChange(viewContext);
        }
        if (((this.flags | processFlags) & View.NeedsAnimate) !== 0) {
          cascadeFlags |= View.NeedsAnimate;
          this.setFlags(this.flags & ~View.NeedsAnimate);
          this.willAnimate(viewContext);
        }

        this.onProcess(cascadeFlags, viewContext);
        if ((cascadeFlags & View.NeedsResize) !== 0) {
          this.onResize(viewContext);
        }
        if ((cascadeFlags & View.NeedsScroll) !== 0) {
          this.onScroll(viewContext);
        }
        if ((cascadeFlags & View.NeedsChange) !== 0) {
          this.onChange(viewContext);
        }
        if ((cascadeFlags & View.NeedsAnimate) !== 0) {
          this.onAnimate(viewContext);
        }

        if ((cascadeFlags & View.ProcessMask) !== 0) {
          this.setFlags(this.flags & ~View.ContextualFlag);
          this.processChildren(cascadeFlags, viewContext, this.processChild);
          this.setFlags(this.flags | View.ContextualFlag);
        }

        if ((cascadeFlags & View.NeedsAnimate) !== 0) {
          this.didAnimate(viewContext);
        }
        if ((cascadeFlags & View.NeedsChange) !== 0) {
          this.didChange(viewContext);
        }
        if ((cascadeFlags & View.NeedsScroll) !== 0) {
          this.didScroll(viewContext);
        }
        if ((cascadeFlags & View.NeedsResize) !== 0) {
          this.didResize(viewContext);
        }
        this.didProcess(cascadeFlags, viewContext);
      }
    } finally {
      this.setFlags(this.flags & ~(View.TraversingFlag | View.ProcessingFlag | View.ContextualFlag));
      ViewContext.current = outerViewContext;
    }
  }

  protected override processChildren(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                                     processChild: (this: this, childView: View, processFlags: ViewFlags,
                                                    viewContext: ViewContextType<this>) => void): void {
    const childNodes: NodeListOf<ViewNode> = this.node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = childNodes[i]!.view;
      if (childView !== void 0) {
        processChild.call(this, childView, processFlags, viewContext);
        if ((childView.flags & View.RemovingFlag) !== 0) {
          childView.setFlags(childView.flags & ~View.RemovingFlag);
          this.removeChild(childView);
          continue;
        }
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
        this.setFlags(this.flags & ~(View.NeedsDisplay | View.NeedsRender | View.NeedsRasterize | View.NeedsComposite) | (View.TraversingFlag | View.DisplayingFlag | View.ContextualFlag));
        this.willDisplay(cascadeFlags, viewContext);
        if (((this.flags | displayFlags) & View.NeedsLayout) !== 0) {
          cascadeFlags |= View.NeedsLayout;
          this.setFlags(this.flags & ~View.NeedsLayout);
          this.willLayout(viewContext);
        }

        this.onDisplay(cascadeFlags, viewContext);
        if ((cascadeFlags & View.NeedsLayout) !== 0) {
          this.onLayout(viewContext);
        }

        if ((cascadeFlags & View.DisplayMask) !== 0 && !this.culled) {
          this.setFlags(this.flags & ~View.ContextualFlag);
          this.displayChildren(cascadeFlags, viewContext, this.displayChild);
          this.setFlags(this.flags | View.ContextualFlag);
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

  protected override displayChildren(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                     displayChild: (this: this, childView: View, displayFlags: ViewFlags,
                                                    viewContext: ViewContextType<this>) => void): void {
    const childNodes: NodeListOf<ViewNode> = this.node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = childNodes[i]!.view;
      if (childView !== void 0) {
        displayChild.call(this, childView, displayFlags, viewContext);
        if ((childView.flags & View.RemovingFlag) !== 0) {
          childView.setFlags(childView.flags & ~View.RemovingFlag);
          this.removeChild(childView);
          continue;
        }
      }
      i += 1;
    }
  }

  declare readonly domProvider: DomProvider<this>; // defined by DomProvider

  text(): string | undefined;
  text(value: string | null | undefined): this;
  text(value?: string | null | undefined): string | undefined | this {
    if (arguments.length === 0) {
      value = this.node.textContent;
      if (value === null) {
        value = void 0;
      }
      return value;
    } else {
      if (value === void 0) {
        value = null;
      }
      this.node.textContent = value;
      return this;
    }
  }

  override get parentTransform(): Transform {
    return Transform.identity();
  }

  override get clientBounds(): R2Box {
    const range = document.createRange();
    range.selectNode(this.node);
    const bounds = range.getBoundingClientRect();
    range.detach();
    return new R2Box(bounds.left, bounds.top, bounds.right, bounds.bottom);
  }

  override get pageBounds(): R2Box {
    const range = document.createRange();
    range.selectNode(this.node);
    const bounds = range.getBoundingClientRect();
    range.detach();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;
    return new R2Box(bounds.left + scrollX, bounds.top + scrollY,
                     bounds.right + scrollX, bounds.bottom + scrollY);
  }

  override dispatchEvent(event: Event): boolean {
    return this.node.dispatchEvent(event);
  }

  override on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this {
    this.node.addEventListener(type, listener, options);
    return this;
  }

  override off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this {
    this.node.removeEventListener(type, listener, options);
    return this;
  }

  override init(init: NodeViewInit): void {
    super.init(init);
    if (init.text !== void 0) {
      this.text(init.text);
    }
  }

  static fromNode<S extends new (node: Node) => InstanceType<S>>(this: S, node: ViewNodeType<InstanceType<S>>): InstanceType<S>;
  static fromNode(node: Node): NodeView;
  static fromNode(node: Node): NodeView {
    let view = (node as ViewNode).view;
    if (view === void 0) {
      if (node instanceof Element) {
        view = ElementView.fromNode(node as ViewElement);
      } else if (node instanceof Text) {
        view = TextView.fromNode(node);
      } else {
        view = new this(node);
        this.mount(view);
      }
    } else if (!(view instanceof this)) {
      throw new TypeError(view + " not an instance of " + this);
    }
    return view;
  }

  static override fromAny<S extends abstract new (...args: any[]) => InstanceType<S>>(this: S, value: AnyNodeView<InstanceType<S>>): InstanceType<S>;
  static override fromAny(value: AnyNodeView): NodeView;
  static override fromAny(value: AnyNodeView): NodeView {
    if (value === void 0 || value === null) {
      return value;
    } else if (value instanceof View) {
      if (value instanceof this) {
        return value;
      } else {
        throw new TypeError(value + " not an instance of " + this);
      }
    } else if (value instanceof Node) {
      return this.fromNode(value);
    } else if (Creatable.is(value)) {
      return value.create();
    } else {
      return this.fromInit(value);
    }
  }
}

ModalService.insertModalView = function (modalView: NodeView): void {
  const matteNode = document.body as ViewNode;
  const matteView = matteNode.view;
  if (matteView !== void 0) {
    matteView.appendChild(modalView);
  } else if (modalView instanceof NodeView) {
    matteNode.appendChild(modalView.node);
    modalView.mount();
  } else {
    throw new TypeError("" + modalView);
  }
};
