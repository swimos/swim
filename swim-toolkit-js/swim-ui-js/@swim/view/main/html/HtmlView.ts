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

import {Objects} from "@swim/util";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {
  FontStyle,
  FontVariant,
  FontWeight,
  FontStretch,
  AnyFontSize,
  FontSize,
  AnyLineHeight,
  LineHeight,
  FontFamily,
  AnyFont,
  Font,
} from "@swim/font";
import {AnyBoxShadow, BoxShadow} from "@swim/shadow";
import {AnyTransform, Transform} from "@swim/transform";
import {Tween} from "@swim/transition";
import {
  AlignContent,
  AlignItems,
  AlignSelf,
  Appearance,
  BorderCollapse,
  BorderStyle,
  BorderWidth,
  BoxSizing,
  CssCursor,
  CssDisplay,
  FlexBasis,
  FlexDirection,
  FlexWrap,
  Height,
  JustifyContent,
  MaxHeight,
  MaxWidth,
  MinHeight,
  MinWidth,
  Overflow,
  OverscrollBehavior,
  PointerEvents,
  Position,
  TextAlign,
  TextDecorationStyle,
  TextTransform,
  TouchAction,
  UserSelect,
  VerticalAlign,
  Visibility,
  WhiteSpace,
  Width,
} from "@swim/style";
import {View} from "../View";
import {LayoutAnchor} from "../layout/LayoutAnchor";
import {ViewNode, NodeView} from "../node/NodeView";
import {TextView} from "../text/TextView";
import {AttributeAnimator} from "../attribute/AttributeAnimator";
import {StyleAnimator} from "../style/StyleAnimator";
import {ElementViewConstructor, ElementView} from "../element/ElementView";
import {SvgView} from "../svg/SvgView";
import {HtmlViewController} from "./HtmlViewController";
import {CanvasView} from "../canvas/CanvasView";

export interface ViewHtml extends HTMLElement {
  view?: HtmlView;
}

export interface HtmlViewTagMap {
  "canvas": CanvasView;
}

export interface HtmlChildViewTagMap extends HtmlViewTagMap {
  "svg": SvgView;
}

export class HtmlView extends ElementView {
  constructor(node: HTMLElement) {
    super(node);
  }

  get node(): ViewHtml {
    return this._node;
  }

  get viewController(): HtmlViewController | null {
    return this._viewController;
  }

  append<T extends keyof HtmlChildViewTagMap>(tag: T, key?: string): HtmlChildViewTagMap[T];
  append(tag: string, key?: string): HtmlView;
  append(childNode: HTMLElement, key?: string): HtmlView;
  append(childNode: SVGElement, key?: string): SvgView;
  append(childNode: Element, key?: string): ElementView;
  append(childNode: Text, key?: string): TextView;
  append(childNode: Node, key?: string): NodeView;
  append<V extends NodeView>(childView: V, key?: string): V;
  append<C extends ElementViewConstructor>(viewConstructor: C, key?: string): InstanceType<C>;
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
  prepend<C extends ElementViewConstructor>(viewConstructor: C, key?: string): InstanceType<C>;
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
  insert<C extends ElementViewConstructor>(viewConstructor: C, target: View | Node | null, key?: string): InstanceType<C>;
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

