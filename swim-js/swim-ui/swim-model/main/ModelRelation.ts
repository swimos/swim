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
import type {ModelFactory} from "./Model";
import {Model} from "./Model";
import {Trait} from "./"; // forward import

/** @public */
export interface ModelRelationDescriptor<R, M extends Model> extends FastenerDescriptor<R> {
  extends?: Proto<ModelRelation<any, any, any>> | boolean | null;
}

/** @public */
export interface ModelRelationClass<F extends ModelRelation<any, any, any> = ModelRelation<any, any, any>> extends FastenerClass<F> {
  /** @internal */
  readonly ConsumingFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface ModelRelation<R = any, M extends Model = Model, I extends any[] = [M | null]> extends Fastener<R, M | null, I>, Consumable {
  /** @override */
  get descriptorType(): Proto<ModelRelationDescriptor<R, M>>;

  /** @override */
  get fastenerType(): Proto<ModelRelation<any, any, any>>;

  get consumed(): boolean;

  get modelType(): ModelFactory<M> | null;

  get observes(): boolean;

  /** @override */
  get parent(): ModelRelation<any, M, any> | null;

  /** @internal */
  readonly outlets: ReadonlySet<Fastener<any, any, any>> | null;

  /** @internal @override */
  attachOutlet(outlet: Fastener<any, any, any>): void;

  /** @internal @override */
  detachOutlet(outlet: Fastener<any, any, any>): void;

  /** @internal @protected */
  decohereOutlets(): void;

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

  get parentModel(): Model | null;

  /** @protected */
  insertChild(parent: Model, child: M, target: Model | null, key: string | undefined): void;

  /** @internal */
  bindModel(model: Model, target: Model | null): void;

  /** @internal */
  unbindModel(model: Model): void;

  detectModel(model: Model): M | null;

  createModel(): M;

  /** @protected */
  fromLike(value: M | LikeType<M>): M;

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
export const ModelRelation = (<R, M extends Model, I extends any[], F extends ModelRelation<any, any, any>>() => Fastener.extend<ModelRelation<R, M, I>, ModelRelationClass<F>>("ModelRelation", {
  get fastenerType(): Proto<ModelRelation<any, any, any>> {
    return ModelRelation;
  },

  consumed: false,

  modelType: null,

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
    if (outlets !== null) {
      for (const outlet of outlets) {
        outlet.decohere(this);
      }
    }
  },

  initModel(model: M): void {
    // hook
  },

  willAttachModel(model: M, target: Model | null): void {
    // hook
  },

  onAttachModel(model: M, target: Model | null): void {
    if (this.observes) {
      model.observe(this as Observes<M>);
    }
    if ((this.flags & ModelRelation.ConsumingFlag) !== 0) {
      model.consume(this);
    }
  },

  didAttachModel(model: M, target: Model | null): void {
    // hook
  },

  deinitModel(model: M): void {
    // hook
  },

  willDetachModel(model: M): void {
    // hook
  },

  onDetachModel(model: M): void {
    if ((this.flags & ModelRelation.ConsumingFlag) !== 0) {
      model.unconsume(this);
    }
    if (this.observes) {
      model.unobserve(this as Observes<M>);
    }
  },

  didDetachModel(model: M): void {
    // hook
  },

  get parentModel(): Model | null {
    const owner = this.owner;
    if (owner instanceof Model) {
      return owner;
    } else if (owner instanceof Trait) {
      return owner.model;
    }
    return null;
  },

  insertChild(parent: Model, child: M, target: Model | null, key: string | undefined): void {
    parent.insertChild(child, target, key);
  },

  bindModel(model: Model, target: Model | null): void {
    // hook
  },

  unbindModel(model: Model): void {
    // hook
  },

  detectModel(model: Model): M | null {
    return null;
  },

  createModel(): M {
    let model: M | undefined;
    const modelType = this.modelType;
    if (modelType !== null) {
      model = modelType.create();
    }
    if (model === void 0 || model === null) {
      let message = "unable to create ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "model";
      throw new Error(message);
    }
    return model;
  },

  fromLike(value: M | LikeType<M>): M {
    const modelType = this.modelType;
    if (modelType !== null) {
      return modelType.fromLike(value);
    }
    return Model.fromLike(value) as M;
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
    return (this.flags & ModelRelation.ConsumingFlag) !== 0;
  },

  startConsuming(): void {
    if ((this.flags & ModelRelation.ConsumingFlag) !== 0) {
      return;
    }
    this.willStartConsuming();
    this.setFlags(this.flags | ModelRelation.ConsumingFlag);
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
    if ((this.flags & ModelRelation.ConsumingFlag) === 0) {
      return;
    }
    this.willStopConsuming();
    this.setFlags(this.flags & ~ModelRelation.ConsumingFlag);
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
