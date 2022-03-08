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

import {Mutable, Proto, Observable, ObserverType} from "@swim/util";
import {Affinity} from "../fastener/Affinity";
import {FastenerOwner, FastenerInit, FastenerClass, Fastener} from "../fastener/Fastener";
import {Service} from "../service/Service";

/** @internal */
export type MemberProviderService<O, K extends keyof O> =
  O[K] extends Provider<any, infer S> ? S : never;

/** @internal */
export type ProviderService<P extends Provider<any, any>> =
  P extends Provider<any, infer S> ? S : never;

/** @public */
export interface ProviderInit<S = unknown> extends FastenerInit {
  extends?: {prototype: Provider<any, any>} | string | boolean | null;
  type?: unknown;
  observes?: boolean;

  initService?(service: S): void;
  willAttachService?(service: S): void;
  didAttachService?(service: S): void;

  deinitService?(service: S): void;
  willDetachService?(service: S): void;
  didDetachService?(service: S): void;

  willInherit?(superFastener: Provider<unknown, S>): void;
  didInherit?(superFastener: Provider<unknown, S>): void;
  willUninherit?(superFastener: Provider<unknown, S>): void;
  didUninherit?(superFastener: Provider<unknown, S>): void;

  willBindSuperFastener?(superFastener: Provider<unknown, S>): void;
  didBindSuperFastener?(superFastener: Provider<unknown, S>): void;
  willUnbindSuperFastener?(superFastener: Provider<unknown, S>): void;
  didUnbindSuperFastener?(superFastener: Provider<unknown, S>): void;

  service?: S;
  createService?(): S;
}

/** @public */
export type ProviderDescriptor<O = unknown, S = unknown, I = {}> = ThisType<Provider<O, S> & I> & ProviderInit<S> & Partial<I>;

/** @public */
export interface ProviderClass<P extends Provider<any, any> = Provider<any, any>> extends FastenerClass<P> {
}

/** @public */
export interface ProviderFactory<P extends Provider<any, any> = Provider<any, any>> extends ProviderClass<P> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): ProviderFactory<P> & I;

  define<O, S>(className: string, descriptor: ProviderDescriptor<O, S>): ProviderFactory;
  define<O, S extends Observable>(className: string, descriptor: {observes: boolean} & ProviderDescriptor<O, S, ObserverType<S>>): ProviderFactory<Provider<any, S>>;
  define<O, S, I = {}>(className: string, descriptor: {implements: unknown} & ProviderDescriptor<O, S, I>): ProviderFactory<Provider<any, S> & I>;
  define<O, S extends Observable, I = {}>(className: string, descriptor: {implements: unknown; observes: boolean} & ProviderDescriptor<O, S, I & ObserverType<S>>): ProviderFactory<Provider<any, S> & I>;

  <O, S>(descriptor: ProviderDescriptor<O, S>): PropertyDecorator;
  <O, S extends Observable>(descriptor: {observes: boolean} & ProviderDescriptor<O, S, ObserverType<S>>): PropertyDecorator;
  <O, S, I = {}>(descriptor: {implements: unknown} & ProviderDescriptor<O, S, I>): PropertyDecorator;
  <O, S extends Observable, I = {}>(descriptor: {implements: unknown; observes: boolean} & ProviderDescriptor<O, S, I & ObserverType<S>>): PropertyDecorator;
}

/** @public */
export interface Provider<O = unknown, S = unknown> extends Fastener<O> {
  (): S;

  /** @override */
  get fastenerType(): Proto<Provider<any, any>>;

  /** @internal @override */
  setInherited(inherited: boolean, superFastener: Provider<unknown, S>): void;

  /** @protected @override */
  willInherit(superFastener: Provider<unknown, S>): void;

  /** @protected @override */
  onInherit(superFastener: Provider<unknown, S>): void;

  /** @protected @override */
  didInherit(superFastener: Provider<unknown, S>): void;

