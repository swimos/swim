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
import {Controller} from "../Controller";
import {ControllerManager} from "../manager/ControllerManager";
import type {ControllerManagerObserverType} from "../manager/ControllerManagerObserver";
import {ExecuteManager} from "../execute/ExecuteManager";
import {HistoryManager} from "../history/HistoryManager";
import {StorageManager} from "../storage/StorageManager";
import {ControllerManagerService} from "../"; // forward import
import {ExecuteService} from "../"; // forward import
import {HistoryService} from "../"; // forward import
import {StorageService} from "../"; // forward import

export type ControllerServiceMemberType<C, K extends keyof C> =
  C[K] extends ControllerService<any, infer T> ? T : never;

export type ControllerServiceFlags = number;

export interface ControllerServiceInit<T> {
  extends?: ControllerServiceClass;
  observe?: boolean;
  type?: unknown;
  manager?: T;
  inherit?: string | boolean;

  initManager?(): T;
}

export type ControllerServiceDescriptor<C extends Controller, T, I = {}> = ControllerServiceInit<T> & ThisType<ControllerService<C, T> & I> & Partial<I>;

export type ControllerServiceDescriptorExtends<C extends Controller, T, I = {}> = {extends: ControllerServiceClass | undefined} & ControllerServiceDescriptor<C, T, I>;

export interface ControllerServiceConstructor<C extends Controller, T, I = {}> {
  new(owner: C, serviceName: string | undefined): ControllerService<C, T> & I;
  prototype: ControllerService<any, any> & I;
}

export interface ControllerServiceClass extends Function {
  readonly prototype: ControllerService<any, any>;
}

export interface ControllerService<C extends Controller, T> {
  (): T;

  readonly name: string;

  readonly owner: C;

  readonly inherit: string | boolean;

  setInherit(inherit: string | boolean): void;

  isInherited(): boolean;

  /** @hidden */
  readonly serviceFlags: ControllerServiceFlags;

  /** @hidden */
  setServiceFlags(serviceFlags: ControllerServiceFlags): void;

  /** @hidden */
  readonly superName: string | undefined;

  readonly superService: ControllerService<Controller, T> | null;

  /** @hidden */
  bindSuperService(): void;

