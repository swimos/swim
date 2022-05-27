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

import type {Mutable, Proto} from "@swim/util";
import {Affinity, FastenerOwner, Fastener} from "@swim/component";
import type {AnyModel, ModelFactory, Model} from "./Model";
import {ModelRelationDescriptor, ModelRelationClass, ModelRelation} from "./ModelRelation";

/** @public */
export type ModelRefModel<F extends ModelRef<any, any>> =
  F extends {modelType?: ModelFactory<infer M>} ? M : never;

/** @public */
export interface ModelRefDescriptor<M extends Model = Model> extends ModelRelationDescriptor<M> {
  extends?: Proto<ModelRef<any, any>> | string | boolean | null;
  modelKey?: string | boolean;
}

/** @public */
export type ModelRefTemplate<F extends ModelRef<any, any>> =
  ThisType<F> &
  ModelRefDescriptor<ModelRefModel<F>> &
  Partial<Omit<F, keyof ModelRefDescriptor>>;

/** @public */
export interface ModelRefClass<F extends ModelRef<any, any> = ModelRef<any, any>> extends ModelRelationClass<F> {
  /** @override */
  specialize(template: ModelRefDescriptor<any>): ModelRefClass<F>;

  /** @override */
  refine(fastenerClass: ModelRefClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: ModelRefTemplate<F2>): ModelRefClass<F2>;
  extend<F2 extends F>(className: string, template: ModelRefTemplate<F2>): ModelRefClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: ModelRefTemplate<F2>): ModelRefClass<F2>;
  define<F2 extends F>(className: string, template: ModelRefTemplate<F2>): ModelRefClass<F2>;

  /** @override */
  <F2 extends F>(template: ModelRefTemplate<F2>): PropertyDecorator;
}

/** @public */
export interface ModelRef<O = unknown, M extends Model = Model> extends ModelRelation<O, M> {
  (): M | null;
  (model: AnyModel<M> | null, target?: Model | null, key?: string): O;

  /** @override */
  get fastenerType(): Proto<ModelRef<any, any>>;

  /** @internal @override */
  getSuper(): ModelRef<unknown, M> | null;

  /** @internal @override */
  setDerived(derived: boolean, inlet: ModelRef<unknown, M>): void;

  /** @protected @override */
  willDerive(inlet: ModelRef<unknown, M>): void;

  /** @protected @override */
  onDerive(inlet: ModelRef<unknown, M>): void;

  /** @protected @override */
  didDerive(inlet: ModelRef<unknown, M>): void;

  /** @protected @override */
  willUnderive(inlet: ModelRef<unknown, M>): void;

  /** @protected @override */
  onUnderive(inlet: ModelRef<unknown, M>): void;

  /** @protected @override */
  didUnderive(inlet: ModelRef<unknown, M>): void;

  /** @override */
  readonly inlet: ModelRef<unknown, M> | null;

  /** @protected @override */
  willBindInlet(inlet: ModelRef<unknown, M>): void;

  /** @protected @override */
  onBindInlet(inlet: ModelRef<unknown, M>): void;

  /** @protected @override */
  didBindInlet(inlet: ModelRef<unknown, M>): void;

  /** @protected @override */
  willUnbindInlet(inlet: ModelRef<unknown, M>): void;

  /** @protected @override */
  onUnbindInlet(inlet: ModelRef<unknown, M>): void;

  /** @protected @override */
  didUnbindInlet(inlet: ModelRef<unknown, M>): void;

  /** @internal @override */
  readonly outlets: ReadonlyArray<ModelRef<unknown, M>> | null;

  /** @internal @override */
  attachOutlet(outlet: ModelRef<unknown, M>): void;

  /** @internal @override */
  detachOutlet(outlet: ModelRef<unknown, M>): void;

  get inletModel(): M | null;

  getInletModel(): M;

  /** @internal */
  readonly modelKey?: string; // optional prototype property

  readonly model: M | null;

  getModel(): M;

  setModel(model: AnyModel<M> | null, target?: Model | null, key?: string): M | null;

  attachModel(model?: AnyModel<M>, target?: Model | null): M;

  detachModel(): M | null;

  insertModel(parent?: Model | null, model?: AnyModel<M>, target?: Model | null, key?: string): M;

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

  /** @internal @protected */
  decohereOutlets(): void;

