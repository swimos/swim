// Copyright 2015-2021 Swim Inc.
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
import {Controller} from "../Controller";

export type ControllerViewMemberType<C, K extends keyof C> =
  C[K] extends ControllerView<any, infer V, any> ? V : never;

export type ControllerViewMemberInit<C, K extends keyof C> =
  C[K] extends ControllerView<any, infer V, infer U> ? V | U : never;

export type ControllerViewFlags = number;

export interface ControllerViewInit<V extends View, U = never> {
  extends?: ControllerViewClass;
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

export type ControllerViewDescriptor<C extends Controller, V extends View, U = never, I = {}> = ControllerViewInit<V, U> & ThisType<ControllerView<C, V, U> & I> & Partial<I>;

export interface ControllerViewConstructor<C extends Controller, V extends View, U = never, I = {}> {
  new<O extends C>(owner: O, key: string | undefined, fastenerName: string | undefined): ControllerView<O, V, U> & I;
  prototype: Omit<ControllerView<any, any>, "key"> & {key?: string | boolean} & I;
}

export interface ControllerViewClass extends Function {
  readonly prototype: Omit<ControllerView<any, any>, "key"> & {key?: string | boolean};
}

export interface ControllerView<C extends Controller, V extends View, U = never> {
  (): V | null;
  (view: V | U | null, targetView?: View | null): C;

  readonly name: string;

  readonly owner: C;

  /** @hidden */
  fastenerFlags: ControllerViewFlags;

