// Copyright 2015-2021 Swim inc.
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

import {Lazy} from "@swim/util";
import {ViewManager} from "@swim/view";
import type {ViewNode, NodeView} from "../node/NodeView";
import type {TextView} from "../text/TextView";
import {ElementView} from "../element/ElementView";
import type {ElementViewController} from "../element/ElementViewController";
import {HtmlView} from "../html/HtmlView";
import {SvgView} from "../svg/SvgView";
import type {DomManagerObserver} from "./DomManagerObserver";

export class DomManager<V extends NodeView = NodeView> extends ViewManager<V> {
  override readonly viewManagerObservers!: ReadonlyArray<DomManagerObserver>;

  protected override onInsertRootView(rootView: V): void {
    super.onInsertRootView(rootView);
    if (rootView instanceof ElementView && rootView.node.hasAttribute("swim-app")) {
      this.materializeViewController(rootView);
      this.materializeView(rootView);
    }
  }

  materializeView(parentView: NodeView): void {
    const childNodes = parentView.node.childNodes;
    for (let i = 0; i < childNodes.length; i += 1) {
      const childNode = childNodes[i]!;
      const childView = this.materializeNode(parentView, childNode);
      if (childView !== null) {
        this.materializeView(childView);
      }
    }
  }

  materializeNode(parentView: NodeView, childNode: ViewNode): NodeView | null {
    if (childNode.view !== void 0) {
      return childNode.view;
    } else if (childNode instanceof Element) {
      return this.materializeElement(parentView, childNode);
    } else if (childNode instanceof Text) {
      return this.materializeText(parentView, childNode);
    } else {
      return null;
    }
  }

  materializeElement(parentView: NodeView, childNode: Element): ElementView | null {
    let viewClass: typeof ElementView | undefined;
    const viewClassName = childNode.getAttribute("swim-view");
    if (viewClassName !== null) {
      viewClass = DomManager.eval(viewClassName) as typeof ElementView | undefined;
      if (typeof viewClass !== "function") {
        throw new TypeError(viewClassName);
      }
    }
    if (viewClass === void 0) {
      if (childNode instanceof HTMLElement) {
        viewClass = HtmlView;
      } else if (childNode instanceof SVGElement) {
        viewClass = SvgView;
      } else {
        viewClass = ElementView;
      }
    }
    const childView = new viewClass(childNode);
    this.materializeViewController(childView);
    const key = childNode.getAttribute("key");
    parentView.injectChildView(childView, null, key !== null ? key : void 0);
    return childView;
  }

  materializeText(parentView: NodeView, childNode: Text): TextView | null {
    return null;
  }

  materializeViewController(view: ElementView): void {
    const viewControllerName = view.node.getAttribute("swim-controller");
    if (viewControllerName !== null) {
      const ViewControllerClass = DomManager.eval(viewControllerName) as {new(): ElementViewController} | undefined;
      if (typeof ViewControllerClass !== "function") {
        throw new TypeError(viewControllerName);
      }
      const viewController = new ViewControllerClass();
      view.setViewController(viewController);
    }
  }

  @Lazy
  static global<V extends NodeView>(): DomManager<V> {
    return new DomManager();
  }

  static boot(): ElementView[] {
    const views: ElementView[] = [];
    const nodes = document.querySelectorAll("[swim-app]");
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (node instanceof HTMLElement) {
        const view = DomManager.bootElement(node);
        views.push(view);
      }
    }
    return views;
  }

  static bootElement(node: Element): ElementView {
    let viewClass: typeof ElementView | undefined;
    const viewClassName = node.getAttribute("swim-app");
    if (viewClassName !== null && viewClassName !== "") {
      viewClass = DomManager.eval(viewClassName) as typeof ElementView | undefined;
      if (typeof viewClass !== "function") {
        throw new TypeError(viewClassName);
      }
    }
    if (viewClass === void 0) {
      if (node instanceof HTMLElement) {
        viewClass = HtmlView;
      } else if (node instanceof SVGElement) {
        viewClass = SvgView;
      } else {
        viewClass = ElementView;
      }
    }
    const view = new viewClass(node);
    viewClass.mount(view);
    if ((view as any).domService === void 0) {
      throw new Error("DomService not available");
    }
    return view;
  }

  /** @hidden */
  static eval(qname: string): unknown {
    let value: any = typeof globalThis !== "undefined" ? globalThis
                   : typeof self !== "undefined" ? self
                   : typeof window !== "undefined" ? window
                   : typeof global !== "undefined" ? global
                   : void 0;
    const idents = qname.split(".");
    for (let i = 0, n = idents.length; typeof value === "object" && value !== null && i < n; i += 1) {
      const ident = idents[i]!;
      value = value[ident];
    }
    return value;
  }
}
