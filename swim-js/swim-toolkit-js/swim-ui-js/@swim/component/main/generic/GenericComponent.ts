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

import type {View} from "@swim/view";
import type {Model, Trait} from "@swim/model";
import type {ComponentContextType, ComponentContext} from "../ComponentContext";
import {ComponentFlags, Component} from "../Component";
import type {ComponentObserverType} from "../ComponentObserver";
import type {ComponentService} from "../service/ComponentService";
import type {ComponentProperty} from "../property/ComponentProperty";
import type {ComponentModel} from "../fastener/ComponentModel";
import type {ComponentTrait} from "../fastener/ComponentTrait";
import type {ComponentView} from "../fastener/ComponentView";
import type {ComponentViewTrait} from "../fastener/ComponentViewTrait";
import type {ComponentFastener} from "../fastener/ComponentFastener";

export abstract class GenericComponent extends Component {
  constructor() {
    super();
    Object.defineProperty(this, "key", {
      value: void 0,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "parentComponent", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "componentServices", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "componentProperties", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "componentModels", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "componentTraits", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "componentViews", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "componentViewTraits", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "componentFasteners", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  protected willObserve<T>(callback: (this: this, componentObserver: ComponentObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      result = callback.call(this, componentObserver as ComponentObserverType<this>) as T | undefined;
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  protected didObserve<T>(callback: (this: this, componentObserver: ComponentObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      result = callback.call(this, componentObserver as ComponentObserverType<this>) as T | undefined;
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

  override readonly parentComponent!: Component | null;

  /** @hidden */
  override setParentComponent(newParentComponent: Component | null, oldParentComponent: Component | null): void {
    this.willSetParentComponent(newParentComponent, oldParentComponent);
    if (oldParentComponent !== null) {
      this.detachParentComponent(oldParentComponent);
    }
    Object.defineProperty(this, "parentComponent", {
      value: newParentComponent,
      enumerable: true,
      configurable: true,
    });
    if (newParentComponent !== null) {
      this.attachParentComponent(newParentComponent);
    }
    this.onSetParentComponent(newParentComponent, oldParentComponent);
    this.didSetParentComponent(newParentComponent, oldParentComponent);
  }

  override remove(): void {
    const parentComponent = this.parentComponent;
    if (parentComponent !== null) {
      if ((this.componentFlags & Component.TraversingFlag) === 0) {
        parentComponent.removeChildComponent(this);
      } else {
        this.setComponentFlags(this.componentFlags | Component.RemovingFlag);
      }
    }
  }

  abstract override readonly childComponentCount: number;

  abstract override readonly childComponents: ReadonlyArray<Component>;

  abstract override forEachChildComponent<T>(callback: (childComponent: Component) => T | void): T | undefined;
  abstract override forEachChildComponent<T, S>(callback: (this: S, childComponent: Component) => T | void,
                                                thisArg: S): T | undefined;

  abstract override getChildComponent(key: string): Component | null;

  abstract override setChildComponent(key: string, newChildComponent: Component | null): Component | null;

  abstract override appendChildComponent(childComponent: Component, key?: string): void;

  abstract override prependChildComponent(childComponent: Component, key?: string): void;

  abstract override insertChildComponent(childComponent: Component, targetComponent: Component | null, key?: string): void;

  protected override onInsertChildComponent(childComponent: Component, targetComponent: Component | null): void {
    super.onInsertChildComponent(childComponent, targetComponent);
    this.insertComponentFastener(childComponent, targetComponent);
  }

  override cascadeInsert(updateFlags?: ComponentFlags, componentContext?: ComponentContext): void {
    // nop
  }

  abstract override removeChildComponent(key: string): Component | null;
  abstract override removeChildComponent(childComponent: Component): void;

  protected override onRemoveChildComponent(childComponent: Component): void {
    super.onRemoveChildComponent(childComponent);
    this.removeComponentFastener(childComponent);
  }

  abstract override removeAll(): void;

  override cascadeMount(): void {
    if ((this.componentFlags & Component.MountedFlag) === 0) {
      this.setComponentFlags(this.componentFlags | (Component.MountedFlag | Component.TraversingFlag));
      try {
        this.willMount();
        this.onMount();
        this.doMountChildComponents();
        this.didMount();
      } finally {
        this.setComponentFlags(this.componentFlags & ~Component.TraversingFlag);
      }
    } else {
      throw new Error("already mounted");
    }
  }

  protected override onMount(): void {
    super.onMount();
    this.mountComponentServices();
    this.mountComponentProperties();
    this.mountComponentModels();
    this.mountComponentTraits();
    this.mountComponentViews();
    this.mountComponentViewTraits();
    this.mountComponentFasteners();
  }

  /** @hidden */
  protected doMountChildComponents(): void {
    type self = this;
    function doMountChildComponent(this: self, childComponent: Component): void {
      childComponent.cascadeMount();
      if ((childComponent.componentFlags & Component.RemovingFlag) !== 0) {
        childComponent.setComponentFlags(childComponent.componentFlags & ~Component.RemovingFlag);
        this.removeChildComponent(childComponent);
      }
    }
    this.forEachChildComponent(doMountChildComponent, this);
  }

  override cascadeUnmount(): void {
    if ((this.componentFlags & Component.MountedFlag) !== 0) {
      this.setComponentFlags(this.componentFlags & ~Component.MountedFlag | Component.TraversingFlag);
      try {
        this.willUnmount();
        this.doUnmountChildComponents();
        this.onUnmount();
        this.didUnmount();
      } finally {
        this.setComponentFlags(this.componentFlags & ~Component.TraversingFlag);
      }
    } else {
      throw new Error("already unmounted");
    }
  }

  protected override onUnmount(): void {
    this.unmountComponentFasteners();
    this.unmountComponentViewTraits();
    this.unmountComponentViews();
    this.unmountComponentTraits();
    this.unmountComponentModels();
    this.unmountComponentProperties();
    this.unmountComponentServices();
    this.setComponentFlags(this.componentFlags & (~Component.ComponentFlagMask | Component.RemovingFlag));
  }

  /** @hidden */
  protected doUnmountChildComponents(): void {
    type self = this;
    function doUnmountChildComponent(this: self, childComponent: Component): void {
      childComponent.cascadeUnmount();
      if ((childComponent.componentFlags & Component.RemovingFlag) !== 0) {
        childComponent.setComponentFlags(childComponent.componentFlags & ~Component.RemovingFlag);
        this.removeChildComponent(childComponent);
      }
    }
    this.forEachChildComponent(doUnmountChildComponent, this);
  }

  override cascadePower(): void {
    if ((this.componentFlags & Component.PoweredFlag) === 0) {
      this.setComponentFlags(this.componentFlags | (Component.PoweredFlag | Component.TraversingFlag));
      try {
        this.willPower();
        this.onPower();
        this.doPowerChildComponents();
        this.didPower();
      } finally {
        this.setComponentFlags(this.componentFlags & ~Component.TraversingFlag);
      }
    } else {
      throw new Error("already powered");
    }
  }

  /** @hidden */
  protected doPowerChildComponents(): void {
    type self = this;
    function doPowerChildComponent(this: self, childComponent: Component): void {
      childComponent.cascadePower();
      if ((childComponent.componentFlags & Component.RemovingFlag) !== 0) {
        childComponent.setComponentFlags(childComponent.componentFlags & ~Component.RemovingFlag);
        this.removeChildComponent(childComponent);
      }
    }
    this.forEachChildComponent(doPowerChildComponent, this);
  }

  override cascadeUnpower(): void {
    if ((this.componentFlags & Component.PoweredFlag) !== 0) {
      this.setComponentFlags(this.componentFlags & ~Component.PoweredFlag | Component.TraversingFlag);
      try {
        this.willUnpower();
        this.doUnpowerChildComponents();
        this.onUnpower();
        this.didUnpower();
      } finally {
        this.setComponentFlags(this.componentFlags & ~Component.TraversingFlag);
      }
    } else {
      throw new Error("already unpowered");
    }
  }

  /** @hidden */
  protected doUnpowerChildComponents(): void {
    type self = this;
    function doUnpowerChildComponent(this: self, childComponent: Component): void {
      childComponent.cascadeUnpower();
      if ((childComponent.componentFlags & Component.RemovingFlag) !== 0) {
        childComponent.setComponentFlags(childComponent.componentFlags & ~Component.RemovingFlag);
        this.removeChildComponent(childComponent);
      }
    }
    this.forEachChildComponent(doUnpowerChildComponent, this);
  }

  override cascadeCompile(compileFlags: ComponentFlags, componentContext: ComponentContext): void {
    const extendedComponentContext = this.extendComponentContext(componentContext);
    compileFlags &= ~Component.NeedsCompile;
    compileFlags |= this.componentFlags & Component.UpdateMask;
    compileFlags = this.needsCompile(compileFlags, extendedComponentContext);
    if ((compileFlags & Component.CompileMask) !== 0) {
      this.doCompile(compileFlags, extendedComponentContext);
    }
  }

  /** @hidden */
  protected doCompile(compileFlags: ComponentFlags, componentContext: ComponentContextType<this>): void {
    let cascadeFlags = compileFlags;
    this.setComponentFlags(this.componentFlags & ~Component.NeedsCompile
                                               | (Component.TraversingFlag | Component.CompilingFlag));
    try {
      this.willCompile(cascadeFlags, componentContext);
      if (((this.componentFlags | compileFlags) & Component.NeedsResolve) !== 0) {
        cascadeFlags |= Component.NeedsResolve;
        this.setComponentFlags(this.componentFlags & ~Component.NeedsResolve);
        this.willResolve(componentContext);
      }
      if (((this.componentFlags | compileFlags) & Component.NeedsGenerate) !== 0) {
        cascadeFlags |= Component.NeedsGenerate;
        this.setComponentFlags(this.componentFlags & ~Component.NeedsGenerate);
        this.willGenerate(componentContext);
      }
      if (((this.componentFlags | compileFlags) & Component.NeedsAssemble) !== 0) {
        cascadeFlags |= Component.NeedsAssemble;
        this.setComponentFlags(this.componentFlags & ~Component.NeedsAssemble);
        this.willAssemble(componentContext);
      }

      this.onCompile(cascadeFlags, componentContext);
      if ((cascadeFlags & Component.NeedsResolve) !== 0) {
        this.onResolve(componentContext);
      }
      if ((cascadeFlags & Component.NeedsGenerate) !== 0) {
        this.onGenerate(componentContext);
      }
      if ((cascadeFlags & Component.NeedsAssemble) !== 0) {
        this.onAssemble(componentContext);
      }

      this.doCompileChildComponents(cascadeFlags, componentContext);

      if ((cascadeFlags & Component.NeedsAssemble) !== 0) {
        this.didAssemble(componentContext);
      }
      if ((cascadeFlags & Component.NeedsGenerate) !== 0) {
        this.didGenerate(componentContext);
      }
      if ((cascadeFlags & Component.NeedsResolve) !== 0) {
        this.didResolve(componentContext);
      }
      this.didCompile(cascadeFlags, componentContext);
    } finally {
      this.setComponentFlags(this.componentFlags & ~(Component.TraversingFlag | Component.CompilingFlag));
    }
  }

  override cascadeExecute(executeFlags: ComponentFlags, componentContext: ComponentContext): void {
    const extendedComponentContext = this.extendComponentContext(componentContext);
    executeFlags &= ~Component.NeedsExecute;
    executeFlags |= this.componentFlags & Component.UpdateMask;
    executeFlags = this.needsExecute(executeFlags, extendedComponentContext);
    if ((executeFlags & Component.ExecuteMask) !== 0) {
      this.doExecute(executeFlags, extendedComponentContext);
    }
  }

  /** @hidden */
  protected doExecute(executeFlags: ComponentFlags, componentContext: ComponentContextType<this>): void {
    let cascadeFlags = executeFlags;
    this.setComponentFlags(this.componentFlags & ~Component.NeedsExecute
                                               | (Component.TraversingFlag | Component.ExecutingFlag));
    try {
      this.willExecute(cascadeFlags, componentContext);
      if (((this.componentFlags | executeFlags) & Component.NeedsRevise) !== 0) {
        cascadeFlags |= Component.NeedsRevise;
        this.setComponentFlags(this.componentFlags & ~Component.NeedsRevise);
        this.willRevise(componentContext);
      }
      if (((this.componentFlags | executeFlags) & Component.NeedsCompute) !== 0) {
        cascadeFlags |= Component.NeedsCompute;
        this.setComponentFlags(this.componentFlags & ~Component.NeedsCompute);
        this.willCompute(componentContext);
      }

      this.onExecute(cascadeFlags, componentContext);
      if ((cascadeFlags & Component.NeedsRevise) !== 0) {
        this.onRevise(componentContext);
      }
      if ((cascadeFlags & Component.NeedsCompute) !== 0) {
        this.onCompute(componentContext);
      }

      this.doExecuteChildComponents(cascadeFlags, componentContext);

      if ((cascadeFlags & Component.NeedsCompute) !== 0) {
        this.didCompute(componentContext);
      }
      if ((cascadeFlags & Component.NeedsRevise) !== 0) {
        this.didRevise(componentContext);
      }
      this.didExecute(cascadeFlags, componentContext);
    } finally {
      this.setComponentFlags(this.componentFlags & ~(Component.TraversingFlag | Component.ExecutingFlag));
    }
  }

  protected override onRevise(componentContext: ComponentContextType<this>): void {
    super.onRevise(componentContext);
    this.reviseComponentProperties();
  }

  /** @hidden */
  readonly componentServices!: {[serviceName: string]: ComponentService<Component, unknown> | undefined} | null;

  override hasComponentService(serviceName: string): boolean {
    const componentServices = this.componentServices;
    return componentServices !== null && componentServices[serviceName] !== void 0;
  }

  override getComponentService(serviceName: string): ComponentService<this, unknown> | null {
    const componentServices = this.componentServices;
    if (componentServices !== null) {
      const componentService = componentServices[serviceName];
      if (componentService !== void 0) {
        return componentService as ComponentService<this, unknown>;
      }
    }
    return null;
  }

  override setComponentService(serviceName: string, newComponentService: ComponentService<this, unknown> | null): void {
    let componentServices = this.componentServices;
    if (componentServices === null) {
      componentServices = {};
      Object.defineProperty(this, "componentServices", {
        value: componentServices,
        enumerable: true,
        configurable: true,
      });
    }
    const oldComponentService = componentServices[serviceName];
    if (oldComponentService !== void 0 && this.isMounted()) {
      oldComponentService.unmount();
    }
    if (newComponentService !== null) {
      componentServices[serviceName] = newComponentService;
      if (this.isMounted()) {
        newComponentService.mount();
      }
    } else {
      delete componentServices[serviceName];
    }
  }

  /** @hidden */
  protected mountComponentServices(): void {
    const componentServices = this.componentServices;
    for (const serviceName in componentServices) {
      const componentService = componentServices[serviceName]!;
      componentService.mount();
    }
  }

  /** @hidden */
  protected unmountComponentServices(): void {
    const componentServices = this.componentServices;
    for (const serviceName in componentServices) {
      const componentService = componentServices[serviceName]!;
      componentService.unmount();
    }
  }

  /** @hidden */
  readonly componentProperties!: {[propertyName: string]: ComponentProperty<Component, unknown> | undefined} | null;

  override hasComponentProperty(propertyName: string): boolean {
    const componentProperties = this.componentProperties;
    return componentProperties !== null && componentProperties[propertyName] !== void 0;
  }

  override getComponentProperty(propertyName: string): ComponentProperty<this, unknown> | null {
    const componentProperties = this.componentProperties;
    if (componentProperties !== null) {
      const componentProperty = componentProperties[propertyName];
      if (componentProperty !== void 0) {
        return componentProperty as ComponentProperty<this, unknown>;
      }
    }
    return null;
  }

  override setComponentProperty(propertyName: string, newComponentProperty: ComponentProperty<this, unknown> | null): void {
    let componentProperties = this.componentProperties;
    if (componentProperties === null) {
      componentProperties = {};
      Object.defineProperty(this, "componentProperties", {
        value: componentProperties,
        enumerable: true,
        configurable: true,
      });
    }
    const oldComponentProperty = componentProperties[propertyName];
    if (oldComponentProperty !== void 0 && this.isMounted()) {
      oldComponentProperty.unmount();
    }
    if (newComponentProperty !== null) {
      componentProperties[propertyName] = newComponentProperty;
      if (this.isMounted()) {
        newComponentProperty.mount();
      }
    } else {
      delete componentProperties[propertyName];
    }
  }

  /** @hidden */
  reviseComponentProperties(): void {
    const componentProperties = this.componentProperties;
    for (const propertyName in componentProperties) {
      const componentProperty = componentProperties[propertyName]!;
      componentProperty.onRevise();
    }
  }

  /** @hidden */
  protected mountComponentProperties(): void {
    const componentProperties = this.componentProperties;
    for (const propertyName in componentProperties) {
      const componentProperty = componentProperties[propertyName]!;
      componentProperty.mount();
    }
  }

  /** @hidden */
  protected unmountComponentProperties(): void {
    const componentProperties = this.componentProperties;
    for (const propertyName in componentProperties) {
      const componentProperty = componentProperties[propertyName]!;
      componentProperty.unmount();
    }
  }

  /** @hidden */
  readonly componentModels!: {[modelName: string]: ComponentModel<Component, Model> | undefined} | null;

  override hasComponentModel(modelName: string): boolean {
    const componentModels = this.componentModels;
    return componentModels !== null && componentModels[modelName] !== void 0;
  }

  override getComponentModel(modelName: string): ComponentModel<this, Model> | null {
    const componentModels = this.componentModels;
    if (componentModels !== null) {
      const componentModel = componentModels[modelName];
      if (componentModel !== void 0) {
        return componentModel as ComponentModel<this, Model>;
      }
    }
    return null;
  }

  override setComponentModel(modelName: string, newComponentModel: ComponentModel<this, any> | null): void {
    let componentModels = this.componentModels;
    if (componentModels === null) {
      componentModels = {};
      Object.defineProperty(this, "componentModels", {
        value: componentModels,
        enumerable: true,
        configurable: true,
      });
    }
    const oldComponentModel = componentModels[modelName];
    if (oldComponentModel !== void 0 && this.isMounted()) {
      oldComponentModel.unmount();
    }
    if (newComponentModel !== null) {
      componentModels[modelName] = newComponentModel;
      if (this.isMounted()) {
        newComponentModel.mount();
      }
    } else {
      delete componentModels[modelName];
    }
  }

  /** @hidden */
  protected mountComponentModels(): void {
    const componentModels = this.componentModels;
    for (const modelName in componentModels) {
      const componentModel = componentModels[modelName]!;
      componentModel.mount();
    }
  }

  /** @hidden */
  protected unmountComponentModels(): void {
    const componentModels = this.componentModels;
    for (const modelName in componentModels) {
      const componentModel = componentModels[modelName]!;
      componentModel.unmount();
    }
  }

  /** @hidden */
  readonly componentTraits!: {[traitName: string]: ComponentTrait<Component, Trait> | undefined} | null;

  override hasComponentTrait(traitName: string): boolean {
    const componentTraits = this.componentTraits;
    return componentTraits !== null && componentTraits[traitName] !== void 0;
  }

  override getComponentTrait(traitName: string): ComponentTrait<this, Trait> | null {
    const componentTraits = this.componentTraits;
    if (componentTraits !== null) {
      const componentTrait = componentTraits[traitName];
      if (componentTrait !== void 0) {
        return componentTrait as ComponentTrait<this, Trait>;
      }
    }
    return null;
  }

  override setComponentTrait(traitName: string, newComponentTrait: ComponentTrait<this, any> | null): void {
    let componentTraits = this.componentTraits;
    if (componentTraits === null) {
      componentTraits = {};
      Object.defineProperty(this, "componentTraits", {
        value: componentTraits,
        enumerable: true,
        configurable: true,
      });
    }
    const oldComponentTrait = componentTraits[traitName];
    if (oldComponentTrait !== void 0 && this.isMounted()) {
      oldComponentTrait.unmount();
    }
    if (newComponentTrait !== null) {
      componentTraits[traitName] = newComponentTrait;
      if (this.isMounted()) {
        newComponentTrait.mount();
      }
    } else {
      delete componentTraits[traitName];
    }
  }

  /** @hidden */
  protected mountComponentTraits(): void {
    const componentTraits = this.componentTraits;
    for (const traitName in componentTraits) {
      const componentTrait = componentTraits[traitName]!;
      componentTrait.mount();
    }
  }

  /** @hidden */
  protected unmountComponentTraits(): void {
    const componentTraits = this.componentTraits;
    for (const traitName in componentTraits) {
      const componentTrait = componentTraits[traitName]!;
      componentTrait.unmount();
    }
  }

  /** @hidden */
  readonly componentViews!: {[viewName: string]: ComponentView<Component, View> | undefined} | null;

  override hasComponentView(viewName: string): boolean {
    const componentViews = this.componentViews;
    return componentViews !== null && componentViews[viewName] !== void 0;
  }

  override getComponentView(viewName: string): ComponentView<this, View> | null {
    const componentViews = this.componentViews;
    if (componentViews !== null) {
      const componentView = componentViews[viewName];
      if (componentView !== void 0) {
        return componentView as ComponentView<this, View>;
      }
    }
    return null;
  }

  override setComponentView(viewName: string, newComponentView: ComponentView<this, any> | null): void {
    let componentViews = this.componentViews;
    if (componentViews === null) {
      componentViews = {};
      Object.defineProperty(this, "componentViews", {
        value: componentViews,
        enumerable: true,
        configurable: true,
      });
    }
    const oldComponentView = componentViews[viewName];
    if (oldComponentView !== void 0 && this.isMounted()) {
      oldComponentView.unmount();
    }
    if (newComponentView !== null) {
      componentViews[viewName] = newComponentView;
      if (this.isMounted()) {
        newComponentView.mount();
      }
    } else {
      delete componentViews[viewName];
    }
  }

  /** @hidden */
  protected mountComponentViews(): void {
    const componentViews = this.componentViews;
    for (const viewName in componentViews) {
      const componentView = componentViews[viewName]!;
      componentView.mount();
    }
  }

  /** @hidden */
  protected unmountComponentViews(): void {
    const componentViews = this.componentViews;
    for (const viewName in componentViews) {
      const componentView = componentViews[viewName]!;
      componentView.unmount();
    }
  }

  /** @hidden */
  readonly componentViewTraits!: {[fastenerName: string]: ComponentViewTrait<Component, View, Trait> | undefined} | null;

  override hasComponentViewTrait(fastenerName: string): boolean {
    const componentViewTraits = this.componentViewTraits;
    return componentViewTraits !== null && componentViewTraits[fastenerName] !== void 0;
  }

  override getComponentViewTrait(fastenerName: string): ComponentViewTrait<this, View, Trait> | null {
    const componentViewTraits = this.componentViewTraits;
    if (componentViewTraits !== null) {
      const componentViewTrait = componentViewTraits[fastenerName];
      if (componentViewTrait !== void 0) {
        return componentViewTrait as ComponentViewTrait<this, View, Trait>;
      }
    }
    return null;
  }

  override setComponentViewTrait(fastenerName: string, newComponentViewTrait: ComponentViewTrait<this, any, any> | null): void {
    let componentViewTraits = this.componentViewTraits;
    if (componentViewTraits === null) {
      componentViewTraits = {};
      Object.defineProperty(this, "componentViewTraits", {
        value: componentViewTraits,
        enumerable: true,
        configurable: true,
      });
    }
    const oldComponentViewTrait = componentViewTraits[fastenerName];
    if (oldComponentViewTrait !== void 0 && this.isMounted()) {
      oldComponentViewTrait.unmount();
    }
    if (newComponentViewTrait !== null) {
      componentViewTraits[fastenerName] = newComponentViewTrait;
      if (this.isMounted()) {
        newComponentViewTrait.mount();
      }
    } else {
      delete componentViewTraits[fastenerName];
    }
  }

  /** @hidden */
  protected mountComponentViewTraits(): void {
    const componentViewTraits = this.componentViewTraits;
    for (const fastenerName in componentViewTraits) {
      const componentViewTrait = componentViewTraits[fastenerName]!;
      componentViewTrait.mount();
    }
  }

  /** @hidden */
  protected unmountComponentViewTraits(): void {
    const componentViewTraits = this.componentViewTraits;
    for (const fastenerName in componentViewTraits) {
      const componentViewTrait = componentViewTraits[fastenerName]!;
      componentViewTrait.unmount();
    }
  }

  /** @hidden */
  readonly componentFasteners!: {[fastenerName: string]: ComponentFastener<Component, Component> | undefined} | null;

  override hasComponentFastener(fastenerName: string): boolean {
    const componentFasteners = this.componentFasteners;
    return componentFasteners !== null && componentFasteners[fastenerName] !== void 0;
  }

  override getComponentFastener(fastenerName: string): ComponentFastener<this, Component> | null {
    const componentFasteners = this.componentFasteners;
    if (componentFasteners !== null) {
      const componentFastener = componentFasteners[fastenerName];
      if (componentFastener !== void 0) {
        return componentFastener as ComponentFastener<this, Component>;
      }
    }
    return null;
  }

  override setComponentFastener(fastenerName: string, newComponentFastener: ComponentFastener<this, any> | null): void {
    let componentFasteners = this.componentFasteners;
    if (componentFasteners === null) {
      componentFasteners = {};
      Object.defineProperty(this, "componentFasteners", {
        value: componentFasteners,
        enumerable: true,
        configurable: true,
      });
    }
    const oldComponentFastener = componentFasteners[fastenerName];
    if (oldComponentFastener !== void 0 && this.isMounted()) {
      oldComponentFastener.unmount();
    }
    if (newComponentFastener !== null) {
      componentFasteners[fastenerName] = newComponentFastener;
      if (this.isMounted()) {
        newComponentFastener.mount();
      }
    } else {
      delete componentFasteners[fastenerName];
    }
  }

  /** @hidden */
  protected mountComponentFasteners(): void {
    const componentFasteners = this.componentFasteners;
    for (const fastenerName in componentFasteners) {
      const componentFastener = componentFasteners[fastenerName]!;
      componentFastener.mount();
    }
  }

  /** @hidden */
  protected unmountComponentFasteners(): void {
    const componentFasteners = this.componentFasteners;
    for (const fastenerName in componentFasteners) {
      const componentFastener = componentFasteners[fastenerName]!;
      componentFastener.unmount();
    }
  }

  /** @hidden */
  protected insertComponentFastener(childComponent: Component, targetComponent: Component | null): void {
    const fastenerName = childComponent.key;
    if (fastenerName !== void 0) {
      const componentFastener = this.getLazyComponentFastener(fastenerName);
      if (componentFastener !== null && componentFastener.child === true) {
        componentFastener.doSetComponent(childComponent, targetComponent);
      }
    }
  }

  /** @hidden */
  protected removeComponentFastener(childComponent: Component): void {
    const fastenerName = childComponent.key;
    if (fastenerName !== void 0) {
      const componentFastener = this.getComponentFastener(fastenerName);
      if (componentFastener !== null && componentFastener.child === true) {
        componentFastener.doSetComponent(null, null);
      }
    }
  }
}
