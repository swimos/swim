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
import {Component} from "../Component";
import {ComponentManager} from "../manager/ComponentManager";
import type {ComponentManagerObserverType} from "../manager/ComponentManagerObserver";
import {ExecuteManager} from "../execute/ExecuteManager";
import {HistoryManager} from "../history/HistoryManager";
import {StorageManager} from "../storage/StorageManager";
import {ComponentManagerService} from "../"; // forward import
import {ExecuteService} from "../"; // forward import
import {HistoryService} from "../"; // forward import
import {StorageService} from "../"; // forward import

export type ComponentServiceMemberType<C, K extends keyof C> =
  C[K] extends ComponentService<any, infer T> ? T : never;

export type ComponentServiceFlags = number;

export interface ComponentServiceInit<T> {
  extends?: ComponentServiceClass;
  observe?: boolean;
  type?: unknown;
  manager?: T;
  inherit?: string | boolean;

  initManager?(): T;
}

export type ComponentServiceDescriptor<C extends Component, T, I = {}> = ComponentServiceInit<T> & ThisType<ComponentService<C, T> & I> & Partial<I>;

export type ComponentServiceDescriptorExtends<C extends Component, T, I = {}> = {extends: ComponentServiceClass | undefined} & ComponentServiceDescriptor<C, T, I>;

export interface ComponentServiceConstructor<C extends Component, T, I = {}> {
  new(owner: C, serviceName: string | undefined): ComponentService<C, T> & I;
  prototype: ComponentService<any, any> & I;
}

export interface ComponentServiceClass extends Function {
  readonly prototype: ComponentService<any, any>;
}

export interface ComponentService<C extends Component, T> {
  (): T;

  readonly name: string;

  readonly owner: C;

  readonly inherit: string | boolean;

  setInherit(inherit: string | boolean): void;

  isInherited(): boolean;

  /** @hidden */
  readonly serviceFlags: ComponentServiceFlags;

  /** @hidden */
  setServiceFlags(serviceFlags: ComponentServiceFlags): void;

  /** @hidden */
  readonly superName: string | undefined;

