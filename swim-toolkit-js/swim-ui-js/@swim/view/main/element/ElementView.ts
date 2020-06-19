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

import {BoxR2} from "@swim/math";
import {AttributeString, StyleString, StyledElement} from "@swim/style";
import {View} from "../View";
import {NodeView} from "../node/NodeView";
import {AttributeAnimatorConstructor, AttributeAnimator} from "../attribute/AttributeAnimator";
import {StyleAnimatorConstructor, StyleAnimator} from "../style/StyleAnimator";
import {ElementViewObserver} from "./ElementViewObserver";
import {ElementViewController} from "./ElementViewController";
import {SvgViewTagMap} from "../svg/SvgView";
import {HtmlViewTagMap} from "../html/HtmlView";

export interface ViewElement extends StyledElement {
  view?: ElementView;
}

export interface ElementViewTagMap extends SvgViewTagMap, HtmlViewTagMap {
}

export interface ElementViewConstructor<E extends Element = Element, V extends ElementView = ElementView> {
  new(node: E): V;

  readonly tag: string;
  readonly namespace?: string;
}

export class ElementView extends NodeView {
  /** @hidden */
  _attributeAnimators?: {[animatorName: string]: AttributeAnimator<ElementView, unknown> | undefined};
  /** @hidden */
  _styleAnimators?: {[animatorName: string]: StyleAnimator<ElementView, unknown> | undefined};

  constructor(node: Element) {
    super(node);
  }

  get node(): ViewElement {
    return this._node;
  }

  get viewController(): ElementViewController | null {
    return this._viewController;
  }

  getAttribute(attributeName: string): string | null {
    return this._node.getAttribute(attributeName);
  }

  setAttribute(attributeName: string, value: unknown): this {
    this.willSetAttribute(attributeName, value);
    if (value !== void 0) {
      this._node.setAttribute(attributeName, AttributeString(value));
    } else {
      this._node.removeAttribute(attributeName);
    }
    this.onSetAttribute(attributeName, value);
    this.didSetAttribute(attributeName, value);
    return this;
  }

  protected willSetAttribute(attributeName: string, value: unknown): void {
    this.willObserve(function (viewObserver: ElementViewObserver): void {
      if (viewObserver.viewWillSetAttribute !== void 0) {
        viewObserver.viewWillSetAttribute(attributeName, value, this);
      }
    });
  }

  protected onSetAttribute(attributeName: string, value: unknown): void {
    // hook
  }

  protected didSetAttribute(attributeName: string, value: unknown): void {
    this.didObserve(function (viewObserver: ElementViewObserver): void {
      if (viewObserver.viewDidSetAttribute !== void 0) {
        viewObserver.viewDidSetAttribute(attributeName, value, this);
      }
    });
  }

  hasAttributeAnimator(animatorName: string): boolean {
    const attributeAnimators = this._attributeAnimators;
    return attributeAnimators !== void 0 && attributeAnimators[animatorName] !== void 0;
  }

  getAttributeAnimator(animatorName: string): AttributeAnimator<this, unknown> | null {
    const attributeAnimators = this._attributeAnimators;
    if (attributeAnimators !== void 0) {
      const attributeAnimator = attributeAnimators[animatorName];
      if (attributeAnimator !== void 0) {
        return attributeAnimator as AttributeAnimator<this, unknown>;
      }
    }
    return null;
  }

  setAttributeAnimator(animatorName: string, attributeAnimator: AttributeAnimator<this, unknown> | null): void {
    let attributeAnimators = this._attributeAnimators;
    if (attributeAnimators === void 0) {
      attributeAnimators = {};
      this._attributeAnimators = attributeAnimators;
    }
    if (attributeAnimator !== null) {
      attributeAnimators[animatorName] = attributeAnimator;
    } else {
      delete attributeAnimators[animatorName];
    }
  }

