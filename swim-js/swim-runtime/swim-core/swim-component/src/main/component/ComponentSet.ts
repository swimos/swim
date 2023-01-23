// Copyright 2015-2023 Swim.inc
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

import {Mutable, Proto, Objects, Comparator} from "@swim/util";
import {Affinity} from "../fastener/Affinity";
import {FastenerFlags, FastenerOwner, Fastener} from "../fastener/Fastener";
import type {AnyComponent, ComponentFactory, Component} from "./Component";
import {ComponentRelationDescriptor, ComponentRelationClass, ComponentRelation} from "./ComponentRelation";

/** @public */
export type ComponentSetComponent<F extends ComponentSet<any, any>> =
  F extends {componentType?: ComponentFactory<infer C>} ? C : never;

/** @public */
export interface ComponentSetDescriptor<C extends Component = Component> extends ComponentRelationDescriptor<C> {
  extends?: Proto<ComponentSet<any, any>> | string | boolean | null;
  ordered?: boolean;
  sorted?: boolean;
}

/** @public */
export type ComponentSetTemplate<F extends ComponentSet<any, any>> =
  ThisType<F> &
  ComponentSetDescriptor<ComponentSetComponent<F>> &
  Partial<Omit<F, keyof ComponentSetDescriptor>>;

/** @public */
export interface ComponentSetClass<F extends ComponentSet<any, any> = ComponentSet<any, any>> extends ComponentRelationClass<F> {
  /** @override */
  specialize(template: ComponentSetDescriptor<any>): ComponentSetClass<F>;

  /** @override */
  refine(fastenerClass: ComponentSetClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: ComponentSetTemplate<F2>): ComponentSetClass<F2>;
  extend<F2 extends F>(className: string, template: ComponentSetTemplate<F2>): ComponentSetClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: ComponentSetTemplate<F2>): ComponentSetClass<F2>;
  define<F2 extends F>(className: string, template: ComponentSetTemplate<F2>): ComponentSetClass<F2>;

  /** @override */
  <F2 extends F>(template: ComponentSetTemplate<F2>): PropertyDecorator;

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
export interface ComponentSet<O = unknown, C extends Component = Component> extends ComponentRelation<O, C> {
  (component: AnyComponent<C>): O;

  /** @override */
  get fastenerType(): Proto<ComponentSet<any, any>>;

  /** @internal @override */
  getSuper(): ComponentSet<unknown, C> | null;

  /** @internal @override */
  setDerived(derived: boolean, inlet: ComponentSet<unknown, C>): void;

  /** @protected @override */
  willDerive(inlet: ComponentSet<unknown, C>): void;

  /** @protected @override */
  onDerive(inlet: ComponentSet<unknown, C>): void;

  /** @protected @override */
  didDerive(inlet: ComponentSet<unknown, C>): void;

  /** @protected @override */
  willUnderive(inlet: ComponentSet<unknown, C>): void;

  /** @protected @override */
  onUnderive(inlet: ComponentSet<unknown, C>): void;

  /** @protected @override */
  didUnderive(inlet: ComponentSet<unknown, C>): void;

  /** @override */
  readonly inlet: ComponentSet<unknown, C> | null;

  /** @protected @override */
  willBindInlet(inlet: ComponentSet<unknown, C>): void;

  /** @protected @override */
  onBindInlet(inlet: ComponentSet<unknown, C>): void;

  /** @protected @override */
  didBindInlet(inlet: ComponentSet<unknown, C>): void;

  /** @protected @override */
  willUnbindInlet(inlet: ComponentSet<unknown, C>): void;

  /** @protected @override */
  onUnbindInlet(inlet: ComponentSet<unknown, C>): void;

  /** @protected @override */
  didUnbindInlet(inlet: ComponentSet<unknown, C>): void;

  /** @internal @override */
  readonly outlets: ReadonlyArray<ComponentSet<unknown, C>> | null;

  /** @internal @override */
  attachOutlet(outlet: ComponentSet<unknown, C>): void;

