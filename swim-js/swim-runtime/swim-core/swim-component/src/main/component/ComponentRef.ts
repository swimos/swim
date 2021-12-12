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

import type {Mutable, Proto, ObserverType} from "@swim/util";
import type {FastenerOwner, Fastener} from "../fastener/Fastener";
import type {AnyComponent, Component} from "./Component";
import {ComponentRelationInit, ComponentRelationClass, ComponentRelation} from "./ComponentRelation";

/** @internal */
export type ComponentRefType<F extends ComponentRef<any, any>> =
  F extends ComponentRef<any, infer C> ? C : never;

/** @public */
export interface ComponentRefInit<C extends Component = Component> extends ComponentRelationInit<C> {
  extends?: {prototype: ComponentRef<any, any>} | string | boolean | null;
  key?: string | boolean;
}

/** @public */
export type ComponentRefDescriptor<O = unknown, C extends Component = Component, I = {}> = ThisType<ComponentRef<O, C> & I> & ComponentRefInit<C> & Partial<I>;

/** @public */
export interface ComponentRefClass<F extends ComponentRef<any, any> = ComponentRef<any, any>> extends ComponentRelationClass<F> {
}

/** @public */
export interface ComponentRefFactory<F extends ComponentRef<any, any> = ComponentRef<any, any>> extends ComponentRefClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): ComponentRefFactory<F> & I;

  define<O, C extends Component = Component>(className: string, descriptor: ComponentRefDescriptor<O, C>): ComponentRefFactory<ComponentRef<any, C>>;
  define<O, C extends Component = Component>(className: string, descriptor: {observes: boolean} & ComponentRefDescriptor<O, C, ObserverType<C>>): ComponentRefFactory<ComponentRef<any, C>>;
  define<O, C extends Component = Component, I = {}>(className: string, descriptor: {implements: unknown} & ComponentRefDescriptor<O, C, I>): ComponentRefFactory<ComponentRef<any, C> & I>;
  define<O, C extends Component = Component, I = {}>(className: string, descriptor: {implements: unknown; observes: boolean} & ComponentRefDescriptor<O, C, I & ObserverType<C>>): ComponentRefFactory<ComponentRef<any, C> & I>;

  <O, C extends Component = Component>(descriptor: ComponentRefDescriptor<O, C>): PropertyDecorator;
  <O, C extends Component = Component>(descriptor: {observes: boolean} & ComponentRefDescriptor<O, C, ObserverType<C>>): PropertyDecorator;
  <O, C extends Component = Component, I = {}>(descriptor: {implements: unknown} & ComponentRefDescriptor<O, C, I>): PropertyDecorator;
  <O, C extends Component = Component, I = {}>(descriptor: {implements: unknown; observes: boolean} & ComponentRefDescriptor<O, C, I & ObserverType<C>>): PropertyDecorator;
}

/** @public */
export interface ComponentRef<O = unknown, C extends Component = Component> extends ComponentRelation<O, C> {
  (): C | null;
  (component: AnyComponent<C> | null, target?: Component | null, key?: string): O;

  /** @override */
  get fastenerType(): Proto<ComponentRef<any, any>>;

  /** @protected @override */
  onInherit(superFastener: Fastener): void;

  readonly component: C | null;

  getComponent(): C;

  setComponent(component: AnyComponent<C> | null, target?: Component | null, key?: string): C | null;

  attachComponent(component?: AnyComponent<C>, target?: Component | null): C;

  detachComponent(): C | null;

  insertComponent(parent?: Component, component?: AnyComponent<C>, target?: Component | null, key?: string): C;

  removeComponent(): C | null;

  deleteComponent(): C | null;

  /** @internal @override */
  bindComponent(component: Component, target: Component | null): void;

  /** @internal @override */
  unbindComponent(component: Component): void;

  /** @override */
  detectComponent(component: Component): C | null;

  /** @internal */
  get key(): string | undefined; // optional prototype field
}

