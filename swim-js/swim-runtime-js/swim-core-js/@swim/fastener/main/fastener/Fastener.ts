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

import type {Mutable, Class, Family} from "@swim/util";
import {Affinity} from "./Affinity";
import {FastenerContext} from "./FastenerContext";

export type FastenerOwner<F> =
  F extends Fastener<infer O> ? O : never;

export type FastenerFlags = number;

export interface FastenerInit {
  extends?: unknown,
  eager?: boolean;
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

export type FastenerDescriptor<O = unknown, I = {}> = ThisType<Fastener<O> & I> & FastenerInit & Partial<I>;

export interface FastenerClass<F extends Fastener<any> = Fastener<any>> {
  /** @internal */
  prototype: F;

  create(this: FastenerClass<F>, owner: FastenerOwner<F>, fastenerName: string): F;

  construct(fastenerClass: FastenerClass, fastener: F | null, owner: FastenerOwner<F>, fastenerName: string): F;

  extend(this: FastenerClass<F>, classMembers?: {} | null): FastenerClass<F>;

  define<O, I = {}>(descriptor: {extends: FastenerClass | null} & FastenerDescriptor<O, I>): FastenerClass<Fastener<any> & I>;
  define<O>(descriptor: FastenerDescriptor<O>): FastenerClass<Fastener<any>>;

  <O, I = {}>(descriptor: {extends: FastenerClass | null} & FastenerDescriptor<O, I>): PropertyDecorator;
  <O>(descriptor: FastenerDescriptor<O>): PropertyDecorator;

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

export interface Fastener<O = unknown> extends Family {
  readonly name: string;

  readonly owner: O;

  /** @internal */
  init(): void;

  /** @override */
  get familyType(): Class<Fastener<any>> | null;

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
  get eager(): boolean | undefined; // optional prototype field
}

export const Fastener = (function (_super: typeof Object) {
  const Fastener = function <O>(descriptor: FastenerDescriptor<O>): PropertyDecorator {
    return FastenerContext.decorator(Fastener.define(descriptor));
  } as FastenerClass;

  Fastener.prototype = Object.create(_super.prototype);

  Fastener.prototype.init = function (this: Fastener): void {
    // hook
  };

  Object.defineProperty(Fastener.prototype, "familyType", {
    get: function (this: Fastener): Class<Fastener<any>> | null {
      return null;
    },
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

  Fastener.create = function <F extends Fastener<any>>(this: FastenerClass<F>, owner: FastenerOwner<F>, fastenerName: string): F {
    const fastener = this.construct(this, null, owner, fastenerName);
    fastener.init();
    return fastener;
  };

  Fastener.construct = function <F extends Fastener<any>>(fastenerClass: FastenerClass, fastener: F | null, owner: FastenerOwner<F>, fastenerName: string): F {
    if (fastener === null) {
      fastener = Object.create(fastenerClass.prototype) as F;
    }
    Object.defineProperty(fastener, "name", {
      value: fastenerName,
      enumerable: true,
      configurable: true,
    });
    (fastener as Mutable<typeof fastener>).owner = owner;
    (fastener as Mutable<typeof fastener>).flags = 0;
    return fastener;
  };

  Fastener.extend = function (classMembers?: Fastener | null): FastenerClass {
    if (classMembers === void 0 || classMembers === null) {
      classMembers = {} as Fastener;
    }
    const fastenerClass = function FastenerDecorator(descriptor: FastenerDescriptor): PropertyDecorator {
      return FastenerContext.decorator(fastenerClass.define(descriptor));
    } as FastenerClass;
    Object.setPrototypeOf(fastenerClass, this);
    fastenerClass.prototype = classMembers;
    fastenerClass.prototype.constructor = fastenerClass;
    Object.setPrototypeOf(fastenerClass.prototype, this.prototype);
    return fastenerClass;
  }

  Fastener.define = function <O>(descriptor: FastenerDescriptor<O>): FastenerClass<Fastener<any>> {
    let superClass = descriptor.extends as FastenerClass | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(descriptor);

    fastenerClass.construct = function (fastenerClass: FastenerClass, fastener: Fastener<O> | null, owner: O, fastenerName: string): Fastener<O> {
      fastener = superClass!.construct(fastenerClass, fastener, owner, fastenerName);
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