  /** @internal @override */
  detachOutlet(outlet: ComponentSet<unknown, C>): void;

  /** @internal */
  readonly components: {readonly [componentId: string]: C | undefined};

  readonly componentCount: number;

  /** @internal */
  insertComponentMap(newComponent: C, target: Component | null): void;

  /** @internal */
  removeComponentMap(oldComponent: C): void;

  hasComponent(component: Component): boolean;

  addComponent(component?: AnyComponent<C>, target?: Component | null, key?: string): C;

  addComponents(components: {readonly [componentId: string]: C | undefined}, target?: Component | null): void;

  setComponents(components: {readonly [componentId: string]: C | undefined}, target?: Component | null): void;

  attachComponent(component?: AnyComponent<C>, target?: Component | null): C;

  attachComponents(components: {readonly [componentId: string]: C | undefined}, target?: Component | null): void;

  detachComponent(component: C): C | null;

  detachComponents(components?: {readonly [componentId: string]: C | undefined}): void;

  insertComponent(parent?: Component | null, component?: AnyComponent<C>, target?: Component | null, key?: string): C;

  insertComponents(parent: Component | null, components: {readonly [componentId: string]: C | undefined}, target?: Component | null): void;

  removeComponent(component: C): C | null;

  removeComponents(components?: {readonly [componentId: string]: C | undefined}): void;

  deleteComponent(component: C): C | null;

  deleteComponents(components?: {readonly [componentId: string]: C | undefined}): void;

  reinsertComponent(component: C, target?: Component | null): void;

  /** @internal @override */
  bindComponent(component: Component, target: Component | null): void;

  /** @internal @override */
  unbindComponent(component: Component): void;

  /** @override */
  detectComponent(component: Component): C | null;

  /** @internal @protected */
  decohereOutlets(): void;

  /** @internal @protected */
  decohereOutlet(outlet: ComponentSet<unknown, C>): void;

  /** @override */
  recohere(t: number): void;

  /** @internal @protected */
  componentKey(component: C): string | undefined;

  /** @internal */
  initOrdered(ordered: boolean): void;

  get ordered(): boolean;

  order(ordered?: boolean): this;

  /** @internal */
  initSorted(sorted: boolean): void;

  get sorted(): boolean;

  sort(sorted?: boolean): this;

  /** @protected */
  willSort(parent: Component | null): void;

  /** @protected */
  onSort(parent: Component | null): void;

  /** @protected */
  didSort(parent: Component | null): void;

  /** @internal */
  sortChildren(parent: Component, comparator?: Comparator<C>): void;

  /** @internal */
  getTargetChild(parent: Component, child: C): Component | null;

  /** @internal */
  compareChildren(a: Component, b: Component): number;

  /** @internal */
  compareTargetChild(a: Component, b: Component): number;

  /** @protected */
  compare(a: C, b: C): number;
}

