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

import {
  Mutable,
  Class,
  Arrays,
  Comparator,
  FromAny,
  Dictionary,
  MutableDictionary,
  Creatable,
  InitType,
  Initable,
  ConsumerType,
  Consumable,
  Consumer,
} from "@swim/util";
import {
  Fastener,
  Property,
  Provider,
  ComponentFlags,
  ComponentInit,
  Component,
} from "@swim/component";
import {WarpRef, WarpService, WarpProvider, DownlinkFastener} from "@swim/client";
import {RefreshService} from "../refresh/RefreshService";
import {RefreshProvider} from "../refresh/RefreshProvider";
import {SelectionService} from "../selection/SelectionService";
import {SelectionProvider} from "../selection/SelectionProvider";
import {ModelContext} from "./ModelContext";
import type {ModelObserver} from "./ModelObserver";
import {ModelRelation} from "./"; // forward import
import {AnyTrait, TraitCreator, Trait} from "../"; // forward import
import {TraitRelation} from "../"; // forward import

/** @public */
export type ModelContextType<M extends Model> =
  M extends {readonly contextType?: Class<infer T>} ? T : never;

/** @public */
export type ModelFlags = ComponentFlags;

/** @public */
export type AnyModel<M extends Model = Model> = M | ModelFactory<M> | InitType<M>;

/** @public */
export interface ModelInit extends ComponentInit {
  type?: Creatable<Model>;
  key?: string;
  traits?: AnyTrait[];
  children?: AnyModel[];
}

/** @public */
export interface ModelFactory<M extends Model = Model, U = AnyModel<M>> extends Creatable<M>, FromAny<M, U> {
  fromInit(init: InitType<M>): M;
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
export type ModelCreator<F extends (abstract new (...args: any) => M) & Creatable<InstanceType<F>>, M extends Model = Model> =
  (abstract new (...args: any) => InstanceType<F>) & Creatable<InstanceType<F>>;

/** @public */
export class Model extends Component<Model> implements Initable<ModelInit>, Consumable {
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

  /** @override */
  readonly consumerType?: Class<Consumer>;

  readonly contextType?: Class<ModelContext>;

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
  override setChild<F extends ModelCreator<F>>(key: string, factory: F): Model | null;
  override setChild(key: string, newChild: AnyModel | null): Model | null;
  override setChild(key: string, newChild: AnyModel | null): Model | null {
    if (newChild !== null) {
      newChild = Model.fromAny(newChild);
    }
    return super.setChild(key, newChild) as Model | null;
  }

  override appendChild<M extends Model>(child: M, key?: string): M;
  override appendChild<F extends ModelCreator<F>>(factory: F, key?: string): InstanceType<F>;
  override appendChild(child: AnyModel, key?: string): Model;
  override appendChild(child: AnyModel, key?: string): Model {
    child = Model.fromAny(child);
    return super.appendChild(child, key);
  }

  override prependChild<M extends Model>(child: M, key?: string): M;
  override prependChild<F extends ModelCreator<F>>(factory: F, key?: string): InstanceType<F>;
  override prependChild(child: AnyModel, key?: string): Model;
  override prependChild(child: AnyModel, key?: string): Model {
    child = Model.fromAny(child);
    return super.prependChild(child, key);
  }

