// Copyright 2015-2022 Swim.inc
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

import type {Mutable, Proto} from "@swim/util";
import {Affinity} from "../fastener/Affinity";
import {FastenerOwner, Fastener} from "../fastener/Fastener";
import type {AnyComponent, ComponentFactory, Component} from "./Component";
import {ComponentRelationDescriptor, ComponentRelationClass, ComponentRelation} from "./ComponentRelation";

/** @public */
export type ComponentRefComponent<F extends ComponentRef<any, any>> =
  F extends {componentType?: ComponentFactory<infer C>} ? C : never;

/** @public */
export interface ComponentRefDescriptor<C extends Component = Component> extends ComponentRelationDescriptor<C> {
  extends?: Proto<ComponentRef<any, any>> | string | boolean | null;
  componentKey?: string | boolean;
}

/** @public */
export type ComponentRefTemplate<F extends ComponentRef<any, any>> =
  ThisType<F> &
  ComponentRefDescriptor<ComponentRefComponent<F>> &
  Partial<Omit<F, keyof ComponentRefDescriptor>>;

/** @public */
export interface ComponentRefClass<F extends ComponentRef<any, any> = ComponentRef<any, any>> extends ComponentRelationClass<F> {
  /** @override */
  specialize(template: ComponentRefDescriptor<any>): ComponentRefClass<F>;

  /** @override */
  refine(fastenerClass: ComponentRefClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: ComponentRefTemplate<F2>): ComponentRefClass<F2>;
  extend<F2 extends F>(className: string, template: ComponentRefTemplate<F2>): ComponentRefClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: ComponentRefTemplate<F2>): ComponentRefClass<F2>;
  define<F2 extends F>(className: string, template: ComponentRefTemplate<F2>): ComponentRefClass<F2>;

  /** @override */
  <F2 extends F>(template: ComponentRefTemplate<F2>): PropertyDecorator;
}

/** @public */
export interface ComponentRef<O = unknown, C extends Component = Component> extends ComponentRelation<O, C> {
  (): C | null;
  (component: AnyComponent<C> | null, target?: Component | null, key?: string): O;

  /** @override */
  get fastenerType(): Proto<ComponentRef<any, any>>;

  /** @internal @override */
  getSuper(): ComponentRef<unknown, C> | null;

  /** @internal @override */
  setDerived(derived: boolean, inlet: ComponentRef<unknown, C>): void;

  /** @protected @override */
  willDerive(inlet: ComponentRef<unknown, C>): void;

  /** @protected @override */
  onDerive(inlet: ComponentRef<unknown, C>): void;

  /** @protected @override */
  didDerive(inlet: ComponentRef<unknown, C>): void;

  /** @protected @override */
  willUnderive(inlet: ComponentRef<unknown, C>): void;

  /** @protected @override */
  onUnderive(inlet: ComponentRef<unknown, C>): void;

  /** @protected @override */
  didUnderive(inlet: ComponentRef<unknown, C>): void;

  /** @override */
  readonly inlet: ComponentRef<unknown, C> | null;

  /** @protected @override */
  willBindInlet(inlet: ComponentRef<unknown, C>): void;

  /** @protected @override */
  onBindInlet(inlet: ComponentRef<unknown, C>): void;

  /** @protected @override */
  didBindInlet(inlet: ComponentRef<unknown, C>): void;

  /** @protected @override */
  willUnbindInlet(inlet: ComponentRef<unknown, C>): void;

  /** @protected @override */
  onUnbindInlet(inlet: ComponentRef<unknown, C>): void;

  /** @protected @override */
  didUnbindInlet(inlet: ComponentRef<unknown, C>): void;

  /** @internal @override */
  readonly outlets: ReadonlyArray<ComponentRef<unknown, C>> | null;

  /** @internal @override */
  attachOutlet(outlet: ComponentRef<unknown, C>): void;

  /** @internal @override */
  detachOutlet(outlet: ComponentRef<unknown, C>): void;

  get inletComponent(): C | null;

  getInletComponent(): C;

  /** @internal */
  readonly componentKey?: string; // optional prototype property

  readonly component: C | null;

  getComponent(): C;

  setComponent(component: AnyComponent<C> | null, target?: Component | null, key?: string): C | null;

  attachComponent(component?: AnyComponent<C>, target?: Component | null): C;

  detachComponent(): C | null;

