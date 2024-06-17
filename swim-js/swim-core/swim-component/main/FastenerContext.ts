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

import type {Proto} from "@swim/util";
import type {Timing} from "@swim/util";
import type {FastenerClass} from "./Fastener";
import type {Fastener} from "./Fastener";

// Polyfill Symbol.metadata
if (Symbol.metadata === void 0) {
  (Symbol as any).metadata = Symbol("Symbol.metadata");
}

/** @public */
export interface FastenerContext {
  getFastener?<F extends Fastener<any, any, any>>(fastenerName: PropertyKey, fastenerType?: Proto<F>, contextType?: Proto<any> | null): F | null;

  getParentFastener?<F extends Fastener<any, any, any>>(fastenerName: PropertyKey, fastenerType?: Proto<F>, contextType?: Proto<any> | null): F | null;

  attachFastener?(fastener: Fastener<any, any, any>): void;

  decohereFastener?(fastener: Fastener<any, any, any>): void;

  requireUpdate?(updateFlags: number): void;

  getTransition?(fastener: Fastener<any, any, any>): Timing | null;
}

/** @public */
export const FastenerContext: {
  /** @internal */
  readonly metaclass: unique symbol;

  getMetaclass<R>(context: R): FastenerContextMetaclass<R> | null;
} = {
  metaclass: Symbol("FastenerContext.metaclass") as any,

  getMetaclass<R>(context: R): FastenerContextMetaclass<R> | null {
    const constructor = (context as object).constructor;
    if (constructor === void 0) {
      return null;
    }
    const metadata = constructor[Symbol.metadata];
    if (metadata === void 0 || metadata === null) {
      return null;
    }
    const contextMetaclass = metadata[FastenerContext.metaclass];
    if (contextMetaclass === void 0) {
      return null;
    }
    return contextMetaclass as FastenerContextMetaclass<R>;
  },
};

/** @public */
export class FastenerContextMetaclass<R> {
  constructor() {
    this.classMap = {};
    this.slotMap = {};
    this.slots = [];
  }

  /** @internal */
  readonly classMap: {[fastenerName: PropertyKey]: FastenerClass<any> | undefined};

  /** @internal */
  readonly slotMap: {[fastenerName: PropertyKey]: keyof R | undefined};

  /** @internal */
  readonly slots: (keyof R)[];

  getFastenerClass<K extends keyof R>(fastenerName: K): R[K] extends Fastener<any, any, any> ? FastenerClass<R[K]> | null : null {
    const fastenerClass = this.classMap[fastenerName];
    return (fastenerClass !== void 0 ? fastenerClass : null) as R[K] extends Fastener<any, any, any> ? FastenerClass<R[K]> | null : null;
  }

  getFastenerSlot(fastenerName: PropertyKey): keyof R | undefined {
    return this.slotMap[fastenerName];
  }

  tryFastener<K extends keyof R, F extends R[K]>(owner: R, fastenerName: K): (F extends Fastener<any, any, any> ? F | null : never) | null {
    const fastenerSlot = this.slotMap[fastenerName];
    const fastener = fastenerSlot !== void 0 ? owner[fastenerSlot] : void 0;
    return (fastener !== void 0 ? fastener : null) as (F extends Fastener<any, any, any> ? F | null : never) | null;
  }

  static get<R>(metadata: Record<PropertyKey, unknown> & object /*DecoratorMetadataObject*/): FastenerContextMetaclass<R> | null {
    if (Object.hasOwnProperty.call(metadata, FastenerContext.metaclass)) {
      return metadata[FastenerContext.metaclass] as FastenerContextMetaclass<R>;
    }
    return null;
  }

  static getOrCreate<R>(metadata: Record<PropertyKey, unknown> & object /*DecoratorMetadataObject*/): FastenerContextMetaclass<R> {
    if (Object.hasOwnProperty.call(metadata, FastenerContext.metaclass)) {
      return metadata[FastenerContext.metaclass] as FastenerContextMetaclass<R>;
    }

    const superMetaclass = metadata[FastenerContext.metaclass] as FastenerContextMetaclass<R> | undefined;
    const contextMetaclass = new FastenerContextMetaclass<R>();
    metadata[FastenerContext.metaclass] = contextMetaclass;

    if (superMetaclass !== void 0) {
      for (const fastenerName in superMetaclass.classMap) {
        contextMetaclass.classMap[fastenerName] = superMetaclass.classMap[fastenerName];
      }
      for (const fastenerName in superMetaclass.slotMap) {
        contextMetaclass.slotMap[fastenerName] = superMetaclass.slotMap[fastenerName];
      }
      contextMetaclass.slots.push(...superMetaclass.slots);
    }

    return contextMetaclass;
  }
}
