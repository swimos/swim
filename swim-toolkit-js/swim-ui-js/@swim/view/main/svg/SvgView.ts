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
  PointerEvents,
  StrokeLinecap,
  TextAnchor,
  TouchAction,
  StyleAnimatorMemberInit,
  StyleAnimator,
} from "@swim/style";
import {View} from "../View";
import {NodeView} from "../node/NodeView";
import {TextView} from "../text/TextView";
import {AttributeAnimatorMemberInit, AttributeAnimator} from "../attribute/AttributeAnimator";
import {ElementViewConstructor, ElementViewInit, ElementView} from "../element/ElementView";
import {SvgViewObserver} from "./SvgViewObserver";
import {SvgViewController} from "./SvgViewController";

export interface ViewSvg extends SVGElement {
  view?: SvgView;
}

export interface SvgViewTagMap {
  "svg": SvgView;
}

export interface SvgChildViewTagMap {
}

export interface SvgViewAttributesInit {
  alignmentBaseline?: AttributeAnimatorMemberInit<SvgView, "alignmentBaseline">;
  clipPath?: AttributeAnimatorMemberInit<SvgView, "clipPath">;
  cursor?: AttributeAnimatorMemberInit<SvgView, "cursor">;
  cx?: AttributeAnimatorMemberInit<SvgView, "cx">;
  cy?: AttributeAnimatorMemberInit<SvgView, "cy">;
  d?: AttributeAnimatorMemberInit<SvgView, "d">;
  dx?: AttributeAnimatorMemberInit<SvgView, "dx">;
  dy?: AttributeAnimatorMemberInit<SvgView, "dy">;
  edgeMode?: AttributeAnimatorMemberInit<SvgView, "edgeMode">;
  fill?: AttributeAnimatorMemberInit<SvgView, "fill">;
  fillRule?: AttributeAnimatorMemberInit<SvgView, "fillRule">;
  floodColor?: AttributeAnimatorMemberInit<SvgView, "floodColor">;
  floodOpacity?: AttributeAnimatorMemberInit<SvgView, "floodOpacity">;
  height?: AttributeAnimatorMemberInit<SvgView, "height">;
  in?: AttributeAnimatorMemberInit<SvgView, "in">;
  in2?: AttributeAnimatorMemberInit<SvgView, "in2">;
  lengthAdjust?: AttributeAnimatorMemberInit<SvgView, "lengthAdjust">;
  mode?: AttributeAnimatorMemberInit<SvgView, "mode">;
  opacity?: AttributeAnimatorMemberInit<SvgView, "opacity">;
  pointerEvents?: AttributeAnimatorMemberInit<SvgView, "pointerEvents">;
  points?: AttributeAnimatorMemberInit<SvgView, "points">;
  preserveAspectRatio?: AttributeAnimatorMemberInit<SvgView, "preserveAspectRatio">;
  r?: AttributeAnimatorMemberInit<SvgView, "r">;
  result?: AttributeAnimatorMemberInit<SvgView, "result">;
  stdDeviation?: AttributeAnimatorMemberInit<SvgView, "stdDeviation">;
  stroke?: AttributeAnimatorMemberInit<SvgView, "stroke">;
  strokeDasharray?: AttributeAnimatorMemberInit<SvgView, "strokeDasharray">;
  strokeLinecap?: AttributeAnimatorMemberInit<SvgView, "strokeLinecap">;
  strokeWidth?: AttributeAnimatorMemberInit<SvgView, "strokeWidth">;
  textAnchor?: AttributeAnimatorMemberInit<SvgView, "textAnchor">;
  textLength?: AttributeAnimatorMemberInit<SvgView, "textLength">;
  transform?: AttributeAnimatorMemberInit<SvgView, "transform">;
  type?: AttributeAnimatorMemberInit<SvgView, "type">;
  values?: AttributeAnimatorMemberInit<SvgView, "values">;
  viewBox?: AttributeAnimatorMemberInit<SvgView, "viewBox">;
  width?: AttributeAnimatorMemberInit<SvgView, "width">;
  x?: AttributeAnimatorMemberInit<SvgView, "x">;
  x1?: AttributeAnimatorMemberInit<SvgView, "x1">;
  x2?: AttributeAnimatorMemberInit<SvgView, "x2">;
  y?: AttributeAnimatorMemberInit<SvgView, "y">;
  y1?: AttributeAnimatorMemberInit<SvgView, "y1">;
  y2?: AttributeAnimatorMemberInit<SvgView, "y2">;
}

