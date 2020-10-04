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
import {ModelManagerObserverType, ModelManager} from "../manager/ModelManager";
import {RefreshManager} from "../refresh/RefreshManager";
import {WarpManager} from "../warp/WarpManager";
import {ModelManagerService} from "./ModelManagerService";
import {RefreshService} from "./RefreshService";
import {WarpService} from "./WarpService";

export type ModelServiceMemberType<M, K extends keyof M> =
  M extends {[P in K]: ModelService<any, infer T>} ? T : unknown;

export type ModelServiceFlags = number;

export interface ModelServiceInit<T> {
  extends?: ModelServicePrototype;
  observe?: boolean;
  type?: unknown;
  manager?: T;
  inherit?: string | boolean;

  initManager?(): T;
}

export type ModelServiceDescriptorInit<M extends Model, T, I = {}> = ModelServiceInit<T> & ThisType<ModelService<M, T> & I> & I;

export type ModelServiceDescriptorExtends<M extends Model, T, I = {}> = {extends: ModelServicePrototype | undefined} & ModelServiceDescriptorInit<M, T, I>;

export type ModelServiceDescriptor<M extends Model, T, I = {}> =
  T extends RefreshManager ? {type: typeof RefreshManager} & ModelServiceDescriptorInit<M, T, ModelManagerObserverType<T> & I> :
  T extends WarpManager ? {type: typeof WarpManager} & ModelServiceDescriptorInit<M, T, ModelManagerObserverType<T> & I> :
  T extends ModelManager ? {type: typeof ModelManager} & ModelServiceDescriptorInit<M, T, ModelManagerObserverType<T> & I> :
  ModelServiceDescriptorInit<M, T, I>;

export type ModelServicePrototype = Function & {prototype: ModelService<any, any>};

export type ModelServiceConstructor<M extends Model, T, I = {}> = {
  new(model: M, serviceName: string | undefined): ModelService<M, T> & I;
  prototype: ModelService<any, any> & I;
};

export declare abstract class ModelService<M extends Model, T> {
  /** @hidden */
  _model: M;
  /** @hidden */
  _inherit: string | boolean;
  /** @hidden */
  _serviceFlags: ModelServiceFlags;
  /** @hidden */
  _superService?: ModelService<Model, T>;
  /** @hidden */
  _manager: T;

  constructor(model: M, serviceName: string | undefined);

  get name(): string;

  get model(): M;

  get inherit(): string | boolean;

  setInherit(inherit: string | boolean): void;

  isInherited(): boolean;

  setInherited(inherited: boolean): void;

  /** @hidden */
  get superName(): string | undefined;

  get superService(): ModelService<Model, T> | null;

  /** @hidden */
  bindSuperService(): void;

  /** @hidden */
  unbindSuperService(): void;

  get manager(): T;

  get ownManager(): T | undefined;

  get superManager(): T | undefined;

  getManager(): T extends undefined ? never : T;

  getManagerOr<E>(elseManager: E): (T extends undefined ? never : T) | E;

  /** @hidden */
  mount(): void;

  /** @hidden */
  unmount(): void;

  /** @hidden */
  initManager(): T;

  /** @hidden */
  static getConstructor(type: unknown): ModelServicePrototype | null;

  static define<M extends Model, T, I = {}>(descriptor: ModelServiceDescriptorExtends<M, T, I>): ModelServiceConstructor<M, T, I>;
  static define<M extends Model, T>(descriptor: ModelServiceDescriptor<M, T>): ModelServiceConstructor<M, T>;

  /** @hidden */
  static InheritedFlag: ModelServiceFlags;

  // Forward type declarations
  /** @hidden */
  static Manager: typeof ModelManagerService; // defined by ModelManagerService
  /** @hidden */
  static Refresh: typeof RefreshService; // defined by RefreshService
  /** @hidden */
  static Warp: typeof WarpService; // defined by WarpService
}

export interface ModelService<M extends Model, T> {
  (): T;
}

