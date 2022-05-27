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

import type {Mutable, Proto} from "@swim/util";
import {
  FastenerOwner,
  FastenerDescriptor,
  FastenerClass,
  Fastener,
} from "../fastener/Fastener";

/** @public */
export interface TimerDescriptor extends FastenerDescriptor {
  extends?: Proto<Timer<any>> | string | boolean | null;
  delay?: number;
}

/** @public */
export type TimerTemplate<F extends Timer<any>> =
  ThisType<F> &
  TimerDescriptor &
  Partial<Omit<F, keyof TimerDescriptor>>;

/** @public */
export interface TimerClass<F extends Timer<any> = Timer<any>> extends FastenerClass<F> {
  /** @override */
  specialize(template: TimerDescriptor): TimerClass<F>;

  /** @override */
  refine(fastenerClass: TimerClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: TimerTemplate<F2>): TimerClass<F2>;
  extend<F2 extends F>(className: string, template: TimerTemplate<F2>): TimerClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: TimerTemplate<F2>): TimerClass<F2>;
  define<F2 extends F>(className: string, template: TimerTemplate<F2>): TimerClass<F2>;

  /** @override */
  <F2 extends F>(template: TimerTemplate<F2>): PropertyDecorator;
}

/** @public */
export interface Timer<O = unknown> extends Fastener<O> {
  (): void;

  /** @override */
  get fastenerType(): Proto<Timer<any>>;

  /** @protected */
  fire(): void;

  initDelay(): number;

  readonly delay: number;

  setDelay(delay: number): void;

  readonly deadline: number | undefined;

  get elapsed(): number | undefined;

  get remaining(): number | undefined;

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
}

/** @public */
export const Timer = (function (_super: typeof Fastener) {
  const Timer = _super.extend("Timer", {
    lazy: false,
    static: true,
  }) as TimerClass;

  Object.defineProperty(Timer.prototype, "fastenerType", {
    value: Timer,
    configurable: true,
  });

  Timer.prototype.fire = function (this: Timer): void {
    // hook
  };

  Timer.prototype.initDelay = function (this: Timer): number {
    let delay = (Object.getPrototypeOf(this) as Timer).delay as number | undefined;
    if (delay === void 0) {
      delay = 0;
    }
    return Math.max(0, delay);
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
      timeout = this.setTimeout(this, delay);
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
      timeout = this.setTimeout(this, delay);
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
    timeout = this.setTimeout(this, delay);
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

  Timer.construct = function <F extends Timer<any>>(fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (): void {
        fastener!.expire();
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, this.prototype);
    }
    fastener = _super.construct.call(this, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).delay = fastener.initDelay();
    (fastener as Mutable<typeof fastener>).deadline = 0;
    (fastener as Mutable<typeof fastener>).timeout = void 0;
    return fastener;
  };

  return Timer;
})(Fastener);