  readonly superService: ComponentService<Component, T> | null;

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

export const ComponentService = function <C extends Component, T>(
    this: ComponentService<C, T> | typeof ComponentService,
    owner: C | ComponentServiceDescriptor<C, T>,
    serviceName?: string,
  ): ComponentService<C, T> | PropertyDecorator {
  if (this instanceof ComponentService) { // constructor
    return ComponentServiceConstructor.call(this, owner as C, serviceName);
  } else { // decorator factory
    return ComponentServiceDecoratorFactory(owner as ComponentServiceDescriptor<C, T>);
  }
} as {
  /** @hidden */
  new<C extends Component, T>(owner: C, serviceName: string | undefined): ComponentService<C, T>;

  <C extends Component, T extends ExecuteManager = ExecuteManager>(descriptor: {type: typeof ExecuteManager} & ComponentServiceDescriptor<C, T, ComponentManagerObserverType<T>>): PropertyDecorator;
  <C extends Component, T extends HistoryManager = HistoryManager>(descriptor: {type: typeof HistoryManager} & ComponentServiceDescriptor<C, T, ComponentManagerObserverType<T>>): PropertyDecorator;
  <C extends Component, T extends StorageManager = StorageManager>(descriptor: {type: typeof StorageManager} & ComponentServiceDescriptor<C, T, ComponentManagerObserverType<T>>): PropertyDecorator;
  <C extends Component, T extends ComponentManager = ComponentManager>(descriptor: {type: typeof ComponentManager} & ComponentServiceDescriptor<C, T, ComponentManagerObserverType<T>>): PropertyDecorator;
  <C extends Component, T, I = {}>(descriptor: ComponentServiceDescriptorExtends<C, T, I>): PropertyDecorator;
  <C extends Component, T>(descriptor: ComponentServiceDescriptor<C, T>): PropertyDecorator;

  /** @hidden */
  prototype: ComponentService<any, any>;

  /** @hidden */
  getClass(type: unknown): ComponentServiceClass | null;

  define<C extends Component, T, I = {}>(descriptor: ComponentServiceDescriptorExtends<C, T, I>): ComponentServiceConstructor<C, T, I>;
  define<C extends Component, T>(descriptor: ComponentServiceDescriptor<C, T>): ComponentServiceConstructor<C, T>;

  /** @hidden */
  InheritedFlag: ComponentServiceFlags;
};
__extends(ComponentService, Object);

function ComponentServiceConstructor<C extends Component, T>(this: ComponentService<C, T>, owner: C, serviceName: string | undefined): ComponentService<C, T> {
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

function ComponentServiceDecoratorFactory<C extends Component, T>(descriptor: ComponentServiceDescriptor<C, T>): PropertyDecorator {
  return Component.decorateComponentService.bind(Component, ComponentService.define(descriptor as ComponentServiceDescriptor<Component, unknown>));
}

ComponentService.prototype.setInherit = function (this: ComponentService<Component, unknown>, inherit: string | boolean): void {
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

ComponentService.prototype.isInherited = function (this: ComponentService<Component, unknown>): boolean {
  return (this.serviceFlags & ComponentService.InheritedFlag) !== 0;
};

ComponentService.prototype.setServiceFlags = function (this: ComponentService<Component, unknown>, serviceFlags: ComponentServiceFlags): void {
  Object.defineProperty(this, "serviceFlags", {
    value: serviceFlags,
    enumerable: true,
    configurable: true,
  });
};

Object.defineProperty(ComponentService.prototype, "superName", {
  get: function (this: ComponentService<Component, unknown>): string | undefined {
    const inherit = this.inherit;
    return typeof inherit === "string" ? inherit : inherit === true ? this.name : void 0;
  },
  enumerable: true,
  configurable: true,
});

ComponentService.prototype.bindSuperService = function (this: ComponentService<Component, unknown>): void {
  const superName = this.superName;
  let component = this.owner;
  let superService: ComponentService<Component, unknown> | null = null;
  if (superName !== void 0 && component.isMounted()) {
    do {
      const parentComponent = component.parentComponent;
      if (parentComponent !== null) {
        component = parentComponent;
        const service = component.getComponentService(superName);
        if (service !== null) {
          superService = service;
          if (service.isInherited()) {
            continue;
          }
        } else {
          continue;
        }
      } else if (component !== this.owner) {
        const service = component.getLazyComponentService(superName);
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
      this.setServiceFlags(this.serviceFlags | ComponentService.InheritedFlag);
      Object.defineProperty(this, "manager", {
        value: superService.manager,
        enumerable: true,
        configurable: true,
      });
    } else {
      this.setServiceFlags(this.serviceFlags & ~ComponentService.InheritedFlag);
      Object.defineProperty(this, "manager", {
        value: this.initManager(),
        enumerable: true,
        configurable: true,
      });
    }
  }
};

ComponentService.prototype.unbindSuperService = function (this: ComponentService<Component, unknown>): void {
  Object.defineProperty(this, "superService", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  this.setServiceFlags(this.serviceFlags & ~ComponentService.InheritedFlag);
};

Object.defineProperty(ComponentService.prototype, "ownManager", {
  get: function <T>(this: ComponentService<Component, T>): T | undefined {
    return !this.isInherited() ? this.manager : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ComponentService.prototype, "superManager", {
  get: function <T>(this: ComponentService<Component, T>): T | undefined {
    const superService = this.superService;
    return superService !== null ? superService.manager : void 0;
  },
  enumerable: true,
  configurable: true,
});

ComponentService.prototype.getManager = function <T>(this: ComponentService<Component, T>): NonNullable<T> {
  const manager = this.manager;
  if (manager === void 0 || manager === null) {
    throw new TypeError(manager + " " + this.name + " manager");
  }
  return manager as NonNullable<T>;
};

ComponentService.prototype.getManagerOr = function <T, E>(this: ComponentService<Component, T>, elseManager: E): NonNullable<T> | E {
  let manager: T | E = this.manager;
  if (manager === void 0 || manager === null) {
    manager = elseManager;
  }
  return manager as NonNullable<T> | E;
};

ComponentService.prototype.initManager = function <T>(this: ComponentService<Component, T>): T {
  return void 0 as unknown as T;
};

ComponentService.prototype.mount = function (this: ComponentService<Component, unknown>): void {
  this.bindSuperService();
};

ComponentService.prototype.unmount = function (this: ComponentService<Component, unknown>): void {
  this.unbindSuperService();
};

ComponentService.getClass = function (type: unknown): ComponentServiceClass | null {
  if (type === ExecuteManager) {
    return ExecuteService;
  } else if (type === HistoryManager) {
    return HistoryService;
  } else if (type === StorageManager) {
    return StorageService;
  } else if (type === ComponentManager) {
    return ComponentManagerService;
  }
  return null;
};

ComponentService.define = function <C extends Component, T, I>(descriptor: ComponentServiceDescriptor<C, T, I>): ComponentServiceConstructor<C, T, I> {
  let _super: ComponentServiceClass | null | undefined = descriptor.extends;
  const manager = descriptor.manager;
  const inherit = descriptor.inherit;
  const initManager = descriptor.initManager;
  delete descriptor.extends;
  delete descriptor.manager;

  if (_super === void 0) {
    _super = ComponentService.getClass(descriptor.type);
  }
  if (_super === null) {
    _super = ComponentService;
  }

  const _constructor = function DecoratedComponentService(this: ComponentService<C, T>, owner: C, serviceName: string | undefined): ComponentService<C, T> {
    let _this: ComponentService<C, T> = function ComponentServiceAccessor(): T | undefined {
      return _this.manager;
    } as ComponentService<C, T>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, serviceName) || _this;
    return _this;
  } as unknown as ComponentServiceConstructor<C, T, I>;

  const _prototype = descriptor as unknown as ComponentService<any, any> & I;
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

ComponentService.InheritedFlag = 1 << 0;
