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
import type {AnyTiming} from "@swim/mapping";
import {AnyLength, Length, AnyTransform, Transform} from "@swim/math";
import {
  FontStyle,
  FontVariant,
  FontWeight,
  FontStretch,
  FontFamily,
  AnyFont,
  Font,
  AnyColor,
  Color,
} from "@swim/style";
import type {ViewFactory, ViewConstructor, View} from "@swim/view";
import type {
  AlignmentBaseline,
  CssCursor,
  FillRule,
  StrokeLinecap,
  SvgPointerEvents,
  TextAnchor,
  TouchAction,
} from "../style/types";
import {StyleAnimatorMemberInit, StyleAnimator} from "../style/StyleAnimator";
import {ViewNodeType, NodeViewConstructor, NodeView} from "../node/NodeView";
import {AttributeAnimatorMemberInit, AttributeAnimator} from "../attribute/AttributeAnimator";
import {ElementViewInit, ElementViewConstructor, ElementView} from "../element/ElementView";
import type {SvgViewObserver} from "./SvgViewObserver";
import type {SvgViewController} from "./SvgViewController";

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
  cssTransform?: StyleAnimatorMemberInit<SvgView, "cssTransform">;
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
  readonly namespace: string;
  fromTag(tag: string): V;
  fromNode(node: ViewNodeType<V>): V;
}

export class SvgView extends ElementView {
  constructor(node: SVGElement) {
    super(node);
  }

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
    if (init.cssTransform !== void 0) {
      this.cssTransform(init.cssTransform);
    }
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

  declare readonly node: SVGElement;

  declare readonly viewController: SvgViewController | null;

