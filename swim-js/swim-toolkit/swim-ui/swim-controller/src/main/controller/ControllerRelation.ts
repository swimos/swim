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

import {Mutable, Proto, Arrays, Observes, Consumer, Consumable} from "@swim/util";
import {FastenerFlags, FastenerOwner, FastenerDescriptor, FastenerClass, Fastener} from "@swim/component";
import {AnyController, ControllerFactory, Controller} from "./Controller";

/** @public */
export type ControllerRelationController<F extends ControllerRelation<any, any>> =
  F extends {controllerType?: ControllerFactory<infer C>} ? C : never;

/** @public */
export interface ControllerRelationDescriptor<C extends Controller = Controller> extends FastenerDescriptor {
  extends?: Proto<ControllerRelation<any, any>> | string | boolean | null;
  controllerType?: ControllerFactory<C>;
  binds?: boolean;
  consumed?: boolean;
  observes?: boolean;
}

/** @public */
export type ControllerRelationTemplate<F extends ControllerRelation<any, any>> =
  ThisType<F> &
  ControllerRelationDescriptor<ControllerRelationController<F>> &
  Partial<Omit<F, keyof ControllerRelationDescriptor>>;

/** @public */
export interface ControllerRelationClass<F extends ControllerRelation<any, any> = ControllerRelation<any, any>> extends FastenerClass<F> {
  /** @override */
  specialize(template: ControllerRelationDescriptor<any>): ControllerRelationClass<F>;

