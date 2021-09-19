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
import type {Model} from "../Model";
import {Trait} from "../Trait";
import {ModelManager} from "../manager/ModelManager";
import type {ModelManagerObserverType} from "../manager/ModelManagerObserver";
import {
  ModelServiceFlags,
  ModelServiceDescriptorExtends,
  ModelServiceDescriptor,
  ModelServiceConstructor,
  ModelService,
} from "./ModelService";

export type TraitServiceMemberType<R, K extends keyof R> =
  R[K] extends TraitService<any, infer T> ? T : never;

export interface TraitServiceInit<T> {
  extends?: TraitServiceClass;
  type?: unknown;
  inherit?: string | boolean;
  observe?: boolean;

  manager?: T;
  initManager?(): T;

  /** @hidden */
  modelService?: ModelServiceDescriptorExtends<Model, T> | ModelServiceDescriptor<Model, T>;
  /** @hidden */
  modelServiceConstructor?: ModelServiceConstructor<Model, T>;
  /** @hidden */
  createModelService?(): ModelService<Model, T>;
}

export type TraitServiceDescriptor<R extends Trait, T, I = {}> = TraitServiceInit<T> & ThisType<TraitService<R, T> & I> & Partial<I>;

export type TraitServiceDescriptorExtends<R extends Trait, T, I = {}> = {extends: TraitServiceClass | undefined} & TraitServiceDescriptor<R, T, I>;

export interface TraitServiceConstructor<R extends Trait, T, I = {}> {
  new(owner: R, serviceName: string | undefined): TraitService<R, T> & I;
  prototype: TraitService<any, any> & I;
}

export interface TraitServiceClass extends Function {
  readonly prototype: TraitService<any, any>;
}

export interface TraitService<R extends Trait, T> {
  (): T;

  readonly name: string;

  readonly owner: R;

  readonly modelService: ModelService<Model, T> | null;

  /** @hidden */
  modelServiceConstructor?: ModelServiceConstructor<Model, T>;

  /** @hidden */
  createModelService(): ModelService<Model, T>;

  /** @hidden */
  bindModelService(): void;

  /** @hidden */
  unbindModelService(): void;

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

  readonly superManager: T | undefined;

  readonly ownManager: T | undefined;

  readonly manager: T;

  getManager(): NonNullable<T>;

  getManagerOr<E>(elseManager: E): NonNullable<T> | E;

  /** @hidden */
  attach(): void;

  /** @hidden */
  detach(): void;

  /** @hidden */
  observe?: boolean;

  /** @hidden */
  readonly type?: unknown;

  /** @hidden */
  initManager?(): T;

  toString(): string;
}

export const TraitService = function <R extends Trait, T>(
    this: TraitService<R, T> | typeof TraitService,
    owner: R | TraitServiceDescriptor<R, T>,
    serviceName?: string,
  ): TraitService<R, T> | PropertyDecorator {
  if (this instanceof TraitService) { // constructor
    return TraitServiceConstructor.call(this, owner as R, serviceName);
  } else { // decorator factory
    return TraitServiceDecoratorFactory(owner as TraitServiceDescriptor<R, T>);
  }
} as {
  /** @hidden */
  new<R extends Trait, T>(owner: R, serviceName: string | undefined): TraitService<R, T>;

  <R extends Trait, T extends ModelManager = ModelManager>(descriptor: {type: typeof ModelManager} & TraitServiceDescriptor<R, T, ModelManagerObserverType<T>>): PropertyDecorator;
  <R extends Trait, T, I = {}>(descriptor: TraitServiceDescriptorExtends<R, T, I>): PropertyDecorator;
  <R extends Trait, T>(descriptor: TraitServiceDescriptor<R, T>): PropertyDecorator;

  /** @hidden */
  prototype: TraitService<any, any>;

  define<R extends Trait, T, I = {}>(descriptor: TraitServiceDescriptorExtends<R, T, I>): TraitServiceConstructor<R, T, I>;
  define<R extends Trait, T>(descriptor: TraitServiceDescriptor<R, T>): TraitServiceConstructor<R, T>;
}
__extends(TraitService, Object);