/** @public */
export const ComponentSet = (function (_super: typeof ComponentRelation) {
  const ComponentSet = _super.extend("ComponentSet", {}) as ComponentSetClass;

  Object.defineProperty(ComponentSet.prototype, "fastenerType", {
    value: ComponentSet,
    configurable: true,
  });

  ComponentSet.prototype.onDerive = function (this: ComponentSet, inlet: ComponentSet): void {
    this.setComponents(inlet.components);
  };

  ComponentSet.prototype.insertComponentMap = function <C extends Component>(this: ComponentSet<unknown, C>, newComponent: C, target: Component | null): void {
    const components = this.components as {[componentId: string]: C | undefined};
    if (target !== null && (this.flags & ComponentSet.OrderedFlag) !== 0) {
      (this as Mutable<typeof this>).components = Objects.inserted(components, newComponent.uid, newComponent, target);
    } else {
      components[newComponent.uid] = newComponent;
    }
  };

  ComponentSet.prototype.removeComponentMap = function <C extends Component>(this: ComponentSet<unknown, C>, oldComponent: C): void {
    const components = this.components as {[componentId: string]: C | undefined};
    delete components[oldComponent.uid];
  };

  ComponentSet.prototype.hasComponent = function (this: ComponentSet, component: Component): boolean {
    return this.components[component.uid] !== void 0;
  };

  ComponentSet.prototype.addComponent = function <C extends Component>(this: ComponentSet<unknown, C>, newComponent?: AnyComponent<C>, target?: Component | null, key?: string): C {
    if (newComponent !== void 0 && newComponent !== null) {
      newComponent = this.fromAny(newComponent);
    } else {
      newComponent = this.createComponent();
    }
    if (target === void 0) {
      target = null;
    }
    let parent: Component | null;
    if (this.binds && (parent = this.parentComponent, parent !== null)) {
      if (target === null) {
        target = this.getTargetChild(parent, newComponent);
      }
      if (key === void 0) {
        key = this.componentKey(newComponent);
      }
      this.insertChild(parent, newComponent, target, key);
    }
    if (this.components[newComponent.uid] === void 0) {
      this.insertComponentMap(newComponent, target);
      (this as Mutable<typeof this>).componentCount += 1;
      this.willAttachComponent(newComponent, target);
      this.onAttachComponent(newComponent, target);
      this.initComponent(newComponent);
      this.didAttachComponent(newComponent, target);
      this.setCoherent(true);
      this.decohereOutlets();
    }
    return newComponent;
  };

  ComponentSet.prototype.addComponents = function <C extends Component>(this: ComponentSet, newComponents: {readonly [componentId: string]: C | undefined}, target?: Component | null): void {
    for (const componentId in newComponents) {
      this.addComponent(newComponents[componentId]!, target);
    }
  };

  ComponentSet.prototype.setComponents = function <C extends Component>(this: ComponentSet, newComponents: {readonly [componentId: string]: C | undefined}, target?: Component | null): void {
    const components = this.components;
    for (const componentId in components) {
      if (newComponents[componentId] === void 0) {
        this.detachComponent(components[componentId]!);
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
          this.attachComponent(newComponent, targetComponent);
        }
      }
    } else {
      for (const componentId in newComponents) {
        if (components[componentId] === void 0) {
          this.attachComponent(newComponents[componentId]!, target);
        }
      }
    }
  };

  ComponentSet.prototype.attachComponent = function <C extends Component>(this: ComponentSet<unknown, C>, newComponent?: AnyComponent<C>, target?: Component | null): C {
    if (newComponent !== void 0 && newComponent !== null) {
      newComponent = this.fromAny(newComponent);
    } else {
      newComponent = this.createComponent();
    }
    if (this.components[newComponent.uid] === void 0) {
      if (target === void 0) {
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
    }
    return newComponent;
  };

  ComponentSet.prototype.attachComponents = function <C extends Component>(this: ComponentSet, newComponents: {readonly [componentId: string]: C | undefined}, target?: Component | null): void {
    for (const componentId in newComponents) {
      this.attachComponent(newComponents[componentId]!, target);
    }
  };

  ComponentSet.prototype.detachComponent = function <C extends Component>(this: ComponentSet<unknown, C>, oldComponent: C): C | null {
    if (this.components[oldComponent.uid] !== void 0) {
      (this as Mutable<typeof this>).componentCount -= 1;
      this.removeComponentMap(oldComponent);
      this.willDetachComponent(oldComponent);
      this.onDetachComponent(oldComponent);
      this.deinitComponent(oldComponent);
      this.didDetachComponent(oldComponent);
      this.setCoherent(true);
      this.decohereOutlets();
      return oldComponent;
    }
    return null;
  };

  ComponentSet.prototype.detachComponents = function <C extends Component>(this: ComponentSet<unknown, C>, components?: {readonly [componentId: string]: C | undefined}): void {
    if (components === void 0) {
      components = this.components;
    }
    for (const componentId in components) {
      this.detachComponent(components[componentId]!);
    }
  };

  ComponentSet.prototype.insertComponent = function <C extends Component>(this: ComponentSet<unknown, C>, parent?: Component | null, newComponent?: AnyComponent<C>, target?: Component | null, key?: string): C {
    if (newComponent !== void 0 && newComponent !== null) {
      newComponent = this.fromAny(newComponent);
    } else {
      newComponent = this.createComponent();
    }
    if (parent === void 0) {
      parent = null;
    }
    if (this.binds || this.components[newComponent.uid] === void 0 || newComponent.parent === null || parent !== null || key !== void 0) {
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
      if (this.components[newComponent.uid] === void 0) {
        this.insertComponentMap(newComponent, target);
        (this as Mutable<typeof this>).componentCount += 1;
        this.willAttachComponent(newComponent, target);
        this.onAttachComponent(newComponent, target);
        this.initComponent(newComponent);
        this.didAttachComponent(newComponent, target);
        this.setCoherent(true);
        this.decohereOutlets();
      }
    }
    return newComponent;
  };

  ComponentSet.prototype.insertComponents = function <C extends Component>(this: ComponentSet, parent: Component | null, newComponents: {readonly [componentId: string]: C | undefined}, target?: Component | null): void {
    for (const componentId in newComponents) {
      this.insertComponent(parent, newComponents[componentId]!, target);
    }
  };

  ComponentSet.prototype.removeComponent = function <C extends Component>(this: ComponentSet<unknown, C>, component: C): C | null {
    if (this.hasComponent(component)) {
      component.remove();
      return component;
    }
    return null;
  };

  ComponentSet.prototype.removeComponents = function <C extends Component>(this: ComponentSet<unknown, C>, components?: {readonly [componentId: string]: C | undefined}): void {
    if (components === void 0) {
      components = this.components;
    }
    for (const componentId in components) {
      this.removeComponent(components[componentId]!);
    }
  };

  ComponentSet.prototype.deleteComponent = function <C extends Component>(this: ComponentSet<unknown, C>, component: C): C | null {
    const oldComponent = this.detachComponent(component);
    if (oldComponent !== null) {
      oldComponent.remove();
    }
    return oldComponent;
  };

  ComponentSet.prototype.deleteComponents = function <C extends Component>(this: ComponentSet<unknown, C>, components?: {readonly [componentId: string]: C | undefined}): void {
    if (components === void 0) {
      components = this.components;
    }
    for (const componentId in components) {
      this.deleteComponent(components[componentId]!);
    }
  };

  ComponentSet.prototype.reinsertComponent = function <C extends Component>(this: ComponentSet<unknown, C>, component: C, target?: Component | null): void {
    if (this.components[component.uid] !== void 0 && (target !== void 0 || (this.flags & ComponentSet.SortedFlag) !== 0)) {
      const parent = component.parent;
      if (parent !== null) {
        if (target === void 0) {
          target = this.getTargetChild(parent, component);
        }
        parent.reinsertChild(component, target);
      }
    }
  };

  ComponentSet.prototype.bindComponent = function <C extends Component>(this: ComponentSet<unknown, C>, component: Component, target: Component | null): void {
    if (this.binds) {
      const newComponent = this.detectComponent(component);
      if (newComponent !== null && this.components[newComponent.uid] === void 0) {
        this.insertComponentMap(newComponent, target);
        (this as Mutable<typeof this>).componentCount += 1;
        this.willAttachComponent(newComponent, target);
        this.onAttachComponent(newComponent, target);
        this.initComponent(newComponent);
        this.didAttachComponent(newComponent, target);
        this.setCoherent(true);
        this.decohereOutlets();
      }
    }
  };

  ComponentSet.prototype.unbindComponent = function <C extends Component>(this: ComponentSet<unknown, C>, component: Component): void {
    if (this.binds) {
      const oldComponent = this.detectComponent(component);
      if (oldComponent !== null && this.components[oldComponent.uid] !== void 0) {
        (this as Mutable<typeof this>).componentCount -= 1;
        this.removeComponentMap(oldComponent);
        this.willDetachComponent(oldComponent);
        this.onDetachComponent(oldComponent);
        this.deinitComponent(oldComponent);
        this.didDetachComponent(oldComponent);
        this.setCoherent(true);
        this.decohereOutlets();
      }
    }
  };

  ComponentSet.prototype.detectComponent = function <C extends Component>(this: ComponentSet<unknown, C>, component: Component): C | null {
    if (typeof this.componentType === "function" && component instanceof this.componentType) {
      return component as C;
    }
    return null;
  };

  ComponentSet.prototype.decohereOutlets = function (this: ComponentSet): void {
    const outlets = this.outlets;
    for (let i = 0, n = outlets !== null ? outlets.length : 0; i < n; i += 1) {
      this.decohereOutlet(outlets![i]!);
    }
  };

  ComponentSet.prototype.decohereOutlet = function (this: ComponentSet, outlet: ComponentSet): void {
    if ((outlet.flags & Fastener.DerivedFlag) === 0 && Math.min(this.flags & Affinity.Mask, Affinity.Intrinsic) >= (outlet.flags & Affinity.Mask)) {
      outlet.setDerived(true, this);
    } else if ((outlet.flags & Fastener.DerivedFlag) !== 0 && (outlet.flags & Fastener.DecoherentFlag) === 0) {
      outlet.setCoherent(false);
      outlet.decohere();
    }
  };

  ComponentSet.prototype.recohere = function (this: ComponentSet, t: number): void {
    if ((this.flags & Fastener.DerivedFlag) !== 0) {
      const inlet = this.inlet;
      if (inlet !== null) {
        this.setComponents(inlet.components);
      }
    }
  };

  ComponentSet.prototype.componentKey = function <C extends Component>(this: ComponentSet<unknown, C>, component: C): string | undefined {
    return void 0;
  };

  ComponentSet.prototype.initOrdered = function (this: ComponentSet, ordered: boolean): void {
    if (ordered) {
      (this as Mutable<typeof this>).flags = this.flags | ComponentSet.OrderedFlag;
    } else {
      (this as Mutable<typeof this>).flags = this.flags & ~ComponentSet.OrderedFlag;
    }
  };

  Object.defineProperty(ComponentSet.prototype, "ordered", {
    get(this: ComponentSet): boolean {
      return (this.flags & ComponentSet.OrderedFlag) !== 0;
    },
    configurable: true,
  });

  ComponentSet.prototype.order = function (this: ComponentSet, ordered?: boolean): typeof this {
    if (ordered === void 0) {
      ordered = true;
    }
    if (ordered) {
      this.setFlags(this.flags | ComponentSet.OrderedFlag);
    } else {
      this.setFlags(this.flags & ~ComponentSet.OrderedFlag);
    }
    return this;
  };

  ComponentSet.prototype.initSorted = function (this: ComponentSet, sorted: boolean): void {
    if (sorted) {
      (this as Mutable<typeof this>).flags = this.flags | ComponentSet.SortedFlag;
    } else {
      (this as Mutable<typeof this>).flags = this.flags & ~ComponentSet.SortedFlag;
    }
  };

  Object.defineProperty(ComponentSet.prototype, "sorted", {
    get(this: ComponentSet): boolean {
      return (this.flags & ComponentSet.SortedFlag) !== 0;
    },
    configurable: true,
  });

  ComponentSet.prototype.sort = function (this: ComponentSet, sorted?: boolean): typeof this {
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
  };

  ComponentSet.prototype.willSort = function (this: ComponentSet, parent: Component | null): void {
    // hook
  };

  ComponentSet.prototype.onSort = function (this: ComponentSet, parent: Component | null): void {
    if (parent !== null) {
      this.sortChildren(parent);
    }
  };

  ComponentSet.prototype.didSort = function (this: ComponentSet, parent: Component | null): void {
    // hook
  };

  ComponentSet.prototype.sortChildren = function <C extends Component>(this: ComponentSet<unknown, C>, parent: Component, comparator?: Comparator<C>): void {
    parent.sortChildren(this.compareChildren.bind(this));
  };

  ComponentSet.prototype.getTargetChild = function <C extends Component>(this: ComponentSet<unknown, C>, parent: Component, child: C): Component | null {
    if ((this.flags & ComponentSet.SortedFlag) !== 0) {
      return parent.getTargetChild(child, this.compareTargetChild.bind(this));
    } else {
      return null;
    }
  };

  ComponentSet.prototype.compareChildren = function <C extends Component>(this: ComponentSet<unknown, C>, a: Component, b: Component): number {
    const components = this.components;
    const x = components[a.uid];
    const y = components[b.uid];
    if (x !== void 0 && y !== void 0) {
      return this.compare(x, y);
    } else {
      return x !== void 0 ? 1 : y !== void 0 ? -1 : 0;
    }
  };

  ComponentSet.prototype.compareTargetChild = function <C extends Component>(this: ComponentSet<unknown, C>, a: C, b: Component): number {
    const components = this.components;
    const y = components[b.uid];
    if (y !== void 0) {
      return this.compare(a, y);
    } else {
      return y !== void 0 ? -1 : 0;
    }
  };

  ComponentSet.prototype.compare = function <C extends Component>(this: ComponentSet<unknown, C>, a: C, b: C): number {
    return a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0;
  };

  ComponentSet.construct = function <F extends ComponentSet<any, any>>(fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (newComponent: AnyComponent<ComponentSetComponent<F>>): FastenerOwner<F> {
        fastener!.addComponent(newComponent);
        return fastener!.owner;
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, this.prototype);
    }
    fastener = _super.construct.call(this, fastener, owner) as F;
    const flagsInit = fastener.flagsInit;
    if (flagsInit !== void 0) {
      fastener.initOrdered((flagsInit & ComponentSet.OrderedFlag) !== 0);
      fastener.initSorted((flagsInit & ComponentSet.SortedFlag) !== 0);
    }
    (fastener as Mutable<typeof fastener>).components = {};
    (fastener as Mutable<typeof fastener>).componentCount = 0;
    return fastener;
  };

  ComponentSet.refine = function (fastenerClass: ComponentSetClass<any>): void {
    _super.refine.call(this, fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;
    let flagsInit = fastenerPrototype.flagsInit;

    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "ordered")) {
      if (flagsInit === void 0) {
        flagsInit = 0;
      }
      if (fastenerPrototype.ordered) {
        flagsInit |= ComponentSet.OrderedFlag;
      } else {
        flagsInit &= ~ComponentSet.OrderedFlag;
      }
      delete (fastenerPrototype as ComponentSetDescriptor).ordered;
    }

    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "sorted")) {
      if (flagsInit === void 0) {
        flagsInit = 0;
      }
      if (fastenerPrototype.sorted) {
        flagsInit |= ComponentSet.SortedFlag;
      } else {
        flagsInit &= ~ComponentSet.SortedFlag;
      }
      delete (fastenerPrototype as ComponentSetDescriptor).sorted;
    }

    if (flagsInit !== void 0) {
      Object.defineProperty(fastenerPrototype, "flagsInit", {
        value: flagsInit,
        configurable: true,
      });
    }
  };

  (ComponentSet as Mutable<typeof ComponentSet>).OrderedFlag = 1 << (_super.FlagShift + 0);
  (ComponentSet as Mutable<typeof ComponentSet>).SortedFlag = 1 << (_super.FlagShift + 1);

  (ComponentSet as Mutable<typeof ComponentSet>).FlagShift = _super.FlagShift + 2;
  (ComponentSet as Mutable<typeof ComponentSet>).FlagMask = (1 << ComponentSet.FlagShift) - 1;

  return ComponentSet;
})(ComponentRelation);