  /** @override */
  refine(fastenerClass: ControllerRelationClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: ControllerRelationTemplate<F2>): ControllerRelationClass<F2>;
  extend<F2 extends F>(className: string, template: ControllerRelationTemplate<F2>): ControllerRelationClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: ControllerRelationTemplate<F2>): ControllerRelationClass<F2>;
  define<F2 extends F>(className: string, template: ControllerRelationTemplate<F2>): ControllerRelationClass<F2>;

  /** @override */
  <F2 extends F>(template: ControllerRelationTemplate<F2>): PropertyDecorator;

  /** @internal */
  readonly ConsumingFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface ControllerRelation<O = unknown, C extends Controller = Controller> extends Fastener<O>, Consumable {
  /** @override */
  get fastenerType(): Proto<ControllerRelation<any, any>>;

  /** @protected */
  readonly consumed?: boolean; // optional prototype property

  /** @internal */
  readonly observes?: boolean; // optional prototype property

  /** @internal @override */
  getSuper(): ControllerRelation<unknown, C> | null;

  /** @internal @override */
  setDerived(derived: boolean, inlet: ControllerRelation<unknown, C>): void;

  /** @protected @override */
  willDerive(inlet: ControllerRelation<unknown, C>): void;

  /** @protected @override */
  onDerive(inlet: ControllerRelation<unknown, C>): void;

  /** @protected @override */
  didDerive(inlet: ControllerRelation<unknown, C>): void;

  /** @protected @override */
  willUnderive(inlet: ControllerRelation<unknown, C>): void;

  /** @protected @override */
  onUnderive(inlet: ControllerRelation<unknown, C>): void;

  /** @protected @override */
  didUnderive(inlet: ControllerRelation<unknown, C>): void;

  /** @override */
  readonly inlet: ControllerRelation<unknown, C> | null;

  /** @protected @override */
  willBindInlet(inlet: ControllerRelation<unknown, C>): void;

  /** @protected @override */
  onBindInlet(inlet: ControllerRelation<unknown, C>): void;

  /** @protected @override */
  didBindInlet(inlet: ControllerRelation<unknown, C>): void;

  /** @protected @override */
  willUnbindInlet(inlet: ControllerRelation<unknown, C>): void;

  /** @protected @override */
  onUnbindInlet(inlet: ControllerRelation<unknown, C>): void;

  /** @protected @override */
  didUnbindInlet(inlet: ControllerRelation<unknown, C>): void;

  /** @internal */
  readonly outlets: ReadonlyArray<ControllerRelation<unknown, C>> | null;

  /** @internal @override */
  attachOutlet(outlet: ControllerRelation<unknown, C>): void;

  /** @internal @override */
  detachOutlet(outlet: ControllerRelation<unknown, C>): void;

  /** @internal */
  readonly controllerType?: ControllerFactory<C>; // optional prototype property

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

  /** @internal @protected */
  get parentController(): Controller | null;

  /** @internal @protected */
  insertChild(parent: Controller, child: C, target: Controller | null, key: string | undefined): void;

  /** @internal */
  bindController(controller: Controller, target: Controller | null): void;

  /** @internal */
  unbindController(controller: Controller): void;

  detectController(controller: Controller): C | null;

  createController(): C;

  /** @internal @protected */
  fromAny(value: AnyController<C>): C;

  /** @internal */
  readonly consumers: ReadonlyArray<Consumer>;

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
export const ControllerRelation = (function (_super: typeof Fastener) {
  const ControllerRelation = _super.extend("ControllerRelation", {
    lazy: false,
    static: true,
  }) as ControllerRelationClass;

  Object.defineProperty(ControllerRelation.prototype, "fastenerType", {
    value: ControllerRelation,
    configurable: true,
  });

  ControllerRelation.prototype.onBindInlet = function <C extends Controller>(this: ControllerRelation<unknown, C>, inlet: ControllerRelation<unknown, C>): void {
    (this as Mutable<typeof this>).inlet = inlet;
    _super.prototype.onBindInlet.call(this, inlet);
  };

  ControllerRelation.prototype.onUnbindInlet = function <C extends Controller>(this: ControllerRelation<unknown, C>, inlet: ControllerRelation<unknown, C>): void {
    _super.prototype.onUnbindInlet.call(this, inlet);
    (this as Mutable<typeof this>).inlet = null;
  };

  ControllerRelation.prototype.attachOutlet = function <C extends Controller>(this: ControllerRelation<unknown, C>, outlet: ControllerRelation<unknown, C>): void {
    let outlets = this.outlets as ControllerRelation<unknown, C>[] | null;
    if (outlets === null) {
      outlets = [];
      (this as Mutable<typeof this>).outlets = outlets;
    }
    outlets.push(outlet);
  };

  ControllerRelation.prototype.detachOutlet = function <C extends Controller>(this: ControllerRelation<unknown, C>, outlet: ControllerRelation<unknown, C>): void {
    const outlets = this.outlets as ControllerRelation<unknown, C>[] | null;
    if (outlets !== null) {
      const index = outlets.indexOf(outlet);
      if (index >= 0) {
        outlets.splice(index, 1);
      }
    }
  };

  ControllerRelation.prototype.initController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: C): void {
    // hook
  };

  ControllerRelation.prototype.willAttachController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: C, target: Controller | null): void {
    // hook
  };

  ControllerRelation.prototype.onAttachController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: C, target: Controller | null): void {
    if (this.observes === true) {
      controller.observe(this as Observes<C>);
    }
    if ((this.flags & ControllerRelation.ConsumingFlag) !== 0) {
      controller.consume(this);
    }
  };

  ControllerRelation.prototype.didAttachController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: C, target: Controller | null): void {
    // hook
  };

  ControllerRelation.prototype.deinitController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: C): void {
    // hook
  };

  ControllerRelation.prototype.willDetachController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: C): void {
    // hook
  };

  ControllerRelation.prototype.onDetachController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: C): void {
    if ((this.flags & ControllerRelation.ConsumingFlag) !== 0) {
      controller.unconsume(this);
    }
    if (this.observes === true) {
      controller.unobserve(this as Observes<C>);
    }
  };

  ControllerRelation.prototype.didDetachController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: C): void {
    // hook
  };

  Object.defineProperty(ControllerRelation.prototype, "parentController", {
    get(this: ControllerRelation): Controller | null {
      const owner = this.owner;
      return owner instanceof Controller ? owner : null;
    },
    configurable: true,
  });

  ControllerRelation.prototype.insertChild = function <C extends Controller>(this: ControllerRelation<unknown, C>, parent: Controller, child: C, target: Controller | null, key: string | undefined): void {
    parent.insertChild(child, target, key);
  };

  ControllerRelation.prototype.bindController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: Controller, target: Controller | null): void {
    // hook
  };

  ControllerRelation.prototype.unbindController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: Controller): void {
    // hook
  };

  ControllerRelation.prototype.detectController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: Controller): C | null {
    return null;
  };

  ControllerRelation.prototype.createController = function <C extends Controller>(this: ControllerRelation<unknown, C>): C {
    let controller: C | undefined;
    const controllerType = this.controllerType;
    if (controllerType !== void 0) {
      controller = controllerType.create();
    }
    if (controller === void 0 || controller === null) {
      let message = "Unable to create ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "controller";
      throw new Error(message);
    }
    return controller;
  };

  ControllerRelation.prototype.fromAny = function <C extends Controller>(this: ControllerRelation<unknown, C>, value: AnyController<C>): C {
    const controllerType = this.controllerType;
    if (controllerType !== void 0) {
      return controllerType.fromAny(value);
    } else {
      return Controller.fromAny(value) as C;
    }
  };

  ControllerRelation.prototype.consume = function (this: ControllerRelation, consumer: Consumer): void {
    const oldConsumers = this.consumers;
    const newConsumerrss = Arrays.inserted(consumer, oldConsumers);
    if (oldConsumers !== newConsumerrss) {
      this.willConsume(consumer);
      (this as Mutable<typeof this>).consumers = newConsumerrss;
      this.onConsume(consumer);
      this.didConsume(consumer);
      if (oldConsumers.length === 0 && (this.flags & ControllerRelation.MountedFlag) !== 0) {
        this.startConsuming();
      }
    }
  };

  ControllerRelation.prototype.willConsume = function (this: ControllerRelation, consumer: Consumer): void {
    // hook
  };

  ControllerRelation.prototype.onConsume = function (this: ControllerRelation, consumer: Consumer): void {
    // hook
  };

  ControllerRelation.prototype.didConsume = function (this: ControllerRelation, consumer: Consumer): void {
    // hook
  };

  ControllerRelation.prototype.unconsume = function (this: ControllerRelation, consumer: Consumer): void {
    const oldConsumers = this.consumers;
    const newConsumerrss = Arrays.removed(consumer, oldConsumers);
    if (oldConsumers !== newConsumerrss) {
      this.willUnconsume(consumer);
      (this as Mutable<typeof this>).consumers = newConsumerrss;
      this.onUnconsume(consumer);
      this.didUnconsume(consumer);
      if (newConsumerrss.length === 0) {
        this.stopConsuming();
      }
    }
  };

  ControllerRelation.prototype.willUnconsume = function (this: ControllerRelation, consumer: Consumer): void {
    // hook
  };

  ControllerRelation.prototype.onUnconsume = function (this: ControllerRelation, consumer: Consumer): void {
    // hook
  };

  ControllerRelation.prototype.didUnconsume = function (this: ControllerRelation, consumer: Consumer): void {
    // hook
  };

  Object.defineProperty(ControllerRelation.prototype, "consuming", {
    get(this: ControllerRelation): boolean {
      return (this.flags & ControllerRelation.ConsumingFlag) !== 0;
    },
    configurable: true,
  })

  ControllerRelation.prototype.startConsuming = function (this: ControllerRelation): void {
    if ((this.flags & ControllerRelation.ConsumingFlag) === 0) {
      this.willStartConsuming();
      this.setFlags(this.flags | ControllerRelation.ConsumingFlag);
      this.onStartConsuming();
      this.didStartConsuming();
    }
  };

  ControllerRelation.prototype.willStartConsuming = function (this: ControllerRelation): void {
    // hook
  };

  ControllerRelation.prototype.onStartConsuming = function (this: ControllerRelation): void {
    // hook
  };

  ControllerRelation.prototype.didStartConsuming = function (this: ControllerRelation): void {
    // hook
  };

  ControllerRelation.prototype.stopConsuming = function (this: ControllerRelation): void {
    if ((this.flags & ControllerRelation.ConsumingFlag) !== 0) {
      this.willStopConsuming();
      this.setFlags(this.flags & ~ControllerRelation.ConsumingFlag);
      this.onStopConsuming();
      this.didStopConsuming();
    }
  };

  ControllerRelation.prototype.willStopConsuming = function (this: ControllerRelation): void {
    // hook
  };

  ControllerRelation.prototype.onStopConsuming = function (this: ControllerRelation): void {
    // hook
  };

  ControllerRelation.prototype.didStopConsuming = function (this: ControllerRelation): void {
    // hook
  };

  ControllerRelation.prototype.onMount = function (this: ControllerRelation): void {
    _super.prototype.onMount.call(this);
    if (this.consumers.length !== 0) {
      this.startConsuming();
    }
  };

  ControllerRelation.prototype.onUnmount = function (this: ControllerRelation): void {
    _super.prototype.onUnmount.call(this);
    this.stopConsuming();
  };

  ControllerRelation.construct = function <F extends ControllerRelation<any, any>>(fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct.call(this, fastener, owner) as F;
    Object.defineProperty(fastener, "inlet", { // override getter
      value: null,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    (fastener as Mutable<typeof fastener>).outlets = null;
    (fastener as Mutable<typeof fastener>).consumers = Arrays.empty;
    return fastener;
  };

  (ControllerRelation as Mutable<typeof ControllerRelation>).ConsumingFlag = 1 << (_super.FlagShift + 0);

  (ControllerRelation as Mutable<typeof ControllerRelation>).FlagShift = _super.FlagShift + 1;
  (ControllerRelation as Mutable<typeof ControllerRelation>).FlagMask = (1 << ControllerRelation.FlagShift) - 1;

  return ControllerRelation;
})(Fastener);
