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

import type {Mutable, Proto, Observes} from "@swim/util";
import {Affinity} from "../fastener/Affinity";
import {FastenerFlags, FastenerOwner, FastenerDescriptor, FastenerClass, Fastener} from "../fastener/Fastener";
import {ServiceFactory, Service} from "../"; // forward import

/** @public */
export type ProviderService<P extends Provider<any, any>> =
  P extends {service: infer S | null} ? S : never;

/** @public */
export interface ProviderDescriptor<S extends Service = Service> extends FastenerDescriptor {
  extends?: Proto<Provider<any, any>> | string | boolean | null;
  serviceType?: ServiceFactory<any>;
  serviceKey?: string | boolean;
  creates?: boolean;
  observes?: boolean;
}

/** @public */
export type ProviderTemplate<P extends Provider<any, any>> =
  ThisType<P> &
  ProviderDescriptor<ProviderService<P>> &
  Partial<Omit<P, keyof ProviderDescriptor>>;

/** @public */
export interface ProviderClass<P extends Provider<any, any> = Provider<any, any>> extends FastenerClass<P> {
  /** @override */
  specialize(template: ProviderDescriptor<any>): ProviderClass<P>;

  /** @override */
  refine(providerClass: ProviderClass<any>): void;

  /** @override */
  extend<P2 extends P>(className: string, template: ProviderTemplate<P2>): ProviderClass<P2>;
  extend<P2 extends P>(className: string, template: ProviderTemplate<P2>): ProviderClass<P2>;

  /** @override */
  define<P2 extends P>(className: string, template: ProviderTemplate<P2>): ProviderClass<P2>;
  define<P2 extends P>(className: string, template: ProviderTemplate<P2>): ProviderClass<P2>;

  /** @override */
  <P2 extends P>(template: ProviderTemplate<P2>): PropertyDecorator;

