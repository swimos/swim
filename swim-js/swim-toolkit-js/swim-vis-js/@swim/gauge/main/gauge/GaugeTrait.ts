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
import {DialTrait} from "../dial/DialTrait";
import type {GaugeTraitObserver} from "./GaugeTraitObserver";

export type GaugeTitle = GaugeTitleFunction | string;
export type GaugeTitleFunction = (gaugeTrait: GaugeTrait) => GraphicsView | string | null;

export class GaugeTrait extends Trait {
  constructor() {
    super();
    this.dialFasteners = [];
  }

  override readonly observerType?: Class<GaugeTraitObserver>;

  protected willSetTitle(newTitle: GaugeTitle | null, oldTitle: GaugeTitle | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitWillSetGaugeTitle !== void 0) {
        traitObserver.traitWillSetGaugeTitle(newTitle, oldTitle, this);
      }
    }
  }

  protected onSetTitle(newTitle: GaugeTitle | null, oldTitle: GaugeTitle | null): void {
    // hook
  }

  protected didSetTitle(newTitle: GaugeTitle | null, oldTitle: GaugeTitle | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetGaugeTitle !== void 0) {
        traitObserver.traitDidSetGaugeTitle(newTitle, oldTitle, this);
      }
    }
  }

  @Property<GaugeTrait, GaugeTitle | null>({
    state: null,
    willSetState(newTitle: GaugeTitle | null, oldTitle: GaugeTitle | null): void {
      this.owner.willSetTitle(newTitle, oldTitle);
    },
    didSetState(newTitle: GaugeTitle | null, oldTitle: GaugeTitle | null): void {
      this.owner.onSetTitle(newTitle, oldTitle);
      this.owner.didSetTitle(newTitle, oldTitle);
    },
  })
  readonly title!: Property<this, GaugeTitle | null>;

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
    if (this.mounted) {
      dialFastener.mount();
    }
  }

  removeDial(dialTrait: DialTrait): void {
    const dialFasteners = this.dialFasteners as TraitFastener<this, DialTrait>[];
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialFastener = dialFasteners[i]!;
      if (dialFastener.trait === dialTrait) {
        dialFastener.setTrait(null);
        if (this.mounted) {
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
    if (this.consuming) {
      dialTrait.consume(this);
    }
  }

  protected detachDial(dialTrait: DialTrait, dialFastener: TraitFastener<this, DialTrait>): void {
    if (this.consuming) {
      dialTrait.unconsume(this);
    }
  }

  protected willSetDial(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null,
                        targetTrait: Trait | null, dialFastener: TraitFastener<this, DialTrait>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetDial !== void 0) {
        traitObserver.traitDidSetDial(newDialTrait, oldDialTrait, targetTrait, this);
      }
    }
  }

  /** @internal */
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
    return GaugeTrait.DialFastener.create(this, dialTrait.key ?? "dial");
  }

  /** @internal */
  readonly dialFasteners: ReadonlyArray<TraitFastener<this, DialTrait>>;

  /** @internal */
  protected mountDialFasteners(): void {
    const dialFasteners = this.dialFasteners;
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialFastener = dialFasteners[i]!;
      dialFastener.mount();
    }
  }

  /** @internal */
  protected unmountDialFasteners(): void {
    const dialFasteners = this.dialFasteners;
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialFastener = dialFasteners[i]!;
      dialFastener.unmount();
    }
  }

  /** @internal */
  protected startConsumingDials(): void {
    const dialFasteners = this.dialFasteners;
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialTrait = dialFasteners[i]!.trait;
      if (dialTrait !== null) {
        dialTrait.consume(this);
      }
    }
  }

  /** @internal */
  protected stopConsumingDials(): void {
    const dialFasteners = this.dialFasteners;
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialTrait = dialFasteners[i]!.trait;
      if (dialTrait !== null) {
        dialTrait.unconsume(this);
      }
    }
  }

  protected detectDialModel(model: Model): DialTrait | null {
    return model.getTrait(DialTrait);
  }

  protected detectModels(model: TraitModelType<this>): void {
    const children = model.children;
    for (let i = 0, n = children.length; i < n; i += 1) {
      const child = children[i]!;
      const dialTrait = this.detectDialModel(child);
      if (dialTrait !== null) {
        this.insertDial(dialTrait);
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
    const dialTrait = this.detectDialModel(child);
    if (dialTrait !== null) {
      const targetTrait = target !== null ? this.detectDialModel(target) : null;
      this.insertDial(dialTrait, targetTrait);
    }
  }

  /** @protected */
  override onRemoveChild(child: Model): void {
    super.onRemoveChild(child);
    const dialTrait = this.detectDialModel(child);
    if (dialTrait !== null) {
      this.removeDial(dialTrait);
    }
  }

  /** @internal */
  protected override mountFasteners(): void {
    super.mountFasteners();
    this.mountDialFasteners();
  }

  /** @internal */
  protected override unmountFasteners(): void {
    this.unmountDialFasteners();
    super.unmountFasteners();
  }

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.startConsumingDials();
  }

  protected override onStopConsuming(): void {
    super.onStopConsuming();
    this.stopConsumingDials();
  }
}
