// Copyright 2015-2021 Swim inc.
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
import type {AnyTiming, Timing} from "@swim/mapping";
import {Transform} from "@swim/math";
import {Look, Mood, MoodVector, ThemeMatrix} from "@swim/theme";
import {ViewFlags, ViewFactory, ViewConstructor, View} from "@swim/view";
import {StyleMapInit, StyleMap} from "../style/StyleMap";
import {ViewNodeType, NodeViewConstructor, NodeView} from "../node/NodeView";
import {AttributeAnimatorMemberInit, AttributeAnimator} from "../attribute/AttributeAnimator";
import {ElementViewInit, ElementViewConstructor, ElementView} from "../element/ElementView";
import type {HtmlViewObserver} from "./HtmlViewObserver";
import type {HtmlViewController} from "./HtmlViewController";
import type {StyleView} from "./StyleView";

export interface ViewHtml extends HTMLElement {
  view?: HtmlView;
}

export interface HtmlViewAttributesInit {
  autocomplete?: AttributeAnimatorMemberInit<HtmlView, "autocomplete">;
  checked?: AttributeAnimatorMemberInit<HtmlView, "checked">;
  colspan?: AttributeAnimatorMemberInit<HtmlView, "colspan">;
  disabled?: AttributeAnimatorMemberInit<HtmlView, "disabled">;
  placeholder?: AttributeAnimatorMemberInit<HtmlView, "placeholder">;
  rowspan?: AttributeAnimatorMemberInit<HtmlView, "rowspan">;
  selected?: AttributeAnimatorMemberInit<HtmlView, "selected">;
  title?: AttributeAnimatorMemberInit<HtmlView, "title">;
  type?: AttributeAnimatorMemberInit<HtmlView, "type">;
  value?: AttributeAnimatorMemberInit<HtmlView, "value">;
}

export interface HtmlViewStyleInit extends StyleMapInit {
}

export interface HtmlViewInit extends ElementViewInit {
  viewController?: HtmlViewController;
  attributes?: HtmlViewAttributesInit;
  style?: HtmlViewStyleInit;
}

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

export interface HtmlViewFactory<V extends HtmlView = HtmlView, U = HTMLElement> extends ViewFactory<V, U> {
}

export interface HtmlViewConstructor<V extends HtmlView = HtmlView> extends ElementViewConstructor<V> {
  fromTag(tag: string): V;
  fromNode(node: ViewNodeType<V>): V;
}

export class HtmlView extends ElementView {
  constructor(node: HTMLElement) {
    super(node);
  }

  override initView(init: HtmlViewInit): void {
    super.initView(init);
    if (init.attributes !== void 0) {
      this.initAttributes(init.attributes);
    }
    if (init.style !== void 0) {
      this.initStyle(init.style);
    }
  }

