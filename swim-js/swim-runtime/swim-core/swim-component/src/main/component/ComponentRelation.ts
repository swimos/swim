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

import type {Proto, ObserverType} from "@swim/util";
import {FastenerOwner, FastenerInit, FastenerClass, Fastener} from "../fastener/Fastener";
import {AnyComponent, ComponentFactory, Component} from "./Component";

/** @internal */
export type ComponentRelationType<F extends ComponentRelation<any, any>> =
  F extends ComponentRelation<any, infer C> ? C : never;

/** @public */
export interface ComponentRelationInit<C extends Component = Component> extends FastenerInit {
  extends?: {prototype: ComponentRelation<any, any>} | string | boolean | null;
  type?: ComponentFactory<C>;
  binds?: boolean;
  observes?: boolean;

  initComponent?(component: C): void;
  willAttachComponent?(component: C, target: Component | null): void;
  didAttachComponent?(component: C, target: Component | null): void;

  deinitComponent?(component: C): void;
  willDetachComponent?(component: C): void;
  didDetachComponent?(component: C): void;

  parentComponent?: Component | null;
  insertChild?(parent: Component, child: C, target: Component | null, key: string | undefined): void;

  detectComponent?(component: Component): C | null;
  createComponent?(): C;
  fromAny?(value: AnyComponent<C>): C;
}

/** @public */
export type ComponentRelationDescriptor<O = unknown, C extends Component = Component, I = {}> = ThisType<ComponentRelation<O, C> & I> & ComponentRelationInit<C> & Partial<I>;

/** @public */
export interface ComponentRelationClass<F extends ComponentRelation<any, any> = ComponentRelation<any, any>> extends FastenerClass<F> {
}

/** @public */
export interface ComponentRelationFactory<F extends ComponentRelation<any, any> = ComponentRelation<any, any>> extends ComponentRelationClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): ComponentRelationFactory<F> & I;

  define<O, C extends Component = Component>(className: string, descriptor: ComponentRelationDescriptor<O, C>): ComponentRelationFactory<ComponentRelation<any, C>>;
  define<O, C extends Component = Component>(className: string, descriptor: {observes: boolean} & ComponentRelationDescriptor<O, C, ObserverType<C>>): ComponentRelationFactory<ComponentRelation<any, C>>;
  define<O, C extends Component = Component, I = {}>(className: string, descriptor: {implements: unknown} & ComponentRelationDescriptor<O, C, I>): ComponentRelationFactory<ComponentRelation<any, C> & I>;
  define<O, C extends Component = Component, I = {}>(className: string, descriptor: {implements: unknown; observes: boolean} & ComponentRelationDescriptor<O, C, I & ObserverType<C>>): ComponentRelationFactory<ComponentRelation<any, C> & I>;

  <O, C extends Component = Component>(descriptor: ComponentRelationDescriptor<O, C>): PropertyDecorator;
  <O, C extends Component = Component>(descriptor: {observes: boolean} & ComponentRelationDescriptor<O, C, ObserverType<C>>): PropertyDecorator;
  <O, C extends Component = Component, I = {}>(descriptor: {implements: unknown} & ComponentRelationDescriptor<O, C, I>): PropertyDecorator;
  <O, C extends Component = Component, I = {}>(descriptor: {implements: unknown; observes: boolean} & ComponentRelationDescriptor<O, C, I & ObserverType<C>>): PropertyDecorator;
}

/** @public */
export interface ComponentRelation<O = unknown, C extends Component = Component> extends Fastener<O> {
  /** @override */
  get fastenerType(): Proto<ComponentRelation<any, any>>;

  /** @protected */
  initComponent(component: C): void;

  /** @protected */
  willAttachComponent(component: C, target: Component | null): void;

  /** @protected */
  onAttachComponent(component: C, target: Component | null): void;

  /** @protected */
  didAttachComponent(component: C, target: Component | null): void;

  /** @protected */
  deinitComponent(component: C): void;

  /** @protected */
  willDetachComponent(component: C): void;

  /** @protected */
  onDetachComponent(component: C): void;

  /** @protected */
  didDetachComponent(component: C): void;

  /** @internal @protected */
  get parentComponent(): Component | null;

  /** @internal @protected */
  insertChild(parent: Component, child: C, target: Component | null, key: string | undefined): void;

  /** @internal */
  bindComponent(component: Component, target: Component | null): void;

  /** @internal */
  unbindComponent(component: Component): void;

  detectComponent(component: Component): C | null;

  createComponent(): C;

  /** @internal @protected */
  fromAny(value: AnyComponent<C>): C;

  /** @internal @protected */
  get type(): ComponentFactory<C> | undefined; // optional prototype property

