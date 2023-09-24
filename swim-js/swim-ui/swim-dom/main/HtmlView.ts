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

import {__runInitializers} from "tslib";
import type {Class} from "@swim/util";
import type {Instance} from "@swim/util";
import type {LikeType} from "@swim/util";
import type {TimingLike} from "@swim/util";
import type {Timing} from "@swim/util";
import {Creatable} from "@swim/util";
import {Affinity} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import type {Fastener} from "@swim/component";
import {Transform} from "@swim/math";
import {Look} from "@swim/theme";
import {Mood} from "@swim/theme";
import type {MoodVector} from "@swim/theme";
import type {ThemeMatrix} from "@swim/theme";
import {View} from "@swim/view";
import {AttributeAnimator} from "./AttributeAnimator";
import {ElementAttributes} from "./ElementView";
import type {ElementViewFactory} from "./ElementView";
import type {ElementViewClass} from "./ElementView";
import type {ElementViewConstructor} from "./ElementView";
import type {ElementViewObserver} from "./ElementView";
import {ElementView} from "./ElementView";
import {StyleView} from "./"; // forward import
import {SvgView} from "./"; // forward import

/** @public */
export interface HtmlAttributes<R = any> extends ElementAttributes<R> {
  get autocomplete(): AttributeAnimator<this, string | undefined>;

  get checked(): AttributeAnimator<this, boolean | undefined>;

  get colspan(): AttributeAnimator<this, number | undefined>;

  get disabled(): AttributeAnimator<this, boolean | undefined>;

  get href(): AttributeAnimator<this, string | undefined>;

  get placeholder(): AttributeAnimator<this, string | undefined>;

  get rowspan(): AttributeAnimator<this, number | undefined>;

  get selected(): AttributeAnimator<this, boolean | undefined>;

  get title(): AttributeAnimator<this, string | undefined>;

  get type(): AttributeAnimator<this, string | undefined>;

  get value(): AttributeAnimator<this, string | undefined>;

