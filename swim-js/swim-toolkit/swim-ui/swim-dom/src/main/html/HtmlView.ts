// Copyright 2015-2022 Swim.inc
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

import {Class, Instance, AnyTiming, Timing, Creatable, InitType} from "@swim/util";
import {Affinity, MemberAnimatorInit} from "@swim/component";
import {Transform} from "@swim/math";
import {Look, Mood, MoodVector, ThemeMatrix} from "@swim/theme";
import {ViewFlags, AnyView, View} from "@swim/view";
import {AttributeAnimator} from "../animator/AttributeAnimator";
import {StyleMapInit, StyleMap} from "../css/StyleMap";
import type {ViewNodeType} from "../node/NodeView";
import {
  AnyElementView,
  ElementViewInit,
  ElementViewFactory,
  ElementViewClass,
  ElementViewConstructor,
  ElementView,
} from "../element/ElementView";
import type {HtmlViewObserver} from "./HtmlViewObserver";
import {StyleView} from "./"; // forward import
import {SvgView} from "../"; // forward import

/** @public */
export interface ViewHtml extends HTMLElement {
  view?: HtmlView;
}

/** @public */
export type AnyHtmlView<V extends HtmlView = HtmlView> = AnyElementView<V> | keyof HtmlViewTagMap;

/** @public */
export interface HtmlViewInit extends ElementViewInit {
  attributes?: HtmlViewAttributesInit;
  style?: HtmlViewStyleInit;
}

/** @public */
export interface HtmlViewAttributesInit {
  autocomplete?: MemberAnimatorInit<HtmlView, "autocomplete">;
  checked?: MemberAnimatorInit<HtmlView, "checked">;
  colspan?: MemberAnimatorInit<HtmlView, "colspan">;
  disabled?: MemberAnimatorInit<HtmlView, "disabled">;
  placeholder?: MemberAnimatorInit<HtmlView, "placeholder">;
  rowspan?: MemberAnimatorInit<HtmlView, "rowspan">;
  selected?: MemberAnimatorInit<HtmlView, "selected">;
  title?: MemberAnimatorInit<HtmlView, "title">;
  type?: MemberAnimatorInit<HtmlView, "type">;
  value?: MemberAnimatorInit<HtmlView, "value">;
}

/** @public */
export interface HtmlViewStyleInit extends StyleMapInit {
}

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
export interface HtmlViewFactory<V extends HtmlView = HtmlView, U = AnyHtmlView<V>> extends ElementViewFactory<V, U> {
}

/** @public */
export interface HtmlViewClass<V extends HtmlView = HtmlView, U = AnyHtmlView<V>> extends ElementViewClass<V, U>, HtmlViewFactory<V, U> {
  readonly tag: string;
}

/** @public */
export interface HtmlViewConstructor<V extends HtmlView = HtmlView, U = AnyHtmlView<V>> extends ElementViewConstructor<V, U>, HtmlViewClass<V, U> {
  readonly tag: string;
}

/** @public */
export class HtmlView extends ElementView {
  constructor(node: HTMLElement) {
    super(node);
  }

  override readonly observerType?: Class<HtmlViewObserver>;

  override readonly node!: HTMLElement;

  override setChild<V extends View>(key: string, newChild: V): View | null;
  override setChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(key: string, factory: F): View | null;
  override setChild(key: string, newChild: AnyView | Node | keyof HtmlViewTagMap | null): View | null;
  override setChild(key: string, newChild: AnyView | Node | keyof HtmlViewTagMap | null): View | null {
    if (typeof newChild === "string") {
      newChild = HtmlView.fromTag(newChild);
    }
    return super.setChild(key, newChild);
  }

  override appendChild<V extends View>(child: V, key?: string): V;
  override appendChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(factory: F, key?: string): InstanceType<F>;
  override appendChild<K extends keyof HtmlViewTagMap>(tag: K, key?: string): HtmlViewTagMap[K];
  override appendChild(child: AnyView | Node | keyof HtmlViewTagMap, key?: string): View;
  override appendChild(child: AnyView | Node | keyof HtmlViewTagMap, key?: string): View {
    if (typeof child === "string") {
      child = HtmlView.fromTag(child);
    }
    return super.appendChild(child, key);
  }