  override insertChild<M extends Model>(child: M, target: Model | null, key?: string): M;
  override insertChild<F extends ModelCreator<F>>(factory: F, target: Model | null, key?: string): InstanceType<F>;
  override insertChild(child: AnyModel, target: Model | null, key?: string): Model;
  override insertChild(child: AnyModel, target: Model | null, key?: string): Model {
    child = Model.fromAny(child);
    return super.insertChild(child, target, key);
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
  override cascadeInsert(updateFlags?: ModelFlags, modelContext?: ModelContext): void {
    if ((this.flags & Model.MountedFlag) !== 0) {
      if (updateFlags === void 0) {
        updateFlags = 0;
      }
      updateFlags |= this.flags & Model.UpdateMask;
      if ((updateFlags & Model.AnalyzeMask) !== 0) {
        if (modelContext === void 0) {
          modelContext = this.superModelContext;
        }
        this.cascadeAnalyze(updateFlags, modelContext);
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
        const refreshProvider = this.refreshProvider.service;
        if (refreshProvider !== void 0 && refreshProvider !== null) {
          refreshProvider.requestUpdate(target, updateFlags, immediate);
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

  protected needsAnalyze(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): ModelFlags {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      analyzeFlags = trait.needsAnalyze(analyzeFlags, modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
    return analyzeFlags;
  }

  cascadeAnalyze(analyzeFlags: ModelFlags, baesModelContext: ModelContext): void {
    const modelContext = this.extendModelContext(baesModelContext);
    const outerModelContext = ModelContext.current;
    try {
      ModelContext.current = modelContext;
      analyzeFlags &= ~Model.NeedsAnalyze;
      analyzeFlags |= this.flags & Model.UpdateMask;
      analyzeFlags = this.needsAnalyze(analyzeFlags, modelContext);
      if ((analyzeFlags & Model.AnalyzeMask) !== 0) {
        let cascadeFlags = analyzeFlags;
        this.setFlags(this.flags & ~Model.NeedsAnalyze | (Model.AnalyzingFlag | Model.ContextualFlag));
        this.willAnalyze(cascadeFlags, modelContext);
        if (((this.flags | analyzeFlags) & Model.NeedsMutate) !== 0) {
          cascadeFlags |= Model.NeedsMutate;
          this.setFlags(this.flags & ~Model.NeedsMutate);
          this.willMutate(modelContext);
        }
        if (((this.flags | analyzeFlags) & Model.NeedsAggregate) !== 0) {
          cascadeFlags |= Model.NeedsAggregate;
          this.setFlags(this.flags & ~Model.NeedsAggregate);
          this.willAggregate(modelContext);
        }
        if (((this.flags | analyzeFlags) & Model.NeedsCorrelate) !== 0) {
          cascadeFlags |= Model.NeedsCorrelate;
          this.setFlags(this.flags & ~Model.NeedsCorrelate);
          this.willCorrelate(modelContext);
        }

        this.onAnalyze(cascadeFlags, modelContext);
        if ((cascadeFlags & Model.NeedsMutate) !== 0) {
          this.onMutate(modelContext);
        }
        if ((cascadeFlags & Model.NeedsAggregate) !== 0) {
          this.onAggregate(modelContext);
        }
        if ((cascadeFlags & Model.NeedsCorrelate) !== 0) {
          this.onCorrelate(modelContext);
        }

        if ((cascadeFlags & Model.AnalyzeMask) !== 0) {
          this.setFlags(this.flags & ~Model.ContextualFlag);
          this.analyzeChildren(cascadeFlags, modelContext, this.analyzeChild);
          this.setFlags(this.flags | Model.ContextualFlag);
        }

        if ((cascadeFlags & Model.NeedsCorrelate) !== 0) {
          this.didCorrelate(modelContext);
        }
        if ((cascadeFlags & Model.NeedsAggregate) !== 0) {
          this.didAggregate(modelContext);
        }
        if ((cascadeFlags & Model.NeedsMutate) !== 0) {
          this.didMutate(modelContext);
        }
        this.didAnalyze(cascadeFlags, modelContext);
      }
    } finally {
      this.setFlags(this.flags & ~(Model.AnalyzingFlag | Model.ContextualFlag));
      ModelContext.current = outerModelContext;
    }
  }

  protected willAnalyze(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.willAnalyze(analyzeFlags, modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected onAnalyze(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.onAnalyze(analyzeFlags, modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected didAnalyze(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.didAnalyze(analyzeFlags, modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected willMutate(modelContext: ModelContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillMutate !== void 0) {
        observer.modelWillMutate(modelContext, this);
      }
    }
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.willMutate(modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected onMutate(modelContext: ModelContextType<this>): void {
    this.recohereFasteners(modelContext.updateTime);
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.onMutate(modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected didMutate(modelContext: ModelContextType<this>): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.didMutate(modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidMutate !== void 0) {
        observer.modelDidMutate(modelContext, this);
      }
    }
  }

  protected willAggregate(modelContext: ModelContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillAggregate !== void 0) {
        observer.modelWillAggregate(modelContext, this);
      }
    }
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.willAggregate(modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected onAggregate(modelContext: ModelContextType<this>): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.onAggregate(modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected didAggregate(modelContext: ModelContextType<this>): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.didAggregate(modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidAggregate !== void 0) {
        observer.modelDidAggregate(modelContext, this);
      }
    }
  }

  protected willCorrelate(modelContext: ModelContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillCorrelate !== void 0) {
        observer.modelWillCorrelate(modelContext, this);
      }
    }
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.willCorrelate(modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected onCorrelate(modelContext: ModelContextType<this>): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.onCorrelate(modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected didCorrelate(modelContext: ModelContextType<this>): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.didCorrelate(modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidCorrelate !== void 0) {
        observer.modelDidCorrelate(modelContext, this);
      }
    }
  }

  protected analyzeChildren(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>,
                            analyzeChild: (this: this, child: Model, analyzeFlags: ModelFlags,
                                           modelContext: ModelContextType<this>) => void): void {
    const trait = this.firstTrait;
    if (trait !== null) {
      this.analyzeTraitChildren(trait, analyzeFlags, modelContext, analyzeChild);
    } else {
      this.analyzeOwnChildren(analyzeFlags, modelContext, analyzeChild);
    }
  }

  protected analyzeTraitChildren(trait: Trait, analyzeFlags: ModelFlags, modelContext: ModelContextType<this>,
                                 analyzeChild: (this: this, child: Model, analyzeFlags: ModelFlags,
                                                modelContext: ModelContextType<this>) => void): void {
    const next = trait.nextTrait;
    if (next !== null) {
      trait.analyzeChildren(analyzeFlags, modelContext, analyzeChild as any, this.analyzeTraitChildren.bind(this, next) as any);
    } else {
      trait.analyzeChildren(analyzeFlags, modelContext, analyzeChild as any, this.analyzeOwnChildren as any);
    }
  }

  protected analyzeOwnChildren(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>,
                               analyzeChild: (this: this, child: Model, analyzeFlags: ModelFlags,
                                              modelContext: ModelContextType<this>) => void): void {
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      analyzeChild.call(this, child, analyzeFlags, modelContext);
      if (next !== null && next.parent !== this) {
        throw new Error("inconsistent analyze pass");
      }
      child = next;
    }
  }

  protected analyzeChild(child: Model, analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    child.cascadeAnalyze(analyzeFlags, modelContext);
  }

  get refreshing(): boolean {
    return (this.flags & Model.RefreshingFlag) !== 0;
  }

  protected needsRefresh(refreshFlags: ModelFlags, modelContext: ModelContextType<this>): ModelFlags {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      refreshFlags = trait.needsRefresh(refreshFlags, modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
    return refreshFlags;
  }

  cascadeRefresh(refreshFlags: ModelFlags, baseModelContext: ModelContext): void {
    const modelContext = this.extendModelContext(baseModelContext);
    const outerModelContext = ModelContext.current;
    try {
      ModelContext.current = modelContext;
      refreshFlags &= ~Model.NeedsRefresh;
      refreshFlags |= this.flags & Model.UpdateMask;
      refreshFlags = this.needsRefresh(refreshFlags, modelContext);
      if ((refreshFlags & Model.RefreshMask) !== 0) {
        let cascadeFlags = refreshFlags;
        this.setFlags(this.flags & ~Model.NeedsRefresh | (Model.RefreshingFlag | Model.ContextualFlag));
        this.willRefresh(cascadeFlags, modelContext);
        if (((this.flags | refreshFlags) & Model.NeedsValidate) !== 0) {
          cascadeFlags |= Model.NeedsValidate;
          this.setFlags(this.flags & ~Model.NeedsValidate);
          this.willValidate(modelContext);
        }
        if (((this.flags | refreshFlags) & Model.NeedsReconcile) !== 0) {
          cascadeFlags |= Model.NeedsReconcile;
          this.setFlags(this.flags & ~Model.NeedsReconcile);
          this.willReconcile(modelContext);
        }

        this.onRefresh(cascadeFlags, modelContext);
        if ((cascadeFlags & Model.NeedsValidate) !== 0) {
          this.onValidate(modelContext);
        }
        if ((cascadeFlags & Model.NeedsReconcile) !== 0) {
          this.onReconcile(modelContext);
        }

        if ((cascadeFlags & Model.RefreshMask)) {
          this.setFlags(this.flags & ~Model.ContextualFlag);
          this.refreshChildren(cascadeFlags, modelContext, this.refreshChild);
          this.setFlags(this.flags | Model.ContextualFlag);
        }

        if ((cascadeFlags & Model.NeedsReconcile) !== 0) {
          this.didReconcile(modelContext);
        }
        if ((cascadeFlags & Model.NeedsValidate) !== 0) {
          this.didValidate(modelContext);
        }
        this.didRefresh(cascadeFlags, modelContext);
      }
    } finally {
      this.setFlags(this.flags & ~(Model.RefreshingFlag | Model.ContextualFlag));
      ModelContext.current = outerModelContext;
    }
  }

  protected willRefresh(refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.willRefresh(refreshFlags, modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected onRefresh(refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.onRefresh(refreshFlags, modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected didRefresh(refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.didRefresh(refreshFlags, modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected willValidate(modelContext: ModelContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillValidate !== void 0) {
        observer.modelWillValidate(modelContext, this);
      }
    }
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.willValidate(modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected onValidate(modelContext: ModelContextType<this>): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.onValidate(modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected didValidate(modelContext: ModelContextType<this>): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.didValidate(modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidValidate !== void 0) {
        observer.modelDidValidate(modelContext, this);
      }
    }
  }

  protected willReconcile(modelContext: ModelContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillReconcile !== void 0) {
        observer.modelWillReconcile(modelContext, this);
      }
    }
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.willReconcile(modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected onReconcile(modelContext: ModelContextType<this>): void {
    this.recohereDownlinks(modelContext.updateTime);
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.onReconcile(modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
  }

  protected didReconcile(modelContext: ModelContextType<this>): void {
    let trait = this.firstTrait;
    while (trait !== null) {
      const next = trait.nextTrait;
      trait.didReconcile(modelContext);
      trait = next !== null && next.model === this ? next : null;
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidReconcile !== void 0) {
        observer.modelDidReconcile(modelContext, this);
      }
    }
  }

  protected refreshChildren(refreshFlags: ModelFlags, modelContext: ModelContextType<this>,
                            refreshChild: (this: this, child: Model, refreshFlags: ModelFlags,
                                           modelContext: ModelContextType<this>) => void): void {
    const trait = this.firstTrait;
    if (trait !== null) {
      this.refreshTraitChildren(trait, refreshFlags, modelContext, refreshChild);
    } else {
      this.refreshOwnChildren(refreshFlags, modelContext, refreshChild);
    }
  }

  protected refreshTraitChildren(trait: Trait, refreshFlags: ModelFlags, modelContext: ModelContextType<this>,
                                 refreshChild: (this: this, child: Model, refreshFlags: ModelFlags,
                                                modelContext: ModelContextType<this>) => void): void {
    const next = trait.nextTrait;
    if (next !== null) {
      trait.refreshChildren(refreshFlags, modelContext, refreshChild as any, this.refreshTraitChildren.bind(this, next) as any);
    } else {
      trait.refreshChildren(refreshFlags, modelContext, refreshChild as any, this.refreshOwnChildren as any);
    }
  }

  protected refreshOwnChildren(refreshFlags: ModelFlags, modelContext: ModelContextType<this>,
                               refreshChild: (this: this, child: Model, refreshFlags: ModelFlags,
                                              modelContext: ModelContextType<this>) => void): void {
    let child = this.firstChild;
    while (child !== null) {
      const next = child.nextSibling;
      refreshChild.call(this, child, refreshFlags, modelContext);
      if (next !== null && next.parent !== this) {
        throw new Error("inconsistent refresh pass");
      }
      child = next;
    }
  }

  protected refreshChild(child: Model, refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    child.cascadeRefresh(refreshFlags, modelContext);
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

  getTrait<F extends abstract new (...args: any) => Trait>(key: string, traitBound: F): InstanceType<F> | null;
  getTrait(key: string, traitBound?: abstract new (...args: any) => Trait): Trait | null;
  getTrait<F extends abstract new (...args: any) => Trait>(traitBound: F): InstanceType<F> | null;
  getTrait(key: string | (abstract new (...args: any) => Trait), traitBound?: abstract new (...args: any) => Trait): Trait | null {
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
  setTrait<F extends TraitCreator<F>>(key: string, factory: F): Trait | null;
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

      newTrait.setKey(oldTrait.key);
      this.willInsertTrait(newTrait, target);
      this.insertTraitMap(newTrait);
      newTrait.attachModel(this, target);
      this.onInsertTrait(newTrait, target);
      this.didInsertTrait(newTrait, target);
    } else if (newTrait !== oldTrait || newTrait !== null && newTrait.key !== key) {
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

        newTrait.setKey(key);
        this.willInsertTrait(newTrait, target);
        this.insertTraitMap(newTrait);
        newTrait.attachModel(this, target);
        this.onInsertTrait(newTrait, target);
        this.didInsertTrait(newTrait, target);
      }
    }

    return oldTrait;
  }

  appendTrait<T extends Trait>(trait: T, key?: string): T;
  appendTrait<F extends TraitCreator<F>>(factory: F, key?: string): InstanceType<F>;
  appendTrait(trait: AnyTrait, key?: string): Trait;
  appendTrait(trait: AnyTrait, key?: string): Trait {
    trait = Trait.fromAny(trait);

    trait.remove();
    if (key !== void 0) {
      this.removeChild(key);
    }

    trait.setKey(key);
    this.willInsertTrait(trait, null);
    this.insertTraitMap(trait);
    trait.attachModel(this, null);
    this.onInsertTrait(trait, null);
    this.didInsertTrait(trait, null);

    return trait;
  }

  prependTrait<T extends Trait>(trait: T, key?: string): T;
  prependTrait<F extends TraitCreator<F>>(factory: F, key?: string): InstanceType<F>;
  prependTrait(trait: AnyTrait, key?: string): Trait;
  prependTrait(trait: AnyTrait, key?: string): Trait {
    trait = Trait.fromAny(trait);

    trait.remove();
    if (key !== void 0) {
      this.removeChild(key);
    }
    const target = this.firstTrait;

    trait.setKey(key);
    this.willInsertTrait(trait, target);
    this.insertTraitMap(trait);
    trait.attachModel(this, target);
    this.onInsertTrait(trait, target);
    this.didInsertTrait(trait, target);

    return trait;
  }

  insertTrait<T extends Trait>(trait: T, target: Trait | null, key?: string): T;
  insertTrait<F extends TraitCreator<F>>(factory: F, target: Trait | null, key?: string): InstanceType<F>;
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

    trait.setKey(key);
    this.willInsertTrait(trait, target);
    this.insertTraitMap(trait);
    trait.attachModel(this, target);
    this.onInsertTrait(trait, target);
    this.didInsertTrait(trait, target);

    return trait;
  }

  replaceTrait<T extends Trait>(newTrait: Trait, oldTrait: T): T;
  replaceTrait<T extends Trait>(newTrait: AnyTrait, oldTrait: T): T;
  replaceTrait(newTrait: AnyTrait, oldTrait: Trait): Trait {
    if (oldTrait.model !== this) {
      throw new Error("replacement target is not a member trait");
    }
    newTrait = Trait.fromAny(newTrait);

    if (newTrait !== oldTrait) {
      newTrait.remove();
      const target = oldTrait.nextTrait;

      this.willRemoveTrait(oldTrait);
      oldTrait.detachModel(this);
      this.removeTraitMap(oldTrait);
      this.onRemoveTrait(oldTrait);
      this.didRemoveTrait(oldTrait);
      oldTrait.setKey(void 0);

      newTrait.setKey(oldTrait.key);
      this.willInsertTrait(newTrait, target);
      this.insertTraitMap(newTrait);
      newTrait.attachModel(this, target);
      this.onInsertTrait(newTrait, target);
      this.didInsertTrait(newTrait, target);
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

  getSuperTrait<F extends abstract new (...args: any) => Trait>(superBound: F): InstanceType<F> | null {
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

  getBaseTrait<F extends abstract new (...args: any) => Trait>(baseBound: F): InstanceType<F> | null {
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
    if (fastener instanceof DownlinkFastener && fastener.consumed === true && this.consuming) {
      fastener.consume(this);
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
    if (fastener instanceof DownlinkFastener) {
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
          if (!(fastener instanceof DownlinkFastener)) {
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
          if (fastener instanceof DownlinkFastener) {
            fastener.recohere(t);
          } else {
            this.decohereFastener(fastener);
          }
        }
      }
    }
  }

  /** @internal */
  readonly consumers: ReadonlyArray<ConsumerType<this>>;

  /** @override */
  consume(consumer: ConsumerType<this>): void {
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

  protected willConsume(consumer: ConsumerType<this>): void {
    // hook
  }

  protected onConsume(consumer: ConsumerType<this>): void {
    // hook
  }

  protected didConsume(consumer: ConsumerType<this>): void {
    // hook
  }

  /** @override */
  unconsume(consumer: ConsumerType<this>): void {
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

  protected willUnconsume(consumer: ConsumerType<this>): void {
    // hook
  }

  protected onUnconsume(consumer: ConsumerType<this>): void {
    // hook
  }

  protected didUnconsume(consumer: ConsumerType<this>): void {
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
      if (fastener instanceof DownlinkFastener && fastener.consumed === true) {
        fastener.consume(this);
      }
    }
  }

  /** @internal */
  protected stopConsumingFasteners(): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      if (fastener instanceof DownlinkFastener && fastener.consumed === true) {
        fastener.unconsume(this);
      }
    }
  }

  @Provider({
    extends: RefreshProvider,
    type: RefreshService,
    observes: false,
    service: RefreshService.global(),
  })
  readonly refreshProvider!: RefreshProvider<this>;

  @Provider({
    extends: SelectionProvider,
    type: SelectionService,
    observes: false,
    service: SelectionService.global(),
  })
  readonly selectionProvider!: SelectionProvider<this>;

  @Provider({
    extends: WarpProvider,
    type: WarpService,
    observes: false,
    service: WarpService.global(),
  })
  readonly warpProvider!: WarpProvider<this>;

  @Property({type: Object, inherits: true, value: null, updateFlags: Model.NeedsReconcile})
  readonly warpRef!: Property<this, WarpRef | null>;

  /** @internal */
  get superModelContext(): ModelContext {
    const parent = this.parent;
    if (parent !== null) {
      return parent.modelContext;
    } else {
      return this.refreshProvider.updatedModelContext();
    }
  }

  /** @internal */
  extendModelContext(modelContext: ModelContext): ModelContextType<this> {
    return modelContext as ModelContextType<this>;
  }

  get modelContext(): ModelContextType<this> {
    if ((this.flags & Model.ContextualFlag) !== 0) {
      return ModelContext.current as ModelContextType<this>;
    } else {
      return this.extendModelContext(this.superModelContext);
    }
  }

  /** @override */
  override init(init: ModelInit): void {
    // hook
  }

  static override create<S extends new () => InstanceType<S>>(this: S): InstanceType<S> {
    return new this();
  }

  static override fromInit<S extends abstract new (...args: any) => InstanceType<S>>(this: S, init: InitType<InstanceType<S>>): InstanceType<S> {
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

  static override fromAny<S extends abstract new (...args: any) => InstanceType<S>>(this: S, value: AnyModel<InstanceType<S>>): InstanceType<S> {
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
  static override uid: () => number = (function () {
    let nextId = 1;
    return function uid(): number {
      const id = ~~nextId;
      nextId += 1;
      return id;
    }
  })();

  /** @internal */
  static override readonly MountedFlag: ModelFlags = Component.MountedFlag;
  /** @internal */
  static override readonly RemovingFlag: ModelFlags = Component.RemovingFlag;
  /** @internal */
  static readonly AnalyzingFlag: ModelFlags = 1 << (Component.FlagShift + 0);
  /** @internal */
  static readonly RefreshingFlag: ModelFlags = 1 << (Component.FlagShift + 1);
  /** @internal */
  static readonly ContextualFlag: ModelFlags = 1 << (Component.FlagShift + 2);
  /** @internal */
  static readonly ConsumingFlag: ModelFlags = 1 << (Component.FlagShift + 3);
  /** @internal */
  static readonly UpdatingMask: ModelFlags = Model.AnalyzingFlag
                                           | Model.RefreshingFlag;
  /** @internal */
  static readonly StatusMask: ModelFlags = Model.MountedFlag
                                         | Model.RemovingFlag
                                         | Model.AnalyzingFlag
                                         | Model.RefreshingFlag
                                         | Model.ContextualFlag
                                         | Model.ConsumingFlag;

  static readonly NeedsAnalyze: ModelFlags = 1 << (Component.FlagShift + 4);
  static readonly NeedsMutate: ModelFlags = 1 << (Component.FlagShift + 5);
  static readonly NeedsAggregate: ModelFlags = 1 << (Component.FlagShift + 6);
  static readonly NeedsCorrelate: ModelFlags = 1 << (Component.FlagShift + 7);
  /** @internal */
  static readonly AnalyzeMask: ModelFlags = Model.NeedsAnalyze
                                          | Model.NeedsMutate
                                          | Model.NeedsAggregate
                                          | Model.NeedsCorrelate;

  static readonly NeedsRefresh: ModelFlags = 1 << (Component.FlagShift + 8);
  static readonly NeedsValidate: ModelFlags = 1 << (Component.FlagShift + 9);
  static readonly NeedsReconcile: ModelFlags = 1 << (Component.FlagShift + 10);
  /** @internal */
  static readonly RefreshMask: ModelFlags = Model.NeedsRefresh
                                          | Model.NeedsValidate
                                          | Model.NeedsReconcile;

  /** @internal */
  static readonly UpdateMask: ModelFlags = Model.AnalyzeMask
                                         | Model.RefreshMask;

  /** @internal */
  static override readonly FlagShift: number = Component.FlagShift + 11;
  /** @internal */
  static override readonly FlagMask: ModelFlags = (1 << Model.FlagShift) - 1;

  static override readonly MountFlags: ModelFlags = 0;
  static override readonly InsertChildFlags: ModelFlags = 0;
  static override readonly RemoveChildFlags: ModelFlags = 0;
  static readonly InsertTraitFlags: ModelFlags = 0;
  static readonly RemoveTraitFlags: ModelFlags = 0;
  static readonly StartConsumingFlags: ModelFlags = 0;
  static readonly StopConsumingFlags: ModelFlags = 0;
}