  protected updateConstraints(): void {
    super.updateConstraints();
    const topAnchor = this.getLayoutAnchor("topAnchor");
    if (topAnchor !== null) {
      topAnchor.updateState();
    }
    const rightAnchor = this.getLayoutAnchor("rightAnchor");
    if (rightAnchor !== null) {
      rightAnchor.updateState();
    }
    const bottomAnchor = this.getLayoutAnchor("bottomAnchor");
    if (bottomAnchor !== null) {
      bottomAnchor.updateState();
    }
    const leftAnchor = this.getLayoutAnchor("leftAnchor");
    if (leftAnchor !== null) {
      leftAnchor.updateState();
    }
    const widthAnchor = this.getLayoutAnchor("widthAnchor");
    if (widthAnchor !== null) {
      widthAnchor.updateState();
    }
    const heightAnchor = this.getLayoutAnchor("heightAnchor");
    if (heightAnchor !== null) {
      heightAnchor.updateState();
    }
    const centerXAnchor = this.getLayoutAnchor("centerXAnchor");
    if (centerXAnchor !== null) {
      centerXAnchor.updateState();
    }
    const centerYAnchor = this.getLayoutAnchor("centerYAnchor");
    if (centerYAnchor !== null) {
      centerYAnchor.updateState();
    }
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
    get(oldState: number): number {
      const offsetParent = this.scope.node.offsetParent!;
      const offsetBounds = offsetParent.getBoundingClientRect();
      const bounds = this.scope.node.getBoundingClientRect();
      const newState = bounds.top - offsetBounds.top;
      if (oldState !== newState) {
        this.scope.requireUpdate(View.NeedsLayout);
      }
      return newState;
    },
    set(newValue: number): void {
      this.scope.top.setState(Length.px(newValue));
      this.scope.requireUpdate(View.NeedsLayout);
    },
    strength: "strong",
  })
  topAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    get(oldState: number): number {
      const offsetParent = this.scope.node.offsetParent!;
      const offsetBounds = offsetParent.getBoundingClientRect();
      const bounds = this.scope.node.getBoundingClientRect();
      const newState = offsetBounds.right + bounds.right;
      if (oldState !== newState) {
        this.scope.requireUpdate(View.NeedsLayout);
      }
      return newState;
    },
    set(newValue: number): void {
      this.scope.right.setState(Length.px(newValue));
      this.scope.requireUpdate(View.NeedsLayout);
    },
    strength: "strong",
  })
  rightAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    get(oldState: number): number {
      const offsetParent = this.scope.node.offsetParent!;
      const offsetBounds = offsetParent.getBoundingClientRect();
      const bounds = this.scope.node.getBoundingClientRect();
      const newState = offsetBounds.bottom + bounds.bottom;
      if (oldState !== newState) {
        this.scope.requireUpdate(View.NeedsLayout);
      }
      return newState;
    },
    set(newValue: number): void {
      this.scope.bottom.setState(Length.px(newValue));
      this.scope.requireUpdate(View.NeedsLayout);
    },
    strength: "strong",
  })
  bottomAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    get(oldState: number): number {
      const offsetParent = this.scope.node.offsetParent!;
      const offsetBounds = offsetParent.getBoundingClientRect();
      const bounds = this.scope.node.getBoundingClientRect();
      const newState = bounds.left - offsetBounds.left;
      if (oldState !== newState) {
        this.scope.requireUpdate(View.NeedsLayout);
      }
      return newState;
    },
    set(newValue: number): void {
      this.scope.left.setState(Length.px(newValue));
      this.scope.requireUpdate(View.NeedsLayout);
    },
    strength: "strong",
  })
  leftAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    get(oldState: number): number {
      const bounds = this.scope.node.getBoundingClientRect();
      const newState = bounds.width;
      if (oldState !== newState) {
        this.scope.requireUpdate(View.NeedsResize | View.NeedsLayout);
      }
      return newState;
    },
    set(newValue: number): void {
      this.scope.width.setState(Length.px(newValue));
      this.scope.requireUpdate(View.NeedsResize | View.NeedsLayout);
    },
    strength: "strong",
  })
  widthAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    get(oldState: number): number {
      const bounds = this.scope.node.getBoundingClientRect();
      const newState = bounds.height;
      if (oldState !== newState) {
        this.scope.requireUpdate(View.NeedsResize | View.NeedsLayout);
      }
      return newState;
    },
    set(newValue: number): void {
      this.scope.height.setState(Length.px(newValue));
      this.scope.requireUpdate(View.NeedsResize | View.NeedsLayout);
    },
    strength: "strong",
  })
  heightAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    get(oldState: number): number {
      const offsetParent = this.scope.node.offsetParent!;
      const offsetBounds = offsetParent.getBoundingClientRect();
      const bounds = this.scope.node.getBoundingClientRect();
      const newState = bounds.left + 0.5 * bounds.width - offsetBounds.left;
      if (oldState !== newState) {
        this.scope.requireUpdate(View.NeedsLayout);
      }
      return newState;
    },
    set(newValue: number): void {
      const rightAnchor = this.scope.getLayoutAnchor("rightAnchor");
      const leftAnchor = this.scope.getLayoutAnchor("leftAnchor");
      const widthAnchor = this.scope.getLayoutAnchor("widthAnchor");
      if (leftAnchor !== null && leftAnchor.enabled()) {
        this.scope.width.setState(Length.px(2 * (newValue - leftAnchor.value)));
        this.scope.requireUpdate(View.NeedsResize | View.NeedsLayout);
      } else if (rightAnchor !== null && rightAnchor.enabled()) {
        this.scope.width.setState(Length.px(2 * (rightAnchor.value - newValue)));
        this.scope.requireUpdate(View.NeedsResize | View.NeedsLayout);
      } else if (widthAnchor !== null && widthAnchor.enabled()) {
        this.scope.left.setState(Length.px(newValue - 0.5 * widthAnchor.value));
        this.scope.requireUpdate(View.NeedsLayout);
      }
    },
    strength: "strong",
  })
  centerXAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    get(oldState: number): number {
      const offsetParent = this.scope.node.offsetParent!;
      const offsetBounds = offsetParent.getBoundingClientRect();
      const bounds = this.scope.node.getBoundingClientRect();
      const newState = bounds.top + 0.5 * bounds.height - offsetBounds.top;
      if (oldState !== newState) {
        this.scope.requireUpdate(View.NeedsLayout);
      }
      return newState;
    },
    set(newValue: number): void {
      const topAnchor = this.scope.getLayoutAnchor("topAnchor");
      const bottomAnchor = this.scope.getLayoutAnchor("bottomAnchor");
      const heightAnchor = this.scope.getLayoutAnchor("heightAnchor");
      if (topAnchor !== null && topAnchor.enabled()) {
        this.scope.height.setState(Length.px(2 * (newValue - topAnchor.value)));
        this.scope.requireUpdate(View.NeedsResize | View.NeedsLayout);
      } else if (bottomAnchor !== null && bottomAnchor.enabled()) {
        this.scope.height.setState(Length.px(2 * (bottomAnchor.value - newValue)));
        this.scope.requireUpdate(View.NeedsResize | View.NeedsLayout);
      } else if (heightAnchor !== null && heightAnchor.enabled()) {
        this.scope.top.setState(Length.px(newValue - 0.5 * heightAnchor.value));
        this.scope.requireUpdate(View.NeedsLayout);
      }
    },
    strength: "strong",
  })
  centerYAnchor: LayoutAnchor<this>;

  @AttributeAnimator("autocomplete", String)
  autocomplete: AttributeAnimator<this, string>;

  @AttributeAnimator("checked", Boolean)
  checked: AttributeAnimator<this, boolean, boolean | string>;

  @AttributeAnimator("colspan", Number)
  colspan: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator("disabled", Boolean)
  disabled: AttributeAnimator<this, boolean, boolean | string>;

  @AttributeAnimator("placeholder", String)
  placeholder: AttributeAnimator<this, string>;

  @AttributeAnimator("rowspan", Number)
  rowspan: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator("selected", Boolean)
  selected: AttributeAnimator<this, boolean, boolean | string>;

  @AttributeAnimator("title", String)
  title: AttributeAnimator<this, string>;

  @AttributeAnimator("type", String)
  type: AttributeAnimator<this, string>;

  @AttributeAnimator("value", String)
  value: AttributeAnimator<this, string>;

  @StyleAnimator("align-content", String)
  alignContent: StyleAnimator<this, AlignContent>;

  @StyleAnimator("align-items", String)
  alignItems: StyleAnimator<this, AlignItems>;

  @StyleAnimator("align-self", String)
  alignSelf: StyleAnimator<this, AlignSelf>;

  @StyleAnimator("appearance", String)
  appearance: StyleAnimator<this, Appearance>;

  @StyleAnimator(["backdrop-filter", "-webkit-backdrop-filter"], String)
  backdropFilter: StyleAnimator<this, string>;

  @StyleAnimator("background-color", Color)
  backgroundColor: StyleAnimator<this, Color, AnyColor>;

  @StyleAnimator("border-collapse", String)
  borderCollapse: StyleAnimator<this, BorderCollapse>;

  borderColor(): [Color | "currentColor" | undefined,
                  Color | "currentColor" | undefined,
                  Color | "currentColor" | undefined,
                  Color | "currentColor" | undefined] |
                 Color | "currentColor" | undefined;
  borderColor(value: [AnyColor | "currentColor" | undefined,
                      AnyColor | "currentColor" | undefined,
                      AnyColor | "currentColor" | undefined,
                      AnyColor | "currentColor" | undefined] |
                     AnyColor | "currentColor" | undefined,
              tween?: Tween<Color | "currentColor">,
              priority?: string): this;
  borderColor(value?: [AnyColor | "currentColor" | undefined,
                       AnyColor | "currentColor" | undefined,
                       AnyColor | "currentColor" | undefined,
                       AnyColor | "currentColor" | undefined] |
                      AnyColor | "currentColor" | undefined,
              tween?: Tween<Color | "currentColor">,
              priority?: string): [Color | "currentColor" | undefined,
                                   Color | "currentColor" | undefined,
                                   Color | "currentColor" | undefined,
                                   Color | "currentColor" | undefined] |
                                  Color | "currentColor" | undefined | this {
    if (value === void 0) {
      const borderTopColor = this.borderTopColor();
      const borderRightColor = this.borderRightColor();
      const borderBottomColor = this.borderBottomColor();
      const borderLeftColor = this.borderLeftColor();
      if (Objects.equal(borderTopColor, borderRightColor)
          && Objects.equal(borderRightColor, borderBottomColor)
          && Objects.equal(borderBottomColor, borderLeftColor)) {
        return borderTopColor;
      } else {
        return [borderTopColor, borderRightColor, borderBottomColor, borderLeftColor];
      }
    } else {
      if (Array.isArray(value)) {
        if (value.length >= 1) {
          this.borderTopColor(value[0], tween, priority);
        }
        if (value.length >= 2) {
          this.borderRightColor(value[1], tween, priority);
        }
        if (value.length >= 3) {
          this.borderBottomColor(value[2], tween, priority);
        }
        if (value.length >= 4) {
          this.borderLeftColor(value[3], tween, priority);
        }
      } else {
        this.borderTopColor(value, tween, priority);
        this.borderRightColor(value, tween, priority);
        this.borderBottomColor(value, tween, priority);
        this.borderLeftColor(value, tween, priority);
      }
      return this;
    }
  }

  @StyleAnimator("border-top-color", [Color, String])
  borderTopColor: StyleAnimator<this, Color | "currentColor", AnyColor | "currentColor">;

  @StyleAnimator("border-right-color", [Color, String])
  borderRightColor: StyleAnimator<this, Color | "currentColor", AnyColor | "currentColor">;

  @StyleAnimator("border-bottom-color", [Color, String])
  borderBottomColor: StyleAnimator<this, Color | "currentColor", AnyColor | "currentColor">;

  @StyleAnimator("border-left-color", [Color, String])
  borderLeftColor: StyleAnimator<this, Color | "currentColor", AnyColor | "currentColor">;

  borderRadius(): [Length | undefined,
                   Length | undefined,
                   Length | undefined,
                   Length | undefined] |
                  Length | undefined;
  borderRadius(value: [AnyLength | undefined,
                       AnyLength | undefined,
                       AnyLength | undefined,
                       AnyLength | undefined] |
                      AnyLength | undefined,
               tween?: Tween<Length>,
               priority?: string): this;
  borderRadius(value?: [AnyLength | undefined,
                        AnyLength | undefined,
                        AnyLength | undefined,
                        AnyLength | undefined] |
                       AnyLength | undefined,
               tween?: Tween<Length>,
               priority?: string): [Length | undefined,
                                    Length | undefined,
                                    Length | undefined,
                                    Length | undefined] |
                                   Length | undefined | this {
    if (value === void 0) {
      const borderTopLeftRadius = this.borderTopLeftRadius();
      const borderTopRightRadius = this.borderTopRightRadius();
      const borderBottomRightRadius = this.borderBottomRightRadius();
      const borderBottomLeftRadius = this.borderBottomLeftRadius();
      if (Objects.equal(borderTopLeftRadius, borderTopRightRadius)
          && Objects.equal(borderTopRightRadius, borderBottomRightRadius)
          && Objects.equal(borderBottomRightRadius, borderBottomLeftRadius)) {
        return borderTopLeftRadius;
      } else {
        return [borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius];
      }
    } else {
      if (Array.isArray(value)) {
        if (value.length >= 1) {
          this.borderTopLeftRadius(value[0], tween, priority);
        }
        if (value.length >= 2) {
          this.borderTopRightRadius(value[1], tween, priority);
        }
        if (value.length >= 3) {
          this.borderBottomRightRadius(value[2], tween, priority);
        }
        if (value.length >= 4) {
          this.borderBottomLeftRadius(value[3], tween, priority);
        }
      } else {
        this.borderTopLeftRadius(value, tween, priority);
        this.borderTopRightRadius(value, tween, priority);
        this.borderBottomRightRadius(value, tween, priority);
        this.borderBottomLeftRadius(value, tween, priority);
      }
      return this;
    }
  }

  @StyleAnimator("border-top-left-radius", Length)
  borderTopLeftRadius: StyleAnimator<this, Length, AnyLength>;

  @StyleAnimator("border-top-right-radius", Length)
  borderTopRightRadius: StyleAnimator<this, Length, AnyLength>;

  @StyleAnimator("border-bottom-right-radius", Length)
  borderBottomRightRadius: StyleAnimator<this, Length, AnyLength>;

  @StyleAnimator("border-bottom-left-radius", Length)
  borderBottomLeftRadius: StyleAnimator<this, Length, AnyLength>;

  @StyleAnimator("border-spacing", String)
  borderSpacing: StyleAnimator<this, string>;

  borderStyle(): [BorderStyle | undefined,
                  BorderStyle | undefined,
                  BorderStyle | undefined,
                  BorderStyle | undefined] |
                 BorderStyle | undefined;
  borderStyle(value: [BorderStyle | undefined,
                      BorderStyle | undefined,
                      BorderStyle | undefined,
                      BorderStyle | undefined] |
                     BorderStyle | undefined,
              tween?: Tween<BorderStyle>,
              priority?: string ): this;
  borderStyle(value?: [BorderStyle | undefined,
                       BorderStyle | undefined,
                       BorderStyle | undefined,
                       BorderStyle | undefined] |
                      BorderStyle | undefined,
              tween?: Tween<BorderStyle>,
              priority?: string): [BorderStyle | undefined,
                                   BorderStyle | undefined,
                                   BorderStyle | undefined,
                                   BorderStyle | undefined] |
                                  BorderStyle | undefined | this {
    if (value === void 0) {
      const borderTopStyle = this.borderTopStyle();
      const borderRightStyle = this.borderRightStyle();
      const borderBottomStyle = this.borderBottomStyle();
      const borderLeftStyle = this.borderLeftStyle();
      if (Objects.equal(borderTopStyle, borderRightStyle)
          && Objects.equal(borderRightStyle, borderBottomStyle)
          && Objects.equal(borderBottomStyle, borderLeftStyle)) {
        return borderTopStyle;
      } else {
        return [borderTopStyle, borderRightStyle, borderBottomStyle, borderLeftStyle];
      }
    } else {
      if (Array.isArray(value)) {
        if (value.length >= 1) {
          this.borderTopStyle(value[0], tween, priority);
        }
        if (value.length >= 2) {
          this.borderRightStyle(value[1], tween, priority);
        }
        if (value.length >= 3) {
          this.borderBottomStyle(value[2], tween, priority);
        }
        if (value.length >= 4) {
          this.borderLeftStyle(value[3], tween, priority);
        }
      } else {
        this.borderTopStyle(value, tween, priority);
        this.borderRightStyle(value, tween, priority);
        this.borderBottomStyle(value, tween, priority);
        this.borderLeftStyle(value, tween, priority);
      }
      return this;
    }
  }

  @StyleAnimator("border-top-style", String)
  borderTopStyle: StyleAnimator<this, BorderStyle>;

  @StyleAnimator("border-right-style", String)
  borderRightStyle: StyleAnimator<this, BorderStyle>;

  @StyleAnimator("border-bottom-style", String)
  borderBottomStyle: StyleAnimator<this, BorderStyle>;

  @StyleAnimator("border-left-style", String)
  borderLeftStyle: StyleAnimator<this, BorderStyle>;

  borderWidth(): [BorderWidth | undefined,
                  BorderWidth | undefined,
                  BorderWidth | undefined,
                  BorderWidth | undefined] |
                 BorderWidth | undefined;
  borderWidth(value: [BorderWidth | AnyLength | undefined,
                      BorderWidth | AnyLength | undefined,
                      BorderWidth | AnyLength | undefined,
                      BorderWidth | AnyLength | undefined] |
                     BorderWidth | AnyLength | undefined,
              tween?: Tween<BorderWidth>,
              priority?: string): this;
  borderWidth(value?: [BorderWidth | AnyLength | undefined,
                       BorderWidth | AnyLength | undefined,
                       BorderWidth | AnyLength | undefined,
                       BorderWidth | AnyLength | undefined] |
                      BorderWidth | AnyLength | undefined,
              tween?: Tween<BorderWidth>,
              priority?: string): [BorderWidth | undefined,
                                   BorderWidth | undefined,
                                   BorderWidth | undefined,
                                   BorderWidth | undefined] |
                                  BorderWidth | undefined | this {
    if (value === void 0) {
      const borderTopWidth = this.borderTopWidth();
      const borderRightWidth = this.borderRightWidth();
      const borderBottomWidth = this.borderBottomWidth();
      const borderLeftWidth = this.borderLeftWidth();
      if (Objects.equal(borderTopWidth, borderRightWidth)
          && Objects.equal(borderRightWidth, borderBottomWidth)
          && Objects.equal(borderBottomWidth, borderLeftWidth)) {
        return borderTopWidth;
      } else {
        return [borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth];
      }
    } else {
      if (Array.isArray(value)) {
        if (value.length >= 1) {
          this.borderTopWidth(value[0], tween, priority);
        }
        if (value.length >= 2) {
          this.borderRightWidth(value[1], tween, priority);
        }
        if (value.length >= 3) {
          this.borderBottomWidth(value[2], tween, priority);
        }
        if (value.length >= 4) {
          this.borderLeftWidth(value[3], tween, priority);
        }
      } else {
        this.borderTopWidth(value, tween, priority);
        this.borderRightWidth(value, tween, priority);
        this.borderBottomWidth(value, tween, priority);
        this.borderLeftWidth(value, tween, priority);
      }
      return this;
    }
  }

  @StyleAnimator("border-top-width", [Length, String])
  borderTopWidth: StyleAnimator<this, Length | BorderWidth, AnyLength | BorderWidth>;

  @StyleAnimator("border-right-width", [Length, String])
  borderRightWidth: StyleAnimator<this, Length | BorderWidth, AnyLength | BorderWidth>;

  @StyleAnimator("border-bottom-width", [Length, String])
  borderBottomWidth: StyleAnimator<this, Length | BorderWidth, AnyLength | BorderWidth>;

  @StyleAnimator("border-left-width", [Length, String])
  borderLeftWidth: StyleAnimator<this, Length | BorderWidth, AnyLength | BorderWidth>;

  @StyleAnimator("bottom", [Length, String])
  bottom: StyleAnimator<this, Length | "auto", AnyLength | "auto">;

  @StyleAnimator("box-shadow", BoxShadow)
  boxShadow: StyleAnimator<this, BoxShadow, AnyBoxShadow>;

  @StyleAnimator("box-sizing", String)
  boxSizing: StyleAnimator<this, BoxSizing>;

  @StyleAnimator("color", [Color, String])
  color: StyleAnimator<this, Color | "currentColor", AnyColor | "currentColor">;

  @StyleAnimator("cursor", String)
  cursor: StyleAnimator<this, CssCursor>;

  @StyleAnimator("display", String)
  display: StyleAnimator<this, CssDisplay>;

  @StyleAnimator("filter", String)
  filter: StyleAnimator<this, string>;

  @StyleAnimator("flex-basis", [Length, String])
  flexBasis: StyleAnimator<this, Length | FlexBasis, AnyLength | FlexBasis>;

  @StyleAnimator("flex-direction", String)
  flexDirection: StyleAnimator<this, FlexDirection>;

  @StyleAnimator("flex-grow", Number)
  flexGrow: StyleAnimator<this, number, number | string>;

  @StyleAnimator("flex-shrink", Number)
  flexShrink: StyleAnimator<this, number, number | string>;

  @StyleAnimator("flex-wrap", String)
  flexWrap: StyleAnimator<this, FlexWrap>;

  font(): Font | undefined;
  font(value: AnyFont | undefined, tween?: Tween<any>, priority?: string): this;
  font(value?: AnyFont, tween?: Tween<any>, priority?: string): Font | undefined | this {
    if (value === void 0) {
      const style = this.fontStyle();
      const variant = this.fontVariant();
      const weight = this.fontWeight();
      const stretch = this.fontStretch();
      const size = this.fontSize();
      const height = this.lineHeight();
      const family = this.fontFamily();
      if (family !== void 0) {
        return Font.from(style, variant, weight, stretch, size, height, family);
      } else {
        return void 0;
      }
    } else {
      if (value !== void 0) {
        value = Font.fromAny(value);
      }
      if (value === void 0 || value.style() !== null) {
        this.fontStyle(value !== void 0 ? value.style() || void 0 : void 0, tween, priority);
      }
      if (value === void 0 || value.variant() !== null) {
        this.fontVariant(value !== void 0 ? value.variant() || void 0 : void 0, tween, priority);
      }
      if (value === void 0 || value.weight() !== null) {
        this.fontWeight(value !== void 0 ? value.weight() || void 0 : void 0, tween, priority);
      }
      if (value === void 0 || value.stretch() !== null) {
        this.fontStretch(value !== void 0 ? value.stretch() || void 0 : void 0, tween, priority);
      }
      if (value === void 0 || value.size() !== null) {
        this.fontSize(value !== void 0 ? value.size() || void 0 : void 0, tween, priority);
      }
      if (value === void 0 || value.height() !== null) {
        this.lineHeight(value !== void 0 ? value.height() || void 0 : void 0, tween, priority);
      }
      this.fontFamily(value !== void 0 ? value.family() : void 0, tween, priority);
      return this;
    }
  }

  @StyleAnimator("font-family", FontFamily)
  fontFamily: StyleAnimator<this, FontFamily | FontFamily[], FontFamily | ReadonlyArray<FontFamily>>;

  @StyleAnimator("font-size", [Length, String])
  fontSize: StyleAnimator<this, FontSize, AnyFontSize>;

  @StyleAnimator("font-stretch", String)
  fontStretch: StyleAnimator<this, FontStretch>;

  @StyleAnimator("font-style", String)
  fontStyle: StyleAnimator<this, FontStyle>;

  @StyleAnimator("font-variant", String)
  fontVariant: StyleAnimator<this, FontVariant>;

  @StyleAnimator("font-weight", String)
  fontWeight: StyleAnimator<this, FontWeight>;

  @StyleAnimator("height", [Length, String])
  height: StyleAnimator<this, Height, AnyLength | Height>;

  @StyleAnimator("justify-content", String)
  justifyContent: StyleAnimator<this, JustifyContent>;

  @StyleAnimator("left", [Length, String])
  left: StyleAnimator<this, Length | "auto", AnyLength | "auto">;

  @StyleAnimator("line-height", LineHeight)
  lineHeight: StyleAnimator<this, LineHeight, AnyLineHeight>;

  margin(): [Length | "auto" | undefined,
             Length | "auto" | undefined,
             Length | "auto" | undefined,
             Length | "auto" | undefined] |
            Length | "auto" | undefined;
  margin(value: [AnyLength | "auto" | undefined,
                 AnyLength | "auto" | undefined,
                 AnyLength | "auto" | undefined,
                 AnyLength | "auto" | undefined] |
                AnyLength | "auto" | undefined,
         tween?: Tween<Length | "auto">,
         priority?: string): this;
  margin(value?: [AnyLength | "auto" |undefined,
                  AnyLength | "auto" |undefined,
                  AnyLength | "auto" |undefined,
                  AnyLength | "auto" |undefined] |
                 AnyLength | "auto" | undefined,
         tween?: Tween<Length | "auto">,
         priority?: string): [Length | "auto" | undefined,
                              Length | "auto" | undefined,
                              Length | "auto" | undefined,
                              Length | "auto" | undefined] |
                             Length | "auto" | undefined | this {
    if (value === void 0) {
      const marginTop = this.marginTop();
      const marginRight = this.marginRight();
      const marginBottom = this.marginBottom();
      const marginLeft = this.marginLeft();
      if (Objects.equal(marginTop, marginRight)
          && Objects.equal(marginRight, marginBottom)
          && Objects.equal(marginBottom, marginLeft)) {
        return marginTop;
      } else {
        return [marginTop, marginRight, marginBottom, marginLeft];
      }
    } else {
      if (Array.isArray(value)) {
        if (value.length >= 1) {
          this.marginTop(value[0], tween, priority);
        }
        if (value.length >= 2) {
          this.marginRight(value[1], tween, priority);
        }
        if (value.length >= 3) {
          this.marginBottom(value[2], tween, priority);
        }
        if (value.length >= 4) {
          this.marginLeft(value[3], tween, priority);
        }
      } else {
        this.marginTop(value, tween, priority);
        this.marginRight(value, tween, priority);
        this.marginBottom(value, tween, priority);
        this.marginLeft(value, tween, priority);
      }
      return this;
    }
  }

  @StyleAnimator("margin-top", [Length, String])
  marginTop: StyleAnimator<this, Length | "auto", AnyLength | "auto">;

  @StyleAnimator("margin-right", [Length, String])
  marginRight: StyleAnimator<this, Length | "auto", AnyLength | "auto">;

  @StyleAnimator("margin-bottom", [Length, String])
  marginBottom: StyleAnimator<this, Length | "auto", AnyLength | "auto">;

  @StyleAnimator("margin-left", [Length, String])
  marginLeft: StyleAnimator<this, Length | "auto", AnyLength | "auto">;

  @StyleAnimator("max-height", [Length, String])
  maxHeight: StyleAnimator<this, MaxHeight, AnyLength | MaxHeight>;

  @StyleAnimator("max-width", [Length, String])
  maxWidth: StyleAnimator<this, MaxWidth, AnyLength | MaxWidth>;

  @StyleAnimator("min-height", [Length, String])
  minHeight: StyleAnimator<this, MinHeight, AnyLength | MinHeight>;

  @StyleAnimator("min-width", [Length, String])
  minWidth: StyleAnimator<this, MinWidth, AnyLength | MinWidth>;

  @StyleAnimator("opacity", Number)
  opacity: StyleAnimator<this, number, number | string>;

  @StyleAnimator("order", Number)
  order: StyleAnimator<this, number, number | string>;

  @StyleAnimator("outline-color", [Color, String])
  outlineColor: StyleAnimator<this, Color | "currentColor", AnyColor | "currentColor">;

  @StyleAnimator("outline-style", String)
  outlineStyle: StyleAnimator<this, BorderStyle>;

  @StyleAnimator("outline-width", [Length, String])
  outlineWidth: StyleAnimator<this, Length | BorderWidth, AnyLength | BorderWidth>;

  overflow(): [Overflow | undefined,
               Overflow | undefined] |
              Overflow | undefined;
  overflow(value: [Overflow | undefined,
                   Overflow | undefined] |
                  Overflow | undefined,
          tween?: Tween<Overflow>,
          priority?: string): this;
  overflow(value?: [Overflow | undefined,
                    Overflow | undefined] |
                   Overflow | undefined,
          tween?: Tween<Overflow>,
          priority?: string): [Overflow | undefined,
                               Overflow | undefined] |
                              Overflow | undefined | this {
    if (value === void 0) {
      const overflowX = this.overflowX();
      const overflowY = this.overflowY();
      if (Objects.equal(overflowX, overflowY)) {
        return overflowX;
      } else {
        return [overflowX, overflowY];
      }
    } else {
      if (Array.isArray(value)) {
        if (value.length >= 1) {
          this.overflowX(value[0], tween, priority);
        }
        if (value.length >= 2) {
          this.overflowY(value[1], tween, priority);
        }
      } else {
        this.overflowX(value, tween, priority);
        this.overflowY(value, tween, priority);
      }
      return this;
    }
  }

  @StyleAnimator("overflow-x", String)
  overflowX: StyleAnimator<this, Overflow>;

  @StyleAnimator("overflow-y", String)
  overflowY: StyleAnimator<this, Overflow>;

  overscrollBehavior(): [OverscrollBehavior | undefined,
                         OverscrollBehavior | undefined] |
                        OverscrollBehavior | undefined;
  overscrollBehavior(value: [OverscrollBehavior | undefined,
                             OverscrollBehavior | undefined] |
                            OverscrollBehavior | undefined,
          tween?: Tween<OverscrollBehavior>,
          priority?: string): this;
  overscrollBehavior(value?: [OverscrollBehavior | undefined,
                              OverscrollBehavior | undefined] |
                             OverscrollBehavior | undefined,
          tween?: Tween<OverscrollBehavior>,
          priority?: string): [OverscrollBehavior | undefined,
                               OverscrollBehavior | undefined] |
                              OverscrollBehavior | undefined | this {
    if (value === void 0) {
      const overscrollBehaviorX = this.overscrollBehaviorX();
      const overscrollBehaviorY = this.overscrollBehaviorY();
      if (Objects.equal(overscrollBehaviorX, overscrollBehaviorY)) {
        return overscrollBehaviorX;
      } else {
        return [overscrollBehaviorX, overscrollBehaviorY];
      }
    } else {
      if (Array.isArray(value)) {
        if (value.length >= 1) {
          this.overscrollBehaviorX(value[0], tween, priority);
        }
        if (value.length >= 2) {
          this.overscrollBehaviorY(value[1], tween, priority);
        }
      } else {
        this.overscrollBehaviorX(value, tween, priority);
        this.overscrollBehaviorY(value, tween, priority);
      }
      return this;
    }
  }

  @StyleAnimator("overscroll-behavior-x", String)
  overscrollBehaviorX: StyleAnimator<this, OverscrollBehavior>;

  @StyleAnimator("overscroll-behavior-y", String)
  overscrollBehaviorY: StyleAnimator<this, OverscrollBehavior>;

  padding(): [Length | undefined,
              Length | undefined,
              Length | undefined,
              Length | undefined] |
             Length | undefined;
  padding(value: [AnyLength | undefined,
                  AnyLength | undefined,
                  AnyLength | undefined,
                  AnyLength | undefined] |
                 AnyLength | undefined,
          tween?: Tween<Length>,
          priority?: string): this;
  padding(value?: [AnyLength | undefined,
                   AnyLength | undefined,
                   AnyLength | undefined,
                   AnyLength | undefined] |
                  AnyLength | undefined,
          tween?: Tween<Length>,
          priority?: string): [Length | undefined,
                               Length | undefined,
                               Length | undefined,
                               Length | undefined] |
                              Length | undefined | this {
    if (value === void 0) {
      const paddingTop = this.paddingTop();
      const paddingRight = this.paddingRight();
      const paddingBottom = this.paddingBottom();
      const paddingLeft = this.paddingLeft();
      if (Objects.equal(paddingTop, paddingRight)
          && Objects.equal(paddingRight, paddingBottom)
          && Objects.equal(paddingBottom, paddingLeft)) {
        return paddingTop;
      } else {
        return [paddingTop, paddingRight, paddingBottom, paddingLeft];
      }
    } else {
      if (Array.isArray(value)) {
        if (value.length >= 1) {
          this.paddingTop(value[0], tween, priority);
        }
        if (value.length >= 2) {
          this.paddingRight(value[1], tween, priority);
        }
        if (value.length >= 3) {
          this.paddingBottom(value[2], tween, priority);
        }
        if (value.length >= 4) {
          this.paddingLeft(value[3], tween, priority);
        }
      } else {
        this.paddingTop(value, tween, priority);
        this.paddingRight(value, tween, priority);
        this.paddingBottom(value, tween, priority);
        this.paddingLeft(value, tween, priority);
      }
      return this;
    }
  }

  @StyleAnimator("padding-top", Length)
  paddingTop: StyleAnimator<this, Length, AnyLength>;

  @StyleAnimator("padding-right", Length)
  paddingRight: StyleAnimator<this, Length, AnyLength>;

  @StyleAnimator("padding-bottom", Length)
  paddingBottom: StyleAnimator<this, Length, AnyLength>;

  @StyleAnimator("padding-left", Length)
  paddingLeft: StyleAnimator<this, Length, AnyLength>;

  @StyleAnimator("pointer-events", String)
  pointerEvents: StyleAnimator<this, PointerEvents>;

  @StyleAnimator("position", String)
  position: StyleAnimator<this, Position>;

  @StyleAnimator("right", [Length, String])
  right: StyleAnimator<this, Length | "auto", AnyLength | "auto">;

  @StyleAnimator("text-align", String)
  textAlign: StyleAnimator<this, TextAlign>;

  @StyleAnimator("text-decoration-color", [Color, String])
  textDecorationColor: StyleAnimator<this, Color | "currentColor", AnyColor | "currentColor">;

  @StyleAnimator("text-decoration-line", String)
  textDecorationLine: StyleAnimator<this, string>;

  @StyleAnimator("text-decoration-style", String)
  textDecorationStyle: StyleAnimator<this, TextDecorationStyle>;

  @StyleAnimator("text-overflow", String)
  textOverflow: StyleAnimator<this, string>;

  @StyleAnimator("text-transform", String)
  textTransform: StyleAnimator<this, TextTransform>;

  @StyleAnimator("top", [Length, String])
  top: StyleAnimator<this, Length | "auto", AnyLength | "auto">;

  @StyleAnimator("touch-action", String)
  touchAction: StyleAnimator<this, TouchAction>;

  @StyleAnimator("transform", Transform)
  transform: StyleAnimator<this, Transform, AnyTransform>;

  @StyleAnimator(["user-select", "-webkit-user-select", "-moz-user-select", "-ms-user-select"], String)
  userSelect: StyleAnimator<this, UserSelect>;

  @StyleAnimator("vertical-align", [Length, String])
  verticalAlign: StyleAnimator<this, VerticalAlign, AnyLength | VerticalAlign>;

  @StyleAnimator("visibility", String)
  visibility: StyleAnimator<this, Visibility>;

  @StyleAnimator("-webkit-overflow-scrolling", String)
  webkitOverflowScrolling: StyleAnimator<this, "auto" | "touch">;

  @StyleAnimator("white-space", String)
  whiteSpace: StyleAnimator<this, WhiteSpace>;

  @StyleAnimator("width", [Length, String])
  width: StyleAnimator<this, Width, AnyLength | Width>;

  @StyleAnimator("z-index", [Number, String])
  zIndex: StyleAnimator<this, number | string>;

  static fromTag<T extends keyof HtmlViewTagMap>(tag: T): HtmlViewTagMap[T];
  static fromTag(tag: string): HtmlView;
  static fromTag(tag: string): HtmlView {
    if (tag === "canvas") {
      return new View.Canvas(document.createElement(tag) as HTMLCanvasElement);
    } else {
      return new HtmlView(document.createElement(tag));
    }
  }

  static fromNode(node: HTMLCanvasElement): CanvasView;
  static fromNode(node: HTMLElement): HtmlView;
  static fromNode(node: SVGElement): SvgView;
  static fromNode(node: Element): ElementView;
  static fromNode(node: Text): TextView;
  static fromNode(node: Node): NodeView;
  static fromNode(node: ViewNode): NodeView {
    if (node.view instanceof View) {
      return node.view;
    } else if (node instanceof HTMLCanvasElement) {
      return new View.Canvas(node);
    } else if (node instanceof HTMLElement) {
      return new HtmlView(node);
    }
    throw new TypeError("" + node);
  }

  static create<T extends keyof HtmlViewTagMap>(tag: T): HtmlViewTagMap[T];
  static create(tag: string): HtmlView;
  static create(node: HTMLCanvasElement): CanvasView;
  static create(node: HTMLElement): HtmlView;
  static create<C extends ElementViewConstructor<HTMLElement, HtmlView>>(viewConstructor: C): InstanceType<C>;
  static create(source: string | HTMLElement | ElementViewConstructor<HTMLElement, HtmlView>): HtmlView {
    if (typeof source === "string") {
      return HtmlView.fromTag(source);
    } else if (source instanceof HTMLElement) {
      return HtmlView.fromNode(source);
    } else if (typeof source === "function") {
      return HtmlView.fromConstructor(source);
    }
    throw new TypeError("" + source);
  }

  /** @hidden */
  static readonly tag: string = "div";
}
View.Html = HtmlView;
