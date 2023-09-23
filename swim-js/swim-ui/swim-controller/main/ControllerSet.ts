// Copyright 2015-2023 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import type {Proto} from "@swim/util";
import type {LikeType} from "@swim/util";
import {Objects} from "@swim/util";
import type {Comparator} from "@swim/util";
import type {Consumer} from "@swim/util";
import {Affinity} from "@swim/component";
import type {FastenerFlags} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import {Fastener} from "@swim/component";
import type {Controller} from "./Controller";
import type {ControllerRelationDescriptor} from "./ControllerRelation";
import type {ControllerRelationClass} from "./ControllerRelation";
import {ControllerRelation} from "./ControllerRelation";

/** @public */
export interface ControllerSetDescriptor<R, C extends Controller> extends ControllerRelationDescriptor<R, C> {
  extends?: Proto<ControllerSet<any, any, any>> | boolean | null;
  ordered?: boolean;
  sorted?: boolean;
}

/** @public */
export interface ControllerSetClass<F extends ControllerSet<any, any, any> = ControllerSet<any, any, any>> extends ControllerRelationClass<F> {
  /** @internal */
  readonly OrderedFlag: FastenerFlags;
  /** @internal */
  readonly SortedFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface ControllerSet<R = any, C extends Controller = Controller, I extends any[] = [C | null]> extends ControllerRelation<R, C, I> {
  /** @override */
  get descriptorType(): Proto<ControllerSetDescriptor<R, C>>;

  /** @override */
  get fastenerType(): Proto<ControllerSet<any, any, any>>;

  /** @override */
  get parent(): ControllerSet<any, C, any> | null;

  /** @internal @protected */
  controllerKey(controller: C): string | undefined;

  /** @internal */
  readonly controllers: {readonly [controllerId: string]: C | undefined};

  readonly controllerCount: number;

  /** @internal */
  insertControllerMap(newController: C, target: Controller | null): void;

  /** @internal */
  removeControllerMap(oldController: C): void;

  hasController(controller: Controller): boolean;

  addController(controller?: C | LikeType<C>, target?: Controller | null, key?: string): C;

  addControllers(controllers: {readonly [controllerId: string]: C | undefined}, target?: Controller | null): void;

  setControllers(controllers: {readonly [controllerId: string]: C | undefined}, target?: Controller | null): void;

  attachController(controller?: C | LikeType<C> | null, target?: Controller | null): C;

  attachControllers(controllers: {readonly [controllerId: string]: C | undefined}, target?: Controller | null): void;

  detachController(controller: C): C | null;

  detachControllers(controllers?: {readonly [controllerId: string]: C | undefined}): void;

  insertController(parent?: Controller | null, controller?: C | LikeType<C>, target?: Controller | null, key?: string): C;

  insertControllers(parent: Controller | null, controllers: {readonly [controllerId: string]: C | undefined}, target?: Controller | null): void;

  removeController(controller: C): C | null;

  removeControllers(controllers?: {readonly [controllerId: string]: C | undefined}): void;

  deleteController(controller: C): C | null;

  deleteControllers(controllers?: {readonly [controllerId: string]: C | undefined}): void;

  reinsertController(controller: C, target?: Controller | null): void;

  /** @internal @override */
  bindController(controller: Controller, target: Controller | null): void;

  /** @internal @override */
  unbindController(controller: Controller): void;

  /** @override */
  detectController(controller: Controller): C | null;

  consumeControllers(consumer: Consumer): void;

  unconsumeControllers(consumer: Consumer): void;

  /** @protected @override */
  onStartConsuming(): void;

  /** @protected @override */
  onStopConsuming(): void;

  /** @override */
  recohere(t: number): void;

  get ordered(): boolean;

  order(ordered?: boolean): this;

  get sorted(): boolean;

  sort(sorted?: boolean): this;

  /** @protected */
  willSort(parent: Controller | null): void;

  /** @protected */
  onSort(parent: Controller | null): void;

  /** @protected */
  didSort(parent: Controller | null): void;

  /** @internal */
  sortChildren(parent: Controller, comparator?: Comparator<C>): void;

  /** @internal */
  getTargetChild(parent: Controller, child: C): Controller | null;

  /** @internal */
  compareChildren(a: Controller, b: Controller): number;

  /** @internal */
  compareTargetChild(a: Controller, b: Controller): number;

  /** @protected */
  compare(a: C, b: C): number;
}

/** @public */
export const ControllerSet = (<R, C extends Controller, I extends any[], F extends ControllerSet<any, any, any>>() => ControllerRelation.extend<ControllerSet<R, C, I>, ControllerSetClass<F>>("ControllerSet", {
  get fastenerType(): Proto<ControllerSet<any, any, any>> {
    return ControllerSet;
  },

  controllerKey(controller: C): string | undefined {
    return void 0;
  },

  insertControllerMap(newController: C, target: Controller | null): void {
    const controllers = this.controllers as {[controllerId: string]: C | undefined};
    if (target !== null && (this.flags & ControllerSet.OrderedFlag) !== 0) {
      (this as Mutable<typeof this>).controllers = Objects.inserted(controllers, newController.uid, newController, target);
    } else {
      controllers[newController.uid] = newController;
    }
  },

  removeControllerMap(oldController: C): void {
    const controllers = this.controllers as {[controllerId: string]: C | undefined};
    delete controllers[oldController.uid];
  },

  hasController(controller: Controller): boolean {
    return this.controllers[controller.uid] !== void 0;
  },

  addController(newController?: C | LikeType<C>, target?: Controller | null, key?: string): C {
    if (newController !== void 0 && newController !== null) {
      newController = this.fromLike(newController);
    } else {
      newController = this.createController();
    }
    if (target === void 0) {
      target = null;
    }
    let parent: Controller | null;
    if (this.binds && (parent = this.parentController, parent !== null)) {
      if (target === null) {
        if (newController.parent === parent) {
          target = newController.nextSibling;
        } else {
          target = this.getTargetChild(parent, newController);
        }
      }
      if (key === void 0) {
        key = this.controllerKey(newController);
      }
      if (newController.parent !== parent || newController.nextSibling !== target || newController.key !== key) {
        this.insertChild(parent, newController, target, key);
      }
    }
    if (this.controllers[newController.uid] !== void 0) {
      return newController;
    }
    this.insertControllerMap(newController, target);
    (this as Mutable<typeof this>).controllerCount += 1;
    this.willAttachController(newController, target);
    this.onAttachController(newController, target);
    this.initController(newController);
    this.didAttachController(newController, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newController;
  },

  addControllers(newControllers: {readonly [controllerId: string]: C | undefined}, target?: Controller | null): void {
    for (const controllerId in newControllers) {
      this.addController(newControllers[controllerId]!, target);
    }
  },

  setControllers(newControllers: {readonly [controllerId: string]: C | undefined}, target?: Controller | null): void {
    const binds = this.binds;
    const parent = binds ? this.parentController : null;
    const controllers = this.controllers;
    for (const controllerId in controllers) {
      if (newControllers[controllerId] === void 0) {
        const oldController = this.detachController(controllers[controllerId]!);
        if (oldController !== null && binds && parent !== null && oldController.parent === parent) {
          oldController.remove();
        }
      }
    }
    if ((this.flags & ControllerSet.OrderedFlag) !== 0) {
      const orderedControllers = new Array<C>();
      for (const controllerId in newControllers) {
        orderedControllers.push(newControllers[controllerId]!);
      }
      for (let i = 0, n = orderedControllers.length; i < n; i += 1) {
        const newController = orderedControllers[i]!;
        if (controllers[newController.uid] === void 0) {
          const targetController = i < n + 1 ? orderedControllers[i + 1] : target;
          this.addController(newController, targetController);
        }
      }
    } else {
      for (const controllerId in newControllers) {
        if (controllers[controllerId] === void 0) {
          this.addController(newControllers[controllerId]!, target);
        }
      }
    }
  },

  attachController(newController?: C | LikeType<C> | null, target?: Controller | null): C {
    if (newController !== void 0 && newController !== null) {
      newController = this.fromLike(newController);
    } else {
      newController = this.createController();
    }
    if (this.controllers[newController.uid] !== void 0) {
      return newController;
    } else if (target === void 0) {
      target = null;
    }
    this.insertControllerMap(newController, target);
    (this as Mutable<typeof this>).controllerCount += 1;
    this.willAttachController(newController, target);
    this.onAttachController(newController, target);
    this.initController(newController);
    this.didAttachController(newController, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newController;
  },

  attachControllers(newControllers: {readonly [controllerId: string]: C | undefined}, target?: Controller | null): void {
    for (const controllerId in newControllers) {
      this.attachController(newControllers[controllerId]!, target);
    }
  },

  detachController(oldController: C): C | null {
    if (this.controllers[oldController.uid] === void 0) {
      return null;
    }
    (this as Mutable<typeof this>).controllerCount -= 1;
    this.removeControllerMap(oldController);
    this.willDetachController(oldController);
    this.onDetachController(oldController);
    this.deinitController(oldController);
    this.didDetachController(oldController);
    this.setCoherent(true);
    this.decohereOutlets();
    return oldController;
  },

  detachControllers(controllers?: {readonly [controllerId: string]: C | undefined}): void {
    if (controllers === void 0) {
      controllers = this.controllers;
    }
    for (const controllerId in controllers) {
      this.detachController(controllers[controllerId]!);
    }
  },

  insertController(parent?: Controller | null, newController?: C | LikeType<C>, target?: Controller | null, key?: string): C {
    if (newController !== void 0 && newController !== null) {
      newController = this.fromLike(newController);
    } else {
      newController = this.createController();
    }
    if (parent === void 0) {
      parent = null;
    }
    if (!this.binds && this.controllers[newController.uid] !== void 0 && newController.parent !== null && parent === null && key === void 0) {
      return newController;
    }
    if (parent === null) {
      parent = this.parentController;
    }
    if (target === void 0) {
      target = null;
    }
    if (key === void 0) {
      key = this.controllerKey(newController);
    }
    if (parent !== null && (newController.parent !== parent || newController.key !== key)) {
      if (target === null) {
        target = this.getTargetChild(parent, newController);
      }
      this.insertChild(parent, newController, target, key);
    }
    if (this.controllers[newController.uid] !== void 0) {
      return newController;
    }
    this.insertControllerMap(newController, target);
    (this as Mutable<typeof this>).controllerCount += 1;
    this.willAttachController(newController, target);
    this.onAttachController(newController, target);
    this.initController(newController);
    this.didAttachController(newController, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newController;
  },

  insertControllers(parent: Controller | null, newControllers: {readonly [controllerId: string]: C | undefined}, target?: Controller | null): void {
    for (const controllerId in newControllers) {
      this.insertController(parent, newControllers[controllerId]!, target);
    }
  },

  removeController(controller: C): C | null {
    if (!this.hasController(controller)) {
      return null;
    }
    controller.remove();
    return controller;
  },

  removeControllers(controllers?: {readonly [controllerId: string]: C | undefined}): void {
    if (controllers === void 0) {
      controllers = this.controllers;
    }
    for (const controllerId in controllers) {
      this.removeController(controllers[controllerId]!);
    }
  },

  deleteController(controller: C): C | null {
    const oldController = this.detachController(controller);
    if (oldController === null) {
      return null;
    }
    oldController.remove();
    return oldController;
  },

  deleteControllers(controllers?: {readonly [controllerId: string]: C | undefined}): void {
    if (controllers === void 0) {
      controllers = this.controllers;
    }
    for (const controllerId in controllers) {
      this.deleteController(controllers[controllerId]!);
    }
  },

  reinsertController(controller: C, target?: Controller | null): void {
    if (this.controllers[controller.uid] === void 0 || (target === void 0 && (this.flags & ControllerSet.SortedFlag) === 0)) {
      return;
    }
    const parent = controller.parent;
    if (parent === null) {
      return;
    } else if (target === void 0) {
      target = this.getTargetChild(parent, controller);
    }
    parent.reinsertChild(controller, target);
  },

  bindController(controller: Controller, target: Controller | null): void {
    if (!this.binds) {
      return;
    }
    const newController = this.detectController(controller);
    if (newController === null || this.controllers[newController.uid] !== void 0) {
      return;
    }
    this.insertControllerMap(newController, target);
    (this as Mutable<typeof this>).controllerCount += 1;
    this.willAttachController(newController, target);
    this.onAttachController(newController, target);
    this.initController(newController);
    this.didAttachController(newController, target);
    this.setCoherent(true);
    this.decohereOutlets();
  },

  unbindController(controller: Controller): void {
    if (!this.binds) {
      return;
    }
    const oldController = this.detectController(controller);
    if (oldController === null || this.controllers[oldController.uid] === void 0) {
      return;
    }
    (this as Mutable<typeof this>).controllerCount -= 1;
    this.removeControllerMap(oldController);
    this.willDetachController(oldController);
    this.onDetachController(oldController);
    this.deinitController(oldController);
    this.didDetachController(oldController);
    this.setCoherent(true);
    this.decohereOutlets();
  },

  detectController(controller: Controller): C | null {
    if (typeof this.controllerType === "function" && controller instanceof this.controllerType) {
      return controller as C;
    }
    return null;
  },

  consumeControllers(consumer: Consumer): void {
    const controllers = this.controllers;
    for (const controllerId in controllers) {
      const controller = controllers[controllerId]!;
      controller.consume(consumer);
    }
  },

  unconsumeControllers(consumer: Consumer): void {
    const controllers = this.controllers;
    for (const controllerId in controllers) {
      const controller = controllers[controllerId]!;
      controller.unconsume(consumer);
    }
  },

  onStartConsuming(): void {
    this.consumeControllers(this);
  },

  onStopConsuming(): void {
    this.unconsumeControllers(this);
  },

  recohere(t: number): void {
    this.setCoherentTime(t);
    const inlet = this.inlet;
    if (inlet instanceof ControllerSet) {
      this.setDerived((this.flags & Affinity.Mask) <= Math.min(inlet.flags & Affinity.Mask, Affinity.Intrinsic));
      if ((this.flags & Fastener.DerivedFlag) !== 0) {
        this.setControllers(inlet.controllers);
      }
    } else {
      this.setDerived(false);
    }
  },

  get ordered(): boolean {
    return (this.flags & ControllerSet.OrderedFlag) !== 0;
  },

  order(ordered?: boolean): typeof this {
    if (ordered === void 0) {
      ordered = true;
    }
    if (ordered) {
      this.setFlags(this.flags | ControllerSet.OrderedFlag);
    } else {
      this.setFlags(this.flags & ~ControllerSet.OrderedFlag);
    }
    return this;
  },

  get sorted(): boolean {
    return (this.flags & ControllerSet.SortedFlag) !== 0;
  },

  sort(sorted?: boolean): typeof this {
    if (sorted === void 0) {
      sorted = true;
    }
    if (sorted) {
      const parent = this.parentController;
      this.willSort(parent);
      this.setFlags(this.flags | ControllerSet.SortedFlag);
      this.onSort(parent);
      this.didSort(parent);
    } else {
      this.setFlags(this.flags & ~ControllerSet.SortedFlag);
    }
    return this;
  },

  willSort(parent: Controller | null): void {
    // hook
  },

  onSort(parent: Controller | null): void {
    if (parent !== null) {
      this.sortChildren(parent);
    }
  },

  didSort(parent: Controller | null): void {
    // hook
  },

  sortChildren(parent: Controller, comparator?: Comparator<C>): void {
    parent.sortChildren(this.compareChildren.bind(this));
  },

  getTargetChild(parent: Controller, child: C): Controller | null {
    if ((this.flags & ControllerSet.SortedFlag) !== 0) {
      return parent.getTargetChild(child, this.compareTargetChild.bind(this));
    }
    return null;
  },

  compareChildren(a: Controller, b: Controller): number {
    const controllers = this.controllers;
    const x = controllers[a.uid];
    const y = controllers[b.uid];
    if (x !== void 0 && y !== void 0) {
      return this.compare(x, y);
    }
    return x !== void 0 ? 1 : y !== void 0 ? -1 : 0;
  },

  compareTargetChild(a: C, b: Controller): number {
    const controllers = this.controllers;
    const y = controllers[b.uid];
    if (y !== void 0) {
      return this.compare(a, y);
    }
    return y !== void 0 ? -1 : 0;
  },

  compare(a: C, b: C): number {
    return a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0;
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).controllers = {};
    (fastener as Mutable<typeof fastener>).controllerCount = 0;
    return fastener;
  },

  refine(fastenerClass: FastenerClass<ControllerSet<any, any, any>>): void {
    super.refine(fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;

    let flagsInit = fastenerPrototype.flagsInit;
    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "ordered")) {
      if (fastenerPrototype.ordered) {
        flagsInit |= ControllerSet.OrderedFlag;
      } else {
        flagsInit &= ~ControllerSet.OrderedFlag;
      }
      delete (fastenerPrototype as ControllerSetDescriptor<any, any>).ordered;
    }
    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "sorted")) {
      if (fastenerPrototype.sorted) {
        flagsInit |= ControllerSet.SortedFlag;
      } else {
        flagsInit &= ~ControllerSet.SortedFlag;
      }
      delete (fastenerPrototype as ControllerSetDescriptor<any, any>).sorted;
    }
    Object.defineProperty(fastenerPrototype, "flagsInit", {
      value: flagsInit,
      enumerable: true,
      configurable: true,
    });
  },

  OrderedFlag: 1 << (ControllerRelation.FlagShift + 0),
  SortedFlag: 1 << (ControllerRelation.FlagShift + 1),

  FlagShift: ControllerRelation.FlagShift + 2,
  FlagMask: (1 << (ControllerRelation.FlagShift + 2)) - 1,
}))();
