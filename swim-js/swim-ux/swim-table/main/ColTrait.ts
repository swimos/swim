// Copyright 2015-2024 Nstream, inc.
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
import type {TraitObserver} from "@swim/model";
import {Trait} from "@swim/model";
import {ColLayout} from "./ColLayout";
import {ColController} from "./"; // forward import

/** @public */
export interface ColTraitObserver<T extends ColTrait = ColTrait> extends TraitObserver<T> {
  traitDidSetLayout?(layout: ColLayout | null, trait: T): void;
}

/** @public */
export class ColTrait extends Trait {
  declare readonly observerType?: Class<ColTraitObserver>;

  @Property({
    valueType: ColLayout,
    value: null,
    didSetValue(layout: ColLayout | null): void {
      this.owner.callObservers("traitDidSetLayout", layout, this.owner);
    },
  })
  readonly layout!: Property<this, ColLayout | null>;

  createColController(): ColController {
    return new ColController();
  }
}
