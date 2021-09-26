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

import {Mutable, Arrays} from "@swim/util";
import type {Model, Trait} from "@swim/model";
import {View, GestureContextPrototype, GestureContext, Gesture} from "@swim/view";
import type {ControllerContextType, ControllerContext} from "./ControllerContext";
import type {ControllerObserverType, ControllerObserver} from "./ControllerObserver";
import type {ControllerServiceConstructor, ControllerService} from "./service/ControllerService";
import type {ExecuteService} from "./service/ExecuteService";
import type {HistoryService} from "./service/HistoryService";
import type {StorageService} from "./service/StorageService";
import type {ControllerPropertyConstructor, ControllerProperty} from "./property/ControllerProperty";
import type {ControllerModelConstructor, ControllerModel} from "./fastener/ControllerModel";
import type {ControllerTraitConstructor, ControllerTrait} from "./fastener/ControllerTrait";
import type {ControllerViewConstructor, ControllerView} from "./fastener/ControllerView";
import type {ControllerViewTraitConstructor, ControllerViewTrait} from "./fastener/ControllerViewTrait";
import type {ControllerFastenerConstructor, ControllerFastener} from "./fastener/ControllerFastener";

export type ControllerFlags = number;

export type ControllerPrecedence = number;

export interface ControllerInit {
  key?: string;
}

export interface ControllerPrototype extends GestureContextPrototype {
  /** @hidden */
  controllerServiceConstructors?: {[serviceName: string]: ControllerServiceConstructor<Controller, unknown> | undefined};

  /** @hidden */
  controllerPropertyConstructors?: {[propertyName: string]: ControllerPropertyConstructor<Controller, unknown> | undefined};

  /** @hidden */
  controllerModelConstructors?: {[fastenerName: string]: ControllerModelConstructor<Controller, Model> | undefined};

  /** @hidden */
  controllerTraitConstructors?: {[fastenerName: string]: ControllerTraitConstructor<Controller, Trait> | undefined};

  /** @hidden */
  controllerViewConstructors?: {[fastenerName: string]: ControllerViewConstructor<Controller, View> | undefined};

  /** @hidden */
  controllerViewTraitConstructors?: {[fastenerName: string]: ControllerViewTraitConstructor<Controller, View, Trait> | undefined};

  /** @hidden */
  controllerFastenerConstructors?: {[fastenerName: string]: ControllerFastenerConstructor<Controller, Controller> | undefined};
}

export interface ControllerConstructor<C extends Controller = Controller> {
  new(): C;
  readonly prototype: C;
}

export interface ControllerClass<C extends Controller = Controller> extends Function {
  readonly prototype: C;

  readonly mountFlags: ControllerFlags;

  readonly powerFlags: ControllerFlags;

  readonly insertChildFlags: ControllerFlags;

  readonly removeChildFlags: ControllerFlags;
}

export abstract class Controller implements GestureContext {
  constructor() {
    this.controllerFlags = 0;
    this.controllerObservers = Arrays.empty;
  }

  initController(init: ControllerInit): void {
    // hook
  }

  readonly controllerFlags: ControllerFlags;

  setControllerFlags(controllerFlags: ControllerFlags): void {
    (this as Mutable<this>).controllerFlags = controllerFlags;
  }

  readonly controllerObservers: ReadonlyArray<ControllerObserver>;

  addControllerObserver(controllerObserver: ControllerObserverType<this>): void {
    const oldControllerObservers = this.controllerObservers;
    const newControllerObservers = Arrays.inserted(controllerObserver, oldControllerObservers);
    if (oldControllerObservers !== newControllerObservers) {
      this.willAddControllerObserver(controllerObserver);
      (this as Mutable<this>).controllerObservers = newControllerObservers;
      this.onAddControllerObserver(controllerObserver);
      this.didAddControllerObserver(controllerObserver);
    }
  }

  protected willAddControllerObserver(controllerObserver: ControllerObserverType<this>): void {
    // hook
  }

  protected onAddControllerObserver(controllerObserver: ControllerObserverType<this>): void {
    // hook
  }

  protected didAddControllerObserver(controllerObserver: ControllerObserverType<this>): void {
    // hook
  }

  removeControllerObserver(controllerObserver: ControllerObserverType<this>): void {
    const oldControllerObservers = this.controllerObservers;
    const newControllerObservers = Arrays.removed(controllerObserver, oldControllerObservers);
    if (oldControllerObservers !== newControllerObservers) {
      this.willRemoveControllerObserver(controllerObserver);
      (this as Mutable<this>).controllerObservers = newControllerObservers;
      this.onRemoveControllerObserver(controllerObserver);
      this.didRemoveControllerObserver(controllerObserver);
    }
  }

  protected willRemoveControllerObserver(controllerObserver: ControllerObserverType<this>): void {
    // hook
  }

  protected onRemoveControllerObserver(controllerObserver: ControllerObserverType<this>): void {
    // hook
  }

  protected didRemoveControllerObserver(controllerObserver: ControllerObserverType<this>): void {
    // hook
  }

  abstract readonly key: string | undefined;

  /** @hidden */
  abstract setKey(key: string | undefined): void;

