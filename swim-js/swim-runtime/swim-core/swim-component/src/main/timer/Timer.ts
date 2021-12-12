// Copyright 2015-2021 Swim.inc
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

import type {Mutable, Proto} from "@swim/util";
import {FastenerOwner, FastenerInit, FastenerClass, Fastener} from "../fastener/Fastener";

/** @public */
export interface TimerInit extends FastenerInit {
  extends?: {prototype: Timer<any>} | string | boolean | null;
  delay?: number;

  fire?(): void;

  willSchedule?(delay: number): void;
  didSchedule?(delay: number): void;

  willCancel?(): void;
  didCancel?(): void;

  willExpire?(): void;
  didExpire?(): void;

  setTimeout?(callback: () => void, delay: number): unknown;
  clearTimeout?(timeout: unknown): void;
}

/** @public */
export type TimerDescriptor<O = unknown, I = {}> = ThisType<Timer<O> & I> & TimerInit & Partial<I>;

/** @public */
export interface TimerClass<F extends Timer<any> = Timer<any>> extends FastenerClass<F> {
}

/** @public */
export interface TimerFactory<F extends Timer<any> = Timer<any>> extends TimerClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): TimerFactory<F> & I;

  define<O>(className: string, descriptor: TimerDescriptor<O>): TimerFactory<Timer<any>>;
  define<O, I = {}>(className: string, descriptor: {implements: unknown} & TimerDescriptor<O, I>): TimerFactory<Timer<any> & I>;

  <O>(descriptor: TimerDescriptor<O>): PropertyDecorator;
  <O, I = {}>(descriptor: {implements: unknown} & TimerDescriptor<O, I>): PropertyDecorator;
}

/** @public */
export interface Timer<O = unknown> extends Fastener<O> {
  /** @override */
  get fastenerType(): Proto<Timer<any>>;

  /** @protected @override */
  onInherit(superFastener: Fastener): void;

  readonly delay: number;

  /** @internal @protected */
  initDelay(delay: number): void;

  setDelay(delay: number): void;

  readonly deadline: number | undefined;

  get elapsed(): number | undefined;

  get remaining(): number | undefined;

  /** @internal @protected */
  fire(): void;

  get scheduled(): boolean;

  schedule(delay?: number): void;

  throttle(delay?: number): void;

  debounce(delay?: number): void;

  /** @protected */
  willSchedule(delay: number): void;

  /** @protected */
  onSchedule(delay: number): void;

  /** @protected */
  didSchedule(delay: number): void;

  cancel(): void;

  /** @protected */
  willCancel(): void;

  /** @protected */
  onCancel(): void;

  /** @protected */
  didCancel(): void;

  /** @internal @protected */
  expire(): void;

  /** @protected */
  willExpire(): void;

  /** @protected */
  onExpire(): void;

  /** @protected */
  didExpire(): void;

  /** @internal */
  readonly timeout: unknown | undefined;

  /** @internal @protected */
  setTimeout(callback: () => void, delay: number): unknown;

  /** @internal @protected */
  clearTimeout(timeoutId: unknown): void;

  /** @override @protected */
  onUnmount(): void;

  /** @internal @override */
  get lazy(): boolean; // prototype property

  /** @internal @override */
  get static(): string | boolean; // prototype property
}

