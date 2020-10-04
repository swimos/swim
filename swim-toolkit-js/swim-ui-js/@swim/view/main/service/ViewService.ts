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
import {View} from "../View";
import {ViewManagerObserverType, ViewManager} from "../manager/ViewManager";
import {DisplayManager} from "../display/DisplayManager";
import {LayoutManager} from "../layout/LayoutManager";
import {ViewportManager} from "../viewport/ViewportManager";
import {ViewManagerService} from "./ViewManagerService";
import {DisplayService} from "./DisplayService";
import {LayoutService} from "./LayoutService";
import {ViewportService} from "./ViewportService";

export type ViewServiceMemberType<V, K extends keyof V> =
  V extends {[P in K]: ViewService<any, infer T>} ? T : unknown;

export type ViewServiceFlags = number;

export interface ViewServiceInit<T> {
  extends?: ViewServicePrototype;
  observe?: boolean;
  type?: unknown;
  manager?: T;
  inherit?: string | boolean;

  initManager?(): T;
}

export type ViewServiceDescriptorInit<V extends View, T, I = {}> = ViewServiceInit<T> & ThisType<ViewService<V, T> & I> & I;

export type ViewServiceDescriptorExtends<V extends View, T, I = {}> = {extends: ViewServicePrototype | undefined} & ViewServiceDescriptorInit<V, T, I>;

export type ViewServiceDescriptor<V extends View, T, I = {}> =
  T extends DisplayManager ? {type: typeof DisplayManager} & ViewServiceDescriptorInit<V, T, ViewManagerObserverType<T> & I> :
  T extends LayoutManager ? {type: typeof LayoutManager} & ViewServiceDescriptorInit<V, T, ViewManagerObserverType<T> & I> :
  T extends ViewportManager ? {type: typeof ViewportManager} & ViewServiceDescriptorInit<V, T, ViewManagerObserverType<T> & I> :
  T extends ViewManager ? {type: typeof ViewManager} & ViewServiceDescriptorInit<V, T, ViewManagerObserverType<T> & I> :
  ViewServiceDescriptorInit<V, T, I>;

export type ViewServicePrototype = Function & {prototype: ViewService<any, any>};

export type ViewServiceConstructor<V extends View, T, I = {}> = {
  new(view: V, serviceName: string | undefined): ViewService<V, T> & I;
  prototype: ViewService<any, any> & I;
};

export declare abstract class ViewService<V extends View, T> {
  /** @hidden */
  _view: V;
  /** @hidden */
  _inherit: string | boolean;
  /** @hidden */
  _serviceFlags: ViewServiceFlags;
  /** @hidden */
  _superService?: ViewService<View, T>;
  /** @hidden */
  _manager: T;

  constructor(view: V, serviceName: string | undefined);

  get name(): string;

  get view(): V;

  get inherit(): string | boolean;

  setInherit(inherit: string | boolean): void;

  isInherited(): boolean;

  setInherited(inherited: boolean): void;

  /** @hidden */
  get superName(): string | undefined;

  get superService(): ViewService<View, T> | null;

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
  static getConstructor(type: unknown): ViewServicePrototype | null;

  static define<V extends View, T, I = {}>(descriptor: ViewServiceDescriptorExtends<V, T, I>): ViewServiceConstructor<V, T, I>;
  static define<V extends View, T>(descriptor: ViewServiceDescriptor<V, T>): ViewServiceConstructor<V, T>;

  /** @hidden */
  static InheritedFlag: ViewServiceFlags;

  // Forward type declarations
  /** @hidden */
  static Manager: typeof ViewManagerService; // defined by ViewManagerService
  /** @hidden */
  static Display: typeof DisplayService; // defined by DisplayService
  /** @hidden */
  static Layout: typeof LayoutService; // defined by LayoutService
  /** @hidden */
  static Viewport: typeof ViewportService; // defined by ViewportService
}

export interface ViewService<V extends View, T> {
  (): T;
}

export function ViewService<V extends View, T, I = {}>(descriptor: ViewServiceDescriptorExtends<V, T, I>): PropertyDecorator;
export function ViewService<V extends View, T>(descriptor: ViewServiceDescriptor<V, T>): PropertyDecorator;

export function ViewService<V extends View, T>(
    this: ViewService<V, T> | typeof ViewService,
    view: V | ViewServiceDescriptor<V, T>,
    serviceName?: string,
  ): ViewService<V, T> | PropertyDecorator {
  if (this instanceof ViewService) { // constructor
    return ViewServiceConstructor.call(this, view as V, serviceName);
  } else { // decorator factory
    return ViewServiceDecoratorFactory(view as ViewServiceDescriptor<V, T>);
  }
}
__extends(ViewService, Object);
View.Service = ViewService;

function ViewServiceConstructor<V extends View, T>(this: ViewService<V, T>, view: V, serviceName: string | undefined): ViewService<V, T> {
  if (serviceName !== void 0) {
    Object.defineProperty(this, "name", {
      value: serviceName,
      enumerable: true,
      configurable: true,
    });
  }
  this._view = view;
  this._serviceFlags = 0;
  if (this._inherit !== false) {
    this._serviceFlags |= ViewService.InheritedFlag;
  }
  return this;
}

