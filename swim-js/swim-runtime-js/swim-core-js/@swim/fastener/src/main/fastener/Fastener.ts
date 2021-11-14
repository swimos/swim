// Copyright 2015-2021 Swim Inc.
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

import {Mutable, Class, Family, Identifiers} from "@swim/util";
import {Affinity} from "./Affinity";
import {FastenerContextClass, FastenerContext} from "./FastenerContext";

/** @internal */
export type MemberFasteners<O, F extends Fastener<any> = Fastener<any>> =
  {[K in keyof O as O[K] extends F ? K : never]: O[K]};

/** @internal */
export type MemberFastener<O, K extends keyof MemberFasteners<O, F>, F extends Fastener<any> = Fastener<any>> =
  MemberFasteners<O, F>[K] extends F ? MemberFasteners<O, F>[K] : never;

/** @internal */
export type MemberFastenerClass<O, K extends keyof MemberFasteners<O, F>, F extends Fastener<any> = Fastener<any>> =
  MemberFasteners<O, F>[K] extends F ? FastenerClass<MemberFasteners<O, F>[K]> : never;

/** @public */
export type FastenerOwner<F> =
  F extends Fastener<infer O> ? O : never;

/** @public */
export type FastenerFlags = number;

/** @public */
export interface FastenerInit {
  name?: string;
  lazy?: boolean;
  static?: string | boolean;
  extends?: {prototype: Fastener<any>} | string | boolean | null;
  affinity?: Affinity;
  inherits?: string | boolean;

  init?(): void;

  willSetAffinity?(newAffinity: Affinity, oldAffinity: Affinity): void;
  didSetAffinity?(newAffinity: Affinity, oldAffinity: Affinity): void;

  willSetInherits?(inherits: boolean, superName: string | undefined): void;
  didSetInherits?(inherits: boolean, superName: string | undefined): void;

  willInherit?(superFastener: Fastener): void;
  didInherit?(superFastener: Fastener): void;
  willUninherit?(superFastener: Fastener): void;
  didUninherit?(superFastener: Fastener): void;

  willBindSuperFastener?(superFastener: Fastener): void;
  didBindSuperFastener?(superFastener: Fastener): void;
  willUnbindSuperFastener?(superFastener: Fastener): void;
  didUnbindSuperFastener?(superFastener: Fastener): void;

  willMount?(): void;
  didMount?(): void;
  willUnmount?(): void;
  didUnmount?(): void;
}

/** @public */
export type FastenerDescriptor<O = unknown, I = {}> = ThisType<Fastener<O> & I> & FastenerInit & Partial<I>;

/** @public */
export interface FastenerClass<F extends Fastener<any> = Fastener<any>> extends Function {
  /** @internal */
  prototype: F;

  /** @internal */
  contextClass?: FastenerContextClass;

  create(owner: FastenerOwner<F>): F;

  construct(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F;

  /** @internal */
  readonly MountedFlag: FastenerFlags;
  /** @internal */
  readonly InheritsFlag: FastenerFlags;
  /** @internal */
  readonly InheritedFlag: FastenerFlags;
  /** @internal */
  readonly DecoherentFlag: FastenerFlags;

  /** @internal */
  readonly FlagShift: number;
  /** @internal */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface FastenerFactory<F extends Fastener<any> = Fastener<any>> extends FastenerClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): FastenerFactory<F> & I;

  define<O>(className: string, descriptor: FastenerDescriptor<O>): FastenerFactory<Fastener<any>>;
  define<O, I = {}>(className: string, descriptor: FastenerDescriptor<O, I>): FastenerFactory<Fastener<any> & I>;

  <O>(descriptor: FastenerDescriptor<O>): PropertyDecorator;
  <O, I = {}>(descriptor: FastenerDescriptor<O, I>): PropertyDecorator;
}

/** @public */
export interface Fastener<O = unknown> extends Family {
  readonly owner: O;

  /** @internal */
  init(): void;

  /** @override */
  get familyType(): Class<Fastener<any>> | null;

  get name(): string;

  /** @internal */
  readonly flags: FastenerFlags;

  /** @internal */
  setFlags(flags: FastenerFlags): void;

  get affinity(): Affinity;

  hasAffinity(affinity: Affinity): boolean;

  /** @internal */
  initAffinity(affinity: Affinity): void;

  /** @internal */
  minAffinity(affinity: Affinity | undefined): boolean;

  setAffinity(affinity: Affinity): void;

  /** @protected */
  willSetAffinity(newAffinity: Affinity, oldAffinity: Affinity): void;

