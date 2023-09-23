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
import type {Class} from "@swim/util";
import type {FromLike} from "@swim/util";
import type {Creatable} from "@swim/util";
import type {Consumer} from "@swim/util";
import type {Consumable} from "@swim/util";
import {FastenerContext} from "@swim/component";
import type {FastenerTemplate} from "@swim/component";
import type {Fastener} from "@swim/component";
import {Property} from "@swim/component";
import {Provider} from "@swim/component";
import type {ComponentFlags} from "@swim/component";
import type {ComponentObserver} from "@swim/component";
import {Component} from "@swim/component";
import type {ValueLike} from "@swim/structure";
import {Value} from "@swim/structure";
import type {UriLike} from "@swim/uri";
import {Uri} from "@swim/uri";
import type {WarpDownlinkModel} from "@swim/client";
import {WarpDownlink} from "@swim/client";
import {EventDownlink} from "@swim/client";
import {ValueDownlink} from "@swim/client";
import {ListDownlink} from "@swim/client";
import {MapDownlink} from "@swim/client";
import {WarpRef} from "@swim/client";
import {WarpClient} from "@swim/client";
import {ModelRelation} from "@swim/model";
import {TraitRelation} from "@swim/model";
import {ControllerRelation} from "./"; // forward import
import {TraitViewRef} from "./"; // forward import
import {ExecutorService} from "./"; // forward import

/** @public */
export type ControllerFlags = ComponentFlags;

/** @public */
export interface ControllerFactory<C extends Controller = Controller> extends Creatable<C>, FromLike<C> {
}

/** @public */
export interface ControllerClass<C extends Controller = Controller> extends Function, ControllerFactory<C> {
  readonly prototype: C;
}

/** @public */
export interface ControllerConstructor<C extends Controller = Controller> extends ControllerClass<C> {
  new(): C;
}

/** @public */
export interface ControllerObserver<C extends Controller = Controller> extends ComponentObserver<C> {
  controllerWillAttachParent?(parent: Controller, controller: C): void;

  controllerDidAttachParent?(parent: Controller, controller: C): void;

  controllerWillDetachParent?(parent: Controller, controller: C): void;

  controllerDidDetachParent?(parent: Controller, controller: C): void;

  controllerWillInsertChild?(child: Controller, target: Controller | null, controller: C): void;

  controllerDidInsertChild?(child: Controller, target: Controller | null, controller: C): void;

  controllerWillRemoveChild?(child: Controller, controller: C): void;

  controllerDidRemoveChild?(child: Controller, controller: C): void;

  controllerWillReinsertChild?(child: Controller, target: Controller | null, controller: C): void;

  controllerDidReinsertChild?(child: Controller, target: Controller | null, controller: C): void;

  controllerWillMount?(controller: Controller): void;

  controllerDidMount?(controller: Controller): void;

  controllerWillUnmount?(controller: Controller): void;

  controllerDidUnmount?(controller: Controller): void;

  controllerWillResolve?(controller: C): void;

  controllerDidResolve?(controller: C): void;

  controllerWillGenerate?(controller: C): void;

  controllerDidGenerate?(controller: C): void;

  controllerWillAssemble?(controller: C): void;

  controllerDidAssemble?(controller: C): void;

  controllerWillRevise?(controller: C): void;

  controllerDidRevise?(controller: C): void;

  controllerWillCompute?(controller: C): void;

  controllerDidCompute?(controller: C): void;

  controllerWillStartConsuming?(controller: C): void;

  controllerDidStartConsuming?(controller: C): void;

  controllerWillStopConsuming?(controller: C): void;

  controllerDidStopConsuming?(controller: C): void;
}

/** @public */
export class Controller extends Component<Controller> implements Consumable, WarpRef {
  constructor() {
    super();
    this.consumers = null;
  }

  /** @override */
  declare readonly observerType?: Class<ControllerObserver>;

  override get componentType(): Class<Controller> {
    return Controller;
  }

  protected override willAttachParent(parent: Controller): void {
    this.callObservers("controllerWillAttachParent", parent, this);
  }

  protected override onAttachParent(parent: Controller): void {
    // hook
  }

  protected override didAttachParent(parent: Controller): void {
    this.callObservers("controllerDidAttachParent", parent, this);
  }

  protected override willDetachParent(parent: Controller): void {
    this.callObservers("controllerWillDetachParent", parent, this);
  }

