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

import {Mutable, Class, FromAny, Arrays, ObserverType} from "@swim/util";
import {FastenerOwner, FastenerInit, Fastener} from "@swim/fastener";
import {
  AnyConstraintExpression,
  ConstraintExpression,
  ConstraintVariable,
  ConstraintProperty,
  ConstraintRelation,
  AnyConstraintStrength,
  ConstraintStrength,
  Constraint,
  ConstraintScope,
  ConstraintContext,
} from "@swim/constraint";
import {AnyViewFactory, View} from "./View";

export type ViewFastenerType<F extends ViewFastener<any, any, any>> =
  F extends ViewFastener<any, infer V, any> ? V : never;

export type ViewFastenerInitType<F extends ViewFastener<any, any, any>> =
  F extends ViewFastener<any, any, infer U> ? U : never;

export interface ViewFastenerInit<V extends View = View, U = never> extends FastenerInit {
  key?: string | boolean;
  type?: AnyViewFactory<V, U>;
  child?: boolean;
  observes?: boolean

  willSetView?(newView: V | null, oldView: V | null, target: View | null): void;
  onSetView?(newView: V | null, oldView: V | null, target: View | null): void;
  didSetView?(newView: V | null, oldView: V | null, target: View | null): void;

  parentView?: View | null;
  createView?(): V | null;
  insertView?(parent: View, child: V, target: View | null, key: string | undefined): void;
  fromAny?(value: V | U): V | null;
}

export type ViewFastenerDescriptor<O = unknown, V extends View = View, U = never, I = {}> = ThisType<ViewFastener<O, V, U> & I> & ViewFastenerInit<V, U> & Partial<I>;

export interface ViewFastenerClass<F extends ViewFastener<any, any> = ViewFastener<any, any, any>> {
  /** @internal */
  prototype: F;

  create(owner: FastenerOwner<F>, fastenerName: string): F;

  construct(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>, fastenerName: string): F;

  extend<I = {}>(classMembers?: Partial<I> | null): ViewFastenerClass<F> & I;

  define<O, V extends View = View, U = never>(descriptor: ViewFastenerDescriptor<O, V, U>): ViewFastenerClass<ViewFastener<any, V, U>>;
  define<O, V extends View = View, U = never>(descriptor: {observes: boolean} & ViewFastenerDescriptor<O, V, U, ObserverType<V>>): ViewFastenerClass<ViewFastener<any, V, U>>;
  define<O, V extends View = View, U = never, I = {}>(descriptor: ViewFastenerDescriptor<O, V, U, I>): ViewFastenerClass<ViewFastener<any, V, U> & I>;
  define<O, V extends View = View, U = never, I = {}>(descriptor: {observes: boolean} & ViewFastenerDescriptor<O, V, U, I & ObserverType<V>>): ViewFastenerClass<ViewFastener<any, V, U> & I>;

  <O, V extends View = View, U = never>(descriptor: ViewFastenerDescriptor<O, V, U>): PropertyDecorator;
  <O, V extends View = View, U = never>(descriptor: {observes: boolean} & ViewFastenerDescriptor<O, V, U, ObserverType<V>>): PropertyDecorator;
  <O, V extends View = View, U = never, I = {}>(descriptor: ViewFastenerDescriptor<O, V, U, I>): PropertyDecorator;
  <O, V extends View = View, U = never, I = {}>(descriptor: {observes: boolean} & ViewFastenerDescriptor<O, V, U, I & ObserverType<V>>): PropertyDecorator;
}

export interface ViewFastener<O = unknown, V extends View = View, U = never> extends Fastener<O>, ConstraintScope, ConstraintContext {
  (): V | null;
  (view: V | U | null, target?: View | null): O;

  /** @override */
  get familyType(): Class<ViewFastener<any, any, any>> | null;

  /** @protected @override */
  onInherit(superFastener: Fastener): void;

  readonly view: V | null;

  getView(): V;

  setView(newView: V | U | null, target?: View | null): V | null;

  /** @internal */
  setOwnView(newView: V | null, target: View | null): void;

  /** @protected */
  attachView(newView: V): void;

  /** @protected */
  detachView(oldView: V): void;

  /** @protected */
  willSetView(newView: V | null, oldView: V | null, target: View | null): void;

  /** @protected */
  onSetView(newView: V | null, oldView: V | null, target: View | null): void;

  /** @protected */
  didSetView(newView: V | null, oldView: V | null, target: View | null): void;

  readonly key: string | undefined;

  constraint(lhs: AnyConstraintExpression, relation: ConstraintRelation, rhs?: AnyConstraintExpression, strength?: AnyConstraintStrength): Constraint;

