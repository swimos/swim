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

import type {Proto, ObserverType} from "@swim/util";
import {FastenerOwner, FastenerInit, FastenerClass, Fastener} from "@swim/component";
import {AnyModel, ModelFactory, Model} from "./Model";
import {Trait} from "../"; // forward import

/** @internal */
export type ModelRelationType<F extends ModelRelation<any, any>> =
  F extends ModelRelation<any, infer M> ? M : never;

/** @public */
export interface ModelRelationInit<M extends Model = Model> extends FastenerInit {
  extends?: {prototype: ModelRelation<any, any>} | string | boolean | null;
  type?: ModelFactory<M>;
  binds?: boolean;
  observes?: boolean;

  initModel?(model: M): void;
  willAttachModel?(model: M, target: Model | null): void;
  didAttachModel?(model: M, target: Model | null): void;

  deinitModel?(model: M): void;
  willDetachModel?(model: M): void;
  didDetachModel?(model: M): void;

  parentModel?: Model | null;
  insertChild?(parent: Model, child: M, target: Model | null, key: string | undefined): void;

  detectModel?(model: Model): M | null;
  createModel?(): M;
  fromAny?(value: AnyModel<M>): M;
}

/** @public */
export type ModelRelationDescriptor<O = unknown, M extends Model = Model, I = {}> = ThisType<ModelRelation<O, M> & I> & ModelRelationInit<M> & Partial<I>;

/** @public */
export interface ModelRelationClass<F extends ModelRelation<any, any> = ModelRelation<any, any>> extends FastenerClass<F> {
}

/** @public */
export interface ModelRelationFactory<F extends ModelRelation<any, any> = ModelRelation<any, any>> extends ModelRelationClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): ModelRelationFactory<F> & I;

  define<O, M extends Model = Model>(className: string, descriptor: ModelRelationDescriptor<O, M>): ModelRelationFactory<ModelRelation<any, M>>;
  define<O, M extends Model = Model>(className: string, descriptor: {observes: boolean} & ModelRelationDescriptor<O, M, ObserverType<M>>): ModelRelationFactory<ModelRelation<any, M>>;
  define<O, M extends Model = Model, I = {}>(className: string, descriptor: {implements: unknown} & ModelRelationDescriptor<O, M, I>): ModelRelationFactory<ModelRelation<any, M> & I>;
  define<O, M extends Model = Model, I = {}>(className: string, descriptor: {implements: unknown; observes: boolean} & ModelRelationDescriptor<O, M, I & ObserverType<M>>): ModelRelationFactory<ModelRelation<any, M> & I>;

  <O, M extends Model = Model>(descriptor: ModelRelationDescriptor<O, M>): PropertyDecorator;
  <O, M extends Model = Model>(descriptor: {observes: boolean} & ModelRelationDescriptor<O, M, ObserverType<M>>): PropertyDecorator;
  <O, M extends Model = Model, I = {}>(descriptor: {implements: unknown} & ModelRelationDescriptor<O, M, I>): PropertyDecorator;
  <O, M extends Model = Model, I = {}>(descriptor: {implements: unknown; observes: boolean} & ModelRelationDescriptor<O, M, I & ObserverType<M>>): PropertyDecorator;
}

/** @public */
export interface ModelRelation<O = unknown, M extends Model = Model> extends Fastener<O> {
  /** @override */
  get fastenerType(): Proto<ModelRelation<any, any>>;

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

  /** @internal @protected */
  get type(): ModelFactory<M> | undefined; // optional prototype property

  /** @internal @protected */
  get binds(): boolean | undefined; // optional prototype property

  /** @internal @protected */
  get observes(): boolean | undefined; // optional prototype property

  /** @internal @override */
  get lazy(): boolean; // prototype property

  /** @internal @override */
  get static(): string | boolean; // prototype property
}

/** @public */
export const ModelRelation = (function (_super: typeof Fastener) {
  const ModelRelation: ModelRelationFactory = _super.extend("ModelRelation");

  Object.defineProperty(ModelRelation.prototype, "fastenerType", {
    get: function (this: ModelRelation): Proto<ModelRelation<any, any>> {
      return ModelRelation;
    },
    configurable: true,
  });

  ModelRelation.prototype.initModel = function <M extends Model>(this: ModelRelation<unknown, M>, model: M): void {
    // hook
  };

  ModelRelation.prototype.willAttachModel = function <M extends Model>(this: ModelRelation<unknown, M>, model: M, target: Model | null): void {
    // hook
  };

  ModelRelation.prototype.onAttachModel = function <M extends Model>(this: ModelRelation<unknown, M>, model: M, target: Model | null): void {
    if (this.observes === true) {
      model.observe(this as ObserverType<M>);
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
    if (this.observes === true) {
      model.unobserve(this as ObserverType<M>);
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
    const type = this.type;
    if (type !== void 0) {
      model = type.create();
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
    const type = this.type;
    if (type !== void 0) {
      return type.fromAny(value);
    } else {
      return Model.fromAny(value) as M;
    }
  };

  Object.defineProperty(ModelRelation.prototype, "lazy", {
    get: function (this: ModelRelation): boolean {
      return false;
    },
    configurable: true,
  });

  Object.defineProperty(ModelRelation.prototype, "static", {
    get: function (this: ModelRelation): string | boolean {
      return true;
    },
    configurable: true,
  });

  ModelRelation.construct = function <F extends ModelRelation<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    return fastener;
  };

  ModelRelation.define = function <O, M extends Model>(className: string, descriptor: ModelRelationDescriptor<O, M>): ModelRelationFactory<ModelRelation<any, M>> {
    let superClass = descriptor.extends as ModelRelationFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    delete descriptor.extends;
    delete descriptor.implements;
    delete descriptor.affinity;
    delete descriptor.inherits;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: ModelRelation<any, any>}, fastener: ModelRelation<O, M> | null, owner: O): ModelRelation<O, M> {
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

  return ModelRelation;
})(Fastener);
