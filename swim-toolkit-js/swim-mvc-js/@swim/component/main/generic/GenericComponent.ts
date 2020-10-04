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

import {View} from "@swim/view";
import {Model} from "@swim/model";
import {ComponentContextType, ComponentContext} from "../ComponentContext";
import {ComponentFlags, Component} from "../Component";
import {ComponentObserverType, ComponentObserver} from "../ComponentObserver";
import {Subcomponent} from "../Subcomponent";
import {ComponentService} from "../service/ComponentService";
import {ComponentScope} from "../scope/ComponentScope";
import {ComponentModel} from "../model/ComponentModel";
import {ComponentView} from "../view/ComponentView";

export abstract class GenericComponent extends Component {
  /** @hidden */
  _key?: string;
  /** @hidden */
  _parentComponent: Component | null;
  /** @hidden */
  _componentObservers?: ComponentObserverType<this>[];
  /** @hidden */
  _componentFlags: ComponentFlags;
  /** @hidden */
  _subcomponents?: {[subcomponentName: string]: Subcomponent<Component, Component> | undefined};
  /** @hidden */
  _componentServices?: {[serviceName: string]: ComponentService<Component, unknown> | undefined};
  /** @hidden */
  _componentScopes?: {[scopeName: string]: ComponentScope<Component, unknown> | undefined};
  /** @hidden */
  _componentModels?: {[modelName: string]: ComponentModel<Component, Model> | undefined};
  /** @hidden */
  _componentViews?: {[viewName: string]: ComponentView<Component, View> | undefined};

  constructor() {
    super();
    this._parentComponent = null;
    this._componentFlags = 0;
  }

  get componentObservers(): ReadonlyArray<ComponentObserver> {
    let componentObservers = this._componentObservers;
    if (componentObservers === void 0) {
      componentObservers = [];
      this._componentObservers = componentObservers;
    }
    return componentObservers;
  }

  addComponentObserver(componentObserver: ComponentObserverType<this>): void {
    let componentObservers = this._componentObservers;
    let index: number;
    if (componentObservers === void 0) {
      componentObservers = [];
      this._componentObservers = componentObservers;
      index = -1;
    } else {
      index = componentObservers.indexOf(componentObserver);
    }
    if (index < 0) {
      this.willAddComponentObserver(componentObserver);
      componentObservers.push(componentObserver);
      this.onAddComponentObserver(componentObserver);
      this.didAddComponentObserver(componentObserver);
    }
  }

  removeComponentObserver(componentObserver: ComponentObserverType<this>): void {
    const componentObservers = this._componentObservers;
    if (componentObservers !== void 0) {
      const index = componentObservers.indexOf(componentObserver);
      if (index >= 0) {
        this.willRemoveComponentObserver(componentObserver);
        componentObservers.splice(index, 1);
        this.onRemoveComponentObserver(componentObserver);
        this.didRemoveComponentObserver(componentObserver);
      }
    }
  }

