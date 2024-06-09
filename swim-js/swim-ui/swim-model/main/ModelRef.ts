// Copyright 2015-2024 Nstream, inc.
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
import type {Proto} from "@swim/util";
import type {LikeType} from "@swim/util";
import {Affinity} from "@swim/component";
import {FastenerContext} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import {Fastener} from "@swim/component";
import type {Model} from "./Model";
import type {ModelRelationDescriptor} from "./ModelRelation";
import type {ModelRelationClass} from "./ModelRelation";
import {ModelRelation} from "./ModelRelation";

/** @public */
export interface ModelRefDescriptor<R, M extends Model> extends ModelRelationDescriptor<R, M> {
  extends?: Proto<ModelRef<any, any, any>> | boolean | null;
  modelKey?: string | boolean;
}

/** @public */
export interface ModelRefClass<F extends ModelRef<any, any, any> = ModelRef<any, any, any>> extends ModelRelationClass<F> {
  tryModel<R, K extends keyof R, F extends R[K] = R[K]>(owner: R, fastenerName: K): (F extends {readonly model: infer M | null} ? M | null : never) | null;
}

/** @public */
export interface ModelRef<R = any, M extends Model = Model, I extends any[] = [M | null]> extends ModelRelation<R, M, I> {
  /** @override */
  get descriptorType(): Proto<ModelRefDescriptor<R, M>>;

  /** @override */
  get fastenerType(): Proto<ModelRef<any, any, any>>;

  /** @override */
  get parent(): ModelRef<any, M, any> | null;

  get inletModel(): M | null;

  getInletModel(): M;

  get(): M | null;

  set(model: M | LikeType<M> | Fastener<any, I[0], any> | null): R;

  setIntrinsic(model: M | LikeType<M> | Fastener<any, I[0], any> | null): R;

  get modelKey(): string | undefined;

  readonly model: M | null;

  getModel(): M;

  setModel(model: M | LikeType<M> | null, target?: Model | null, key?: string): M | null;

  attachModel(model?: M | LikeType<M> | null, target?: Model | null): M;

  detachModel(): M | null;

  insertModel(parent?: Model | null, model?: M | LikeType<M>, target?: Model | null, key?: string): M;

  removeModel(): M | null;

  deleteModel(): M | null;

  /** @internal @override */
  bindModel(model: Model, target: Model | null): void;

  /** @internal @override */
  unbindModel(model: Model): void;

  /** @override */
  detectModel(model: Model): M | null;

  /** @protected @override */
  onStartConsuming(): void;

  /** @protected @override */
  onStopConsuming(): void;

  /** @override */
  recohere(t: number): void;
}

