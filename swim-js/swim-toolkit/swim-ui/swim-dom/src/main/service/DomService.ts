// Copyright 2015-2021 Swim.inc
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

import {Class, Lazy} from "@swim/util";
import {Service} from "@swim/component";
import type {ViewNode, NodeView} from "../node/NodeView";
import type {TextView} from "../text/TextView";
import {ViewElement, ElementView} from "../"; // forward import
import {HtmlView} from "../"; // forward import
import {SvgView} from "../"; // forward import
import type {DomServiceObserver} from "./DomServiceObserver";

/** @public */
export class DomService<V extends NodeView = NodeView> extends Service<V> {
  /** @override */
  override readonly observerType?: Class<DomServiceObserver<V>>;

  protected override onAttachRoot(root: V): void {
    super.onAttachRoot(root);
    if (root instanceof ElementView && root.node.hasAttribute("swim-app")) {
      this.materializeView(root as NodeView);
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
      return childNode.view as NodeView;
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
      viewClass = DomService.eval(viewClassName) as typeof ElementView | undefined;
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
    const key = childNode.getAttribute("key");
    parentView.injectChild(childView, null, key !== null ? key : void 0);
    return childView;
  }

  materializeText(parentView: NodeView, childNode: Text): TextView | null {
    return null;
  }

  @Lazy
  static global<V extends NodeView>(): DomService<V> {
    return new DomService();
  }

  static boot(): ElementView[] {
    const views: ElementView[] = [];
    const nodes = document.querySelectorAll("[swim-app]");
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (node instanceof HTMLElement) {
        const view = DomService.bootElement(node);
        views.push(view);
      }
    }
    return views;
  }

  static bootElement(node: ViewElement): ElementView {
    let view = node.view;
    if (view === void 0) {
      let viewClass: typeof ElementView | undefined;
      const viewClassName = node.getAttribute("swim-app");
      if (viewClassName !== null && viewClassName !== "") {
        viewClass = DomService.eval(viewClassName) as typeof ElementView | undefined;
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
      view = new viewClass(node);
      viewClass.mount(view);
      if ((view as NodeView).domProvider === void 0) {
        throw new Error("dom service not available");
      }
    }
    return view;
  }

  /** @internal */
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
