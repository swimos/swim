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

import {__esDecorate} from "tslib";
import {__runInitializers} from "tslib";
import type {Mutable} from "@swim/util";
import type {Class} from "@swim/util";
import type {Instance} from "@swim/util";
import type {Proto} from "@swim/util";
import {Murmur3} from "@swim/util";
import type {HashCode} from "@swim/util";
import type {Comparator} from "@swim/util";
import type {LikeType} from "@swim/util";
import type {FromLike} from "@swim/util";
import {Creatable} from "@swim/util";
import type {TimingLike} from "@swim/util";
import type {Observes} from "@swim/util";
import type {Observable} from "@swim/util";
import type {ObserverMethods} from "@swim/util";
import type {ObserverParameters} from "@swim/util";
import type {Observer} from "@swim/util";
import type {Consumer} from "@swim/util";
import type {Consumable} from "@swim/util";
import {FastenerContext} from "@swim/component";
import type {FastenerDecorator} from "@swim/component";
import type {FastenerTemplate} from "@swim/component";
import {Fastener} from "@swim/component";
import {Property} from "@swim/component";
import {Animator} from "@swim/component";
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
import type {ModelFlags} from "./Model";
import {Model} from "./Model";
import {ModelRelation} from "./ModelRelation";
import {TraitRelation} from "./"; // forward import

/** @public */
export type TraitFlags = number;

/** @public */
export interface TraitFactory<T extends Trait = Trait> extends Creatable<T>, FromLike<T> {
}

/** @public */
export interface TraitClass<T extends Trait = Trait> extends Function, TraitFactory<T> {
  readonly prototype: T;
}

/** @public */
export interface TraitConstructor<T extends Trait = Trait> extends TraitClass<T> {
  new(): T;
}

/** @public */
export interface TraitObserver<T extends Trait = Trait> extends Observer<T> {
  traitWillAttachModel?(model: Model, trait: T): void;

  traitDidAttachModel?(model: Model, trait: T): void;

  traitWillDetachModel?(model: Model, trait: T): void;

  traitDidDetachModel?(model: Model, trait: T): void;

  traitWillAttachParent?(parent: Model, trait: T): void;

  traitDidAttachParent?(parent: Model, trait: T): void;

  traitWillDetachParent?(parent: Model, trait: T): void;

  traitDidDetachParent?(parent: Model, trait: T): void;

  traitWillInsertChild?(child: Model, target: Model | null, trait: T): void;

  traitDidInsertChild?(child: Model, target: Model | null, trait: T): void;

  traitWillRemoveChild?(child: Model, trait: T): void;

  traitDidRemoveChild?(child: Model, trait: T): void;

  traitWillReinsertChild?(child: Model, target: Model | null, trait: T): void;

  traitDidReinsertChild?(child: Model, target: Model | null, trait: T): void;

  traitWillInsertTrait?(member: Trait, target: Trait | null, trait: T): void;

  traitDidInsertTrait?(member: Trait, target: Trait | null, trait: T): void;

  traitWillRemoveTrait?(member: Trait, trait: T): void;

  traitDidRemoveTrait?(member: Trait, trait: T): void;

  traitWillMount?(trait: T): void;

  traitDidMount?(trait: T): void;

  traitWillUnmount?(trait: T): void;

  traitDidUnmount?(trait: T): void;

  traitWillMutate?(trait: T): void;

  traitDidMutate?(trait: T): void;

  traitWillAggregate?(trait: T): void;

  traitDidAggregate?(trait: T): void;

  traitWillCorrelate?(trait: T): void;

  traitDidCorrelate?(trait: T): void;

  traitWillValidate?(trait: T): void;

  traitDidValidate?(trait: T): void;

  traitWillReconcile?(trait: T): void;

  traitDidReconcile?(trait: T): void;

  traitWillStartConsuming?(trait: T): void;

  traitDidStartConsuming?(trait: T): void;

  traitWillStopConsuming?(trait: T): void;

  traitDidStopConsuming?(trait: T): void;
}

/** @public */
export abstract class Trait implements HashCode, Observable, Consumable, FastenerContext, WarpRef {
  constructor() {
    this.uid = (this.constructor as typeof Trait).uid();
    this.key = void 0;
    this.flags = 0;
    this.model = null;
    this.nextTrait = null;
    this.previousTrait = null;
    this.coherentTime = 0;
    this.decoherent = null;
    this.recohering = null;
    this.observers = null;
    this.consumers = null;
  }

  declare readonly observerType?: Class<TraitObserver>;

  likeType?(like: {create?(): Trait}): void;

  /** @internal */
  readonly uid: string;

  readonly key: string | undefined;

  /** @internal */
  setKey(key: string | undefined): void {
    (this as Mutable<this>).key = key;
  }

  /** @internal */
  readonly flags: TraitFlags;

  setFlags(flags: TraitFlags): void {
    (this as Mutable<this>).flags = flags;
  }

  readonly model: Model | null;

  getModel(): Model {
    const model = this.model;
    if (model === null) {
      throw new TypeError("no model");
    }
    return model;
  }

  /** @internal */
  attachModel(model: Model, nextTrait: Trait | null): void {
    // assert(this.model === null);
    this.willAttachModel(model);
    (this as Mutable<this>).model = model;
    let previousTrait: Trait | null;
    if (nextTrait !== null) {
      previousTrait = nextTrait.previousTrait;
      this.setNextTrait(nextTrait);
      nextTrait.setPreviousTrait(this);
    } else {
      previousTrait = model.lastTrait;
      model.setLastTrait(this);
    }
    if (previousTrait !== null) {
      previousTrait.setNextTrait(this);
      this.setPreviousTrait(previousTrait);
    } else {
      model.setFirstTrait(this);
    }
    if (model.mounted) {
      this.mountTrait();
    }
    this.onAttachModel(model);
    this.didAttachModel(model);
  }