  protected override onDetachParent(parent: Controller): void {
    // hook
  }

  protected override didDetachParent(parent: Controller): void {
    this.callObservers("controllerDidDetachParent", parent, this);
  }

  protected override willInsertChild(child: Controller, target: Controller | null): void {
    super.willInsertChild(child, target);
    this.callObservers("controllerWillInsertChild", child, target, this);
  }

  protected override onInsertChild(child: Controller, target: Controller | null): void {
    super.onInsertChild(child, target);
  }

  protected override didInsertChild(child: Controller, target: Controller | null): void {
    this.callObservers("controllerDidInsertChild", child, target, this);
    super.didInsertChild(child, target);
  }

  /** @internal */
  override cascadeInsert(updateFlags?: ControllerFlags): void {
    if ((this.flags & Controller.MountedFlag) === 0) {
      return;
    } else if (updateFlags === void 0) {
      updateFlags = 0;
    }
    updateFlags |= this.flags & Controller.UpdateMask;
    if ((updateFlags & Controller.CompileMask) !== 0) {
      this.cascadeCompile(updateFlags);
    }
  }

  protected override willRemoveChild(child: Controller): void {
    super.willRemoveChild(child);
    this.callObservers("controllerWillRemoveChild", child, this);
  }

  protected override onRemoveChild(child: Controller): void {
    super.onRemoveChild(child);
  }

  protected override didRemoveChild(child: Controller): void {
    this.callObservers("controllerDidRemoveChild", child, this);
    super.didRemoveChild(child);
  }

  protected override willReinsertChild(child: Controller, target: Controller | null): void {
    super.willReinsertChild(child, target);
    this.callObservers("controllerWillReinsertChild", child, target, this);
  }

  protected override onReinsertChild(child: Controller, target: Controller | null): void {
    super.onReinsertChild(child, target);
  }

  protected override didReinsertChild(child: Controller, target: Controller | null): void {
    this.callObservers("controllerDidReinsertChild", child, target, this);
    super.didReinsertChild(child, target);
  }

  protected override willMount(): void {
    super.willMount();
    this.callObservers("controllerWillMount", this);
  }

  protected override didMount(): void {
    // subsume super
    this.requestUpdate(this, this.flags & Controller.UpdateMask, false);
    this.requireUpdate(this.mountFlags);

    if (this.decoherent !== null && this.decoherent.length !== 0) {
      this.requireUpdate(Controller.NeedsRevise);
    }

    this.mountFasteners();

    if (this.consumers !== null && this.consumers.size !== 0) {
      this.startConsuming();
    }

    this.callObservers("controllerDidMount", this);
    super.didMount();
  }

  protected override willUnmount(): void {
    super.willUnmount();
    this.callObservers("controllerWillUnmount", this);

    this.stopConsuming();
  }

  protected override didUnmount(): void {
    this.callObservers("controllerDidUnmount", this);
    super.didUnmount();
  }

  override requireUpdate(updateFlags: ControllerFlags, immediate: boolean = false): void {
    const flags = this.flags;
    const deltaUpdateFlags = updateFlags & ~flags & Controller.UpdateMask;
    if (deltaUpdateFlags === 0) {
      return;
    }
    this.setFlags(flags | deltaUpdateFlags);
    this.requestUpdate(this, deltaUpdateFlags, immediate);
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
    if (deltaUpdateFlags === 0 && !immediate) {
      return;
    }
    this.setFlags(this.flags | deltaUpdateFlags);
    const parent = this.parent;
    if (parent !== null) {
      parent.requestUpdate(target, updateFlags, immediate);
    } else if (this.mounted) {
      const updaterService = this.updater.service;
      if (updaterService !== null) {
        updaterService.requestUpdate(target, updateFlags, immediate);
      }
    }
  }

  get updating(): boolean {
    return (this.flags & Controller.UpdatingMask) !== 0;
  }

  get compiling(): boolean {
    return (this.flags & Controller.CompilingFlag) !== 0;
  }

  protected needsCompile(compileFlags: ControllerFlags): ControllerFlags {
    return compileFlags;
  }

