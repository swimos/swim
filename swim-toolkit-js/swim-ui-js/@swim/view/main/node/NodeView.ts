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
import {Transform} from "@swim/transform";
import {ConstrainVariable, Constraint} from "@swim/constraint";
import {ViewContextType, ViewContext} from "../ViewContext";
import {ViewFlags, ViewInit, View} from "../View";
import {ViewObserverType} from "../ViewObserver";
import {ViewControllerType} from "../ViewController";
import {Subview} from "../Subview";
import {ViewService} from "../service/ViewService";
import {ViewScope} from "../scope/ViewScope";
import {ViewAnimator} from "../animator/ViewAnimator";
import {LayoutAnchor} from "../layout/LayoutAnchor";
import {NodeViewObserver} from "./NodeViewObserver";
import {NodeViewController} from "./NodeViewController";

export interface ViewNode extends Node {
  view?: NodeView;
}

export type ViewNodeType<V extends NodeView> = V extends {readonly node: infer N} ? N : Node;

export interface NodeViewInit extends ViewInit {
  viewController?: NodeViewController;
  text?: string;
}

export class NodeView extends View {
  /** @hidden */
  readonly _node: ViewNodeType<this>;
  /** @hidden */
  _key?: string;
  /** @hidden */
  _childViewMap?: {[key: string]: View | undefined};
  /** @hidden */
  _viewController: ViewControllerType<this> | null;
  /** @hidden */
  _viewObservers?: ViewObserverType<this>[];
  /** @hidden */
  _viewFlags: ViewFlags;
  /** @hidden */
  _subviews?: {[subviewName: string]: Subview<View, View> | undefined};
  /** @hidden */
  _viewServices?: {[serviceName: string]: ViewService<View, unknown> | undefined};
  /** @hidden */
  _viewScopes?: {[scopeName: string]: ViewScope<View, unknown> | undefined};
  /** @hidden */
  _viewAnimators?: {[animatorName: string]: ViewAnimator<View, unknown> | undefined};
  /** @hidden */
  _layoutAnchors?: {[anchorName: string]: LayoutAnchor<View> | undefined};
  /** @hidden */
  _constraints?: Constraint[];
  /** @hidden */
  _constraintVariables?: ConstrainVariable[];

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

