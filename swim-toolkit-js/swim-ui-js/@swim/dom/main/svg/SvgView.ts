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

import {__extends} from "tslib";
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
import {ViewFactory, ViewConstructor, View} from "@swim/view";
import {NodeViewConstructor, NodeView} from "../node/NodeView";
import {AttributeAnimatorMemberInit, AttributeAnimator} from "../attribute/AttributeAnimator";
import {ElementViewInit,  ElementViewConstructor, ElementViewClass, ElementView} from "../element/ElementView";
import {SvgViewObserver} from "./SvgViewObserver";
import {SvgViewController} from "./SvgViewController";

export interface ViewSvg extends SVGElement {
  view?: SvgView;
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

export interface SvgViewTagMap {
  a: SvgView;
  animate: SvgView;
  animateMotion: SvgView;
  animateTransform: SvgView;
  audio: SvgView;
  canvas: SvgView;
  circle: SvgView;
  clipPath: SvgView;
  defs: SvgView;
  desc: SvgView;
  discard: SvgView;
  ellipse: SvgView;
  feBlend: SvgView;
  feColorMatrix: SvgView;
  feComponentTransfer: SvgView;
  feComposite: SvgView;
  feConvolveMatrix: SvgView;
  feDiffuseLighting: SvgView;
  feDisplacementMap: SvgView;
  feDistantLight: SvgView;
  feDropShadow: SvgView;
  feFlood: SvgView;
  feFuncA: SvgView;
  feFuncB: SvgView;
  feFuncG: SvgView;
  feFuncR: SvgView;
  feGaussianBlur: SvgView;
  feImage: SvgView;
  feMerge: SvgView;
  feMergeNode: SvgView;
  feMorphology: SvgView;
  feOffset: SvgView;
  fePointLight: SvgView;
  feSpecularLighting: SvgView;
  feSpotLight: SvgView;
  feTile: SvgView;
  feTurbulence: SvgView;
  filter: SvgView;
  foreignObject: SvgView;
  g: SvgView;
  iframe: SvgView;
  image: SvgView;
  line: SvgView;
  linearGradient: SvgView;
  marker: SvgView;
  mask: SvgView;
  metadata: SvgView;
  mpath: SvgView;
  path: SvgView;
  pattern: SvgView;
  polygon: SvgView;
  polyline: SvgView;
  radialGradient: SvgView;
  rect: SvgView;
  script: SvgView;
  set: SvgView;
  stop: SvgView;
  style: SvgView;
  svg: SvgView;
  switch: SvgView;
  symbol: SvgView;
  text: SvgView;
  textPath: SvgView;
  title: SvgView;
  tspan: SvgView;
  unknown: SvgView;
  use: SvgView;
  video: SvgView;
  view: SvgView;
}

export interface SvgViewFactory<V extends SvgView = SvgView, U = SVGElement> extends ViewFactory<V, U> {
}

export interface SvgViewConstructor<V extends SvgView = SvgView> extends ElementViewConstructor<V> {
  new(node: SVGElement): V;
  readonly namespace: string;
  fromTag(tag: string): V;
  fromNode(node: SVGElement): V;
}

export interface SvgViewClass extends ElementViewClass {
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

  get viewClass(): SvgViewClass {
    return this.constructor as unknown as SvgViewClass;
  }

  append<V extends View>(childView: V, key?: string): V;
  append<V extends NodeView>(viewConstructor: NodeViewConstructor<V>, key?: string): V;
  append<V extends View>(viewConstructor: ViewConstructor<V>, key?: string): V;
  append(childNode: SVGElement, key?: string): SvgView;
  append(childNode: Element, key?: string): ElementView;
  append(childNode: Node, key?: string): NodeView;
  append<T extends keyof SvgViewTagMap>(tag: T, key?: string): SvgViewTagMap[T];
  append(tag: string, key?: string): ElementView;
  append(child: Node | string, key?: string): NodeView;
  append(child: View | NodeViewConstructor | Node | string, key?: string): View {
    if (child instanceof Node) {
      child = NodeView.fromNode(child);
    } else if (typeof child === "function") {
      child = NodeView.fromConstructor(child);
    } else if (typeof child === "string") {
      child = SvgView.fromTag(child) as View;
    }
    this.appendChildView(child, key);
    return child;
  }

  prepend<V extends View>(childView: V, key?: string): V;
  prepend<V extends NodeView>(viewConstructor: NodeViewConstructor<V>, key?: string): V;
  prepend<V extends View>(viewConstructor: ViewConstructor<V>, key?: string): V;
  prepend(childNode: SVGElement, key?: string): SvgView;
  prepend(childNode: Element, key?: string): ElementView;
  prepend(childNode: Node, key?: string): NodeView;
  prepend<T extends keyof SvgViewTagMap>(tag: T, key?: string): SvgViewTagMap[T];
  prepend(tag: string, key?: string): ElementView;
  prepend(child: Node | string, key?: string): NodeView;
  prepend(child: View | NodeViewConstructor | Node | string, key?: string): View {
    if (child instanceof Node) {
      child = NodeView.fromNode(child);
    } else if (typeof child === "function") {
      child = NodeView.fromConstructor(child);
    } else if (typeof child === "string") {
      child = SvgView.fromTag(child) as View;
    }
    this.prependChildView(child, key);
    return child;
  }

