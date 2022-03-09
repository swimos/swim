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

import {Class, Instance, Arrays, Creatable, ObserverType} from "@swim/util";
import {Affinity} from "@swim/component";
import {R2Box} from "@swim/math";
import {ThemeMatrix, Theme} from "@swim/theme";
import {ToAttributeString, ToStyleString, ToCssValue} from "@swim/style";
import {View, Viewport} from "@swim/view";
import type {StyleContext} from "../css/StyleContext";
import {
  ViewNodeType,
  AnyNodeView,
  NodeViewInit,
  NodeViewFactory,
  NodeViewClass,
  NodeViewConstructor,
  NodeView,
} from "../node/NodeView";
import type {
  ElementViewObserver,
  ElementViewObserverCache,
  ViewWillSetAttribute,
  ViewDidSetAttribute,
  ViewWillSetStyle,
  ViewDidSetStyle,
} from "./ElementViewObserver";
import {DomService} from "../"; // forward import
import {HtmlView} from "../"; // forward import
import {SvgView} from "../"; // forward import

/** @public */
export interface ViewElement extends Element, ElementCSSInlineStyle {
  view?: ElementView;
}

/** @public */
export type AnyElementView<V extends ElementView = ElementView> = AnyNodeView<V>;

/** @public */
export interface ElementViewInit extends NodeViewInit {
  id?: string;
  classList?: string[];
}

/** @public */
export interface ElementViewFactory<V extends ElementView = ElementView, U = AnyElementView<V>> extends NodeViewFactory<V, U> {
  fromTag(tag: string): V;
}

/** @public */
export interface ElementViewClass<V extends ElementView = ElementView, U = AnyElementView<V>> extends NodeViewClass<V, U>, ElementViewFactory<V, U> {
  readonly tag?: string;
  readonly namespace?: string;
}

/** @public */
export interface ElementViewConstructor<V extends ElementView = ElementView, U = AnyElementView<V>> extends NodeViewConstructor<V, U>, ElementViewClass<V, U> {
}

/** @public */
export class ElementView extends NodeView implements StyleContext {
  constructor(node: Element) {
    super(node);
    this.initElement(node);
  }

  override readonly observerType?: Class<ElementViewObserver>;

  override readonly node!: Element & ElementCSSInlineStyle;

  protected initElement(node: Element): void {
    const themeName = node.getAttribute("swim-theme");
    if (themeName !== null && themeName !== "") {
      let theme: ThemeMatrix | undefined;
      if (themeName === "auto") {
        const viewport = Viewport.detect();
        const colorScheme = viewport.colorScheme;
        if (colorScheme === "dark") {
          theme = Theme.dark;
        } else {
          theme = Theme.light;
        }
      } else if (themeName.indexOf('.') < 0) {
        theme = (Theme as any)[themeName];
      } else {
        theme = DomService.eval(themeName) as ThemeMatrix | undefined;
      }
      if (theme instanceof ThemeMatrix) {
        this.theme.setValue(theme, Affinity.Extrinsic);
      } else {
        throw new TypeError("unknown swim-theme: " + themeName);
      }
    }
  }

  /** @internal */
  protected override mountTheme(): void {
    super.mountTheme();
    if (NodeView.isRootView(this.node)) {
      const themeService = this.themeProvider.service;
      if (themeService !== void 0 && themeService !== null) {
        if (this.mood.hasAffinity(Affinity.Intrinsic) && this.mood.value === null) {
          this.mood.setValue(themeService.mood, Affinity.Intrinsic);
        }
        if (this.theme.hasAffinity(Affinity.Intrinsic) && this.theme.value === null) {
          this.theme.setValue(themeService.theme, Affinity.Intrinsic);
        }
      }
    }
  }

  getAttribute(attributeName: string): string | null {
    return this.node.getAttribute(attributeName);
  }

  setAttribute(attributeName: string, value: unknown): this {
    this.willSetAttribute(attributeName, value);
    if (value !== void 0 && value !== null) {
      this.node.setAttribute(attributeName, ToAttributeString(value));
    } else {
      this.node.removeAttribute(attributeName);
    }
    this.onSetAttribute(attributeName, value);
    this.didSetAttribute(attributeName, value);
    return this;
  }

