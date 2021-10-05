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

import {Mutable, Class, FromAny, ObserverType} from "@swim/util";
import {FastenerOwner, FastenerInit, FastenerClass, Fastener} from "@swim/fastener";
import {AnyModelFactory, Model} from "./Model";

export type ModelFastenerType<F extends ModelFastener<any, any, any>> =
  F extends ModelFastener<any, infer M, any> ? M : never;

export type ModelFastenerInitType<F extends ModelFastener<any, any, any>> =
  F extends ModelFastener<any, any, infer U> ? U : never;

export interface ModelFastenerInit<M extends Model = Model, U = never> extends FastenerInit {
  key?: string | boolean;
  type?: AnyModelFactory<M, U>;
  child?: boolean;
  observes?: boolean;

  willSetModel?(newModel: M | null, oldModel: M | null, target: Model | null): void;
  onSetModel?(newModel: M | null, oldModel: M | null, target: Model | null): void;
  didSetModel?(newModel: M | null, oldModel: M | null, target: Model | null): void;

  parentModel?: Model | null;
  createModel?(): M | null;
  insertModel?(parent: Model, child: M, target: Model | null, key: string | undefined): void;
  fromAny?(value: M | U): M | null;
}

export type ModelFastenerDescriptor<O = unknown, M extends Model = Model, U = never, I = {}> = ThisType<ModelFastener<O, M, U> & I> & ModelFastenerInit<M, U> & Partial<I>;

export interface ModelFastenerClass<F extends ModelFastener<any, any> = ModelFastener<any, any, any>> extends FastenerClass<F> {
  create(this: ModelFastenerClass<F>, owner: FastenerOwner<F>, fastenerName: string): F;

  construct(fastenerClass: ModelFastenerClass, fastener: F | null, owner: FastenerOwner<F>, fastenerName: string): F;

  extend(this: ModelFastenerClass<F>, classMembers?: {} | null): ModelFastenerClass<F>;

  define<O, M extends Model = Model, U = never, I = {}>(descriptor: {extends: ModelFastenerClass | null, observes: boolean} & ModelFastenerDescriptor<O, M, U, I & ObserverType<M>>): ModelFastenerClass<ModelFastener<any, M, U> & I>;
  define<O, M extends Model = Model, U = never, I = {}>(descriptor: {extends: ModelFastenerClass | null} & ModelFastenerDescriptor<O, M, U, I>): ModelFastenerClass<ModelFastener<any, M, U> & I>;
  define<O, M extends Model = Model, U = never>(descriptor: {observes: boolean} & ModelFastenerDescriptor<O, M, U, ObserverType<M>>): ModelFastenerClass<ModelFastener<any, M, U>>;
  define<O, M extends Model = Model, U = never>(descriptor: ModelFastenerDescriptor<O, M, U>): ModelFastenerClass<ModelFastener<any, M, U>>;

  <O, M extends Model = Model, U = never, I = {}>(descriptor: {extends: ModelFastenerClass | null, observes: boolean} & ModelFastenerDescriptor<O, M, U, I & ObserverType<M>>): PropertyDecorator;
  <O, M extends Model = Model, U = never, I = {}>(descriptor: {extends: ModelFastenerClass | null} & ModelFastenerDescriptor<O, M, U, I>): PropertyDecorator;
  <O, M extends Model = Model, U = never>(descriptor: {observes: boolean} & ModelFastenerDescriptor<O, M, U, ObserverType<M>>): PropertyDecorator;
  <O, M extends Model = Model, U = never>(descriptor: ModelFastenerDescriptor<O, M, U>): PropertyDecorator;
}

export interface ModelFastener<O = unknown, M extends Model = Model, U = never> extends Fastener<O> {
  (): M | null;
  (model: M | U | null, target?: Model | null): O;

  /** @override */
  get familyType(): Class<ModelFastener<any, any, any>> | null;

  /** @protected @override */
  onInherit(superFastener: Fastener): void;

  readonly model: M | null;

  getModel(): M;

  setModel(newModel: M | U | null, target?: Model | null): M | null;

  /** @internal */
  setOwnModel(newModel: M | null, target: Model | null): void;

