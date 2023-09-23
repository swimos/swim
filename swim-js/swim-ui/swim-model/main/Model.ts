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
import type {Instance} from "@swim/util";
import type {Proto} from "@swim/util";
import type {Comparator} from "@swim/util";
import type {LikeType} from "@swim/util";
import type {FromLike} from "@swim/util";
import type {Dictionary} from "@swim/util";
import type {MutableDictionary} from "@swim/util";
import type {Creatable} from "@swim/util";
import type {Consumer} from "@swim/util";
import type {Consumable} from "@swim/util";
import {FastenerContext} from "@swim/component";
import type {FastenerTemplate} from "@swim/component";
import {Fastener} from "@swim/component";
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
import {ModelRelation} from "./"; // forward import
import {Trait} from "./"; // forward import
import {TraitRelation} from "./"; // forward import
import {RefresherService} from "./"; // forward import
import {SelectionService} from "./"; // forward import

/** @public */
export type ModelFlags = ComponentFlags;

/** @public */
export interface ModelFactory<M extends Model = Model> extends Creatable<M>, FromLike<M> {
}

/** @public */
export interface ModelClass<M extends Model = Model> extends Function, ModelFactory<M> {
  readonly prototype: M;
}

/** @public */
export interface ModelConstructor<M extends Model = Model> extends ModelClass<M> {
  new(): M;
}

/** @public */
export interface ModelObserver<M extends Model = Model> extends ComponentObserver<M> {
  modelWillAttachParent?(parent: Model, model: M): void;

  modelDidAttachParent?(parent: Model, model: M): void;

  modelWillDetachParent?(parent: Model, model: M): void;

  modelDidDetachParent?(parent: Model, model: M): void;

  modelWillInsertChild?(child: Model, target: Model | null, model: M): void;

  modelDidInsertChild?(child: Model, target: Model | null, model: M): void;

  modelWillRemoveChild?(child: Model, model: M): void;

  modelDidRemoveChild?(child: Model, model: M): void;

  modelWillReinsertChild?(child: Model, target: Model | null, model: M): void;

  modelDidReinsertChild?(child: Model, target: Model | null, model: M): void;

  modelWillInsertTrait?(trait: Trait, target: Trait | null, model: M): void;

  modelDidInsertTrait?(trait: Trait, target: Trait | null, model: M): void;

  modelWillRemoveTrait?(trait: Trait, model: M): void;

  modelDidRemoveTrait?(trait: Trait, model: M): void;

  modelWillMount?(model: M): void;

  modelDidMount?(model: M): void;

  modelWillUnmount?(model: M): void;

  modelDidUnmount?(model: M): void;

  modelWillMutate?(model: M): void;

  modelDidMutate?(model: M): void;

  modelWillAggregate?(model: M): void;

  modelDidAggregate?(model: M): void;

  modelWillCorrelate?(model: M): void;

  modelDidCorrelate?(model: M): void;

  modelWillValidate?(model: M): void;

  modelDidValidate?(model: M): void;

  modelWillReconcile?(model: M): void;

  modelDidReconcile?(model: M): void;

  modelWillStartConsuming?(model: M): void;

  modelDidStartConsuming?(model: M): void;

  modelWillStopConsuming?(model: M): void;

  modelDidStopConsuming?(model: M): void;
}

/** @public */
export class Model extends Component<Model> implements Consumable, WarpRef {
  constructor() {
    super();
    this.consumers = null;
    this.firstTrait = null;
    this.lastTrait = null;
    this.traitMap = null;
  }

  /** @override */
  declare readonly observerType?: Class<ModelObserver>;

  override get componentType(): Class<Model> {
    return Model;
  }

  protected override willAttachParent(parent: Model): void {
    this.callObservers("modelWillAttachParent", parent, this);
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
    this.callObservers("modelDidAttachParent", parent, this);
  }

  protected override willDetachParent(parent: Model): void {
    this.callObservers("modelWillDetachParent", parent, this);
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
    this.callObservers("modelDidDetachParent", parent, this);
  }

  protected override willInsertChild(child: Model, target: Model | null): void {
    super.willInsertChild(child, target);
    this.callObservers("modelWillInsertChild", child, target, this);
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
    this.callObservers("modelDidInsertChild", child, target, this);
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
    this.callObservers("modelWillRemoveChild", child, this);
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
    this.callObservers("modelDidRemoveChild", child, this);
    super.didRemoveChild(child);
  }

