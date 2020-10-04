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

import {__extends} from "tslib";
import {FromAny} from "@swim/util";
import {ViewConstructor, View, ViewObserverType, NodeView} from "@swim/view";
import {Component} from "../Component";
import {ComponentViewObserver} from "./ComponentViewObserver";

export type ComponentViewMemberType<C, K extends keyof C> =
  C extends {[P in K]: ComponentView<any, infer V, any>} ? V : unknown;

export type ComponentViewMemberInit<V, K extends keyof V> =
  V extends {[P in K]: ComponentView<any, infer V, infer U>} ? V | U : unknown;

export interface ComponentViewInit<V extends View, U = V> {
  extends?: ComponentViewPrototype;
  observe?: boolean;
  type?: unknown;
  tag?: string;

  willSetView?(newView: V | null, oldView: V | null): void;
  onSetView?(newView: V | null, oldView: V | null): void;
  didSetView?(newView: V | null, oldView: V | null): void;
  createView?(): V | U | null;
  fromAny?(value: V | U): V | null;
}

export type ComponentViewDescriptorInit<C extends Component, V extends View, U = V, I = ViewObserverType<V>> = ComponentViewInit<V, U> & ThisType<ComponentView<C, V, U> & I> & I;

export type ComponentViewDescriptorExtends<C extends Component, V extends View, U = V, I = ViewObserverType<V>> = {extends: ComponentViewPrototype | undefined} & ComponentViewDescriptorInit<C, V, U, I>;

export type ComponentViewDescriptorFromAny<C extends Component, V extends View, U = V, I = ViewObserverType<V>> = ({type: FromAny<V, U>} | {fromAny(value: V | U): V | null}) & ComponentViewDescriptorInit<C, V, U, I>;

export type ComponentViewDescriptor<C extends Component, V extends View, U = V, I = ViewObserverType<V>> =
  U extends V ? ComponentViewDescriptorInit<C, V, U, I> :
  ComponentViewDescriptorFromAny<C, V, U, I>;

export type ComponentViewPrototype = Function & {prototype: ComponentView<any, any>};

export type ComponentViewConstructor<C extends Component, V extends View, U = V, I = ViewObserverType<V>> = {
  new(component: C, viewName: string | undefined): ComponentView<C, V, U> & I;
  prototype: ComponentView<any, any, any> & I;
};

export declare abstract class ComponentView<C extends Component, V extends View, U = V> {
  /** @hidden */
  _component: C;
  /** @hidden */
  _view: V | null;
  /** @hidden */
  _auto: boolean;

  constructor(component: C, viewName: string | undefined);

  /** @hidden */
  readonly type?: unknown;

  readonly tag?: string;

  get name(): string;

  get component(): C;

  get view(): V | null;

  isAuto(): boolean;

  setAuto(auto: boolean): void;

  getView(): V;

  setView(newView: V | U | null): void;

  /** @hidden */
  willSetView(newView: V | null, oldView: V | null): void;

  /** @hidden */
  onSetView(newView: V | null, oldView: V | null): void;

  /** @hidden */
  didSetView(newView: V | null, oldView: V | null): void;

  setAutoView(view: V | U | null): void;

  /** @hidden */
  setOwnView(view: V | U | null): void;

  /** @hidden */
  willSetOwnView(newView: V | null, oldView: V | null): void;

  /** @hidden */
  onSetOwnView(newView: V | null, oldView: V | null): void;

  /** @hidden */
  didSetOwnView(newView: V | null, oldView: V | null): void;

  /** @hidden */
  mount(): void;

  /** @hidden */
  unmount(): void;

  insert(parentView: View, key?: string): V | null;

  remove(): V | null;

  createView(): V | U | null;

  fromAny(value: V | U): V | null;

  static define<C extends Component, V extends View = View, U = V, I = ViewObserverType<V>>(descriptor: ComponentViewDescriptorExtends<C, V, U, I>): ComponentViewConstructor<C, V, U, I>;
  static define<C extends Component, V extends View = View, U = V>(descriptor: ComponentViewDescriptor<C, V, U>): ComponentViewConstructor<C, V, U>;

