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

import {Mutable, Class, Creatable, InitType, Initable} from "@swim/util";
import {Fastener, Provider, HierarchyFlags, Hierarchy} from "@swim/fastener";
import {ExecuteService} from "../execute/ExecuteService";
import {ExecuteProvider} from "../execute/ExecuteProvider";
import {HistoryService} from "../history/HistoryService";
import {HistoryProvider} from "../history/HistoryProvider";
import {StorageService} from "../storage/StorageService";
import {StorageProvider} from "../storage/StorageProvider";
import type {ControllerContext} from "./ControllerContext";
import type {ControllerObserver} from "./ControllerObserver";
import {ControllerFastener} from "./"; // forward import

export type ControllerContextType<C extends Controller> =
  C extends {readonly contextType?: Class<infer T>} ? T : never;

export type ControllerFlags = HierarchyFlags;

export type AnyController<C extends Controller = Controller> = C | ControllerFactory<C> | InitType<C>;

export interface ControllerInit {
  type?: Creatable<Controller>;
  key?: string;
  children?: AnyController[];
}

export interface AnyControllerFactory<C extends Controller = Controller, U = never> {
  create?(): C;

  fromAny?(value: C | U): C;
}

export interface ControllerFactory<C extends Controller = Controller> extends Creatable<C> {
  fromInit(init: InitType<C>): C;
}

export interface ControllerClass<C extends Controller = Controller> extends Function, ControllerFactory<C> {
  readonly prototype: C;
}

export interface ControllerConstructor<C extends Controller = Controller> extends ControllerClass<C> {
  new(): C;
}

export abstract class Controller extends Hierarchy implements Initable<ControllerInit> {
  constructor() {
    super();
    this.parent = null;
  }

  override readonly familyType?: Class<Controller>;

  override readonly observerType?: Class<ControllerObserver>;

  readonly contextType?: Class<ControllerContext>;

  /** @internal */
  override readonly flags!: ControllerFlags;

  /** @internal */
  override setFlags(flags: ControllerFlags): void {
    (this as Mutable<this>).flags = flags;
  }

  override readonly parent: Controller | null;

  /** @internal */
  override setParent(newParent: Controller | null, oldParent: Controller | null): void {
    super.setParent(newParent, oldParent);
  }

  /** @internal */
  protected override attachParent(parent: Controller): void {
    super.attachParent(parent);
  }

  /** @internal */
  protected override detachParent(parent: Controller): void {
    super.detachParent(parent);
  }