export function ModelService<M extends Model, T, I = {}>(descriptor: ModelServiceDescriptorExtends<M, T, I>): PropertyDecorator;
export function ModelService<M extends Model, T>(descriptor: ModelServiceDescriptor<M, T>): PropertyDecorator;

export function ModelService<M extends Model, T>(
    this: ModelService<M, T> | typeof ModelService,
    model: M | ModelServiceDescriptor<M, T>,
    serviceName?: string,
  ): ModelService<M, T> | PropertyDecorator {
  if (this instanceof ModelService) { // constructor
    return ModelServiceConstructor.call(this, model as M, serviceName);
  } else { // decorator factory
    return ModelServiceDecoratorFactory(model as ModelServiceDescriptor<M, T>);
  }
}
__extends(ModelService, Object);
Model.Service = ModelService;

function ModelServiceConstructor<M extends Model, T>(this: ModelService<M, T>, model: M, serviceName: string | undefined): ModelService<M, T> {
  if (serviceName !== void 0) {
    Object.defineProperty(this, "name", {
      value: serviceName,
      enumerable: true,
      configurable: true,
    });
  }
  this._model = model;
  this._serviceFlags = 0;
  if (this._inherit !== false) {
    this._serviceFlags |= ModelService.InheritedFlag;
  }
  return this;
}

function ModelServiceDecoratorFactory<M extends Model, T>(descriptor: ModelServiceDescriptor<M, T>): PropertyDecorator {
  return Model.decorateModelService.bind(void 0, ModelService.define(descriptor));
}