  /** @internal @protected */
  decohereOutlet(outlet: ModelRef<unknown, M>): void;

  /** @override */
  recohere(t: number): void;
}

/** @public */
export const ModelRef = (function (_super: typeof ModelRelation) {
  const ModelRef = _super.extend("ModelRef", {}) as ModelRefClass;

  Object.defineProperty(ModelRef.prototype, "fastenerType", {
    value: ModelRef,
    configurable: true,
  });

  ModelRef.prototype.onDerive = function (this: ModelRef, inlet: ModelRef): void {
    const inletModel = inlet.model;
    if (inletModel !== null) {
      this.attachModel(inletModel);
    } else {
      this.detachModel();
    }
  };

  Object.defineProperty(ModelRef.prototype, "inletModel", {
    get: function <M extends Model>(this: ModelRef<unknown, M>): M | null {
      const inlet = this.inlet;
      return inlet !== null ? inlet.model : null;
    },
    configurable: true,
  });

  ModelRef.prototype.getInletModel = function <M extends Model>(this: ModelRef<unknown, M>): M {
    const inletModel = this.inletModel;
    if (inletModel === void 0 || inletModel === null) {
      let message = inletModel + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "inlet model";
      throw new TypeError(message);
    }
    return inletModel;
  };

  ModelRef.prototype.getModel = function <M extends Model>(this: ModelRef<unknown, M>): M {
    const model = this.model;
    if (model === null) {
      let message = model + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "model";
      throw new TypeError(message);
    }
    return model;
  };

  ModelRef.prototype.setModel = function <M extends Model>(this: ModelRef<unknown, M>, newModel: AnyModel<M> | null, target?: Model | null, key?: string): M | null {
    let oldModel = this.model;
    if (newModel !== null) {
      newModel = this.fromAny(newModel);
    }
    if (oldModel !== newModel) {
      if (target === void 0) {
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
      }
      if (oldModel !== newModel) {
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
      }
    }
    return oldModel;
  };

  ModelRef.prototype.attachModel = function <M extends Model>(this: ModelRef<unknown, M>, newModel?: AnyModel<M>, target?: Model | null): M {
    const oldModel = this.model;
    if (newModel !== void 0 && newModel !== null) {
      newModel = this.fromAny(newModel);
    } else if (oldModel === null) {
      newModel = this.createModel();
    } else {
      newModel = oldModel;
    }
    if (oldModel !== newModel) {
      if (target === void 0) {
        target = null;
      }
      if (oldModel !== null) {
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
    }
    return newModel;
  };

  ModelRef.prototype.detachModel = function <M extends Model>(this: ModelRef<unknown, M>): M | null {
    const oldModel = this.model;
    if (oldModel !== null) {
      (this as Mutable<typeof this>).model = null;
      this.willDetachModel(oldModel);
      this.onDetachModel(oldModel);
      this.deinitModel(oldModel);
      this.didDetachModel(oldModel);
      this.setCoherent(true);
      this.decohereOutlets();
    }
    return oldModel;
  };

  ModelRef.prototype.insertModel = function <M extends Model>(this: ModelRef<unknown, M>, parent?: Model | null, newModel?: AnyModel<M>, target?: Model | null, key?: string): M {
    let oldModel = this.model;
    if (newModel !== void 0 && newModel !== null) {
      newModel = this.fromAny(newModel);
    } else if (oldModel === null) {
      newModel = this.createModel();
    } else {
      newModel = oldModel;
    }
    if (parent === void 0) {
      parent = null;
    }
    if (this.binds || oldModel !== newModel || newModel.parent === null || parent !== null || key !== void 0) {
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
      if (oldModel !== newModel) {
        if (oldModel !== null) {
          (this as Mutable<typeof this>).model = null;
          this.willDetachModel(oldModel);
          this.onDetachModel(oldModel);
          this.deinitModel(oldModel);
          this.didDetachModel(oldModel);
          oldModel.remove();
        }
        (this as Mutable<typeof this>).model = newModel;
        this.willAttachModel(newModel, target);
        this.onAttachModel(newModel, target);
        this.initModel(newModel);
        this.didAttachModel(newModel, target);
        this.setCoherent(true);
        this.decohereOutlets();
      }
    }
    return newModel;
  };

  ModelRef.prototype.removeModel = function <M extends Model>(this: ModelRef<unknown, M>): M | null {
    const model = this.model;
    if (model !== null) {
      model.remove();
    }
    return model;
  };

  ModelRef.prototype.deleteModel = function <M extends Model>(this: ModelRef<unknown, M>): M | null {
    const model = this.detachModel();
    if (model !== null) {
      model.remove();
    }
    return model;
  };

  ModelRef.prototype.bindModel = function <M extends Model>(this: ModelRef<unknown, M>, model: Model, target: Model | null): void {
    if (this.binds && this.model === null) {
      const newModel = this.detectModel(model);
      if (newModel !== null) {
        (this as Mutable<typeof this>).model = newModel;
        this.willAttachModel(newModel, target);
        this.onAttachModel(newModel, target);
        this.initModel(newModel);
        this.didAttachModel(newModel, target);
        this.setCoherent(true);
        this.decohereOutlets();
      }
    }
  };

  ModelRef.prototype.unbindModel = function <M extends Model>(this: ModelRef<unknown, M>, model: Model): void {
    if (this.binds) {
      const oldModel = this.detectModel(model);
      if (oldModel !== null && this.model === oldModel) {
        (this as Mutable<typeof this>).model = null;
        this.willDetachModel(oldModel);
        this.onDetachModel(oldModel);
        this.deinitModel(oldModel);
        this.didDetachModel(oldModel);
        this.setCoherent(true);
        this.decohereOutlets();
      }
    }
  };

  ModelRef.prototype.detectModel = function <M extends Model>(this: ModelRef<unknown, M>, model: Model): M | null {
    const key = this.modelKey;
    if (key !== void 0 && key === model.key) {
      return model as M;
    }
    return null;
  };

  ModelRef.prototype.onStartConsuming = function (this: ModelRef): void {
    const model = this.model;
    if (model !== null) {
      model.consume(this);
    }
  };

  ModelRef.prototype.onStopConsuming = function (this: ModelRef): void {
    const model = this.model;
    if (model !== null) {
      model.unconsume(this);
    }
  };

  ModelRef.prototype.decohereOutlets = function (this: ModelRef): void {
    const outlets = this.outlets;
    for (let i = 0, n = outlets !== null ? outlets.length : 0; i < n; i += 1) {
      this.decohereOutlet(outlets![i]!);
    }
  };

  ModelRef.prototype.decohereOutlet = function (this: ModelRef, outlet: ModelRef): void {
    if ((outlet.flags & Fastener.DerivedFlag) === 0 && Math.min(this.flags & Affinity.Mask, Affinity.Intrinsic) >= (outlet.flags & Affinity.Mask)) {
      outlet.setDerived(true, this);
    } else if ((outlet.flags & Fastener.DerivedFlag) !== 0 && (outlet.flags & Fastener.DecoherentFlag) === 0) {
      outlet.setCoherent(false);
      outlet.decohere();
    }
  };

  ModelRef.prototype.recohere = function (this: ModelRef, t: number): void {
    if ((this.flags & Fastener.DerivedFlag) !== 0) {
      const inlet = this.inlet;
      if (inlet !== null) {
        this.setModel(inlet.model);
      }
    }
  };

  ModelRef.construct = function <F extends ModelRef<any, any>>(fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (model?: AnyModel<ModelRefModel<F>> | null, target?: Model | null, key?: string): ModelRefModel<F> | null | FastenerOwner<F> {
        if (model === void 0) {
          return fastener!.model;
        } else {
          fastener!.setModel(model, target, key);
          return fastener!.owner;
        }
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, this.prototype);
    }
    fastener = _super.construct.call(this, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).model = null;
    return fastener;
  };

  ModelRef.refine = function (fastenerClass: ModelRefClass<any>): void {
    _super.refine.call(this, fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;

    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "modelKey")) {
      const modelKey = fastenerPrototype.modelKey as string | boolean | undefined;
      if (modelKey === true) {
        Object.defineProperty(fastenerPrototype, "modelKey", {
          value: fastenerClass.name,
          enumerable: true,
          configurable: true,
        });
      } else if (modelKey === false) {
        Object.defineProperty(fastenerPrototype, "modelKey", {
          value: void 0,
          enumerable: true,
          configurable: true,
        });
      }
    }
  };

  return ModelRef;
})(ModelRelation);
