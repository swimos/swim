// Copyright 2015-2023 Nstream, inc.
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
import type {Instance} from "@swim/util";
import type {LikeType} from "@swim/util";
import {Creatable} from "@swim/util";
import type {TimingLike} from "@swim/util";
import type {FastenerClass} from "@swim/component";
import type {Fastener} from "@swim/component";
import {Length} from "@swim/math";
import {Transform} from "@swim/math";
import {Color} from "@swim/style";
import {View} from "@swim/view";
import {AttributeAnimator} from "./AttributeAnimator";
import type {AlignmentBaseline} from "./csstypes";
import type {CssCursor} from "./csstypes";
import type {FillRule} from "./csstypes";
import type {StrokeLinecap} from "./csstypes";
import type {StrokeLinejoin} from "./csstypes";
import type {SvgPointerEvents} from "./csstypes";
import type {TextAnchor} from "./csstypes";
import {ElementAttributes} from "./ElementView";
import type {ElementViewFactory} from "./ElementView";
import type {ElementViewClass} from "./ElementView";
import type {ElementViewConstructor} from "./ElementView";
import type {ElementViewObserver} from "./ElementView";
import {ElementView} from "./ElementView";

/** @public */
export interface SvgAttributes<R = any> extends ElementAttributes<R> {
  get alignmentBaseline(): AttributeAnimator<this, AlignmentBaseline | undefined>;

  get clipPath(): AttributeAnimator<this, string | undefined>;

  get cursor(): AttributeAnimator<this, CssCursor | undefined>;

  get cx(): AttributeAnimator<this, number | undefined>;

  get cy(): AttributeAnimator<this, number | undefined>;

  get d(): AttributeAnimator<this, string | undefined>;

  get dx(): AttributeAnimator<this, Length | null>;

  get dy(): AttributeAnimator<this, Length | null>;

  get edgeMode(): AttributeAnimator<this, string | undefined>;

  get fill(): AttributeAnimator<this, Color | null>;

  get fillOpacity(): AttributeAnimator<this, number | undefined>;

  get fillRule(): AttributeAnimator<this, FillRule | undefined>;

  get floodColor(): AttributeAnimator<this, Color | null>;

  get floodOpacity(): AttributeAnimator<this, number | undefined>;

  get height(): AttributeAnimator<this, Length | null>;

  get in(): AttributeAnimator<this, string | undefined>;

  get in2(): AttributeAnimator<this, string | undefined>;

  get lengthAdjust(): AttributeAnimator<this, "spacing" | "spacingAndGlyphs" | undefined>;

  get mode(): AttributeAnimator<this, string | undefined>;

  get opacity(): AttributeAnimator<this, number | undefined>;

  get pointerEvents(): AttributeAnimator<this, SvgPointerEvents | undefined>;

  get points(): AttributeAnimator<this, string | undefined>;

  get preserveAspectRatio(): AttributeAnimator<this, boolean | undefined>;

  get r(): AttributeAnimator<this, number | undefined>;

  get result(): AttributeAnimator<this, string | undefined>;

  get stdDeviation(): AttributeAnimator<this, number | undefined>;

  get stroke(): AttributeAnimator<this, Color | null>;

  get strokeDasharray(): AttributeAnimator<this, string | undefined>;

  get strokeDashoffset(): AttributeAnimator<this, number | undefined>;

  get strokeLinecap(): AttributeAnimator<this, StrokeLinecap | undefined>;

  get strokeLinejoin(): AttributeAnimator<this, StrokeLinejoin | undefined>;

  get strokeMiterlimit(): AttributeAnimator<this, number | undefined>;

  get strokeOpacity(): AttributeAnimator<this, number | undefined>;

  get strokeWidth(): AttributeAnimator<this, number | undefined>;

  get textAnchor(): AttributeAnimator<this, TextAnchor | undefined>;

  get textLength(): AttributeAnimator<this, Length | null>;

  get transform(): AttributeAnimator<this, Transform | null>;

  get type(): AttributeAnimator<this, string | undefined>;

  get values(): AttributeAnimator<this, string | undefined>;

  get viewBox(): AttributeAnimator<this, string | undefined>;

  get width(): AttributeAnimator<this, Length | null>;

  get x(): AttributeAnimator<this, number | undefined>;

  get x1(): AttributeAnimator<this, number | undefined>;

  get x2(): AttributeAnimator<this, number | undefined>;

  get y(): AttributeAnimator<this, number | undefined>;

  get y1(): AttributeAnimator<this, number | undefined>;

  get y2(): AttributeAnimator<this, number | undefined>;

