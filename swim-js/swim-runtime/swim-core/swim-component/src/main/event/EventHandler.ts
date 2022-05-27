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
import {FastenerFlags, FastenerOwner, FastenerDescriptor, FastenerClass, Fastener} from "../fastener/Fastener";
import type {Component} from "../component/Component";

/** @public */
export type EventHandlerTarget<F extends EventHandler<any, any>> =
  F extends {target: infer T | null} ? T : never;

/** @public */
export interface EventHandlerDescriptor<T extends EventTarget = EventTarget> extends FastenerDescriptor {
  extends?: Proto<EventHandler<any, any>> | string | boolean | null;
  target?: T | null;
  type?: string | readonly string[];
  options?: AddEventListenerOptions;
  disabled?: boolean;
  bindsOwner?: boolean;
  binds?: boolean;
}

/** @public */
export type EventHandlerTemplate<F extends EventHandler<any, any>> =
  ThisType<F> &
  EventHandlerDescriptor &
  Partial<Omit<F, keyof EventHandlerDescriptor>>;

/** @public */
export interface EventHandlerClass<F extends EventHandler<any, any> = EventHandler<any, any>> extends FastenerClass<F> {
  /** @override */
  specialize(template: EventHandlerDescriptor): EventHandlerClass<F>;

  /** @override */
  refine(fastenerClass: EventHandlerClass<any>): void;

  /** @override */
  extend<G2 extends F>(className: string, template: EventHandlerTemplate<G2>): EventHandlerClass<G2>;
  extend<G2 extends F>(className: string, template: EventHandlerTemplate<G2>): EventHandlerClass<G2>;

  /** @override */
  define<G2 extends F>(className: string, template: EventHandlerTemplate<G2>): EventHandlerClass<G2>;
  define<G2 extends F>(className: string, template: EventHandlerTemplate<G2>): EventHandlerClass<G2>;

  /** @override */
  <G2 extends F>(template: EventHandlerTemplate<G2>): PropertyDecorator;