Object.defineProperty(ModelService.prototype, "model", {
  get: function <M extends Model>(this: ModelService<M, unknown>): M {
    return this._model;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ModelService.prototype, "inherit", {
  get: function (this: ModelService<Model, unknown>): string | boolean {
    return this._inherit;
  },
  enumerable: true,
  configurable: true,
});

ModelService.prototype.setInherit = function (this: ModelService<Model, unknown>,
                                              inherit: string | boolean): void {
  if (this._inherit !== inherit) {
    this.unbindSuperService();
    if (inherit !== false) {
      this._inherit = inherit;
      this.bindSuperService();
    } else if (this._inherit !== false) {
      this._inherit = false;
    }
  }
};

ModelService.prototype.isInherited = function (this: ModelService<Model, unknown>): boolean {
  return (this._serviceFlags & ModelService.InheritedFlag) !== 0;
};

ModelService.prototype.setInherited = function (this: ModelService<Model, unknown>,
                                                inherited: boolean): void {
  if (inherited && (this._serviceFlags & ModelService.InheritedFlag) === 0) {
    this._serviceFlags |= ModelService.InheritedFlag;
  } else if (!inherited && (this._serviceFlags & ModelService.InheritedFlag) !== 0) {
    this._serviceFlags &= ~ModelService.InheritedFlag;
  }
};

Object.defineProperty(ModelService.prototype, "superName", {
  get: function (this: ModelService<Model, unknown>): string | undefined {
    const inherit = this._inherit;
    return typeof inherit === "string" ? inherit : inherit === true ? this.name : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ModelService.prototype, "superService", {
  get: function (this: ModelService<Model, unknown>): ModelService<Model, unknown> | null {
    let superService: ModelService<Model, unknown> | null | undefined = this._superService;
    if (superService === void 0) {
      superService = null;
      let model = this._model;
      if (!model.isMounted()) {
        const superName = this.superName;
        if (superName !== void 0) {
          do {
            const parentModel = model.parentModel;
            if (parentModel !== null) {
              model = parentModel;
              const service = model.getModelService(superName);
              if (service !== null) {
                superService = service;
                if (service.isInherited()) {
                  continue;
                }
              } else {
                continue;
              }
            }
            break;
          } while (true);
        }
      }
    }
    return superService;
  },
  enumerable: true,
  configurable: true,
});

ModelService.prototype.bindSuperService = function (this: ModelService<Model, unknown>): void {
  let model = this._model;
  if (model.isMounted()) {
    const superName = this.superName;
    if (superName !== void 0) {
      do {
        const parentModel = model.parentModel;
        if (parentModel !== null) {
          model = parentModel;
          const service = model.getModelService(superName);
          if (service !== null) {
            this._superService = service;
            if (service.isInherited()) {
              continue;
            }
          } else {
            continue;
          }
        } else if (model !== this._model) {
          const service = model.getLazyModelService(superName);
          if (service !== null) {
            this._superService = service;
          }
        }
        break;
      } while (true);
    }
    if (this._manager === void 0) {
      if (this._superService !== void 0) {
        this._manager = this._superService._manager;
      } else {
        this._manager = this.initManager();
        this._serviceFlags &= ~ModelService.InheritedFlag;
      }
    }
  }
};

ModelService.prototype.unbindSuperService = function (this: ModelService<Model, unknown>): void {
  const superService = this._superService;
  if (superService !== void 0) {
    this._superService = void 0;
  }
};

Object.defineProperty(ModelService.prototype, "manager", {
  get: function <T>(this: ModelService<Model, T>): T {
    return this._manager;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ModelService.prototype, "ownManager", {
  get: function <T>(this: ModelService<Model, T>): T | undefined {
    return !this.isInherited() ? this.manager : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ModelService.prototype, "superManager", {
  get: function <T>(this: ModelService<Model, T>): T | undefined {
    const superService = this.superService;
    return superService !== null ? superService.manager : void 0;
  },
  enumerable: true,
  configurable: true,
});

ModelService.prototype.getManager = function <T>(this: ModelService<Model, T>): T extends undefined ? never : T {
  const manager = this.manager;
  if (manager === void 0) {
    throw new TypeError("undefined " + this.name + " manager");
  }
  return manager as T extends undefined ? never : T;
};

ModelService.prototype.getManagerOr = function <T, E>(this: ModelService<Model, T>,
                                                      elseManager: E): (T extends undefined ? never : T) | E {
  let manager: T | E | undefined = this.manager;
  if (manager === void 0) {
    manager = elseManager;
  }
  return manager as (T extends undefined ? never : T) | E;
};

ModelService.prototype.mount = function (this: ModelService<Model, unknown>): void {
  this.bindSuperService();
};

ModelService.prototype.unmount = function (this: ModelService<Model, unknown>): void {
  this.unbindSuperService();
};

ModelService.prototype.initManager = function <T>(this: ModelService<Model, T>): T {
  return void 0 as unknown as T;
};

ModelService.getConstructor = function (type: unknown): ModelServicePrototype | null {
  if (type === RefreshManager) {
    return ModelService.Refresh;
  } else if (type === WarpManager) {
    return ModelService.Warp;
  } else if (type === ModelManager) {
    return ModelService.Manager;
  }
  return null;
};

ModelService.define = function <M extends Model, T, I>(descriptor: ModelServiceDescriptor<M, T, I>): ModelServiceConstructor<M, T, I> {
  let _super: ModelServicePrototype | null | undefined = descriptor.extends;
  const manager = descriptor.manager;
  const inherit = descriptor.inherit;
  delete descriptor.extends;
  delete descriptor.manager;
  delete descriptor.inherit;

  if (_super === void 0) {
    _super = ModelService.getConstructor(descriptor.type);
  }
  if (_super === null) {
    _super = ModelService;
  }

  const _constructor = function ModelServiceAccessor(this: ModelService<M, T>, model: M, serviceName: string | undefined): ModelService<M, T> {
    let _this: ModelService<M, T> = function accessor(): T | undefined {
      return _this._manager;
    } as ModelService<M, T>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, model, serviceName) || _this;
    return _this;
  } as unknown as ModelServiceConstructor<M, T, I>;

  const _prototype = descriptor as unknown as ModelService<M, T> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  if (manager !== void 0 && !_prototype.hasOwnProperty("initManager")) {
    _prototype.initManager = function (): T {
      return manager;
    };
  }
  _prototype._inherit = inherit !== void 0 ? inherit : true;

  return _constructor;
}

ModelService.InheritedFlag = 1 << 0;