  getStyle(propertyNames: string | ReadonlyArray<string>): string {
    const style = this._node.style;
    if (typeof propertyNames === "string") {
      return style.getPropertyValue(propertyNames);
    } else {
      for (let i = 0, n = propertyNames.length; i < n; i += 1) {
        const value = style.getPropertyValue(propertyNames[i]);
        if (value !== "") {
          return value;
        }
      }
      return "";
    }
  }

  setStyle(propertyName: string, value: unknown, priority?: string): this {
    this.willSetStyle(propertyName, value, priority);
    if (value !== void 0) {
      this._node.style.setProperty(propertyName, StyleString(value), priority);
    } else {
      this._node.style.removeProperty(propertyName);
    }
    this.onSetStyle(propertyName, value, priority);
    this.didSetStyle(propertyName, value, priority);
    return this;
  }

  protected willSetStyle(propertyName: string, value: unknown, priority: string | undefined): void {
    this.willObserve(function (viewObserver: ElementViewObserver): void {
      if (viewObserver.viewWillSetStyle !== void 0) {
        viewObserver.viewWillSetStyle(propertyName, value, priority, this);
      }
    });
  }

  protected onSetStyle(propertyName: string, value: unknown, priority: string | undefined): void {
    // hook
  }

  protected didSetStyle(propertyName: string, value: unknown, priority: string | undefined): void {
    this.didObserve(function (viewObserver: ElementViewObserver): void {
      if (viewObserver.viewDidSetStyle !== void 0) {
        viewObserver.viewDidSetStyle(propertyName, value, priority, this);
      }
    });
  }

  hasStyleAnimator(animatorName: string): boolean {
    const styleAnimators = this._styleAnimators;
    return styleAnimators !== void 0 && styleAnimators[animatorName] !== void 0;
  }

  getStyleAnimator(animatorName: string): StyleAnimator<this, unknown> | null {
    const styleAnimators = this._styleAnimators;
    if (styleAnimators !== void 0) {
      const styleAnimator = styleAnimators[animatorName];
      if (styleAnimator !== void 0) {
        return styleAnimator as StyleAnimator<this, unknown>;
      }
    }
    return null;
  }

  setStyleAnimator(animatorName: string, animator: StyleAnimator<this, unknown> | null): void {
    let styleAnimators = this._styleAnimators;
    if (styleAnimators === void 0) {
      styleAnimators = {};
      this._styleAnimators = styleAnimators;
    }
    if (animator !== null) {
      styleAnimators[animatorName] = animator;
    } else {
      delete styleAnimators[animatorName];
    }
  }

  /** @hidden */
  cancelAnimators(): void {
    super.cancelAnimators();
    this.cancelAttributeAnimators();
    this.cancelStyleAnimators();
  }

  /** @hidden */
  cancelAttributeAnimators(): void {
    const attributeAnimators = this._attributeAnimators;
    if (attributeAnimators !== void 0) {
      for (const animatorName in attributeAnimators) {
        const animator = attributeAnimators[animatorName]!;
        animator.cancel();
      }
    }
  }

  /** @hidden */
  cancelStyleAnimators(): void {
    const styleAnimators = this._styleAnimators;
    if (styleAnimators !== void 0) {
      for (const animatorName in styleAnimators) {
        const animator = styleAnimators[animatorName]!;
        animator.cancel();
      }
    }
  }

  id(): string | null;
  id(value: string | null): this;
  id(value?: string | null): string | null | this {
    if (value === void 0) {
      return this.getAttribute("id");
    } else {
      this.setAttribute("id", value);
      return this;
    }
  }

  className(): string | null;
  className(value: string | null): this;
  className(value?: string | null): string | null | this {
    if (value === void 0) {
      return this.getAttribute("class");
    } else {
      this.setAttribute("class", value);
      return this;
    }
  }

  get classList(): DOMTokenList {
    return this._node.classList;
  }

  hasClass(className: string): boolean {
    return this._node.classList.contains(className);
  }

