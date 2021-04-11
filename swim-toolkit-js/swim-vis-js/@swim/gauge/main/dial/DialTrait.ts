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

import {TraitProperty, GenericTrait} from "@swim/model";
import type {GraphicsView} from "@swim/graphics";
import type {DialTraitObserver} from "./DialTraitObserver";

export type DialLabel = DialLabelFunction | string;
export type DialLabelFunction = (dialTrait: DialTrait) => GraphicsView | string | null;

export type DialLegend = DialLegendFunction | string;
export type DialLegendFunction = (dialTrait: DialTrait) => GraphicsView | string | null;

export class DialTrait extends GenericTrait {
  declare readonly traitObservers: ReadonlyArray<DialTraitObserver>;

  protected willSetValue(newValue: number, oldValue: number): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetDialValue !== void 0) {
        traitObserver.traitWillSetDialValue(newValue, oldValue, this);
      }
    }
  }

  protected onSetValue(newValue: number, oldValue: number): void {
    // hook
  }

  protected didSetValue(newValue: number, oldValue: number): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetDialValue !== void 0) {
        traitObserver.traitDidSetDialValue(newValue, oldValue, this);
      }
    }
  }

  @TraitProperty<DialTrait, number>({
    type: Number,
    state: 0,
    willSetState(newValue: number, oldValue: number): void {
      this.owner.willSetValue(newValue, oldValue);
    },
    didSetState(newValue: number, oldValue: number): void {
      this.owner.onSetValue(newValue, oldValue);
      this.owner.didSetValue(newValue, oldValue);
    },
  })
  declare value: TraitProperty<this, number>;

  protected willSetLimit(newLimit: number, oldLimit: number): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetDialLimit !== void 0) {
        traitObserver.traitWillSetDialLimit(newLimit, oldLimit, this);
      }
    }
  }

  protected onSetLimit(newLimit: number, oldLimit: number): void {
    // hook
  }

  protected didSetLimit(newLimit: number, oldLimit: number): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetDialLimit !== void 0) {
        traitObserver.traitDidSetDialLimit(newLimit, oldLimit, this);
      }
    }
  }

  @TraitProperty<DialTrait, number>({
    type: Number,
    state: 1,
    willSetState(newLimit: number, oldLimit: number): void {
      this.owner.willSetLimit(newLimit, oldLimit);
    },
    didSetState(newLimit: number, oldLimit: number): void {
      this.owner.onSetLimit(newLimit, oldLimit);
      this.owner.didSetLimit(newLimit, oldLimit);
    },
  })
  declare limit: TraitProperty<this, number>;

  protected willSetLabel(newLabel: DialLabel | null, oldLabel: DialLabel | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetDialLabel !== void 0) {
        traitObserver.traitWillSetDialLabel(newLabel, oldLabel, this);
      }
    }
  }

  protected onSetLabel(newLabel: DialLabel | null, oldLabel: DialLabel | null): void {
    // hook
  }

  protected didSetLabel(newLabel: DialLabel | null, oldLabel: DialLabel | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetDialLabel !== void 0) {
        traitObserver.traitDidSetDialLabel(newLabel, oldLabel, this);
      }
    }
  }

  formatLabel(value: number, limit: number): string | undefined {
    return void 0;
  }

  @TraitProperty<DialTrait, DialLabel | null>({
    state: null,
    willSetState(newLabel: DialLabel | null, oldLabel: DialLabel | null): void {
      this.owner.willSetLabel(newLabel, oldLabel);
    },
    didSetState(newLabel: DialLabel | null, oldLabel: DialLabel | null): void {
      this.owner.onSetLabel(newLabel, oldLabel);
      this.owner.didSetLabel(newLabel, oldLabel);
    },
  })
  declare label: TraitProperty<this, DialLabel | null>;

  protected willSetLegend(newLegend: DialLegend | null, oldLegend: DialLegend | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetDialLegend !== void 0) {
        traitObserver.traitWillSetDialLegend(newLegend, oldLegend, this);
      }
    }
  }

  protected onSetLegend(newLegend: DialLegend | null, oldLegend: DialLegend | null): void {
    // hook
  }

  protected didSetLegend(newLegend: DialLegend | null, oldLegend: DialLegend | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetDialLegend !== void 0) {
        traitObserver.traitDidSetDialLegend(newLegend, oldLegend, this);
      }
    }
  }

  formatLegend(value: number, limit: number): string | undefined {
    return void 0;
  }

  @TraitProperty<DialTrait, DialLegend | null>({
    state: null,
    willSetState(newLegend: DialLegend | null, oldLegend: DialLegend | null): void {
      this.owner.willSetLegend(newLegend, oldLegend);
    },
    didSetState(newLegend: DialLegend | null, oldLegend: DialLegend | null): void {
      this.owner.onSetLegend(newLegend, oldLegend);
      this.owner.didSetLegend(newLegend, oldLegend);
    },
  })
  declare legend: TraitProperty<this, DialLegend | null>;
}