  override prependChild<V extends View>(child: V, key?: string): V;
  override prependChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(factory: F, key?: string): InstanceType<F>;
  override prependChild<K extends keyof HtmlViewTagMap>(tag: K, key?: string): HtmlViewTagMap[K];
  override prependChild(child: AnyView | Node | keyof HtmlViewTagMap, key?: string): View;
  override prependChild(child: AnyView | Node | keyof HtmlViewTagMap, key?: string): View {
    if (typeof child === "string") {
      child = HtmlView.fromTag(child);
    }
    return super.prependChild(child, key);
  }

  override insertChild<V extends View>(child: V, target: View | Node | null, key?: string): V;
  override insertChild<F extends Class<Instance<F, View>> & Creatable<Instance<F, View>>>(factory: F, target: View | Node | null, key?: string): InstanceType<F>;
  override insertChild<K extends keyof HtmlViewTagMap>(tag: K, target: View | Node | null, key?: string): HtmlViewTagMap[K];
  override insertChild(child: AnyView | Node | keyof HtmlViewTagMap, target: View | Node | null, key?: string): View;
  override insertChild(child: AnyView | Node | keyof HtmlViewTagMap, target: View | Node | null, key?: string): View {
    if (typeof child === "string") {
      child = HtmlView.fromTag(child);
    }
    return super.insertChild(child, target, key);
  }

  override replaceChild<V extends View>(newChild: View, oldChild: V): V;
  override replaceChild<V extends View>(newChild: AnyView | Node | keyof HtmlViewTagMap, oldChild: V): V;
  override replaceChild(newChild: AnyView | Node | keyof HtmlViewTagMap, oldChild: View): View {
    if (typeof newChild === "string") {
      newChild = HtmlView.fromTag(newChild);
    }
    return super.replaceChild(newChild, oldChild);
  }

  @AttributeAnimator({attributeName: "autocomplete", type: String})
  readonly autocomplete!: AttributeAnimator<this, string>;

  @AttributeAnimator({attributeName: "checked", type: Boolean})
  readonly checked!: AttributeAnimator<this, boolean, boolean | string>;

  @AttributeAnimator({attributeName: "colspan", type: Number})
  readonly colspan!: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator({attributeName: "disabled", type: Boolean})
  readonly disabled!: AttributeAnimator<this, boolean, boolean | string>;

  @AttributeAnimator({attributeName: "placeholder", type: String})
  readonly placeholder!: AttributeAnimator<this, string>;

  @AttributeAnimator({attributeName: "rowspan", type: Number})
  readonly rowspan!: AttributeAnimator<this, number, number | string>;

  @AttributeAnimator({attributeName: "selected", type: Boolean})
  readonly selected!: AttributeAnimator<this, boolean, boolean | string>;

  @AttributeAnimator({attributeName: "title", type: String})
  readonly title!: AttributeAnimator<this, string>;

  @AttributeAnimator({attributeName: "type", type: String})
  readonly type!: AttributeAnimator<this, string>;

