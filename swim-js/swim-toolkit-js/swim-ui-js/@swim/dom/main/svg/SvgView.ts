// Copyright 2015-2021 Swim Inc.
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

import {Class, AnyTiming, Creatable, InitType} from "@swim/util";
import type {AnimatorMemberInit} from "@swim/fastener";
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
import {View} from "@swim/view";
import {AttributeAnimator} from "../animator/AttributeAnimator";
import {StyleAnimator} from "../animator/StyleAnimator";
import type {
  AlignmentBaseline,
  CssCursor,
  FillRule,
  StrokeLinecap,
  SvgPointerEvents,
  TextAnchor,
  TouchAction,
} from "../css/types";
import type {ViewNodeType, AnyNodeView, NodeView} from "../node/NodeView";
import {
  AnyElementView,
  ElementViewInit,
  ElementViewFactory,
  ElementViewClass,
  ElementViewConstructor,
  ElementView,
} from "../element/ElementView";
import type {SvgViewObserver} from "./SvgViewObserver";

export interface ViewSvg extends SVGElement {
  view?: SvgView;
}

export type AnySvgView<V extends SvgView = SvgView> = AnyElementView<V> | keyof SvgViewTagMap;

export interface SvgViewInit extends ElementViewInit {
  attributes?: SvgViewAttributesInit;
  style?: SvgViewStyleInit;
}

export interface SvgViewAttributesInit {
  alignmentBaseline?: AnimatorMemberInit<SvgView, "alignmentBaseline">;
  clipPath?: AnimatorMemberInit<SvgView, "clipPath">;
  cursor?: AnimatorMemberInit<SvgView, "cursor">;
  cx?: AnimatorMemberInit<SvgView, "cx">;
  cy?: AnimatorMemberInit<SvgView, "cy">;
  d?: AnimatorMemberInit<SvgView, "d">;
  dx?: AnimatorMemberInit<SvgView, "dx">;
  dy?: AnimatorMemberInit<SvgView, "dy">;
  edgeMode?: AnimatorMemberInit<SvgView, "edgeMode">;
  fill?: AnimatorMemberInit<SvgView, "fill">;
  fillRule?: AnimatorMemberInit<SvgView, "fillRule">;
  floodColor?: AnimatorMemberInit<SvgView, "floodColor">;
  floodOpacity?: AnimatorMemberInit<SvgView, "floodOpacity">;
  height?: AnimatorMemberInit<SvgView, "height">;
  in?: AnimatorMemberInit<SvgView, "in">;
  in2?: AnimatorMemberInit<SvgView, "in2">;
  lengthAdjust?: AnimatorMemberInit<SvgView, "lengthAdjust">;
  mode?: AnimatorMemberInit<SvgView, "mode">;
  opacity?: AnimatorMemberInit<SvgView, "opacity">;
  pointerEvents?: AnimatorMemberInit<SvgView, "pointerEvents">;
  points?: AnimatorMemberInit<SvgView, "points">;
  preserveAspectRatio?: AnimatorMemberInit<SvgView, "preserveAspectRatio">;
  r?: AnimatorMemberInit<SvgView, "r">;
  result?: AnimatorMemberInit<SvgView, "result">;
  stdDeviation?: AnimatorMemberInit<SvgView, "stdDeviation">;
  stroke?: AnimatorMemberInit<SvgView, "stroke">;
  strokeDasharray?: AnimatorMemberInit<SvgView, "strokeDasharray">;
  strokeLinecap?: AnimatorMemberInit<SvgView, "strokeLinecap">;
  strokeWidth?: AnimatorMemberInit<SvgView, "strokeWidth">;
  textAnchor?: AnimatorMemberInit<SvgView, "textAnchor">;
  textLength?: AnimatorMemberInit<SvgView, "textLength">;
  transform?: AnimatorMemberInit<SvgView, "transform">;
  type?: AnimatorMemberInit<SvgView, "type">;
  values?: AnimatorMemberInit<SvgView, "values">;
  viewBox?: AnimatorMemberInit<SvgView, "viewBox">;
  width?: AnimatorMemberInit<SvgView, "width">;
  x?: AnimatorMemberInit<SvgView, "x">;
  x1?: AnimatorMemberInit<SvgView, "x1">;
  x2?: AnimatorMemberInit<SvgView, "x2">;
  y?: AnimatorMemberInit<SvgView, "y">;
  y1?: AnimatorMemberInit<SvgView, "y1">;
  y2?: AnimatorMemberInit<SvgView, "y2">;
}

