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

import {__extends} from "tslib";
import {Arrays} from "@swim/util";
import {Model} from "../Model";
import type {Trait} from "../Trait";
import {ModelManager} from "../manager/ModelManager";
import type {ModelManagerObserverType} from "../manager/ModelManagerObserver";
import {RefreshManager} from "../refresh/RefreshManager";
import {SelectionManager} from "../selection/SelectionManager";
import {WarpManager} from "../warp/WarpManager";
import {ModelManagerService} from "../"; // forward import
import {RefreshService} from "../"; // forward import
import {SelectionService} from "../"; // forward import
import {WarpService} from "../"; // forward import
import type {TraitService} from "./TraitService";

export type ModelServiceMemberType<M, K extends keyof M> =
  M[K] extends ModelService<any, infer T> ? T : never;

export type ModelServiceFlags = number;

export interface ModelServiceInit<T> {
  extends?: ModelServiceClass;
  observe?: boolean;
  type?: unknown;
  manager?: T;
  inherit?: string | boolean;

  initManager?(): T;
}

export type ModelServiceDescriptor<M extends Model, T, I = {}> = ModelServiceInit<T> & ThisType<ModelService<M, T> & I> & Partial<I>;

export type ModelServiceDescriptorExtends<M extends Model, T, I = {}> = {extends: ModelServiceClass | undefined} & ModelServiceDescriptor<M, T, I>;

export interface ModelServiceConstructor<M extends Model, T, I = {}> {
  new(owner: M, serviceName: string | undefined): ModelService<M, T> & I;
  prototype: ModelService<any, any> & I;
}

export interface ModelServiceClass extends Function {
  readonly prototype: ModelService<any, any>;
}

export interface ModelService<M extends Model, T> {
  (): T;

  readonly name: string;

  readonly owner: M;

  readonly inherit: string | boolean;

  setInherit(inherit: string | boolean): void;

  isInherited(): boolean;

  /** @hidden */
  readonly serviceFlags: ModelServiceFlags;

  /** @hidden */
  setServiceFlags(serviceFlags: ModelServiceFlags): void;

  /** @hidden */
  readonly superName: string | undefined;

  readonly superService: ModelService<Model, T> | null;

  /** @hidden */
  bindSuperService(): void;

  /** @hidden */
  unbindSuperService(): void;

  /** @hidden */
  readonly traitServices: ReadonlyArray<TraitService<Trait, T>>;

  /** @hidden */
  addTraitService(traitService: TraitService<Trait, T>): void;

  /** @hidden */
  removeTraitService(traitService: TraitService<Trait, T>): void;

  readonly manager: T;

  readonly ownManager: T | undefined;

  readonly superManager: T | undefined;

  getManager(): NonNullable<T>;

  getManagerOr<E>(elseManager: E): NonNullable<T> | E;

  /** @hidden */
  observe?: boolean;

  /** @hidden */
  readonly type?: unknown;

  /** @hidden */
  initManager(): T;

  /** @hidden */
  mount(): void;

  /** @hidden */
  unmount(): void;
}

export const ModelService = function <M extends Model, T>(
    this: ModelService<M, T> | typeof ModelService,
    owner: M | ModelServiceDescriptor<M, T>,
    serviceName?: string,
  ): ModelService<M, T> | PropertyDecorator {
  if (this instanceof ModelService) { // constructor
    return ModelServiceConstructor.call(this, owner as M, serviceName);
  } else { // decorator factory
    return ModelServiceDecoratorFactory(owner as ModelServiceDescriptor<M, T>);
  }
} as {
  /** @hidden */
  new<M extends Model, T>(owner: M, serviceName: string | undefined): ModelService<M, T>;

  <M extends Model, T extends RefreshManager = RefreshManager>(descriptor: {type: typeof RefreshManager} & ModelServiceDescriptor<M, T, ModelManagerObserverType<T>>): PropertyDecorator;
  <M extends Model, T extends SelectionManager = SelectionManager>(descriptor: {type: typeof SelectionManager} & ModelServiceDescriptor<M, T, ModelManagerObserverType<T>>): PropertyDecorator;
  <M extends Model, T extends WarpManager = WarpManager>(descriptor: {type: typeof WarpManager} & ModelServiceDescriptor<M, T, ModelManagerObserverType<T>>): PropertyDecorator;
  <M extends Model, T extends ModelManager = ModelManager>(descriptor: {type: typeof ModelManager} & ModelServiceDescriptor<M, T, ModelManagerObserverType<T>>): PropertyDecorator;
  <M extends Model, T, I = {}>(descriptor: ModelServiceDescriptorExtends<M, T, I>): PropertyDecorator;
  <M extends Model, T>(descriptor: ModelServiceDescriptor<M, T>): PropertyDecorator;

  /** @hidden */
  prototype: ModelService<any, any>;

  /** @hidden */
  getClass(type: unknown): ModelServiceClass | null;

  define<M extends Model, T, I = {}>(descriptor: ModelServiceDescriptorExtends<M, T, I>): ModelServiceConstructor<M, T, I>;
  define<M extends Model, T>(descriptor: ModelServiceDescriptor<M, T>): ModelServiceConstructor<M, T>;

  /** @hidden */
  InheritedFlag: ModelServiceFlags;
};
__extends(ModelService, Object);

