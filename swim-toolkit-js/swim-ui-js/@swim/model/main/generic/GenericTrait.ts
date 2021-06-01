// Copyright 2015-2021 Swim inc.
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

import {Arrays} from "@swim/util";
import {Model} from "../Model";
import {TraitModelType, TraitContextType, Trait} from "../Trait";
import type {TraitObserverType} from "../TraitObserver";
import type {TraitConsumerType, TraitConsumer} from "../TraitConsumer";
import type {TraitService} from "../service/TraitService";
import {ModelProperty} from "../property/ModelProperty";
import type {TraitProperty} from "../property/TraitProperty";
import type {TraitModel} from "../fastener/TraitModel";
import type {TraitFastener} from "../fastener/TraitFastener";
import {ModelDownlinkContext} from "../downlink/ModelDownlinkContext";
import type {ModelDownlink} from "../downlink/ModelDownlink";

export class GenericTrait extends Trait {
  constructor() {
    super();
    Object.defineProperty(this, "model", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "key", {
      value: void 0,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "traitConsumers", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "traitServices", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "traitProperties", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "traitModels", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "traitFasteners", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "traitDownlinks", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  protected willObserve<T>(callback: (this: this, traitObserver: TraitObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      result = callback.call(this, traitObserver as TraitObserverType<this>) as T | undefined;
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  protected didObserve<T>(callback: (this: this, traitObserver: TraitObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      result = callback.call(this, traitObserver as TraitObserverType<this>) as T | undefined;
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

  override readonly model!: Model | null;

  /** @hidden */
  override setModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void {
    this.willSetModel(newModel, oldModel);
    if (oldModel !== null) {
      this.detachModel(oldModel);
    }
    Object.defineProperty(this, "model", {
      value: newModel,
      enumerable: true,
      configurable: true,
    });
    this.onSetModel(newModel, oldModel);
    if (newModel !== null) {
      this.attachModel(newModel);
    }
    this.didSetModel(newModel, oldModel);
  }

  protected attachModel(newModel: TraitModelType<this>): void {
    this.attachTraitServices();
    if (this.isMounted()) {
      this.mountTraitProperties();
      this.mountTraitModels();
      this.mountTraitFasteners();
      this.mountTraitDownlinks();
    }
  }

  protected detachModel(oldModel: TraitModelType<this>): void {
    if (this.isMounted()) {
      this.unmountTraitDownlinks();
      this.unmountTraitFasteners();
      this.unmountTraitModels();
      this.unmountTraitProperties();
    }
    this.detachTraitServices();
  }

  override remove(): void {
    const model = this.model;
    if (model !== null) {
      model.removeTrait(this);
    }
  }

  protected override onInsertChildModel(childModel: Model, targetModel: Model | null): void {
    super.onInsertChildModel(childModel, targetModel);
    this.insertTraitModel(childModel, targetModel);
  }

  protected override onRemoveChildModel(childModel: Model): void {
    super.onRemoveChildModel(childModel);
    this.removeTraitModel(childModel);
  }

  protected override onInsertTrait(trait: Trait, targetTrait: Trait | null): void {
    super.onInsertTrait(trait, targetTrait);
    this.insertTraitFastener(trait, targetTrait);
  }

  protected override onRemoveTrait(trait: Trait): void {
    super.onRemoveTrait(trait);
    this.removeTraitFastener(trait);
  }

  /** @hidden */
  override doMount(): void {
    if ((this.traitFlags & Trait.MountedFlag) === 0) {
      this.setTraitFlags(this.traitFlags | Trait.MountedFlag);
      this.willMount();
      this.onMount();
      this.didMount();
    } else {
      throw new Error("already mounted");
    }
  }

  protected override onMount(): void {
    super.onMount();
    this.mountTraitModels();
    this.mountTraitFasteners();
    this.mountTraitDownlinks();
    if (this.traitConsumers.length !== 0) {
      this.startConsuming();
    }
  }

  /** @hidden */
  override doUnmount(): void {
    if ((this.traitFlags & Trait.MountedFlag) !== 0) {
      this.setTraitFlags(this.traitFlags & ~Trait.MountedFlag);
      this.willUnmount();
      this.onUnmount();
      this.didUnmount();
    } else {
      throw new Error("already unmounted");
    }
  }

  protected override onUnmount(): void {
    this.stopConsuming();
    this.unmountTraitDownlinks();
    this.unmountTraitFasteners();
    this.unmountTraitModels();
  }

  /** @hidden */
  override doPower(): void {
    if ((this.traitFlags & Trait.PoweredFlag) === 0) {
      this.setTraitFlags(this.traitFlags | Trait.PoweredFlag);
      this.willPower();
      this.onPower();
      this.didPower();
    } else {
      throw new Error("already powered");
    }
  }

  /** @hidden */
  override doUnpower(): void {
    if ((this.traitFlags & Trait.PoweredFlag) !== 0) {
      this.setTraitFlags(this.traitFlags & ~Trait.PoweredFlag);
      this.willUnpower();
      this.onUnpower();
      this.didUnpower();
    } else {
      throw new Error("already unpowered");
    }
  }

  protected override onMutate(modelContext: TraitContextType<this>): void {
    super.onMutate(modelContext);
    this.mutateTraitProperties();
  }

  protected override onReconcile(modelContext: TraitContextType<this>): void {
    super.onReconcile(modelContext);
    this.reconcileTraitDownlinks();
  }

  override readonly traitConsumers!: ReadonlyArray<TraitConsumer>;

  override addTraitConsumer(traitConsumer: TraitConsumerType<this>): void {
    const oldTraitConsumers = this.traitConsumers;
    const newTraitConsumers = Arrays.inserted(traitConsumer, oldTraitConsumers);
    if (oldTraitConsumers !== newTraitConsumers) {
      this.willAddTraitConsumer(traitConsumer);
      Object.defineProperty(this, "traitConsumers", {
        value: newTraitConsumers,
        enumerable: true,
        configurable: true,
      });
      this.onAddTraitConsumer(traitConsumer);
      this.didAddTraitConsumer(traitConsumer);
      if (oldTraitConsumers.length === 0 && this.isMounted()) {
        this.startConsuming();
      }
    }
  }

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.startConsumingTraitDownlinks();
  }

  override removeTraitConsumer(traitConsumer: TraitConsumerType<this>): void {
    const oldTraitConsumers = this.traitConsumers;
    const newTraitCnsumers = Arrays.removed(traitConsumer, oldTraitConsumers);
    if (oldTraitConsumers !== newTraitCnsumers) {
      this.willRemoveTraitConsumer(traitConsumer);
      Object.defineProperty(this, "traitConsumers", {
        value: newTraitCnsumers,
        enumerable: true,
        configurable: true,
      });
      this.onRemoveTraitConsumer(traitConsumer);
      this.didRemoveTraitConsumer(traitConsumer);
      if (newTraitCnsumers.length === 0) {
        this.stopConsuming();
      }
    }
  }

  protected override onStopConsuming(): void {
    this.stopConsumingTraitDownlinks();
    super.onStopConsuming();
  }

  /** @hidden */
  readonly traitServices!: {[serviceName: string]: TraitService<Trait, unknown> | undefined} | null;

  override hasTraitService(serviceName: string): boolean {
    const traitServices = this.traitServices;
    return traitServices !== null && traitServices[serviceName] !== void 0;
  }

  override getTraitService(serviceName: string): TraitService<this, unknown> | null {
    const traitServices = this.traitServices;
    if (traitServices !== null) {
      const traitService = traitServices[serviceName];
      if (traitService !== void 0) {
        return traitService as TraitService<this, unknown>;
      }
    }
    return null;
  }

  override setTraitService(serviceName: string, newTraitService: TraitService<this, unknown> | null): void {
    let traitServices = this.traitServices;
    if (traitServices === null) {
      traitServices = {};
      Object.defineProperty(this, "traitServices", {
        value: traitServices,
        enumerable: true,
        configurable: true,
      });
    }
    const oldTraitService = traitServices[serviceName];
    if (oldTraitService !== void 0 && this.isMounted()) {
      oldTraitService.detach();
    }
    if (newTraitService !== null) {
      traitServices[serviceName] = newTraitService;
      if (this.isMounted()) {
        newTraitService.attach();
      }
    } else {
      delete traitServices[serviceName];
    }
  }

  /** @hidden */
  protected attachTraitServices(): void {
    const traitServices = this.traitServices;
    for (const serviceName in traitServices) {
      const traitService = traitServices[serviceName]!;
      traitService.attach();
    }
  }

  /** @hidden */
  protected detachTraitServices(): void {
    const traitServices = this.traitServices;
    for (const serviceName in traitServices) {
      const traitService = traitServices[serviceName]!;
      traitService.detach();
    }
  }

  override hasModelProperty(propertyName: string): boolean {
    const model = this.model;
    return model !== null && model.hasModelProperty(propertyName);
  }

  override getModelProperty(propertyName: string): ModelProperty<TraitModelType<this>, unknown> | null {
    const model = this.model as TraitModelType<this>;
    return model !== null ? model.getModelProperty(propertyName) : null;
  }

  override setModelProperty(propertyName: string, newModelProperty: ModelProperty<TraitModelType<this>, unknown> | null): void {
    const model = this.model;
    if (model !== null) {
      model.setModelProperty(propertyName, newModelProperty);
    } else {
      throw new Error("no model");
    }
  }

  /** @hidden */
  readonly traitProperties!: {[propertyName: string]: TraitProperty<Trait, unknown> | undefined} | null;

  override hasTraitProperty(propertyName: string): boolean {
    const traitProperties = this.traitProperties;
    return traitProperties !== null && traitProperties[propertyName] !== void 0;
  }

  override getTraitProperty(propertyName: string): TraitProperty<this, unknown> | null {
    const traitProperties = this.traitProperties;
    if (traitProperties !== null) {
      const traitProperty = traitProperties[propertyName];
      if (traitProperty !== void 0) {
        return traitProperty as TraitProperty<this, unknown>;
      }
    }
    return null;
  }

  override setTraitProperty(propertyName: string, newTraitProperty: TraitProperty<this, unknown> | null): void {
    let traitProperties = this.traitProperties;
    if (traitProperties === null) {
      traitProperties = {};
      Object.defineProperty(this, "traitProperties", {
        value: traitProperties,
        enumerable: true,
        configurable: true,
      });
    }
    const oldTraitProperty = traitProperties[propertyName];
    if (oldTraitProperty !== void 0 && this.isMounted()) {
      oldTraitProperty.unmount();
    }
    if (newTraitProperty !== null) {
      traitProperties[propertyName] = newTraitProperty;
      if (this.isMounted()) {
        newTraitProperty.mount();
      }
    } else {
      delete traitProperties[propertyName];
    }
  }

  /** @hidden */
  mutateTraitProperties(): void {
    const traitProperties = this.traitProperties;
    for (const propertyName in traitProperties) {
      const traitProperty = traitProperties[propertyName]!;
      traitProperty.onMutate();
    }
  }

  /** @hidden */
  protected mountTraitProperties(): void {
    const traitProperties = this.traitProperties;
    for (const propertyName in traitProperties) {
      const traitProperty = traitProperties[propertyName]!;
      traitProperty.mount();
    }
  }

  /** @hidden */
  protected unmountTraitProperties(): void {
    const traitProperties = this.traitProperties;
    for (const propertyName in traitProperties) {
      const traitProperty = traitProperties[propertyName]!;
      traitProperty.unmount();
    }
  }

  /** @hidden */
  readonly traitModels!: {[fastenerName: string]: TraitModel<Trait, Model> | undefined} | null;

  override hasTraitModel(fastenerName: string): boolean {
    const traitModels = this.traitModels;
    return traitModels !== null && traitModels[fastenerName] !== void 0;
  }

  override getTraitModel(fastenerName: string): TraitModel<this, Model> | null {
    const traitModels = this.traitModels;
    if (traitModels !== null) {
      const traitModel = traitModels[fastenerName];
      if (traitModel !== void 0) {
        return traitModel as TraitModel<this, Model>;
      }
    }
    return null;
  }

  override setTraitModel(fastenerName: string, newTraitModel: TraitModel<this, any> | null): void {
    let traitModels = this.traitModels;
    if (traitModels === null) {
      traitModels = {};
      Object.defineProperty(this, "traitModels", {
        value: traitModels,
        enumerable: true,
        configurable: true,
      });
    }
    const oldTraitModel = traitModels[fastenerName];
    if (oldTraitModel !== void 0 && this.isMounted()) {
      oldTraitModel.unmount();
    }
    if (newTraitModel !== null) {
      traitModels[fastenerName] = newTraitModel;
      if (this.isMounted()) {
        newTraitModel.mount();
        if (newTraitModel.child === true) {
          const childModel = this.getChildModel(newTraitModel.name);
          if (childModel !== null) {
            newTraitModel.doSetModel(childModel, null);
          }
        }
      }
    } else {
      delete traitModels[fastenerName];
    }
  }

  /** @hidden */
  protected mountTraitModels(): void {
    const traitModels = this.traitModels;
    for (const fastenerName in traitModels) {
      const traitModel = traitModels[fastenerName]!;
      traitModel.mount();
      if (traitModel.child === true) {
        const childModel = this.getChildModel(traitModel.name);
        if (childModel !== null) {
          traitModel.doSetModel(childModel, null);
        }
      }
    }
  }

  /** @hidden */
  protected unmountTraitModels(): void {
    const traitModels = this.traitModels;
    for (const fastenerName in traitModels) {
      const traitModel = traitModels[fastenerName]!;
      traitModel.unmount();
    }
  }

  /** @hidden */
  protected insertTraitModel(childModel: Model, targetModel: Model | null): void {
    const fastenerName = childModel.key;
    if (fastenerName !== void 0) {
      const traitModel = this.getLazyTraitModel(fastenerName);
      if (traitModel !== null && traitModel.child === true) {
        traitModel.doSetModel(childModel, targetModel);
      }
    }
  }

  /** @hidden */
  protected removeTraitModel(childModel: Model): void {
    const fastenerName = childModel.key;
    if (fastenerName !== void 0) {
      const traitModel = this.getTraitModel(fastenerName);
      if (traitModel !== null && traitModel.child === true) {
        traitModel.doSetModel(null, null);
      }
    }
  }

  /** @hidden */
  readonly traitFasteners!: {[fastenerName: string]: TraitFastener<Trait, Trait> | undefined} | null;

  override hasTraitFastener(fastenerName: string): boolean {
    const traitFasteners = this.traitFasteners;
    return traitFasteners !== null && traitFasteners[fastenerName] !== void 0;
  }

  override getTraitFastener(fastenerName: string): TraitFastener<this, Trait> | null {
    const traitFasteners = this.traitFasteners;
    if (traitFasteners !== null) {
      const traitFastener = traitFasteners[fastenerName];
      if (traitFastener !== void 0) {
        return traitFastener as TraitFastener<this, Trait>;
      }
    }
    return null;
  }

  override setTraitFastener(fastenerName: string, newTraitFastener: TraitFastener<this, any> | null): void {
    let traitFasteners = this.traitFasteners;
    if (traitFasteners === null) {
      traitFasteners = {};
      Object.defineProperty(this, "traitFasteners", {
        value: traitFasteners,
        enumerable: true,
        configurable: true,
      });
    }
    const oldTraitFastener = traitFasteners[fastenerName];
    if (oldTraitFastener !== void 0 && this.isMounted()) {
      oldTraitFastener.unmount();
    }
    if (newTraitFastener !== null) {
      traitFasteners[fastenerName] = newTraitFastener;
      if (this.isMounted()) {
        newTraitFastener.mount();
        if (newTraitFastener.sibling === true) {
          const trait = this.getTrait(newTraitFastener.name);
          if (trait !== null) {
            newTraitFastener.doSetTrait(trait, null);
          }
        }
      }
    } else {
      delete traitFasteners[fastenerName];
    }
  }

  /** @hidden */
  protected mountTraitFasteners(): void {
    const traitFasteners = this.traitFasteners;
    for (const fastenerName in traitFasteners) {
      const traitFastener = traitFasteners[fastenerName]!;
      traitFastener.mount();
      if (traitFastener.sibling === true) {
        const trait = this.getTrait(traitFastener.name);
        if (trait !== null) {
          traitFastener.doSetTrait(trait, null);
        }
      }
    }
  }

  /** @hidden */
  protected unmountTraitFasteners(): void {
    const traitFasteners = this.traitFasteners;
    for (const fastenerName in traitFasteners) {
      const traitFastener = traitFasteners[fastenerName]!;
      traitFastener.unmount();
    }
  }

  /** @hidden */
  protected insertTraitFastener(trait: Trait, targetTrait: Trait | null): void {
    const fastenerName = trait.key;
    if (fastenerName !== void 0) {
      const traitFastener = this.getLazyTraitFastener(fastenerName);
      if (traitFastener !== null && traitFastener.sibling === true) {
        traitFastener.doSetTrait(trait, null);
      }
    }
  }

  /** @hidden */
  protected removeTraitFastener(trait: Trait): void {
    const fastenerName = trait.key;
    if (fastenerName !== void 0) {
      const traitFastener = this.getTraitFastener(fastenerName);
      if (traitFastener !== null && traitFastener.sibling === true) {
        traitFastener.doSetTrait(null, null);
      }
    }
  }

  /** @hidden */
  readonly traitDownlinks!: {[downlinkName: string]: ModelDownlink<Trait> | undefined} | null;

  override hasModelDownlink(downlinkName: string): boolean {
    const traitDownlinks = this.traitDownlinks;
    return traitDownlinks !== null && traitDownlinks[downlinkName] !== void 0;
  }

  override getModelDownlink(downlinkName: string): ModelDownlink<this> | null {
    const traitDownlinks = this.traitDownlinks;
    if (traitDownlinks !== null) {
      const traitDownlink = traitDownlinks[downlinkName];
      if (traitDownlink !== void 0) {
        return traitDownlink as ModelDownlink<this>;
      }
    }
    return null;
  }

  override setModelDownlink(downlinkName: string, newTraitDownlink: ModelDownlink<this> | null): void {
    let traitDownlinks = this.traitDownlinks;
    if (traitDownlinks === null) {
      traitDownlinks = {};
      Object.defineProperty(this, "traitDownlinks", {
        value: traitDownlinks,
        enumerable: true,
        configurable: true,
      });
    }
    const oldTraitDownlink = traitDownlinks[downlinkName];
    if (oldTraitDownlink !== void 0 && this.isMounted()) {
      if (this.isConsuming() && oldTraitDownlink.consume === true) {
        oldTraitDownlink.removeDownlinkConsumer(this);
      }
      oldTraitDownlink.unmount();
    }
    if (newTraitDownlink !== null) {
      traitDownlinks[downlinkName] = newTraitDownlink;
      if (this.isMounted()) {
        newTraitDownlink.mount();
        if (this.isConsuming() && newTraitDownlink.consume === true) {
          newTraitDownlink.addDownlinkConsumer(this);
        }
      }
    } else {
      delete traitDownlinks[downlinkName];
    }
  }

  /** @hidden */
  protected mountTraitDownlinks(): void {
    const traitDownlinks = this.traitDownlinks;
    for (const downlinkName in traitDownlinks) {
      const traitDownlink = traitDownlinks[downlinkName]!;
      traitDownlink.mount();
    }
    ModelDownlinkContext.initModelDownlinks(this);
  }

  /** @hidden */
  protected unmountTraitDownlinks(): void {
    const traitDownlinks = this.traitDownlinks;
    for (const downlinkName in traitDownlinks) {
      const traitDownlink = traitDownlinks[downlinkName]!;
      traitDownlink.unmount();
    }
  }

  /** @hidden */
  protected reconcileTraitDownlinks(): void {
    const traitDownlinks = this.traitDownlinks;
    for (const downlinkName in traitDownlinks) {
      const traitDownlink = traitDownlinks[downlinkName]!;
      traitDownlink.reconcile();
    }
  }

  /** @hidden */
  protected startConsumingTraitDownlinks(): void {
    const traitDownlinks = this.traitDownlinks;
    for (const downlinkName in traitDownlinks) {
      const traitDownlink = traitDownlinks[downlinkName]!;
      if (traitDownlink.consume === true) {
        traitDownlink.addDownlinkConsumer(this);
      }
    }
  }

  /** @hidden */
  protected stopConsumingTraitDownlinks(): void {
    const traitDownlinks = this.traitDownlinks;
    for (const downlinkName in traitDownlinks) {
      const traitDownlink = traitDownlinks[downlinkName]!;
      if (traitDownlink.consume === true) {
        traitDownlink.removeDownlinkConsumer(this);
      }
    }
  }
}

ModelProperty({
  type: Object,
  inherit: true,
  state: null,
  updateFlags: Model.NeedsReconcile,
})(Trait.prototype, "warpRef");
