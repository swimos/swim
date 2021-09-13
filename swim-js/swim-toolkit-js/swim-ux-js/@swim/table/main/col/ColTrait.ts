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

import {TraitProperty, GenericTrait} from "@swim/model";
import type {HtmlView} from "@swim/dom";
import {AnyColLayout, ColLayout} from "../layout/ColLayout";
import type {ColTraitObserver} from "./ColTraitObserver";

export type ColLabel = ColLabelFunction | string;
export type ColLabelFunction = (colTrait: ColTrait) => HtmlView | string | null;

export class ColTrait extends GenericTrait {
  override readonly traitObservers!: ReadonlyArray<ColTraitObserver>;

  protected willSetLayout(newLayout: ColLayout | null, oldLabel: ColLayout | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetLayout !== void 0) {
        traitObserver.traitWillSetLayout(newLayout, oldLabel, this);
      }
    }
  }

  protected onSetLayout(newLayout: ColLayout | null, oldLabel: ColLayout | null): void {
    // hook
  }

  protected didSetLayout(newLayout: ColLayout | null, oldLabel: ColLayout | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetLayout !== void 0) {
        traitObserver.traitDidSetLayout(newLayout, oldLabel, this);
      }
    }
  }

  @TraitProperty<ColTrait, ColLayout | null, AnyColLayout | null>({
    type: ColLayout,
    state: null,
    willSetState(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
      this.owner.willSetLayout(newLayout, oldLayout);
    },
    didSetState(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
      this.owner.onSetLayout(newLayout, oldLayout);
      this.owner.didSetLayout(newLayout, oldLayout);
    },
  })
  readonly layout!: TraitProperty<this, ColLayout | null, AnyColLayout | null>;

  protected willSetLabel(newLabel: ColLabel | null, oldLabel: ColLabel | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetLabel !== void 0) {
        traitObserver.traitWillSetLabel(newLabel, oldLabel, this);
      }
    }
  }

  protected onSetLabel(newLabel: ColLabel | null, oldLabel: ColLabel | null): void {
    // hook
  }

  protected didSetLabel(newLabel: ColLabel | null, oldLabel: ColLabel | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetLabel !== void 0) {
        traitObserver.traitDidSetLabel(newLabel, oldLabel, this);
      }
    }
  }

  @TraitProperty<ColTrait, ColLabel | null>({
    state: null,
    willSetState(newLabel: ColLabel | null, oldLabel: ColLabel | null): void {
      this.owner.willSetLabel(newLabel, oldLabel);
    },
    didSetState(newLabel: ColLabel | null, oldLabel: ColLabel | null): void {
      this.owner.onSetLabel(newLabel, oldLabel);
      this.owner.didSetLabel(newLabel, oldLabel);
    },
  })
  readonly label!: TraitProperty<this, ColLabel | null>;
}