  /** @protected */
  attachModel(newModel: M): void;

  /** @protected */
  detachModel(oldModel: M): void;

  /** @protected */
  willSetModel(newModel: M | null, oldModel: M | null, target: Model | null): void;

  /** @protected */
  onSetModel(newModel: M | null, oldModel: M | null, target: Model | null): void;

  /** @protected */
  didSetModel(newModel: M | null, oldModel: M | null, target: Model | null): void;

  readonly key: string | undefined;

  /** @internal @protected */
  get parentModel(): Model | null;

  injectModel(parent?: Model | null, child?: M | U | null, target?: Model | null, key?: string | null): M | null;

  createModel(): M | null;

  /** @internal @protected */
  insertModel(parent: Model, child: M, target: Model | null, key: string | undefined): void;

  removeModel(): M | null;

  /** @internal @protected */
  fromAny(value: M | U): M | null;

  /** @internal @protected */
  get type(): AnyModelFactory<M, U> | undefined; // optional prototype property

  /** @internal @protected */
  get child(): boolean | undefined; // optional prototype property

  /** @internal @protected */
  get observes(): boolean | undefined; // optional prototype property
}

export const ModelFastener = (function (_super: typeof Fastener) {
  const ModelFastener = _super.extend() as ModelFastenerClass;

  Object.defineProperty(ModelFastener.prototype, "familyType", {
    get: function (this: ModelFastener): Class<ModelFastener<any, any, any>> | null {
      return ModelFastener;
    },
    configurable: true,
  });

  ModelFastener.prototype.onInherit = function (this: ModelFastener, superFastener: ModelFastener): void {
    this.setModel(superFastener.model);
  };

  ModelFastener.prototype.getModel = function <M extends Model>(this: ModelFastener<unknown, M>): M {
    const model = this.model;
    if (model === null) {
      throw new TypeError("null " + this.name + " model");
    }
    return model;
  };

  ModelFastener.prototype.setModel = function <M extends Model>(this: ModelFastener<unknown, M>, newModel: M | null, target?: Model | null): M | null {
    const oldModel = this.model;
    if (newModel !== null) {
      newModel = this.fromAny(newModel);
    }
    if (target === void 0) {
      target = null;
    }
    if (this.child === true) {
      if (newModel !== null && newModel.parent === null) {
        const parent = this.parentModel;
        if (parent !== null) {
          this.insertModel(parent, newModel, target, this.key);
        }
      } else if (newModel === null && oldModel !== null) {
        oldModel.remove();
      }
    }
    this.setOwnModel(newModel, target);
    return oldModel;
  };

  ModelFastener.prototype.setOwnModel = function <M extends Model>(this: ModelFastener<unknown, M>, newModel: M | null, target: Model | null): void {
    const oldModel = this.model;
    if (oldModel !== newModel) {
      this.willSetModel(newModel, oldModel, target);
      if (oldModel !== null) {
        this.detachModel(oldModel);
      }
      (this as Mutable<typeof this>).model = newModel;
      if (newModel !== null) {
        this.attachModel(newModel);
      }
      this.onSetModel(newModel, oldModel, target);
      this.didSetModel(newModel, oldModel, target);
    }
  };

  ModelFastener.prototype.attachModel = function <M extends Model>(this: ModelFastener<unknown, M>, newModel: M): void {
    if (this.observes === true) {
      newModel.observe(this as ObserverType<M>);
    }
  };

  ModelFastener.prototype.detachModel = function <M extends Model>(this: ModelFastener<unknown, M>, oldModel: M): void {
    if (this.observes === true) {
      oldModel.unobserve(this as ObserverType<M>);
    }
  };

  ModelFastener.prototype.willSetModel = function <M extends Model>(this: ModelFastener<unknown, M>, newModel: M | null, oldModel: M | null, target: Model | null): void {
    // hook
  };

  ModelFastener.prototype.onSetModel = function <M extends Model>(this: ModelFastener<unknown, M>, newModel: M | null, oldModel: M | null, target: Model | null): void {
    // hook
  };

  ModelFastener.prototype.didSetModel = function <M extends Model>(this: ModelFastener<unknown, M>, newModel: M | null, oldModel: M | null, target: Model | null): void {
    // hook
  };

  Object.defineProperty(ModelFastener.prototype, "parentModel", {
    get(this: ModelFastener): Model | null {
      const owner = this.owner;
      return owner instanceof Model ? owner : null;
    },
    configurable: true,
  });

  ModelFastener.prototype.injectModel = function <M extends Model>(this: ModelFastener<unknown, M>, parent?: Model | null, child?: M | null, target?: Model | null, key?: string | null): M | null {
    if (target === void 0) {
      target = null;
    }
    if (child === void 0 || child === null) {
      child = this.model;
      if (child === null) {
        child = this.createModel();
      }
    } else {
      child = this.fromAny(child);
      if (child !== null) {
        this.setOwnModel(child, target);
      }
    }
    if (child !== null) {
      if (parent === void 0 || parent === null) {
        parent = this.parentModel;
      }
      if (key === void 0) {
        key = this.key;
      } else if (key === null) {
        key = void 0;
      }
      if (parent !== null && (child.parent !== parent || child.key !== key)) {
        this.insertModel(parent, child, target, key);
      }
      if (this.model === null) {
        this.setOwnModel(child, target);
      }
    }
    return child;
  };

  ModelFastener.prototype.createModel = function <M extends Model, U>(this: ModelFastener<unknown, M, U>): M | null {
    const type = this.type;
    if (type !== void 0 && type.create !== void 0) {
      return type.create();
    }
    return null;
  };

  ModelFastener.prototype.insertModel = function <M extends Model>(this: ModelFastener<unknown, M>, parent: Model, child: M, target: Model | null, key: string | undefined): void {
    parent.insertChild(child, target, key);
  };

  ModelFastener.prototype.removeModel = function <M extends Model>(this: ModelFastener<unknown, M>): M | null {
    const model = this.model;
    if (model !== null) {
      model.remove();
    }
    return model;
  };

  ModelFastener.prototype.fromAny = function <M extends Model, U>(this: ModelFastener<unknown, M, U>, value: M | U): M | null {
    const type = this.type;
    if (FromAny.is<M, U>(type)) {
      return type.fromAny(value);
    } else if (value instanceof Model) {
      return value;
    }
    return null;
  };

  ModelFastener.construct = function <F extends ModelFastener<any, any, any>>(fastenerClass: ModelFastenerClass, fastener: F | null, owner: FastenerOwner<F>, fastenerName: string): F {
    if (fastener === null) {
      fastener = function ModelFastener(model?: ModelFastenerType<F> | ModelFastenerInitType<F> | null, target?: Model | null): ModelFastenerType<F> | null | FastenerOwner<F> {
        if (model === void 0) {
          return fastener!.model;
        } else {
          fastener!.setModel(model, target);
          return fastener!.owner;
        }
      } as F;
      Object.setPrototypeOf(fastener, fastenerClass.prototype);
    }
    fastener = _super.construct(fastenerClass, fastener, owner, fastenerName) as F;
    (fastener as Mutable<typeof fastener>).key = void 0;
    (fastener as Mutable<typeof fastener>).model = null;
    return fastener;
  };

  ModelFastener.define = function <O, M extends Model, U>(descriptor: ModelFastenerDescriptor<O, M, U>): ModelFastenerClass<ModelFastener<any, M, U>> {
    let superClass = descriptor.extends as ModelFastenerClass | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const key = descriptor.key;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.key;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(descriptor);

    fastenerClass.construct = function (fastenerClass: ModelFastenerClass, fastener: ModelFastener<O, M, U> | null, owner: O, fastenerName: string): ModelFastener<O, M, U> {
      fastener = superClass!.construct(fastenerClass, fastener, owner, fastenerName);
      if (affinity !== void 0) {
        fastener.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        fastener.initInherits(inherits);
      }
      if (typeof key === "string") {
        (fastener as Mutable<typeof fastener>).key = key;
      } else if (key === true) {
        (fastener as Mutable<typeof fastener>).key = fastenerName;
      }
      return fastener;
    };

    return fastenerClass;
  };

  return ModelFastener;
})(Fastener);
