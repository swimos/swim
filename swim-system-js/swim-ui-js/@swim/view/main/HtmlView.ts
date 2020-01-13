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
import {AnyTransform, Transform} from "@swim/transform";
import {Tween} from "@swim/transition";
import {AnyBoxShadow, BoxShadow} from "@swim/style";
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
import {
  Constrain,
  ConstrainVariable,
  ConstrainBinding,
  ConstraintRelation,
  AnyConstraintStrength,
  ConstraintStrength,
  Constraint,
} from "@swim/constraint";
import {AttributeAnimator} from "./attribute/AttributeAnimator";
import {StyleAnimator} from "./style/StyleAnimator";
import {LayoutScope} from "./layout/LayoutScope";
import {LayoutManager} from "./layout/LayoutManager";
import {LayoutAnchor} from "./layout/LayoutAnchor";
import {ViewContext} from "./ViewContext";
import {View} from "./View";
import {LayoutView} from "./LayoutView";
import {NodeView} from "./NodeView";
import {TextView} from "./TextView";
import {ElementViewClass, ElementView} from "./ElementView";
import {SvgView} from "./SvgView";
import {HtmlViewController} from "./HtmlViewController";
import {CanvasView} from "./CanvasView";

export interface ViewHtml extends HTMLElement {
  view?: HtmlView;
}

export class HtmlView extends ElementView implements LayoutView {
  /** @hidden */
  readonly _node: ViewHtml;
  /** @hidden */
  _viewController: HtmlViewController | null;
  /** @hidden */
  _variables: ConstrainVariable[] | undefined;
  /** @hidden */
  _constraints: Constraint[] | undefined;

  constructor(node: HTMLElement, key: string | null = null) {
    super(node, key);
  }

  get node(): ViewHtml {
    return this._node;
  }

  protected initNode(node: ViewHtml): void {
    // hook
  }

  get viewController(): HtmlViewController | null {
    return this._viewController;
  }

  append(child: "svg"): SvgView;
  append(child: "canvas"): CanvasView;
  append(tag: string): HtmlView;
  append(child: HTMLElement): HtmlView;
  append(child: Element): ElementView;
  append(child: Text): TextView;
  append(child: Node): NodeView;
  append(child: NodeView): typeof child;
  append<V extends ElementView>(child: ElementViewClass<Element, V>, key?: string): V;
  append<V extends ElementView>(child: string | Node | NodeView | ElementViewClass<Element, V>, key?: string): NodeView {
    if (typeof child === "string") {
      child = HtmlView.create(child);
    }
    if (child instanceof Node) {
      child = View.fromNode(child);
    }
    if (typeof child === "function") {
      child = View.create(child, key);
    }
    this.appendChildView(child);
    return child;
  }

  prepend(child: "svg"): SvgView;
  prepend(child: "canvas"): CanvasView;
  prepend(tag: string): HtmlView;
  prepend(child: HTMLElement): HtmlView;
  prepend(child: Element): ElementView;
  prepend(child: Text): TextView;
  prepend(child: Node): NodeView;
  prepend(child: NodeView): typeof child;
  prepend<V extends ElementView>(child: ElementViewClass<Element, V>, key?: string): V;
  prepend<V extends ElementView>(child: string | Node | NodeView | ElementViewClass<Element, V>, key?: string): NodeView {
    if (typeof child === "string") {
      child = HtmlView.create(child);
    }
    if (child instanceof Node) {
      child = View.fromNode(child);
    }
    if (typeof child === "function") {
      child = View.create(child, key);
    }
    this.prependChildView(child);
    return child;
  }

  insert(child: "svg", target: View | Node | null): SvgView;
  insert(child: "canvas", target: View | Node | null): CanvasView;
  insert(tag: string, target: View | Node | null): HtmlView;
  insert(child: HTMLElement, target: View | Node | null): HtmlView;
  insert(child: Element, target: View | Node | null): ElementView;
  insert(child: Text, target: View | Node | null): TextView;
  insert(child: Node, target: View | Node | null): NodeView;
  insert(child: NodeView, target: View | Node | null): typeof child;
  insert<V extends ElementView>(child: ElementViewClass<Element, V>,
                                target: View | Node | null, key?: string): V;
  insert<V extends ElementView>(child: string | Node | NodeView | ElementViewClass<Element, V>,
                                target: View | Node | null, key?: string): NodeView {
    if (typeof child === "string") {
      child = HtmlView.create(child);
    }
    if (child instanceof Node) {
      child = View.fromNode(child);
    }
    if (typeof child === "function") {
      child = View.create(child, key);
    }
    this.insertChild(child, target);
    return child;
  }

