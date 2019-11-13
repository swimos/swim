// Copyright 2015-2019 SWIM.AI inc.
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

import {
  ViewNode,
  NodeView,
  TextView,
  ElementView,
  ElementViewController,
  SvgView,
  HtmlView,
  HtmlAppView,
} from "@swim/view";
import {WebAppViewController} from "./WebAppViewController";

export class WebAppView extends HtmlAppView {
  /** @hidden */
  _viewController: WebAppViewController | null;
  /** @hidden */
  readonly _mutationObserver: MutationObserver;

  constructor(node: HTMLElement, key: string | null = null) {
    super(node, key);
  }

  get viewController(): WebAppViewController | null {
    return this._viewController;
  }

  materializeTree(parentView: NodeView = this): void {
    const childNodes = parentView.node.childNodes;
    for (let i = 0; i < childNodes.length; i += 1) {
      const childNode = childNodes[i];
      const childView = this.materializeNode(parentView, childNode);
      if (childView) {
        this.materializeTree(childView);
      }
    }
  }

  materializeNode(parentView: NodeView, childNode: ViewNode): NodeView | undefined {
    if (childNode.view) {
      return childNode.view;
    } else if (childNode instanceof Element) {
      return this.materializeElement(parentView, childNode);
    } else if (childNode instanceof Text) {
      return this.materializeText(parentView, childNode);
    } else {
      return void 0;
    }
  }

  materializeElement(parentView: NodeView, childNode: Element): ElementView | undefined {
    let ViewClass: typeof ElementView | undefined;
    const viewClassName = childNode.getAttribute("swim-view");
    if (viewClassName) {
      const viewClass = WebAppView.eval(viewClassName);
      if (typeof viewClass === "function") {
        ViewClass = viewClass as typeof ElementView;
      } else {
        throw new TypeError(viewClassName);
      }
    }
    if (!ViewClass) {
      if (childNode instanceof HTMLElement) {
        ViewClass = HtmlView;
      } else if (childNode instanceof SVGElement) {
        ViewClass = SvgView;
      } else {
        ViewClass = ElementView;
      }
    }
    const childView = new ViewClass(childNode);
    const key = childNode.getAttribute("slot");
    if (key) {
      childView.key(key);
    }
    WebAppView.bindController(childView);
    parentView.injectChildView(childView, null);
    return childView;
  }

  materializeText(parentView: NodeView, childNode: Text): TextView | undefined {
    return void 0;
  }

  static boot(): WebAppView[] {
    const webapps = [];
    if (typeof document !== "undefined") {
      const nodes = document.querySelectorAll("[swim-webapp]");
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (node instanceof HTMLElement) {
          const webapp = WebAppView.bootElement(node);
          webapps.push(webapp);
        }
      }
    }
    return webapps;
  }

  /** @hidden */
  static bootElement(node: HTMLElement): WebAppView {
    let ViewClass: typeof WebAppView | undefined;
    const viewClassName = node.getAttribute("swim-webapp");
    if (viewClassName) {
      const viewClass = WebAppView.eval(viewClassName);
      if (typeof viewClass === "function") {
        ViewClass = viewClass as typeof WebAppView;
      } else {
        throw new TypeError(viewClassName);
      }
    }
    if (!ViewClass) {
      ViewClass = WebAppView;
    }
    const webapp = new ViewClass(node);
    const key = node.getAttribute("slot");
    if (key) {
      webapp.key(key);
    }
    WebAppView.bindController(webapp);
    webapp.requireUpdate(0, true);
    webapp.materializeTree();
    return webapp;
  }

  /** @hidden */
  static bindController(view: ElementView): void {
    const viewControllerName = view.node.getAttribute("swim-controller");
    if (viewControllerName) {
      const viewControllerClass = WebAppView.eval(viewControllerName);
      if (typeof viewControllerClass === "function") {
        const ViewControllerClass = viewControllerClass as {new(): ElementViewController};
        const viewController = new ViewControllerClass();
        view.setViewController(viewController);
      } else {
        throw new TypeError(viewControllerName);
      }
    }
  }

  /** @hidden */
  static eval(qname: string): unknown {
    let value: unknown = typeof window !== "undefined" ? window : void 0;
    const idents = qname.split(".");
    for (let i = 0, n = idents.length; value && typeof value === "object" && i < n; i += 1) {
      const ident = idents[i];
      value = (value as any)[ident];
    }
    return value;
  }
}
