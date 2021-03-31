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
import {FromAny, Arrays} from "@swim/util";
import {
  AnyConstraintExpression,
  ConstraintExpression,
  ConstraintVariable,
  ConstraintBinding,
  ConstraintRelation,
  AnyConstraintStrength,
  ConstraintStrength,
  Constraint,
  ConstraintScope,
} from "@swim/constraint";
import {ViewFactory, View} from "../View";
import type {ViewObserverType} from "../ViewObserver";

export type ViewFastenerMemberType<V, K extends keyof V> =
  V[K] extends ViewFastener<any, infer S, any> ? S : never;

export type ViewFastenerMemberInit<V, K extends keyof V> =
  V[K] extends ViewFastener<any, infer S, infer U> ? S | U : never;

export type ViewFastenerFlags = number;

export interface ViewFastenerInit<S extends View, U = never> {
  extends?: ViewFastenerClass;
  key?: string | boolean;
  type?: ViewFactory<S, U>;
  child?: boolean;
  observe?: boolean;

  willSetView?(newView: S | null, oldView: S | null, targetView: View | null): void;
  onSetView?(newView: S | null, oldView: S | null, targetView: View | null): void;
  didSetView?(newView: S | null, oldView: S | null, targetView: View | null): void;

  parentView?: View | null;
  createView?(): S | U | null;
  insertView?(parentView: View, childView: S, targetView: View | null, key: string | undefined): void;
  fromAny?(value: S | U): S | null;
}

export type ViewFastenerDescriptor<V extends View, S extends View, U = never, I = {}> = ViewFastenerInit<S, U> & ThisType<ViewFastener<V, S, U> & I> & Partial<I>;

export interface ViewFastenerConstructor<V extends View, S extends View, U = never, I = {}> {
  new<O extends V>(owner: O, key: string | undefined, fastenerName: string | undefined): ViewFastener<O, S, U> & I;
  prototype: Omit<ViewFastener<any, any>, "key"> & {key?: string | boolean} & I;
}

export interface ViewFastenerClass extends Function {
  readonly prototype: Omit<ViewFastener<any, any>, "key"> & {key?: string | boolean};
}

export interface ViewFastener<V extends View, S extends View, U = never> extends ConstraintScope {
  (): S | null;
  (view: S | U | null, targetView?: View | null): V;

  readonly name: string;

  readonly owner: V;

  /** @hidden */
  fastenerFlags: ViewFastenerFlags;

  /** @hidden */
  setFastenerFlags(fastenerFlags: ViewFastenerFlags): void;

  readonly key: string | undefined;

  readonly view: S | null;

  getView(): S;

  setView(newView: S | U | null, targetView?: View | null): S | null;

  /** @hidden */
  doSetView(newView: S | null, targetView: View | null): void;

  /** @hidden */
  attachView(newView: S): void;

  /** @hidden */
  detachView(oldView: S): void;

  /** @hidden */
  willSetView(newView: S | null, oldView: S | null, targetView: View | null): void;

  /** @hidden */
  onSetView(newView: S | null, oldView: S | null, targetView: View | null): void;

  /** @hidden */
  didSetView(newView: S | null, oldView: S | null, targetView: View | null): void;

  constraint(lhs: AnyConstraintExpression, relation: ConstraintRelation,
             rhs?: AnyConstraintExpression, strength?: AnyConstraintStrength): Constraint;

  readonly constraints: ReadonlyArray<Constraint>;

  hasConstraint(constraint: Constraint): boolean;

  addConstraint(constraint: Constraint): void;

  removeConstraint(constraint: Constraint): void;

  /** @hidden */
  activateConstraint(constraint: Constraint): void;

  /** @hidden */
  deactivateConstraint(constraint: Constraint): void;

  constraintVariable(name: string, value?: number, strength?: AnyConstraintStrength): ConstraintBinding;

  readonly constraintVariables: ReadonlyArray<ConstraintVariable>;

  hasConstraintVariable(variable: ConstraintVariable): boolean;