function ModelServiceConstructor<M extends Model, T>(this: ModelService<M, T>, owner: M, serviceName: string | undefined): ModelService<M, T> {
  if (serviceName !== void 0) {
    Object.defineProperty(this, "name", {
      value: serviceName,
      enumerable: true,
      configurable: true,
    });
  }
  Object.defineProperty(this, "owner", {
    value: owner,
    enumerable: true,
  });
  Object.defineProperty(this, "inherit", {
    value: this.inherit ?? false, // seed from prototype
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "serviceFlags", {
    value: 0,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "superService", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "traitServices", {
    value: Arrays.empty,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "manager", {
    value: void 0,
    enumerable: true,
    configurable: true,
  });
  return this;
}

function ModelServiceDecoratorFactory<M extends Model, T>(descriptor: ModelServiceDescriptor<M, T>): PropertyDecorator {
  return Model.decorateModelService.bind(Model, ModelService.define(descriptor as ModelServiceDescriptor<Model, unknown>));
}

ModelService.prototype.setInherit = function (this: ModelService<Model, unknown>, inherit: string | boolean): void {
  if (this.inherit !== inherit) {
    this.unbindSuperService();
    Object.defineProperty(this, "inherit", {
      value: inherit,
      enumerable: true,
      configurable: true,
    });
    this.bindSuperService();
  }
};

ModelService.prototype.isInherited = function (this: ModelService<Model, unknown>): boolean {
  return (this.serviceFlags & ModelService.InheritedFlag) !== 0;
};

ModelService.prototype.setServiceFlags = function (this: ModelService<Model, unknown>, serviceFlags: ModelServiceFlags): void {
  Object.defineProperty(this, "serviceFlags", {
    value: serviceFlags,
    enumerable: true,
    configurable: true,
  });
};

Object.defineProperty(ModelService.prototype, "superName", {
  get: function (this: ModelService<Model, unknown>): string | undefined {
    const inherit = this.inherit;
    return typeof inherit === "string" ? inherit : inherit === true ? this.name : void 0;
  },
  enumerable: true,
  configurable: true,
});

ModelService.prototype.bindSuperService = function (this: ModelService<Model, unknown>): void {
  const superName = this.superName;
  let model = this.owner;
  let superService: ModelService<Model, unknown> | null = null;
  if (superName !== void 0 && model.isMounted()) {
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
      } else if (model !== this.owner) {
        const service = model.getLazyModelService(superName);
        if (service !== null) {
          superService = service;
        }
      }
      break;
    } while (true);
    Object.defineProperty(this, "superService", {
      value: superService,
      enumerable: true,
      configurable: true,
    });
  }
  if (this.manager === void 0) {
    if (superService !== null) {
      this.setServiceFlags(this.serviceFlags | ModelService.InheritedFlag);
      Object.defineProperty(this, "manager", {
        value: superService.manager,
        enumerable: true,
        configurable: true,
      });
    } else {
      this.setServiceFlags(this.serviceFlags & ~ModelService.InheritedFlag);
      Object.defineProperty(this, "manager", {
        value: this.initManager(),
        enumerable: true,
        configurable: true,
      });
    }
  }
  const traitServices = this.traitServices;
  for (let i = 0, n = traitServices.length; i < n; i += 1) {
    const traitService = traitServices[i]!;
    traitService.setServiceFlags(traitService.serviceFlags & ~ModelService.InheritedFlag | (this.serviceFlags & ModelService.InheritedFlag));
    Object.defineProperty(traitService, "manager", {
      value: this.manager,
      enumerable: true,
      configurable: true,
    });
  }
};

ModelService.prototype.unbindSuperService = function (this: ModelService<Model, unknown>): void {
  Object.defineProperty(this, "superService", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  this.setServiceFlags(this.serviceFlags & ~ModelService.InheritedFlag);
  const traitServices = this.traitServices;
  for (let i = 0, n = traitServices.length; i < n; i += 1) {
    const traitService = traitServices[i]!;
    traitService.setServiceFlags(traitService.serviceFlags & ~ModelService.InheritedFlag);
  }
};

ModelService.prototype.addTraitService = function <T>(this: ModelService<Model, T>, traitService: TraitService<Trait, T>): void {
  Object.defineProperty(this, "traitServices", {
    value: Arrays.inserted(traitService, this.traitServices),
    enumerable: true,
    configurable: true,
  });
};

ModelService.prototype.removeTraitService = function <T>(this: ModelService<Model, T>, traitService: TraitService<Trait, T>): void {
  Object.defineProperty(this, "traitServices", {
    value: Arrays.removed(traitService, this.traitServices),
    enumerable: true,
    configurable: true,
  });
};

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

ModelService.prototype.getManager = function <T>(this: ModelService<Model, T>): NonNullable<T> {
  const manager = this.manager;
  if (manager === void 0 || manager === null) {
    throw new TypeError(manager + " " + this.name + " manager");
  }
  return manager as NonNullable<T>;
};

ModelService.prototype.getManagerOr = function <T, E>(this: ModelService<Model, T>, elseManager: E): NonNullable<T> | E {
  let manager: T | E = this.manager;
  if (manager === void 0 || manager === null) {
    manager = elseManager;
  }
  return manager as NonNullable<T> | E;
};

ModelService.prototype.initManager = function <T>(this: ModelService<Model, T>): T {
  return void 0 as unknown as T;
};

ModelService.prototype.mount = function (this: ModelService<Model, unknown>): void {
  this.bindSuperService();
};

ModelService.prototype.unmount = function (this: ModelService<Model, unknown>): void {
  this.unbindSuperService();
};

ModelService.getClass = function (type: unknown): ModelServiceClass | null {
  if (type === RefreshManager) {
    return RefreshService;
  } else if (type === SelectionManager) {
    return SelectionService;
  } else if (type === WarpManager) {
    return WarpService;
  } else if (type === ModelManager) {
    return ModelManagerService;
  }
  return null;
};

ModelService.define = function <M extends Model, T, I>(descriptor: ModelServiceDescriptor<M, T, I>): ModelServiceConstructor<M, T, I> {
  let _super: ModelServiceClass | null | undefined = descriptor.extends;
  const manager = descriptor.manager;
  const inherit = descriptor.inherit;
  const initManager = descriptor.initManager;
  delete descriptor.extends;
  delete descriptor.manager;

  if (_super === void 0) {
    _super = ModelService.getClass(descriptor.type);
  }
  if (_super === null) {
    _super = ModelService;
  }

  const _constructor = function DecoratedModelService(this: ModelService<M, T>, owner: M, serviceName: string | undefined): ModelService<M, T> {
    let _this: ModelService<M, T> = function ModelServiceAccessor(): T | undefined {
      return _this.manager;
    } as ModelService<M, T>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, serviceName) || _this;
    return _this;
  } as unknown as ModelServiceConstructor<M, T, I>;

  const _prototype = descriptor as unknown as ModelService<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  if (manager !== void 0 && initManager === void 0) {
    _prototype.initManager = function (): T {
      return manager;
    };
  }
  Object.defineProperty(_prototype, "inherit", {
    value: inherit ?? true,
    enumerable: true,
    configurable: true,
  });

  return _constructor;
}

ModelService.InheritedFlag = 1 << 0;