export interface SvgViewStyleInit {
  cssTransform?: AnimatorMemberInit<SvgView, "cssTransform">;
  filter?: AnimatorMemberInit<SvgView, "filter">;
  fontFamily?: AnimatorMemberInit<SvgView, "fontFamily">;
  fontSize?: AnimatorMemberInit<SvgView, "fontSize">;
  fontStretch?: AnimatorMemberInit<SvgView, "fontStretch">;
  fontStyle?: AnimatorMemberInit<SvgView, "fontStyle">;
  fontVariant?: AnimatorMemberInit<SvgView, "fontVariant">;
  fontWeight?: AnimatorMemberInit<SvgView, "fontWeight">;
  lineHeight?: AnimatorMemberInit<SvgView, "lineHeight">;
  touchAction?: AnimatorMemberInit<SvgView, "touchAction">;
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

export interface SvgViewFactory<V extends SvgView = SvgView, U = AnySvgView> extends ElementViewFactory<V, U> {
}

export interface SvgViewClass<V extends SvgView = SvgView, U = AnySvgView> extends ElementViewClass<V, U>, SvgViewFactory<V, U> {
  readonly tag: string;
  readonly namespace: string;
}

export interface SvgViewConstructor<V extends SvgView = SvgView, U = AnySvgView> extends ElementViewConstructor<V, U>, SvgViewClass<V, U> {
  readonly tag: string;
  readonly namespace: string;
}

export class SvgView extends ElementView {
  constructor(node: SVGElement) {
    super(node);
  }

  override readonly observerType?: Class<SvgViewObserver>;

  override readonly node!: SVGElement;

  override setChild<V extends NodeView>(key: string, newChild: AnyNodeView<V> | null): View | null;
  override setChild(key: string, newChild: AnyNodeView | keyof SvgViewTagMap | null): View | null;
  override setChild(key: string, newChild: AnyNodeView | keyof SvgViewTagMap | null): View | null {
    if (typeof newChild === "string") {
      newChild = SvgView.fromTag(newChild);
    }
    return super.setChild(key, newChild);
  }

  override appendChild<V extends NodeView>(child: AnyNodeView<V>, key?: string): V;
  override appendChild<K extends keyof SvgViewTagMap>(tag: K, key?: string): SvgViewTagMap[K];
  override appendChild(child: AnyNodeView | keyof SvgViewTagMap, key?: string): NodeView;
  override appendChild(child: AnyNodeView | keyof SvgViewTagMap, key?: string): NodeView {
    if (typeof child === "string") {
      child = SvgView.fromTag(child);
    }
    return super.appendChild(child, key);
  }

  override prependChild<V extends NodeView>(child: AnyNodeView<V>, key?: string): V;
  override prependChild<K extends keyof SvgViewTagMap>(tag: K, key?: string): SvgViewTagMap[K];
  override prependChild(child: AnyNodeView | keyof SvgViewTagMap, key?: string): NodeView;
  override prependChild(child: AnyNodeView | keyof SvgViewTagMap, key?: string): NodeView {
    if (typeof child === "string") {
      child = SvgView.fromTag(child);
    }
    return super.prependChild(child, key);
  }

  override insertChild<V extends NodeView>(child: AnyNodeView<V>, target: View | Node | null, key?: string): V;
  override insertChild<K extends keyof SvgViewTagMap>(tag: K, target: View | Node | null, key?: string): SvgViewTagMap[K];
  override insertChild(child: AnyNodeView | keyof SvgViewTagMap, target: View | Node | null, key?: string): NodeView;
  override insertChild(child: AnyNodeView | keyof SvgViewTagMap, target: View | Node | null, key?: string): NodeView {
    if (typeof child === "string") {
      child = SvgView.fromTag(child);
    }
    return super.insertChild(child, target, key);
  }

  @AttributeAnimator({attributeName: "alignment-baseline", type: String})
  readonly alignmentBaseline!: AttributeAnimator<this, AlignmentBaseline>;