  protected willObserve<T>(callback: (this: this, componentObserver: ComponentObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const componentObservers = this._componentObservers;
    if (componentObservers !== void 0) {
      let i = 0;
      while (i < componentObservers.length) {
        const componentObserver = componentObservers[i];
        result = callback.call(this, componentObserver);
        if (result !== void 0) {
          return result;
        }
        if (componentObserver === componentObservers[i]) {
          i += 1;
        }
      }
    }
    return result;
  }

  protected didObserve<T>(callback: (this: this, componentObserver: ComponentObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const componentObservers = this._componentObservers;
    if (componentObservers !== void 0) {
      let i = 0;
      while (i < componentObservers.length) {
        const componentObserver = componentObservers[i];
        result = callback.call(this, componentObserver);
        if (result !== void 0) {
          return result;
        }
        if (componentObserver === componentObservers[i]) {
          i += 1;
        }
      }
    }
    return result;
  }

  get key(): string | undefined {
    return this._key;
  }

  /** @hidden */
  setKey(key: string | undefined): void {
    if (key !== void 0) {
      this._key = key;
    } else if (this._key !== void 0) {
      this._key = void 0;
    }
  }

  get parentComponent(): Component | null {
    return this._parentComponent;
  }

  /** @hidden */
  setParentComponent(newParentComponent: Component | null, oldParentComponent: Component | null) {
    this.willSetParentComponent(newParentComponent, oldParentComponent);
    this._parentComponent = newParentComponent;
    this.onSetParentComponent(newParentComponent, oldParentComponent);
    this.didSetParentComponent(newParentComponent, oldParentComponent);
  }

  abstract get childComponentCount(): number;

  abstract get childComponents(): ReadonlyArray<Component>;

  abstract forEachChildComponent<T, S = unknown>(callback: (this: S, childComponent: Component) => T | void,
                                                 thisArg?: S): T | undefined;

  abstract getChildComponent(key: string): Component | null;

  abstract setChildComponent(key: string, newChildComponent: Component | null): Component | null;

  abstract appendChildComponent(childComponent: Component, key?: string): void;

  abstract prependChildComponent(childComponent: Component, key?: string): void;

  abstract insertChildComponent(childComponent: Component, targetComponent: Component | null, key?: string): void;

  protected onInsertChildComponent(childComponent: Component, targetComponent: Component | null | undefined): void {
    super.onInsertChildComponent(childComponent, targetComponent);
    this.insertSubcomponent(childComponent);
  }

  cascadeInsert(updateFlags?: ComponentFlags, componentContext?: ComponentContext): void {
    // nop
  }

  abstract removeChildComponent(key: string): Component | null;
  abstract removeChildComponent(childComponent: Component): void;

  protected onRemoveChildComponent(childComponent: Component): void {
    super.onRemoveChildComponent(childComponent);
    this.removeSubcomponent(childComponent);
  }

  abstract removeAll(): void;

  remove(): void {
    const parentComponent = this._parentComponent;
    if (parentComponent !== null) {
      if ((this._componentFlags & Component.TraversingFlag) === 0) {
        parentComponent.removeChildComponent(this);
      } else {
        this._componentFlags |= Component.RemovingFlag;
      }
    }
  }

  /** @hidden */
  get componentFlags(): ComponentFlags {
    return this._componentFlags;
  }

  /** @hidden */
  setComponentFlags(componentFlags: ComponentFlags): void {
    this._componentFlags = componentFlags;
  }

  cascadeMount(): void {
    if ((this._componentFlags & Component.MountedFlag) === 0) {
      this._componentFlags |= Component.MountedFlag;
      this._componentFlags |= Component.TraversingFlag;
      try {
        this.willMount();
        this.onMount();
        this.doMountChildComponents();
        this.didMount();
      } finally {
        this._componentFlags &= ~Component.TraversingFlag;
      }
    } else {
      throw new Error("already mounted");
    }
  }

  protected onMount(): void {
    super.onMount();
    this.mountServices();
    this.mountScopes();
    this.mountModels();
    this.mountViews();
    this.mountSubcomponents();
  }

  /** @hidden */
  protected doMountChildComponents(): void {
    this.forEachChildComponent(function (childComponent: Component): void {
      childComponent.cascadeMount();
      if ((childComponent.componentFlags & Component.RemovingFlag) !== 0) {
        childComponent.setComponentFlags(childComponent.componentFlags & ~Component.RemovingFlag);
        this.removeChildComponent(childComponent);
      }
    }, this);
  }

  cascadeUnmount(): void {
    if ((this._componentFlags & Component.MountedFlag) !== 0) {
      this._componentFlags &= ~Component.MountedFlag
      this._componentFlags |= Component.TraversingFlag;
      try {
        this.willUnmount();
        this.doUnmountChildComponents();
        this.onUnmount();
        this.didUnmount();
      } finally {
        this._componentFlags &= ~Component.TraversingFlag;
      }
    } else {
      throw new Error("already unmounted");
    }
  }

  protected onUnmount(): void {
    this.unmountSubcomponents();
    this.unmountViews();
    this.unmountModels();
    this.unmountScopes();
    this.unmountServices();
    this._componentFlags &= ~Component.ComponentFlagMask | Component.RemovingFlag;
  }

  /** @hidden */
  protected doUnmountChildComponents(): void {
    this.forEachChildComponent(function (childComponent: Component): void {
      childComponent.cascadeUnmount();
      if ((childComponent.componentFlags & Component.RemovingFlag) !== 0) {
        childComponent.setComponentFlags(childComponent.componentFlags & ~Component.RemovingFlag);
        this.removeChildComponent(childComponent);
      }
    }, this);
  }

  cascadePower(): void {
    if ((this._componentFlags & Component.PoweredFlag) === 0) {
      this._componentFlags |= Component.PoweredFlag;
      this._componentFlags |= Component.TraversingFlag;
      try {
        this.willPower();
        this.onPower();
        this.doPowerChildComponents();
        this.didPower();
      } finally {
        this._componentFlags &= ~Component.TraversingFlag;
      }
    } else {
      throw new Error("already powered");
    }
  }

  /** @hidden */
  protected doPowerChildComponents(): void {
    this.forEachChildComponent(function (childComponent: Component): void {
      childComponent.cascadePower();
      if ((childComponent.componentFlags & Component.RemovingFlag) !== 0) {
        childComponent.setComponentFlags(childComponent.componentFlags & ~Component.RemovingFlag);
        this.removeChildComponent(childComponent);
      }
    }, this);
  }

  cascadeUnpower(): void {
    if ((this._componentFlags & Component.PoweredFlag) !== 0) {
      this._componentFlags &= ~Component.PoweredFlag
      this._componentFlags |= Component.TraversingFlag;
      try {
        this.willUnpower();
        this.doUnpowerChildComponents();
        this.onUnpower();
        this.didUnpower();
      } finally {
        this._componentFlags &= ~Component.TraversingFlag;
      }
    } else {
      throw new Error("already unpowered");
    }
  }

  /** @hidden */
  protected doUnpowerChildComponents(): void {
    this.forEachChildComponent(function (childComponent: Component): void {
      childComponent.cascadeUnpower();
      if ((childComponent.componentFlags & Component.RemovingFlag) !== 0) {
        childComponent.setComponentFlags(childComponent.componentFlags & ~Component.RemovingFlag);
        this.removeChildComponent(childComponent);
      }
    }, this);
  }

  cascadeCompile(compileFlags: ComponentFlags, componentContext: ComponentContext): void {
    const extendedComponentContext = this.extendComponentContext(componentContext);
    compileFlags |= this._componentFlags & Component.UpdateMask;
    compileFlags = this.needsCompile(compileFlags, extendedComponentContext);
    this.doCompile(compileFlags, extendedComponentContext);
  }

  /** @hidden */
  protected doCompile(compileFlags: ComponentFlags, componentContext: ComponentContextType<this>): void {
    let cascadeFlags = compileFlags;
    this._componentFlags |= Component.TraversingFlag | Component.CompilingFlag;
    this._componentFlags &= ~Component.NeedsCompile;
    try {
      this.willCompile(componentContext);
      if (((this._componentFlags | compileFlags) & Component.NeedsResolve) !== 0) {
        this.willResolve(componentContext);
        cascadeFlags |= Component.NeedsResolve;
        this._componentFlags &= ~Component.NeedsResolve;
      }
      if (((this._componentFlags | compileFlags) & Component.NeedsGenerate) !== 0) {
        this.willGenerate(componentContext);
        cascadeFlags |= Component.NeedsGenerate;
        this._componentFlags &= ~Component.NeedsGenerate;
      }
      if (((this._componentFlags | compileFlags) & Component.NeedsAssemble) !== 0) {
        this.willAssemble(componentContext);
        cascadeFlags |= Component.NeedsAssemble;
        this._componentFlags &= ~Component.NeedsAssemble;
      }

      this.onCompile(componentContext);
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
      this.didCompile(componentContext);
    } finally {
      this._componentFlags &= ~(Component.TraversingFlag | Component.CompilingFlag);
    }
  }

  /** @hidden */
  protected doCompileChildComponents(compileFlags: ComponentFlags, componentContext: ComponentContextType<this>): void {
    if ((compileFlags & Component.CompileMask) !== 0 && this.childComponentCount !== 0) {
      this.willCompileChildComponents(compileFlags, componentContext);
      this.onCompileChildComponents(compileFlags, componentContext);
      this.didCompileChildComponents(compileFlags, componentContext);
    }
  }

  cascadeExecute(executeFlags: ComponentFlags, componentContext: ComponentContext): void {
    const extendedComponentContext = this.extendComponentContext(componentContext);
    executeFlags |= this._componentFlags & Component.UpdateMask;
    executeFlags = this.needsExecute(executeFlags, extendedComponentContext);
    this.doExecute(executeFlags, extendedComponentContext);
  }

  /** @hidden */
  protected doExecute(executeFlags: ComponentFlags, componentContext: ComponentContextType<this>): void {
    let cascadeFlags = executeFlags;
    this._componentFlags |= Component.TraversingFlag | Component.ExecutingFlag;
    this._componentFlags &= ~Component.NeedsExecute;
    try {
      this.willExecute(componentContext);
      if (((this._componentFlags | executeFlags) & Component.NeedsRevise) !== 0) {
        this.willRevise(componentContext);
        cascadeFlags |= Component.NeedsRevise;
        this._componentFlags &= ~Component.NeedsRevise;
      }
      if (((this._componentFlags | executeFlags) & Component.NeedsCompute) !== 0) {
        this.willCompute(componentContext);
        cascadeFlags |= Component.NeedsCompute;
        this._componentFlags &= ~Component.NeedsCompute;
      }

      this.onExecute(componentContext);
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
      this.didExecute(componentContext);
    } finally {
      this._componentFlags &= ~(Component.TraversingFlag | Component.ExecutingFlag);
    }
  }

  protected onRevise(componentContext: ComponentContextType<this>): void {
    super.onRevise(componentContext);
    this.updateScopes();
  }

  /** @hidden */
  protected doExecuteChildComponents(executeFlags: ComponentFlags, componentContext: ComponentContextType<this>): void {
    if ((executeFlags & Component.ExecuteMask) !== 0 && this.childComponentCount !== 0) {
      this.willExecuteChildComponents(executeFlags, componentContext);
      this.onExecuteChildComponents(executeFlags, componentContext);
      this.didExecuteChildComponents(executeFlags, componentContext);
    }
  }

  hasSubcomponent(subcomponentName: string): boolean {
    const subcomponents = this._subcomponents;
    return subcomponents !== void 0 && subcomponents[subcomponentName] !== void 0;
  }

  getSubcomponent(subcomponentName: string): Subcomponent<this, Component> | null {
    const subcomponents = this._subcomponents;
    if (subcomponents !== void 0) {
      const subcomponent = subcomponents[subcomponentName];
      if (subcomponent !== void 0) {
        return subcomponent as Subcomponent<this, Component>;
      }
    }
    return null;
  }

  setSubcomponent(subcomponentName: string, newSubcomponent: Subcomponent<this, Component> | null): void {
    let subcomponents = this._subcomponents;
    if (subcomponents === void 0) {
      subcomponents = {};
      this._subcomponents = subcomponents;
    }
    const oldSubcomponent = subcomponents[subcomponentName];
    if (oldSubcomponent !== void 0 && this.isMounted()) {
      oldSubcomponent.unmount();
    }
    if (newSubcomponent !== null) {
      subcomponents[subcomponentName] = newSubcomponent;
      if (this.isMounted()) {
        newSubcomponent.mount();
      }
    } else {
      delete subcomponents[subcomponentName];
    }
  }

  /** @hidden */
  protected mountSubcomponents(): void {
    const subcomponents = this._subcomponents;
    if (subcomponents !== void 0) {
      for (const subcomponentName in subcomponents) {
        const subcomponent = subcomponents[subcomponentName]!;
        subcomponent.mount();
      }
    }
  }

  /** @hidden */
  protected unmountSubcomponents(): void {
    const subcomponents = this._subcomponents;
    if (subcomponents !== void 0) {
      for (const subcomponentName in subcomponents) {
        const subcomponent = subcomponents[subcomponentName]!;
        subcomponent.unmount();
      }
    }
  }

  /** @hidden */
  protected insertSubcomponent(childComponent: Component): void {
    const subcomponentName = childComponent.key;
    if (subcomponentName !== void 0) {
      const subcomponent = this.getLazySubcomponent(subcomponentName);
      if (subcomponent !== null && subcomponent.child) {
        subcomponent.doSetSubcomponent(childComponent);
      }
    }
  }

  /** @hidden */
  protected removeSubcomponent(childComponent: Component): void {
    const subcomponentName = childComponent.key;
    if (subcomponentName !== void 0) {
      const subcomponent = this.getSubcomponent(subcomponentName);
      if (subcomponent !== null && subcomponent.child) {
        subcomponent.doSetSubcomponent(null);
      }
    }
  }

  hasComponentService(serviceName: string): boolean {
    const componentServices = this._componentServices;
    return componentServices !== void 0 && componentServices[serviceName] !== void 0;
  }

  getComponentService(serviceName: string): ComponentService<this, unknown> | null {
    const componentServices = this._componentServices;
    if (componentServices !== void 0) {
      const componentService = componentServices[serviceName];
      if (componentService !== void 0) {
        return componentService as ComponentService<this, unknown>;
      }
    }
    return null;
  }

  setComponentService(serviceName: string, newComponentService: ComponentService<this, unknown> | null): void {
    let componentServices = this._componentServices;
    if (componentServices === void 0) {
      componentServices = {};
      this._componentServices = componentServices;
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
  protected mountServices(): void {
    const componentServices = this._componentServices;
    if (componentServices !== void 0) {
      for (const serviceName in componentServices) {
        const componentService = componentServices[serviceName]!;
        componentService.mount();
      }
    }
  }

  /** @hidden */
  protected unmountServices(): void {
    const componentServices = this._componentServices;
    if (componentServices !== void 0) {
      for (const serviceName in componentServices) {
        const componentService = componentServices[serviceName]!;
        componentService.unmount();
      }
    }
  }

  hasComponentScope(scopeName: string): boolean {
    const componentScopes = this._componentScopes;
    return componentScopes !== void 0 && componentScopes[scopeName] !== void 0;
  }

  getComponentScope(scopeName: string): ComponentScope<this, unknown> | null {
    const componentScopes = this._componentScopes;
    if (componentScopes !== void 0) {
      const componentScope = componentScopes[scopeName];
      if (componentScope !== void 0) {
        return componentScope as ComponentScope<this, unknown>;
      }
    }
    return null;
  }

  setComponentScope(scopeName: string, newComponentScope: ComponentScope<this, unknown> | null): void {
    let componentScopes = this._componentScopes;
    if (componentScopes === void 0) {
      componentScopes = {};
      this._componentScopes = componentScopes;
    }
    const oldComponentScope = componentScopes[scopeName];
    if (oldComponentScope !== void 0 && this.isMounted()) {
      oldComponentScope.unmount();
    }
    if (newComponentScope !== null) {
      componentScopes[scopeName] = newComponentScope;
      if (this.isMounted()) {
        newComponentScope.mount();
      }
    } else {
      delete componentScopes[scopeName];
    }
  }

  /** @hidden */
  updateScopes(): void {
    const componentScopes = this._componentScopes;
    if (componentScopes !== void 0) {
      for (const scopeName in componentScopes) {
        const componentScope = componentScopes[scopeName]!;
        componentScope.onRevise();
      }
    }
  }

  /** @hidden */
  protected mountScopes(): void {
    const componentScopes = this._componentScopes;
    if (componentScopes !== void 0) {
      for (const scopeName in componentScopes) {
        const componentScope = componentScopes[scopeName]!;
        componentScope.mount();
      }
    }
  }

  /** @hidden */
  protected unmountScopes(): void {
    const componentScopes = this._componentScopes;
    if (componentScopes !== void 0) {
      for (const scopeName in componentScopes) {
        const componentScope = componentScopes[scopeName]!;
        componentScope.unmount();
      }
    }
  }

  hasComponentModel(modelName: string): boolean {
    const componentModels = this._componentModels;
    return componentModels !== void 0 && componentModels[modelName] !== void 0;
  }

  getComponentModel(modelName: string): ComponentModel<this, Model> | null {
    const componentModels = this._componentModels;
    if (componentModels !== void 0) {
      const componentModel = componentModels[modelName];
      if (componentModel !== void 0) {
        return componentModel as ComponentModel<this, Model>;
      }
    }
    return null;
  }

  setComponentModel(modelName: string, newComponentModel: ComponentModel<this, Model> | null): void {
    let componentModels = this._componentModels;
    if (componentModels === void 0) {
      componentModels = {};
      this._componentModels = componentModels;
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
  protected mountModels(): void {
    const componentModels = this._componentModels;
    if (componentModels !== void 0) {
      for (const modelName in componentModels) {
        const componentModel = componentModels[modelName]!;
        componentModel.mount();
      }
    }
  }

  /** @hidden */
  protected unmountModels(): void {
    const componentModels = this._componentModels;
    if (componentModels !== void 0) {
      for (const modelName in componentModels) {
        const componentModel = componentModels[modelName]!;
        componentModel.unmount();
      }
    }
  }

  hasComponentView(viewName: string): boolean {
    const componentViews = this._componentViews;
    return componentViews !== void 0 && componentViews[viewName] !== void 0;
  }

  getComponentView(viewName: string): ComponentView<this, View> | null {
    const componentViews = this._componentViews;
    if (componentViews !== void 0) {
      const componentView = componentViews[viewName];
      if (componentView !== void 0) {
        return componentView as ComponentView<this, View>;
      }
    }
    return null;
  }

  setComponentView(viewName: string, newComponentView: ComponentView<this, View> | null): void {
    let componentViews = this._componentViews;
    if (componentViews === void 0) {
      componentViews = {};
      this._componentViews = componentViews;
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
  protected mountViews(): void {
    const componentViews = this._componentViews;
    if (componentViews !== void 0) {
      for (const viewName in componentViews) {
        const componentView = componentViews[viewName]!;
        componentView.mount();
      }
    }
  }

  /** @hidden */
  protected unmountViews(): void {
    const componentViews = this._componentViews;
    if (componentViews !== void 0) {
      for (const viewName in componentViews) {
        const componentView = componentViews[viewName]!;
        componentView.unmount();
      }
    }
  }
}
Component.Generic = GenericComponent;
