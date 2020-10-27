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
import {
  Constrain,
  ConstrainVariable,
  ConstrainBinding,
  ConstraintRelation,
  AnyConstraintStrength,
  ConstraintStrength,
  Constraint,
  ConstraintScope,
} from "@swim/constraint";
import {ViewFactory, View} from "./View";
import {ViewObserverType} from "./ViewObserver";
import {SubviewObserver} from "./SubviewObserver";

export type SubviewMemberType<V, K extends keyof V> =
  V extends {[P in K]: Subview<any, infer S, any>} ? S : unknown;

export type SubviewMemberInit<V, K extends keyof V> =
  V extends {[P in K]: Subview<any, infer T, infer U>} ? T | U : unknown;

export interface SubviewInit<S extends View, U = S> {
  extends?: SubviewPrototype;
  observe?: boolean;
  child?: boolean;
  type?: ViewFactory<S, U>;

  willSetSubview?(newSubview: S | null, oldSubview: S | null): void;
  onSetSubview?(newSubview: S | null, oldSubview: S | null): void;
  didSetSubview?(newSubview: S | null, oldSubview: S | null): void;
  createSubview?(): S | U | null;
  fromAny?(value: S | U): S | null;
}

export type SubviewDescriptorInit<V extends View, S extends View, U = S, I = ViewObserverType<S>> = SubviewInit<S, U> & ThisType<Subview<V, S, U> & I> & I;

export type SubviewDescriptorExtends<V extends View, S extends View, U = S, I = ViewObserverType<S>> = {extends: SubviewPrototype | undefined} & SubviewDescriptorInit<V, S, U, I>;

export type SubviewDescriptorFromAny<V extends View, S extends View, U = S, I = ViewObserverType<S>> = ({type: FromAny<S, U>} | {fromAny(value: S | U): S | null}) & SubviewDescriptorInit<V, S, U, I>;

export type SubviewDescriptor<V extends View, S extends View, U = S, I = ViewObserverType<S>> =
  U extends S ? SubviewDescriptorInit<V, S, U, I> :
  SubviewDescriptorFromAny<V, S, U, I>;

export type SubviewPrototype = Function & {prototype: Subview<any, any>};

export type SubviewConstructor<V extends View, S extends View, U = S, I = ViewObserverType<S>> = {
  new(view: V, subviewName: string | undefined): Subview<V, S, U> & I;
  prototype: Subview<any, any, any> & I;
};

export declare abstract class Subview<V extends View, S extends View, U = S> {
  /** @hidden */
  _view: V;
  /** @hidden */
  _subview: S | null;
  /** @hidden */
  _constraints?: Constraint[];
  /** @hidden */
  _constraintVariables?: ConstrainVariable[];

  constructor(view: V, subviewName: string | undefined);

  /** @hidden */
  child: boolean;

  /** @hidden */
  readonly type?: ViewFactory<S>;

  get name(): string;

  get view(): V;

  get subview(): S | null;

  getSubview(): S;

  setSubview(subview: S | U | null): void;

  /** @hidden */
  doSetSubview(newSubview: S | null): void;

  /** @hidden */
  willSetSubview(newSubview: S | null, oldSubview: S | null): void;

  /** @hidden */
  onSetSubview(newSubview: S | null, oldSubview: S | null): void;

  /** @hidden */
  didSetSubview(newSubview: S | null, oldSubview: S | null): void;

  /** @hidden */
  willSetOwnSubview(newSubview: S | null, oldSubview: S | null): void;

  /** @hidden */
  onSetOwnSubview(newSubview: S | null, oldSubview: S | null): void;

  /** @hidden */
  didSetOwnSubview(newSubview: S | null, oldSubview: S | null): void;

  constraint(lhs: Constrain | number, relation: ConstraintRelation,
             rhs?: Constrain | number, strength?: AnyConstraintStrength): Constraint;

  get constraints(): ReadonlyArray<Constraint>;

  hasConstraint(constraint: Constraint): boolean;

  addConstraint(constraint: Constraint): void;

  removeConstraint(constraint: Constraint): void;

  /** @hidden */
  activateConstraint(constraint: Constraint): void;

  /** @hidden */
  deactivateConstraint(constraint: Constraint): void;

  constraintVariable(name: string, value?: number, strength?: AnyConstraintStrength): ConstrainVariable;

  get constraintVariables(): ReadonlyArray<ConstrainVariable>;

  hasConstraintVariable(variable: ConstrainVariable): boolean;

  addConstraintVariable(variable: ConstrainVariable): void;

  removeConstraintVariable(variable: ConstrainVariable): void;

  /** @hidden */
  activateConstraintVariable(constraintVariable: ConstrainVariable): void;

