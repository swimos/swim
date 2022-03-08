// Copyright 2015-2021 Swim.inc
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
import type {HtmlView} from "@swim/dom";
import {ToolTrait} from "./ToolTrait";
import type {TitleToolTraitObserver} from "./TitleToolTraitObserver";

/** @public */
export type TitleToolContent = TitleToolContentFunction | string;
/** @public */
export type TitleToolContentFunction = (toolTrait: TitleToolTrait) => HtmlView | string | null;

/** @public */
export class TitleToolTrait extends ToolTrait {
  override readonly observerType?: Class<TitleToolTraitObserver>;

  @Property<TitleToolTrait, TitleToolContent | null>({
    value: null,
    willSetValue(newContent: TitleToolContent | null, oldContent: TitleToolContent | null): void {
      this.owner.callObservers("traitWillSetContent", newContent, oldContent, this.owner);
    },
    didSetValue(newContent: TitleToolContent | null, oldContent: TitleToolContent | null): void {
      this.owner.callObservers("traitDidSetContent", newContent, oldContent, this.owner);
    },
  })
  readonly content!: Property<this, TitleToolContent | null>;
}
