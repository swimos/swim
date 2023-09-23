// Copyright 2015-2023 Nstream, inc.
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

import type {Class} from "@swim/util";
import type {Instance} from "@swim/util";
import type {LikeType} from "@swim/util";
import {Creatable} from "@swim/util";
import {R2Box} from "@swim/math";
import {Transform} from "@swim/math";
import type {ViewFactory} from "@swim/view";
import type {ViewClass} from "@swim/view";
import type {ViewObserver} from "@swim/view";
import {View} from "@swim/view";
import type {TextContext} from "./TextAnimator";
import {TextAnimator} from "./TextAnimator";
import {TextView} from "./"; // forward import
import {ElementView} from "./"; // forward import
import {HtmlView} from "./"; // forward import
import {SvgView} from "./"; // forward import

/** @public */
export interface NodeViewFactory<V extends NodeView = NodeView> extends ViewFactory<V> {
  fromNode(node: Node): V
}

/** @public */
export interface NodeViewClass<V extends NodeView = NodeView> extends ViewClass<V>, NodeViewFactory<V> {
}

/** @public */
export interface NodeViewConstructor<V extends NodeView = NodeView> extends NodeViewClass<V> {
  new(node: Node): V;
}

/** @public */
export interface NodeViewObserver<V extends NodeView = NodeView> extends ViewObserver<V> {
}

/** @public */
export class NodeView extends View implements TextContext {
  constructor(node: Node) {
    super();
    this.node = node;

    if (NodeView.nodeMap.has(node)) {
      throw new Error(node + " already has an associated view");
    }
    NodeView.nodeMap.set(node, this);
  }

  override likeType?(like: {create?(): View} | Node): void;

  declare readonly observerType?: Class<NodeViewObserver>;

  readonly node: Node;

  get textContent(): string | null | undefined {
    return this.node.textContent;
  }

  set textContent(textContent: string | null | undefined) {
    if (textContent === void 0) {
      textContent = null;
    }
    this.node.textContent = textContent;
  }

  @TextAnimator({})
  get text(): TextAnimator<this, any> {
    return TextAnimator.getter();
  }

