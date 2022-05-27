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

import type {Proto} from "@swim/util";
import type {FastenerDescriptor, FastenerClass, Fastener} from "./Fastener";

/** @public */
export interface FastenerContextClass {
  /** @internal */
  fastenerClassMap?: {[fastenerName: string]: FastenerClass | undefined};
  /** @internal */
  fastenerClassInitMap?: {[fastenerName: string]: FastenerClass | undefined};
}

/** @public */
export interface FastenerContext {
  hasFastener(fastenerName: string, fastenerBound?: Proto<Fastener> | null): boolean;

  getFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Proto<F>): F | null;
  getFastener(fastenerName: string, fastenerBound?: Proto<Fastener> | null): Fastener | null;

  setFastener(fastenerName: string, fastener: Fastener | null): void;

  getLazyFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Proto<F>): F | null;
  getLazyFastener(fastenerName: string, fastenerBound?: Proto<Fastener> | null): Fastener | null;

  getSuperFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Proto<F>): F | null;
  getSuperFastener(fastenerName: string, fastenerBound?: Proto<Fastener> | null): Fastener | null;

  decohereFastener?(fastener: Fastener): void;

  requireUpdate?(updateFlags: number): void;
}

/** @public */
export const FastenerContext = (function () {
  const FastenerContext = {} as {
    getLazyFastener<F extends Fastener<any>>(fastenerContext: FastenerContext, fastenerName: string, fastenerBound: Proto<F>): F | null;
    getLazyFastener(fastenerContext: FastenerContext, fastenerName: string, fastenerBound?: Proto<Fastener> | null): Fastener | null;
  
    getFastenerClass<O, K extends keyof {[K in keyof O as O[K] extends F ? K : never]: O[K]}, F extends Fastener<any> = Fastener<any>>(contextClass: Proto<O>, fastenerName: K, fastenerBound?: Proto<F> | null): FastenerClass<O[K] extends F ? O[K] : never>;
    getFastenerClass<F extends Fastener<any>>(contextClass: FastenerContextClass, fastenerName: string, fastenerBound: Proto<F>): FastenerClass | null;
    getFastenerClass(contextClass: FastenerContextClass, fastenerName: string, fastenerBound?: Proto<Fastener> | null): FastenerClass | null;
  
    getSuperFastenerClass(contextClass: FastenerContextClass, fastenerName: string, fastenerBound?: Proto<Fastener> | null): FastenerClass;
  
    decorate(superClass: FastenerClass, template: FastenerDescriptor, target: Object, propertyKey: string | symbol): void;

    decorator(superClass: FastenerClass, template: FastenerDescriptor): PropertyDecorator;

    init(fastenerContext: FastenerContext): void;
  
    /** @internal */
    has<K extends keyof FastenerContext>(object: unknown, key: K): object is Required<Pick<FastenerContext, K>>;

    /** @internal */
    is(object: unknown): object is FastenerContext;
  };

  FastenerContext.getLazyFastener = function (fastenerContext: FastenerContext, fastenerName: string, fastenerBound?: Proto<Fastener> | null): Fastener | null {
    let fastener = fastenerContext.getFastener(fastenerName);
    if (fastener === null) {
      const contextClass = fastenerContext.constructor as FastenerContextClass;
      const fastenerClass = FastenerContext.getFastenerClass(contextClass, fastenerName, fastenerBound);
      if (fastenerClass !== null) {
        fastener = fastenerClass.create(fastenerContext);
        fastenerContext.setFastener(fastenerName, fastener);
      }
    } else if (fastenerBound !== void 0 && fastenerBound !== null && !(fastener instanceof fastenerBound)) {
      fastener = null;
    }
    return fastener;
  };

  FastenerContext.getFastenerClass = function (contextClass: FastenerContextClass, fastenerName: string, fastenerBound: Proto<Fastener> | null): FastenerClass | null {
    do {
      if (Object.prototype.hasOwnProperty.call(contextClass, "fastenerClassMap")) {
        const fastenerClass = contextClass.fastenerClassMap![fastenerName];
        if (fastenerClass !== void 0 && (fastenerBound === void 0 || fastenerBound === null || fastenerClass.prototype instanceof fastenerBound)) {
          return fastenerClass;
        }
      }
      contextClass = Object.getPrototypeOf(contextClass);
    } while (contextClass !== null);
    return null;
  } as typeof FastenerContext.getFastenerClass;

  FastenerContext.getSuperFastenerClass = function (contextClass: FastenerContextClass, fastenerName: string, fastenerBound?: Proto<Fastener> | null): FastenerClass {
    const superContextClass = Object.getPrototypeOf(contextClass) as FastenerContextClass;
    const fastenerClass = FastenerContext.getFastenerClass(superContextClass, fastenerName, fastenerBound);
    if (fastenerClass === null) {
      throw new Error("No " + fastenerName + " " + (fastenerBound !== void 0 && fastenerBound !== null ? fastenerBound.name : "fastener") + " class in " + superContextClass.constructor.name);
    }
    return fastenerClass;
  };

  FastenerContext.decorate = function (superClass: FastenerClass, template: FastenerDescriptor, target: Object, propertyKey: string | symbol): void {
    const contextClass = target.constructor as FastenerContextClass;
    const fastenerName = propertyKey.toString();

    const fastenerExtends = template.extends;
    if (typeof fastenerExtends === "string") {
      Object.defineProperty(template, "extends", {
        value: FastenerContext.getSuperFastenerClass(contextClass, fastenerExtends),
        enumerable: true,
        configurable: true,
      });
    } else if (fastenerExtends === true) {
      Object.defineProperty(template, "extends", {
        value: FastenerContext.getSuperFastenerClass(contextClass, fastenerName),
        enumerable: true,
        configurable: true,
      });
    } else if (fastenerExtends === false) {
      Object.defineProperty(template, "extends", {
        value: null,
        enumerable: true,
        configurable: true,
      });
    }

    const fastenerClass = superClass.define(fastenerName, template);
    fastenerClass.contextClass = contextClass;

    if (!Object.prototype.hasOwnProperty.call(contextClass, "fastenerClassMap")) {
      Object.defineProperty(contextClass, "fastenerClassMap", {
        value: {},
        configurable: true,
      });
    }
    contextClass.fastenerClassMap![fastenerName] = fastenerClass;

    if (fastenerClass.prototype.lazy === false) {
      if (!Object.prototype.hasOwnProperty.call(contextClass, "fastenerClassInitMap")) {
        Object.defineProperty(contextClass, "fastenerClassInitMap", {
          value: {},
          configurable: true,
        });
      }
      contextClass.fastenerClassInitMap![fastenerName] = fastenerClass;
    }

    let staticName = fastenerClass.prototype.static;
    if (typeof staticName === "boolean") {
      staticName = staticName ? fastenerName : void 0;
    }
    if (staticName !== void 0) {
      Object.defineProperty(contextClass, staticName, {
        value: fastenerClass,
        configurable: true,
      });
    }

    Object.defineProperty(target, propertyKey, {
      get: function (this: FastenerContext): Fastener {
        let fastener = this.getFastener(fastenerName);
        if (fastener === null) {
          fastener = fastenerClass.create(this);
          this.setFastener(fastenerName, fastener);
        }
        return fastener;
      },
      configurable: true,
    });
  };

  FastenerContext.decorator = function (superClass: FastenerClass, template: FastenerDescriptor): PropertyDecorator {
    return FastenerContext.decorate.bind(FastenerContext, superClass, template);
  };

  FastenerContext.init = function (fastenerContext: FastenerContext): void {
    let contextClass: FastenerContextClass | null = fastenerContext.constructor as FastenerContextClass;
    do {
      if (Object.prototype.hasOwnProperty.call(contextClass, "fastenerClassInitMap")) {
        const fastenerClassInitMap = contextClass.fastenerClassInitMap!;
        for (const fastenerName in fastenerClassInitMap) {
          const fastenerClass = fastenerClassInitMap[fastenerName]!;
          let fastener = fastenerContext.getFastener(fastenerName);
          if (fastener === null) {
            fastener = fastenerClass.create(fastenerContext);
            fastenerContext.setFastener(fastenerName, fastener);
          }
        }
      }
      contextClass = Object.getPrototypeOf(contextClass);
    } while (contextClass !== null);
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
