// Copyright 2015-2022 Swim.inc
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

import {
  Mutable,
  Class,
  Instance,
  Arrays,
  Comparator,
  FromAny,
  Dictionary,
  MutableDictionary,
  Creatable,
  Inits,
  Initable,
  Consumer,
  Consumable,
} from "@swim/util";
import {
  FastenerClass,
  Fastener,
  Property,
  Provider,
  ComponentFlags,
  ComponentInit,
  Component,
} from "@swim/component";
import {AnyValue, Value} from "@swim/structure";
import {AnyUri, Uri} from "@swim/uri";
import {
  WarpDownlinkModel,
  WarpDownlink,
  EventDownlinkTemplate,
  EventDownlink,
  ValueDownlinkTemplate,
  ValueDownlink,
  ListDownlinkTemplate,
  ListDownlink,
  MapDownlinkTemplate,
  MapDownlink,
  WarpRef,
  WarpClient,
} from "@swim/client";
import type {ModelObserver} from "./ModelObserver";
import {ModelRelation} from "./"; // forward import
import {AnyTrait, Trait} from "../"; // forward import
import {TraitRelation} from "../"; // forward import
import {RefresherService} from "../"; // forward import
import {SelectionService} from "../"; // forward import

/** @public */
export type ModelFlags = ComponentFlags;

/** @public */
export type AnyModel<M extends Model = Model> = M | ModelFactory<M> | Inits<M>;

/** @public */
export interface ModelInit extends ComponentInit {
  type?: Creatable<Model>;
  key?: string;
  traits?: AnyTrait[];
  children?: AnyModel[];
}

/** @public */
export interface ModelFactory<M extends Model = Model, U = AnyModel<M>> extends Creatable<M>, FromAny<M, U> {
  fromInit(init: Inits<M>): M;
}

/** @public */
export interface ModelClass<M extends Model = Model, U = AnyModel<M>> extends Function, ModelFactory<M, U> {
  readonly prototype: M;
}

/** @public */
export interface ModelConstructor<M extends Model = Model, U = AnyModel<M>> extends ModelClass<M, U> {
  new(): M;
}

/** @public */
export class Model extends Component<Model> implements Initable<ModelInit>, Consumable, WarpRef {
  constructor() {
    super();
    this.consumers = Arrays.empty;
    this.firstTrait = null;
    this.lastTrait = null;
    this.traitMap = null;
  }

  override get componentType(): Class<Model> {
    return Model;
  }

  override readonly observerType?: Class<ModelObserver>;

