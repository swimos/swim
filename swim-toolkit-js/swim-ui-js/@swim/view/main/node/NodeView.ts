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
import {Transform} from "@swim/transform";
import {Animator} from "@swim/animate";
import {ViewScope} from "../scope/ViewScope";
import {ViewContext} from "../ViewContext";
import {ViewControllerType, ViewFlags, View} from "../View";
import {ViewObserver} from "../ViewObserver";
import {LayoutAnchor} from "../layout/LayoutAnchor";
import {LayoutView} from "../layout/LayoutView";
import {MemberAnimator} from "../member/MemberAnimator";
import {AnimatedViewClass, AnimatedView} from "../animated/AnimatedView";
import {AnimatedViewObserver} from "../animated/AnimatedViewObserver";
import {NodeViewObserver} from "./NodeViewObserver";
import {NodeViewController} from "./NodeViewController";

export interface ViewNode extends Node {
  view?: NodeView;
}

export type ViewNodeType<V extends NodeView> = V extends {readonly node: infer N} ? N : Node;

export class NodeView extends View implements AnimatedView {
  /** @hidden */
  readonly _node: ViewNodeType<this>;
  /** @hidden */
  _key?: string;
  /** @hidden */
  _childViewMap?: {[key: string]: View | undefined};
  /** @hidden */
  _viewController: ViewControllerType<this> | null;
  /** @hidden */
  _viewObservers?: ViewObserver[];
  /** @hidden */
  _viewFlags: ViewFlags;
  /** @hidden */
  _viewScopes?: {[scopeName: string]: ViewScope<View, unknown> | undefined};
  /** @hidden */
  _layoutAnchors?: {[anchorName: string]: LayoutAnchor<LayoutView> | undefined};
  /** @hidden */
  _memberAnimators?: {[animatorName: string]: Animator | undefined};

  constructor(node: Node) {
    super();
    this._node = node as ViewNodeType<this>;
    this._node.view = this;
    this._viewController = null;
    this._viewFlags = 0;
    this.initNode(this._node);
  }

  get node(): ViewNode {
    return this._node;
  }

  protected initNode(node: ViewNodeType<this>): void {
    // hook
  }

  get viewController(): NodeViewController | null {
    return this._viewController;
  }

  setViewController(newViewController: ViewControllerType<this> | null): void {
    const oldViewController = this._viewController;
    if (oldViewController !== newViewController) {
      this.willSetViewController(newViewController);
      if (oldViewController !== null) {
        oldViewController.setView(null);
      }
      this._viewController = newViewController;
      if (newViewController !== null) {
        newViewController.setView(this);
      }
      this.onSetViewController(newViewController);
      this.didSetViewController(newViewController);
    }
  }

  get viewObservers(): ReadonlyArray<ViewObserver> {
    let viewObservers = this._viewObservers;
    if (viewObservers === void 0) {
      viewObservers = [];
      this._viewObservers = viewObservers;
    }
    return viewObservers;
  }

  addViewObserver(viewObserver: ViewObserver): void {
    let viewObservers = this._viewObservers;
    let index: number;
    if (viewObservers === void 0) {
      viewObservers = [];
      this._viewObservers = viewObservers;
      index = -1;
    } else {
      index = viewObservers.indexOf(viewObserver);
    }
    if (index < 0) {
      this.willAddViewObserver(viewObserver);
      viewObservers.push(viewObserver);
      this.onAddViewObserver(viewObserver);
      this.didAddViewObserver(viewObserver);
    }
  }

  removeViewObserver(viewObserver: ViewObserver): void {
    const viewObservers = this._viewObservers;
    if (viewObservers !== void 0) {
      const index = viewObservers.indexOf(viewObserver);
      if (index >= 0) {
        this.willRemoveViewObserver(viewObserver);
        viewObservers.splice(index, 1);
        this.onRemoveViewObserver(viewObserver);
        this.didRemoveViewObserver(viewObserver);
      }
    }
  }

