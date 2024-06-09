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
import type {LikeType} from "@swim/util";
import type {Observes} from "@swim/util";
import type {Consumer} from "@swim/util";
import type {Consumable} from "@swim/util";
import type {FastenerFlags} from "@swim/component";
import type {FastenerDescriptor} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import {Fastener} from "@swim/component";
import type {ControllerFactory} from "./Controller";
import {Controller} from "./Controller";

/** @public */
export interface ControllerRelationDescriptor<R, C extends Controller> extends FastenerDescriptor<R> {
  extends?: Proto<ControllerRelation<any, any, any>> | boolean | null;
}

/** @public */
export interface ControllerRelationClass<F extends ControllerRelation<any, any, any> = ControllerRelation<any, any, any>> extends FastenerClass<F> {
  /** @internal */
  readonly ConsumingFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface ControllerRelation<R = any, C extends Controller = Controller, I extends any[] = [C | null]> extends Fastener<R, C | null, I>, Consumable {
  /** @override */
  get descriptorType(): Proto<ControllerRelationDescriptor<R, C>>;

  /** @override */
  get fastenerType(): Proto<ControllerRelation<any, any, any>>;

  get consumed(): boolean;

  get controllerType(): ControllerFactory<C> | null;

  get observes(): boolean;

  /** @override */
  get parent(): ControllerRelation<any, C, any> | null;

  /** @internal */
  readonly outlets: ReadonlySet<Fastener<any, any, any>> | null;

  /** @internal @override */
  attachOutlet(outlet: Fastener<any, any, any>): void;

  /** @internal @override */
  detachOutlet(outlet: Fastener<any, any, any>): void;

  /** @internal @protected */
  decohereOutlets(): void;

  /** @protected */
  initController(controller: C): void;

  /** @protected */
  willAttachController(controller: C, target: Controller | null): void;

  /** @protected */
  onAttachController(controller: C, target: Controller | null): void;

  /** @protected */
  didAttachController(controller: C, target: Controller | null): void;

  /** @protected */
  deinitController(controller: C): void;

  /** @protected */
  willDetachController(controller: C): void;

  /** @protected */
  onDetachController(controller: C): void;

  /** @protected */
  didDetachController(controller: C): void;

  get parentController(): Controller | null;

  /** @protected */
  insertChild(parent: Controller, child: C, target: Controller | null, key: string | undefined): void;

  /** @internal */
  bindController(controller: Controller, target: Controller | null): void;

  /** @internal */
  unbindController(controller: Controller): void;

  detectController(controller: Controller): C | null;

  createController(): C;

  /** @protected */
  fromLike(value: C | LikeType<C>): C;

  /** @internal */
  readonly consumers: ReadonlySet<Consumer> | null;

  /** @override */
  consume(consumer: Consumer): void

  /** @protected */
  willConsume(consumer: Consumer): void;

  /** @protected */
  onConsume(consumer: Consumer): void;

  /** @protected */
  didConsume(consumer: Consumer): void;

  /** @override */
  unconsume(consumer: Consumer): void

  /** @protected */
  willUnconsume(consumer: Consumer): void;

  /** @protected */
  onUnconsume(consumer: Consumer): void;

  /** @protected */
  didUnconsume(consumer: Consumer): void;

  get consuming(): boolean;

  /** @internal */
  startConsuming(): void;

  /** @protected */
  willStartConsuming(): void;

  /** @protected */
  onStartConsuming(): void;

  /** @protected */
  didStartConsuming(): void;

  /** @internal */
  stopConsuming(): void;

  /** @protected */
  willStopConsuming(): void;

  /** @protected */
  onStopConsuming(): void;

  /** @protected */
  didStopConsuming(): void;

  /** @protected @override */
  onMount(): void;

  /** @protected @override */
  onUnmount(): void;
}

/** @public */
export const ControllerRelation = (<R, C extends Controller, I extends any[], F extends ControllerRelation<any, any, any>>() => Fastener.extend<ControllerRelation<R, C, I>, ControllerRelationClass<F>>("ControllerRelation", {
  get fastenerType(): Proto<ControllerRelation<any, any, any>> {
    return ControllerRelation;
  },

  consumed: false,

  controllerType: null,

  observes: false,

  attachOutlet(outlet: Fastener<any, any, any>): void {
    let outlets = this.outlets as Set<Fastener<any, any, any>> | null;
    if (outlets === null) {
      outlets = new Set<Fastener<any, any, any>>();
      (this as Mutable<typeof this>).outlets = outlets;
    }
    outlets.add(outlet);
  },

  detachOutlet(outlet: Fastener<any, any, any>): void {
    const outlets = this.outlets as Set<Fastener<any, any, any>> | null;
    if (outlets === null) {
      return;
    }
    outlets.delete(outlet);
  },

  decohereOutlets(): void {
    const outlets = this.outlets;
    if (outlets === null) {
      return;
    }
    for (const outlet of outlets) {
      outlet.decohere(this);
    }
  },

  initController(controller: C): void {
    // hook
  },

  willAttachController(controller: C, target: Controller | null): void {
    // hook
  },

  onAttachController(controller: C, target: Controller | null): void {
    if (this.observes === true) {
      controller.observe(this as Observes<C>);
    }
    if ((this.flags & ControllerRelation.ConsumingFlag) !== 0) {
      controller.consume(this);
    }
  },

  didAttachController(controller: C, target: Controller | null): void {
    // hook
  },

  deinitController(controller: C): void {
    // hook
  },

  willDetachController(controller: C): void {
    // hook
  },

  onDetachController(controller: C): void {
    if ((this.flags & ControllerRelation.ConsumingFlag) !== 0) {
      controller.unconsume(this);
    }
    if (this.observes === true) {
      controller.unobserve(this as Observes<C>);
    }
  },

  didDetachController(controller: C): void {
    // hook
  },

  get parentController(): Controller | null {
    const owner = this.owner;
    return owner instanceof Controller ? owner : null;
  },

  insertChild(parent: Controller, child: C, target: Controller | null, key: string | undefined): void {
    parent.insertChild(child, target, key);
  },

  bindController(controller: Controller, target: Controller | null): void {
    // hook
  },

  unbindController(controller: Controller): void {
    // hook
  },

  detectController(controller: Controller): C | null {
    return null;
  },

  createController(): C {
    let controller: C | undefined;
    const controllerType = this.controllerType;
    if (controllerType !== null) {
      controller = controllerType.create();
    }
    if (controller === void 0 || controller === null) {
      let message = "unable to create ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "controller";
      throw new Error(message);
    }
    return controller;
  },

  fromLike(value: C | LikeType<C>): C {
    const controllerType = this.controllerType;
    if (controllerType !== null) {
      return controllerType.fromLike(value);
    }
    return Controller.fromLike(value) as C;
  },

  consume(consumer: Consumer): void {
    let consumers = this.consumers as Set<Consumer> | null;
    if (consumers === null) {
      consumers = new Set<Consumer>();
      (this as Mutable<typeof this>).consumers = consumers;
    } else if (consumers.has(consumer)) {
      return;
    }
    this.willConsume(consumer);
    consumers.add(consumer);
    this.onConsume(consumer);
    this.didConsume(consumer);
    if (consumers.size === 1 && this.mounted) {
      this.startConsuming();
    }
  },

  willConsume(consumer: Consumer): void {
    // hook
  },

  onConsume(consumer: Consumer): void {
    // hook
  },

  didConsume(consumer: Consumer): void {
    // hook
  },

  unconsume(consumer: Consumer): void {
    const consumers = this.consumers as Set<Consumer> | null;
    if (consumers === null || !consumers.has(consumer)) {
      return;
    }
    this.willUnconsume(consumer);
    consumers.delete(consumer);
    this.onUnconsume(consumer);
    this.didUnconsume(consumer);
    if (consumers.size === 0) {
      this.stopConsuming();
    }
  },

  willUnconsume(consumer: Consumer): void {
    // hook
  },

  onUnconsume(consumer: Consumer): void {
    // hook
  },

  didUnconsume(consumer: Consumer): void {
    // hook
  },

  get consuming(): boolean {
    return (this.flags & ControllerRelation.ConsumingFlag) !== 0;
  },

  startConsuming(): void {
    if ((this.flags & ControllerRelation.ConsumingFlag) !== 0) {
      return;
    }
    this.willStartConsuming();
    this.setFlags(this.flags | ControllerRelation.ConsumingFlag);
    this.onStartConsuming();
    this.didStartConsuming();
  },

  willStartConsuming(): void {
    // hook
  },

  onStartConsuming(): void {
    // hook
  },

  didStartConsuming(): void {
    // hook
  },

  stopConsuming(): void {
    if ((this.flags & ControllerRelation.ConsumingFlag) === 0) {
      return;
    }
    this.willStopConsuming();
    this.setFlags(this.flags & ~ControllerRelation.ConsumingFlag);
    this.onStopConsuming();
    this.didStopConsuming();
  },

  willStopConsuming(): void {
    // hook
  },

  onStopConsuming(): void {
    // hook
  },

  didStopConsuming(): void {
    // hook
  },

  onMount(): void {
    super.onMount();
    if (this.consumers !== null && this.consumers.size !== 0) {
      this.startConsuming();
    }
  },

  onUnmount(): void {
    super.onUnmount();
    this.stopConsuming();
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).outlets = null;
    (fastener as Mutable<typeof fastener>).consumers = null;
    return fastener;
  },

  ConsumingFlag: 1 << (Fastener.FlagShift + 0),

  FlagShift: Fastener.FlagShift + 1,
  FlagMask: (1 << (Fastener.FlagShift + 1)) - 1,
}))();