  @AttributeAnimator({attributeName: "clip-path", type: String})
  readonly clipPath!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "cursor", type: String})
  readonly cursor!: AttributeAnimator<this, CssCursor | undefined>;

  @AttributeAnimator({attributeName: "cx", type: Number})
  readonly cx!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "cy", type: Number})
  readonly cy!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "d", type: String})
  readonly d!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "dx", type: Length, state: null})
  readonly dx!: AttributeAnimator<this, Length | null, AnyLength | null>;

  @AttributeAnimator({attributeName: "dy", type: Length, state: null})
  readonly dy!: AttributeAnimator<this, Length | null, AnyLength | null>;

  @AttributeAnimator({attributeName: "edgeMode", type: String})
  readonly edgeMode!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "fill", type: Color, state: null})
  readonly fill!: AttributeAnimator<this, Color | null, AnyColor | null>;

  @AttributeAnimator({attributeName: "fill-rule", type: String})
  readonly fillRule!: AttributeAnimator<this, FillRule | undefined>;

  @AttributeAnimator({attributeName: "flood-color", type: Color, state: null})
  readonly floodColor!: AttributeAnimator<this, Color | null, AnyColor | null>;

  @AttributeAnimator({attributeName: "flood-opacity", type: Number})
  readonly floodOpacity!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "height", type: Length, state: null})
  readonly height!: AttributeAnimator<this, Length | null, AnyLength | null>;

  @AttributeAnimator({attributeName: "in", type: String})
  readonly in!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "in2", type: String})
  readonly in2!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "lengthAdjust", type: String})
  readonly lengthAdjust!: AttributeAnimator<this, "spacing" | "spacingAndGlyphs" | undefined>;

  @AttributeAnimator({attributeName: "mode", type: String})
  readonly mode!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "opacity", type: Number})
  readonly opacity!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "pointer-events", type: String})
  readonly pointerEvents!: AttributeAnimator<this, SvgPointerEvents | undefined>;

  @AttributeAnimator({attributeName: "points", type: String})
  readonly points!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "preserveAspectRatio", type: Boolean})
  readonly preserveAspectRatio!: AttributeAnimator<this, boolean | undefined>;

  @AttributeAnimator({attributeName: "r", type: Number})
  readonly r!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "result", type: String})
  readonly result!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "stdDeviation", type: Number})
  readonly stdDeviation!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "stroke", type: Color, state: null})
  readonly stroke!: AttributeAnimator<this, Color | null, AnyColor | null>;

  @AttributeAnimator({attributeName: "stroke-dasharray", type: String})
  readonly strokeDasharray!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "stroke-linecap", type: String})
  readonly strokeLinecap!: AttributeAnimator<this, StrokeLinecap | undefined>;

  @AttributeAnimator({attributeName: "stroke-width", type: Number})
  readonly strokeWidth!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "text-anchor", type: String})
  readonly textAnchor!: AttributeAnimator<this, TextAnchor | undefined>;

  @AttributeAnimator({attributeName: "textLength", type: Length, state: null})
  readonly textLength!: AttributeAnimator<this, Length | null, AnyLength | null>;

  @AttributeAnimator({attributeName: "transform", type: Transform, state: null})
  readonly transform!: AttributeAnimator<this, Transform | null, AnyTransform | null>;

  @AttributeAnimator({attributeName: "type", type: String})
  readonly type!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "values", type: String})
  readonly values!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "viewBox", type: String})
  readonly viewBox!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "width", type: Length, state: null})
  readonly width!: AttributeAnimator<this, Length | null, AnyLength | null>;

  @AttributeAnimator({attributeName: "x", type: Number})
  readonly x!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "x1", type: Number})
  readonly x1!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "x2", type: Number})
  readonly x2!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "y", type: Number})
  readonly y!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "y1", type: Number})
  readonly y1!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "y2", type: Number})
  readonly y2!: AttributeAnimator<this, number | undefined>;

  @StyleAnimator({propertyNames: "transform", type: Transform, state: null})
  readonly cssTransform!: StyleAnimator<this, Transform | null, AnyTransform | null>;

  @StyleAnimator({propertyNames: "filter", type: String})
  readonly filter!: StyleAnimator<this, string | undefined>;

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
  readonly fontFamily!: StyleAnimator<this, FontFamily | FontFamily[] | undefined, FontFamily | ReadonlyArray<FontFamily> | undefined>;

  @StyleAnimator({propertyNames: "font-size", type: Length, state: null})
  readonly fontSize!: StyleAnimator<this, Length | null, AnyLength | null>;

  @StyleAnimator({propertyNames: "font-stretch", type: String})
  readonly fontStretch!: StyleAnimator<this, FontStretch | undefined>;

  @StyleAnimator({propertyNames: "font-style", type: String})
  readonly fontStyle!: StyleAnimator<this, FontStyle | undefined>;

  @StyleAnimator({propertyNames: "font-variant", type: String})
  readonly fontVariant!: StyleAnimator<this, FontVariant | undefined>;

  @StyleAnimator({propertyNames: "font-weight", type: String})
  readonly fontWeight!: StyleAnimator<this, FontWeight | undefined>;

  @StyleAnimator({propertyNames: "line-height", type: Length, state: null})
  readonly lineHeight!: StyleAnimator<this, Length | null, AnyLength | null>;

  @StyleAnimator({propertyNames: "touch-action", type: String})
  readonly touchAction!: StyleAnimator<this, TouchAction | undefined>;

  override get parentTransform(): Transform {
    const transform = this.transform.value;
    return transform !== null ? transform : Transform.identity();
  }

  override on<K extends keyof SVGElementEventMap>(type: K, listener: (this: SVGElement, event: SVGElementEventMap[K]) => unknown,
                                                  options?: AddEventListenerOptions | boolean): this;
  override on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this;
  override on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this {
    this.node.addEventListener(type, listener, options);
    return this;
  }

  override off<K extends keyof SVGElementEventMap>(type: K, listener: (this: SVGElement, event: SVGElementEventMap[K]) => unknown,
                                                   options?: EventListenerOptions | boolean): this;
  override off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this;
  override off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this {
    this.node.removeEventListener(type, listener, options);
    return this;
  }

  /** @internal */
  protected initAttributes(init: SvgViewAttributesInit): void {
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

  /** @internal */
  protected initStyle(init: SvgViewStyleInit): void {
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

  override init(init: SvgViewInit): void {
    super.init(init);
    if (init.attributes !== void 0) {
      this.initAttributes(init.attributes);
    }
    if (init.style !== void 0) {
      this.initStyle(init.style);
    }
  }

  static override readonly tag: string = "svg";

  static override readonly namespace: string = "http://www.w3.org/2000/svg";

  static override create<S extends abstract new (...args: any[]) => InstanceType<S>>(this: S): InstanceType<S>;
  static override create(): SvgView;
  static override create(): SvgView {
    return this.fromTag(this.tag);
  }

  static override fromTag<S extends abstract new (...args: any[]) => InstanceType<S>>(this: S, tag: string): InstanceType<S>;
  static override fromTag(tag: string): SvgView;
  static override fromTag(tag: string): SvgView {
    const node = document.createElementNS(this.namespace, tag) as SVGElement;
    return this.fromNode(node);
  }

  static override fromNode<S extends new (node: SVGElement) => InstanceType<S>>(this: S, node: ViewNodeType<InstanceType<S>>): InstanceType<S>;
  static override fromNode(node: SVGElement): SvgView;
  static override fromNode(node: SVGElement): SvgView {
    let view = (node as ViewSvg).view;
    if (view === void 0) {
      view = new this(node);
      this.mount(view);
    } else if (!(view instanceof this)) {
      throw new TypeError(view + " not an instance of " + this);
    }
    return view;
  }

  static override fromAny<S extends abstract new (...args: any[]) => InstanceType<S>>(this: S, value: AnySvgView<InstanceType<S>>): InstanceType<S>;
  static override fromAny(value: AnySvgView | string): SvgView;
  static override fromAny(value: AnySvgView | string): SvgView {
    if (value === void 0 || value === null) {
      return value;
    } else if (value instanceof View) {
      if (value instanceof this) {
        return value;
      } else {
        throw new TypeError(value + " not an instance of " + this);
      }
    } else if (value instanceof Node) {
      return this.fromNode(value);
    } else if (typeof value === "string") {
      return this.fromTag(value);
    } else if (Creatable.is(value)) {
      return value.create();
    } else {
      return this.fromInit(value);
    }
  }

  static forTag<S extends abstract new (...args: any[]) => InstanceType<S>>(this: S, tag: string): SvgViewFactory<InstanceType<S>>;
  static forTag(tag: string): SvgViewFactory;
  static forTag(tag: string): SvgViewFactory {
    if (tag === this.tag) {
      return this;
    } else {
      return new SvgViewTagFactory(this, tag);
    }
  }
}

/** @internal */
export class SvgViewTagFactory<V extends SvgView> implements SvgViewFactory<V> {
  constructor(factory: SvgViewFactory<V>, tag: string) {
    this.factory = factory;
    this.tag = tag;
  }

  /** @internal */
  readonly factory: SvgViewFactory<V>;

  readonly tag: string;

  get namespace(): string {
    return SvgView.namespace;
  }

  create(): V {
    return this.fromTag(this.tag);
  }

  fromTag(tag: string): V {
    const node = document.createElementNS(this.namespace, tag) as SVGElement;
    return this.fromNode(node as ViewNodeType<V>);
  }

  fromNode(node: ViewNodeType<V>): V {
    return this.factory.fromNode(node);
  }

  fromInit(init: InitType<V>): V {
    let type = init.type;
    if (type === void 0) {
      type = this;
    }
    const view = type.create() as V;
    view.init(init);
    return view;
  }

  fromAny(value: AnySvgView): V {
    return this.factory.fromAny(value);
  }
}
