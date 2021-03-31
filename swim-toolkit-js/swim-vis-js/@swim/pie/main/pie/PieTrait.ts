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

import {Equals} from "@swim/util";
import {Model, TraitModelType, Trait, TraitFastener, GenericTrait} from "@swim/model";
import type {GraphicsView} from "@swim/graphics";
import {SliceTrait} from "../slice/SliceTrait";
import type {PieTraitObserver} from "./PieTraitObserver";

export type PieTitle = PieTitleFunction | string;
export type PieTitleFunction = (pieTrait: PieTrait) => GraphicsView | string | null;

export class PieTrait extends GenericTrait {
  constructor() {
    super();
    Object.defineProperty(this, "title", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "sliceFasteners", {
      value: [],
      enumerable: true,
    });
  }

  declare readonly traitObservers: ReadonlyArray<PieTraitObserver>;

  declare readonly title: PieTitle | null;

  setTitle(newTitle: PieTitle | null): void {
    const oldTitle = this.title;
    if (!Equals(newTitle, oldTitle)) {
      this.willSetTitle(newTitle, oldTitle);
      Object.defineProperty(this, "title", {
        value: newTitle,
        enumerable: true,
        configurable: true,
      });
      this.onSetTitle(newTitle, oldTitle);
      this.didSetTitle(newTitle, oldTitle);
    }
  }