  text(): string | null;
  text(value: string | null): this;
  text(value?: string | null): string | null | this {
    if (value === void 0) {
      return this._node.textContent;
    } else {
      this._node.textContent = value;
      return this;
    }
  }

  get key(): string | null {
    const key = this._key;
    return key !== void 0 ? key : null;
  }

  /** @hidden */
  setKey(key: string | null): void {
    if (key !== null) {
      this._key = key;
    } else if (this._key !== void 0) {
      this._key = void 0;
    }
  }

  get parentView(): View | null {
    const parentNode: ViewNode | null = this._node.parentNode;
    if (parentNode !== null) {
      const parentView = parentNode.view;
      if (parentView instanceof View) {
        return parentView;
      }
    }
    return null;
  }

  /** @hidden */
  setParentView(newParentView: View | null, oldParentView: View | null): void {
    this.willSetParentView(newParentView, oldParentView);
    this.onSetParentView(newParentView, oldParentView);
    this.didSetParentView(newParentView, oldParentView);
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
    return childViews;
  }

  getChildView(key: string): View | null {
    const childViewMap = this._childViewMap;
    if (childViewMap !== void 0) {
      const childView = childViewMap[key];
      if (childView !== void 0) {
        return childView;
      }
    }
    return null;
  }

  setChildView(key: string, newChildView: View | null): View | null {
    if (newChildView !== null) {
      if (!(newChildView instanceof NodeView)) {
        throw new TypeError("" + newChildView);
      }
      newChildView.remove();
    }
    let oldChildView: View | null = null;
    let targetNode: Node | null = null;
    const childViewMap = this._childViewMap;
    if (childViewMap !== void 0) {
      const childView = childViewMap[key];
      if (childView !== void 0) {
        oldChildView = childView;
        if (!(childView instanceof NodeView)) {
          throw new TypeError("" + childView);
        }
        const childNode = childView._node;
        targetNode = childNode.nextSibling;
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
      const newChildNode = newChildView._node;
      const targetView = targetNode !== null ? (targetNode as ViewNode).view : null;
      newChildView.setKey(key);
      this.willInsertChildView(newChildView, targetView);
      this.willInsertChildNode(newChildNode, targetNode);
      this._node.insertBefore(newChildNode, targetNode);
      this.insertChildViewMap(newChildView);
      newChildView.setParentView(this, null);
      this.onInsertChildNode(newChildNode, targetNode);
      this.onInsertChildView(newChildView, targetView);
      this.didInsertChildNode(newChildNode, targetNode);
      this.didInsertChildView(newChildView, targetView);
    }
    return oldChildView;
  }

  /** @hidden */
  protected insertChildViewMap(childView: View): void {
    const key = childView.key;
    if (key !== null) {
      let childViewMap = this._childViewMap;
      if (childViewMap === void 0) {
        childViewMap = {};
        this._childViewMap = childViewMap;
      }
      childViewMap[key] = childView;
    }
  }

  /** @hidden */
  protected removeChildViewMap(childView: View): void {
    const childViewMap = this._childViewMap;
    if (childViewMap !== void 0) {
      const key = childView.key;
      if (key !== null) {
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

  appendChildView(childView: View, key?: string): void {
    if (!(childView instanceof NodeView)) {
      throw new TypeError("" + childView);
    }
    childView.remove();
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    const childNode = childView._node;
    this.willInsertChildView(childView, null);
    this.willInsertChildNode(childNode, null);
    this._node.appendChild(childNode);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildNode(childNode, null);
    this.onInsertChildView(childView, null);
    this.didInsertChildNode(childNode, null);
    this.didInsertChildView(childView, null);
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
    this._node.appendChild(childNode);
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

  prependChildView(childView: View, key?: string): void {
    if (!(childView instanceof NodeView)) {
      throw new TypeError("" + childView);
    }
    childView.remove();
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    const childNode = childView._node;
    const targetNode = this._node.firstChild as ViewNode | null;
    const targetView = targetNode !== null ? targetNode.view : null;
    this.willInsertChildView(childView, targetView);
    this.willInsertChildNode(childNode, targetNode);
    this._node.insertBefore(childNode, targetNode);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildNode(childNode, targetNode);
    this.onInsertChildView(childView, targetView);
    this.didInsertChildNode(childNode, targetNode);
    this.didInsertChildView(childView, targetView);
  }

  prependChildNode(childNode: Node, key?: string): void {
    const childView = (childNode as ViewNode).view;
    const targetNode = this._node.firstChild as ViewNode | null;
    const targetView = targetNode !== null ? targetNode.view : null;
    if (childView !== void 0) {
      childView.remove();
      if (key !== void 0) {
        this.removeChildView(key);
        childView.setKey(key);
      }
      this.willInsertChildView(childView, targetView);
    }
    this.willInsertChildNode(childNode, targetNode);
    this._node.insertBefore(childNode, targetNode);
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
    }
  }

  insertChild(child: View | Node, target: View | Node | null, key?: string): void {
    if (child instanceof NodeView) {
      if (target instanceof View) {
        this.insertChildView(child, target, key);
      } else if (target instanceof Node || target === null) {
        this.insertChildNode(child._node, target, key);
      } else {
        throw new TypeError("" + target);
      }
    } else if (child instanceof Node) {
      if (target instanceof NodeView) {
        this.insertChildNode(child, target._node, key);
      } else if (target instanceof Node || target === null) {
        this.insertChildNode(child, target, key);
      } else {
        throw new TypeError("" + target);
      }
    } else {
      throw new TypeError("" + child);
    }
  }

  insertChildView(childView: View, targetView: View | null, key?: string): void {
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
    const childNode = childView._node;
    const targetNode = targetView !== null ? targetView._node : null;
    this.willInsertChildView(childView, targetView);
    this.willInsertChildNode(childNode, targetNode);
    this._node.insertBefore(childNode, targetNode);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildNode(childNode, targetNode);
    this.onInsertChildView(childView, targetView);
    this.didInsertChildNode(childNode, targetNode);
    this.didInsertChildView(childView, targetView);
  }

  insertChildNode(childNode: Node, targetNode: Node | null, key?: string): void {
    const childView = (childNode as ViewNode).view;
    const targetView = targetNode !== null ? (targetNode as ViewNode).view : null;
    if (childView !== void 0) {
      childView.remove();
      if (key !== void 0) {
        this.removeChildView(key);
        childView.setKey(key);
      }
      this.willInsertChildView(childView, targetView);
    }
    this.willInsertChildNode(childNode, targetNode);
    this._node.insertBefore(childNode, targetNode);
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
    }
  }

  /** @hidden */
  injectChildView(childView: NodeView, targetView: NodeView | null, key?: string): void {
    if (key !== void 0) {
      this.removeChildView(key);
      childView.setKey(key);
    }
    const childNode = childView._node;
    const targetNode = targetView !== null ? targetView._node : null;
    this.willInsertChildView(childView, targetView);
    this.willInsertChildNode(childNode, targetNode);
    this.insertChildViewMap(childView);
    childView.setParentView(this, null);
    this.onInsertChildNode(childNode, targetNode);
    this.onInsertChildView(childView, targetView);
    this.didInsertChildNode(childNode, targetNode);
    this.didInsertChildView(childView, targetView);
  }

  protected willInsertChildNode(childNode: Node, targetNode: Node | null): void {
    this.willObserve(function (viewObserver: NodeViewObserver): void {
      if (viewObserver.viewWillInsertChildNode !== void 0) {
        viewObserver.viewWillInsertChildNode(childNode, targetNode, this);
      }
    });
  }

  protected onInsertChildNode(childNode: Node, targetNode: Node | null): void {
    this.requireUpdate(View.NeedsLayout);
  }

  protected didInsertChildNode(childNode: Node, targetNode: Node | null): void {
    this.didObserve(function (viewObserver: NodeViewObserver): void {
      if (viewObserver.viewDidInsertChildNode !== void 0) {
        viewObserver.viewDidInsertChildNode(childNode, targetNode, this);
      }
    });
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
    if (!(childView instanceof NodeView)) {
      throw new TypeError("" + childView);
    }
    const childNode = childView._node;
    if (childNode.parentNode !== this._node) {
      throw new Error("not a child view");
    }
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
    if (typeof key === "string") {
      return childView;
    }
  }

  removeChildNode(childNode: Node): void {
    if (childNode.parentNode !== this._node) {
      throw new Error("not a child node")
    }
    const childView = (childNode as ViewNode).view;
    if (childView !== void 0) {
      this.willRemoveChildView(childView);
    }
    this.willRemoveChildNode(childNode);
    this._node.removeChild(childNode);
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
      childView.setKey(null);
    }
  }

  removeAll(): void {
    do {
      const childNode = this._node.lastChild as ViewNode | null;
      if (childNode !== null) {
        const childView = childNode.view;
        if (childView !== void 0) {
          this.willRemoveChildView(childView);
        }
        this.willRemoveChildNode(childNode);
        this._node.removeChild(childNode);
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
          childView.setKey(null);
        }
        continue;
      }
      break;
    } while (true);
  }

  remove(): void {
    const node = this._node;
    const parentNode: ViewNode | null = node.parentNode;
    if (parentNode !== null) {
      const parentView = parentNode.view;
      if (parentView !== void 0) {
        if ((this._viewFlags & View.UpdatingMask) === 0) {
          parentView.removeChildView(this);
        } else {
          this._viewFlags |= View.RemovingFlag;
        }
      } else {
        parentNode.removeChild(node);
        this.setParentView(null, this);
        this.setKey(null);
      }
    }
  }

  protected willRemoveChildNode(childNode: Node): void {
    this.willObserve(function (viewObserver: NodeViewObserver): void {
      if (viewObserver.viewWillRemoveChildNode !== void 0) {
        viewObserver.viewWillRemoveChildNode(childNode, this);
      }
    });
  }

  protected onRemoveChildNode(childNode: Node): void {
    this.requireUpdate(View.NeedsLayout);
  }

  protected didRemoveChildNode(childNode: Node): void {
    this.didObserve(function (viewObserver: NodeViewObserver): void {
      if (viewObserver.viewDidRemoveChildNode !== void 0) {
        viewObserver.viewDidRemoveChildNode(childNode, this);
      }
    });
  }

  /** @hidden */
  get viewFlags(): ViewFlags {
    return this._viewFlags;
  }

  /** @hidden */
  setViewFlags(viewFlags: ViewFlags): void {
    this._viewFlags = viewFlags;
  }

  /** @hidden */
  isNodeMounted(): boolean {
    let node: Node = this._node;
    do {
      const parentNode = node.parentNode;
      if (parentNode !== null) {
        if (parentNode.nodeType === Node.DOCUMENT_NODE) {
          return true;
        }
        node = parentNode;
        continue;
      }
      break;
    } while (true);
    return false;
  }

  cascadeMount(): void {
    if ((this._viewFlags & View.MountedFlag) === 0) {
      this._viewFlags |= View.MountedFlag;
      this.willMount();
      this.onMount();
      this.doMountChildViews();
      this.didMount();
    } else {
      throw new Error("already mounted");
    }
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
  }

  cascadeUnmount(): void {
    if ((this._viewFlags & View.MountedFlag) !== 0) {
      this._viewFlags &= ~View.MountedFlag
      this.willUnmount();
      this.doUnmountChildViews();
      this.onUnmount();
      this.didUnmount();
    } else {
      throw new Error("already unmounted");
    }
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
  }

  protected onUnmount(): void {
    this.cancelAnimators();
    this._viewFlags = 0;
  }

  cascadePower(): void {
    if ((this._viewFlags & View.PoweredFlag) === 0) {
      this._viewFlags |= View.PoweredFlag;
      this.willPower();
      this.onPower();
      this.doPowerChildViews();
      this.didPower();
    } else {
      throw new Error("already powered");
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
  }

  cascadeUnpower(): void {
    if ((this._viewFlags & View.PoweredFlag) !== 0) {
      this._viewFlags &= ~View.PoweredFlag
      this.willUnpower();
      this.doUnpowerChildViews();
      this.onUnpower();
      this.didUnpower();
    } else {
      throw new Error("already unpowered");
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
  }

  cascadeProcess(processFlags: ViewFlags, viewContext: ViewContext): void {
    processFlags = this._viewFlags | processFlags;
    processFlags = this.needsProcess(processFlags, viewContext);
    this.doProcess(processFlags, viewContext);
  }

  /** @hidden */
  protected doProcess(processFlags: ViewFlags, viewContext: ViewContext): void {
    let cascadeFlags = processFlags;
    this._viewFlags &= ~(View.NeedsProcess | View.NeedsResize | View.NeedsProject);
    this.willProcess(viewContext);
    this._viewFlags |= View.ProcessingFlag;
    try {
      if (((this._viewFlags | processFlags) & View.NeedsScroll) !== 0) {
        cascadeFlags |= View.NeedsScroll;
        this._viewFlags &= ~View.NeedsScroll;
        this.willScroll(viewContext);
      }
      if (((this._viewFlags | processFlags) & View.NeedsDerive) !== 0) {
        cascadeFlags |= View.NeedsDerive;
        this._viewFlags &= ~View.NeedsDerive;
        this.willDerive(viewContext);
      }
      if (((this._viewFlags | processFlags) & View.NeedsAnimate) !== 0) {
        cascadeFlags |= View.NeedsAnimate;
        this._viewFlags &= ~View.NeedsAnimate;
        this.willAnimate(viewContext);
      }

      this.onProcess(viewContext);
      if ((cascadeFlags & View.NeedsScroll) !== 0) {
        this.onScroll(viewContext);
      }
      if ((cascadeFlags & View.NeedsDerive) !== 0) {
        this.onDerive(viewContext);
      }
      if ((cascadeFlags & View.NeedsAnimate) !== 0) {
        this.onAnimate(viewContext);
      }

      this.doProcessChildViews(cascadeFlags, viewContext);

      if ((cascadeFlags & View.NeedsAnimate) !== 0) {
        this.didAnimate(viewContext);
      }
      if ((cascadeFlags & View.NeedsDerive) !== 0) {
        this.didDerive(viewContext);
      }
      if ((cascadeFlags & View.NeedsScroll) !== 0) {
        this.didScroll(viewContext);
      }
    } finally {
      this._viewFlags &= ~View.ProcessingFlag;
      this.didProcess(viewContext);
    }
  }

  protected willAnimate(viewContext: ViewContext): void {
    this.willObserve(function (viewObserver: AnimatedViewObserver): void {
      if (viewObserver.viewWillAnimate !== void 0) {
        viewObserver.viewWillAnimate(viewContext, this);
      }
    });
  }

  protected onAnimate(viewContext: ViewContext): void {
    this.animateMembers(viewContext.updateTime);
  }

  protected didAnimate(viewContext: ViewContext): void {
    this.didObserve(function (viewObserver: AnimatedViewObserver): void {
      if (viewObserver.viewDidAnimate !== void 0) {
        viewObserver.viewDidAnimate(viewContext, this);
      }
    });
  }

  /** @hidden */
  protected doProcessChildViews(processFlags: ViewFlags, viewContext: ViewContext): void {
    const childNodes = this._node.childNodes;
    if ((processFlags & View.ProcessMask) !== 0 && childNodes.length !== 0) {
      this.willProcessChildViews(viewContext);
      let i = 0;
      while (i < childNodes.length) {
        const childView = (childNodes[i] as ViewNode).view;
        if (childView !== void 0) {
          this.doProcessChildView(childView, processFlags, viewContext);
          if ((childView._viewFlags & View.RemovingFlag) !== 0) {
            childView._viewFlags &= ~View.RemovingFlag;
            this.removeChildView(childView);
            continue;
          }
        }
        i += 1;
      }
      this.didProcessChildViews(viewContext);
    }
  }

  cascadeDisplay(displayFlags: ViewFlags, viewContext: ViewContext): void {
    displayFlags = this._viewFlags | displayFlags;
    displayFlags = this.needsDisplay(displayFlags, viewContext);
    this.doDisplay(displayFlags, viewContext);
  }

  /** @hidden */
  protected doDisplay(displayFlags: ViewFlags, viewContext: ViewContext): void {
    let cascadeFlags = displayFlags;
    this._viewFlags &= ~(View.NeedsDisplay | View.NeedsRender | View.NeedsComposite);
    this.willDisplay(viewContext);
    this._viewFlags |= View.DisplayingFlag;
    try {
      if (((this._viewFlags | displayFlags) & View.NeedsLayout) !== 0) {
        cascadeFlags |= View.NeedsLayout;
        this._viewFlags &= ~View.NeedsLayout;
        this.willLayout(viewContext);
      }

      this.onDisplay(viewContext);
      if ((cascadeFlags & View.NeedsLayout) !== 0) {
        this.onLayout(viewContext);
      }

      this.doDisplayChildViews(cascadeFlags, viewContext);

      if ((cascadeFlags & View.NeedsLayout) !== 0) {
        this.didLayout(viewContext);
      }
    } finally {
      this._viewFlags &= ~View.DisplayingFlag;
      this.didDisplay(viewContext);
    }
  }

  /** @hidden */
  protected doDisplayChildViews(displayFlags: ViewFlags, viewContext: ViewContext): void {
    const childNodes = this._node.childNodes;
    if ((displayFlags & View.DisplayMask) !== 0 && childNodes.length !== 0) {
      this.willDisplayChildViews(viewContext);
      let i = 0;
      while (i < childNodes.length) {
        const childView = (childNodes[i] as ViewNode).view;
        if (childView !== void 0) {
          this.doDisplayChildView(childView, displayFlags, viewContext);
          if ((childView._viewFlags & View.RemovingFlag) !== 0) {
            childView._viewFlags &= ~View.RemovingFlag;
            this.removeChildView(childView);
            continue;
          }
        }
        i += 1;
      }
      this.didDisplayChildViews(viewContext);
    }
  }

  hasViewScope(scopeName: string): boolean {
    const viewScopes = this._viewScopes;
    return viewScopes !== void 0 && viewScopes[scopeName] !== void 0;
  }

  getViewScope(scopeName: string): ViewScope<View, unknown> | null {
    const viewScopes = this._viewScopes;
    return viewScopes !== void 0 ? viewScopes[scopeName] || null : null;
  }

  setViewScope(scopeName: string, viewScope: ViewScope<View, unknown> | null): void {
    let viewScopes = this._viewScopes;
    if (viewScopes === void 0) {
      viewScopes = {};
      this._viewScopes = viewScopes;
    }
    if (viewScope !== null) {
      viewScopes[scopeName] = viewScope;
    } else {
      delete viewScopes[scopeName];
    }
  }

  hasLayoutAnchor(anchorName: string): boolean {
    const layoutAnchors = this._layoutAnchors;
    return layoutAnchors !== void 0 && layoutAnchors[anchorName] !== void 0;
  }

  getLayoutAnchor(anchorName: string): LayoutAnchor<LayoutView> | null {
    const layoutAnchors = this._layoutAnchors;
    return layoutAnchors !== void 0 ? layoutAnchors[anchorName] || null : null;
  }

  setLayoutAnchor(anchorName: string, layoutAnchor: LayoutAnchor<LayoutView> | null): void {
    let layoutAnchors = this._layoutAnchors;
    if (layoutAnchors === void 0) {
      layoutAnchors = {};
      this._layoutAnchors = layoutAnchors;
    }
    if (layoutAnchor !== null) {
      layoutAnchors[anchorName] = layoutAnchor;
    } else {
      delete layoutAnchors[anchorName];
    }
  }

  hasMemberAnimator(animatorName: string): boolean {
    const memberAnimators = this._memberAnimators;
    return memberAnimators !== void 0 && memberAnimators[animatorName] !== void 0;
  }

  getMemberAnimator(animatorName: string): Animator | null {
    const memberAnimators = this._memberAnimators;
    return memberAnimators !== void 0 ? memberAnimators[animatorName] || null : null;
  }

  setMemberAnimator(animatorName: string, animator: Animator | null): void {
    let memberAnimators = this._memberAnimators;
    if (memberAnimators === void 0) {
      memberAnimators = {};
      this._memberAnimators = memberAnimators;
    }
    if (animator !== null) {
      memberAnimators[animatorName] = animator;
    } else {
      delete memberAnimators[animatorName];
    }
  }

  /** @hidden */
  getLazyMemberAnimator(animatorName: string): Animator | null {
    let memberAnimator = this.getMemberAnimator(animatorName);
    if (memberAnimator === null) {
      const viewClass = (this as any).__proto__ as AnimatedViewClass;
      const descriptor = AnimatedView.getMemberAnimatorDescriptor(animatorName, viewClass);
      if (descriptor !== null && descriptor.animatorType !== void 0) {
        memberAnimator = AnimatedView.initMemberAnimator(descriptor.animatorType, this, animatorName, descriptor);
        this.setMemberAnimator(animatorName, memberAnimator);
      }
    }
    return memberAnimator;
  }

  /** @hidden */
  animatorDidSetAuto(animator: Animator, auto: boolean): void {
    if (animator instanceof MemberAnimator) {
      this.requireUpdate(View.NeedsDerive);
    }
  }

  /** @hidden */
  animateMembers(t: number): void {
    const memberAnimators = this._memberAnimators;
    if (memberAnimators !== void 0) {
      for (const animatorName in memberAnimators) {
        const animator = memberAnimators[animatorName]!;
        animator.onFrame(t);
      }
    }
  }

  animate(animator: Animator): void {
    this.requireUpdate(View.NeedsAnimate);
  }

  /** @hidden */
  cancelAnimators(): void {
    this.cancelMemberAnimators();
  }

  /** @hidden */
  cancelMemberAnimators(): void {
    const memberAnimators = this._memberAnimators;
    if (memberAnimators !== void 0) {
      for (const animatorName in memberAnimators) {
        const animator = memberAnimators[animatorName]!;
        animator.cancel();
      }
    }
  }

  get parentTransform(): Transform {
    return Transform.identity();
  }

  get clientBounds(): BoxR2 {
    const range = document.createRange();
    range.selectNode(this._node);
    const bounds = range.getBoundingClientRect();
    range.detach();
    return new BoxR2(bounds.left, bounds.top, bounds.right, bounds.bottom);
  }

  get pageBounds(): BoxR2 {
    const range = document.createRange();
    range.selectNode(this._node);
    const bounds = range.getBoundingClientRect();
    range.detach();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;
    return new BoxR2(bounds.left + scrollX, bounds.top + scrollY,
                     bounds.right + scrollX, bounds.bottom + scrollY);
  }

  dispatchEvent(event: Event): boolean {
    return this._node.dispatchEvent(event);
  }

  on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this {
    this._node.addEventListener(type, listener, options);
    return this;
  }

  off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this {
    this._node.removeEventListener(type, listener, options);
    return this;
  }
}
View.Node = NodeView;
