// Copyright 2015-2021 Swim Inc.
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

import type {Class} from "@swim/util";
import {Property} from "@swim/fastener";
import {Model, TraitModelType, Trait, TraitFastener} from "@swim/model";
import type {GraphicsView} from "@swim/graphics";
import {SliceTrait} from "../slice/SliceTrait";
import type {PieTraitObserver} from "./PieTraitObserver";

export type PieTitle = PieTitleFunction | string;
export type PieTitleFunction = (pieTrait: PieTrait) => GraphicsView | string | null;

export class PieTrait extends Trait {
  constructor() {
    super();
    this.sliceFasteners = [];
  }

  override readonly observerType?: Class<PieTraitObserver>;

  protected willSetTitle(newTitle: PieTitle | null, oldTitle: PieTitle | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitWillSetPieTitle !== void 0) {
        traitObserver.traitWillSetPieTitle(newTitle, oldTitle, this);
      }
    }
  }

  protected onSetTitle(newTitle: PieTitle | null, oldTitle: PieTitle | null): void {
    // hook
  }

  protected didSetTitle(newTitle: PieTitle | null, oldTitle: PieTitle | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetPieTitle !== void 0) {
        traitObserver.traitDidSetPieTitle(newTitle, oldTitle, this);
      }
    }
  }

  @Property<PieTrait, PieTitle | null>({
    state: null,
    willSetState(newTitle: PieTitle | null, oldTitle: PieTitle | null): void {
      this.owner.willSetTitle(newTitle, oldTitle);
    },
    didSetState(newTitle: PieTitle | null, oldTitle: PieTitle | null): void {
      this.owner.onSetTitle(newTitle, oldTitle);
      this.owner.didSetTitle(newTitle, oldTitle);
    },
  })
  readonly title!: Property<this, PieTitle | null>;

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
    if (this.mounted) {
      sliceFastener.mount();
    }
  }

  removeSlice(sliceTrait: SliceTrait): void {
    const sliceFasteners = this.sliceFasteners as TraitFastener<this, SliceTrait>[];
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      if (sliceFastener.trait === sliceTrait) {
        sliceFastener.setTrait(null);
        if (this.mounted) {
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
    if (this.consuming) {
      sliceTrait.consume(this);
    }
  }

  protected detachSlice(sliceTrait: SliceTrait, sliceFastener: TraitFastener<this, SliceTrait>): void {
    if (this.consuming) {
      sliceTrait.unconsume(this);
    }
  }

  protected willSetSlice(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null,
                         targetTrait: Trait | null, sliceFastener: TraitFastener<this, SliceTrait>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetSlice !== void 0) {
        traitObserver.traitDidSetSlice(newSliceTrait, oldSliceTrait, targetTrait, this);
      }
    }
  }

  /** @internal */
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
    return PieTrait.SliceFastener.create(this, sliceTrait.key ?? "slice");
  }

  /** @internal */
  readonly sliceFasteners: ReadonlyArray<TraitFastener<this, SliceTrait>>;

  /** @internal */
  protected mountSliceFasteners(): void {
    const sliceFasteners = this.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      sliceFastener.mount();
    }
  }

  /** @internal */
  protected unmountSliceFasteners(): void {
    const sliceFasteners = this.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      sliceFastener.unmount();
    }
  }

  /** @internal */
  protected startConsumingSlices(): void {
    const sliceFasteners = this.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceTrait = sliceFasteners[i]!.trait;
      if (sliceTrait !== null) {
        sliceTrait.consume(this);
      }
    }
  }

  /** @internal */
  protected stopConsumingSlices(): void {
    const sliceFasteners = this.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceTrait = sliceFasteners[i]!.trait;
      if (sliceTrait !== null) {
        sliceTrait.unconsume(this);
      }
    }
  }

  protected detectSliceModel(model: Model): SliceTrait | null {
    return model.getTrait(SliceTrait);
  }

  protected detectModels(model: TraitModelType<this>): void {
    const children = model.children;
    for (let i = 0, n = children.length; i < n; i += 1) {
      const child = children[i]!;
      const sliceTrait = this.detectSliceModel(child);
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

  /** @protected */
  override onInsertChild(child: Model, target: Model | null): void {
    super.onInsertChild(child, target);
    const sliceTrait = this.detectSliceModel(child);
    if (sliceTrait !== null) {
      const targetTrait = target !== null ? this.detectSliceModel(target) : null;
      this.insertSlice(sliceTrait, targetTrait);
    }
  }

  /** @protected */
  override onRemoveChild(child: Model): void {
    super.onRemoveChild(child);
    const sliceTrait = this.detectSliceModel(child);
    if (sliceTrait !== null) {
      this.removeSlice(sliceTrait);
    }
  }

  /** @internal */
  protected override mountFasteners(): void {
    super.mountFasteners();
    this.mountSliceFasteners();
  }

  /** @internal */
  protected override unmountFasteners(): void {
    this.unmountSliceFasteners();
    super.unmountFasteners();
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