  initAttributes(init: HtmlViewAttributesInit): void {
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

  initStyle(init: HtmlViewStyleInit): void {
    StyleMap.init(this, init);
  }

  override readonly node!: HTMLElement;

  override readonly viewController!: HtmlViewController | null;

  override readonly viewObservers!: ReadonlyArray<HtmlViewObserver>;

  append<V extends View>(childView: V, key?: string): V;
  append<V extends NodeView>(viewConstructor: NodeViewConstructor<V>, key?: string): V;
  append<V extends View>(viewConstructor: ViewConstructor<V>, key?: string): V;
  append(childNode: HTMLElement, key?: string): HtmlView;
  append(childNode: Element, key?: string): ElementView;
  append(childNode: Node, key?: string): NodeView;
  append<T extends keyof HtmlViewTagMap>(tag: T, key?: string): HtmlViewTagMap[T];
  append(tag: string, key?: string): ElementView;
  append(child: Node | string, key?: string): NodeView;
  append(child: View | NodeViewConstructor | Node | string, key?: string): View {
    if (child instanceof Node) {
      child = NodeView.fromNode(child);
    } else if (typeof child === "function") {
      child = NodeView.fromConstructor(child);
    } else if (typeof child === "string") {
      child = HtmlView.fromTag(child);
    }
    this.appendChildView(child, key);
    return child;
  }

  prepend<V extends View>(childView: V, key?: string): V;
  prepend<V extends NodeView>(viewConstructor: NodeViewConstructor<V>, key?: string): V;
  prepend<V extends View>(viewConstructor: ViewConstructor<V>, key?: string): V;
  prepend(childNode: HTMLElement, key?: string): HtmlView;
  prepend(childNode: Element, key?: string): ElementView;
  prepend(childNode: Node, key?: string): NodeView;
  prepend<T extends keyof HtmlViewTagMap>(tag: T, key?: string): HtmlViewTagMap[T];
  prepend(tag: string, key?: string): ElementView;
  prepend(child: Node | string, key?: string): NodeView;
  prepend(child: View | NodeViewConstructor | Node | string, key?: string): View {
    if (child instanceof Node) {
      child = NodeView.fromNode(child);
    } else if (typeof child === "function") {
      child = NodeView.fromConstructor(child);
    } else if (typeof child === "string") {
      child = HtmlView.fromTag(child);
    }
    this.prependChildView(child, key);
    return child;
  }

  insert<V extends View>(childView: V, target: View | Node | null, key?: string): V;
  insert<V extends NodeView>(viewConstructor: NodeViewConstructor<V>, target: View | Node | null, key?: string): V;
  insert<V extends View>(viewConstructor: ViewConstructor<V>, target: View | Node | null, key?: string): V;
  insert(childNode: HTMLElement, target: View | Node | null, key?: string): HtmlView;
  insert(childNode: Element, target: View | Node | null, key?: string): ElementView;
  insert(childNode: Node, target: View | Node | null, key?: string): NodeView;
  insert<T extends keyof HtmlViewTagMap>(tag: T, target: View | Node | null, key?: string): HtmlViewTagMap[T];
  insert(tag: string, target: View | Node | null, key?: string): ElementView;
  insert(child: Node | string, target: View | Node | null, key?: string): NodeView;
  insert(child: View | NodeViewConstructor | Node | string, target: View | Node | null, key?: string): View {
    if (child instanceof Node) {
      child = NodeView.fromNode(child);
    } else if (typeof child === "function") {
      child = NodeView.fromConstructor(child);
    } else if (typeof child === "string") {
      child = HtmlView.fromTag(child);
    }
    this.insertChild(child, target, key);
    return child;
  }

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    if (this.node.hasAttribute("swim-theme")) {
      this.applyRootTheme(theme, mood, timing);
    }
  }