  /** @internal @protected */
  get binds(): boolean | undefined; // optional prototype property

  /** @internal @protected */
  get observes(): boolean | undefined; // optional prototype property

  /** @internal @override */
  get lazy(): boolean; // prototype property

  /** @internal @override */
  get static(): string | boolean; // prototype property
}

/** @public */
export const ComponentRelation = (function (_super: typeof Fastener) {
  const ComponentRelation: ComponentRelationFactory = _super.extend("ComponentRelation");

  Object.defineProperty(ComponentRelation.prototype, "fastenerType", {
    get: function (this: ComponentRelation): Proto<ComponentRelation<any, any>> {
      return ComponentRelation;
    },
    configurable: true,
  });

  ComponentRelation.prototype.initComponent = function <C extends Component>(this: ComponentRelation<unknown, C>, component: C): void {
    // hook
  };

  ComponentRelation.prototype.willAttachComponent = function <C extends Component>(this: ComponentRelation<unknown, C>, component: C, target: Component | null): void {
    // hook
  };

  ComponentRelation.prototype.onAttachComponent = function <C extends Component>(this: ComponentRelation<unknown, C>, component: C, target: Component | null): void {
    if (this.observes === true) {
      component.observe(this as ObserverType<C>);
    }
  };

  ComponentRelation.prototype.didAttachComponent = function <C extends Component>(this: ComponentRelation<unknown, C>, component: C, target: Component | null): void {
    // hook
  };

  ComponentRelation.prototype.deinitComponent = function <C extends Component>(this: ComponentRelation<unknown, C>, component: C): void {
    // hook
  };

  ComponentRelation.prototype.willDetachComponent = function <C extends Component>(this: ComponentRelation<unknown, C>, component: C): void {
    // hook
  };

  ComponentRelation.prototype.onDetachComponent = function <C extends Component>(this: ComponentRelation<unknown, C>, component: C): void {
    if (this.observes === true) {
      component.unobserve(this as ObserverType<C>);
    }
  };

  ComponentRelation.prototype.didDetachComponent = function <C extends Component>(this: ComponentRelation<unknown, C>, component: C): void {
    // hook
  };

  Object.defineProperty(ComponentRelation.prototype, "parentComponent", {
    get(this: ComponentRelation): Component | null {
      const owner = this.owner;
      return owner instanceof Component ? owner : null;
    },
    configurable: true,
  });

  ComponentRelation.prototype.insertChild = function <C extends Component>(this: ComponentRelation<unknown, C>, parent: Component, child: C, target: Component | null, key: string | undefined): void {
    parent.insertChild(child, target, key);
  };

  ComponentRelation.prototype.bindComponent = function <C extends Component>(this: ComponentRelation<unknown, C>, component: Component, target: Component | null): void {
    // hook
  };

  ComponentRelation.prototype.unbindComponent = function <C extends Component>(this: ComponentRelation<unknown, C>, component: Component): void {
    // hook
  };

  ComponentRelation.prototype.detectComponent = function <C extends Component>(this: ComponentRelation<unknown, C>, component: Component): C | null {
    return null;
  };

  ComponentRelation.prototype.createComponent = function <C extends Component>(this: ComponentRelation<unknown, C>): C {
    let component: C | undefined;
    const type = this.type;
    if (type !== void 0) {
      component = type.create();
    }
    if (component === void 0 || component === null) {
      let message = "Unable to create ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "component";
      throw new Error(message);
    }
    return component;
  };

  ComponentRelation.prototype.fromAny = function <C extends Component>(this: ComponentRelation<unknown, C>, value: AnyComponent<C>): C {
    const type = this.type;
    if (type !== void 0) {
      return type.fromAny(value);
    } else {
      return Component.fromAny(value) as C;
    }
  };

  Object.defineProperty(ComponentRelation.prototype, "lazy", {
    get: function (this: ComponentRelation): boolean {
      return false;
    },
    configurable: true,
  });

  Object.defineProperty(ComponentRelation.prototype, "static", {
    get: function (this: ComponentRelation): string | boolean {
      return true;
    },
    configurable: true,
  });

  ComponentRelation.construct = function <F extends ComponentRelation<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    return fastener;
  };

  ComponentRelation.define = function <O, C extends Component>(className: string, descriptor: ComponentRelationDescriptor<O, C>): ComponentRelationFactory<ComponentRelation<any, C>> {
    let superClass = descriptor.extends as ComponentRelationFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    delete descriptor.extends;
    delete descriptor.implements;
    delete descriptor.affinity;
    delete descriptor.inherits;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: ComponentRelation<any, any>}, fastener: ComponentRelation<O, C> | null, owner: O): ComponentRelation<O, C> {
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

  return ComponentRelation;
})(Fastener);