  // Forward type declarations
  /** @hidden */
  static Observer: typeof ComponentViewObserver; // defined by ComponentViewObserver
}

export interface ComponentView<C extends Component, V extends View, U = V> {
  (): V | null;
  (view: V | U | null): C;
}

export function ComponentView<C extends Component, V extends View = View, U = V, I = ViewObserverType<V>>(descriptor: ComponentViewDescriptorExtends<C, V, U, I>): PropertyDecorator;
export function ComponentView<C extends Component, V extends View = View, U = V>(descriptor: ComponentViewDescriptor<C, V, U>): PropertyDecorator;

export function ComponentView<C extends Component, V extends View = View, U = V>(
    this: ComponentView<C, V, U> | typeof ComponentView,
    component: C | ComponentViewDescriptor<C, V, U>,
    viewName?: string,
  ): ComponentView<C, V, U> | PropertyDecorator {
  if (this instanceof ComponentView) { // constructor
    return ComponentViewConstructor.call(this, component as C, viewName);
  } else { // decorator factory
    return ComponentViewDecoratorFactory(component as ComponentViewDescriptor<C, V, U>);
  }
}
__extends(ComponentView, Object);
Component.View = ComponentView;

function ComponentViewConstructor<C extends Component, V extends View, U = V>(this: ComponentView<C, V, U>, component: C, viewName: string | undefined): ComponentView<C, V, U> {
  if (viewName !== void 0) {
    Object.defineProperty(this, "name", {
      value: viewName,
      enumerable: true,
      configurable: true,
    });
  }
  this._component = component;
  this._view = null;
  this._auto = true;
  return this;
}

function ComponentViewDecoratorFactory<C extends Component, V extends View, U = V>(descriptor: ComponentViewDescriptor<C, V, U>): PropertyDecorator {
  return Component.decorateComponentView.bind(Component, ComponentView.define(descriptor));
}