export interface SvgViewStyleInit {
  filter?: StyleAnimatorMemberInit<SvgView, "filter">;
  fontFamily?: StyleAnimatorMemberInit<SvgView, "fontFamily">;
  fontSize?: StyleAnimatorMemberInit<SvgView, "fontSize">;
  fontStretch?: StyleAnimatorMemberInit<SvgView, "fontStretch">;
  fontStyle?: StyleAnimatorMemberInit<SvgView, "fontStyle">;
  fontVariant?: StyleAnimatorMemberInit<SvgView, "fontVariant">;
  fontWeight?: StyleAnimatorMemberInit<SvgView, "fontWeight">;
  lineHeight?: StyleAnimatorMemberInit<SvgView, "lineHeight">;
  touchAction?: StyleAnimatorMemberInit<SvgView, "touchAction">;
}

export interface SvgViewInit extends ElementViewInit {
  viewController?: SvgViewController;
  attributes?: SvgViewAttributesInit;
  style?: SvgViewStyleInit;
}

export class SvgView extends ElementView {
  constructor(node: SVGElement) {
    super(node);
  }

  // @ts-ignore
  declare readonly node: ViewSvg;

  // @ts-ignore
  declare readonly viewController: SvgViewController | null;

  // @ts-ignore
  declare readonly viewObservers: ReadonlyArray<SvgViewObserver>;

  initView(init: SvgViewInit): void {
    super.initView(init);
    if (init.attributes !== void 0) {
      this.initAttributes(init.attributes);
    }
    if (init.style !== void 0) {
      this.initStyle(init.style);
    }
  }

  initAttributes(init: SvgViewAttributesInit): void {
    if (init.alignmentBaseline !== void 0) {
      this.alignmentBaseline(init.alignmentBaseline);
    }
    if (init.clipPath !== void 0) {
      this.clipPath(init.clipPath);
    }
    if (init.cursor !== void 0) {
      this.cursor(init.cursor);
    }
    if (init.cx !== void 0) {
      this.cx(init.cx);
    }
    if (init.cy !== void 0) {
      this.cy(init.cy);
    }
    if (init.cy !== void 0) {
      this.cy(init.cy);
    }
    if (init.d !== void 0) {
      this.d(init.d);
    }
    if (init.dx !== void 0) {
      this.dx(init.dx);
    }
    if (init.dy !== void 0) {
      this.dy(init.dy);
    }
    if (init.edgeMode !== void 0) {
      this.edgeMode(init.edgeMode);
    }
    if (init.fill !== void 0) {
      this.fill(init.fill);
    }
    if (init.fillRule !== void 0) {
      this.fillRule(init.fillRule);
    }
    if (init.floodColor !== void 0) {
      this.floodColor(init.floodColor);
    }
    if (init.floodOpacity !== void 0) {
      this.floodOpacity(init.floodOpacity);
    }
    if (init.height !== void 0) {
      this.height(init.height);
    }
    if (init.in !== void 0) {
      this.in(init.in);
    }
    if (init.in2 !== void 0) {
      this.in2(init.in2);
    }
    if (init.lengthAdjust !== void 0) {
      this.lengthAdjust(init.lengthAdjust);
    }
    if (init.mode !== void 0) {
      this.mode(init.mode);
    }
    if (init.opacity !== void 0) {
      this.opacity(init.opacity);
    }
    if (init.pointerEvents !== void 0) {
      this.pointerEvents(init.pointerEvents);
    }
    if (init.points !== void 0) {
      this.points(init.points);
    }
    if (init.preserveAspectRatio !== void 0) {
      this.preserveAspectRatio(init.preserveAspectRatio);
    }
    if (init.r !== void 0) {
      this.r(init.r);
    }
    if (init.result !== void 0) {
      this.result(init.result);
    }
    if (init.stdDeviation !== void 0) {
      this.stdDeviation(init.stdDeviation);
    }
    if (init.stroke !== void 0) {
      this.stroke(init.stroke);
    }
    if (init.strokeDasharray !== void 0) {
      this.strokeDasharray(init.strokeDasharray);
    }
    if (init.strokeLinecap !== void 0) {
      this.strokeLinecap(init.strokeLinecap);
    }
    if (init.strokeWidth !== void 0) {
      this.strokeWidth(init.strokeWidth);
    }
    if (init.textAnchor !== void 0) {
      this.textAnchor(init.textAnchor);
    }
    if (init.textLength !== void 0) {
      this.textLength(init.textLength);
    }
    if (init.transform !== void 0) {
      this.transform(init.transform);
    }
    if (init.type !== void 0) {
      this.type(init.type);
    }
    if (init.values !== void 0) {
      this.values(init.values);
    }
    if (init.viewBox !== void 0) {
      this.viewBox(init.viewBox);
    }
    if (init.width !== void 0) {
      this.width(init.width);
    }
    if (init.x !== void 0) {
      this.x(init.x);
    }
    if (init.x1 !== void 0) {
      this.x1(init.x1);
    }
    if (init.x2 !== void 0) {
      this.x2(init.x2);
    }
    if (init.y !== void 0) {
      this.y(init.y);
    }
    if (init.y1 !== void 0) {
      this.y1(init.y1);
    }
    if (init.y2 !== void 0) {
      this.y2(init.y2);
    }
  }