  /** @override */
  set<S>(this: S, properties: {[K in keyof S as S[K] extends {set(value: any): any} ? K : never]?: S[K] extends {set(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): R;
  /** @override */
  set(properties: {[K in keyof SvgAttributes as SvgAttributes[K] extends {set(value: any): any} ? K : never]?: SvgAttributes[K] extends {set(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): R;

  /** @override */
  setIntrinsic<S>(this: S, properties: {[K in keyof S as S[K] extends {setIntrinsic(value: any): any} ? K : never]?: S[K] extends {setIntrinsic(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): R;
  /** @override */
  setIntrinsic(properties: {[K in keyof SvgAttributes as SvgAttributes[K] extends {setIntrinsic(value: any): any} ? K : never]?: SvgAttributes[K] extends {setIntrinsic(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): R;
}

/** @public */
export const SvgAttributes = (<R, F extends SvgAttributes<any>>() => ElementAttributes.extend<SvgAttributes<R>, FastenerClass<F>>("SvgAttributes", {
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    SvgAttributes.initFasteners(fastener);
    return fastener;
  },
}))();

SvgAttributes.defineGetter("alignmentBaseline", [AttributeAnimator({
  attributeName: "alignment-baseline",
  valueType: String,
})]);

SvgAttributes.defineGetter("clipPath", [AttributeAnimator({
  attributeName: "clip-path",
  valueType: String,
})]);

SvgAttributes.defineGetter("cursor", [AttributeAnimator({
  attributeName: "cursor",
  valueType: String,
})]);

SvgAttributes.defineGetter("cx", [AttributeAnimator({
  attributeName: "cx",
  valueType: Number,
})]);

SvgAttributes.defineGetter("cy", [AttributeAnimator({
  attributeName: "cy",
  valueType: Number,
})]);

SvgAttributes.defineGetter("d", [AttributeAnimator({
  attributeName: "d",
  valueType: String,
})]);

SvgAttributes.defineGetter("dx", [AttributeAnimator({
  attributeName: "dx",
  valueType: Length,
  value: null,
})]);

SvgAttributes.defineGetter("dy", [AttributeAnimator({
  attributeName: "dy",
  valueType: Length,
  value: null,
})]);

SvgAttributes.defineGetter("edgeMode", [AttributeAnimator({
  attributeName: "edgeMode",
  valueType: String,
})]);

SvgAttributes.defineGetter("fill", [AttributeAnimator({
  attributeName: "fill",
  valueType: Color,
  value: null,
})]);

SvgAttributes.defineGetter("fillOpacity", [AttributeAnimator({
  attributeName: "fill-opacity",
  valueType: Number,
})]);

SvgAttributes.defineGetter("fillRule", [AttributeAnimator({
  attributeName: "fill-rule",
  valueType: String,
})]);

SvgAttributes.defineGetter("floodColor", [AttributeAnimator({
  attributeName: "flood-color",
  valueType: Color,
  value: null,
})]);

SvgAttributes.defineGetter("floodOpacity", [AttributeAnimator({
  attributeName: "flood-opacity",
  valueType: Number,
})]);

SvgAttributes.defineGetter("height", [AttributeAnimator({
  attributeName: "height",
  valueType: Length,
  value: null,
})]);

SvgAttributes.defineGetter("in", [AttributeAnimator({
  attributeName: "in",
  valueType: String,
})]);

SvgAttributes.defineGetter("in2", [AttributeAnimator({
  attributeName: "in2",
  valueType: String,
})]);

SvgAttributes.defineGetter("lengthAdjust", [AttributeAnimator({
  attributeName: "lengthAdjust",
  valueType: String,
})]);

SvgAttributes.defineGetter("mode", [AttributeAnimator({
  attributeName: "mode",
  valueType: String,
})]);

SvgAttributes.defineGetter("opacity", [AttributeAnimator({
  attributeName: "opacity",
  valueType: Number,
})]);

SvgAttributes.defineGetter("pointerEvents", [AttributeAnimator({
  attributeName: "pointer-events",
  valueType: String,
})]);

SvgAttributes.defineGetter("points", [AttributeAnimator({
  attributeName: "points",
  valueType: String,
})]);

SvgAttributes.defineGetter("preserveAspectRatio", [AttributeAnimator({
  attributeName: "preserveAspectRatio",
  valueType: Boolean,
})]);

SvgAttributes.defineGetter("r", [AttributeAnimator({
  attributeName: "r",
  valueType: Number,
})]);

SvgAttributes.defineGetter("result", [AttributeAnimator({
  attributeName: "result",
  valueType: String,
})]);

SvgAttributes.defineGetter("stdDeviation", [AttributeAnimator({
  attributeName: "stdDeviation",
  valueType: Number,
})]);

SvgAttributes.defineGetter("stroke", [AttributeAnimator({
  attributeName: "stroke",
  valueType: Color,
  value: null,
})]);

SvgAttributes.defineGetter("strokeDasharray", [AttributeAnimator({
  attributeName: "stroke-dasharray",
  valueType: String,
})]);

SvgAttributes.defineGetter("strokeDashoffset", [AttributeAnimator({
  attributeName: "stroke-dashoffset",
  valueType: Number,
})]);

SvgAttributes.defineGetter("strokeLinecap", [AttributeAnimator({
  attributeName: "stroke-linecap",
  valueType: String,
})]);

SvgAttributes.defineGetter("strokeLinejoin", [AttributeAnimator({
  attributeName: "stroke-linejoin",
  valueType: String,
})]);

SvgAttributes.defineGetter("strokeMiterlimit", [AttributeAnimator({
  attributeName: "stroke-miterlimit",
  valueType: Number,
})]);

SvgAttributes.defineGetter("strokeOpacity", [AttributeAnimator({
  attributeName: "stroke-opacity",
  valueType: Number,
})]);

SvgAttributes.defineGetter("strokeWidth", [AttributeAnimator({
  attributeName: "stroke-width",
  valueType: Number,
})]);

SvgAttributes.defineGetter("textAnchor", [AttributeAnimator({
  attributeName: "text-anchor",
  valueType: String,
})]);

SvgAttributes.defineGetter("textLength", [AttributeAnimator({
  attributeName: "textLength",
  valueType: Length,
  value: null,
})]);

SvgAttributes.defineGetter("transform", [AttributeAnimator({
  attributeName: "transform",
  valueType: Transform,
  value: null,
})]);

SvgAttributes.defineGetter("type", [AttributeAnimator({
  attributeName: "type",
  valueType: String,
})]);

SvgAttributes.defineGetter("values", [AttributeAnimator({
  attributeName: "values",
  valueType: String,
})]);

SvgAttributes.defineGetter("viewBox", [AttributeAnimator({
  attributeName: "viewBox",
  valueType: String,
})]);

SvgAttributes.defineGetter("width", [AttributeAnimator({
  attributeName: "width",
  valueType: Length,
  value: null,
})]);

SvgAttributes.defineGetter("x", [AttributeAnimator({
  attributeName: "x",
  valueType: Number,
})]);

SvgAttributes.defineGetter("x1", [AttributeAnimator({
  attributeName: "x1",
  valueType: Number,
})]);

SvgAttributes.defineGetter("x2", [AttributeAnimator({
  attributeName: "x2",
  valueType: Number,
})]);

SvgAttributes.defineGetter("y", [AttributeAnimator({
  attributeName: "y",
  valueType: Number,
})]);

SvgAttributes.defineGetter("y1", [AttributeAnimator({
  attributeName: "y1",
  valueType: Number,
})]);

SvgAttributes.defineGetter("y2", [AttributeAnimator({
  attributeName: "y2",
  valueType: Number,
})]);

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
export interface SvgViewFactory<V extends SvgView = SvgView> extends ElementViewFactory<V> {
}

/** @public */
export interface SvgViewClass<V extends SvgView = SvgView> extends ElementViewClass<V>, SvgViewFactory<V> {
  readonly tag: string;
  readonly namespace: string;
}

/** @public */
export interface SvgViewConstructor<V extends SvgView = SvgView> extends ElementViewConstructor<V>, SvgViewClass<V> {
  readonly tag: string;
  readonly namespace: string;
}

/** @public */
export interface SvgViewObserver<V extends SvgView = SvgView> extends ElementViewObserver<V> {
}

/** @public */
export class SvgView extends ElementView {
  constructor(node: SVGElement) {
    super(node);
  }

  override likeType?(like: {create?(): View} | Node | keyof SvgViewTagMap): void;

  declare readonly observerType?: Class<SvgViewObserver>;

  declare readonly node: SVGElement;

  @SvgAttributes({})
  override get attributes(): SvgAttributes<this> {
    return SvgAttributes.getter();
  }

  override setChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(key: string, newChildFactory: F): View | null;
  override setChild(key: string, newChild: View | LikeType<SvgView> | null): View | null;
  override setChild(key: string, newChild: View | LikeType<SvgView> | null): View | null {
    if (typeof newChild === "string") {
      newChild = SvgView.fromTag(newChild);
    }
    return super.setChild(key, newChild);
  }

  override appendChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(childFactory: F, key?: string): InstanceType<F>;
  override appendChild<V extends View>(child: V | LikeType<V>, key?: string): V;
  override appendChild<K extends keyof SvgViewTagMap>(tag: K, key?: string): SvgViewTagMap[K];
  override appendChild(child: View | LikeType<SvgView>, key?: string): View;
  override appendChild(child: View | LikeType<SvgView>, key?: string): View {
    if (typeof child === "string") {
      child = SvgView.fromTag(child);
    }
    return super.appendChild(child, key);
  }

  override prependChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(childFactory: F, key?: string): InstanceType<F>;
  override prependChild<V extends View>(child: V | LikeType<V>, key?: string): V;
  override prependChild<K extends keyof SvgViewTagMap>(tag: K, key?: string): SvgViewTagMap[K];
  override prependChild(child: View | LikeType<SvgView>, key?: string): View;
  override prependChild(child: View | LikeType<SvgView>, key?: string): View {
    if (typeof child === "string") {
      child = SvgView.fromTag(child);
    }
    return super.prependChild(child, key);
  }

  override insertChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(childFactory: F, target: View | Node | null, key?: string): InstanceType<F>;
  override insertChild<V extends View>(child: V | LikeType<V>, target: View | Node | null, key?: string): V;
  override insertChild<K extends keyof SvgViewTagMap>(tag: K, target: View | Node | null, key?: string): SvgViewTagMap[K];
  override insertChild(child: View | LikeType<SvgView>, target: View | Node | null, key?: string): View;
  override insertChild(child: View | LikeType<SvgView>, target: View | Node | null, key?: string): View {
    if (typeof child === "string") {
      child = SvgView.fromTag(child);
    }
    return super.insertChild(child, target, key);
  }

  override replaceChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(newChildFactory: F, oldChild: View): View;
  override replaceChild<V extends View>(newChild: View | LikeType<SvgView>, oldChild: V): V;
  override replaceChild(newChild: View | LikeType<SvgView>, oldChild: View): View;
  override replaceChild(newChild: View | LikeType<SvgView>, oldChild: View): View {
    if (typeof newChild === "string") {
      newChild = SvgView.fromTag(newChild);
    }
    return super.replaceChild(newChild, oldChild);
  }

  override get parentTransform(): Transform {
    const transform = this.attributes.transform.value;
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

  static override readonly tag: string = "svg";

  static override readonly namespace: string = "http://www.w3.org/2000/svg";

  static override create<S extends Class<Instance<S, SvgView>>>(this: S): InstanceType<S>;
  static override create(): SvgView;
  static override create(): SvgView {
    return this.fromTag(this.tag);
  }

  static override fromLike<S extends Class<Instance<S, View>>>(this: S, value: InstanceType<S> | LikeType<InstanceType<S>>): InstanceType<S> {
    if (value === void 0 || value === null) {
      return value as InstanceType<S>;
    } else if (value instanceof View) {
      if (!(value instanceof this)) {
        throw new TypeError(value + " not an instance of " + this);
      }
      return value;
    } else if (value instanceof SVGElement) {
      return (this as unknown as typeof SvgView).fromNode(value) as InstanceType<S>;
    } else if (Creatable[Symbol.hasInstance](value)) {
      return (value as Creatable<InstanceType<S>>).create();
    } else if (typeof value === "string") {
      return (this as unknown as typeof SvgView).fromTag(value) as InstanceType<S>;
    }
    throw new TypeError("" + value);
  }

  static override fromNode<S extends new (node: SVGElement) => Instance<S, SvgView>>(this: S, node: SVGElement): InstanceType<S>;
  static override fromNode(node: SVGElement): SvgView;
  static override fromNode(node: SVGElement): SvgView {
    let view = this.get(node);
    if (view === null) {
      view = new this(node);
      this.mount(view);
    }
    return view;
  }

  static override fromTag<S extends Class<Instance<S, SvgView>>>(this: S, tag: string): InstanceType<S>;
  static override fromTag(tag: string): SvgView;
  static override fromTag(tag: string): SvgView {
    const node = document.createElementNS(this.namespace, tag) as SVGElement;
    return this.fromNode(node);
  }

  static forTag<S extends Class<Instance<S, SvgView>>>(this: S, tag: string): SvgViewFactory<InstanceType<S>>;
  static forTag(tag: string): SvgViewFactory;
  static forTag(tag: string): SvgViewFactory {
    if (tag === this.tag) {
      return this;
    }
    return new SvgViewTagFactory(this, tag);
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

  fromLike(value: V | LikeType<V>): V {
    return this.factory.fromLike(value);
  }

  fromNode(node: SVGElement): V {
    return this.factory.fromNode(node);
  }

  fromTag(tag: string): V {
    const node = document.createElementNS(this.namespace, tag) as SVGElement;
    return this.fromNode(node);
  }
}
