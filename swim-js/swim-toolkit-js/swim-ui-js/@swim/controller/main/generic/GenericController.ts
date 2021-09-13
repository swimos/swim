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

import {View, GestureContext, Gesture} from "@swim/view";
import type {Model, Trait} from "@swim/model";
import type {ControllerContextType, ControllerContext} from "../ControllerContext";
import {ControllerFlags, Controller} from "../Controller";
import type {ControllerObserverType} from "../ControllerObserver";
import type {ControllerService} from "../service/ControllerService";
import type {ControllerProperty} from "../property/ControllerProperty";
import type {ControllerModel} from "../fastener/ControllerModel";
import type {ControllerTrait} from "../fastener/ControllerTrait";
import type {ControllerView} from "../fastener/ControllerView";
import type {ControllerViewTrait} from "../fastener/ControllerViewTrait";
import type {ControllerFastener} from "../fastener/ControllerFastener";

export abstract class GenericController extends Controller {
  constructor() {
    super();
    Object.defineProperty(this, "key", {
      value: void 0,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "parentController", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "controllerServices", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "controllerProperties", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "controllerModels", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "controllerTraits", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "controllerViews", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "controllerViewTraits", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "controllerFasteners", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "gestures", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  protected willObserve<T>(callback: (this: this, controllerObserver: ControllerObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      result = callback.call(this, controllerObserver as ControllerObserverType<this>) as T | undefined;
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  protected didObserve<T>(callback: (this: this, controllerObserver: ControllerObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      result = callback.call(this, controllerObserver as ControllerObserverType<this>) as T | undefined;
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  override readonly key!: string | undefined;

  /** @hidden */
  override setKey(key: string | undefined): void {
    Object.defineProperty(this, "key", {
      value: key,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly parentController!: Controller | null;

  /** @hidden */
  override setParentController(newParentController: Controller | null, oldParentController: Controller | null): void {
    this.willSetParentController(newParentController, oldParentController);
    if (oldParentController !== null) {
      this.detachParentController(oldParentController);
    }
    Object.defineProperty(this, "parentController", {
      value: newParentController,
      enumerable: true,
      configurable: true,
    });
    if (newParentController !== null) {
      this.attachParentController(newParentController);
    }
    this.onSetParentController(newParentController, oldParentController);
    this.didSetParentController(newParentController, oldParentController);
  }

  override remove(): void {
    const parentController = this.parentController;
    if (parentController !== null) {
      if ((this.controllerFlags & Controller.TraversingFlag) === 0) {
        parentController.removeChildController(this);
      } else {
        this.setControllerFlags(this.controllerFlags | Controller.RemovingFlag);
      }
    }
  }

  abstract override readonly childControllerCount: number;

  abstract override readonly childControllers: ReadonlyArray<Controller>;

  abstract override forEachChildController<T>(callback: (childController: Controller) => T | void): T | undefined;
  abstract override forEachChildController<T, S>(callback: (this: S, childController: Controller) => T | void,
                                                 thisArg: S): T | undefined;

  abstract override getChildController(key: string): Controller | null;

  abstract override setChildController(key: string, newChildController: Controller | null): Controller | null;

  abstract override appendChildController(childController: Controller, key?: string): void;

  abstract override prependChildController(childController: Controller, key?: string): void;

  abstract override insertChildController(childController: Controller, targetController: Controller | null, key?: string): void;

  protected override onInsertChildController(childController: Controller, targetController: Controller | null): void {
    super.onInsertChildController(childController, targetController);
    this.insertControllerFastener(childController, targetController);
  }

  override cascadeInsert(updateFlags?: ControllerFlags, controllerContext?: ControllerContext): void {
    // nop
  }

  abstract override removeChildController(key: string): Controller | null;
  abstract override removeChildController(childController: Controller): void;

  protected override onRemoveChildController(childController: Controller): void {
    super.onRemoveChildController(childController);
    this.removeControllerFastener(childController);
  }

  abstract override removeAll(): void;

  override cascadeMount(): void {
    if ((this.controllerFlags & Controller.MountedFlag) === 0) {
      this.setControllerFlags(this.controllerFlags | (Controller.MountedFlag | Controller.TraversingFlag));
      try {
        this.willMount();
        this.onMount();
        this.mountChildControllers();
        this.didMount();
      } finally {
        this.setControllerFlags(this.controllerFlags & ~Controller.TraversingFlag);
      }
    } else {
      throw new Error("already mounted");
    }
  }

  protected override onMount(): void {
    super.onMount();
    this.mountControllerServices();
    this.mountControllerProperties();
    this.mountControllerModels();
    this.mountControllerTraits();
    this.mountControllerViews();
    this.mountControllerViewTraits();
    this.mountControllerFasteners();
    this.mountGestures();
  }

  /** @hidden */
  protected mountChildControllers(): void {
    type self = this;
    function mountChildController(this: self, childController: Controller): void {
      childController.cascadeMount();
      if ((childController.controllerFlags & Controller.RemovingFlag) !== 0) {
        childController.setControllerFlags(childController.controllerFlags & ~Controller.RemovingFlag);
        this.removeChildController(childController);
      }
    }
    this.forEachChildController(mountChildController, this);
  }

  override cascadeUnmount(): void {
    if ((this.controllerFlags & Controller.MountedFlag) !== 0) {
      this.setControllerFlags(this.controllerFlags & ~Controller.MountedFlag | Controller.TraversingFlag);
      try {
        this.willUnmount();
        this.unmountChildControllers();
        this.onUnmount();
        this.didUnmount();
      } finally {
        this.setControllerFlags(this.controllerFlags & ~Controller.TraversingFlag);
      }
    } else {
      throw new Error("already unmounted");
    }
  }

  protected override onUnmount(): void {
    this.unmountGestures();
    this.unmountControllerFasteners();
    this.unmountControllerViewTraits();
    this.unmountControllerViews();
    this.unmountControllerTraits();
    this.unmountControllerModels();
    this.unmountControllerProperties();
    this.unmountControllerServices();
    this.setControllerFlags(this.controllerFlags & (~Controller.ControllerFlagMask | Controller.RemovingFlag));
  }

  /** @hidden */
  protected unmountChildControllers(): void {
    type self = this;
    function unmountChildController(this: self, childController: Controller): void {
      childController.cascadeUnmount();
      if ((childController.controllerFlags & Controller.RemovingFlag) !== 0) {
        childController.setControllerFlags(childController.controllerFlags & ~Controller.RemovingFlag);
        this.removeChildController(childController);
      }
    }
    this.forEachChildController(unmountChildController, this);
  }

  override cascadePower(): void {
    if ((this.controllerFlags & Controller.PoweredFlag) === 0) {
      this.setControllerFlags(this.controllerFlags | (Controller.PoweredFlag | Controller.TraversingFlag));
      try {
        this.willPower();
        this.onPower();
        this.powerChildControllers();
        this.didPower();
      } finally {
        this.setControllerFlags(this.controllerFlags & ~Controller.TraversingFlag);
      }
    } else {
      throw new Error("already powered");
    }
  }

  /** @hidden */
  protected powerChildControllers(): void {
    type self = this;
    function powerChildController(this: self, childController: Controller): void {
      childController.cascadePower();
      if ((childController.controllerFlags & Controller.RemovingFlag) !== 0) {
        childController.setControllerFlags(childController.controllerFlags & ~Controller.RemovingFlag);
        this.removeChildController(childController);
      }
    }
    this.forEachChildController(powerChildController, this);
  }

  override cascadeUnpower(): void {
    if ((this.controllerFlags & Controller.PoweredFlag) !== 0) {
      this.setControllerFlags(this.controllerFlags & ~Controller.PoweredFlag | Controller.TraversingFlag);
      try {
        this.willUnpower();
        this.unpowerChildControllers();
        this.onUnpower();
        this.didUnpower();
      } finally {
        this.setControllerFlags(this.controllerFlags & ~Controller.TraversingFlag);
      }
    } else {
      throw new Error("already unpowered");
    }
  }

  /** @hidden */
  protected unpowerChildControllers(): void {
    type self = this;
    function unpowerChildController(this: self, childController: Controller): void {
      childController.cascadeUnpower();
      if ((childController.controllerFlags & Controller.RemovingFlag) !== 0) {
        childController.setControllerFlags(childController.controllerFlags & ~Controller.RemovingFlag);
        this.removeChildController(childController);
      }
    }
    this.forEachChildController(unpowerChildController, this);
  }

  override cascadeCompile(compileFlags: ControllerFlags, baseControllerContext: ControllerContext): void {
    const controllerContext = this.extendControllerContext(baseControllerContext);
    compileFlags &= ~Controller.NeedsCompile;
    compileFlags |= this.controllerFlags & Controller.UpdateMask;
    compileFlags = this.needsCompile(compileFlags, controllerContext);
    if ((compileFlags & Controller.CompileMask) !== 0) {
      let cascadeFlags = compileFlags;
      this.setControllerFlags(this.controllerFlags & ~Controller.NeedsCompile
                                                   | (Controller.TraversingFlag | Controller.CompilingFlag));
      try {
        this.willCompile(cascadeFlags, controllerContext);
        if (((this.controllerFlags | compileFlags) & Controller.NeedsResolve) !== 0) {
          cascadeFlags |= Controller.NeedsResolve;
          this.setControllerFlags(this.controllerFlags & ~Controller.NeedsResolve);
          this.willResolve(controllerContext);
        }
        if (((this.controllerFlags | compileFlags) & Controller.NeedsGenerate) !== 0) {
          cascadeFlags |= Controller.NeedsGenerate;
          this.setControllerFlags(this.controllerFlags & ~Controller.NeedsGenerate);
          this.willGenerate(controllerContext);
        }
        if (((this.controllerFlags | compileFlags) & Controller.NeedsAssemble) !== 0) {
          cascadeFlags |= Controller.NeedsAssemble;
          this.setControllerFlags(this.controllerFlags & ~Controller.NeedsAssemble);
          this.willAssemble(controllerContext);
        }

        this.onCompile(cascadeFlags, controllerContext);
        if ((cascadeFlags & Controller.NeedsResolve) !== 0) {
          this.onResolve(controllerContext);
        }
        if ((cascadeFlags & Controller.NeedsGenerate) !== 0) {
          this.onGenerate(controllerContext);
        }
        if ((cascadeFlags & Controller.NeedsAssemble) !== 0) {
          this.onAssemble(controllerContext);
        }

        if ((cascadeFlags & Controller.CompileMask) !== 0) {
          this.compileChildControllers(cascadeFlags, controllerContext, this.compileChildController);
        }

        if ((cascadeFlags & Controller.NeedsAssemble) !== 0) {
          this.didAssemble(controllerContext);
        }
        if ((cascadeFlags & Controller.NeedsGenerate) !== 0) {
          this.didGenerate(controllerContext);
        }
        if ((cascadeFlags & Controller.NeedsResolve) !== 0) {
          this.didResolve(controllerContext);
        }
        this.didCompile(cascadeFlags, controllerContext);
      } finally {
        this.setControllerFlags(this.controllerFlags & ~(Controller.TraversingFlag | Controller.CompilingFlag));
      }
    }
  }

  override cascadeExecute(executeFlags: ControllerFlags, baseControllerContext: ControllerContext): void {
    const controllerContext = this.extendControllerContext(baseControllerContext);
    executeFlags &= ~Controller.NeedsExecute;
    executeFlags |= this.controllerFlags & Controller.UpdateMask;
    executeFlags = this.needsExecute(executeFlags, controllerContext);
    if ((executeFlags & Controller.ExecuteMask) !== 0) {
      let cascadeFlags = executeFlags;
      this.setControllerFlags(this.controllerFlags & ~Controller.NeedsExecute
                                                   | (Controller.TraversingFlag | Controller.ExecutingFlag));
      try {
        this.willExecute(cascadeFlags, controllerContext);
        if (((this.controllerFlags | executeFlags) & Controller.NeedsRevise) !== 0) {
          cascadeFlags |= Controller.NeedsRevise;
          this.setControllerFlags(this.controllerFlags & ~Controller.NeedsRevise);
          this.willRevise(controllerContext);
        }
        if (((this.controllerFlags | executeFlags) & Controller.NeedsCompute) !== 0) {
          cascadeFlags |= Controller.NeedsCompute;
          this.setControllerFlags(this.controllerFlags & ~Controller.NeedsCompute);
          this.willCompute(controllerContext);
        }

        this.onExecute(cascadeFlags, controllerContext);
        if ((cascadeFlags & Controller.NeedsRevise) !== 0) {
          this.onRevise(controllerContext);
        }
        if ((cascadeFlags & Controller.NeedsCompute) !== 0) {
          this.onCompute(controllerContext);
        }

        if ((cascadeFlags & Controller.ExecuteMask) !== 0) {
          this.executeChildControllers(cascadeFlags, controllerContext, this.executeChildController);
        }

        if ((cascadeFlags & Controller.NeedsCompute) !== 0) {
          this.didCompute(controllerContext);
        }
        if ((cascadeFlags & Controller.NeedsRevise) !== 0) {
          this.didRevise(controllerContext);
        }
        this.didExecute(cascadeFlags, controllerContext);
      } finally {
        this.setControllerFlags(this.controllerFlags & ~(Controller.TraversingFlag | Controller.ExecutingFlag));
      }
    }
  }

  protected override onRevise(controllerContext: ControllerContextType<this>): void {
    super.onRevise(controllerContext);
    this.reviseControllerProperties();
  }

  /** @hidden */
  readonly controllerServices!: {[serviceName: string]: ControllerService<Controller, unknown> | undefined} | null;

  override hasControllerService(serviceName: string): boolean {
    const controllerServices = this.controllerServices;
    return controllerServices !== null && controllerServices[serviceName] !== void 0;
  }

  override getControllerService(serviceName: string): ControllerService<this, unknown> | null {
    const controllerServices = this.controllerServices;
    if (controllerServices !== null) {
      const controllerService = controllerServices[serviceName];
      if (controllerService !== void 0) {
        return controllerService as ControllerService<this, unknown>;
      }
    }
    return null;
  }

  override setControllerService(serviceName: string, newControllerService: ControllerService<this, unknown> | null): void {
    let controllerServices = this.controllerServices;
    if (controllerServices === null) {
      controllerServices = {};
      Object.defineProperty(this, "controllerServices", {
        value: controllerServices,
        enumerable: true,
        configurable: true,
      });
    }
    const oldControllerService = controllerServices[serviceName];
    if (oldControllerService !== void 0 && this.isMounted()) {
      oldControllerService.unmount();
    }
    if (newControllerService !== null) {
      controllerServices[serviceName] = newControllerService;
      if (this.isMounted()) {
        newControllerService.mount();
      }
    } else {
      delete controllerServices[serviceName];
    }
  }

  /** @hidden */
  protected mountControllerServices(): void {
    const controllerServices = this.controllerServices;
    for (const serviceName in controllerServices) {
      const controllerService = controllerServices[serviceName]!;
      controllerService.mount();
    }
  }

  /** @hidden */
  protected unmountControllerServices(): void {
    const controllerServices = this.controllerServices;
    for (const serviceName in controllerServices) {
      const controllerService = controllerServices[serviceName]!;
      controllerService.unmount();
    }
  }

  /** @hidden */
  readonly controllerProperties!: {[propertyName: string]: ControllerProperty<Controller, unknown> | undefined} | null;

  override hasControllerProperty(propertyName: string): boolean {
    const controllerProperties = this.controllerProperties;
    return controllerProperties !== null && controllerProperties[propertyName] !== void 0;
  }

  override getControllerProperty(propertyName: string): ControllerProperty<this, unknown> | null {
    const controllerProperties = this.controllerProperties;
    if (controllerProperties !== null) {
      const controllerProperty = controllerProperties[propertyName];
      if (controllerProperty !== void 0) {
        return controllerProperty as ControllerProperty<this, unknown>;
      }
    }
    return null;
  }

  override setControllerProperty(propertyName: string, newControllerProperty: ControllerProperty<this, unknown> | null): void {
    let controllerProperties = this.controllerProperties;
    if (controllerProperties === null) {
      controllerProperties = {};
      Object.defineProperty(this, "controllerProperties", {
        value: controllerProperties,
        enumerable: true,
        configurable: true,
      });
    }
    const oldControllerProperty = controllerProperties[propertyName];
    if (oldControllerProperty !== void 0 && this.isMounted()) {
      oldControllerProperty.unmount();
    }
    if (newControllerProperty !== null) {
      controllerProperties[propertyName] = newControllerProperty;
      if (this.isMounted()) {
        newControllerProperty.mount();
      }
    } else {
      delete controllerProperties[propertyName];
    }
  }

  /** @hidden */
  reviseControllerProperties(): void {
    const controllerProperties = this.controllerProperties;
    for (const propertyName in controllerProperties) {
      const controllerProperty = controllerProperties[propertyName]!;
      controllerProperty.onRevise();
    }
  }

  /** @hidden */
  protected mountControllerProperties(): void {
    const controllerProperties = this.controllerProperties;
    for (const propertyName in controllerProperties) {
      const controllerProperty = controllerProperties[propertyName]!;
      controllerProperty.mount();
    }
  }

  /** @hidden */
  protected unmountControllerProperties(): void {
    const controllerProperties = this.controllerProperties;
    for (const propertyName in controllerProperties) {
      const controllerProperty = controllerProperties[propertyName]!;
      controllerProperty.unmount();
    }
  }

  /** @hidden */
  readonly controllerModels!: {[modelName: string]: ControllerModel<Controller, Model> | undefined} | null;

  override hasControllerModel(modelName: string): boolean {
    const controllerModels = this.controllerModels;
    return controllerModels !== null && controllerModels[modelName] !== void 0;
  }

  override getControllerModel(modelName: string): ControllerModel<this, Model> | null {
    const controllerModels = this.controllerModels;
    if (controllerModels !== null) {
      const controllerModel = controllerModels[modelName];
      if (controllerModel !== void 0) {
        return controllerModel as ControllerModel<this, Model>;
      }
    }
    return null;
  }

  override setControllerModel(modelName: string, newControllerModel: ControllerModel<this, any> | null): void {
    let controllerModels = this.controllerModels;
    if (controllerModels === null) {
      controllerModels = {};
      Object.defineProperty(this, "controllerModels", {
        value: controllerModels,
        enumerable: true,
        configurable: true,
      });
    }
    const oldControllerModel = controllerModels[modelName];
    if (oldControllerModel !== void 0 && this.isMounted()) {
      oldControllerModel.unmount();
    }
    if (newControllerModel !== null) {
      controllerModels[modelName] = newControllerModel;
      if (this.isMounted()) {
        newControllerModel.mount();
      }
    } else {
      delete controllerModels[modelName];
    }
  }

  /** @hidden */
  protected mountControllerModels(): void {
    const controllerModels = this.controllerModels;
    for (const modelName in controllerModels) {
      const controllerModel = controllerModels[modelName]!;
      controllerModel.mount();
    }
  }

  /** @hidden */
  protected unmountControllerModels(): void {
    const controllerModels = this.controllerModels;
    for (const modelName in controllerModels) {
      const controllerModel = controllerModels[modelName]!;
      controllerModel.unmount();
    }
  }

  /** @hidden */
  readonly controllerTraits!: {[traitName: string]: ControllerTrait<Controller, Trait> | undefined} | null;

  override hasControllerTrait(traitName: string): boolean {
    const controllerTraits = this.controllerTraits;
    return controllerTraits !== null && controllerTraits[traitName] !== void 0;
  }

  override getControllerTrait(traitName: string): ControllerTrait<this, Trait> | null {
    const controllerTraits = this.controllerTraits;
    if (controllerTraits !== null) {
      const controllerTrait = controllerTraits[traitName];
      if (controllerTrait !== void 0) {
        return controllerTrait as ControllerTrait<this, Trait>;
      }
    }
    return null;
  }

  override setControllerTrait(traitName: string, newControllerTrait: ControllerTrait<this, any> | null): void {
    let controllerTraits = this.controllerTraits;
    if (controllerTraits === null) {
      controllerTraits = {};
      Object.defineProperty(this, "controllerTraits", {
        value: controllerTraits,
        enumerable: true,
        configurable: true,
      });
    }
    const oldControllerTrait = controllerTraits[traitName];
    if (oldControllerTrait !== void 0 && this.isMounted()) {
      oldControllerTrait.unmount();
    }
    if (newControllerTrait !== null) {
      controllerTraits[traitName] = newControllerTrait;
      if (this.isMounted()) {
        newControllerTrait.mount();
      }
    } else {
      delete controllerTraits[traitName];
    }
  }

  /** @hidden */
  protected mountControllerTraits(): void {
    const controllerTraits = this.controllerTraits;
    for (const traitName in controllerTraits) {
      const controllerTrait = controllerTraits[traitName]!;
      controllerTrait.mount();
    }
  }

  /** @hidden */
  protected unmountControllerTraits(): void {
    const controllerTraits = this.controllerTraits;
    for (const traitName in controllerTraits) {
      const controllerTrait = controllerTraits[traitName]!;
      controllerTrait.unmount();
    }
  }

  /** @hidden */
  readonly controllerViews!: {[viewName: string]: ControllerView<Controller, View> | undefined} | null;

  override hasControllerView(viewName: string): boolean {
    const controllerViews = this.controllerViews;
    return controllerViews !== null && controllerViews[viewName] !== void 0;
  }

  override getControllerView(viewName: string): ControllerView<this, View> | null {
    const controllerViews = this.controllerViews;
    if (controllerViews !== null) {
      const controllerView = controllerViews[viewName];
      if (controllerView !== void 0) {
        return controllerView as ControllerView<this, View>;
      }
    }
    return null;
  }

  override setControllerView(viewName: string, newControllerView: ControllerView<this, any> | null): void {
    let controllerViews = this.controllerViews;
    if (controllerViews === null) {
      controllerViews = {};
      Object.defineProperty(this, "controllerViews", {
        value: controllerViews,
        enumerable: true,
        configurable: true,
      });
    }
    const oldControllerView = controllerViews[viewName];
    if (oldControllerView !== void 0 && this.isMounted()) {
      oldControllerView.unmount();
    }
    if (newControllerView !== null) {
      controllerViews[viewName] = newControllerView;
      if (this.isMounted()) {
        newControllerView.mount();
      }
    } else {
      delete controllerViews[viewName];
    }
  }

  /** @hidden */
  protected mountControllerViews(): void {
    const controllerViews = this.controllerViews;
    for (const viewName in controllerViews) {
      const controllerView = controllerViews[viewName]!;
      controllerView.mount();
    }
  }

  /** @hidden */
  protected unmountControllerViews(): void {
    const controllerViews = this.controllerViews;
    for (const viewName in controllerViews) {
      const controllerView = controllerViews[viewName]!;
      controllerView.unmount();
    }
  }

  /** @hidden */
  readonly controllerViewTraits!: {[fastenerName: string]: ControllerViewTrait<Controller, View, Trait> | undefined} | null;

  override hasControllerViewTrait(fastenerName: string): boolean {
    const controllerViewTraits = this.controllerViewTraits;
    return controllerViewTraits !== null && controllerViewTraits[fastenerName] !== void 0;
  }

  override getControllerViewTrait(fastenerName: string): ControllerViewTrait<this, View, Trait> | null {
    const controllerViewTraits = this.controllerViewTraits;
    if (controllerViewTraits !== null) {
      const controllerViewTrait = controllerViewTraits[fastenerName];
      if (controllerViewTrait !== void 0) {
        return controllerViewTrait as ControllerViewTrait<this, View, Trait>;
      }
    }
    return null;
  }

  override setControllerViewTrait(fastenerName: string, newControllerViewTrait: ControllerViewTrait<this, any, any> | null): void {
    let controllerViewTraits = this.controllerViewTraits;
    if (controllerViewTraits === null) {
      controllerViewTraits = {};
      Object.defineProperty(this, "controllerViewTraits", {
        value: controllerViewTraits,
        enumerable: true,
        configurable: true,
      });
    }
    const oldControllerViewTrait = controllerViewTraits[fastenerName];
    if (oldControllerViewTrait !== void 0 && this.isMounted()) {
      oldControllerViewTrait.unmount();
    }
    if (newControllerViewTrait !== null) {
      controllerViewTraits[fastenerName] = newControllerViewTrait;
      if (this.isMounted()) {
        newControllerViewTrait.mount();
      }
    } else {
      delete controllerViewTraits[fastenerName];
    }
  }

  /** @hidden */
  protected mountControllerViewTraits(): void {
    const controllerViewTraits = this.controllerViewTraits;
    for (const fastenerName in controllerViewTraits) {
      const controllerViewTrait = controllerViewTraits[fastenerName]!;
      controllerViewTrait.mount();
    }
  }

  /** @hidden */
  protected unmountControllerViewTraits(): void {
    const controllerViewTraits = this.controllerViewTraits;
    for (const fastenerName in controllerViewTraits) {
      const controllerViewTrait = controllerViewTraits[fastenerName]!;
      controllerViewTrait.unmount();
    }
  }

  /** @hidden */
  readonly controllerFasteners!: {[fastenerName: string]: ControllerFastener<Controller, Controller> | undefined} | null;

  override hasControllerFastener(fastenerName: string): boolean {
    const controllerFasteners = this.controllerFasteners;
    return controllerFasteners !== null && controllerFasteners[fastenerName] !== void 0;
  }

  override getControllerFastener(fastenerName: string): ControllerFastener<this, Controller> | null {
    const controllerFasteners = this.controllerFasteners;
    if (controllerFasteners !== null) {
      const controllerFastener = controllerFasteners[fastenerName];
      if (controllerFastener !== void 0) {
        return controllerFastener as ControllerFastener<this, Controller>;
      }
    }
    return null;
  }

  override setControllerFastener(fastenerName: string, newControllerFastener: ControllerFastener<this, any> | null): void {
    let controllerFasteners = this.controllerFasteners;
    if (controllerFasteners === null) {
      controllerFasteners = {};
      Object.defineProperty(this, "controllerFasteners", {
        value: controllerFasteners,
        enumerable: true,
        configurable: true,
      });
    }
    const oldControllerFastener = controllerFasteners[fastenerName];
    if (oldControllerFastener !== void 0 && this.isMounted()) {
      oldControllerFastener.unmount();
    }
    if (newControllerFastener !== null) {
      controllerFasteners[fastenerName] = newControllerFastener;
      if (this.isMounted()) {
        newControllerFastener.mount();
      }
    } else {
      delete controllerFasteners[fastenerName];
    }
  }

  /** @hidden */
  protected mountControllerFasteners(): void {
    const controllerFasteners = this.controllerFasteners;
    for (const fastenerName in controllerFasteners) {
      const controllerFastener = controllerFasteners[fastenerName]!;
      controllerFastener.mount();
    }
  }

  /** @hidden */
  protected unmountControllerFasteners(): void {
    const controllerFasteners = this.controllerFasteners;
    for (const fastenerName in controllerFasteners) {
      const controllerFastener = controllerFasteners[fastenerName]!;
      controllerFastener.unmount();
    }
  }

  /** @hidden */
  protected insertControllerFastener(childController: Controller, targetController: Controller | null): void {
    const fastenerName = childController.key;
    if (fastenerName !== void 0) {
      const controllerFastener = this.getLazyControllerFastener(fastenerName);
      if (controllerFastener !== null && controllerFastener.child === true) {
        controllerFastener.doSetController(childController, targetController);
      }
    }
  }

  /** @hidden */
  protected removeControllerFastener(childController: Controller): void {
    const fastenerName = childController.key;
    if (fastenerName !== void 0) {
      const controllerFastener = this.getControllerFastener(fastenerName);
      if (controllerFastener !== null && controllerFastener.child === true) {
        controllerFastener.doSetController(null, null);
      }
    }
  }

  /** @hidden */
  readonly gestures!: {[gestureName: string]: Gesture<Controller, View> | undefined} | null;

  override hasGesture(gestureName: string): boolean {
    const gestures = this.gestures;
    return gestures !== null && gestures[gestureName] !== void 0;
  }

  override getGesture(gestureName: string): Gesture<this, View> | null {
    const gestures = this.gestures;
    if (gestures !== null) {
      const gesture = gestures[gestureName];
      if (gesture !== void 0) {
        return gesture as Gesture<this, View>;
      }
    }
    return null;
  }

  override setGesture(gestureName: string, newGesture: Gesture<this, any> | null): void {
    let gestures = this.gestures;
    if (gestures === null) {
      gestures = {};
      Object.defineProperty(this, "gestures", {
        value: gestures,
        enumerable: true,
        configurable: true,
      });
    }
    const oldGesture = gestures[gestureName];
    if (oldGesture !== void 0 && this.isMounted()) {
      oldGesture.unmount();
    }
    if (newGesture !== null) {
      gestures[gestureName] = newGesture;
      if (this.isMounted()) {
        newGesture.mount();
      }
    } else {
      delete gestures[gestureName];
    }
  }

  /** @hidden */
  protected mountGestures(): void {
    const gestures = this.gestures;
    for (const gestureName in gestures) {
      const gesture = gestures[gestureName]!;
      gesture.mount();
    }
    GestureContext.initGestures(this);
  }

  /** @hidden */
  protected unmountGestures(): void {
    const gestures = this.gestures;
    for (const gestureName in gestures) {
      const gesture = gestures[gestureName]!;
      gesture.unmount();
    }
  }
}