  initStyle(init: SvgViewStyleInit): void {
    if (init.filter !== void 0) {
      this.filter(init.filter);
    }
    if (init.fontFamily !== void 0) {
      this.fontFamily(init.fontFamily);
    }
    if (init.fontSize !== void 0) {
      this.fontSize(init.fontSize);
    }
    if (init.fontStretch !== void 0) {
      this.fontStretch(init.fontStretch);
    }
    if (init.fontStyle !== void 0) {
      this.fontStyle(init.fontStyle);
    }
    if (init.fontVariant !== void 0) {
      this.fontVariant(init.fontVariant);
    }
    if (init.fontWeight !== void 0) {
      this.fontWeight(init.fontWeight);
    }
    if (init.lineHeight !== void 0) {
      this.lineHeight(init.lineHeight);
    }
    if (init.touchAction !== void 0) {
      this.touchAction(init.touchAction);
    }
  }

  append<T extends keyof SvgChildViewTagMap>(tag: T, key?: string): SvgChildViewTagMap[T];
  append(tag: string, key?: string): SvgView;
  append(childNode: SVGElement, key?: string): SvgView;
  append(childNode: Element, key?: string): ElementView;
  append(childNode: Text, key?: string): TextView;
  append(childNode: Node, key?: string): NodeView;
  append<V extends NodeView>(childView: V, key?: string): V;
  append<VC extends ElementViewConstructor>(viewConstructor: VC, key?: string): InstanceType<VC>;
  append(child: string | Node | NodeView | ElementViewConstructor, key?: string): NodeView {
    if (typeof child === "string") {
      child = SvgView.fromTag(child);
    } else if (child instanceof Node) {
      child = SvgView.fromNode(child);
    } else if (typeof child === "function") {
      child = SvgView.fromConstructor(child);
    }
    this.appendChildView(child, key);
    return child;
  }

  prepend<T extends keyof SvgChildViewTagMap>(tag: T, key?: string): SvgChildViewTagMap[T];
  prepend(tag: string, key?: string): SvgView;
  prepend(childNode: SVGElement, key?: string): SvgView;
  prepend(childNode: Element, key?: string): ElementView;
  prepend(childNode: Text, key?: string): TextView;
  prepend(childNode: Node, key?: string): NodeView;
  prepend<V extends NodeView>(childView: V, key?: string): V;
  prepend<VC extends ElementViewConstructor>(viewConstructor: VC, key?: string): InstanceType<VC>;
  prepend(child: string | Node | NodeView | ElementViewConstructor, key?: string): NodeView {
    if (typeof child === "string") {
      child = SvgView.fromTag(child);
    } else if (child instanceof Node) {
      child = SvgView.fromNode(child);
    } else if (typeof child === "function") {
      child = SvgView.fromConstructor(child);
    }
    this.prependChildView(child, key);
    return child;
  }

