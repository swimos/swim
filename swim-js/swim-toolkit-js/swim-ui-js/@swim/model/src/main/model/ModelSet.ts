// Copyright 2015-2021 Swim Inc.
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

import type {Mutable, Class, ObserverType} from "@swim/util";
import type {FastenerOwner} from "@swim/fastener";
import type {AnyModel, Model} from "./Model";
import {ModelRelationInit, ModelRelationClass, ModelRelation} from "./ModelRelation";

/** @internal */
export type ModelSetType<F extends ModelSet<any, any>> =
  F extends ModelSet<any, infer M> ? M : never;

/** @public */
export interface ModelSetInit<M extends Model = Model> extends ModelRelationInit<M> {
  extends?: {prototype: ModelSet<any, any>} | string | boolean | null;
  key?(model: M): string | undefined;
}

/** @public */
export type ModelSetDescriptor<O = unknown, M extends Model = Model, I = {}> = ThisType<ModelSet<O, M> & I> & ModelSetInit<M> & Partial<I>;

/** @public */
export interface ModelSetClass<F extends ModelSet<any, any> = ModelSet<any, any>> extends ModelRelationClass<F> {
}

/** @public */
export interface ModelSetFactory<F extends ModelSet<any, any> = ModelSet<any, any>> extends ModelSetClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): ModelSetFactory<F> & I;

  define<O, M extends Model = Model>(className: string, descriptor: ModelSetDescriptor<O, M>): ModelSetFactory<ModelSet<any, M>>;
  define<O, M extends Model = Model>(className: string, descriptor: {observes: boolean} & ModelSetDescriptor<O, M, ObserverType<M>>): ModelSetFactory<ModelSet<any, M>>;
  define<O, M extends Model = Model, I = {}>(className: string, descriptor: ModelSetDescriptor<O, M, I>): ModelSetFactory<ModelSet<any, M> & I>;
  define<O, M extends Model = Model, I = {}>(className: string, descriptor: {observes: boolean} & ModelSetDescriptor<O, M, I & ObserverType<M>>): ModelSetFactory<ModelSet<any, M> & I>;

  <O, M extends Model = Model>(descriptor: ModelSetDescriptor<O, M>): PropertyDecorator;
  <O, M extends Model = Model>(descriptor: {observes: boolean} & ModelSetDescriptor<O, M, ObserverType<M>>): PropertyDecorator;
  <O, M extends Model = Model, I = {}>(descriptor: ModelSetDescriptor<O, M, I>): PropertyDecorator;
  <O, M extends Model = Model, I = {}>(descriptor: {observes: boolean} & ModelSetDescriptor<O, M, I & ObserverType<M>>): PropertyDecorator;
}

/** @public */
export interface ModelSet<O = unknown, M extends Model = Model> extends ModelRelation<O, M> {
  (newModel: AnyModel<M>): O;

  /** @override */
  get familyType(): Class<ModelSet<any, any>> | null;

  /** @internal */
  readonly models: {readonly [modelId: number]: M | undefined};

  readonly modelCount: number;

  hasModel(model: Model): boolean;

  addModel(model?: AnyModel<M>, targetModel?: Model | null, key?: string): M;

  attachModel(model?: AnyModel<M>, targetModel?: Model | null): M;

  detachModel(model: M): M | null;

  insertModel(parentModel?: Model | null, newModel?: AnyModel<M>, targetModel?: Model | null, key?: string): M;

  removeModel(model: M): M | null;

  deleteModel(model: M): M | null;

  /** @internal @override */
  bindModel(model: Model, targetModel: Model | null): void;

  /** @internal @override */
  unbindModel(model: Model): void;

  /** @override */
  detectModel(model: Model): M | null;

  /** @internal @protected */
  key(model: M): string | undefined;
}