  protected willSetAttribute(attributeName: string, value: unknown): void {
    const observers = this.observerCache.viewWillSetAttributeObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewWillSetAttribute(attributeName, value, this);
      }
    }
  }

  protected onSetAttribute(attributeName: string, value: unknown): void {
    // hook
  }

  protected didSetAttribute(attributeName: string, value: unknown): void {
    const observers = this.observerCache.viewDidSetAttributeObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewDidSetAttribute(attributeName, value, this);
      }
    }
  }

  getStyle(propertyNames: string | ReadonlyArray<string>): CSSStyleValue | string | undefined {
    if (typeof CSSStyleValue !== "undefined") { // CSS Typed OM support
      const style = this.node.attributeStyleMap;
      if (typeof propertyNames === "string") {
        try {
          return style.get(propertyNames);
        } catch (e) {
          return void 0;
        }
      } else {
        for (let i = 0, n = propertyNames.length; i < n; i += 1) {
          const value = style.get(propertyNames[i]!);
          if (value !== void 0) {
            return value;
          }
        }
        return "";
      }
    } else {
      const style = this.node.style;
      if (typeof propertyNames === "string") {
        return style.getPropertyValue(propertyNames);
      } else {
        for (let i = 0, n = propertyNames.length; i < n; i += 1) {
          const value = style.getPropertyValue(propertyNames[i]!);
          if (value.length !== 0) {
            return value;
          }
        }
        return "";
      }
    }
  }

  setStyle(propertyName: string, value: unknown, priority?: string): this {
    this.willSetStyle(propertyName, value, priority);
    if (typeof CSSStyleValue !== "undefined") { // CSS Typed OM support
      if (value !== void 0 && value !== null) {
        const cssValue = ToCssValue(value);
        if (cssValue !== null) {
          try {
            this.node.attributeStyleMap.set(propertyName, cssValue);
          } catch (e) {
            // swallow
          }
        } else {
          this.node.style.setProperty(propertyName, ToStyleString(value), priority);
        }
      } else {
        this.node.attributeStyleMap.delete(propertyName);
      }
    } else {
      if (value !== void 0 && value !== null) {
        this.node.style.setProperty(propertyName, ToStyleString(value), priority);
      } else {
        this.node.style.removeProperty(propertyName);
      }
    }
    this.onSetStyle(propertyName, value, priority);
    this.didSetStyle(propertyName, value, priority);
    return this;
  }

  protected willSetStyle(propertyName: string, value: unknown, priority: string | undefined): void {
    const observers = this.observerCache.viewWillSetStyleObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewWillSetStyle(propertyName, value, priority, this);
      }
    }
  }

  protected onSetStyle(propertyName: string, value: unknown, priority: string | undefined): void {
    // hook
  }

  protected didSetStyle(propertyName: string, value: unknown, priority: string | undefined): void {
    const observers = this.observerCache.viewDidSetStyleObservers;
    if (observers !== void 0) {
      for (let i = 0, n = observers.length; i < n; i += 1) {
        const observer = observers[i]!;
        observer.viewDidSetStyle(propertyName, value, priority, this);
      }
    }
  }

  id(): string | undefined;
  id(value: string | undefined): this;
  id(value?: string | undefined): string | undefined | this {
    if (arguments.length == 0) {
      const id = this.getAttribute("id");
      return id !== null ? id : void 0;
    } else {
      this.setAttribute("id", value);
      return this;
    }
  }

  className(): string | undefined;
  className(value: string | undefined): this;
  className(value?: string | undefined): string | undefined | this {
    if (arguments.length === 0) {
      const className = this.getAttribute("class");
      return className !== null ? className : void 0;
    } else {
      this.setAttribute("class", value);
      return this;
    }
  }

  get classList(): DOMTokenList {
    return this.node.classList;
  }

  hasClass(className: string): boolean {
    return this.node.classList.contains(className);
  }

  addClass(...classNames: string[]): this {
    const classList = this.node.classList;
    for (let i = 0, n = classNames.length; i < n; i += 1) {
      classList.add(classNames[i]!);
    }
    return this;
  }

  removeClass(...classNames: string[]): this {
    const classList = this.node.classList;
    for (let i = 0, n = classNames.length; i < n; i += 1) {
      classList.remove(classNames[i]!);
    }
    return this;
  }

  toggleClass(className: string, state?: boolean): this {
    const classList = this.node.classList;
    if (state === void 0) {
      classList.toggle(className);
    } else if (state === true) {
      classList.add(className);
    } else if (state === false) {
      classList.remove(className);
    }
    return this;
  }

  override get clientBounds(): R2Box {
    const bounds = this.node.getBoundingClientRect();
    return new R2Box(bounds.left, bounds.top, bounds.right, bounds.bottom);
  }

  override get pageBounds(): R2Box {
    const bounds = this.node.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;
    return new R2Box(bounds.left + scrollX, bounds.top + scrollY,
                     bounds.right + scrollX, bounds.bottom + scrollY);
  }

  override on<K extends keyof ElementEventMap>(type: K, listener: (this: Element, event: ElementEventMap[K]) => unknown,
                                               options?: AddEventListenerOptions | boolean): this;
  override on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this;
  override on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this {
    this.node.addEventListener(type, listener, options);
    return this;
  }

  override off<K extends keyof ElementEventMap>(type: K, listener: (this: Element, event: ElementEventMap[K]) => unknown,
                                                options?: EventListenerOptions | boolean): this;
  override off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this;
  override off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this {
    this.node.removeEventListener(type, listener, options);
    return this;
  }

  /** @internal */
  override readonly observerCache!: ElementViewObserverCache<this>;

  protected override onObserve(observer: ObserverType<this>): void {
    super.onObserve(observer);
    if (observer.viewWillSetAttribute !== void 0) {
      this.observerCache.viewWillSetAttributeObservers = Arrays.inserted(observer as ViewWillSetAttribute, this.observerCache.viewWillSetAttributeObservers);
    }
    if (observer.viewDidSetAttribute !== void 0) {
      this.observerCache.viewDidSetAttributeObservers = Arrays.inserted(observer as ViewDidSetAttribute, this.observerCache.viewDidSetAttributeObservers);
    }
    if (observer.viewWillSetStyle !== void 0) {
      this.observerCache.viewWillSetStyleObservers = Arrays.inserted(observer as ViewWillSetStyle, this.observerCache.viewWillSetStyleObservers);
    }
    if (observer.viewDidSetStyle !== void 0) {
      this.observerCache.viewDidSetStyleObservers = Arrays.inserted(observer as ViewDidSetStyle, this.observerCache.viewDidSetStyleObservers);
    }
  }

  protected override onUnobserve(observer: ObserverType<this>): void {
    super.onUnobserve(observer);
    if (observer.viewWillSetAttribute !== void 0) {
      this.observerCache.viewWillSetAttributeObservers = Arrays.removed(observer as ViewWillSetAttribute, this.observerCache.viewWillSetAttributeObservers);
    }
    if (observer.viewDidSetAttribute !== void 0) {
      this.observerCache.viewDidSetAttributeObservers = Arrays.removed(observer as ViewDidSetAttribute, this.observerCache.viewDidSetAttributeObservers);
    }
    if (observer.viewWillSetStyle !== void 0) {
      this.observerCache.viewWillSetStyleObservers = Arrays.removed(observer as ViewWillSetStyle, this.observerCache.viewWillSetStyleObservers);
    }
    if (observer.viewDidSetStyle !== void 0) {
      this.observerCache.viewDidSetStyleObservers = Arrays.removed(observer as ViewDidSetStyle, this.observerCache.viewDidSetStyleObservers);
    }
  }

  override init(init: ElementViewInit): void {
    super.init(init);
    if (init.id !== void 0) {
      this.id(init.id);
    }
    if (init.classList !== void 0) {
      this.addClass(...init.classList);
    }
  }

  /** @internal */
  static readonly tag?: string;

  /** @internal */
  static readonly namespace?: string;

  static override create<S extends Class<Instance<S, ElementView>>>(this: S): InstanceType<S>;
  static override create(): ElementView;
  static override create(): ElementView {
    let tag = this.tag;
    if (tag === void 0) {
      tag = "div";
    }
    return this.fromTag(tag);
  }

  static fromTag<S extends Class<Instance<S, ElementView>>>(this: S, tag: string, namespace?: string): InstanceType<S>;
  static fromTag(tag: string, namespace?: string): ElementView;
  static fromTag(tag: string, namespace?: string): ElementView {
    if (namespace === void 0) {
      if (tag === "svg") {
        namespace = SvgView.namespace;
      }
    }
    let node: Element;
    if (namespace !== void 0) {
      node = document.createElementNS(namespace, tag);
    } else {
      node = document.createElement(tag);
    }
    return this.fromNode(node);
  }

  static override fromNode<S extends new (node: Element) => Instance<S, ElementView>>(this: S, node: ViewNodeType<InstanceType<S>>): InstanceType<S>;
  static override fromNode(node: Element): ElementView;
  static override fromNode(node: Element): ElementView {
    let view = (node as ViewElement).view;
    if (view === void 0) {
      if (node instanceof HTMLElement) {
        view = HtmlView.fromNode(node);
      } else if (node instanceof SVGElement) {
        view = SvgView.fromNode(node);
      } else {
        view = new this(node);
        this.mount(view);
      }
    } else if (!(view instanceof this)) {
      throw new TypeError(view + " not an instance of " + this);
    }
    return view;
  }

  static override fromAny<S extends Class<Instance<S, ElementView>>>(this: S, value: AnyElementView<InstanceType<S>>): InstanceType<S>;
  static override fromAny(value: AnyElementView | string): ElementView;
  static override fromAny(value: AnyElementView | string): ElementView {
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
}
