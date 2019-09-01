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
import {
  AlignmentBaseline,
  CssCursor,
  FillRule,
  Paint,
  TextAnchor,
  TouchAction,
} from "@swim/style";
import {AttributeAnimator} from "./attribute/AttributeAnimator";
import {StyleAnimator} from "./style/StyleAnimator";
import {View} from "./View";
import {NodeView} from "./NodeView";
import {TextView} from "./TextView";
import {ElementViewClass, ElementView} from "./ElementView";
import {SvgViewController} from "./SvgViewController";
import {CanvasView} from "./CanvasView";

export interface ViewSvg extends SVGElement {
  view?: SvgView;
}

export class SvgView extends ElementView {
  /** @hidden */
  readonly _node: ViewSvg;
  /** @hidden */
  _viewController: SvgViewController | null;

  constructor(node: SVGElement, key: string | null = null) {
    super(node, key);
  }

  get node(): ViewSvg {
    return this._node;
  }

  protected initNode(node: ViewSvg): void {
    // hook
  }

  get viewController(): SvgViewController | null {
    return this._viewController;
  }

  append(tag: string): SvgView;
  append(child: SVGElement): SvgView;
  append(child: Element): ElementView;
  append(child: Text): TextView;
  append(child: Node): NodeView;
  append(child: NodeView): typeof child;
  append<V extends ElementView>(child: ElementViewClass<Element, V>, key?: string): V;
  append<V extends ElementView>(child: string | Node | NodeView | ElementViewClass<Element, V>, key?: string): NodeView {
    if (typeof child === "string") {
      child = SvgView.create(child);
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

  prepend(tag: string): SvgView;
  prepend(child: SVGElement): SvgView;
  prepend(child: Element): ElementView;
  prepend(child: Text): TextView;
  prepend(child: Node): NodeView;
  prepend(child: NodeView): typeof child;
  prepend<V extends ElementView>(child: ElementViewClass<Element, V>, key?: string): V;
  prepend<V extends ElementView>(child: string | Node | NodeView | ElementViewClass<Element, V>, key?: string): NodeView {
    if (typeof child === "string") {
      child = SvgView.create(child);
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

  insert(tag: string, target: View | Node | null): SvgView;
  insert(child: SVGElement, target: View | Node | null): SvgView;
  insert(child: Element, target: View | Node | null): ElementView;
  insert(child: Text, target: View | Node | null): TextView;
  insert(child: Node, target: View | Node | null): NodeView;
  insert(child: NodeView, target: View | Node | null): typeof child;
  insert<V extends ElementView>(child: ElementViewClass<Element, V>,
                                target: View | Node | null, key?: string): V;
  insert<V extends ElementView>(child: string | Node | NodeView | ElementViewClass<Element, V>,
                                target: View | Node | null, key?: string): NodeView {
    if (typeof child === "string") {
      child = SvgView.create(child);
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

  on<K extends keyof SVGElementEventMap>(type: K, listener: (this: SVGElement, event: SVGElementEventMap[K]) => unknown, options?: AddEventListenerOptions | boolean): this;
  on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this;
  on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this {
    this._node.addEventListener(type, listener, options);
    return this;
  }

  off<K extends keyof SVGElementEventMap>(type: K, listener: (this: SVGElement, event: SVGElementEventMap[K]) => unknown, options?: EventListenerOptions | boolean): this;
  off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this;
  off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this {
    this._node.removeEventListener(type, listener, options);
    return this;
  }

  @AttributeAnimator("alignment-baseline", String)
  alignmentBaseline: AttributeAnimator<this, AlignmentBaseline>;

  @AttributeAnimator("clip-path", String)
  clipPath: AttributeAnimator<this, string>;

  @AttributeAnimator("cursor", String)
  cursor: AttributeAnimator<this, CssCursor>;

  @AttributeAnimator("cx", Number)
  cx: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator("cy", Number)
  cy: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator("d", String)
  d: AttributeAnimator<this, string>;

  @AttributeAnimator("dx", [Number, String]) // list-of-lengths
  dx: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator("dy", [Number, String]) // list-of-lengths
  dy: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator("edgeMode", String)
  edgeMode: AttributeAnimator<this, string>;

  @AttributeAnimator("fill", [Color, String])
  fill: AttributeAnimator<this, Paint, AnyColor | Paint>;

  @AttributeAnimator("fill-rule", String)
  fillRuke: AttributeAnimator<this, FillRule>;

  @AttributeAnimator("height", Length)
  height: AttributeAnimator<this, Length, AnyLength>;

  @AttributeAnimator("in", String)
  in: AttributeAnimator<this, string>;

  @AttributeAnimator("in2", String)
  in2: AttributeAnimator<this, string>;

  @AttributeAnimator("mode", String)
  mode: AttributeAnimator<this, string>;

  @AttributeAnimator("opacity", Number)
  opacity: AttributeAnimator<this, number>;

  @AttributeAnimator("points", String)
  points: AttributeAnimator<this, string>;

  @AttributeAnimator("preserveAspectRatio", Boolean)
  preserveAspectRatio: AttributeAnimator<this, boolean, boolean | string>;

  @AttributeAnimator("r", Number)
  r: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator("result", String)
  result: AttributeAnimator<this, string>;

  @AttributeAnimator("stdDeviation", String)
  stdDeviation: AttributeAnimator<this, string>;

  @AttributeAnimator("stroke", [Color, String])
  stroke: AttributeAnimator<this, Paint, AnyColor | Paint>;

  @AttributeAnimator("stroke-dasharray", String)
  strokeDasharray: AttributeAnimator<this, string>;

  @AttributeAnimator("stroke-width", Number)
  strokeWidth: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator("text-anchor", String)
  textAnchor: AttributeAnimator<this, TextAnchor>;

  @StyleAnimator("touch-action", String)
  touchAction: StyleAnimator<this, TouchAction>;

  @AttributeAnimator("transform", Transform)
  transform: AttributeAnimator<this, Transform, AnyTransform>;

  @AttributeAnimator("type", String)
  type: AttributeAnimator<this, string>;

  @AttributeAnimator("values", String)
  values: AttributeAnimator<this, string>;

  @AttributeAnimator("viewBox", String)
  viewBox: AttributeAnimator<this, string>;

  @AttributeAnimator("width", Length)
  width: AttributeAnimator<this, Length, AnyLength>;

  @AttributeAnimator("x", Number)
  x: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator("x1", Number)
  x1: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator("x2", Number)
  x2: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator("y", Number)
  y: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator("y1", Number)
  y1: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator("y2", Number)
  y2: AttributeAnimator<this, number, number | string>;

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

  @StyleAnimator("line-height", LineHeight)
  lineHeight: StyleAnimator<this, LineHeight, AnyLineHeight>;

  static create(tag: "canvas"): CanvasView;
  static create(tag: string): SvgView;
  static create<V extends SvgView>(tag: ElementViewClass<SVGElement, V>): V;
  static create<V extends SvgView>(tag: string | ElementViewClass<SVGElement, V>): ElementView {
    if (typeof tag === "string") {
      if (tag === "canvas") {
        return new View.Canvas(document.createElement(tag) as HTMLCanvasElement);
      } else {
        return new SvgView(document.createElementNS(SvgView.NS, tag) as SVGElement);
      }
    } else if (typeof tag === "function") {
      return new tag(document.createElementNS(SvgView.NS, tag.tag) as SVGElement);
    }
    throw new TypeError("" + tag);
  }

  /** @hidden */
  static readonly tag: string = "svg";

  /** @hidden */
  static readonly NS: string = "http://www.w3.org/2000/svg";
}
View.Svg = SvgView;
