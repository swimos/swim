// Copyright 2015-2024 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import type {Proto} from "@swim/util";
import type {LikeType} from "@swim/util";
import {Affinity} from "@swim/component";
import {FastenerContext} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import {Fastener} from "@swim/component";
import type {ConstraintExpressionLike} from "@swim/constraint";
import {ConstraintExpression} from "@swim/constraint";
import type {ConstraintVariable} from "@swim/constraint";
import {ConstraintProperty} from "@swim/constraint";
import type {ConstraintRelation} from "@swim/constraint";
import type {ConstraintStrengthLike} from "@swim/constraint";
import {ConstraintStrength} from "@swim/constraint";
import {Constraint} from "@swim/constraint";
import {ConstraintScope} from "@swim/constraint";
import {ConstraintContext} from "@swim/constraint";
import type {View} from "./View";
import type {ViewRelationDescriptor} from "./ViewRelation";
import type {ViewRelationClass} from "./ViewRelation";
import {ViewRelation} from "./ViewRelation";

/** @public */
export interface ViewRefDescriptor<R, V extends View> extends ViewRelationDescriptor<R, V> {
  extends?: Proto<ViewRef<any, any, any>> | boolean | null;
  viewKey?: string | boolean;
}

/** @public */
export interface ViewRefClass<F extends ViewRef<any, any, any> = ViewRef<any, any, any>> extends ViewRelationClass<F> {
  tryView<R, K extends keyof R, F extends R[K] = R[K]>(owner: R, fastenerName: K): (F extends {readonly view: infer V | null} ? V | null : never) | null;
}

/** @public */
export interface ViewRef<R = any, V extends View = View, I extends any[] = [V | null]> extends ViewRelation<R, V, I>, ConstraintScope, ConstraintContext {
  /** @override */
  get descriptorType(): Proto<ViewRefDescriptor<R, V>>;

  /** @override */
  get fastenerType(): Proto<ViewRef<any, any, any>>;

  /** @override */
  get parent(): ViewRef<any, V, any> | null;

  get inletView(): V | null;

  getInletView(): V;

  get(): V | null;

  set(view: V | LikeType<V> | Fastener<any, I[0], any> | null): R;

  setIntrinsic(view: V | LikeType<V> | Fastener<any, I[0], any> | null): R;

  get viewKey(): string | undefined;

  readonly view: V | null;

  getView(): V;

  setView(view: V | LikeType<V> | null, target?: View | null, key?: string): V | null;

  attachView(view?: V | LikeType<V> | null, target?: View | null): V;

  detachView(): V | null;

  insertView(parent?: View | null, view?: V | LikeType<V>, target?: View | null, key?: string): V;

  removeView(): V | null;

  deleteView(): V | null;

  /** @internal @override */
  bindView(view: View, target: View | null): void;

  /** @internal @override */
  unbindView(view: View): void;

  /** @override */
  detectView(view: View): V | null;

  /** @override */
  recohere(t: number): void;

  constraint(lhs: ConstraintExpressionLike, relation: ConstraintRelation, rhs?: ConstraintExpressionLike, strength?: ConstraintStrengthLike): Constraint;

  /** @internal */
  readonly constraints: ReadonlySet<Constraint> | null;

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
  constraintVariable(name: string, value?: number, strength?: ConstraintStrengthLike): ConstraintProperty<any, number>;

  /** @internal */
  readonly constraintVariables: ReadonlySet<ConstraintVariable> | null;

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
}