  abstract readonly parentController: Controller | null;

  /** @hidden */
  abstract setParentController(newParentController: Controller | null, oldParentController: Controller | null): void;

  protected attachParentController(parentController: Controller): void {
    if (parentController.isMounted()) {
      this.cascadeMount();
      if (parentController.isPowered()) {
        this.cascadePower();
      }
    }
  }

  protected detachParentController(parentController: Controller): void {
    if (this.isMounted()) {
      try {
        if (this.isPowered()) {
          this.cascadeUnpower();
        }
      } finally {
        this.cascadeUnmount();
      }
    }
  }

  protected willSetParentController(newParentController: Controller | null, oldParentController: Controller | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetParentController !== void 0) {
        controllerObserver.controllerWillSetParentController(newParentController, oldParentController, this);
      }
    }
  }

  protected onSetParentController(newParentController: Controller | null, oldParentController: Controller | null): void {
    // hook
  }

  protected didSetParentController(newParentController: Controller | null, oldParentController: Controller | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetParentController !== void 0) {
        controllerObserver.controllerDidSetParentController(newParentController, oldParentController, this);
      }
    }
  }

  abstract remove(): void;

  abstract readonly childControllerCount: number;

  abstract readonly childControllers: ReadonlyArray<Controller>;

  abstract firstChildController(): Controller | null;

  abstract lastChildController(): Controller | null;

  abstract nextChildController(targetController: Controller): Controller | null;

  abstract previousChildController(targetController: Controller): Controller | null;

  abstract forEachChildController<T>(callback: (childController: Controller) => T | void): T | undefined;
  abstract forEachChildController<T, S>(callback: (this: S, childController: Controller) => T | void,
                                        thisArg: S): T | undefined;

  abstract getChildController(key: string): Controller | null;

  abstract setChildController(key: string, newChildController: Controller | null): Controller | null;

  abstract appendChildController(childController: Controller, key?: string): void;

  abstract prependChildController(childController: Controller, key?: string): void;

  abstract insertChildController(childController: Controller, targetController: Controller | null, key?: string): void;

  get insertChildFlags(): ControllerFlags {
    return (this.constructor as ControllerClass).insertChildFlags;
  }

  protected willInsertChildController(childController: Controller, targetController: Controller | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillInsertChildController !== void 0) {
        controllerObserver.controllerWillInsertChildController(childController, targetController, this);
      }
    }
  }

  protected onInsertChildController(childController: Controller, targetController: Controller | null): void {
    this.requireUpdate(this.insertChildFlags);
  }

  protected didInsertChildController(childController: Controller, targetController: Controller | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidInsertChildController !== void 0) {
        controllerObserver.controllerDidInsertChildController(childController, targetController, this);
      }
    }
  }

  abstract cascadeInsert(updateFlags?: ControllerFlags, controllerContext?: ControllerContext): void;

  abstract removeChildController(key: string): Controller | null;
  abstract removeChildController(childController: Controller): void;

  abstract removeAll(): void;

  get removeChildFlags(): ControllerFlags {
    return (this.constructor as ControllerClass).removeChildFlags;
  }

  protected willRemoveChildController(childController: Controller): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillRemoveChildController !== void 0) {
        controllerObserver.controllerWillRemoveChildController(childController, this);
      }
    }
    this.requireUpdate(this.removeChildFlags);
  }

  protected onRemoveChildController(childController: Controller): void {
    // hook
  }

  protected didRemoveChildController(childController: Controller): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidRemoveChildController !== void 0) {
        controllerObserver.controllerDidRemoveChildController(childController, this);
      }
    }
  }

  getSuperController<C extends Controller>(controllerClass: ControllerClass<C>): C | null {
    const parentController = this.parentController;
    if (parentController === null) {
      return null;
    } else if (parentController instanceof controllerClass) {
      return parentController;
    } else {
      return parentController.getSuperController(controllerClass);
    }
  }

  getBaseController<C extends Controller>(controllerClass: ControllerClass<C>): C | null {
    const parentController = this.parentController;
    if (parentController === null) {
      return null;
    } else {
      const baseController = parentController.getBaseController(controllerClass);
      if (baseController !== null) {
        return baseController;
      } else {
        return parentController instanceof controllerClass ? parentController : null;
      }
    }
  }

  declare readonly executeService: ExecuteService<this>; // defined by ExecuteService

  declare readonly historyService: HistoryService<this>; // defined by HistoryService

  declare readonly storageService: StorageService<this>; // defined by StorageService

  isMounted(): boolean {
    return (this.controllerFlags & Controller.MountedFlag) !== 0;
  }

  get mountFlags(): ControllerFlags {
    return (this.constructor as ControllerClass).mountFlags;
  }

  mount(): void {
    if (!this.isMounted() && this.parentController === null) {
      this.cascadeMount();
      if (!this.isPowered() && document.visibilityState === "visible") {
        this.cascadePower();
      }
      this.cascadeInsert();
    }
  }

  abstract cascadeMount(): void;

  protected willMount(): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillMount !== void 0) {
        controllerObserver.controllerWillMount(this);
      }
    }
  }

  protected onMount(): void {
    this.requestUpdate(this, this.controllerFlags & Controller.UpdateMask, false);
    this.requireUpdate(this.mountFlags);
  }

  protected didMount(): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidMount !== void 0) {
        controllerObserver.controllerDidMount(this);
      }
    }
  }

  abstract cascadeUnmount(): void;

  protected willUnmount(): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillUnmount !== void 0) {
        controllerObserver.controllerWillUnmount(this);
      }
    }
  }

  protected onUnmount(): void {
    // hook
  }

  protected didUnmount(): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidUnmount !== void 0) {
        controllerObserver.controllerDidUnmount(this);
      }
    }
  }

  isPowered(): boolean {
    return (this.controllerFlags & Controller.PoweredFlag) !== 0;
  }

  get powerFlags(): ControllerFlags {
    return (this.constructor as ControllerClass).powerFlags;
  }

  abstract cascadePower(): void;

  protected willPower(): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillPower !== void 0) {
        controllerObserver.controllerWillPower(this);
      }
    }
  }

  protected onPower(): void {
    this.requestUpdate(this, this.controllerFlags & Controller.UpdateMask, false);
    this.requireUpdate(this.powerFlags);
  }

  protected didPower(): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidPower !== void 0) {
        controllerObserver.controllerDidPower(this);
      }
    }
  }

  abstract cascadeUnpower(): void;

  protected willUnpower(): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillUnpower !== void 0) {
        controllerObserver.controllerWillUnpower(this);
      }
    }
  }

  protected onUnpower(): void {
    // hook
  }

  protected didUnpower(): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidUnpower !== void 0) {
        controllerObserver.controllerDidUnpower(this);
      }
    }
  }

  requireUpdate(updateFlags: ControllerFlags, immediate: boolean = false): void {
    const controllerFlags = this.controllerFlags;
    const deltaUpdateFlags = updateFlags & ~controllerFlags & Controller.UpdateMask;
    if (deltaUpdateFlags !== 0) {
      this.setControllerFlags(controllerFlags | deltaUpdateFlags);
      this.requestUpdate(this, deltaUpdateFlags, immediate);
    }
  }

  protected needsUpdate(updateFlags: ControllerFlags, immediate: boolean): ControllerFlags {
    return updateFlags;
  }

  requestUpdate(targetController: Controller, updateFlags: ControllerFlags, immediate: boolean): void {
    updateFlags = this.needsUpdate(updateFlags, immediate);
    let deltaUpdateFlags = this.controllerFlags & ~updateFlags & Controller.UpdateMask;
    if ((updateFlags & Controller.CompileMask) !== 0) {
      deltaUpdateFlags |= Controller.NeedsCompile;
    }
    if ((updateFlags & Controller.ExecuteMask) !== 0) {
      deltaUpdateFlags |= Controller.NeedsExecute;
    }
    if (deltaUpdateFlags !== 0 || immediate) {
      this.setControllerFlags(this.controllerFlags | deltaUpdateFlags);
      const parentController = this.parentController;
      if (parentController !== null) {
        parentController.requestUpdate(targetController, updateFlags, immediate);
      } else if (this.isMounted()) {
        const executeManager = this.executeService.manager;
        if (executeManager !== void 0 && executeManager !== null) {
          executeManager.requestUpdate(targetController, updateFlags, immediate);
        }
      }
    }
  }

  isTraversing(): boolean {
    return (this.controllerFlags & Controller.TraversingFlag) !== 0;
  }

  isUpdating(): boolean {
    return (this.controllerFlags & Controller.UpdatingMask) !== 0;
  }

  isCompiling(): boolean {
    return (this.controllerFlags & Controller.CompilingFlag) !== 0;
  }

  protected needsCompile(compileFlags: ControllerFlags, controllerContext: ControllerContextType<this>): ControllerFlags {
    return compileFlags;
  }

  abstract cascadeCompile(compileFlags: ControllerFlags, controllerContext: ControllerContext): void;

  protected willCompile(compileFlags: ControllerFlags, controllerContext: ControllerContextType<this>): void {
    // hook
  }

  protected onCompile(compileFlags: ControllerFlags, controllerContext: ControllerContextType<this>): void {
    // hook
  }

  protected didCompile(compileFlags: ControllerFlags, controllerContext: ControllerContextType<this>): void {
    // hook
  }

  protected willResolve(controllerContext: ControllerContextType<this>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillResolve !== void 0) {
        controllerObserver.controllerWillResolve(controllerContext, this);
      }
    }
  }

  protected onResolve(controllerContext: ControllerContextType<this>): void {
    // hook
  }

  protected didResolve(controllerContext: ControllerContextType<this>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidResolve !== void 0) {
        controllerObserver.controllerDidResolve(controllerContext, this);
      }
    }
  }

  protected willGenerate(controllerContext: ControllerContextType<this>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillGenerate !== void 0) {
        controllerObserver.controllerWillGenerate(controllerContext, this);
      }
    }
  }

  protected onGenerate(controllerContext: ControllerContextType<this>): void {
    // hook
  }

  protected didGenerate(controllerContext: ControllerContextType<this>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidGenerate !== void 0) {
        controllerObserver.controllerDidGenerate(controllerContext, this);
      }
    }
  }

  protected willAssemble(controllerContext: ControllerContextType<this>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillAssemble !== void 0) {
        controllerObserver.controllerWillAssemble(controllerContext, this);
      }
    }
  }

  protected onAssemble(controllerContext: ControllerContextType<this>): void {
    // hook
  }

  protected didAssemble(controllerContext: ControllerContextType<this>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidAssemble !== void 0) {
        controllerObserver.controllerDidAssemble(controllerContext, this);
      }
    }
  }

  protected compileChildControllers(compileFlags: ControllerFlags, controllerContext: ControllerContextType<this>,
                                    compileChildController: (this: this, childController: Controller, compileFlags: ControllerFlags,
                                                             controllerContext: ControllerContextType<this>) => void): void {
    type self = this;
    function doCompileChildController(this: self, childController: Controller): void {
      compileChildController.call(this, childController, compileFlags, controllerContext);
      if ((childController.controllerFlags & Controller.RemovingFlag) !== 0) {
        childController.setControllerFlags(childController.controllerFlags & ~Controller.RemovingFlag);
        this.removeChildController(childController);
      }
    }
    this.forEachChildController(doCompileChildController, this);
  }

  protected compileChildController(childController: Controller, compileFlags: ControllerFlags, controllerContext: ControllerContextType<this>): void {
    childController.cascadeCompile(compileFlags, controllerContext);
  }

  isExecuting(): boolean {
    return (this.controllerFlags & Controller.ExecutingFlag) !== 0;
  }

  protected needsExecute(executeFlags: ControllerFlags, controllerContext: ControllerContextType<this>): ControllerFlags {
    return executeFlags;
  }

  abstract cascadeExecute(executeFlags: ControllerFlags, controllerContext: ControllerContext): void;

  protected willExecute(executeFlags: ControllerFlags, controllerContext: ControllerContextType<this>): void {
    // hook
  }

  protected onExecute(executeFlags: ControllerFlags, controllerContext: ControllerContextType<this>): void {
    // hook
  }

  protected didExecute(executeFlags: ControllerFlags, controllerContext: ControllerContextType<this>): void {
    // hook
  }

  protected willRevise(controllerContext: ControllerContextType<this>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillRevise !== void 0) {
        controllerObserver.controllerWillRevise(controllerContext, this);
      }
    }
  }

  protected onRevise(controllerContext: ControllerContextType<this>): void {
    // hook
  }

  protected didRevise(controllerContext: ControllerContextType<this>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidRevise !== void 0) {
        controllerObserver.controllerDidRevise(controllerContext, this);
      }
    }
  }

  protected willCompute(controllerContext: ControllerContextType<this>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillCompute !== void 0) {
        controllerObserver.controllerWillCompute(controllerContext, this);
      }
    }
  }

  protected onCompute(controllerContext: ControllerContextType<this>): void {
    // hook
  }

  protected didCompute(controllerContext: ControllerContextType<this>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidCompute !== void 0) {
        controllerObserver.controllerDidCompute(controllerContext, this);
      }
    }
  }

  protected executeChildControllers(executeFlags: ControllerFlags, controllerContext: ControllerContextType<this>,
                                    executeChildController: (this: this, childController: Controller, executeFlags: ControllerFlags,
                                                             controllerContext: ControllerContextType<this>) => void): void {
    type self = this;
    function doExecuteChildController(this: self, childController: Controller): void {
      executeChildController.call(this, childController, executeFlags, controllerContext);
      if ((childController.controllerFlags & Controller.RemovingFlag) !== 0) {
        childController.setControllerFlags(childController.controllerFlags & ~Controller.RemovingFlag);
        this.removeChildController(childController);
      }
    }
    this.forEachChildController(doExecuteChildController, this);
  }

  /** @hidden */
  protected executeChildController(childController: Controller, executeFlags: ControllerFlags, controllerContext: ControllerContextType<this>): void {
    childController.cascadeExecute(executeFlags, controllerContext);
  }

  abstract hasControllerService(serviceName: string): boolean;

  abstract getControllerService(serviceName: string): ControllerService<this, unknown> | null;

  abstract setControllerService(serviceName: string, controllerService: ControllerService<this, unknown> | null): void;

  /** @hidden */
  getLazyControllerService(serviceName: string): ControllerService<this, unknown> | null {
    let controllerService = this.getControllerService(serviceName);
    if (controllerService === null) {
      const constructor = Controller.getControllerServiceConstructor(serviceName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        controllerService = new constructor(this, serviceName) as ControllerService<this, unknown>;
        this.setControllerService(serviceName, controllerService);
      }
    }
    return controllerService;
  }

  abstract hasControllerProperty(propertyName: string): boolean;

  abstract getControllerProperty(propertyName: string): ControllerProperty<this, unknown> | null;

  abstract setControllerProperty(propertyName: string, controllerProperty: ControllerProperty<this, unknown> | null): void;

  /** @hidden */
  getLazyControllerProperty(propertyName: string): ControllerProperty<this, unknown> | null {
    let controllerProperty = this.getControllerProperty(propertyName);
    if (controllerProperty === null) {
      const constructor = Controller.getControllerPropertyConstructor(propertyName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        controllerProperty = new constructor(this, propertyName) as ControllerProperty<this, unknown>;
        this.setControllerProperty(propertyName, controllerProperty);
      }
    }
    return controllerProperty
  }

  abstract hasControllerModel(fastenerName: string): boolean;

  abstract getControllerModel(fastenerName: string): ControllerModel<this, Model> | null;

  abstract setControllerModel(fastenerName: string, controllerModel: ControllerModel<this, any> | null): void;

  /** @hidden */
  getLazyControllerModel(fastenerName: string): ControllerModel<this, Model> | null {
    let controllerModel = this.getControllerModel(fastenerName);
    if (controllerModel === null) {
      const constructor = Controller.getControllerModelConstructor(fastenerName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        const key = constructor.prototype.key === true ? fastenerName
                  : constructor.prototype.key === false ? void 0
                  : constructor.prototype.key;
        controllerModel = new constructor(this, key, fastenerName) as ControllerModel<this, Model>;
        this.setControllerModel(fastenerName, controllerModel);
      }
    }
    return controllerModel;
  }

  abstract hasControllerTrait(fastenerName: string): boolean;

  abstract getControllerTrait(fastenerName: string): ControllerTrait<this, Trait> | null;

  abstract setControllerTrait(fastenerName: string, controllerTrait: ControllerTrait<this, any> | null): void;

  /** @hidden */
  getLazyControllerTrait(fastenerName: string): ControllerTrait<this, Trait> | null {
    let controllerTrait = this.getControllerTrait(fastenerName);
    if (controllerTrait === null) {
      const constructor = Controller.getControllerTraitConstructor(fastenerName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        const key = constructor.prototype.key === true ? fastenerName
                  : constructor.prototype.key === false ? void 0
                  : constructor.prototype.key;
        controllerTrait = new constructor(this, key, fastenerName) as ControllerTrait<this, Trait>;
        this.setControllerTrait(fastenerName, controllerTrait);
      }
    }
    return controllerTrait;
  }

  abstract hasControllerView(fastenerName: string): boolean;

  abstract getControllerView(fastenerName: string): ControllerView<this, View> | null;

  abstract setControllerView(fastenerName: string, controllerView: ControllerView<this, any> | null): void;

  /** @hidden */
  getLazyControllerView(fastenerName: string): ControllerView<this, View> | null {
    let controllerView = this.getControllerView(fastenerName);
    if (controllerView === null) {
      const constructor = Controller.getControllerViewConstructor(fastenerName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        const key = constructor.prototype.key === true ? fastenerName
                  : constructor.prototype.key === false ? void 0
                  : constructor.prototype.key;
        controllerView = new constructor(this, key, fastenerName) as ControllerView<this, View>;
        this.setControllerView(fastenerName, controllerView);
      }
    }
    return controllerView;
  }

  abstract hasControllerViewTrait(fastenerName: string): boolean;

  abstract getControllerViewTrait(fastenerName: string): ControllerViewTrait<this, View, Trait> | null;

  abstract setControllerViewTrait(fastenerName: string, controllerViewTrait: ControllerViewTrait<this, any, any> | null): void;

  /** @hidden */
  getLazyControllerViewTrait(fastenerName: string): ControllerViewTrait<this, View, Trait> | null {
    let controllerViewTrait = this.getControllerViewTrait(fastenerName);
    if (controllerViewTrait === null) {
      const constructor = Controller.getControllerViewTraitConstructor(fastenerName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        const viewKey = constructor.prototype.viewKey === true ? fastenerName
                      : constructor.prototype.viewKey === false ? void 0
                      : constructor.prototype.viewKey;
        const traitKey = constructor.prototype.traitKey === true ? fastenerName
                       : constructor.prototype.traitKey === false ? void 0
                       : constructor.prototype.traitKey;
        controllerViewTrait = new constructor(this, viewKey, traitKey, fastenerName) as ControllerViewTrait<this, View, Trait>;
        this.setControllerViewTrait(fastenerName, controllerViewTrait);
      }
    }
    return controllerViewTrait;
  }

  abstract hasControllerFastener(fastenerName: string): boolean;

  abstract getControllerFastener(fastenerName: string): ControllerFastener<this, Controller> | null;

  abstract setControllerFastener(fastenerName: string, controllerFastener: ControllerFastener<this, any> | null): void;

  /** @hidden */
  getLazyControllerFastener(fastenerName: string): ControllerFastener<this, Controller> | null {
    let controllerFastener = this.getControllerFastener(fastenerName);
    if (controllerFastener === null) {
      const constructor = Controller.getControllerFastenerConstructor(fastenerName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        const key = constructor.prototype.key === true ? fastenerName
                  : constructor.prototype.key === false ? void 0
                  : constructor.prototype.key;
        controllerFastener = new constructor(this, key, fastenerName) as ControllerFastener<this, Controller>;
        this.setControllerFastener(fastenerName, controllerFastener);
      }
    }
    return controllerFastener;
  }

  abstract hasGesture(gestureName: string): boolean;

  abstract getGesture(gestureName: string): Gesture<this, View> | null;

  abstract setGesture(gestureName: string, gesture: Gesture<this, any> | null): void;

  /** @hidden */
  getLazyGesture(gestureName: string): Gesture<this, View> | null {
    let gesture = this.getGesture(gestureName);
    if (gesture === null) {
      const constructor = GestureContext.getGestureConstructor(gestureName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        gesture = new constructor(this, gestureName);
        this.setGesture(gestureName, gesture);
      }
    }
    return gesture;
  }

  /** @hidden */
  extendControllerContext(controllerContext: ControllerContext): ControllerContextType<this> {
    return controllerContext as ControllerContextType<this>;
  }

  get superControllerContext(): ControllerContext {
    const parentController = this.parentController;
    if (parentController !== null) {
      return parentController.controllerContext;
    } else {
      return this.executeService.updatedControllerContext();
    }
  }

  get controllerContext(): ControllerContext {
    return this.extendControllerContext(this.superControllerContext);
  }

  /** @hidden */
  static getControllerServiceConstructor(serviceName: string, controllerPrototype: ControllerPrototype | null = null): ControllerServiceConstructor<Controller, unknown> | null {
    if (controllerPrototype === null) {
      controllerPrototype = this.prototype as ControllerPrototype;
    }
    do {
      if (Object.prototype.hasOwnProperty.call(controllerPrototype, "controllerServiceConstructors")) {
        const constructor = controllerPrototype.controllerServiceConstructors![serviceName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      controllerPrototype = Object.getPrototypeOf(controllerPrototype);
    } while (controllerPrototype !== null);
    return null;
  }

  /** @hidden */
  static decorateControllerService(constructor: ControllerServiceConstructor<Controller, unknown>,
                                   target: Object, propertyKey: string | symbol): void {
    const controllerPrototype = target as ControllerPrototype;
    if (!Object.prototype.hasOwnProperty.call(controllerPrototype, "controllerServiceConstructors")) {
      controllerPrototype.controllerServiceConstructors = {};
    }
    controllerPrototype.controllerServiceConstructors![propertyKey.toString()] = constructor;
    Object.defineProperty(target, propertyKey, {
      get: function (this: Controller): ControllerService<Controller, unknown> {
        let controllerService = this.getControllerService(propertyKey.toString());
        if (controllerService === null) {
          controllerService = new constructor(this, propertyKey.toString());
          this.setControllerService(propertyKey.toString(), controllerService);
        }
        return controllerService;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static getControllerPropertyConstructor(propertyName: string, controllerPrototype: ControllerPrototype | null = null): ControllerPropertyConstructor<Controller, unknown> | null {
    if (controllerPrototype === null) {
      controllerPrototype = this.prototype as ControllerPrototype;
    }
    do {
      if (Object.prototype.hasOwnProperty.call(controllerPrototype, "controllerPropertyConstructors")) {
        const constructor = controllerPrototype.controllerPropertyConstructors![propertyName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      controllerPrototype = Object.getPrototypeOf(controllerPrototype);
    } while (controllerPrototype !== null);
    return null;
  }

  /** @hidden */
  static decorateControllerProperty(constructor: ControllerPropertyConstructor<Controller, unknown>,
                                    target: Object, propertyKey: string | symbol): void {
    const controllerPrototype = target as ControllerPrototype;
    if (!Object.prototype.hasOwnProperty.call(controllerPrototype, "controllerPropertyConstructors")) {
      controllerPrototype.controllerPropertyConstructors = {};
    }
    controllerPrototype.controllerPropertyConstructors![propertyKey.toString()] = constructor;
    Object.defineProperty(target, propertyKey, {
      get: function (this: Controller): ControllerProperty<Controller, unknown> {
        let controllerProperty = this.getControllerProperty(propertyKey.toString());
        if (controllerProperty === null) {
          controllerProperty = new constructor(this, propertyKey.toString());
          this.setControllerProperty(propertyKey.toString(), controllerProperty);
        }
        return controllerProperty;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static getControllerModelConstructor(fastenerName: string, controllerPrototype: ControllerPrototype | null = null): ControllerModelConstructor<Controller, Model> | null {
    if (controllerPrototype === null) {
      controllerPrototype = this.prototype as ControllerPrototype;
    }
    do {
      if (Object.prototype.hasOwnProperty.call(controllerPrototype, "controllerModelConstructors")) {
        const constructor = controllerPrototype.controllerModelConstructors![fastenerName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      controllerPrototype = Object.getPrototypeOf(controllerPrototype);
    } while (controllerPrototype !== null);
    return null;
  }

  /** @hidden */
  static decorateControllerModel(constructor: ControllerModelConstructor<Controller, Model>,
                                 target: Object, propertyKey: string | symbol): void {
    const fastenerName = propertyKey.toString();
    const key = constructor.prototype.key === true ? fastenerName
              : constructor.prototype.key === false ? void 0
              : constructor.prototype.key;
    const controllerPrototype = target as ControllerPrototype;
    if (!Object.prototype.hasOwnProperty.call(controllerPrototype, "controllerModelConstructors")) {
      controllerPrototype.controllerModelConstructors = {};
    }
    controllerPrototype.controllerModelConstructors![fastenerName] = constructor;
    Object.defineProperty(target, propertyKey, {
      get: function (this: Controller): ControllerModel<Controller, Model> {
        let controllerModel = this.getControllerModel(fastenerName);
        if (controllerModel === null) {
          controllerModel = new constructor(this, key, fastenerName);
          this.setControllerModel(fastenerName, controllerModel);
        }
        return controllerModel;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static getControllerTraitConstructor(fastenerName: string, controllerPrototype: ControllerPrototype | null = null): ControllerTraitConstructor<Controller, Trait> | null {
    if (controllerPrototype === null) {
      controllerPrototype = this.prototype as ControllerPrototype;
    }
    do {
      if (Object.prototype.hasOwnProperty.call(controllerPrototype, "controllerTraitConstructors")) {
        const constructor = controllerPrototype.controllerTraitConstructors![fastenerName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      controllerPrototype = Object.getPrototypeOf(controllerPrototype);
    } while (controllerPrototype !== null);
    return null;
  }

  /** @hidden */
  static decorateControllerTrait(constructor: ControllerTraitConstructor<Controller, Trait>,
                                 target: Object, propertyKey: string | symbol): void {
    const fastenerName = propertyKey.toString();
    const key = constructor.prototype.key === true ? fastenerName
              : constructor.prototype.key === false ? void 0
              : constructor.prototype.key;
    const controllerPrototype = target as ControllerPrototype;
    if (!Object.prototype.hasOwnProperty.call(controllerPrototype, "controllerTraitConstructors")) {
      controllerPrototype.controllerTraitConstructors = {};
    }
    controllerPrototype.controllerTraitConstructors![fastenerName] = constructor;
    Object.defineProperty(target, propertyKey, {
      get: function (this: Controller): ControllerTrait<Controller, Trait> {
        let controllerTrait = this.getControllerTrait(fastenerName);
        if (controllerTrait === null) {
          controllerTrait = new constructor(this, key, fastenerName);
          this.setControllerTrait(fastenerName, controllerTrait);
        }
        return controllerTrait;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static getControllerViewConstructor(fastenerName: string, controllerPrototype: ControllerPrototype | null = null): ControllerViewConstructor<Controller, View> | null {
    if (controllerPrototype === null) {
      controllerPrototype = this.prototype as ControllerPrototype;
    }
    do {
      if (Object.prototype.hasOwnProperty.call(controllerPrototype, "controllerViewConstructors")) {
        const constructor = controllerPrototype.controllerViewConstructors![fastenerName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      controllerPrototype = Object.getPrototypeOf(controllerPrototype);
    } while (controllerPrototype !== null);
    return null;
  }

  /** @hidden */
  static decorateControllerView(constructor: ControllerViewConstructor<Controller, View>,
                                target: Object, propertyKey: string | symbol): void {
    const fastenerName = propertyKey.toString();
    const key = constructor.prototype.key === true ? fastenerName
              : constructor.prototype.key === false ? void 0
              : constructor.prototype.key;
    const controllerPrototype = target as ControllerPrototype;
    if (!Object.prototype.hasOwnProperty.call(controllerPrototype, "controllerViewConstructors")) {
      controllerPrototype.controllerViewConstructors = {};
    }
    controllerPrototype.controllerViewConstructors![fastenerName] = constructor;
    Object.defineProperty(target, propertyKey, {
      get: function (this: Controller): ControllerView<Controller, View> {
        let controllerView = this.getControllerView(fastenerName);
        if (controllerView === null) {
          controllerView = new constructor(this, key, fastenerName);
          this.setControllerView(fastenerName, controllerView);
        }
        return controllerView;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static getControllerViewTraitConstructor(fastenerName: string, controllerPrototype: ControllerPrototype | null = null): ControllerViewTraitConstructor<Controller, View, Trait> | null {
    if (controllerPrototype === null) {
      controllerPrototype = this.prototype as ControllerPrototype;
    }
    do {
      if (Object.prototype.hasOwnProperty.call(controllerPrototype, "controllerViewTraitConstructors")) {
        const constructor = controllerPrototype.controllerViewTraitConstructors![fastenerName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      controllerPrototype = Object.getPrototypeOf(controllerPrototype);
    } while (controllerPrototype !== null);
    return null;
  }

  /** @hidden */
  static decorateControllerViewTrait(constructor: ControllerViewTraitConstructor<Controller, View, Trait>,
                                     target: Object, propertyKey: string | symbol): void {
    const fastenerName = propertyKey.toString();
    const viewKey = constructor.prototype.viewKey === true ? fastenerName
                  : constructor.prototype.viewKey === false ? void 0
                  : constructor.prototype.viewKey;
    const traitKey = constructor.prototype.traitKey === true ? fastenerName
                   : constructor.prototype.traitKey === false ? void 0
                   : constructor.prototype.traitKey;
    const controllerPrototype = target as ControllerPrototype;
    if (!Object.prototype.hasOwnProperty.call(controllerPrototype, "controllerViewTraitConstructors")) {
      controllerPrototype.controllerViewTraitConstructors = {};
    }
    controllerPrototype.controllerViewTraitConstructors![fastenerName] = constructor;
    Object.defineProperty(target, propertyKey, {
      get: function (this: Controller): ControllerViewTrait<Controller, View, Trait> {
        let controllerViewTrait = this.getControllerViewTrait(fastenerName);
        if (controllerViewTrait === null) {
          controllerViewTrait = new constructor(this, viewKey, traitKey, fastenerName);
          this.setControllerViewTrait(fastenerName, controllerViewTrait);
        }
        return controllerViewTrait;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static getControllerFastenerConstructor(fastenerName: string, controllerPrototype: ControllerPrototype | null = null): ControllerFastenerConstructor<Controller, Controller> | null {
    if (controllerPrototype === null) {
      controllerPrototype = this.prototype as ControllerPrototype;
    }
    do {
      if (Object.prototype.hasOwnProperty.call(controllerPrototype, "controllerFastenerConstructors")) {
        const constructor = controllerPrototype.controllerFastenerConstructors![fastenerName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      controllerPrototype = Object.getPrototypeOf(controllerPrototype);
    } while (controllerPrototype !== null);
    return null;
  }

  /** @hidden */
  static decorateControllerFastener(constructor: ControllerFastenerConstructor<Controller, Controller>,
                                    target: Object, propertyKey: string | symbol): void {
    const fastenerName = propertyKey.toString();
    const key = constructor.prototype.key === true ? fastenerName
              : constructor.prototype.key === false ? void 0
              : constructor.prototype.key;
    const controllerPrototype = target as ControllerPrototype;
    if (!Object.prototype.hasOwnProperty.call(controllerPrototype, "controllerFastenerConstructors")) {
      controllerPrototype.controllerFastenerConstructors = {};
    }
    controllerPrototype.controllerFastenerConstructors![propertyKey.toString()] = constructor;
    Object.defineProperty(target, propertyKey, {
      get: function (this: Controller): ControllerFastener<Controller, Controller> {
        let controllerFastener = this.getControllerFastener(fastenerName);
        if (controllerFastener === null) {
          controllerFastener = new constructor(this, key, fastenerName);
          this.setControllerFastener(fastenerName, controllerFastener);
        }
        return controllerFastener;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static readonly MountedFlag: ControllerFlags = 1 << 0;
  /** @hidden */
  static readonly PoweredFlag: ControllerFlags = 1 << 1;
  /** @hidden */
  static readonly TraversingFlag: ControllerFlags = 1 << 2;
  /** @hidden */
  static readonly CompilingFlag: ControllerFlags = 1 << 3;
  /** @hidden */
  static readonly ExecutingFlag: ControllerFlags = 1 << 4;
  /** @hidden */
  static readonly RemovingFlag: ControllerFlags = 1 << 5;
  /** @hidden */
  static readonly ImmediateFlag: ControllerFlags = 1 << 6;
  /** @hidden */
  static readonly UpdatingMask: ControllerFlags = Controller.CompilingFlag
                                                | Controller.ExecutingFlag;
  /** @hidden */
  static readonly StatusMask: ControllerFlags = Controller.MountedFlag
                                              | Controller.PoweredFlag
                                              | Controller.TraversingFlag
                                              | Controller.CompilingFlag
                                              | Controller.ExecutingFlag
                                              | Controller.RemovingFlag
                                              | Controller.ImmediateFlag;

  static readonly NeedsCompile: ControllerFlags = 1 << 7;
  static readonly NeedsResolve: ControllerFlags = 1 << 8;
  static readonly NeedsGenerate: ControllerFlags = 1 << 9;
  static readonly NeedsAssemble: ControllerFlags = 1 << 10;
  /** @hidden */
  static readonly CompileMask: ControllerFlags = Controller.NeedsCompile
                                               | Controller.NeedsResolve
                                               | Controller.NeedsGenerate
                                               | Controller.NeedsAssemble;

  static readonly NeedsExecute: ControllerFlags = 1 << 11;
  static readonly NeedsRevise: ControllerFlags = 1 << 12;
  static readonly NeedsCompute: ControllerFlags = 1 << 13;
  /** @hidden */
  static readonly ExecuteMask: ControllerFlags = Controller.NeedsExecute
                                               | Controller.NeedsRevise
                                               | Controller.NeedsCompute;

  /** @hidden */
  static readonly UpdateMask: ControllerFlags = Controller.CompileMask
                                              | Controller.ExecuteMask;

  /** @hidden */
  static readonly ControllerFlagShift: ControllerFlags = 24;
  /** @hidden */
  static readonly ControllerFlagMask: ControllerFlags = (1 << Controller.ControllerFlagShift) - 1;

  static readonly mountFlags: ControllerFlags = 0;
  static readonly powerFlags: ControllerFlags = 0;
  static readonly insertChildFlags: ControllerFlags = 0;
  static readonly removeChildFlags: ControllerFlags = 0;

  static readonly Intrinsic: ControllerPrecedence = 0;
  static readonly Extrinsic: ControllerPrecedence = 1;
}
