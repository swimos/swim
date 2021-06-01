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
import {FromAny} from "@swim/util";
import {ViewFactory, View, ViewObserverType} from "@swim/view";
import {NodeView} from "@swim/dom";
import {Component} from "../Component";

export type ComponentViewMemberType<C, K extends keyof C> =
  C[K] extends ComponentView<any, infer V, any> ? V : never;

export type ComponentViewMemberInit<C, K extends keyof C> =
  C[K] extends ComponentView<any, infer V, infer U> ? V | U : never;

export type ComponentViewFlags = number;

export interface ComponentViewInit<V extends View, U = never> {
  extends?: ComponentViewClass;
  key?: string | boolean;
  type?: ViewFactory<V, U>;
  observe?: boolean;

  willSetView?(newView: V | null, oldView: V | null, targetView: View | null): void;
  onSetView?(newView: V | null, oldView: V | null, targetView: View | null): void;
  didSetView?(newView: V | null, oldView: V | null, targetView: View | null): void;

  createView?(): V | U | null;
  insertView?(parentView: View, childView: V, targetView: View | null, key: string | undefined): void;
  fromAny?(value: V | U): V | null;
}

export type ComponentViewDescriptor<C extends Component, V extends View, U = never, I = {}> = ComponentViewInit<V, U> & ThisType<ComponentView<C, V, U> & I> & Partial<I>;

export interface ComponentViewConstructor<C extends Component, V extends View, U = never, I = {}> {
  new<O extends C>(owner: O, key: string | undefined, fastenerName: string | undefined): ComponentView<O, V, U> & I;
  prototype: Omit<ComponentView<any, any>, "key"> & {key?: string | boolean} & I;
}

export interface ComponentViewClass extends Function {
  readonly prototype: Omit<ComponentView<any, any>, "key"> & {key?: string | boolean};
}

export interface ComponentView<C extends Component, V extends View, U = never> {
  (): V | null;
  (view: V | U | null, targetView?: View | null): C;

  readonly name: string;

  readonly owner: C;

  /** @hidden */
  fastenerFlags: ComponentViewFlags;

  /** @hidden */
  setFastenerFlags(fastenerFlags: ComponentViewFlags): void;

  readonly key: string | undefined;

  readonly view: V | null;

  getView(): V;

  setView(newView: V | U | null, targetView?: View | null): V | null;

  /** @hidden */
  attachView(newView: V): void;

  /** @hidden */
  detachView(oldView: V): void;

  /** @hidden */
  willSetView(newView: V | null, oldView: V | null, targetView: View | null): void;

  /** @hidden */
  onSetView(newView: V | null, oldView: V | null, targetView: View | null): void;

  /** @hidden */
  didSetView(newView: V | null, oldView: V | null, targetView: View | null): void;

  injectView(parentView: View, childView?: V | U | null, targetView?: View | null, key?: string | null): V | null;

  createView(): V | U | null;

  /** @hidden */
  insertView(parentView: View, childView: V, targetView: View | null, key: string | undefined): void;

  removeView(): V | null;

  /** @hidden */
  observe?: boolean;

  /** @hidden */
  readonly type?: ViewFactory<V>;

  fromAny(value: V | U): V | null;

  isMounted(): boolean;

  /** @hidden */
  mount(): void;

  /** @hidden */
  willMount(): void;

  /** @hidden */
  onMount(): void;

  /** @hidden */
  didMount(): void;

  /** @hidden */
  unmount(): void;

  /** @hidden */
  willUnmount(): void;

  /** @hidden */
  onUnmount(): void;

  /** @hidden */
  didUnmount(): void;
}

