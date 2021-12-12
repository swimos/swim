// Copyright 2015-2021 Swim.inc
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

import {Mutable, Proto, Arrays, ObserverType} from "@swim/util";
import type {FastenerOwner, Fastener} from "@swim/component";
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
import type {AnyView, View} from "./View";
import {ViewRelationInit, ViewRelationClass, ViewRelation} from "./ViewRelation";

/** @internal */
export type ViewRefType<F extends ViewRef<any, any>> =
  F extends ViewRef<any, infer V> ? V : never;

/** @public */
export interface ViewRefInit<V extends View = View> extends ViewRelationInit<V> {
  extends?: {prototype: ViewRef<any, any>} | string | boolean | null;
  key?: string | boolean;
}

/** @public */
export type ViewRefDescriptor<O = unknown, V extends View = View, I = {}> = ThisType<ViewRef<O, V> & I> & ViewRefInit<V> & Partial<I>;

/** @public */
export interface ViewRefClass<F extends ViewRef<any, any> = ViewRef<any, any>> extends ViewRelationClass<F> {
}

/** @public */
export interface ViewRefFactory<F extends ViewRef<any, any> = ViewRef<any, any>> extends ViewRefClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): ViewRefFactory<F> & I;

  define<O, V extends View = View>(className: string, descriptor: ViewRefDescriptor<O, V>): ViewRefFactory<ViewRef<any, V>>;
  define<O, V extends View = View>(className: string, descriptor: {observes: boolean} & ViewRefDescriptor<O, V, ObserverType<V>>): ViewRefFactory<ViewRef<any, V>>;
  define<O, V extends View = View, I = {}>(className: string, descriptor: {implements: unknown} & ViewRefDescriptor<O, V, I>): ViewRefFactory<ViewRef<any, V> & I>;
  define<O, V extends View = View, I = {}>(className: string, descriptor: {implements: unknown; observes: boolean} & ViewRefDescriptor<O, V, I & ObserverType<V>>): ViewRefFactory<ViewRef<any, V> & I>;

  <O, V extends View = View>(descriptor: ViewRefDescriptor<O, V>): PropertyDecorator;
  <O, V extends View = View>(descriptor: {observes: boolean} & ViewRefDescriptor<O, V, ObserverType<V>>): PropertyDecorator;
  <O, V extends View = View, I = {}>(descriptor: {implements: unknown} & ViewRefDescriptor<O, V, I>): PropertyDecorator;
  <O, V extends View = View, I = {}>(descriptor: {implements: unknown; observes: boolean} & ViewRefDescriptor<O, V, I & ObserverType<V>>): PropertyDecorator;
}

/** @public */
export interface ViewRef<O = unknown, V extends View = View> extends ViewRelation<O, V>, ConstraintScope, ConstraintContext {
  (): V | null;
  (view: AnyView<V> | null, target?: View | null, key?: string): O;

  /** @override */
  get fastenerType(): Proto<ViewRef<any, any>>;

  /** @protected @override */
  onInherit(superFastener: Fastener): void;

  readonly view: V | null;

  getView(): V;

  setView(view: AnyView<V> | null, target?: View | null, key?: string): V | null;

  attachView(view?: AnyView<V>, target?: View | null): V;

  detachView(): V | null;

  insertView(parent?: View | null, view?: AnyView<V>, target?: View | null, key?: string): V;

  removeView(): V | null;

  deleteView(): V | null;

  /** @internal @override */
  bindView(view: View, target: View | null): void;

  /** @internal @override */
  unbindView(view: View): void;

  /** @override */
  detectView(view: View): V | null;

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

  /** @protected @override */
  onMount(): void;

  /** @protected @override */
  onUnmount(): void;

  /** @internal */
  get key(): string | undefined; // optional prototype field
}