  protected willAttachModel(model: Model): void {
    this.callObservers("traitWillAttachModel", model, this);
  }

  protected onAttachModel(model: Model): void {
    this.bindModelFasteners(model);
  }

  protected didAttachModel(model: Model): void {
    this.callObservers("traitDidAttachModel", model, this);
  }

  /** @internal */
  detachModel(model: Model): void {
    // assert(this.model === model);
    this.willDetachModel(model);
    if (this.mounted) {
      this.unmountTrait();
    }
    this.onDetachModel(model);
    const nextTrait = this.nextTrait;
    const previousTrait = this.previousTrait;
    if (nextTrait !== null) {
      this.setNextTrait(null);
      nextTrait.setPreviousTrait(previousTrait);
    } else {
      model.setLastTrait(previousTrait);
    }
    if (previousTrait !== null) {
      previousTrait.setNextTrait(nextTrait);
      this.setPreviousTrait(null);
    } else {
      model.setFirstTrait(nextTrait);
    }
    (this as Mutable<this>).model = null;
    this.didDetachModel(model);
  }

  protected willDetachModel(model: Model): void {
    this.callObservers("traitWillDetachModel", model, this);
  }

  protected onDetachModel(model: Model): void {
    this.unbindModelFasteners(model);
  }

  protected didDetachModel(model: Model): void {
    this.callObservers("traitDidDetachModel", model, this);
  }

  get modelFlags(): ModelFlags {
    const model = this.model;
    return model !== null ? model.flags : 0;
  }

  setModelFlags(modelFlags: ModelFlags): void {
    const model = this.model;
    if (model === null) {
      throw new Error("no model");
    }
    model.setFlags(modelFlags);
  }

  remove(): void {
    const model = this.model;
    if (model !== null) {
      model.removeTrait(this);
    }
  }

  get parent(): Model | null {
    const model = this.model;
    return model !== null ? model.parent : null;
  }

  /** @protected */
  willAttachParent(parent: Model): void {
    this.callObservers("traitWillAttachParent", parent, this);
  }

  /** @protected */
  onAttachParent(parent: Model): void {
    // hook
  }

  /** @protected */
  didAttachParent(parent: Model): void {
    this.callObservers("traitDidAttachParent", parent, this);
  }

  /** @protected */
  willDetachParent(parent: Model): void {
    this.callObservers("traitWillDetachParent", parent, this);
  }

  /** @protected */
  onDetachParent(parent: Model): void {
    // hook
  }

  /** @protected */
  didDetachParent(parent: Model): void {
    this.callObservers("traitDidDetachParent", parent, this);
  }

  get nextSibling(): Model | null {
    const model = this.model;
    return model !== null ? model.nextSibling : null;
  }

  get previousSibling(): Model | null {
    const model = this.model;
    return model !== null ? model.previousSibling : null;
  }

  get firstChild(): Model | null {
    const model = this.model;
    return model !== null ? model.firstChild : null;
  }

  get lastChild(): Model | null {
    const model = this.model;
    return model !== null ? model.lastChild : null;
  }

  forEachChild<T>(callback: (child: Model) => T | void): T | undefined;
  forEachChild<T, S>(callback: (this: S, child: Model) => T | void, thisArg: S): T | undefined;
  forEachChild<T, S>(callback: (this: S | undefined, child: Model) => T | void, thisArg?: S): T | undefined {
    const model = this.model;
    return model !== null ? model.forEachChild(callback, thisArg) : void 0;
  }

  getChild<F extends Class<Model>>(key: string, childType: F): InstanceType<F> | null;
  getChild(key: string, childType?: Class<Model>): Model | null;
  getChild(key: string, childType?: Class<Model>): Model | null {
    const model = this.model;
    return model !== null ? model.getChild(key, childType) : null;
  }

  setChild<F extends Class<Instance<F, Model>> & Creatable<Instance<F, Model>>>(key: string, newChildFactory: F): Model | null;
  setChild(key: string, newChild: Model | LikeType<Model> | null): Model | null;
  setChild(key: string, newChild: Model | LikeType<Model> | null): Model | null {
    const model = this.model;
    if (model === null) {
      throw new Error("no model");
    }
    return model.setChild(key, newChild);
  }

  appendChild<F extends Class<Instance<F, Model>> & Creatable<Instance<F, Model>>>(childFactory: F, key?: string): InstanceType<F>;
  appendChild<M extends Model>(child: M | LikeType<M>, key?: string): M;
  appendChild(child: Model | LikeType<Model>, key?: string): Model;
  appendChild(child: Model | LikeType<Model>, key?: string): Model {
    const model = this.model;
    if (model === null) {
      throw new Error("no model");
    }
    return model.appendChild(child, key);
  }

  prependChild<F extends Class<Instance<F, Model>> & Creatable<Instance<F, Model>>>(childFactory: F, key?: string): InstanceType<F>;
  prependChild<M extends Model>(child: M | LikeType<M>, key?: string): M;
  prependChild(child: Model | LikeType<Model>, key?: string): Model;
  prependChild(child: Model | LikeType<Model>, key?: string): Model {
    const model = this.model;
    if (model === null) {
      throw new Error("no model");
    }
    return model.prependChild(child, key);
  }

  insertChild<F extends Class<Instance<F, Model>> & Creatable<Instance<F, Model>>>(childFactory: F, target: Model | null, key?: string): InstanceType<F>;
  insertChild<M extends Model>(child: M | LikeType<M>, target: Model | null, key?: string): M;
  insertChild(child: Model | LikeType<Model>, target: Model | null, key?: string): Model;
  insertChild(child: Model | LikeType<Model>, target: Model | null, key?: string): Model {
    const model = this.model;
    if (model === null) {
      throw new Error("no model");
    }
    return model.insertChild(child, target, key);
  }