  /** @hidden */
  deactivateConstraintVariable(constraintVariable: ConstrainVariable): void;

  /** @hidden */
  setConstraintVariable(constraintVariable: ConstrainVariable, state: number): void;

  /** @hidden */
  activateLayout(): void;

  /** @hidden */
  deactivateLayout(): void;

  /** @hidden */
  mount(): void;

  /** @hidden */
  unmount(): void;

  insert(parentView: View, key?: string): S | null;
  insert(key?: string): S | null;

  remove(): S | null;

  createSubview(): S | U | null;

  fromAny(value: S | U): S | null;

  static define<V extends View, S extends View = View, U = S, I = ViewObserverType<S>>(descriptor: SubviewDescriptorExtends<V, S, U, I>): SubviewConstructor<V, S, U, I>;
  static define<V extends View, S extends View = View, U = S>(descriptor: SubviewDescriptor<V, S, U>): SubviewConstructor<V, S, U>;

  // Forward type declarations
  /** @hidden */
  static Observer: typeof SubviewObserver; // defined by SubviewObserver
}

export interface Subview<V extends View, S extends View, U = S> extends ConstraintScope {
  (): S | null;
  (subview: S | U | null): V;
}

export function Subview<V extends View, S extends View = View, U = S, I = ViewObserverType<S>>(descriptor: SubviewDescriptorExtends<V, S, U, I>): PropertyDecorator;
export function Subview<V extends View, S extends View = View, U = S>(descriptor: SubviewDescriptor<V, S, U>): PropertyDecorator;

export function Subview<V extends View, S extends View, U>(
    this: Subview<V, S> | typeof Subview,
    view: V | SubviewDescriptor<V, S, U>,
    subviewName?: string,
  ): Subview<V, S> | PropertyDecorator {
  if (this instanceof Subview) { // constructor
    return SubviewConstructor.call(this, view as V, subviewName);
  } else { // decorator factory
    return SubviewDecoratorFactory(view as SubviewDescriptor<V, S, U>);
  }
}
__extends(Subview, Object);
View.Subview = Subview;

function SubviewConstructor<V extends View, S extends View, U>(this: Subview<V, S, U>, view: V, subviewName: string | undefined): Subview<V, S, U> {
  if (subviewName !== void 0) {
    Object.defineProperty(this, "name", {
      value: subviewName,
      enumerable: true,
      configurable: true,
    });
  }
  this._view = view;
  this._subview = null;
  return this;
}

function SubviewDecoratorFactory<V extends View, S extends View, U>(descriptor: SubviewDescriptor<V, S, U>): PropertyDecorator {
  return View.decorateSubview.bind(View, Subview.define(descriptor));
}