  insert<T extends keyof SvgChildViewTagMap>(tag: T, target: View | Node | null, key?: string): SvgChildViewTagMap[T];
  insert(tag: string, target: View | Node | null, key?: string): SvgView;
  insert(childNode: SVGElement, target: View | Node | null, key?: string): SvgView;
  insert(childNode: Element, target: View | Node | null, key?: string): ElementView;
  insert(childNode: Text, target: View | Node | null, key?: string): TextView;
  insert(childNode: Node, target: View | Node | null, key?: string): NodeView;
  insert<V extends NodeView>(childView: V, target: View | Node | null, key?: string): V;
  insert<VC extends ElementViewConstructor>(viewConstructor: VC, target: View | Node | null, key?: string): InstanceType<VC>;
  insert(child: string | Node | NodeView | ElementViewConstructor, target: View | Node | null, key?: string): NodeView {
    if (typeof child === "string") {
      child = SvgView.fromTag(child);
    } else if (child instanceof Node) {
      child = SvgView.fromNode(child);
    } else if (typeof child === "function") {
      child = SvgView.fromConstructor(child);
    }
    this.insertChild(child, target, key);
    return child;
  }

  get parentTransform(): Transform {
    const transform = this.transform.value;
    return transform !== void 0 ? transform : Transform.identity();
  }

  on<T extends keyof SVGElementEventMap>(type: T, listener: (this: SVGElement, event: SVGElementEventMap[T]) => unknown,
                                         options?: AddEventListenerOptions | boolean): this;
  on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this;
  on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this {
    this._node.addEventListener(type, listener, options);
    return this;
  }

  off<T extends keyof SVGElementEventMap>(type: T, listener: (this: SVGElement, event: SVGElementEventMap[T]) => unknown,
                                          options?: EventListenerOptions | boolean): this;
  off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this;
  off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this {
    this._node.removeEventListener(type, listener, options);
    return this;
  }

  @AttributeAnimator({attributeName: "alignment-baseline", type: String})
  alignmentBaseline: AttributeAnimator<this, AlignmentBaseline>;

  @AttributeAnimator({attributeName: "clip-path", type: String})
  clipPath: AttributeAnimator<this, string>;

  @AttributeAnimator({attributeName: "cursor", type: String})
  cursor: AttributeAnimator<this, CssCursor>;

  @AttributeAnimator({attributeName: "cx", type: Number})
  cx: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator({attributeName: "cy", type: Number})
  cy: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator({attributeName: "d", type: String})
  d: AttributeAnimator<this, string>;

  @AttributeAnimator({attributeName: "dx", type: [Number, String]}) // list-of-lengths
  dx: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator({attributeName: "dy", type: [Number, String]}) // list-of-lengths
  dy: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator({attributeName: "edgeMode", type: String})
  edgeMode: AttributeAnimator<this, string>;

  @AttributeAnimator({attributeName: "fill", type: [Color, String]})
  fill: AttributeAnimator<this, Paint, AnyColor | Paint>;

  @AttributeAnimator({attributeName: "fill-rule", type: String})
  fillRule: AttributeAnimator<this, FillRule>;

  @AttributeAnimator({attributeName: "flood-color", type: [Color, String]})
  floodColor: AttributeAnimator<this, Color | "currentColor", AnyColor | "currentColor">;

  @AttributeAnimator({attributeName: "flood-opacity", type: Number})
  floodOpacity: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator({attributeName: "height", type: Length})
  height: AttributeAnimator<this, Length, AnyLength>;

  @AttributeAnimator({attributeName: "in", type: String})
  in: AttributeAnimator<this, string>;

  @AttributeAnimator({attributeName: "in2", type: String})
  in2: AttributeAnimator<this, string>;

  @AttributeAnimator({attributeName: "lengthAdjust", type: String})
  lengthAdjust: AttributeAnimator<this, "spacing" | "spacingAndGlyphs">;

  @AttributeAnimator({attributeName: "mode", type: String})
  mode: AttributeAnimator<this, string>;

  @AttributeAnimator({attributeName: "opacity", type: Number})
  opacity: AttributeAnimator<this, number>;

  @AttributeAnimator({attributeName: "pointer-events", type: String})
  pointerEvents: AttributeAnimator<this, PointerEvents>;

  @AttributeAnimator({attributeName: "points", type: String})
  points: AttributeAnimator<this, string>;

  @AttributeAnimator({attributeName: "preserveAspectRatio", type: Boolean})
  preserveAspectRatio: AttributeAnimator<this, boolean, boolean | string>;

  @AttributeAnimator({attributeName: "r", type: Number})
  r: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator({attributeName: "result", type: String})
  result: AttributeAnimator<this, string>;

  @AttributeAnimator({attributeName: "stdDeviation", type: Number})
  stdDeviation: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator({attributeName: "stroke", type: [Color, String]})
  stroke: AttributeAnimator<this, Paint, AnyColor | Paint>;

