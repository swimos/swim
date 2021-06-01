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

import {TraitProperty, GenericTrait} from "@swim/model";
import type {HtmlView} from "@swim/dom";
import {AnyColLayout, ColLayout} from "../layout/ColLayout";
import type {ColTraitObserver} from "./ColTraitObserver";

export type ColHeader = ColHeaderFunction | string;
export type ColHeaderFunction = (colTrait: ColTrait) => HtmlView | string | null;

export class ColTrait extends GenericTrait {
  override readonly traitObservers!: ReadonlyArray<ColTraitObserver>;

  protected willSetLayout(newLayout: ColLayout | null, oldHeader: ColLayout | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetColLayout !== void 0) {
        traitObserver.traitWillSetColLayout(newLayout, oldHeader, this);
      }
    }
  }

  protected onSetLayout(newLayout: ColLayout | null, oldHeader: ColLayout | null): void {
    // hook
  }

  protected didSetLayout(newLayout: ColLayout | null, oldHeader: ColLayout | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetColLayout !== void 0) {
        traitObserver.traitDidSetColLayout(newLayout, oldHeader, this);
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

  protected willSetHeader(newHeader: ColHeader | null, oldHeader: ColHeader | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetColHeader !== void 0) {
        traitObserver.traitWillSetColHeader(newHeader, oldHeader, this);
      }
    }
  }

  protected onSetHeader(newHeader: ColHeader | null, oldHeader: ColHeader | null): void {
    // hook
  }

  protected didSetHeader(newHeader: ColHeader | null, oldHeader: ColHeader | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetColHeader !== void 0) {
        traitObserver.traitDidSetColHeader(newHeader, oldHeader, this);
      }
    }
  }

  @TraitProperty<ColTrait, ColHeader | null>({
    state: null,
    willSetState(newHeader: ColHeader | null, oldHeader: ColHeader | null): void {
      this.owner.willSetHeader(newHeader, oldHeader);
    },
    didSetState(newHeader: ColHeader | null, oldHeader: ColHeader | null): void {
      this.owner.onSetHeader(newHeader, oldHeader);
      this.owner.didSetHeader(newHeader, oldHeader);
    },
  })
  readonly header!: TraitProperty<this, ColHeader | null>;
}
