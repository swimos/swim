// Copyright 2015-2020 SWIM.AI inc.
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
import {AttributeAnimatorConstructor, AttributeAnimator} from "./attribute/AttributeAnimator";
import {StyleAnimatorConstructor, StyleAnimator} from "./style/StyleAnimator";
import {View} from "./View";
import {NodeView} from "./NodeView";
import {ElementViewObserver} from "./ElementViewObserver";
import {ElementViewController} from "./ElementViewController";

export interface ViewElement extends StyledElement {
  view?: ElementView;
}

export interface ElementViewClass<E extends Element, V extends ElementView> {
  new(node: E): V;

  tag: string;
  NS?: string;
}

export class ElementView extends NodeView {
  /** @hidden */
  readonly _node: ViewElement;
  /** @hidden */
  _viewController: ElementViewController | null;

  constructor(node: Element, key: string | null = null) {
    super(node, key);
  }

  get node(): ViewElement {
    return this._node;
  }

  protected initNode(node: ViewElement): void {
    // stub
  }

  get viewController(): ElementViewController | null {
    return this._viewController;
  }

  getAttribute(name: string): string | null {
    return this._node.getAttribute(name);
  }

  setAttribute(name: string, value: unknown): this {
    this.willSetAttribute(name, value);
    if (value !== null) {
      this._node.setAttribute(name, AttributeString(value));
    } else {
      this._node.removeAttribute(name);
    }
    this.onSetAttribute(name, value);
    this.didSetAttribute(name, value);
    return this;
  }

  protected willSetAttribute(name: string, value: unknown): void {
    this.willObserve(function (viewObserver: ElementViewObserver): void {
      if (viewObserver.viewWillSetAttribute) {
        viewObserver.viewWillSetAttribute(name, value, this);
      }
    });
  }

  protected onSetAttribute(name: string, value: unknown): void {
    // hook
  }

  protected didSetAttribute(name: string, value: unknown): void {
    this.didObserve(function (viewObserver: ElementViewObserver): void {
      if (viewObserver.viewDidSetAttribute) {
        viewObserver.viewDidSetAttribute(name, value, this);
      }
    });
  }

  setStyle(name: string, value: unknown, priority?: string): this {
    this.willSetStyle(name, value, priority);
    if (value !== null) {
      this._node.style.setProperty(name, StyleString(value), priority);
    } else {
      this._node.style.removeProperty(name);
    }
    this.onSetStyle(name, value, priority);
    this.didSetStyle(name, value, priority);
    return this;
  }

  protected willSetStyle(name: string, value: unknown, priority: string | undefined): void {
    this.willObserve(function (viewObserver: ElementViewObserver): void {
      if (viewObserver.viewWillSetStyle) {
        viewObserver.viewWillSetStyle(name, value, priority, this);
      }
    });
  }

  protected onSetStyle(name: string, value: unknown, priority: string | undefined): void {
    // hook
  }

  protected didSetStyle(name: string, value: unknown, priority: string | undefined): void {
    this.didObserve(function (viewObserver: ElementViewObserver): void {
      if (viewObserver.viewDidSetStyle) {
        viewObserver.viewDidSetStyle(name, value, priority, this);
      }
    });
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

  on<K extends keyof ElementEventMap>(type: K, listener: (this: Element, event: ElementEventMap[K]) => unknown, options?: AddEventListenerOptions | boolean): this;
  on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this;
  on(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): this {
    this._node.addEventListener(type, listener, options);
    return this;
  }

  off<K extends keyof ElementEventMap>(type: K, listener: (this: Element, event: ElementEventMap[K]) => unknown, options?: EventListenerOptions | boolean): this;
  off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this;
  off(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): this {
    this._node.removeEventListener(type, listener, options);
    return this;
  }

  /** @hidden */
  static decorateAttributeAnimator<V extends ElementView, T, U>(AttributeAnimator: AttributeAnimatorConstructor,
                                                                name: string, target: unknown, key: string): void {
    Object.defineProperty(target, key, {
      get: function (this: V): AttributeAnimator<V, T, U> {
        const animator = new AttributeAnimator<V, T, U>(this, name);
        Object.defineProperty(animator, "name", {
          value: key,
          enumerable: true,
          configurable: true,
        });
        Object.defineProperty(this, key, {
          value: animator,
          configurable: true,
          enumerable: true,
        });
        return animator;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static decorateStyleAnimator<V extends ElementView, T, U>(StyleAnimator: StyleAnimatorConstructor,
                                                            names: string | ReadonlyArray<string>,
                                                            target: unknown, key: string): void {
    Object.defineProperty(target, key, {
      get: function (this: V): StyleAnimator<V, T, U> {
        const animator = new StyleAnimator<V, T, U>(this, names);
        Object.defineProperty(animator, "name", {
          value: key,
          enumerable: true,
          configurable: true,
        });
        Object.defineProperty(this, key, {
          value: animator,
          configurable: true,
          enumerable: true,
        });
        return animator;
      },
      configurable: true,
      enumerable: true,
    });
  }
}
View.Element = ElementView;
