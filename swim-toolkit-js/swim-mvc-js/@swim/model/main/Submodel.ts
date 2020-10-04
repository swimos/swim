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
import {FromAny} from "@swim/util";
import {Model} from "./Model";
import {ModelObserverType} from "./ModelObserver";
import {SubmodelObserver} from "./SubmodelObserver";

export type SubmodelMemberType<M, K extends keyof M> =
  M extends {[P in K]: Submodel<any, infer S, any>} ? S : unknown;

export type SubmodelMemberInit<M, K extends keyof M> =
  M extends {[P in K]: Submodel<any, infer T, infer U>} ? T | U : unknown;

export interface SubmodelInit<S extends Model, U = S> {
  extends?: SubmodelPrototype;
  observe?: boolean;
  child?: boolean;
  type?: unknown;

  willSetSubmodel?(newSubmodel: S | null, oldSubmodel: S | null): void;
  onSetSubmodel?(newSubmodel: S | null, oldSubmodel: S | null): void;
  didSetSubmodel?(newSubmodel: S | null, oldSubmodel: S | null): void;
  createSubmodel?(): S | U | null;
  fromAny?(value: S | U): S | null;
}

export type SubmodelDescriptorInit<M extends Model, S extends Model, U = S, I = ModelObserverType<S>> = SubmodelInit<S, U> & ThisType<Submodel<M, S, U> & I> & I;

export type SubmodelDescriptorExtends<M extends Model, S extends Model, U = S, I = ModelObserverType<S>> = {extends: SubmodelPrototype | undefined} & SubmodelDescriptorInit<M, S, U, I>;

export type SubmodelDescriptorFromAny<M extends Model, S extends Model, U = S, I = ModelObserverType<S>> = ({type: FromAny<S, U>} | {fromAny(value: S | U): S | null}) & SubmodelDescriptorInit<M, S, U, I>;

export type SubmodelDescriptor<M extends Model, S extends Model, U = S, I = ModelObserverType<S>> =
  U extends S ? SubmodelDescriptorInit<M, S, U, I> :
  SubmodelDescriptorFromAny<M, S, U, I>;

export type SubmodelPrototype = Function & {prototype: Submodel<any, any>};

export type SubmodelConstructor<M extends Model, S extends Model, U = S, I = ModelObserverType<S>> = {
  new(model: M, submodelName: string | undefined): Submodel<M, S, U> & I;
  prototype: Submodel<any, any, any> & I;
};

export declare abstract class Submodel<M extends Model, S extends Model, U = S> {
  /** @hidden */
  _model: M;
  /** @hidden */
  _submodel: S | null;

  constructor(model: M, submodelName: string | undefined);

  /** @hidden */
  child: boolean;

  /** @hidden */
  readonly type?: unknown;

  get name(): string;

  get model(): M;

  get submodel(): S | null;

  getSubmodel(): S;

  setSubmodel(submodel: S | U | null): void;

  /** @hidden */
  doSetSubmodel(newSubmodel: S | null): void;

  /** @hidden */
  willSetSubmodel(newSubmodel: S | null, oldSubmodel: S | null): void;

  /** @hidden */
  onSetSubmodel(newSubmodel: S | null, oldSubmodel: S | null): void;

  /** @hidden */
  didSetSubmodel(newSubmodel: S | null, oldSubmodel: S | null): void;

  /** @hidden */
  willSetOwnSubmodel(newSubmodel: S | null, oldSubmodel: S | null): void;

  /** @hidden */
  onSetOwnSubmodel(newSubmodel: S | null, oldSubmodel: S | null): void;

  /** @hidden */
  didSetOwnSubmodel(newSubmodel: S | null, oldSubmodel: S | null): void;

  /** @hidden */
  mount(): void;

  /** @hidden */
  unmount(): void;

  insert(parentModel: Model, key?: string): S | null;
  insert(key?: string): S | null;

  remove(): S | null;

  createSubmodel(): S | U | null;