  protected override willReinsertChild(child: Model, target: Model | null): void {
    super.willReinsertChild(child, target);
    this.callObservers("modelWillReinsertChild", child, target, this);
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
    this.callObservers("modelDidReinsertChild", child, target, this);
    super.didReinsertChild(child, target);
  }

  /** @internal */
  override cascadeMount(): void {
    if ((this.flags & Model.MountedFlag) !== 0) {
      throw new Error("already mounted");
    }
    this.willMount();
    this.setFlags(this.flags | Model.MountedFlag);
    this.onMount();
    this.mountTraits();
    this.mountChildren();
    this.didMount();
  }

  protected override willMount(): void {
    super.willMount();
    this.callObservers("modelWillMount", this);
  }

  protected override didMount(): void {
    // subsume super
    this.requestUpdate(this, this.flags & Model.UpdateMask, false);
    this.requireUpdate(this.mountFlags);

    if (this.decoherent !== null && this.decoherent.length !== 0) {
      this.requireUpdate(Model.NeedsMutate);
    }

    this.mountFasteners();

    if (this.consumers !== null && this.consumers.size !== 0) {
      this.startConsuming();
    }

    this.callObservers("modelDidMount", this);
    super.didMount();
  }

  /** @internal */
  override cascadeUnmount(): void {
    if ((this.flags & Model.MountedFlag) === 0) {
      throw new Error("already unmounted");
    }
    this.willUnmount();
    this.setFlags(this.flags & ~Model.MountedFlag);
    this.unmountChildren();
    this.unmountTraits();
    this.onUnmount();
    this.didUnmount();
  }

  protected override willUnmount(): void {
    super.willUnmount();
    this.callObservers("modelWillUnmount", this);

    this.stopConsuming();
  }

  protected override didUnmount(): void {
    this.callObservers("modelDidUnmount", this);
    super.didUnmount();
  }

  getTraitFastener<F extends Fastener>(fastenerName: PropertyKey, fastenerType?: Proto<F>, contextType?: Proto<any> | null): F | null {
    let trait = this.firstTrait;
    while (trait !== null) {
      const fastener = trait.getFastener(fastenerName, fastenerType, contextType);
      if (fastener !== null) {
        return fastener;
      }
      trait = trait.nextTrait;
    }
    return null;
  }

  override requireUpdate(updateFlags: ModelFlags, immediate: boolean = false): void {
    const flags = this.flags;
    const deltaUpdateFlags = updateFlags & ~flags & Model.UpdateMask;
    if (deltaUpdateFlags === 0) {
      return;
    }
    this.setFlags(flags | deltaUpdateFlags);
    this.requestUpdate(this, deltaUpdateFlags, immediate);
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
      if ((analyzeFlags & Model.AnalyzeMask) === 0) {
        return;
      }
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
    this.callObservers("modelWillMutate", this);
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
    this.callObservers("modelDidMutate", this);
  }

  protected willAggregate(): void {
    this.callObservers("modelWillAggregate", this);
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
    this.callObservers("modelDidAggregate", this);
  }

  protected willCorrelate(): void {
    this.callObservers("modelWillCorrelate", this);
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
    this.callObservers("modelDidCorrelate", this);
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
      if ((refreshFlags & Model.RefreshMask) === 0) {
        return;
      }
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
    this.callObservers("modelWillValidate", this);
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
    this.callObservers("modelDidValidate", this);
  }

  protected willReconcile(): void {
    this.callObservers("modelWillReconcile", this);
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
    this.callObservers("modelDidReconcile", this);
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
    if (key === void 0) {
      return;
    }
    const traitMap = this.traitMap as MutableDictionary<Trait>;
    if (traitMap !== null) {
      delete traitMap[key];
    }
  }

  findTrait<F extends Class<Trait>>(key: string | undefined, traitClass: F | null | undefined): InstanceType<F> | null;
  findTrait(key: string | undefined, traitClass: Class<Trait> | null | undefined): Trait | null;
  findTrait(key: string | undefined, traitClass: Class<Trait> | null | undefined): Trait | null {
    if (key !== void 0) {
      const traitMap = this.traitMap;
      if (traitMap !== null) {
        const trait = traitMap[key];
        if (trait !== void 0 && (traitClass === void 0 || traitClass === null || trait instanceof traitClass)) {
          return trait;
        }
      }
    }
    if (traitClass !== void 0 && traitClass !== null) {
      let trait = this.firstTrait;
      while (trait !== null) {
        if (trait instanceof traitClass) {
          return trait;
        }
        trait = (trait as Trait).nextTrait;
      }
    }
    return null;
  }

