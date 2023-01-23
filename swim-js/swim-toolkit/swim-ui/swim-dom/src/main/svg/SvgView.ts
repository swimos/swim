// Copyright 2015-2023 Swim.inc
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

import {Class, Instance, AnyTiming, Creatable, Inits} from "@swim/util";
import type {AnyAnimatorValue} from "@swim/component";
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
import {AnyView, View} from "@swim/view";
import {AttributeAnimator} from "../attribute/AttributeAnimator";
import {StyleAnimator} from "../style/StyleAnimator";
import type {
  AlignmentBaseline,
  CssCursor,
  FillRule,
  StrokeLinecap,
  StrokeLinejoin,
  SvgPointerEvents,
  TextAnchor,
  TouchAction,
} from "../css/types";
import type {ViewNodeType} from "../node/NodeView";
import {
  AnyElementView,
  ElementViewInit,
  ElementViewFactory,
  ElementViewClass,
  ElementViewConstructor,
  ElementView,
} from "../element/ElementView";
import type {SvgViewObserver} from "./SvgViewObserver";

/** @public */
export interface ViewSvg extends SVGElement {
  view?: SvgView;
}

/** @public */
export type AnySvgView<V extends SvgView = SvgView> = AnyElementView<V> | keyof SvgViewTagMap;

/** @public */
export interface SvgViewInit extends ElementViewInit {
  attributes?: SvgViewAttributesInit;
  style?: SvgViewStyleInit;
}

/** @public */
export interface SvgViewAttributesInit {
  alignmentBaseline?: AnyAnimatorValue<SvgView["alignmentBaseline"]>;
  clipPath?: AnyAnimatorValue<SvgView["clipPath"]>;
  cursor?: AnyAnimatorValue<SvgView["cursor"]>;
  cx?: AnyAnimatorValue<SvgView["cx"]>;
  cy?: AnyAnimatorValue<SvgView["cy"]>;
  d?: AnyAnimatorValue<SvgView["d"]>;
  dx?: AnyAnimatorValue<SvgView["dx"]>;
  dy?: AnyAnimatorValue<SvgView["dy"]>;
  edgeMode?: AnyAnimatorValue<SvgView["edgeMode"]>;
  fill?: AnyAnimatorValue<SvgView["fill"]>;
  fillOpacity?: AnyAnimatorValue<SvgView["fillOpacity"]>;
  fillRule?: AnyAnimatorValue<SvgView["fillRule"]>;
  floodColor?: AnyAnimatorValue<SvgView["floodColor"]>;
  floodOpacity?: AnyAnimatorValue<SvgView["floodOpacity"]>;
  height?: AnyAnimatorValue<SvgView["height"]>;
  in?: AnyAnimatorValue<SvgView["in"]>;
  in2?: AnyAnimatorValue<SvgView["in2"]>;
  lengthAdjust?: AnyAnimatorValue<SvgView["lengthAdjust"]>;
  mode?: AnyAnimatorValue<SvgView["mode"]>;
  opacity?: AnyAnimatorValue<SvgView["opacity"]>;
  pointerEvents?: AnyAnimatorValue<SvgView["pointerEvents"]>;
  points?: AnyAnimatorValue<SvgView["points"]>;
  preserveAspectRatio?: AnyAnimatorValue<SvgView["preserveAspectRatio"]>;
  r?: AnyAnimatorValue<SvgView["r"]>;
  result?: AnyAnimatorValue<SvgView["result"]>;
  stdDeviation?: AnyAnimatorValue<SvgView["stdDeviation"]>;
  stroke?: AnyAnimatorValue<SvgView["stroke"]>;
  strokeDasharray?: AnyAnimatorValue<SvgView["strokeDasharray"]>;
  strokeDashoffset?: AnyAnimatorValue<SvgView["strokeDashoffset"]>;
  strokeLinecap?: AnyAnimatorValue<SvgView["strokeLinecap"]>;
  strokeLinejoin?: AnyAnimatorValue<SvgView["strokeLinejoin"]>;
  strokeMiterlimit?: AnyAnimatorValue<SvgView["strokeMiterlimit"]>;
  strokeOpacity?: AnyAnimatorValue<SvgView["strokeOpacity"]>;
  strokeWidth?: AnyAnimatorValue<SvgView["strokeWidth"]>;
  textAnchor?: AnyAnimatorValue<SvgView["textAnchor"]>;
  textLength?: AnyAnimatorValue<SvgView["textLength"]>;
  transform?: AnyAnimatorValue<SvgView["transform"]>;
  type?: AnyAnimatorValue<SvgView["type"]>;
  values?: AnyAnimatorValue<SvgView["values"]>;
  viewBox?: AnyAnimatorValue<SvgView["viewBox"]>;
  width?: AnyAnimatorValue<SvgView["width"]>;
  x?: AnyAnimatorValue<SvgView["x"]>;
  x1?: AnyAnimatorValue<SvgView["x1"]>;
  x2?: AnyAnimatorValue<SvgView["x2"]>;
  y?: AnyAnimatorValue<SvgView["y"]>;
  y1?: AnyAnimatorValue<SvgView["y1"]>;
  y2?: AnyAnimatorValue<SvgView["y2"]>;
}