  declare readonly viewObservers: ReadonlyArray<SvgViewObserver>;

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
    return transform !== null ? transform : Transform.identity();
  }

  on<T extends keyof SVGElementEventMap>(type: T, listener: (this: SVGElement, event: SVGElementEventMap[T]) => unknown,
                                         options?: AddEventListenerOptions | boolean): this;
  on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this;
  on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this {
    this.node.addEventListener(type, listener, options);
    return this;
  }

  off<T extends keyof SVGElementEventMap>(type: T, listener: (this: SVGElement, event: SVGElementEventMap[T]) => unknown,
                                          options?: EventListenerOptions | boolean): this;
  off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this;
  off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this {
    this.node.removeEventListener(type, listener, options);
    return this;
  }

  @AttributeAnimator({attributeName: "alignment-baseline", type: String})
  declare alignmentBaseline: AttributeAnimator<this, AlignmentBaseline>;

  @AttributeAnimator({attributeName: "clip-path", type: String})
  declare clipPath: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "cursor", type: String})
  declare cursor: AttributeAnimator<this, CssCursor | undefined>;

  @AttributeAnimator({attributeName: "cx", type: Number})
  declare cx: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "cy", type: Number})
  declare cy: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "d", type: String})
  declare d: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "dx", type: Length, state: null})
  declare dx: AttributeAnimator<this, Length | null, AnyLength | null>;

  @AttributeAnimator({attributeName: "dy", type: Length, state: null})
  declare dy: AttributeAnimator<this, Length | null, AnyLength | null>;

  @AttributeAnimator({attributeName: "edgeMode", type: String})
  declare edgeMode: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "fill", type: Color, state: null})
  declare fill: AttributeAnimator<this, Color | null, AnyColor | null>;

  @AttributeAnimator({attributeName: "fill-rule", type: String})
  declare fillRule: AttributeAnimator<this, FillRule | undefined>;

  @AttributeAnimator({attributeName: "flood-color", type: Color, state: null})
  declare floodColor: AttributeAnimator<this, Color | null, AnyColor | null>;

  @AttributeAnimator({attributeName: "flood-opacity", type: Number})
  declare floodOpacity: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "height", type: Length, state: null})
  declare height: AttributeAnimator<this, Length | null, AnyLength | null>;

  @AttributeAnimator({attributeName: "in", type: String})
  declare in: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "in2", type: String})
  declare in2: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "lengthAdjust", type: String})
  declare lengthAdjust: AttributeAnimator<this, "spacing" | "spacingAndGlyphs" | undefined>;

  @AttributeAnimator({attributeName: "mode", type: String})
  declare mode: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "opacity", type: Number})
  declare opacity: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "pointer-events", type: String})
  declare pointerEvents: AttributeAnimator<this, SvgPointerEvents | undefined>;

  @AttributeAnimator({attributeName: "points", type: String})
  declare points: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "preserveAspectRatio", type: Boolean})
  declare preserveAspectRatio: AttributeAnimator<this, boolean | undefined>;

  @AttributeAnimator({attributeName: "r", type: Number})
  declare r: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "result", type: String})
  declare result: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "stdDeviation", type: Number})
  declare stdDeviation: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "stroke", type: Color, state: null})
  declare stroke: AttributeAnimator<this, Color | null, AnyColor | null>;

  @AttributeAnimator({attributeName: "stroke-dasharray", type: String})
  declare strokeDasharray: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "stroke-linecap", type: String})
  declare strokeLinecap: AttributeAnimator<this, StrokeLinecap | undefined>;

  @AttributeAnimator({attributeName: "stroke-width", type: Number})
  declare strokeWidth: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "text-anchor", type: String})
  declare textAnchor: AttributeAnimator<this, TextAnchor | undefined>;

  @AttributeAnimator({attributeName: "textLength", type: Length, state: null})
  declare textLength: AttributeAnimator<this, Length | null, AnyLength | null>;

  @AttributeAnimator({attributeName: "transform", type: Transform, state: null})
  declare transform: AttributeAnimator<this, Transform | null, AnyTransform | null>;

  @AttributeAnimator({attributeName: "type", type: String})
  declare type: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "values", type: String})
  declare values: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "viewBox", type: String})
  declare viewBox: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "width", type: Length, state: null})
  declare width: AttributeAnimator<this, Length | null, AnyLength | null>;

  @AttributeAnimator({attributeName: "x", type: Number})
  declare x: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "x1", type: Number})
  declare x1: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "x2", type: Number})
  declare x2: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "y", type: Number})
  declare y: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "y1", type: Number})
  declare y1: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "y2", type: Number})
  declare y2: AttributeAnimator<this, number | undefined>;

  @StyleAnimator({propertyNames: "transform", type: Transform, state: null})
  declare cssTransform: StyleAnimator<this, Transform | null, AnyTransform | null>;

  @StyleAnimator({propertyNames: "filter", type: String})
  declare filter: StyleAnimator<this, string | undefined>;

  font(): Font | null;
  font(value: AnyFont | null, timing?: AnyTiming | boolean): this;
  font(value?: AnyFont | null, timing?: AnyTiming | boolean): Font | null | this {
    if (value === void 0) {
      const style = this.fontStyle.value;
      const variant = this.fontVariant.value;
      const weight = this.fontWeight.value;
      const stretch = this.fontStretch.value;
      const size = this.fontSize.value;
      const height = this.lineHeight.value;
      const family = this.fontFamily.value;
      if (family !== void 0) {
        return Font.create(style, variant, weight, stretch, size, height, family);
      } else {
        return null;
      }
    } else {
      if (value !== null) {
        value = Font.fromAny(value);
        if (value.style !== void 0) {
          this.fontStyle.setState(value.style, timing);
        }
        if (value.variant !== void 0) {
          this.fontVariant.setState(value.variant, timing);
        }
        if (value.weight !== void 0) {
          this.fontWeight.setState(value.weight, timing);
        }
        if (value.stretch !== void 0) {
          this.fontStretch.setState(value.stretch, timing);
        }
        if (value.size !== void 0) {
          this.fontSize.setState(value.size, timing);
        }
        if (value.height !== void 0) {
          this.lineHeight.setState(value.height, timing);
        }
        this.fontFamily.setState(value.family, timing);
      } else {
        this.fontStyle.setState(void 0, timing);
        this.fontVariant.setState(void 0, timing);
        this.fontWeight.setState(void 0, timing);
        this.fontStretch.setState(void 0, timing);
        this.fontSize.setState(null, timing);
        this.lineHeight.setState(null, timing);
        this.fontFamily.setState(void 0, timing);
      }
      return this;
    }
  }

  @StyleAnimator({propertyNames: "font-family", type: FontFamily})
  declare fontFamily: StyleAnimator<this, FontFamily | FontFamily[] | undefined, FontFamily | ReadonlyArray<FontFamily> | undefined>;

  @StyleAnimator({propertyNames: "font-size", type: Length, state: null})
  declare fontSize: StyleAnimator<this, Length | null, AnyLength | null>;

  @StyleAnimator({propertyNames: "font-stretch", type: String})
  declare fontStretch: StyleAnimator<this, FontStretch | undefined>;

  @StyleAnimator({propertyNames: "font-style", type: String})
  declare fontStyle: StyleAnimator<this, FontStyle | undefined>;

  @StyleAnimator({propertyNames: "font-variant", type: String})
  declare fontVariant: StyleAnimator<this, FontVariant | undefined>;

  @StyleAnimator({propertyNames: "font-weight", type: String})
  declare fontWeight: StyleAnimator<this, FontWeight | undefined>;

  @StyleAnimator({propertyNames: "line-height", type: Length, state: null})
  declare lineHeight: StyleAnimator<this, Length | null, AnyLength | null>;

  @StyleAnimator({propertyNames: "touch-action", type: String})
  declare touchAction: StyleAnimator<this, TouchAction | undefined>;

  /** @hidden */
  static readonly tags: {[tag: string]: SvgViewConstructor<any> | undefined} = {};

  static readonly tag: string = "svg";

  static readonly namespace: string = "http://www.w3.org/2000/svg";

  static forTag(tag: string): SvgViewConstructor<SvgView> {
    if (tag === this.tag) {
      return this as unknown as SvgViewConstructor<SvgView>;
    } else {
      const _super = this;
      const _constructor = function HtmlTagView(this: SvgView, node: SVGElement): SvgView {
        return (_super as Function).call(this, node) || this;
      } as unknown as SvgViewConstructor<SvgView>;
      __extends(_constructor, _super);
      (_constructor as any).tag = tag;
      return _constructor;
    }
  }

  static create<S extends SvgViewConstructor<InstanceType<S>>>(this: S, tag: string = this.tag): InstanceType<S> {
    return this.fromTag(tag);
  }

  static fromTag<S extends SvgViewConstructor<InstanceType<S>>>(this: S, tag: string): InstanceType<S>;
  static fromTag(tag: string): ElementView;
  static fromTag(tag: string): ElementView {
    let viewConstructor: SvgViewConstructor | undefined;
    if (Object.prototype.hasOwnProperty.call(this, "tags")) {
      viewConstructor = this.tags[tag];
    }
    if (viewConstructor === void 0) {
      viewConstructor = this;
    }
    const node = document.createElementNS(viewConstructor.namespace!, tag) as SVGElement;
    return new viewConstructor(node);
  }

  static fromNode<S extends SvgViewConstructor<InstanceType<S>>>(this: S, node: ViewNodeType<InstanceType<S>>): InstanceType<S>;
  static fromNode(node: ViewSvg): SvgView;
  static fromNode(node: ViewSvg): SvgView {
    if (node.view instanceof this) {
      return node.view;
    } else {
      let viewConstructor: SvgViewConstructor | undefined;
      if (Object.prototype.hasOwnProperty.call(this, "tags")) {
        viewConstructor = this.tags[node.tagName];
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
      return this.fromNode(value as ViewNodeType<InstanceType<S>>);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static decorateTag(tag: string, target: Object, propertyKey: string | symbol): void {
    const tagConstructor = (target as typeof SvgView).forTag(tag);
    Object.defineProperty(SvgView, propertyKey, {
      value: tagConstructor,
      configurable: true,
      enumerable: true,
    });
    if (!(tag in SvgView.tags)) {
      SvgView.tags[tag] = tagConstructor;
    }
    if (!(tag in ElementView.tags)) {
      ElementView.tags[tag] = tagConstructor as ElementViewConstructor<any>;
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
