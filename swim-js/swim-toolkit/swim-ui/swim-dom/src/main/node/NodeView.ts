// Copyright 2015-2022 Swim.inc
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

import {Class, Instance, Creatable} from "@swim/util";
import {Provider} from "@swim/component";
import {R2Box, Transform} from "@swim/math";
import {AnyView, ViewInit, ViewFactory, ViewClass, View, ModalService} from "@swim/view";
import {DomService} from "../service/DomService";
import {DomProvider} from "../service/DomProvider";
import type {NodeViewObserver} from "./NodeViewObserver";
import {TextView} from "../"; // forward import
import {ViewElement, ElementView} from "../"; // forward import

/** @public */
export type ViewNodeType<V extends NodeView> =
  V extends {readonly node: infer N} ? N : never;

/** @public */
export interface ViewNode extends Node {
  view?: NodeView;
}

/** @public */
export type AnyNodeView<V extends NodeView = NodeView> = AnyView<V> | ViewNodeType<V>;

/** @public */
export interface NodeViewInit extends ViewInit {
  text?: string;
}

/** @public */
export interface NodeViewFactory<V extends NodeView = NodeView, U = AnyNodeView<V>> extends ViewFactory<V, U> {
  fromNode(node: ViewNodeType<V>): V
}

/** @public */
export interface NodeViewClass<V extends NodeView = NodeView, U = AnyNodeView<V>> extends ViewClass<V, U>, NodeViewFactory<V, U> {
}

/** @public */
export interface NodeViewConstructor<V extends NodeView = NodeView, U = AnyNodeView<V>> extends NodeViewClass<V, U> {
  new(node: ViewNodeType<V>): V;
}

/** @public */
export class NodeView extends View {
  constructor(node: Node) {
    super();
    this.node = node;
    (node as ViewNode).view = this;
  }

  override readonly observerType?: Class<NodeViewObserver>;

  readonly node: Node;

  override setChild<V extends View>(key: string, newChild: V): View | null;
  override setChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(key: string, factory: F): View | null;
  override setChild(key: string, newChild: AnyView | Node | null): View | null;
  override setChild(key: string, newChild: AnyView | Node | null): View | null {
    const oldChild = this.getChild(key);
    let target: View | null;

    if (newChild instanceof Node) {
      newChild = NodeView.fromNode(newChild);
    } else if (newChild !== null) {
      newChild = View.fromAny(newChild);
    }

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

      newChild.setKey(oldChild.key);
      this.willInsertChild(newChild, target);
      if (newChild instanceof NodeView) {
        if (oldChild instanceof NodeView) {
          this.node.replaceChild(newChild.node, oldChild.node);
        } else if (target !== null) {
          let targetNode: Node | null = null;
          let next: View | null = target;
          do {
            if (next instanceof NodeView) {
              targetNode = next.node;
              break;
            }
            next = next.nextSibling;
          } while (next !== null);
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

        newChild.setKey(key);
        this.willInsertChild(newChild, target);
        if (newChild instanceof NodeView) {
          let targetNode: Node | null = null;
          if (target !== null) {
            let next: View | null = target;
            do {
              if (next instanceof NodeView) {
                targetNode = next.node;
                break;
              }
              next = next.nextSibling;
            } while (next !== null);
          }
          this.node.insertBefore(newChild.node, targetNode);
        }
        this.insertChildMap(newChild);
        newChild.attachParent(this, target);
        this.onInsertChild(newChild, target);
        this.didInsertChild(newChild, target);
        newChild.cascadeInsert();
      }
    }

    return oldChild;
  }

  override appendChild<V extends View>(child: V, key?: string): V;
  override appendChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(factory: F, key?: string): InstanceType<F>;
  override appendChild(child: AnyView | Node, key?: string): View;
  override appendChild(child: AnyView | Node, key?: string): View {
    if (child instanceof Node) {
      child = NodeView.fromNode(child);
    } else {
      child = View.fromAny(child);
    }

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
    }

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