  cascadeCompile(compileFlags: ControllerFlags): void {
    try {
      compileFlags &= ~Controller.NeedsCompile;
      compileFlags |= this.flags & Controller.UpdateMask;
      compileFlags = this.needsCompile(compileFlags);
      if ((compileFlags & Controller.CompileMask) === 0) {
        return;
      }
      let cascadeFlags = compileFlags;
      this.setFlags(this.flags & ~Controller.NeedsCompile | Controller.CompilingFlag);
      this.willCompile(cascadeFlags);
      if (((this.flags | compileFlags) & Controller.NeedsResolve) !== 0) {
        cascadeFlags |= Controller.NeedsResolve;
        this.setFlags(this.flags & ~Controller.NeedsResolve);
        this.willResolve();
      }
      if (((this.flags | compileFlags) & Controller.NeedsGenerate) !== 0) {
        cascadeFlags |= Controller.NeedsGenerate;
        this.setFlags(this.flags & ~Controller.NeedsGenerate);
        this.willGenerate();
      }
      if (((this.flags | compileFlags) & Controller.NeedsAssemble) !== 0) {
        cascadeFlags |= Controller.NeedsAssemble;
        this.setFlags(this.flags & ~Controller.NeedsAssemble);
        this.willAssemble();
      }

      this.onCompile(cascadeFlags);
      if ((cascadeFlags & Controller.NeedsResolve) !== 0) {
        this.onResolve();
      }
      if ((cascadeFlags & Controller.NeedsGenerate) !== 0) {
        this.onGenerate();
      }
      if ((cascadeFlags & Controller.NeedsAssemble) !== 0) {
        this.onAssemble();
      }

      if ((cascadeFlags & Controller.CompileMask) !== 0) {
        this.compileChildren(cascadeFlags, this.compileChild);
      }

      if ((cascadeFlags & Controller.NeedsAssemble) !== 0) {
        this.didAssemble();
      }
      if ((cascadeFlags & Controller.NeedsGenerate) !== 0) {
        this.didGenerate();
      }
      if ((cascadeFlags & Controller.NeedsResolve) !== 0) {
        this.didResolve();
      }
      this.didCompile(cascadeFlags);
    } finally {
      this.setFlags(this.flags & ~Controller.CompilingFlag);
    }
  }

  protected willCompile(compileFlags: ControllerFlags): void {
    // hook
  }

  protected onCompile(compileFlags: ControllerFlags): void {
    // hook
  }

  protected didCompile(compileFlags: ControllerFlags): void {
    // hook
  }

  protected willResolve(): void {
    this.callObservers("controllerWillResolve", this);
  }

  protected onResolve(): void {
    // hook
  }

  protected didResolve(): void {
    this.callObservers("controllerDidResolve", this);
  }

  protected willGenerate(): void {
    this.callObservers("controllerWillGenerate", this);
  }

  protected onGenerate(): void {
    // hook
  }

  protected didGenerate(): void {
    this.callObservers("controllerDidGenerate", this);
  }

  protected willAssemble(): void {
    this.callObservers("controllerWillAssemble", this);
  }

  protected onAssemble(): void {
    // hook
  }

  protected didAssemble(): void {
    this.callObservers("controllerDidAssemble", this);
  }