  initView(init: NodeViewInit): void {
    super.initView(init);
    if (init.text !== void 0) {
      this.text(init.text);
    }
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

  get viewObservers(): ReadonlyArray<NodeViewObserver> {
    let viewObservers = this._viewObservers;
    if (viewObservers === void 0) {
      viewObservers = [];
      this._viewObservers = viewObservers;
    }
    return viewObservers;
  }

  addViewObserver(viewObserver: ViewObserverType<this>): void {
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

  removeViewObserver(viewObserver: ViewObserverType<this>): void {
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

  protected willObserve<T>(callback: (this: this, viewObserver: ViewObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const viewController = this._viewController;
    if (viewController !== null) {
      result = callback.call(this, viewController);
      if (result !== void 0) {
        return result;
      }
    }
    const viewObservers = this._viewObservers;
    if (viewObservers !== void 0) {
      let i = 0;
      while (i < viewObservers.length) {
        const viewObserver = viewObservers[i];
        result = callback.call(this, viewObserver);
        if (result !== void 0) {
          return result;
        }
        if (viewObserver === viewObservers[i]) {
          i += 1;
        }
      }
    }
    return result;
  }

  protected didObserve<T>(callback: (this: this, viewObserver: ViewObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const viewObservers = this._viewObservers;
    if (viewObservers !== void 0) {
      let i = 0;
      while (i < viewObservers.length) {
        const viewObserver = viewObservers[i];
        result = callback.call(this, viewObserver);
        if (result !== void 0) {
          return result;
        }
        if (viewObserver === viewObservers[i]) {
          i += 1;
        }
      }
    }
    const viewController = this._viewController;
    if (viewController !== null) {
      result = callback.call(this, viewController);
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  get key(): string | undefined {
    return this._key;
  }

  /** @hidden */
  setKey(key: string | undefined): void {
    if (key !== void 0) {
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

  get childViewCount(): number {
    let childViewCount = 0;
    const childNodes = this._node.childNodes;
    for (let i = 0, n = childNodes.length; i < n; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView !== void 0) {
        childViewCount += 1;
      }
    }
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
    return null;
  }

  lastChildView(): View | null {
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
    }
    return null;
  }

  previousChildView(targetView: View): View | null {
    if (targetView instanceof NodeView && targetView.parentView === this) {
      let targetNode: ViewNode | null = targetView._node;
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
    return result;
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
        childView.setKey(void 0);
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
      newChildView.cascadeInsert();
    }
    return oldChildView;
  }

  /** @hidden */
  protected insertChildViewMap(childView: View): void {
    const key = childView.key;
    if (key !== void 0) {
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
      if (key !== void 0) {
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
    childView.cascadeInsert();
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
      childView.cascadeInsert();
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
    childView.cascadeInsert();
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    super.onInsertChildView(childView, targetView);
    this.insertSubview(childView);
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
      childView.cascadeInsert();
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
    childView.cascadeInsert();
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
      if ((updateFlags & View.DisplayMask) !== 0) {
        if (viewContext === void 0) {
          viewContext = this.superViewContext;
        }
        this.cascadeDisplay(updateFlags, viewContext);
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
    childView.setKey(void 0);
    if (typeof key === "string") {
      return childView;
    }
  }

  protected onRemoveChildView(childView: View): void {
    super.onRemoveChildView(childView);
    this.removeSubview(childView);
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
      childView.setKey(void 0);
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
          childView.setKey(void 0);
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
        if ((this._viewFlags & View.TraversingFlag) === 0) {
          parentView.removeChildView(this);
        } else {
          this._viewFlags |= View.RemovingFlag;
        }
      } else {
        parentNode.removeChild(node);
        this.setParentView(null, this);
        this.setKey(void 0);
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

  /** @hidden */
  get viewFlags(): ViewFlags {
    return this._viewFlags;
  }

  /** @hidden */
  setViewFlags(viewFlags: ViewFlags): void {
    this._viewFlags = viewFlags;
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
    if (!this.isMounted() && NodeView.isNodeMounted(this._node) && NodeView.isRootView(this._node)) {
      this.cascadeMount();
      if (!this.isPowered() && document.visibilityState === "visible") {
        this.cascadePower();
      }
      this.cascadeInsert();
    }
  }

  cascadeMount(): void {
    if ((this._viewFlags & View.MountedFlag) === 0) {
      this._viewFlags |= View.MountedFlag;
      this._viewFlags |= View.TraversingFlag;
      try {
        this.willMount();
        this.onMount();
        this.doMountChildViews();
        this.didMount();
      } finally {
        this._viewFlags &= ~View.TraversingFlag;
      }
    } else {
      throw new Error("already mounted");
    }
  }

  protected onMount(): void {
    super.onMount();
    this.mountServices();
    this.mountScopes();
    this.mountAnimators();
    this.mountSubviews();
  }

  protected didMount(): void {
    this.activateLayout();
    super.didMount();
  }

  /** @hidden */
  protected doMountChildViews(): void {
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
  }

  cascadeUnmount(): void {
    if ((this._viewFlags & View.MountedFlag) !== 0) {
      this._viewFlags &= ~View.MountedFlag
      this._viewFlags |= View.TraversingFlag;
      try {
        this.willUnmount();
        this.doUnmountChildViews();
        this.onUnmount();
        this.didUnmount();
      } finally {
        this._viewFlags &= ~View.TraversingFlag;
      }
    } else {
      throw new Error("already unmounted");
    }
  }

  protected willUnmount(): void {
    super.willUnmount();
    this.deactivateLayout();
  }

  protected onUnmount(): void {
    this.unmountSubviews();
    this.unmountAnimators();
    this.unmountScopes();
    this.unmountServices();
    this._viewFlags &= ~View.ViewFlagMask | View.RemovingFlag;
  }

  /** @hidden */
  protected doUnmountChildViews(): void {
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
  }

  cascadePower(): void {
    if ((this._viewFlags & View.PoweredFlag) === 0) {
      this._viewFlags |= View.PoweredFlag;
      this._viewFlags |= View.TraversingFlag;
      try {
        this.willPower();
        this.onPower();
        this.doPowerChildViews();
        this.didPower();
      } finally {
        this._viewFlags &= ~View.TraversingFlag;
      }
    } else {
      throw new Error("already powered");
    }
  }

  /** @hidden */
  protected doPowerChildViews(): void {
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
  }

  cascadeUnpower(): void {
    if ((this._viewFlags & View.PoweredFlag) !== 0) {
      this._viewFlags &= ~View.PoweredFlag
      this._viewFlags |= View.TraversingFlag;
      try {
        this.willUnpower();
        this.doUnpowerChildViews();
        this.onUnpower();
        this.didUnpower();
      } finally {
        this._viewFlags &= ~View.TraversingFlag;
      }
    } else {
      throw new Error("already unpowered");
    }
  }

  /** @hidden */
  protected doUnpowerChildViews(): void {
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
  }

  setCulled(culled: boolean): void {
    const viewFlags = this._viewFlags;
    if (culled && (viewFlags & View.CulledFlag) === 0) {
      this._viewFlags = viewFlags | View.CulledFlag;
      if ((viewFlags & View.CullFlag) === 0) {
        this.doCull();
      }
    } else if (!culled && (viewFlags & View.CulledFlag) !== 0) {
      this._viewFlags = viewFlags & ~View.CulledFlag;
      if ((viewFlags & View.CullFlag) === 0) {
        this.doUncull();
      }
    }
  }

  cascadeCull(): void {
    if ((this._viewFlags & View.CullFlag) === 0) {
      this._viewFlags |= View.CullFlag;
      if ((this._viewFlags & View.CulledFlag) === 0) {
        this.doCull();
      }
    } else {
      throw new Error("already culled");
    }
  }

  /** @hidden */
  protected doCull(): void {
    this._viewFlags |= View.TraversingFlag;
    try {
      this.willCull();
      this.onCull();
      this.doCullChildViews();
      this.didCull();
    } finally {
      this._viewFlags &= ~View.TraversingFlag;
    }
  }

  /** @hidden */
  protected doCullChildViews(): void {
    const childNodes = this._node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView !== void 0) {
        childView.cascadeCull();
        if ((childView._viewFlags & View.RemovingFlag) !== 0) {
          childView._viewFlags &= ~View.RemovingFlag;
          this.removeChildView(childView);
          continue;
        }
      }
      i += 1;
    }
  }

  cascadeUncull(): void {
    if ((this._viewFlags & View.CullFlag) !== 0) {
      this._viewFlags &= ~View.CullFlag
      if ((this._viewFlags & View.CulledFlag) === 0) {
        this.doUncull();
      }
    } else {
      throw new Error("already unculled");
    }
  }

  /** @hidden */
  protected doUncull(): void {
    this._viewFlags |= View.TraversingFlag;
    try {
      this.willUncull();
      this.doUncullChildViews();
      this.onUncull();
      this.didUncull();
    } finally {
      this._viewFlags &= ~View.TraversingFlag;
    }
  }

  /** @hidden */
  protected doUncullChildViews(): void {
    const childNodes = this._node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView !== void 0) {
        childView.cascadeUncull();
        if ((childView._viewFlags & View.RemovingFlag) !== 0) {
          childView._viewFlags &= ~View.RemovingFlag;
          this.removeChildView(childView);
          continue;
        }
      }
      i += 1;
    }
  }

  cascadeProcess(processFlags: ViewFlags, viewContext: ViewContext): void {
    const extendedViewContext = this.extendViewContext(viewContext);
    processFlags |= this._viewFlags & View.UpdateMask;
    processFlags = this.needsProcess(processFlags, extendedViewContext);
    this.doProcess(processFlags, extendedViewContext);
  }

  /** @hidden */
  protected doProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    let cascadeFlags = processFlags;
    this._viewFlags |= View.TraversingFlag | View.ProcessingFlag;
    this._viewFlags &= ~(View.NeedsProcess | View.NeedsProject);
    try {
      this.willProcess(viewContext);
      if (((this._viewFlags | processFlags) & View.NeedsResize) !== 0) {
        this.willResize(viewContext);
        cascadeFlags |= View.NeedsResize;
        this._viewFlags &= ~View.NeedsResize;
      }
      if (((this._viewFlags | processFlags) & View.NeedsScroll) !== 0) {
        this.willScroll(viewContext);
        cascadeFlags |= View.NeedsScroll;
        this._viewFlags &= ~View.NeedsScroll;
      }
      if (((this._viewFlags | processFlags) & View.NeedsChange) !== 0) {
        this.willChange(viewContext);
        cascadeFlags |= View.NeedsChange;
        this._viewFlags &= ~View.NeedsChange;
      }
      if (((this._viewFlags | processFlags) & View.NeedsAnimate) !== 0) {
        this.willAnimate(viewContext);
        cascadeFlags |= View.NeedsAnimate;
        this._viewFlags &= ~View.NeedsAnimate;
      }

      this.onProcess(viewContext);
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

      this.doProcessChildViews(cascadeFlags, viewContext);

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
      this.didProcess(viewContext);
    } finally {
      this._viewFlags &= ~(View.TraversingFlag | View.ProcessingFlag);
    }
  }

  protected onChange(viewContext: ViewContextType<this>): void {
    super.onChange(viewContext);
    this.updateScopes();
  }

  protected onAnimate(viewContext: ViewContextType<this>): void {
    super.onAnimate(viewContext);
    this.updateAnimators(viewContext.updateTime);
  }

  protected willLayout(viewContext: ViewContextType<this>): void {
    super.willLayout(viewContext);
    this.updateConstraints();
  }

  protected didLayout(viewContext: ViewContextType<this>): void {
    this.updateConstraintVariables();
    super.didLayout(viewContext);
  }

  /** @hidden */
  protected doProcessChildViews(processFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    if ((processFlags & View.ProcessMask) !== 0 && this._node.childNodes.length !== 0) {
      this.willProcessChildViews(processFlags, viewContext);
      this.onProcessChildViews(processFlags, viewContext);
      this.didProcessChildViews(processFlags, viewContext);
    }
  }

  protected processChildViews(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                              callback?: (this: this, childView: View) => void): void {
    const childNodes = this._node.childNodes;
    let i = 0;
    while (i < childNodes.length) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView !== void 0) {
        this.processChildView(childView, processFlags, viewContext);
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
  }

  cascadeDisplay(displayFlags: ViewFlags, viewContext: ViewContext): void {
    const extendedViewContext = this.extendViewContext(viewContext);
    displayFlags |= this._viewFlags & View.UpdateMask;
    displayFlags = this.needsDisplay(displayFlags, extendedViewContext);
    this.doDisplay(displayFlags, extendedViewContext);
  }

  /** @hidden */
  protected doDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    let cascadeFlags = displayFlags;
    this._viewFlags |= View.TraversingFlag | View.DisplayingFlag;
    this._viewFlags &= ~(View.NeedsDisplay | View.NeedsRender | View.NeedsComposite);
    try {
      this.willDisplay(viewContext);
      if (((this._viewFlags | displayFlags) & View.NeedsLayout) !== 0) {
        this.willLayout(viewContext);
        cascadeFlags |= View.NeedsLayout;
        this._viewFlags &= ~View.NeedsLayout;
      }

      this.onDisplay(viewContext);
      if ((cascadeFlags & View.NeedsLayout) !== 0) {
        this.onLayout(viewContext);
      }

      this.doDisplayChildViews(cascadeFlags, viewContext);

      if ((cascadeFlags & View.NeedsLayout) !== 0) {
        this.didLayout(viewContext);
      }
      this.didDisplay(viewContext);
    } finally {
      this._viewFlags &= ~(View.TraversingFlag | View.DisplayingFlag);
    }
  }

  /** @hidden */
  protected doDisplayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    if ((displayFlags & View.DisplayMask) !== 0 && this._node.childNodes.length !== 0
        && !this.isCulled()) {
      this.willDisplayChildViews(displayFlags, viewContext);
      this.onDisplayChildViews(displayFlags, viewContext);
      this.didDisplayChildViews(displayFlags, viewContext);
    }
  }

  protected displayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                              callback?: (this: this, childView: View) => void): void {
    const childNodes = this._node.childNodes;
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
  }

  hasSubview(subviewName: string): boolean {
    const subviews = this._subviews;
    return subviews !== void 0 && subviews[subviewName] !== void 0;
  }

  getSubview(subviewName: string): Subview<this, View> | null {
    const subviews = this._subviews;
    if (subviews !== void 0) {
      const subview = subviews[subviewName];
      if (subview !== void 0) {
        return subview as Subview<this, View>;
      }
    }
    return null;
  }

  setSubview(subviewName: string, newSubview: Subview<this, View> | null): void {
    let subviews = this._subviews;
    if (subviews === void 0) {
      subviews = {};
      this._subviews = subviews;
    }
    const oldSubview = subviews[subviewName];
    if (oldSubview !== void 0 && this.isMounted()) {
      oldSubview.unmount();
    }
    if (newSubview !== null) {
      subviews[subviewName] = newSubview;
      if (this.isMounted()) {
        newSubview.mount();
      }
    } else {
      delete subviews[subviewName];
    }
  }

  /** @hidden */
  protected mountSubviews(): void {
    const subviews = this._subviews;
    if (subviews !== void 0) {
      for (const subviewName in subviews) {
        const subview = subviews[subviewName]!;
        subview.mount();
      }
    }
  }

  /** @hidden */
  protected unmountSubviews(): void {
    const subviews = this._subviews;
    if (subviews !== void 0) {
      for (const subviewName in subviews) {
        const subview = subviews[subviewName]!;
        subview.unmount();
      }
    }
  }

  /** @hidden */
  protected insertSubview(childView: View): void {
    const subviewName = childView.key;
    if (subviewName !== void 0) {
      const subview = this.getLazySubview(subviewName);
      if (subview !== null && subview.child) {
        subview.doSetSubview(childView);
      }
    }
  }

  /** @hidden */
  protected removeSubview(childView: View): void {
    const subviewName = childView.key;
    if (subviewName !== void 0) {
      const subview = this.getSubview(subviewName);
      if (subview !== null && subview.child) {
        subview.doSetSubview(null);
      }
    }
  }

  hasViewService(serviceName: string): boolean {
    const viewServices = this._viewServices;
    return viewServices !== void 0 && viewServices[serviceName] !== void 0;
  }

  getViewService(serviceName: string): ViewService<this, unknown> | null {
    const viewServices = this._viewServices;
    if (viewServices !== void 0) {
      const viewService = viewServices[serviceName];
      if (viewService !== void 0) {
        return viewService as ViewService<this, unknown>;
      }
    }
    return null;
  }

  setViewService(serviceName: string, newViewService: ViewService<this, unknown> | null): void {
    let viewServices = this._viewServices;
    if (viewServices === void 0) {
      viewServices = {};
      this._viewServices = viewServices;
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
  protected mountServices(): void {
    const viewServices = this._viewServices;
    if (viewServices !== void 0) {
      for (const serviceName in viewServices) {
        const viewService = viewServices[serviceName]!;
        viewService.mount();
      }
    }
  }

  /** @hidden */
  protected unmountServices(): void {
    const viewServices = this._viewServices;
    if (viewServices !== void 0) {
      for (const serviceName in viewServices) {
        const viewService = viewServices[serviceName]!;
        viewService.unmount();
      }
    }
  }

  hasViewScope(scopeName: string): boolean {
    const viewScopes = this._viewScopes;
    return viewScopes !== void 0 && viewScopes[scopeName] !== void 0;
  }

  getViewScope(scopeName: string): ViewScope<this, unknown> | null {
    const viewScopes = this._viewScopes;
    if (viewScopes !== void 0) {
      const viewScope = viewScopes[scopeName];
      if (viewScope !== void 0) {
        return viewScope as ViewScope<this, unknown>;
      }
    }
    return null;
  }

  setViewScope(scopeName: string, newViewScope: ViewScope<this, unknown> | null): void {
    let viewScopes = this._viewScopes;
    if (viewScopes === void 0) {
      viewScopes = {};
      this._viewScopes = viewScopes;
    }
    const oldViewScope = viewScopes[scopeName];
    if (oldViewScope !== void 0 && this.isMounted()) {
      oldViewScope.unmount();
    }
    if (newViewScope !== null) {
      viewScopes[scopeName] = newViewScope;
      if (this.isMounted()) {
        newViewScope.mount();
      }
    } else {
      delete viewScopes[scopeName];
    }
  }

  /** @hidden */
  updateScopes(): void {
    const viewScopes = this._viewScopes;
    if (viewScopes !== void 0) {
      for (const scopeName in viewScopes) {
        const viewScope = viewScopes[scopeName]!;
        viewScope.onChange();
      }
    }
  }

  /** @hidden */
  protected mountScopes(): void {
    const viewScopes = this._viewScopes;
    if (viewScopes !== void 0) {
      for (const scopeName in viewScopes) {
        const viewScope = viewScopes[scopeName]!;
        viewScope.mount();
      }
    }
  }

  /** @hidden */
  protected unmountScopes(): void {
    const viewScopes = this._viewScopes;
    if (viewScopes !== void 0) {
      for (const scopeName in viewScopes) {
        const viewScope = viewScopes[scopeName]!;
        viewScope.unmount();
      }
    }
  }

  hasViewAnimator(animatorName: string): boolean {
    const viewAnimators = this._viewAnimators;
    return viewAnimators !== void 0 && viewAnimators[animatorName] !== void 0;
  }

  getViewAnimator(animatorName: string): ViewAnimator<this, unknown> | null {
    const viewAnimators = this._viewAnimators;
    if (viewAnimators !== void 0) {
      const viewAnimator = viewAnimators[animatorName];
      if (viewAnimator !== void 0) {
        return viewAnimator as ViewAnimator<this, unknown>;
      }
    }
    return null;
  }

  setViewAnimator(animatorName: string, newViewAnimator: ViewAnimator<this, unknown> | null): void {
    let viewAnimators = this._viewAnimators;
    if (viewAnimators === void 0) {
      viewAnimators = {};
      this._viewAnimators = viewAnimators;
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
  updateAnimators(t: number): void {
    this.updateViewAnimators(t);
  }

  /** @hidden */
  updateViewAnimators(t: number): void {
    const viewAnimators = this._viewAnimators;
    if (viewAnimators !== void 0) {
      for (const animatorName in viewAnimators) {
        const viewAnimator = viewAnimators[animatorName]!;
        viewAnimator.onAnimate(t);
      }
    }
  }

  /** @hidden */
  protected mountAnimators(): void {
    this.mountViewAnimators();
  }

  /** @hidden */
  protected mountViewAnimators(): void {
    const viewAnimators = this._viewAnimators;
    if (viewAnimators !== void 0) {
      for (const animatorName in viewAnimators) {
        const viewAnimator = viewAnimators[animatorName]!;
        viewAnimator.mount();
      }
    }
  }

  /** @hidden */
  protected unmountAnimators(): void {
    this.unmountViewAnimators();
  }

  /** @hidden */
  protected unmountViewAnimators(): void {
    const viewAnimators = this._viewAnimators;
    if (viewAnimators !== void 0) {
      for (const animatorName in viewAnimators) {
        const viewAnimator = viewAnimators[animatorName]!;
        viewAnimator.unmount();
      }
    }
  }

  hasLayoutAnchor(anchorName: string): boolean {
    const layoutAnchors = this._layoutAnchors;
    return layoutAnchors !== void 0 && layoutAnchors[anchorName] !== void 0;
  }

  getLayoutAnchor(anchorName: string): LayoutAnchor<this> | null {
    const layoutAnchors = this._layoutAnchors;
    if (layoutAnchors !== void 0) {
      const layoutAnchor = layoutAnchors[anchorName];
      if (layoutAnchor !== void 0) {
        return layoutAnchor as LayoutAnchor<this>;
      }
    }
    return null;
  }

  setLayoutAnchor(anchorName: string, layoutAnchor: LayoutAnchor<this> | null): void {
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

  get constraints(): ReadonlyArray<Constraint> {
    let constraints = this._constraints;
    if (constraints === void 0) {
      constraints = [];
      this._constraints = constraints;
    }
    return constraints;
  }

  hasConstraint(constraint: Constraint): boolean {
    const constraints = this._constraints;
    return constraints !== void 0 && constraints.indexOf(constraint) >= 0;
  }

  addConstraint(constraint: Constraint): void {
    let constraints = this._constraints;
    if (constraints === void 0) {
      constraints = [];
      this._constraints = constraints;
    }
    if (constraints.indexOf(constraint) < 0) {
      constraints.push(constraint);
      this.activateConstraint(constraint);
    }
  }

  removeConstraint(constraint: Constraint): void {
    const constraints = this._constraints;
    if (constraints !== void 0) {
      const index = constraints.indexOf(constraint);
      if (index >= 0) {
        constraints.splice(index, 1);
        this.deactivateConstraint(constraint);
      }
    }
  }

  get constraintVariables(): ReadonlyArray<ConstrainVariable> {
    let constraintVariables = this._constraintVariables;
    if (constraintVariables === void 0) {
      constraintVariables = [];
      this._constraintVariables = constraintVariables;
    }
    return constraintVariables;
  }

  hasConstraintVariable(constraintVariable: ConstrainVariable): boolean {
    const constraintVariables = this._constraintVariables;
    return constraintVariables !== void 0 && constraintVariables.indexOf(constraintVariable) >= 0;
  }

  addConstraintVariable(constraintVariable: ConstrainVariable): void {
    let constraintVariables = this._constraintVariables;
    if (constraintVariables === void 0) {
      constraintVariables = [];
      this._constraintVariables = constraintVariables;
    }
    if (constraintVariables.indexOf(constraintVariable) < 0) {
      constraintVariables.push(constraintVariable);
      this.activateConstraintVariable(constraintVariable);
    }
  }

  removeConstraintVariable(constraintVariable: ConstrainVariable): void {
    const constraintVariables = this._constraintVariables;
    if (constraintVariables !== void 0) {
      const index = constraintVariables.indexOf(constraintVariable);
      if (index >= 0) {
        this.deactivateConstraintVariable(constraintVariable);
        constraintVariables.splice(index, 1);
      }
    }
  }

  protected updateConstraints(): void {
    this.updateLayoutAnchors();
  }

  /** @hidden */
  updateLayoutAnchors(): void {
    const layoutAnchors = this._layoutAnchors;
    if (layoutAnchors !== void 0) {
      for (const anchorName in layoutAnchors) {
        const layoutAnchor = layoutAnchors[anchorName]!;
        layoutAnchor.updateState();
      }
    }
  }

  /** @hidden */
  activateLayout(): void {
    const constraints = this._constraints;
    const constraintVariables = this._constraintVariables;
    if (constraints !== void 0 || constraintVariables !== void 0) {
      const layoutManager = this.layoutService.manager;
      if (layoutManager !== void 0) {
        if (constraintVariables !== void 0) {
          for (let i = 0, n = constraintVariables.length; i < n; i += 1) {
            const constraintVariable = constraintVariables[i];
            if (constraintVariable instanceof LayoutAnchor) {
              layoutManager.activateConstraintVariable(constraintVariable);
              this.requireUpdate(View.NeedsLayout);
            }
          }
        }
        if (constraints !== void 0) {
          for (let i = 0, n = constraints.length; i < n; i += 1) {
            layoutManager.activateConstraint(constraints[i]);
            this.requireUpdate(View.NeedsLayout);
          }
        }
      }
    }
  }

  /** @hidden */
  deactivateLayout(): void {
    const constraints = this._constraints;
    const constraintVariables = this._constraintVariables;
    if (constraints !== void 0 || constraintVariables !== void 0) {
      const layoutManager = this.layoutService.manager;
      if (layoutManager !== void 0) {
        if (constraints !== void 0) {
          for (let i = 0, n = constraints.length; i < n; i += 1) {
            layoutManager.deactivateConstraint(constraints[i]);
            this.requireUpdate(View.NeedsLayout);
          }
        }
        if (constraintVariables !== void 0) {
          for (let i = 0, n = constraintVariables.length; i < n; i += 1) {
            layoutManager.deactivateConstraintVariable(constraintVariables[i]);
            this.requireUpdate(View.NeedsLayout);
          }
        }
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

  static readonly insertChildFlags: ViewFlags = View.insertChildFlags | View.NeedsLayout;
  static readonly removeChildFlags: ViewFlags = View.removeChildFlags | View.NeedsLayout;
}
View.Node = NodeView;