  /** @override */
  set<S>(this: S, properties: {[K in keyof S as S[K] extends {set(value: any): any} ? K : never]?: S[K] extends {set(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): R;
  /** @override */
  set(properties: {[K in keyof HtmlAttributes as HtmlAttributes[K] extends {set(value: any): any} ? K : never]?: HtmlAttributes[K] extends {set(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): R;

  /** @override */
  setIntrinsic<S>(this: S, properties: {[K in keyof S as S[K] extends {setIntrinsic(value: any): any} ? K : never]?: S[K] extends {setIntrinsic(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): R;
  /** @override */
  setIntrinsic(properties: {[K in keyof HtmlAttributes as HtmlAttributes[K] extends {setIntrinsic(value: any): any} ? K : never]?: HtmlAttributes[K] extends {setIntrinsic(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): R;
}

/** @public */
export const HtmlAttributes = (<R, F extends HtmlAttributes<any>>() => ElementAttributes.extend<HtmlAttributes<R>, FastenerClass<F>>("HtmlAttributes", {
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    HtmlAttributes.initFasteners(fastener);
    return fastener;
  },
}))();

HtmlAttributes.defineGetter("autocomplete", [AttributeAnimator({
  attributeName: "autocomplete",
  valueType: String,
})]);

HtmlAttributes.defineGetter("checked", [AttributeAnimator({
  attributeName: "checked",
  valueType: Boolean,
})]);

HtmlAttributes.defineGetter("colspan", [AttributeAnimator({
  attributeName: "colspan",
  valueType: Number,
})]);

HtmlAttributes.defineGetter("disabled", [AttributeAnimator({
  attributeName: "disabled",
  valueType: Boolean,
})]);

HtmlAttributes.defineGetter("href", [AttributeAnimator({
  attributeName: "href",
  valueType: String,
})]);

HtmlAttributes.defineGetter("placeholder", [AttributeAnimator({
  attributeName: "placeholder",
  valueType: String,
})]);

HtmlAttributes.defineGetter("rowspan", [AttributeAnimator({
  attributeName: "rowspan",
  valueType: Number,
})]);

HtmlAttributes.defineGetter("selected", [AttributeAnimator({
  attributeName: "selected",
  valueType: Boolean,
})]);

HtmlAttributes.defineGetter("title", [AttributeAnimator({
  attributeName: "title",
  valueType: String,
})]);

HtmlAttributes.defineGetter("type", [AttributeAnimator({
  attributeName: "type",
  valueType: String,
})]);

HtmlAttributes.defineGetter("value", [AttributeAnimator({
  attributeName: "value",
  valueType: String,
})]);

/** @public */
export interface HtmlViewTagMap {
  a: HtmlView;
  abbr: HtmlView;
  address: HtmlView;
  area: HtmlView;
  article: HtmlView;
  aside: HtmlView;
  audio: HtmlView;
  b: HtmlView;
  base: HtmlView;
  bdi: HtmlView;
  bdo: HtmlView;
  blockquote: HtmlView;
  body: HtmlView;
  br: HtmlView;
  button: HtmlView;
  canvas: HtmlView;
  caption: HtmlView;
  cite: HtmlView;
  code: HtmlView;
  col: HtmlView;
  colgroup: HtmlView;
  data: HtmlView;
  datalist: HtmlView;
  dd: HtmlView;
  del: HtmlView;
  details: HtmlView;
  dfn: HtmlView;
  dialog: HtmlView;
  div: HtmlView;
  dl: HtmlView;
  dt: HtmlView;
  em: HtmlView;
  embed: HtmlView;
  fieldset: HtmlView;
  figcaption: HtmlView;
  figure: HtmlView;
  footer: HtmlView;
  form: HtmlView;
  h1: HtmlView;
  h2: HtmlView;
  h3: HtmlView;
  h4: HtmlView;
  h5: HtmlView;
  h6: HtmlView;
  head: HtmlView;
  header: HtmlView;
  hr: HtmlView;
  html: HtmlView;
  i: HtmlView;
  iframe: HtmlView;
  img: HtmlView;
  input: HtmlView;
  ins: HtmlView;
  kbd: HtmlView;
  label: HtmlView;
  legend: HtmlView;
  li: HtmlView;
  link: HtmlView;
  main: HtmlView;
  map: HtmlView;
  mark: HtmlView;
  meta: HtmlView;
  meter: HtmlView;
  nav: HtmlView;
  noscript: HtmlView;
  object: HtmlView;
  ol: HtmlView;
  optgroup: HtmlView;
  option: HtmlView;
  output: HtmlView;
  p: HtmlView;
  param: HtmlView;
  picture: HtmlView;
  pre: HtmlView;
  progress: HtmlView;
  q: HtmlView;
  rb: HtmlView;
  rp: HtmlView;
  rt: HtmlView;
  rtc: HtmlView;
  ruby: HtmlView;
  s: HtmlView;
  samp: HtmlView;
  script: HtmlView;
  section: HtmlView;
  select: HtmlView;
  small: HtmlView;
  slot: HtmlView;
  source: HtmlView;
  span: HtmlView;
  strong: HtmlView;
  style: StyleView;
  sub: HtmlView;
  summary: HtmlView;
  sup: HtmlView;
  table: HtmlView;
  tbody: HtmlView;
  td: HtmlView;
  template: HtmlView;
  textarea: HtmlView;
  tfoot: HtmlView;
  th: HtmlView;
  thead: HtmlView;
  time: HtmlView;
  title: HtmlView;
  tr: HtmlView;
  track: HtmlView;
  u: HtmlView;
  ul: HtmlView;
  var: HtmlView;
  video: HtmlView;
  wbr: HtmlView;
}

/** @public */
export interface HtmlViewFactory<V extends HtmlView = HtmlView> extends ElementViewFactory<V> {
}

/** @public */
export interface HtmlViewClass<V extends HtmlView = HtmlView> extends ElementViewClass<V>, HtmlViewFactory<V> {
  readonly tag: string;
}

/** @public */
export interface HtmlViewConstructor<V extends HtmlView = HtmlView> extends ElementViewConstructor<V>, HtmlViewClass<V> {
  readonly tag: string;
}

/** @public */
export interface HtmlViewObserver<V extends HtmlView = HtmlView> extends ElementViewObserver<V> {
}

/** @public */
export class HtmlView extends ElementView {
  constructor(node: HTMLElement) {
    super(node);
  }

  override likeType?(like: {create?(): View} | Node | keyof HtmlViewTagMap): void;

  declare readonly observerType?: Class<HtmlViewObserver>;

  declare readonly node: HTMLElement;

  @HtmlAttributes({})
  override get attributes(): HtmlAttributes<this> {
    return HtmlAttributes.getter();
  }

  override setChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(key: string, newChildFactory: F): View | null;
  override setChild(key: string, newChild: View | LikeType<HtmlView> | null): View | null;
  override setChild(key: string, newChild: View | LikeType<HtmlView> | null): View | null {
    if (typeof newChild === "string") {
      newChild = HtmlView.fromTag(newChild);
    }
    return super.setChild(key, newChild);
  }

  override appendChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(childFactory: F, key?: string): InstanceType<F>;
  override appendChild<V extends View>(child: V | LikeType<V>, key?: string): V;
  override appendChild<K extends keyof HtmlViewTagMap>(tag: K, key?: string): HtmlViewTagMap[K];
  override appendChild(child: View | LikeType<HtmlView>, key?: string): View;
  override appendChild(child: View | LikeType<HtmlView>, key?: string): View {
    if (typeof child === "string") {
      child = HtmlView.fromTag(child);
    }
    return super.appendChild(child, key);
  }

  override prependChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(childFactory: F, key?: string): InstanceType<F>;
  override prependChild<V extends View>(child: V | LikeType<V>, key?: string): V;
  override prependChild<K extends keyof HtmlViewTagMap>(tag: K, key?: string): HtmlViewTagMap[K];
  override prependChild(child: View | LikeType<HtmlView>, key?: string): View;
  override prependChild(child: View | LikeType<HtmlView>, key?: string): View {
    if (typeof child === "string") {
      child = HtmlView.fromTag(child);
    }
    return super.prependChild(child, key);
  }

  override insertChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(childFactory: F, target: View | Node | null, key?: string): InstanceType<F>;
  override insertChild<V extends View>(child: V | LikeType<V>, target: View | Node | null, key?: string): V;
  override insertChild<K extends keyof HtmlViewTagMap>(tag: K, target: View | Node | null, key?: string): HtmlViewTagMap[K];
  override insertChild(child: View | LikeType<HtmlView>, target: View | Node | null, key?: string): View;
  override insertChild(child: View | LikeType<HtmlView>, target: View | Node | null, key?: string): View {
    if (typeof child === "string") {
      child = HtmlView.fromTag(child);
    }
    return super.insertChild(child, target, key);
  }

  override replaceChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(newChildFactory: F, oldChild: View): View;
  override replaceChild<V extends View>(newChild: View | LikeType<HtmlView>, oldChild: V): V;
  override replaceChild(newChild: View | LikeType<HtmlView>, oldChild: View): View;
  override replaceChild(newChild: View | LikeType<HtmlView>, oldChild: View): View {
    if (typeof newChild === "string") {
      newChild = HtmlView.fromTag(newChild);
    }
    return super.replaceChild(newChild, oldChild);
  }

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    if (this.node.hasAttribute("swim-theme")) {
      this.applyRootTheme(theme, mood, timing);
    }
  }

  /** @internal */
  applyRootTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    const font = theme.getOr(Look.font, Mood.ambient, null);
    if (font !== null) {
      if (font.style !== void 0) {
        this.style.fontStyle.setState(font.style, void 0, Affinity.Transient);
      }
      if (font.variant !== void 0) {
        this.style.fontVariant.setState(font.variant, void 0, Affinity.Transient);
      }
      if (font.weight !== void 0) {
        this.style.fontWeight.setState(font.weight, void 0, Affinity.Transient);
      }
      if (font.stretch !== void 0) {
        this.style.fontStretch.setState(font.stretch, void 0, Affinity.Transient);
      }
      if (font.size !== null) {
        this.style.fontSize.setState(font.size, void 0, Affinity.Transient);
      }
      if (font.height !== null) {
        this.style.lineHeight.setState(font.height, void 0, Affinity.Transient);
      }
      this.style.fontFamily.setState(font.family, void 0, Affinity.Transient);
    }
    this.style.backgroundColor.setIntrinsic(theme.getOr(Look.backgroundColor, Mood.ambient, null), timing);
    this.style.color.setIntrinsic(theme.getOr(Look.textColor, Mood.ambient, null), timing);
  }

  /** @internal */
  static isPositioned(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.position === "relative" || style.position === "absolute";
  }

  isPositioned(): boolean {
    return HtmlView.isPositioned(this.node);
  }

  /** @internal */
  static parentTransform(element: HTMLElement): Transform {
    if (HtmlView.isPositioned(element)) {
      const dx = element.offsetLeft;
      const dy = element.offsetTop;
      if (dx !== 0 || dy !== 0) {
        return Transform.translate(-dx, -dy);
      }
    }
    return Transform.identity();
  }

  /** @internal */
  static pageTransform(element: HTMLElement): Transform {
    const parentNode = element.parentNode;
    if (parentNode instanceof HTMLElement) {
      return HtmlView.pageTransform(parentNode).transform(HtmlView.parentTransform(element));
    }
    return Transform.identity();
  }

  override get parentTransform(): Transform {
    const transform = this.style.transform.value;
    if (transform !== null) {
      return transform;
    } else if (this.isPositioned()) {
      const dx = this.node.offsetLeft;
      const dy = this.node.offsetTop;
      if (dx !== 0 || dy !== 0) {
        return Transform.translate(-dx, -dy);
      }
    }
    return Transform.identity();
  }

  override get pageTransform(): Transform {
    const parentView = this.parent;
    if (parentView !== null) {
      return parentView.pageTransform.transform(this.parentTransform);
    }
    const parentNode = this.node.parentNode;
    if (parentNode instanceof HTMLElement) {
      return HtmlView.pageTransform(parentNode).transform(this.parentTransform);
    }
    return Transform.identity();
  }

  override addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, event: HTMLElementEventMap[K]) => unknown, options?: AddEventListenerOptions | boolean): void;
  override addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): void;
  override addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): void {
    this.node.addEventListener(type, listener, options);
  }

  override removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, event: HTMLElementEventMap[K]) => unknown, options?: EventListenerOptions | boolean): void;
  override removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): void;
  override removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): void {
    this.node.removeEventListener(type, listener, options);
  }

  static override readonly tag: string = "div";

  static override create<S extends Class<Instance<S, HtmlView>>>(this: S): InstanceType<S>;
  static override create(): HtmlView;
  static override create(): HtmlView {
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
    } else if (value instanceof HTMLElement) {
      return (this as unknown as typeof HtmlView).fromNode(value) as InstanceType<S>;
    } else if (Creatable[Symbol.hasInstance](value)) {
      return (value as Creatable<InstanceType<S>>).create();
    } else if (typeof value === "string") {
      return (this as unknown as typeof HtmlView).fromTag(value) as InstanceType<S>;
    }
    throw new TypeError("" + value);
  }

