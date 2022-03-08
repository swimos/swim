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

import type {Mutable, Proto, ObserverType} from "@swim/util";
import {Affinity, FastenerOwner, Fastener} from "@swim/component";
import type {AnyModel, Model} from "./Model";
import {ModelRelationInit, ModelRelationClass, ModelRelation} from "./ModelRelation";

/** @internal */
export type ModelRefType<F extends ModelRef<any, any>> =
  F extends ModelRef<any, infer M> ? M : never;

/** @public */
export interface ModelRefInit<M extends Model = Model> extends ModelRelationInit<M> {
  extends?: {prototype: ModelRef<any, any>} | string | boolean | null;
  key?: string | boolean;

  willInherit?(superFastener: ModelRef<unknown, M>): void;
  didInherit?(superFastener: ModelRef<unknown, M>): void;
  willUninherit?(superFastener: ModelRef<unknown, M>): void;
  didUninherit?(superFastener: ModelRef<unknown, M>): void;

  willBindSuperFastener?(superFastener: ModelRef<unknown, M>): void;
  didBindSuperFastener?(superFastener: ModelRef<unknown, M>): void;
  willUnbindSuperFastener?(superFastener: ModelRef<unknown, M>): void;
  didUnbindSuperFastener?(superFastener: ModelRef<unknown, M>): void;
}

/** @public */
export type ModelRefDescriptor<O = unknown, M extends Model = Model, I = {}> = ThisType<ModelRef<O, M> & I> & ModelRefInit<M> & Partial<I>;

/** @public */
export interface ModelRefClass<F extends ModelRef<any, any> = ModelRef<any, any>> extends ModelRelationClass<F> {
}

/** @public */
export interface ModelRefFactory<F extends ModelRef<any, any> = ModelRef<any, any>> extends ModelRefClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): ModelRefFactory<F> & I;

  define<O, M extends Model = Model>(className: string, descriptor: ModelRefDescriptor<O, M>): ModelRefFactory<ModelRef<any, M>>;
  define<O, M extends Model = Model>(className: string, descriptor: {observes: boolean} & ModelRefDescriptor<O, M, ObserverType<M>>): ModelRefFactory<ModelRef<any, M>>;
  define<O, M extends Model = Model, I = {}>(className: string, descriptor: {implements: unknown} & ModelRefDescriptor<O, M, I>): ModelRefFactory<ModelRef<any, M> & I>;
  define<O, M extends Model = Model, I = {}>(className: string, descriptor: {implements: unknown; observes: boolean} & ModelRefDescriptor<O, M, I & ObserverType<M>>): ModelRefFactory<ModelRef<any, M> & I>;

  <O, M extends Model = Model>(descriptor: ModelRefDescriptor<O, M>): PropertyDecorator;
  <O, M extends Model = Model>(descriptor: {observes: boolean} & ModelRefDescriptor<O, M, ObserverType<M>>): PropertyDecorator;
  <O, M extends Model = Model, I = {}>(descriptor: {implements: unknown} & ModelRefDescriptor<O, M, I>): PropertyDecorator;
  <O, M extends Model = Model, I = {}>(descriptor: {implements: unknown; observes: boolean} & ModelRefDescriptor<O, M, I & ObserverType<M>>): PropertyDecorator;
}

/** @public */
export interface ModelRef<O = unknown, M extends Model = Model> extends ModelRelation<O, M> {
  (): M | null;
  (model: AnyModel<M> | null, target?: Model | null, key?: string): O;

  /** @override */
  get fastenerType(): Proto<ModelRef<any, any>>;

  /** @internal @override */
  setInherited(inherited: boolean, superFastener: ModelRef<unknown, M>): void;

  /** @protected @override */
  willInherit(superFastener: ModelRef<unknown, M>): void;

  /** @protected @override */
  onInherit(superFastener: ModelRef<unknown, M>): void;

  /** @protected @override */
  didInherit(superFastener: ModelRef<unknown, M>): void;

  /** @protected @override */
  willUninherit(superFastener: ModelRef<unknown, M>): void;

  /** @protected @override */
  onUninherit(superFastener: ModelRef<unknown, M>): void;

  /** @protected @override */
  didUninherit(superFastener: ModelRef<unknown, M>): void;