  fromAny(value: S | U): S | null;

  static define<M extends Model, S extends Model = Model, U = S, I = ModelObserverType<S>>(descriptor: SubmodelDescriptorExtends<M, S, U, I>): SubmodelConstructor<M, S, U>;
  static define<M extends Model, S extends Model = Model, U = S>(descriptor: SubmodelDescriptor<M, S, U>): SubmodelConstructor<M, S, U>;

  // Forward type declarations
  /** @hidden */
  static Observer: typeof SubmodelObserver; // defined by SubmodelObserver
}

export interface Submodel<M extends Model, S extends Model, U = S> {
  (): S | null;
  (submodel: S | U | null): M;
}

export function Submodel<M extends Model, S extends Model = Model, U = S, I = ModelObserverType<S>>(descriptor: SubmodelDescriptorExtends<M, S, U, I>): PropertyDecorator;
export function Submodel<M extends Model, S extends Model = Model, U = S>(descriptor: SubmodelDescriptor<M, S, U>): PropertyDecorator;

export function Submodel<M extends Model, S extends Model, U>(
    this: Submodel<M, S> | typeof Submodel,
    model: M | SubmodelDescriptor<M, S, U>,
    submodelName?: string,
  ): Submodel<M, S> | PropertyDecorator {
  if (this instanceof Submodel) { // constructor
    return SubmodelConstructor.call(this, model as M, submodelName);
  } else { // decorator factory
    return SubmodelDecoratorFactory(model as SubmodelDescriptor<M, S, U>);
  }
}
__extends(Submodel, Object);
Model.Submodel = Submodel;

function SubmodelConstructor<M extends Model, S extends Model, U>(this: Submodel<M, S, U>, model: M, submodelName: string | undefined): Submodel<M, S, U> {
  if (submodelName !== void 0) {
    Object.defineProperty(this, "name", {
      value: submodelName,
      enumerable: true,
      configurable: true,
    });
  }
  this._model = model;
  this._submodel = null;
  return this;
}

function SubmodelDecoratorFactory<M extends Model, S extends Model, U>(descriptor: SubmodelDescriptor<M, S, U>): PropertyDecorator {
  return Model.decorateSubmodel.bind(Model, Submodel.define(descriptor));
}

