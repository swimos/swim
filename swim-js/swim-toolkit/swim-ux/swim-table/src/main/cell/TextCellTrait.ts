// Copyright 2015-2022 Swim.inc
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
import {Property} from "@swim/component";
import {CellTrait} from "./CellTrait";
import type {TextCellTraitObserver} from "./TextCellTraitObserver";
import type {CellController} from "./CellController";
import {TextCellController} from "./"; // forward import

/** @public */
export class TextCellTrait extends CellTrait {
  override readonly observerType?: Class<TextCellTraitObserver>;

  @Property<TextCellTrait["content"]>({
    valueType: String,
    didSetValue(content: string | undefined): void {
      this.owner.callObservers("traitDidSetContent", content, this.owner);
    },
  })
  readonly content!: Property<this, string | undefined>;

  override createCellController(): CellController {
    return new TextCellController();
  }
}