  addConstraintVariable(variable: ConstraintVariable): void;

  removeConstraintVariable(variable: ConstraintVariable): void;

  /** @hidden */
  activateConstraintVariable(constraintVariable: ConstraintVariable): void;

  /** @hidden */
  deactivateConstraintVariable(constraintVariable: ConstraintVariable): void;

  /** @hidden */
  setConstraintVariable(constraintVariable: ConstraintVariable, state: number): void;

  /** @hidden */
  activateLayout(): void;

  /** @hidden */
  deactivateLayout(): void;

  /** @hidden */
  readonly parentView: View | null;

  injectView(parentView?: View | null, childView?: S | U | null, targetView?: View | null, key?: string | null): S | null;

  createView(): S | U | null;

  /** @hidden */
  insertView(parentView: View, childView: S, targetView: View | null, key: string | undefined): void;

  removeView(): S | null;

  /** @hidden */
  observe?: boolean;

  /** @hidden */
  child?: boolean;

  /** @hidden */
  readonly type?: ViewFactory<S>;

  fromAny(value: S | U): S | null;

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

export const ViewFastener = function <V extends View, S extends View, U>(
    this: ViewFastener<V, S, U> | typeof ViewFastener,
    owner: V | ViewFastenerDescriptor<V, S, U>,
    key?: string,
    fastenerName?: string,
  ): ViewFastener<V, S, U> | PropertyDecorator {
  if (this instanceof ViewFastener) { // constructor
    return ViewFastenerConstructor.call(this as unknown as ViewFastener<View, View, unknown>, owner as V, key, fastenerName);
  } else { // decorator factory
    return ViewFastenerDecoratorFactory(owner as ViewFastenerDescriptor<V, S, U>);
  }
} as {
  /** @hidden */
  new<V extends View, S extends View, U = never>(owner: V, key: string | undefined, fastenerName: string | undefined): ViewFastener<V, S, U>;

  <V extends View, S extends View = View, U = never, I = {}>(descriptor: {observe: boolean} & ViewFastenerDescriptor<V, S, U, I & ViewObserverType<S>>): PropertyDecorator;
  <V extends View, S extends View = View, U = never, I = {}>(descriptor: ViewFastenerDescriptor<V, S, U, I>): PropertyDecorator;

  /** @hidden */
  prototype: ViewFastener<any, any>;

  define<V extends View, S extends View = View, U = never, I = {}>(descriptor: {observe: boolean} & ViewFastenerDescriptor<V, S, U, I & ViewObserverType<S>>): ViewFastenerConstructor<V, S, U, I>;
  define<V extends View, S extends View = View, U = never, I = {}>(descriptor: ViewFastenerDescriptor<V, S, U, I>): ViewFastenerConstructor<V, S, U, I>;

  /** @hidden */
  MountedFlag: ViewFastenerFlags;
};
__extends(ViewFastener, Object);

function ViewFastenerConstructor<V extends View, S extends View, U>(this: ViewFastener<V, S, U>, owner: V, key: string | undefined, fastenerName: string | undefined): ViewFastener<V, S, U> {
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
  Object.defineProperty(this, "constraints", {
    value: Arrays.empty,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "constraintVariables", {
    value: Arrays.empty,
    enumerable: true,
    configurable: true,
  });
  return this;
}

function ViewFastenerDecoratorFactory<V extends View, S extends View, U>(descriptor: ViewFastenerDescriptor<V, S, U>): PropertyDecorator {
  return View.decorateViewFastener.bind(View, ViewFastener.define(descriptor as ViewFastenerDescriptor<View, View>));
}

ViewFastener.prototype.setFastenerFlags = function (this: ViewFastener<View, View>, fastenerFlags: ViewFastenerFlags): void {
  Object.defineProperty(this, "fastenerFlags", {
    value: fastenerFlags,
    enumerable: true,
    configurable: true,
  });
};

ViewFastener.prototype.getView = function <S extends View>(this: ViewFastener<View, S>): S {
  const view = this.view;
  if (view === null) {
    throw new TypeError("null " + this.name + " view");
  }
  return view;
};

ViewFastener.prototype.setView = function <S extends View>(this: ViewFastener<View, S>, newView: S | null, targetView?: View | null): S | null {
  const oldView = this.view;
  if (newView !== null) {
    newView = this.fromAny(newView);
  }
  if (targetView === void 0) {
    targetView = null
  }
  if (this.child === true) {
    if (newView !== null && (newView.parentView !== this.owner || newView.key !== this.key)) {
      this.insertView(this.owner, newView, targetView, this.key);
    } else if (newView === null && oldView !== null) {
      oldView.remove();
    }
  }
  this.doSetView(newView, targetView);
  return oldView;
};

ViewFastener.prototype.doSetView = function <S extends View>(this: ViewFastener<View, S>, newView: S | null, targetView: View | null): void {
  const oldView = this.view;
  if (oldView !== newView) {
    this.deactivateLayout();
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
};

ViewFastener.prototype.attachView = function <S extends View>(this: ViewFastener<View, S>, newView: S): void {
  if (this.observe === true) {
    newView.addViewObserver(this as ViewObserverType<S>);
  }
};

ViewFastener.prototype.detachView = function <S extends View>(this: ViewFastener<View, S>, oldView: S): void {
  if (this.observe === true) {
    oldView.removeViewObserver(this as ViewObserverType<S>);
  }
};

ViewFastener.prototype.willSetView = function <S extends View>(this: ViewFastener<View, S>, newView: S | null, oldView: S | null, targetView: View | null): void {
  // hook
};

ViewFastener.prototype.onSetView = function <S extends View>(this: ViewFastener<View, S>, newView: S | null, oldView: S | null, targetView: View | null): void {
  // hook
};

ViewFastener.prototype.didSetView = function <S extends View>(this: ViewFastener<View, S>, newView: S | null, oldView: S | null, targetView: View | null): void {
  // hook
};

ViewFastener.prototype.constraint = function (this: ViewFastener<View, View>, lhs: AnyConstraintExpression, relation: ConstraintRelation,
                                              rhs?: AnyConstraintExpression, strength?: AnyConstraintStrength): Constraint {
  lhs = ConstraintExpression.fromAny(lhs);
  if (rhs !== void 0) {
    rhs = ConstraintExpression.fromAny(rhs);
  }
  const expression = rhs !== void 0 ? lhs.minus(rhs) : lhs;
  if (strength === void 0) {
    strength = ConstraintStrength.Required;
  } else {
    strength = ConstraintStrength.fromAny(strength);
  }
  const constraint = new Constraint(this.owner, expression, relation, strength);
  this.addConstraint(constraint);
  return constraint;
};

ViewFastener.prototype.hasConstraint = function (this: ViewFastener<View, View>, constraint: Constraint): boolean {
  return this.constraints.indexOf(constraint) >= 0;
};

ViewFastener.prototype.addConstraint = function (this: ViewFastener<View, View>, constraint: Constraint): void {
  const oldConstraints = this.constraints;
  const newConstraints = Arrays.inserted(constraint, oldConstraints);
  if (oldConstraints !== newConstraints) {
    Object.defineProperty(this, "constraints", {
      value: newConstraints,
      enumerable: true,
      configurable: true,
    });
    this.activateConstraint(constraint);
  }
};

ViewFastener.prototype.removeConstraint = function (this: ViewFastener<View, View>, constraint: Constraint): void {
  const oldConstraints = this.constraints;
  const newConstraints = Arrays.removed(constraint, oldConstraints);
  if (oldConstraints !== newConstraints) {
    this.deactivateConstraint(constraint);
    Object.defineProperty(this, "constraints", {
      value: newConstraints,
      enumerable: true,
      configurable: true,
    });
  }
};

ViewFastener.prototype.activateConstraint = function (this: ViewFastener<View, View>, constraint: Constraint): void {
  this.owner.activateConstraint(constraint);
};

ViewFastener.prototype.deactivateConstraint = function (this: ViewFastener<View, View>, constraint: Constraint): void {
  this.owner.deactivateConstraint(constraint);
};

ViewFastener.prototype.constraintVariable = function (this: ViewFastener<View, View>, name: string, value?: number, strength?: AnyConstraintStrength): ConstraintBinding {
  if (value === void 0) {
    value = 0;
  }
  if (strength === void 0) {
    strength = ConstraintStrength.Strong;
  } else {
    strength = ConstraintStrength.fromAny(strength);
  }
  return new ConstraintBinding(this, name, value, strength);
};

ViewFastener.prototype.hasConstraintVariable = function (this: ViewFastener<View, View>, constraintVariable: ConstraintVariable): boolean {
  return this.constraintVariables.indexOf(constraintVariable) >= 0;
};

ViewFastener.prototype.addConstraintVariable = function (this: ViewFastener<View, View>, constraintVariable: ConstraintVariable): void {
  const oldConstraintVariables = this.constraintVariables;
  const newConstraintVariables = Arrays.inserted(constraintVariable, oldConstraintVariables);
  if (oldConstraintVariables !== newConstraintVariables) {
    Object.defineProperty(this, "constraintVariables", {
      value: newConstraintVariables,
      enumerable: true,
      configurable: true,
    });
    this.activateConstraintVariable(constraintVariable);
  }
};

ViewFastener.prototype.removeConstraintVariable = function (this: ViewFastener<View, View>, constraintVariable: ConstraintVariable): void {
  const oldConstraintVariables = this.constraintVariables;
  const newConstraintVariables = Arrays.removed(constraintVariable, oldConstraintVariables);
  if (oldConstraintVariables !== newConstraintVariables) {
    this.deactivateConstraintVariable(constraintVariable);
    Object.defineProperty(this, "constraintVariables", {
      value: newConstraintVariables,
      enumerable: true,
      configurable: true,
    });
  }
};

ViewFastener.prototype.activateConstraintVariable = function (this: ViewFastener<View, View>, constraintVariable: ConstraintVariable): void {
  this.owner.activateConstraintVariable(constraintVariable);
};

ViewFastener.prototype.deactivateConstraintVariable = function (this: ViewFastener<View, View>, constraintVariable: ConstraintVariable): void {
  this.owner.deactivateConstraintVariable(constraintVariable);
};

ViewFastener.prototype.setConstraintVariable = function (this: ViewFastener<View, View>, constraintVariable: ConstraintVariable, state: number): void {
  this.owner.setConstraintVariable(constraintVariable, state);
};

ViewFastener.prototype.activateLayout = function (this: ViewFastener<View, View>): void {
  const constraintVariables = this.constraintVariables;
  for (let i = 0, n = constraintVariables.length; i < n; i += 1) {
    this.owner.activateConstraintVariable(constraintVariables[i]!);
  }
  const constraints = this.constraints;
  for (let i = 0, n = constraints.length; i < n; i += 1) {
    this.owner.activateConstraint(constraints[i]!);
  }
};

ViewFastener.prototype.deactivateLayout = function (this: ViewFastener<View, View>): void {
  const constraints = this.constraints;
  for (let i = 0, n = constraints.length; i < n; i += 1) {
    this.owner.deactivateConstraint(constraints[i]!);
  }
  const constraintVariables = this.constraintVariables;
  for (let i = 0, n = constraintVariables.length; i < n; i += 1) {
    this.owner.deactivateConstraintVariable(constraintVariables[i]!);
  }
};

Object.defineProperty(ViewFastener.prototype, "parentView", {
  get(this: ViewFastener<View, View>): View | null {
    return this.owner;
  },
  enumerable: true,
  configurable: true,
});

ViewFastener.prototype.injectView = function <S extends View>(this: ViewFastener<View, S>, parentView?: View | null, childView?: S | null, targetView?: View | null, key?: string | null): S | null {
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
      this.doSetView(childView, targetView);
    }
  }
  if (childView !== null) {
    if (parentView === void 0 || parentView === null) {
      parentView = this.parentView;
    }
    if (key === void 0) {
      key = this.key;
    } else if (key === null) {
      key = void 0;
    }
    if (parentView !== null && (childView.parentView !== parentView || childView.key !== key)) {
      this.insertView(parentView, childView, targetView, key);
    }
    if (this.view === null) {
      this.doSetView(childView, targetView);
    }
  }
  return childView;
};

ViewFastener.prototype.createView = function <S extends View, U>(this: ViewFastener<View, S, U>): S | U | null {
  const type = this.type;
  if (type !== void 0) {
    return type.create();
  }
  return null;
};

ViewFastener.prototype.insertView = function <S extends View>(this: ViewFastener<View, S>, parentView: View, childView: S, targetView: View | null, key: string | undefined): void {
  parentView.insertChildView(childView, targetView, key);
};

ViewFastener.prototype.removeView = function <S extends View>(this: ViewFastener<View, S>): S | null {
  const childView = this.view;
  if (childView !== null) {
    childView.remove();
  }
  return childView;
};

ViewFastener.prototype.fromAny = function <S extends View, U>(this: ViewFastener<View, S, U>, value: S | U): S | null {
  const type = this.type;
  if (FromAny.is<S, U>(type)) {
    return type.fromAny(value);
  } else if (value instanceof View) {
    return value;
  }
  return null;
};

ViewFastener.prototype.isMounted = function (this: ViewFastener<View, View>): boolean {
  return (this.fastenerFlags & ViewFastener.MountedFlag) !== 0;
};

ViewFastener.prototype.mount = function (this: ViewFastener<View, View>): void {
  if ((this.fastenerFlags & ViewFastener.MountedFlag) === 0) {
    this.willMount();
    this.setFastenerFlags(this.fastenerFlags | ViewFastener.MountedFlag);
    this.onMount();
    this.didMount();
  }
};

ViewFastener.prototype.willMount = function (this: ViewFastener<View, View>): void {
  // hook
};

ViewFastener.prototype.onMount = function (this: ViewFastener<View, View>): void {
  this.activateLayout();
};

ViewFastener.prototype.didMount = function (this: ViewFastener<View, View>): void {
  // hook
};

ViewFastener.prototype.unmount = function (this: ViewFastener<View, View>): void {
  if ((this.fastenerFlags & ViewFastener.MountedFlag) !== 0) {
    this.willUnmount();
    this.setFastenerFlags(this.fastenerFlags & ~ViewFastener.MountedFlag);
    this.onUnmount();
    this.didUnmount();
  }
};

ViewFastener.prototype.willUnmount = function (this: ViewFastener<View, View>): void {
  // hook
};

ViewFastener.prototype.onUnmount = function (this: ViewFastener<View, View>): void {
  this.deactivateLayout();
};

ViewFastener.prototype.didUnmount = function (this: ViewFastener<View, View>): void {
  // hook
};

ViewFastener.define = function <V extends View, S extends View, U, I>(descriptor: ViewFastenerDescriptor<V, S, U, I>): ViewFastenerConstructor<V, S, U, I> {
  let _super = descriptor.extends;
  delete descriptor.extends;

  if (_super === void 0) {
    _super = ViewFastener;
  }

  const _constructor = function DecoratedViewFastener(this: ViewFastener<V, S>, owner: V, key: string | undefined, fastenerName: string | undefined): ViewFastener<V, S, U> {
    let _this: ViewFastener<V, S, U> = function ViewFastenerAccessor(view?: S | U | null, targetView?: View | null): S | null | V {
      if (view === void 0) {
        return _this.view;
      } else {
        _this.setView(view, targetView);
        return _this.owner;
      }
    } as ViewFastener<V, S, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, key, fastenerName) || _this;
    return _this;
  } as unknown as ViewFastenerConstructor<V, S, U, I>;

  const _prototype = descriptor as unknown as ViewFastener<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  if (_prototype.child === void 0) {
    _prototype.child = true;
  }

  return _constructor;
};

ViewFastener.MountedFlag = 1 << 0;