  @AttributeAnimator({attributeName: "value", type: String})
  readonly value!: AttributeAnimator<this, string>;

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
        this.fontStyle.setState(font.style, void 0, 0);
      }
      if (font.variant !== void 0) {
        this.fontVariant.setState(font.variant, void 0, 0);
      }
      if (font.weight !== void 0) {
        this.fontWeight.setState(font.weight, void 0, 0);
      }
      if (font.stretch !== void 0) {
        this.fontStretch.setState(font.stretch, void 0, 0);
      }
      if (font.size !== null) {
        this.fontSize.setState(font.size, void 0, 0);
      }
      if (font.height !== null) {
        this.lineHeight.setState(font.height, void 0, 0);
      }
      this.fontFamily.setState(font.family, void 0, 0);
    }
    this.backgroundColor.setState(theme.getOr(Look.backgroundColor, Mood.ambient, null), timing, Affinity.Intrinsic);
    this.color.setState(theme.getOr(Look.textColor, Mood.ambient, null), timing, Affinity.Intrinsic);
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
    } else {
      return Transform.identity();
    }
  }

  override get parentTransform(): Transform {
    const transform = this.transform.value;
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
    } else {
      const parentNode = this.node.parentNode;
      if (parentNode instanceof HTMLElement) {
        return HtmlView.pageTransform(parentNode).transform(this.parentTransform);
      } else {
        return Transform.identity();
      }
    }
  }

  override on<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, event: HTMLElementEventMap[K]) => unknown,
                                                   options?: AddEventListenerOptions | boolean): this;
  override on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this;
  override on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this {
    this.node.addEventListener(type, listener, options);
    return this;
  }

  override off<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, event: HTMLElementEventMap[K]) => unknown,
                                                    options?: EventListenerOptions | boolean): this;
  override off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this;
  override off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this {
    this.node.removeEventListener(type, listener, options);
    return this;
  }

  /** @internal */
  protected initAttributes(init: HtmlViewAttributesInit): void {
    if (init.autocomplete !== void 0) {
      this.autocomplete(init.autocomplete);
    }
    if (init.checked !== void 0) {
      this.checked(init.checked);
    }
    if (init.colspan !== void 0) {
      this.colspan(init.colspan);
    }
    if (init.disabled !== void 0) {
      this.disabled(init.disabled);
    }
    if (init.placeholder !== void 0) {
      this.placeholder(init.placeholder);
    }
    if (init.rowspan !== void 0) {
      this.rowspan(init.rowspan);
    }
    if (init.selected !== void 0) {
      this.selected(init.selected);
    }
    if (init.title !== void 0) {
      this.title(init.title);
    }
    if (init.type !== void 0) {
      this.type(init.type);
    }
    if (init.value !== void 0) {
      this.value(init.value);
    }
  }

  /** @internal */
  protected initStyle(init: HtmlViewStyleInit): void {
    StyleMap.init(this, init);
  }

  override init(init: HtmlViewInit): void {
    super.init(init);
    if (init.attributes !== void 0) {
      this.initAttributes(init.attributes);
    }
    if (init.style !== void 0) {
      this.initStyle(init.style);
    }
  }

  static override readonly tag: string = "div";

  static override create<S extends Class<Instance<S, HtmlView>>>(this: S): InstanceType<S>;
  static override create(): HtmlView;
  static override create(): HtmlView {
    return this.fromTag(this.tag);
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
    } else {
      const node = document.createElement(tag);
      return this.fromNode(node);
    }
  }

  static override fromNode<S extends new (node: HTMLElement) => Instance<S, HtmlView>>(this: S, node: ViewNodeType<InstanceType<S>>): InstanceType<S>;
  static override fromNode(node: HTMLElement): HtmlView;
  static override fromNode(node: HTMLElement): HtmlView {
    let view = (node as ViewHtml).view;
    if (view === void 0) {
      view = new this(node);
      this.mount(view);
    } else if (!(view instanceof this)) {
      throw new TypeError(view + " not an instance of " + this);
    }
    return view;
  }

  static override fromAny<S extends Class<Instance<S, HtmlView>>>(this: S, value: AnyHtmlView<InstanceType<S>>): InstanceType<S>;
  static override fromAny(value: AnyHtmlView | string): HtmlView;
  static override fromAny(value: AnyHtmlView | string): HtmlView {
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

  static forTag<S extends Class<Instance<S, HtmlView>>>(this: S, tag: string): HtmlViewFactory<InstanceType<S>>;
  static forTag(tag: string): HtmlViewFactory;
  static forTag(tag: string): HtmlViewFactory {
    if (tag === this.tag) {
      return this;
    } else {
      return new HtmlViewTagFactory(this, tag);
    }
  }
}
/** @public */
export interface HtmlView extends StyleMap {
  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean): void;
  requireUpdate(updateFlags: ViewFlags, immediate?: boolean): void;
}
StyleMap.define(HtmlView.prototype);

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

  fromTag(tag: string): V {
    const node = document.createElement(tag);
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

  fromAny(value: AnyHtmlView<V>): V {
    return this.factory.fromAny(value);
  }
}
