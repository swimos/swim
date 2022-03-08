// Copyright 2015-2021 Swim.inc
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

import type {Mutable, Proto, ObserverType} from "@swim/util";
import type {FastenerOwner, FastenerFlags} from "@swim/component";
import type {AnyModel, Model} from "./Model";
import {ModelRelationInit, ModelRelationClass, ModelRelation} from "./ModelRelation";

/** @internal */
export type ModelSetType<F extends ModelSet<any, any>> =
  F extends ModelSet<any, infer M> ? M : never;

/** @public */
export interface ModelSetInit<M extends Model = Model> extends ModelRelationInit<M> {
  extends?: {prototype: ModelSet<any, any>} | string | boolean | null;
  key?(model: M): string | undefined;
  compare?(a: M, b: M): number;

  sorted?: boolean;
  willSort?(parent: Model | null): void;
  didSort?(parent: Model | null): void;
  sortChildren?(parent: Model): void;
  compareChildren?(a: Model, b: Model): number;
}

/** @public */
export type ModelSetDescriptor<O = unknown, M extends Model = Model, I = {}> = ThisType<ModelSet<O, M> & I> & ModelSetInit<M> & Partial<I>;

/** @public */
export interface ModelSetClass<F extends ModelSet<any, any> = ModelSet<any, any>> extends ModelRelationClass<F> {
  /** @internal */
  readonly SortedFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface ModelSetFactory<F extends ModelSet<any, any> = ModelSet<any, any>> extends ModelSetClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): ModelSetFactory<F> & I;

  define<O, M extends Model = Model>(className: string, descriptor: ModelSetDescriptor<O, M>): ModelSetFactory<ModelSet<any, M>>;
  define<O, M extends Model = Model>(className: string, descriptor: {observes: boolean} & ModelSetDescriptor<O, M, ObserverType<M>>): ModelSetFactory<ModelSet<any, M>>;
  define<O, M extends Model = Model, I = {}>(className: string, descriptor: {implements: unknown} & ModelSetDescriptor<O, M, I>): ModelSetFactory<ModelSet<any, M> & I>;
  define<O, M extends Model = Model, I = {}>(className: string, descriptor: {implements: unknown; observes: boolean} & ModelSetDescriptor<O, M, I & ObserverType<M>>): ModelSetFactory<ModelSet<any, M> & I>;

  <O, M extends Model = Model>(descriptor: ModelSetDescriptor<O, M>): PropertyDecorator;
  <O, M extends Model = Model>(descriptor: {observes: boolean} & ModelSetDescriptor<O, M, ObserverType<M>>): PropertyDecorator;
  <O, M extends Model = Model, I = {}>(descriptor: {implements: unknown} & ModelSetDescriptor<O, M, I>): PropertyDecorator;
  <O, M extends Model = Model, I = {}>(descriptor: {implements: unknown; observes: boolean} & ModelSetDescriptor<O, M, I & ObserverType<M>>): PropertyDecorator;
}

/** @public */
export interface ModelSet<O = unknown, M extends Model = Model> extends ModelRelation<O, M> {
  (model: AnyModel<M>): O;

  /** @override */
  get fastenerType(): Proto<ModelSet<any, any>>;

  /** @internal */
  readonly models: {readonly [modelId: number]: M | undefined};

  readonly modelCount: number;

  hasModel(model: Model): boolean;

  addModel(model?: AnyModel<M>, target?: Model | null, key?: string): M;

  attachModel(model?: AnyModel<M>, target?: Model | null): M;

  detachModel(model: M): M | null;

  insertModel(parent?: Model | null, model?: AnyModel<M>, target?: Model | null, key?: string): M;

  removeModel(model: M): M | null;

  deleteModel(model: M): M | null;

  /** @internal @override */
  bindModel(model: Model, target: Model | null): void;

  /** @internal @override */
  unbindModel(model: Model): void;

  /** @override */
  detectModel(model: Model): M | null;

  /** @internal @protected */
  key(model: M): string | undefined;

  get sorted(): boolean;

  /** @internal */
  initSorted(sorted: boolean): void;

  sort(sorted?: boolean): this;

  /** @protected */
  willSort(parent: Model | null): void;

  /** @protected */
  onSort(parent: Model | null): void;

  /** @protected */
  didSort(parent: Model | null): void;

  /** @internal @protected */
  sortChildren(parent: Model): void;

  /** @internal */
  compareChildren(a: Model, b: Model): number;

  /** @internal @protected */
  compare(a: M, b: M): number;
}

