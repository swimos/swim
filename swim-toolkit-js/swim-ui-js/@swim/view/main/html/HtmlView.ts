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

import {Length} from "@swim/length";
import {Transform} from "@swim/transform";
import {StyleMapInit, StyleMap} from "@swim/style";
import {ViewFlags, View} from "../View";
import {LayoutAnchor} from "../layout/LayoutAnchor";
import {NodeView} from "../node/NodeView";
import {TextView} from "../text/TextView";
import {AttributeAnimatorMemberInit, AttributeAnimator} from "../attribute/AttributeAnimator";
import {ElementViewConstructor, ElementViewInit, ElementView} from "../element/ElementView";
import {SvgView} from "../svg/SvgView";
import {HtmlViewObserver} from "./HtmlViewObserver";
import {HtmlViewController} from "./HtmlViewController";
import {CanvasView} from "../canvas/CanvasView";
import {StyleView} from "../style/StyleView";

export interface ViewHtml extends HTMLElement {
  view?: HtmlView;
}

export interface HtmlViewTagMap {
  "canvas": CanvasView;
  "style": StyleView;
}

export interface HtmlChildViewTagMap extends HtmlViewTagMap {
  "svg": SvgView;
}

export interface HtmlViewAttributesInit {
  autocomplete?: AttributeAnimatorMemberInit<HtmlView, "autocomplete">;
  checked?: AttributeAnimatorMemberInit<HtmlView, "checked">;
  colspan?: AttributeAnimatorMemberInit<HtmlView, "colspan">;
  disabled?: AttributeAnimatorMemberInit<HtmlView, "disabled">;
  placeholder?: AttributeAnimatorMemberInit<HtmlView, "placeholder">;
  rowspan?: AttributeAnimatorMemberInit<HtmlView, "rowspan">;
  selected?: AttributeAnimatorMemberInit<HtmlView, "selected">;
  title?: AttributeAnimatorMemberInit<HtmlView, "title">;
  type?: AttributeAnimatorMemberInit<HtmlView, "type">;
  value?: AttributeAnimatorMemberInit<HtmlView, "value">;
}

export interface HtmlViewStyleInit extends StyleMapInit {
}

export interface HtmlViewInit extends ElementViewInit {
  viewController?: HtmlViewController;
  attributes?: HtmlViewAttributesInit;
  style?: HtmlViewStyleInit;
}

export class HtmlView extends ElementView {
  constructor(node: HTMLElement) {
    super(node);
  }

  // @ts-ignore
  declare readonly node: ViewHtml;

  // @ts-ignore
  declare readonly viewController: HtmlViewController | null;

  // @ts-ignore
  declare readonly viewObservers: ReadonlyArray<HtmlViewObserver>;

  initView(init: HtmlViewInit): void {
    super.initView(init);
    if (init.attributes !== void 0) {
      this.initAttributes(init.attributes);
    }
    if (init.style !== void 0) {
      this.initStyle(init.style);
    }
  }

  initAttributes(init: HtmlViewAttributesInit): void {
    if (init.autocomplete !== void 0) {
      this.autocomplete(init.autocomplete);
    }
    if (init.checked !== void 0) {
      this.checked(init.checked);
    }
    if (init.colspan !== void 0) {
      this.colspan(init.colspan);
    }
    if (init.disabled !== void 0) {
      this.disabled(init.disabled);
    }
    if (init.placeholder !== void 0) {
      this.placeholder(init.placeholder);
    }
    if (init.rowspan !== void 0) {
      this.rowspan(init.rowspan);
    }
    if (init.selected !== void 0) {
      this.selected(init.selected);
    }
    if (init.title !== void 0) {
      this.title(init.title);
    }
    if (init.type !== void 0) {
      this.type(init.type);
    }
    if (init.value !== void 0) {
      this.value(init.value);
    }
  }

  initStyle(init: HtmlViewStyleInit): void {
    StyleMap.init(this, init);
  }