/** @public */
export interface SvgViewStyleInit {
  cssTransform?: AnyAnimatorValue<SvgView["cssTransform"]>;
  filter?: AnyAnimatorValue<SvgView["filter"]>;
  fontFamily?: AnyAnimatorValue<SvgView["fontFamily"]>;
  fontSize?: AnyAnimatorValue<SvgView["fontSize"]>;
  fontStretch?: AnyAnimatorValue<SvgView["fontStretch"]>;
  fontStyle?: AnyAnimatorValue<SvgView["fontStyle"]>;
  fontVariant?: AnyAnimatorValue<SvgView["fontVariant"]>;
  fontWeight?: AnyAnimatorValue<SvgView["fontWeight"]>;
  lineHeight?: AnyAnimatorValue<SvgView["lineHeight"]>;
  touchAction?: AnyAnimatorValue<SvgView["touchAction"]>;
}

/** @public */
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

/** @public */
export interface SvgViewFactory<V extends SvgView = SvgView, U = AnySvgView<V>> extends ElementViewFactory<V, U> {
}

/** @public */
export interface SvgViewClass<V extends SvgView = SvgView, U = AnySvgView<V>> extends ElementViewClass<V, U>, SvgViewFactory<V, U> {
  readonly tag: string;
  readonly namespace: string;
}

/** @public */
export interface SvgViewConstructor<V extends SvgView = SvgView, U = AnySvgView<V>> extends ElementViewConstructor<V, U>, SvgViewClass<V, U> {
  readonly tag: string;
  readonly namespace: string;
}

/** @public */
export class SvgView extends ElementView {
  constructor(node: SVGElement) {
    super(node);
  }

  override readonly observerType?: Class<SvgViewObserver>;

  override readonly node!: SVGElement;

  override setChild<V extends View>(key: string, newChild: V): View | null;
  override setChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(key: string, factory: F): View | null;
  override setChild(key: string, newChild: AnyView | Node | keyof SvgViewTagMap | null): View | null;
  override setChild(key: string, newChild: AnyView | Node | keyof SvgViewTagMap | null): View | null {
    if (typeof newChild === "string") {
      newChild = SvgView.fromTag(newChild);
    }
    return super.setChild(key, newChild);
  }

  override appendChild<V extends View>(child: V, key?: string): V;
  override appendChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(factory: F, key?: string): InstanceType<F>;
  override appendChild<K extends keyof SvgViewTagMap>(tag: K, key?: string): SvgViewTagMap[K];
  override appendChild(child: AnyView | Node | keyof SvgViewTagMap, key?: string): View;
  override appendChild(child: AnyView | Node | keyof SvgViewTagMap, key?: string): View {
    if (typeof child === "string") {
      child = SvgView.fromTag(child);
    }
    return super.appendChild(child, key);
  }

  override prependChild<V extends View>(child: V, key?: string): V;
  override prependChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(factory: F, key?: string): InstanceType<F>;
  override prependChild<K extends keyof SvgViewTagMap>(tag: K, key?: string): SvgViewTagMap[K];
  override prependChild(child: AnyView | Node | keyof SvgViewTagMap, key?: string): View;
  override prependChild(child: AnyView | Node | keyof SvgViewTagMap, key?: string): View {
    if (typeof child === "string") {
      child = SvgView.fromTag(child);
    }
    return super.prependChild(child, key);
  }

  override insertChild<V extends View>(child: V, target: View | Node | null, key?: string): V;
  override insertChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(factory: F, target: View | Node | null, key?: string): InstanceType<F>;
  override insertChild<K extends keyof SvgViewTagMap>(tag: K, target: View | Node | null, key?: string): SvgViewTagMap[K];
  override insertChild(child: AnyView | Node | keyof SvgViewTagMap, target: View | Node | null, key?: string): View;
  override insertChild(child: AnyView | Node | keyof SvgViewTagMap, target: View | Node | null, key?: string): View {
    if (typeof child === "string") {
      child = SvgView.fromTag(child);
    }
    return super.insertChild(child, target, key);
  }

  override replaceChild<V extends View>(newChild: View, oldChild: V): V;
  override replaceChild<V extends View>(newChild: AnyView | Node | keyof SvgViewTagMap, oldChild: V): V;
  override replaceChild(newChild: AnyView | Node | keyof SvgViewTagMap, oldChild: View): View {
    if (typeof newChild === "string") {
      newChild = SvgView.fromTag(newChild);
    }
    return super.replaceChild(newChild, oldChild);
  }

