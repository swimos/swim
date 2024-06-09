// Copyright 2015-2024 Nstream, inc.
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
import type {ServiceObserver} from "@swim/component";
import {Service} from "@swim/component";
import {ViewSet} from "@swim/view";
import {NodeView} from "./NodeView";
import type {TextView} from "./TextView";
import {ElementView} from "./ElementView";
import {HtmlView} from "./HtmlView";
import {SvgView} from "./SvgView";

/** @public */
export interface DomServiceObserver<S extends DomService = DomService> extends ServiceObserver<S> {
  serviceWillAttachRoot?(rootView: ElementView, service: S): void;

  serviceDidAttachRoot?(rootView: ElementView, service: S): void;

  serviceWillDetachRoot?(rootView: ElementView, service: S): void;

  serviceDidDetachRoot?(rootView: ElementView, service: S): void;
}

/** @public */
export class DomService extends Service {
  /** @override */
  declare readonly observerType?: Class<DomServiceObserver>;

  @ViewSet({
    initView(rootView: ElementView): void {
      if (rootView.node.hasAttribute("swim-app")) {
        this.owner.materializeView(rootView);
      }
    },
    willAttachView(rootView: ElementView): void {
      this.owner.callObservers("serviceWillAttachRoot", rootView, this.owner);
    },
    didAttachView(rootView: ElementView): void {
      this.owner.callObservers("serviceDidAttachRoot", rootView, this.owner);
    },
    willDetachView(rootView: ElementView): void {
      this.owner.callObservers("serviceWillDetachRoot", rootView, this.owner);
    },
    didDetachView(rootView: ElementView): void {
      this.owner.callObservers("serviceDidDetachRoot", rootView, this.owner);
    },
  })
  readonly roots!: ViewSet<this, ElementView>;

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

  materializeNode(parentView: NodeView, childNode: Node): NodeView | null {
    const childView = NodeView.get(childNode);
    if (childView !== null) {
      return childView;
    } else if (childNode instanceof Element) {
      return this.materializeElement(parentView, childNode);
    } else if (childNode instanceof Text) {
      return this.materializeText(parentView, childNode);
    }
    return null;
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

  static bootElement(node: Element): ElementView {
    let view = ElementView.get(node);
    if (view !== null) {
      return view;
    }
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
    for (let i = 0; typeof value === "object" && value !== null && i < idents.length; i += 1) {
      const ident = idents[i]!;
      value = value[ident];
    }
    return value;
  }
}
