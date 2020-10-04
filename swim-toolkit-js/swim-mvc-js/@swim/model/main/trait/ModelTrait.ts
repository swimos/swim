// Copyright 2015-2020 Swim inc.
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

import {__extends} from "tslib";
import {Model} from "../Model";
import {ModelObserverType} from "../ModelObserver";
import {ModelTraitObserver} from "./ModelTraitObserver";

export interface ModelTraitInit {
  extends?: ModelTraitPrototype;
  observe?: boolean;
}

export type ModelTraitDescriptorInit<M extends Model, I = ModelObserverType<M>> = ModelTraitInit & ThisType<ModelTrait<M> & I> & I;

export type ModelTraitDescriptorExtends<M extends Model, I = ModelObserverType<M>> = {extends: ModelTraitPrototype | undefined} & ModelTraitDescriptorInit<M, I>;

export type ModelTraitDescriptor<M extends Model, I = ModelObserverType<M>> = ModelTraitDescriptorInit<M, I>;

export type ModelTraitPrototype = Function & {prototype: ModelTrait<any>};

export type ModelTraitConstructor<M extends Model, I = ModelObserverType<M>> = {
  new(model: M, traitName: string | undefined): ModelTrait<M> & I;
  prototype: ModelTrait<any> & I;
};

export declare abstract class ModelTrait<M extends Model> {
  /** @hidden */
  _model: M;

  constructor(model: M, traitName: string | undefined);

  get name(): string | undefined;

  get model(): M;

  /** @hidden */
  mount(): void;

  /** @hidden */
  unmount(): void;

  static define<M extends Model, I = ModelObserverType<M>>(descriptor: ModelTraitDescriptorExtends<M, I>): ModelTraitConstructor<M, I>;
  static define<M extends Model>(descriptor: ModelTraitDescriptor<M>): ModelTraitConstructor<M>;

  // Forward type declarations
  /** @hidden */
  static Observer: typeof ModelTraitObserver; // defined by ModelTraitObserver
}

export interface ModelTrait<M extends Model> {
}

export function ModelTrait<M extends Model, I = ModelObserverType<M>>(descriptor: ModelTraitDescriptorExtends<M, I>): PropertyDecorator;
export function ModelTrait<M extends Model>(descriptor: ModelTraitDescriptor<M>): PropertyDecorator;

export function ModelTrait<M extends Model>(
    this: ModelTrait<M> | typeof ModelTrait,
    model: M | ModelTraitDescriptor<M>,
    traitName?: string
  ): ModelTrait<M> | PropertyDecorator {
  if (this instanceof ModelTrait) { // constructor
    return ModelTraitConstructor.call(this, model as M, traitName);
  } else { // decorator factory
    return ModelTraitDecoratorFactory(model as ModelTraitDescriptor<M>);
  }
}
__extends(ModelTrait, Object);
Model.Trait = ModelTrait;

function ModelTraitConstructor<M extends Model>(this: ModelTrait<M>, model: M, traitName: string | undefined): ModelTrait<M> {
  Object.defineProperty(this, "name", {
    value: traitName,
    enumerable: true,
    configurable: true,
  });
  this._model = model;
  return this;
}

function ModelTraitDecoratorFactory<M extends Model>(descriptor: ModelTraitDescriptor<M>): PropertyDecorator {
  return Model.decorateModelTrait.bind(Model, ModelTrait.define(descriptor));
}

Object.defineProperty(ModelTrait.prototype, "model", {
  get: function <M extends Model>(this: ModelTrait<M>): M {
    return this._model;
  },
  enumerable: true,
  configurable: true,
});

ModelTrait.prototype.mount = function (this: ModelTrait<Model>): void {
  // hook
};

ModelTrait.prototype.unmount = function (this: ModelTrait<Model>): void {
  // hook
};

ModelTrait.define = function <M extends Model, I>(descriptor: ModelTraitDescriptor<M, I>): ModelTraitConstructor<M, I> {
  let _super = descriptor.extends;
  delete descriptor.extends;

  if (_super === void 0) {
    if (descriptor.observe !== false) {
      _super = ModelTrait.Observer;
    } else {
      _super = ModelTrait;
    }
  }

  const _constructor = function ModelTraitAccessor(this: ModelTrait<M>, model: M, traitName: string | undefined): ModelTrait<M> {
    const _this = _super!.call(this, model, traitName) || this;
    return _this;
  } as unknown as ModelTraitConstructor<M, I>;

  const _prototype = descriptor as unknown as ModelTrait<M> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};
