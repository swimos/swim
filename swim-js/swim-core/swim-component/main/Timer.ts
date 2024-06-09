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

import type {Mutable} from "@swim/util";
import type {Proto} from "@swim/util";
import type {FastenerDescriptor} from "./Fastener";
import type {FastenerClass} from "./Fastener";
import {Fastener} from "./Fastener";

/** @public */
export interface TimerDescriptor<R> extends FastenerDescriptor<R> {
  extends?: Proto<Timer<any>> | boolean | null;
}

/** @public */
export interface TimerClass<F extends Timer<any> = Timer<any>> extends FastenerClass<F> {
}

/** @public */
export interface Timer<R = any> extends Fastener<R> {
  (): void;

  /** @override */
  get descriptorType(): Proto<TimerDescriptor<R>>;

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

  /** @protected */
  setTimeout(callback: () => void, delay: number): unknown;

  /** @protected */
  clearTimeout(timeoutId: unknown): void;

  /** @override @protected */
  onUnmount(): void;
}

/** @public */
export const Timer = (<R, F extends Timer<any>>() => Fastener.extend<Timer<R>, TimerClass<F>>("Timer", {
  get fastenerType(): Proto<Timer<any>> {
    return Timer;
  },

  fire(): void {
    // hook
  },

  delay: 0,

  initDelay(): number {
    const delay = (Object.getPrototypeOf(this) as Timer<any>).delay;
    return Math.max(0, delay);
  },

  setDelay(delay: number): void {
    (this as Mutable<typeof this>).delay = Math.max(0, delay);
  },

  get elapsed(): number | undefined {
    const deadline = this.deadline;
    if (deadline === void 0) {
      return void 0;
    }
    return Math.max(0, performance.now() - (deadline - this.delay));
  },

  get remaining(): number | undefined {
    const deadline = this.deadline;
    if (deadline === void 0) {
      return void 0;
    }
    return Math.max(0, deadline - performance.now());
  },

  get scheduled(): boolean {
    return this.timeout !== void 0;
  },

  schedule(delay?: number): void {
    if (this.timeout !== void 0) {
      throw new Error("timer already scheduled; call throttle or debounce to reschedule");
    } else if (delay === void 0) {
      delay = this.delay;
    } else {
      this.setDelay(delay);
    }
    this.willSchedule(delay);
    (this as Mutable<typeof this>).deadline = performance.now() + delay;
    (this as Mutable<typeof this>).timeout = this.setTimeout(this, delay);
    this.onSchedule(delay);
    this.didSchedule(delay);
  },

  throttle(delay?: number): void {
    if (this.timeout !== void 0) {
      return;
    } else if (delay === void 0) {
      delay = this.delay;
    } else {
      this.setDelay(delay);
    }
    this.willSchedule(delay);
    (this as Mutable<typeof this>).deadline = performance.now() + delay;
    (this as Mutable<typeof this>).timeout = this.setTimeout(this, delay);
    this.onSchedule(delay);
    this.didSchedule(delay);
  },

  debounce(delay?: number): void {
    const timeout = this.timeout;
    if (timeout !== void 0) {
      this.willCancel();
      (this as Mutable<typeof this>).timeout = void 0;
      (this as Mutable<typeof this>).deadline = void 0;
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
    (this as Mutable<typeof this>).timeout = this.setTimeout(this, delay);
    this.onSchedule(delay);
    this.didSchedule(delay);
  },

  willSchedule(delay: number): void {
    // hook
  },

  onSchedule(delay: number): void {
    // hook
  },

  didSchedule(delay: number): void {
    // hook
  },

  cancel(): void {
    const timeout = this.timeout;
    if (timeout === void 0) {
      return;
    }
    this.willCancel();
    (this as Mutable<typeof this>).timeout = void 0;
    (this as Mutable<typeof this>).deadline = void 0;
    this.clearTimeout(timeout);
    this.onCancel();
    this.didCancel();
  },

  willCancel(): void {
    // hook
  },

  onCancel(): void {
    // hook
  },

  didCancel(): void {
    // hook
  },

  expire(): void {
    (this as Mutable<typeof this>).timeout = void 0;
    (this as Mutable<typeof this>).deadline = void 0;
    this.willExpire();
    this.fire();
    this.onExpire();
    this.didExpire();
  },

  willExpire(): void {
    // hook
  },

  onExpire(): void {
    // hook
  },

  didExpire(): void {
    // hook
  },

  setTimeout(callback: () => void, delay: number): unknown {
    return setTimeout(callback, delay);
  },

  clearTimeout(timeout: unknown): void {
    clearTimeout(timeout as any);
  },

  onUnmount(): void {
    super.onUnmount();
    this.cancel();
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    if (fastener === null) {
      fastener = function (): void {
        fastener!.expire();
      } as F;
      Object.defineProperty(fastener, "name", {
        value: this.prototype.name,
        enumerable: true,
        configurable: true,
      });
      Object.setPrototypeOf(fastener, this.prototype);
    }
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).delay = fastener.initDelay();
    (fastener as Mutable<typeof fastener>).deadline = 0;
    (fastener as Mutable<typeof fastener>).timeout = void 0;
    return fastener;
  },
}))();