  protected override willSetParent(newParent: Controller | null, oldParent: Controller | null): void {
    super.willSetParent(newParent, oldParent);
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetParent !== void 0) {
        observer.controllerWillSetParent(newParent, oldParent, this);
      }
    }
  }

  protected override onSetParent(newParent: Controller | null, oldParent: Controller | null): void {
    (this as Mutable<this>).parent = newParent;
    super.onSetParent(newParent, oldParent);
  }

  protected override didSetParent(newParent: Controller | null, oldParent: Controller | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetParent !== void 0) {
        observer.controllerDidSetParent(newParent, oldParent, this);
      }
    }
    super.didSetParent(newParent, oldParent);
  }

  abstract override readonly childCount: number;

  abstract override readonly children: ReadonlyArray<Controller>;

  abstract override firstChild(): Controller | null;

  abstract override lastChild(): Controller | null;

  abstract override nextChild(target: Controller): Controller | null;

  abstract override previousChild(target: Controller): Controller | null;

  abstract override forEachChild<T>(callback: (child: Controller) => T | void): T | undefined;
  abstract override forEachChild<T, S>(callback: (this: S, child: Controller) => T | void, thisArg: S): T | undefined;

  abstract override getChild<C extends Controller>(key: string, childBound: Class<C>): C | null;
  abstract override getChild(key: string, childBound?: Class<Controller>): Controller | null;

  abstract override setChild<C extends Controller>(key: string, newChild: AnyController<C> | null): Controller | null;
  abstract override setChild(key: string, newChild: AnyController | null): Controller | null;

  abstract override appendChild<C extends Controller>(child: AnyController<C>, key?: string): C;
  abstract override appendChild(child: AnyController, key?: string): Controller;

  abstract override prependChild<C extends Controller>(child: AnyController<C>, key?: string): C;
  abstract override prependChild(child: AnyController, key?: string): Controller;

  abstract override insertChild<C extends Controller>(child: AnyController<C>, target: Controller | null, key?: string): C;
  abstract override insertChild(child: AnyController, target: Controller | null, key?: string): Controller;

  override get insertChildFlags(): ControllerFlags {
    return (this.constructor as typeof Controller).InsertChildFlags;
  }

  protected override willInsertChild(child: Controller, target: Controller | null): void {
    super.willInsertChild(child, target);
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillInsertChild !== void 0) {
        observer.controllerWillInsertChild(child, target, this);
      }
    }
  }

  protected override onInsertChild(child: Controller, target: Controller | null): void {
    super.onInsertChild(child, target);
    this.attachChildFasteners(child, target);
  }

  protected override didInsertChild(child: Controller, target: Controller | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidInsertChild !== void 0) {
        observer.controllerDidInsertChild(child, target, this);
      }
    }
    super.didInsertChild(child, target);
  }

  /** @internal */
  override cascadeInsert(updateFlags?: ControllerFlags, controllerContext?: ControllerContext): void {
    if ((this.flags & Controller.MountedFlag) !== 0) {
      if (updateFlags === void 0) {
        updateFlags = 0;
      }
      updateFlags |= this.flags & Controller.UpdateMask;
      if ((updateFlags & Controller.CompileMask) !== 0) {
        if (controllerContext === void 0) {
          controllerContext = this.superControllerContext;
        }
        this.cascadeCompile(updateFlags, controllerContext);
      }
    }
  }

  abstract override removeChild(key: string): Controller | null;
  abstract override removeChild(child: Controller): void;

  override get removeChildFlags(): ControllerFlags {
    return (this.constructor as typeof Controller).RemoveChildFlags;
  }

  protected override willRemoveChild(child: Controller): void {
    super.willRemoveChild(child);
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillRemoveChild !== void 0) {
        observer.controllerWillRemoveChild(child, this);
      }
    }
  }

  protected override onRemoveChild(child: Controller): void {
    super.onRemoveChild(child);
    this.detachChildFasteners(child);
  }

  protected override didRemoveChild(child: Controller): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidRemoveChild !== void 0) {
        observer.controllerDidRemoveChild(child, this);
      }
    }
    super.didRemoveChild(child);
  }

  /** @internal */
  protected attachChildFasteners(child: Controller, target: Controller | null): void {
    const fastenerName = child.key;
    if (fastenerName !== void 0) {
      const controllerFastener = this.getLazyFastener(fastenerName, ControllerFastener);
      if (controllerFastener !== null && controllerFastener.child === true) {
        controllerFastener.setOwnController(child, target);
      }
    }
  }

  /** @internal */
  protected detachChildFasteners(child: Controller): void {
    const fastenerName = child.key;
    if (fastenerName !== void 0) {
      const controllerFastener = this.getFastener(fastenerName, ControllerFastener);
      if (controllerFastener !== null && controllerFastener.child === true && controllerFastener.controller === child) {
        controllerFastener.setOwnController(null, null);
      }
    }
  }

  override get mountFlags(): ControllerFlags {
    return (this.constructor as typeof Controller).MountFlags;
  }

  mount(): void {
    if (!this.mounted && this.parent === null) {
      this.cascadeMount();
      this.cascadeInsert();
    }
  }

  protected override willMount(): void {
    super.willMount();
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillMount !== void 0) {
        observer.controllerWillMount(this);
      }
    }
  }

  protected override onMount(): void {
    // subsume super
    this.requestUpdate(this, this.flags & Controller.UpdateMask, false);
    this.requireUpdate(this.mountFlags);

    if (this.decoherent !== null && this.decoherent.length !== 0) {
      this.requireUpdate(Controller.NeedsRevise);
    }

    this.mountFasteners();
  }

  protected override didMount(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidMount !== void 0) {
        observer.controllerDidMount(this);
      }
    }
    super.didMount();
  }

  protected override willUnmount(): void {
    super.willUnmount();
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillUnmount !== void 0) {
        observer.controllerWillUnmount(this);
      }
    }
  }

  protected override didUnmount(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidUnmount !== void 0) {
        observer.controllerDidUnmount(this);
      }
    }
    super.didUnmount();
  }

  override requireUpdate(updateFlags: ControllerFlags, immediate: boolean = false): void {
    const flags = this.flags;
    const deltaUpdateFlags = updateFlags & ~flags & Controller.UpdateMask;
    if (deltaUpdateFlags !== 0) {
      this.setFlags(flags | deltaUpdateFlags);
      this.requestUpdate(this, deltaUpdateFlags, immediate);
    }
  }

  protected needsUpdate(updateFlags: ControllerFlags, immediate: boolean): ControllerFlags {
    return updateFlags;
  }

  requestUpdate(target: Controller, updateFlags: ControllerFlags, immediate: boolean): void {
    updateFlags = this.needsUpdate(updateFlags, immediate);
    let deltaUpdateFlags = this.flags & ~updateFlags & Controller.UpdateMask;
    if ((updateFlags & Controller.CompileMask) !== 0) {
      deltaUpdateFlags |= Controller.NeedsCompile;
    }
    if ((updateFlags & Controller.ExecuteMask) !== 0) {
      deltaUpdateFlags |= Controller.NeedsExecute;
    }
    if (deltaUpdateFlags !== 0 || immediate) {
      this.setFlags(this.flags | deltaUpdateFlags);
      const parent = this.parent;
      if (parent !== null) {
        parent.requestUpdate(target, updateFlags, immediate);
      } else if (this.mounted) {
        const executeService = this.executeProvider.service;
        if (executeService !== void 0 && executeService !== null) {
          executeService.requestUpdate(target, updateFlags, immediate);
        }
      }
    }
  }

  get updating(): boolean {
    return (this.flags & Controller.UpdatingMask) !== 0;
  }

  get compiling(): boolean {
    return (this.flags & Controller.CompilingFlag) !== 0;
  }

  protected needsCompile(compileFlags: ControllerFlags, controllerContext: ControllerContextType<this>): ControllerFlags {
    return compileFlags;
  }

  cascadeCompile(compileFlags: ControllerFlags, baseControllerContext: ControllerContext): void {
    const controllerContext = this.extendControllerContext(baseControllerContext);
    compileFlags &= ~Controller.NeedsCompile;
    compileFlags |= this.flags & Controller.UpdateMask;
    compileFlags = this.needsCompile(compileFlags, controllerContext);
    if ((compileFlags & Controller.CompileMask) !== 0) {
      let cascadeFlags = compileFlags;
      this.setFlags(this.flags & ~Controller.NeedsCompile | (Controller.TraversingFlag | Controller.CompilingFlag));
      try {
        this.willCompile(cascadeFlags, controllerContext);
        if (((this.flags | compileFlags) & Controller.NeedsResolve) !== 0) {
          cascadeFlags |= Controller.NeedsResolve;
          this.setFlags(this.flags & ~Controller.NeedsResolve);
          this.willResolve(controllerContext);
        }
        if (((this.flags | compileFlags) & Controller.NeedsGenerate) !== 0) {
          cascadeFlags |= Controller.NeedsGenerate;
          this.setFlags(this.flags & ~Controller.NeedsGenerate);
          this.willGenerate(controllerContext);
        }
        if (((this.flags | compileFlags) & Controller.NeedsAssemble) !== 0) {
          cascadeFlags |= Controller.NeedsAssemble;
          this.setFlags(this.flags & ~Controller.NeedsAssemble);
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
          this.compileChildren(cascadeFlags, controllerContext, this.compileChild);
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
        this.setFlags(this.flags & ~(Controller.TraversingFlag | Controller.CompilingFlag));
      }
    }
  }

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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillResolve !== void 0) {
        observer.controllerWillResolve(controllerContext, this);
      }
    }
  }

  protected onResolve(controllerContext: ControllerContextType<this>): void {
    // hook
  }

  protected didResolve(controllerContext: ControllerContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidResolve !== void 0) {
        observer.controllerDidResolve(controllerContext, this);
      }
    }
  }

  protected willGenerate(controllerContext: ControllerContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillGenerate !== void 0) {
        observer.controllerWillGenerate(controllerContext, this);
      }
    }
  }

  protected onGenerate(controllerContext: ControllerContextType<this>): void {
    // hook
  }

  protected didGenerate(controllerContext: ControllerContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidGenerate !== void 0) {
        observer.controllerDidGenerate(controllerContext, this);
      }
    }
  }

  protected willAssemble(controllerContext: ControllerContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillAssemble !== void 0) {
        observer.controllerWillAssemble(controllerContext, this);
      }
    }
  }

  protected onAssemble(controllerContext: ControllerContextType<this>): void {
    // hook
  }

  protected didAssemble(controllerContext: ControllerContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidAssemble !== void 0) {
        observer.controllerDidAssemble(controllerContext, this);
      }
    }
  }

  protected compileChildren(compileFlags: ControllerFlags, controllerContext: ControllerContextType<this>,
                            compileChild: (this: this, child: Controller, compileFlags: ControllerFlags,
                                           controllerContext: ControllerContextType<this>) => void): void {
    type self = this;
    function compileNext(this: self, child: Controller): void {
      compileChild.call(this, child, compileFlags, controllerContext);
      if ((child.flags & Controller.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~Controller.RemovingFlag);
        this.removeChild(child);
      }
    }
    this.forEachChild(compileNext, this);
  }

  protected compileChild(child: Controller, compileFlags: ControllerFlags, controllerContext: ControllerContextType<this>): void {
    child.cascadeCompile(compileFlags, controllerContext);
  }

  get executing(): boolean {
    return (this.flags & Controller.ExecutingFlag) !== 0;
  }

  protected needsExecute(executeFlags: ControllerFlags, controllerContext: ControllerContextType<this>): ControllerFlags {
    return executeFlags;
  }

  cascadeExecute(executeFlags: ControllerFlags, baseControllerContext: ControllerContext): void {
    const controllerContext = this.extendControllerContext(baseControllerContext);
    executeFlags &= ~Controller.NeedsExecute;
    executeFlags |= this.flags & Controller.UpdateMask;
    executeFlags = this.needsExecute(executeFlags, controllerContext);
    if ((executeFlags & Controller.ExecuteMask) !== 0) {
      let cascadeFlags = executeFlags;
      this.setFlags(this.flags & ~Controller.NeedsExecute | (Controller.TraversingFlag | Controller.ExecutingFlag));
      try {
        this.willExecute(cascadeFlags, controllerContext);
        if (((this.flags | executeFlags) & Controller.NeedsRevise) !== 0) {
          cascadeFlags |= Controller.NeedsRevise;
          this.setFlags(this.flags & ~Controller.NeedsRevise);
          this.willRevise(controllerContext);
        }
        if (((this.flags | executeFlags) & Controller.NeedsCompute) !== 0) {
          cascadeFlags |= Controller.NeedsCompute;
          this.setFlags(this.flags & ~Controller.NeedsCompute);
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
          this.executeChildren(cascadeFlags, controllerContext, this.executeChild);
        }

        if ((cascadeFlags & Controller.NeedsCompute) !== 0) {
          this.didCompute(controllerContext);
        }
        if ((cascadeFlags & Controller.NeedsRevise) !== 0) {
          this.didRevise(controllerContext);
        }
        this.didExecute(cascadeFlags, controllerContext);
      } finally {
        this.setFlags(this.flags & ~(Controller.TraversingFlag | Controller.ExecutingFlag));
      }
    }
  }

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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillRevise !== void 0) {
        observer.controllerWillRevise(controllerContext, this);
      }
    }
  }

  protected onRevise(controllerContext: ControllerContextType<this>): void {
    this.recohereFasteners(controllerContext.updateTime);
  }

  protected didRevise(controllerContext: ControllerContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidRevise !== void 0) {
        observer.controllerDidRevise(controllerContext, this);
      }
    }
  }

  protected willCompute(controllerContext: ControllerContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillCompute !== void 0) {
        observer.controllerWillCompute(controllerContext, this);
      }
    }
  }

  protected onCompute(controllerContext: ControllerContextType<this>): void {
    // hook
  }

  protected didCompute(controllerContext: ControllerContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidCompute !== void 0) {
        observer.controllerDidCompute(controllerContext, this);
      }
    }
  }

  protected executeChildren(executeFlags: ControllerFlags, controllerContext: ControllerContextType<this>,
                            executeChild: (this: this, child: Controller, executeFlags: ControllerFlags,
                                           controllerContext: ControllerContextType<this>) => void): void {
    type self = this;
    function executeNext(this: self, child: Controller): void {
      executeChild.call(this, child, executeFlags, controllerContext);
      if ((child.flags & Controller.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~Controller.RemovingFlag);
        this.removeChild(child);
      }
    }
    this.forEachChild(executeNext, this);
  }

  /** @internal */
  protected executeChild(child: Controller, executeFlags: ControllerFlags, controllerContext: ControllerContextType<this>): void {
    child.cascadeExecute(executeFlags, controllerContext);
  }

  protected override attachFastener(fastenerName: string, fastener: Fastener): void {
    super.attachFastener(fastenerName, fastener);
    if (fastener instanceof ControllerFastener && fastener.child === true) {
      const child = this.getChild(fastenerName);
      if (child !== null) {
        fastener.setOwnController(child, null);
      }
    }
  }

  /** @internal @override */
  override decohereFastener(fastener: Fastener): void {
    super.decohereFastener(fastener);
    this.requireUpdate(Controller.NeedsRevise);
  }

  @Provider({
    extends: ExecuteProvider,
    type: ExecuteService,
    observes: false,
    service: ExecuteService.global(),
  })
  readonly executeProvider!: ExecuteProvider<this>;

  @Provider({
    extends: HistoryProvider,
    type: HistoryService,
    observes: false,
    service: HistoryService.global(),
  })
  readonly historyProvider!: HistoryProvider<this>;

  @Provider({
    extends: StorageProvider,
    type: StorageService,
    observes: false,
    service: StorageService.global(),
  })
  readonly storageProvider!: StorageProvider<this>;

  /** @internal */
  get superControllerContext(): ControllerContext {
    const parent = this.parent;
    if (parent !== null) {
      return parent.controllerContext;
    } else {
      return this.executeProvider.updatedControllerContext();
    }
  }

  /** @internal */
  extendControllerContext(controllerContext: ControllerContext): ControllerContextType<this> {
    return controllerContext as ControllerContextType<this>;
  }

  get controllerContext(): ControllerContextType<this> {
    return this.extendControllerContext(this.superControllerContext);
  }

  /** @override */
  init(init: ControllerInit): void {
    // hook
  }

  static create<S extends new () => InstanceType<S>>(this: S): InstanceType<S> {
    return new this();
  }

  static fromInit<S extends abstract new (...args: any[]) => InstanceType<S>>(this: S, init: InitType<InstanceType<S>>): InstanceType<S> {
    let type: Creatable<Controller>;
    if ((typeof init === "object" && init !== null || typeof init === "function") && Creatable.is((init as ControllerInit).type)) {
      type = (init as ControllerInit).type!;
    } else {
      type = this as unknown as Creatable<Controller>;
    }
    const controller = type.create();
    controller.init(init as ControllerInit);
    return controller as InstanceType<S>;
  }

  static fromAny<S extends abstract new (...args: any[]) => InstanceType<S>>(this: S, value: AnyController<InstanceType<S>>): InstanceType<S> {
    if (value === void 0 || value === null) {
      return value as InstanceType<S>;
    } else if (value instanceof Controller) {
      if (value instanceof this) {
        return value;
      } else {
        throw new TypeError(value + " not an instance of " + this);
      }
    } else if (Creatable.is(value)) {
      return (value as Creatable<InstanceType<S>>).create();
    } else {
      return (this as unknown as ControllerFactory<InstanceType<S>>).fromInit(value);
    }
  }

  /** @internal */
  static override readonly MountedFlag: ControllerFlags = Hierarchy.MountedFlag;
  /** @internal */
  static override readonly TraversingFlag: ControllerFlags = Hierarchy.TraversingFlag;
  /** @internal */
  static override readonly RemovingFlag: ControllerFlags = Hierarchy.RemovingFlag;
  /** @internal */
  static readonly CompilingFlag: ControllerFlags = 1 << (Hierarchy.FlagShift + 0);
  /** @internal */
  static readonly ExecutingFlag: ControllerFlags = 1 << (Hierarchy.FlagShift + 1);
  /** @internal */
  static readonly ImmediateFlag: ControllerFlags = 1 << (Hierarchy.FlagShift + 2);
  /** @internal */
  static readonly UpdatingMask: ControllerFlags = Controller.CompilingFlag
                                                | Controller.ExecutingFlag;
  /** @internal */
  static readonly StatusMask: ControllerFlags = Controller.MountedFlag
                                              | Controller.TraversingFlag
                                              | Controller.RemovingFlag
                                              | Controller.CompilingFlag
                                              | Controller.ExecutingFlag
                                              | Controller.ImmediateFlag;

  static readonly NeedsCompile: ControllerFlags = 1 << (Hierarchy.FlagShift + 3);
  static readonly NeedsResolve: ControllerFlags = 1 << (Hierarchy.FlagShift + 4);
  static readonly NeedsGenerate: ControllerFlags = 1 << (Hierarchy.FlagShift + 5);
  static readonly NeedsAssemble: ControllerFlags = 1 << (Hierarchy.FlagShift + 6);
  /** @internal */
  static readonly CompileMask: ControllerFlags = Controller.NeedsCompile
                                               | Controller.NeedsResolve
                                               | Controller.NeedsGenerate
                                               | Controller.NeedsAssemble;

  static readonly NeedsExecute: ControllerFlags = 1 << (Hierarchy.FlagShift + 7);
  static readonly NeedsRevise: ControllerFlags = 1 << (Hierarchy.FlagShift + 8);
  static readonly NeedsCompute: ControllerFlags = 1 << (Hierarchy.FlagShift + 9);
  /** @internal */
  static readonly ExecuteMask: ControllerFlags = Controller.NeedsExecute
                                               | Controller.NeedsRevise
                                               | Controller.NeedsCompute;

  /** @internal */
  static readonly UpdateMask: ControllerFlags = Controller.CompileMask
                                              | Controller.ExecuteMask;

  /** @internal */
  static override readonly FlagShift: number = Hierarchy.FlagShift + 10;
  /** @internal */
  static override readonly FlagMask: ControllerFlags = (1 << Controller.FlagShift) - 1;

  static override readonly MountFlags: ControllerFlags = 0;
  static override readonly InsertChildFlags: ControllerFlags = 0;
  static override readonly RemoveChildFlags: ControllerFlags = 0;
}