Object.defineProperty(Subview.prototype, "view", {
  get: function <V extends View>(this: Subview<V, View>): V {
    return this._view;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(Subview.prototype, "subview", {
  get: function <S extends View>(this: Subview<View, S>): S | null {
    return this._subview;
  },
  enumerable: true,
  configurable: true,
});

Subview.prototype.getSubview = function <S extends View>(this: Subview<View, S>): S {
  const subview = this.subview;
  if (subview === null) {
    throw new TypeError("null " + this.name + " subview");
  }
  return subview;
};

Subview.prototype.setSubview = function <S extends View, U>(this: Subview<View, S, U>,
                                                            subview: S | U | null): void {
  if (subview !== null) {
    subview = this.fromAny(subview);
  }
  if (this.child) {
    this._view.setChildView(this.name, subview as S | null);
  } else {
    this.doSetSubview(subview as S | null);
  }
};

Subview.prototype.doSetSubview = function <S extends View>(this: Subview<View, S>,
                                                           newSubview: S | null): void {
  const oldSubview = this._subview;
  if (oldSubview !== newSubview) {
    this.deactivateLayout();
    this.willSetOwnSubview(newSubview, oldSubview);
    this.willSetSubview(newSubview, oldSubview);
    this._subview = newSubview;
    this.onSetOwnSubview(newSubview, oldSubview);
    this.onSetSubview(newSubview, oldSubview);
    this.didSetSubview(newSubview, oldSubview);
    this.didSetOwnSubview(newSubview, oldSubview);
  }
};

Subview.prototype.willSetSubview = function <S extends View>(this: Subview<View, S>,
                                                             newSubview: S | null,
                                                             oldSubview: S | null): void {
  // hook
};

Subview.prototype.onSetSubview = function <S extends View>(this: Subview<View, S>,
                                                           newSubview: S | null,
                                                           oldSubview: S | null): void {
  // hook
};

Subview.prototype.didSetSubview = function <S extends View>(this: Subview<View, S>,
                                                            newSubview: S | null,
                                                            oldSubview: S | null): void {
  // hook
};

Subview.prototype.willSetOwnSubview = function <S extends View>(this: Subview<View, S>,
                                                                newSubview: S | null,
                                                                oldSubview: S | null): void {
  // hook
};

Subview.prototype.onSetOwnSubview = function <S extends View>(this: Subview<View, S>,
                                                              newSubview: S | null,
                                                              oldSubview: S | null): void {
  // hook
};

Subview.prototype.didSetOwnSubview = function <S extends View>(this: Subview<View, S>,
                                                               newSubview: S | null,
                                                               oldSubview: S | null): void {
  // hook
};

Subview.prototype.constraint = function (this: Subview<View, View>, lhs: Constrain | number, relation: ConstraintRelation,
                                         rhs?: Constrain | number, strength?: AnyConstraintStrength): Constraint {
  if (typeof lhs === "number") {
    lhs = Constrain.constant(lhs);
  }
  if (typeof rhs === "number") {
    rhs = Constrain.constant(rhs);
  }
  const constrain = rhs !== void 0 ? lhs.minus(rhs) : lhs;
  if (strength === void 0) {
    strength = ConstraintStrength.Required;
  } else {
    strength = ConstraintStrength.fromAny(strength);
  }
  return new Constraint(this._view, constrain, relation, strength);
};

Object.defineProperty(Subview.prototype, "constraints", {
  get: function (this: Subview<View, View>): ReadonlyArray<Constraint> {
    let constraints = this._constraints;
    if (constraints === void 0) {
      constraints = [];
      this._constraints = constraints;
    }
    return constraints;
  },
  enumerable: true,
  configurable: true,
});

Subview.prototype.hasConstraint = function (this: Subview<View, View>,
                                            constraint: Constraint): boolean {
  const constraints = this._constraints;
  return constraints !== void 0 && constraints.indexOf(constraint) >= 0;
};

Subview.prototype.addConstraint = function (this: Subview<View, View>,
                                            constraint: Constraint): void {
  let constraints = this._constraints;
  if (constraints === void 0) {
    constraints = [];
    this._constraints = constraints;
  }
  if (constraints.indexOf(constraint) < 0) {
    constraints.push(constraint);
    this.activateConstraint(constraint);
  }
};

Subview.prototype.removeConstraint = function (this: Subview<View, View>,
                                               constraint: Constraint): void {
  const constraints = this._constraints;
  if (constraints !== void 0) {
    const index = constraints.indexOf(constraint);
    if (index >= 0) {
      constraints.splice(index, 1);
      this.deactivateConstraint(constraint);
    }
  }
};

Subview.prototype.activateConstraint = function (this: Subview<View, View>,
                                                 constraint: Constraint): void {
  this._view.activateConstraint(constraint);
};

Subview.prototype.deactivateConstraint = function (this: Subview<View, View>,
                                                   constraint: Constraint): void {
  this._view.deactivateConstraint(constraint);
};

Subview.prototype.constraintVariable = function (this: Subview<View, View>, name: string, value?: number,
                                                 strength?: AnyConstraintStrength): ConstrainVariable {
  if (value === void 0) {
    value = 0;
  }
  if (strength === void 0) {
    strength = ConstraintStrength.Strong;
  } else {
    strength = ConstraintStrength.fromAny(strength);
  }
  return new ConstrainBinding(this, name, value, strength);
};

Object.defineProperty(Subview.prototype, "constraintVariables", {
  get: function (this: Subview<View, View>): ReadonlyArray<ConstrainVariable> {
    let constraintVariables = this._constraintVariables;
    if (constraintVariables === void 0) {
      constraintVariables = [];
      this._constraintVariables = constraintVariables;
    }
    return constraintVariables;
  },
  enumerable: true,
  configurable: true,
});

Subview.prototype.hasConstraintVariable = function (this: Subview<View, View>,
                                                    constraintVariable: ConstrainVariable): boolean {
  const constraintVariables = this._constraintVariables;
  return constraintVariables !== void 0 && constraintVariables.indexOf(constraintVariable) >= 0;
};

Subview.prototype.addConstraintVariable = function (this: Subview<View, View>,
                                                    constraintVariable: ConstrainVariable): void {
  let constraintVariables = this._constraintVariables;
  if (constraintVariables === void 0) {
    constraintVariables = [];
    this._constraintVariables = constraintVariables;
  }
  if (constraintVariables.indexOf(constraintVariable) < 0) {
    constraintVariables.push(constraintVariable);
    this.activateConstraintVariable(constraintVariable);
  }
};

Subview.prototype.removeConstraintVariable = function (this: Subview<View, View>,
                                                       constraintVariable: ConstrainVariable): void {
  const constraintVariables = this._constraintVariables;
  if (constraintVariables !== void 0) {
    const index = constraintVariables.indexOf(constraintVariable);
    if (index >= 0) {
      this.deactivateConstraintVariable(constraintVariable);
      constraintVariables.splice(index, 1);
    }
  }
};

Subview.prototype.activateConstraintVariable = function (this: Subview<View, View>,
                                                         constraintVariable: ConstrainVariable): void {
  this._view.activateConstraintVariable(constraintVariable);
};

Subview.prototype.deactivateConstraintVariable = function (this: Subview<View, View>,
                                                           constraintVariable: ConstrainVariable): void {
  this._view.deactivateConstraintVariable(constraintVariable);
};

Subview.prototype.setConstraintVariable = function (this: Subview<View, View>,
                                                    constraintVariable: ConstrainVariable, state: number): void {
  this._view.setConstraintVariable(constraintVariable, state);
};

Subview.prototype.activateLayout = function (this: Subview<View, View>): void {
  const constraints = this._constraints;
  const constraintVariables = this._constraintVariables;
  if (constraints !== void 0 || constraintVariables !== void 0) {
    if (constraintVariables !== void 0) {
      for (let i = 0, n = constraintVariables.length; i < n; i += 1) {
        this._view.activateConstraintVariable(constraintVariables[i]);
      }
    }
    if (constraints !== void 0) {
      for (let i = 0, n = constraints.length; i < n; i += 1) {
        this._view.activateConstraint(constraints[i]);
      }
    }
  }
};

Subview.prototype.deactivateLayout = function (this: Subview<View, View>): void {
  const constraints = this._constraints;
  const constraintVariables = this._constraintVariables;
  if (constraints !== void 0 || constraintVariables !== void 0) {
    if (constraints !== void 0) {
      for (let i = 0, n = constraints.length; i < n; i += 1) {
        this._view.deactivateConstraint(constraints[i]);
      }
    }
    if (constraintVariables !== void 0) {
      for (let i = 0, n = constraintVariables.length; i < n; i += 1) {
        this._view.deactivateConstraintVariable(constraintVariables[i]);
      }
    }
  }
};

Subview.prototype.mount = function (this: Subview<View, View>): void {
  this.activateLayout();
};

Subview.prototype.unmount = function (this: Subview<View, View>): void {
  this.deactivateLayout();
};

Subview.prototype.insert = function <S extends View>(this: Subview<View, S>,
                                                     parentView?: View | string,
                                                     key?: string): S | null {
  let subview = this._subview;
  if (subview === null) {
    subview = this.createSubview();
  }
  if (subview !== null) {
    if (typeof parentView === "string") {
      key = parentView;
      parentView = void 0;
    }
    if (parentView === void 0) {
      parentView = this._view;
    }
    if (subview.parentView !== parentView) {
      if (key !== void 0) {
        parentView.setChildView(key, subview);
      } else {
        parentView.appendChildView(subview);
      }
    }
    if (this._subview === null) {
      this.doSetSubview(subview);
    }
  }
  return subview;
};

Subview.prototype.remove = function <S extends View>(this: Subview<View, S>): S | null {
  const subview = this._subview;
  if (subview !== null) {
    subview.remove();
  }
  return subview;
};

Subview.prototype.createSubview = function <S extends View, U>(this: Subview<View, S, U>): S | U | null {
  const type = this.type;
  if (type !== void 0) {
    return type.create();
  }
  return null;
};

Subview.prototype.fromAny = function <S extends View, U>(this: Subview<View, S, U>, value: S | U): S | null {
  const type = this.type;
  if (FromAny.is<S, U>(type)) {
    return type.fromAny(value);
  } else if (value instanceof View) {
    return value;
  }
  return null;
};

Subview.define = function <V extends View, S extends View, U, I>(descriptor: SubviewDescriptor<V, S, U, I>): SubviewConstructor<V, S, U, I> {
  let _super = descriptor.extends;
  delete descriptor.extends;

  if (_super === void 0) {
    if (descriptor.observe !== false) {
      _super = Subview.Observer;
    } else {
      _super = Subview;
    }
  }

  const _constructor = function SubviewAccessor(this: Subview<V, S>, view: V, subviewName: string | undefined): Subview<V, S, U> {
    let _this: Subview<V, S, U> = function accessor(subview?: S | U | null): S | null | V {
      if (subview === void 0) {
        return _this._subview;
      } else {
        _this.setSubview(subview);
        return _this._view;
      }
    } as Subview<V, S, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, view, subviewName) || _this;
    return _this;
  } as unknown as SubviewConstructor<V, S, U, I>;

  const _prototype = descriptor as unknown as Subview<V, S, U> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  if (!_prototype.hasOwnProperty("child")) {
    _prototype.child = true;
  }

  return _constructor;
};