  get parentTransform(): Transform {
    const transform = this.transform();
    return transform || Transform.identity();
  }

  variable(name: string, value?: number, strength?: AnyConstraintStrength): ConstrainVariable {
    if (value === void 0) {
      value = 0;
    }
    if (strength === void 0) {
      strength = ConstraintStrength.Strong;
    } else {
      strength = ConstraintStrength.fromAny(strength);
    }
    return new ConstrainBinding(this, name, value, strength);
  }

  constraint(lhs: Constrain | number, relation: ConstraintRelation,
             rhs?: Constrain | number, strength?: AnyConstraintStrength): Constraint {
    if (typeof lhs === "number") {
      lhs = Constrain.constant(lhs);
    }
    if (typeof rhs === "number") {
      rhs = Constrain.constant(rhs);
    }
    const constrain = rhs ? lhs.minus(rhs) : lhs;
    if (strength === void 0) {
      strength = ConstraintStrength.Required;
    } else {
      strength = ConstraintStrength.fromAny(strength);
    }
    return new Constraint(this, constrain, relation, strength);
  }

  get variables(): ReadonlyArray<ConstrainVariable> {
    if (this._variables === void 0) {
      this._variables = [];
    }
    return this._variables;
  }

  hasVariable(variable: ConstrainVariable): boolean {
    return this._variables !== void 0 && this._variables.indexOf(variable) >= 0;
  }

  addVariable(variable: ConstrainVariable): void {
    if (this._variables === void 0) {
      this._variables = [];
    }
    if (this._variables.indexOf(variable) < 0) {
      this._variables.push(variable);
      this.activateVariable(variable);
    }
  }

  /** @hidden */
  activateVariable(variable: ConstrainVariable): void {
    const appView = this.appView;
    if (LayoutManager.is(appView)) {
      appView.activateVariable(variable);
      this.requireUpdate(View.NeedsLayout);
    }
  }

  removeVariable(variable: ConstrainVariable): void {
    if (this._variables !== void 0) {
      const index = this._variables.indexOf(variable);
      if (index >= 0) {
        this.deactivateVariable(variable);
        this._variables.splice(index, 1);
      }
    }
  }

  /** @hidden */
  deactivateVariable(variable: ConstrainVariable): void {
    const appView = this.appView;
    if (LayoutManager.is(appView)) {
      appView.deactivateVariable(variable);
      this.requireUpdate(View.NeedsLayout);
    }
  }

  setVariable(variable: ConstrainVariable, state: number): void {
    const appView = this.appView;
    if (LayoutManager.is(appView)) {
      appView.setVariable(variable, state);
    }
  }

  get constraints(): ReadonlyArray<Constraint> {
    if (this._constraints === void 0) {
      this._constraints = [];
    }
    return this._constraints;
  }

  hasConstraint(constraint: Constraint): boolean {
    return this._constraints !== void 0 && this._constraints.indexOf(constraint) >= 0;
  }

  addConstraint(constraint: Constraint): void {
    if (this._constraints === void 0) {
      this._constraints = [];
    }
    if (this._constraints.indexOf(constraint) < 0) {
      this._constraints.push(constraint);
      this.activateConstraint(constraint);
    }
  }

  /** @hidden */
  activateConstraint(constraint: Constraint): void {
    const appView = this.appView;
    if (LayoutManager.is(appView)) {
      appView.activateConstraint(constraint);
      this.requireUpdate(View.NeedsLayout);
    }
  }

  removeConstraint(constraint: Constraint): void {
    if (this._constraints !== void 0) {
      const index = this._constraints.indexOf(constraint);
      if (index >= 0) {
        this._constraints.splice(index, 1);
        this.deactivateConstraint(constraint);
      }
    }
  }

  /** @hidden */
  deactivateConstraint(constraint: Constraint): void {
    const appView = this.appView;
    if (LayoutManager.is(appView)) {
      appView.deactivateConstraint(constraint);
      this.requireUpdate(View.NeedsLayout);
    }
  }