export const ComponentView = function <C extends Component, V extends View = View, U = never>(
    this: ComponentView<C, V, U> | typeof ComponentView,
    owner: C | ComponentViewDescriptor<C, V, U>,
    key?: string,
    fastenerName?: string,
  ): ComponentView<C, V, U> | PropertyDecorator {
  if (this instanceof ComponentView) { // constructor
    return ComponentViewConstructor.call(this as unknown as ComponentView<Component, View, unknown>, owner as C, key, fastenerName);
  } else { // decorator factory
    return ComponentViewDecoratorFactory(owner as ComponentViewDescriptor<C, V, U>);
  }
} as {
  /** @hidden */
  new<C extends Component, V extends View, U = never>(owner: C, key: string | undefined, fastenerName: string | undefined): ComponentView<C, V, U>;

  <C extends Component, V extends View = View, U = never, I = {}>(descriptor: {observe: boolean} & ComponentViewDescriptor<C, V, U, I & ViewObserverType<V>>): PropertyDecorator;
  <C extends Component, V extends View = View, U = never, I = {}>(descriptor: ComponentViewDescriptor<C, V, U, I>): PropertyDecorator;

  /** @hidden */
  prototype: ComponentView<any, any>;

  define<C extends Component, V extends View = View, U = never, I = {}>(descriptor: {observe: boolean} & ComponentViewDescriptor<C, V, U, I & ViewObserverType<V>>): ComponentViewConstructor<C, V, U, I>;
  define<C extends Component, V extends View = View, U = never, I = {}>(descriptor: ComponentViewDescriptor<C, V, U, I>): ComponentViewConstructor<C, V, U, I>;

  /** @hidden */
  MountedFlag: ComponentViewFlags;
};
__extends(ComponentView, Object);