  /** @protected @override */
  willUninherit(superFastener: Provider<unknown, S>): void;

  /** @protected @override */
  onUninherit(superFastener: Provider<unknown, S>): void;

  /** @protected @override */
  didUninherit(superFastener: Provider<unknown, S>): void;

  /** @override */
  get superFastener(): Provider<unknown, S> | null;

  /** @internal @override */
  getSuperFastener(): Provider<unknown, S> | null;

  /** @protected @override */
  willBindSuperFastener(superFastener: Provider<unknown, S>): void;

  /** @protected @override */
  onBindSuperFastener(superFastener: Provider<unknown, S>): void;

  /** @protected @override */
  didBindSuperFastener(superFastener: Provider<unknown, S>): void;

  /** @protected @override */
  willUnbindSuperFastener(superFastener: Provider<unknown, S>): void;

  /** @protected @override */
  onUnbindSuperFastener(superFastener: Provider<unknown, S>): void;

  /** @protected @override */
  didUnbindSuperFastener(superFastener: Provider<unknown, S>): void;

  /** @internal @override */
  attachSubFastener(subFastener: Provider<unknown, S>): void;

  /** @internal @override */
  detachSubFastener(subFastener: Provider<unknown, S>): void;

  readonly service: S;

  getService(): NonNullable<S>;

  getServiceOr<E>(elseService: E): NonNullable<S> | E;

  /** @internal */
  setService(service: S): S;

  /** @protected */
  initService(service: S): void;

  /** @protected */
  willAttachService(service: S): void;

  /** @protected */
  onAttachService(service: S): void;

  /** @protected */
  didAttachService(service: S): void;

  /** @protected */
  deinitService(service: S): void;

  /** @protected */
  willDetachService(service: S): void;

  /** @protected */
  onDetachService(service: S): void;

  /** @protected */
  didDetachService(service: S): void;

  /** @internal */
  createService(): S;

  /** @protected @override */
  onMount(): void;

  /** @protected @override */
  onUnmount(): void;

  /** @internal */
  get observes(): boolean | undefined; // optional prototype field
}

