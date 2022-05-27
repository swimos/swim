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
import type {FastenerOwner} from "../fastener/Fastener";
import {EventHandlerDescriptor, EventHandlerClass, EventHandler} from "./EventHandler";

/** @public */
export type EventTimerTarget<F extends EventTimer<any, any>> =
  F extends {target: infer T | null} ? T : never;

/** @public */
export interface EventTimerDescriptor<T extends EventTarget = EventTarget> extends EventHandlerDescriptor<T> {
  extends?: Proto<EventTimer<any, any>> | string | boolean | null;
  delay?: number;
}

/** @public */
export type EventTimerTemplate<F extends EventTimer<any, any>> =
  ThisType<F> &
  EventTimerDescriptor &
  Partial<Omit<F, keyof EventTimerDescriptor>>;

/** @public */
export interface EventTimerClass<F extends EventTimer<any, any> = EventTimer<any, any>> extends EventHandlerClass<F> {
  /** @override */
  specialize(template: EventTimerDescriptor): EventTimerClass<F>;

  /** @override */
  refine(fastenerClass: EventTimerClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: EventTimerTemplate<F2>): EventTimerClass<F2>;
  extend<F2 extends F>(className: string, template: EventTimerTemplate<F2>): EventTimerClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: EventTimerTemplate<F2>): EventTimerClass<F2>;
  define<F2 extends F>(className: string, template: EventTimerTemplate<F2>): EventTimerClass<F2>;

  /** @override */
  <F2 extends F>(template: EventTimerTemplate<F2>): PropertyDecorator;
}

/** @public */
export interface EventTimer<O = unknown, T extends EventTarget = EventTarget> extends EventHandler<O, T> {
  /** @override */
  (event: Event): void;
  (): void;

  /** @protected */
  event: Event | null;

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

  /** @internal @protected */
  setTimeout(callback: () => void, delay: number): unknown;

  /** @internal @protected */
  clearTimeout(timeoutId: unknown): void;

  /** @override @protected */
  onUnmount(): void;
}

