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

import {__esDecorate} from "tslib";
import {__runInitializers} from "tslib";
import type {Mutable} from "@swim/util";
import type {Proto} from "@swim/util";
import {Identifiers} from "@swim/util";
import {Objects} from "@swim/util";
import type {Timing} from "@swim/util";
import {Affinity} from "./Affinity";
import {FastenerContext} from "./FastenerContext";
import {FastenerContextMetaclass} from "./FastenerContext";

/** @public */
export type FastenerFlags = number;

/** @public */
export interface FastenerDescriptor<R> {
  name?: PropertyKey;
  extends?: Proto<Fastener<any, any, any>> | boolean | null;
  affinity?: Affinity;
  inherits?: PropertyKey | boolean;
}

/** @public */
export interface FastenerDecorator<F extends Fastener<any, any, any>> {
  <T>(target: any, context: ClassFieldDecoratorContext<T, F>): (this: T, value?: F) => F;
  <T>(target: (this: T) => F, context: ClassGetterDecoratorContext<T, F>): (this: T) => F;
}

/** @public */
export type FastenerTemplate<F extends Fastener<any, any, any>> =
  F extends {readonly descriptorType?: Proto<infer D>}
          ? ThisType<F> & D & Partial<Omit<F, keyof D>> & (F extends Fastener<infer R, any, any> ? {readonly inletKeys?: readonly (keyof R)[]} : {})
          : never;

/** @public */
export type FastenerClassTemplate<C extends FastenerClass<any>> =
  ThisType<C> & Partial<C>;

/** @public */
export interface FastenerClass<F extends Fastener<any, any, any> = Fastener<any, any, any>> {
  /** @internal */
  prototype: F;

  <F2 extends F>(template: FastenerTemplate<F2>): FastenerDecorator<F2>;

  create(owner: F extends Fastener<infer R, any, any> ? R : never): F;

  /** @protected */
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F;

  /** @internal */
  declare<F2 extends F, C extends FastenerClass<any> = FastenerClass<F2>>(className: PropertyKey): C;

  /** @internal */
  implement<F2 extends F, C extends FastenerClass<any> = FastenerClass<F2>>(fastenerClass: C, template: FastenerTemplate<F2>, classTemplate?: FastenerClassTemplate<C>): void;

  specialize(template: F extends {readonly descriptorType?: Proto<infer D>} ? D : never): FastenerClass<F>;

  refine(fastenerClass: FastenerClass<Fastener<any, any, any>>): void;

  extend<F2 extends F, C extends FastenerClass<any> = FastenerClass<F2>>(className: PropertyKey, template: FastenerTemplate<F2>, classTemplate?: FastenerClassTemplate<C>): C;

  define<F2 extends F>(className: PropertyKey, template: FastenerTemplate<F2>, extendsClass?: FastenerClass<F>): FastenerClass<F2>;

  /**
   * Dummy getter function that always throws an exception. Used as a stand-in
   * for decorated fastener getters, whose implementation is injected by the
   * decorator.
   */
  getter<F2 extends F>(): F2;

  /** @internal */
  decorate<F2 extends F>(baseClass: FastenerClass<any>, template: FastenerTemplate<F2>, target: undefined, context: ClassFieldDecoratorContext<F2 extends Fastener<infer R, any, any> ? R : never, F2>): (this: F2 extends Fastener<infer R, any, any> ? R : never, value?: F2) => F2;
  /** @internal */
  decorate<F2 extends F>(baseClass: FastenerClass<any>, template: FastenerTemplate<F2>, target: (this: F2 extends Fastener<infer R, any, any> ? R : never) => F2, context: ClassGetterDecoratorContext<F2 extends Fastener<infer R, any, any> ? R : never, F2>): (this: F2 extends Fastener<infer R, any, any> ? R : never) => F2;

  /** @internal */
  decorateField<F2 extends F>(baseClass: FastenerClass<any>, template: FastenerTemplate<F2>, target: undefined, context: ClassFieldDecoratorContext<F2 extends Fastener<infer R, any, any> ? R : never, F2>): (this: F2 extends Fastener<infer R, any, any> ? R : never, value?: F2) => F2;

  /** @internal */
  decorateGetter<F2 extends F>(baseClass: FastenerClass<any>, template: FastenerTemplate<F2>, target: (this: F2 extends Fastener<infer R, any, any> ? R : never) => F2, context: ClassGetterDecoratorContext<F2 extends Fastener<infer R, any, any> ? R : never, F2>): (this: F2 extends Fastener<infer R, any, any> ? R : never) => F2;

  /** @internal */
  initDecorators(): void;

  /** @internal */
  defineField<F2 extends F, K extends keyof F2>(name: K, decorators: F2[K] extends Fastener<any, any, any> ? FastenerDecorator<F2[K]>[] : never): void;