function ComponentViewConstructor<C extends Component, V extends View, U>(this: ComponentView<C, V, U>, owner: C, key: string | undefined, fastenerName: string | undefined): ComponentView<C, V, U> {
  if (fastenerName !== void 0) {
    Object.defineProperty(this, "name", {
      value: fastenerName,
      enumerable: true,
      configurable: true,
    });
  }
  Object.defineProperty(this, "owner", {
    value: owner,
    enumerable: true,
  });
  Object.defineProperty(this, "fastenerFlags", {
    value: 0,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "key", {
    value: key,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "view", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  return this;
}

function ComponentViewDecoratorFactory<C extends Component, V extends View, U>(descriptor: ComponentViewDescriptor<C, V, U>): PropertyDecorator {
  return Component.decorateComponentView.bind(Component, ComponentView.define(descriptor as ComponentViewDescriptor<Component, View>));
}

ComponentView.prototype.setFastenerFlags = function (this: ComponentView<Component, View>, fastenerFlags: ComponentViewFlags): void {
  Object.defineProperty(this, "fastenerFlags", {
    value: fastenerFlags,
    enumerable: true,
    configurable: true,
  });
};

ComponentView.prototype.getView = function <V extends View>(this: ComponentView<Component, V>): V {
  const view = this.view;
  if (view === null) {
    throw new TypeError("null " + this.name + " view");
  }
  return view;
};

ComponentView.prototype.setView = function <V extends View>(this: ComponentView<Component, V>, newView: V | null, targetView?: View | null): V | null {
  if (newView instanceof NodeView && newView.isMounted() ||
      newView instanceof Node && NodeView.isNodeMounted(newView) && NodeView.isRootView(newView)) {
    this.owner.mount();
  }
  const oldView = this.view;
  if (newView !== null) {
    newView = this.fromAny(newView);
  }
  if (oldView !== newView) {
    if (targetView === void 0) {
      targetView = null;
    }
    this.willSetView(newView, oldView, targetView);
    if (oldView !== null) {
      this.detachView(oldView);
    }
    Object.defineProperty(this, "view", {
      value: newView,
      enumerable: true,
      configurable: true,
    });
    if (newView !== null) {
      this.attachView(newView);
    }
    this.onSetView(newView, oldView, targetView);
    this.didSetView(newView, oldView, targetView);
  }
  return oldView;
};

ComponentView.prototype.attachView = function <V extends View>(this: ComponentView<Component, V>, newView: V): void {
  if (this.observe === true) {
    newView.addViewObserver(this as ViewObserverType<V>);
  }
};

ComponentView.prototype.detachView = function <V extends View>(this: ComponentView<Component, V>, oldView: V): void {
  if (this.observe === true) {
    oldView.removeViewObserver(this as ViewObserverType<V>);
  }
};

ComponentView.prototype.willSetView = function <V extends View>(this: ComponentView<Component, V>, newView: V | null, oldView: V | null, targetView: View | null): void {
  // hook
};

ComponentView.prototype.onSetView = function <V extends View>(this: ComponentView<Component, V>, newView: V | null, oldView: V | null, targetView: View | null): void {
  // hook
};

ComponentView.prototype.didSetView = function <V extends View>(this: ComponentView<Component, V>, newView: V | null, oldView: V | null, targetView: View | null): void {
  // hook
};

ComponentView.prototype.injectView = function <V extends View>(this: ComponentView<Component, V>, parentView: View, childView?: V | null, targetView?: View | null, key?: string | null): V | null {
  if (targetView === void 0) {
    targetView = null;
  }
  if (childView === void 0 || childView === null) {
    childView = this.view;
    if (childView === null) {
      childView = this.createView();
    }
  } else {
    childView = this.fromAny(childView);
    if (childView !== null) {
      this.setView(childView, targetView);
    }
  }
  if (childView !== null) {
    if (key === void 0) {
      key = this.key;
    } else if (key === null) {
      key = void 0;
    }
    if (childView.parentView !== parentView || childView.key !== key) {
      this.insertView(parentView, childView, targetView, key);
    }
    if (this.view === null) {
      this.setView(childView, targetView);
    }
  }
  return childView;
};

ComponentView.prototype.createView = function <V extends View, U>(this: ComponentView<Component, V, U>): V | U | null {
  const type = this.type;
  if (type !== void 0) {
    return type.create();
  }
  return null;
};

ComponentView.prototype.insertView = function <V extends View>(this: ComponentView<Component, V>, parentView: View, childView: V, targetView: View | null, key: string | undefined): void {
  parentView.insertChildView(childView, targetView, key);
}

ComponentView.prototype.removeView = function <V extends View>(this: ComponentView<Component, V>): V | null {
  const childView = this.view;
  if (childView !== null) {
    childView.remove();
  }
  return childView;
};

ComponentView.prototype.fromAny = function <V extends View, U>(this: ComponentView<Component, V, U>, value: V | U): V | null {
  const type = this.type;
  if (FromAny.is<V, U>(type)) {
    return type.fromAny(value);
  } else if (value instanceof View) {
    return value;
  }
  return null;
};

ComponentView.prototype.isMounted = function (this: ComponentView<Component, View>): boolean {
  return (this.fastenerFlags & ComponentView.MountedFlag) !== 0;
};

ComponentView.prototype.mount = function (this: ComponentView<Component, View>): void {
  if ((this.fastenerFlags & ComponentView.MountedFlag) === 0) {
    this.willMount();
    this.setFastenerFlags(this.fastenerFlags | ComponentView.MountedFlag);
    this.onMount();
    this.didMount();
  }
};

ComponentView.prototype.willMount = function (this: ComponentView<Component, View>): void {
  // hook
};

ComponentView.prototype.onMount = function (this: ComponentView<Component, View>): void {
  // hook
};

ComponentView.prototype.didMount = function (this: ComponentView<Component, View>): void {
  // hook
};

ComponentView.prototype.unmount = function (this: ComponentView<Component, View>): void {
  if ((this.fastenerFlags & ComponentView.MountedFlag) !== 0) {
    this.willUnmount();
    this.setFastenerFlags(this.fastenerFlags & ~ComponentView.MountedFlag);
    this.onUnmount();
    this.didUnmount();
  }
};

ComponentView.prototype.willUnmount = function (this: ComponentView<Component, View>): void {
  // hook
};

ComponentView.prototype.onUnmount = function (this: ComponentView<Component, View>): void {
  // hook
};

ComponentView.prototype.didUnmount = function (this: ComponentView<Component, View>): void {
  // hook
};

ComponentView.define = function <C extends Component, V extends View, U, I>(descriptor: ComponentViewDescriptor<C, V, U, I>): ComponentViewConstructor<C, V, U, I> {
  let _super = descriptor.extends;
  delete descriptor.extends;

  if (_super === void 0) {
    _super = ComponentView;
  }

  const _constructor = function DecoratedComponentView(this: ComponentView<C, V, U>, owner: C, key: string | undefined, fastenerName: string | undefined): ComponentView<C, V, U> {
    let _this: ComponentView<C, V, U> = function ComponentViewAccessor(view?: V | U | null, targetView?: View | null): V | null | C {
      if (view === void 0) {
        return _this.view;
      } else {
        _this.setView(view, targetView);
        return _this.owner;
      }
    } as ComponentView<C, V, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, key, fastenerName) || _this;
    return _this;
  } as unknown as ComponentViewConstructor<C, V, U, I>;

  const _prototype = descriptor as unknown as ComponentView<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};

ComponentView.MountedFlag = 1 << 0;
