// Copyright 2015-2021 Swim inc.
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

import {Model, TraitModelType, Trait, TraitProperty, TraitFastener, GenericTrait} from "@swim/model";
import type {GraphicsView} from "@swim/graphics";
import {SliceTrait} from "../slice/SliceTrait";
import type {PieTraitObserver} from "./PieTraitObserver";

export type PieTitle = PieTitleFunction | string;
export type PieTitleFunction = (pieTrait: PieTrait) => GraphicsView | string | null;

export class PieTrait extends GenericTrait {
  constructor() {
    super();
    Object.defineProperty(this, "sliceFasteners", {
      value: [],
      enumerable: true,
    });
  }

  override readonly traitObservers!: ReadonlyArray<PieTraitObserver>;

  protected willSetTitle(newTitle: PieTitle | null, oldTitle: PieTitle | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetPieTitle !== void 0) {
        traitObserver.traitWillSetPieTitle(newTitle, oldTitle, this);
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
      if (traitObserver.traitDidSetPieTitle !== void 0) {
        traitObserver.traitDidSetPieTitle(newTitle, oldTitle, this);
      }
    }
  }

  @TraitProperty<PieTrait, PieTitle | null>({
    state: null,
    willSetState(newTitle: PieTitle | null, oldTitle: PieTitle | null): void {
      this.owner.willSetTitle(newTitle, oldTitle);
    },
    didSetState(newTitle: PieTitle | null, oldTitle: PieTitle | null): void {
      this.owner.onSetTitle(newTitle, oldTitle);
      this.owner.didSetTitle(newTitle, oldTitle);
    },
  })
  readonly title!: TraitProperty<this, PieTitle | null>;

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
      if (traitObserver.traitWillSetSlice !== void 0) {
        traitObserver.traitWillSetSlice(newSliceTrait, oldSliceTrait, targetTrait, this);
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
      if (traitObserver.traitDidSetSlice !== void 0) {
        traitObserver.traitDidSetSlice(newSliceTrait, oldSliceTrait, targetTrait, this);
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
  readonly sliceFasteners!: ReadonlyArray<TraitFastener<this, SliceTrait>>;

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

  protected override didSetModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void {
    if (newModel !== null) {
      this.detectModels(newModel);
    }
    super.didSetModel(newModel, oldModel);
  }

  protected override onInsertChildModel(childModel: Model, targetModel: Model | null): void {
    super.onInsertChildModel(childModel, targetModel);
    const sliceTrait = this.detectSliceModel(childModel);
    if (sliceTrait !== null) {
      const targetTrait = targetModel !== null ? this.detectSliceModel(targetModel) : null;
      this.insertSlice(sliceTrait, targetTrait);
    }
  }

  protected override onRemoveChildModel(childModel: Model): void {
    super.onRemoveChildModel(childModel);
    const sliceTrait = this.detectSliceModel(childModel);
    if (sliceTrait !== null) {
      this.removeSlice(sliceTrait);
    }
  }

  /** @hidden */
  protected override mountTraitFasteners(): void {
    super.mountTraitFasteners();
    this.mountSliceFasteners();
  }

  /** @hidden */
  protected override unmountTraitFasteners(): void {
    this.unmountSliceFasteners();
    super.unmountTraitFasteners();
  }

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.startConsumingSlices();
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    this.stopConsumingSlices();
  }
}
