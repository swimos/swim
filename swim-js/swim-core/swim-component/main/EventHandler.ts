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
import {Objects} from "@swim/util";
import type {FastenerFlags} from "./Fastener";
import type {FastenerDescriptor} from "./Fastener";
import type {FastenerClass} from "./Fastener";
import {Fastener} from "./Fastener";
import type {Component} from "./Component";

/** @public */
export interface EventHandlerDescriptor<R, T> extends FastenerDescriptor<R> {
  extends?: Proto<EventHandler<any, any>> | boolean | null;
  enabled?: boolean;
}

/** @public */
export interface EventHandlerClass<F extends EventHandler<any, any> = EventHandler<any, any>> extends FastenerClass<F> {
  /** @internal */
  readonly EnabledFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface EventHandler<R = any, T = EventTarget> extends Fastener<R>, EventListener {
  /** @override */
  (event: Event): void;

  /** @override */
  get descriptorType(): Proto<EventHandlerDescriptor<R, T>>;

  /** @override */
  get fastenerType(): Proto<EventHandler<any, any>>;

  get bindsOwner(): boolean;

  initEventType(): string | readonly string[] | undefined;

  readonly eventType: string | readonly string[] | undefined;

  initTarget(): T | null;

  readonly target: T | null;

  getTarget(): T;

  setTarget(target: T | null): T | null;

  /** @protected */
  willAttachTarget(target: T): void;

  /** @protected */
  onAttachTarget(target: T): void;

  /** @protected */
  didAttachTarget(target: T): void;

  /** @protected */
  willDetachTarget(target: T): void;

  /** @protected */
  onDetachTarget(target: T): void;

  /** @protected */
  didDetachTarget(target: T): void;

  get options(): AddEventListenerOptions | undefined;

  /** @protected */
  attachEvents(target: T): void;

  /** @protected */
  attachEvent(target: T, eventType: string): void;

  /** @protected */
  detachEvents(target: T): void;

  /** @protected */
  detachEvent(target: T, eventType: string): void;

  /** @protected */
  handle(event: Event): void;

  get enabled(): boolean;

  set enabled(enabled: boolean);

  /** @protected */
  willEnable(): void;

  /** @protected */
  onEnable(): void;

  /** @protected */
  didEnable(): void;

  /** @protected */
  willDisable(): void;

  /** @protected */
  onDisable(): void;

  /** @protected */
  didDisable(): void;

  /** @internal */
  bindComponent(component: Component<any>, target?: Component<any> | null): void;

  /** @internal */
  unbindComponent(component: Component<any>): void;

  detectComponent(component: Component<any>): T | null;

  /** @protected @override */
  onMount(): void;

  /** @protected @override */
  onUnmount(): void;
}

/** @public */
export const EventHandler = (<R, T, F extends EventHandler<any, any>>() => Fastener.extend<EventHandler<R, T>, EventHandlerClass<F>>("EventHandler", {
  get fastenerType(): Proto<EventHandler<any, any>> {
    return EventHandler;
  },

  bindsOwner: false,

  eventType: void 0,

  initEventType(): string | readonly string[] | undefined {
    return (Object.getPrototypeOf(this) as EventHandler<R, T>).eventType;
  },

  target: null,

  initTarget(): T | null {
    let target = (Object.getPrototypeOf(this) as EventHandler<R, T>).target;
    if (target === null && this.bindsOwner === true) {
      target = this.owner as unknown as T;
    }
    return target;
  },

  getTarget(): T {
    const target = this.target;
    if (target === null) {
      let message = target + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "event target";
      throw new TypeError(message);
    }
    return target;
  },

  setTarget(newTarget: T | null): T | null {
    const oldTarget = this.target;
    if (oldTarget === newTarget) {
      return oldTarget;
    } else if (oldTarget !== null) {
      (this as Mutable<typeof this>).target = null;
      this.willDetachTarget(oldTarget);
      this.onDetachTarget(oldTarget);
      this.didDetachTarget(oldTarget);
    }
    if (newTarget !== null) {
      (this as Mutable<typeof this>).target = newTarget;
      this.willAttachTarget(newTarget);
      this.onAttachTarget(newTarget);
      this.didAttachTarget(newTarget);
    }
    return oldTarget;
  },

  willAttachTarget(target: T): void {
    // hook
  },

  onAttachTarget(target: T): void {
    if ((this.flags & (Fastener.MountedFlag | EventHandler.EnabledFlag)) === (Fastener.MountedFlag | EventHandler.EnabledFlag)) {
      this.attachEvents(target);
    }
  },

  didAttachTarget(target: T): void {
    // hook
  },

  willDetachTarget(target: T): void {
    // hook
  },

  onDetachTarget(target: T): void {
    if ((this.flags & (Fastener.MountedFlag | EventHandler.EnabledFlag)) === (Fastener.MountedFlag | EventHandler.EnabledFlag)) {
      this.detachEvents(target);
    }
  },

  didDetachTarget(target: T): void {
    // hook
  },

  options: void 0,

  attachEvents(target: T): void {
    const eventType = this.eventType;
    if (typeof eventType === "string") {
      this.attachEvent(target, eventType);
    } else if (eventType !== void 0) {
      for (let i = 0; i < eventType.length; i += 1) {
        this.attachEvent(target, eventType[i]!);
      }
    }
  },

  attachEvent(target: T, eventType: string): void {
    if (Objects.hasAllKeys<EventTarget>(target, "addEventListener", "removeEventListener")) {
      target.addEventListener(eventType, this, this.options);
    }
  },

  detachEvents(target: T): void {
    const eventType = this.eventType;
    if (typeof eventType === "string") {
      this.detachEvent(target, eventType);
    } else if (eventType !== void 0) {
      for (let i = 0; i < eventType.length; i += 1) {
        this.detachEvent(target, eventType[i]!);
      }
    }
  },

  detachEvent(target: T, eventType: string): void {
    if (Objects.hasAllKeys<EventTarget>(target, "addEventListener", "removeEventListener")) {
      target.removeEventListener(eventType, this, this.options);
    }
  },

  handle(event: Event): void {
    // hook
  },

  flagsInit: 1 << (Fastener.FlagShift + 0), // EnabledFlag

  get enabled(): boolean {
    return (this.flags & EventHandler.EnabledFlag) !== 0;
  },

  set enabled(enabled: boolean) {
    if (enabled && ((this.flags & EventHandler.EnabledFlag) === 0)) {
      this.willEnable();
      this.setFlags(this.flags | EventHandler.EnabledFlag);
      this.onEnable();
      this.didEnable();
    } else if (!enabled && ((this.flags & EventHandler.EnabledFlag) !== 0)) {
      this.willDisable();
      this.setFlags(this.flags & ~EventHandler.EnabledFlag);
      this.onDisable();
      this.didDisable();
    }
  },

  willEnable(): void {
    // hook
  },

  onEnable(): void {
    const target = this.target;
    if (target !== null && (this.flags & Fastener.MountedFlag) !== 0) {
      this.attachEvents(target);
    }
  },

  didEnable(): void {
    // hook
  },

  willDisable(): void {
    // hook
  },

  onDisable(): void {
    const target = this.target;
    if (target !== null && (this.flags & Fastener.MountedFlag) !== 0) {
      this.detachEvents(target);
    }
  },

  didDisable(): void {
    // hook
  },

  bindComponent(component: Component<any>): void {
    if (!this.binds || this.target !== null) {
      return;
    }
    const target = this.detectComponent(component);
    if (target !== null) {
      this.setTarget(target);
    }
  },

  unbindComponent(component: Component<any>): void {
    if (!this.binds) {
      return;
    }
    const target = this.detectComponent(component);
    if (target !== null && target === this.target) {
      this.setTarget(null);
    }
  },

  detectComponent(component: Component<any>): T | null {
    return null;
  },

  onMount(): void {
    super.onMount();
    const target = this.target;
    if (target !== null && (this.flags & EventHandler.EnabledFlag) !== 0) {
      this.attachEvents(target);
    }
  },

  onUnmount(): void {
    super.onUnmount();
    const target = this.target;
    if (target !== null && (this.flags & EventHandler.EnabledFlag) !== 0) {
      this.detachEvents(target);
    }
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    if (fastener === null) {
      fastener = function (event: Event): void {
        fastener!.handle(event);
      } as F;
      Object.defineProperty(fastener, "name", {
        value: this.prototype.name,
        enumerable: true,
        configurable: true,
      });
      Object.setPrototypeOf(fastener, this.prototype);
    }
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).eventType = fastener.initEventType();
    (fastener as Mutable<typeof fastener>).target = fastener.initTarget();
    return fastener;
  },

  refine(fastenerClass: FastenerClass<EventHandler<any, any>>): void {
    super.refine(fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;

    let flagsInit = fastenerPrototype.flagsInit;
    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "enabled")) {
      if (fastenerPrototype.enabled) {
        flagsInit |= EventHandler.EnabledFlag;
      } else {
        flagsInit &= ~EventHandler.EnabledFlag;
      }
      delete (fastenerPrototype as EventHandlerDescriptor<any, any>).enabled;
    }
    Object.defineProperty(fastenerPrototype, "flagsInit", {
      value: flagsInit,
      enumerable: true,
      configurable: true,
    });

    const targetDescriptor = Object.getOwnPropertyDescriptor(fastenerPrototype, "target");
    if (targetDescriptor !== void 0 && "value" in targetDescriptor) {
      if (targetDescriptor.value === void 0) {
        targetDescriptor.value = null;
      }
      Object.defineProperty(fastenerPrototype, "target", targetDescriptor);
    }
  },

  EnabledFlag: 1 << (Fastener.FlagShift + 0),

  FlagShift: Fastener.FlagShift + 1,
  FlagMask: (1 << (Fastener.FlagShift + 1)) - 1,
}))();