  protected compileChildren(compileFlags: ControllerFlags, compileChild: (this: this, child: Controller, compileFlags: ControllerFlags) => void): void {
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      compileChild.call(this, child, compileFlags);
      if (next !== null && next.parent !== this) {
        throw new Error("inconsistent compile pass");
      }
      child = next;
    }
  }

  protected compileChild(child: Controller, compileFlags: ControllerFlags): void {
    child.cascadeCompile(compileFlags);
  }

  get executing(): boolean {
    return (this.flags & Controller.ExecutingFlag) !== 0;
  }

  protected needsExecute(executeFlags: ControllerFlags): ControllerFlags {
    return executeFlags;
  }

  cascadeExecute(executeFlags: ControllerFlags): void {
    try {
      executeFlags &= ~Controller.NeedsExecute;
      executeFlags |= this.flags & Controller.UpdateMask;
      executeFlags = this.needsExecute(executeFlags);
      if ((executeFlags & Controller.ExecuteMask) === 0) {
        return;
      }
      let cascadeFlags = executeFlags;
      this.setFlags(this.flags & ~Controller.NeedsExecute | Controller.ExecutingFlag);
      this.willExecute(cascadeFlags);
      if (((this.flags | executeFlags) & Controller.NeedsRevise) !== 0) {
        cascadeFlags |= Controller.NeedsRevise;
        this.setFlags(this.flags & ~Controller.NeedsRevise);
        this.willRevise();
      }
      if (((this.flags | executeFlags) & Controller.NeedsCompute) !== 0) {
        cascadeFlags |= Controller.NeedsCompute;
        this.setFlags(this.flags & ~Controller.NeedsCompute);
        this.willCompute();
      }

      this.onExecute(cascadeFlags);
      if ((cascadeFlags & Controller.NeedsRevise) !== 0) {
        this.onRevise();
      }
      if ((cascadeFlags & Controller.NeedsCompute) !== 0) {
        this.onCompute();
      }

      if ((cascadeFlags & Controller.ExecuteMask) !== 0) {
        this.executeChildren(cascadeFlags, this.executeChild);
      }

      if ((cascadeFlags & Controller.NeedsCompute) !== 0) {
        this.didCompute();
      }
      if ((cascadeFlags & Controller.NeedsRevise) !== 0) {
        this.didRevise();
      }
      this.didExecute(cascadeFlags);
    } finally {
      this.setFlags(this.flags & ~Controller.ExecutingFlag);
    }
  }

  protected willExecute(executeFlags: ControllerFlags): void {
    // hook
  }

  protected onExecute(executeFlags: ControllerFlags): void {
    // hook
  }

  protected didExecute(executeFlags: ControllerFlags): void {
    // hook
  }

  protected willRevise(): void {
    this.callObservers("controllerWillRevise", this);
  }

  protected onRevise(): void {
    this.recohereFasteners(this.updateTime);
  }

  protected didRevise(): void {
    this.callObservers("controllerDidRevise", this);
  }

  protected willCompute(): void {
    this.callObservers("controllerWillCompute", this);
  }

  protected onCompute(): void {
    // hook
  }

  protected didCompute(): void {
    this.callObservers("controllerDidCompute", this);
  }

  protected executeChildren(executeFlags: ControllerFlags, executeChild: (this: this, child: Controller, executeFlags: ControllerFlags) => void): void {
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      executeChild.call(this, child, executeFlags);
      if (next !== null && next.parent !== this) {
        throw new Error("inconsistent execute pass");
      }
      child = next;
    }
  }

  /** @internal */
  protected executeChild(child: Controller, executeFlags: ControllerFlags): void {
    child.cascadeExecute(executeFlags);
  }

  protected override bindFastener(fastener: Fastener): void {
    super.bindFastener(fastener);
    if (this.consuming) {
      if (fastener instanceof WarpDownlink && fastener.consumed === true) {
        fastener.consume(this);
      } else if (fastener instanceof ControllerRelation && fastener.consumed === true) {
        fastener.consume(this);
      } else if (fastener instanceof TraitViewRef && fastener.consumed === true) {
        fastener.consume(this);
      } else if (fastener instanceof TraitRelation && fastener.consumed === true) {
        fastener.consume(this);
      } else if (fastener instanceof ModelRelation && fastener.consumed === true) {
        fastener.consume(this);
      }
    }
  }

  /** @internal */
  protected override bindChildFastener(fastener: Fastener, child: Controller, target: Controller | null): void {
    super.bindChildFastener(fastener, child, target);
    if (fastener instanceof ControllerRelation) {
      fastener.bindController(child, target);
    }
  }

  /** @internal */
  protected override unbindChildFastener(fastener: Fastener, child: Controller): void {
    if (fastener instanceof ControllerRelation) {
      fastener.unbindController(child);
    }
    super.unbindChildFastener(fastener, child);
  }

  /** @internal */
  protected override enqueueFastener(fastener: Fastener): void {
    super.enqueueFastener(fastener);
    this.requireUpdate(Controller.NeedsRevise);
  }

  /** @internal */
  override recohereFasteners(t?: number): void {
    const decoherent = this.decoherent;
    if (decoherent === null || decoherent.length === 0) {
      return;
    } else if (t === void 0) {
      t = performance.now();
    }
    let coherentDownlinkProps = false;
    (this as Mutable<this>).coherentTime = t;
    (this as Mutable<this>).decoherent = null;
    (this as Mutable<this>).recohering = decoherent;
    try {
      for (let i = 0; i < decoherent.length; i += 1) {
        const fastener = decoherent[i]!;
        if (fastener instanceof WarpDownlink && !coherentDownlinkProps) {
          coherentDownlinkProps = true;
          this.hostUri.recohere(t);
          this.nodeUri.recohere(t);
          this.laneUri.recohere(t);
        }
        fastener.recohere(t);
      }
    } finally {
      (this as Mutable<this>).recohering = null;
    }
  }

  /** @internal */
  readonly consumers: ReadonlySet<Consumer> | null;

  /** @override */
  consume(consumer: Consumer): void {
    let consumers = this.consumers as Set<Consumer> | null;
    if (consumers === null) {
      consumers = new Set<Consumer>();
      (this as Mutable<this>).consumers = consumers;
    } else if (consumers.has(consumer)) {
      return;
    }
    this.willConsume(consumer);
    consumers.add(consumer);
    this.onConsume(consumer);
    this.didConsume(consumer);
    if (consumers.size === 1 && this.mounted) {
      this.startConsuming();
    }
  }

  protected willConsume(consumer: Consumer): void {
    // hook
  }

  protected onConsume(consumer: Consumer): void {
    // hook
  }

  protected didConsume(consumer: Consumer): void {
    // hook
  }

  /** @override */
  unconsume(consumer: Consumer): void {
    const consumers = this.consumers as Set<Consumer> | null;
    if (consumers === null || !consumers.has(consumer)) {
      return;
    }
    this.willUnconsume(consumer);
    consumers.delete(consumer);
    this.onUnconsume(consumer);
    this.didUnconsume(consumer);
    if (consumers.size === 0) {
      this.stopConsuming();
    }
  }

  protected willUnconsume(consumer: Consumer): void {
    // hook
  }

  protected onUnconsume(consumer: Consumer): void {
    // hook
  }

  protected didUnconsume(consumer: Consumer): void {
    // hook
  }

  get consuming(): boolean {
    return (this.flags & Controller.ConsumingFlag) !== 0;
  }

  get startConsumingFlags(): ControllerFlags {
    return (this.constructor as typeof Controller).StartConsumingFlags;
  }

  protected startConsuming(): void {
    if ((this.flags & Controller.ConsumingFlag) !== 0) {
      return;
    }
    this.willStartConsuming();
    this.setFlags(this.flags | Controller.ConsumingFlag);
    this.onStartConsuming();
    this.didStartConsuming();
  }

  protected willStartConsuming(): void {
    this.callObservers("controllerWillStartConsuming", this);
  }

  protected onStartConsuming(): void {
    this.requireUpdate(this.startConsumingFlags);
    this.startConsumingFasteners();
  }

  protected didStartConsuming(): void {
    this.callObservers("controllerDidStartConsuming", this);
  }

  get stopConsumingFlags(): ControllerFlags {
    return (this.constructor as typeof Controller).StopConsumingFlags;
  }

  protected stopConsuming(): void {
    if ((this.flags & Controller.ConsumingFlag) === 0) {
      return;
    }
    this.willStopConsuming();
    this.setFlags(this.flags & ~Controller.ConsumingFlag);
    this.onStopConsuming();
    this.didStopConsuming();
  }

  protected willStopConsuming(): void {
    this.callObservers("controllerWillStopConsuming", this);
  }

  protected onStopConsuming(): void {
    this.requireUpdate(this.stopConsumingFlags);
    this.stopConsumingFasteners();
  }

  protected didStopConsuming(): void {
    this.callObservers("controllerDidStopConsuming", this);
  }

  /** @internal */
  protected startConsumingFasteners(): void {
    const metaclass = FastenerContext.getMetaclass(this);
    if (metaclass === null) {
      return;
    }
    const fastenerSlots = metaclass.slots;
    for (let i = 0; i < fastenerSlots.length; i += 1) {
      const fastener = this[fastenerSlots[i]!];
      if (fastener instanceof WarpDownlink && fastener.consumed === true) {
        fastener.consume(this);
      } else if (fastener instanceof ControllerRelation && fastener.consumed === true) {
        fastener.consume(this);
      } else if (fastener instanceof TraitViewRef && fastener.consumed === true) {
        fastener.consume(this);
      } else if (fastener instanceof TraitRelation && fastener.consumed === true) {
        fastener.consume(this);
      } else if (fastener instanceof ModelRelation && fastener.consumed === true) {
        fastener.consume(this);
      }
    }
  }

  /** @internal */
  protected stopConsumingFasteners(): void {
    const metaclass = FastenerContext.getMetaclass(this);
    if (metaclass === null) {
      return;
    }
    const fastenerSlots = metaclass.slots;
    for (let i = 0; i < fastenerSlots.length; i += 1) {
      const fastener = this[fastenerSlots[i]!];
      if (fastener instanceof WarpDownlink && fastener.consumed === true) {
        fastener.unconsume(this);
      } else if (fastener instanceof ControllerRelation && fastener.consumed === true) {
        fastener.unconsume(this);
      } else if (fastener instanceof TraitViewRef && fastener.consumed === true) {
        fastener.unconsume(this);
      } else if (fastener instanceof TraitRelation && fastener.consumed === true) {
        fastener.unconsume(this);
      } else if (fastener instanceof ModelRelation && fastener.consumed === true) {
        fastener.unconsume(this);
      }
    }
  }

  get updateTime(): number {
    return this.updater.getService().updateTime;
  }

  @Provider({
    get serviceType(): typeof ExecutorService { // avoid static forward reference
      return ExecutorService;
    },
    mountRootService(service: ExecutorService): void {
      super.mountRootService(service);
      service.roots.addController(this.owner);
    },
    unmountRootService(service: ExecutorService): void {
      super.unmountRootService(service);
      service.roots.removeController(this.owner);
    },
  })
  readonly updater!: Provider<this, ExecutorService>;

  /** @override */
  @Property({
    valueType: Uri,
    value: null,
    inherits: true,
    get updateFlags(): ControllerFlags {
      return Controller.NeedsRevise;
    },
  })
  get hostUri(): Property<this, Uri | null> {
    return Property.getter();
  }

  /** @override */
  @Property({
    valueType: Uri,
    value: null,
    inherits: true,
    get updateFlags(): ControllerFlags {
      return Controller.NeedsRevise;
    },
  })
  get nodeUri(): Property<this, Uri | null> {
    return Property.getter();
  }

  /** @override */
  @Property({
    valueType: Uri,
    value: null,
    inherits: true,
    get updateFlags(): ControllerFlags {
      return Controller.NeedsRevise;
    },
  })
  get laneUri(): Property<this, Uri | null> {
    return Property.getter();
  }

  /** @override */
  downlink(template?: FastenerTemplate<EventDownlink<WarpRef>>): EventDownlink<WarpRef> {
    let downlinkClass = EventDownlink;
    if (template !== void 0) {
      downlinkClass = downlinkClass.define("downlink", template) as typeof EventDownlink;
    }
    return downlinkClass.create(this);
  }

  /** @override */
  downlinkValue<V = Value>(template?: FastenerTemplate<ValueDownlink<WarpRef, V>>): ValueDownlink<WarpRef, V> {
    let downlinkClass = ValueDownlink;
    if (template !== void 0) {
      downlinkClass = downlinkClass.define("downlinkValue", template) as typeof ValueDownlink;
    }
    return downlinkClass.create(this);
  }

  /** @override */
  downlinkList<V = Value>(template?: FastenerTemplate<ListDownlink<WarpRef, V>>): ListDownlink<WarpRef, V> {
    let downlinkClass = ListDownlink;
    if (template !== void 0) {
      downlinkClass = downlinkClass.define("downlinkList", template) as typeof ListDownlink;
    }
    return downlinkClass.create(this);
  }

  /** @override */
  downlinkMap<K = Value, V = Value>(template?: FastenerTemplate<MapDownlink<WarpRef, K, V>>): MapDownlink<WarpRef, K, V> {
    let downlinkClass = MapDownlink;
    if (template !== void 0) {
      downlinkClass = downlinkClass.define("downlinkMap", template) as typeof MapDownlink;
    }
    return downlinkClass.create(this);
  }

  /** @override */
  command(hostUri: UriLike, nodeUri: UriLike, laneUri: UriLike, body: ValueLike): void;
  /** @override */
  command(nodeUri: UriLike, laneUri: UriLike, body: ValueLike): void;
  /** @override */
  command(laneUri: UriLike, body: ValueLike): void;
  /** @override */
  command(body: ValueLike): void;
  command(hostUri: UriLike | ValueLike, nodeUri?: UriLike | ValueLike, laneUri?: UriLike | ValueLike, body?: ValueLike): void {
    if (nodeUri === void 0) {
      body = Value.fromLike(hostUri as ValueLike);
      laneUri = this.laneUri.getValue();
      nodeUri = this.nodeUri.getValue();
      hostUri = this.hostUri.value;
    } else if (laneUri === void 0) {
      body = Value.fromLike(nodeUri as ValueLike);
      laneUri = Uri.fromLike(hostUri as UriLike);
      nodeUri = this.nodeUri.getValue();
      hostUri = this.hostUri.value;
    } else if (body === void 0) {
      body = Value.fromLike(laneUri as ValueLike);
      laneUri = Uri.fromLike(nodeUri as UriLike);
      nodeUri = Uri.fromLike(hostUri as UriLike);
      hostUri = this.hostUri.value;
    } else {
      body = Value.fromLike(body);
      laneUri = Uri.fromLike(laneUri as UriLike);
      nodeUri = Uri.fromLike(nodeUri as UriLike);
      hostUri = Uri.fromLike(hostUri as UriLike);
    }
    if (hostUri === null) {
      hostUri = nodeUri.endpoint();
      nodeUri = hostUri.unresolve(nodeUri);
    }
    const warpRef = this.warpRef.value;
    warpRef.command(hostUri, nodeUri, laneUri, body);
  }

  /** @override */
  authenticate(hostUri: UriLike, credentials: ValueLike): void;
  /** @override */
  authenticate(credentials: ValueLike): void;
  authenticate(hostUri: UriLike | ValueLike, credentials?: ValueLike): void {
    if (credentials === void 0) {
      credentials = Value.fromLike(hostUri as ValueLike);
      hostUri = this.hostUri.getValue();
    } else {
      credentials = Value.fromLike(credentials);
      hostUri = Uri.fromLike(hostUri as UriLike);
    }
    const warpRef = this.warpRef.value;
    warpRef.authenticate(hostUri, credentials);
  }

  /** @override */
  hostRef(hostUri: UriLike): WarpRef {
    hostUri = Uri.fromLike(hostUri);
    const childRef = new Controller();
    childRef.hostUri.set(hostUri);
    this.appendChild(childRef);
    return childRef;
  }

  /** @override */
  nodeRef(hostUri: UriLike, nodeUri: UriLike): WarpRef;
  /** @override */
  nodeRef(nodeUri: UriLike): WarpRef;
  nodeRef(hostUri: UriLike | undefined, nodeUri?: UriLike): WarpRef {
    if (nodeUri === void 0) {
      nodeUri = Uri.fromLike(hostUri as UriLike);
      hostUri = nodeUri.endpoint();
      if (hostUri.isDefined()) {
        nodeUri = hostUri.unresolve(nodeUri);
      } else {
        hostUri = void 0;
      }
    } else {
      nodeUri = Uri.fromLike(nodeUri);
      hostUri = Uri.fromLike(hostUri as UriLike);
    }
    const childRef = new Controller();
    if (hostUri !== void 0) {
      childRef.hostUri.set(hostUri);
    }
    if (nodeUri !== void 0) {
      childRef.nodeUri.set(nodeUri);
    }
    this.appendChild(childRef);
    return childRef;
  }

  /** @override */
  laneRef(hostUri: UriLike, nodeUri: UriLike, laneUri: UriLike): WarpRef;
  /** @override */
  laneRef(nodeUri: UriLike, laneUri: UriLike): WarpRef;
  /** @override */
  laneRef(laneUri: UriLike): WarpRef;
  laneRef(hostUri: UriLike | undefined, nodeUri?: UriLike, laneUri?: UriLike): WarpRef {
    if (nodeUri === void 0) {
      laneUri = Uri.fromLike(hostUri as UriLike);
      nodeUri = void 0;
      hostUri = void 0;
    } else if (laneUri === void 0) {
      laneUri = Uri.fromLike(nodeUri);
      nodeUri = Uri.fromLike(hostUri as UriLike);
      hostUri = nodeUri.endpoint();
      if (hostUri.isDefined()) {
        nodeUri = hostUri.unresolve(nodeUri);
      } else {
        hostUri = void 0;
      }
    } else {
      laneUri = Uri.fromLike(laneUri);
      nodeUri = Uri.fromLike(nodeUri);
      hostUri = Uri.fromLike(hostUri as UriLike);
    }
    const childRef = new Controller();
    if (hostUri !== void 0) {
      childRef.hostUri.set(hostUri);
    }
    if (nodeUri !== void 0) {
      childRef.nodeUri.set(nodeUri);
    }
    if (laneUri !== void 0) {
      childRef.laneUri.set(laneUri);
    }
    this.appendChild(childRef);
    return childRef;
  }

  /** @internal @override */
  getDownlink(hostUri: Uri, nodeUri: Uri, laneUri: Uri): WarpDownlinkModel | null {
    const warpRef = this.warpRef.value;
    return warpRef.getDownlink(hostUri, nodeUri, laneUri);
  }

  /** @internal @override */
  openDownlink(downlink: WarpDownlinkModel): void {
    const warpRef = this.warpRef.value;
    warpRef.openDownlink(downlink);
  }

  @Property({
    valueType: WarpRef,
    inherits: true,
    get updateFlags(): ControllerFlags {
      return Controller.NeedsRevise;
    },
    initValue(): WarpRef {
      return WarpClient.global();
    },
    equalValues(newValue: WarpRef, oldValue: WarpRef): boolean {
      return newValue === oldValue;
    },
  })
  get warpRef(): Property<this, WarpRef> {
    return Property.getter();
  }

  /** @internal */
  static override uid: () => string = (function () {
    let nextId = 1;
    return function uid(): string {
      const id = ~~nextId;
      nextId += 1;
      return "controller" + id;
    };
  })();

  /** @internal */
  static override readonly MountedFlag: ControllerFlags = Component.MountedFlag;
  /** @internal */
  static override readonly InsertingFlag: ControllerFlags = Component.InsertingFlag;
  /** @internal */
  static override readonly RemovingFlag: ControllerFlags = Component.RemovingFlag;
  /** @internal */
  static readonly CompilingFlag: ControllerFlags = 1 << (Component.FlagShift + 0);
  /** @internal */
  static readonly ExecutingFlag: ControllerFlags = 1 << (Component.FlagShift + 1);
  /** @internal */
  static readonly ConsumingFlag: ControllerFlags = 1 << (Component.FlagShift + 2);
  /** @internal */
  static readonly UpdatingMask: ControllerFlags = this.CompilingFlag
                                                | this.ExecutingFlag;
  /** @internal */
  static readonly StatusMask: ControllerFlags = this.MountedFlag
                                              | this.InsertingFlag
                                              | this.RemovingFlag
                                              | this.CompilingFlag
                                              | this.ExecutingFlag;

  static readonly NeedsCompile: ControllerFlags = 1 << (Component.FlagShift + 3);
  static readonly NeedsResolve: ControllerFlags = 1 << (Component.FlagShift + 4);
  static readonly NeedsGenerate: ControllerFlags = 1 << (Component.FlagShift + 5);
  static readonly NeedsAssemble: ControllerFlags = 1 << (Component.FlagShift + 6);
  /** @internal */
  static readonly CompileMask: ControllerFlags = this.NeedsCompile
                                               | this.NeedsResolve
                                               | this.NeedsGenerate
                                               | this.NeedsAssemble;

  static readonly NeedsExecute: ControllerFlags = 1 << (Component.FlagShift + 7);
  static readonly NeedsRevise: ControllerFlags = 1 << (Component.FlagShift + 8);
  static readonly NeedsCompute: ControllerFlags = 1 << (Component.FlagShift + 9);
  /** @internal */
  static readonly ExecuteMask: ControllerFlags = this.NeedsExecute
                                               | this.NeedsRevise
                                               | this.NeedsCompute;

  /** @internal */
  static readonly UpdateMask: ControllerFlags = this.CompileMask
                                              | this.ExecuteMask;

  /** @internal */
  static override readonly FlagShift: number = Component.FlagShift + 10;
  /** @internal */
  static override readonly FlagMask: ControllerFlags = (1 << this.FlagShift) - 1;

  static override readonly MountFlags: ControllerFlags = 0;
  static override readonly InsertChildFlags: ControllerFlags = 0;
  static override readonly RemoveChildFlags: ControllerFlags = 0;
  static override readonly ReinsertChildFlags: ControllerFlags = 0;
  static readonly StartConsumingFlags: ControllerFlags = 0;
  static readonly StopConsumingFlags: ControllerFlags = 0;
}