  /** @internal */
  readonly DisabledFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface EventHandler<O = unknown, T extends EventTarget = EventTarget> extends Fastener<O>, EventListener {
  /** @override */
  (event: Event): void;

  /** @override */
  get fastenerType(): Proto<EventHandler<any, any>>;

  /** @internal */
  readonly type?: string | readonly string[]; // prototype property

  /** @internal */
  readonly options?: AddEventListenerOptions; // optional prototype property

  /** @internal */
  readonly bindsOwner?: boolean; // optional prototype property

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

  /** @protected */
  attachEvents(target: T): void;

  /** @protected */
  detachEvents(target: T): void;

  /** @internal */
  initDisabled(disabled: boolean): void;

  /** @protected */
  handle(event: Event): void;

  get disabled(): boolean;

  disable(disabled?: boolean): this;

  /** @protected */
  willDisable(): void;

  /** @protected */
  onDisable(): void;

  /** @protected */
  didDisable(): void;

  /** @protected */
  willEnable(): void;

  /** @protected */
  onEnable(): void;

  /** @protected */
  didEnable(): void;

  /** @internal */
  bindComponent(component: Component, target?: Component | null): void;

  /** @internal */
  unbindComponent(component: Component): void;

  detectComponent(component: Component): T | null;

  /** @protected @override */
  onMount(): void;

  /** @protected @override */
  onUnmount(): void;
}

/** @public */
export const EventHandler = (function (_super: typeof Fastener) {
  const EventHandler = _super.extend("EventHandler", {
    lazy: false,
    static: true,
  }) as EventHandlerClass;

  Object.defineProperty(EventHandler.prototype, "fastenerType", {
    value: EventHandler,
    configurable: true,
  });

  EventHandler.prototype.handle = function (this: EventHandler, event: Event): void {
    // hook
  };

  EventHandler.prototype.initTarget = function (this: EventHandler): EventTarget | null {
    let target = (Object.getPrototypeOf(this) as EventHandler).target as EventTarget | null | undefined;
    if (target === void 0) {
      target = null;
    }
    return target;
  };

  EventHandler.prototype.getTarget = function (this: EventHandler): EventTarget {
    const target = this.target;
    if (target === null) {
      throw new TypeError("null " + this.name + " event target");
    }
    return target;
  };

  EventHandler.prototype.setTarget = function (this: EventHandler, newTarget: EventTarget | null): EventTarget | null {
    const oldTarget = this.target;
    if (oldTarget !== newTarget) {
      if (oldTarget !== null) {
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
    }
    return oldTarget;
  };

  EventHandler.prototype.willAttachTarget = function (this: EventHandler, target: EventTarget): void {
    // hook
  };

  EventHandler.prototype.onAttachTarget = function (this: EventHandler, target: EventTarget): void {
    if ((this.flags & (Fastener.MountedFlag | EventHandler.DisabledFlag)) === Fastener.MountedFlag) {
      this.attachEvents(target);
    }
  };

  EventHandler.prototype.didAttachTarget = function (this: EventHandler, target: EventTarget): void {
    // hook
  };

  EventHandler.prototype.willDetachTarget = function (this: EventHandler, target: EventTarget): void {
    // hook
  };

  EventHandler.prototype.onDetachTarget = function (this: EventHandler, target: EventTarget): void {
    if ((this.flags & (Fastener.MountedFlag | EventHandler.DisabledFlag)) === Fastener.MountedFlag) {
      this.detachEvents(target);
    }
  };

  EventHandler.prototype.didDetachTarget = function (this: EventHandler, target: EventTarget): void {
    // hook
  };

  EventHandler.prototype.attachEvents = function (this: EventHandler, target: EventTarget): void {
    const type = this.type;
    if (typeof type === "string") {
      target.addEventListener(type, this, this.options);
    } else if (type !== void 0) {
      for (let i = 0, n = type.length; i < n; i += 1) {
        target.addEventListener(type[i]!, this, this.options);
      }
    }
  };

  EventHandler.prototype.detachEvents = function (this: EventHandler, target: EventTarget): void {
    const type = this.type;
    if (typeof type === "string") {
      target.removeEventListener(type, this, this.options);
    } else if (type !== void 0) {
      for (let i = 0, n = type.length; i < n; i += 1) {
        target.removeEventListener(type[i]!, this, this.options);
      }
    }
  };

  EventHandler.prototype.initDisabled = function (this: EventHandler, disabled: boolean): void {
    if (disabled) {
      (this as Mutable<typeof this>).flags = this.flags | EventHandler.DisabledFlag;
    } else {
      (this as Mutable<typeof this>).flags = this.flags & ~EventHandler.DisabledFlag;
    }
  };

  Object.defineProperty(EventHandler.prototype, "disabled", {
    get(this: EventHandler): boolean {
      return (this.flags & EventHandler.DisabledFlag) !== 0;
    },
    configurable: true,
  });

  EventHandler.prototype.disable = function (this: EventHandler, disabled?: boolean): typeof this {
    if (disabled === void 0) {
      disabled = true;
    }
    if (disabled !== ((this.flags & EventHandler.DisabledFlag) !== 0)) {
      if (disabled) {
        this.willDisable();
        this.setFlags(this.flags | EventHandler.DisabledFlag);
        this.onDisable();
        this.didDisable();
      } else {
        this.willEnable();
        this.setFlags(this.flags & ~EventHandler.DisabledFlag);
        this.onEnable();
        this.didEnable();
      }
    }
    return this;
  };

  EventHandler.prototype.willDisable = function (this: EventHandler): void {
    // hook
  };

  EventHandler.prototype.onDisable = function (this: EventHandler): void {
    const target = this.target;
    if (target !== null && (this.flags & Fastener.MountedFlag) !== 0) {
      this.detachEvents(target);
    }
  };

  EventHandler.prototype.didDisable = function (this: EventHandler): void {
    // hook
  };

  EventHandler.prototype.willEnable = function (this: EventHandler): void {
    // hook
  };

  EventHandler.prototype.onEnable = function (this: EventHandler): void {
    const target = this.target;
    if (target !== null && (this.flags & Fastener.MountedFlag) !== 0) {
      this.attachEvents(target);
    }
  };

  EventHandler.prototype.didEnable = function (this: EventHandler): void {
    // hook
  };

  EventHandler.prototype.bindComponent = function (this: EventHandler, component: Component): void {
    if (this.binds && this.target === null) {
      const target = this.detectComponent(component);
      if (target !== null) {
        this.setTarget(target);
      }
    }
  };

  EventHandler.prototype.unbindComponent = function (this: EventHandler, component: Component): void {
    if (this.binds) {
      const target = this.detectComponent(component);
      if (target !== null && target === this.target) {
        this.setTarget(null);
      }
    }
  };

  EventHandler.prototype.detectComponent = function (this: EventHandler, component: Component): EventTarget | null {
    return null;
  };

  EventHandler.prototype.onMount = function (this: EventHandler): void {
    _super.prototype.onMount.call(this);
    const target = this.target;
    if (target !== null && (this.flags & EventHandler.DisabledFlag) === 0) {
      this.attachEvents(target);
    }
  };

  EventHandler.prototype.onUnmount = function (this: EventHandler): void {
    _super.prototype.onUnmount.call(this);
    const target = this.target;
    if (target !== null && (this.flags & EventHandler.DisabledFlag) === 0) {
      this.detachEvents(target);
    }
  };

  EventHandler.create = function <F extends EventHandler<any, any>>(this: EventHandlerClass<F>, owner: FastenerOwner<F>): F {
    const fastener = _super.create.call(this, owner) as F;
    if (fastener.target === null && fastener.bindsOwner === true &&
        (owner as EventTarget).addEventListener !== void 0 &&
        (owner as EventTarget).removeEventListener !== void 0) {
      fastener.setTarget(owner);
    }
    return fastener;
  };

  EventHandler.construct = function <F extends EventHandler<any, any>>(fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (event: Event): void {
        fastener!.handle(event);
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, this.prototype);
    }
    fastener = _super.construct.call(this, fastener, owner) as F;
    const flagsInit = fastener.flagsInit;
    if (flagsInit !== void 0) {
      fastener.initDisabled((flagsInit & EventHandler.DisabledFlag) !== 0);
    }
    (fastener as Mutable<typeof fastener>).target = fastener.initTarget();
    return fastener;
  };

  EventHandler.refine = function (fastenerClass: EventHandlerClass<any>): void {
    _super.refine.call(this, fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;
    let flagsInit = fastenerPrototype.flagsInit;

    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "disabled")) {
      if (flagsInit === void 0) {
        flagsInit = 0;
      }
      if (fastenerPrototype.disabled) {
        flagsInit |= EventHandler.DisabledFlag;
      } else {
        flagsInit &= ~EventHandler.DisabledFlag;
      }
      delete (fastenerPrototype as EventHandlerDescriptor).disabled;
    }

    if (flagsInit !== void 0) {
      Object.defineProperty(fastenerPrototype, "flagsInit", {
        value: flagsInit,
        configurable: true,
      });
    }
  };

  (EventHandler as Mutable<typeof EventHandler>).DisabledFlag = 1 << (_super.FlagShift + 0);

  (EventHandler as Mutable<typeof EventHandler>).FlagShift = _super.FlagShift + 1;
  (EventHandler as Mutable<typeof EventHandler>).FlagMask = (1 << EventHandler.FlagShift) - 1;

  return EventHandler;
})(Fastener);
