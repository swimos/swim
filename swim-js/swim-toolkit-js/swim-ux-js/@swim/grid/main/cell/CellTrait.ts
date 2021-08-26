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
import type {CellTraitObserver} from "./CellTraitObserver";

export type CellContent = CellContentFunction | string;
export type CellContentFunction = (cellTrait: CellTrait) => HtmlView | string | null;

export class CellTrait extends GenericTrait {
  override readonly traitObservers!: ReadonlyArray<CellTraitObserver>;

  protected willSetContent(newContent: CellContent | null, oldContent: CellContent | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetCellContent !== void 0) {
        traitObserver.traitWillSetCellContent(newContent, oldContent, this);
      }
    }
  }

  protected onSetContent(newContent: CellContent | null, oldContent: CellContent | null): void {
    // hook
  }

  protected didSetContent(newContent: CellContent | null, oldContent: CellContent | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetCellContent !== void 0) {
        traitObserver.traitDidSetCellContent(newContent, oldContent, this);
      }
    }
  }

  @TraitProperty<CellTrait, CellContent | null>({
    state: null,
    willSetState(newContent: CellContent | null, oldContent: CellContent | null): void {
      this.owner.willSetContent(newContent, oldContent);
    },
    didSetState(newContent: CellContent | null, oldContent: CellContent | null): void {
      this.owner.onSetContent(newContent, oldContent);
      this.owner.didSetContent(newContent, oldContent);
    },
  })
  readonly content!: TraitProperty<this, CellContent | null>;
}