  /** @internal */
  readonly constraints: ReadonlyArray<Constraint>;

  /** @override */
  hasConstraint(constraint: Constraint): boolean;

  /** @override */
  addConstraint(constraint: Constraint): void;

  /** @override */
  removeConstraint(constraint: Constraint): void;

  /** @override */
  activateConstraint(constraint: Constraint): void;

  /** @override */
  deactivateConstraint(constraint: Constraint): void;

  /** @override */
  constraintVariable(name: string, value?: number, strength?: AnyConstraintStrength): ConstraintProperty<unknown, number>;

  /** @internal */
  readonly constraintVariables: ReadonlyArray<ConstraintVariable>;

  /** @override */
  hasConstraintVariable(variable: ConstraintVariable): boolean;

  /** @override */
  addConstraintVariable(variable: ConstraintVariable): void;

  /** @override */
  removeConstraintVariable(variable: ConstraintVariable): void;

  /** @override */
  activateConstraintVariable(constraintVariable: ConstraintVariable): void;

  /** @override */
  deactivateConstraintVariable(constraintVariable: ConstraintVariable): void;

  /** @override */
  setConstraintVariable(constraintVariable: ConstraintVariable, state: number): void;

  /** @internal @protected */
  activateLayout(): void;

  /** @internal @protected */
  deactivateLayout(): void;

  /** @internal @protected */
  get parentView(): View | null;

  injectView(parent?: View | null, child?: V | U | null, target?: View | null, key?: string | null): V | null;

  createView(): V | null;

  /** @internal @protected */
  insertView(parent: View, child: V, target: View | null, key: string | undefined): void;

  removeView(): V | null;

  /** @internal @protected */
  fromAny(value: V | U): V | null;

  /** @internal @protected */
  get type(): AnyViewFactory<V, U> | undefined; // optional prototype property

  /** @internal @protected */
  get child(): boolean | undefined; // optional prototype property

  /** @internal @protected */
  get observes(): boolean | undefined; // optional prototype property
}