  /** @protected */
  onSetAffinity(newAffinity: Affinity, oldAffinity: Affinity): void;

  /** @protected */
  didSetAffinity(newAffinity: Affinity, oldAffinity: Affinity): void;

  get inherits(): boolean;

  /** @internal */
  initInherits(inherits: string | boolean): void;

  setInherits(inherits: string | boolean): void;

  /** @protected */
  willSetInherits(inherits: boolean, superName: string | undefined): void;

  /** @protected */
  onSetInherits(inherits: boolean, superName: string | undefined): void;

  /** @protected */
  didSetInherits(inherits: boolean, superName: string | undefined): void;

  get inherited(): boolean;

  /** @internal */
  setInherited(inherited: boolean, superFastener: Fastener): void;

  /** @protected */
  willInherit(superFastener: Fastener): void;

  /** @protected */
  onInherit(superFastener: Fastener): void;

  /** @protected */
  didInherit(superFastener: Fastener): void;

  /** @protected */
  willUninherit(superFastener: Fastener): void;

  /** @protected */
  onUninherit(superFastener: Fastener): void;

  /** @protected */
  didUninherit(superFastener: Fastener): void;

  get superName(): string | undefined;

  get superFastener(): Fastener | null;

  /** @internal */
  getSuperFastener(): Fastener | null;

  /** @internal */
  bindSuperFastener(): void;

  /** @protected */
  willBindSuperFastener(superFastener: Fastener): void;

  /** @protected */
  onBindSuperFastener(superFastener: Fastener): void;

  /** @protected */
  didBindSuperFastener(superFastener: Fastener): void;

  /** @internal */
  unbindSuperFastener(): void;

  /** @protected */
  willUnbindSuperFastener(superFastener: Fastener): void;

  /** @protected */
  onUnbindSuperFastener(superFastener: Fastener): void;

  /** @protected */
  didUnbindSuperFastener(superFastener: Fastener): void;

  /** @internal */
  attachSubFastener(subFastener: Fastener): void;

  /** @internal */
  detachSubFastener(subFastener: Fastener): void;

  get coherent(): boolean;

  /** @internal */
  setCoherent(coherent: boolean): void;

  /** @internal */
  decohere(): void;

  /** @internal */
  recohere(t: number): void;

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

  /** @internal */
  get lazy(): boolean; // prototype property

  /** @internal */
  get static(): string | boolean; // prototype property
}