  override setChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(key: string, newChildFactory: F): View | null;
  override setChild(key: string, newChild: View | LikeType<NodeView> | null): View | null;
  override setChild(key: string, newChild: View | LikeType<NodeView> | null): View | null {
    if (newChild instanceof Node) {
      newChild = NodeView.fromNode(newChild);
    } else if (newChild !== null) {
      newChild = View.fromLike(newChild);
    }
    const oldChild = this.getChild(key);
    let target: View | null;

    if (oldChild !== null && newChild !== null && oldChild !== newChild) { // replace
      newChild.remove();
      target = oldChild.nextSibling;

      if ((oldChild.flags & View.RemovingFlag) === 0) {
        oldChild.setFlags(oldChild.flags | View.RemovingFlag);
        this.willRemoveChild(oldChild);
        oldChild.detachParent(this);
        this.removeChildMap(oldChild);
        this.onRemoveChild(oldChild);
        this.didRemoveChild(oldChild);
        oldChild.setKey(void 0);
        oldChild.setFlags(oldChild.flags & ~View.RemovingFlag);
      }

      newChild.setFlags(newChild.flags | View.InsertingFlag);
      newChild.setKey(oldChild.key);
      this.willInsertChild(newChild, target);
      if (newChild instanceof NodeView) {
        if (oldChild instanceof NodeView) {
          this.node.replaceChild(newChild.node, oldChild.node);
        } else if (target !== null) {
          let targetNode: Node | null = null;
          let nextView: View | null = target;
          do {
            if (nextView instanceof NodeView) {
              targetNode = nextView.node;
              break;
            }
            nextView = nextView.nextSibling;
          } while (nextView !== null);
          this.node.insertBefore(newChild.node, targetNode);
        } else {
          this.node.appendChild(newChild.node);
        }
      } else if (oldChild instanceof NodeView) {
        this.node.removeChild(oldChild.node);
      }
      this.insertChildMap(newChild);
      newChild.attachParent(this, target);
      this.onInsertChild(newChild, target);
      this.didInsertChild(newChild, target);
      newChild.cascadeInsert();
      newChild.setFlags(newChild.flags & ~View.InsertingFlag);
    } else if (newChild !== oldChild || newChild !== null && newChild.key !== key) {
      if (oldChild !== null) { // remove
        target = oldChild.nextSibling;
        if ((oldChild.flags & View.RemovingFlag) === 0) {
          oldChild.setFlags(oldChild.flags | View.RemovingFlag);
          this.willRemoveChild(oldChild);
          oldChild.detachParent(this);
          this.removeChildMap(oldChild);
          if (oldChild instanceof NodeView) {
            this.node.removeChild(oldChild.node);
          }
          this.onRemoveChild(oldChild);
          this.didRemoveChild(oldChild);
          oldChild.setKey(void 0);
          oldChild.setFlags(oldChild.flags & ~View.RemovingFlag);
        }
      } else {
        target = null;
      }

      if (newChild !== null) { // insert
        newChild.remove();

        newChild.setFlags(newChild.flags | View.InsertingFlag);
        newChild.setKey(key);
        this.willInsertChild(newChild, target);
        if (newChild instanceof NodeView) {
          let targetNode: Node | null = null;
          if (target !== null) {
            let nextView: View | null = target;
            do {
              if (nextView instanceof NodeView) {
                targetNode = nextView.node;
                break;
              }
              nextView = nextView.nextSibling;
            } while (nextView !== null);
          }
          this.node.insertBefore(newChild.node, targetNode);
        }
        this.insertChildMap(newChild);
        newChild.attachParent(this, target);
        this.onInsertChild(newChild, target);
        this.didInsertChild(newChild, target);
        newChild.cascadeInsert();
        newChild.setFlags(newChild.flags & ~View.InsertingFlag);
      }
    }

    return oldChild;
  }

  override appendChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(childFactory: F, key?: string): InstanceType<F>;
  override appendChild<V extends View>(child: V | LikeType<V>, key?: string): V;
  override appendChild(child: View | LikeType<NodeView>, key?: string): View;
  override appendChild(child: View | LikeType<NodeView>, key?: string): View {
    if (child instanceof Node) {
      child = NodeView.fromNode(child);
    } else {
      child = View.fromLike(child);
    }

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
    }

    child.setFlags(child.flags | View.InsertingFlag);
    child.setKey(key);
    this.willInsertChild(child, null);
    if (child instanceof NodeView) {
      this.node.appendChild(child.node);
    }
    this.insertChildMap(child);
    child.attachParent(this, null);
    this.onInsertChild(child, null);
    this.didInsertChild(child, null);
    child.cascadeInsert();
    child.setFlags(child.flags & ~View.InsertingFlag);

