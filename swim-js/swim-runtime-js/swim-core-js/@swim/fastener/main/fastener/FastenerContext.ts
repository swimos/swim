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

import type {Class} from "@swim/util";
import type {FastenerClass, Fastener} from "./Fastener";

export interface FastenerContextClass {
  /** @internal */
  fastenerMap?: {[fastenerName: string]: FastenerClass | undefined};
  /** @internal */
  fastenerInitMap?: {[fastenerName: string]: FastenerClass | undefined};
}

export interface FastenerContext {
  hasFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): boolean;

  getFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Class<F>): F | null;
  getFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null;

  setFastener(fastenerName: string, fastener: Fastener | null): void;

  getLazyFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Class<F>): F | null;
  getLazyFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null;

  getSuperFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Class<F>): F | null;
  getSuperFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null;

  decohereFastener?(fastener: Fastener): void;

  requireUpdate?(updateFlags: number): void;
}

export const FastenerContext = (function () {
  const FastenerContext = {} as {
    getLazyFastener<F extends Fastener<any>>(fastenerContext: FastenerContext, fastenerName: string, fastenerBound: Class<F>): F | null;
    getLazyFastener(fastenerContext: FastenerContext, fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null;
  
    getFastenerClass<F extends Fastener<any>>(fastenerContextClass: FastenerContextClass, fastenerName: string, fastenerBound: Class<F>): FastenerClass | null;
    getFastenerClass(fastenerContextClass: FastenerContextClass, fastenerName: string, fastenerBound?: Class<Fastener> | null): FastenerClass | null;
  
    init(fastenerContext: FastenerContext): void;
  
    decorate(fastenerClass: FastenerClass, target: Object, propertyKey: string | symbol): void;

    decorator(fastenerClass: FastenerClass): PropertyDecorator;

    /** @internal */
    has<K extends keyof FastenerContext>(object: unknown, key: K): object is Required<Pick<FastenerContext, K>>;

    /** @internal */
    is(object: unknown): object is FastenerContext;
  };

  FastenerContext.getLazyFastener = function (fastenerContext: FastenerContext, fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null {
    let fastener = fastenerContext.getFastener(fastenerName);
    if (fastener === null) {
      const fastenerContextClass: FastenerContextClass = Object.getPrototypeOf(fastenerContext);
      const fastenerClass = FastenerContext.getFastenerClass(fastenerContextClass, fastenerName, fastenerBound);
      if (fastenerClass !== null) {
        fastener = fastenerClass.construct(fastenerClass, null, fastenerContext, fastenerName);
        fastenerContext.setFastener(fastenerName, fastener);
      }
    } else if (fastenerBound !== void 0 && fastenerBound !== null && !(fastener instanceof fastenerBound)) {
      fastener = null;
    }
    return fastener;
  };

  FastenerContext.getFastenerClass = function (fastenerContextClass: FastenerContextClass, fastenerName: string, fastenerBound: Class<Fastener> | null): FastenerClass | null {
    do {
      if (Object.prototype.hasOwnProperty.call(fastenerContextClass, "fastenerMap")) {
        const fastenerClass = fastenerContextClass.fastenerMap![fastenerName];
        if (fastenerClass !== void 0 && (fastenerBound === void 0 || fastenerBound === null || fastenerClass.prototype instanceof fastenerBound)) {
          return fastenerClass;
        }
      }
      fastenerContextClass = Object.getPrototypeOf(fastenerContextClass);
    } while (fastenerContextClass !== null);
    return null;
  };

  FastenerContext.init = function (fastenerContext: FastenerContext): void {
    let fastenerContextClass: FastenerContextClass | null = Object.getPrototypeOf(fastenerContext) as FastenerContextClass;
    do {
      if (Object.prototype.hasOwnProperty.call(fastenerContextClass, "fastenerInitMap")) {
        const fastenerInitMap = fastenerContextClass.fastenerInitMap!;
        for (const fastenerName in fastenerInitMap) {
          const fastenerClass = fastenerInitMap[fastenerName]!;
          if (!fastenerContext.hasFastener(fastenerName)) {
            const fastener = fastenerClass.construct(fastenerClass, null, fastenerContext, fastenerName);
            fastenerContext.setFastener(fastenerName, fastener);
          }
        }
      }
      fastenerContextClass = Object.getPrototypeOf(fastenerContextClass);
    } while (fastenerContextClass !== null);
  };

  FastenerContext.decorate = function (fastenerClass: FastenerClass, target: Object, propertyKey: string | symbol): void {
    const fastenerContextClass = target as FastenerContextClass;

    if (!Object.prototype.hasOwnProperty.call(fastenerContextClass, "fastenerMap")) {
      fastenerContextClass.fastenerMap = {};
    }
    fastenerContextClass.fastenerMap![propertyKey.toString()] = fastenerClass;

    if (fastenerClass.prototype.eager === true) {
      if (!Object.prototype.hasOwnProperty.call(fastenerContextClass, "fastenerInitMap")) {
        fastenerContextClass.fastenerInitMap = {};
      }
      fastenerContextClass.fastenerInitMap![propertyKey.toString()] = fastenerClass;
    }

    Object.defineProperty(target, propertyKey, {
      get: function (this: FastenerContext): Fastener {
        let fastener = this.getFastener(propertyKey.toString());
        if (fastener === null) {
          fastener = fastenerClass.construct(fastenerClass, null, this, propertyKey.toString());
          this.setFastener(propertyKey.toString(), fastener);
        }
        return fastener;
      },
      configurable: true,
    });
  };

  FastenerContext.decorator = function (fastenerClass: FastenerClass): PropertyDecorator {
    return FastenerContext.decorate.bind(FastenerContext, fastenerClass);
  };

  FastenerContext.has = function <K extends keyof FastenerContext>(object: unknown, key: K): object is Required<Pick<FastenerContext, K>> {
    if (typeof object === "object" && object !== null || typeof object === "function") {
      return key in object;
    }
    return false;
  };

  FastenerContext.is = function (object: unknown): object is FastenerContext {
    if (typeof object === "object" && object !== null || typeof object === "function") {
      const fastenerContext = object as FastenerContext;
      return "hasFastener" in fastenerContext;
    }
    return false;
  };

  return FastenerContext;
})();
