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
import {AnyColLayout, ColLayout} from "../layout/ColLayout";
import type {ColTraitObserver} from "./ColTraitObserver";
import {ColController} from "./"; // forward import

/** @public */
export class ColTrait extends Trait {
  override readonly observerType?: Class<ColTraitObserver>;

  @Property<ColTrait["layout"]>({
    valueType: ColLayout,
    value: null,
    didSetValue(layout: ColLayout | null): void {
      this.owner.callObservers("traitDidSetLayout", layout, this.owner);
    },
  })
  readonly layout!: Property<this, ColLayout | null, AnyColLayout | null>;

  createColController(): ColController {
    return new ColController();
  }
}
