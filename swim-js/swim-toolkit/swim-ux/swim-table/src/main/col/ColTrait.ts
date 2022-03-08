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
import {Trait} from "@swim/model";
import type {HtmlView} from "@swim/dom";
import {AnyColLayout, ColLayout} from "../layout/ColLayout";
import type {ColTraitObserver} from "./ColTraitObserver";

/** @public */
export type ColLabel = ColLabelFunction | string;
/** @public */
export type ColLabelFunction = (colTrait: ColTrait) => HtmlView | string | null;

/** @public */
export class ColTrait extends Trait {
  override readonly observerType?: Class<ColTraitObserver>;

  @Property<ColTrait, ColLayout | null, AnyColLayout | null>({
    type: ColLayout,
    value: null,
    willSetValue(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
      this.owner.callObservers("traitWillSetLayout", newLayout, oldLayout, this.owner);
    },
    didSetValue(newLayout: ColLayout | null, oldLayout: ColLayout | null): void {
      this.owner.callObservers("traitDidSetLayout", newLayout, oldLayout, this.owner);
    },
  })
  readonly layout!: Property<this, ColLayout | null, AnyColLayout | null>;

  @Property<ColTrait, ColLabel | null>({
    value: null,
    willSetValue(newLabel: ColLabel | null, oldLabel: ColLabel | null): void {
      this.owner.callObservers("traitWillSetLabel", newLabel, oldLabel, this.owner);
    },
    didSetValue(newLabel: ColLabel | null, oldLabel: ColLabel | null): void {
      this.owner.callObservers("traitDidSetLabel", newLabel, oldLabel, this.owner);
    },
  })
  readonly label!: Property<this, ColLabel | null>;
}