  insert<V extends View>(childView: V, target: View | Node | null, key?: string): V;
  insert<V extends NodeView>(viewConstructor: NodeViewConstructor<V>, target: View | Node | null, key?: string): V;
  insert<V extends View>(viewConstructor: ViewConstructor<V>, target: View | Node | null, key?: string): V;
  insert(childNode: SVGElement, target: View | Node | null, key?: string): SvgView;
  insert(childNode: Element, target: View | Node | null, key?: string): ElementView;
  insert(childNode: Node, target: View | Node | null, key?: string): NodeView;
  insert<T extends keyof SvgViewTagMap>(tag: T, target: View | Node | null, key?: string): SvgViewTagMap[T];
  insert(tag: string, target: View | Node | null, key?: string): ElementView;
  insert(child: Node | string, target: View | Node | null, key?: string): NodeView;
  insert(child: View | NodeViewConstructor | Node | string, target: View | Node | null, key?: string): View {
    if (child instanceof Node) {
      child = NodeView.fromNode(child);
    } else if (typeof child === "function") {
      child = NodeView.fromConstructor(child);
    } else if (typeof child === "string") {
      child = SvgView.fromTag(child) as View;
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

  /** @hidden */
  static readonly tags: {[tag: string]: SvgViewConstructor | undefined} = {};

  static readonly tag: string = "svg";

  static readonly namespace: string = "http://www.w3.org/2000/svg";

  static forTag<S extends typeof SvgView>(this: S, tag: string): S {
    if (tag === this.tag) {
      return this;
    } else {
      const _super = this;
      const _constructor = function HtmlTagView(this: SvgView, node: SVGElement): SvgView {
        return _super!.call(this, node) || this;
      } as unknown as S;
      __extends(_constructor, _super);
      (_constructor as any).tag = tag;
      return _constructor;
    }
  }

  static create<S extends SvgViewConstructor<InstanceType<S>>>(this: S, tag: string = this.tag): InstanceType<S> {
    return this.fromTag(tag);
  }

  static fromTag<S extends SvgViewConstructor<InstanceType<S>>>(this: S, tag: string): InstanceType<S> {
    let viewConstructor: SvgViewConstructor<InstanceType<S>> | undefined;
    if (this.hasOwnProperty("tags")) {
      viewConstructor = (this as any).tags[tag];
    }
    if (viewConstructor === void 0) {
      viewConstructor = this;
    }
    const node = document.createElementNS(viewConstructor.namespace, tag) as SVGElement;
    return new viewConstructor(node);
  }

  static fromNode<S extends SvgViewConstructor<InstanceType<S>>>(this: S, node: ViewSvg): InstanceType<S> {
    if (node.view instanceof this) {
      return node.view;
    } else {
      let viewConstructor: S | undefined;
      if (this.hasOwnProperty("tags")) {
        viewConstructor = (this as any).tags[node.tagName];
      }
      if (viewConstructor === void 0) {
        viewConstructor = this;
      }
      const view = new viewConstructor(node);
      SvgView.mount(view);
      return view;
    }
  }

  static fromAny<S extends SvgViewConstructor<InstanceType<S>>>(this: S, value: InstanceType<S> | SVGElement): InstanceType<S> {
    if (value instanceof this) {
      return value;
    } else if (value instanceof SVGElement) {
      return this.fromNode(value);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static decorateTag(tag: string, constructor: typeof SvgView, name: string): void {
    const tagConstructor = constructor.forTag(tag);
    Object.defineProperty(SvgView, name, {
      value: tagConstructor,
      configurable: true,
      enumerable: true,
    });
    if (!(tag in SvgView.tags)) {
      SvgView.tags[tag] = tagConstructor;
    }
    if (!(tag in ElementView.tags)) {
      ElementView.tags[tag] = tagConstructor;
    }
  }

  /** @hidden */
  static Tag(tagName: string): PropertyDecorator {
    return this.decorateTag.bind(void 0, tagName);
  }

  @SvgView.Tag("a")
  static a: SvgViewFactory;

  @SvgView.Tag("animate")
  static animate: SvgViewFactory;

  @SvgView.Tag("animateMotion")
  static animateMotion: SvgViewFactory;

  @SvgView.Tag("animateTransform")
  static animateTransform: SvgViewFactory;

  @SvgView.Tag("audio")
  static audio: SvgViewFactory;

  @SvgView.Tag("canvas")
  static canvas: SvgViewFactory;

  @SvgView.Tag("circle")
  static circle: SvgViewFactory;

  @SvgView.Tag("clipPath")
  static clipPath: SvgViewFactory;

  @SvgView.Tag("defs")
  static defs: SvgViewFactory;

  @SvgView.Tag("desc")
  static desc: SvgViewFactory;

  @SvgView.Tag("discard")
  static discard: SvgViewFactory;

  @SvgView.Tag("ellipse")
  static ellipse: SvgViewFactory;

  @SvgView.Tag("feBlend")
  static feBlend: SvgViewFactory;

  @SvgView.Tag("feColorMatrix")
  static feColorMatrix: SvgViewFactory;

  @SvgView.Tag("feComponentTransfer")
  static feComponentTransfer: SvgViewFactory;

  @SvgView.Tag("feComposite")
  static feComposite: SvgViewFactory;

  @SvgView.Tag("feConvolveMatrix")
  static feConvolveMatrix: SvgViewFactory;

  @SvgView.Tag("feDiffuseLighting")
  static feDiffuseLighting: SvgViewFactory;

  @SvgView.Tag("feDisplacementMap")
  static feDisplacementMap: SvgViewFactory;

  @SvgView.Tag("feDistantLight")
  static feDistantLight: SvgViewFactory;

  @SvgView.Tag("feDropShadow")
  static feDropShadow: SvgViewFactory;

  @SvgView.Tag("feFlood")
  static feFlood: SvgViewFactory;

  @SvgView.Tag("feFuncA")
  static feFuncA: SvgViewFactory;

  @SvgView.Tag("feFuncB")
  static feFuncB: SvgViewFactory;

  @SvgView.Tag("feFuncG")
  static feFuncG: SvgViewFactory;

  @SvgView.Tag("feFuncR")
  static feFuncR: SvgViewFactory;

  @SvgView.Tag("feGaussianBlur")
  static feGaussianBlur: SvgViewFactory;

  @SvgView.Tag("feImage")
  static feImage: SvgViewFactory;

  @SvgView.Tag("feMerge")
  static feMerge: SvgViewFactory;

  @SvgView.Tag("feMergeNode")
  static feMergeNode: SvgViewFactory;

  @SvgView.Tag("feMorphology")
  static feMorphology: SvgViewFactory;

  @SvgView.Tag("feOffset")
  static feOffset: SvgViewFactory;

  @SvgView.Tag("fePointLight")
  static fePointLight: SvgViewFactory;

  @SvgView.Tag("feSpecularLighting")
  static feSpecularLighting: SvgViewFactory;

  @SvgView.Tag("feSpotLight")
  static feSpotLight: SvgViewFactory;

  @SvgView.Tag("feTile")
  static feTile: SvgViewFactory;

  @SvgView.Tag("feTurbulence")
  static feTurbulence: SvgViewFactory;

  @SvgView.Tag("filter")
  static filter: SvgViewFactory;

  @SvgView.Tag("foreignObject")
  static foreignObject: SvgViewFactory;

  @SvgView.Tag("g")
  static g: SvgViewFactory;

  @SvgView.Tag("iframe")
  static iframe: SvgViewFactory;

  @SvgView.Tag("image")
  static image: SvgViewFactory;

  @SvgView.Tag("line")
  static line: SvgViewFactory;

  @SvgView.Tag("linearGradient")
  static linearGradient: SvgViewFactory;

  @SvgView.Tag("marker")
  static marker: SvgViewFactory;

  @SvgView.Tag("mask")
  static mask: SvgViewFactory;

  @SvgView.Tag("metadata")
  static metadata: SvgViewFactory;

  @SvgView.Tag("mpath")
  static mpath: SvgViewFactory;

  @SvgView.Tag("path")
  static path: SvgViewFactory;

  @SvgView.Tag("pattern")
  static pattern: SvgViewFactory;

  @SvgView.Tag("polygon")
  static polygon: SvgViewFactory;

  @SvgView.Tag("polyline")
  static polyline: SvgViewFactory;

  @SvgView.Tag("radialGradient")
  static radialGradient: SvgViewFactory;

  @SvgView.Tag("rect")
  static rect: SvgViewFactory;

  @SvgView.Tag("script")
  static script: SvgViewFactory;

  @SvgView.Tag("set")
  static set: SvgViewFactory;

  @SvgView.Tag("stop")
  static stop: SvgViewFactory;

  @SvgView.Tag("style")
  static style: SvgViewFactory;

  @SvgView.Tag("svg")
  static svg: SvgViewFactory;

  @SvgView.Tag("switch")
  static switch: SvgViewFactory;

  @SvgView.Tag("symbol")
  static symbol: SvgViewFactory;

  @SvgView.Tag("text")
  static text: SvgViewFactory;

  @SvgView.Tag("textPath")
  static textPath: SvgViewFactory;

  @SvgView.Tag("title")
  static title: SvgViewFactory;

  @SvgView.Tag("tspan")
  static tspan: SvgViewFactory;

  @SvgView.Tag("unknown")
  static unknown: SvgViewFactory;

  @SvgView.Tag("use")
  static use: SvgViewFactory;

  @SvgView.Tag("video")
  static video: SvgViewFactory;

  @SvgView.Tag("view")
  static view: SvgViewFactory;
}
NodeView.Svg = SvgView;