  reinsertChild(child: Model, target: Model | null): void {
    const model = this.model;
    if (model === null) {
      throw new Error("no model");
    }
    model.reinsertChild(child, target);
  }

  replaceChild<M extends Model>(newChild: Model, oldChild: M): M;
  replaceChild<M extends Model>(newChild: Model | LikeType<Model>, oldChild: M): M;
  replaceChild(newChild: Model | LikeType<Model>, oldChild: Model): Model;
  replaceChild(newChild: Model | LikeType<Model>, oldChild: Model): Model {
    const model = this.model;
    if (model === null) {
      throw new Error("no model");
    }
    return model.replaceChild(newChild, oldChild);
  }

  get insertChildFlags(): ModelFlags {
    return (this.constructor as typeof Trait).InsertChildFlags;
  }

  /** @protected */
  willInsertChild(child: Model, target: Model | null): void {
    this.callObservers("traitWillInsertChild", child, target, this);
  }

  /** @protected */
  onInsertChild(child: Model, target: Model | null): void {
    this.requireUpdate(this.insertChildFlags);
    this.bindChildFasteners(child, target);
  }

  /** @protected */
  didInsertChild(child: Model, target: Model | null): void {
    this.callObservers("traitDidInsertChild", child, target, this);
  }

  removeChild<M extends Model>(child: M): M | null;
  removeChild(key: string | Model): Model | null;
  removeChild(key: string | Model): Model | null {
    const model = this.model;
    return model !== null ? model.removeChild(key) : null;
  }

  get removeChildFlags(): ModelFlags {
    return (this.constructor as typeof Trait).RemoveChildFlags;
  }

  /** @protected */
  willRemoveChild(child: Model): void {
    this.callObservers("traitWillRemoveChild", child, this);
    this.requireUpdate(this.removeChildFlags);
  }

  /** @protected */
  onRemoveChild(child: Model): void {
    this.unbindChildFasteners(child);
  }

  /** @protected */
  didRemoveChild(child: Model): void {
    this.callObservers("traitDidRemoveChild", child, this);
  }

  get reinsertChildFlags(): ModelFlags {
    return (this.constructor as typeof Trait).ReinsertChildFlags;
  }

  /** @protected */
  willReinsertChild(child: Model, target: Model | null): void {
    this.callObservers("traitWillReinsertChild", child, target, this);
  }

  /** @protected */
  onReinsertChild(child: Model, target: Model | null): void {
    this.requireUpdate(this.reinsertChildFlags);
  }

  /** @protected */
  didReinsertChild(child: Model, target: Model | null): void {
    this.callObservers("traitDidReinsertChild", child, target, this);
  }

  removeChildren(): void {
    const model = this.model;
    if (model !== null) {
      return model.removeChildren();
    }
  }

  sortChildren(comparator: Comparator<Model>): void {
    const model = this.model;
    if (model !== null) {
      return model.sortChildren(comparator);
    }
  }

  getTargetChild(child: Model, comparator: Comparator<Model>): Model | null {
    const model = this.model;
    return model !== null ? model.getTargetChild(child, comparator) : null;
  }

  getAncestor<F extends Class<Model>>(ancestorType: F): InstanceType<F> | null {
    const model = this.model;
    return model !== null ? model.getAncestor(ancestorType) : null;
  }

  getRoot<F extends Class<Model>>(rootType: F): InstanceType<F> | null {
    const model = this.model;
    return model !== null ? model.getRoot(rootType) : null;
  }

  readonly nextTrait: Trait | null;

  /** @internal */
  setNextTrait(nextTrait: Trait | null): void {
    (this as Mutable<this>).nextTrait = nextTrait;
  }

  readonly previousTrait: Trait | null;

  /** @internal */
  setPreviousTrait(previousTrait: Trait | null): void {
    (this as Mutable<this>).previousTrait = previousTrait;
  }

  get firstTrait(): Trait | null {
    const model = this.model;
    return model !== null ? model.firstTrait : null;
  }

  get lastTrait(): Trait | null {
    const model = this.model;
    return model !== null ? model.lastTrait : null;
  }

  forEachTrait<T>(callback: (trait: Trait) => T | void): T | undefined;
  forEachTrait<T, S>(callback: (this: S, trait: Trait) => T | void, thisArg: S): T | undefined;
  forEachTrait<T, S>(callback: (this: S | undefined, trait: Trait) => T | void, thisArg?: S): T | undefined {
    const model = this.model;
    return model !== null ? model.forEachTrait(callback, thisArg) : void 0;
  }

  findTrait<F extends Class<Trait>>(key: string | undefined, traitClass: F | null | undefined): InstanceType<F> | null;
  findTrait(key: string | undefined, traitClass: Class<Trait> | null | undefined): Trait | null;
  findTrait(key: string | undefined, traitClass: Class<Trait> | null | undefined): Trait | null {
    const model = this.model;
    return model !== null ? model.findTrait(key, traitClass) : null;
  }

  getTrait<F extends Class<Trait>>(key: string, traitClass: F): InstanceType<F> | null;
  getTrait(key: string, traitClass?: Class<Trait>): Trait | null;
  getTrait<F extends Class<Trait>>(traitClass: F): InstanceType<F> | null;
  getTrait(key: string | Class<Trait>, traitClass?: Class<Trait>): Trait | null {
    const model = this.model;
    return model !== null ? model.getTrait(key as string, traitClass) : null;
  }

  setTrait<F extends Class<Instance<F, Trait>> & Creatable<Instance<F, Trait>>>(key: string, newChildFactory: F): Trait | null;
  setTrait(key: string, newTrait: Trait | LikeType<Trait> | null): Trait | null;
  setTrait(key: string, newTrait: Trait | LikeType<Trait> | null): Trait | null {
    const model = this.model;
    if (model === null) {
      throw new Error("no model");
    }
    return model.setTrait(key, newTrait);
  }

