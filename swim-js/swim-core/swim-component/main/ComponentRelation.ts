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
import type {LikeType} from "@swim/util";
import type {Observes} from "@swim/util";
import type {FastenerDescriptor} from "./Fastener";
import type {FastenerClass} from "./Fastener";
import {Fastener} from "./Fastener";
import type {ComponentFactory} from "./Component";
import {Component} from "./Component";

/** @public */
export interface ComponentRelationDescriptor<R, C extends Component<any>> extends FastenerDescriptor<R> {
  extends?: Proto<ComponentRelation<any, any, any>> | boolean | null;
}

/** @public */
export interface ComponentRelationClass<F extends ComponentRelation<any, any, any> = ComponentRelation> extends FastenerClass<F> {
}

/** @public */
export interface ComponentRelation<R = any, C extends Component<any> = Component, I extends any[] = [C | null]> extends Fastener<R, C | null, I> {
  /** @override */
  get descriptorType(): Proto<ComponentRelationDescriptor<R, C>>;

  /** @override */
  get fastenerType(): Proto<ComponentRelation<any, any, any>>;

  get componentType(): ComponentFactory<C> | null;

  get observes(): boolean;

  /** @override */
  get parent(): ComponentRelation<any, C, any> | null;

  /** @internal */
  readonly outlets: ReadonlySet<Fastener<any, any, any>> | null;

  /** @internal @override */
  attachOutlet(outlet: Fastener<any, any, any>): void;

  /** @internal @override */
  detachOutlet(outlet: Fastener<any, any, any>): void;

  /** @internal @protected */
  decohereOutlets(): void;

  /** @protected */
  initComponent(component: C): void;

  /** @protected */
  willAttachComponent(component: C, target: Component<any> | null): void;

  /** @protected */
  onAttachComponent(component: C, target: Component<any> | null): void;

  /** @protected */
  didAttachComponent(component: C, target: Component<any> | null): void;

  /** @protected */
  deinitComponent(component: C): void;

  /** @protected */
  willDetachComponent(component: C): void;

  /** @protected */
  onDetachComponent(component: C): void;

  /** @protected */
  didDetachComponent(component: C): void;

  /** @protected */
  get parentComponent(): Component<any> | null;

  /** @protected */
  insertChild(parent: Component<any>, child: C, target: Component<any> | null, key: string | undefined): void;

  /** @internal */
  bindComponent(component: Component<any>, target: Component<any> | null): void;

  /** @internal */
  unbindComponent(component: Component<any>): void;

  detectComponent(component: Component<any>): C | null;

  createComponent(): C;

  fromLike(value: C | LikeType<C>): C;
}

/** @public */
export const ComponentRelation = (<R, C extends Component<any>, I extends any[], F extends ComponentRelation<any, any, any>>() => Fastener.extend<ComponentRelation<R, C, I>, ComponentRelationClass<F>>("ComponentRelation", {
  get fastenerType(): Proto<ComponentRelation<any, any, any>> {
    return ComponentRelation;
  },

  componentType: null,

  observes: false,

  attachOutlet(outlet: Fastener<any, any, any>): void {
    let outlets = this.outlets as Set<Fastener<any, any, any>> | null;
    if (outlets === null) {
      outlets = new Set<Fastener<any, any, any>>();
      (this as Mutable<typeof this>).outlets = outlets;
    }
    outlets.add(outlet);
  },

  detachOutlet(outlet: Fastener<any, any, any>): void {
    const outlets = this.outlets as Set<Fastener<any, any, any>> | null;
    if (outlets !== null) {
      outlets.delete(outlet);
    }
  },

  decohereOutlets(): void {
    const outlets = this.outlets;
    if (outlets !== null) {
      for (const outlet of outlets) {
        outlet.decohere(this);
      }
    }
  },

  initComponent(component: C): void {
    // hook
  },

  willAttachComponent(component: C, target: Component<any> | null): void {
    // hook
  },

  onAttachComponent(component: C, target: Component<any> | null): void {
    if (this.observes) {
      component.observe(this as Observes<C>);
    }
  },

  didAttachComponent(component: C, target: Component<any> | null): void {
    // hook
  },

  deinitComponent(component: C): void {
    // hook
  },

  willDetachComponent(component: C): void {
    // hook
  },

  onDetachComponent(component: C): void {
    if (this.observes) {
      component.unobserve(this as Observes<C>);
    }
  },

  didDetachComponent(component: C): void {
    // hook
  },

  get parentComponent(): Component<any> | null {
    const owner = this.owner;
    return owner instanceof Component ? owner : null;
  },

  insertChild(parent: Component<any>, child: C, target: Component<any> | null, key: string | undefined): void {
    parent.insertChild(child, target, key);
  },

  bindComponent(component: Component<any>, target: Component<any> | null): void {
    // hook
  },

  unbindComponent(component: Component<any>): void {
    // hook
  },

  detectComponent(component: Component<any>): C | null {
    return null;
  },

  createComponent(): C {
    let component: C | undefined;
    const componentType = this.componentType;
    if (componentType !== null) {
      component = componentType.create();
    }
    if (component === void 0 || component === null) {
      let message = "unable to create ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "component";
      throw new Error(message);
    }
    return component;
  },

  fromLike(value: C | LikeType<C>): C {
    const componentType = this.componentType;
    if (componentType !== null) {
      return componentType.fromLike(value);
    }
    return Component.fromLike(value) as C;
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).outlets = null;
    return fastener;
  },
}))();
