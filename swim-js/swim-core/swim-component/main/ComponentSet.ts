// Copyright 2015-2023 Nstream, inc.
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
import type {Comparator} from "@swim/util";
import {Objects} from "@swim/util";
import type {LikeType} from "@swim/util";
import {Affinity} from "./Affinity";
import type {FastenerFlags} from "./Fastener";
import type {FastenerClass} from "./Fastener";
import {Fastener} from "./Fastener";
import type {Component} from "./Component";
import type {ComponentRelationDescriptor} from "./ComponentRelation";
import type {ComponentRelationClass} from "./ComponentRelation";
import {ComponentRelation} from "./ComponentRelation";

/** @public */
export interface ComponentSetDescriptor<R, C extends Component<any>> extends ComponentRelationDescriptor<R, C> {
  extends?: Proto<ComponentSet<any, any, any>> | boolean | null;
  ordered?: boolean;
  sorted?: boolean;
}

/** @public */
export interface ComponentSetClass<F extends ComponentSet<any, any, any> = ComponentSet> extends ComponentRelationClass<F> {
  /** @internal */
  readonly OrderedFlag: FastenerFlags;
  /** @internal */
  readonly SortedFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface ComponentSet<R = any, C extends Component<any> = Component, I extends any[] = [C | null]> extends ComponentRelation<R, C, I> {
  /** @override */
  get descriptorType(): Proto<ComponentSetDescriptor<R, C>>;

  /** @override */
  get fastenerType(): Proto<ComponentSet<any, any, any>>;

  /** @override */
  get parent(): ComponentSet<any, C, any> | null;

  /** @protected */
  componentKey(component: C): string | undefined;

  /** @internal */
  readonly components: {readonly [componentId: string]: C | undefined};

  readonly componentCount: number;

  /** @internal */
  insertComponentMap(newComponent: C, target: Component<any> | null): void;

  /** @internal */
  removeComponentMap(oldComponent: C): void;

  hasComponent(component: Component<any>): boolean;

  addComponent(component?: C | LikeType<C>, target?: Component<any> | null, key?: string): C;

  addComponents(components: {readonly [componentId: string]: C | undefined}, target?: Component<any> | null): void;

  setComponents(components: {readonly [componentId: string]: C | undefined}, target?: Component<any> | null): void;

  attachComponent(component?: C | LikeType<C> | null, target?: Component<any> | null): C;

  attachComponents(components: {readonly [componentId: string]: C | undefined}, target?: Component<any> | null): void;

  detachComponent(component: C): C | null;

  detachComponents(components?: {readonly [componentId: string]: C | undefined}): void;

  insertComponent(parent?: Component<any> | null, component?: C | LikeType<C>, target?: Component<any> | null, key?: string): C;

  insertComponents(parent: Component<any> | null, components: {readonly [componentId: string]: C | undefined}, target?: Component<any> | null): void;

  removeComponent(component: C): C | null;

  removeComponents(components?: {readonly [componentId: string]: C | undefined}): void;

  deleteComponent(component: C): C | null;

  deleteComponents(components?: {readonly [componentId: string]: C | undefined}): void;

  reinsertComponent(component: C, target?: Component<any> | null): void;

  /** @internal @override */
  bindComponent(component: Component<any>, target: Component<any> | null): void;

  /** @internal @override */
  unbindComponent(component: Component<any>): void;

  /** @override */
  detectComponent(component: Component<any>): C | null;

  /** @override */
  recohere(t: number): void;

  get ordered(): boolean;

  order(ordered?: boolean): this;

  get sorted(): boolean;

  sort(sorted?: boolean): this;

  /** @protected */
  willSort(parent: Component<any> | null): void;

  /** @protected */
  onSort(parent: Component<any> | null): void;

  /** @protected */
  didSort(parent: Component<any> | null): void;

  /** @internal */
  sortChildren(parent: Component<any>, comparator?: Comparator<C>): void;

  /** @internal */
  getTargetChild(parent: Component<any>, child: C): Component<any> | null;

  /** @internal */
  compareChildren(a: Component<any>, b: Component<any>): number;

  /** @internal */
  compareTargetChild(a: Component<any>, b: Component<any>): number;

  /** @protected */
  compare(a: C, b: C): number;
}

/** @public */
export const ComponentSet = (<R, C extends Component<any>, I extends any[], F extends ComponentSet<any, any, any>>() => ComponentRelation.extend<ComponentSet<R, C, I>, ComponentSetClass<F>>("ComponentSet", {
  get fastenerType(): Proto<ComponentSet<any, any, any>> {
    return ComponentSet;
  },

  componentKey(component: C): string | undefined {
    return void 0;
  },

  insertComponentMap(newComponent: C, target: Component<any> | null): void {
    const components = this.components as {[componentId: string]: C | undefined};
    if (target !== null && (this.flags & ComponentSet.OrderedFlag) !== 0) {
      (this as Mutable<typeof this>).components = Objects.inserted(components, newComponent.uid, newComponent, target);
    } else {
      components[newComponent.uid] = newComponent;
    }
  },

  removeComponentMap(oldComponent: C): void {
    const components = this.components as {[componentId: string]: C | undefined};
    delete components[oldComponent.uid];
  },

  hasComponent(component: Component<any>): boolean {
    return this.components[component.uid] !== void 0;
  },

  addComponent(newComponent?: C | LikeType<C>, target?: Component<any> | null, key?: string): C {
    if (newComponent !== void 0 && newComponent !== null) {
      newComponent = this.fromLike(newComponent);
    } else {
      newComponent = this.createComponent();
    }
    if (target === void 0) {
      target = null;
    }
    let parent: Component<any> | null;
    if (this.binds && (parent = this.parentComponent, parent !== null)) {
      if (target === null) {
        if (newComponent.parent === parent) {
          target = newComponent.nextSibling as Component<any> | null;
        } else {
          target = this.getTargetChild(parent, newComponent);
        }
      }
      if (key === void 0) {
        key = this.componentKey(newComponent);
      }
      if (newComponent.parent !== parent || newComponent.nextSibling !== target || newComponent.key !== key) {
        this.insertChild(parent, newComponent, target, key);
      }
    }
    if (this.components[newComponent.uid] !== void 0) {
      return newComponent;
    }
    this.insertComponentMap(newComponent, target);
    (this as Mutable<typeof this>).componentCount += 1;
    this.willAttachComponent(newComponent, target);
    this.onAttachComponent(newComponent, target);
    this.initComponent(newComponent);
    this.didAttachComponent(newComponent, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newComponent;
  },

  addComponents(newComponents: {readonly [componentId: string]: C | undefined}, target?: Component<any> | null): void {
    for (const componentId in newComponents) {
      this.addComponent(newComponents[componentId]!, target);
    }
  },

  setComponents(newComponents: {readonly [componentId: string]: C | undefined}, target?: Component<any> | null): void {
    const binds = this.binds;
    const parent = binds ? this.parentComponent : null;
    const components = this.components;
    for (const componentId in components) {
      if (newComponents[componentId] === void 0) {
        const oldComponent = this.detachComponent(components[componentId]!);
        if (oldComponent !== null && binds && parent !== null && oldComponent.parent === parent) {
          oldComponent.remove();
        }
      }
    }
    if ((this.flags & ComponentSet.OrderedFlag) !== 0) {
      const orderedComponents = new Array<C>();
      for (const componentId in newComponents) {
        orderedComponents.push(newComponents[componentId]!);
      }
      for (let i = 0, n = orderedComponents.length; i < n; i += 1) {
        const newComponent = orderedComponents[i]!;
        if (components[newComponent.uid] === void 0) {
          const targetComponent = i < n + 1 ? orderedComponents[i + 1] : target;
          this.addComponent(newComponent, targetComponent);
        }
      }
    } else {
      for (const componentId in newComponents) {
        if (components[componentId] === void 0) {
          this.addComponent(newComponents[componentId]!, target);
        }
      }
    }
  },

  attachComponent(newComponent?: C | LikeType<C> | null, target?: Component<any> | null): C {
    if (newComponent !== void 0 && newComponent !== null) {
      newComponent = this.fromLike(newComponent);
    } else {
      newComponent = this.createComponent();
    }
    if (this.components[newComponent.uid] !== void 0) {
      return newComponent;
    } else if (target === void 0) {
      target = null;
    }
    this.insertComponentMap(newComponent, target);
    (this as Mutable<typeof this>).componentCount += 1;
    this.willAttachComponent(newComponent, target);
    this.onAttachComponent(newComponent, target);
    this.initComponent(newComponent);
    this.didAttachComponent(newComponent, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newComponent;
  },

  attachComponents(newComponents: {readonly [componentId: string]: C | undefined}, target?: Component<any> | null): void {
    for (const componentId in newComponents) {
      this.attachComponent(newComponents[componentId]!, target);
    }
  },

  detachComponent(oldComponent: C): C | null {
    if (this.components[oldComponent.uid] === void 0) {
      return null;
    }
    (this as Mutable<typeof this>).componentCount -= 1;
    this.removeComponentMap(oldComponent);
    this.willDetachComponent(oldComponent);
    this.onDetachComponent(oldComponent);
    this.deinitComponent(oldComponent);
    this.didDetachComponent(oldComponent);
    this.setCoherent(true);
    this.decohereOutlets();
    return oldComponent;
  },

  detachComponents(components?: {readonly [componentId: string]: C | undefined}): void {
    if (components === void 0) {
      components = this.components;
    }
    for (const componentId in components) {
      this.detachComponent(components[componentId]!);
    }
  },

  insertComponent(parent?: Component<any> | null, newComponent?: C | LikeType<C>, target?: Component<any> | null, key?: string): C {
    if (newComponent !== void 0 && newComponent !== null) {
      newComponent = this.fromLike(newComponent);
    } else {
      newComponent = this.createComponent();
    }
    if (parent === void 0) {
      parent = null;
    }
    if (!this.binds && this.components[newComponent.uid] !== void 0 && newComponent.parent !== null && parent === null && key === void 0) {
      return newComponent;
    }
    if (parent === null) {
      parent = this.parentComponent;
    }
    if (target === void 0) {
      target = null;
    }
    if (key === void 0) {
      key = this.componentKey(newComponent);
    }
    if (parent !== null && (newComponent.parent !== parent || newComponent.key !== key)) {
      if (target === null) {
        target = this.getTargetChild(parent, newComponent);
      }
      this.insertChild(parent, newComponent, target, key);
    }
    if (this.components[newComponent.uid] !== void 0) {
      return newComponent;
    }
    this.insertComponentMap(newComponent, target);
    (this as Mutable<typeof this>).componentCount += 1;
    this.willAttachComponent(newComponent, target);
    this.onAttachComponent(newComponent, target);
    this.initComponent(newComponent);
    this.didAttachComponent(newComponent, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newComponent;
  },

  insertComponents(parent: Component<any> | null, newComponents: {readonly [componentId: string]: C | undefined}, target?: Component<any> | null): void {
    for (const componentId in newComponents) {
      this.insertComponent(parent, newComponents[componentId]!, target);
    }
  },

  removeComponent(component: C): C | null {
    if (!this.hasComponent(component)) {
      return null;
    }
    component.remove();
    return component;
  },

  removeComponents(components?: {readonly [componentId: string]: C | undefined}): void {
    if (components === void 0) {
      components = this.components;
    }
    for (const componentId in components) {
      this.removeComponent(components[componentId]!);
    }
  },

  deleteComponent(component: C): C | null {
    const oldComponent = this.detachComponent(component);
    if (oldComponent === null) {
      return null;
    }
    oldComponent.remove();
    return oldComponent;
  },

  deleteComponents(components?: {readonly [componentId: string]: C | undefined}): void {
    if (components === void 0) {
      components = this.components;
    }
    for (const componentId in components) {
      this.deleteComponent(components[componentId]!);
    }
  },

  reinsertComponent(component: C, target?: Component<any> | null): void {
    if (this.components[component.uid] === void 0 || (target === void 0 && (this.flags & ComponentSet.SortedFlag) === 0)) {
      return;
    }
    const parent = component.parent;
    if (parent === null) {
      return;
    } else if (target === void 0) {
      target = this.getTargetChild(parent, component);
    }
    parent.reinsertChild(component, target);
  },

  bindComponent(component: Component<any>, target: Component<any> | null): void {
    if (!this.binds) {
      return;
    }
    const newComponent = this.detectComponent(component);
    if (newComponent === null || this.components[newComponent.uid] !== void 0) {
      return;
    }
    this.insertComponentMap(newComponent, target);
    (this as Mutable<typeof this>).componentCount += 1;
    this.willAttachComponent(newComponent, target);
    this.onAttachComponent(newComponent, target);
    this.initComponent(newComponent);
    this.didAttachComponent(newComponent, target);
    this.setCoherent(true);
    this.decohereOutlets();
  },

  unbindComponent(component: Component<any>): void {
    if (!this.binds) {
      return;
    }
    const oldComponent = this.detectComponent(component);
    if (oldComponent === null || this.components[oldComponent.uid] === void 0) {
      return;
    }
    (this as Mutable<typeof this>).componentCount -= 1;
    this.removeComponentMap(oldComponent);
    this.willDetachComponent(oldComponent);
    this.onDetachComponent(oldComponent);
    this.deinitComponent(oldComponent);
    this.didDetachComponent(oldComponent);
    this.setCoherent(true);
    this.decohereOutlets();
  },

  detectComponent(component: Component<any>): C | null {
    if (typeof this.componentType === "function" && component instanceof this.componentType) {
      return component as C;
    }
    return null;
  },

  recohere(t: number): void {
    this.setCoherentTime(t);
    const inlet = this.inlet;
    if (inlet instanceof ComponentSet) {
      this.setDerived((this.flags & Affinity.Mask) <= Math.min(inlet.flags & Affinity.Mask, Affinity.Intrinsic));
      if ((this.flags & Fastener.DerivedFlag) !== 0) {
        this.setComponents(inlet.components);
      }
    } else {
      this.setDerived(false);
    }
  },

  get ordered(): boolean {
    return (this.flags & ComponentSet.OrderedFlag) !== 0;
  },

  order(ordered?: boolean): typeof this {
    if (ordered === void 0) {
      ordered = true;
    }
    if (ordered) {
      this.setFlags(this.flags | ComponentSet.OrderedFlag);
    } else {
      this.setFlags(this.flags & ~ComponentSet.OrderedFlag);
    }
    return this;
  },

  get sorted(): boolean {
    return (this.flags & ComponentSet.SortedFlag) !== 0;
  },

  sort(sorted?: boolean): typeof this {
    if (sorted === void 0) {
      sorted = true;
    }
    if (sorted) {
      const parent = this.parentComponent;
      this.willSort(parent);
      this.setFlags(this.flags | ComponentSet.SortedFlag);
      this.onSort(parent);
      this.didSort(parent);
    } else {
      this.setFlags(this.flags & ~ComponentSet.SortedFlag);
    }
    return this;
  },

  willSort(parent: Component<any> | null): void {
    // hook
  },

  onSort(parent: Component<any> | null): void {
    if (parent !== null) {
      this.sortChildren(parent);
    }
  },

  didSort(parent: Component<any> | null): void {
    // hook
  },

  sortChildren(parent: Component<any>, comparator?: Comparator<C>): void {
    parent.sortChildren(this.compareChildren.bind(this));
  },

  getTargetChild(parent: Component<any>, child: C): Component<any> | null {
    if ((this.flags & ComponentSet.SortedFlag) !== 0) {
      return parent.getTargetChild(child, this.compareTargetChild.bind(this));
    }
    return null;
  },

  compareChildren(a: Component<any>, b: Component<any>): number {
    const components = this.components;
    const x = components[a.uid];
    const y = components[b.uid];
    if (x !== void 0 && y !== void 0) {
      return this.compare(x, y);
    }
    return x !== void 0 ? 1 : y !== void 0 ? -1 : 0;
  },

  compareTargetChild(a: C, b: Component<any>): number {
    const components = this.components;
    const y = components[b.uid];
    if (y !== void 0) {
      return this.compare(a, y);
    }
    return y !== void 0 ? -1 : 0;
  },

  compare(a: C, b: C): number {
    return a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0;
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).components = {};
    (fastener as Mutable<typeof fastener>).componentCount = 0;
    return fastener;
  },

  refine(fastenerClass: FastenerClass<ComponentSet<any, any, any>>): void {
    super.refine(fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;

    let flagsInit = fastenerPrototype.flagsInit;
    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "ordered")) {
      if (fastenerPrototype.ordered) {
        flagsInit |= ComponentSet.OrderedFlag;
      } else {
        flagsInit &= ~ComponentSet.OrderedFlag;
      }
      delete (fastenerPrototype as ComponentSetDescriptor<any, any>).ordered;
    }
    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "sorted")) {
      if (fastenerPrototype.sorted) {
        flagsInit |= ComponentSet.SortedFlag;
      } else {
        flagsInit &= ~ComponentSet.SortedFlag;
      }
      delete (fastenerPrototype as ComponentSetDescriptor<any, any>).sorted;
    }
    Object.defineProperty(fastenerPrototype, "flagsInit", {
      value: flagsInit,
      enumerable: true,
      configurable: true,
    });
  },

  OrderedFlag: 1 << (ComponentRelation.FlagShift + 0),
  SortedFlag: 1 << (ComponentRelation.FlagShift + 1),

  FlagShift: ComponentRelation.FlagShift + 2,
  FlagMask: (1 << (ComponentRelation.FlagShift + 2)) - 1,
}))();