function TraitServiceConstructor<R extends Trait, T>(this: TraitService<R, T>, owner: R, serviceName: string | undefined): TraitService<R, T> {
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
  Object.defineProperty(this, "modelService", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "inherit", {
    value: true,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "serviceFlags", {
    value: 0,
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

function TraitServiceDecoratorFactory<R extends Trait, T>(descriptor: TraitServiceDescriptor<R, T>): PropertyDecorator {
  return Trait.decorateTraitService.bind(Trait, TraitService.define(descriptor as TraitServiceDescriptor<Trait, unknown>));
}

TraitService.prototype.createModelService = function <T>(this: TraitService<Trait, T>): ModelService<Model, T> {
  const modelServiceConstructor = this.modelServiceConstructor;
  if (modelServiceConstructor !== void 0) {
    const model = this.owner.model;
    if (model !== null) {
      const modelService = new modelServiceConstructor(model, this.name);
      Object.defineProperty(modelService, "inherit", {
        value: this.inherit,
        enumerable: true,
        configurable: true,
      });
      modelService.setServiceFlags(this.serviceFlags);
      return modelService;
    } else {
      throw new Error("no model");
    }
  } else {
    throw new Error("no model service constructor");
  }
};

TraitService.prototype.bindModelService = function (this: TraitService<Trait, unknown>): void {
  const model = this.owner.model;
  if (model !== null) {
    let modelService = model.getLazyModelService(this.name);
    if (modelService === null) {
      modelService = this.createModelService();
      model.setModelService(this.name, modelService);
    }
    Object.defineProperty(this, "modelService", {
      value: modelService,
      enumerable: true,
      configurable: true,
    });
    modelService.addTraitService(this);
    Object.defineProperty(this, "inherit", {
      value: modelService.inherit,
      enumerable: true,
      configurable: true,
    });
    this.setServiceFlags(modelService.serviceFlags);
    Object.defineProperty(this, "manager", {
      value: modelService.manager,
      enumerable: true,
      configurable: true,
    });
  }
};

TraitService.prototype.unbindModelService = function (this: TraitService<Trait, unknown>): void {
  const modelService = this.modelService;
  if (modelService !== null) {
    modelService.removeTraitService(this);
    Object.defineProperty(this, "modelService", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }
};

TraitService.prototype.setInherit = function (this: TraitService<Trait, unknown>, inherit: string | boolean): void {
  const modelService = this.modelService;
  if (modelService !== null) {
    modelService.setInherit(inherit);
  } else {
    Object.defineProperty(this, "inherit", {
      value: inherit,
      enumerable: true,
      configurable: true,
    });
  }
};

TraitService.prototype.isInherited = function (this: TraitService<Trait, unknown>): boolean {
  return (this.serviceFlags & ModelService.InheritedFlag) !== 0;
};

TraitService.prototype.setServiceFlags = function (this: TraitService<Trait, unknown>, serviceFlags: ModelServiceFlags): void {
  Object.defineProperty(this, "serviceFlags", {
    value: serviceFlags,
    enumerable: true,
    configurable: true,
  });
};

Object.defineProperty(TraitService.prototype, "superName", {
  get: function (this: TraitService<Trait, unknown>): string | undefined {
    const modelService = this.modelService;
    return modelService !== null ? modelService.superName : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(TraitService.prototype, "superService", {
  get: function (this: TraitService<Trait, unknown>): ModelService<Model, unknown> | null {
    const modelService = this.modelService;
    return modelService !== null ? modelService.superService : null;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(TraitService.prototype, "superManager", {
  get: function <T>(this: TraitService<Trait, T>): T | undefined {
    const modelService = this.modelService;
    return modelService !== null ? modelService.superManager : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(TraitService.prototype, "ownManager", {
  get: function <T>(this: TraitService<Trait, T>): T | undefined {
    return !this.isInherited() ? this.manager : void 0;
  },
  enumerable: true,
  configurable: true,
});

TraitService.prototype.getManager = function <T>(this: TraitService<Trait, T>): NonNullable<T> {
  const manager = this.manager;
  if (manager === void 0 || manager === null) {
    throw new TypeError(manager + " " + this.name + " manager");
  }
  return manager as NonNullable<T>;
};

TraitService.prototype.getManagerOr = function <T, E>(this: TraitService<Trait, T>, elseManager: E): NonNullable<T> | E {
  let manager: T | E = this.manager;
  if (manager === void 0 || manager === null) {
    manager = elseManager;
  }
  return manager as NonNullable<T> | E;
};

TraitService.prototype.attach = function (this: TraitService<Trait, unknown>): void {
  this.bindModelService();
  if (this.manager instanceof ModelManager && this.observe === true) {
    this.manager.addModelManagerObserver(this as ModelManagerObserverType<ModelManager>);
  }
};

TraitService.prototype.detach = function (this: TraitService<Trait, unknown>): void {
  if (this.manager instanceof ModelManager && this.observe === true) {
    this.manager.removeModelManagerObserver(this as ModelManagerObserverType<ModelManager>);
  }
  this.unbindModelService();
};

TraitService.prototype.toString = function (this: TraitService<Trait, unknown>): string {
  return this.name;
};

TraitService.define = function <R extends Trait, T, I>(descriptor: TraitServiceDescriptor<R, T, I>): TraitServiceConstructor<R, T, I> {
  let _super: TraitServiceClass | null | undefined = descriptor.extends;
  const type = descriptor.type;
  const inherit = descriptor.inherit;
  const manager = descriptor.manager;
  const initManager = descriptor.initManager;
  let modelService = descriptor.modelService;
  delete descriptor.extends;
  delete descriptor.inherit;
  delete descriptor.manager;
  delete descriptor.modelService;

  if (_super === void 0) {
    _super = TraitService;
  }

  const _constructor = function DecoratedTraitService(this: TraitService<R, T>, owner: R, serviceName: string | undefined): TraitService<R, T> {
    let _this: TraitService<R, T> = function TraitServiceAccessor(): T | undefined {
      return _this.manager;
    } as TraitService<R, T>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, serviceName) || _this;
    if (manager !== void 0) {
      Object.defineProperty(_this, "manager", {
        value: manager,
        enumerable: true,
        configurable: true,
      });
    }
    if (inherit !== void 0) {
      Object.defineProperty(_this, "inherit", {
        value: inherit,
        enumerable: true,
        configurable: true,
      });
    }
    return _this;
  } as unknown as TraitServiceConstructor<R, T, I>;

  const _prototype = descriptor as unknown as TraitService<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  if (_prototype.modelServiceConstructor === void 0) {
    if (modelService === void 0) {
      modelService = {
        extends: void 0,
        type,
        inherit,
        manager,
      };
      if (initManager !== void 0) {
        modelService.initManager = initManager;
      }
    }
    _prototype.modelServiceConstructor = ModelService.define(modelService as ModelServiceDescriptor<Model, T>);
  }

  return _constructor;
}