  addClass(...classNames: string[]): this {
    const classList = this._node.classList;
    for (let i = 0, n = classNames.length; i < n; i += 1) {
      classList.add(classNames[i]);
    }
    return this;
  }

  removeClass(...classNames: string[]): this {
    const classList = this._node.classList;
    for (let i = 0, n = classNames.length; i < n; i += 1) {
      classList.remove(classNames[i]);
    }
    return this;
  }

  toggleClass(className: string, state?: boolean): this {
    const classList = this._node.classList;
    if (state === void 0) {
      classList.toggle(className);
    } else if (state === true) {
      classList.add(className);
    } else if (state === false) {
      classList.remove(className);
    }
    return this;
  }

  get clientBounds(): BoxR2 {
    const bounds = this._node.getBoundingClientRect();
    return new BoxR2(bounds.left, bounds.top, bounds.right, bounds.bottom);
  }

  get pageBounds(): BoxR2 {
    const bounds = this._node.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;
    return new BoxR2(bounds.left + scrollX, bounds.top + scrollY,
                     bounds.right + scrollX, bounds.bottom + scrollY);
  }

  on<T extends keyof ElementEventMap>(type: T, listener: (this: Element, event: ElementEventMap[T]) => unknown,
                                      options?: AddEventListenerOptions | boolean): this;
  on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this;
  on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this {
    this._node.addEventListener(type, listener, options);
    return this;
  }

  off<T extends keyof ElementEventMap>(type: T, listener: (this: Element, event: ElementEventMap[T]) => unknown,
                                       options?: EventListenerOptions | boolean): this;
  off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this;
  off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this {
    this._node.removeEventListener(type, listener, options);
    return this;
  }

  /** @hidden */
  static isConstructor(object: unknown): object is ElementViewConstructor {
    if (typeof object === "function") {
      const viewConstructor = object as ElementViewConstructor;
      return typeof viewConstructor.tag === "string";
    }
    return false;
  }

  /** @hidden */
  static initAttributeAnimator<V extends ElementView, T, U>(
      AttributeAnimator: AttributeAnimatorConstructor<T, U>, view: V,
      animatorName: string, attributeName: string): AttributeAnimator<V, T, U> {
    return new AttributeAnimator<V>(view, animatorName, attributeName);
  }

  /** @hidden */
  static decorateAttributeAnimator<V extends ElementView, T, U>(
      AttributeAnimator: AttributeAnimatorConstructor<T, U>, attributeName: string,
      viewClass: unknown, animatorName: string): void {
    Object.defineProperty(viewClass, animatorName, {
      get: function (this: V): AttributeAnimator<V, T, U> {
        let animator = this.getAttributeAnimator(animatorName) as AttributeAnimator<V, T, U> | null;
        if (animator === null) {
          animator = ElementView.initAttributeAnimator(AttributeAnimator, this, animatorName, attributeName);
          this.setAttributeAnimator(animatorName, animator);
        }
        return animator;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static initStyleAnimator<V extends ElementView, T, U>(
      StyleAnimator: StyleAnimatorConstructor<T, U>, view: V,
      animatorName: string, propertyNames: string | ReadonlyArray<string>): StyleAnimator<V, T, U> {
    return new StyleAnimator<V>(view, animatorName, propertyNames);
  }

  /** @hidden */
  static decorateStyleAnimator<V extends ElementView, T, U>(
      StyleAnimator: StyleAnimatorConstructor<T, U>, propertyNames: string | ReadonlyArray<string>,
      viewClass: unknown, animatorName: string): void {
    Object.defineProperty(viewClass, animatorName, {
      get: function (this: V): StyleAnimator<V, T, U> {
        let animator = this.getStyleAnimator(animatorName) as StyleAnimator<V, T, U> | null;
        if (animator === null) {
          animator = ElementView.initStyleAnimator(StyleAnimator, this, animatorName, propertyNames);
          this.setStyleAnimator(animatorName, animator);
        }
        return animator;
      },
      configurable: true,
      enumerable: true,
    });
  }
}
View.Element = ElementView;