/** @public */
export const ViewRef = (<R, V extends View, I extends any[], F extends ViewRef<any, any, any>>() => ViewRelation.extend<ViewRef<R, V, I>, ViewRefClass<F>>("ViewRef", {
  get fastenerType(): Proto<ViewRef<any, any, any>> {
    return ViewRef;
  },

  get inletView(): V | null {
    const inlet = this.inlet;
    return inlet instanceof ViewRef ? inlet.view : null;
  },

  getInletView(): V {
    const inletView = this.inletView;
    if (inletView === void 0 || inletView === null) {
      let message = inletView + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "inlet view";
      throw new TypeError(message);
    }
    return inletView;
  },

  get(): V | null {
    return this.view;
  },

  set(view: V | LikeType<V> | Fastener<any, I[0], any> | null): R {
    if (view instanceof Fastener) {
      this.bindInlet(view);
    } else {
      this.setView(view);
    }
    return this.owner;
  },

  setIntrinsic(view: V | LikeType<V> | Fastener<any, I[0], any> | null): R {
    if (view instanceof Fastener) {
      this.bindInlet(view);
    } else {
      this.setView(view);
    }
    return this.owner;
  },

  viewKey: void 0,

  getView(): V {
    const view = this.view;
    if (view === null) {
      let message = view + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "view";
      throw new TypeError(message);
    }
    return view;
  },

  setView(newView: V | LikeType<V> | null, target?: View | null, key?: string): V | null {
    if (newView !== null) {
      newView = this.fromLike(newView);
    }
    let oldView = this.view;
    if (oldView === newView) {
      this.setCoherent(true);
      return oldView;
    } else if (target === void 0) {
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
          key = this.viewKey;
        }
        this.insertChild(parent, newView, target, key);
      }
      oldView = this.view;
      if (oldView === newView) {
        return oldView;
      }
    }
    if (oldView !== null) {
      this.deactivateLayout();
      (this as Mutable<typeof this>).view = null;
      this.willDetachView(oldView);
      this.onDetachView(oldView);
      this.deinitView(oldView);
      this.didDetachView(oldView);
    }
    if (newView !== null) {
      (this as Mutable<typeof this>).view = newView;
      this.willAttachView(newView, target);
      this.onAttachView(newView, target);
      this.initView(newView);
      this.didAttachView(newView, target);
    }
    this.setCoherent(true);
    this.decohereOutlets();
    return oldView;
  },

  attachView(newView?: V | LikeType<V> | null, target?: View | null): V {
    const oldView = this.view;
    if (newView !== void 0 && newView !== null) {
      newView = this.fromLike(newView);
    } else if (oldView === null) {
      newView = this.createView();
    } else {
      newView = oldView;
    }
    if (target === void 0) {
      target = null;
    }
    if (oldView === newView) {
      return newView;
    } else if (oldView !== null) {
      this.deactivateLayout();
      (this as Mutable<typeof this>).view = null;
      this.willDetachView(oldView);
      this.onDetachView(oldView);
      this.deinitView(oldView);
      this.didDetachView(oldView);
    }
    (this as Mutable<typeof this>).view = newView;
    this.willAttachView(newView, target);
    this.onAttachView(newView, target);
    this.initView(newView);
    this.didAttachView(newView, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newView;
  },

  detachView(): V | null {
    const oldView = this.view;
    if (oldView === null) {
      return null;
    }
    this.deactivateLayout();
    (this as Mutable<typeof this>).view = null;
    this.willDetachView(oldView);
    this.onDetachView(oldView);
    this.deinitView(oldView);
    this.didDetachView(oldView);
    this.setCoherent(true);
    this.decohereOutlets();
    return oldView;
  },

  insertView(parent?: View | null, newView?: V | LikeType<V>, target?: View | null, key?: string): V {
    let oldView = this.view;
    if (newView !== void 0 && newView !== null) {
      newView = this.fromLike(newView);
    } else if (oldView === null) {
      newView = this.createView();
    } else {
      newView = oldView;
    }
    if (parent === void 0) {
      parent = null;
    }
    if (!this.binds && oldView === newView && newView.parent !== null && parent === null && key === void 0) {
      return newView;
    }
    if (parent === null) {
      parent = this.parentView;
    }
    if (target === void 0) {
      target = null;
    }
    if (key === void 0) {
      key = this.viewKey;
    }
    if (parent !== null && (newView.parent !== parent || newView.key !== key)) {
      this.insertChild(parent, newView, target, key);
    }
    oldView = this.view;
    if (oldView === newView) {
      return newView;
    } else if (oldView !== null) {
      this.deactivateLayout();
      (this as Mutable<typeof this>).view = null;
      this.willDetachView(oldView);
      this.onDetachView(oldView);
      this.deinitView(oldView);
      this.didDetachView(oldView);
      if (this.binds && parent !== null && oldView.parent === parent) {
        oldView.remove();
      }
    }
    (this as Mutable<typeof this>).view = newView;
    this.willAttachView(newView, target);
    this.onAttachView(newView, target);
    this.initView(newView);
    this.didAttachView(newView, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newView;
  },

  removeView(): V | null {
    const view = this.view;
    if (view === null) {
      return null;
    }
    view.remove();
    return view;
  },

  deleteView(): V | null {
    const view = this.detachView();
    if (view === null) {
      return null;
    }
    view.remove();
    return view;
  },

  bindView(view: View, target: View | null): void {
    if (!this.binds || this.view !== null) {
      return;
    }
    const newView = this.detectView(view);
    if (newView === null) {
      return;
    }
    (this as Mutable<typeof this>).view = newView;
    this.willAttachView(newView, target);
    this.onAttachView(newView, target);
    this.initView(newView);
    this.didAttachView(newView, target);
    this.setCoherent(true);
    this.decohereOutlets();
  },

  unbindView(view: View): void {
    if (!this.binds) {
      return;
    }
    const oldView = this.detectView(view);
    if (oldView === null || this.view !== oldView) {
      return;
    }
    this.deactivateLayout();
    (this as Mutable<typeof this>).view = null;
    this.willDetachView(oldView);
    this.onDetachView(oldView);
    this.deinitView(oldView);
    this.didDetachView(oldView);
    this.setCoherent(true);
    this.decohereOutlets();
  },

  detectView(view: View): V | null {
    const key = this.viewKey;
    if (key !== void 0 && key === view.key) {
      return view as V;
    }
    return null;
  },

  recohere(t: number): void {
    this.setCoherentTime(t);
    const inlet = this.inlet;
    if (inlet instanceof ViewRef) {
      this.setDerived((this.flags & Affinity.Mask) <= Math.min(inlet.flags & Affinity.Mask, Affinity.Intrinsic));
      if ((this.flags & Fastener.DerivedFlag) !== 0) {
        this.setView(inlet.view);
      }
    } else {
      this.setDerived(false);
    }
  },

  constraint(lhs: ConstraintExpressionLike, relation: ConstraintRelation, rhs?: ConstraintExpressionLike, strength?: ConstraintStrengthLike): Constraint {
    if (!ConstraintScope[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint scope");
    }
    lhs = ConstraintExpression.fromLike(lhs);
    rhs = ConstraintExpression.fromLike(rhs);
    const expression = rhs !== void 0 ? lhs.minus(rhs) : lhs;
    if (strength === void 0) {
      strength = ConstraintStrength.Required;
    } else {
      strength = ConstraintStrength.fromLike(strength);
    }
    const constraint = new Constraint(this.owner, expression, relation, strength);
    this.addConstraint(constraint);
    return constraint;
  },

  hasConstraint(constraint: Constraint): boolean {
    const constraints = this.constraints;
    return constraints !== null && constraints.has(constraint);
  },

  addConstraint(constraint: Constraint): void {
    let constraints = this.constraints as Set<Constraint> | null;
    if (constraints === null) {
      constraints = new Set<Constraint>();
      (this as Mutable<typeof this>).constraints = constraints;
    } else if (constraints.has(constraint)) {
      return;
    }
    constraints.add(constraint);
    this.activateConstraint(constraint);
  },

  removeConstraint(constraint: Constraint): void {
    const constraints = this.constraints as Set<Constraint> | null;
    if (constraints === null || !constraints.has(constraint)) {
      return;
    }
    this.deactivateConstraint(constraint);
    constraints.delete(constraint);
  },

  activateConstraint(constraint: Constraint): void {
    if (!ConstraintContext[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint context");
    }
    this.owner.activateConstraint(constraint);
  },

  deactivateConstraint(constraint: Constraint): void {
    if (!ConstraintContext[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint context");
    }
    this.owner.deactivateConstraint(constraint);
  },

  constraintVariable(name: string, value?: number, strength?: ConstraintStrengthLike): ConstraintProperty<unknown, number> {
    if (value === void 0) {
      value = 0;
    }
    if (strength !== void 0) {
      strength = ConstraintStrength.fromLike(strength);
    } else {
      strength = ConstraintStrength.Strong;
    }
    const property = ConstraintProperty.create(this) as ConstraintProperty<unknown, number>;
    Object.defineProperty(property, "name", {
      value: name,
      enumerable: true,
      configurable: true,
    });
    if (value !== void 0) {
      property.set(value);
    }
    property.setStrength(strength);
    property.mount();
    return property;
  },

  hasConstraintVariable(constraintVariable: ConstraintVariable): boolean {
    const constraintVariables = this.constraintVariables;
    return constraintVariables !== null && constraintVariables.has(constraintVariable);
  },

  addConstraintVariable(constraintVariable: ConstraintVariable): void {
    let constraintVariables = this.constraintVariables as Set<ConstraintVariable> | null;
    if (constraintVariables === null) {
      constraintVariables = new Set<ConstraintVariable>();
      (this as Mutable<typeof this>).constraintVariables = constraintVariables;
    } else if (constraintVariables.has(constraintVariable)) {
      return;
    }
    constraintVariables.add(constraintVariable);
    this.activateConstraintVariable(constraintVariable);
  },

  removeConstraintVariable(constraintVariable: ConstraintVariable): void {
    const constraintVariables = this.constraintVariables as Set<ConstraintVariable> | null;
    if (constraintVariables === null || !constraintVariables.has(constraintVariable)) {
      return;
    }
    this.deactivateConstraintVariable(constraintVariable);
    constraintVariables.delete(constraintVariable);
  },

  activateConstraintVariable(constraintVariable: ConstraintVariable): void {
    if (!ConstraintContext[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint context");
    }
    this.owner.activateConstraintVariable(constraintVariable);
  },

  deactivateConstraintVariable(constraintVariable: ConstraintVariable): void {
    if (!ConstraintContext[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint context");
    }
    this.owner.deactivateConstraintVariable(constraintVariable);
  },

  setConstraintVariable(constraintVariable: ConstraintVariable, state: number): void {
    if (!ConstraintContext[Symbol.hasInstance](this.owner)) {
      throw new Error("no constraint context");
    }
    this.owner.setConstraintVariable(constraintVariable, state);
  },

  activateLayout(): void {
    if (!ConstraintContext[Symbol.hasInstance](this.owner)) {
      return;
    }
    const constraintVariables = this.constraintVariables;
    if (constraintVariables !== null) {
      for (const constraintVariable of constraintVariables) {
        this.owner.activateConstraintVariable(constraintVariable);
      }
    }
    const constraints = this.constraints;
    if (constraints !== null) {
      for (const constraint of constraints) {
        this.owner.activateConstraint(constraint);
      }
    }
  },

  deactivateLayout(): void {
    if (!ConstraintContext[Symbol.hasInstance](this.owner)) {
      return;
    }
    const constraints = this.constraints;
    if (constraints !== null) {
      for (const constraint of constraints) {
        this.owner.deactivateConstraint(constraint);
      }
    }
    const constraintVariables = this.constraintVariables;
    if (constraintVariables !== null) {
      for (const constraintVariable of constraintVariables) {
        this.owner.deactivateConstraintVariable(constraintVariable);
      }
    }
  },

  onMount(): void {
    super.onMount();
    this.activateLayout();
  },

  onUnmount(): void {
    this.deactivateLayout();
    super.onUnmount();
  },
},
{
  tryView<R, K extends keyof R, F extends R[K]>(owner: R, fastenerName: K): (F extends {readonly view: infer V | null} ? V | null : never) | null {
    const metaclass = FastenerContext.getMetaclass(owner);
    const viewRef = metaclass !== null ? metaclass.tryFastener(owner, fastenerName) : null;
    return viewRef instanceof ViewRef ? viewRef.view : null;
  },

  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).constraints = null;
    (fastener as Mutable<typeof fastener>).constraintVariables = null;
    (fastener as Mutable<typeof fastener>).view = null;
    return fastener;
  },

  refine(fastenerClass: FastenerClass<ViewRef<any, any, any>>): void {
    super.refine(fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;

    const viewKeyDescriptor = Object.getOwnPropertyDescriptor(fastenerPrototype, "viewKey");
    if (viewKeyDescriptor !== void 0 && "value" in viewKeyDescriptor) {
      if (viewKeyDescriptor.value === true) {
        viewKeyDescriptor.value = fastenerClass.name;
        Object.defineProperty(fastenerPrototype, "viewKey", viewKeyDescriptor);
      } else if (viewKeyDescriptor.value === false) {
        viewKeyDescriptor.value = void 0;
        Object.defineProperty(fastenerPrototype, "viewKey", viewKeyDescriptor);
      }
    }
  },
}))();