  @AttributeAnimator({attributeName: "stroke-dasharray", type: String})
  strokeDasharray: AttributeAnimator<this, string>;

  @AttributeAnimator({attributeName: "stroke-linecap", type: String})
  strokeLinecap: AttributeAnimator<this, StrokeLinecap>;

  @AttributeAnimator({attributeName: "stroke-width", type: Number})
  strokeWidth: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator({attributeName: "text-anchor", type: String})
  textAnchor: AttributeAnimator<this, TextAnchor>;

  @AttributeAnimator({attributeName: "textLength", type: Length})
  textLength: AttributeAnimator<this, Length, AnyLength>;

  @AttributeAnimator({attributeName: "transform", type: Transform})
  transform: AttributeAnimator<this, Transform, AnyTransform>;

  @AttributeAnimator({attributeName: "type", type: String})
  type: AttributeAnimator<this, string>;

  @AttributeAnimator({attributeName: "values", type: String})
  values: AttributeAnimator<this, string>;

  @AttributeAnimator({attributeName: "viewBox", type: String})
  viewBox: AttributeAnimator<this, string>;

  @AttributeAnimator({attributeName: "width", type: Length})
  width: AttributeAnimator<this, Length, AnyLength>;

  @AttributeAnimator({attributeName: "x", type: Number})
  x: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator({attributeName: "x1", type: Number})
  x1: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator({attributeName: "x2", type: Number})
  x2: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator({attributeName: "y", type: Number})
  y: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator({attributeName: "y1", type: Number})
  y1: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator({attributeName: "y2", type: Number})
  y2: AttributeAnimator<this, number, number | string>;

  @StyleAnimator({propertyNames: "filter", type: String})
  filter: StyleAnimator<this, string>;

  font(): Font | undefined;
  font(value: AnyFont | undefined, tween?: Tween<any>, priority?: string): this;
  font(value?: AnyFont | undefined, tween?: Tween<any>, priority?: string): Font | undefined | this {
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

  @StyleAnimator({propertyNames: "font-family", type: FontFamily})
  fontFamily: StyleAnimator<this, FontFamily | FontFamily[], FontFamily | ReadonlyArray<FontFamily>>;

  @StyleAnimator({propertyNames: "font-size", type: [Length, String]})
  fontSize: StyleAnimator<this, FontSize, AnyFontSize>;

  @StyleAnimator({propertyNames: "font-stretch", type: String})
  fontStretch: StyleAnimator<this, FontStretch>;

  @StyleAnimator({propertyNames: "font-style", type: String})
  fontStyle: StyleAnimator<this, FontStyle>;

  @StyleAnimator({propertyNames: "font-variant", type: String})
  fontVariant: StyleAnimator<this, FontVariant>;

  @StyleAnimator({propertyNames: "font-weight", type: String})
  fontWeight: StyleAnimator<this, FontWeight>;

  @StyleAnimator({propertyNames: "line-height", type: LineHeight})
  lineHeight: StyleAnimator<this, LineHeight, AnyLineHeight>;

  @StyleAnimator({propertyNames: "touch-action", type: String})
  touchAction: StyleAnimator<this, TouchAction>;

  static fromTag<T extends keyof SvgViewTagMap>(tag: T): SvgViewTagMap[T];
  static fromTag(tag: string): SvgView;
  static fromTag(tag: string): SvgView {
    const node = document.createElementNS(View.Svg.namespace, tag) as SVGElement;
    return new (this as unknown as {new(node: SVGElement): SvgView})(node);
  }

  static create<T extends keyof SvgViewTagMap>(tag: T): SvgViewTagMap[T];
  static create(tag: string): SvgView;
  static create(node: SVGElement): SvgView;
  static create<VC extends ElementViewConstructor<SVGElement, SvgView>>(viewConstructor: VC): InstanceType<VC>;
  static create(source: string | SVGElement | ElementViewConstructor<SVGElement, SvgView>): SvgView {
    if (typeof source === "string") {
      return this.fromTag(source);
    } else if (source instanceof SVGElement) {
      return this.fromNode(source);
    } else if (typeof source === "function") {
      return this.fromConstructor(source);
    }
    throw new TypeError("" + source);
  }

  /** @hidden */
  static readonly tag: string = "svg";

  /** @hidden */
  static readonly namespace: string = "http://www.w3.org/2000/svg";
}
View.Svg = SvgView;