  insertComponent(parent?: Component | null, component?: AnyComponent<C>, target?: Component | null, key?: string): C;

  removeComponent(): C | null;

  deleteComponent(): C | null;

  /** @internal @override */
  bindComponent(component: Component, target: Component | null): void;

  /** @internal @override */
  unbindComponent(component: Component): void;

  /** @override */
  detectComponent(component: Component): C | null;

  /** @internal @protected */
  decohereOutlets(): void;

  /** @internal @protected */
  decohereOutlet(outlet: ComponentRef<unknown, C>): void;

  /** @override */
  recohere(t: number): void;
}

/** @public */
export const ComponentRef = (function (_super: typeof ComponentRelation) {
  const ComponentRef = _super.extend("ComponentRef", {}) as ComponentRefClass;

  Object.defineProperty(ComponentRef.prototype, "fastenerType", {
    value: ComponentRef,
    configurable: true,
  });

  ComponentRef.prototype.onDerive = function (this: ComponentRef, inlet: ComponentRef): void {
    const inletComponent = inlet.component;
    if (inletComponent !== null) {
      this.attachComponent(inletComponent);
    } else {
      this.detachComponent();
    }
  };

  Object.defineProperty(ComponentRef.prototype, "inletComponent", {
    get: function <C extends Component>(this: ComponentRef<unknown, C>): C | null {
      const inlet = this.inlet;
      return inlet !== null ? inlet.component : null;
    },
    configurable: true,
  });

  ComponentRef.prototype.getInletComponent = function <C extends Component>(this: ComponentRef<unknown, C>): C {
    const inletComponent = this.inletComponent;
    if (inletComponent === void 0 || inletComponent === null) {
      let message = inletComponent + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "inlet component";
      throw new TypeError(message);
    }
    return inletComponent;
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
    let oldComponent = this.component;
    if (newComponent !== null) {
      newComponent = this.fromAny(newComponent);
    }
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
            key = this.componentKey;
          }
          this.insertChild(parent, newComponent, target, key);
        }
        oldComponent = this.component;
      }
      if (oldComponent !== newComponent) {
        if (oldComponent !== null) {
          (this as Mutable<typeof this>).component = null;
          this.willDetachComponent(oldComponent);
          this.onDetachComponent(oldComponent);
          this.deinitComponent(oldComponent);
          this.didDetachComponent(oldComponent);
        }
        if (newComponent !== null) {
          (this as Mutable<typeof this>).component = newComponent;
          this.willAttachComponent(newComponent, target);
          this.onAttachComponent(newComponent, target);
          this.initComponent(newComponent);
          this.didAttachComponent(newComponent, target);
        }
        this.setCoherent(true);
        this.decohereOutlets();
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
    if (oldComponent !== newComponent) {
      if (target === void 0) {
        target = null;
      }
      if (oldComponent !== null) {
        (this as Mutable<typeof this>).component = null;
        this.willDetachComponent(oldComponent);
        this.onDetachComponent(oldComponent);
        this.deinitComponent(oldComponent);
        this.didDetachComponent(oldComponent);
      }
      (this as Mutable<typeof this>).component = newComponent;
      this.willAttachComponent(newComponent, target);
      this.onAttachComponent(newComponent, target);
      this.initComponent(newComponent);
      this.didAttachComponent(newComponent, target);
      this.setCoherent(true);
      this.decohereOutlets();
    }
    return newComponent;
  };

  ComponentRef.prototype.detachComponent = function <C extends Component>(this: ComponentRef<unknown, C>): C | null {
    const oldComponent = this.component;
    if (oldComponent !== null) {
      (this as Mutable<typeof this>).component = null;
      this.willDetachComponent(oldComponent);
      this.onDetachComponent(oldComponent);
      this.deinitComponent(oldComponent);
      this.didDetachComponent(oldComponent);
      this.setCoherent(true);
      this.decohereOutlets();
    }
    return oldComponent;
  };

  ComponentRef.prototype.insertComponent = function <C extends Component>(this: ComponentRef<unknown, C>, parent?: Component | null, newComponent?: AnyComponent<C>, target?: Component | null, key?: string): C {
    let oldComponent = this.component;
    if (newComponent !== void 0 && newComponent !== null) {
      newComponent = this.fromAny(newComponent);
    } else if (oldComponent === null) {
      newComponent = this.createComponent();
    } else {
      newComponent = oldComponent;
    }
    if (parent === void 0) {
      parent = null;
    }
    if (this.binds || oldComponent !== newComponent || newComponent.parent === null || parent !== null || key !== void 0) {
      if (parent === null) {
        parent = this.parentComponent;
      }
      if (target === void 0) {
        target = null;
      }
      if (key === void 0) {
        key = this.componentKey;
      }
      if (parent !== null && (newComponent.parent !== parent || newComponent.key !== key)) {
        this.insertChild(parent, newComponent, target, key);
      }
      oldComponent = this.component;
      if (oldComponent !== newComponent) {
        if (oldComponent !== null) {
          (this as Mutable<typeof this>).component = null;
          this.willDetachComponent(oldComponent);
          this.onDetachComponent(oldComponent);
          this.deinitComponent(oldComponent);
          this.didDetachComponent(oldComponent);
          oldComponent.remove();
        }
        (this as Mutable<typeof this>).component = newComponent;
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
        (this as Mutable<typeof this>).component = newComponent;
        this.willAttachComponent(newComponent, target);
        this.onAttachComponent(newComponent, target);
        this.initComponent(newComponent);
        this.didAttachComponent(newComponent, target);
        this.setCoherent(true);
        this.decohereOutlets();
      }
    }
  };

  ComponentRef.prototype.unbindComponent = function <C extends Component>(this: ComponentRef<unknown, C>, component: Component): void {
    if (this.binds) {
      const oldComponent = this.detectComponent(component);
      if (oldComponent !== null && this.component === oldComponent) {
        (this as Mutable<typeof this>).component = null;
        this.willDetachComponent(oldComponent);
        this.onDetachComponent(oldComponent);
        this.deinitComponent(oldComponent);
        this.didDetachComponent(oldComponent);
        this.setCoherent(true);
        this.decohereOutlets();
      }
    }
  };

  ComponentRef.prototype.detectComponent = function <C extends Component>(this: ComponentRef<unknown, C>, component: Component): C | null {
    const key = this.componentKey;
    if (key !== void 0 && key === component.key) {
      return component as C;
    }
    return null;
  };

  ComponentRef.prototype.decohereOutlets = function (this: ComponentRef): void {
    const outlets = this.outlets;
    for (let i = 0, n = outlets !== null ? outlets.length : 0; i < n; i += 1) {
      this.decohereOutlet(outlets![i]!);
    }
  };

  ComponentRef.prototype.decohereOutlet = function (this: ComponentRef, outlet: ComponentRef): void {
    if ((outlet.flags & Fastener.DerivedFlag) === 0 && Math.min(this.flags & Affinity.Mask, Affinity.Intrinsic) >= (outlet.flags & Affinity.Mask)) {
      outlet.setDerived(true, this);
    } else if ((outlet.flags & Fastener.DerivedFlag) !== 0 && (outlet.flags & Fastener.DecoherentFlag) === 0) {
      outlet.setCoherent(false);
      outlet.decohere();
    }
  };

  ComponentRef.prototype.recohere = function (this: ComponentRef, t: number): void {
    if ((this.flags & Fastener.DerivedFlag) !== 0) {
      const inlet = this.inlet;
      if (inlet !== null) {
        this.setComponent(inlet.component);
      }
    }
  };

  ComponentRef.construct = function <F extends ComponentRef<any, any>>(fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (component?: AnyComponent<ComponentRefComponent<F>> | null, target?: Component | null, key?: string): ComponentRefComponent<F> | null | FastenerOwner<F> {
        if (component === void 0) {
          return fastener!.component;
        } else {
          fastener!.setComponent(component, target, key);
          return fastener!.owner;
        }
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, this.prototype);
    }
    fastener = _super.construct.call(this, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).component = null;
    return fastener;
  };

  ComponentRef.refine = function (fastenerClass: ComponentRefClass<any>): void {
    _super.refine.call(this, fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;

    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "componentKey")) {
      const componentKey = fastenerPrototype.componentKey as string | boolean | undefined;
      if (componentKey === true) {
        Object.defineProperty(fastenerPrototype, "componentKey", {
          value: fastenerClass.name,
          enumerable: true,
          configurable: true,
        });
      } else if (componentKey === false) {
        Object.defineProperty(fastenerPrototype, "componentKey", {
          value: void 0,
          enumerable: true,
          configurable: true,
        });
      }
    }
  };

  return ComponentRef;
})(ComponentRelation);
