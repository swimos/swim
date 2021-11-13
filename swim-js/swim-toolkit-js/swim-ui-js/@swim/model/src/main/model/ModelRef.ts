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
import type {FastenerOwner, Fastener} from "@swim/fastener";
import type {AnyModel, Model} from "./Model";
import {ModelRelationInit, ModelRelationClass, ModelRelation} from "./ModelRelation";

export type ModelRefType<F extends ModelRef<any, any>> =
  F extends ModelRef<any, infer M> ? M : never;

export interface ModelRefInit<M extends Model = Model> extends ModelRelationInit<M> {
  extends?: {prototype: ModelRef<any, any>} | string | boolean | null;
  key?: string | boolean;
}

export type ModelRefDescriptor<O = unknown, M extends Model = Model, I = {}> = ThisType<ModelRef<O, M> & I> & ModelRefInit<M> & Partial<I>;

export interface ModelRefClass<F extends ModelRef<any, any> = ModelRef<any, any>> extends ModelRelationClass<F> {
}

export interface ModelRefFactory<F extends ModelRef<any, any> = ModelRef<any, any>> extends ModelRefClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): ModelRefFactory<F> & I;

  define<O, M extends Model = Model>(className: string, descriptor: ModelRefDescriptor<O, M>): ModelRefFactory<ModelRef<any, M>>;
  define<O, M extends Model = Model>(className: string, descriptor: {observes: boolean} & ModelRefDescriptor<O, M, ObserverType<M>>): ModelRefFactory<ModelRef<any, M>>;
  define<O, M extends Model = Model, I = {}>(className: string, descriptor: ModelRefDescriptor<O, M, I>): ModelRefFactory<ModelRef<any, M> & I>;
  define<O, M extends Model = Model, I = {}>(className: string, descriptor: {observes: boolean} & ModelRefDescriptor<O, M, I & ObserverType<M>>): ModelRefFactory<ModelRef<any, M> & I>;

  <O, M extends Model = Model>(descriptor: ModelRefDescriptor<O, M>): PropertyDecorator;
  <O, M extends Model = Model>(descriptor: {observes: boolean} & ModelRefDescriptor<O, M, ObserverType<M>>): PropertyDecorator;
  <O, M extends Model = Model, I = {}>(descriptor: ModelRefDescriptor<O, M, I>): PropertyDecorator;
  <O, M extends Model = Model, I = {}>(descriptor: {observes: boolean} & ModelRefDescriptor<O, M, I & ObserverType<M>>): PropertyDecorator;
}

export interface ModelRef<O = unknown, M extends Model = Model> extends ModelRelation<O, M> {
  (): M | null;
  (model: AnyModel<M> | null, targetModel?: Model | null, key?: string): O;

  /** @override */
  get familyType(): Class<ModelRef<any, any>> | null;

  /** @protected @override */
  onInherit(superFastener: Fastener): void;

  readonly model: M | null;

  getModel(): M;

  setModel(newModel: AnyModel<M> | null, targetModel?: Model | null, key?: string): M | null;

  attachModel(model?: AnyModel<M>, targetModel?: Model | null): M;

  detachModel(): M | null;

  insertModel(parentModel?: Model | null, newModel?: AnyModel<M>, targetModel?: Model | null, key?: string): M;

  removeModel(): M | null;

  deleteModel(): M | null;

  /** @internal @override */
  bindModel(model: Model, targetModel: Model | null): void;

  /** @internal @override */
  unbindModel(model: Model): void;

  /** @override */
  detectModel(model: Model): M | null;

  /** @internal */
  get key(): string | undefined; // optional prototype field
}