  /** @hidden */
  activateLayout(): void {
    const variables = this._variables;
    const constraints = this._constraints;
    let appView: View | null;
    if ((variables !== void 0 || constraints !== void 0)
        && (appView = this.appView, LayoutManager.is(appView))) {
      for (let i = 0, n = variables !== void 0 ? variables.length : 0; i < n; i += 1) {
        const variable = variables![i];
        if (variable instanceof LayoutAnchor) {
          appView.activateVariable(variable);
          this.requireUpdate(View.NeedsLayout);
        }
      }
      for (let i = 0, n = constraints !== void 0 ? constraints.length : 0; i < n; i += 1) {
        appView.activateConstraint(constraints![i]);
        this.requireUpdate(View.NeedsLayout);
      }
    }
  }

  /** @hidden */
  deactivateLayout(): void {
    const variables = this._variables;
    const constraints = this._constraints;
    let appView: View | null;
    if ((variables !== void 0 || constraints !== void 0)
        && (appView = this.appView, LayoutManager.is(appView))) {
      for (let i = 0, n = constraints !== void 0 ? constraints.length : 0; i < n; i += 1) {
        appView.deactivateConstraint(constraints![i]);
        this.requireUpdate(View.NeedsLayout);
      }
      for (let i = 0, n = variables !== void 0 ? variables.length : 0; i < n; i += 1) {
        appView.deactivateVariable(variables![i]);
        this.requireUpdate(View.NeedsLayout);
      }
    }
  }

  protected didMount(): void {
    super.didMount();
    this.activateLayout();
  }

  protected willUnmount(): void {
    this.deactivateLayout();
    super.willUnmount();
  }

  protected didLayout(viewContext: ViewContext): void {
    this.updateLayoutStates();
    this.updateVariables();
    super.didLayout(viewContext);
  }

  protected updateLayoutStates(): void {
    if (this.hasOwnProperty("topAnchor")) {
      this.topAnchor.updateState();
    }
    if (this.hasOwnProperty("rightAnchor")) {
      this.rightAnchor.updateState();
    }
    if (this.hasOwnProperty("bottomAnchor")) {
      this.bottomAnchor.updateState();
    }
    if (this.hasOwnProperty("leftAnchor")) {
      this.leftAnchor.updateState();
    }
    if (this.hasOwnProperty("widthAnchor")) {
      this.widthAnchor.updateState();
    }
    if (this.hasOwnProperty("heightAnchor")) {
      this.heightAnchor.updateState();
    }
    if (this.hasOwnProperty("centerXAnchor")) {
      this.centerXAnchor.updateState();
    }
    if (this.hasOwnProperty("centerYAnchor")) {
      this.centerYAnchor.updateState();
    }
  }

  /** @hidden */
  updateVariables(): void {
    const appView = this.appView;
    if (LayoutScope.is(appView)) {
      appView.updateVariables();
    }
  }

