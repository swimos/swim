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

import {Model, TraitModelType, Trait, TraitProperty, TraitFastener, GenericTrait} from "@swim/model";
import type {GraphicsView} from "@swim/graphics";
import {DialTrait} from "../dial/DialTrait";
import type {GaugeTraitObserver} from "./GaugeTraitObserver";

export type GaugeTitle = GaugeTitleFunction | string;
export type GaugeTitleFunction = (gaugeTrait: GaugeTrait) => GraphicsView | string | null;

export class GaugeTrait extends GenericTrait {
  constructor() {
    super();
    Object.defineProperty(this, "dialFasteners", {
      value: [],
      enumerable: true,
    });
  }

  declare readonly traitObservers: ReadonlyArray<GaugeTraitObserver>;

  protected willSetTitle(newTitle: GaugeTitle | null, oldTitle: GaugeTitle | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetGaugeTitle !== void 0) {
        traitObserver.traitWillSetGaugeTitle(newTitle, oldTitle, this);
      }
    }
  }

  protected onSetTitle(newTitle: GaugeTitle | null, oldTitle: GaugeTitle | null): void {
    // hook
  }

  protected didSetTitle(newTitle: GaugeTitle | null, oldTitle: GaugeTitle | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetGaugeTitle !== void 0) {
        traitObserver.traitDidSetGaugeTitle(newTitle, oldTitle, this);
      }
    }
  }

  @TraitProperty<GaugeTrait, GaugeTitle | null>({
    state: null,
    willSetState(newTitle: GaugeTitle | null, oldTitle: GaugeTitle | null): void {
      this.owner.willSetTitle(newTitle, oldTitle);
    },
    didSetState(newTitle: GaugeTitle | null, oldTitle: GaugeTitle | null): void {
      this.owner.onSetTitle(newTitle, oldTitle);
      this.owner.didSetTitle(newTitle, oldTitle);
    },
  })
  declare title: TraitProperty<this, GaugeTitle | null>;

  insertDial(dialTrait: DialTrait, targetTrait: Trait | null = null): void {
    const dialFasteners = this.dialFasteners as TraitFastener<this, DialTrait>[];
    let targetIndex = dialFasteners.length;
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialFastener = dialFasteners[i]!;
      if (dialFastener.trait === dialTrait) {
        return;
      } else if (dialFastener.trait === targetTrait) {
        targetIndex = i;
      }
    }
    const dialFastener = this.createDialFastener(dialTrait);
    dialFasteners.splice(targetIndex, 0, dialFastener);
    dialFastener.setTrait(dialTrait, targetTrait);
    if (this.isMounted()) {
      dialFastener.mount();
    }
  }

  removeDial(dialTrait: DialTrait): void {
    const dialFasteners = this.dialFasteners as TraitFastener<this, DialTrait>[];
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialFastener = dialFasteners[i]!;
      if (dialFastener.trait === dialTrait) {
        dialFastener.setTrait(null);
        if (this.isMounted()) {
          dialFastener.unmount();
        }
        dialFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected initDial(dialTrait: DialTrait, dialFastener: TraitFastener<this, DialTrait>): void {
    // hook
  }

  protected attachDial(dialTrait: DialTrait, dialFastener: TraitFastener<this, DialTrait>): void {
    if (this.isConsuming()) {
      dialTrait.addTraitConsumer(this);
    }
  }

  protected detachDial(dialTrait: DialTrait, dialFastener: TraitFastener<this, DialTrait>): void {
    if (this.isConsuming()) {
      dialTrait.removeTraitConsumer(this);
    }
  }

  protected willSetDial(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null,
                        targetTrait: Trait | null, dialFastener: TraitFastener<this, DialTrait>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetDial !== void 0) {
        traitObserver.traitWillSetDial(newDialTrait, oldDialTrait, targetTrait, this);
      }
    }
  }

  protected onSetDial(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null,
                      targetTrait: Trait | null, dialFastener: TraitFastener<this, DialTrait>): void {
    if (oldDialTrait !== null) {
      this.detachDial(oldDialTrait, dialFastener);
    }
    if (newDialTrait !== null) {
      this.attachDial(newDialTrait, dialFastener);
      this.initDial(newDialTrait, dialFastener);
    }
  }

  protected didSetDial(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null,
                       targetTrait: Trait | null, dialFastener: TraitFastener<this, DialTrait>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetDial !== void 0) {
        traitObserver.traitDidSetDial(newDialTrait, oldDialTrait, targetTrait, this);
      }
    }
  }

  /** @hidden */
  static DialFastener = TraitFastener.define<GaugeTrait, DialTrait>({
    type: DialTrait,
    sibling: false,
    willSetTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null, targetTrait: Trait | null): void {
      this.owner.willSetDial(newDialTrait, oldDialTrait, targetTrait, this);
    },
    onSetTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null, targetTrait: Trait | null): void {
      this.owner.onSetDial(newDialTrait, oldDialTrait, targetTrait, this);
    },
    didSetTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null, targetTrait: Trait | null): void {
      this.owner.didSetDial(newDialTrait, oldDialTrait, targetTrait, this);
    },
  });

  protected createDialFastener(dialTrait: DialTrait): TraitFastener<this, DialTrait> {
    return new GaugeTrait.DialFastener(this, dialTrait.key, "dial");
  }

  /** @hidden */
  declare readonly dialFasteners: ReadonlyArray<TraitFastener<this, DialTrait>>;

  /** @hidden */
  protected mountDialFasteners(): void {
    const dialFasteners = this.dialFasteners;
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialFastener = dialFasteners[i]!;
      dialFastener.mount();
    }
  }

  /** @hidden */
  protected unmountDialFasteners(): void {
    const dialFasteners = this.dialFasteners;
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialFastener = dialFasteners[i]!;
      dialFastener.unmount();
    }
  }

  /** @hidden */
  protected startConsumingDials(): void {
    const dialFasteners = this.dialFasteners;
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialTrait = dialFasteners[i]!.trait;
      if (dialTrait !== null) {
        dialTrait.addTraitConsumer(this);
      }
    }
  }

  /** @hidden */
  protected stopConsumingDials(): void {
    const dialFasteners = this.dialFasteners;
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialTrait = dialFasteners[i]!.trait;
      if (dialTrait !== null) {
        dialTrait.removeTraitConsumer(this);
      }
    }
  }

  protected detectDialModel(model: Model): DialTrait | null {
    return model.getTrait(DialTrait);
  }

  protected detectModels(model: TraitModelType<this>): void {
    const childModels = model.childModels;
    for (let i = 0, n = childModels.length; i < n; i += 1) {
      const childModel = childModels[i]!;
      const dialTrait = this.detectDialModel(childModel);
      if (dialTrait !== null) {
        this.insertDial(dialTrait);
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
    const dialTrait = this.detectDialModel(childModel);
    if (dialTrait !== null) {
      const targetTrait = targetModel !== null ? this.detectDialModel(targetModel) : null;
      this.insertDial(dialTrait, targetTrait);
    }
  }

  protected onRemoveChildModel(childModel: Model): void {
    super.onRemoveChildModel(childModel);
    const dialTrait = this.detectDialModel(childModel);
    if (dialTrait !== null) {
      this.removeDial(dialTrait);
    }
  }

  /** @hidden */
  protected mountTraitFasteners(): void {
    super.mountTraitFasteners();
    this.mountDialFasteners();
  }

  /** @hidden */
  protected unmountTraitFasteners(): void {
    this.unmountDialFasteners();
    super.unmountTraitFasteners();
  }

  protected onStartConsuming(): void {
    super.onStartConsuming();
    this.startConsumingDials();
  }

  protected onStopConsuming(): void {
    super.onStopConsuming();
    this.stopConsumingDials();
  }
}
