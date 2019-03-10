// Copyright 2015-2019 SWIM.AI inc.
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
import {AttributeAnimatorClass, AttributeAnimator} from "./attribute/AttributeAnimator";
import {StyleAnimatorClass, StyleAnimator} from "./style/StyleAnimator";
import {View} from "./View";
import {NodeView} from "./NodeView";
import {ElementViewObserver} from "./ElementViewObserver";
import {ElementViewController} from "./ElementViewController";

export interface ViewElement extends StyledElement {
  view?: ElementView;
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

  elemId(value: string): this {
    this._node.setAttribute('id', AttributeString(value));
    return this;
  }

  className(value?: string): this | DOMTokenList {
    if(value === undefined) { return this._node.classList; }
    this._node.setAttribute('class', AttributeString(value));
    return this;
  }

  addClass(value: string): this {
    this._node.classList.add(AttributeString(value));
    return this;
  }

  removeClass(value: string): this {
    this._node.classList.remove(AttributeString(value));
    return this;
  }

  setAttribute(name: string, value: unknown): this {
    this.willSetAttribute(name, value);
    this._node.setAttribute(name, AttributeString(value));
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
    this._node.style.setProperty(name, StyleString(value), priority);
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
  static decorateAttributeAnimator<V extends ElementView, T, U>(AttributeAnimator: AttributeAnimatorClass,
                                                                name: string, target: unknown, key: string): void {
    Object.defineProperty(target, key, {
      get: function (this: V): AttributeAnimator<V, T, U> {
        const animator = new AttributeAnimator<V, T, U>(this, name);
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
  static decorateStyleAnimator<V extends ElementView, T, U>(StyleAnimator: StyleAnimatorClass,
                                                            names: string | ReadonlyArray<string>,
                                                            target: unknown, key: string): void {
    Object.defineProperty(target, key, {
      get: function (this: V): StyleAnimator<V, T, U> {
        const animator = new StyleAnimator<V, T, U>(this, names);
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