/** @public */
export const ViewRef = (function (_super: typeof ViewRelation) {
  const ViewRef: ViewRefFactory = _super.extend("ViewRef");

  Object.defineProperty(ViewRef.prototype, "fastenerType", {
    get: function (this: ViewRef): Proto<ViewRef<any, any>> {
      return ViewRef;
    },
    configurable: true,
  });

  ViewRef.prototype.onInherit = function (this: ViewRef, superFastener: ViewRef): void {
    this.setView(superFastener.view);
  };

  ViewRef.prototype.getView = function <V extends View>(this: ViewRef<unknown, V>): V {
    const view = this.view;
    if (view === null) {
      let message = view + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "view";
      throw new TypeError(message);
    }
    return view;
  };

  ViewRef.prototype.setView = function <V extends View>(this: ViewRef<unknown, V>, newView: AnyView<V> | null, target?: View | null, key?: string): V | null {
    if (newView !== null) {
      newView = this.fromAny(newView);
    }
    let oldView = this.view;
    if (oldView !== newView) {
      if (target === void 0) {
        target = null;
      }
      let parent: View | null;
      if (this.binds && (parent = this.parentView, parent !== null)) {
        if (oldView !== null && oldView.parent === parent) {
          if (target === null) {
            target = oldView.nextSibling;
          }
          oldView.remove();
        }
        if (newView !== null) {
          if (key === void 0) {
            key = this.key;
          }
          this.insertChild(parent, newView, target, key);
        }
        oldView = this.view;
      }
      if (oldView !== newView) {
        if (oldView !== null) {
          this.deactivateLayout();
          this.willDetachView(oldView);
          (this as Mutable<typeof this>).view = null;
          this.onDetachView(oldView);
          this.deinitView(oldView);
          this.didDetachView(oldView);
        }
        if (newView !== null) {
          this.willAttachView(newView, target);
          (this as Mutable<typeof this>).view = newView;
          this.onAttachView(newView, target);
          this.initView(newView);
          this.didAttachView(newView, target);
        }
      }
    }
    return oldView;
  };

  ViewRef.prototype.attachView = function <V extends View>(this: ViewRef<unknown, V>, newView?: AnyView<V>, target?: View | null): V {
    const oldView = this.view;
    if (newView !== void 0 && newView !== null) {
      newView = this.fromAny(newView);
    } else if (oldView === null) {
      newView = this.createView();
    } else {
      newView = oldView;
    }
    if (newView !== oldView) {
      if (target === void 0) {
        target = null;
      }
      if (oldView !== null) {
        this.deactivateLayout();
        this.willDetachView(oldView);
        (this as Mutable<typeof this>).view = null;
        this.onDetachView(oldView);
        this.deinitView(oldView);
        this.didDetachView(oldView);
      }
      this.willAttachView(newView, target);
      (this as Mutable<typeof this>).view = newView;
      this.onAttachView(newView, target);
      this.initView(newView);
      this.didAttachView(newView, target);
    }
    return newView;
  };

  ViewRef.prototype.detachView = function <V extends View>(this: ViewRef<unknown, V>): V | null {
    const oldView = this.view;
    if (oldView !== null) {
      this.deactivateLayout();
      this.willDetachView(oldView);
      (this as Mutable<typeof this>).view = null;
      this.onDetachView(oldView);
      this.deinitView(oldView);
      this.didDetachView(oldView);
    }
    return oldView;
  };

  ViewRef.prototype.insertView = function <V extends View>(this: ViewRef<unknown, V>, parent?: View | null, newView?: AnyView<V>, target?: View | null, key?: string): V {
    if (newView !== void 0 && newView !== null) {
      newView = this.fromAny(newView);
    } else {
      const oldView = this.view;
      if (oldView === null) {
        newView = this.createView();
      } else {
        newView = oldView;
      }
    }
    if (parent === void 0 || parent === null) {
      parent = this.parentView;
    }
    if (target === void 0) {
      target = null;
    }
    if (key === void 0) {
      key = this.key;
    }
    if (parent !== null && (newView.parent !== parent || newView.key !== key)) {
      this.insertChild(parent, newView, target, key);
    }
    const oldView = this.view;
    if (newView !== oldView) {
      if (oldView !== null) {
        this.deactivateLayout();
        this.willDetachView(oldView);
        (this as Mutable<typeof this>).view = null;
        this.onDetachView(oldView);
        this.deinitView(oldView);
        this.didDetachView(oldView);
        oldView.remove();
      }
      this.willAttachView(newView, target);
      (this as Mutable<typeof this>).view = newView;
      this.onAttachView(newView, target);
      this.initView(newView);
      this.didAttachView(newView, target);
    }
    return newView;
  };

  ViewRef.prototype.removeView = function <V extends View>(this: ViewRef<unknown, V>): V | null {
    const view = this.view;
    if (view !== null) {
      view.remove();
    }
    return view;
  };

  ViewRef.prototype.deleteView = function <V extends View>(this: ViewRef<unknown, V>): V | null {
    const view = this.detachView();
    if (view !== null) {
      view.remove();
    }
    return view;
  };

  ViewRef.prototype.bindView = function <V extends View>(this: ViewRef<unknown, V>, view: View, target: View | null): void {
    if (this.binds && this.view === null) {
      const newView = this.detectView(view);
      if (newView !== null) {
        this.willAttachView(newView, target);
        (this as Mutable<typeof this>).view = newView;
        this.onAttachView(newView, target);
        this.initView(newView);
        this.didAttachView(newView, target);
      }
    }
  };

  ViewRef.prototype.unbindView = function <V extends View>(this: ViewRef<unknown, V>, view: View): void {
    if (this.binds) {
      const oldView = this.detectView(view);
      if (oldView !== null && this.view === oldView) {
        this.deactivateLayout();
        this.willDetachView(oldView);
        (this as Mutable<typeof this>).view = null;
        this.onDetachView(oldView);
        this.deinitView(oldView);
        this.didDetachView(oldView);
      }
    }
  };

  ViewRef.prototype.detectView = function <V extends View>(this: ViewRef<unknown, V>, view: View): V | null {
    const key = this.key;
    if (key !== void 0 && key === view.key) {
      return view as V;
    }
    return null;
  };

  ViewRef.prototype.constraint = function (this: ViewRef<ConstraintScope & ConstraintContext, View>, lhs: AnyConstraintExpression, relation: ConstraintRelation, rhs?: AnyConstraintExpression, strength?: AnyConstraintStrength): Constraint {
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

  ViewRef.prototype.hasConstraint = function (this: ViewRef, constraint: Constraint): boolean {
    return this.constraints.indexOf(constraint) >= 0;
  };

  ViewRef.prototype.addConstraint = function (this: ViewRef, constraint: Constraint): void {
    const oldConstraints = this.constraints;
    const newConstraints = Arrays.inserted(constraint, oldConstraints);
    if (oldConstraints !== newConstraints) {
      (this as Mutable<typeof this>).constraints = newConstraints;
      this.activateConstraint(constraint);
    }
  };

  ViewRef.prototype.removeConstraint = function (this: ViewRef, constraint: Constraint): void {
    const oldConstraints = this.constraints;
    const newConstraints = Arrays.removed(constraint, oldConstraints);
    if (oldConstraints !== newConstraints) {
      this.deactivateConstraint(constraint);
      (this as Mutable<typeof this>).constraints = newConstraints;
    }
  };

  ViewRef.prototype.activateConstraint = function (this: ViewRef<ConstraintContext, View>, constraint: Constraint): void {
    this.owner.activateConstraint(constraint);
  };

  ViewRef.prototype.deactivateConstraint = function (this: ViewRef<ConstraintContext, View>, constraint: Constraint): void {
    this.owner.deactivateConstraint(constraint);
  };

  ViewRef.prototype.constraintVariable = function (this: ViewRef, name: string, value?: number, strength?: AnyConstraintStrength): ConstraintProperty<unknown, number> {
    if (value === void 0) {
      value = 0;
    }
    if (strength !== void 0) {
      strength = ConstraintStrength.fromAny(strength);
    } else {
      strength = ConstraintStrength.Strong;
    }
    const property = ConstraintProperty.create(this) as ConstraintProperty<unknown, number>;
    Object.defineProperty(property, "name", {
      value: name,
      configurable: true,
    });
    if (value !== void 0) {
      property.setValue(value);
    }
    property.setStrength(strength);
    property.mount();
    return property;
  };

  ViewRef.prototype.hasConstraintVariable = function (this: ViewRef, constraintVariable: ConstraintVariable): boolean {
    return this.constraintVariables.indexOf(constraintVariable) >= 0;
  };

  ViewRef.prototype.addConstraintVariable = function (this: ViewRef, constraintVariable: ConstraintVariable): void {
    const oldConstraintVariables = this.constraintVariables;
    const newConstraintVariables = Arrays.inserted(constraintVariable, oldConstraintVariables);
    if (oldConstraintVariables !== newConstraintVariables) {
      (this as Mutable<typeof this>).constraintVariables = newConstraintVariables;
      this.activateConstraintVariable(constraintVariable);
    }
  };

  ViewRef.prototype.removeConstraintVariable = function (this: ViewRef, constraintVariable: ConstraintVariable): void {
    const oldConstraintVariables = this.constraintVariables;
    const newConstraintVariables = Arrays.removed(constraintVariable, oldConstraintVariables);
    if (oldConstraintVariables !== newConstraintVariables) {
      this.deactivateConstraintVariable(constraintVariable);
      (this as Mutable<typeof this>).constraintVariables = newConstraintVariables;
    }
  };

  ViewRef.prototype.activateConstraintVariable = function (this: ViewRef<ConstraintContext, View>, constraintVariable: ConstraintVariable): void {
    this.owner.activateConstraintVariable(constraintVariable);
  };

  ViewRef.prototype.deactivateConstraintVariable = function (this: ViewRef<ConstraintContext, View>, constraintVariable: ConstraintVariable): void {
    this.owner.deactivateConstraintVariable(constraintVariable);
  };

  ViewRef.prototype.setConstraintVariable = function (this: ViewRef<ConstraintContext, View>, constraintVariable: ConstraintVariable, state: number): void {
    this.owner.setConstraintVariable(constraintVariable, state);
  };

  ViewRef.prototype.activateLayout = function (this: ViewRef<ConstraintContext, View>): void {
    const constraintVariables = this.constraintVariables;
    for (let i = 0, n = constraintVariables.length; i < n; i += 1) {
      this.owner.activateConstraintVariable(constraintVariables[i]!);
    }
    const constraints = this.constraints;
    for (let i = 0, n = constraints.length; i < n; i += 1) {
      this.owner.activateConstraint(constraints[i]!);
    }
  };

  ViewRef.prototype.deactivateLayout = function (this: ViewRef<ConstraintContext, View>): void {
    const constraints = this.constraints;
    for (let i = 0, n = constraints.length; i < n; i += 1) {
      this.owner.deactivateConstraint(constraints[i]!);
    }
    const constraintVariables = this.constraintVariables;
    for (let i = 0, n = constraintVariables.length; i < n; i += 1) {
      this.owner.deactivateConstraintVariable(constraintVariables[i]!);
    }
  };

  ViewRef.prototype.onMount = function (this: ViewRef): void {
    _super.prototype.onMount.call(this);
    this.activateLayout();
  };

  ViewRef.prototype.onUnmount = function (this: ViewRef): void {
    this.deactivateLayout();
    _super.prototype.onUnmount.call(this);
  };

  ViewRef.construct = function <F extends ViewRef<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (view?: AnyView<ViewRefType<F>> | null, target?: View | null, key?: string): ViewRefType<F> | null | FastenerOwner<F> {
        if (view === void 0) {
          return fastener!.view;
        } else {
          fastener!.setView(view, target, key);
          return fastener!.owner;
        }
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, fastenerClass.prototype);
    }
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).view = null;
    (fastener as Mutable<typeof fastener>).constraints = Arrays.empty;
    (fastener as Mutable<typeof fastener>).constraintVariables = Arrays.empty;
    return fastener;
  };

  ViewRef.define = function <O, V extends View>(className: string, descriptor: ViewRefDescriptor<O, V>): ViewRefFactory<ViewRef<any, V>> {
    let superClass = descriptor.extends as ViewRefFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    delete descriptor.extends;
    delete descriptor.implements;
    delete descriptor.affinity;
    delete descriptor.inherits;

    if (descriptor.key === true) {
      Object.defineProperty(descriptor, "key", {
        value: className,
        configurable: true,
      });
    } else if (descriptor.key === false) {
      Object.defineProperty(descriptor, "key", {
        value: void 0,
        configurable: true,
      });
    }

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: ViewRef<any, any>}, fastener: ViewRef<O, V> | null, owner: O): ViewRef<O, V> {
      fastener = superClass!.construct(fastenerClass, fastener, owner);
      if (affinity !== void 0) {
        fastener.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        fastener.initInherits(inherits);
      }
      return fastener;
    };

    return fastenerClass;
  };

  return ViewRef;
})(ViewRelation);
