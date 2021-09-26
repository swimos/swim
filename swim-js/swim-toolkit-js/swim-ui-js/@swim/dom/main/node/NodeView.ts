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

import {Mutable, Arrays} from "@swim/util";
import type {AnyTiming} from "@swim/mapping";
import type {ConstraintVariable, Constraint} from "@swim/constraint";
import {R2Box, Transform} from "@swim/math";
import type {Look, Feel, MoodVectorUpdates, MoodVector} from "@swim/theme";
import {
  ViewContextType,
  ViewContext,
  ViewFlags,
  ViewInit,
  ViewConstructor,
  View,
  ViewObserverType,
  ViewService,
  ModalManager,
  ViewProperty,
  ViewAnimator,
  ViewFastener,
  GestureContext,
  Gesture,
} from "@swim/view";
import type {NodeViewObserver} from "./NodeViewObserver";
import {TextViewConstructor, TextView} from "../"; // forward import
import {ViewElement, ElementView} from "../"; // forward import

export type ViewNodeType<V extends NodeView> = V extends {readonly node: infer N} ? N : never;

export interface ViewNode extends Node {
  view?: NodeView;
}

export interface NodeViewInit extends ViewInit {
  text?: string;
}

export interface NodeViewConstructor<V extends NodeView = NodeView> {
  new(node: ViewNodeType<V>): V;
  readonly prototype: V;
}

export class NodeView extends View {
  constructor(node: Node) {
    super();
    this.node = node;
    this.key = void 0;
    this.childViewMap = null;
    this.viewServices = null;
    this.viewProperties = null;
    this.viewAnimators = null;
    this.viewFasteners = null;
    this.gestures = null;
    this.constraints = Arrays.empty;
    this.constraintVariables = Arrays.empty;
    (node as ViewNode).view = this;
  }

  override initView(init: NodeViewInit): void {
    super.initView(init);
    if (init.text !== void 0) {
      this.text(init.text);
    }
  }

  readonly node: Node;

  override readonly viewObservers!: ReadonlyArray<NodeViewObserver>;