  hasTrait(key: string, traitClass?: Class<Trait>): boolean;
  hasTrait(traitClass: Class<Trait>): boolean;
  hasTrait(key: string | Class<Trait>, traitClass?: Class<Trait>): boolean {
    if (typeof key === "string") {
      const traitMap = this.traitMap;
      if (traitMap !== null) {
        const trait = traitMap[key];
        if (trait !== void 0 && (traitClass === void 0 || trait instanceof traitClass)) {
          return true;
        }
      }
    } else {
      let trait = this.firstTrait;
      while (trait !== null) {
        if (trait instanceof key) {
          return true;
        }
        trait = (trait as Trait).nextTrait;
      }
    }
    return false;
  }

  getTrait<F extends Class<Trait>>(key: string, traitClass: F): InstanceType<F> | null;
  getTrait(key: string, traitClass?: Class<Trait>): Trait | null;
  getTrait<F extends Class<Trait>>(traitClass: F): InstanceType<F> | null;
  getTrait(key: string | Class<Trait>, traitClass?: Class<Trait>): Trait | null {
    if (typeof key === "string") {
      const traitMap = this.traitMap;
      if (traitMap !== null) {
        const trait = traitMap[key];
        if (trait !== void 0 && (traitClass === void 0 || trait instanceof traitClass)) {
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

  setTrait<F extends Class<Instance<F, Trait>> & Creatable<Instance<F, Trait>>>(key: string, newChildFactory: F): Trait | null;
  setTrait(key: string, newTrait: Trait | LikeType<Trait> | null): Trait | null;
  setTrait(key: string, newTrait: Trait | LikeType<Trait> | null): Trait | null {
    if (newTrait !== null) {
      newTrait = Trait.fromLike(newTrait);
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

  appendTrait<F extends Class<Instance<F, Trait>> & Creatable<Instance<F, Trait>>>(childFactory: F, key?: string): InstanceType<F>;
  appendTrait<T extends Trait>(trait: T | LikeType<T>, key?: string): T;
  appendTrait(trait: Trait | LikeType<Trait>, key?: string): Trait;
  appendTrait(trait: Trait | LikeType<Trait>, key?: string): Trait {
    trait = Trait.fromLike(trait);

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

  prependTrait<F extends Class<Instance<F, Trait>> & Creatable<Instance<F, Trait>>>(childFactory: F, key?: string): InstanceType<F>;
  prependTrait<T extends Trait>(trait: T | LikeType<T>, key?: string): T;
  prependTrait(trait: Trait | LikeType<Trait>, key?: string): Trait;
  prependTrait(trait: Trait | LikeType<Trait>, key?: string): Trait {
    trait = Trait.fromLike(trait);

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

  insertTrait<F extends Class<Instance<F, Trait>> & Creatable<Instance<F, Trait>>>(childFactory: F, target: Trait | null, key?: string): InstanceType<F>;
  insertTrait<T extends Trait>(trait: T | LikeType<T>, target: Trait | null, key?: string): T;
  insertTrait(trait: Trait | LikeType<Trait>, target: Trait | null, key?: string): Trait;
  insertTrait(trait: Trait | LikeType<Trait>, target: Trait | null, key?: string): Trait {
    if (target !== null && target.model !== this) {
      throw new Error("insert target is not a member trait");
    }
    trait = Trait.fromLike(trait);

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

  replaceTrait<F extends Class<Instance<F, Trait>> & Creatable<Instance<F, Trait>>>(newChildFactory: F, oldTrait: Trait): Trait;
  replaceTrait<T extends Trait>(newTrait: Trait | LikeType<Trait>, oldTrait: T): T;
  replaceTrait(newTrait: Trait | LikeType<Trait>, oldTrait: Trait): Trait;
  replaceTrait(newTrait: Trait | LikeType<Trait>, oldTrait: Trait): Trait {
    if (oldTrait.model !== this) {
      throw new Error("replacement target is not a member trait");
    }
    newTrait = Trait.fromLike(newTrait);

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
    this.callObservers("modelWillInsertTrait", trait, target, this);
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
    this.callObservers("modelDidInsertTrait", trait, target, this);
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
    this.callObservers("modelWillRemoveTrait", trait, this);
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
    this.callObservers("modelDidRemoveTrait", trait, this);
  }

  sortTraits(comparator: Comparator<Trait>): void {
    let trait = this.firstTrait;
    if (trait === null) {
      return;
    }

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

  getAncestorTrait<F extends Class<Trait>>(ancestorType: F): InstanceType<F> | null {
    let ancestor = this.parent;
    while (ancestor !== null) {
      const ancestorTrait = ancestor.getTrait(ancestorType);
      if (ancestorTrait !== null) {
        return ancestorTrait;
      }
      ancestor = ancestor.parent;
    }
    return null;
  }

  getRootTrait<F extends Class<Trait>>(rootType: F): InstanceType<F> | null {
    let rootTrait: InstanceType<F> | null = null;
    let ancestor = this.parent;
    while (ancestor !== null) {
      const ancestorTrait = ancestor.getTrait(rootType);
      if (ancestorTrait !== null) {
        rootTrait = ancestorTrait;
      }
      ancestor = ancestor.parent;
    }
    return rootTrait;
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
    const metaclass = FastenerContext.getMetaclass(this);
    if (metaclass === null) {
      return;
    }
    const fastenerSlots = metaclass.slots;
    for (let i = 0; i < fastenerSlots.length; i += 1) {
      const fastener = this[fastenerSlots[i]!];
      if (fastener instanceof Fastener) {
        this.bindTraitFastener(fastener, trait, target);
      }
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
    const metaclass = FastenerContext.getMetaclass(this);
    if (metaclass === null) {
      return;
    }
    const fastenerSlots = metaclass.slots;
    for (let i = 0; i < fastenerSlots.length; i += 1) {
      const fastener = this[fastenerSlots[i]!];
      if (fastener instanceof Fastener) {
        this.unbindTraitFastener(fastener, trait);
      }
    }
  }

  /** @internal */
  protected unbindTraitFastener(fastener: Fastener, trait: Trait): void {
    if (fastener instanceof TraitRelation) {
      fastener.unbindTrait(trait);
    }
  }

  /** @internal */
  protected override enqueueFastener(fastener: Fastener): void {
    super.enqueueFastener(fastener);
    if (fastener instanceof WarpDownlink) {
      this.requireUpdate(Model.NeedsReconcile);
    } else {
      this.requireUpdate(Model.NeedsMutate);
    }
  }

  /** @internal */
  override recohereFasteners(t?: number): void {
    const decoherent = this.decoherent;
    if (decoherent === null || decoherent.length === 0) {
      return;
    } else if (t === void 0) {
      t = performance.now();
    }
    (this as Mutable<this>).coherentTime = t;
    (this as Mutable<this>).decoherent = null;
    (this as Mutable<this>).recohering = decoherent;
    try {
      for (let i = 0; i < decoherent.length; i += 1) {
        const fastener = decoherent[i]!;
        if (!(fastener instanceof WarpDownlink)) {
          fastener.recohere(t);
        } else {
          this.enqueueFastener(fastener);
        }
      }
    } finally {
      (this as Mutable<this>).recohering = null;
    }
  }

  /** @internal */
  recohereDownlinks(t: number): void {
    const decoherent = this.decoherent;
    if (decoherent === null || decoherent.length === 0) {
      return;
    }
    let coherentDownlinkProps = false;
    (this as Mutable<this>).coherentTime = t;
    (this as Mutable<this>).decoherent = null;
    (this as Mutable<this>).recohering = decoherent;
    try {
      for (let i = 0; i < decoherent.length; i += 1) {
        const fastener = decoherent[i]!;
        if (fastener instanceof WarpDownlink) {
          if (!coherentDownlinkProps) {
            coherentDownlinkProps = true;
            this.hostUri.recohere(t);
            this.nodeUri.recohere(t);
            this.laneUri.recohere(t);
          }
          fastener.recohere(t);
        } else {
          this.enqueueFastener(fastener);
        }
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
    return (this.flags & Model.ConsumingFlag) !== 0;
  }

  get startConsumingFlags(): ModelFlags {
    return (this.constructor as typeof Model).StartConsumingFlags;
  }

  protected startConsuming(): void {
    if ((this.flags & Model.ConsumingFlag) !== 0) {
      return;
    }
    this.willStartConsuming();
    this.setFlags(this.flags | Model.ConsumingFlag);
    this.onStartConsuming();
    this.didStartConsuming();
  }

  protected willStartConsuming(): void {
    this.callObservers("modelWillStartConsuming", this);
  }

  protected onStartConsuming(): void {
    this.requireUpdate(this.startConsumingFlags);
    this.startConsumingFasteners();
  }

  protected didStartConsuming(): void {
    this.callObservers("modelDidStartConsuming", this);
  }

  get stopConsumingFlags(): ModelFlags {
    return (this.constructor as typeof Model).StopConsumingFlags;
  }

  protected stopConsuming(): void {
    if ((this.flags & Model.ConsumingFlag) === 0) {
      return;
    }
    this.willStopConsuming();
    this.setFlags(this.flags & ~Model.ConsumingFlag);
    this.onStopConsuming();
    this.didStopConsuming();
  }

  protected willStopConsuming(): void {
    this.callObservers("modelWillStopConsuming", this);
  }

  protected onStopConsuming(): void {
    this.requireUpdate(this.stopConsumingFlags);
    this.stopConsumingFasteners();
  }

  protected didStopConsuming(): void {
    this.callObservers("modelDidStopConsuming", this);
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
    get serviceType(): typeof RefresherService { // avoid static forward reference
      return RefresherService;
    },
    mountRootService(service: RefresherService): void {
      super.mountRootService(service);
      service.roots.addModel(this.owner);
    },
    unmountRootService(service: RefresherService): void {
      super.unmountRootService(service);
      service.roots.removeModel(this.owner);
    },
  })
  readonly updater!: Provider<this, RefresherService>;

  @Provider({
    get serviceType(): typeof SelectionService { // avoid static forward reference
      return SelectionService;
    },
  })
  get selection(): Provider<this, SelectionService> {
    return Provider.getter();
  }

  /** @override */
  @Property({
    valueType: Uri,
    value: null,
    inherits: true,
    get updateFlags(): ModelFlags {
      return Model.NeedsReconcile;
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
    get updateFlags(): ModelFlags {
      return Model.NeedsReconcile;
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
    get updateFlags(): ModelFlags {
      return Model.NeedsReconcile;
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
    const childRef = new Model();
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
    const childRef = new Model();
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
    const childRef = new Model();
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
    get updateFlags(): ModelFlags {
      return Model.NeedsReconcile;
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
      return "model" + id;
    };
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
  static readonly UpdatingMask: ModelFlags = this.AnalyzingFlag
                                           | this.RefreshingFlag;
  /** @internal */
  static readonly StatusMask: ModelFlags = this.MountedFlag
                                         | this.InsertingFlag
                                         | this.RemovingFlag
                                         | this.AnalyzingFlag
                                         | this.RefreshingFlag
                                         | this.ConsumingFlag;

  static readonly NeedsAnalyze: ModelFlags = 1 << (Component.FlagShift + 3);
  static readonly NeedsMutate: ModelFlags = 1 << (Component.FlagShift + 4);
  static readonly NeedsAggregate: ModelFlags = 1 << (Component.FlagShift + 5);
  static readonly NeedsCorrelate: ModelFlags = 1 << (Component.FlagShift + 6);
  /** @internal */
  static readonly AnalyzeMask: ModelFlags = this.NeedsAnalyze
                                          | this.NeedsMutate
                                          | this.NeedsAggregate
                                          | this.NeedsCorrelate;

  static readonly NeedsRefresh: ModelFlags = 1 << (Component.FlagShift + 7);
  static readonly NeedsValidate: ModelFlags = 1 << (Component.FlagShift + 8);
  static readonly NeedsReconcile: ModelFlags = 1 << (Component.FlagShift + 9);
  /** @internal */
  static readonly RefreshMask: ModelFlags = this.NeedsRefresh
                                          | this.NeedsValidate
                                          | this.NeedsReconcile;

  /** @internal */
  static readonly UpdateMask: ModelFlags = this.AnalyzeMask
                                         | this.RefreshMask;

  /** @internal */
  static override readonly FlagShift: number = Component.FlagShift + 10;
  /** @internal */
  static override readonly FlagMask: ModelFlags = (1 << this.FlagShift) - 1;

  static override readonly MountFlags: ModelFlags = 0;
  static override readonly InsertChildFlags: ModelFlags = 0;
  static override readonly RemoveChildFlags: ModelFlags = 0;
  static override readonly ReinsertChildFlags: ModelFlags = 0;
  static readonly InsertTraitFlags: ModelFlags = 0;
  static readonly RemoveTraitFlags: ModelFlags = 0;
  static readonly StartConsumingFlags: ModelFlags = 0;
  static readonly StopConsumingFlags: ModelFlags = 0;
}