  append<T extends keyof HtmlChildViewTagMap>(tag: T, key?: string): HtmlChildViewTagMap[T];
  append(tag: string, key?: string): HtmlView;
  append(childNode: HTMLElement, key?: string): HtmlView;
  append(childNode: SVGElement, key?: string): SvgView;
  append(childNode: Element, key?: string): ElementView;
  append(childNode: Text, key?: string): TextView;
  append(childNode: Node, key?: string): NodeView;
  append<V extends NodeView>(childView: V, key?: string): V;
  append<VC extends ElementViewConstructor>(viewConstructor: VC, key?: string): InstanceType<VC>;
  append(child: string | Node | NodeView | ElementViewConstructor, key?: string): NodeView {
    if (typeof child === "string") {
      child = View.fromTag(child);
    } else if (child instanceof Node) {
      child = View.fromNode(child);
    } else if (typeof child === "function") {
      child = View.fromConstructor(child);
    }
    this.appendChildView(child, key);
    return child;
  }

  prepend<T extends keyof HtmlChildViewTagMap>(tag: T, key?: string): HtmlChildViewTagMap[T];
  prepend(tag: string, key?: string): HtmlView;
  prepend(childNode: HTMLElement, key?: string): HtmlView;
  prepend(childNode: SVGElement, key?: string): SvgView;
  prepend(childNode: Element, key?: string): ElementView;
  prepend(childNode: Text, key?: string): TextView;
  prepend(childNode: Node, key?: string): NodeView;
  prepend<V extends NodeView>(childView: V, key?: string): V;
  prepend<VC extends ElementViewConstructor>(viewConstructor: VC, key?: string): InstanceType<VC>;
  prepend(child: string | Node | NodeView | ElementViewConstructor, key?: string): NodeView {
    if (typeof child === "string") {
      child = View.fromTag(child);
    } else if (child instanceof Node) {
      child = View.fromNode(child);
    } else if (typeof child === "function") {
      child = View.fromConstructor(child);
    }
    this.prependChildView(child, key);
    return child;
  }

  insert<T extends keyof HtmlChildViewTagMap>(tag: T, target: View | Node | null, key?: string): HtmlChildViewTagMap[T];
  insert(tag: string, target: View | Node | null, key?: string): HtmlView;
  insert(childNode: HTMLElement, target: View | Node | null, key?: string): HtmlView;
  insert(childNode: SVGElement, target: View | Node | null, key?: string): SvgView;
  insert(childNode: Element, target: View | Node | null, key?: string): ElementView;
  insert(childNode: Text, target: View | Node | null, key?: string): TextView;
  insert(childNode: Node, target: View | Node | null, key?: string): NodeView;
  insert<V extends NodeView>(childView: V, target: View | Node | null, key?: string): V;
  insert<VC extends ElementViewConstructor>(viewConstructor: VC, target: View | Node | null, key?: string): InstanceType<VC>;
  insert(child: string | Node | NodeView | ElementViewConstructor, target: View | Node | null, key?: string): NodeView {
    if (typeof child === "string") {
      child = View.fromTag(child);
    } else if (child instanceof Node) {
      child = View.fromNode(child);
    } else if (typeof child === "function") {
      child = View.fromConstructor(child);
    }
    this.insertChild(child, target, key);
    return child;
  }

  isPositioned(): boolean {
    const style = window.getComputedStyle(this._node);
    return style.position === "relative" || style.position === "absolute";
  }

  get parentTransform(): Transform {
    const transform = this.transform.value;
    if (transform !== void 0) {
      return transform;
    } else if (this.isPositioned()) {
      const dx = this._node.offsetLeft;
      const dy = this._node.offsetTop;
      if (dx !== 0 || dy !== 0) {
        return Transform.translate(-dx, -dy);
      }
    }
    return Transform.identity();
  }

  on<T extends keyof HTMLElementEventMap>(type: T, listener: (this: HTMLElement, event: HTMLElementEventMap[T]) => unknown,
                                          options?: AddEventListenerOptions | boolean): this;
  on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this;
  on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this {
    this._node.addEventListener(type, listener, options);
    return this;
  }

  off<T extends keyof HTMLElementEventMap>(type: T, listener: (this: HTMLElement, event: HTMLElementEventMap[T]) => unknown,
                                           options?: EventListenerOptions | boolean): this;
  off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this;
  off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this {
    this._node.removeEventListener(type, listener, options);
    return this;
  }