/** @public */
export const ComponentRef = (function (_super: typeof ComponentRelation) {
  const ComponentRef: ComponentRefFactory = _super.extend("ComponentRef");

  Object.defineProperty(ComponentRef.prototype, "fastenerType", {
    get: function (this: ComponentRef): Proto<ComponentRef<any, any>> {
      return ComponentRef;
    },
    configurable: true,
  });

  ComponentRef.prototype.onInherit = function (this: ComponentRef, superFastener: ComponentRef): void {
    this.setComponent(superFastener.component);
  };

  ComponentRef.prototype.getComponent = function <C extends Component>(this: ComponentRef<unknown, C>): C {
    const component = this.component;
    if (component === null) {
      let message = component + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "component";
      throw new TypeError(message);
    }
    return component;
  };

  ComponentRef.prototype.setComponent = function <C extends Component>(this: ComponentRef<unknown, C>, newComponent: C  | null, target?: Component | null, key?: string): C | null {
    if (newComponent !== null) {
      newComponent = this.fromAny(newComponent);
    }
    let oldComponent = this.component;
    if (oldComponent !== newComponent) {
      if (target === void 0) {
        target = null;
      }
      let parent: Component | null;
      if (this.binds && (parent = this.parentComponent, parent !== null)) {
        if (oldComponent !== null && oldComponent.parent === parent) {
          if (target === null) {
            target = oldComponent.nextSibling;
          }
          oldComponent.remove();
        }
        if (newComponent !== null) {
          if (key === void 0) {
            key = this.key;
          }
          this.insertChild(parent, newComponent, target, key);
        }
        oldComponent = this.component;
      }
      if (oldComponent !== newComponent) {
        if (oldComponent !== null) {
          this.willDetachComponent(oldComponent);
          (this as Mutable<typeof this>).component = null;
          this.onDetachComponent(oldComponent);
          this.deinitComponent(oldComponent);
          this.didDetachComponent(oldComponent);
        }
        if (newComponent !== null) {
          this.willAttachComponent(newComponent, target);
          (this as Mutable<typeof this>).component = newComponent;
          this.onAttachComponent(newComponent, target);
          this.initComponent(newComponent);
          this.didAttachComponent(newComponent, target);
        }
      }
    }
    return oldComponent;
  };

  ComponentRef.prototype.attachComponent = function <C extends Component>(this: ComponentRef<unknown, C>, newComponent?: AnyComponent<C>, target?: Component | null): C {
    const oldComponent = this.component;
    if (newComponent !== void 0 && newComponent !== null) {
      newComponent = this.fromAny(newComponent);
    } else if (oldComponent === null) {
      newComponent = this.createComponent();
    } else {
      newComponent = oldComponent;
    }
    if (newComponent !== oldComponent) {
      if (target === void 0) {
        target = null;
      }
      if (oldComponent !== null) {
        this.willDetachComponent(oldComponent);
        (this as Mutable<typeof this>).component = null;
        this.onDetachComponent(oldComponent);
        this.deinitComponent(oldComponent);
        this.didDetachComponent(oldComponent);
      }
      this.willAttachComponent(newComponent, target);
      (this as Mutable<typeof this>).component = newComponent;
      this.onAttachComponent(newComponent, target);
      this.initComponent(newComponent);
      this.didAttachComponent(newComponent, target);
    }
    return newComponent;
  };

  ComponentRef.prototype.detachComponent = function <C extends Component>(this: ComponentRef<unknown, C>): C | null {
    const oldComponent = this.component;
    if (oldComponent !== null) {
      this.willDetachComponent(oldComponent);
      (this as Mutable<typeof this>).component = null;
      this.onDetachComponent(oldComponent);
      this.deinitComponent(oldComponent);
      this.didDetachComponent(oldComponent);
    }
    return oldComponent;
  };

  ComponentRef.prototype.insertComponent = function <C extends Component>(this: ComponentRef<unknown, C>, parent?: Component | null, newComponent?: AnyComponent<C>, target?: Component | null, key?: string): C {
    if (newComponent !== void 0 && newComponent !== null) {
      newComponent = this.fromAny(newComponent);
    } else {
      const oldComponent = this.component;
      if (oldComponent === null) {
        newComponent = this.createComponent();
      } else {
        newComponent = oldComponent;
      }
    }
    if (parent === void 0 || parent === null) {
      parent = this.parentComponent;
    }
    if (target === void 0) {
      target = null;
    }
    if (key === void 0) {
      key = this.key;
    }
    if (parent !== null && (newComponent.parent !== parent || newComponent.key !== key)) {
      this.insertChild(parent, newComponent, target, key);
    }
    const oldComponent = this.component;
    if (newComponent !== oldComponent) {
      if (oldComponent !== null) {
        this.willDetachComponent(oldComponent);
        (this as Mutable<typeof this>).component = null;
        this.onDetachComponent(oldComponent);
        this.deinitComponent(oldComponent);
        this.didDetachComponent(oldComponent);
        oldComponent.remove();
      }
      this.willAttachComponent(newComponent, target);
      (this as Mutable<typeof this>).component = newComponent;
      this.onAttachComponent(newComponent, target);
      this.initComponent(newComponent);
      this.didAttachComponent(newComponent, target);
    }
    return newComponent;
  };

  ComponentRef.prototype.removeComponent = function <C extends Component>(this: ComponentRef<unknown, C>): C | null {
    const component = this.component;
    if (component !== null) {
      component.remove();
    }
    return component;
  };

  ComponentRef.prototype.deleteComponent = function <C extends Component>(this: ComponentRef<unknown, C>): C | null {
    const component = this.detachComponent();
    if (component !== null) {
      component.remove();
    }
    return component;
  };

  ComponentRef.prototype.bindComponent = function <C extends Component>(this: ComponentRef<unknown, C>, component: Component, target: Component | null): void {
    if (this.binds && this.component === null) {
      const newComponent = this.detectComponent(component);
      if (newComponent !== null) {
        this.willAttachComponent(newComponent, target);
        (this as Mutable<typeof this>).component = newComponent;
        this.onAttachComponent(newComponent, target);
        this.initComponent(newComponent);
        this.didAttachComponent(newComponent, target);
      }
    }
  };

  ComponentRef.prototype.unbindComponent = function <C extends Component>(this: ComponentRef<unknown, C>, component: Component): void {
    if (this.binds) {
      const oldComponent = this.detectComponent(component);
      if (oldComponent !== null && this.component === oldComponent) {
        this.willDetachComponent(oldComponent);
        (this as Mutable<typeof this>).component = null;
        this.onDetachComponent(oldComponent);
        this.deinitComponent(oldComponent);
        this.didDetachComponent(oldComponent);
      }
    }
  };

  ComponentRef.prototype.detectComponent = function <C extends Component>(this: ComponentRef<unknown, C>, component: Component): C | null {
    const key = this.key;
    if (key !== void 0 && key === component.key) {
      return component as C;
    }
    return null;
  };

  ComponentRef.construct = function <F extends ComponentRef<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (component?: AnyComponent<ComponentRefType<F>> | null, target?: Component | null, key?: string): ComponentRefType<F> | null | FastenerOwner<F> {
        if (component === void 0) {
          return fastener!.component;
        } else {
          fastener!.setComponent(component, target, key);
          return fastener!.owner;
        }
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, fastenerClass.prototype);
    }
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).key = void 0;
    (fastener as Mutable<typeof fastener>).component = null;
    return fastener;
  };

  ComponentRef.define = function <O, C extends Component>(className: string, descriptor: ComponentRefDescriptor<O, C>): ComponentRefFactory<ComponentRef<any, C>> {
    let superClass = descriptor.extends as ComponentRefFactory | null | undefined;
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

    fastenerClass.construct = function (fastenerClass: {prototype: ComponentRef<any, any>}, fastener: ComponentRef<O, C> | null, owner: O): ComponentRef<O, C> {
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

  return ComponentRef;
})(ComponentRelation);