  /** @override */
  readonly superFastener: ModelRef<unknown, M> | null;

  /** @internal @override */
  getSuperFastener(): ModelRef<unknown, M> | null;

  /** @protected @override */
  willBindSuperFastener(superFastener: ModelRef<unknown, M>): void;

  /** @protected @override */
  onBindSuperFastener(superFastener: ModelRef<unknown, M>): void;

  /** @protected @override */
  didBindSuperFastener(superFastener: ModelRef<unknown, M>): void;

  /** @protected @override */
  willUnbindSuperFastener(superFastener: ModelRef<unknown, M>): void;

  /** @protected @override */
  onUnbindSuperFastener(superFastener: ModelRef<unknown, M>): void;

  /** @protected @override */
  didUnbindSuperFastener(superFastener: ModelRef<unknown, M>): void;

  /** @internal */
  readonly subFasteners: ReadonlyArray<ModelRef<unknown, M>> | null;

  /** @internal @override */
  attachSubFastener(subFastener: ModelRef<unknown, M>): void;

  /** @internal @override */
  detachSubFastener(subFastener: ModelRef<unknown, M>): void;

  get superModel(): M | null;

  getSuperModel(): M;

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

  /** @internal @protected */
  decohereSubFasteners(): void;

  /** @internal @protected */
  decohereSubFastener(subFastener: ModelRef<unknown, M>): void;

  /** @override */
  recohere(t: number): void;

  /** @internal */
  get key(): string | undefined; // optional prototype field
}