function ViewServiceDecoratorFactory<V extends View, T>(descriptor: ViewServiceDescriptor<V, T>): PropertyDecorator {
  return View.decorateViewService.bind(void 0, ViewService.define(descriptor));
}

Object.defineProperty(ViewService.prototype, "view", {
  get: function <V extends View>(this: ViewService<V, unknown>): V {
    return this._view;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ViewService.prototype, "inherit", {
  get: function (this: ViewService<View, unknown>): string | boolean {
    return this._inherit;
  },
  enumerable: true,
  configurable: true,
});

ViewService.prototype.setInherit = function (this: ViewService<View, unknown>,
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

ViewService.prototype.isInherited = function (this: ViewService<View, unknown>): boolean {
  return (this._serviceFlags & ViewService.InheritedFlag) !== 0;
};

ViewService.prototype.setInherited = function (this: ViewService<View, unknown>,
                                               inherited: boolean): void {
  if (inherited && (this._serviceFlags & ViewService.InheritedFlag) === 0) {
    this._serviceFlags |= ViewService.InheritedFlag;
  } else if (!inherited && (this._serviceFlags & ViewService.InheritedFlag) !== 0) {
    this._serviceFlags &= ~ViewService.InheritedFlag;
  }
};

Object.defineProperty(ViewService.prototype, "superName", {
  get: function (this: ViewService<View, unknown>): string | undefined {
    const inherit = this._inherit;
    return typeof inherit === "string" ? inherit : inherit === true ? this.name : void 0;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ViewService.prototype, "superService", {
  get: function (this: ViewService<View, unknown>): ViewService<View, unknown> | null {
    let superService: ViewService<View, unknown> | null | undefined = this._superService;
    if (superService === void 0) {
      superService = null;
      let view = this._view;
      if (!view.isMounted()) {
        const superName = this.superName;
        if (superName !== void 0) {
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

ViewService.prototype.bindSuperService = function (this: ViewService<View, unknown>): void {
  let view = this._view;
  if (view.isMounted()) {
    const superName = this.superName;
    if (superName !== void 0) {
      do {
        const parentView = view.parentView;
        if (parentView !== null) {
          view = parentView;
          const service = view.getViewService(superName);
          if (service !== null) {
            this._superService = service;
            if (service.isInherited()) {
              continue;
            }
          } else {
            continue;
          }
        } else if (view !== this._view) {
          const service = view.getLazyViewService(superName);
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
        this._serviceFlags &= ~ViewService.InheritedFlag;
      }
    }
  }
};

ViewService.prototype.unbindSuperService = function (this: ViewService<View, unknown>): void {
  const superService = this._superService;
  if (superService !== void 0) {
    this._superService = void 0;
  }
};

Object.defineProperty(ViewService.prototype, "manager", {
  get: function <T>(this: ViewService<View, T>): T {
    return this._manager;
  },
  enumerable: true,
  configurable: true,
});

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

ViewService.prototype.getManager = function <T>(this: ViewService<View, T>): T extends undefined ? never : T {
  const manager = this.manager;
  if (manager === void 0) {
    throw new TypeError("undefined " + this.name + " manager");
  }
  return manager as T extends undefined ? never : T;
};

ViewService.prototype.getManagerOr = function <T, E>(this: ViewService<View, T>,
                                                     elseManager: E): (T extends undefined ? never : T) | E {
  let manager: T | E | undefined = this.manager;
  if (manager === void 0) {
    manager = elseManager;
  }
  return manager as (T extends undefined ? never : T) | E;
};

ViewService.prototype.mount = function (this: ViewService<View, unknown>): void {
  this.bindSuperService();
};

ViewService.prototype.unmount = function (this: ViewService<View, unknown>): void {
  this.unbindSuperService();
};

ViewService.prototype.initManager = function <T>(this: ViewService<View, T>): T {
  return void 0 as unknown as T;
};

ViewService.getConstructor = function (type: unknown): ViewServicePrototype | null {
  if (type === DisplayManager) {
    return ViewService.Display;
  } else if (type === LayoutManager) {
    return ViewService.Layout;
  } else if (type === ViewportManager) {
    return ViewService.Viewport;
  } else if (type === ViewManager) {
    return ViewService.Manager;
  }
  return null;
};

ViewService.define = function <V extends View, T, I>(descriptor: ViewServiceDescriptor<V, T, I>): ViewServiceConstructor<V, T, I> {
  let _super: ViewServicePrototype | null | undefined = descriptor.extends;
  const manager = descriptor.manager;
  const inherit = descriptor.inherit;
  delete descriptor.extends;
  delete descriptor.manager;
  delete descriptor.inherit;

  if (_super === void 0) {
    _super = ViewService.getConstructor(descriptor.type);
  }
  if (_super === null) {
    _super = ViewService;
  }

  const _constructor = function ViewServiceAccessor(this: ViewService<V, T>, view: V, serviceName: string | undefined): ViewService<V, T> {
    let _this: ViewService<V, T> = function accessor(): T | undefined {
      return _this._manager;
    } as ViewService<V, T>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, view, serviceName) || _this;
    return _this;
  } as unknown as ViewServiceConstructor<V, T, I>;

  const _prototype = descriptor as unknown as ViewService<V, T> & I;
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

ViewService.InheritedFlag = 1 << 0;
