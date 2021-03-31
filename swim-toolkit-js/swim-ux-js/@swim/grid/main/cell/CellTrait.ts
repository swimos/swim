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
import {GenericTrait} from "@swim/model";
import type {HtmlView} from "@swim/dom";
import type {CellTraitObserver} from "./CellTraitObserver";

export type CellContent = CellContentFunction | string;
export type CellContentFunction = (cellTrait: CellTrait) => HtmlView | string | null;

export class CellTrait extends GenericTrait {
  constructor() {
    super();
    Object.defineProperty(this, "content", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly traitObservers: ReadonlyArray<CellTraitObserver>;

  declare readonly content: CellContent | null;

  setContent(newContent: CellContent | null): void {
    const oldContent = this.content;
    if (!Equals(newContent, oldContent)) {
      this.willSetContent(newContent, oldContent);
      Object.defineProperty(this, "content", {
        value: newContent,
        enumerable: true,
        configurable: true,
      });
      this.onSetContent(newContent, oldContent);
      this.didSetContent(newContent, oldContent);
    }
  }

  protected willSetContent(newContent: CellContent | null, oldContent: CellContent | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.cellTraitWillSetContent !== void 0) {
        traitObserver.cellTraitWillSetContent(newContent, oldContent, this);
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
      if (traitObserver.cellTraitDidSetContent !== void 0) {
        traitObserver.cellTraitDidSetContent(newContent, oldContent, this);
      }
    }
  }
}
