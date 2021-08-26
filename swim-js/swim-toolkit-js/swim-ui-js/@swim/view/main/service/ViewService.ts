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
import {View} from "../View";
import {ViewManager} from "../manager/ViewManager";
import type {ViewManagerObserverType} from "../manager/ViewManagerObserver";
import {ViewportManager} from "../viewport/ViewportManager";
import {DisplayManager} from "../display/DisplayManager";
import {LayoutManager} from "../layout/LayoutManager";
import {ThemeManager} from "../theme/ThemeManager";
import {ModalManager} from "../modal/ModalManager";
import {ViewManagerService} from "../"; // forward import
import {ViewportService} from "../"; // forward import
import {DisplayService} from "../"; // forward import
import {LayoutService} from "../"; // forward import
import {ThemeService} from "../"; // forward import
import {ModalService} from "../"; // forward import

export type ViewServiceMemberType<V, K extends keyof V> =
  V[K] extends ViewService<any, infer T> ? T : never;

export type ViewServiceFlags = number;

export interface ViewServiceInit<T> {
  extends?: ViewServiceClass;
  observe?: boolean;
  type?: unknown;
  manager?: T;
  inherit?: string | boolean;

  initManager?(): T;
}

export type ViewServiceDescriptor<V extends View, T, I = {}> = ViewServiceInit<T> & ThisType<ViewService<V, T> & I> & Partial<I>;

export type ViewServiceDescriptorExtends<V extends View, T, I = {}> = {extends: ViewServiceClass | undefined} & ViewServiceDescriptor<V, T, I>;

export interface ViewServiceConstructor<V extends View, T, I = {}> {
  new(owner: V, serviceName: string | undefined): ViewService<V, T> & I;
  prototype: ViewService<any, any> & I;
}

export interface ViewServiceClass extends Function {
  readonly prototype: ViewService<any, any>;
}

export interface ViewService<V extends View, T> {
  (): T;

  readonly name: string;

  readonly owner: V;

  readonly inherit: string | boolean;

  setInherit(inherit: string | boolean): void;

  isInherited(): boolean;

  /** @hidden */
  readonly serviceFlags: ViewServiceFlags;

  /** @hidden */
  setServiceFlags(serviceFlags: ViewServiceFlags): void;

  /** @hidden */
  readonly superName: string | undefined;

