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
import type {Observes} from "@swim/util";
import {Affinity} from "./Affinity";
import {FastenerContext} from "./FastenerContext";
import type {FastenerFlags} from "./Fastener";
import type {FastenerDescriptor} from "./Fastener";
import type {FastenerClass} from "./Fastener";
import {Fastener} from "./Fastener";
import type {ServiceFactory} from "./Service";
import {Service} from "./"; // forward import

/** @public */
export interface ProviderDescriptor<R, S extends Service> extends FastenerDescriptor<R> {
  extends?: Proto<Provider<any, any>> | boolean | null;
  serviceKey?: string | boolean;
}

/** @public */
export interface ProviderClass<P extends Provider<any, any> = Provider<any, any>> extends FastenerClass<P> {
  tryService<R, K extends keyof R, F extends R[K] = R[K]>(owner: R, fastenerName: K): (F extends {readonly service: infer S | null} ? S | null : never) | null;

  /** @internal */
  readonly ManagedFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface Provider<R = any, S extends Service = any> extends Fastener<R> {
  /** @override */
  get descriptorType(): Proto<ProviderDescriptor<R, S>>;

  /** @override */
  get fastenerType(): Proto<Provider<any, any>>;

  get serviceType(): ServiceFactory<S> | null;

  get observes(): boolean;

  get creates(): boolean;

  /** @protected @override */
  onBindInlet(inlet: Fastener<any, any, any>): void;

  /** @protected @override */
  onUnbindInlet(inlet: Fastener<any, any, any>): void;

  /** @override */
  get parent(): Provider<any, S> | null;

  get inletService(): S | null;

  getInletService(): S;

  get serviceKey(): string | undefined;

  readonly service: S | null;

  getService(): NonNullable<S>;

  setService(service: S | null, target?: Service | null, key?: string): S | null;

  /** @protected */
  initService(service: S): void;

  /** @protected */
  willAttachService(service: S, target: Service | null): void;

  /** @protected */
  onAttachService(service: S, target: Service | null): void;

  /** @protected */
  didAttachService(service: S, target: Service | null): void;

  /** @protected */
  deinitService(service: S): void;

  /** @protected */
  willDetachService(service: S): void;

  /** @protected */
  onDetachService(service: S): void;

  /** @protected */
  didDetachService(service: S): void;

  /** @protected */
  get parentService(): Service | null;

  /** @protected */
  insertChild(parent: Service, child: S, target: Service | null, key: string | undefined): void;

  createService(): S;

  /** @protected */
  mountService(service: S, target: Service | null, key: string | undefined): void;

  /** @protected */
  unmountService(service: S): void;

  /** @protected */
  mountRootService(service: S): void;

  /** @protected */
  unmountRootService(service: S): void;

  /** @protected @override */
  onMount(): void;

  /** @protected @override */
  onUnmount(): void;
}

/** @public */
export const Provider = (<R, S extends Service, P extends Provider<any, any>>() => Fastener.extend<Provider<R, S>, ProviderClass<P>>("Provider", {
  get fastenerType(): Proto<Provider<any, any>> {
    return Provider;
  },

  serviceType: null,

  observes: false,

  creates: true,

  inherits: true,

  affinity: Affinity.Inherited,

  onBindInlet(inlet: Fastener<any, any, any>): void {
    if ((this.flags & Fastener.InheritsFlag) !== 0 && (this.flags & Affinity.Mask) === Affinity.Inherited) {
      this.initAffinity(Affinity.Transient);
    }
    if (inlet instanceof Provider) {
      this.setDerived(true);
      this.setService(inlet.service);
    }
  },

  onUnbindInlet(inlet: Fastener<any, any, any>): void {
    super.onUnbindInlet(inlet);
    if ((this.flags & Fastener.InheritsFlag) !== 0 && (this.flags & Affinity.Mask) === Affinity.Transient) {
      this.initAffinity(Affinity.Inherited);
    }
  },

  get inletService(): S | null {
    const inlet = this.inlet;
    return inlet instanceof Provider ? inlet.service : null;
  },

  getInletService(): S {
    const inletService = this.inletService;
    if (inletService === void 0 || inletService === null) {
      let message = inletService + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "inlet service";
      throw new TypeError(message);
    }
    return inletService;
  },

  serviceKey: void 0,

  getService(): NonNullable<S> {
    const service = this.service;
    if (service === void 0 || service === null) {
      let message = service + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "service";
      throw new TypeError(message);
    }
    return service;
  },

  setService(newService: S | null, target?: Service | null, key?: string): S | null {
    const oldService = this.service;
    if (oldService === newService) {
      this.setCoherent(true);
      return oldService;
    }
    if (target === void 0) {
      target = null;
    }
    if (oldService !== null) {
      (this as Mutable<typeof this>).service = null;
      this.willDetachService(oldService);
      if ((this.flags & Fastener.MountedFlag) !== 0) {
        this.unmountService(oldService);
      }
      this.onDetachService(oldService);
      this.deinitService(oldService);
      this.didDetachService(oldService);
    }
    if (newService !== null) {
      (this as Mutable<typeof this>).service = newService;
      this.willAttachService(newService, target);
      if ((this.flags & Fastener.MountedFlag) !== 0) {
        this.mountService(newService, target, key);
      }
      this.onAttachService(newService, target);
      this.initService(newService);
      this.didAttachService(newService, target);
    }
    this.setCoherent(true);
    return oldService;
  },

  initService(service: S): void {
    // hook
  },

  willAttachService(service: S, target: Service | null): void {
    // hook
  },

  onAttachService(service: S, target: Service | null): void {
    if (this.observes && (this.flags & Fastener.MountedFlag) !== 0) {
      service.observe(this as Observes<S>);
    }
  },

  didAttachService(service: S, target: Service | null): void {
    // hook
  },

  deinitService(service: S): void {
    // hook
  },

  willDetachService(service: S): void {
    // hook
  },

  onDetachService(service: S): void {
    if (this.observes && (this.flags & Fastener.MountedFlag) !== 0) {
      service.unobserve(this as Observes<S>);
    }
  },

  didDetachService(service: S): void {
    // hook
  },

  get parentService(): S | null {
    const parentProvider = this.parent;
    return parentProvider !== null ? parentProvider.service : null;
  },

  insertChild(parent: Service, child: S, target: Service | null, key: string | undefined): void {
    parent.insertChild(child, target, key);
  },

  createService(): S {
    let service: S | undefined;
    const serviceType = this.serviceType;
    if (serviceType !== null) {
      service = serviceType.global();
    }
    if (service === void 0 || service === null) {
      let message = "unable to create ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "service";
      throw new Error(message);
    }
    return service;
  },

  mountService(service: S, target: Service | null, key: string | undefined): void {
    if (service.parent === null && !service.mounted) {
      let parent = this.parentService;
      if (parent === null) {
        parent = Service.global();
        target = null;
        key = void 0;
      } else if (key === void 0) {
        key = this.serviceKey;
      }
      this.insertChild(parent, service, target, key);
      this.setFlags(this.flags | Provider.ManagedFlag);
    }
    if (!this.derived) {
      this.mountRootService(service);
    }
  },

  unmountService(service: S): void {
    if (!this.derived) {
      this.unmountRootService(service);
    }
    if ((this.flags & Provider.ManagedFlag) !== 0) {
      this.setFlags(this.flags & ~Provider.ManagedFlag);
      service.remove();
    }
  },

  mountRootService(service: S): void {
    // hook
  },

  unmountRootService(service: S): void {
    // hook
  },

  onMount(): void {
    super.onMount();
    let service = this.service;
    if (service !== null) {
      this.mountService(service, null, void 0);
      if (this.observes) {
        service.observe(this as Observes<S>);
      }
    } else if (this.creates) {
      service = this.createService();
      this.setService(service);
    }
  },

  onUnmount(): void {
    const service = this.service;
    if (service !== null) {
      if (this.observes) {
        service.unobserve(this as Observes<S>);
      }
      this.unmountService(service);
    }
    super.onUnmount();
  },
},
{
  tryService<R, K extends keyof R, F extends R[K]>(owner: R, fastenerName: K): (F extends {readonly service: infer S | null} ? S | null : never) | null {
    const metaclass = FastenerContext.getMetaclass(owner);
    const provider = metaclass !== null ? metaclass.tryFastener(owner, fastenerName) : null;
    return provider instanceof Provider ? provider.service : null;
  },

  create(owner: P extends Fastener<infer R, any, any> ? R : never): P {
    const provider = super.create(owner) as P;
    if (provider.service === null && provider.creates) {
      const service = provider.createService();
      provider.setService(service);
    }
    return provider;
  },

  construct(provider: P | null, owner: P extends Fastener<infer R, any, any> ? R : never): P {
    provider = super.construct(provider, owner) as P;
    (provider as Mutable<typeof provider>).service = null;
    return provider;
  },

  refine(providerClass: FastenerClass<Provider<any, any>>): void {
    super.refine(providerClass);
    const providerPrototype = providerClass.prototype;

    const serviceKeyDescriptor = Object.getOwnPropertyDescriptor(providerPrototype, "serviceKey");
    if (serviceKeyDescriptor !== void 0 && "value" in serviceKeyDescriptor) {
      if (serviceKeyDescriptor.value === true) {
        serviceKeyDescriptor.value = providerClass.name;
        Object.defineProperty(providerPrototype, "serviceKey", serviceKeyDescriptor);
      } else if (serviceKeyDescriptor.value === false) {
        serviceKeyDescriptor.value = void 0;
        Object.defineProperty(providerPrototype, "serviceKey", serviceKeyDescriptor);
      }
    }
  },

  ManagedFlag: 1 << (Fastener.FlagShift + 0),

  FlagShift: Fastener.FlagShift + 1,
  FlagMask: (1 << (Fastener.FlagShift + 1)) - 1,
}))();