/** @public */
export const ModelRef = (<R, M extends Model, I extends any[], F extends ModelRef<any, any, any>>() => ModelRelation.extend<ModelRef<R, M, I>, ModelRefClass<F>>("ModelRef", {
  get fastenerType(): Proto<ModelRef<any, any, any>> {
    return ModelRef;
  },

  get inletModel(): M | null {
    const inlet = this.inlet;
    return inlet instanceof ModelRef ? inlet.model : null;
  },

  getInletModel(): M {
    const inletModel = this.inletModel;
    if (inletModel === void 0 || inletModel === null) {
      let message = inletModel + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "inlet model";
      throw new TypeError(message);
    }
    return inletModel;
  },

  get(): M | null {
    return this.model;
  },

  set(model: M | LikeType<M> | Fastener<any, I[0], any> | null): R {
    if (model instanceof Fastener) {
      this.bindInlet(model);
    } else {
      this.setModel(model);
    }
    return this.owner;
  },

  setIntrinsic(model: M | LikeType<M> | Fastener<any, I[0], any> | null): R {
    if (model instanceof Fastener) {
      this.bindInlet(model);
    } else {
      this.setModel(model);
    }
    return this.owner;
  },

  modelKey: void 0,

  getModel(): M {
    const model = this.model;
    if (model === null) {
      let message = model + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "model";
      throw new TypeError(message);
    }
    return model;
  },

  setModel(newModel: M | LikeType<M> | null, target?: Model | null, key?: string): M | null {
    if (newModel !== null) {
      newModel = this.fromLike(newModel);
    }
    let oldModel = this.model;
    if (oldModel === newModel) {
      this.setCoherent(true);
      return oldModel;
    } else if (target === void 0) {
      target = null;
    }
    let parent: Model | null;
    if (this.binds && (parent = this.parentModel, parent !== null)) {
      if (oldModel !== null && oldModel.parent === parent) {
        if (target === null) {
          target = oldModel.nextSibling;
        }
        oldModel.remove();
      }
      if (newModel !== null) {
        if (key === void 0) {
          key = this.modelKey;
        }
        this.insertChild(parent, newModel, target, key);
      }
      oldModel = this.model;
      if (oldModel === newModel) {
        return oldModel;
      }
    }
    if (oldModel !== null) {
      (this as Mutable<typeof this>).model = null;
      this.willDetachModel(oldModel);
      this.onDetachModel(oldModel);
      this.deinitModel(oldModel);
      this.didDetachModel(oldModel);
    }
    if (newModel !== null) {
      (this as Mutable<typeof this>).model = newModel;
      this.willAttachModel(newModel, target);
      this.onAttachModel(newModel, target);
      this.initModel(newModel);
      this.didAttachModel(newModel, target);
    }
    this.setCoherent(true);
    this.decohereOutlets();
    return oldModel;
  },

  attachModel(newModel?: M | LikeType<M> | null, target?: Model | null): M {
    const oldModel = this.model;
    if (newModel !== void 0 && newModel !== null) {
      newModel = this.fromLike(newModel);
    } else if (oldModel === null) {
      newModel = this.createModel();
    } else {
      newModel = oldModel;
    }
    if (target === void 0) {
      target = null;
    }
    if (oldModel === newModel) {
      return newModel;
    } else if (oldModel !== null) {
      (this as Mutable<typeof this>).model = null;
      this.willDetachModel(oldModel);
      this.onDetachModel(oldModel);
      this.deinitModel(oldModel);
      this.didDetachModel(oldModel);
    }
    (this as Mutable<typeof this>).model = newModel;
    this.willAttachModel(newModel, target);
    this.onAttachModel(newModel, target);
    this.initModel(newModel);
    this.didAttachModel(newModel, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newModel;
  },

  detachModel(): M | null {
    const oldModel = this.model;
    if (oldModel === null) {
      return null;
    }
    (this as Mutable<typeof this>).model = null;
    this.willDetachModel(oldModel);
    this.onDetachModel(oldModel);
    this.deinitModel(oldModel);
    this.didDetachModel(oldModel);
    this.setCoherent(true);
    this.decohereOutlets();
    return oldModel;
  },

  insertModel(parent?: Model | null, newModel?: M | LikeType<M>, target?: Model | null, key?: string): M {
    let oldModel = this.model;
    if (newModel !== void 0 && newModel !== null) {
      newModel = this.fromLike(newModel);
    } else if (oldModel === null) {
      newModel = this.createModel();
    } else {
      newModel = oldModel;
    }
    if (parent === void 0) {
      parent = null;
    }
    if (!this.binds && oldModel === newModel && newModel.parent !== null && parent === null && key === void 0) {
      return newModel;
    }
    if (parent === null) {
      parent = this.parentModel;
    }
    if (target === void 0) {
      target = null;
    }
    if (key === void 0) {
      key = this.modelKey;
    }
    if (parent !== null && (newModel.parent !== parent || newModel.key !== key)) {
      this.insertChild(parent, newModel, target, key);
    }
    oldModel = this.model;
    if (oldModel === newModel) {
      return newModel;
    } else if (oldModel !== null) {
      (this as Mutable<typeof this>).model = null;
      this.willDetachModel(oldModel);
      this.onDetachModel(oldModel);
      this.deinitModel(oldModel);
      this.didDetachModel(oldModel);
      if (this.binds && parent !== null && oldModel.parent === parent) {
        oldModel.remove();
      }
    }
    (this as Mutable<typeof this>).model = newModel;
    this.willAttachModel(newModel, target);
    this.onAttachModel(newModel, target);
    this.initModel(newModel);
    this.didAttachModel(newModel, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newModel;
  },

  removeModel(): M | null {
    const model = this.model;
    if (model === null) {
      return null;
    }
    model.remove();
    return model;
  },

  deleteModel(): M | null {
    const model = this.detachModel();
    if (model === null) {
      return null;
    }
    model.remove();
    return model;
  },

  bindModel(model: Model, target: Model | null): void {
    if (!this.binds || this.model !== null) {
      return;
    }
    const newModel = this.detectModel(model);
    if (newModel === null) {
      return;
    }
    (this as Mutable<typeof this>).model = newModel;
    this.willAttachModel(newModel, target);
    this.onAttachModel(newModel, target);
    this.initModel(newModel);
    this.didAttachModel(newModel, target);
    this.setCoherent(true);
    this.decohereOutlets();
  },

  unbindModel(model: Model): void {
    if (!this.binds) {
      return;
    }
    const oldModel = this.detectModel(model);
    if (oldModel === null || this.model !== oldModel) {
      return;
    }
    (this as Mutable<typeof this>).model = null;
    this.willDetachModel(oldModel);
    this.onDetachModel(oldModel);
    this.deinitModel(oldModel);
    this.didDetachModel(oldModel);
    this.setCoherent(true);
    this.decohereOutlets();
  },

  detectModel(model: Model): M | null {
    const key = this.modelKey;
    if (key !== void 0 && key === model.key) {
      return model as M;
    }
    return null;
  },

  onStartConsuming(): void {
    const model = this.model;
    if (model !== null) {
      model.consume(this);
    }
  },

  onStopConsuming(): void {
    const model = this.model;
    if (model !== null) {
      model.unconsume(this);
    }
  },

  recohere(t: number): void {
    this.setCoherentTime(t);
    const inlet = this.inlet;
    if (inlet instanceof ModelRef) {
      this.setDerived((this.flags & Affinity.Mask) <= Math.min(inlet.flags & Affinity.Mask, Affinity.Intrinsic));
      if ((this.flags & Fastener.DerivedFlag) !== 0) {
        this.setModel(inlet.model);
      }
    } else {
      this.setDerived(false);
    }
  },
},
{
  tryModel<R, K extends keyof R, F extends R[K]>(owner: R, fastenerName: K): (F extends {readonly model: infer M | null} ? M | null : never) | null {
    const metaclass = FastenerContext.getMetaclass(owner);
    const modelRef = metaclass !== null ? metaclass.tryFastener(owner, fastenerName) : null;
    return modelRef instanceof ModelRef ? modelRef.model : null;
  },

  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).model = null;
    return fastener;
  },

  refine(fastenerClass: FastenerClass<ModelRef<any, any, any>>): void {
    super.refine(fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;

    const modelKeyDescriptor = Object.getOwnPropertyDescriptor(fastenerPrototype, "modelKey");
    if (modelKeyDescriptor !== void 0 && "value" in modelKeyDescriptor) {
      if (modelKeyDescriptor.value === true) {
        modelKeyDescriptor.value = fastenerClass.name;
        Object.defineProperty(fastenerPrototype, "modelKey", modelKeyDescriptor);
      } else if (modelKeyDescriptor.value === false) {
        modelKeyDescriptor.value = void 0;
        Object.defineProperty(fastenerPrototype, "modelKey", modelKeyDescriptor);
      }
    }
  },
}))();
