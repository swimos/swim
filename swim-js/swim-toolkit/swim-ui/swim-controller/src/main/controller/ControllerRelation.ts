// Copyright 2015-2021 Swim.inc
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

import type {Proto, ObserverType} from "@swim/util";
import {FastenerOwner, FastenerInit, FastenerClass, Fastener} from "@swim/component";
import {AnyController, ControllerFactory, Controller} from "./Controller";

/** @internal */
export type ControllerRelationType<F extends ControllerRelation<any, any>> =
  F extends ControllerRelation<any, infer C> ? C : never;

/** @public */
export interface ControllerRelationInit<C extends Controller = Controller> extends FastenerInit {
  extends?: {prototype: ControllerRelation<any, any>} | string | boolean | null;
  type?: ControllerFactory<C>;
  binds?: boolean;
  observes?: boolean;

  initController?(controller: C): void;
  willAttachController?(controller: C, target: Controller | null): void;
  didAttachController?(controller: C, target: Controller | null): void;

  deinitController?(controller: C): void;
  willDetachController?(controller: C): void;
  didDetachController?(controller: C): void;

  parentController?: Controller | null;
  insertChild?(parent: Controller, child: C, target: Controller | null, key: string | undefined): void;

  detectController?(controller: Controller): C | null;
  createController?(): C;
  fromAny?(value: AnyController<C>): C;
}

/** @public */
export type ControllerRelationDescriptor<O = unknown, C extends Controller = Controller, I = {}> = ThisType<ControllerRelation<O, C> & I> & ControllerRelationInit<C> & Partial<I>;

/** @public */
export interface ControllerRelationClass<F extends ControllerRelation<any, any> = ControllerRelation<any, any>> extends FastenerClass<F> {
}

/** @public */
export interface ControllerRelationFactory<F extends ControllerRelation<any, any> = ControllerRelation<any, any>> extends ControllerRelationClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): ControllerRelationFactory<F> & I;

  define<O, C extends Controller = Controller>(className: string, descriptor: ControllerRelationDescriptor<O, C>): ControllerRelationFactory<ControllerRelation<any, C>>;
  define<O, C extends Controller = Controller>(className: string, descriptor: {observes: boolean} & ControllerRelationDescriptor<O, C, ObserverType<C>>): ControllerRelationFactory<ControllerRelation<any, C>>;
  define<O, C extends Controller = Controller, I = {}>(className: string, descriptor: {implements: unknown} & ControllerRelationDescriptor<O, C, I>): ControllerRelationFactory<ControllerRelation<any, C> & I>;
  define<O, C extends Controller = Controller, I = {}>(className: string, descriptor: {implements: unknown; observes: boolean} & ControllerRelationDescriptor<O, C, I & ObserverType<C>>): ControllerRelationFactory<ControllerRelation<any, C> & I>;

  <O, C extends Controller = Controller>(descriptor: ControllerRelationDescriptor<O, C>): PropertyDecorator;
  <O, C extends Controller = Controller>(descriptor: {observes: boolean} & ControllerRelationDescriptor<O, C, ObserverType<C>>): PropertyDecorator;
  <O, C extends Controller = Controller, I = {}>(descriptor: {implements: unknown} & ControllerRelationDescriptor<O, C, I>): PropertyDecorator;
  <O, C extends Controller = Controller, I = {}>(descriptor: {implements: unknown; observes: boolean} & ControllerRelationDescriptor<O, C, I & ObserverType<C>>): PropertyDecorator;
}

/** @public */
export interface ControllerRelation<O = unknown, C extends Controller = Controller> extends Fastener<O> {
  /** @override */
  get fastenerType(): Proto<ControllerRelation<any, any>>;

  /** @protected */
  initController(controller: C): void;

  /** @protected */
  willAttachController(controller: C, target: Controller | null): void;

  /** @protected */
  onAttachController(controller: C, target: Controller | null): void;

  /** @protected */
  didAttachController(controller: C, target: Controller | null): void;

  /** @protected */
  deinitController(controller: C): void;

  /** @protected */
  willDetachController(controller: C): void;

  /** @protected */
  onDetachController(controller: C): void;

  /** @protected */
  didDetachController(controller: C): void;

  /** @internal @protected */
  get parentController(): Controller | null;

  /** @internal @protected */
  insertChild(parent: Controller, child: C, target: Controller | null, key: string | undefined): void;

  /** @internal */
  bindController(controller: Controller, target: Controller | null): void;

  /** @internal */
  unbindController(controller: Controller): void;