/** @public */
export const ModelSet = (function (_super: typeof ModelRelation) {
  const ModelSet: ModelSetFactory = _super.extend("ModelSet");

  Object.defineProperty(ModelSet.prototype, "fastenerType", {
    get: function (this: ModelSet): Proto<ModelSet<any, any>> {
      return ModelSet;
    },
    configurable: true,
  });

  ModelSet.prototype.hasModel = function (this: ModelSet, model: Model): boolean {
    return this.models[model.uid] !== void 0;
  };

  ModelSet.prototype.addModel = function <M extends Model>(this: ModelSet<unknown, M>, newModel?: AnyModel<M>, target?: Model | null, key?: string): M {
    if (newModel !== void 0 && newModel !== null) {
      newModel = this.fromAny(newModel);
    } else {
      newModel = this.createModel();
    }
    if (target === void 0) {
      target = null;
    }
    let parent: Model | null;
    if (this.binds && (parent = this.parentModel, parent !== null)) {
      if (key === void 0) {
        key = this.key(newModel);
      }
      this.insertChild(parent, newModel, target, key);
    }
    const models = this.models as {[modelId: number]: M | undefined};
    if (models[newModel.uid] === void 0) {
      models[newModel.uid] = newModel;
      (this as Mutable<typeof this>).modelCount += 1;
      this.willAttachModel(newModel, target);
      this.onAttachModel(newModel, target);
      this.initModel(newModel);
      this.didAttachModel(newModel, target);
    }
    return newModel;
  };

  ModelSet.prototype.attachModel = function <M extends Model>(this: ModelSet<unknown, M>, newModel?: AnyModel<M>, target?: Model | null): M {
    if (newModel !== void 0 && newModel !== null) {
      newModel = this.fromAny(newModel);
    } else {
      newModel = this.createModel();
    }
    const models = this.models as {[modelId: number]: M | undefined};
    if (models[newModel.uid] === void 0) {
      if (target === void 0) {
        target = null;
      }
      models[newModel.uid] = newModel;
      (this as Mutable<typeof this>).modelCount += 1;
      this.willAttachModel(newModel, target);
      this.onAttachModel(newModel, target);
      this.initModel(newModel);
      this.didAttachModel(newModel, target);
    }
    return newModel;
  };

  ModelSet.prototype.detachModel = function <M extends Model>(this: ModelSet<unknown, M>, oldModel: M): M | null {
    const models = this.models as {[modelId: number]: M | undefined};
    if (models[oldModel.uid] !== void 0) {
      (this as Mutable<typeof this>).modelCount -= 1;
      delete models[oldModel.uid];
      this.willDetachModel(oldModel);
      this.onDetachModel(oldModel);
      this.deinitModel(oldModel);
      this.didDetachModel(oldModel);
      return oldModel;
    }
    return null;
  };

  ModelSet.prototype.insertModel = function <M extends Model>(this: ModelSet<unknown, M>, parent?: Model | null, newModel?: AnyModel<M>, target?: Model | null, key?: string): M {
    if (newModel !== void 0 && newModel !== null) {
      newModel = this.fromAny(newModel);
    } else {
      newModel = this.createModel();
    }
    if (parent === void 0 || parent === null) {
      parent = this.parentModel;
    }
    if (target === void 0) {
      target = null;
    }
    if (key === void 0) {
      key = this.key(newModel);
    }
    if (parent !== null && (newModel.parent !== parent || newModel.key !== key)) {
      this.insertChild(parent, newModel, target, key);
    }
    const models = this.models as {[modelId: number]: M | undefined};
    if (models[newModel.uid] === void 0) {
      models[newModel.uid] = newModel;
      (this as Mutable<typeof this>).modelCount += 1;
      this.willAttachModel(newModel, target);
      this.onAttachModel(newModel, target);
      this.initModel(newModel);
      this.didAttachModel(newModel, target);
    }
    return newModel;
  };

  ModelSet.prototype.removeModel = function <M extends Model>(this: ModelSet<unknown, M>, model: M): M | null {
    if (this.hasModel(model)) {
      model.remove();
      return model;
    }
    return null;
  };

  ModelSet.prototype.deleteModel = function <M extends Model>(this: ModelSet<unknown, M>, model: M): M | null {
    const oldModel = this.detachModel(model);
    if (oldModel !== null) {
      oldModel.remove();
    }
    return oldModel;
  };

  ModelSet.prototype.bindModel = function <M extends Model>(this: ModelSet<unknown, M>, model: Model, target: Model | null): void {
    if (this.binds) {
      const newModel = this.detectModel(model);
      const models = this.models as {[modelId: number]: M | undefined};
      if (newModel !== null && models[newModel.uid] === void 0) {
        models[newModel.uid] = newModel;
        (this as Mutable<typeof this>).modelCount += 1;
        this.willAttachModel(newModel, target);
        this.onAttachModel(newModel, target);
        this.initModel(newModel);
        this.didAttachModel(newModel, target);
      }
    }
  };

  ModelSet.prototype.unbindModel = function <M extends Model>(this: ModelSet<unknown, M>, model: Model): void {
    if (this.binds) {
      const oldModel = this.detectModel(model);
      const models = this.models as {[modelId: number]: M | undefined};
      if (oldModel !== null && models[oldModel.uid] !== void 0) {
        (this as Mutable<typeof this>).modelCount -= 1;
        delete models[oldModel.uid];
        this.willDetachModel(oldModel);
        this.onDetachModel(oldModel);
        this.deinitModel(oldModel);
        this.didDetachModel(oldModel);
      }
    }
  };

  ModelSet.prototype.detectModel = function <M extends Model>(this: ModelSet<unknown, M>, model: Model): M | null {
    if (typeof this.type === "function" && model instanceof this.type) {
      return model as M;
    }
    return null;
  };

  ModelSet.prototype.key = function <M extends Model>(this: ModelSet<unknown, M>, model: M): string | undefined {
    return void 0;
  };

  Object.defineProperty(ModelSet.prototype, "sorted", {
    get(this: ModelSet): boolean {
      return (this.flags & ModelSet.SortedFlag) !== 0;
    },
    configurable: true,
  });

  ModelSet.prototype.initInherits = function (this: ModelSet, sorted: boolean): void {
    if (sorted) {
      (this as Mutable<typeof this>).flags = this.flags | ModelSet.SortedFlag;
    } else {
      (this as Mutable<typeof this>).flags = this.flags & ~ModelSet.SortedFlag;
    }
  };

  ModelSet.prototype.sort = function (this: ModelSet, sorted?: boolean): typeof this {
    if (sorted === void 0) {
      sorted = true;
    }
    const flags = this.flags;
    if (sorted && (flags & ModelSet.SortedFlag) === 0) {
      const parent = this.parentModel;
      this.willSort(parent);
      this.setFlags(flags | ModelSet.SortedFlag);
      this.onSort(parent);
      this.didSort(parent);
    } else if (!sorted && (flags & ModelSet.SortedFlag) !== 0) {
      this.setFlags(flags & ~ModelSet.SortedFlag);
    }
    return this;
  };

  ModelSet.prototype.willSort = function (this: ModelSet, parent: Model | null): void {
    // hook
  };

  ModelSet.prototype.onSort = function (this: ModelSet, parent: Model | null): void {
    if (parent !== null) {
      this.sortChildren(parent);
    }
  };

  ModelSet.prototype.didSort = function (this: ModelSet, parent: Model | null): void {
    // hook
  };

  ModelSet.prototype.sortChildren = function <M extends Model>(this: ModelSet<unknown, M>, parent: Model): void {
    parent.sortChildren(this.compareChildren.bind(this));
  };

  ModelSet.prototype.compareChildren = function <M extends Model>(this: ModelSet<unknown, M>, a: Model, b: Model): number {
    const models = this.models;
    const x = models[a.uid];
    const y = models[b.uid];
    if (x !== void 0 && y !== void 0) {
      return this.compare(x, y);
    } else {
      return x !== void 0 ? 1 : y !== void 0 ? -1 : 0;
    }
  };

  ModelSet.prototype.compare = function <M extends Model>(this: ModelSet<unknown, M>, a: M, b: M): number {
    return a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0;
  };

  ModelSet.construct = function <F extends ModelSet<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (newModel: AnyModel<ModelSetType<F>>): FastenerOwner<F> {
        fastener!.addModel(newModel);
        return fastener!.owner;
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, fastenerClass.prototype);
    }
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).models = {};
    (fastener as Mutable<typeof fastener>).modelCount = 0;
    return fastener;
  };

  ModelSet.define = function <O, M extends Model>(className: string, descriptor: ModelSetDescriptor<O, M>): ModelSetFactory<ModelSet<any, M>> {
    let superClass = descriptor.extends as ModelSetFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const sorted = descriptor.sorted;
    delete descriptor.extends;
    delete descriptor.implements;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.sorted;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: ModelSet<any, any>}, fastener: ModelSet<O, M> | null, owner: O): ModelSet<O, M> {
      fastener = superClass!.construct(fastenerClass, fastener, owner);
      if (affinity !== void 0) {
        fastener.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        fastener.initInherits(inherits);
      }
      if (sorted !== void 0) {
        fastener.initSorted(sorted);
      }
      return fastener;
    };

    return fastenerClass;
  };

  (ModelSet as Mutable<typeof ModelSet>).SortedFlag = 1 << (_super.FlagShift + 0);

  (ModelSet as Mutable<typeof ModelSet>).FlagShift = _super.FlagShift + 1;
  (ModelSet as Mutable<typeof ModelSet>).FlagMask = (1 << ModelSet.FlagShift) - 1;

  return ModelSet;
})(ModelRelation);