Object.defineProperty(Submodel.prototype, "model", {
  get: function <M extends Model>(this: Submodel<M, Model>): M {
    return this._model;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(Submodel.prototype, "submodel", {
  get: function <S extends Model>(this: Submodel<Model, S>): S | null {
    return this._submodel;
  },
  enumerable: true,
  configurable: true,
});

Submodel.prototype.getSubmodel = function <S extends Model>(this: Submodel<Model, S>): S {
  const submodel = this.submodel;
  if (submodel === null) {
    throw new TypeError("null " + this.name + " submodel");
  }
  return submodel;
};

Submodel.prototype.setSubmodel = function <S extends Model, U>(this: Submodel<Model, S, U>,
                                                               submodel: S | U | null): void {
  if (submodel !== null) {
    submodel = this.fromAny(submodel);
  }
  if (this.child) {
    this._model.setChildModel(this.name, submodel as S | null);
  } else {
    this.doSetSubmodel(submodel as S | null);
  }
};

Submodel.prototype.doSetSubmodel = function <S extends Model>(this: Submodel<Model, S>,
                                                              newSubmodel: S | null): void {
  const oldSubmodel = this._submodel;
  if (oldSubmodel !== newSubmodel) {
    this.willSetOwnSubmodel(newSubmodel, oldSubmodel);
    this.willSetSubmodel(newSubmodel, oldSubmodel);
    this._submodel = newSubmodel;
    this.onSetOwnSubmodel(newSubmodel, oldSubmodel);
    this.onSetSubmodel(newSubmodel, oldSubmodel);
    this.didSetSubmodel(newSubmodel, oldSubmodel);
    this.didSetOwnSubmodel(newSubmodel, oldSubmodel);
  }
};

Submodel.prototype.willSetSubmodel = function <S extends Model>(this: Submodel<Model, S>,
                                                                newSubmodel: S | null,
                                                                oldSubmodel: S | null): void {
  // hook
};

Submodel.prototype.onSetSubmodel = function <S extends Model>(this: Submodel<Model, S>,
                                                              newSubmodel: S | null,
                                                              oldSubmodel: S | null): void {
  // hook
};

Submodel.prototype.didSetSubmodel = function <S extends Model>(this: Submodel<Model, S>,
                                                               newSubmodel: S | null,
                                                               oldSubmodel: S | null): void {
  // hook
};

Submodel.prototype.willSetOwnSubmodel = function <S extends Model>(this: Submodel<Model, S>,
                                                                   newSubmodel: S | null,
                                                                   oldSubmodel: S | null): void {
  // hook
};

Submodel.prototype.onSetOwnSubmodel = function <S extends Model>(this: Submodel<Model, S>,
                                                                 newSubmodel: S | null,
                                                                 oldSubmodel: S | null): void {
  // hook
};

Submodel.prototype.didSetOwnSubmodel = function <S extends Model>(this: Submodel<Model, S>,
                                                                  newSubmodel: S | null,
                                                                  oldSubmodel: S | null): void {
  // hook
};

Submodel.prototype.mount = function (this: Submodel<Model, Model>): void {
  // hook
};

Submodel.prototype.unmount = function (this: Submodel<Model, Model>): void {
  // hook
};

Submodel.prototype.insert = function <S extends Model>(this: Submodel<Model, S>,
                                                       parentModel?: Model | string,
                                                       key?: string): S | null {
  let submodel = this._submodel;
  if (submodel === null) {
    submodel = this.createSubmodel();
  }
  if (submodel !== null) {
    if (typeof parentModel === "string") {
      key = parentModel;
      parentModel = void 0;
    }
    if (parentModel === void 0) {
      parentModel = this._model;
    }
    if (submodel.parentModel !== parentModel) {
      if (key !== void 0) {
        parentModel.setChildModel(key, submodel);
      } else {
        parentModel.appendChildModel(submodel);
      }
    }
    if (this._submodel === null) {
      this.doSetSubmodel(submodel);
    }
  }
  return submodel;
};

Submodel.prototype.remove = function <S extends Model>(this: Submodel<Model, S>): S | null {
  const submodel = this._submodel;
  if (submodel !== null) {
    submodel.remove();
  }
  return submodel;
};

Submodel.prototype.createSubmodel = function <S extends Model, U>(this: Submodel<Model, S, U>): S | U | null {
  return null;
};

Submodel.prototype.fromAny = function <S extends Model, U>(this: Submodel<Model, S, U>, value: S | U): S | null {
  return value as S | null;
};

Submodel.define = function <M extends Model, S extends Model, U, I>(descriptor: SubmodelDescriptor<M, S, U, I>): SubmodelConstructor<M, S, U, I> {
  let _super = descriptor.extends;
  delete descriptor.extends;

  if (_super === void 0) {
    if (descriptor.observe !== false) {
      _super = Submodel.Observer;
    } else {
      _super = Submodel;
    }
  }

  const _constructor = function SubmodelAccessor(this: Submodel<M, S>, model: M, submodelName: string | undefined): Submodel<M, S, U> {
    let _this: Submodel<M, S, U> = function accessor(submodel?: S | U | null): S | null | M {
      if (submodel === void 0) {
        return _this._submodel;
      } else {
        _this.setSubmodel(submodel);
        return _this._model;
      }
    } as Submodel<M, S, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, model, submodelName) || _this;
    return _this;
  } as unknown as SubmodelConstructor<M, S, U, I>;

  const _prototype = descriptor as unknown as Submodel<M, S, U> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  if (!_prototype.hasOwnProperty("child")) {
    _prototype.child = true;
  }

  return _constructor;
};