  @AttributeAnimator({attributeName: "alignment-baseline", valueType: String})
  readonly alignmentBaseline!: AttributeAnimator<this, AlignmentBaseline | undefined>;

  @AttributeAnimator({attributeName: "clip-path", valueType: String})
  readonly clipPath!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "cursor", valueType: String})
  readonly cursor!: AttributeAnimator<this, CssCursor | undefined>;

  @AttributeAnimator({attributeName: "cx", valueType: Number})
  readonly cx!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "cy", valueType: Number})
  readonly cy!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "d", valueType: String})
  readonly d!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "dx", valueType: Length, value: null})
  readonly dx!: AttributeAnimator<this, Length | null, AnyLength | null>;

  @AttributeAnimator({attributeName: "dy", valueType: Length, value: null})
  readonly dy!: AttributeAnimator<this, Length | null, AnyLength | null>;

  @AttributeAnimator({attributeName: "edgeMode", valueType: String})
  readonly edgeMode!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "fill", valueType: Color, value: null})
  readonly fill!: AttributeAnimator<this, Color | null, AnyColor | null>;

  @AttributeAnimator({attributeName: "fill-opacity", valueType: Number})
  readonly fillOpacity!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "fill-rule", valueType: String})
  readonly fillRule!: AttributeAnimator<this, FillRule | undefined>;

  @AttributeAnimator({attributeName: "flood-color", valueType: Color, value: null})
  readonly floodColor!: AttributeAnimator<this, Color | null, AnyColor | null>;

  @AttributeAnimator({attributeName: "flood-opacity", valueType: Number})
  readonly floodOpacity!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "height", valueType: Length, value: null})
  readonly height!: AttributeAnimator<this, Length | null, AnyLength | null>;

  @AttributeAnimator({attributeName: "in", valueType: String})
  readonly in!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "in2", valueType: String})
  readonly in2!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "lengthAdjust", valueType: String})
  readonly lengthAdjust!: AttributeAnimator<this, "spacing" | "spacingAndGlyphs" | undefined>;

  @AttributeAnimator({attributeName: "mode", valueType: String})
  readonly mode!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "opacity", valueType: Number})
  readonly opacity!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "pointer-events", valueType: String})
  readonly pointerEvents!: AttributeAnimator<this, SvgPointerEvents | undefined>;

  @AttributeAnimator({attributeName: "points", valueType: String})
  readonly points!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "preserveAspectRatio", valueType: Boolean})
  readonly preserveAspectRatio!: AttributeAnimator<this, boolean | undefined>;

  @AttributeAnimator({attributeName: "r", valueType: Number})
  readonly r!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "result", valueType: String})
  readonly result!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "stdDeviation", valueType: Number})
  readonly stdDeviation!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "stroke", valueType: Color, value: null})
  readonly stroke!: AttributeAnimator<this, Color | null, AnyColor | null>;

  @AttributeAnimator({attributeName: "stroke-dasharray", valueType: String})
  readonly strokeDasharray!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "stroke-dashoffset", valueType: Number})
  readonly strokeDashoffset!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "stroke-linecap", valueType: String})
  readonly strokeLinecap!: AttributeAnimator<this, StrokeLinecap | undefined>;

  @AttributeAnimator({attributeName: "stroke-linejoin", valueType: String})
  readonly strokeLinejoin!: AttributeAnimator<this, StrokeLinejoin | undefined>;

  @AttributeAnimator({attributeName: "stroke-miterlimit", valueType: Number})
  readonly strokeMiterlimit!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "stroke-opacity", valueType: Number})
  readonly strokeOpacity!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "stroke-width", valueType: Number})
  readonly strokeWidth!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "text-anchor", valueType: String})
  readonly textAnchor!: AttributeAnimator<this, TextAnchor | undefined>;

  @AttributeAnimator({attributeName: "textLength", valueType: Length, value: null})
  readonly textLength!: AttributeAnimator<this, Length | null, AnyLength | null>;

  @AttributeAnimator({attributeName: "transform", valueType: Transform, value: null})
  readonly transform!: AttributeAnimator<this, Transform | null, AnyTransform | null>;

  @AttributeAnimator({attributeName: "type", valueType: String})
  readonly type!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "values", valueType: String})
  readonly values!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "viewBox", valueType: String})
  readonly viewBox!: AttributeAnimator<this, string | undefined>;

  @AttributeAnimator({attributeName: "width", valueType: Length, value: null})
  readonly width!: AttributeAnimator<this, Length | null, AnyLength | null>;

  @AttributeAnimator({attributeName: "x", valueType: Number})
  readonly x!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "x1", valueType: Number})
  readonly x1!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "x2", valueType: Number})
  readonly x2!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "y", valueType: Number})
  readonly y!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "y1", valueType: Number})
  readonly y1!: AttributeAnimator<this, number | undefined>;

  @AttributeAnimator({attributeName: "y2", valueType: Number})
  readonly y2!: AttributeAnimator<this, number | undefined>;

  @StyleAnimator({propertyNames: "transform", valueType: Transform, value: null})
  readonly cssTransform!: StyleAnimator<this, Transform | null, AnyTransform | null>;

  @StyleAnimator({propertyNames: "filter", valueType: String})
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

  @StyleAnimator({propertyNames: "font-family", valueType: FontFamily})
  readonly fontFamily!: StyleAnimator<this, FontFamily | FontFamily[] | undefined, FontFamily | ReadonlyArray<FontFamily> | undefined>;

  @StyleAnimator({propertyNames: "font-size", valueType: Length, value: null})
  readonly fontSize!: StyleAnimator<this, Length | null, AnyLength | null>;

  @StyleAnimator({propertyNames: "font-stretch", valueType: String})
  readonly fontStretch!: StyleAnimator<this, FontStretch | undefined>;

  @StyleAnimator({propertyNames: "font-style", valueType: String})
  readonly fontStyle!: StyleAnimator<this, FontStyle | undefined>;

  @StyleAnimator({propertyNames: "font-variant", valueType: String})
  readonly fontVariant!: StyleAnimator<this, FontVariant | undefined>;

  @StyleAnimator<SvgView["fontWeight"]>({propertyNames: "font-weight", valueType: String})
  readonly fontWeight!: StyleAnimator<this, FontWeight | undefined>;

  @StyleAnimator<SvgView["lineHeight"]>({propertyNames: "line-height", valueType: Length, value: null})
  readonly lineHeight!: StyleAnimator<this, Length | null, AnyLength | null>;

  @StyleAnimator<SvgView["touchAction"]>({propertyNames: "touch-action", valueType: String})
  readonly touchAction!: StyleAnimator<this, TouchAction | undefined>;

  override get parentTransform(): Transform {
    const transform = this.transform.value;
    return transform !== null ? transform : Transform.identity();
  }

  override addEventListener<K extends keyof SVGElementEventMap>(type: K, listener: (this: SVGElement, event: SVGElementEventMap[K]) => unknown, options?: AddEventListenerOptions | boolean): void;
  override addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): void;
  override addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): void {
    this.node.addEventListener(type, listener, options);
  }

  override removeEventListener<K extends keyof SVGElementEventMap>(type: K, listener: (this: SVGElement, event: SVGElementEventMap[K]) => unknown, options?: EventListenerOptions | boolean): void;
  override removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): void;
  override removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): void {
    this.node.removeEventListener(type, listener, options);
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
    if (init.fillOpacity !== void 0) {
      this.fillOpacity(init.fillOpacity);
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
    if (init.strokeDashoffset !== void 0) {
      this.strokeDashoffset(init.strokeDashoffset);
    }
    if (init.strokeLinecap !== void 0) {
      this.strokeLinecap(init.strokeLinecap);
    }
    if (init.strokeLinejoin !== void 0) {
      this.strokeLinejoin(init.strokeLinejoin);
    }
    if (init.strokeMiterlimit !== void 0) {
      this.strokeMiterlimit(init.strokeMiterlimit);
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

  static override create<S extends Class<Instance<S, SvgView>>>(this: S): InstanceType<S>;
  static override create(): SvgView;
  static override create(): SvgView {
    return this.fromTag(this.tag);
  }

  static override fromTag<S extends Class<Instance<S, SvgView>>>(this: S, tag: string): InstanceType<S>;
  static override fromTag(tag: string): SvgView;
  static override fromTag(tag: string): SvgView {
    const node = document.createElementNS(this.namespace, tag) as SVGElement;
    return this.fromNode(node);
  }

  static override fromNode<S extends new (node: SVGElement) => Instance<S, SvgView>>(this: S, node: ViewNodeType<InstanceType<S>>): InstanceType<S>;
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

  static override fromAny<S extends Class<Instance<S, SvgView>>>(this: S, value: AnySvgView<InstanceType<S>>): InstanceType<S>;
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

  static forTag<S extends Class<Instance<S, SvgView>>>(this: S, tag: string): SvgViewFactory<InstanceType<S>>;
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

  fromInit(init: Inits<V>): V {
    let type = init.type;
    if (type === void 0) {
      type = this;
    }
    const view = type.create() as V;
    view.init(init);
    return view;
  }

  fromAny(value: AnySvgView<V>): V {
    return this.factory.fromAny(value);
  }
}