  appendTrait<F extends Class<Instance<F, Trait>> & Creatable<Instance<F, Trait>>>(childFactory: F, key?: string): InstanceType<F>;
  appendTrait<T extends Trait>(trait: T | LikeType<T>, key?: string): T;
  appendTrait(trait: Trait | LikeType<Trait>, key?: string): Trait;
  appendTrait(trait: Trait | LikeType<Trait>, key?: string): Trait {
    const model = this.model;
    if (model === null) {
      throw new Error("no model");
    }
    return model.appendTrait(trait, key);
  }

  prependTrait<F extends Class<Instance<F, Trait>> & Creatable<Instance<F, Trait>>>(childFactory: F, key?: string): InstanceType<F>;
  prependTrait<T extends Trait>(trait: T | LikeType<T>, key?: string): T;
  prependTrait(trait: Trait | LikeType<Trait>, key?: string): Trait;
  prependTrait(trait: Trait | LikeType<Trait>, key?: string): Trait {
    const model = this.model;
    if (model === null) {
      throw new Error("no model");
    }
    return model.prependTrait(trait, key);
  }

  insertTrait<F extends Class<Instance<F, Trait>> & Creatable<Instance<F, Trait>>>(childFactory: F, target: Trait | null, key?: string): InstanceType<F>;
  insertTrait<T extends Trait>(trait: T | LikeType<T>, target: Trait | null, key?: string): T;
  insertTrait(trait: Trait | LikeType<Trait>, target: Trait | null, key?: string): Trait;
  insertTrait(trait: Trait | LikeType<Trait>, target: Trait | null, key?: string): Trait {
    const model = this.model;
    if (model === null) {
      throw new Error("no model");
    }
    return model.insertTrait(trait, target, key);
  }

  replaceTrait<F extends Class<Instance<F, Trait>> & Creatable<Instance<F, Trait>>>(newChildFactory: F, oldTrait: Trait): Trait;
  replaceTrait<T extends Trait>(newTrait: Trait | LikeType<Trait>, oldTrait: T): T;
  replaceTrait(newTrait: Trait | LikeType<Trait>, oldTrait: Trait): Trait;
  replaceTrait(newTrait: Trait | LikeType<Trait>, oldTrait: Trait): Trait {
    const model = this.model;
    if (model === null) {
      throw new Error("no model");
    }
    return model.replaceTrait(newTrait, oldTrait);
  }

  get insertTraitFlags(): ModelFlags {
    return (this.constructor as typeof Trait).InsertTraitFlags;
  }

  get inserting(): boolean {
    return (this.flags & Trait.InsertingFlag) !== 0;
  }

  /** @protected */
  willInsertTrait(trait: Trait, target: Trait | null): void {
    this.callObservers("traitWillInsertTrait", trait, target, this);
  }

  /** @protected */
  onInsertTrait(trait: Trait, target: Trait | null): void {
    this.requireUpdate(this.insertTraitFlags);
    this.bindTraitFasteners(trait, target);
  }

  /** @protected */
  didInsertTrait(trait: Trait, target: Trait | null): void {
    this.callObservers("traitDidInsertTrait", trait, target, this);
  }

  removeTrait<T extends Trait>(trait: T): T | null;
  removeTrait(key: string | Trait): Trait | null;
  removeTrait(key: string | Trait): Trait | null {
    const model = this.model;
    return model !== null ? model.removeTrait(key) : null;
  }

  get removeTraitFlags(): ModelFlags {
    return (this.constructor as typeof Trait).RemoveTraitFlags;
  }

  get removing(): boolean {
    return (this.flags & Trait.RemovingFlag) !== 0;
  }

  /** @protected */
  willRemoveTrait(trait: Trait): void {
    this.callObservers("traitWillRemoveTrait", trait, this);
  }

  /** @protected */
  onRemoveTrait(trait: Trait): void {
    this.requireUpdate(this.removeTraitFlags);
    this.unbindTraitFasteners(trait);
  }

  /** @protected */
  didRemoveTrait(trait: Trait): void {
    this.callObservers("traitDidRemoveTrait", trait, this);
  }

  sortTraits(comparator: Comparator<Trait>): void {
    const model = this.model;
    if (model !== null) {
      model.sortTraits(comparator);
    }
  }

  getAncestorTrait<F extends Class<Trait>>(ancestorType: F): InstanceType<F> | null {
    const model = this.model;
    return model !== null ? model.getAncestorTrait(ancestorType) : null;
  }

  getRootTrait<F extends Class<Trait>>(rootType: F): InstanceType<F> | null {
    const model = this.model;
    return model !== null ? model.getRootTrait(rootType) : null;
  }

  /** @override */
  @Property({
    valueType: Uri,
    value: null,
    inherits: true,
    get parentType(): typeof Trait {
      return Trait;
    },
    updateFlags: Model.NeedsReconcile,
  })
  get hostUri(): Property<this, Uri | null> {
    return Property.getter();
  }

  /** @override */
  @Property({
    valueType: Uri,
    value: null,
    inherits: true,
    get parentType(): typeof Trait {
      return Trait;
    },
    updateFlags: Model.NeedsReconcile,
  })
  get nodeUri(): Property<this, Uri | null> {
    return Property.getter();
  }