  @LayoutAnchor<HtmlView>({
    strength: "strong",
    getState(oldState: number): number {
      const offsetParent = this.view.node.offsetParent;
      const offsetBounds = offsetParent !== null
                         ? offsetParent.getBoundingClientRect()
                         : this.view.node === document.body
                         ? this.view.node.getBoundingClientRect()
                         : null;
      if (offsetBounds !== null) {
        const bounds = this.view.node.getBoundingClientRect();
        const newState = bounds.top - offsetBounds.top;
        if (oldState !== newState) {
          this.view.requireUpdate(View.NeedsResize | View.NeedsLayout);
        }
        return newState;
      } else {
        return NaN;
      }
    },
    setValue(newValue: number): void {
      this.view.top.setState(newValue);
      this.view.requireUpdate(View.NeedsResize | View.NeedsLayout);
    },
  })
  topAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    strength: "strong",
    getState(oldState: number): number {
      const offsetParent = this.view.node.offsetParent;
      const offsetBounds = offsetParent !== null
                         ? offsetParent.getBoundingClientRect()
                         : this.view.node === document.body
                         ? this.view.node.getBoundingClientRect()
                         : null;
      if (offsetBounds !== null) {
        const bounds = this.view.node.getBoundingClientRect();
        const newState = offsetBounds.right + bounds.right;
        if (oldState !== newState) {
          this.view.requireUpdate(View.NeedsResize | View.NeedsLayout);
        }
        return newState;
      } else {
        return NaN;
      }
    },
    setValue(newValue: number): void {
      this.view.right.setState(newValue);
      this.view.requireUpdate(View.NeedsResize | View.NeedsLayout);
    },
  })
  rightAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    strength: "strong",
    getState(oldState: number): number {
      const offsetParent = this.view.node.offsetParent;
      const offsetBounds = offsetParent !== null
                         ? offsetParent.getBoundingClientRect()
                         : this.view.node === document.body
                         ? this.view.node.getBoundingClientRect()
                         : null;
      if (offsetBounds !== null) {
        const bounds = this.view.node.getBoundingClientRect();
        const newState = offsetBounds.bottom + bounds.bottom;
        if (oldState !== newState) {
          this.view.requireUpdate(View.NeedsResize | View.NeedsLayout);
        }
        return newState;
      } else {
        return NaN;
      }
    },
    setValue(newValue: number): void {
      this.view.bottom.setState(newValue);
      this.view.requireUpdate(View.NeedsResize | View.NeedsLayout);
    },
  })
  bottomAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    strength: "strong",
    getState(oldState: number): number {
      const offsetParent = this.view.node.offsetParent;
      const offsetBounds = offsetParent !== null
                         ? offsetParent.getBoundingClientRect()
                         : this.view.node === document.body
                         ? this.view.node.getBoundingClientRect()
                         : null;
      if (offsetBounds !== null) {
        const bounds = this.view.node.getBoundingClientRect();
        const newState = bounds.left - offsetBounds.left;
        if (oldState !== newState) {
          this.view.requireUpdate(View.NeedsResize | View.NeedsLayout);
        }
        return newState;
      } else {
        return NaN;
      }
    },
    setValue(newValue: number): void {
      this.view.left.setState(newValue);
      this.view.requireUpdate(View.NeedsResize | View.NeedsLayout);
    },
  })
  leftAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    strength: "strong",
    getState(oldState: number): number {
      const bounds = this.view.node.getBoundingClientRect();
      const newState = bounds.width;
      if (oldState !== newState) {
        this.view.requireUpdate(View.NeedsResize | View.NeedsLayout);
      }
      return newState;
    },
    setValue(newValue: number): void {
      this.view.width.setState(newValue);
      this.view.requireUpdate(View.NeedsResize | View.NeedsLayout);
    },
  })
  widthAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    strength: "strong",
    getState(oldState: number): number {
      const bounds = this.view.node.getBoundingClientRect();
      const newState = bounds.height;
      if (oldState !== newState) {
        this.view.requireUpdate(View.NeedsResize | View.NeedsLayout);
      }
      return newState;
    },
    setValue(newValue: number): void {
      this.view.height.setState(newValue);
      this.view.requireUpdate(View.NeedsResize | View.NeedsLayout);
    },
  })
  heightAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    strength: "strong",
    getState(oldState: number): number {
      const offsetParent = this.view.node.offsetParent;
      const offsetBounds = offsetParent !== null
                         ? offsetParent.getBoundingClientRect()
                         : this.view.node === document.body
                         ? this.view.node.getBoundingClientRect()
                         : null;
      if (offsetBounds !== null) {
        const bounds = this.view.node.getBoundingClientRect();
        const newState = bounds.left + 0.5 * bounds.width - offsetBounds.left;
        if (oldState !== newState) {
          this.view.requireUpdate(View.NeedsResize | View.NeedsLayout);
        }
        return newState;
      } else {
        return NaN;
      }
    },
    setValue(newValue: number): void {
      const offsetParent = this.view.node.offsetParent;
      const offsetBounds = offsetParent !== null
                         ? offsetParent.getBoundingClientRect()
                         : this.view.node === document.body
                         ? this.view.node.getBoundingClientRect()
                         : null;
      if (offsetBounds !== null) {
        const bounds = this.view.node.getBoundingClientRect();
        const leftAnchor = this.view.getLayoutAnchor("leftAnchor");
        if (leftAnchor !== null && leftAnchor.constrained()) {
          const newState = offsetBounds.left + newValue - 0.5 * bounds.width;
          this.view.left.setState(newState);
          this.view.requireUpdate(View.NeedsResize | View.NeedsLayout);
          return;
        }
        const rightAnchor = this.view.getLayoutAnchor("rightAnchor");
        if (rightAnchor !== null && rightAnchor.constrained()) {
          const newState = offsetBounds.right - newValue - 0.5 * bounds.width;
          this.view.right.setState(newState);
          this.view.requireUpdate(View.NeedsResize | View.NeedsLayout);
          return;
        }
      }
    },
  })
  centerXAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    strength: "strong",
    getState(oldState: number): number {
      const offsetParent = this.view.node.offsetParent;
      const offsetBounds = offsetParent !== null
                         ? offsetParent.getBoundingClientRect()
                         : this.view.node === document.body
                         ? this.view.node.getBoundingClientRect()
                         : null;
      if (offsetBounds !== null) {
        const bounds = this.view.node.getBoundingClientRect();
        const newState = bounds.top + 0.5 * bounds.height - offsetBounds.top;
        if (oldState !== newState) {
          this.view.requireUpdate(View.NeedsResize | View.NeedsLayout);
        }
        return newState;
      } else {
        return NaN;
      }
    },
    setValue(newValue: number): void {
      const offsetParent = this.view.node.offsetParent;
      const offsetBounds = offsetParent !== null
                         ? offsetParent.getBoundingClientRect()
                         : this.view.node === document.body
                         ? this.view.node.getBoundingClientRect()
                         : null;
      if (offsetBounds !== null) {
        const bounds = this.view.node.getBoundingClientRect();
        const topAnchor = this.view.getLayoutAnchor("topAnchor");
        if (topAnchor !== null && topAnchor.constrained()) {
          const newState = offsetBounds.top + newValue - 0.5 * bounds.height;
          this.view.top.setState(newState);
          this.view.requireUpdate(View.NeedsResize | View.NeedsLayout);
          return;
        }
        const bottomAnchor = this.view.getLayoutAnchor("bottomAnchor");
        if (bottomAnchor !== null && bottomAnchor.constrained()) {
          const newState = offsetBounds.bottom - newValue - 0.5 * bounds.height;
          this.view.bottom.setState(newState);
          this.view.requireUpdate(View.NeedsResize | View.NeedsLayout);
          return;
        }
      }
    },
  })
  centerYAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    strength: "strong",
    getState(oldState: number): number {
      const marginTop = this.view.marginTop.value;
      return marginTop instanceof Length ? marginTop.pxValue() : NaN;
    },
    setValue(newValue: number): void {
      this.view.marginTop.setState(newValue);
    },
  })
  marginTopAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    strength: "strong",
    getState(oldState: number): number {
      const marginRight = this.view.marginRight.value;
      return marginRight instanceof Length ? marginRight.pxValue() : NaN;
    },
    setValue(newValue: number): void {
      this.view.marginRight.setState(newValue);
    },
  })
  marginRightAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    strength: "strong",
    getState(oldState: number): number {
      const marginBottom = this.view.marginBottom.value;
      return marginBottom instanceof Length ? marginBottom.pxValue() : NaN;
    },
    setValue(newValue: number): void {
      this.view.marginBottom.setState(newValue);
    },
  })
  marginBottomAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    strength: "strong",
    getState(oldState: number): number {
      const marginLeft = this.view.marginLeft.value;
      return marginLeft instanceof Length ? marginLeft.pxValue() : NaN;
    },
    setValue(newValue: number): void {
      this.view.marginLeft.setState(newValue);
    },
  })
  marginLeftAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    strength: "strong",
    getState(oldState: number): number {
      const paddingTop = this.view.paddingTop.value;
      return paddingTop instanceof Length ? paddingTop.pxValue() : NaN;
    },
    setValue(newValue: number): void {
      this.view.paddingTop.setState(newValue);
    },
  })
  paddingTopAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    strength: "strong",
    getState(oldState: number): number {
      const paddingRight = this.view.paddingRight.value;
      return paddingRight instanceof Length ? paddingRight.pxValue() : NaN;
    },
    setValue(newValue: number): void {
      this.view.paddingRight.setState(newValue);
    },
  })
  paddingRightAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    strength: "strong",
    getState(oldState: number): number {
      const paddingBottom = this.view.paddingBottom.value;
      return paddingBottom instanceof Length ? paddingBottom.pxValue() : NaN;
    },
    setValue(newValue: number): void {
      this.view.paddingBottom.setState(newValue);
    },
  })
  paddingBottomAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    strength: "strong",
    getState(oldState: number): number {
      const paddingLeft = this.view.paddingLeft.value;
      return paddingLeft instanceof Length ? paddingLeft.pxValue() : NaN;
    },
    setValue(newValue: number): void {
      this.view.paddingLeft.setState(newValue);
    },
  })
  paddingLeftAnchor: LayoutAnchor<this>;

  @AttributeAnimator({attributeName: "autocomplete", type: String})
  autocomplete: AttributeAnimator<this, string>;

  @AttributeAnimator({attributeName: "checked", type: Boolean})
  checked: AttributeAnimator<this, boolean, boolean | string>;

  @AttributeAnimator({attributeName: "colspan", type: Number})
  colspan: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator({attributeName: "disabled", type: Boolean})
  disabled: AttributeAnimator<this, boolean, boolean | string>;

  @AttributeAnimator({attributeName: "placeholder", type: String})
  placeholder: AttributeAnimator<this, string>;

  @AttributeAnimator({attributeName: "rowspan", type: Number})
  rowspan: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator({attributeName: "selected", type: Boolean})
  selected: AttributeAnimator<this, boolean, boolean | string>;

  @AttributeAnimator({attributeName: "title", type: String})
  title: AttributeAnimator<this, string>;

  @AttributeAnimator({attributeName: "type", type: String})
  type: AttributeAnimator<this, string>;

  @AttributeAnimator({attributeName: "value", type: String})
  value: AttributeAnimator<this, string>;

  static fromTag<T extends keyof HtmlViewTagMap>(tag: T): HtmlViewTagMap[T];
  static fromTag(tag: string): HtmlView;
  static fromTag(tag: string): HtmlView {
    if (tag === "canvas") {
      const node = document.createElement(tag) as HTMLCanvasElement;
      return new View.Canvas(node);
    } else if (tag === "style") {
      const node = document.createElement(tag) as HTMLStyleElement;
      return new View.Style(node);
    } else {
      const node = document.createElement(tag);
      return new (this as unknown as {new(node: HTMLElement): HtmlView})(node);
    }
  }

  static create<T extends keyof HtmlViewTagMap>(tag: T): HtmlViewTagMap[T];
  static create(tag: string): HtmlView;
  static create(node: HTMLCanvasElement): CanvasView;
  static create(node: HTMLElement): HtmlView;
  static create<VC extends ElementViewConstructor<HTMLElement, HtmlView>>(viewConstructor: VC): InstanceType<VC>;
  static create(source: string | HTMLElement | ElementViewConstructor<HTMLElement, HtmlView>): HtmlView {
    if (typeof source === "string") {
      return this.fromTag(source);
    } else if (source instanceof HTMLElement) {
      return this.fromNode(source);
    } else if (typeof source === "function") {
      return this.fromConstructor(source);
    }
    throw new TypeError("" + source);
  }

  /** @hidden */
  static readonly tag: string = "div";
}
export interface HtmlView extends StyleMap {
  requireUpdate(updateFlags: ViewFlags): void;
}
StyleMap.define(HtmlView.prototype);
View.Html = HtmlView;