    return child;
  }

  override prependChild<V extends View>(child: V, key?: string): V;
  override prependChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(factory: F, key?: string): InstanceType<F>;
  override prependChild(child: AnyView | Node, key?: string): View;
  override prependChild(child: AnyView | Node, key?: string): View {
    if (child instanceof Node) {
      child = NodeView.fromNode(child);
    } else {
      child = View.fromAny(child);
    }

    child.remove();
    if (key !== void 0) {
      this.removeChild(key);
    }
    const target = this.firstChild;

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

    return child;
  }

  override insertChild<V extends View>(child: V, target: View | Node | null, key?: string): V;
  override insertChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(factory: F, target: View | null, key?: string): InstanceType<F>;
  override insertChild(child: AnyView | Node, target: View | Node | null, key?: string): View;
  override insertChild(child: AnyView | Node, target: View | Node | null, key?: string): View {
    if (target instanceof View && target.parent !== this || target instanceof Node && target.parentNode !== this.node) {
      throw new TypeError("" + target);
    }

    if (child instanceof Node) {
      child = NodeView.fromNode(child);
    } else {
      child = View.fromAny(child);
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
      let next: ViewNode | null = target;
      do {
        if (next.view !== void 0) {
          targetView = next.view;
          break;
        }
        next = next.nextSibling;
      } while (next !== null);
    } else {
      targetView = target;
      targetNode = null;
    }

    child.setKey(key);
    this.willInsertChild(child, targetView);
    if (child instanceof NodeView) {
      if (targetNode === null && targetView !== null) {
        let next: View | null = targetView;
        do {
          if (next instanceof NodeView) {
            targetNode = next.node;
            break;
          }
          next = next.nextSibling;
        } while (next !== null);
      }
      this.node.insertBefore(child.node, targetNode);
    }
    this.insertChildMap(child);
    child.attachParent(this, targetView);
    this.onInsertChild(child, targetView);
    this.didInsertChild(child, targetView);
    child.cascadeInsert();

    return child;
  }

  /** @internal */
  injectChild<V extends NodeView>(child: V, target: View | Node | null, key?: string): V;
  /** @internal */
  injectChild(child: AnyNodeView, target: View | Node | null, key?: string): View;
  injectChild(child: AnyNodeView, target: View | Node | null, key?: string): View {
    if (target instanceof View && target.parent !== this || target instanceof Node && target.parentNode !== this.node) {
      throw new TypeError("" + target);
    }

    child = NodeView.fromAny(child);

    if (key !== void 0) {
      this.removeChild(key);
    }

    if (target instanceof Node) {
      let next: ViewNode | null = target;
      target = null;
      do {
        if (next.view !== void 0) {
          target = next.view;
          break;
        }
        next = next.nextSibling;
      } while (next !== null);
    }

    child.setKey(key);
    this.willInsertChild(child, target);
    this.insertChildMap(child);
    child.attachParent(this, target);
    this.onInsertChild(child, target);
    this.didInsertChild(child, target);
    child.cascadeInsert();

    return child;
  }

  override replaceChild<V extends View>(newChild: View, oldChild: V): V;
  override replaceChild<V extends View>(newChild: AnyView | Node, oldChild: V): V;
  override replaceChild(newChild: AnyView | Node, oldChild: View): View {
    if (oldChild.parent !== this) {
      throw new TypeError("" + oldChild);
    }

    if (newChild instanceof Node) {
      newChild = NodeView.fromNode(newChild);
    } else {
      newChild = View.fromAny(newChild);
    }

    if (newChild !== oldChild) {
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

      newChild.setKey(oldChild.key);
      this.willInsertChild(newChild, target);
      if (newChild instanceof NodeView) {
        if (oldChild instanceof NodeView) {
          this.node.replaceChild(newChild.node, oldChild.node);
        } else if (target !== null) {
          let targetNode: Node | null = null;
          let next: View | null = target;
          do {
            if (next instanceof NodeView) {
              targetNode = next.node;
              break;
            }
            next = next.nextSibling;
          } while (next !== null);
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
    }

    return oldChild;
  }

  override removeChild<V extends View | Node>(child: V): V;
  override removeChild(key: string | View): View | null;
  override removeChild(key: string | View | Node): View | Node | null;
  override removeChild(key: string | View | ViewNode): View | Node | null {
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
      if (key.view !== void 0) {
        child = key.view;
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
    if (view.parent === null) {
      const parentNode = view.node.parentNode as ViewNode | null;
      const parentView = parentNode !== null && parentNode.view !== void 0 ? parentNode.view : null;
      if (parentView !== null) {
        let targetView: View | null = null;
        let targetNode: ViewNode | null = view.node.nextSibling;
        while (targetNode !== null) {
          if (targetNode.view !== void 0) {
            targetView = targetNode.view;
            break;
          }
          targetNode = targetNode.nextSibling;
        }
        view.attachParent(parentView, targetView);
        view.cascadeInsert();
      } else {
        view.mount();
      }
    }
  }

  /** @internal */
  override mount(): void {
    if (!this.mounted && NodeView.isNodeMounted(this.node) && NodeView.isRootView(this.node)) {
      this.cascadeMount();
      this.cascadeInsert();
    }
  }

  @Provider({
    extends: DomProvider,
    type: DomService,
    observes: false,
    service: DomService.global(),
  })
  declare readonly domProvider: DomProvider<this>;

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

  static fromNode<S extends new (node: Node) => Instance<S, NodeView>>(this: S, node: ViewNodeType<InstanceType<S>>): InstanceType<S>;
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

  static override fromAny<S extends Class<Instance<S, NodeView>>>(this: S, value: AnyNodeView<InstanceType<S>>): InstanceType<S>;
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