  protected willSetTitle(newTitle: PieTitle | null, oldTitle: PieTitle | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.pieTraitWillSetTitle !== void 0) {
        traitObserver.pieTraitWillSetTitle(newTitle, oldTitle, this);
      }
    }
  }

  protected onSetTitle(newTitle: PieTitle | null, oldTitle: PieTitle | null): void {
    // hook
  }

  protected didSetTitle(newTitle: PieTitle | null, oldTitle: PieTitle | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.pieTraitDidSetTitle !== void 0) {
        traitObserver.pieTraitDidSetTitle(newTitle, oldTitle, this);
      }
    }
  }

  insertSlice(sliceTrait: SliceTrait, targetTrait: Trait | null = null): void {
    const sliceFasteners = this.sliceFasteners as TraitFastener<this, SliceTrait>[];
    let targetIndex = sliceFasteners.length;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      if (sliceFastener.trait === sliceTrait) {
        return;
      } else if (sliceFastener.trait === targetTrait) {
        targetIndex = i;
      }
    }
    const sliceFastener = this.createSliceFastener(sliceTrait);
    sliceFasteners.splice(targetIndex, 0, sliceFastener);
    sliceFastener.setTrait(sliceTrait, targetTrait);
    if (this.isMounted()) {
      sliceFastener.mount();
    }
  }

  removeSlice(sliceTrait: SliceTrait): void {
    const sliceFasteners = this.sliceFasteners as TraitFastener<this, SliceTrait>[];
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      if (sliceFastener.trait === sliceTrait) {
        sliceFastener.setTrait(null);
        if (this.isMounted()) {
          sliceFastener.unmount();
        }
        sliceFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected initSlice(sliceTrait: SliceTrait, sliceFastener: TraitFastener<this, SliceTrait>): void {
    // hook
  }

  protected attachSlice(sliceTrait: SliceTrait, sliceFastener: TraitFastener<this, SliceTrait>): void {
    if (this.isConsuming()) {
      sliceTrait.addTraitConsumer(this);
    }
  }

  protected detachSlice(sliceTrait: SliceTrait, sliceFastener: TraitFastener<this, SliceTrait>): void {
    if (this.isConsuming()) {
      sliceTrait.removeTraitConsumer(this);
    }
  }

  protected willSetSlice(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null,
                         targetTrait: Trait | null, sliceFastener: TraitFastener<this, SliceTrait>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.pieTraitWillSetSlice !== void 0) {
        traitObserver.pieTraitWillSetSlice(newSliceTrait, oldSliceTrait, targetTrait, this);
      }
    }
  }

  protected onSetSlice(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null,
                       targetTrait: Trait | null, sliceFastener: TraitFastener<this, SliceTrait>): void {
    if (oldSliceTrait !== null) {
      this.detachSlice(oldSliceTrait, sliceFastener);
    }
    if (newSliceTrait !== null) {
      this.attachSlice(newSliceTrait, sliceFastener);
      this.initSlice(newSliceTrait, sliceFastener);
    }
  }

  protected didSetSlice(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null,
                        targetTrait: Trait | null, sliceFastener: TraitFastener<this, SliceTrait>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.pieTraitDidSetSlice !== void 0) {
        traitObserver.pieTraitDidSetSlice(newSliceTrait, oldSliceTrait, targetTrait, this);
      }
    }
  }

  /** @hidden */
  static SliceFastener = TraitFastener.define<PieTrait, SliceTrait>({
    type: SliceTrait,
    sibling: false,
    willSetTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null, targetTrait: Trait | null): void {
      this.owner.willSetSlice(newSliceTrait, oldSliceTrait, targetTrait, this);
    },
    onSetTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null, targetTrait: Trait | null): void {
      this.owner.onSetSlice(newSliceTrait, oldSliceTrait, targetTrait, this);
    },
    didSetTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null, targetTrait: Trait | null): void {
      this.owner.didSetSlice(newSliceTrait, oldSliceTrait, targetTrait, this);
    },
  });

  protected createSliceFastener(sliceTrait: SliceTrait): TraitFastener<this, SliceTrait> {
    return new PieTrait.SliceFastener(this, sliceTrait.key, "slice");
  }

  /** @hidden */
  declare readonly sliceFasteners: ReadonlyArray<TraitFastener<this, SliceTrait>>;

  /** @hidden */
  protected mountSliceFasteners(): void {
    const sliceFasteners = this.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      sliceFastener.mount();
    }
  }

  /** @hidden */
  protected unmountSliceFasteners(): void {
    const sliceFasteners = this.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      sliceFastener.unmount();
    }
  }

  /** @hidden */
  protected startConsumingSlices(): void {
    const sliceFasteners = this.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceTrait = sliceFasteners[i]!.trait;
      if (sliceTrait !== null) {
        sliceTrait.addTraitConsumer(this);
      }
    }
  }

  /** @hidden */
  protected stopConsumingSlices(): void {
    const sliceFasteners = this.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceTrait = sliceFasteners[i]!.trait;
      if (sliceTrait !== null) {
        sliceTrait.removeTraitConsumer(this);
      }
    }
  }

  protected detectSliceModel(model: Model): SliceTrait | null {
    return model.getTrait(SliceTrait);
  }

  protected detectModels(model: TraitModelType<this>): void {
    const childModels = model.childModels;
    for (let i = 0, n = childModels.length; i < n; i += 1) {
      const childModel = childModels[i]!;
      const sliceTrait = this.detectSliceModel(childModel);
      if (sliceTrait !== null) {
        this.insertSlice(sliceTrait);
      }
    }
  }

  protected didSetModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void {
    if (newModel !== null) {
      this.detectModels(newModel);
    }
    super.didSetModel(newModel, oldModel);
  }

  protected onInsertChildModel(childModel: Model, targetModel: Model | null): void {
    super.onInsertChildModel(childModel, targetModel);
    const sliceTrait = this.detectSliceModel(childModel);
    if (sliceTrait !== null) {
      const targetTrait = targetModel !== null ? this.detectSliceModel(targetModel) : null;
      this.insertSlice(sliceTrait, targetTrait);
    }
  }

  protected onRemoveChildModel(childModel: Model): void {
    super.onRemoveChildModel(childModel);
    const sliceTrait = this.detectSliceModel(childModel);
    if (sliceTrait !== null) {
      this.removeSlice(sliceTrait);
    }
  }

  /** @hidden */
  protected mountTraitFasteners(): void {
    super.mountTraitFasteners();
    this.mountSliceFasteners();
  }

  /** @hidden */
  protected unmountTraitFasteners(): void {
    this.unmountSliceFasteners();
    super.unmountTraitFasteners();
  }

  protected onStartConsuming(): void {
    super.onStartConsuming();
    this.startConsumingSlices();
  }

  protected onStopConsuming(): void {
    super.onStopConsuming();
    this.stopConsumingSlices();
  }
}