  protected willObserve<T>(callback: (this: this, viewObserver: ViewObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      result = callback.call(this, viewObserver as ViewObserverType<this>) as T | undefined;
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  protected didObserve<T>(callback: (this: this, viewObserver: ViewObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      result = callback.call(this, viewObserver as ViewObserverType<this>) as T | undefined;
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  override readonly key: string | undefined;

  /** @hidden */
  override setKey(key: string | undefined): void {
    (this as Mutable<this>).key = key;
  }

  override get parentView(): View | null {
    const parentNode: ViewNode | null = this.node.parentNode;
    if (parentNode !== null) {
      const parentView = parentNode.view;
      if (parentView instanceof View) {
        return parentView;
      }
    }
    return null;
  }

  /** @hidden */
  override setParentView(newParentView: View | null, oldParentView: View | null): void {
    this.willSetParentView(newParentView, oldParentView);
    if (oldParentView !== null) {
      this.detachParentView(oldParentView);
    }
    if (newParentView !== null) {
      this.attachParentView(newParentView);
    }
    this.onSetParentView(newParentView, oldParentView);
    this.didSetParentView(newParentView, oldParentView);
  }

  override remove(): void {
    const node = this.node;
    const parentNode: ViewNode | null = node.parentNode;
    if (parentNode !== null) {
      const parentView = parentNode.view;
      if (parentView !== void 0) {
        if ((this.viewFlags & View.TraversingFlag) === 0) {
          parentView.removeChildView(this);
        } else {
          this.setViewFlags(this.viewFlags | View.RemovingFlag);
        }
      } else {
        parentNode.removeChild(node);
        this.setParentView(null, this);
        this.setKey(void 0);
      }
    }
  }

  override get childViewCount(): number {
    let childViewCount = 0;
    const childNodes = this.node.childNodes;
    for (let i = 0, n = childNodes.length; i < n; i += 1) {
      const childView = (childNodes[i]! as ViewNode).view;
      if (childView !== void 0) {
        childViewCount += 1;
      }
    }
    return childViewCount;
  }

  override get childViews(): ReadonlyArray<View> {
    const childNodes = this.node.childNodes;
    const childViews = [];
    for (let i = 0, n = childNodes.length; i < n; i += 1) {
      const childView = (childNodes[i]! as ViewNode).view;
      if (childView !== void 0) {
        childViews.push(childView);
      }
    }
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
    return null;
  }

  override lastChildView(): View | null {
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
    }
    return null;
  }

  override previousChildView(targetView: View): View | null {
    if (targetView instanceof NodeView && targetView.parentView === this) {
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
    return result;
  }

  /** @hidden */
  readonly childViewMap: {[key: string]: View | undefined} | null;

  override getChildView(key: string): View | null {
    const childViewMap = this.childViewMap;
    if (childViewMap !== null) {
      const childView = childViewMap[key];
      if (childView !== void 0) {
        return childView;
      }
    }
    return null;
  }

  override setChildView(key: string, newChildView: View | null): View | null {
    let targetNode: ViewNode | null = null;
    if (newChildView !== null) {
      if (!(newChildView instanceof NodeView)) {
        throw new TypeError("" + newChildView);
      }
      if (newChildView.parentView === this) {
        targetNode = newChildView.node.nextSibling;
      }
      newChildView.remove();
    }
    const oldChildView = this.getChildView(key);
    if (oldChildView !== null) {
      if (!(oldChildView instanceof NodeView)) {
        throw new TypeError("" + oldChildView);
      }
      const oldChildNode = oldChildView.node;
      targetNode = oldChildNode.nextSibling;
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
    }
    if (newChildView !== null) {
      const newChildNode = newChildView.node;
      let targetView: View | null | undefined = null;
      if (targetNode !== null) {
        targetView = targetNode.view;
        if (targetView === void 0) {
          targetView = null;
        }
      }
      newChildView.setKey(key);
      this.willInsertChildView(newChildView, targetView);
      this.willInsertChildNode(newChildNode, targetNode);
      this.node.insertBefore(newChildNode, targetNode);
      this.insertChildViewMap(newChildView);
      newChildView.setParentView(this, null);
      this.onInsertChildNode(newChildNode, targetNode);
      this.onInsertChildView(newChildView, targetView);
      this.didInsertChildNode(newChildNode, targetNode);
      this.didInsertChildView(newChildView, targetView);
      newChildView.cascadeInsert();
    }
    return oldChildView;
  }

  /** @hidden */
  protected insertChildViewMap(childView: View): void {
    const key = childView.key;
    if (key !== void 0) {
      let childViewMap = this.childViewMap;
      if (childViewMap === null) {
        childViewMap = {};
        (this as Mutable<this>).childViewMap = childViewMap;
      }
      childViewMap[key] = childView;
    }
  }

  /** @hidden */
  protected removeChildViewMap(childView: View): void {
    const key = childView.key;
    if (key !== void 0) {
      const childViewMap = this.childViewMap;
      if (childViewMap !== null) {
        delete childViewMap[key];
      }
    }
  }

  appendChild(child: View | Node, key?: string): void {
    if (child instanceof View) {
      this.appendChildView(child, key);
    } else if (child instanceof Node) {
      this.appendChildNode(child, key);
    } else {
      throw new TypeError("" + child);
    }
  }

  override appendChildView(childView: View, key?: string): void {
    if (!(childView instanceof NodeView)) {
      throw new TypeError("" + childView);
    }
    childView.remove();
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    const childNode = childView.node;
    this.willInsertChildView(childView, null);
    this.willInsertChildNode(childNode, null);
    this.node.appendChild(childNode);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildNode(childNode, null);
    this.onInsertChildView(childView, null);
    this.didInsertChildNode(childNode, null);
    this.didInsertChildView(childView, null);
    childView.cascadeInsert();
  }

  appendChildNode(childNode: Node, key?: string): void {
    const childView = (childNode as ViewNode).view;
    if (childView !== void 0) {
      childView.remove();
      if (key !== void 0) {
        this.removeChildView(key);
        childView.setKey(key);
      }
      this.willInsertChildView(childView, null);
    }
    this.willInsertChildNode(childNode, null);
    this.node.appendChild(childNode);
    if (childView !== void 0) {
      this.insertChildViewMap(childView);
      childView.setParentView(this, null);
    }
    this.onInsertChildNode(childNode, null);
    if (childView !== void 0) {
      this.onInsertChildView(childView, null);
    }
    this.didInsertChildNode(childNode, null);
    if (childView !== void 0) {
      this.didInsertChildView(childView, null);
      childView.cascadeInsert();
    }
  }

  prependChild(child: View | Node, key?: string): void {
    if (child instanceof View) {
      this.prependChildView(child, key);
    } else if (child instanceof Node) {
      this.prependChildNode(child, key);
    } else {
      throw new TypeError("" + child);
    }
  }

  override prependChildView(childView: View, key?: string): void {
    if (!(childView instanceof NodeView)) {
      throw new TypeError("" + childView);
    }
    childView.remove();
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    const childNode = childView.node;
    const targetNode = this.node.firstChild as ViewNode | null;
    let targetView: View | null | undefined = null;
    if (targetNode !== null) {
      targetView = targetNode.view;
      if (targetView === void 0) {
        targetView = null;
      }
    }
    this.willInsertChildView(childView, targetView);
    this.willInsertChildNode(childNode, targetNode);
    this.node.insertBefore(childNode, targetNode);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildNode(childNode, targetNode);
    this.onInsertChildView(childView, targetView);
    this.didInsertChildNode(childNode, targetNode);
    this.didInsertChildView(childView, targetView);
    childView.cascadeInsert();
  }

  prependChildNode(childNode: Node, key?: string): void {
    const childView = (childNode as ViewNode).view;
    const targetNode = this.node.firstChild as ViewNode | null;
    let targetView: View | null | undefined = null;
    if (targetNode !== null) {
      targetView = targetNode.view;
      if (targetView === void 0) {
        targetView = null;
      }
    }
    if (childView !== void 0) {
      childView.remove();
      if (key !== void 0) {
        this.removeChildView(key);
        childView.setKey(key);
      }
      this.willInsertChildView(childView, targetView);
    }
    this.willInsertChildNode(childNode, targetNode);
    this.node.insertBefore(childNode, targetNode);
    if (childView !== void 0) {
      this.insertChildViewMap(childView);
      childView.setParentView(this, null);
    }
    this.onInsertChildNode(childNode, targetNode);
    if (childView !== void 0) {
      this.onInsertChildView(childView, targetView);
    }
    this.didInsertChildNode(childNode, targetNode);
    if (childView !== void 0) {
      this.didInsertChildView(childView, targetView);
      childView.cascadeInsert();
    }
  }

  insertChild(child: View | Node, target: View | Node | null, key?: string): void {
    if (child instanceof NodeView) {
      if (target instanceof View) {
        this.insertChildView(child, target, key);
      } else if (target instanceof Node || target === null) {
        this.insertChildNode(child.node, target, key);
      } else {
        throw new TypeError("" + target);
      }
    } else if (child instanceof Node) {
      if (target instanceof NodeView) {
        this.insertChildNode(child, target.node, key);
      } else if (target instanceof Node || target === null) {
        this.insertChildNode(child, target, key);
      } else {
        throw new TypeError("" + target);
      }
    } else {
      throw new TypeError("" + child);
    }
  }

  override insertChildView(childView: View, targetView: View | null, key?: string): void {
    if (!(childView instanceof NodeView)) {
      throw new TypeError("" + childView);
    }
    if (targetView !== null && !(targetView instanceof NodeView)) {
      throw new TypeError("" + targetView);
    }
    childView.remove();
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    const childNode = childView.node;
    const targetNode = targetView !== null ? targetView.node : null;
    this.willInsertChildView(childView, targetView);
    this.willInsertChildNode(childNode, targetNode);
    this.node.insertBefore(childNode, targetNode);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildNode(childNode, targetNode);
    this.onInsertChildView(childView, targetView);
    this.didInsertChildNode(childNode, targetNode);
    this.didInsertChildView(childView, targetView);
    childView.cascadeInsert();
  }

  protected override onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    this.insertViewFastener(childView, targetView);
    this.insertGesture(childView, targetView);
  }

  insertChildNode(childNode: Node, targetNode: Node | null, key?: string): void {
    const childView = (childNode as ViewNode).view;
    let targetView: View | null | undefined = null;
    if (targetNode !== null) {
      targetView = (targetNode as ViewNode).view;
      if (targetView === void 0) {
        targetView = null;
      }
    }
    if (childView !== void 0) {
      childView.remove();
      if (key !== void 0) {
        this.removeChildView(key);
        childView.setKey(key);
      }
      this.willInsertChildView(childView, targetView);
    }
    this.willInsertChildNode(childNode, targetNode);
    this.node.insertBefore(childNode, targetNode);
    if (childView !== void 0) {
      this.insertChildViewMap(childView);
      childView.setParentView(this, null);
    }
    this.onInsertChildNode(childNode, targetNode);
    if (childView !== void 0) {
      this.onInsertChildView(childView, targetView);
    }
    this.didInsertChildNode(childNode, targetNode);
    if (childView !== void 0) {
      this.didInsertChildView(childView, targetView);
      childView.cascadeInsert();
    }
  }

  /** @hidden */
  injectChildView(childView: NodeView, targetView: NodeView | null, key?: string): void {
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    const childNode = childView.node;
    const targetNode = targetView !== null ? targetView.node : null;
    this.willInsertChildView(childView, targetView);
    this.willInsertChildNode(childNode, targetNode);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildNode(childNode, targetNode);
    this.onInsertChildView(childView, targetView);
    this.didInsertChildNode(childNode, targetNode);
    this.didInsertChildView(childView, targetView);
    childView.cascadeInsert();
  }

  protected willInsertChildNode(childNode: Node, targetNode: Node | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillInsertChildNode !== void 0) {
        viewObserver.viewWillInsertChildNode(childNode, targetNode, this);
      }
    }
  }

  protected onInsertChildNode(childNode: Node, targetNode: Node | null): void {
    this.requireUpdate(this.insertChildFlags);
  }

  protected didInsertChildNode(childNode: Node, targetNode: Node | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidInsertChildNode !== void 0) {
        viewObserver.viewDidInsertChildNode(childNode, targetNode, this);
      }
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

  removeChild(child: View | Node): void {
    if (child instanceof View) {
      this.removeChildView(child);
    } else if (child instanceof Node) {
      this.removeChildNode(child);
    } else {
      throw new TypeError("" + child);
    }
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
    if (!(childView instanceof NodeView)) {
      throw new TypeError("" + childView);
    }
    const childNode = childView.node;
    if (childNode.parentNode !== this.node) {
      throw new Error("not a child view");
    }
    this.willRemoveChildView(childView);
    this.willRemoveChildNode(childNode);
    childView.setParentView(null, this);
    this.removeChildViewMap(childView);
    this.node.removeChild(childNode);
    this.onRemoveChildNode(childNode);
    this.onRemoveChildView(childView);
    this.didRemoveChildNode(childNode);
    this.didRemoveChildView(childView);
    childView.setKey(void 0);
    if (typeof key === "string") {
      return childView;
    }
  }

  protected override onRemoveChildView(childView: View): void {
    super.onRemoveChildView(childView);
    this.removeGesture(childView);
    this.removeViewFastener(childView);
  }

  removeChildNode(childNode: Node): void {
    if (childNode.parentNode !== this.node) {
      throw new Error("not a child node")
    }
    const childView = (childNode as ViewNode).view;
    if (childView !== void 0) {
      this.willRemoveChildView(childView);
    }
    this.willRemoveChildNode(childNode);
    this.node.removeChild(childNode);
    if (childView !== void 0) {
      childView.setParentView(null, this);
      this.removeChildViewMap(childView);
    }
    this.onRemoveChildNode(childNode);
    if (childView !== void 0) {
      this.onRemoveChildView(childView);
    }
    this.didRemoveChildNode(childNode);
    if (childView !== void 0) {
      this.didRemoveChildView(childView);
      childView.setKey(void 0);
    }
  }

  override removeAll(): void {
    do {
      const childNode = this.node.lastChild as ViewNode | null;
      if (childNode !== null) {
        const childView = childNode.view;
        if (childView !== void 0) {
          this.willRemoveChildView(childView);
        }
        this.willRemoveChildNode(childNode);
        this.node.removeChild(childNode);
        if (childView !== void 0) {
          childView.setParentView(null, this);
          this.removeChildViewMap(childView);
        }
        this.onRemoveChildNode(childNode);
        if (childView !== void 0) {
          this.onRemoveChildView(childView);
        }
        this.didRemoveChildNode(childNode);
        if (childView !== void 0) {
          this.didRemoveChildView(childView);
          childView.setKey(void 0);
        }
        continue;
      }
      break;
    } while (true);
  }

  protected willRemoveChildNode(childNode: Node): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillRemoveChildNode !== void 0) {
        viewObserver.viewWillRemoveChildNode(childNode, this);
      }
    }
  }

  protected onRemoveChildNode(childNode: Node): void {
    this.requireUpdate(this.removeChildFlags);
  }

  protected didRemoveChildNode(childNode: Node): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidRemoveChildNode !== void 0) {
        viewObserver.viewDidRemoveChildNode(childNode, this);
      }
    }
  }

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

  /** @hidden */
  static isRootView(node: Node): boolean {
    do {
      const parentNode: ViewNode | null = node.parentNode;
      if (parentNode !== null) {
        const parentView = parentNode.view;
        if (parentView instanceof View) {
          return false;
        }
        node = parentNode;
        continue;
      }
      break;
    } while (true);
    return true;
  }

  /** @hidden */
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

  mount(): void {
    if (!this.isMounted() && NodeView.isNodeMounted(this.node) && NodeView.isRootView(this.node)) {
      this.cascadeMount();
      if (!this.isPowered() && document.visibilityState === "visible") {
        this.cascadePower();
      }
      this.cascadeInsert();
    }
  }

  override cascadeMount(): void {
    if ((this.viewFlags & View.MountedFlag) === 0) {
      this.setViewFlags(this.viewFlags | (View.MountedFlag | View.TraversingFlag));
      try {
        this.willMount();
        this.onMount();
        this.mountChildViews();
        this.didMount();
      } finally {
        this.setViewFlags(this.viewFlags & ~View.TraversingFlag);
      }
    } else {
      throw new Error("already mounted");
    }
  }

  protected override onMount(): void {
    super.onMount();
    this.mountViewServices();
    this.mountViewProperties();
    this.mountViewAnimators();
    this.mountViewFasteners();
    this.mountGestures();
  }

  protected override didMount(): void {
    this.activateLayout();
    super.didMount();
  }

  /** @hidden */
  protected mountChildViews(): void {
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
  }

  override cascadeUnmount(): void {
    if ((this.viewFlags & View.MountedFlag) !== 0) {
      this.setViewFlags(this.viewFlags & ~View.MountedFlag | View.TraversingFlag);
      try {
        this.willUnmount();
        this.unmountChildViews();
        this.onUnmount();
        this.didUnmount();
      } finally {
        this.setViewFlags(this.viewFlags & ~View.TraversingFlag);
      }
    } else {
      throw new Error("already unmounted");
    }
  }

  protected override willUnmount(): void {
    super.willUnmount();
    this.deactivateLayout();
  }

  protected override onUnmount(): void {
    this.unmountGestures();
    this.unmountViewFasteners();
    this.unmountViewAnimators();
    this.unmountViewProperties();
    this.unmountViewServices();
    this.setViewFlags(this.viewFlags & (~View.ViewFlagMask | View.RemovingFlag));
  }

  /** @hidden */
  protected unmountChildViews(): void {
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
  }

  override cascadePower(): void {
    if ((this.viewFlags & View.PoweredFlag) === 0) {
      this.setViewFlags(this.viewFlags | (View.PoweredFlag | View.TraversingFlag));
      try {
        this.willPower();
        this.onPower();
        this.powerChildViews();
        this.didPower();
      } finally {
        this.setViewFlags(this.viewFlags & ~View.TraversingFlag);
      }
    } else {
      throw new Error("already powered");
    }
  }

  /** @hidden */
  protected powerChildViews(): void {
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
  }

  override cascadeUnpower(): void {
    if ((this.viewFlags & View.PoweredFlag) !== 0) {
      this.setViewFlags(this.viewFlags & ~View.PoweredFlag | View.TraversingFlag);
      try {
        this.willUnpower();
        this.unpowerChildViews();
        this.onUnpower();
        this.didUnpower();
      } finally {
        this.setViewFlags(this.viewFlags & ~View.TraversingFlag);
      }
    } else {
      throw new Error("already unpowered");
    }
  }

  /** @hidden */
  protected unpowerChildViews(): void {
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
  }

  override setCulled(culled: boolean): void {
    const viewFlags = this.viewFlags;
    if (culled && (viewFlags & View.CulledFlag) === 0) {
      this.setViewFlags(viewFlags | View.CulledFlag);
      if ((viewFlags & View.CullFlag) === 0) {
        this.cullView();
      }
    } else if (!culled && (viewFlags & View.CulledFlag) !== 0) {
      this.setViewFlags(viewFlags & ~View.CulledFlag);
      if ((viewFlags & View.CullFlag) === 0) {
        this.uncullView();
      }
    }
  }

  override cascadeCull(): void {
    if ((this.viewFlags & View.CullFlag) === 0) {
      this.setViewFlags(this.viewFlags | View.CullFlag);
      if ((this.viewFlags & View.CulledFlag) === 0) {
        this.cullView();
      }
    }
  }

  /** @hidden */
  protected cullView(): void {
    this.setViewFlags(this.viewFlags | View.TraversingFlag);
    try {
      this.willCull();
      this.onCull();
      this.cullChildViews();
      this.didCull();
    } finally {
      this.setViewFlags(this.viewFlags & ~View.TraversingFlag);
    }
  }

  /** @hidden */
  protected cullChildViews(): void {
    const childNodes = this.node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = (childNodes[i]! as ViewNode).view;
      if (childView !== void 0) {
        childView.cascadeCull();
        if ((childView.viewFlags & View.RemovingFlag) !== 0) {
          childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
          this.removeChildView(childView);
          continue;
        }
      }
      i += 1;
    }
  }

  override cascadeUncull(): void {
    if ((this.viewFlags & View.CullFlag) !== 0) {
      this.setViewFlags(this.viewFlags & ~View.CullFlag);
      if ((this.viewFlags & View.CulledFlag) === 0) {
        this.uncullView();
      }
    }
  }

  /** @hidden */
  protected uncullView(): void {
    this.setViewFlags(this.viewFlags | View.TraversingFlag);
    try {
      this.willUncull();
      this.uncullChildViews();
      this.onUncull();
      this.didUncull();
    } finally {
      this.setViewFlags(this.viewFlags & ~View.TraversingFlag);
    }
  }

  /** @hidden */
  protected uncullChildViews(): void {
    const childNodes = this.node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = (childNodes[i]! as ViewNode).view;
      if (childView !== void 0) {
        childView.cascadeUncull();
        if ((childView.viewFlags & View.RemovingFlag) !== 0) {
          childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
          this.removeChildView(childView);
          continue;
        }
      }
      i += 1;
    }
  }

  override cascadeProcess(processFlags: ViewFlags, baseViewContext: ViewContext): void {
    const viewContext = this.extendViewContext(baseViewContext);
    processFlags &= ~View.NeedsProcess;
    processFlags |= this.viewFlags & View.UpdateMask;
    processFlags = this.needsProcess(processFlags, viewContext);
    if ((processFlags & View.ProcessMask) !== 0) {
      let cascadeFlags = processFlags;
      this.setViewFlags(this.viewFlags & ~(View.NeedsProcess | View.NeedsProject)
                                       |  (View.TraversingFlag | View.ProcessingFlag));
      try {
        this.willProcess(cascadeFlags, viewContext);
        if (((this.viewFlags | processFlags) & View.NeedsResize) !== 0) {
          cascadeFlags |= View.NeedsResize;
          this.setViewFlags(this.viewFlags & ~View.NeedsResize);
          this.willResize(viewContext);
        }
        if (((this.viewFlags | processFlags) & View.NeedsScroll) !== 0) {
          cascadeFlags |= View.NeedsScroll;
          this.setViewFlags(this.viewFlags & ~View.NeedsScroll);
          this.willScroll(viewContext);
        }
        if (((this.viewFlags | processFlags) & View.NeedsChange) !== 0) {
          cascadeFlags |= View.NeedsChange;
          this.setViewFlags(this.viewFlags & ~View.NeedsChange);
          this.willChange(viewContext);
        }
        if (((this.viewFlags | processFlags) & View.NeedsAnimate) !== 0) {
          cascadeFlags |= View.NeedsAnimate;
          this.setViewFlags(this.viewFlags & ~View.NeedsAnimate);
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
          this.processChildViews(cascadeFlags, viewContext, this.processChildView);
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
      } finally {
        this.setViewFlags(this.viewFlags & ~(View.TraversingFlag | View.ProcessingFlag));
      }
    }
  }

  protected override willResize(viewContext: ViewContextType<this>): void {
    super.willResize(viewContext);
    this.evaluateConstraintVariables();
  }

  protected override onChange(viewContext: ViewContextType<this>): void {
    super.onChange(viewContext);
    this.changeViewProperties();
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
  }

  override cascadeDisplay(displayFlags: ViewFlags, baseViewContext: ViewContext): void {
    const viewContext = this.extendViewContext(baseViewContext);
    displayFlags &= ~View.NeedsDisplay;
    displayFlags |= this.viewFlags & View.UpdateMask;
    displayFlags = this.needsDisplay(displayFlags, viewContext);
    if ((displayFlags & View.DisplayMask) !== 0) {
      let cascadeFlags = displayFlags;
      this.setViewFlags(this.viewFlags & ~(View.NeedsDisplay | View.NeedsRender | View.NeedsRasterize | View.NeedsComposite)
                                       |  (View.TraversingFlag | View.DisplayingFlag));
      try {
        this.willDisplay(cascadeFlags, viewContext);
        if (((this.viewFlags | displayFlags) & View.NeedsLayout) !== 0) {
          cascadeFlags |= View.NeedsLayout;
          this.setViewFlags(this.viewFlags & ~View.NeedsLayout);
          this.willLayout(viewContext);
        }

        this.onDisplay(cascadeFlags, viewContext);
        if ((cascadeFlags & View.NeedsLayout) !== 0) {
          this.onLayout(viewContext);
        }

        if ((cascadeFlags & View.DisplayMask) !== 0 && !this.isCulled()) {
          this.displayChildViews(cascadeFlags, viewContext, this.displayChildView);
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
  }

  override getLook<T>(look: Look<T, unknown>, mood?: MoodVector<Feel> | null): T | undefined {
    return void 0;
  }

  override getLookOr<T, E>(look: Look<T, unknown>, elseValue: E): T | E;
  override getLookOr<T, E>(look: Look<T, unknown>, mood: MoodVector<Feel> | null, elseValue: E): T | E;
  override getLookOr<T, E>(look: Look<T, unknown>, mood: MoodVector<Feel> | null | E, elseValue?: E): T | E {
    if (arguments.length === 2) {
      elseValue = mood as E;
      mood = null;
    }
    return elseValue as E;
  }

  override modifyMood(feel: Feel, updates: MoodVectorUpdates<Feel>, timing?: AnyTiming | boolean): void {
    // nop
  }

  override modifyTheme(feel: Feel, updates: MoodVectorUpdates<Feel>, timing?: AnyTiming | boolean): void {
    // nop
  }

  /** @hidden */
  readonly viewServices: {[serviceName: string]: ViewService<View, unknown> | undefined} | null;

  override hasViewService(serviceName: string): boolean {
    const viewServices = this.viewServices;
    return viewServices !== null && viewServices[serviceName] !== void 0;
  }

  override getViewService(serviceName: string): ViewService<this, unknown> | null {
    const viewServices = this.viewServices;
    if (viewServices !== null) {
      const viewService = viewServices[serviceName];
      if (viewService !== void 0) {
        return viewService as ViewService<this, unknown>;
      }
    }
    return null;
  }

  override setViewService(serviceName: string, newViewService: ViewService<this, unknown> | null): void {
    let viewServices = this.viewServices;
    if (viewServices === null) {
      viewServices = {};
      (this as Mutable<this>).viewServices = viewServices;
    }
    const oldViewService = viewServices[serviceName];
    if (oldViewService !== void 0 && this.isMounted()) {
      oldViewService.unmount();
    }
    if (newViewService !== null) {
      viewServices[serviceName] = newViewService;
      if (this.isMounted()) {
        newViewService.mount();
      }
    } else {
      delete viewServices[serviceName];
    }
  }

  /** @hidden */
  protected mountViewServices(): void {
    const viewServices = this.viewServices;
    for (const serviceName in viewServices) {
      const viewService = viewServices[serviceName]!;
      viewService.mount();
    }
  }

  /** @hidden */
  protected unmountViewServices(): void {
    const viewServices = this.viewServices;
    for (const serviceName in viewServices) {
      const viewService = viewServices[serviceName]!;
      viewService.unmount();
    }
  }

  /** @hidden */
  readonly viewProperties: {[propertyName: string]: ViewProperty<View, unknown> | undefined} | null;

  override hasViewProperty(propertyName: string): boolean {
    const viewProperties = this.viewProperties;
    return viewProperties !== null && viewProperties[propertyName] !== void 0;
  }

  override getViewProperty(propertyName: string): ViewProperty<this, unknown> | null {
    const viewProperties = this.viewProperties;
    if (viewProperties !== null) {
      const viewProperty = viewProperties[propertyName];
      if (viewProperty !== void 0) {
        return viewProperty as ViewProperty<this, unknown>;
      }
    }
    return null;
  }

  override setViewProperty(propertyName: string, newViewProperty: ViewProperty<this, unknown> | null): void {
    let viewProperties = this.viewProperties;
    if (viewProperties === null) {
      viewProperties = {};
      (this as Mutable<this>).viewProperties = viewProperties;
    }
    const oldViewProperty = viewProperties[propertyName];
    if (oldViewProperty !== void 0 && this.isMounted()) {
      oldViewProperty.unmount();
    }
    if (newViewProperty !== null) {
      viewProperties[propertyName] = newViewProperty;
      if (this.isMounted()) {
        newViewProperty.mount();
      }
    } else {
      delete viewProperties[propertyName];
    }
  }

  /** @hidden */
  changeViewProperties(): void {
    const viewProperties = this.viewProperties;
    for (const propertyName in viewProperties) {
      const viewProperty = viewProperties[propertyName]!;
      viewProperty.onChange();
    }
  }

  /** @hidden */
  protected mountViewProperties(): void {
    const viewProperties = this.viewProperties;
    for (const propertyName in viewProperties) {
      const viewProperty = viewProperties[propertyName]!;
      viewProperty.mount();
    }
  }

  /** @hidden */
  protected unmountViewProperties(): void {
    const viewProperties = this.viewProperties;
    for (const propertyName in viewProperties) {
      const viewProperty = viewProperties[propertyName]!;
      viewProperty.unmount();
    }
  }

  /** @hidden */
  readonly viewAnimators: {[animatorName: string]: ViewAnimator<View, unknown> | undefined} | null;

  override hasViewAnimator(animatorName: string): boolean {
    const viewAnimators = this.viewAnimators;
    return viewAnimators !== null && viewAnimators[animatorName] !== void 0;
  }

  override getViewAnimator(animatorName: string): ViewAnimator<this, unknown> | null {
    const viewAnimators = this.viewAnimators;
    if (viewAnimators !== null) {
      const viewAnimator = viewAnimators[animatorName];
      if (viewAnimator !== void 0) {
        return viewAnimator as ViewAnimator<this, unknown>;
      }
    }
    return null;
  }

  override setViewAnimator(animatorName: string, newViewAnimator: ViewAnimator<this, unknown> | null): void {
    let viewAnimators = this.viewAnimators;
    if (viewAnimators === null) {
      viewAnimators = {};
      (this as Mutable<this>).viewAnimators = viewAnimators;
    }
    const oldViewAnimator = viewAnimators[animatorName];
    if (oldViewAnimator !== void 0 && this.isMounted()) {
      oldViewAnimator.unmount();
    }
    if (newViewAnimator !== null) {
      viewAnimators[animatorName] = newViewAnimator;
      if (this.isMounted()) {
        newViewAnimator.mount();
      }
    } else {
      delete viewAnimators[animatorName];
    }
  }

  /** @hidden */
  protected mountViewAnimators(): void {
    const viewAnimators = this.viewAnimators;
    for (const animatorName in viewAnimators) {
      const viewAnimator = viewAnimators[animatorName]!;
      viewAnimator.mount();
    }
  }

  /** @hidden */
  protected unmountViewAnimators(): void {
    const viewAnimators = this.viewAnimators;
    for (const animatorName in viewAnimators) {
      const viewAnimator = viewAnimators[animatorName]!;
      viewAnimator.unmount();
    }
  }

  /** @hidden */
  readonly viewFasteners: {[fastenerName: string]: ViewFastener<View, View> | undefined} | null;

  override hasViewFastener(fastenerName: string): boolean {
    const viewFasteners = this.viewFasteners;
    return viewFasteners !== null && viewFasteners[fastenerName] !== void 0;
  }

  override getViewFastener(fastenerName: string): ViewFastener<this, View> | null {
    const viewFasteners = this.viewFasteners;
    if (viewFasteners !== null) {
      const viewFastener = viewFasteners[fastenerName];
      if (viewFastener !== void 0) {
        return viewFastener as ViewFastener<this, View>;
      }
    }
    return null;
  }

  override setViewFastener(fastenerName: string, newViewFastener: ViewFastener<this, any> | null): void {
    let viewFasteners = this.viewFasteners;
    if (viewFasteners === null) {
      viewFasteners = {};
      (this as Mutable<this>).viewFasteners = viewFasteners;
    }
    const oldViewFastener = viewFasteners[fastenerName];
    if (oldViewFastener !== void 0 && this.isMounted()) {
      oldViewFastener.unmount();
    }
    if (newViewFastener !== null) {
      viewFasteners[fastenerName] = newViewFastener;
      if (this.isMounted()) {
        newViewFastener.mount();
      }
    } else {
      delete viewFasteners[fastenerName];
    }
  }

  /** @hidden */
  protected mountViewFasteners(): void {
    const viewFasteners = this.viewFasteners;
    for (const fastenerName in viewFasteners) {
      const viewFastener = viewFasteners[fastenerName]!;
      viewFastener.mount();
    }
  }

  /** @hidden */
  protected unmountViewFasteners(): void {
    const viewFasteners = this.viewFasteners;
    for (const fastenerName in viewFasteners) {
      const viewFastener = viewFasteners[fastenerName]!;
      viewFastener.unmount();
    }
  }

  /** @hidden */
  protected insertViewFastener(childView: View, targetView: View | null): void {
    const fastenerName = childView.key;
    if (fastenerName !== void 0) {
      const viewFastener = this.getLazyViewFastener(fastenerName);
      if (viewFastener !== null && viewFastener.child === true) {
        viewFastener.doSetView(childView, targetView);
      }
    }
  }

  /** @hidden */
  protected removeViewFastener(childView: View): void {
    const fastenerName = childView.key;
    if (fastenerName !== void 0) {
      const viewFastener = this.getViewFastener(fastenerName);
      if (viewFastener !== null && viewFastener.child === true) {
        viewFastener.doSetView(null, null);
      }
    }
  }

  /** @hidden */
  readonly gestures: {[gestureName: string]: Gesture<View, View> | undefined} | null;

  override hasGesture(gestureName: string): boolean {
    const gestures = this.gestures;
    return gestures !== null && gestures[gestureName] !== void 0;
  }

  override getGesture(gestureName: string): Gesture<this, View> | null {
    const gestures = this.gestures;
    if (gestures !== null) {
      const gesture = gestures[gestureName];
      if (gesture !== void 0) {
        return gesture as Gesture<this, View>;
      }
    }
    return null;
  }

  override setGesture(gestureName: string, newGesture: Gesture<this, any> | null): void {
    let gestures = this.gestures;
    if (gestures === null) {
      gestures = {};
      (this as Mutable<this>).gestures = gestures;
    }
    const oldGesture = gestures[gestureName];
    if (oldGesture !== void 0 && this.isMounted()) {
      oldGesture.unmount();
    }
    if (newGesture !== null) {
      gestures[gestureName] = newGesture;
      if (this.isMounted()) {
        newGesture.mount();
      }
    } else {
      delete gestures[gestureName];
    }
  }

  /** @hidden */
  protected mountGestures(): void {
    const gestures = this.gestures;
    for (const gestureName in gestures) {
      const gesture = gestures[gestureName]!;
      gesture.mount();
    }
    GestureContext.initGestures(this);
  }

  /** @hidden */
  protected unmountGestures(): void {
    const gestures = this.gestures;
    for (const gestureName in gestures) {
      const gesture = gestures[gestureName]!;
      gesture.unmount();
    }
  }

  /** @hidden */
  protected insertGesture(childView: View, targetView: View | null): void {
    const gestureName = childView.key;
    if (gestureName !== void 0) {
      const gesture = this.getLazyGesture(gestureName);
      if (gesture !== null && gesture.child === true) {
        gesture.setView(childView, targetView);
      }
    }
  }

  /** @hidden */
  protected removeGesture(childView: View): void {
    const gestureName = childView.key;
    if (gestureName !== void 0) {
      const gesture = this.getGesture(gestureName);
      if (gesture !== null && gesture.child === true) {
        gesture.setView(null, null);
      }
    }
  }

  readonly constraints: ReadonlyArray<Constraint>;

  override hasConstraint(constraint: Constraint): boolean {
    return this.constraints.indexOf(constraint) >= 0;
  }

  override addConstraint(constraint: Constraint): void {
    const oldConstraints = this.constraints;
    const newConstraints = Arrays.inserted(constraint, oldConstraints);
    if (oldConstraints !== newConstraints) {
      (this as Mutable<this>).constraints = newConstraints;
      this.activateConstraint(constraint);
    }
  }

  override removeConstraint(constraint: Constraint): void {
    const oldConstraints = this.constraints;
    const newConstraints = Arrays.removed(constraint, oldConstraints);
    if (oldConstraints !== newConstraints) {
      this.deactivateConstraint(constraint);
      (this as Mutable<this>).constraints = newConstraints;
    }
  }

  readonly constraintVariables: ReadonlyArray<ConstraintVariable>;

  override hasConstraintVariable(constraintVariable: ConstraintVariable): boolean {
    return this.constraintVariables.indexOf(constraintVariable) >= 0;
  }

  override addConstraintVariable(constraintVariable: ConstraintVariable): void {
    const oldConstraintVariables = this.constraintVariables;
    const newConstraintVariables = Arrays.inserted(constraintVariable, oldConstraintVariables);
    if (oldConstraintVariables !== newConstraintVariables) {
      (this as Mutable<this>).constraintVariables = newConstraintVariables;
      this.activateConstraintVariable(constraintVariable);
    }
  }

  override removeConstraintVariable(constraintVariable: ConstraintVariable): void {
    const oldConstraintVariables = this.constraintVariables;
    const newConstraintVariables = Arrays.removed(constraintVariable, oldConstraintVariables);
    if (oldConstraintVariables !== newConstraintVariables) {
      this.deactivateConstraintVariable(constraintVariable);
      (this as Mutable<this>).constraintVariables = newConstraintVariables;
    }
  }

  /** @hidden */
  evaluateConstraintVariables(): void {
    const constraintVariables = this.constraintVariables;
    for (let i = 0, n = constraintVariables.length; i < n; i += 1) {
      const constraintVariable = constraintVariables[i]!;
      constraintVariable.evaluateConstraintVariable();
    }
  }

  /** @hidden */
  activateLayout(): void {
    const layoutManager = this.layoutService.manager;
    if (layoutManager !== void 0 && layoutManager !== null) {
      const constraints = this.constraints;
      for (let i = 0, n = constraints.length; i < n; i += 1) {
        layoutManager.activateConstraint(constraints[i]!);
      }
    }
  }

  /** @hidden */
  deactivateLayout(): void {
    const layoutManager = this.layoutService.manager;
    if (layoutManager !== void 0 && layoutManager !== null) {
      const constraints = this.constraints;
      for (let i = 0, n = constraints.length; i < n; i += 1) {
        layoutManager.deactivateConstraint(constraints[i]!);
      }
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

  /** @hidden */
  static mount(view: NodeView): void {
    const parentView = view.parentView;
    if (parentView !== null) {
      view.setParentView(parentView, null);
      view.cascadeInsert();
    } else {
      view.mount();
    }
  }

  static fromNode(node: ViewNode): NodeView {
    if (node.view instanceof this) {
      return node.view;
    } else if (node instanceof Element) {
      return ElementView.fromNode(node as ViewElement);
    } else if (node instanceof Text) {
      return TextView.fromNode(node);
    } else {
      const view = new NodeView(node);
      this.mount(view);
      return view;
    }
  }

  static fromConstructor<V extends NodeView>(viewConstructor: NodeViewConstructor<V>): V;
  static fromConstructor<V extends View>(viewConstructor: ViewConstructor): V;
  static fromConstructor(viewConstructor: NodeViewConstructor | ViewConstructor): View;
  static fromConstructor(viewConstructor: NodeViewConstructor | ViewConstructor): View {
    if (viewConstructor.prototype instanceof ElementView) {
      return ElementView.fromConstructor(viewConstructor as NodeViewConstructor);
    } else if (viewConstructor.prototype instanceof TextView) {
      return TextView.fromConstructor(viewConstructor as unknown as TextViewConstructor);
    } else if (viewConstructor.prototype instanceof View) {
      return new (viewConstructor as ViewConstructor)();
    } else {
      throw new TypeError("" + viewConstructor);
    }
  }

  static fromAny(value: NodeView | Node): NodeView {
    if (value instanceof NodeView) {
      return value;
    } else if (value instanceof Node) {
      return this.fromNode(value);
    }
    throw new TypeError("" + value);
  }
}

ModalManager.insertModalView = function (modalView: View): void {
  const matteNode = document.body as ViewNode;
  const matteView = matteNode.view;
  if (matteView !== void 0) {
    matteView.appendChildView(modalView);
  } else if (modalView instanceof NodeView) {
    matteNode.appendChild(modalView.node);
    modalView.mount();
  } else {
    throw new TypeError("" + modalView);
  }
};