  /** @hidden */
  setFastenerFlags(fastenerFlags: ControllerViewFlags): void;

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

export const ControllerView = function <C extends Controller, V extends View = View, U = never>(
    this: ControllerView<C, V, U> | typeof ControllerView,
    owner: C | ControllerViewDescriptor<C, V, U>,
    key?: string,
    fastenerName?: string,
  ): ControllerView<C, V, U> | PropertyDecorator {
  if (this instanceof ControllerView) { // constructor
    return ControllerViewConstructor.call(this as unknown as ControllerView<Controller, View, unknown>, owner as C, key, fastenerName);
  } else { // decorator factory
    return ControllerViewDecoratorFactory(owner as ControllerViewDescriptor<C, V, U>);
  }
} as {
  /** @hidden */
  new<C extends Controller, V extends View, U = never>(owner: C, key: string | undefined, fastenerName: string | undefined): ControllerView<C, V, U>;

  <C extends Controller, V extends View = View, U = never, I = {}>(descriptor: {observe: boolean} & ControllerViewDescriptor<C, V, U, I & ViewObserverType<V>>): PropertyDecorator;
  <C extends Controller, V extends View = View, U = never, I = {}>(descriptor: ControllerViewDescriptor<C, V, U, I>): PropertyDecorator;

  /** @hidden */
  prototype: ControllerView<any, any>;

  define<C extends Controller, V extends View = View, U = never, I = {}>(descriptor: {observe: boolean} & ControllerViewDescriptor<C, V, U, I & ViewObserverType<V>>): ControllerViewConstructor<C, V, U, I>;
  define<C extends Controller, V extends View = View, U = never, I = {}>(descriptor: ControllerViewDescriptor<C, V, U, I>): ControllerViewConstructor<C, V, U, I>;

  /** @hidden */
  MountedFlag: ControllerViewFlags;
};
__extends(ControllerView, Object);

function ControllerViewConstructor<C extends Controller, V extends View, U>(this: ControllerView<C, V, U>, owner: C, key: string | undefined, fastenerName: string | undefined): ControllerView<C, V, U> {
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

function ControllerViewDecoratorFactory<C extends Controller, V extends View, U>(descriptor: ControllerViewDescriptor<C, V, U>): PropertyDecorator {
  return Controller.decorateControllerView.bind(Controller, ControllerView.define(descriptor as ControllerViewDescriptor<Controller, View>));
}

ControllerView.prototype.setFastenerFlags = function (this: ControllerView<Controller, View>, fastenerFlags: ControllerViewFlags): void {
  Object.defineProperty(this, "fastenerFlags", {
    value: fastenerFlags,
    enumerable: true,
    configurable: true,
  });
};

ControllerView.prototype.getView = function <V extends View>(this: ControllerView<Controller, V>): V {
  const view = this.view;
  if (view === null) {
    throw new TypeError("null " + this.name + " view");
  }
  return view;
};

ControllerView.prototype.setView = function <V extends View>(this: ControllerView<Controller, V>, newView: V | null, targetView?: View | null): V | null {
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

ControllerView.prototype.attachView = function <V extends View>(this: ControllerView<Controller, V>, newView: V): void {
  if (this.observe === true) {
    newView.addViewObserver(this as ViewObserverType<V>);
  }
};

ControllerView.prototype.detachView = function <V extends View>(this: ControllerView<Controller, V>, oldView: V): void {
  if (this.observe === true) {
    oldView.removeViewObserver(this as ViewObserverType<V>);
  }
};

ControllerView.prototype.willSetView = function <V extends View>(this: ControllerView<Controller, V>, newView: V | null, oldView: V | null, targetView: View | null): void {
  // hook
};

ControllerView.prototype.onSetView = function <V extends View>(this: ControllerView<Controller, V>, newView: V | null, oldView: V | null, targetView: View | null): void {
  // hook
};

ControllerView.prototype.didSetView = function <V extends View>(this: ControllerView<Controller, V>, newView: V | null, oldView: V | null, targetView: View | null): void {
  // hook
};

ControllerView.prototype.injectView = function <V extends View>(this: ControllerView<Controller, V>, parentView: View, childView?: V | null, targetView?: View | null, key?: string | null): V | null {
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

ControllerView.prototype.createView = function <V extends View, U>(this: ControllerView<Controller, V, U>): V | U | null {
  const type = this.type;
  if (type !== void 0) {
    return type.create();
  }
  return null;
};

ControllerView.prototype.insertView = function <V extends View>(this: ControllerView<Controller, V>, parentView: View, childView: V, targetView: View | null, key: string | undefined): void {
  parentView.insertChildView(childView, targetView, key);
}

ControllerView.prototype.removeView = function <V extends View>(this: ControllerView<Controller, V>): V | null {
  const childView = this.view;
  if (childView !== null) {
    childView.remove();
  }
  return childView;
};

ControllerView.prototype.fromAny = function <V extends View, U>(this: ControllerView<Controller, V, U>, value: V | U): V | null {
  const type = this.type;
  if (FromAny.is<V, U>(type)) {
    return type.fromAny(value);
  } else if (value instanceof View) {
    return value;
  }
  return null;
};

ControllerView.prototype.isMounted = function (this: ControllerView<Controller, View>): boolean {
  return (this.fastenerFlags & ControllerView.MountedFlag) !== 0;
};

ControllerView.prototype.mount = function (this: ControllerView<Controller, View>): void {
  if ((this.fastenerFlags & ControllerView.MountedFlag) === 0) {
    this.willMount();
    this.setFastenerFlags(this.fastenerFlags | ControllerView.MountedFlag);
    this.onMount();
    this.didMount();
  }
};

ControllerView.prototype.willMount = function (this: ControllerView<Controller, View>): void {
  // hook
};

ControllerView.prototype.onMount = function (this: ControllerView<Controller, View>): void {
  // hook
};

ControllerView.prototype.didMount = function (this: ControllerView<Controller, View>): void {
  // hook
};

ControllerView.prototype.unmount = function (this: ControllerView<Controller, View>): void {
  if ((this.fastenerFlags & ControllerView.MountedFlag) !== 0) {
    this.willUnmount();
    this.setFastenerFlags(this.fastenerFlags & ~ControllerView.MountedFlag);
    this.onUnmount();
    this.didUnmount();
  }
};

ControllerView.prototype.willUnmount = function (this: ControllerView<Controller, View>): void {
  // hook
};

ControllerView.prototype.onUnmount = function (this: ControllerView<Controller, View>): void {
  // hook
};

ControllerView.prototype.didUnmount = function (this: ControllerView<Controller, View>): void {
  // hook
};

ControllerView.define = function <C extends Controller, V extends View, U, I>(descriptor: ControllerViewDescriptor<C, V, U, I>): ControllerViewConstructor<C, V, U, I> {
  let _super = descriptor.extends;
  delete descriptor.extends;

  if (_super === void 0) {
    _super = ControllerView;
  }

  const _constructor = function DecoratedControllerView(this: ControllerView<C, V, U>, owner: C, key: string | undefined, fastenerName: string | undefined): ControllerView<C, V, U> {
    let _this: ControllerView<C, V, U> = function ControllerViewAccessor(view?: V | U | null, targetView?: View | null): V | null | C {
      if (view === void 0) {
        return _this.view;
      } else {
        _this.setView(view, targetView);
        return _this.owner;
      }
    } as ControllerView<C, V, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, key, fastenerName) || _this;
    return _this;
  } as unknown as ControllerViewConstructor<C, V, U, I>;

  const _prototype = descriptor as unknown as ControllerView<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};

ControllerView.MountedFlag = 1 << 0;
