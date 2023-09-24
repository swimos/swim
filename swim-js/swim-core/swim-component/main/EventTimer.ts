// Copyright 2015-2023 Nstream, inc.
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
import type {Fastener} from "./Fastener";
import type {EventHandlerDescriptor} from "./EventHandler";
import type {EventHandlerClass} from "./EventHandler";
import {EventHandler} from "./EventHandler";

/** @public */
export interface EventTimerDescriptor<R, T> extends EventHandlerDescriptor<R, T> {
  extends?: Proto<EventTimer<any, any>> | boolean | null;
}

/** @public */
export interface EventTimerClass<F extends EventTimer<any, any> = EventTimer<any, any>> extends EventHandlerClass<F> {
}

/** @public */
export interface EventTimer<R = any, T = EventTarget> extends EventHandler<R, T> {
  /** @override */
  (event: Event): void;
  (): void;

  /** @override */
  get descriptorType(): Proto<EventTimerDescriptor<R, T>>;

  /** @protected */
  readonly event: Event | null;

  /** @protected */
  defer(event: Event): void;

  initDelay(): number;

  readonly delay: number;

  setDelay(delay: number): void;

  readonly deadline: number | undefined;

  get elapsed(): number | undefined;

  get remaining(): number | undefined;

  get scheduled(): boolean;

  schedule(event: Event | null, delay?: number): void;

  throttle(event: Event | null, delay?: number): void;

  debounce(event: Event | null, delay?: number): void;

  /** @protected */
  willSchedule(event: Event | null, delay: number): void;

  /** @protected */
  onSchedule(event: Event | null, delay: number): void;

  /** @protected */
  didSchedule(event: Event | null, delay: number): void;

  cancel(): void;

  /** @protected */
  willCancel(event: Event | null): void;

  /** @protected */
  onCancel(event: Event | null): void;

  /** @protected */
  didCancel(event: Event | null): void;

  /** @internal @protected */
  expire(): void;

  /** @protected */
  willExpire(event: Event | null): void;

  /** @protected */
  onExpire(event: Event | null): void;

  /** @protected */
  didExpire(event: Event | null): void;

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
export const EventTimer = (<R, T, F extends EventTimer<any, any>>() => EventHandler.extend<EventTimer<R, T>, EventTimerClass<F>>("EventTimer", {
  defer(event: Event): void {
    this.throttle(event);
  },

  delay: 0,

  initDelay(): number {
    const delay = (Object.getPrototypeOf(this) as EventTimer<any, any>).delay;
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

  schedule(event: Event | null, delay?: number): void {
    if (this.timeout !== void 0) {
      throw new Error("timer already scheduled; call throttle or debounce to reschedule");
    } else if (delay === void 0) {
      delay = this.delay;
    } else {
      this.setDelay(delay);
    }
    this.willSchedule(event, delay);
    (this as Mutable<typeof this>).event = event;
    (this as Mutable<typeof this>).deadline = performance.now() + delay;
    (this as Mutable<typeof this>).timeout = this.setTimeout(this, delay);
    this.onSchedule(event, delay);
    this.didSchedule(event, delay);
  },

  throttle(event: Event | null, delay?: number): void {
    if (this.timeout !== void 0) {
      return;
    } else if (delay === void 0) {
      delay = this.delay;
    } else {
      this.setDelay(delay);
    }
    this.willSchedule(event, delay);
    (this as Mutable<typeof this>).event = event;
    (this as Mutable<typeof this>).deadline = performance.now() + delay;
    (this as Mutable<typeof this>).timeout = this.setTimeout(this, delay);
    this.onSchedule(event, delay);
    this.didSchedule(event, delay);
  },

  debounce(event: Event | null, delay?: number): void {
    const timeout = this.timeout;
    if (timeout !== void 0) {
      const event = this.event;
      this.willCancel(event);
      (this as Mutable<typeof this>).event = null;
      (this as Mutable<typeof this>).timeout = void 0;
      (this as Mutable<typeof this>).deadline = void 0;
      this.clearTimeout(timeout);
      this.onCancel(event);
      this.didCancel(event);
    }
    if (delay === void 0) {
      delay = this.delay;
    } else {
      this.setDelay(delay);
    }
    this.willSchedule(event, delay);
    (this as Mutable<typeof this>).event = event;
    (this as Mutable<typeof this>).deadline = performance.now() + delay;
    (this as Mutable<typeof this>).timeout = this.setTimeout(this, delay);
    this.onSchedule(event, delay);
    this.didSchedule(event, delay);
  },

  willSchedule(event: Event | null, delay: number): void {
    // hook
  },

  onSchedule(event: Event | null, delay: number): void {
    // hook
  },

  didSchedule(event: Event | null, delay: number): void {
    // hook
  },

  cancel(): void {
    const timeout = this.timeout;
    if (timeout === void 0) {
      return;
    }
    const event = this.event;
    this.willCancel(event);
    (this as Mutable<typeof this>).event = null;
    (this as Mutable<typeof this>).timeout = void 0;
    (this as Mutable<typeof this>).deadline = void 0;
    this.clearTimeout(timeout);
    this.onCancel(event);
    this.didCancel(event);
  },

  willCancel(event: Event | null): void {
    // hook
  },

  onCancel(event: Event | null): void {
    // hook
  },

  didCancel(event: Event | null): void {
    // hook
  },

  expire(): void {
    const event = this.event;
    (this as Mutable<typeof this>).event = null;
    (this as Mutable<typeof this>).timeout = void 0;
    (this as Mutable<typeof this>).deadline = void 0;
    this.willExpire(event);
    if (event !== null) {
      this.handle(event);
    }
    this.onExpire(event);
    this.didExpire(event);
  },

  willExpire(event: Event | null): void {
    // hook
  },

  onExpire(event: Event | null): void {
    // hook
  },

  didExpire(event: Event | null): void {
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
      fastener = function (event?: Event): void {
        if (event !== void 0) { // event callback
          fastener!.defer(event);
        } else { // timer callback
          fastener!.expire();
        }
      } as F;
      Object.defineProperty(fastener, "name", {
        value: this.prototype.name,
        enumerable: true,
        configurable: true,
      });
      Object.setPrototypeOf(fastener, this.prototype);
    }
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).event = null;
    (fastener as Mutable<typeof fastener>).delay = fastener.initDelay();
    (fastener as Mutable<typeof fastener>).deadline = 0;
    (fastener as Mutable<typeof fastener>).timeout = void 0;
    return fastener;
  },
}))();