/** @public */
export const ModelSet = (function (_super: typeof ModelRelation) {
  const ModelSet: ModelSetFactory = _super.extend("ModelSet");

  Object.defineProperty(ModelSet.prototype, "familyType", {
    get: function (this: ModelSet): Class<ModelSet<any, any>> | null {
      return ModelSet;
    },
    configurable: true,
  });

  ModelSet.prototype.hasModel = function (this: ModelSet, model: Model): boolean {
    return this.models[model.uid] !== void 0;
  };

  ModelSet.prototype.addModel = function <M extends Model>(this: ModelSet<unknown, M>, newModel?: AnyModel<M>, targetModel?: Model | null, key?: string): M {
    if (newModel !== void 0 && newModel !== null) {
      newModel = this.fromAny(newModel);
    } else {
      newModel = this.createModel();
    }
    if (targetModel === void 0) {
      targetModel = null;
    }
    let parentModel: Model | null;
    if (this.binds && (parentModel = this.parentModel, parentModel !== null)) {
      if (key === void 0) {
        key = this.key(newModel);
      }
      this.insertChild(parentModel, newModel, targetModel, key);
    }
    const models = this.models as {[modelId: number]: M | undefined};
    if (models[newModel.uid] === void 0) {
      this.willAttachModel(newModel, targetModel);
      models[newModel.uid] = newModel;
      (this as Mutable<typeof this>).modelCount += 1;
      this.onAttachModel(newModel, targetModel);
      this.initModel(newModel);
      this.didAttachModel(newModel, targetModel);
    }
    return newModel;
  };

  ModelSet.prototype.attachModel = function <M extends Model>(this: ModelSet<unknown, M>, newModel?: AnyModel<M>, targetModel?: Model | null): M {
    if (newModel !== void 0 && newModel !== null) {
      newModel = this.fromAny(newModel);
    } else {
      newModel = this.createModel();
    }
    const models = this.models as {[modelId: number]: M | undefined};
    if (models[newModel.uid] === void 0) {
      if (targetModel === void 0) {
        targetModel = null;
      }
      this.willAttachModel(newModel, targetModel);
      models[newModel.uid] = newModel;
      (this as Mutable<typeof this>).modelCount += 1;
      this.onAttachModel(newModel, targetModel);
      this.initModel(newModel);
      this.didAttachModel(newModel, targetModel);
    }
    return newModel;
  };

  ModelSet.prototype.detachModel = function <M extends Model>(this: ModelSet<unknown, M>, oldModel: M): M | null {
    const models = this.models as {[modelId: number]: M | undefined};
    if (models[oldModel.uid] !== void 0) {
      this.willDetachModel(oldModel);
      (this as Mutable<typeof this>).modelCount -= 1;
      delete models[oldModel.uid];
      this.onDetachModel(oldModel);
      this.deinitModel(oldModel);
      this.didDetachModel(oldModel);
      return oldModel;
    }
    return null;
  };

  ModelSet.prototype.insertModel = function <M extends Model>(this: ModelSet<unknown, M>, parentModel?: Model | null, newModel?: AnyModel<M>, targetModel?: Model | null, key?: string): M {
    if (newModel !== void 0 && newModel !== null) {
      newModel = this.fromAny(newModel);
    } else {
      newModel = this.createModel();
    }
    if (parentModel === void 0 || parentModel === null) {
      parentModel = this.parentModel;
    }
    if (targetModel === void 0) {
      targetModel = null;
    }
    if (key === void 0) {
      key = this.key(newModel);
    }
    if (parentModel !== null && (newModel.parent !== parentModel || newModel.key !== key)) {
      this.insertChild(parentModel, newModel, targetModel, key);
    }
    const models = this.models as {[modelId: number]: M | undefined};
    if (models[newModel.uid] === void 0) {
      this.willAttachModel(newModel, targetModel);
      models[newModel.uid] = newModel;
      (this as Mutable<typeof this>).modelCount += 1;
      this.onAttachModel(newModel, targetModel);
      this.initModel(newModel);
      this.didAttachModel(newModel, targetModel);
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

  ModelSet.prototype.bindModel = function <M extends Model>(this: ModelSet<unknown, M>, model: Model, targetModel: Model | null): void {
    if (this.binds) {
      const newModel = this.detectModel(model);
      const models = this.models as {[modelId: number]: M | undefined};
      if (newModel !== null && models[newModel.uid] === void 0) {
        this.willAttachModel(newModel, targetModel);
        models[newModel.uid] = newModel;
        (this as Mutable<typeof this>).modelCount += 1;
        this.onAttachModel(newModel, targetModel);
        this.initModel(newModel);
        this.didAttachModel(newModel, targetModel);
      }
    }
  };

  ModelSet.prototype.unbindModel = function <M extends Model>(this: ModelSet<unknown, M>, model: Model): void {
    if (this.binds) {
      const oldModel = this.detectModel(model);
      const models = this.models as {[modelId: number]: M | undefined};
      if (oldModel !== null && models[oldModel.uid] !== void 0) {
        this.willDetachModel(oldModel);
        (this as Mutable<typeof this>).modelCount -= 1;
        delete models[oldModel.uid];
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
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;

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
      return fastener;
    };

    return fastenerClass;
  };

  return ModelSet;
})(ModelRelation);