  detectController(controller: Controller): C | null;

  createController(): C;

  /** @internal @protected */
  fromAny(value: AnyController<C>): C;

  /** @internal @protected */
  get type(): ControllerFactory<C> | undefined; // optional prototype property

  /** @internal @protected */
  get binds(): boolean | undefined; // optional prototype property

  /** @internal @protected */
  get observes(): boolean | undefined; // optional prototype property

  /** @internal @override */
  get lazy(): boolean; // prototype property

  /** @internal @override */
  get static(): string | boolean; // prototype property
}

/** @public */
export const ControllerRelation = (function (_super: typeof Fastener) {
  const ControllerRelation: ControllerRelationFactory = _super.extend("ControllerRelation");

  Object.defineProperty(ControllerRelation.prototype, "fastenerType", {
    get: function (this: ControllerRelation): Proto<ControllerRelation<any, any>> {
      return ControllerRelation;
    },
    configurable: true,
  });

  ControllerRelation.prototype.initController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: C): void {
    // hook
  };

  ControllerRelation.prototype.willAttachController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: C, target: Controller | null): void {
    // hook
  };

  ControllerRelation.prototype.onAttachController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: C, target: Controller | null): void {
    if (this.observes === true) {
      controller.observe(this as ObserverType<C>);
    }
  };

  ControllerRelation.prototype.didAttachController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: C, target: Controller | null): void {
    // hook
  };

  ControllerRelation.prototype.deinitController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: C): void {
    // hook
  };

  ControllerRelation.prototype.willDetachController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: C): void {
    // hook
  };

  ControllerRelation.prototype.onDetachController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: C): void {
    if (this.observes === true) {
      controller.unobserve(this as ObserverType<C>);
    }
  };

  ControllerRelation.prototype.didDetachController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: C): void {
    // hook
  };

  Object.defineProperty(ControllerRelation.prototype, "parentController", {
    get(this: ControllerRelation): Controller | null {
      const owner = this.owner;
      return owner instanceof Controller ? owner : null;
    },
    configurable: true,
  });

  ControllerRelation.prototype.insertChild = function <C extends Controller>(this: ControllerRelation<unknown, C>, parent: Controller, child: C, target: Controller | null, key: string | undefined): void {
    parent.insertChild(child, target, key);
  };

  ControllerRelation.prototype.bindController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: Controller, target: Controller | null): void {
    // hook
  };

  ControllerRelation.prototype.unbindController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: Controller): void {
    // hook
  };

  ControllerRelation.prototype.detectController = function <C extends Controller>(this: ControllerRelation<unknown, C>, controller: Controller): C | null {
    return null;
  };

  ControllerRelation.prototype.createController = function <C extends Controller>(this: ControllerRelation<unknown, C>): C {
    let controller: C | undefined;
    const type = this.type;
    if (type !== void 0) {
      controller = type.create();
    }
    if (controller === void 0 || controller === null) {
      let message = "Unable to create ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "controller";
      throw new Error(message);
    }
    return controller;
  };

  ControllerRelation.prototype.fromAny = function <C extends Controller>(this: ControllerRelation<unknown, C>, value: AnyController<C>): C {
    const type = this.type;
    if (type !== void 0) {
      return type.fromAny(value);
    } else {
      return Controller.fromAny(value) as C;
    }
  };

  Object.defineProperty(ControllerRelation.prototype, "lazy", {
    get: function (this: ControllerRelation): boolean {
      return false;
    },
    configurable: true,
  });

  Object.defineProperty(ControllerRelation.prototype, "static", {
    get: function (this: ControllerRelation): string | boolean {
      return true;
    },
    configurable: true,
  });

  ControllerRelation.construct = function <F extends ControllerRelation<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    return fastener;
  };

  ControllerRelation.define = function <O, C extends Controller>(className: string, descriptor: ControllerRelationDescriptor<O, C>): ControllerRelationFactory<ControllerRelation<any, C>> {
    let superClass = descriptor.extends as ControllerRelationFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    delete descriptor.extends;
    delete descriptor.implements;
    delete descriptor.affinity;
    delete descriptor.inherits;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: ControllerRelation<any, any>}, fastener: ControllerRelation<O, C> | null, owner: O): ControllerRelation<O, C> {
      fastener = superClass!.construct(fastenerClass, fastener, owner);
      if (affinity !== void 0) {
        fastener.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        fastener.initInherits(inherits);
      }
      return fastener;
    };

    return fastenerClass;
  };

  return ControllerRelation;
})(Fastener);
