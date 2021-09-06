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
import {Model, Trait, TraitObserverType} from "@swim/model";
import {ViewFactory, View, ViewObserverType} from "@swim/view";
import {NodeView} from "@swim/dom";
import {Controller} from "../Controller";

export type ControllerViewTraitFlags = number;

export interface ControllerViewTraitInit<V extends View, R extends Trait, VU = never, RU = never> {
  extends?: ControllerViewTraitClass;

  viewKey?: string | boolean;
  viewType?: ViewFactory<V, VU>;
  observeView?: boolean;
  willSetView?(newView: V | null, oldView: V | null, targetView: View | null): void;
  onSetView?(newView: V | null, oldView: V | null, targetView: View | null): void;
  didSetView?(newView: V | null, oldView: V | null, targetView: View | null): void;
  createView?(): V | VU | null;
  insertView?(parentView: View, childView: V, targetView: View | null, key: string | undefined): void;
  fromAny?(value: V | VU): V | null;

  traitKey?: string | boolean;
  traitType?: unknown;
  observeTrait?: boolean;
  willSetTrait?(newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void;
  onSetTrait?(newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void;
  didSetTrait?(newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void;
  createTrait?(): R | RU | null;
  insertTrait?(model: Model, trait: R, targetTrait: Trait | null, key: string | undefined): void;
}

export type ControllerViewTraitDescriptor<C extends Controller, V extends View, R extends Trait, VU = never, RU = never, I = {}> = ControllerViewTraitInit<V, R, VU, RU> & ThisType<ControllerViewTrait<C, V, R, VU, RU> & I> & Partial<I>;

export interface ControllerViewTraitConstructor<C extends Controller, V extends View, R extends Trait, VU = never, RU = never, I = {}> {
  new<O extends C>(owner: O, viewKey: string | undefined, traitKey: string | undefined, fastenerName: string | undefined): ControllerViewTrait<O, V, R, VU, RU> & I;
  prototype: Omit<ControllerViewTrait<any, any, any, any>, "viewKey" | "traitKey"> & {viewKey?: string | boolean; traitKey?: string | boolean} & I;
}

export interface ControllerViewTraitClass extends Function {
  readonly prototype: Omit<ControllerViewTrait<any, any, any, any>, "viewKey" | "traitKey"> & {viewKey?: string | boolean; traitKey?: string | boolean};
}

export interface ControllerViewTrait<C extends Controller, V extends View, R extends Trait, VU = never, RU = never> {
  readonly name: string;

  readonly owner: C;

  /** @hidden */
  fastenerFlags: ControllerViewTraitFlags;

  /** @hidden */
  setFastenerFlags(fastenerFlags: ControllerViewTraitFlags): void;

  readonly viewKey: string | undefined;

  readonly view: V | null;

  getView(): V;

  setView(newView: V | VU | null, targetView?: View | null): V | null;

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

  injectView(parentView: View, childView?: V | VU | null, targetView?: View | null, key?: string | null): V | null;

  createView(): V | VU | null;

  /** @hidden */
  insertView(parentView: View, childView: V, targetView: View | null, key: string | undefined): void;

  removeView(): V | null;

  /** @hidden */
  observeView?: boolean;

  /** @hidden */
  readonly viewType?: ViewFactory<V>;

  fromAnyView(value: V | VU): V | null;

  readonly traitKey: string | undefined;

  readonly trait: R | null;

  getTrait(): R;

  setTrait(newTrait: R | RU | null, targetTrait?: Trait | null): R | null;

  /** @hidden */
  attachTrait(newTrait: R): void;

  /** @hidden */
  detachTrait(oldTrait: R): void;

  /** @hidden */
  willSetTrait(newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void;

  /** @hidden */
  onSetTrait(newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void;

  /** @hidden */
  didSetTrait(newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void;

  injectTrait(model: Model, trait?: R | RU | null, targetTrait?: Trait | null, key?: string | null): R | null;

  createTrait(): R | RU | null;

  /** @hidden */
  insertTrait(model: Model, trait: R, targetTrait: Trait | null, key: string | undefined): void;

  removeTrait(): R | null;

  /** @hidden */
  observeTrait?: boolean;

  /** @hidden */
  readonly traitType?: unknown;

  fromAnyTrait(value: R | RU): R | null;

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

export const ControllerViewTrait = function <C extends Controller, V extends View = View, R extends Trait = Trait, VU = never, RU = never>(
    this: ControllerViewTrait<C, V, R, VU, RU> | typeof ControllerViewTrait,
    owner: C | ControllerViewTraitDescriptor<C, V, R, VU, RU>,
    viewKey?: string,
    traitKey?: string,
    fastenerName?: string,
  ): ControllerViewTrait<C, V, R, VU, RU> | PropertyDecorator {
  if (this instanceof ControllerViewTrait) { // constructor
    return ControllerViewTraitConstructor.call(this, owner as C, viewKey, traitKey, fastenerName) as ControllerViewTrait<C, V, R, VU, RU>;
  } else { // decorator factory
    return ControllerViewTraitDecoratorFactory(owner as ControllerViewTraitDescriptor<C, V, R, VU, RU>);
  }
} as {
  /** @hidden */
  new<C extends Controller, V extends View, R extends Trait, VU = never, RU = never>(owner: C, viewKey: string | undefined, traitKey: string | undefined, fastenerName: string | undefined): ControllerViewTrait<C, V, R, VU, RU>;

  <C extends Controller, V extends View = View, R extends Trait = Trait, VU = never, RU = never, I = {}>(descriptor: {observeView: boolean, observeTrait: boolean} & ControllerViewTraitDescriptor<C, V, R, VU, RU, I & ViewObserverType<V> & TraitObserverType<R>>): PropertyDecorator;
  <C extends Controller, V extends View = View, R extends Trait = Trait, VU = never, RU = never, I = {}>(descriptor: {observeView: boolean} & ControllerViewTraitDescriptor<C, V, R, VU, RU, I & ViewObserverType<V>>): PropertyDecorator;
  <C extends Controller, V extends View = View, R extends Trait = Trait, VU = never, RU = never, I = {}>(descriptor: {observeTrait: boolean} & ControllerViewTraitDescriptor<C, V, R, VU, RU, I & TraitObserverType<R>>): PropertyDecorator;
  <C extends Controller, V extends View = View, R extends Trait = Trait, VU = never, RU = never, I = {}>(descriptor: ControllerViewTraitDescriptor<C, V, R, VU, RU, I>): PropertyDecorator;

  /** @hidden */
  prototype: ControllerViewTrait<any, any, any, any>;

  define<C extends Controller, V extends View = View, R extends Trait = Trait, VU = never, RU = never, I = {}>(descriptor: {observeView: boolean, observeTrait: boolean} & ControllerViewTraitDescriptor<C, V, R, VU, RU, I & ViewObserverType<V> & TraitObserverType<R>>): ControllerViewTraitConstructor<C, V, R, VU, RU, I>;
  define<C extends Controller, V extends View = View, R extends Trait = Trait, VU = never, RU = never, I = {}>(descriptor: {observeView: boolean} & ControllerViewTraitDescriptor<C, V, R, VU, RU, I & ViewObserverType<V>>): ControllerViewTraitConstructor<C, V, R, VU, RU, I>;
  define<C extends Controller, V extends View = View, R extends Trait = Trait, VU = never, RU = never, I = {}>(descriptor: {observeTrait: boolean} & ControllerViewTraitDescriptor<C, V, R, VU, RU, I & TraitObserverType<R>>): ControllerViewTraitConstructor<C, V, R, VU, RU, I>;
  define<C extends Controller, V extends View = View, R extends Trait = Trait, VU = never, RU = never, I = {}>(descriptor: ControllerViewTraitDescriptor<C, V, R, VU, RU, I>): ControllerViewTraitConstructor<C, V, R, VU, RU, I>;

  /** @hidden */
  MountedFlag: ControllerViewTraitFlags;
};
__extends(ControllerViewTrait, Object);

function ControllerViewTraitConstructor<C extends Controller, V extends View, R extends Trait, VU, RU>(this: ControllerViewTrait<C, V, R, VU, RU>, owner: C, viewKey: string | undefined, traitKey: string | undefined, fastenerName: string | undefined): ControllerViewTrait<C, V, R, VU, RU> {
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
  Object.defineProperty(this, "viewKey", {
    value: viewKey,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "view", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "traitKey", {
    value: traitKey,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "trait", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  return this;
}

function ControllerViewTraitDecoratorFactory<C extends Controller, V extends View, R extends Trait, VU, RU>(descriptor: ControllerViewTraitDescriptor<C, V, R, VU, RU>): PropertyDecorator {
  return Controller.decorateControllerViewTrait.bind(Controller, ControllerViewTrait.define(descriptor as ControllerViewTraitDescriptor<Controller, View, Trait>));
}

ControllerViewTrait.prototype.setFastenerFlags = function (this: ControllerViewTrait<Controller, View, Trait>, fastenerFlags: ControllerViewTraitFlags): void {
  Object.defineProperty(this, "fastenerFlags", {
    value: fastenerFlags,
    enumerable: true,
    configurable: true,
  });
};

ControllerViewTrait.prototype.getView = function <V extends View>(this: ControllerViewTrait<Controller, V, Trait>): V {
  const view = this.view;
  if (view === null) {
    throw new TypeError("null " + this.name + " view");
  }
  return view;
};

ControllerViewTrait.prototype.setView = function <V extends View>(this: ControllerViewTrait<Controller, V, Trait>, newView: V | null, targetView?: View | null): V | null {
  if (newView instanceof NodeView && newView.isMounted() ||
      newView instanceof Node && NodeView.isNodeMounted(newView) && NodeView.isRootView(newView)) {
    this.owner.mount();
  }
  const oldView = this.view;
  if (newView !== null) {
    newView = this.fromAnyView(newView);
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

ControllerViewTrait.prototype.attachView = function <V extends View>(this: ControllerViewTrait<Controller, V, Trait>, newView: V): void {
  if (this.observeView === true) {
    newView.addViewObserver(this as ViewObserverType<V>);
  }
};

ControllerViewTrait.prototype.detachView = function <V extends View>(this: ControllerViewTrait<Controller, V, Trait>, oldView: V): void {
  if (this.observeView === true) {
    oldView.removeViewObserver(this as ViewObserverType<V>);
  }
};

ControllerViewTrait.prototype.willSetView = function <V extends View>(this: ControllerViewTrait<Controller, V, Trait>, newView: V | null, oldView: V | null, targetView: View | null): void {
  // hook
};

ControllerViewTrait.prototype.onSetView = function <V extends View>(this: ControllerViewTrait<Controller, V, Trait>, newView: V | null, oldView: V | null, targetView: View | null): void {
  // hook
};

ControllerViewTrait.prototype.didSetView = function <V extends View>(this: ControllerViewTrait<Controller, V, Trait>, newView: V | null, oldView: V | null, targetView: View | null): void {
  // hook
};

ControllerViewTrait.prototype.injectView = function <V extends View>(this: ControllerViewTrait<Controller, V, Trait>, parentView: View, childView?: V | null, targetView?: View | null, key?: string | null): V | null {
  if (targetView === void 0) {
    targetView = null;
  }
  if (childView === void 0 || childView === null) {
    childView = this.view;
    if (childView === null) {
      childView = this.createView();
    }
  } else {
    childView = this.fromAnyView(childView);
    if (childView !== null) {
      this.setView(childView, targetView);
    }
  }
  if (childView !== null) {
    if (key === void 0) {
      key = this.viewKey;
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

ControllerViewTrait.prototype.createView = function <V extends View, VU>(this: ControllerViewTrait<Controller, V, Trait, VU, never>): V | VU | null {
  const viewType = this.viewType;
  if (viewType !== void 0) {
    return viewType.create();
  }
  return null;
};

ControllerViewTrait.prototype.insertView = function <V extends View>(this: ControllerViewTrait<Controller, V, Trait>, parentView: View, childView: V, targetView: View | null, key: string | undefined): void {
  parentView.insertChildView(childView, targetView, key);
}

ControllerViewTrait.prototype.removeView = function <V extends View>(this: ControllerViewTrait<Controller, V, Trait>): V | null {
  const childView = this.view;
  if (childView !== null) {
    childView.remove();
  }
  return childView;
};

ControllerViewTrait.prototype.fromAnyView = function <V extends View, VU>(this: ControllerViewTrait<Controller, V, Trait, VU, never>, value: V | VU): V | null {
  const viewType = this.viewType;
  if (FromAny.is<V, VU>(viewType)) {
    return viewType.fromAny(value);
  } else if (value instanceof View) {
    return value;
  }
  return null;
};

ControllerViewTrait.prototype.getTrait = function <R extends Trait>(this: ControllerViewTrait<Controller, View, R>): R {
  const trait = this.trait;
  if (trait === null) {
    throw new TypeError("null " + this.name + " trait");
  }
  return trait;
};

ControllerViewTrait.prototype.setTrait = function <R extends Trait>(this: ControllerViewTrait<Controller, View, R>, newTrait: R | null, targetTrait?: Trait | null): R | null {
  const oldTrait = this.trait;
  if (newTrait !== null) {
    newTrait = this.fromAnyTrait(newTrait);
  }
  if (oldTrait !== newTrait) {
    if (targetTrait === void 0) {
      targetTrait = null;
    }
    this.willSetTrait(newTrait, oldTrait, targetTrait);
    if (oldTrait !== null) {
      this.detachTrait(oldTrait);
    }
    Object.defineProperty(this, "trait", {
      value: newTrait,
      enumerable: true,
      configurable: true,
    });
    if (newTrait !== null) {
      this.attachTrait(newTrait);
    }
    this.onSetTrait(newTrait, oldTrait, targetTrait);
    this.didSetTrait(newTrait, oldTrait, targetTrait);
  }
  return oldTrait;
};

ControllerViewTrait.prototype.attachTrait = function <R extends Trait>(this: ControllerViewTrait<Controller, View, R>, newTrait: R): void {
  if (this.observeTrait === true) {
    newTrait.addTraitObserver(this as TraitObserverType<R>);
  }
};

ControllerViewTrait.prototype.detachTrait = function <R extends Trait>(this: ControllerViewTrait<Controller, View, R>, oldTrait: R): void {
  if (this.observeTrait === true) {
    oldTrait.removeTraitObserver(this as TraitObserverType<R>);
  }
};

ControllerViewTrait.prototype.willSetTrait = function <R extends Trait>(this: ControllerViewTrait<Controller, View, R>, newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void {
  // hook
};

ControllerViewTrait.prototype.onSetTrait = function <R extends Trait>(this: ControllerViewTrait<Controller, View, R>, newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void {
  // hook
};

ControllerViewTrait.prototype.didSetTrait = function <R extends Trait>(this: ControllerViewTrait<Controller, View, R>, newTrait: R | null, oldTrait: R | null, targetTrait: Trait | null): void {
  // hook
};

ControllerViewTrait.prototype.injectTrait = function <R extends Trait>(this: ControllerViewTrait<Controller, View, R>, model: Model, trait?: R | null, targetTrait?: Trait | null, key?: string | null): R | null {
  if (targetTrait === void 0) {
    targetTrait = null;
  }
  if (trait === void 0 || trait === null) {
    trait = this.trait;
    if (trait === null) {
      trait = this.createTrait();
    }
  } else {
    trait = this.fromAnyTrait(trait);
    if (trait !== null) {
      this.setTrait(trait, targetTrait);
    }
  }
  if (trait !== null) {
    if (key === void 0) {
      key = this.traitKey;
    } else if (key === null) {
      key = void 0;
    }
    if (trait.model !== model || trait.key !== key) {
      this.insertTrait(model, trait, targetTrait, key);
    }
    if (this.trait === null) {
      this.setTrait(trait, targetTrait);
    }
  }
  return trait;
};

ControllerViewTrait.prototype.createTrait = function <R extends Trait, RU>(this: ControllerViewTrait<Controller, View, R, never, RU>): R | RU | null {
  return null;
};

ControllerViewTrait.prototype.insertTrait = function <R extends Trait>(this: ControllerViewTrait<Controller, View, R>, model: Model, trait: R, targetTrait: Trait | null, key: string | undefined): void {
  model.insertTrait(trait, targetTrait, key);
};

ControllerViewTrait.prototype.removeTrait = function <R extends Trait>(this: ControllerViewTrait<Controller, View, R>): R | null {
  const trait = this.trait;
  if (trait !== null) {
    trait.remove();
  }
  return trait;
};

ControllerViewTrait.prototype.fromAnyTrait = function <R extends Trait, RU>(this: ControllerViewTrait<Controller, View, R, never, RU>, value: R | RU): R | null {
  const traitType = this.traitType;
  if (FromAny.is<R, RU>(traitType)) {
    return traitType.fromAny(value);
  } else if (value instanceof Trait) {
    return value;
  }
  return null;
};

ControllerViewTrait.prototype.isMounted = function (this: ControllerViewTrait<Controller, View, Trait>): boolean {
  return (this.fastenerFlags & ControllerViewTrait.MountedFlag) !== 0;
};

ControllerViewTrait.prototype.mount = function (this: ControllerViewTrait<Controller, View, Trait>): void {
  if ((this.fastenerFlags & ControllerViewTrait.MountedFlag) === 0) {
    this.willMount();
    this.setFastenerFlags(this.fastenerFlags | ControllerViewTrait.MountedFlag);
    this.onMount();
    this.didMount();
  }
};

ControllerViewTrait.prototype.willMount = function (this: ControllerViewTrait<Controller, View, Trait>): void {
  // hook
};

ControllerViewTrait.prototype.onMount = function (this: ControllerViewTrait<Controller, View, Trait>): void {
  // hook
};

ControllerViewTrait.prototype.didMount = function (this: ControllerViewTrait<Controller, View, Trait>): void {
  // hook
};

ControllerViewTrait.prototype.unmount = function (this: ControllerViewTrait<Controller, View, Trait>): void {
  if ((this.fastenerFlags & ControllerViewTrait.MountedFlag) !== 0) {
    this.willUnmount();
    this.setFastenerFlags(this.fastenerFlags & ~ControllerViewTrait.MountedFlag);
    this.onUnmount();
    this.didUnmount();
  }
};

ControllerViewTrait.prototype.willUnmount = function (this: ControllerViewTrait<Controller, View, Trait>): void {
  // hook
};

ControllerViewTrait.prototype.onUnmount = function (this: ControllerViewTrait<Controller, View, Trait>): void {
  // hook
};

ControllerViewTrait.prototype.didUnmount = function (this: ControllerViewTrait<Controller, View, Trait>): void {
  // hook
};

ControllerViewTrait.define = function <C extends Controller, V extends View, R extends Trait, VU, RU, I>(descriptor: ControllerViewTraitDescriptor<C, V, R, VU, RU, I>): ControllerViewTraitConstructor<C, V, R, VU, RU, I> {
  let _super = descriptor.extends;
  delete descriptor.extends;

  if (_super === void 0) {
    _super = ControllerViewTrait;
  }

  const _constructor = function DecoratedControllerViewTrait(this: ControllerViewTrait<C, V, R, VU, RU>, owner: C, viewKey: string | undefined, traitKey: string | undefined, fastenerName: string | undefined): ControllerViewTrait<C, V, R, VU, RU> {
    const _this = _super!.call(this, owner, viewKey, traitKey, fastenerName) || this;
    return _this;
  } as unknown as ControllerViewTraitConstructor<C, V, R, VU, RU, I>;

  const _prototype = descriptor as unknown as ControllerViewTrait<any, any, any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};

ControllerViewTrait.MountedFlag = 1 << 0;