/** @public */
export const Provider = (function (_super: typeof Fastener) {
  const Provider: ProviderFactory = _super.extend("Provider");

  Object.defineProperty(Provider.prototype, "fastenerType", {
    get: function (this: Provider): Proto<Provider<any, any>> {
      return Provider;
    },
    configurable: true,
  });

  Provider.prototype.onInherit = function <S>(this: Provider<unknown, S>, superFastener: Provider<unknown, S>): void {
    this.setService(superFastener.service);
  };

  Provider.prototype.onBindSuperFastener = function <S>(this: Provider<unknown, S>, superFastener: Provider<unknown, S>): void {
    if ((this.flags & Fastener.InheritsFlag) !== 0 && (this.flags & Affinity.Mask) === Affinity.Inherited) {
      this.initAffinity(Affinity.Transient);
    }
    _super.prototype.onBindSuperFastener.call(this, superFastener);
  };

  Provider.prototype.onUnbindSuperFastener = function <S>(this: Provider<unknown, S>, superFastener: Provider<unknown, S>): void {
    _super.prototype.onUnbindSuperFastener.call(this, superFastener);
    if ((this.flags & Fastener.InheritsFlag) !== 0 && (this.flags & Affinity.Mask) === Affinity.Transient) {
      this.initAffinity(Affinity.Inherited);
    }
  };

  Provider.prototype.getService = function <S>(this: Provider<unknown, S>): NonNullable<S> {
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

  Provider.prototype.getServiceOr = function <S, E>(this: Provider<unknown, S>, elseService: E): NonNullable<S> | E {
    let service: S | E = this.service;
    if (service === void 0 || service === null) {
      service = elseService;
    }
    return service as NonNullable<S> | E;
  };

  Provider.prototype.setService = function <S>(this: Provider<unknown, S>, newService: S): S {
    const oldService = this.service;
    if (oldService !== newService) {
      if (oldService !== void 0 && oldService !== null) {
        this.willDetachService(oldService);
        (this as Mutable<typeof this>).service = void 0 as unknown as S;
        this.onDetachService(oldService);
        this.deinitService(oldService);
        this.didDetachService(oldService);
      }
      if (newService !== void 0 && newService !== null) {
        this.willAttachService(newService);
        (this as Mutable<typeof this>).service = newService;
        this.onAttachService(newService);
        this.initService(newService);
        this.didAttachService(newService);
      }
    }
    return oldService;
  };

  Provider.prototype.initService = function <S>(this: Provider<unknown, S>, service: S): void {
    // hook
  };

  Provider.prototype.willAttachService = function <S>(this: Provider<unknown, S>, service: S): void {
    // hook
  };

  Provider.prototype.onAttachService = function <S>(this: Provider<unknown, S>, service: S): void {
    if (this.observes === true && Observable.is(service)) {
      service.observe(this as ObserverType<S>);
    }
  };

  Provider.prototype.didAttachService = function <S>(this: Provider<unknown, S>, service: S): void {
    // hook
  };

  Provider.prototype.deinitService = function <S>(this: Provider<unknown, S>, service: S): void {
    // hook
  };

  Provider.prototype.willDetachService = function <S>(this: Provider<unknown, S>, service: S): void {
    // hook
  };

  Provider.prototype.onDetachService = function <S>(this: Provider<unknown, S>, service: S): void {
    if (this.observes === true && Observable.is(service)) {
      service.unobserve(this as ObserverType<S>);
    }
  };

  Provider.prototype.didDetachService = function <S>(this: Provider<unknown, S>, service: S): void {
    // hook
  };

  Provider.prototype.createService = function <S>(this: Provider<unknown, S>): S {
    return this.service;
  };

  Provider.prototype.onMount = function (this: Provider): void {
    _super.prototype.onMount.call(this);
    let service = this.service;
    if (service === void 0 || service === null) {
      service = this.createService();
      this.setService(service);
    }
    if ((this.flags & Fastener.InheritedFlag) === 0 && service instanceof Service) {
      service.attachRoot(this.owner);
    }
  };

  Provider.prototype.onUnmount = function (this: Provider): void {
    const service = this.service;
    if ((this.flags & Fastener.InheritedFlag) === 0 && service instanceof Service) {
      service.detachRoot(this.owner);
    }
    _super.prototype.onUnmount.call(this);
  };

  Provider.construct = function <P extends Provider<any, any>>(providerClass: {prototype: P}, provider: P | null, owner: FastenerOwner<P>): P {
    if (provider === null) {
      provider = function (): ProviderService<P> {
        return provider!.service;
      } as P;
      delete (provider as Partial<Mutable<P>>).name; // don't clobber prototype name
      Object.setPrototypeOf(provider, providerClass.prototype);
    }
    provider = _super.construct(providerClass, provider, owner) as P;
    (provider as Mutable<typeof provider>).service = void 0 as unknown as ProviderService<P>;
    provider.initAffinity(Affinity.Inherited);
    provider.initInherits(true);
    return provider;
  };

  Provider.define = function <O, S>(className: string, descriptor: ProviderDescriptor<O, S>): ProviderFactory<Provider<any, S>> {
    let superClass = descriptor.extends as ProviderFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const service = descriptor.service;
    delete descriptor.extends;
    delete descriptor.implements;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.service;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const providerClass = superClass.extend(className, descriptor);

    providerClass.construct = function (providerClass: {prototype: Provider<any, any>}, provider: Provider<O, S> | null, owner: O): Provider<O, S> {
      provider = superClass!.construct(providerClass, provider, owner);
      if (affinity !== void 0) {
        provider.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        provider.initInherits(inherits);
      }
      if (service !== void 0) {
        provider.setService(service);
      }
      return provider;
    };

    return providerClass;
  };

  return Provider;
})(Fastener);