  static override fromNode<S extends new (node: HTMLElement) => Instance<S, HtmlView>>(this: S, node: HTMLElement): InstanceType<S>;
  static override fromNode(node: HTMLElement): HtmlView;
  static override fromNode(node: HTMLElement): HtmlView {
    let view = this.get(node);
    if (view === null) {
      view = new this(node);
      this.mount(view);
    }
    return view;
  }

  static override fromTag(tag: "style"): StyleView;
  static override fromTag(tag: "svg"): SvgView;
  static override fromTag<S extends Class<Instance<S, HtmlView>>>(this: S, tag: string): InstanceType<S>;
  static override fromTag(tag: string): HtmlView;
  static override fromTag(tag: string): ElementView {
    if (tag === "style" && this !== StyleView) {
      return StyleView.create();
    } else if (tag === "svg") {
      return SvgView.create();
    }
    const node = document.createElement(tag);
    return this.fromNode(node);
  }

  static forTag<S extends Class<Instance<S, HtmlView>>>(this: S, tag: string): HtmlViewFactory<InstanceType<S>>;
  static forTag(tag: string): HtmlViewFactory;
  static forTag(tag: string): HtmlViewFactory {
    if (tag === this.tag) {
      return this;
    }
    return new HtmlViewTagFactory(this, tag);
  }
}

/** @internal */
export class HtmlViewTagFactory<V extends HtmlView> implements HtmlViewFactory<V> {
  constructor(factory: HtmlViewFactory<V>, tag: string) {
    this.factory = factory;
    this.tag = tag;
  }

  /** @internal */
  readonly factory: HtmlViewFactory<V>;

  readonly tag: string;

  create(): V {
    return this.fromTag(this.tag);
  }

  fromLike(value: V | LikeType<V>): V {
    return this.factory.fromLike(value);
  }

  fromNode(node: HTMLElement): V {
    return this.factory.fromNode(node);
  }

  fromTag(tag: string): V {
    const node = document.createElement(tag);
    return this.fromNode(node);
  }
}