/** @public */
export const Timer = (function (_super: typeof Fastener) {
  const Timer: TimerFactory = _super.extend("Timer");

  Object.defineProperty(Timer.prototype, "fastenerType", {
    get: function (this: Timer): Proto<Timer<any>> {
      return Timer;
    },
    configurable: true,
  });

  Timer.prototype.onInherit = function (this: Timer, superFastener: Timer): void {
    this.setDelay(superFastener.delay);
  };

  Timer.prototype.initDelay = function (this: Timer, delay: number): void {
    (this as Mutable<typeof this>).delay = Math.max(0, delay);
  };

  Timer.prototype.setDelay = function (this: Timer, delay: number): void {
    (this as Mutable<typeof this>).delay = Math.max(0, delay);
  };

  Object.defineProperty(Timer.prototype, "elapsed", {
    get: function (this: Timer): number | undefined {
      const deadline = this.deadline;
      if (deadline !== void 0) {
        return Math.max(0, performance.now() - (deadline - this.delay));
      } else {
        return void 0;
      }
    },
    configurable: true,
  });

  Object.defineProperty(Timer.prototype, "remaining", {
    get: function (this: Timer): number | undefined {
      const deadline = this.deadline;
      if (deadline !== void 0) {
        return Math.max(0, deadline - performance.now());
      } else {
        return void 0;
      }
    },
    configurable: true,
  });

  Timer.prototype.fire = function (this: Timer): void {
    // hook
  };

  Object.defineProperty(Timer.prototype, "scheduled", {
    get: function (this: Timer): boolean {
      return this.timeout !== void 0;
    },
    configurable: true,
  });

  Timer.prototype.schedule = function (this: Timer, delay?: number): void {
    let timeout = this.timeout;
    if (timeout === void 0) {
      if (delay === void 0) {
        delay = this.delay;
      } else {
        this.setDelay(delay);
      }
      this.willSchedule(delay);
      (this as Mutable<typeof this>).deadline = performance.now() + delay;
      timeout = this.setTimeout(this.expire.bind(this), delay);
      (this as Mutable<typeof this>).timeout = timeout;
      this.onSchedule(delay);
      this.didSchedule(delay);
    } else {
      throw new Error("timer already scheduled; call throttle or debounce to reschedule");
    }
  };

  Timer.prototype.throttle = function (this: Timer, delay?: number): void {
    let timeout = this.timeout;
    if (timeout === void 0) {
      if (delay === void 0) {
        delay = this.delay;
      } else {
        this.setDelay(delay);
      }
      this.willSchedule(delay);
      (this as Mutable<typeof this>).deadline = performance.now() + delay;
      timeout = this.setTimeout(this.expire.bind(this), delay);
      (this as Mutable<typeof this>).timeout = timeout;
      this.onSchedule(delay);
      this.didSchedule(delay);
    }
  };

  Timer.prototype.debounce = function (this: Timer, delay?: number): void {
    let timeout = this.timeout;
    if (timeout !== void 0) {
      this.willCancel();
      (this as Mutable<typeof this>).timeout = void 0;
      this.clearTimeout(timeout);
      this.onCancel();
      this.didCancel();
    }
    if (delay === void 0) {
      delay = this.delay;
    } else {
      this.setDelay(delay);
    }
    this.willSchedule(delay);
    (this as Mutable<typeof this>).deadline = performance.now() + delay;
    timeout = this.setTimeout(this.expire.bind(this), delay);
    (this as Mutable<typeof this>).timeout = timeout;
    this.onSchedule(delay);
    this.didSchedule(delay);
  };

  Timer.prototype.willSchedule = function (this: Timer, delay: number): void {
    // hook
  };

  Timer.prototype.onSchedule = function (this: Timer, delay: number): void {
    // hook
  };

  Timer.prototype.didSchedule = function (this: Timer, delay: number): void {
    // hook
  };

  Timer.prototype.cancel = function (this: Timer): void {
    const timeout = this.timeout;
    if (timeout !== void 0) {
      this.willCancel();
      (this as Mutable<typeof this>).timeout = void 0;
      (this as Mutable<typeof this>).deadline = void 0;
      this.clearTimeout(timeout);
      this.onCancel();
      this.didCancel();
    }
  };

  Timer.prototype.willCancel = function (this: Timer): void {
    // hook
  };

  Timer.prototype.onCancel = function (this: Timer): void {
    // hook
  };

  Timer.prototype.didCancel = function (this: Timer): void {
    // hook
  };

  Timer.prototype.expire = function (this: Timer): void {
    (this as Mutable<typeof this>).timeout = void 0;
    (this as Mutable<typeof this>).deadline = void 0;
    this.willExpire();
    this.fire();
    this.onExpire();
    this.didExpire();
  };

  Timer.prototype.willExpire = function (this: Timer): void {
    // hook
  };

  Timer.prototype.onExpire = function (this: Timer): void {
    // hook
  };

  Timer.prototype.didExpire = function (this: Timer): void {
    // hook
  };

  Timer.prototype.setTimeout = function (this: Timer, callback: () => void, delay: number): unknown {
    return setTimeout(callback, delay);
  };

  Timer.prototype.clearTimeout = function (this: Timer, timeout: unknown): void {
    clearTimeout(timeout as any);
  };

  Timer.prototype.onUnmount = function (this: Timer): void {
    _super.prototype.onUnmount.call(this);
    this.cancel();
  };

  Object.defineProperty(Timer.prototype, "lazy", {
    get: function (this: Timer): boolean {
      return false;
    },
    configurable: true,
  });

  Object.defineProperty(Timer.prototype, "static", {
    get: function (this: Timer): string | boolean {
      return true;
    },
    configurable: true,
  });

  Timer.construct = function <F extends Timer<any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).delay = 0;
    (fastener as Mutable<typeof fastener>).deadline = 0;
    (fastener as Mutable<typeof fastener>).timeout = void 0;
    (fastener as Mutable<typeof fastener>).expire = fastener.expire.bind(fastener);
    return fastener;
  };

  Timer.define = function <O>(className: string, descriptor: TimerDescriptor<O>): TimerFactory<Timer<any>> {
    let superClass = descriptor.extends as TimerFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const delay = descriptor.delay;
    delete descriptor.extends;
    delete descriptor.implements;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.delay;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: Timer<any>}, fastener: Timer<O> | null, owner: O): Timer<O> {
      fastener = superClass!.construct(fastenerClass, fastener, owner);
      if (affinity !== void 0) {
        fastener.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        fastener.initInherits(inherits);
      }
      if (delay !== void 0) {
        fastener.initDelay(delay);
      }
      return fastener;
    };

    return fastenerClass;
  };

  return Timer;
})(Fastener);