  readonly superService: ViewService<View, T> | null;

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

export const ViewService = function <V extends View, T>(
    this: ViewService<V, T> | typeof ViewService,
    owner: V | ViewServiceDescriptor<V, T>,
    serviceName?: string,
  ): ViewService<V, T> | PropertyDecorator {
  if (this instanceof ViewService) { // constructor
    return ViewServiceConstructor.call(this, owner as V, serviceName);
  } else { // decorator factory
    return ViewServiceDecoratorFactory(owner as ViewServiceDescriptor<V, T>);
  }
} as {
  /** @hidden */
  new<V extends View, T>(owner: V, serviceName: string | undefined): ViewService<V, T>;

  <V extends View, T extends ViewportManager = ViewportManager>(descriptor: {type: typeof ViewportManager} & ViewServiceDescriptor<V, T, ViewManagerObserverType<T>>): PropertyDecorator;
  <V extends View, T extends DisplayManager = DisplayManager>(descriptor: {type: typeof DisplayManager} & ViewServiceDescriptor<V, T, ViewManagerObserverType<T>>): PropertyDecorator;
  <V extends View, T extends LayoutManager = LayoutManager>(descriptor: {type: typeof LayoutManager} & ViewServiceDescriptor<V, T, ViewManagerObserverType<T>>): PropertyDecorator;
  <V extends View, T extends ThemeManager = ThemeManager>(descriptor: {type: typeof ThemeManager} & ViewServiceDescriptor<V, T, ViewManagerObserverType<T>>): PropertyDecorator;
  <V extends View, T extends ModalManager = ModalManager>(descriptor: {type: typeof ModalManager} & ViewServiceDescriptor<V, T, ViewManagerObserverType<T>>): PropertyDecorator;
  <V extends View, T extends ViewManager = ViewManager>(descriptor: {type: typeof ViewManager} & ViewServiceDescriptor<V, T, ViewManagerObserverType<T>>): PropertyDecorator;
  <V extends View, T, I = {}>(descriptor: ViewServiceDescriptorExtends<V, T, I>): PropertyDecorator;
  <V extends View, T>(descriptor: ViewServiceDescriptor<V, T>): PropertyDecorator;

  /** @hidden */
  prototype: ViewService<any, any>;

  /** @hidden */
  getClass(type: unknown): ViewServiceClass | null;

  define<V extends View, T, I = {}>(descriptor: ViewServiceDescriptorExtends<V, T, I>): ViewServiceConstructor<V, T, I>;
  define<V extends View, T>(descriptor: ViewServiceDescriptor<V, T>): ViewServiceConstructor<V, T>;

  /** @hidden */
  InheritedFlag: ViewServiceFlags;
};
__extends(ViewService, Object);

function ViewServiceConstructor<V extends View, T>(this: ViewService<V, T>, owner: V, serviceName: string | undefined): ViewService<V, T> {
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

function ViewServiceDecoratorFactory<V extends View, T>(descriptor: ViewServiceDescriptor<V, T>): PropertyDecorator {
  return View.decorateViewService.bind(View, ViewService.define(descriptor as ViewServiceDescriptor<View, unknown>));
}

ViewService.prototype.setInherit = function (this: ViewService<View, unknown>, inherit: string | boolean): void {
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

ViewService.prototype.isInherited = function (this: ViewService<View, unknown>): boolean {
  return (this.serviceFlags & ViewService.InheritedFlag) !== 0;
};

ViewService.prototype.setServiceFlags = function (this: ViewService<View, unknown>, serviceFlags: ViewServiceFlags): void {
  Object.defineProperty(this, "serviceFlags", {
    value: serviceFlags,
    enumerable: true,
    configurable: true,
  });
};

Object.defineProperty(ViewService.prototype, "superName", {
  get: function (this: ViewService<View, unknown>): string | undefined {
    const inherit = this.inherit;
    return typeof inherit === "string" ? inherit : inherit === true ? this.name : void 0;
  },
  enumerable: true,
  configurable: true,
});

ViewService.prototype.bindSuperService = function (this: ViewService<View, unknown>): void {
  const superName = this.superName;
  let view = this.owner;
  let superService: ViewService<View, unknown> | null = null;
  if (superName !== void 0 && view.isMounted()) {
    do {
      const parentView = view.parentView;
      if (parentView !== null) {
        view = parentView;
        const service = view.getViewService(superName);
        if (service !== null) {
          superService = service;
          if (service.isInherited()) {
            continue;
          }
        } else {
          continue;
        }
      } else if (view !== this.owner) {
        const service = view.getLazyViewService(superName);
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
      this.setServiceFlags(this.serviceFlags | ViewService.InheritedFlag);
      Object.defineProperty(this, "manager", {
        value: superService.manager,
        enumerable: true,
        configurable: true,
      });
    } else {
      this.setServiceFlags(this.serviceFlags & ~ViewService.InheritedFlag);
      Object.defineProperty(this, "manager", {
        value: this.initManager(),
        enumerable: true,
        configurable: true,
      });
    }
  }
};

ViewService.prototype.unbindSuperService = function (this: ViewService<View, unknown>): void {
  Object.defineProperty(this, "superService", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  this.setServiceFlags(this.serviceFlags & ~ViewService.InheritedFlag);
};

Object.defineProperty(ViewService.prototype, "ownManager", {
  get: function <T>(this: ViewService<View, T>): T | undefined {
    return !this.isInherited() ? this.manager : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ViewService.prototype, "superManager", {
  get: function <T>(this: ViewService<View, T>): T | undefined {
    const superService = this.superService;
    return superService !== null ? superService.manager : void 0;
  },
  enumerable: true,
  configurable: true,
});

ViewService.prototype.getManager = function <T>(this: ViewService<View, T>): NonNullable<T> {
  const manager = this.manager;
  if (manager === void 0 || manager === null) {
    throw new TypeError(manager + " " + this.name + " manager");
  }
  return manager as NonNullable<T>;
};

ViewService.prototype.getManagerOr = function <T, E>(this: ViewService<View, T>, elseManager: E): NonNullable<T> | E {
  let manager: T | E = this.manager;
  if (manager === void 0 || manager === null) {
    manager = elseManager;
  }
  return manager as NonNullable<T> | E;
};

ViewService.prototype.initManager = function <T>(this: ViewService<View, T>): T {
  return void 0 as unknown as T;
};

ViewService.prototype.mount = function (this: ViewService<View, unknown>): void {
  this.bindSuperService();
};

ViewService.prototype.unmount = function (this: ViewService<View, unknown>): void {
  this.unbindSuperService();
};

ViewService.getClass = function (type: unknown): ViewServiceClass | null {
  if (type === ViewportManager) {
    return ViewportService;
  } else if (type === DisplayManager) {
    return DisplayService;
  } else if (type === LayoutManager) {
    return LayoutService;
  } else if (type === ThemeManager) {
    return ThemeService;
  } else if (type === ModalManager) {
    return ModalService;
  } else if (type === ViewManager) {
    return ViewManagerService;
  }
  return null;
};

ViewService.define = function <V extends View, T, I>(descriptor: ViewServiceDescriptor<V, T, I>): ViewServiceConstructor<V, T, I> {
  let _super: ViewServiceClass | null | undefined = descriptor.extends;
  const manager = descriptor.manager;
  const inherit = descriptor.inherit;
  const initManager = descriptor.initManager;
  delete descriptor.extends;
  delete descriptor.manager;

  if (_super === void 0) {
    _super = ViewService.getClass(descriptor.type);
  }
  if (_super === null) {
    _super = ViewService;
  }

  const _constructor = function DecoratedViewService(this: ViewService<V, T>, owner: V, serviceName: string | undefined): ViewService<V, T> {
    let _this: ViewService<V, T> = function ViewServiceAccessor(): T | undefined {
      return _this.manager;
    } as ViewService<V, T>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, serviceName) || _this;
    return _this;
  } as unknown as ViewServiceConstructor<V, T, I>;

  const _prototype = descriptor as unknown as ViewService<any, any> & I;
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

ViewService.InheritedFlag = 1 << 0;
