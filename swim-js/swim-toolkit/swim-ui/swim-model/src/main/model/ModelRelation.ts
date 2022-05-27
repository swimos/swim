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
import {AnyModel, ModelFactory, Model} from "./Model";
import {Trait} from "../"; // forward import

/** @public */
export type ModelRelationModel<F extends ModelRelation<any, any>> =
  F extends {modelType?: ModelFactory<infer M>} ? M : never;

/** @public */
export interface ModelRelationDescriptor<M extends Model = Model> extends FastenerDescriptor {
  extends?: Proto<ModelRelation<any, any>> | string | boolean | null;
  modelType?: ModelFactory<M>;
  binds?: boolean;
  observes?: boolean;
  consumed?: boolean;
}

/** @public */
export type ModelRelationTemplate<F extends ModelRelation<any, any>> =
  ThisType<F> &
  ModelRelationDescriptor<ModelRelationModel<F>> &
  Partial<Omit<F, keyof ModelRelationDescriptor>>;

/** @public */
export interface ModelRelationClass<F extends ModelRelation<any, any> = ModelRelation<any, any>> extends FastenerClass<F> {
  /** @override */
  specialize(template: ModelRelationDescriptor<any>): ModelRelationClass<F>;

  /** @override */
  refine(fastenerClass: ModelRelationClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: ModelRelationTemplate<F2>): ModelRelationClass<F2>;
  extend<F2 extends F>(className: string, template: ModelRelationTemplate<F2>): ModelRelationClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: ModelRelationTemplate<F2>): ModelRelationClass<F2>;
  define<F2 extends F>(className: string, template: ModelRelationTemplate<F2>): ModelRelationClass<F2>;

  /** @override */
  <F2 extends F>(template: ModelRelationTemplate<F2>): PropertyDecorator;

  /** @internal */
  readonly ConsumingFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface ModelRelation<O = unknown, M extends Model = Model> extends Fastener<O>, Consumable {
  /** @override */
  get fastenerType(): Proto<ModelRelation<any, any>>;

  /** @protected */
  readonly consumed?: boolean; // optional prototype property

  /** @internal */
  readonly observes?: boolean; // optional prototype property

  /** @internal @override */
  getSuper(): ModelRelation<unknown, M> | null;

  /** @internal @override */
  setDerived(derived: boolean, inlet: ModelRelation<unknown, M>): void;

  /** @protected @override */
  willDerive(inlet: ModelRelation<unknown, M>): void;

  /** @protected @override */
  onDerive(inlet: ModelRelation<unknown, M>): void;

  /** @protected @override */
  didDerive(inlet: ModelRelation<unknown, M>): void;

  /** @protected @override */
  willUnderive(inlet: ModelRelation<unknown, M>): void;

  /** @protected @override */
  onUnderive(inlet: ModelRelation<unknown, M>): void;

  /** @protected @override */
  didUnderive(inlet: ModelRelation<unknown, M>): void;

  /** @override */
  readonly inlet: ModelRelation<unknown, M> | null;

  /** @protected @override */
  willBindInlet(inlet: ModelRelation<unknown, M>): void;

  /** @protected @override */
  onBindInlet(inlet: ModelRelation<unknown, M>): void;

  /** @protected @override */
  didBindInlet(inlet: ModelRelation<unknown, M>): void;

  /** @protected @override */
  willUnbindInlet(inlet: ModelRelation<unknown, M>): void;

  /** @protected @override */
  onUnbindInlet(inlet: ModelRelation<unknown, M>): void;

  /** @protected @override */
  didUnbindInlet(inlet: ModelRelation<unknown, M>): void;

  /** @internal */
  readonly outlets: ReadonlyArray<ModelRelation<unknown, M>> | null;

  /** @internal @override */
  attachOutlet(outlet: ModelRelation<unknown, M>): void;

  /** @internal @override */
  detachOutlet(outlet: ModelRelation<unknown, M>): void;

  /** @internal */
  readonly modelType?: ModelFactory<M>; // optional prototype property

  /** @protected */
  initModel(model: M): void;

  /** @protected */
  willAttachModel(model: M, target: Model | null): void;

  /** @protected */
  onAttachModel(model: M, target: Model | null): void;

  /** @protected */
  didAttachModel(model: M, target: Model | null): void;

  /** @protected */
  deinitModel(model: M): void;

  /** @protected */
  willDetachModel(model: M): void;

  /** @protected */
  onDetachModel(model: M): void;

  /** @protected */
  didDetachModel(model: M): void;

  /** @internal @protected */
  get parentModel(): Model | null;

  /** @internal @protected */
  insertChild(parent: Model, child: M, target: Model | null, key: string | undefined): void;

  /** @internal */
  bindModel(model: Model, target: Model | null): void;

  /** @internal */
  unbindModel(model: Model): void;

  detectModel(model: Model): M | null;

  createModel(): M;

  /** @internal @protected */
  fromAny(value: AnyModel<M>): M;

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
export const ModelRelation = (function (_super: typeof Fastener) {
  const ModelRelation = _super.extend("ModelRelation", {
    lazy: false,
    static: true,
  }) as ModelRelationClass;

  Object.defineProperty(ModelRelation.prototype, "fastenerType", {
    value: ModelRelation,
    configurable: true,
  });

  ModelRelation.prototype.onBindInlet = function <M extends Model>(this: ModelRelation<unknown, M>, inlet: ModelRelation<unknown, M>): void {
    (this as Mutable<typeof this>).inlet = inlet;
    _super.prototype.onBindInlet.call(this, inlet);
  };

  ModelRelation.prototype.onUnbindInlet = function <M extends Model>(this: ModelRelation<unknown, M>, inlet: ModelRelation<unknown, M>): void {
    _super.prototype.onUnbindInlet.call(this, inlet);
    (this as Mutable<typeof this>).inlet = null;
  };

  ModelRelation.prototype.attachOutlet = function <M extends Model>(this: ModelRelation<unknown, M>, outlet: ModelRelation<unknown, M>): void {
    let outlets = this.outlets as ModelRelation<unknown, M>[] | null;
    if (outlets === null) {
      outlets = [];
      (this as Mutable<typeof this>).outlets = outlets;
    }
    outlets.push(outlet);
  };

  ModelRelation.prototype.detachOutlet = function <M extends Model>(this: ModelRelation<unknown, M>, outlet: ModelRelation<unknown, M>): void {
    const outlets = this.outlets as ModelRelation<unknown, M>[] | null;
    if (outlets !== null) {
      const index = outlets.indexOf(outlet);
      if (index >= 0) {
        outlets.splice(index, 1);
      }
    }
  };

  ModelRelation.prototype.initModel = function <M extends Model>(this: ModelRelation<unknown, M>, model: M): void {
    // hook
  };

  ModelRelation.prototype.willAttachModel = function <M extends Model>(this: ModelRelation<unknown, M>, model: M, target: Model | null): void {
    // hook
  };

  ModelRelation.prototype.onAttachModel = function <M extends Model>(this: ModelRelation<unknown, M>, model: M, target: Model | null): void {
    if (this.observes === true) {
      model.observe(this as Observes<M>);
    }
    if ((this.flags & ModelRelation.ConsumingFlag) !== 0) {
      model.consume(this);
    }
  };

  ModelRelation.prototype.didAttachModel = function <M extends Model>(this: ModelRelation<unknown, M>, model: M, target: Model | null): void {
    // hook
  };

  ModelRelation.prototype.deinitModel = function <M extends Model>(this: ModelRelation<unknown, M>, model: M): void {
    // hook
  };

  ModelRelation.prototype.willDetachModel = function <M extends Model>(this: ModelRelation<unknown, M>, model: M): void {
    // hook
  };

  ModelRelation.prototype.onDetachModel = function <M extends Model>(this: ModelRelation<unknown, M>, model: M): void {
    if ((this.flags & ModelRelation.ConsumingFlag) !== 0) {
      model.unconsume(this);
    }
    if (this.observes === true) {
      model.unobserve(this as Observes<M>);
    }
  };

  ModelRelation.prototype.didDetachModel = function <M extends Model>(this: ModelRelation<unknown, M>, model: M): void {
    // hook
  };

  Object.defineProperty(ModelRelation.prototype, "parentModel", {
    get(this: ModelRelation): Model | null {
      const owner = this.owner;
      if (owner instanceof Model) {
        return owner;
      } else if (owner instanceof Trait) {
        return owner.model;
      } else {
        return null;
      }
    },
    configurable: true,
  });

  ModelRelation.prototype.insertChild = function <M extends Model>(this: ModelRelation<unknown, M>, parent: Model, child: M, target: Model | null, key: string | undefined): void {
    parent.insertChild(child, target, key);
  };

  ModelRelation.prototype.bindModel = function <M extends Model>(this: ModelRelation<unknown, M>, model: Model, target: Model | null): void {
    // hook
  };

  ModelRelation.prototype.unbindModel = function <M extends Model>(this: ModelRelation<unknown, M>, model: Model): void {
    // hook
  };

  ModelRelation.prototype.detectModel = function <M extends Model>(this: ModelRelation<unknown, M>, model: Model): M | null {
    return null;
  };

  ModelRelation.prototype.createModel = function <M extends Model>(this: ModelRelation<unknown, M>): M {
    let model: M | undefined;
    const modelType = this.modelType;
    if (modelType !== void 0) {
      model = modelType.create();
    }
    if (model === void 0 || model === null) {
      let message = "Unable to create ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "model";
      throw new Error(message);
    }
    return model;
  };

  ModelRelation.prototype.fromAny = function <M extends Model>(this: ModelRelation<unknown, M>, value: AnyModel<M>): M {
    const modelType = this.modelType;
    if (modelType !== void 0) {
      return modelType.fromAny(value);
    } else {
      return Model.fromAny(value) as M;
    }
  };

  ModelRelation.prototype.consume = function (this: ModelRelation, consumer: Consumer): void {
    const oldConsumers = this.consumers;
    const newConsumerrss = Arrays.inserted(consumer, oldConsumers);
    if (oldConsumers !== newConsumerrss) {
      this.willConsume(consumer);
      (this as Mutable<typeof this>).consumers = newConsumerrss;
      this.onConsume(consumer);
      this.didConsume(consumer);
      if (oldConsumers.length === 0 && (this.flags & ModelRelation.MountedFlag) !== 0) {
        this.startConsuming();
      }
    }
  };

  ModelRelation.prototype.willConsume = function (this: ModelRelation, consumer: Consumer): void {
    // hook
  };

  ModelRelation.prototype.onConsume = function (this: ModelRelation, consumer: Consumer): void {
    // hook
  };

  ModelRelation.prototype.didConsume = function (this: ModelRelation, consumer: Consumer): void {
    // hook
  };

  ModelRelation.prototype.unconsume = function (this: ModelRelation, consumer: Consumer): void {
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

  ModelRelation.prototype.willUnconsume = function (this: ModelRelation, consumer: Consumer): void {
    // hook
  };

  ModelRelation.prototype.onUnconsume = function (this: ModelRelation, consumer: Consumer): void {
    // hook
  };

  ModelRelation.prototype.didUnconsume = function (this: ModelRelation, consumer: Consumer): void {
    // hook
  };

  Object.defineProperty(ModelRelation.prototype, "consuming", {
    get(this: ModelRelation): boolean {
      return (this.flags & ModelRelation.ConsumingFlag) !== 0;
    },
    configurable: true,
  })

  ModelRelation.prototype.startConsuming = function (this: ModelRelation): void {
    if ((this.flags & ModelRelation.ConsumingFlag) === 0) {
      this.willStartConsuming();
      this.setFlags(this.flags | ModelRelation.ConsumingFlag);
      this.onStartConsuming();
      this.didStartConsuming();
    }
  };

  ModelRelation.prototype.willStartConsuming = function (this: ModelRelation): void {
    // hook
  };

  ModelRelation.prototype.onStartConsuming = function (this: ModelRelation): void {
    // hook
  };

  ModelRelation.prototype.didStartConsuming = function (this: ModelRelation): void {
    // hook
  };

  ModelRelation.prototype.stopConsuming = function (this: ModelRelation): void {
    if ((this.flags & ModelRelation.ConsumingFlag) !== 0) {
      this.willStopConsuming();
      this.setFlags(this.flags & ~ModelRelation.ConsumingFlag);
      this.onStopConsuming();
      this.didStopConsuming();
    }
  };

  ModelRelation.prototype.willStopConsuming = function (this: ModelRelation): void {
    // hook
  };

  ModelRelation.prototype.onStopConsuming = function (this: ModelRelation): void {
    // hook
  };

  ModelRelation.prototype.didStopConsuming = function (this: ModelRelation): void {
    // hook
  };

  ModelRelation.prototype.onMount = function (this: ModelRelation): void {
    _super.prototype.onMount.call(this);
    if (this.consumers.length !== 0) {
      this.startConsuming();
    }
  };

  ModelRelation.prototype.onUnmount = function (this: ModelRelation): void {
    _super.prototype.onUnmount.call(this);
    this.stopConsuming();
  };

  ModelRelation.construct = function <F extends ModelRelation<any, any>>(fastener: F | null, owner: FastenerOwner<F>): F {
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

  (ModelRelation as Mutable<typeof ModelRelation>).ConsumingFlag = 1 << (_super.FlagShift + 0);

  (ModelRelation as Mutable<typeof ModelRelation>).FlagShift = _super.FlagShift + 1;
  (ModelRelation as Mutable<typeof ModelRelation>).FlagMask = (1 << ModelRelation.FlagShift) - 1;

  return ModelRelation;
})(Fastener);