export const ModelRef = (function (_super: typeof ModelRelation) {
  const ModelRef: ModelRefFactory = _super.extend("ModelRef");

  Object.defineProperty(ModelRef.prototype, "familyType", {
    get: function (this: ModelRef): Class<ModelRef<any, any>> | null {
      return ModelRef;
    },
    configurable: true,
  });

  ModelRef.prototype.onInherit = function (this: ModelRef, superFastener: ModelRef): void {
    this.setModel(superFastener.model);
  };

  ModelRef.prototype.getModel = function <M extends Model>(this: ModelRef<unknown, M>): M {
    const model = this.model;
    if (model === null) {
      let message = model + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "model";
      throw new TypeError(message);
    }
    return model;
  };

  ModelRef.prototype.setModel = function <M extends Model>(this: ModelRef<unknown, M>, newModel: AnyModel<M> | null, targetModel?: Model | null, key?: string): M | null {
    if (newModel !== null) {
      newModel = this.fromAny(newModel);
    }
    let oldModel = this.model;
    if (oldModel !== newModel) {
      if (targetModel === void 0) {
        targetModel = null;
      }
      let parentModel: Model | null;
      if (this.binds && (parentModel = this.parentModel, parentModel !== null)) {
        if (oldModel !== null && oldModel.parent === parentModel) {
          if (targetModel === null) {
            targetModel = parentModel.nextChild(oldModel);
          }
          oldModel.remove();
        }
        if (newModel !== null) {
          if (key === void 0) {
            key = this.key;
          }
          this.insertChild(parentModel, newModel, targetModel, key);
        }
        oldModel = this.model;
      }
      if (oldModel !== newModel) {
        if (oldModel !== null) {
          this.willDetachModel(oldModel);
          (this as Mutable<typeof this>).model = null;
          this.onDetachModel(oldModel);
          this.deinitModel(oldModel);
          this.didDetachModel(oldModel);
        }
        if (newModel !== null) {
          this.willAttachModel(newModel, targetModel);
          (this as Mutable<typeof this>).model = newModel;
          this.onAttachModel(newModel, targetModel);
          this.initModel(newModel);
          this.didAttachModel(newModel, targetModel);
        }
      }
    }
    return oldModel;
  };

  ModelRef.prototype.attachModel = function <M extends Model>(this: ModelRef<unknown, M>, newModel?: AnyModel<M>, targetModel?: Model | null): M {
    const oldModel = this.model;
    if (newModel !== void 0 && newModel !== null) {
      newModel = this.fromAny(newModel);
    } else if (oldModel === null) {
      newModel = this.createModel();
    } else {
      newModel = oldModel;
    }
    if (newModel !== oldModel) {
      if (targetModel === void 0) {
        targetModel = null;
      }
      if (oldModel !== null) {
        this.willDetachModel(oldModel);
        (this as Mutable<typeof this>).model = null;
        this.onDetachModel(oldModel);
        this.deinitModel(oldModel);
        this.didDetachModel(oldModel);
      }
      this.willAttachModel(newModel, targetModel);
      (this as Mutable<typeof this>).model = newModel;
      this.onAttachModel(newModel, targetModel);
      this.initModel(newModel);
      this.didAttachModel(newModel, targetModel);
    }
    return newModel;
  };

  ModelRef.prototype.detachModel = function <M extends Model>(this: ModelRef<unknown, M>): M | null {
    const oldModel = this.model;
    if (oldModel !== null) {
      this.willDetachModel(oldModel);
      (this as Mutable<typeof this>).model = null;
      this.onDetachModel(oldModel);
      this.deinitModel(oldModel);
      this.didDetachModel(oldModel);
    }
    return oldModel;
  };

  ModelRef.prototype.insertModel = function <M extends Model>(this: ModelRef<unknown, M>, parentModel?: Model | null, newModel?: AnyModel<M>, targetModel?: Model | null, key?: string): M {
    if (newModel !== void 0 && newModel !== null) {
      newModel = this.fromAny(newModel);
    } else {
      const oldModel = this.model;
      if (oldModel === null) {
        newModel = this.createModel();
      } else {
        newModel = oldModel;
      }
    }
    if (parentModel === void 0 || parentModel === null) {
      parentModel = this.parentModel;
    }
    if (targetModel === void 0) {
      targetModel = null;
    }
    if (key === void 0) {
      key = this.key;
    }
    if (parentModel !== null && (newModel.parent !== parentModel || newModel.key !== key)) {
      this.insertChild(parentModel, newModel, targetModel, key);
    }
    const oldModel = this.model;
    if (newModel !== oldModel) {
      if (oldModel !== null) {
        this.willDetachModel(oldModel);
        (this as Mutable<typeof this>).model = null;
        this.onDetachModel(oldModel);
        this.deinitModel(oldModel);
        this.didDetachModel(oldModel);
        oldModel.remove();
      }
      this.willAttachModel(newModel, targetModel);
      (this as Mutable<typeof this>).model = newModel;
      this.onAttachModel(newModel, targetModel);
      this.initModel(newModel);
      this.didAttachModel(newModel, targetModel);
    }
    return newModel;
  };

  ModelRef.prototype.removeModel = function <M extends Model>(this: ModelRef<unknown, M>): M | null {
    const model = this.model;
    if (model !== null) {
      model.remove();
    }
    return model;
  };

  ModelRef.prototype.deleteModel = function <M extends Model>(this: ModelRef<unknown, M>): M | null {
    const model = this.detachModel();
    if (model !== null) {
      model.remove();
    }
    return model;
  };

  ModelRef.prototype.bindModel = function <M extends Model>(this: ModelRef<unknown, M>, model: Model, targetModel: Model | null): void {
    if (this.binds && this.model === null) {
      const newModel = this.detectModel(model);
      if (newModel !== null) {
        this.willAttachModel(newModel, targetModel);
        (this as Mutable<typeof this>).model = newModel;
        this.onAttachModel(newModel, targetModel);
        this.initModel(newModel);
        this.didAttachModel(newModel, targetModel);
      }
    }
  };

  ModelRef.prototype.unbindModel = function <M extends Model>(this: ModelRef<unknown, M>, model: Model): void {
    if (this.binds) {
      const oldModel = this.detectModel(model);
      if (oldModel !== null && this.model === oldModel) {
        this.willDetachModel(oldModel);
        (this as Mutable<typeof this>).model = null;
        this.onDetachModel(oldModel);
        this.deinitModel(oldModel);
        this.didDetachModel(oldModel);
      }
    }
  };

  ModelRef.prototype.detectModel = function <M extends Model>(this: ModelRef<unknown, M>, model: Model): M | null {
    const key = this.key;
    if (key !== void 0 && key === model.key) {
      return model as M;
    }
    return null;
  };

  ModelRef.construct = function <F extends ModelRef<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (model?: AnyModel<ModelRefType<F>> | null, targetModel?: Model | null, key?: string): ModelRefType<F> | null | FastenerOwner<F> {
        if (model === void 0) {
          return fastener!.model;
        } else {
          fastener!.setModel(model, targetModel, key);
          return fastener!.owner;
        }
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, fastenerClass.prototype);
    }
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).model = null;
    return fastener;
  };

  ModelRef.define = function <O, M extends Model>(className: string, descriptor: ModelRefDescriptor<O, M>): ModelRefFactory<ModelRef<any, M>> {
    let superClass = descriptor.extends as ModelRefFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;

    if (descriptor.key === true) {
      Object.defineProperty(descriptor, "key", {
        value: className,
        configurable: true,
      });
    } else if (descriptor.key === false) {
      Object.defineProperty(descriptor, "key", {
        value: void 0,
        configurable: true,
      });
    }

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: ModelRef<any, any>}, fastener: ModelRef<O, M> | null, owner: O): ModelRef<O, M> {
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

  return ModelRef;
})(ModelRelation);