  /** @hidden */
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
    this.backgroundColor.setState(theme.getOr(Look.backgroundColor, Mood.ambient, null), timing, View.Intrinsic);
    this.color.setState(theme.getOr(Look.color, Mood.ambient, null), timing, View.Intrinsic);
  }

  /** @hidden */
  static isPositioned(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.position === "relative" || style.position === "absolute";
  }

  isPositioned(): boolean {
    return HtmlView.isPositioned(this.node);
  }

  /** @hidden */
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

  /** @hidden */
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
    const parentView = this.parentView;
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

  override on<T extends keyof HTMLElementEventMap>(type: T, listener: (this: HTMLElement, event: HTMLElementEventMap[T]) => unknown,
                                                   options?: AddEventListenerOptions | boolean): this;
  override on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this;
  override on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this {
    this.node.addEventListener(type, listener, options);
    return this;
  }

  override off<T extends keyof HTMLElementEventMap>(type: T, listener: (this: HTMLElement, event: HTMLElementEventMap[T]) => unknown,
                                                    options?: EventListenerOptions | boolean): this;
  override off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this;
  override off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this {
    this.node.removeEventListener(type, listener, options);
    return this;
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

  /** @hidden */
  static override readonly tags: {[tag: string]: HtmlViewConstructor<any> | undefined} = {};

  static override readonly tag: string = "div";

  static forTag(tag: string): HtmlViewConstructor<HtmlView> {
    if (tag === this.tag) {
      return this as unknown as HtmlViewConstructor<HtmlView>;
    } else {
      const _super = this;
      const _constructor = function HtmlTagView(this: HtmlView, node: HTMLElement): HtmlView {
        return (_super as Function).call(this, node) || this;
      } as unknown as HtmlViewConstructor<HtmlView>;
      __extends(_constructor, _super);
      (_constructor as any).tag = tag;
      return _constructor;
    }
  }

  static create<S extends HtmlViewConstructor<InstanceType<S>>>(this: S, tag: string = this.tag): InstanceType<S> {
    return this.fromTag(tag);
  }

  static override fromTag<S extends HtmlViewConstructor<InstanceType<S>>>(this: S, tag: string): InstanceType<S>;
  static override fromTag(tag: string): ElementView;
  static override fromTag(tag: string): ElementView {
    let viewConstructor: HtmlViewConstructor | undefined;
    if (Object.prototype.hasOwnProperty.call(this, "tags")) {
      viewConstructor = this.tags[tag];
    }
    if (viewConstructor === void 0) {
      viewConstructor = this;
    }
    const node = document.createElement(tag);
    return new viewConstructor(node);
  }

  static override fromNode<S extends HtmlViewConstructor<InstanceType<S>>>(this: S, node: ViewNodeType<InstanceType<S>>): InstanceType<S>;
  static override fromNode(node: ViewHtml): HtmlView;
  static override fromNode(node: ViewHtml): HtmlView {
    if (node.view instanceof this) {
      return node.view;
    } else {
      let viewConstructor: HtmlViewConstructor | undefined;
      if (Object.prototype.hasOwnProperty.call(this, "tags")) {
        viewConstructor = this.tags[node.tagName];
      }
      if (viewConstructor === void 0) {
        viewConstructor = this;
      }
      const view = new viewConstructor(node);
      HtmlView.mount(view);
      return view;
    }
  }

  static override fromAny<S extends HtmlViewConstructor<InstanceType<S>>>(this: S, value: InstanceType<S> | HTMLElement): InstanceType<S> {
    if (value instanceof this) {
      return value;
    } else if (value instanceof HTMLElement) {
      return this.fromNode(value as ViewNodeType<InstanceType<S>>);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static decorateTag(tag: string, target: Object, propertyKey: string | symbol): void {
    const tagConstructor = (target as typeof HtmlView).forTag(tag);
    Object.defineProperty(HtmlView, propertyKey, {
      value: tagConstructor,
      configurable: true,
      enumerable: true,
    });
    if (!(tag in HtmlView.tags)) {
      HtmlView.tags[tag] = tagConstructor;
    }
    if (!(tag in ElementView.tags)) {
      ElementView.tags[tag] = tagConstructor as ElementViewConstructor<any>;
    }
  }

  /** @hidden */
  static Tag(tagName: string): PropertyDecorator {
    return this.decorateTag.bind(void 0, tagName);
  }

  @HtmlView.Tag("a")
  static a: HtmlViewFactory;

  @HtmlView.Tag("abbr")
  static abbr: HtmlViewFactory;

  @HtmlView.Tag("address")
  static address: HtmlViewFactory;

  @HtmlView.Tag("area")
  static area: HtmlViewFactory;

  @HtmlView.Tag("article")
  static article: HtmlViewFactory;

  @HtmlView.Tag("aside")
  static aside: HtmlViewFactory;

  @HtmlView.Tag("audio")
  static audio: HtmlViewFactory;

  @HtmlView.Tag("b")
  static b: HtmlViewFactory;

  @HtmlView.Tag("base")
  static base: HtmlViewFactory;

  @HtmlView.Tag("bdi")
  static bdi: HtmlViewFactory;

  @HtmlView.Tag("bdo")
  static bdo: HtmlViewFactory;

  @HtmlView.Tag("blockquote")
  static blockquote: HtmlViewFactory;

  @HtmlView.Tag("body")
  static body: HtmlViewFactory;

  @HtmlView.Tag("br")
  static br: HtmlViewFactory;

  @HtmlView.Tag("button")
  static button: HtmlViewFactory;

  static canvas: HtmlViewFactory; // defined by CanvasView

  @HtmlView.Tag("caption")
  static caption: HtmlViewFactory;

  @HtmlView.Tag("cite")
  static cite: HtmlViewFactory;

  @HtmlView.Tag("code")
  static code: HtmlViewFactory;

  @HtmlView.Tag("col")
  static col: HtmlViewFactory;

  @HtmlView.Tag("colgroup")
  static colgroup: HtmlViewFactory;

  @HtmlView.Tag("data")
  static data: HtmlViewFactory;

  @HtmlView.Tag("datalist")
  static datalist: HtmlViewFactory;

  @HtmlView.Tag("dd")
  static dd: HtmlViewFactory;

  @HtmlView.Tag("del")
  static del: HtmlViewFactory;

  @HtmlView.Tag("details")
  static details: HtmlViewFactory;

  @HtmlView.Tag("dfn")
  static dfn: HtmlViewFactory;

  @HtmlView.Tag("dialog")
  static dialog: HtmlViewFactory;

  @HtmlView.Tag("div")
  static div: HtmlViewFactory;

  @HtmlView.Tag("dl")
  static dl: HtmlViewFactory;

  @HtmlView.Tag("dt")
  static dt: HtmlViewFactory;

  @HtmlView.Tag("em")
  static em: HtmlViewFactory;

  @HtmlView.Tag("embed")
  static embed: HtmlViewFactory;

  @HtmlView.Tag("fieldset")
  static fieldset: HtmlViewFactory;

  @HtmlView.Tag("figcaption")
  static figcaption: HtmlViewFactory;

  @HtmlView.Tag("figure")
  static figure: HtmlViewFactory;

  @HtmlView.Tag("footer")
  static footer: HtmlViewFactory;

  @HtmlView.Tag("form")
  static form: HtmlViewFactory;

  @HtmlView.Tag("h1")
  static h1: HtmlViewFactory;

  @HtmlView.Tag("h2")
  static h2: HtmlViewFactory;

  @HtmlView.Tag("h3")
  static h3: HtmlViewFactory;

  @HtmlView.Tag("h4")
  static h4: HtmlViewFactory;

  @HtmlView.Tag("h5")
  static h5: HtmlViewFactory;

  @HtmlView.Tag("h6")
  static h6: HtmlViewFactory;

  @HtmlView.Tag("head")
  static head: HtmlViewFactory;

  @HtmlView.Tag("header")
  static header: HtmlViewFactory;

  @HtmlView.Tag("hr")
  static hr: HtmlViewFactory;

  @HtmlView.Tag("html")
  static html: HtmlViewFactory;

  @HtmlView.Tag("i")
  static i: HtmlViewFactory;

  @HtmlView.Tag("iframe")
  static iframe: HtmlViewFactory;

  @HtmlView.Tag("img")
  static img: HtmlViewFactory;

  @HtmlView.Tag("input")
  static input: HtmlViewFactory;

  @HtmlView.Tag("ins")
  static ins: HtmlViewFactory;

  @HtmlView.Tag("kbd")
  static kbd: HtmlViewFactory;

  @HtmlView.Tag("label")
  static label: HtmlViewFactory;

  @HtmlView.Tag("legend")
  static legend: HtmlViewFactory;

  @HtmlView.Tag("li")
  static li: HtmlViewFactory;

  @HtmlView.Tag("link")
  static link: HtmlViewFactory;

  @HtmlView.Tag("main")
  static main: HtmlViewFactory;

  @HtmlView.Tag("map")
  static map: HtmlViewFactory;

  @HtmlView.Tag("mark")
  static mark: HtmlViewFactory;

  @HtmlView.Tag("meta")
  static meta: HtmlViewFactory;

  @HtmlView.Tag("meter")
  static meter: HtmlViewFactory;

  @HtmlView.Tag("nav")
  static nav: HtmlViewFactory;

  @HtmlView.Tag("noscript")
  static noscript: HtmlViewFactory;

  @HtmlView.Tag("object")
  static object: HtmlViewFactory;

  @HtmlView.Tag("ol")
  static ol: HtmlViewFactory;

  @HtmlView.Tag("optgroup")
  static optgroup: HtmlViewFactory;

  @HtmlView.Tag("option")
  static option: HtmlViewFactory;

  @HtmlView.Tag("output")
  static output: HtmlViewFactory;

  @HtmlView.Tag("p")
  static p: HtmlViewFactory;

  @HtmlView.Tag("param")
  static param: HtmlViewFactory;

  @HtmlView.Tag("picture")
  static picture: HtmlViewFactory;

  @HtmlView.Tag("pre")
  static pre: HtmlViewFactory;

  @HtmlView.Tag("progress")
  static progress: HtmlViewFactory;

  @HtmlView.Tag("q")
  static q: HtmlViewFactory;

  @HtmlView.Tag("rb")
  static rb: HtmlViewFactory;

  @HtmlView.Tag("rp")
  static rp: HtmlViewFactory;

  @HtmlView.Tag("rt")
  static rt: HtmlViewFactory;

  @HtmlView.Tag("rtc")
  static rtc: HtmlViewFactory;

  @HtmlView.Tag("ruby")
  static ruby: HtmlViewFactory;

  @HtmlView.Tag("s")
  static s: HtmlViewFactory;

  @HtmlView.Tag("samp")
  static samp: HtmlViewFactory;

  @HtmlView.Tag("script")
  static script: HtmlViewFactory;

  @HtmlView.Tag("section")
  static section: HtmlViewFactory;

  @HtmlView.Tag("select")
  static select: HtmlViewFactory;

  @HtmlView.Tag("small")
  static small: HtmlViewFactory;

  @HtmlView.Tag("slot")
  static slot: HtmlViewFactory;

  @HtmlView.Tag("source")
  static source: HtmlViewFactory;

  @HtmlView.Tag("span")
  static span: HtmlViewFactory;

  @HtmlView.Tag("strong")
  static strong: HtmlViewFactory;

  static style: HtmlViewFactory<StyleView>; // defined by StyleView

  @HtmlView.Tag("sub")
  static sub: HtmlViewFactory;

  @HtmlView.Tag("summary")
  static summary: HtmlViewFactory;

  @HtmlView.Tag("sup")
  static sup: HtmlViewFactory;

  @HtmlView.Tag("table")
  static table: HtmlViewFactory;

  @HtmlView.Tag("tbody")
  static tbody: HtmlViewFactory;

  @HtmlView.Tag("td")
  static td: HtmlViewFactory;

  @HtmlView.Tag("template")
  static template: HtmlViewFactory;

  @HtmlView.Tag("textarea")
  static textarea: HtmlViewFactory;

  @HtmlView.Tag("tfoot")
  static tfoot: HtmlViewFactory;

  @HtmlView.Tag("th")
  static th: HtmlViewFactory;

  @HtmlView.Tag("thead")
  static thead: HtmlViewFactory;

  @HtmlView.Tag("time")
  static time: HtmlViewFactory;

  @HtmlView.Tag("title")
  static title: HtmlViewFactory;

  @HtmlView.Tag("tr")
  static tr: HtmlViewFactory;

  @HtmlView.Tag("track")
  static track: HtmlViewFactory;

  @HtmlView.Tag("u")
  static u: HtmlViewFactory;

  @HtmlView.Tag("ul")
  static ul: HtmlViewFactory;

  @HtmlView.Tag("var")
  static var: HtmlViewFactory;

  @HtmlView.Tag("video")
  static video: HtmlViewFactory;

  @HtmlView.Tag("wbr")
  static wbr: HtmlViewFactory;
}
export interface HtmlView extends StyleMap {
  applyTheme(theme: ThemeMatrix, mood: MoodVector, timing?: AnyTiming | boolean): void;
  requireUpdate(updateFlags: ViewFlags, immediate?: boolean): void;
}
StyleMap.define(HtmlView.prototype);