export const ViewFastener = (function (_super: typeof Fastener) {
  const ViewFastener: ViewFastenerClass = _super.extend();

  Object.defineProperty(ViewFastener.prototype, "familyType", {
    get: function (this: ViewFastener): Class<ViewFastener<any, any, any>> | null {
      return ViewFastener;
    },
    configurable: true,
  });

  ViewFastener.prototype.onInherit = function (this: ViewFastener, superFastener: ViewFastener): void {
    this.setView(superFastener.view);
  };

  ViewFastener.prototype.getView = function <V extends View>(this: ViewFastener<unknown, V>): V {
    const view = this.view;
    if (view === null) {
      throw new TypeError("null " + this.name + " view");
    }
    return view;
  };

  ViewFastener.prototype.setView = function <V extends View>(this: ViewFastener<unknown, V>, newView: V | null, target?: View | null): V | null {
    const oldView = this.view;
    if (newView !== null) {
      newView = this.fromAny(newView);
    }
    if (target === void 0) {
      target = null;
    }
    if (this.child === true) {
      if (newView !== null && newView.parent === null) {
        const parent = this.parentView;
        if (parent !== null) {
          this.insertView(parent, newView, target, this.key);
        }
      } else if (newView === null && oldView !== null) {
        oldView.remove();
      }
    }
    this.setOwnView(newView, target);
    return oldView;
  };

  ViewFastener.prototype.setOwnView = function <V extends View>(this: ViewFastener<unknown, V>, newView: V | null, target: View | null): void {
    const oldView = this.view;
    if (oldView !== newView) {
      this.deactivateLayout();
      this.willSetView(newView, oldView, target);
      if (oldView !== null) {
        this.detachView(oldView);
      }
      (this as Mutable<typeof this>).view = newView;
      if (newView !== null) {
        this.attachView(newView);
      }
      this.onSetView(newView, oldView, target);
      this.didSetView(newView, oldView, target);
    }
  };

  ViewFastener.prototype.attachView = function <V extends View>(this: ViewFastener<unknown, V>, newView: V): void {
    if (this.observes === true) {
      newView.observe(this as ObserverType<V>);
    }
  };

  ViewFastener.prototype.detachView = function <V extends View>(this: ViewFastener<unknown, V>, oldView: V): void {
    if (this.observes === true) {
      oldView.unobserve(this as ObserverType<V>);
    }
  };

  ViewFastener.prototype.willSetView = function <V extends View>(this: ViewFastener<unknown, V>, newView: V | null, oldView: V | null, target: View | null): void {
    // hook
  };

  ViewFastener.prototype.onSetView = function <V extends View>(this: ViewFastener<unknown, V>, newView: V | null, oldView: V | null, target: View | null): void {
    // hook
  };

  ViewFastener.prototype.didSetView = function <V extends View>(this: ViewFastener<unknown, V>, newView: V | null, oldView: V | null, target: View | null): void {
    // hook
  };

  ViewFastener.prototype.constraint = function (this: ViewFastener<ConstraintScope & ConstraintContext, View>, lhs: AnyConstraintExpression, relation: ConstraintRelation, rhs?: AnyConstraintExpression, strength?: AnyConstraintStrength): Constraint {
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

  ViewFastener.prototype.hasConstraint = function (this: ViewFastener, constraint: Constraint): boolean {
    return this.constraints.indexOf(constraint) >= 0;
  };

  ViewFastener.prototype.addConstraint = function (this: ViewFastener, constraint: Constraint): void {
    const oldConstraints = this.constraints;
    const newConstraints = Arrays.inserted(constraint, oldConstraints);
    if (oldConstraints !== newConstraints) {
      (this as Mutable<typeof this>).constraints = newConstraints;
      this.activateConstraint(constraint);
    }
  };

  ViewFastener.prototype.removeConstraint = function (this: ViewFastener, constraint: Constraint): void {
    const oldConstraints = this.constraints;
    const newConstraints = Arrays.removed(constraint, oldConstraints);
    if (oldConstraints !== newConstraints) {
      this.deactivateConstraint(constraint);
      (this as Mutable<typeof this>).constraints = newConstraints;
    }
  };

  ViewFastener.prototype.activateConstraint = function (this: ViewFastener<ConstraintContext, View>, constraint: Constraint): void {
    this.owner.activateConstraint(constraint);
  };

  ViewFastener.prototype.deactivateConstraint = function (this: ViewFastener<ConstraintContext, View>, constraint: Constraint): void {
    this.owner.deactivateConstraint(constraint);
  };

  ViewFastener.prototype.constraintVariable = function (this: ViewFastener, name: string, value?: number, strength?: AnyConstraintStrength): ConstraintProperty<unknown, number> {
    if (value === void 0) {
      value = 0;
    }
    if (strength !== void 0) {
      strength = ConstraintStrength.fromAny(strength);
    } else {
      strength = ConstraintStrength.Strong;
    }
    const property = ConstraintProperty.create(this, name) as ConstraintProperty<unknown, number>;
    if (value !== void 0) {
      property.setState(value);
    }
    property.setStrength(strength);
    property.mount();
    return property;
  };

  ViewFastener.prototype.hasConstraintVariable = function (this: ViewFastener, constraintVariable: ConstraintVariable): boolean {
    return this.constraintVariables.indexOf(constraintVariable) >= 0;
  };

  ViewFastener.prototype.addConstraintVariable = function (this: ViewFastener, constraintVariable: ConstraintVariable): void {
    const oldConstraintVariables = this.constraintVariables;
    const newConstraintVariables = Arrays.inserted(constraintVariable, oldConstraintVariables);
    if (oldConstraintVariables !== newConstraintVariables) {
      (this as Mutable<typeof this>).constraintVariables = newConstraintVariables;
      this.activateConstraintVariable(constraintVariable);
    }
  };

  ViewFastener.prototype.removeConstraintVariable = function (this: ViewFastener, constraintVariable: ConstraintVariable): void {
    const oldConstraintVariables = this.constraintVariables;
    const newConstraintVariables = Arrays.removed(constraintVariable, oldConstraintVariables);
    if (oldConstraintVariables !== newConstraintVariables) {
      this.deactivateConstraintVariable(constraintVariable);
      (this as Mutable<typeof this>).constraintVariables = newConstraintVariables;
    }
  };

  ViewFastener.prototype.activateConstraintVariable = function (this: ViewFastener<ConstraintContext, View>, constraintVariable: ConstraintVariable): void {
    this.owner.activateConstraintVariable(constraintVariable);
  };

  ViewFastener.prototype.deactivateConstraintVariable = function (this: ViewFastener<ConstraintContext, View>, constraintVariable: ConstraintVariable): void {
    this.owner.deactivateConstraintVariable(constraintVariable);
  };

  ViewFastener.prototype.setConstraintVariable = function (this: ViewFastener<ConstraintContext, View>, constraintVariable: ConstraintVariable, state: number): void {
    this.owner.setConstraintVariable(constraintVariable, state);
  };

  ViewFastener.prototype.activateLayout = function (this: ViewFastener<ConstraintContext, View>): void {
    const constraintVariables = this.constraintVariables;
    for (let i = 0, n = constraintVariables.length; i < n; i += 1) {
      this.owner.activateConstraintVariable(constraintVariables[i]!);
    }
    const constraints = this.constraints;
    for (let i = 0, n = constraints.length; i < n; i += 1) {
      this.owner.activateConstraint(constraints[i]!);
    }
  };

  ViewFastener.prototype.deactivateLayout = function (this: ViewFastener<ConstraintContext, View>): void {
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
    get(this: ViewFastener): View | null {
      const owner = this.owner;
      return owner instanceof View ? owner : null;
    },
    configurable: true,
  });

  ViewFastener.prototype.injectView = function <V extends View>(this: ViewFastener<unknown, V>, parent?: View | null, child?: V | null, target?: View | null, key?: string | null): V | null {
    if (target === void 0) {
      target = null;
    }
    if (child === void 0 || child === null) {
      child = this.view;
      if (child === null) {
        child = this.createView();
      }
    } else {
      child = this.fromAny(child);
      if (child !== null) {
        this.setOwnView(child, target);
      }
    }
    if (child !== null) {
      if (parent === void 0 || parent === null) {
        parent = this.parentView;
      }
      if (key === void 0) {
        key = this.key;
      } else if (key === null) {
        key = void 0;
      }
      if (parent !== null && (child.parent !== parent || child.key !== key)) {
        this.insertView(parent, child, target, key);
      }
      if (this.view === null) {
        this.setOwnView(child, target);
      }
    }
    return child;
  };

  ViewFastener.prototype.createView = function <V extends View, U>(this: ViewFastener<unknown, V, U>): V | null {
    const type = this.type;
    if (type !== void 0 && type.create !== void 0) {
      return type.create();
    }
    return null;
  };

  ViewFastener.prototype.insertView = function <V extends View>(this: ViewFastener<unknown, V>, parent: View, child: V, target: View | null, key: string | undefined): void {
    parent.insertChild(child, target, key);
  };

  ViewFastener.prototype.removeView = function <V extends View>(this: ViewFastener<unknown, V>): V | null {
    const view = this.view;
    if (view !== null) {
      view.remove();
    }
    return view;
  };

  ViewFastener.prototype.fromAny = function <V extends View, U>(this: ViewFastener<unknown, V, U>, value: V | U): V | null {
    const type = this.type;
    if (FromAny.is<V, U>(type)) {
      return type.fromAny(value);
    } else if (value instanceof View) {
      return value;
    }
    return null;
  };

  ViewFastener.prototype.onMount = function (this: ViewFastener): void {
    _super.prototype.onMount.call(this);
    this.activateLayout();
  };

  ViewFastener.prototype.onUnmount = function (this: ViewFastener): void {
    this.deactivateLayout();
    _super.prototype.onUnmount.call(this);
  };

  ViewFastener.construct = function <F extends ViewFastener<any, any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>, fastenerName: string): F {
    if (fastener === null) {
      fastener = function ViewFastener(view?: ViewFastenerType<F> | ViewFastenerInitType<F> | null, target?: View | null): ViewFastenerType<F> | null | FastenerOwner<F> {
        if (view === void 0) {
          return fastener!.view;
        } else {
          fastener!.setView(view, target);
          return fastener!.owner;
        }
      } as F;
      Object.setPrototypeOf(fastener, fastenerClass.prototype);
    }
    fastener = _super.construct(fastenerClass, fastener, owner, fastenerName) as F;
    (fastener as Mutable<typeof fastener>).key = void 0;
    (fastener as Mutable<typeof fastener>).view = null;
    (fastener as Mutable<typeof fastener>).constraints = Arrays.empty;
    (fastener as Mutable<typeof fastener>).constraintVariables = Arrays.empty;
    return fastener;
  };

  ViewFastener.define = function <O, V extends View, U>(descriptor: ViewFastenerDescriptor<O, V, U>): ViewFastenerClass<ViewFastener<any, V, U>> {
    let superClass = descriptor.extends as ViewFastenerClass | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const key = descriptor.key;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.key;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: ViewFastener<any, any, any>}, fastener: ViewFastener<O, V, U> | null, owner: O, fastenerName: string): ViewFastener<O, V, U> {
      fastener = superClass!.construct(fastenerClass, fastener, owner, fastenerName);
      if (affinity !== void 0) {
        fastener.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        fastener.initInherits(inherits);
      }
      if (typeof key === "string") {
        (fastener as Mutable<typeof fastener>).key = key;
      } else if (key === true) {
        (fastener as Mutable<typeof fastener>).key = fastenerName;
      }
      return fastener;
    };

    return fastenerClass;
  };

  return ViewFastener;
})(Fastener);