  protected override willAttachParent(parent: Model): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillAttachParent !== void 0) {
        observer.modelWillAttachParent(parent, this);
      }
    }
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.willAttachParent(parent);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected override onAttachParent(parent: Model): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.onAttachParent(parent);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected override didAttachParent(parent: Model): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.didAttachParent(parent);
      trait = next !== null && next.model === this ? next : null;
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidAttachParent !== void 0) {
        observer.modelDidAttachParent(parent, this);
      }
    }
  }

  protected override willDetachParent(parent: Model): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillDetachParent !== void 0) {
        observer.modelWillDetachParent(parent, this);
      }
    }
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.willDetachParent(parent);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected override onDetachParent(parent: Model): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.onDetachParent(parent);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected override didDetachParent(parent: Model): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.didDetachParent(parent);
      trait = next !== null && next.model === this ? next : null;
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidDetachParent !== void 0) {
        observer.modelDidDetachParent(parent, this);
      }
    }
  }

  override setChild<M extends Model>(key: string, newChild: M): Model | null;
  override setChild<F extends Class<Instance<F, Model>> & Creatable<Instance<F, Model>>>(key: string, factory: F): Model | null;
  override setChild(key: string, newChild: AnyModel | null): Model | null;
  override setChild(key: string, newChild: AnyModel | null): Model | null {
    if (newChild !== null) {
      newChild = Model.fromAny(newChild);
    }
    return super.setChild(key, newChild) as Model | null;
  }

  override appendChild<M extends Model>(child: M, key?: string): M;
  override appendChild<F extends Class<Instance<F, Model>> & Creatable<Instance<F, Model>>>(factory: F, key?: string): InstanceType<F>;
  override appendChild(child: AnyModel, key?: string): Model;
  override appendChild(child: AnyModel, key?: string): Model {
    child = Model.fromAny(child);
    return super.appendChild(child, key);
  }

  override prependChild<M extends Model>(child: M, key?: string): M;
  override prependChild<F extends Class<Instance<F, Model>> & Creatable<Instance<F, Model>>>(factory: F, key?: string): InstanceType<F>;
  override prependChild(child: AnyModel, key?: string): Model;
  override prependChild(child: AnyModel, key?: string): Model {
    child = Model.fromAny(child);
    return super.prependChild(child, key);
  }

  override insertChild<M extends Model>(child: M, target: Model | null, key?: string): M;
  override insertChild<F extends Class<Instance<F, Model>> & Creatable<Instance<F, Model>>>(factory: F, target: Model | null, key?: string): InstanceType<F>;
  override insertChild(child: AnyModel, target: Model | null, key?: string): Model;
  override insertChild(child: AnyModel, target: Model | null, key?: string): Model {
    child = Model.fromAny(child);
    return super.insertChild(child, target, key);
  }

  override reinsertChild(child: Model, target: Model | null): void {
    super.reinsertChild(child, target);
  }

  override replaceChild<M extends Model>(newChild: Model, oldChild: M): M;
  override replaceChild<M extends Model>(newChild: AnyModel, oldChild: M): M;
  override replaceChild(newChild: AnyModel, oldChild: Model): Model {
    newChild = Model.fromAny(newChild);
    return super.replaceChild(newChild, oldChild);
  }

  protected override willInsertChild(child: Model, target: Model | null): void {
    super.willInsertChild(child, target);
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillInsertChild !== void 0) {
        observer.modelWillInsertChild(child, target, this);
      }
    }
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.willInsertChild(child, target);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected override onInsertChild(child: Model, target: Model | null): void {
    super.onInsertChild(child, target);
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.onInsertChild(child, target);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected override didInsertChild(child: Model, target: Model | null): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.didInsertChild(child, target);
      trait = next !== null && next.model === this ? next : null;
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidInsertChild !== void 0) {
        observer.modelDidInsertChild(child, target, this);
      }
    }
    super.didInsertChild(child, target);
  }

  /** @internal */
  override cascadeInsert(updateFlags?: ModelFlags): void {
    if ((this.flags & Model.MountedFlag) !== 0) {
      if (updateFlags === void 0) {
        updateFlags = 0;
      }
      updateFlags |= this.flags & Model.UpdateMask;
      if ((updateFlags & Model.AnalyzeMask) !== 0) {
        this.cascadeAnalyze(updateFlags);
      }
    }
  }

  protected override willRemoveChild(child: Model): void {
    super.willRemoveChild(child);
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillRemoveChild !== void 0) {
        observer.modelWillRemoveChild(child, this);
      }
    }
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.willRemoveChild(child);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected override onRemoveChild(child: Model): void {
    super.onRemoveChild(child);
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.onRemoveChild(child);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected override didRemoveChild(child: Model): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.didRemoveChild(child);
      trait = next !== null && next.model === this ? next : null;
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidRemoveChild !== void 0) {
        observer.modelDidRemoveChild(child, this);
      }
    }
    super.didRemoveChild(child);
  }

  protected override willReinsertChild(child: Model, target: Model | null): void {
    super.willReinsertChild(child, target);
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillReinsertChild !== void 0) {
        observer.modelWillReinsertChild(child, target, this);
      }
    }
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.willReinsertChild(child, target);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected override onReinsertChild(child: Model, target: Model | null): void {
    super.onReinsertChild(child, target);
  }

  protected override didReinsertChild(child: Model, target: Model | null): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.didReinsertChild(child, target);
      trait = next !== null && next.model === this ? next : null;
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidReinsertChild !== void 0) {
        observer.modelDidReinsertChild(child, target, this);
      }
    }
    super.didReinsertChild(child, target);
  }

  /** @internal */
  override cascadeMount(): void {
    if ((this.flags & Model.MountedFlag) === 0) {
      this.willMount();
      this.setFlags(this.flags | Model.MountedFlag);
      this.onMount();
      this.mountTraits();
      this.mountChildren();
      this.didMount();
    } else {
      throw new Error("already mounted");
    }
  }

  protected override willMount(): void {
    super.willMount();
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillMount !== void 0) {
        observer.modelWillMount(this);
      }
    }
  }

  protected override onMount(): void {
    // subsume super
    this.requestUpdate(this, this.flags & Model.UpdateMask, false);
    this.requireUpdate(this.mountFlags);

    if (this.decoherent !== null && this.decoherent.length !== 0) {
      this.requireUpdate(Model.NeedsMutate);
    }

    this.mountFasteners();

    if (this.consumers.length !== 0) {
      this.startConsuming();
    }
  }

  protected override didMount(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidMount !== void 0) {
        observer.modelDidMount(this);
      }
    }
    super.didMount();
  }

  /** @internal */
  override cascadeUnmount(): void {
    if ((this.flags & Model.MountedFlag) !== 0) {
      this.willUnmount();
      this.setFlags(this.flags & ~Model.MountedFlag);
      this.unmountChildren();
      this.unmountTraits();
      this.onUnmount();
      this.didUnmount();
    } else {
      throw new Error("already unmounted");
    }
  }

  protected override willUnmount(): void {
    super.willUnmount();
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillUnmount !== void 0) {
        observer.modelWillUnmount(this);
      }
    }
  }

  protected override onUnmount(): void {
    this.stopConsuming();
    super.onUnmount();
  }

  protected override didUnmount(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidUnmount !== void 0) {
        observer.modelDidUnmount(this);
      }
    }
    super.didUnmount();
  }

  override requireUpdate(updateFlags: ModelFlags, immediate: boolean = false): void {
    const flags = this.flags;
    const deltaUpdateFlags = updateFlags & ~flags & Model.UpdateMask;
    if (deltaUpdateFlags !== 0) {
      this.setFlags(flags | deltaUpdateFlags);
      this.requestUpdate(this, deltaUpdateFlags, immediate);
    }
  }

  protected needsUpdate(updateFlags: ModelFlags, immediate: boolean): ModelFlags {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      updateFlags = trait.needsUpdate(updateFlags, immediate);
      trait = next !== null && next.model === this ? next : null;
    }
    return updateFlags;
  }

  requestUpdate(target: Model, updateFlags: ModelFlags, immediate: boolean): void {
    updateFlags = this.needsUpdate(updateFlags, immediate);
    let deltaUpdateFlags = this.flags & ~updateFlags & Model.UpdateMask;
    if ((updateFlags & Model.AnalyzeMask) !== 0) {
      deltaUpdateFlags |= Model.NeedsAnalyze;
    }
    if ((updateFlags & Model.RefreshMask) !== 0) {
      deltaUpdateFlags |= Model.NeedsRefresh;
    }
    if (deltaUpdateFlags !== 0 || immediate) {
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
  }

  get updating(): boolean {
    return (this.flags & Model.UpdatingMask) !== 0;
  }

  get analyzing(): boolean {
    return (this.flags & Model.AnalyzingFlag) !== 0;
  }

  protected needsAnalyze(analyzeFlags: ModelFlags): ModelFlags {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      analyzeFlags = trait.needsAnalyze(analyzeFlags);
      trait = next !== null && next.model === this ? next : null;
    }
    return analyzeFlags;
  }

  cascadeAnalyze(analyzeFlags: ModelFlags): void {
    try {
      analyzeFlags &= ~Model.NeedsAnalyze;
      analyzeFlags |= this.flags & Model.UpdateMask;
      analyzeFlags = this.needsAnalyze(analyzeFlags);
      if ((analyzeFlags & Model.AnalyzeMask) !== 0) {
        let cascadeFlags = analyzeFlags;
        this.setFlags(this.flags & ~Model.NeedsAnalyze | Model.AnalyzingFlag);
        this.willAnalyze(cascadeFlags);
        if (((this.flags | analyzeFlags) & Model.NeedsMutate) !== 0) {
          cascadeFlags |= Model.NeedsMutate;
          this.setFlags(this.flags & ~Model.NeedsMutate);
          this.willMutate();
        }
        if (((this.flags | analyzeFlags) & Model.NeedsAggregate) !== 0) {
          cascadeFlags |= Model.NeedsAggregate;
          this.setFlags(this.flags & ~Model.NeedsAggregate);
          this.willAggregate();
        }
        if (((this.flags | analyzeFlags) & Model.NeedsCorrelate) !== 0) {
          cascadeFlags |= Model.NeedsCorrelate;
          this.setFlags(this.flags & ~Model.NeedsCorrelate);
          this.willCorrelate();
        }

        this.onAnalyze(cascadeFlags);
        if ((cascadeFlags & Model.NeedsMutate) !== 0) {
          this.onMutate();
        }
        if ((cascadeFlags & Model.NeedsAggregate) !== 0) {
          this.onAggregate();
        }
        if ((cascadeFlags & Model.NeedsCorrelate) !== 0) {
          this.onCorrelate();
        }

        if ((cascadeFlags & Model.AnalyzeMask) !== 0) {
          this.analyzeChildren(cascadeFlags, this.analyzeChild);
        }

        if ((cascadeFlags & Model.NeedsCorrelate) !== 0) {
          this.didCorrelate();
        }
        if ((cascadeFlags & Model.NeedsAggregate) !== 0) {
          this.didAggregate();
        }
        if ((cascadeFlags & Model.NeedsMutate) !== 0) {
          this.didMutate();
        }
        this.didAnalyze(cascadeFlags);
      }
    } finally {
      this.setFlags(this.flags & ~Model.AnalyzingFlag);
    }
  }

  protected willAnalyze(analyzeFlags: ModelFlags): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.willAnalyze(analyzeFlags);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected onAnalyze(analyzeFlags: ModelFlags): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.onAnalyze(analyzeFlags);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected didAnalyze(analyzeFlags: ModelFlags): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.didAnalyze(analyzeFlags);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected willMutate(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillMutate !== void 0) {
        observer.modelWillMutate(this);
      }
    }
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.willMutate();
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected onMutate(): void {
    this.recohereFasteners(this.updateTime);
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.onMutate();
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected didMutate(): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.didMutate();
      trait = next !== null && next.model === this ? next : null;
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidMutate !== void 0) {
        observer.modelDidMutate(this);
      }
    }
  }

  protected willAggregate(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillAggregate !== void 0) {
        observer.modelWillAggregate(this);
      }
    }
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.willAggregate();
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected onAggregate(): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.onAggregate();
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected didAggregate(): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.didAggregate();
      trait = next !== null && next.model === this ? next : null;
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidAggregate !== void 0) {
        observer.modelDidAggregate(this);
      }
    }
  }

  protected willCorrelate(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillCorrelate !== void 0) {
        observer.modelWillCorrelate(this);
      }
    }
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.willCorrelate();
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected onCorrelate(): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.onCorrelate();
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected didCorrelate(): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.didCorrelate();
      trait = next !== null && next.model === this ? next : null;
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidCorrelate !== void 0) {
        observer.modelDidCorrelate(this);
      }
    }
  }

  protected analyzeChildren(analyzeFlags: ModelFlags, analyzeChild: (this: this, child: Model, analyzeFlags: ModelFlags) => void): void {
    const trait = this.firstTrait;
    if (trait !== null) {
      this.analyzeTraitChildren(trait, analyzeFlags, analyzeChild);
    } else {
      this.analyzeOwnChildren(analyzeFlags, analyzeChild);
    }
  }

  protected analyzeTraitChildren(trait: Trait, analyzeFlags: ModelFlags, analyzeChild: (this: this, child: Model, analyzeFlags: ModelFlags) => void): void {
    const next = trait.nextTrait;
    if (next !== null) {
      trait.analyzeChildren(analyzeFlags, analyzeChild as any, this.analyzeTraitChildren.bind(this, next) as any);
    } else {
      trait.analyzeChildren(analyzeFlags, analyzeChild as any, this.analyzeOwnChildren as any);
    }
  }

  protected analyzeOwnChildren(analyzeFlags: ModelFlags,
                               analyzeChild: (this: this, child: Model, analyzeFlags: ModelFlags) => void): void {
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      analyzeChild.call(this, child, analyzeFlags);
      if (next !== null && next.parent !== this) {
        throw new Error("inconsistent analyze pass");
      }
      child = next;
    }
  }

  protected analyzeChild(child: Model, analyzeFlags: ModelFlags): void {
    child.cascadeAnalyze(analyzeFlags);
  }

  get refreshing(): boolean {
    return (this.flags & Model.RefreshingFlag) !== 0;
  }

  protected needsRefresh(refreshFlags: ModelFlags): ModelFlags {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      refreshFlags = trait.needsRefresh(refreshFlags);
      trait = next !== null && next.model === this ? next : null;
    }
    return refreshFlags;
  }

  cascadeRefresh(refreshFlags: ModelFlags): void {
    try {
      refreshFlags &= ~Model.NeedsRefresh;
      refreshFlags |= this.flags & Model.UpdateMask;
      refreshFlags = this.needsRefresh(refreshFlags);
      if ((refreshFlags & Model.RefreshMask) !== 0) {
        let cascadeFlags = refreshFlags;
        this.setFlags(this.flags & ~Model.NeedsRefresh | Model.RefreshingFlag);
        this.willRefresh(cascadeFlags);
        if (((this.flags | refreshFlags) & Model.NeedsValidate) !== 0) {
          cascadeFlags |= Model.NeedsValidate;
          this.setFlags(this.flags & ~Model.NeedsValidate);
          this.willValidate();
        }
        if (((this.flags | refreshFlags) & Model.NeedsReconcile) !== 0) {
          cascadeFlags |= Model.NeedsReconcile;
          this.setFlags(this.flags & ~Model.NeedsReconcile);
          this.willReconcile();
        }

        this.onRefresh(cascadeFlags);
        if ((cascadeFlags & Model.NeedsValidate) !== 0) {
          this.onValidate();
        }
        if ((cascadeFlags & Model.NeedsReconcile) !== 0) {
          this.onReconcile();
        }

        if ((cascadeFlags & Model.RefreshMask)) {
          this.refreshChildren(cascadeFlags, this.refreshChild);
        }

        if ((cascadeFlags & Model.NeedsReconcile) !== 0) {
          this.didReconcile();
        }
        if ((cascadeFlags & Model.NeedsValidate) !== 0) {
          this.didValidate();
        }
        this.didRefresh(cascadeFlags);
      }
    } finally {
      this.setFlags(this.flags & ~Model.RefreshingFlag);
    }
  }

  protected willRefresh(refreshFlags: ModelFlags): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.willRefresh(refreshFlags);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected onRefresh(refreshFlags: ModelFlags): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.onRefresh(refreshFlags);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected didRefresh(refreshFlags: ModelFlags): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.didRefresh(refreshFlags);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected willValidate(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillValidate !== void 0) {
        observer.modelWillValidate(this);
      }
    }
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.willValidate();
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected onValidate(): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.onValidate();
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected didValidate(): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.didValidate();
      trait = next !== null && next.model === this ? next : null;
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidValidate !== void 0) {
        observer.modelDidValidate(this);
      }
    }
  }

  protected willReconcile(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillReconcile !== void 0) {
        observer.modelWillReconcile(this);
      }
    }
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.willReconcile();
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected onReconcile(): void {
    this.recohereDownlinks(this.updateTime);
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.onReconcile();
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected didReconcile(): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.didReconcile();
      trait = next !== null && next.model === this ? next : null;
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidReconcile !== void 0) {
        observer.modelDidReconcile(this);
      }
    }
  }

  protected refreshChildren(refreshFlags: ModelFlags, refreshChild: (this: this, child: Model, refreshFlags: ModelFlags) => void): void {
    const trait = this.firstTrait;
    if (trait !== null) {
      this.refreshTraitChildren(trait, refreshFlags, refreshChild);
    } else {
      this.refreshOwnChildren(refreshFlags, refreshChild);
    }
  }

  protected refreshTraitChildren(trait: Trait, refreshFlags: ModelFlags, refreshChild: (this: this, child: Model, refreshFlags: ModelFlags) => void): void {
    const next = trait.nextTrait;
    if (next !== null) {
      trait.refreshChildren(refreshFlags, refreshChild as any, this.refreshTraitChildren.bind(this, next) as any);
    } else {
      trait.refreshChildren(refreshFlags, refreshChild as any, this.refreshOwnChildren as any);
    }
  }

  protected refreshOwnChildren(refreshFlags: ModelFlags, refreshChild: (this: this, child: Model, refreshFlags: ModelFlags) => void): void {
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      refreshChild.call(this, child, refreshFlags);
      if (next !== null && next.parent !== this) {
        throw new Error("inconsistent refresh pass");
      }
      child = next;
    }
  }

  protected refreshChild(child: Model, refreshFlags: ModelFlags): void {
    child.cascadeRefresh(refreshFlags);
  }

  readonly firstTrait: Trait | null;

  /** @internal */
  setFirstTrait(firstTrait: Trait | null): void {
    (this as Mutable<this>).firstTrait = firstTrait;
  }

  readonly lastTrait: Trait | null;

  /** @internal */
  setLastTrait(lastTrait: Trait | null): void {
    (this as Mutable<this>).lastTrait = lastTrait;
  }

  forEachTrait<T>(callback: (trait: Trait) => T | void): T | undefined;
  forEachTrait<T, S>(callback: (this: S, trait: Trait) => T | void, thisArg: S): T | undefined;
  forEachTrait<T, S>(callback: (this: S | undefined, trait: Trait) => T | void, thisArg?: S): T | undefined {
    let result: T | undefined;
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      const result = callback.call(thisArg, trait);
      if (result !== void 0) {
        break;
      }
      trait = next !== null && next.model === this ? next : null;
    }
    return result;
  }

  /** @internal */
  readonly traitMap: Dictionary<Trait> | null;

  /** @internal */
  protected insertTraitMap(trait: Trait): void {
    const key = trait.key;
    if (key !== void 0) {
      let traitMap = this.traitMap as MutableDictionary<Trait>;
      if (traitMap === null) {
        traitMap = {};
        (this as Mutable<this>).traitMap = traitMap;
      }
      traitMap[key] = trait;
    }
  }

  /** @internal */
  protected removeTraitMap(trait: Trait): void {
    const key = trait.key;
    if (key !== void 0) {
      const traitMap = this.traitMap as MutableDictionary<Trait>;
      if (traitMap !== null) {
        delete traitMap[key];
      }
    }
  }

  findTrait<F extends Class<Trait>>(key: string | undefined, traitBound: F): InstanceType<F> | null;
  findTrait(key: string | undefined, traitBound: Class<Trait> | undefined): Trait | null;
  findTrait(key: string | undefined, traitBound: Class<Trait> | undefined): Trait | null {
    if (key !== void 0) {
      const traitMap = this.traitMap;
      if (traitMap !== null) {
        const trait = traitMap[key];
        if (trait !== void 0 && (traitBound === void 0 || trait instanceof traitBound)) {
          return trait;
        }
      }
    }
    if (traitBound !== void 0) {
      let trait = this.firstTrait;
      while (trait !== null) {
        if (trait instanceof traitBound) {
          return trait;
        }
        trait = (trait as Trait).nextTrait;
      }
    }
    return null;
  }

  getTrait<F extends Class<Trait>>(key: string, traitBound: F): InstanceType<F> | null;
  getTrait(key: string, traitBound?: Class<Trait>): Trait | null;
  getTrait<F extends Class<Trait>>(traitBound: F): InstanceType<F> | null;
  getTrait(key: string | Class<Trait>, traitBound?: Class<Trait>): Trait | null {
    if (typeof key === "string") {
      const traitMap = this.traitMap;
      if (traitMap !== null) {
        const trait = traitMap[key];
        if (trait !== void 0 && (traitBound === void 0 || trait instanceof traitBound)) {
          return trait;
        }
      }
    } else {
      let trait = this.firstTrait;
      while (trait !== null) {
        if (trait instanceof key) {
          return trait;
        }
        trait = (trait as Trait).nextTrait;
      }
    }
    return null;
  }

  setTrait<T extends Trait>(key: string, newTrait: T): Trait | null;
  setTrait<F extends Class<Instance<F, Trait>> & Creatable<Instance<F, Trait>>>(key: string, factory: F): Trait | null;
  setTrait(key: string, newTrait: AnyTrait | null): Trait | null;
  setTrait(key: string, newTrait: AnyTrait | null): Trait | null {
    if (newTrait !== null) {
      newTrait = Trait.fromAny(newTrait);
    }
    const oldTrait = this.getTrait(key);
    let target: Trait | null;

    if (oldTrait !== null && newTrait !== null && oldTrait !== newTrait) { // replace
      newTrait.remove();
      target = oldTrait.nextTrait;

      this.willRemoveTrait(oldTrait);
      oldTrait.detachModel(this);
      this.removeTraitMap(oldTrait);
      this.onRemoveTrait(oldTrait);
      this.didRemoveTrait(oldTrait);
      oldTrait.setKey(void 0);

      newTrait.setFlags(newTrait.flags | Trait.InsertingFlag);
      newTrait.setKey(oldTrait.key);
      this.willInsertTrait(newTrait, target);
      this.insertTraitMap(newTrait);
      newTrait.attachModel(this, target);
      this.onInsertTrait(newTrait, target);
      this.didInsertTrait(newTrait, target);
      newTrait.setFlags(newTrait.flags & ~Trait.InsertingFlag);
    } else if (oldTrait !== newTrait || newTrait !== null && newTrait.key !== key) {
      if (oldTrait !== null) { // remove
        target = oldTrait.nextTrait;
        this.willRemoveTrait(oldTrait);
        oldTrait.detachModel(this);
        this.removeTraitMap(oldTrait);
        this.onRemoveTrait(oldTrait);
        this.didRemoveTrait(oldTrait);
        oldTrait.setKey(void 0);
      } else {
        target = null;
      }

      if (newTrait !== null) { // insert
        newTrait.remove();

        newTrait.setFlags(newTrait.flags | Trait.InsertingFlag);
        newTrait.setKey(key);
        this.willInsertTrait(newTrait, target);
        this.insertTraitMap(newTrait);
        newTrait.attachModel(this, target);
        this.onInsertTrait(newTrait, target);
        this.didInsertTrait(newTrait, target);
        newTrait.setFlags(newTrait.flags & ~Trait.InsertingFlag);
      }
    }

    return oldTrait;
  }

  appendTrait<T extends Trait>(trait: T, key?: string): T;
  appendTrait<F extends Class<Instance<F, Trait>> & Creatable<Instance<F, Trait>>>(factory: F, key?: string): InstanceType<F>;
  appendTrait(trait: AnyTrait, key?: string): Trait;
  appendTrait(trait: AnyTrait, key?: string): Trait {
    trait = Trait.fromAny(trait);

    trait.remove();
    if (key !== void 0) {
      this.removeChild(key);
    }

    trait.setFlags(trait.flags | Trait.InsertingFlag);
    trait.setKey(key);
    this.willInsertTrait(trait, null);
    this.insertTraitMap(trait);
    trait.attachModel(this, null);
    this.onInsertTrait(trait, null);
    this.didInsertTrait(trait, null);
    trait.setFlags(trait.flags & ~Trait.InsertingFlag);

    return trait;
  }

  prependTrait<T extends Trait>(trait: T, key?: string): T;
  prependTrait<F extends Class<Instance<F, Trait>> & Creatable<Instance<F, Trait>>>(factory: F, key?: string): InstanceType<F>;
  prependTrait(trait: AnyTrait, key?: string): Trait;
  prependTrait(trait: AnyTrait, key?: string): Trait {
    trait = Trait.fromAny(trait);

    trait.remove();
    if (key !== void 0) {
      this.removeChild(key);
    }
    const target = this.firstTrait;

    trait.setFlags(trait.flags | Trait.InsertingFlag);
    trait.setKey(key);
    this.willInsertTrait(trait, target);
    this.insertTraitMap(trait);
    trait.attachModel(this, target);
    this.onInsertTrait(trait, target);
    this.didInsertTrait(trait, target);
    trait.setFlags(trait.flags & ~Trait.InsertingFlag);

    return trait;
  }

  insertTrait<T extends Trait>(trait: T, target: Trait | null, key?: string): T;
  insertTrait<F extends Class<Instance<F, Trait>> & Creatable<Instance<F, Trait>>>(factory: F, target: Trait | null, key?: string): InstanceType<F>;
  insertTrait(trait: AnyTrait, target: Trait | null, key?: string): Trait;
  insertTrait(trait: AnyTrait, target: Trait | null, key?: string): Trait {
    if (target !== null && target.model !== this) {
      throw new Error("insert target is not a member trait");
    }
    trait = Trait.fromAny(trait);

    trait.remove();
    if (key !== void 0) {
      this.removeChild(key);
    }

    trait.setFlags(trait.flags | Trait.InsertingFlag);
    trait.setKey(key);
    this.willInsertTrait(trait, target);
    this.insertTraitMap(trait);
    trait.attachModel(this, target);
    this.onInsertTrait(trait, target);
    this.didInsertTrait(trait, target);
    trait.setFlags(trait.flags & ~Trait.InsertingFlag);

    return trait;
  }

  replaceTrait<T extends Trait>(newTrait: Trait, oldTrait: T): T;
  replaceTrait<T extends Trait>(newTrait: AnyTrait, oldTrait: T): T;
  replaceTrait(newTrait: AnyTrait, oldTrait: Trait): Trait {
    if (oldTrait.model !== this) {
      throw new Error("replacement target is not a member trait");
    }
    newTrait = Trait.fromAny(newTrait);

    if (oldTrait !== newTrait) {
      newTrait.remove();
      const target = oldTrait.nextTrait;

      this.willRemoveTrait(oldTrait);
      oldTrait.detachModel(this);
      this.removeTraitMap(oldTrait);
      this.onRemoveTrait(oldTrait);
      this.didRemoveTrait(oldTrait);
      oldTrait.setKey(void 0);

      newTrait.setFlags(newTrait.flags | Trait.InsertingFlag);
      newTrait.setKey(oldTrait.key);
      this.willInsertTrait(newTrait, target);
      this.insertTraitMap(newTrait);
      newTrait.attachModel(this, target);
      this.onInsertTrait(newTrait, target);
      this.didInsertTrait(newTrait, target);
      newTrait.setFlags(newTrait.flags & ~Trait.InsertingFlag);
    }

    return oldTrait;
  }


  get insertTraitFlags(): ModelFlags {
    return (this.constructor as typeof Model).InsertTraitFlags;
  }

  protected willInsertTrait(trait: Trait, target: Trait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillInsertTrait !== void 0) {
        observer.modelWillInsertTrait(trait, target, this);
      }
    }
    let prev = this.firstTrait;
    while (prev !== null) {
      const next = prev.nextTrait;
      if (prev !== trait) {
        prev.willInsertTrait(trait, target);
      }
      prev = next !== null && next.model === this ? next : null;
    }
  }

  protected onInsertTrait(trait: Trait, target: Trait | null): void {
    this.requireUpdate(this.insertTraitFlags);
    this.bindTraitFasteners(trait, target);
    let prev = this.firstTrait;
    while (prev !== null) {
      const next = prev.nextTrait;
      if (prev !== trait) {
        prev.onInsertTrait(trait, target);
      }
      prev = next !== null && next.model === this ? next : null;
    }
  }

  protected didInsertTrait(trait: Trait, target: Trait | null): void {
    let prev = this.firstTrait;
    while (prev !== null) {
      const next = prev.nextTrait;
      if (prev !== trait) {
        prev.didInsertTrait(trait, target);
      }
      prev = next !== null && next.model === this ? next : null;
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidInsertTrait !== void 0) {
        observer.modelDidInsertTrait(trait, target, this);
      }
    }
  }

  removeTrait<T extends Trait>(trait: T): T;
  removeTrait(key: string | Trait): Trait | null;
  removeTrait(key: string | Trait): Trait | null {
    let trait: Trait | null;
    if (typeof key === "string") {
      trait = this.getTrait(key);
      if (trait === null) {
        return null;
      }
    } else {
      trait = key;
      if (trait.model !== this) {
        throw new Error("not a member trait");
      }
    }

    this.willRemoveTrait(trait);
    trait.detachModel(this);
    this.removeTraitMap(trait);
    this.onRemoveTrait(trait);
    this.didRemoveTrait(trait);
    trait.setKey(void 0);

    return trait;
  }

  get removeTraitFlags(): ModelFlags {
    return (this.constructor as typeof Model).RemoveTraitFlags;
  }

  protected willRemoveTrait(trait: Trait): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillRemoveTrait !== void 0) {
        observer.modelWillRemoveTrait(trait, this);
      }
    }
    let prev = this.firstTrait;
    while (prev !== null) {
      const next = prev.nextTrait;
      if (prev !== trait) {
        prev.willRemoveTrait(trait);
      }
      prev = next !== null && next.model === this ? next : null;
    }
  }

  protected onRemoveTrait(trait: Trait): void {
    this.requireUpdate(this.removeTraitFlags);
    let prev = this.firstTrait;
    while (prev !== null) {
      const next = prev.nextTrait;
      if (prev !== trait) {
        prev.onRemoveTrait(trait);
      }
      prev = next !== null && next.model === this ? next : null;
    }
    this.unbindTraitFasteners(trait);
  }

  protected didRemoveTrait(trait: Trait): void {
    let prev = this.firstTrait;
    while (prev !== null) {
      const next = prev.nextTrait;
      if (prev !== trait) {
        prev.didRemoveTrait(trait);
      }
      prev = next !== null && next.model === this ? next : null;
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidRemoveTrait !== void 0) {
        observer.modelDidRemoveTrait(trait, this);
      }
    }
  }

  sortTraits(comparator: Comparator<Trait>): void {
    let trait = this.firstTrait;
    if (trait !== null) {
      const traits: Trait[] = [];
      do {
        traits.push(trait);
        trait = trait.nextTrait;
      } while (trait !== null);
      traits.sort(comparator);

      trait = traits[0]!;
      this.setFirstTrait(trait);
      trait.setPreviousTrait(null);
      for (let i = 1; i < traits.length; i += 1) {
        const next = traits[i]!;
        trait.setNextTrait(next);
        next.setPreviousTrait(trait);
        trait = next;
      }
      trait.setNextTrait(null);
      this.setLastTrait(trait);
    }
  }

  /** @internal */
  protected mountTraits(): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.mountTrait();
      if (next !== null && next.model !== this) {
        throw new Error("inconsistent mount");
      }
      trait = next;
    }
  }

  /** @internal */
  protected unmountTraits(): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.unmountTrait();
      if (next !== null && next.model !== this) {
        throw new Error("inconsistent unmount");
      }
      trait = next;
    }
  }

  getSuperTrait<F extends Class<Trait>>(superBound: F): InstanceType<F> | null {
    const parent = this.parent;
    if (parent === null) {
      return null;
    } else {
      const trait = parent.getTrait(superBound);
      if (trait !== null) {
        return trait;
      } else {
        return parent.getSuperTrait(superBound);
      }
    }
  }

  getBaseTrait<F extends Class<Trait>>(baseBound: F): InstanceType<F> | null {
    const parent = this.parent;
    if (parent === null) {
      return null;
    } else {
      const baseTrait = parent.getBaseTrait(baseBound);
      if (baseTrait !== null) {
        return baseTrait;
      } else {
        return parent.getTrait(baseBound);
      }
    }
  }

  protected override bindFastener(fastener: Fastener): void {
    super.bindFastener(fastener);
    if (fastener instanceof TraitRelation && fastener.binds) {
      let trait = this.firstTrait;
      while (trait !== null) {
        const next = trait.nextTrait;
        fastener.bindTrait(trait, next);
        trait = next !== null && next.model === this ? next : null;
      }
    }
    if (this.consuming) {
      if (fastener instanceof WarpDownlink && fastener.consumed === true) {
        fastener.consume(this);
      } else if (fastener instanceof TraitRelation && fastener.consumed === true) {
        fastener.consume(this);
      } else if (fastener instanceof ModelRelation && fastener.consumed === true) {
        fastener.consume(this);
      }
    }
  }

  /** @internal */
  protected override bindChildFastener(fastener: Fastener, child: Model, target: Model | null): void {
    super.bindChildFastener(fastener, child, target);
    if (fastener instanceof ModelRelation || fastener instanceof TraitRelation) {
      fastener.bindModel(child, target);
    }
  }

  /** @internal */
  protected override unbindChildFastener(fastener: Fastener, child: Model): void {
    if (fastener instanceof ModelRelation || fastener instanceof TraitRelation) {
      fastener.unbindModel(child);
    }
    super.unbindChildFastener(fastener, child);
  }

  /** @internal */
  protected bindTraitFasteners(trait: Trait, target: Trait | null): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      this.bindTraitFastener(fastener, trait, target);
    }
  }

  /** @internal */
  protected bindTraitFastener(fastener: Fastener, trait: Trait, target: Trait | null): void {
    if (fastener instanceof TraitRelation) {
      fastener.bindTrait(trait, target);
    }
  }

  /** @internal */
  protected unbindTraitFasteners(trait: Trait): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      this.unbindTraitFastener(fastener, trait);
    }
  }

  /** @internal */
  protected unbindTraitFastener(fastener: Fastener, trait: Trait): void {
    if (fastener instanceof TraitRelation) {
      fastener.unbindTrait(trait);
    }
  }

  /** @internal @override */
  override decohereFastener(fastener: Fastener): void {
    super.decohereFastener(fastener);
    if (fastener instanceof WarpDownlink) {
      this.requireUpdate(Model.NeedsReconcile);
    } else {
      this.requireUpdate(Model.NeedsMutate);
    }
  }

  /** @internal */
  override recohereFasteners(t?: number): void {
    const decoherent = this.decoherent;
    if (decoherent !== null) {
      const decoherentCount = decoherent.length;
      if (decoherentCount !== 0) {
        if (t === void 0) {
          t = performance.now();
        }
        (this as Mutable<this>).decoherent = null;
        for (let i = 0; i < decoherentCount; i += 1) {
          const fastener = decoherent[i]!;
          if (!(fastener instanceof WarpDownlink)) {
            fastener.recohere(t);
          } else {
            this.decohereFastener(fastener);
          }
        }
      }
    }
  }

  /** @internal */
  recohereDownlinks(t: number): void {
    const decoherent = this.decoherent;
    if (decoherent !== null) {
      const decoherentCount = decoherent.length;
      if (decoherentCount !== 0) {
        (this as Mutable<this>).decoherent = null;
        for (let i = 0; i < decoherentCount; i += 1) {
          const fastener = decoherent[i]!;
          if (fastener instanceof WarpDownlink) {
            fastener.recohere(t);
          } else {
            this.decohereFastener(fastener);
          }
        }
      }
    }
  }

  /** @internal */
  readonly consumers: ReadonlyArray<Consumer>;

  /** @override */
  consume(consumer: Consumer): void {
    const oldConsumers = this.consumers;
    const newConsumers = Arrays.inserted(consumer, oldConsumers);
    if (oldConsumers !== newConsumers) {
      this.willConsume(consumer);
      (this as Mutable<this>).consumers = newConsumers;
      this.onConsume(consumer);
      this.didConsume(consumer);
      if (oldConsumers.length === 0 && this.mounted) {
        this.startConsuming();
      }
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
    const oldConsumers = this.consumers;
    const newConsumers = Arrays.removed(consumer, oldConsumers);
    if (oldConsumers !== newConsumers) {
      this.willUnconsume(consumer);
      (this as Mutable<this>).consumers = newConsumers;
      this.onUnconsume(consumer);
      this.didUnconsume(consumer);
      if (newConsumers.length === 0) {
        this.stopConsuming();
      }
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
    return (this.flags & Model.ConsumingFlag) !== 0;
  }

  get startConsumingFlags(): ModelFlags {
    return (this.constructor as typeof Model).StartConsumingFlags;
  }

  protected startConsuming(): void {
    if ((this.flags & Model.ConsumingFlag) === 0) {
      this.willStartConsuming();
      this.setFlags(this.flags | Model.ConsumingFlag);
      this.onStartConsuming();
      this.didStartConsuming();
    }
  }

  protected willStartConsuming(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillStartConsuming !== void 0) {
        observer.modelWillStartConsuming(this);
      }
    }
  }

  protected onStartConsuming(): void {
    this.requireUpdate(this.startConsumingFlags);
    this.startConsumingFasteners();
  }

  protected didStartConsuming(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidStartConsuming !== void 0) {
        observer.modelDidStartConsuming(this);
      }
    }
  }

  get stopConsumingFlags(): ModelFlags {
    return (this.constructor as typeof Model).StopConsumingFlags;
  }

  protected stopConsuming(): void {
    if ((this.flags & Model.ConsumingFlag) !== 0) {
      this.willStopConsuming();
      this.setFlags(this.flags & ~Model.ConsumingFlag);
      this.onStopConsuming();
      this.didStopConsuming();
    }
  }

  protected willStopConsuming(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillStopConsuming !== void 0) {
        observer.modelWillStopConsuming(this);
      }
    }
  }

  protected onStopConsuming(): void {
    this.requireUpdate(this.stopConsumingFlags);
    this.stopConsumingFasteners();
  }

  protected didStopConsuming(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidStopConsuming !== void 0) {
        observer.modelDidStopConsuming(this);
      }
    }
  }

  /** @internal */
  protected startConsumingFasteners(): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      if (fastener instanceof WarpDownlink && fastener.consumed === true) {
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
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      if (fastener instanceof WarpDownlink && fastener.consumed === true) {
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

  @Provider<Model["updater"]>({
    get serviceType(): typeof RefresherService { // avoid static forward reference
      return RefresherService;
    },
    mountRootService(service: RefresherService): void {
      Provider.prototype.mountRootService.call(this, service);
      service.roots.addModel(this.owner);
    },
    unmountRootService(service: RefresherService): void {
      Provider.prototype.unmountRootService.call(this, service);
      service.roots.removeModel(this.owner);
    },
  })
  readonly updater!: Provider<this, RefresherService>;
  static readonly updater: FastenerClass<Model["updater"]>;

  @Provider<Model["selection"]>({
    get serviceType(): typeof SelectionService { // avoid static forward reference
      return SelectionService;
    },
  })
  readonly selection!: Provider<this, SelectionService>;
  static readonly selection: FastenerClass<Model["selection"]>;

  /** @override */
  @Property({valueType: Uri, value: null, inherits: true, updateFlags: Model.NeedsReconcile})
  readonly hostUri!: Property<this, Uri | null, AnyUri | null>;

  /** @override */
  @Property({valueType: Uri, value: null, inherits: true, updateFlags: Model.NeedsReconcile})
  readonly nodeUri!: Property<this, Uri | null, AnyUri | null>;

  /** @override */
  @Property({valueType: Uri, value: null, inherits: true, updateFlags: Model.NeedsReconcile})
  readonly laneUri!: Property<this, Uri | null, AnyUri | null>;

  /** @override */
  downlink(template?: EventDownlinkTemplate<EventDownlink<this>>): EventDownlink<this> {
    let downlinkClass = EventDownlink;
    if (template !== void 0) {
      downlinkClass = downlinkClass.define("downlink", template);
    }
    return downlinkClass.create(this);
  }

  /** @override */
  downlinkValue<V = Value, VU = V extends Value ? AnyValue & V : V>(template?: ValueDownlinkTemplate<ValueDownlink<this, V, VU>>): ValueDownlink<this, V, VU> {
    let downlinkClass = ValueDownlink;
    if (template !== void 0) {
      downlinkClass = downlinkClass.define("downlinkValue", template);
    }
    return downlinkClass.create(this);
  }

  /** @override */
  downlinkList<V = Value, VU = V extends Value ? AnyValue & V : V>(template?: ListDownlinkTemplate<ListDownlink<this, V, VU>>): ListDownlink<this, V, VU> {
    let downlinkClass = ListDownlink;
    if (template !== void 0) {
      downlinkClass = downlinkClass.define("downlinkList", template);
    }
    return downlinkClass.create(this);
  }

  /** @override */
  downlinkMap<K = Value, V = Value, KU = K extends Value ? AnyValue & K : K, VU = V extends Value ? AnyValue & V : V>(template?: MapDownlinkTemplate<MapDownlink<this, K, V, KU, VU>>): MapDownlink<this, K, V, KU, VU> {
    let downlinkClass = MapDownlink;
    if (template !== void 0) {
      downlinkClass = downlinkClass.define("downlinkMap", template);
    }
    return downlinkClass.create(this);
  }

  /** @override */
  command(hostUri: AnyUri, nodeUri: AnyUri, laneUri: AnyUri, body: AnyValue): void;
  /** @override */
  command(nodeUri: AnyUri, laneUri: AnyUri, body: AnyValue): void;
  /** @override */
  command(laneUri: AnyUri, body: AnyValue): void;
  /** @override */
  command(body: AnyValue): void;
  command(hostUri: AnyUri | AnyValue, nodeUri?: AnyUri | AnyValue, laneUri?: AnyUri | AnyValue, body?: AnyValue): void {
    if (nodeUri === void 0) {
      body = Value.fromAny(hostUri as AnyValue);
      laneUri = this.laneUri.getValue();
      nodeUri = this.nodeUri.getValue();
      hostUri = this.hostUri.value;
    } else if (laneUri === void 0) {
      body = Value.fromAny(nodeUri as AnyValue);
      laneUri = Uri.fromAny(hostUri as AnyUri);
      nodeUri = this.nodeUri.getValue();
      hostUri = this.hostUri.value;
    } else if (body === void 0) {
      body = Value.fromAny(laneUri as AnyValue);
      laneUri = Uri.fromAny(nodeUri as AnyUri);
      nodeUri = Uri.fromAny(hostUri as AnyUri);
      hostUri = this.hostUri.value;
    } else {
      body = Value.fromAny(body);
      laneUri = Uri.fromAny(laneUri as AnyUri);
      nodeUri = Uri.fromAny(nodeUri as AnyUri);
      hostUri = Uri.fromAny(hostUri as AnyUri);
    }
    if (hostUri === null) {
      hostUri = nodeUri.endpoint();
      nodeUri = hostUri.unresolve(nodeUri);
    }
    const warpRef = this.warpRef.value;
    warpRef.command(hostUri, nodeUri, laneUri, body);
  }

  /** @override */
  authenticate(hostUri: AnyUri, credentials: AnyValue): void;
  /** @override */
  authenticate(credentials: AnyValue): void;
  authenticate(hostUri: AnyUri | AnyValue, credentials?: AnyValue): void {
    if (credentials === void 0) {
      credentials = Value.fromAny(hostUri as AnyValue);
      hostUri = this.hostUri.getValue();
    } else {
      credentials = Value.fromAny(credentials);
      hostUri = Uri.fromAny(hostUri as AnyUri);
    }
    const warpRef = this.warpRef.value;
    warpRef.authenticate(hostUri, credentials);
  }

  /** @override */
  hostRef(hostUri: AnyUri): WarpRef {
    hostUri = Uri.fromAny(hostUri);
    const childRef = new Model();
    childRef.hostUri.setValue(hostUri);
    this.appendChild(childRef);
    return childRef;
  }

  /** @override */
  nodeRef(hostUri: AnyUri, nodeUri: AnyUri): WarpRef;
  /** @override */
  nodeRef(nodeUri: AnyUri): WarpRef;
  nodeRef(hostUri: AnyUri | undefined, nodeUri?: AnyUri): WarpRef {
    if (nodeUri === void 0) {
      nodeUri = Uri.fromAny(hostUri as AnyUri);
      hostUri = nodeUri.endpoint();
      if (hostUri.isDefined()) {
        nodeUri = hostUri.unresolve(nodeUri);
      } else {
        hostUri = void 0;
      }
    } else {
      nodeUri = Uri.fromAny(nodeUri);
      hostUri = Uri.fromAny(hostUri as AnyUri);
    }
    const childRef = new Model();
    if (hostUri !== void 0) {
      childRef.hostUri.setValue(hostUri);
    }
    if (nodeUri !== void 0) {
      childRef.nodeUri.setValue(nodeUri);
    }
    this.appendChild(childRef);
    return childRef;
  }

  /** @override */
  laneRef(hostUri: AnyUri, nodeUri: AnyUri, laneUri: AnyUri): WarpRef;
  /** @override */
  laneRef(nodeUri: AnyUri, laneUri: AnyUri): WarpRef;
  /** @override */
  laneRef(laneUri: AnyUri): WarpRef;
  laneRef(hostUri: AnyUri | undefined, nodeUri?: AnyUri, laneUri?: AnyUri): WarpRef {
    if (nodeUri === void 0) {
      laneUri = Uri.fromAny(hostUri as AnyUri);
      nodeUri = void 0;
      hostUri = void 0;
    } else if (laneUri === void 0) {
      laneUri = Uri.fromAny(nodeUri);
      nodeUri = Uri.fromAny(hostUri as AnyUri);
      hostUri = nodeUri.endpoint();
      if (hostUri.isDefined()) {
        nodeUri = hostUri.unresolve(nodeUri);
      } else {
        hostUri = void 0;
      }
    } else {
      laneUri = Uri.fromAny(laneUri);
      nodeUri = Uri.fromAny(nodeUri);
      hostUri = Uri.fromAny(hostUri as AnyUri);
    }
    const childRef = new Model();
    if (hostUri !== void 0) {
      childRef.hostUri.setValue(hostUri);
    }
    if (nodeUri !== void 0) {
      childRef.nodeUri.setValue(nodeUri);
    }
    if (laneUri !== void 0) {
      childRef.laneUri.setValue(laneUri);
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

  @Property<Model["warpRef"]>({
    valueType: WarpRef,
    inherits: true,
    updateFlags: Model.NeedsReconcile,
    initValue(): WarpRef {
      return WarpClient.global();
    },
    equalValues(newValue: WarpRef, oldValue: WarpRef): boolean {
      return newValue === oldValue;
    },
  })
  readonly warpRef!: Property<this, WarpRef>;

  /** @override */
  override init(init: ModelInit): void {
    // hook
  }

  static override create<S extends new () => InstanceType<S>>(this: S): InstanceType<S> {
    return new this();
  }

  static override fromInit<S extends Class<Instance<S, Model>>>(this: S, init: Inits<InstanceType<S>>): InstanceType<S> {
    let type: Creatable<Model>;
    if ((typeof init === "object" && init !== null || typeof init === "function") && Creatable.is((init as ModelInit).type)) {
      type = (init as ModelInit).type!;
    } else {
      type = this as unknown as Creatable<Model>;
    }
    const view = type.create();
    view.init(init as ModelInit);
    return view as InstanceType<S>;
  }

  static override fromAny<S extends Class<Instance<S, Model>>>(this: S, value: AnyModel<InstanceType<S>>): InstanceType<S> {
    if (value === void 0 || value === null) {
      return value as InstanceType<S>;
    } else if (value instanceof Model) {
      if (value instanceof this) {
        return value;
      } else {
        throw new TypeError(value + " not an instance of " + this);
      }
    } else if (Creatable.is(value)) {
      return (value as Creatable<InstanceType<S>>).create();
    } else {
      return (this as unknown as ModelFactory<InstanceType<S>>).fromInit(value);
    }
  }

  /** @internal */
  static override uid: () => string = (function () {
    let nextId = 1;
    return function uid(): string {
      const id = ~~nextId;
      nextId += 1;
      return "model" + id;
    }
  })();

  /** @internal */
  static override readonly MountedFlag: ModelFlags = Component.MountedFlag;
  /** @internal */
  static override readonly InsertingFlag: ModelFlags = Component.InsertingFlag;
  /** @internal */
  static override readonly RemovingFlag: ModelFlags = Component.RemovingFlag;
  /** @internal */
  static readonly AnalyzingFlag: ModelFlags = 1 << (Component.FlagShift + 0);
  /** @internal */
  static readonly RefreshingFlag: ModelFlags = 1 << (Component.FlagShift + 1);
  /** @internal */
  static readonly ConsumingFlag: ModelFlags = 1 << (Component.FlagShift + 2);
  /** @internal */
  static readonly UpdatingMask: ModelFlags = Model.AnalyzingFlag
                                           | Model.RefreshingFlag;
  /** @internal */
  static readonly StatusMask: ModelFlags = Model.MountedFlag
                                         | Model.InsertingFlag
                                         | Model.RemovingFlag
                                         | Model.AnalyzingFlag
                                         | Model.RefreshingFlag
                                         | Model.ConsumingFlag;

  static readonly NeedsAnalyze: ModelFlags = 1 << (Component.FlagShift + 3);
  static readonly NeedsMutate: ModelFlags = 1 << (Component.FlagShift + 4);
  static readonly NeedsAggregate: ModelFlags = 1 << (Component.FlagShift + 5);
  static readonly NeedsCorrelate: ModelFlags = 1 << (Component.FlagShift + 6);
  /** @internal */
  static readonly AnalyzeMask: ModelFlags = Model.NeedsAnalyze
                                          | Model.NeedsMutate
                                          | Model.NeedsAggregate
                                          | Model.NeedsCorrelate;

  static readonly NeedsRefresh: ModelFlags = 1 << (Component.FlagShift + 7);
  static readonly NeedsValidate: ModelFlags = 1 << (Component.FlagShift + 8);
  static readonly NeedsReconcile: ModelFlags = 1 << (Component.FlagShift + 9);
  /** @internal */
  static readonly RefreshMask: ModelFlags = Model.NeedsRefresh
                                          | Model.NeedsValidate
                                          | Model.NeedsReconcile;

  /** @internal */
  static readonly UpdateMask: ModelFlags = Model.AnalyzeMask
                                         | Model.RefreshMask;

  /** @internal */
  static override readonly FlagShift: number = Component.FlagShift + 10;
  /** @internal */
  static override readonly FlagMask: ModelFlags = (1 << Model.FlagShift) - 1;

  static override readonly MountFlags: ModelFlags = 0;
  static override readonly InsertChildFlags: ModelFlags = 0;
  static override readonly RemoveChildFlags: ModelFlags = 0;
  static override readonly ReinsertChildFlags: ModelFlags = 0;
  static readonly InsertTraitFlags: ModelFlags = 0;
  static readonly RemoveTraitFlags: ModelFlags = 0;
  static readonly StartConsumingFlags: ModelFlags = 0;
  static readonly StopConsumingFlags: ModelFlags = 0;
}