  /** @internal */
  readonly ManagedFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface Provider<O = unknown, S extends Service = Service> extends Fastener<O> {
  (): S | null;
  (service: S | null, target?: Service | null, key?: string): O;

  /** @override */
  get fastenerType(): Proto<Provider<any, any>>;

  /** @internal */
  readonly serviceType?: ServiceFactory<S>; // optional prototype property

  /** @internal */
  readonly creates?: boolean; // optional prototype property

  /** @internal */
  readonly observes?: boolean; // optional prototype property

  /** @internal @override */
  getSuper(): Provider<unknown, S> | null;

  /** @internal @override */
  setDerived(derived: boolean, inlet: Provider<unknown, S>): void;

  /** @protected @override */
  willDerive(inlet: Provider<unknown, S>): void;

  /** @protected @override */
  onDerive(inlet: Provider<unknown, S>): void;

  /** @protected @override */
  didDerive(inlet: Provider<unknown, S>): void;

  /** @protected @override */
  willUnderive(inlet: Provider<unknown, S>): void;

  /** @protected @override */
  onUnderive(inlet: Provider<unknown, S>): void;

  /** @protected @override */
  didUnderive(inlet: Provider<unknown, S>): void;

  /** @override */
  get inlet(): Provider<unknown, S> | null;

  /** @protected @override */
  willBindInlet(inlet: Provider<unknown, S>): void;

  /** @protected @override */
  onBindInlet(inlet: Provider<unknown, S>): void;

  /** @protected @override */
  didBindInlet(inlet: Provider<unknown, S>): void;

  /** @protected @override */
  willUnbindInlet(inlet: Provider<unknown, S>): void;

  /** @protected @override */
  onUnbindInlet(inlet: Provider<unknown, S>): void;

  /** @protected @override */
  didUnbindInlet(inlet: Provider<unknown, S>): void;

  /** @internal @override */
  attachOutlet(target: Provider<unknown, S>): void;

  /** @internal @override */
  detachOutlet(target: Provider<unknown, S>): void;

  get inletService(): S | null;

  getInletService(): S;

  /** @internal */
  readonly serviceKey?: string; // optional prototype property

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

  /** @internal @protected */
  get parentService(): Service | null;

  /** @internal @protected */
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
export const Provider = (function (_super: typeof Fastener) {
  const Provider = _super.extend("Provider", {
    static: true,
    affinity: Affinity.Inherited,
    inherits: true,
    creates: true,
  }) as ProviderClass;

  Object.defineProperty(Provider.prototype, "fastenerType", {
    value: Provider,
    configurable: true,
  });

  Provider.prototype.onDerive = function <S extends Service>(this: Provider<unknown, S>, inlet: Provider<unknown, S>): void {
    this.setService(inlet.service);
  };

  Provider.prototype.onBindInlet = function <S extends Service>(this: Provider<unknown, S>, inlet: Provider<unknown, S>): void {
    if ((this.flags & Fastener.InheritsFlag) !== 0 && (this.flags & Affinity.Mask) === Affinity.Inherited) {
      this.initAffinity(Affinity.Transient);
    }
    _super.prototype.onBindInlet.call(this, inlet);
  };

  Provider.prototype.onUnbindInlet = function <S extends Service>(this: Provider<unknown, S>, inlet: Provider<unknown, S>): void {
    _super.prototype.onUnbindInlet.call(this, inlet);
    if ((this.flags & Fastener.InheritsFlag) !== 0 && (this.flags & Affinity.Mask) === Affinity.Transient) {
      this.initAffinity(Affinity.Inherited);
    }
  };

  Object.defineProperty(Provider.prototype, "inletService", {
    get: function <S extends Service>(this: Provider<unknown, S>): S | null {
      const inlet = this.inlet;
      return inlet !== null ? inlet.service : null;
    },
    configurable: true,
  });

  Provider.prototype.getInletService = function <S extends Service>(this: Provider<unknown, S>): S {
    const inletService = this.inletService;
    if (inletService === void 0 || inletService === null) {
      let message = inletService + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "inlet service";
      throw new TypeError(message);
    }
    return inletService;
  };

  Provider.prototype.getService = function <S extends Service>(this: Provider<unknown, S>): NonNullable<S> {
    const service = this.service;
    if (service === void 0 || service === null) {
      let message = service + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "service";
      throw new TypeError(message);
    }
    return service as NonNullable<S>;
  };

  Provider.prototype.setService = function <S extends Service>(this: Provider<unknown, S>, newService: S | null, target?: Service | null, key?: string): S | null {
    const oldService = this.service;
    if (oldService !== newService) {
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
    }
    return oldService;
  };

  Provider.prototype.initService = function <S extends Service>(this: Provider<unknown, S>, service: S): void {
    // hook
  };

  Provider.prototype.willAttachService = function <S extends Service>(this: Provider<unknown, S>, service: S, target: Service | null): void {
    // hook
  };

  Provider.prototype.onAttachService = function <S extends Service>(this: Provider<unknown, S>, service: S, target: Service | null): void {
    if (this.observes === true && (this.flags & Fastener.MountedFlag) !== 0) {
      service.observe(this as Observes<S>);
    }
  };

  Provider.prototype.didAttachService = function <S extends Service>(this: Provider<unknown, S>, service: S, target: Service | null): void {
    // hook
  };

  Provider.prototype.deinitService = function <S extends Service>(this: Provider<unknown, S>, service: S): void {
    // hook
  };

  Provider.prototype.willDetachService = function <S extends Service>(this: Provider<unknown, S>, service: S): void {
    // hook
  };

  Provider.prototype.onDetachService = function <S extends Service>(this: Provider<unknown, S>, service: S): void {
    if (this.observes === true && (this.flags & Fastener.MountedFlag) !== 0) {
      service.unobserve(this as Observes<S>);
    }
  };

  Provider.prototype.didDetachService = function <S extends Service>(this: Provider<unknown, S>, service: S): void {
    // hook
  };

  Object.defineProperty(Provider.prototype, "parentService", {
    get<S extends Service>(this: Provider<unknown, S>): S | null {
      const superProvider = this.getSuper();
      return superProvider !== null ? superProvider.service : null;
    },
    configurable: true,
  });

  Provider.prototype.insertChild = function <S extends Service>(this: Provider<unknown, S>, parent: Service, child: S, target: Service | null, key: string | undefined): void {
    parent.insertChild(child, target, key);
  };

  Provider.prototype.createService = function <S extends Service>(this: Provider<unknown, S>): S {
    let service: S | undefined;
    const serviceType = this.serviceType;
    if (serviceType !== void 0) {
      service = serviceType.global();
    }
    if (service === void 0 || service === null) {
      let message = "Unable to create ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "service";
      throw new Error(message);
    }
    return service;
  };

  Provider.prototype.mountService = function <S extends Service>(this: Provider<unknown, S>, service: S, target: Service | null, key: string | undefined): void {
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
  };

  Provider.prototype.unmountService = function <S extends Service>(this: Provider<unknown, S>, service: S): void {
    if (!this.derived) {
      this.unmountRootService(service);
    }
    if ((this.flags & Provider.ManagedFlag) !== 0) {
      this.setFlags(this.flags & ~Provider.ManagedFlag);
      service.remove();
    }
  };

  Provider.prototype.mountRootService = function <S extends Service>(this: Provider<unknown, S>, service: S): void {
    // hook
  };

  Provider.prototype.unmountRootService = function <S extends Service>(this: Provider<unknown, S>, service: S): void {
    // hook
  };

  Provider.prototype.onMount = function <S extends Service>(this: Provider<unknown, S>): void {
    _super.prototype.onMount.call(this);
    let service = this.service;
    if (service !== null) {
      this.mountService(service, null, void 0);
      if (this.observes === true) {
        service.observe(this as Observes<S>);
      }
    } else if (this.creates) {
      service = this.createService();
      this.setService(service);
    }
  };

  Provider.prototype.onUnmount = function <S extends Service>(this: Provider<unknown, S>): void {
    const service = this.service;
    if (service !== null) {
      if (this.observes === true) {
        service.unobserve(this as Observes<S>);
      }
      this.unmountService(service);
    }
    _super.prototype.onUnmount.call(this);
  };

  Provider.create = function <P extends Provider<any, any>>(this: ProviderClass<P>, owner: FastenerOwner<P>): P {
    const provider = _super.create.call(this, owner) as P;
    if (provider.service === null && provider.creates) {
      const service = provider.createService();
      provider.setService(service);
    }
    return provider;
  };

  Provider.construct = function <P extends Provider<any, any>>(provider: P | null, owner: FastenerOwner<P>): P {
    if (provider === null) {
      provider = function (service?: ProviderService<P> | null, target?: Service | null, key?: string): ProviderService<P> | null | FastenerOwner<P> {
        if (service === void 0) {
          return provider!.service;
        } else {
          provider!.setService(service, target, key);
          return provider!.owner;
        }
      } as P;
      delete (provider as Partial<Mutable<P>>).name; // don't clobber prototype name
      Object.setPrototypeOf(provider, this.prototype);
    }
    provider = _super.construct.call(this, provider, owner) as P;
    (provider as Mutable<typeof provider>).service = null;
    return provider;
  };

  Provider.refine = function (providerClass: ProviderClass<any>): void {
    _super.refine.call(this, providerClass);
    const providerPrototype = providerClass.prototype;

    if (Object.prototype.hasOwnProperty.call(providerPrototype, "serviceKey")) {
      const serviceKey = providerPrototype.serviceKey as string | boolean | undefined;
      if (serviceKey === true) {
        Object.defineProperty(providerPrototype, "serviceKey", {
          value: providerClass.name,
          enumerable: true,
          configurable: true,
        });
      } else if (serviceKey === false) {
        Object.defineProperty(providerPrototype, "serviceKey", {
          value: void 0,
          enumerable: true,
          configurable: true,
        });
      }
    }
  };

  (Provider as Mutable<typeof Provider>).ManagedFlag = 1 << (_super.FlagShift + 0);

  (Provider as Mutable<typeof Provider>).FlagShift = _super.FlagShift + 1;
  (Provider as Mutable<typeof Provider>).FlagMask = (1 << Provider.FlagShift) - 1;

  return Provider;
})(Fastener);