  on<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, event: HTMLElementEventMap[K]) => unknown, options?: AddEventListenerOptions | boolean): this;
  on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this;
  on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this {
    this._node.addEventListener(type, listener, options);
    return this;
  }

  off<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, event: HTMLElementEventMap[K]) => unknown, options?: EventListenerOptions | boolean): this;
  off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this;
  off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this {
    this._node.removeEventListener(type, listener, options);
    return this;
  }

  @LayoutAnchor<HtmlView>({
    get(oldState: number): number {
      const offsetParent = this._node.offsetParent!;
      const offsetBounds = offsetParent.getBoundingClientRect();
      const bounds = this._node.getBoundingClientRect();
      const newState = bounds.top - offsetBounds.top;
      if (oldState !== newState) {
        this.requireUpdate(View.NeedsLayout);
      }
      return newState;
    },
    set(newValue: number): void {
      this.top.setState(Length.px(newValue));
      this.requireUpdate(View.NeedsLayout);
    },
    strength: "strong",
  })
  topAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    get(oldState: number): number {
      const offsetParent = this._node.offsetParent!;
      const offsetBounds = offsetParent.getBoundingClientRect();
      const bounds = this._node.getBoundingClientRect();
      const newState = offsetBounds.right + bounds.right;
      if (oldState !== newState) {
        this.requireUpdate(View.NeedsLayout);
      }
      return newState;
    },
    set(newValue: number): void {
      this.right.setState(Length.px(newValue));
      this.requireUpdate(View.NeedsLayout);
    },
    strength: "strong",
  })
  rightAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    get(oldState: number): number {
      const offsetParent = this._node.offsetParent!;
      const offsetBounds = offsetParent.getBoundingClientRect();
      const bounds = this._node.getBoundingClientRect();
      const newState = offsetBounds.bottom + bounds.bottom;
      if (oldState !== newState) {
        this.requireUpdate(View.NeedsLayout);
      }
      return newState;
    },
    set(newValue: number): void {
      this.bottom.setState(Length.px(newValue));
      this.requireUpdate(View.NeedsLayout);
    },
    strength: "strong",
  })
  bottomAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    get(oldState: number): number {
      const offsetParent = this._node.offsetParent!;
      const offsetBounds = offsetParent.getBoundingClientRect();
      const bounds = this._node.getBoundingClientRect();
      const newState = bounds.left - offsetBounds.left;
      if (oldState !== newState) {
        this.requireUpdate(View.NeedsLayout);
      }
      return newState;
    },
    set(newValue: number): void {
      this.left.setState(Length.px(newValue));
      this.requireUpdate(View.NeedsLayout);
    },
    strength: "strong",
  })
  leftAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    get(oldState: number): number {
      const bounds = this._node.getBoundingClientRect();
      const newState = bounds.width;
      if (oldState !== newState) {
        this.requireUpdate(View.NeedsLayout);
      }
      return newState;
    },
    set(newValue: number): void {
      this.width.setState(Length.px(newValue));
      this.requireUpdate(View.NeedsLayout);
    },
    strength: "strong",
  })
  widthAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    get(oldState: number): number {
      const bounds = this._node.getBoundingClientRect();
      const newState = bounds.height;
      if (oldState !== newState) {
        this.requireUpdate(View.NeedsLayout);
      }
      return newState;
    },
    set(newValue: number): void {
      this.height.setState(Length.px(newValue));
      this.requireUpdate(View.NeedsLayout);
    },
    strength: "strong",
  })
  heightAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    get(oldState: number): number {
      const offsetParent = this._node.offsetParent!;
      const offsetBounds = offsetParent.getBoundingClientRect();
      const bounds = this._node.getBoundingClientRect();
      const newState = bounds.left + 0.5 * bounds.width - offsetBounds.left;
      if (oldState !== newState) {
        this.requireUpdate(View.NeedsLayout);
      }
      return newState;
    },
    set(newValue: number): void {
      const rightAnchor = this.hasOwnProperty("rightAnchor") ? this.rightAnchor : void 0;
      const leftAnchor = this.hasOwnProperty("leftAnchor") ? this.leftAnchor : void 0;
      const widthAnchor = this.hasOwnProperty("widthAnchor") ? this.widthAnchor : void 0;
      if (leftAnchor && leftAnchor.enabled()) {
        this.width.setState(Length.px(2 * (newValue - leftAnchor.value)));
        this.requireUpdate(View.NeedsLayout);
      } else if (rightAnchor && rightAnchor.enabled()) {
        this.width.setState(Length.px(2 * (rightAnchor.value - newValue)));
        this.requireUpdate(View.NeedsLayout);
      } else if (widthAnchor && widthAnchor.enabled()) {
        this.left.setState(Length.px(newValue - 0.5 * widthAnchor.value));
        this.requireUpdate(View.NeedsLayout);
      }
    },
    strength: "strong",
  })
  centerXAnchor: LayoutAnchor<this>;

  @LayoutAnchor<HtmlView>({
    get(oldState: number): number {
      const offsetParent = this._node.offsetParent!;
      const offsetBounds = offsetParent.getBoundingClientRect();
      const bounds = this._node.getBoundingClientRect();
      const newState = bounds.top + 0.5 * bounds.height - offsetBounds.top;
      if (oldState !== newState) {
        this.requireUpdate(View.NeedsLayout);
      }
      return newState;
    },
    set(newValue: number): void {
      const topAnchor = this.hasOwnProperty("topAnchor") ? this.topAnchor : void 0;
      const bottomAnchor = this.hasOwnProperty("bottomAnchor") ? this.bottomAnchor : void 0;
      const heightAnchor = this.hasOwnProperty("heightAnchor") ? this.heightAnchor : void 0;
      if (topAnchor && topAnchor.enabled()) {
        this.height.setState(Length.px(2 * (newValue - topAnchor.value)));
        this.requireUpdate(View.NeedsLayout);
      } else if (bottomAnchor && bottomAnchor.enabled()) {
        this.height.setState(Length.px(2 * (bottomAnchor.value - newValue)));
        this.requireUpdate(View.NeedsLayout);
      } else if (heightAnchor && heightAnchor.enabled()) {
        this.top.setState(Length.px(newValue - 0.5 * heightAnchor.value));
        this.requireUpdate(View.NeedsLayout);
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

  borderColor(): [Color | "currentColor" | null | undefined,
                  Color | "currentColor" | null | undefined,
                  Color | "currentColor" | null | undefined,
                  Color | "currentColor" | null | undefined] |
                 Color | "currentColor" | null | undefined;
  borderColor(value: [AnyColor | "currentColor" | null,
                      AnyColor | "currentColor" | null,
                      AnyColor | "currentColor" | null,
                      AnyColor | "currentColor" | null] |
                     AnyColor | "currentColor" | null,
              tween?: Tween<Color | "currentColor">,
              priority?: string | null): this;
  borderColor(value?: [AnyColor | "currentColor" | null,
                       AnyColor | "currentColor" | null,
                       AnyColor | "currentColor" | null,
                       AnyColor | "currentColor" | null] |
                      AnyColor | "currentColor" | null,
              tween?: Tween<Color | "currentColor">,
              priority?: string | null): [Color | "currentColor" | null | undefined,
                                          Color | "currentColor" | null | undefined,
                                          Color | "currentColor" | null | undefined,
                                          Color | "currentColor" | null | undefined] |
                                         Color | "currentColor" | null | undefined | this {
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

  borderRadius(): [Length | null | undefined,
                   Length | null | undefined,
                   Length | null | undefined,
                   Length | null | undefined] |
                  Length | null | undefined;
  borderRadius(value: [AnyLength | null,
                       AnyLength | null,
                       AnyLength | null,
                       AnyLength | null] |
                      AnyLength | null,
               tween?: Tween<Length>,
               priority?: string | null): this;
  borderRadius(value?: [AnyLength | null,
                        AnyLength | null,
                        AnyLength | null,
                        AnyLength | null] |
                       AnyLength | null,
               tween?: Tween<Length>,
               priority?: string | null): [Length | null | undefined,
                                           Length | null | undefined,
                                           Length | null | undefined,
                                           Length | null | undefined] |
                                          Length | null | undefined | this {
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

  borderStyle(): [BorderStyle | null | undefined,
                  BorderStyle | null | undefined,
                  BorderStyle | null | undefined,
                  BorderStyle | null | undefined] |
                 BorderStyle | null | undefined;
  borderStyle(value: [BorderStyle | null,
                      BorderStyle | null,
                      BorderStyle | null,
                      BorderStyle | null] |
                     BorderStyle | null,
              tween?: Tween<BorderStyle>,
              priority?: string | null): this;
  borderStyle(value?: [BorderStyle | null,
                       BorderStyle | null,
                       BorderStyle | null,
                       BorderStyle | null] |
                      BorderStyle | null,
              tween?: Tween<BorderStyle>,
              priority?: string | null): [BorderStyle | null | undefined,
                                          BorderStyle | null | undefined,
                                          BorderStyle | null | undefined,
                                          BorderStyle | null | undefined] |
                                         BorderStyle | null | undefined | this {
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

  borderWidth(): [BorderWidth | null | undefined,
                  BorderWidth | null | undefined,
                  BorderWidth | null | undefined,
                  BorderWidth | null | undefined] |
                 BorderWidth | null | undefined;
  borderWidth(value: [BorderWidth | AnyLength | null,
                      BorderWidth | AnyLength | null,
                      BorderWidth | AnyLength | null,
                      BorderWidth | AnyLength | null] |
                     BorderWidth | AnyLength | null,
              tween?: Tween<BorderWidth>,
              priority?: string | null): this;
  borderWidth(value?: [BorderWidth | AnyLength | null,
                       BorderWidth | AnyLength | null,
                       BorderWidth | AnyLength | null,
                       BorderWidth | AnyLength | null] |
                      BorderWidth | AnyLength | null,
              tween?: Tween<BorderWidth>,
              priority?: string | null): [BorderWidth | null | undefined,
                                          BorderWidth | null | undefined,
                                          BorderWidth | null | undefined,
                                          BorderWidth | null | undefined] |
                                         BorderWidth | null | undefined | this {
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
  font(value: AnyFont | null, tween?: Tween<any>, priority?: string | null): this;
  font(value?: AnyFont | null, tween?: Tween<any>, priority?: string | null): Font | undefined | this {
    if (value === void 0) {
      const style = this.fontStyle();
      const variant = this.fontVariant();
      const weight = this.fontWeight();
      const stretch = this.fontStretch();
      const size = this.fontSize();
      const height = this.lineHeight();
      const family = this.fontFamily();
      if (family !== null && family !== void 0) {
        return Font.from(style, variant, weight, stretch, size, height, family);
      } else {
        return void 0;
      }
    } else {
      value = value !== null ? Font.fromAny(value) : null;
      if (value === null || value.style() !== null) {
        this.fontStyle(value !== null ? value.style() : null, tween, priority);
      }
      if (value === null || value.variant() !== null) {
        this.fontVariant(value !== null ? value.variant() : null, tween, priority);
      }
      if (value === null || value.weight() !== null) {
        this.fontWeight(value !== null ? value.weight() : null, tween, priority);
      }
      if (value === null || value.stretch() !== null) {
        this.fontStretch(value !== null ? value.stretch() : null, tween, priority);
      }
      if (value === null || value.size() !== null) {
        this.fontSize(value !== null ? value.size() : null, tween, priority);
      }
      if (value === null || value.height() !== null) {
        this.lineHeight(value !== null ? value.height() : null, tween, priority);
      }
      this.fontFamily(value !== null ? value.family() : null, tween, priority);
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

  margin(): [Length | "auto" | null | undefined,
             Length | "auto" | null | undefined,
             Length | "auto" | null | undefined,
             Length | "auto" | null | undefined] |
            Length | "auto" | null | undefined;
  margin(value: [AnyLength | "auto" | null,
                 AnyLength | "auto" | null,
                 AnyLength | "auto" | null,
                 AnyLength | "auto" | null] |
                AnyLength | "auto" | null,
         tween?: Tween<Length | "auto">,
         priority?: string | null): this;
  margin(value?: [AnyLength | "auto" | null,
                  AnyLength | "auto" | null,
                  AnyLength | "auto" | null,
                  AnyLength | "auto" | null] |
                 AnyLength | "auto" | null,
         tween?: Tween<Length | "auto">,
         priority?: string | null): [Length | "auto" | null | undefined,
                                     Length | "auto" | null | undefined,
                                     Length | "auto" | null | undefined,
                                     Length | "auto" | null | undefined] |
                                    Length | "auto" | null | undefined | this {
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

  @StyleAnimator("overflow", String)
  overflow: StyleAnimator<this, Overflow>;

  @StyleAnimator("overflow-x", String)
  overflowX: StyleAnimator<this, Overflow>;

  @StyleAnimator("overflow-y", String)
  overflowY: StyleAnimator<this, Overflow>;

  padding(): [Length | null | undefined,
              Length | null | undefined,
              Length | null | undefined,
              Length | null | undefined] |
             Length | null | undefined;
  padding(value: [AnyLength | null,
                  AnyLength | null,
                  AnyLength | null,
                  AnyLength | null] |
                 AnyLength | null,
          tween?: Tween<Length>,
          priority?: string | null): this;
  padding(value?: [AnyLength | null,
                   AnyLength | null,
                   AnyLength | null,
                   AnyLength | null] |
                  AnyLength | null,
          tween?: Tween<Length>,
          priority?: string | null): [Length | null | undefined,
                                      Length | null | undefined,
                                      Length | null | undefined,
                                      Length | null | undefined] |
                                     Length | null | undefined | this {
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

  @StyleAnimator("white-space", String)
  whiteSpace: StyleAnimator<this, WhiteSpace>;

  @StyleAnimator("width", [Length, String])
  width: StyleAnimator<this, Width, AnyLength | Width>;

  @StyleAnimator("z-index", [Number, String])
  zIndex: StyleAnimator<this, number | string>;

  static create(tag: "svg"): SvgView;
  static create(tag: "canvas"): CanvasView;
  static create(tag: string): HtmlView;
  static create<V extends HtmlView>(tag: ElementViewClass<HTMLElement, V>): V;
  static create<V extends HtmlView>(tag: string | ElementViewClass<HTMLElement, V>): ElementView {
    if (typeof tag === "string") {
      if (tag === "svg") {
        return new View.Svg(document.createElementNS(View.Svg.NS, tag) as SVGElement);
      } else if (tag === "canvas") {
        return new View.Canvas(document.createElement(tag) as HTMLCanvasElement);
      } else {
        return new HtmlView(document.createElement(tag) as HTMLElement);
      }
    } else if (typeof tag === "function") {
      return new tag(document.createElement(tag.tag));
    }
    throw new TypeError("" + tag);
  }

  /** @hidden */
  static readonly tag: string = "div";
}
View.Html = HtmlView;
