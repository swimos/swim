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
import {Objects} from "@swim/util";
import type {Comparator} from "@swim/util";
import type {Consumer} from "@swim/util";
import {Affinity} from "@swim/component";
import type {FastenerFlags} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import {Fastener} from "@swim/component";
import type {Model} from "./Model";
import type {ModelRelationDescriptor} from "./ModelRelation";
import type {ModelRelationClass} from "./ModelRelation";
import {ModelRelation} from "./ModelRelation";

/** @public */
export interface ModelSetDescriptor<R, M extends Model> extends ModelRelationDescriptor<R, M> {
  extends?: Proto<ModelSet<any, any, any>> | boolean | null;
  ordered?: boolean;
  sorted?: boolean;
}

/** @public */
export interface ModelSetClass<F extends ModelSet<any, any, any> = ModelSet<any, any, any>> extends ModelRelationClass<F> {
  /** @internal */
  readonly OrderedFlag: FastenerFlags;
  /** @internal */
  readonly SortedFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface ModelSet<R = any, M extends Model = Model, I extends any[] = [M | null]> extends ModelRelation<R, M, I> {
  /** @override */
  get descriptorType(): Proto<ModelSetDescriptor<R, M>>;

  /** @override */
  get fastenerType(): Proto<ModelSet<any, any, any>>;

  /** @override */
  get parent(): ModelSet<any, M, any> | null;

  /** @protected */
  modelKey(model: M): string | undefined;

  /** @internal */
  readonly models: {readonly [modelId: string]: M | undefined};

  readonly modelCount: number;

  /** @internal */
  insertModelMap(newModel: M, target: Model | null): void;

  /** @internal */
  removeModelMap(oldModel: M): void;

  hasModel(model: Model): boolean;

  addModel(model?: M | LikeType<M>, target?: Model | null, key?: string): M;

  addModels(models: {readonly [modelId: string]: M | undefined}, target?: Model | null): void;

  setModels(models: {readonly [modelId: string]: M | undefined}, target?: Model | null): void;

  attachModel(model?: M | LikeType<M> | null, target?: Model | null): M;

  attachModels(models: {readonly [modelId: string]: M | undefined}, target?: Model | null): void;

  detachModel(model: M): M | null;

  detachModels(models?: {readonly [modelId: string]: M | undefined}): void;

  insertModel(parent?: Model | null, model?: M | LikeType<M>, target?: Model | null, key?: string): M;

  insertModels(parent: Model | null, models: {readonly [modelId: string]: M | undefined}, target?: Model | null): void;

  removeModel(model: M): M | null;

  removeModels(models?: {readonly [modelId: string]: M | undefined}): void;

  deleteModel(model: M): M | null;

  deleteModels(models?: {readonly [modelId: string]: M | undefined}): void;

  reinsertModel(model: M, target?: Model | null): void;

  /** @internal @override */
  bindModel(model: Model, target: Model | null): void;

  /** @internal @override */
  unbindModel(model: Model): void;

  /** @override */
  detectModel(model: Model): M | null;

  consumeModels(consumer: Consumer): void;

  unconsumeModels(consumer: Consumer): void;

  /** @protected @override */
  onStartConsuming(): void;

  /** @protected @override */
  onStopConsuming(): void;

  /** @override */
  recohere(t: number): void;

  get ordered(): boolean;

  order(ordered?: boolean): this;

  get sorted(): boolean;

  sort(sorted?: boolean): this;

  /** @protected */
  willSort(parent: Model | null): void;

  /** @protected */
  onSort(parent: Model | null): void;

  /** @protected */
  didSort(parent: Model | null): void;

  /** @internal */
  sortChildren(parent: Model, comparator?: Comparator<M>): void;

  /** @internal */
  getTargetChild(parent: Model, child: M): Model | null;

  /** @internal */
  compareChildren(a: Model, b: Model): number;

  /** @internal */
  compareTargetChild(a: Model, b: Model): number;

  /** @protected */
  compare(a: M, b: M): number;
}

/** @public */
export const ModelSet = (<R, M extends Model, I extends any[], F extends ModelSet<any, any, any>>() => ModelRelation.extend<ModelSet<R, M, I>, ModelSetClass<F>>("ModelSet", {
  get fastenerType(): Proto<ModelSet<any, any, any>> {
    return ModelSet;
  },

  modelKey(model: M): string | undefined {
    return void 0;
  },

  insertModelMap(newModel: M, target: Model | null): void {
    const models = this.models as {[modelId: string]: M | undefined};
    if (target !== null && (this.flags & ModelSet.OrderedFlag) !== 0) {
      (this as Mutable<typeof this>).models = Objects.inserted(models, newModel.uid, newModel, target);
    } else {
      models[newModel.uid] = newModel;
    }
  },

  removeModelMap(oldModel: M): void {
    const models = this.models as {[modelId: string]: M | undefined};
    delete models[oldModel.uid];
  },

  hasModel(model: Model): boolean {
    return this.models[model.uid] !== void 0;
  },

  addModel(newModel?: M | LikeType<M>, target?: Model | null, key?: string): M {
    if (newModel !== void 0 && newModel !== null) {
      newModel = this.fromLike(newModel);
    } else {
      newModel = this.createModel();
    }
    if (target === void 0) {
      target = null;
    }
    let parent: Model | null;
    if (this.binds && (parent = this.parentModel, parent !== null)) {
      if (target === null) {
        if (newModel.parent === parent) {
          target = newModel.nextSibling;
        } else {
          target = this.getTargetChild(parent, newModel);
        }
      }
      if (key === void 0) {
        key = this.modelKey(newModel);
      }
      if (newModel.parent !== parent || newModel.nextSibling !== target || newModel.key !== key) {
        this.insertChild(parent, newModel, target, key);
      }
    }
    if (this.models[newModel.uid] !== void 0) {
      return newModel;
    }
    this.insertModelMap(newModel, target);
    (this as Mutable<typeof this>).modelCount += 1;
    this.willAttachModel(newModel, target);
    this.onAttachModel(newModel, target);
    this.initModel(newModel);
    this.didAttachModel(newModel, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newModel;
  },

  addModels(newModels: {readonly [modelId: string]: M | undefined}, target?: Model | null): void {
    for (const modelId in newModels) {
      this.addModel(newModels[modelId]!, target);
    }
  },

  setModels(newModels: {readonly [modelId: string]: M | undefined}, target?: Model | null): void {
    const binds = this.binds;
    const parent = binds ? this.parentModel : null;
    const models = this.models;
    for (const modelId in models) {
      if (newModels[modelId] === void 0) {
        const oldModel = this.detachModel(models[modelId]!);
        if (oldModel !== null && binds && parent !== null && oldModel.parent === parent) {
          oldModel.remove();
        }
      }
    }
    if ((this.flags & ModelSet.OrderedFlag) !== 0) {
      const orderedModels = new Array<M>();
      for (const modeld in newModels) {
        orderedModels.push(newModels[modeld]!);
      }
      for (let i = 0, n = orderedModels.length; i < n; i += 1) {
        const newModel = orderedModels[i]!;
        if (models[newModel.uid] === void 0) {
          const targetModel = i < n + 1 ? orderedModels[i + 1] : target;
          this.addModel(newModel, targetModel);
        }
      }
    } else {
      for (const modelId in newModels) {
        if (models[modelId] === void 0) {
          this.addModel(newModels[modelId]!, target);
        }
      }
    }
  },

  attachModel(newModel?: M | LikeType<M> | null, target?: Model | null): M {
    if (newModel !== void 0 && newModel !== null) {
      newModel = this.fromLike(newModel);
    } else {
      newModel = this.createModel();
    }
    if (this.models[newModel.uid] !== void 0) {
      return newModel;
    } else if (target === void 0) {
      target = null;
    }
    this.insertModelMap(newModel, target);
    (this as Mutable<typeof this>).modelCount += 1;
    this.willAttachModel(newModel, target);
    this.onAttachModel(newModel, target);
    this.initModel(newModel);
    this.didAttachModel(newModel, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newModel;
  },

  attachModels(newModels: {readonly [modelId: string]: M | undefined}, target?: Model | null): void {
    for (const modelId in newModels) {
      this.attachModel(newModels[modelId]!, target);
    }
  },

  detachModel(oldModel: M): M | null {
    if (this.models[oldModel.uid] === void 0) {
      return null;
    }
    (this as Mutable<typeof this>).modelCount -= 1;
    this.removeModelMap(oldModel);
    this.willDetachModel(oldModel);
    this.onDetachModel(oldModel);
    this.deinitModel(oldModel);
    this.didDetachModel(oldModel);
    this.setCoherent(true);
    this.decohereOutlets();
    return oldModel;
  },

  detachModels(models?: {readonly [modelId: string]: M | undefined}): void {
    if (models === void 0) {
      models = this.models;
    }
    for (const modelId in models) {
      this.detachModel(models[modelId]!);
    }
  },

  insertModel(parent?: Model | null, newModel?: M | LikeType<M>, target?: Model | null, key?: string): M {
    if (newModel !== void 0 && newModel !== null) {
      newModel = this.fromLike(newModel);
    } else {
      newModel = this.createModel();
    }
    if (parent === void 0) {
      parent = null;
    }
    if (!this.binds && this.models[newModel.uid] !== void 0 && newModel.parent !== null && parent === null && key === void 0) {
      return newModel;
    }
    if (parent === null) {
      parent = this.parentModel;
    }
    if (target === void 0) {
      target = null;
    }
    if (key === void 0) {
      key = this.modelKey(newModel);
    }
    if (parent !== null && (newModel.parent !== parent || newModel.key !== key)) {
      if (target === null) {
        target = this.getTargetChild(parent, newModel);
      }
      this.insertChild(parent, newModel, target, key);
    }
    if (this.models[newModel.uid] !== void 0) {
      return newModel;
    }
    this.insertModelMap(newModel, target);
    (this as Mutable<typeof this>).modelCount += 1;
    this.willAttachModel(newModel, target);
    this.onAttachModel(newModel, target);
    this.initModel(newModel);
    this.didAttachModel(newModel, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newModel;
  },

  insertModels(parent: Model | null, newModels: {readonly [modelId: string]: M | undefined}, target?: Model | null): void {
    for (const modelId in newModels) {
      this.insertModel(parent, newModels[modelId]!, target);
    }
  },

  removeModel(model: M): M | null {
    if (!this.hasModel(model)) {
      return model;
    }
    model.remove();
    return model;
  },

  removeModels(models?: {readonly [modelId: string]: M | undefined}): void {
    if (models === void 0) {
      models = this.models;
    }
    for (const modelId in models) {
      this.removeModel(models[modelId]!);
    }
  },

  deleteModel(model: M): M | null {
    const oldModel = this.detachModel(model);
    if (oldModel === null) {
      return null;
    }
    oldModel.remove();
    return oldModel;
  },

  deleteModels(models?: {readonly [modelId: string]: M | undefined}): void {
    if (models === void 0) {
      models = this.models;
    }
    for (const modelId in models) {
      this.deleteModel(models[modelId]!);
    }
  },

  reinsertModel(model: M, target?: Model | null): void {
    if (this.models[model.uid] === void 0 || (target === void 0 && (this.flags & ModelSet.SortedFlag) === 0)) {
      return;
    }
    const parent = model.parent;
    if (parent === null) {
      return;
    } else if (target === void 0) {
      target = this.getTargetChild(parent, model);
    }
    parent.reinsertChild(model, target);
  },

  bindModel(model: Model, target: Model | null): void {
    if (!this.binds) {
      return;
    }
    const newModel = this.detectModel(model);
    if (newModel === null || this.models[newModel.uid] !== void 0) {
      return;
    }
    this.insertModelMap(newModel, target);
    (this as Mutable<typeof this>).modelCount += 1;
    this.willAttachModel(newModel, target);
    this.onAttachModel(newModel, target);
    this.initModel(newModel);
    this.didAttachModel(newModel, target);
    this.setCoherent(true);
    this.decohereOutlets();
  },

  unbindModel(model: Model): void {
    if (!this.binds) {
      return;
    }
    const oldModel = this.detectModel(model);
    if (oldModel === null || this.models[oldModel.uid] === void 0) {
      return;
    }
    (this as Mutable<typeof this>).modelCount -= 1;
    this.removeModelMap(oldModel);
    this.willDetachModel(oldModel);
    this.onDetachModel(oldModel);
    this.deinitModel(oldModel);
    this.didDetachModel(oldModel);
    this.setCoherent(true);
    this.decohereOutlets();
  },

  detectModel(model: Model): M | null {
    if (typeof this.modelType === "function" && model instanceof this.modelType) {
      return model as M;
    }
    return null;
  },

  consumeModels(consumer: Consumer): void {
    const models = this.models;
    for (const modelId in models) {
      const model = models[modelId]!;
      model.consume(consumer);
    }
  },

  unconsumeModels(consumer: Consumer): void {
    const models = this.models;
    for (const modelId in models) {
      const model = models[modelId]!;
      model.unconsume(consumer);
    }
  },

  onStartConsuming(): void {
    this.consumeModels(this);
  },

  onStopConsuming(): void {
    this.unconsumeModels(this);
  },

  recohere(t: number): void {
    this.setCoherentTime(t);
    const inlet = this.inlet;
    if (inlet instanceof ModelSet) {
      this.setDerived((this.flags & Affinity.Mask) <= Math.min(inlet.flags & Affinity.Mask, Affinity.Intrinsic));
      if ((this.flags & Fastener.DerivedFlag) !== 0) {
        this.setModels(inlet.models);
      }
    } else {
      this.setDerived(false);
    }
  },

  get ordered(): boolean {
    return (this.flags & ModelSet.OrderedFlag) !== 0;
  },

  order(ordered?: boolean): typeof this {
    if (ordered === void 0) {
      ordered = true;
    }
    if (ordered) {
      this.setFlags(this.flags | ModelSet.OrderedFlag);
    } else {
      this.setFlags(this.flags & ~ModelSet.OrderedFlag);
    }
    return this;
  },

  get sorted(): boolean {
    return (this.flags & ModelSet.SortedFlag) !== 0;
  },

  sort(sorted?: boolean): typeof this {
    if (sorted === void 0) {
      sorted = true;
    }
    if (sorted) {
      const parent = this.parentModel;
      this.willSort(parent);
      this.setFlags(this.flags | ModelSet.SortedFlag);
      this.onSort(parent);
      this.didSort(parent);
    } else {
      this.setFlags(this.flags & ~ModelSet.SortedFlag);
    }
    return this;
  },

  willSort(parent: Model | null): void {
    // hook
  },

  onSort(parent: Model | null): void {
    if (parent !== null) {
      this.sortChildren(parent);
    }
  },

  didSort(parent: Model | null): void {
    // hook
  },

  sortChildren(parent: Model, comparator?: Comparator<M>): void {
    parent.sortChildren(this.compareChildren.bind(this));
  },

  getTargetChild(parent: Model, child: M): Model | null {
    if ((this.flags & ModelSet.SortedFlag) !== 0) {
      return parent.getTargetChild(child, this.compareTargetChild.bind(this));
    }
    return null;
  },

  compareChildren(a: Model, b: Model): number {
    const models = this.models;
    const x = models[a.uid];
    const y = models[b.uid];
    if (x !== void 0 && y !== void 0) {
      return this.compare(x, y);
    }
    return x !== void 0 ? 1 : y !== void 0 ? -1 : 0;
  },

  compareTargetChild(a: M, b: Model): number {
    const models = this.models;
    const y = models[b.uid];
    if (y !== void 0) {
      return this.compare(a, y);
    }
    return y !== void 0 ? -1 : 0;
  },

  compare(a: M, b: M): number {
    return a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0;
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).models = {};
    (fastener as Mutable<typeof fastener>).modelCount = 0;
    return fastener;
  },

  refine(fastenerClass: FastenerClass<ModelSet<any, any, any>>): void {
    super.refine(fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;

    let flagsInit = fastenerPrototype.flagsInit;
    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "ordered")) {
      if (fastenerPrototype.ordered) {
        flagsInit |= ModelSet.OrderedFlag;
      } else {
        flagsInit &= ~ModelSet.OrderedFlag;
      }
      delete (fastenerPrototype as ModelSetDescriptor<any, any>).ordered;
    }
    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "sorted")) {
      if (fastenerPrototype.sorted) {
        flagsInit |= ModelSet.SortedFlag;
      } else {
        flagsInit &= ~ModelSet.SortedFlag;
      }
      delete (fastenerPrototype as ModelSetDescriptor<any, any>).sorted;
    }
    Object.defineProperty(fastenerPrototype, "flagsInit", {
      value: flagsInit,
      enumerable: true,
      configurable: true,
    });
  },

  OrderedFlag: 1 << (ModelRelation.FlagShift + 0),
  SortedFlag: 1 << (ModelRelation.FlagShift + 1),

  FlagShift: ModelRelation.FlagShift + 2,
  FlagMask: (1 << (ModelRelation.FlagShift + 2)) - 1,
}))();