Object.defineProperty(ComponentView.prototype, "component", {
  get: function <C extends Component>(this: ComponentView<C, View>): C {
    return this._component;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ComponentView.prototype, "view", {
  get: function <V extends View>(this: ComponentView<Component, V>): V | null {
    return this._view;
  },
  enumerable: true,
  configurable: true,
});

ComponentView.prototype.isAuto = function (this: ComponentView<Component, View>): boolean {
  return this._auto;
};

ComponentView.prototype.setAuto = function (this: ComponentView<Component, View>,
                                            auto: boolean): void {
  this._auto = auto;
};

ComponentView.prototype.getView = function <V extends View>(this: ComponentView<Component, V>): V {
  const view = this.view;
  if (view === null) {
    throw new TypeError("null " + this.name + " view");
  }
  return view;
};

ComponentView.prototype.setView = function <V extends View, U>(this: ComponentView<Component, V, U>,
                                                               view: V | U | null): void {
  this._auto = false;
  this.setOwnView(view);
};

ComponentView.prototype.willSetView = function <V extends View>(this: ComponentView<Component, V>,
                                                                newView: V | null,
                                                                oldView: V | null): void {
  // hook
};

ComponentView.prototype.onSetView = function <V extends View>(this: ComponentView<Component, V>,
                                                              newView: V | null,
                                                              oldView: V | null): void {
  // hook
};

ComponentView.prototype.didSetView = function <V extends View>(this: ComponentView<Component, V>,
                                                               newView: V | null,
                                                               oldView: V | null): void {
  // hook
};

ComponentView.prototype.setAutoView = function <V extends View, U>(this: ComponentView<Component, V, U>,
                                                                   view: V | U | null): void {
  if (this._auto === true) {
    this.setOwnView(view);
  }
};

ComponentView.prototype.setOwnView = function <V extends View, U>(this: ComponentView<Component, V, U>,
                                                                  newView: V | U | null): void {
  if (newView instanceof NodeView && newView.isMounted() ||
      newView instanceof Node && NodeView.isNodeMounted(newView) && NodeView.isRootView(newView)) {
    this._component.mount();
  }
  const oldView = this._view;
  if (newView !== null) {
    newView = this.fromAny(newView);
  }
  if (oldView !== newView) {
    this.willSetOwnView(newView as V | null, oldView);
    this.willSetView(newView as V | null, oldView);
    this._view = newView as V | null;
    this.onSetOwnView(newView as V | null, oldView);
    this.onSetView(newView as V | null, oldView);
    this.didSetView(newView as V | null, oldView);
    this.didSetOwnView(newView as V | null, oldView);
  }
};

ComponentView.prototype.willSetOwnView = function <V extends View>(this: ComponentView<Component, V>,
                                                                   newView: V | null,
                                                                   oldView: V | null): void {
  this._component.willSetComponentView(this, newView, oldView);
};

ComponentView.prototype.onSetOwnView = function <V extends View>(this: ComponentView<Component, V>,
                                                                 newView: V | null,
                                                                 oldView: V | null): void {
  this._component.onSetComponentView(this, newView, oldView);
};

ComponentView.prototype.didSetOwnView = function <V extends View>(this: ComponentView<Component, V>,
                                                                  newView: V | null,
                                                                  oldView: V | null): void {
  this._component.didSetComponentView(this, newView, oldView);
};

ComponentView.prototype.mount = function (this: ComponentView<Component, View>): void {
  // hook
};

ComponentView.prototype.unmount = function (this: ComponentView<Component, View>): void {
  // hook
};

ComponentView.prototype.insert = function <V extends View>(this: ComponentView<Component, V>,
                                                           parentView: View, key?: string): V | null {
  let view = this._view;
  if (view === null) {
    view = this.createView();
  }
  if (view !== null) {
    if (view.parentView !== parentView) {
      if (key !== void 0) {
        parentView.setChildView(key, view);
      } else {
        parentView.appendChildView(view);
      }
    }
    if (this._view === null) {
      this.setView(view);
    }
  }
  return view;
};

ComponentView.prototype.remove = function <V extends View>(this: ComponentView<Component, V>): V | null {
  const view = this._view;
  if (view !== null) {
    view.remove();
  }
  return view;
};

ComponentView.prototype.createView = function <V extends View, U>(this: ComponentView<Component, V, U>): V | U | null {
  const type = this.type;
  if (typeof type === "function" && type.prototype instanceof View) {
    if (this.tag !== void 0) {
      return (type as typeof NodeView).fromTag(this.tag as string) as unknown as V;
    } else {
      return View.create(type as ViewConstructor) as V;
    }
  }
  return null;
};

ComponentView.prototype.fromAny = function <V extends View, U>(this: ComponentView<Component, V, U>,
                                                               value: V | U): V | null {
  if (value instanceof Node) {
    const type = this.type;
    if (typeof type === "function" && type.prototype instanceof NodeView) {
      return (type as typeof NodeView).fromNode(value) as unknown as V;
    } else {
      return View.fromNode(value) as unknown as V;
    }
  }
  return value as V | null;
};

ComponentView.define = function <C extends Component, V extends View, U, I>(descriptor: ComponentViewDescriptor<C, V, U, I>): ComponentViewConstructor<C, V, U, I> {
  let _super = descriptor.extends;
  delete descriptor.extends;

  if (_super === void 0) {
    if (descriptor.observe !== false) {
      _super = ComponentView.Observer;
    } else {
      _super = ComponentView;
    }
  }

  const _constructor = function ComponentViewAccessor(this: ComponentView<C, V, U>, component: C, viewName: string | undefined): ComponentView<C, V, U> {
    let _this: ComponentView<C, V, U> = function accessor(view?: V | null): V | null | C {
      if (view === void 0) {
        return _this._view;
      } else {
        _this.setView(view);
        return _this._component;
      }
    } as ComponentView<C, V, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, component, viewName) || _this;
    return _this;
  } as unknown as ComponentViewConstructor<C, V, U, I>;

  const _prototype = descriptor as unknown as ComponentView<C, V, U> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};