  /** @override */
  @Property({
    valueType: Uri,
    value: null,
    inherits: true,
    get parentType(): typeof Trait {
      return Trait;
    },
    updateFlags: Model.NeedsReconcile,
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
    updateFlags: Model.NeedsReconcile,
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

  get mounted(): boolean {
    return (this.flags & Trait.MountedFlag) !== 0;
  }

  get mountFlags(): ModelFlags {
    return (this.constructor as typeof Trait).MountFlags;
  }

  /** @internal */
  mountTrait(): void {
    if ((this.flags & Trait.MountedFlag) !== 0) {
      throw new Error("already mounted");
    }
    this.setFlags(this.flags | Trait.MountedFlag);
    this.willMount();
    this.onMount();
    this.didMount();
  }

  protected willMount(): void {
    this.callObservers("traitWillMount", this);
  }

  protected onMount(): void {
    // hook
  }

  protected didMount(): void {
    this.requireUpdate(this.mountFlags);

    if (this.decoherent !== null && this.decoherent.length !== 0) {
      this.requireUpdate(Model.NeedsMutate);
    }

    this.mountFasteners();

    if (this.consumers !== null && this.consumers.size !== 0) {
      this.startConsuming();
    }

    this.callObservers("traitDidMount", this);
  }

  /** @internal */
  unmountTrait(): void {
    if ((this.flags & Trait.MountedFlag) === 0) {
      throw new Error("already unmounted");
    }
    this.setFlags(this.flags & ~Trait.MountedFlag);
    this.willUnmount();
    this.onUnmount();
    this.didUnmount();
  }

  protected willUnmount(): void {
    this.callObservers("traitWillUnmount", this);

    this.stopConsuming();
    this.unmountFasteners();
  }

  protected onUnmount(): void {
    // hook
  }

  protected didUnmount(): void {
    this.callObservers("traitDidUnmount", this);
  }

  requireUpdate(updateFlags: ModelFlags, immediate: boolean = false): void {
    const model = this.model;
    if (model !== null) {
      model.requireUpdate(updateFlags, immediate);
    }
  }

  /** @protected */
  needsUpdate(updateFlags: ModelFlags, immediate: boolean): ModelFlags {
    return updateFlags;
  }

  requestUpdate(target: Model, updateFlags: ModelFlags, immediate: boolean): void {
    const model = this.model;
    if (model === null) {
      throw new TypeError("no model");
    }
    model.requestUpdate(target, updateFlags, immediate);
  }

  get updating(): boolean {
    const model = this.model;
    return model !== null && model.updating;
  }

  get analyzing(): boolean {
    const model = this.model;
    return model !== null && model.analyzing;
  }

  /** @protected */
  needsAnalyze(analyzeFlags: ModelFlags): ModelFlags {
    return analyzeFlags;
  }

  /** @protected */
  willAnalyze(analyzeFlags: ModelFlags): void {
    // hook
  }

  /** @protected */
  onAnalyze(analyzeFlags: ModelFlags): void {
    // hook
  }

  /** @protected */
  didAnalyze(analyzeFlags: ModelFlags): void {
    // hook
  }

  /** @protected */
  willMutate(): void {
    this.callObservers("traitWillMutate", this);
  }

  /** @protected */
  onMutate(): void {
    this.recohereFasteners(this.updateTime);
  }

  /** @protected */
  didMutate(): void {
    this.callObservers("traitDidMutate", this);
  }

  /** @protected */
  willAggregate(): void {
    this.callObservers("traitWillAggregate", this);
  }

  /** @protected */
  onAggregate(): void {
    // hook
  }

  /** @protected */
  didAggregate(): void {
    this.callObservers("traitDidAggregate", this);
  }

  /** @protected */
  willCorrelate(): void {
    this.callObservers("traitWillCorrelate", this);
  }

  /** @protected */
  onCorrelate(): void {
    // hook
  }

  /** @protected */
  didCorrelate(): void {
    this.callObservers("traitDidCorrelate", this);
  }

  /** @protected */
  analyzeChildren(analyzeFlags: ModelFlags, analyzeChild: (this: Model, child: Model, analyzeFlags: ModelFlags) => void,
                  analyzeChildren: (this: Model, analyzeFlags: ModelFlags, analyzeChild: (this: Model, child: Model, analyzeFlags: ModelFlags) => void) => void): void {
    analyzeChildren.call(this.model!, analyzeFlags, analyzeChild);
  }

  get refreshing(): boolean {
    const model = this.model;
    return model !== null && model.refreshing;
  }

  /** @protected */
  needsRefresh(refreshFlags: ModelFlags): ModelFlags {
    return refreshFlags;
  }

  /** @protected */
  willRefresh(refreshFlags: ModelFlags): void {
    // hook
  }

  /** @protected */
  onRefresh(refreshFlags: ModelFlags): void {
    // hook
  }

  /** @protected */
  didRefresh(refreshFlags: ModelFlags): void {
    // hook
  }

  /** @protected */
  willValidate(): void {
    this.callObservers("traitWillValidate", this);
  }

  /** @protected */
  onValidate(): void {
    // hook
  }

  /** @protected */
  didValidate(): void {
    this.callObservers("traitDidValidate", this);
  }

  /** @protected */
  willReconcile(): void {
    this.callObservers("traitWillReconcile", this);
  }

  /** @protected */
  onReconcile(): void {
    this.recohereDownlinks(this.updateTime);
  }

  /** @protected */
  didReconcile(): void {
    this.callObservers("traitDidReconcile", this);
  }

  /** @protected */
  refreshChildren(refreshFlags: ModelFlags, refreshChild: (this: Model, child: Model, refreshFlags: ModelFlags) => void,
                  refreshChildren: (this: Model, refreshFlags: ModelFlags, refreshChild: (this: Model, child: Model, refreshFlags: ModelFlags) => void) => void): void {
    refreshChildren.call(this.model!, refreshFlags, refreshChild);
  }

  tryFastener<K extends keyof this, F extends this[K] = this[K]>(fastenerName: K): (F extends Fastener<any, any, any> ? F | null : never) | null {
    const metaclass = FastenerContext.getMetaclass(this);
    return metaclass !== null ? metaclass.tryFastener(this, fastenerName) : null;
  }

  getFastener<F extends Fastener>(fastenerName: PropertyKey, fastenerType?: Proto<F>, contextType?: Proto<any> | null): F | null {
    if (contextType !== void 0 && contextType !== null && !(this instanceof contextType)) {
      return null;
    }
    const fastener = (this as any)[fastenerName] as F | null | undefined;
    if (fastener === void 0 || (fastenerType !== void 0 && fastenerType !== null && !(fastener instanceof fastenerType))) {
      return null;
    }
    return fastener;
  }

  /** @override */
  getParentFastener<F extends Fastener>(fastenerName: string, fastenerType?: Proto<F>, contextType?: Proto<any> | null): F | null {
    let parent = this.model;
    if (parent === null) {
      return null;
    }

    let fastener: F | null;
    if (contextType !== void 0 && contextType !== null && (contextType === Trait || contextType.prototype instanceof Trait)) {
      // Traverse traits attached to ancestor models,
      // starting with the parent of the model to which this trait is attached.
      parent = parent.parent;
      while (parent !== null) {
        fastener = parent.getTraitFastener(fastenerName, fastenerType, contextType);
        if (fastener !== null) {
          return fastener;
        }
        parent = parent.parent;
      }
      return null;
    }

    // Traverse ancestor models, starting with the model to which this trait is attached.
    do {
      fastener = parent.getFastener(fastenerName, fastenerType, contextType);
      if (fastener !== null) {
        return fastener;
      }
      parent = parent.parent;
    } while (parent !== null);
    return null;
  }

  /** @override */
  attachFastener(fastener: Fastener): void {
    if (this.mounted) {
      fastener.mount();
    }
    this.bindFastener(fastener);
  }

  /** @internal */
  protected mountFasteners(): void {
    const metaclass = FastenerContext.getMetaclass(this);
    if (metaclass === null) {
      return;
    }
    const fastenerSlots = metaclass.slots;
    for (let i = 0; i < fastenerSlots.length; i += 1) {
      const fastener = this[fastenerSlots[i]!];
      if (fastener instanceof Fastener) {
        fastener.mount();
      }
    }
  }

  /** @internal */
  protected unmountFasteners(): void {
    const metaclass = FastenerContext.getMetaclass(this);
    if (metaclass === null) {
      return;
    }
    const fastenerSlots = metaclass.slots;
    for (let i = 0; i < fastenerSlots.length; i += 1) {
      const fastener = this[fastenerSlots[i]!];
      if (fastener instanceof Fastener) {
        fastener.unmount();
      }
    }
  }

  protected bindFastener(fastener: Fastener): void {
    if ((fastener instanceof ModelRelation || fastener instanceof TraitRelation) && fastener.binds) {
      this.forEachChild(function (child: Model): void {
        fastener.bindModel(child, null);
      }, this);
    }
    if (fastener instanceof TraitRelation && fastener.binds) {
      this.forEachTrait(function (trait: Trait): void {
        fastener.bindTrait(trait, null);
      }, this);
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
  protected bindModelFasteners(model: Model): void {
    const metaclass = FastenerContext.getMetaclass(this);
    if (metaclass === null) {
      return;
    }
    const fastenerSlots = metaclass.slots;
    model.forEachChild(function (child: Model): void {
      for (let i = 0; i < fastenerSlots.length; i += 1) {
        const fastener = this[fastenerSlots[i]!];
        if (fastener instanceof Fastener) {
          this.bindChildFastener(fastener, child, null);
        }
      }
    }, this);
    model.forEachTrait(function (trait: Trait): void {
      for (let i = 0; i < fastenerSlots.length; i += 1) {
        const fastener = this[fastenerSlots[i]!];
        if (fastener instanceof Fastener) {
          this.bindTraitFastener(fastener, trait, null);
        }
      }
    }, this);
  }

  /** @internal */
  protected unbindModelFasteners(model: Model): void {
    const metaclass = FastenerContext.getMetaclass(this);
    if (metaclass === null) {
      return;
    }
    const fastenerSlots = metaclass.slots;
    model.forEachTrait(function (trait: Trait): void {
      for (let i = 0; i < fastenerSlots.length; i += 1) {
        const fastener = this[fastenerSlots[i]!];
        if (fastener instanceof Fastener) {
          this.unbindTraitFastener(fastener, trait);
        }
      }
    }, this);
    model.forEachChild(function (child: Model): void {
      for (let i = 0; i < fastenerSlots.length; i += 1) {
        const fastener = this[fastenerSlots[i]!];
        if (fastener instanceof Fastener) {
          this.unbindChildFastener(fastener, child);
        }
      }
    }, this);
  }

  /** @internal */
  protected bindChildFasteners(child: Model, target: Model | null): void {
    const metaclass = FastenerContext.getMetaclass(this);
    if (metaclass === null) {
      return;
    }
    const fastenerSlots = metaclass.slots;
    for (let i = 0; i < fastenerSlots.length; i += 1) {
      const fastener = this[fastenerSlots[i]!];
      if (fastener instanceof Fastener) {
        this.bindChildFastener(fastener, child, target);
      }
    }
  }

  /** @internal */
  protected bindChildFastener(fastener: Fastener, child: Model, target: Model | null): void {
    if (fastener instanceof ModelRelation || fastener instanceof TraitRelation) {
      fastener.bindModel(child, target);
    }
  }

  /** @internal */
  protected unbindChildFasteners(child: Model): void {
    const metaclass = FastenerContext.getMetaclass(this);
    if (metaclass === null) {
      return;
    }
    const fastenerSlots = metaclass.slots;
    for (let i = 0; i < fastenerSlots.length; i += 1) {
      const fastener = this[fastenerSlots[i]!];
      if (fastener instanceof Fastener) {
        this.unbindChildFastener(fastener, child);
      }
    }
  }

  /** @internal */
  protected unbindChildFastener(fastener: Fastener, child: Model): void {
    if (fastener instanceof ModelRelation || fastener instanceof TraitRelation) {
      fastener.unbindModel(child);
    }
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

  set<S>(this: S, properties: {[K in keyof S as S[K] extends {set(value: any): any} ? K : never]?: S[K] extends {set(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): this;
  set(properties: {[K in keyof this as this[K] extends {set(value: any): any} ? K : never]?: this[K] extends {set(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): this {
    for (const key in properties) {
      const value = properties[key];
      const property = (this as any)[key] as {set?(value: any): any} | undefined;
      if (property === void 0 || property === null) {
        throw new Error("unknown property " + key);
      } else if (property.set === void 0) {
        throw new Error("unsettable property " + key);
      } else if (property instanceof Animator) {
        property.set(value, timing);
      } else {
        property.set(value);
      }
    }
    return this;
  }

  setIntrinsic<S>(this: S, properties: {[K in keyof S as S[K] extends {setIntrinsic(value: any): any} ? K : never]?: S[K] extends {setIntrinsic(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): this;
  setIntrinsic(properties: {[K in keyof this as this[K] extends {setIntrinsic(value: any): any} ? K : never]?: this[K] extends {setIntrinsic(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): this {
    for (const key in properties) {
      const value = properties[key];
      const property = (this as any)[key] as {setIntrinsic?(value: any): any} | undefined;
      if (property === void 0 || property === null) {
        throw new Error("unknown property " + key);
      } else if (property.setIntrinsic === void 0) {
        throw new Error("unsettable property " + key);
      } else if (property instanceof Animator) {
        property.setIntrinsic(value, timing);
      } else {
        property.setIntrinsic(value);
      }
    }
    return this;
  }

  /** @internal */
  readonly coherentTime: number;

  /** @internal */
  readonly decoherent: readonly Fastener[] | null;

  /** @internal */
  readonly recohering: readonly Fastener[] | null;

  /** @override */
  decohereFastener(fastener: Fastener): void {
    const recohering = this.recohering as Fastener[] | null;
    if (recohering !== null && fastener.coherentTime !== this.coherentTime) {
      recohering.push(fastener);
      return;
    }
    this.enqueueFastener(fastener);
  }

  protected enqueueFastener(fastener: Fastener): void {
    let decoherent = this.decoherent as Fastener[] | null;
    if (decoherent === null) {
      decoherent = [];
      (this as Mutable<this>).decoherent = decoherent;
    }
    decoherent.push(fastener);
    if (fastener instanceof WarpDownlink) {
      this.requireUpdate(Model.NeedsReconcile);
    } else {
      this.requireUpdate(Model.NeedsMutate);
    }
  }

  /** @internal */
  recohereFasteners(t?: number): void {
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
  readonly observers: ReadonlySet<Observes<this>> | null;

  /** @override */
  observe(observer: Observes<this>): void {
    let observers = this.observers as Set<Observes<this>> | null;
    if (observers === null) {
      observers = new Set<Observes<this>>();
      (this as Mutable<this>).observers = observers;
    } else if (observers.has(observer)) {
      return;
    }
    this.willObserve(observer);
    observers.add(observer);
    this.onObserve(observer);
    this.didObserve(observer);
  }

  protected willObserve(observer: Observes<this>): void {
    // hook
  }

  protected onObserve(observer: Observes<this>): void {
    // hook
  }

  protected didObserve(observer: Observes<this>): void {
    // hook
  }

  /** @override */
  unobserve(observer: Observes<this>): void {
    const observers = this.observers as Set<Observes<this>> | null;
    if (observers === null || !observers.has(observer)) {
      return;
    }
    this.willUnobserve(observer);
    observers.delete(observer);
    this.onUnobserve(observer);
    this.didUnobserve(observer);
  }

  protected willUnobserve(observer: Observes<this>): void {
    // hook
  }

  protected onUnobserve(observer: Observes<this>): void {
    // hook
  }

  protected didUnobserve(observer: Observes<this>): void {
    // hook
  }

  callObservers<O, K extends keyof ObserverMethods<O>>(this: {readonly observerType?: Class<O>}, key: K, ...args: ObserverParameters<O, K>): void {
    const observers = (this as Trait).observers as ReadonlySet<ObserverMethods<O>> | null;
    if (observers === null) {
      return;
    }
    for (const observer of observers) {
      const method = observer[key];
      if (typeof method === "function") {
        method.call(observer, ...args);
      }
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
    return (this.flags & Trait.ConsumingFlag) !== 0;
  }

  get startConsumingFlags(): ModelFlags {
    return (this.constructor as typeof Trait).StartConsumingFlags;
  }

  protected startConsuming(): void {
    if ((this.flags & Trait.ConsumingFlag) !== 0) {
      return;
    }
    this.willStartConsuming();
    this.setFlags(this.flags | Trait.ConsumingFlag);
    this.onStartConsuming();
    this.didStartConsuming();
  }

  protected willStartConsuming(): void {
    this.callObservers("traitWillStartConsuming", this);
  }

  protected onStartConsuming(): void {
    this.requireUpdate(this.startConsumingFlags);
    this.startConsumingFasteners();
  }

  protected didStartConsuming(): void {
    this.callObservers("traitDidStartConsuming", this);
  }

  get stopConsumingFlags(): ModelFlags {
    return (this.constructor as typeof Trait).StopConsumingFlags;
  }

  protected stopConsuming(): void {
    if ((this.flags & Trait.ConsumingFlag) === 0) {
      return;
    }
    this.willStopConsuming();
    this.setFlags(this.flags & ~Trait.ConsumingFlag);
    this.onStopConsuming();
    this.didStopConsuming();
  }

  protected willStopConsuming(): void {
    this.callObservers("traitWillStopConsuming", this);
  }

  protected onStopConsuming(): void {
    this.requireUpdate(this.stopConsumingFlags);
    this.stopConsumingFasteners();
  }

  protected didStopConsuming(): void {
    this.callObservers("traitDidStopConsuming", this);
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
    return this.getModel().updateTime;
  }

  /** @override */
  equals(that: unknown): boolean {
    return this === that;
  }

  /** @override */
  hashCode(): number {
    return Murmur3.mash(Murmur3.mixString(0, this.uid));
  }

  static create<S extends new () => InstanceType<S>>(this: S): InstanceType<S> {
    return new this();
  }

  static fromLike<S extends Class<Instance<S, Trait>>>(this: S, value: InstanceType<S> | LikeType<InstanceType<S>>): InstanceType<S> {
    if (value === void 0 || value === null) {
      return value as InstanceType<S>;
    } else if (value instanceof Trait) {
      if (!((value as Trait) instanceof this)) {
        throw new TypeError(value + " not an instance of " + this);
      }
      return value as InstanceType<S>;
    } else if (Creatable[Symbol.hasInstance](value)) {
      return (value as Creatable<InstanceType<S>>).create();
    }
    throw new TypeError("" + this);
  }

  /** @internal */
  static uid: () => string = (function () {
    let nextId = 1;
    return function uid(): string {
      const id = ~~nextId;
      nextId += 1;
      return "trait" + id;
    };
  })();

  /** @internal */
  declare static readonly fieldInitializers?: {[name: PropertyKey]: Function[]};
  /** @internal */
  declare static readonly instanceInitializers?: Function[];

  /** @internal */
  static initDecorators(): void {
    // Ensure each trait class has its own metadata and decorator initializer fields.
    if (!Object.hasOwnProperty.call(this, Symbol.metadata)) {
      const superMetadata: Record<PropertyKey, unknown> & object /*DecoratorMetadataObject*/ | undefined = Object.getPrototypeOf(this)[Symbol.metadata];
      Object.defineProperty(this, Symbol.metadata, {
        value: Object.create(superMetadata !== void 0 ? superMetadata : null),
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }
    if (!Object.hasOwnProperty.call(this, "fieldInitializers")) {
      Object.defineProperty(this, "fieldInitializers", {
        value: {},
        enumerable: true,
        configurable: true,
      });
    }
    if (!Object.hasOwnProperty.call(this, "instanceInitializers")) {
      Object.defineProperty(this, "instanceInitializers", {
        value: [],
        enumerable: true,
        configurable: true,
      });
    }
  }

  /** @internal */
  static defineField<S extends Class<Instance<S, Trait>>, T extends InstanceType<S>, K extends keyof T>(this: S, name: K, decorators: T[K] extends Fastener<any, any, any> ? FastenerDecorator<T[K]>[] : never): void {
    const traitClass = this as unknown as typeof Trait;
    traitClass.initDecorators();
    __esDecorate(null, null, decorators as Function[], {
      kind: "field",
      name,
      static: false,
      private: false,
      access: {
        has(obj: T): boolean {
          return name in obj;
        },
        get(obj: T): T[K] {
          return obj[name];
        },
        set(obj: T, value: T[K]): void {
          obj[name] = value;
        },
      },
      metadata: traitClass[Symbol.metadata],
    }, traitClass.fieldInitializers![name] = [], traitClass.instanceInitializers!);
  }

  /** @internal */
  static defineGetter<S extends Class<Instance<S, Trait>>, T extends InstanceType<S>, K extends keyof T>(this: S, name: K, decorators: T[K] extends Fastener<any, any, any> ? FastenerDecorator<T[K]>[] : never): void {
    const traitClass = this as unknown as typeof Trait;
    traitClass.initDecorators();
    Object.defineProperty(traitClass.prototype, name, {
      get: Fastener.getter,
      enumerable: true,
      configurable: true,
    });
    __esDecorate(traitClass, null, decorators as Function[], {
      kind: "getter",
      name,
      static: false,
      private: false,
      access: {
        has(obj: T): boolean {
          return name in obj;
        },
        get(obj: T): T[K] {
          return obj[name];
        },
        set(obj: T, value: T[K]): void {
          obj[name] = value;
        },
      },
      metadata: traitClass[Symbol.metadata],
    }, null, traitClass.instanceInitializers!);
  }

  /** @internal */
  static initFasteners<S extends Class<Instance<S, Trait>>>(this: S, fastener: InstanceType<S>): void {
    const traitClass = this as unknown as typeof Trait;
    if (!Object.hasOwnProperty.call(traitClass, "fieldInitializers")
        || !Object.hasOwnProperty.call(traitClass, "instanceInitializers")) {
      return;
    }
    __runInitializers(fastener, traitClass.instanceInitializers!);
    for (const key in traitClass.fieldInitializers!) {
      (fastener as any)[key] = __runInitializers(fastener, traitClass.fieldInitializers[key]!, void 0);
    }
  }

  /** @internal */
  static readonly MountedFlag: TraitFlags = 1 << 0;
  /** @internal */
  static readonly InsertingFlag: TraitFlags = 1 << 1;
  /** @internal */
  static readonly RemovingFlag: TraitFlags = 1 << 2;
  /** @internal */
  static readonly ConsumingFlag: TraitFlags = 1 << 3;

  /** @internal */
  static readonly FlagShift: number = 4;
  /** @internal */
  static readonly FlagMask: ModelFlags = (1 << this.FlagShift) - 1;

  static readonly MountFlags: ModelFlags = 0;
  static readonly InsertChildFlags: ModelFlags = 0;
  static readonly RemoveChildFlags: ModelFlags = 0;
  static readonly ReinsertChildFlags: ModelFlags = 0;
  static readonly InsertTraitFlags: ModelFlags = 0;
  static readonly RemoveTraitFlags: ModelFlags = 0;
  static readonly StartConsumingFlags: TraitFlags = 0;
  static readonly StopConsumingFlags: TraitFlags = 0;
}