/** @public */
export const EventTimer = (function (_super: typeof EventHandler) {
  const EventTimer = _super.extend("EventTimer", {}) as EventTimerClass;

  EventTimer.prototype.defer = function (this: EventTimer, event: Event): void {
    this.throttle(event);
  };

  EventTimer.prototype.initDelay = function (this: EventTimer): number {
    let delay = (Object.getPrototypeOf(this) as EventTimer).delay as number | undefined;
    if (delay === void 0) {
      delay = 0;
    }
    return Math.max(0, delay);
  };

  EventTimer.prototype.setDelay = function (this: EventTimer, delay: number): void {
    (this as Mutable<typeof this>).delay = Math.max(0, delay);
  };

  Object.defineProperty(EventTimer.prototype, "elapsed", {
    get: function (this: EventTimer): number | undefined {
      const deadline = this.deadline;
      if (deadline !== void 0) {
        return Math.max(0, performance.now() - (deadline - this.delay));
      } else {
        return void 0;
      }
    },
    configurable: true,
  });

  Object.defineProperty(EventTimer.prototype, "remaining", {
    get: function (this: EventTimer): number | undefined {
      const deadline = this.deadline;
      if (deadline !== void 0) {
        return Math.max(0, deadline - performance.now());
      } else {
        return void 0;
      }
    },
    configurable: true,
  });

  Object.defineProperty(EventTimer.prototype, "scheduled", {
    get: function (this: EventTimer): boolean {
      return this.timeout !== void 0;
    },
    configurable: true,
  });

  EventTimer.prototype.schedule = function (this: EventTimer, event: Event | null, delay?: number): void {
    this.event = event;
    let timeout = this.timeout;
    if (timeout === void 0) {
      if (delay === void 0) {
        delay = this.delay;
      } else {
        this.setDelay(delay);
      }
      this.willSchedule(event, delay);
      (this as Mutable<typeof this>).deadline = performance.now() + delay;
      timeout = this.setTimeout(this, delay);
      (this as Mutable<typeof this>).timeout = timeout;
      this.onSchedule(event, delay);
      this.didSchedule(event, delay);
    } else {
      throw new Error("timer already scheduled; call throttle or debounce to reschedule");
    }
  };

  EventTimer.prototype.throttle = function (this: EventTimer, event: Event | null, delay?: number): void {
    this.event = event;
    let timeout = this.timeout;
    if (timeout === void 0) {
      if (delay === void 0) {
        delay = this.delay;
      } else {
        this.setDelay(delay);
      }
      this.willSchedule(event, delay);
      (this as Mutable<typeof this>).deadline = performance.now() + delay;
      timeout = this.setTimeout(this, delay);
      (this as Mutable<typeof this>).timeout = timeout;
      this.onSchedule(event, delay);
      this.didSchedule(event, delay);
    }
  };

  EventTimer.prototype.debounce = function (this: EventTimer, event: Event | null, delay?: number): void {
    let timeout = this.timeout;
    if (timeout !== void 0) {
      this.willCancel(this.event);
      (this as Mutable<typeof this>).timeout = void 0;
      this.clearTimeout(timeout);
      this.onCancel(this.event);
      this.didCancel(this.event);
    }
    this.event = event;
    if (delay === void 0) {
      delay = this.delay;
    } else {
      this.setDelay(delay);
    }
    this.willSchedule(event, delay);
    (this as Mutable<typeof this>).deadline = performance.now() + delay;
    timeout = this.setTimeout(this, delay);
    (this as Mutable<typeof this>).timeout = timeout;
    this.onSchedule(event, delay);
    this.didSchedule(event, delay);
  };

  EventTimer.prototype.willSchedule = function (this: EventTimer, event: Event | null, delay: number): void {
    // hook
  };

  EventTimer.prototype.onSchedule = function (this: EventTimer, event: Event | null, delay: number): void {
    // hook
  };

  EventTimer.prototype.didSchedule = function (this: EventTimer, event: Event | null, delay: number): void {
    // hook
  };

  EventTimer.prototype.cancel = function (this: EventTimer): void {
    const timeout = this.timeout;
    if (timeout !== void 0) {
      const event = this.event;
      this.event = null;
      this.willCancel(event);
      (this as Mutable<typeof this>).timeout = void 0;
      (this as Mutable<typeof this>).deadline = void 0;
      this.clearTimeout(timeout);
      this.onCancel(event);
      this.didCancel(event);
    }
  };

  EventTimer.prototype.willCancel = function (this: EventTimer, event: Event | null): void {
    // hook
  };

  EventTimer.prototype.onCancel = function (this: EventTimer, event: Event | null): void {
    // hook
  };

  EventTimer.prototype.didCancel = function (this: EventTimer, event: Event | null): void {
    // hook
  };

  EventTimer.prototype.expire = function (this: EventTimer): void {
    (this as Mutable<typeof this>).timeout = void 0;
    (this as Mutable<typeof this>).deadline = void 0;
    const event = this.event;
    this.event = null;
    this.willExpire(event);
    if (event !== null) {
      this.handle(event);
    }
    this.onExpire(event);
    this.didExpire(event);
  };

  EventTimer.prototype.willExpire = function (this: EventTimer, event: Event | null): void {
    // hook
  };

  EventTimer.prototype.onExpire = function (this: EventTimer, event: Event | null): void {
    // hook
  };

  EventTimer.prototype.didExpire = function (this: EventTimer, event: Event | null): void {
    // hook
  };

  EventTimer.prototype.setTimeout = function (this: EventTimer, callback: () => void, delay: number): unknown {
    return setTimeout(callback, delay);
  };

  EventTimer.prototype.clearTimeout = function (this: EventTimer, timeout: unknown): void {
    clearTimeout(timeout as any);
  };

  EventTimer.prototype.onUnmount = function (this: EventTimer): void {
    _super.prototype.onUnmount.call(this);
    this.cancel();
  };

  EventTimer.construct = function <F extends EventTimer<any, any>>(fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (event?: Event): void {
        if (event !== void 0) { // event listener
          fastener!.defer(event);
        } else { // timer callback
          fastener!.expire();
        }
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, this.prototype);
    }
    fastener = _super.construct.call(this, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).event = null;
    (fastener as Mutable<typeof fastener>).delay = fastener.initDelay();
    (fastener as Mutable<typeof fastener>).deadline = 0;
    (fastener as Mutable<typeof fastener>).timeout = void 0;
    return fastener;
  };

  return EventTimer;
})(EventHandler);