  /** @hidden */
  unbindSuperService(): void;

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

export const ControllerService = function <C extends Controller, T>(
    this: ControllerService<C, T> | typeof ControllerService,
    owner: C | ControllerServiceDescriptor<C, T>,
    serviceName?: string,
  ): ControllerService<C, T> | PropertyDecorator {
  if (this instanceof ControllerService) { // constructor
    return ControllerServiceConstructor.call(this, owner as C, serviceName);
  } else { // decorator factory
    return ControllerServiceDecoratorFactory(owner as ControllerServiceDescriptor<C, T>);
  }
} as {
  /** @hidden */
  new<C extends Controller, T>(owner: C, serviceName: string | undefined): ControllerService<C, T>;

  <C extends Controller, T extends ExecuteManager = ExecuteManager>(descriptor: {type: typeof ExecuteManager} & ControllerServiceDescriptor<C, T, ControllerManagerObserverType<T>>): PropertyDecorator;
  <C extends Controller, T extends HistoryManager = HistoryManager>(descriptor: {type: typeof HistoryManager} & ControllerServiceDescriptor<C, T, ControllerManagerObserverType<T>>): PropertyDecorator;
  <C extends Controller, T extends StorageManager = StorageManager>(descriptor: {type: typeof StorageManager} & ControllerServiceDescriptor<C, T, ControllerManagerObserverType<T>>): PropertyDecorator;
  <C extends Controller, T extends ControllerManager = ControllerManager>(descriptor: {type: typeof ControllerManager} & ControllerServiceDescriptor<C, T, ControllerManagerObserverType<T>>): PropertyDecorator;
  <C extends Controller, T, I = {}>(descriptor: ControllerServiceDescriptorExtends<C, T, I>): PropertyDecorator;
  <C extends Controller, T>(descriptor: ControllerServiceDescriptor<C, T>): PropertyDecorator;

  /** @hidden */
  prototype: ControllerService<any, any>;

  /** @hidden */
  getClass(type: unknown): ControllerServiceClass | null;

  define<C extends Controller, T, I = {}>(descriptor: ControllerServiceDescriptorExtends<C, T, I>): ControllerServiceConstructor<C, T, I>;
  define<C extends Controller, T>(descriptor: ControllerServiceDescriptor<C, T>): ControllerServiceConstructor<C, T>;

  /** @hidden */
  InheritedFlag: ControllerServiceFlags;
};
__extends(ControllerService, Object);

function ControllerServiceConstructor<C extends Controller, T>(this: ControllerService<C, T>, owner: C, serviceName: string | undefined): ControllerService<C, T> {
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
  Object.defineProperty(this, "manager", {
    value: void 0,
    enumerable: true,
    configurable: true,
  });
  return this;
}

function ControllerServiceDecoratorFactory<C extends Controller, T>(descriptor: ControllerServiceDescriptor<C, T>): PropertyDecorator {
  return Controller.decorateControllerService.bind(Controller, ControllerService.define(descriptor as ControllerServiceDescriptor<Controller, unknown>));
}

ControllerService.prototype.setInherit = function (this: ControllerService<Controller, unknown>, inherit: string | boolean): void {
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

ControllerService.prototype.isInherited = function (this: ControllerService<Controller, unknown>): boolean {
  return (this.serviceFlags & ControllerService.InheritedFlag) !== 0;
};

ControllerService.prototype.setServiceFlags = function (this: ControllerService<Controller, unknown>, serviceFlags: ControllerServiceFlags): void {
  Object.defineProperty(this, "serviceFlags", {
    value: serviceFlags,
    enumerable: true,
    configurable: true,
  });
};

Object.defineProperty(ControllerService.prototype, "superName", {
  get: function (this: ControllerService<Controller, unknown>): string | undefined {
    const inherit = this.inherit;
    return typeof inherit === "string" ? inherit : inherit === true ? this.name : void 0;
  },
  enumerable: true,
  configurable: true,
});

ControllerService.prototype.bindSuperService = function (this: ControllerService<Controller, unknown>): void {
  const superName = this.superName;
  let controller = this.owner;
  let superService: ControllerService<Controller, unknown> | null = null;
  if (superName !== void 0 && controller.isMounted()) {
    do {
      const parentController = controller.parentController;
      if (parentController !== null) {
        controller = parentController;
        const service = controller.getControllerService(superName);
        if (service !== null) {
          superService = service;
          if (service.isInherited()) {
            continue;
          }
        } else {
          continue;
        }
      } else if (controller !== this.owner) {
        const service = controller.getLazyControllerService(superName);
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
      this.setServiceFlags(this.serviceFlags | ControllerService.InheritedFlag);
      Object.defineProperty(this, "manager", {
        value: superService.manager,
        enumerable: true,
        configurable: true,
      });
    } else {
      this.setServiceFlags(this.serviceFlags & ~ControllerService.InheritedFlag);
      Object.defineProperty(this, "manager", {
        value: this.initManager(),
        enumerable: true,
        configurable: true,
      });
    }
  }
};

ControllerService.prototype.unbindSuperService = function (this: ControllerService<Controller, unknown>): void {
  Object.defineProperty(this, "superService", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  this.setServiceFlags(this.serviceFlags & ~ControllerService.InheritedFlag);
};

Object.defineProperty(ControllerService.prototype, "ownManager", {
  get: function <T>(this: ControllerService<Controller, T>): T | undefined {
    return !this.isInherited() ? this.manager : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ControllerService.prototype, "superManager", {
  get: function <T>(this: ControllerService<Controller, T>): T | undefined {
    const superService = this.superService;
    return superService !== null ? superService.manager : void 0;
  },
  enumerable: true,
  configurable: true,
});

ControllerService.prototype.getManager = function <T>(this: ControllerService<Controller, T>): NonNullable<T> {
  const manager = this.manager;
  if (manager === void 0 || manager === null) {
    throw new TypeError(manager + " " + this.name + " manager");
  }
  return manager as NonNullable<T>;
};

ControllerService.prototype.getManagerOr = function <T, E>(this: ControllerService<Controller, T>, elseManager: E): NonNullable<T> | E {
  let manager: T | E = this.manager;
  if (manager === void 0 || manager === null) {
    manager = elseManager;
  }
  return manager as NonNullable<T> | E;
};

ControllerService.prototype.initManager = function <T>(this: ControllerService<Controller, T>): T {
  return void 0 as unknown as T;
};

ControllerService.prototype.mount = function (this: ControllerService<Controller, unknown>): void {
  this.bindSuperService();
};

ControllerService.prototype.unmount = function (this: ControllerService<Controller, unknown>): void {
  this.unbindSuperService();
};

ControllerService.getClass = function (type: unknown): ControllerServiceClass | null {
  if (type === ExecuteManager) {
    return ExecuteService;
  } else if (type === HistoryManager) {
    return HistoryService;
  } else if (type === StorageManager) {
    return StorageService;
  } else if (type === ControllerManager) {
    return ControllerManagerService;
  }
  return null;
};

ControllerService.define = function <C extends Controller, T, I>(descriptor: ControllerServiceDescriptor<C, T, I>): ControllerServiceConstructor<C, T, I> {
  let _super: ControllerServiceClass | null | undefined = descriptor.extends;
  const manager = descriptor.manager;
  const inherit = descriptor.inherit;
  const initManager = descriptor.initManager;
  delete descriptor.extends;
  delete descriptor.manager;

  if (_super === void 0) {
    _super = ControllerService.getClass(descriptor.type);
  }
  if (_super === null) {
    _super = ControllerService;
  }

  const _constructor = function DecoratedControllerService(this: ControllerService<C, T>, owner: C, serviceName: string | undefined): ControllerService<C, T> {
    let _this: ControllerService<C, T> = function ControllerServiceAccessor(): T | undefined {
      return _this.manager;
    } as ControllerService<C, T>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, serviceName) || _this;
    return _this;
  } as unknown as ControllerServiceConstructor<C, T, I>;

  const _prototype = descriptor as unknown as ControllerService<any, any> & I;
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

ControllerService.InheritedFlag = 1 << 0;