    return child;
  }

  override prependChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(childFactory: F, key?: string): InstanceType<F>;
  override prependChild<V extends View>(child: V | LikeType<V>, key?: string): V;
  override prependChild(child: View | LikeType<NodeView>, key?: string): View;
  override prependChild(child: View | LikeType<NodeView>, key?: string): View {
    if (child instanceof Node) {
      child = NodeView.fromNode(child);
    } else {
      child = View.fromLike(child);
    }

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
    }
    const target = this.firstChild;

    child.setFlags(child.flags | View.InsertingFlag);
    child.setKey(key);
    this.willInsertChild(child, target);
    if (child instanceof NodeView) {
      this.node.insertBefore(child.node, this.node.firstChild);
    }
    this.insertChildMap(child);
    child.attachParent(this, target);
    this.onInsertChild(child, target);
    this.didInsertChild(child, target);
    child.cascadeInsert();
    child.setFlags(child.flags & ~View.InsertingFlag);

    return child;
  }

  override insertChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(childFactory: F, target: View | Node | null, key?: string): InstanceType<F>;
  override insertChild<V extends View>(child: V | LikeType<V>, target: View | Node | null, key?: string): V;
  override insertChild(child: View | LikeType<NodeView>, target: View | Node | null, key?: string): View;
  override insertChild(child: View | LikeType<NodeView>, target: View | Node | null, key?: string): View {
    if (target instanceof View && target.parent !== this || target instanceof Node && target.parentNode !== this.node) {
      target = null;
    }

    if (child instanceof Node) {
      child = NodeView.fromNode(child);
    } else {
      child = View.fromLike(child);
    }

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
    }

    let targetView: View | null;
    let targetNode: Node | null;
    if (target instanceof Node) {
      targetView = null;
      targetNode = target;
      let nextNode: Node | null = target;
      do {
        const nextView = NodeView.get(nextNode);
        if (nextView !== null) {
          targetView = nextView;
          break;
        }
        nextNode = nextNode.nextSibling;
      } while (nextNode !== null);
    } else {
      targetView = target;
      targetNode = null;
    }

    child.setFlags(child.flags | View.InsertingFlag);
    child.setKey(key);
    this.willInsertChild(child, targetView);
    if (child instanceof NodeView) {
      if (targetNode === null && targetView !== null) {
        let nextView: View | null = targetView;
        do {
          if (nextView instanceof NodeView) {
            targetNode = nextView.node;
            break;
          }
          nextView = nextView.nextSibling;
        } while (nextView !== null);
      }
      this.node.insertBefore(child.node, targetNode);
    }
    this.insertChildMap(child);
    child.attachParent(this, targetView);
    this.onInsertChild(child, targetView);
    this.didInsertChild(child, targetView);
    child.cascadeInsert();
    child.setFlags(child.flags & ~View.InsertingFlag);

    return child;
  }

  injectChild<F extends Class<Instance<F, NodeView>> & Creatable<Instance<F, NodeView>>>(childFactory: F, target: NodeView | Node | null, key?: string): InstanceType<F>;
  injectChild<V extends NodeView>(child: V | LikeType<V>, target: NodeView | Node | null, key?: string): V;
  injectChild(child: NodeView | LikeType<NodeView>, target: NodeView | Node | null, key?: string): NodeView;
  injectChild(child: NodeView | LikeType<NodeView>, target: NodeView | Node | null, key?: string): NodeView {
    if (target instanceof View && target.parent !== this || target instanceof Node && target.parentNode !== this.node) {
      throw new TypeError("" + target);
    }

    child = NodeView.fromLike(child);

    if (key !== void 0) {
      this.removeChild(key);
    }

    if (target instanceof Node) {
      let nextNode: Node | null = target;
      target = null;
      do {
        const nextView = NodeView.get(nextNode);
        if (nextView !== null) {
          target = nextView;
          break;
        }
        nextNode = nextNode.nextSibling;
      } while (nextNode !== null);
    }

    child.setFlags(child.flags | View.InsertingFlag);
    child.setKey(key);
    this.willInsertChild(child, target);
    this.insertChildMap(child);
    child.attachParent(this, target);
    this.onInsertChild(child, target);
    this.didInsertChild(child, target);
    child.cascadeInsert();
    child.setFlags(child.flags & ~View.InsertingFlag);

    return child;
  }

  override replaceChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(newChildFactory: F, oldChild: View): View;
  override replaceChild<V extends View>(newChild: View | LikeType<NodeView>, oldChild: V): V;
  override replaceChild(newChild: View | LikeType<NodeView>, oldChild: View): View;
  override replaceChild(newChild: View | LikeType<NodeView>, oldChild: View): View {
    if (oldChild.parent !== this) {
      throw new TypeError("" + oldChild);
    } else if (newChild instanceof Node) {
      newChild = NodeView.fromNode(newChild);
    } else {
      newChild = View.fromLike(newChild);
    }
    if (newChild === oldChild) {
      return oldChild;
    }

    newChild.remove();
    const target = oldChild.nextSibling;

    if ((oldChild.flags & View.RemovingFlag) === 0) {
      oldChild.setFlags(oldChild.flags | View.RemovingFlag);
      this.willRemoveChild(oldChild);
      oldChild.detachParent(this);
      this.removeChildMap(oldChild);
      this.onRemoveChild(oldChild);
      this.didRemoveChild(oldChild);
      oldChild.setKey(void 0);
      oldChild.setFlags(oldChild.flags & ~View.RemovingFlag);
    }

    newChild.setFlags(newChild.flags | View.InsertingFlag);
    newChild.setKey(oldChild.key);
    this.willInsertChild(newChild, target);
    if (newChild instanceof NodeView) {
      if (oldChild instanceof NodeView) {
        this.node.replaceChild(newChild.node, oldChild.node);
      } else if (target !== null) {
        let targetNode: Node | null = null;
        let nextView: View | null = target;
        do {
          if (nextView instanceof NodeView) {
            targetNode = nextView.node;
            break;
          }
          nextView = nextView.nextSibling;
        } while (nextView !== null);
        this.node.insertBefore(newChild.node, targetNode);
      } else {
        this.node.appendChild(newChild.node);
      }
    } else if (oldChild instanceof NodeView) {
      this.node.removeChild(oldChild.node);
    }
    this.insertChildMap(newChild);
    newChild.attachParent(this, target);
    this.onInsertChild(newChild, target);
    this.didInsertChild(newChild, target);
    newChild.cascadeInsert();
    newChild.setFlags(newChild.flags & ~View.InsertingFlag);

    return oldChild;
  }

  override removeChild<V extends View | Node>(child: V): V;
  override removeChild(key: string | View): View | null;
  override removeChild(key: string | View | Node): View | Node | null;
  override removeChild(key: string | View | Node): View | Node | null {
    let child: View | null;
    if (typeof key === "string") {
      child = this.getChild(key);
      if (child === null) {
        return null;
      }
    } else if (key instanceof Node) {
      if (key.parentNode !== this.node) {
        throw new Error("not a child node");
      }
      const view = NodeView.get(key);
      if (view !== null) {
        child = view;
      } else {
        this.node.removeChild(key);
        return key;
      }
    } else {
      child = key;
      if (child.parent !== this) {
        throw new Error("not a child");
      }
    }

    if ((child.flags & View.RemovingFlag) === 0) {
      child.setFlags(child.flags | View.RemovingFlag);
      this.willRemoveChild(child);
      child.detachParent(this);
      this.removeChildMap(child);
      if (child instanceof NodeView) {
        this.node.removeChild(child.node);
      }
      this.onRemoveChild(child);
      this.didRemoveChild(child);
      child.setKey(void 0);
      child.setFlags(child.flags & ~View.RemovingFlag);
    }

    return child;
  }

  override removeChildren(): void {
    let child: View | null;
    while (child = this.lastChild, child !== null) {
      if ((child.flags & View.RemovingFlag) !== 0) {
        throw new Error("inconsistent removeChildren");
      }
      this.willRemoveChild(child);
      child.detachParent(this);
      this.removeChildMap(child);
      if (child instanceof NodeView) {
        this.node.removeChild(child.node);
      }
      this.onRemoveChild(child);
      this.didRemoveChild(child);
      child.setKey(void 0);
      child.setFlags(child.flags & ~View.RemovingFlag);
    }
  }

  override reinsertChild(child: View, target: View | null): void {
    if (child.parent !== this) {
      throw new Error("not a child");
    } else if (target !== null && target.parent !== this) {
      throw new Error("reinsert target is not a child");
    } else if (child.nextSibling === target) {
      return;
    }

    this.willReinsertChild(child, target);
    if (child instanceof NodeView) {
      this.node.removeChild(child.node);
      this.node.insertBefore(child.node, target instanceof NodeView ? target.node : null);
    }
    child.reattachParent(target);
    this.onReinsertChild(child, target);
    this.didReinsertChild(child, target);
  }

  /** @internal */
  static isRootView(node: Node): boolean {
    do {
      const parentNode: Node | null = node.parentNode;
      if (parentNode === null) {
        return true;
      }
      const parentView = NodeView.get(parentNode);
      if (parentView !== null) {
        return false;
      }
      node = parentNode;
    } while (true);
  }

  /** @internal */
  static isNodeMounted(node: Node): boolean {
    let isConnected: boolean | undefined = node.isConnected;
    if (typeof isConnected !== "boolean") {
      const ownerDocument = node.ownerDocument;
      if (ownerDocument === null) {
        isConnected = false;
      } else {
        const position = ownerDocument.compareDocumentPosition(node);
        isConnected = (position & node.DOCUMENT_POSITION_DISCONNECTED) === 0;
      }
    }
    return isConnected;
  }

  /** @internal */
  static mount(view: NodeView): void {
    if (view.parent !== null) {
      return;
    }
    const parentView = NodeView.get(view.node.parentNode);
    if (parentView === null) {
      view.mount();
      return;
    }
    let targetView: View | null = null;
    let targetNode = view.node.nextSibling;
    while (targetNode !== null) {
      targetView = NodeView.get(targetNode);
      if (targetView !== null) {
        break;
      }
      targetNode = targetNode.nextSibling;
    }
    view.setFlags(view.flags | View.InsertingFlag);
    view.attachParent(parentView, targetView);
    view.cascadeInsert();
    view.setFlags(view.flags & ~View.InsertingFlag);
  }

  /** @internal */
  override mount(): void {
    if (this.mounted || !NodeView.isNodeMounted(this.node) || !NodeView.isRootView(this.node)) {
      return;
    }
    this.setFlags(this.flags | View.InsertingFlag);
    this.cascadeMount();
    this.cascadeInsert();
    this.setFlags(this.flags & ~View.InsertingFlag);
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

  override addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): void {
    this.node.addEventListener(type, listener, options);
  }

  override removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): void {
    this.node.removeEventListener(type, listener, options);
  }

  /** @internal */
  static readonly nodeMap: WeakMap<Node, NodeView> = new WeakMap();

  static get<S extends Class<Instance<S, NodeView>>>(this: S, node: Node | null | undefined): InstanceType<S> | null {
    const view = node !== void 0 && node !== null ? NodeView.nodeMap.get(node) : void 0;
    if (view === void 0) {
      return null;
    } else if (!(view instanceof this)) {
      throw new TypeError(node + " not an instance of " + this.name);
    }
    return view;
  }

  static override fromLike<S extends Class<Instance<S, View>>>(this: S, value: InstanceType<S> | LikeType<InstanceType<S>>): InstanceType<S> {
    if (value === void 0 || value === null) {
      return value as InstanceType<S>;
    } else if (value instanceof View) {
      if (!(value instanceof this)) {
        throw new TypeError(value + " not an instance of " + this);
      }
      return value;
    } else if (value instanceof Node) {
      return (this as unknown as typeof NodeView).fromNode(value) as InstanceType<S>;
    } else if (Creatable[Symbol.hasInstance](value)) {
      return (value as Creatable<InstanceType<S>>).create();
    }
    throw new TypeError("" + value);
  }

  static fromNode<S extends new (node: Node) => Instance<S, NodeView>>(this: S, node: Node): InstanceType<S>;
  static fromNode(node: Node): NodeView;
  static fromNode(node: Node): NodeView {
    let view = this.get(node);
    if (view === null) {
      if (node instanceof HTMLElement) {
        view = new HtmlView(node);
      } else if (node instanceof SVGElement) {
        view = new SvgView(node);
      } else if (node instanceof Element) {
        view = new ElementView(node);
      } else if (node instanceof Text) {
        view = new TextView(node);
      } else {
        view = new NodeView(node);
      }
      this.mount(view);
    }
    return view;
  }
}