/** @public */
export const ModelRef = (function (_super: typeof ModelRelation) {
  const ModelRef: ModelRefFactory = _super.extend("ModelRef");

  Object.defineProperty(ModelRef.prototype, "fastenerType", {
    get: function (this: ModelRef): Proto<ModelRef<any, any>> {
      return ModelRef;
    },
    configurable: true,
  });

  ModelRef.prototype.onInherit = function (this: ModelRef, superFastener: ModelRef): void {
    this.setModel(superFastener.model);
  };

  ModelRef.prototype.onBindSuperFastener = function <M extends Model>(this: ModelRef<unknown, M>, superFastener: ModelRef<unknown, M>): void {
    (this as Mutable<typeof this>).superFastener = superFastener;
    _super.prototype.onBindSuperFastener.call(this, superFastener);
  };

  ModelRef.prototype.onUnbindSuperFastener = function <M extends Model>(this: ModelRef<unknown, M>, superFastener: ModelRef<unknown, M>): void {
    _super.prototype.onUnbindSuperFastener.call(this, superFastener);
    (this as Mutable<typeof this>).superFastener = null;
  };

  ModelRef.prototype.attachSubFastener = function <M extends Model>(this: ModelRef<unknown, M>, subFastener: ModelRef<unknown, M>): void {
    let subFasteners = this.subFasteners as ModelRef<unknown, M>[] | null;
    if (subFasteners === null) {
      subFasteners = [];
      (this as Mutable<typeof this>).subFasteners = subFasteners;
    }
    subFasteners.push(subFastener);
  };

  ModelRef.prototype.detachSubFastener = function <M extends Model>(this: ModelRef<unknown, M>, subFastener: ModelRef<unknown, M>): void {
    const subFasteners = this.subFasteners as ModelRef<unknown, M>[] | null;
    if (subFasteners !== null) {
      const index = subFasteners.indexOf(subFastener);
      if (index >= 0) {
        subFasteners.splice(index, 1);
      }
    }
  };

  Object.defineProperty(ModelRef.prototype, "superModel", {
    get: function <M extends Model>(this: ModelRef<unknown, M>): M | null {
      const superFastener = this.superFastener;
      return superFastener !== null ? superFastener.model : null;
    },
    configurable: true,
  });

  ModelRef.prototype.getSuperModel = function <M extends Model>(this: ModelRef<unknown, M>): M {
    const superModel = this.superModel;
    if (superModel === void 0 || superModel === null) {
      let message = superModel + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "super model";
      throw new TypeError(message);
    }
    return superModel;
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
    if (newModel !== null) {
      newModel = this.fromAny(newModel);
    }
    let oldModel = this.model;
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
            key = this.key;
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
        this.decohereSubFasteners();
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
    if (newModel !== oldModel) {
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
      this.decohereSubFasteners();
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
      this.decohereSubFasteners();
    }
    return oldModel;
  };

  ModelRef.prototype.insertModel = function <M extends Model>(this: ModelRef<unknown, M>, parent?: Model | null, newModel?: AnyModel<M>, target?: Model | null, key?: string): M {
    if (newModel !== void 0 && newModel !== null) {
      newModel = this.fromAny(newModel);
    } else {
      const oldModel = this.model;
      if (oldModel === null) {
        newModel = this.createModel();
      } else {
        newModel = oldModel;
      }
    }
    if (parent === void 0 || parent === null) {
      parent = this.parentModel;
    }
    if (target === void 0) {
      target = null;
    }
    if (key === void 0) {
      key = this.key;
    }
    if (parent !== null && (newModel.parent !== parent || newModel.key !== key)) {
      this.insertChild(parent, newModel, target, key);
    }
    const oldModel = this.model;
    if (newModel !== oldModel) {
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
      this.decohereSubFasteners();
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
        this.decohereSubFasteners();
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
        this.decohereSubFasteners();
      }
    }
  };

  ModelRef.prototype.detectModel = function <M extends Model>(this: ModelRef<unknown, M>, model: Model): M | null {
    const key = this.key;
    if (key !== void 0 && key === model.key) {
      return model as M;
    }
    return null;
  };

  ModelRef.prototype.decohereSubFasteners = function (this: ModelRef): void {
    const subFasteners = this.subFasteners;
    for (let i = 0, n = subFasteners !== null ? subFasteners.length : 0; i < n; i += 1) {
      this.decohereSubFastener(subFasteners![i]!);
    }
  };

  ModelRef.prototype.decohereSubFastener = function (this: ModelRef, subFastener: ModelRef): void {
    if ((subFastener.flags & Fastener.InheritedFlag) === 0 && Math.min(this.flags & Affinity.Mask, Affinity.Intrinsic) >= (subFastener.flags & Affinity.Mask)) {
      subFastener.setInherited(true, this);
    } else if ((subFastener.flags & Fastener.InheritedFlag) !== 0 && (subFastener.flags & Fastener.DecoherentFlag) === 0) {
      subFastener.setCoherent(false);
      subFastener.decohere();
    }
  };

  ModelRef.prototype.recohere = function (this: ModelRef, t: number): void {
    if ((this.flags & Fastener.InheritedFlag) !== 0) {
      const superFastener = this.superFastener;
      if (superFastener !== null) {
        this.setModel(superFastener.model);
      }
    }
  };

  ModelRef.construct = function <F extends ModelRef<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (model?: AnyModel<ModelRefType<F>> | null, target?: Model | null, key?: string): ModelRefType<F> | null | FastenerOwner<F> {
        if (model === void 0) {
          return fastener!.model;
        } else {
          fastener!.setModel(model, target, key);
          return fastener!.owner;
        }
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, fastenerClass.prototype);
    }
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    Object.defineProperty(fastener, "superFastener", { // override getter
      value: null,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    (fastener as Mutable<typeof fastener>).subFasteners = null;
    (fastener as Mutable<typeof fastener>).model = null;
    return fastener;
  };

  ModelRef.define = function <O, M extends Model>(className: string, descriptor: ModelRefDescriptor<O, M>): ModelRefFactory<ModelRef<any, M>> {
    let superClass = descriptor.extends as ModelRefFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    delete descriptor.extends;
    delete descriptor.implements;
    delete descriptor.affinity;
    delete descriptor.inherits;

    if (descriptor.key === true) {
      Object.defineProperty(descriptor, "key", {
        value: className,
        configurable: true,
      });
    } else if (descriptor.key === false) {
      Object.defineProperty(descriptor, "key", {
        value: void 0,
        configurable: true,
      });
    }

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: ModelRef<any, any>}, fastener: ModelRef<O, M> | null, owner: O): ModelRef<O, M> {
      fastener = superClass!.construct(fastenerClass, fastener, owner);
      if (affinity !== void 0) {
        fastener.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        fastener.initInherits(inherits);
      }
      return fastener;
    };

    return fastenerClass;
  };

  return ModelRef;
})(ModelRelation);