  /** @internal */
  defineGetter<F2 extends F, K extends keyof F2>(name: K, decorators: F2[K] extends Fastener<any, any, any> ? FastenerDecorator<F2[K]>[] : never): void;

  /** @internal */
  initFasteners(fastener: F): void;

  /** @internal */
  readonly fieldInitializers?: {[name: PropertyKey]: Function[]};
  /** @internal */
  readonly instanceInitializers?: Function[];

  /** @internal */
  readonly MountedFlag: FastenerFlags;
  /** @internal */
  readonly InheritsFlag: FastenerFlags;
  /** @internal */
  readonly DerivedFlag: FastenerFlags;
  /** @internal */
  readonly DecoherentFlag: FastenerFlags;

  /** @internal */
  readonly FlagShift: number;
  /** @internal */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface Fastener<R = any, O = any, I extends any[] = [O]> extends FastenerContext {
  get descriptorType(): Proto<FastenerDescriptor<R>>;

  get fastenerType(): Proto<Fastener<any, any, any>>;

  readonly owner: R;

  readonly name: PropertyKey;

  get binds(): boolean;

  /** @protected */
  init(): void;

  /** @internal */
  get flagsInit(): FastenerFlags;

  /** @internal */
  readonly flags: FastenerFlags;

  /** @internal */
  setFlags(flags: FastenerFlags): void;

  readonly coherentTime: number;

  /** @protected */
  setCoherentTime(coherentTime: number): void;

  readonly version: number;

  /** @protected */
  incrementVersion(): void;

  get parentType(): Proto<any> | null | undefined;

  get parent(): Fastener<any, any, any> | null;

  readonly inletVersion: readonly number[] | number;

  readonly inlet: readonly Fastener<any, any, any>[] | Fastener<any, any, any> | null;

  /** @internal */
  inheritInlet(): void;

  bindInlet<K extends keyof I, IK extends I[K]>(inlet: Fastener<any, IK, any>, key: IK): void;
  bindInlet<I0 extends I[0]>(inlet: Fastener<any, I0, any>): void;

  /** @protected */
  willBindInlet(inlet: Fastener<any, any, any>): void;

  /** @protected */
  onBindInlet(inlet: Fastener<any, any, any>): void;

  /** @protected */
  didBindInlet(inlet: Fastener<any, any, any>): void;

  /** @internal */
  uninheritInlet(): void;

  unbindInlet(inlet?: Fastener<any, any, any>): void;

  /** @protected */
  willUnbindInlet(inlet: Fastener<any, any, any>): void;

  /** @protected */
  onUnbindInlet(inlet: Fastener<any, any, any>): void;

  /** @protected */
  didUnbindInlet(inlet: Fastener<any, any, any>): void;

  /** @internal */
  attachOutlet(outlet: Fastener<any, any, any>): void;

  /** @internal */
  detachOutlet(outlet: Fastener<any, any, any>): void;

  get inheritName(): PropertyKey | undefined;

  get inherits(): boolean;

  setInherits(inherits: PropertyKey | boolean): void;

  /** @protected */
  willSetInherits(inherits: boolean, inheritName: PropertyKey | undefined): void;

  /** @protected */
  onSetInherits(inherits: boolean, inheritName: PropertyKey | undefined): void;

  /** @protected */
  didSetInherits(inherits: boolean, inheritName: PropertyKey | undefined): void;

  get derived(): boolean;

  /** @internal */
  setDerived(derived: boolean): void;

  get affinity(): Affinity;

  hasAffinity(affinity: Affinity): boolean;

  /** @internal */
  initAffinity(affinity: Affinity): void;

  /** @internal */
  minAffinity(affinity: Affinity): boolean;

  setAffinity(affinity: Affinity): void;

  /** @protected */
  willSetAffinity(newAffinity: Affinity, oldAffinity: Affinity): void;

  /** @protected */
  onSetAffinity(newAffinity: Affinity, oldAffinity: Affinity): void;

  /** @protected */
  didSetAffinity(newAffinity: Affinity, oldAffinity: Affinity): void;

  get(): O;

  get coherent(): boolean;

  /** @protected */
  setCoherent(coherent: boolean): void;

  decohere(inlet?: Fastener<any, any, any>): void;

  requireRecohere(): void;

  recohere(t: number): void;

  /** @protected */
  get inletKeys(): readonly PropertyKey[] | undefined;

  resolveInlets(): readonly Fastener<any, any, any>[] | null;

  /** @protected */
  attachInlets(): void;

  /** @protected */
  detachInlets(): void;

  /** @override */
  getFastener<F extends Fastener>(fastenerName: PropertyKey, fastenerType?: Proto<F>, contextType?: Proto<any> | null): F | null;

  /** @override */
  getParentFastener<F extends Fastener>(fastenerName: string, fastenerType?: Proto<F>, contextType?: Proto<any>): F | null;

  /** @override */
  attachFastener(fastener: Fastener<any, any, any>): void;

  /** @override */
  decohereFastener(fastener: Fastener<any, any, any>): void;

  /** @override */
  requireUpdate(updateFlags: number): void;

  /** @override */
  getTransition?(fastener: Fastener<any, any, any>): Timing | null;

  /** @internal @protected */
  mountFasteners(): void;

  /** @internal @protected */
  unmountFasteners(): void;

  get mounted(): boolean;

  /** @internal */
  mount(): void;

  /** @protected */
  willMount(): void;

  /** @protected */
  onMount(): void;

  /** @protected */
  didMount(): void;

  /** @internal */
  unmount(): void;

  /** @protected */
  willUnmount(): void;

  /** @protected */
  onUnmount(): void;

  /** @protected */
  didUnmount(): void;

  /** @override */
  toString(): string;
}

/** @public */
export const Fastener = (<R, O, I extends any[], F extends Fastener<any, any, any>>() => (function (template: FastenerTemplate<Fastener<R, O, I>>, classTemplate: FastenerClassTemplate<FastenerClass<F>>): FastenerClass<F> {
  const Fastener = function (template: FastenerTemplate<F>): FastenerDecorator<F> {
    return Fastener.decorate.bind(Fastener, Fastener, template) as unknown as FastenerDecorator<F>;
  } as FastenerClass<F>;
  Object.setPrototypeOf(template, Object.prototype);
  Fastener.prototype = template as F;
  Fastener.prototype.constructor = Fastener;
  Object.setPrototypeOf(classTemplate, Fastener.prototype);
  Object.setPrototypeOf(Fastener, classTemplate);
  return Fastener;
})({
  get fastenerType(): Proto<Fastener<any, any, any>> {
    return Fastener;
  },

  get name(): string {
    return "Fastener";
  },

  init(): void {
    // hook
  },

  binds: false,

  flagsInit: 0,

  setFlags(flags: FastenerFlags): void {
    (this as Mutable<typeof this>).flags = flags;
  },

  incrementVersion(): void {
    (this as Mutable<typeof this>).version += 1;
  },

  setCoherentTime(coherentTime: number): void {
    (this as Mutable<typeof this>).coherentTime = coherentTime;
  },

  get parentType(): Proto<any> | null | undefined {
    return void 0;
  },

  get parent(): Fastener<any, any, any> | null {
    const inheritName = this.inheritName;
    if (inheritName === void 0 || !Objects.hasAllKeys<FastenerContext>(this.owner, "getParentFastener")) {
      return null;
    }
    return this.owner.getParentFastener!(inheritName, this.fastenerType, this.parentType);
  },

  inheritInlet(): void {
    let inlet: Fastener | null;
    if ((this.flags & Fastener.InheritsFlag) === 0 || (inlet = this.parent) === null) {
      return;
    }
    this.willBindInlet(inlet);
    inlet.attachOutlet(this);
    (this as Mutable<typeof this>).inletVersion = -1;
    (this as Mutable<typeof this>).inlet = inlet;
    this.onBindInlet(inlet);
    this.didBindInlet(inlet);
  },

  bindInlet<K extends keyof I, IK extends I[K]>(inlet: Fastener<any, IK, any>, key?: IK): void {
    this.setInherits(false);
    this.willBindInlet(inlet);
    inlet.attachOutlet(this);
    (this as Mutable<typeof this>).inletVersion = -1;
    (this as Mutable<typeof this>).inlet = inlet;
    this.onBindInlet(inlet);
    this.didBindInlet(inlet);
  },

  willBindInlet(inlet: Fastener<any, any, any>): void {
    // hook
  },

  onBindInlet(inlet: Fastener<any, any, any>): void {
    this.recohere(performance.now());
  },

  didBindInlet(inlet: Fastener<any, any, any>): void {
    // hook
  },

  uninheritInlet(): void {
    if ((this.flags & Fastener.InheritsFlag) === 0) {
      return;
    }
    const inlet = this.inlet;
    if (!(inlet instanceof Fastener)) {
      return;
    }
    this.willUnbindInlet(inlet);
    inlet.detachOutlet(this);
    (this as Mutable<typeof this>).inletVersion = -1;
    (this as Mutable<typeof this>).inlet = null;
    this.onUnbindInlet(inlet);
    this.didUnbindInlet(inlet);
  },

  unbindInlet(inlet?: Fastener<any, any, any>): void {
    if (inlet === void 0 && this.inlet instanceof Fastener) {
      inlet = this.inlet;
    }
    if (inlet instanceof Fastener && inlet === this.inlet) {
      this.willUnbindInlet(inlet);
      inlet.detachOutlet(this);
      (this as Mutable<typeof this>).inletVersion = -1;
      (this as Mutable<typeof this>).inlet = null;
      this.onUnbindInlet(inlet);
      this.didUnbindInlet(inlet);
    } else if (inlet === void 0) {
      (this as Mutable<typeof this>).inletVersion = -1;
      (this as Mutable<typeof this>).inlet = null;
    }
  },

  willUnbindInlet(inlet: Fastener<any, any, any>): void {
    // hook
  },

  onUnbindInlet(inlet: Fastener<any, any, any>): void {
    this.setDerived(false);
  },

  didUnbindInlet(inlet: Fastener<any, any, any>): void {
    // hook
  },

  attachOutlet(outlet: Fastener<any, any, any>): void {
    // hook
  },

  detachOutlet(outlet: Fastener<any, any, any>): void {
    // hook
  },

  get inheritName(): PropertyKey | undefined {
    return (this.flags & Fastener.InheritsFlag) !== 0 ? this.name : void 0;
  },

  get inherits(): boolean {
    return (this.flags & Fastener.InheritsFlag) !== 0;
  },

  setInherits(inherits: PropertyKey | boolean): void {
    let inheritName: PropertyKey | undefined;
    if (typeof inherits === "string" || typeof inherits === "number" || typeof inherits === "symbol") {
      if (inherits !== this.name) {
        inheritName = inherits;
      }
      inherits = true;
    }
    if (inherits && ((this.flags & Fastener.InheritsFlag) === 0 || (inheritName !== void 0 && inheritName !== this.name))) {
      this.unbindInlet();
      this.willSetInherits(true, inheritName);
      if (inheritName !== void 0) {
        Object.defineProperty(this, "name", {
          value: inheritName,
          enumerable: true,
          configurable: true,
        });
      }
      this.setFlags(this.flags | Fastener.InheritsFlag);
      this.onSetInherits(true, inheritName);
      this.didSetInherits(true, inheritName);
      this.inheritInlet();
    } else if (!inherits && (this.flags & Fastener.InheritsFlag) !== 0) {
      this.unbindInlet();
      this.willSetInherits(false, inheritName);
      this.setFlags(this.flags & ~Fastener.InheritsFlag);
      this.onSetInherits(false, inheritName);
      this.didSetInherits(false, inheritName);
    }
  },

  willSetInherits(inherits: boolean, inheritName: PropertyKey | undefined): void {
    // hook
  },

  onSetInherits(inherits: boolean, inheritName: PropertyKey | undefined): void {
    // hook
  },

  didSetInherits(inherits: boolean, inheritName: PropertyKey | undefined): void {
    // hook
  },

  get derived(): boolean {
    return (this.flags & Fastener.DerivedFlag) !== 0;
  },

  setDerived(derived: boolean): void {
    if (derived) {
      this.setFlags(this.flags | Fastener.DerivedFlag);
    } else {
      this.setFlags(this.flags & ~Fastener.DerivedFlag);
    }
  },

  get affinity(): Affinity {
    return (this.flags & Affinity.Mask) as Affinity;
  },

  hasAffinity(affinity: Affinity): boolean {
    return affinity >= (this.flags & Affinity.Mask);
  },

  initAffinity(affinity: Affinity): void {
    (this as Mutable<typeof this>).flags = this.flags & ~Affinity.Mask | affinity & Affinity.Mask;
  },

  minAffinity(newAffinity: Affinity): boolean {
    const oldAffinity = (this.flags & Affinity.Mask) as Affinity;
    if (newAffinity === Affinity.Reflexive) {
      newAffinity = oldAffinity;
    } else if ((newAffinity & ~Affinity.Mask) !== 0) {
      throw new Error("invalid affinity: " + newAffinity);
    }
    if (newAffinity > oldAffinity) {
      this.willSetAffinity(newAffinity, oldAffinity);
      this.setFlags(this.flags & ~Affinity.Mask | newAffinity);
      this.onSetAffinity(newAffinity, oldAffinity);
      this.didSetAffinity(newAffinity, oldAffinity);
    }
    return newAffinity >= oldAffinity;
  },

  setAffinity(newAffinity: Affinity): void {
    if ((newAffinity & ~Affinity.Mask) !== 0) {
      throw new Error("invalid affinity: " + newAffinity);
    }
    const oldAffinity = (this.flags & Affinity.Mask) as Affinity;
    if (newAffinity === oldAffinity) {
      return;
    }
    this.willSetAffinity(newAffinity, oldAffinity);
    this.setFlags(this.flags & ~Affinity.Mask | newAffinity);
    this.onSetAffinity(newAffinity, oldAffinity);
    this.didSetAffinity(newAffinity, oldAffinity);
  },

  willSetAffinity(newAffinity: Affinity, oldAffinity: Affinity): void {
    // hook
  },

  onSetAffinity(newAffinity: Affinity, oldAffinity: Affinity): void {
    if (newAffinity > oldAffinity && (this.flags & Fastener.DerivedFlag) !== 0) {
      const inlet = this.inlet;
      if (inlet instanceof Fastener && Math.min(inlet.flags & Affinity.Mask, Affinity.Intrinsic) < newAffinity) {
        this.setDerived(false);
      }
    } else if (newAffinity < oldAffinity && (this.flags & Fastener.InheritsFlag) !== 0) {
      const inlet = this.inlet;
      if (inlet instanceof Fastener && Math.min(inlet.flags & Affinity.Mask, Affinity.Intrinsic) >= newAffinity) {
        this.decohere(inlet);
      }
    }
  },

  didSetAffinity(newAffinity: Affinity, oldAffinity: Affinity): void {
    // hook
  },

  get(): O {
    return void 0 as O;
  },

  get coherent(): boolean {
    return (this.flags & Fastener.DecoherentFlag) === 0;
  },

  setCoherent(coherent: boolean): void {
    if (coherent) {
      this.setFlags(this.flags & ~Fastener.DecoherentFlag);
    } else {
      this.setFlags(this.flags | Fastener.DecoherentFlag);
    }
  },

  decohere(inlet?: Fastener<any, any, any>): void {
    if (inlet === void 0 || inlet !== this.inlet || (this.flags & Fastener.DerivedFlag) !== 0) {
      if ((this.flags & Fastener.DecoherentFlag) === 0) {
        this.requireRecohere();
      }
    } else {
      this.recohere(performance.now());
    }
  },

  requireRecohere(): void {
    this.setCoherent(false);
    if (Objects.hasAllKeys<FastenerContext>(this.owner, "decohereFastener")) {
      this.owner.decohereFastener!(this);
    }
  },

  recohere(t: number): void {
    this.setCoherentTime(t);
    const inlet = this.inlet;
    if (inlet instanceof Fastener) {
      this.setDerived((this.flags & Affinity.Mask) <= Math.min(inlet.flags & Affinity.Mask, Affinity.Intrinsic));
    } else if (Array.isArray(inlet)) {
      this.setDerived(true);
    } else {
      this.setDerived(false);
    }
    this.setCoherent(true);
  },

  inletKeys: void 0,

  resolveInlets(): readonly Fastener<any, any, any>[] | null {
    const inletKeys = this.inletKeys;
    if (inletKeys === void 0 || !Objects.hasAllKeys<FastenerContext>(this.owner, "getFastener")) {
      return null;
    }
    const inlets = new Array<Fastener<any, any, any>>(inletKeys.length);
    for (let i = 0; i < inletKeys.length; i += 1) {
      const inletKey = inletKeys[i]!;
      const inlet = this.owner.getFastener!(inletKey);
      if (inlet === null) {
        return null;
      }
      inlets[i] = inlet;
    }
    return inlets;
  },

  attachInlets(): void {
    const inlets = this.resolveInlets();
    if (inlets !== null) {
      this.setInherits(false);
      this.setFlags(this.flags | Fastener.DerivedFlag);
      const inletVersions = new Array<number>(inlets.length);
      for (let i = 0; i < inlets.length; i += 1) {
        inletVersions[i] = -1;
      }
      (this as Mutable<typeof this>).inletVersion = inletVersions;
      (this as Mutable<typeof this>).inlet = inlets;
      for (let i = 0; i < inlets.length; i += 1) {
        inlets[i]!.attachOutlet(this);
      }
    } else {
      this.inheritInlet();
    }
  },

  detachInlets(): void {
    const inlet = this.inlet;
    if (Array.isArray(inlet)) {
      for (let i = 0; i < inlet.length; i += 1) {
        (inlet[i] as Fastener).detachOutlet(this);
      }
      (this as Mutable<typeof this>).inletVersion = -1;
      (this as Mutable<typeof this>).inlet = null;
      this.setFlags(this.flags & ~Fastener.DerivedFlag);
    } else {
      this.uninheritInlet();
    }
  },

  getFastener<F extends Fastener>(fastenerName: PropertyKey, fastenerType?: Proto<F>, contextType?: Proto<any> | null): F | null {
    if (contextType !== void 0 && contextType !== null && !(this instanceof contextType)) {
      return null;
    }
    const fastener = (this as any)[fastenerName] as F | null | undefined;
    if (fastener === void 0 || (fastenerType !== void 0 && fastenerType !== null && !(fastener instanceof fastenerType))) {
      return null;
    }
    return fastener;
  },

  getParentFastener<F extends Fastener>(fastenerName: string, fastenerType?: Proto<F>, contextType?: Proto<any>): F | null {
    return null;
  },

  attachFastener(fastener: Fastener): void {
    if (this.mounted) {
      fastener.mount();
    }
  },

  decohereFastener(fastener: Fastener<any, any, any>): void {
    if (Objects.hasAllKeys<FastenerContext>(this.owner, "decohereFastener")) {
      this.owner.decohereFastener!(fastener);
    }
  },

  requireUpdate(updateFlags: number): void {
    if (Objects.hasAllKeys<FastenerContext>(this.owner, "requireUpdate")) {
      this.owner.requireUpdate!(updateFlags);
    }
  },

  getTransition(fastener: Fastener<any, any, any>): Timing | null {
    if (Objects.hasAllKeys<FastenerContext>(this.owner, "getTransition")) {
      return this.owner.getTransition!(fastener);
    }
    return null;
  },

  mountFasteners(): void {
    const metaclass = FastenerContext.getMetaclass(this);
    if (metaclass === null) {
      return;
    }
    const fastenerSlots = metaclass.slots;
    for (let i = 0; i < fastenerSlots.length; i += 1) {
      const fastener = this[fastenerSlots[i]!];
      if (fastener instanceof Fastener) {
        fastener.mount();
      }
    }
  },

  unmountFasteners(): void {
    const metaclass = FastenerContext.getMetaclass(this);
    if (metaclass === null) {
      return;
    }
    const fastenerSlots = metaclass.slots;
    for (let i = 0; i < fastenerSlots.length; i += 1) {
      const fastener = this[fastenerSlots[i]!];
      if (fastener instanceof Fastener) {
        fastener.unmount();
      }
    }
  },

  get mounted(): boolean {
    return (this.flags & Fastener.MountedFlag) !== 0;
  },

  mount(): void {
    if ((this.flags & Fastener.MountedFlag) !== 0) {
      return;
    }
    this.willMount();
    this.setFlags(this.flags | Fastener.MountedFlag);
    this.onMount();
    this.didMount();
  },

  willMount(): void {
    // hook
  },

  onMount(): void {
    this.attachInlets();
  },

  didMount(): void {
    this.mountFasteners();
  },

  unmount(): void {
    if ((this.flags & Fastener.MountedFlag) === 0) {
      return;
    }
    this.willUnmount();
    this.setFlags(this.flags & ~Fastener.MountedFlag);
    this.onUnmount();
    this.didUnmount();
  },

  willUnmount(): void {
    this.unmountFasteners();
  },

  onUnmount(): void {
    this.detachInlets();
  },

  didUnmount(): void {
    // hook
  },

  toString(): string {
    return this.name.toString();
  },
},
{
  create(owner: F extends Fastener<infer R, any, any> ? R : never): F {
    const fastener = this.construct(null, owner);
    fastener.init();
    return fastener;
  },

  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    if (fastener === null) {
      fastener = Object.create(this.prototype) as F;
    }
    (fastener as Mutable<typeof fastener>).owner = owner;
    (fastener as Mutable<typeof fastener>).flags = fastener.flagsInit;
    (fastener as Mutable<typeof fastener>).coherentTime = 0;
    (fastener as Mutable<typeof fastener>).version = 0;
    (fastener as Mutable<typeof fastener>).inletVersion = -1;
    (fastener as Mutable<typeof fastener>).inlet = null;
    return fastener;
  },

  declare<F2 extends F, C extends FastenerClass<any>>(className: PropertyKey): C {
    if (typeof className === "string" && Identifiers.isValid(className) && className !== "Fastener" && className !== "template") {
      return new Function("Fastener",
        "return function " + className + "(template) { return Fastener.decorate.bind(Fastener, " + className + ", template); }"
      )(Fastener) as C;
    }

    const fastenerClass = function <F extends Fastener<any, any, any>>(template: FastenerTemplate<F>): FastenerDecorator<F> {
      return Fastener.decorate.bind(Fastener, Fastener, template) as unknown as FastenerDecorator<F>;
    } as C;
    Object.defineProperty(fastenerClass, "name", {
      value: className,
      enumerable: true,
      configurable: true,
    });
    return fastenerClass;
  },

  implement<F2 extends F, C extends FastenerClass<any>>(fastenerClass: C, template: FastenerTemplate<F2>, classTemplate?: FastenerClassTemplate<C>): void {
    Object.defineProperty(template, "name", {
      value: fastenerClass.name,
      enumerable: true,
      configurable: true,
    });
    if ("extends" in template) {
      delete template.extends;
    }

    // Directly insert the template object into the prototype chain
    // to ensure that super works correctly.
    Object.setPrototypeOf(template, this.prototype);
    fastenerClass.prototype = template as unknown as F2;
    fastenerClass.prototype.constructor = fastenerClass;
    if (classTemplate !== void 0) {
      Object.setPrototypeOf(fastenerClass, classTemplate);
      Object.setPrototypeOf(classTemplate, this);
    } else {
      Object.setPrototypeOf(fastenerClass, this);
    }
  },

  specialize(template: F extends {readonly descriptorType?: Proto<infer D>} ? D : never): FastenerClass<F> {
    let baseClass = template.extends as FastenerClass<F> | null | undefined;
    if (baseClass === void 0 || baseClass === null) {
      baseClass = this;
    }
    return baseClass;
  },

  refine(fastenerClass: FastenerClass<Fastener<any, any, any>>): void {
    const fastenerPrototype = fastenerClass.prototype;

    let flagsInit = fastenerPrototype.flagsInit;
    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "affinity")) {
      flagsInit = flagsInit & ~Affinity.Mask | fastenerPrototype.affinity & Affinity.Mask;
      delete (fastenerPrototype as FastenerDescriptor<any>).affinity;
    }
    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "inherits")) {
      let inherits = fastenerPrototype.inherits as PropertyKey | boolean;
      if (typeof inherits === "string" || typeof inherits === "number" || typeof inherits === "symbol") {
        Object.defineProperty(fastenerPrototype, "name", {
          value: inherits,
          enumerable: true,
          configurable: true,
        });
        inherits = true;
      }
      if (inherits) {
        flagsInit |= Fastener.InheritsFlag;
      } else {
        flagsInit &= ~Fastener.InheritsFlag;
      }
      delete (fastenerPrototype as FastenerDescriptor<any>).inherits;
    }
    Object.defineProperty(fastenerPrototype, "flagsInit", {
      value: flagsInit,
      enumerable: true,
      configurable: true,
    });
  },

  extend<F2 extends F, C extends FastenerClass<any>>(className: PropertyKey, template: FastenerTemplate<F2>, classTemplate?: FastenerClassTemplate<C>): any {
    if (template.name !== void 0) {
      className = template.name;
    }
    const fastenerClass = this.declare<F2, C>(className);
    this.implement(fastenerClass, template, classTemplate);
    this.refine(fastenerClass);
    return fastenerClass;
  },

  define<F2 extends F>(className: PropertyKey, template: FastenerTemplate<F2>, extendsClass?: FastenerClass<F>): FastenerClass<F2> {
    if (typeof template.extends === "boolean") {
      if (template.extends === true) {
        Object.defineProperty(template, "extends", {
          value: extendsClass,
          enumerable: true,
          configurable: true,
        });
      } else if (template.extends === false) {
        Object.defineProperty(template, "extends", {
          value: null,
          enumerable: true,
          configurable: true,
        });
      }
    }
    const baseClass = this.specialize(template);
    return baseClass.extend(className, template);
  },

  getter<F2 extends F>(): F2 {
    throw new Error("missing decorator");
  },

  decorate<F2 extends F>(baseClass: FastenerClass<any>, template: FastenerTemplate<F2>, target: ((this: F2 extends Fastener<infer R, any, any> ? R : never) => F2) | undefined, context: ClassFieldDecoratorContext<F2 extends Fastener<infer R, any, any> ? R : never, F2> | ClassGetterDecoratorContext<F2 extends Fastener<infer R, any, any> ? R : never, F2>): (this: F2 extends Fastener<infer R, any, any> ? R : never, value?: F2) => F2 {
    if (context.kind === "field") {
      return Fastener.decorateField(baseClass, template, target as undefined, context);
    } else if (context.kind === "getter") {
      return Fastener.decorateGetter(baseClass, template, target!, context);
    }
    throw new Error("unsupported " + (context as ClassMemberDecoratorContext).kind + " decorator");
  },

  decorateField<F2 extends F>(baseClass: FastenerClass<any>, template: FastenerTemplate<F2>, target: undefined, context: ClassFieldDecoratorContext<F2 extends Fastener<infer R, any, any> ? R : never, F2>): (this: F2 extends Fastener<infer R, any, any> ? R : never, value?: F2) => F2 {
    const metaclass = FastenerContextMetaclass.getOrCreate<any>(context.metadata);

    const fastenerName = context.name;
    const fastenerSlot = fastenerName;

    const fastenerSuperclass = metaclass.classMap[fastenerName];
    const fastenerClass = baseClass.define(fastenerName, template, fastenerSuperclass);

    metaclass.classMap[fastenerName] = fastenerClass;
    metaclass.slotMap[fastenerName] = fastenerSlot;
    if (fastenerSuperclass === void 0) {
      metaclass.slots.push(fastenerSlot);
    }

    return function (this: F2 extends Fastener<infer R, any, any> ? R : never, value?: F2): F2 {
      return fastenerClass.create(this);
    };
  },

  decorateGetter<F2 extends F>(baseClass: FastenerClass<any>, template: FastenerTemplate<F2>, target: F2 extends Fastener<infer R, any, any> ? (this: R) => F2 : never, context: ClassGetterDecoratorContext<F2 extends Fastener<infer R, any, any> ? R : never, F2>): (this: F2 extends Fastener<infer R, any, any> ? R : never) => F2 {
    const metaclass = FastenerContextMetaclass.getOrCreate<any>(context.metadata);

    const fastenerName = context.name;
    const fastenerSlot = metaclass.slotMap[fastenerName] !== void 0
                       ? metaclass.slotMap[fastenerName]!
                       : Symbol(fastenerName.toString());

    const fastenerSuperclass = metaclass.classMap[fastenerName];
    const fastenerClass = baseClass.define(fastenerName, template, fastenerSuperclass);

    metaclass.classMap[fastenerName] = fastenerClass;
    metaclass.slotMap[fastenerName] = fastenerSlot;
    if (fastenerSuperclass === void 0) {
      metaclass.slots.push(fastenerSlot);
    }

    context.addInitializer(function (this: F2 extends Fastener<infer R, any, any> ? R : never): void {
      this[fastenerSlot] = void 0;
    });
    return function (this: F2 extends Fastener<infer R, any, any> ? R : never): F2 {
      let fastener = this[fastenerSlot] as F2 | undefined;
      if (fastener === void 0) {
        fastener = fastenerClass.create(this);
        this[fastenerSlot] = fastener;
        if ((this as FastenerContext).attachFastener !== void 0) {
          (this as FastenerContext).attachFastener!(fastener);
        }
      }
      return fastener;
    };
  },

  initDecorators(): void {
    // Ensure each fastener class has its own metadata and decorator initializer fields.
    if (!Object.hasOwnProperty.call(this, Symbol.metadata)) {
      const superMetadata: Record<PropertyKey, unknown> & object /*DecoratorMetadataObject*/ | undefined = Object.getPrototypeOf(this)[Symbol.metadata];
      Object.defineProperty(this, Symbol.metadata, {
        value: Object.create(superMetadata !== void 0 ? superMetadata : null),
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }
    if (!Object.hasOwnProperty.call(this, "fieldInitializers")) {
      Object.defineProperty(this, "fieldInitializers", {
        value: {},
        enumerable: true,
        configurable: true,
      });
    }
    if (!Object.hasOwnProperty.call(this, "instanceInitializers")) {
      Object.defineProperty(this, "instanceInitializers", {
        value: [],
        enumerable: true,
        configurable: true,
      });
    }
  },

  defineField<F2 extends F, K extends keyof F2>(name: K, decorators: F2[K] extends Fastener<any, any, any> ? FastenerDecorator<F2[K]>[] : never): void {
    this.initDecorators();
    __esDecorate(null, null, decorators as Function[], {
      kind: "field",
      name,
      static: false,
      private: false,
      access: {
        has(obj: F2): boolean {
          return name in obj;
        },
        get(obj: F2): F2[K] {
          return obj[name];
        },
        set(obj: F2, value: F2[K]): void {
          obj[name] = value;
        },
      },
      metadata: this[Symbol.metadata],
    }, this.fieldInitializers![name] = [], this.instanceInitializers!);
  },

  defineGetter<F2 extends F, K extends keyof F2>(name: K, decorators: F2[K] extends Fastener<any, any, any> ? FastenerDecorator<F2[K]>[] : never): void {
    this.initDecorators();
    Object.defineProperty(this.prototype, name, {
      get: Fastener.getter,
      enumerable: true,
      configurable: true,
    });
    __esDecorate(this, null, decorators as Function[], {
      kind: "getter",
      name,
      static: false,
      private: false,
      access: {
        has(obj: F2): boolean {
          return name in obj;
        },
        get(obj: F2): F2[K] {
          return obj[name];
        },
        set(obj: F2, value: F2[K]): void {
          obj[name] = value;
        },
      },
      metadata: this[Symbol.metadata],
    }, null, this.instanceInitializers!);
  },

  initFasteners(fastener: F): void {
    if (!Object.hasOwnProperty.call(this, "fieldInitializers")
        || !Object.hasOwnProperty.call(this, "instanceInitializers")) {
      return;
    }
    __runInitializers(fastener, this.instanceInitializers!);
    for (const key in this.fieldInitializers!) {
      (fastener as any)[key] = __runInitializers(fastener, this.fieldInitializers[key]!, void 0);
    }
  },

  MountedFlag: 1 << (Affinity.Shift + 0),
  InheritsFlag: 1 << (Affinity.Shift + 1),
  DerivedFlag: 1 << (Affinity.Shift + 2),
  DecoherentFlag: 1 << (Affinity.Shift + 3),

  FlagShift: Affinity.Shift + 4,
  FlagMask: (1 << (Affinity.Shift + 4)) - 1,
}))();