/** @public */
export const Fastener = (function (_super: typeof Object) {
  const Fastener = function (descriptor: FastenerDescriptor): PropertyDecorator {
    return FastenerContext.decorator(Fastener, descriptor);
  } as FastenerFactory;

  Fastener.prototype = Object.create(_super.prototype);
  Fastener.prototype.constructor = Fastener;

  Fastener.prototype.init = function (this: Fastener): void {
    // hook
  };

  Object.defineProperty(Fastener.prototype, "familyType", {
    get: function (this: Fastener): Class<Fastener<any>> | null {
      return null;
    },
    configurable: true,
  });

  Object.defineProperty(Fastener.prototype, "name", {
    value: "",
    configurable: true,
  });

  Fastener.prototype.setFlags = function (this: Fastener, flags: FastenerFlags): void {
    (this as Mutable<typeof this>).flags = flags;
  };

  Object.defineProperty(Fastener.prototype, "affinity", {
    get(this: Fastener): Affinity {
      return this.flags & Affinity.Mask;
    },
    configurable: true,
  });

  Fastener.prototype.hasAffinity = function (this: Fastener, affinity: Affinity): boolean {
    return affinity >= this.affinity;
  };

  Fastener.prototype.initAffinity = function (this: Fastener, affinity: Affinity): void {
    (this as Mutable<typeof this>).flags = this.flags & ~Affinity.Mask | affinity & Affinity.Mask;
  };

  Fastener.prototype.minAffinity = function (this: Fastener, newAffinity: Affinity | undefined): boolean {
    const oldAffinity = this.affinity;
    if (newAffinity === void 0) {
      newAffinity = Affinity.Extrinsic;
    } else if (newAffinity === Affinity.Reflexive) {
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
  };

  Fastener.prototype.setAffinity = function (this: Fastener, newAffinity: Affinity): void {
    if ((newAffinity & ~Affinity.Mask) !== 0) {
      throw new Error("invalid affinity: " + newAffinity);
    }
    const oldAffinity = this.affinity;
    if (newAffinity !== oldAffinity) {
      this.willSetAffinity(newAffinity, oldAffinity);
      this.setFlags(this.flags & ~Affinity.Mask | newAffinity);
      this.onSetAffinity(newAffinity, oldAffinity);
      this.didSetAffinity(newAffinity, oldAffinity);
    }
  };

  Fastener.prototype.willSetAffinity = function (this: Fastener, newAffinity: Affinity, oldAffinity: Affinity): void {
    // hook
  };

  Fastener.prototype.onSetAffinity = function (this: Fastener, newAffinity: Affinity, oldAffinity: Affinity): void {
    if (newAffinity > oldAffinity && this.inherited) {
      const superFastener = this.superFastener;
      if (superFastener !== null && Math.min(superFastener.affinity, Affinity.Intrinsic) < newAffinity) {
        this.setInherited(false, superFastener);
      }
    } else if (newAffinity < oldAffinity && this.inherits) {
      const superFastener = this.superFastener;
      if (superFastener !== null && Math.min(superFastener.affinity, Affinity.Intrinsic) >= newAffinity) {
        this.setInherited(true, superFastener);
      }
    }
  };

  Fastener.prototype.didSetAffinity = function (this: Fastener, newAffinity: Affinity, oldAffinity: Affinity): void {
    // hook
  };

  Object.defineProperty(Fastener.prototype, "inherits", {
    get: function (this: Fastener): boolean {
      return (this.flags & Fastener.InheritsFlag) !== 0;
    },
    configurable: true,
  });

  Fastener.prototype.initInherits = function (this: Fastener, inherits: string | boolean): void {
    let superName: string | undefined;
    if (typeof inherits === "string") {
      superName = inherits;
      inherits = true;
    }
    if (inherits) {
      if (superName !== void 0) {
        Object.defineProperty(this, "name", {
          value: superName,
          enumerable: true,
          configurable: true,
        });
      }
      (this as Mutable<typeof this>).flags = this.flags | Fastener.InheritsFlag;
    } else {
      (this as Mutable<typeof this>).flags = this.flags & ~Fastener.InheritsFlag;
    }
  };

  Fastener.prototype.setInherits = function (this: Fastener, inherits: string | boolean): void {
    let superName: string | undefined;
    if (typeof inherits === "string") {
      if (inherits !== this.name) {
        superName = inherits;
      }
      inherits = true;
    }
    if (inherits !== ((this.flags & Fastener.InheritsFlag) !== 0) || superName !== void 0) {
      this.unbindSuperFastener();
      this.willSetInherits(inherits, superName);
      if (inherits) {
        if (superName !== void 0) {
          Object.defineProperty(this, "name", {
            value: superName,
            enumerable: true,
            configurable: true,
          });
        }
        this.setFlags(this.flags | Fastener.InheritsFlag);
      } else {
        this.setFlags(this.flags & ~Fastener.InheritsFlag);
      }
      this.onSetInherits(inherits, superName);
      this.didSetInherits(inherits, superName);
      this.bindSuperFastener();
    }
  };

  Fastener.prototype.willSetInherits = function (this: Fastener, inherits: boolean, superName: string | undefined): void {
    // hook
  };

  Fastener.prototype.onSetInherits = function (this: Fastener, inherits: boolean, superName: string | undefined): void {
    // hook
  };

  Fastener.prototype.didSetInherits = function (this: Fastener, inherits: boolean, superName: string | undefined): void {
    // hook
  };

  Object.defineProperty(Fastener.prototype, "inherited", {
    get: function (this: Fastener): boolean {
      return (this.flags & Fastener.InheritedFlag) !== 0;
    },
    configurable: true,
  });

  Fastener.prototype.setInherited = function (this: Fastener, inherited: boolean, superFastener: Fastener): void {
    if (inherited && (this.flags & Fastener.InheritedFlag) === 0) {
      this.willInherit(superFastener);
      this.setFlags(this.flags | Fastener.InheritedFlag);
      this.onInherit(superFastener);
      this.didInherit(superFastener);
    } else if (!inherited && (this.flags & Fastener.InheritedFlag) !== 0) {
      this.willUninherit(superFastener);
      this.setFlags(this.flags & ~Fastener.InheritedFlag);
      this.onUninherit(superFastener);
      this.didUninherit(superFastener);
    }
  };

  Fastener.prototype.willInherit = function (this: Fastener, superFastener: Fastener): void {
    // hook
  };

  Fastener.prototype.onInherit = function (this: Fastener, superFastener: Fastener): void {
    // hook
  };

  Fastener.prototype.didInherit = function (this: Fastener, superFastener: Fastener): void {
    // hook
  };

  Fastener.prototype.willUninherit = function (this: Fastener, superFastener: Fastener): void {
    // hook
  };

  Fastener.prototype.onUninherit = function (this: Fastener, superFastener: Fastener): void {
    // hook
  };

  Fastener.prototype.didUninherit = function (this: Fastener, superFastener: Fastener): void {
    // hook
  };

  Object.defineProperty(Fastener.prototype, "superName", {
    get: function (this: Fastener): string | undefined {
      return this.inherits ? this.name : void 0;
    },
    configurable: true,
  });

  Object.defineProperty(Fastener.prototype, "superFastener", {
    get: function (this: Fastener): Fastener | null {
      return this.getSuperFastener();
    },
    configurable: true,
  });

  Fastener.prototype.getSuperFastener = function (this: Fastener): Fastener | null {
    const superName = this.superName;
    if (superName !== void 0) {
      const fastenerContext = this.owner;
      if (FastenerContext.is(fastenerContext)) {
        const superFastener = fastenerContext.getSuperFastener(superName, this.familyType);
        if (superFastener !== null) {
          return superFastener;
        }
      }
    }
    return null;
  }

  Fastener.prototype.bindSuperFastener = function (this: Fastener): void {
    const superName = this.superName;
    if (superName !== void 0) {
      const fastenerContext = this.owner;
      if (FastenerContext.is(fastenerContext)) {
        const superFastener = fastenerContext.getSuperFastener(superName, this.familyType);
        if (superFastener !== null) {
          this.willBindSuperFastener(superFastener);
          superFastener.attachSubFastener(this);
          this.onBindSuperFastener(superFastener);
          this.didBindSuperFastener(superFastener);
        }
      }
    }
  };

  Fastener.prototype.willBindSuperFastener = function (this: Fastener, superFastener: Fastener): void {
    // hook
  };

  Fastener.prototype.onBindSuperFastener = function (this: Fastener, superFastener: Fastener): void {
    if (superFastener.affinity >= this.affinity) {
      this.setInherited(true, superFastener);
    }
  };

  Fastener.prototype.didBindSuperFastener = function (this: Fastener, superFastener: Fastener): void {
    // hook
  };

  Fastener.prototype.unbindSuperFastener = function (this: Fastener): void {
    const superFastener = this.superFastener;
    if (superFastener !== null) {
      this.willUnbindSuperFastener(superFastener);
      superFastener.detachSubFastener(this);
      this.onUnbindSuperFastener(superFastener);
      this.didUnbindSuperFastener(superFastener);
    }
  };

  Fastener.prototype.willUnbindSuperFastener = function (this: Fastener, superFastener: Fastener): void {
    // hook
  };

  Fastener.prototype.onUnbindSuperFastener = function (this: Fastener, superFastener: Fastener): void {
    this.setInherited(false, superFastener);
  };

  Fastener.prototype.didUnbindSuperFastener = function (this: Fastener, superFastener: Fastener): void {
    // hook
  };

  Fastener.prototype.attachSubFastener = function (this: Fastener, subFastener: Fastener): void {
    // hook
  };

  Fastener.prototype.detachSubFastener = function (this: Fastener, subFastener: Fastener): void {
    // hook
  };

  Object.defineProperty(Fastener.prototype, "coherent", {
    get: function (this: Fastener): boolean {
      return (this.flags & Fastener.DecoherentFlag) === 0;
    },
    configurable: true,
  });

  Fastener.prototype.setCoherent = function (this: Fastener, coherent: boolean): void {
    if (coherent) {
      this.setFlags(this.flags & ~Fastener.DecoherentFlag);
    } else {
      this.setFlags(this.flags | Fastener.DecoherentFlag);
    }
  };

  Fastener.prototype.decohere = function (this: Fastener): void {
    const fastenerContext = this.owner;
    if (FastenerContext.has(fastenerContext, "decohereFastener")) {
      fastenerContext.decohereFastener(this);
    }
  };

  Fastener.prototype.recohere = function (this: Fastener, t: number): void {
    // hook
  };

  Object.defineProperty(Fastener.prototype, "mounted", {
    get: function (this: Fastener): boolean {
      return (this.flags & Fastener.MountedFlag) !== 0;
    },
    configurable: true,
  });

  Fastener.prototype.mount = function (this: Fastener): void {
    if ((this.flags & Fastener.MountedFlag) === 0) {
      this.willMount();
      this.setFlags(this.flags | Fastener.MountedFlag);
      this.onMount();
      this.didMount();
    }
  };

  Fastener.prototype.willMount = function (this: Fastener): void {
    // hook
  };

  Fastener.prototype.onMount = function (this: Fastener): void {
    this.bindSuperFastener();
  };

  Fastener.prototype.didMount = function (this: Fastener): void {
    // hook
  };

  Fastener.prototype.unmount = function (this: Fastener): void {
    if ((this.flags & Fastener.MountedFlag) !== 0) {
      this.willUnmount();
      this.setFlags(this.flags & ~Fastener.MountedFlag);
      this.onUnmount();
      this.didUnmount();
    }
  };

  Fastener.prototype.willUnmount = function (this: Fastener): void {
    // hook
  };

  Fastener.prototype.onUnmount = function (this: Fastener): void {
    this.unbindSuperFastener();
  };

  Fastener.prototype.didUnmount = function (this: Fastener): void {
    // hook
  };

  Fastener.prototype.toString = function (this: Fastener): string {
    return this.name;
  };

  Object.defineProperty(Fastener.prototype, "lazy", {
    get: function (this: Fastener): boolean {
      return true;
    },
    configurable: true,
  });

  Object.defineProperty(Fastener.prototype, "static", {
    get: function (this: Fastener): string | boolean {
      return false;
    },
    configurable: true,
  });

  Fastener.create = function <F extends Fastener<any>>(this: FastenerClass<F>, owner: FastenerOwner<F>): F {
    const fastener = this.construct(this, null, owner);
    fastener.init();
    return fastener;
  };

  Fastener.construct = function <F extends Fastener<any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = Object.create(fastenerClass.prototype) as F;
    }
    (fastener as Mutable<typeof fastener>).owner = owner;
    (fastener as Mutable<typeof fastener>).flags = 0;
    return fastener;
  };

  Fastener.extend = function <I>(className: string, classMembers?: {readonly name?: string} & Partial<I> | null): FastenerFactory & I {
    let classIdentifier: string | undefined;
    if (classMembers !== void 0 && classMembers !== null && typeof classMembers.name === "string" && Identifiers.isValid(classMembers.name)) {
      classIdentifier = classMembers.name;
      className = classIdentifier;
    } else if (Identifiers.isValid(className)) {
      classIdentifier = className;
    }

    let fastenerClass: FastenerFactory & I;
    if (classIdentifier !== void 0) {
      fastenerClass = new Function("FastenerContext",
        "return function " + className + "(descriptor) { return FastenerContext.decorator(" + className + ", descriptor); }"
      )(FastenerContext);
    } else {
      fastenerClass = function (descriptor: FastenerDescriptor): PropertyDecorator {
        return FastenerContext.decorator(fastenerClass, descriptor);
      } as FastenerFactory & I;
      Object.defineProperty(fastenerClass, "name", {
        value: className,
        configurable: true,
      });
    }

    const classProperties: PropertyDescriptorMap = {};
    if (classMembers !== void 0 && classMembers !== null) {
      classProperties.name = {
        value: className,
        configurable: true,
      };
      const classMemberNames = Object.getOwnPropertyNames(classMembers);
      for (let i = 0; i < classMemberNames.length; i += 1) {
        const classMemberName = classMemberNames[i]!;
        classProperties[classMemberName] = Object.getOwnPropertyDescriptor(classMembers, classMemberName)!;
      }
    } else {
      classProperties.name = {
        value: "",
        configurable: true,
      };
    }

    Object.setPrototypeOf(fastenerClass, this);
    fastenerClass.prototype = Object.create(this.prototype, classProperties);
    fastenerClass.prototype.constructor = fastenerClass;

    return fastenerClass;
  }

  Fastener.define = function <O>(className: string, descriptor: FastenerDescriptor<O>): FastenerFactory<Fastener<any>> {
    let superClass = descriptor.extends as FastenerFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: Fastener<any>}, fastener: Fastener<O> | null, owner: O): Fastener<O> {
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

  (Fastener as Mutable<typeof Fastener>).MountedFlag = 1 << (Affinity.Shift + 0);
  (Fastener as Mutable<typeof Fastener>).InheritsFlag = 1 << (Affinity.Shift + 1);
  (Fastener as Mutable<typeof Fastener>).InheritedFlag = 1 << (Affinity.Shift + 2);
  (Fastener as Mutable<typeof Fastener>).DecoherentFlag = 1 << (Affinity.Shift + 3);

  (Fastener as Mutable<typeof Fastener>).FlagShift = Affinity.Shift + 4;
  (Fastener as Mutable<typeof Fastener>).FlagMask = (1 << Fastener.FlagShift) - 1;

  return Fastener;
})(Object);
