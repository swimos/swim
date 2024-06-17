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
import {Hyperlink} from "@swim/controller";
import {CellController} from "./"; // forward import

/** @public */
export interface CellTraitObserver<T extends CellTrait = CellTrait> extends TraitObserver<T> {
}

/** @public */
export class CellTrait extends Trait {
  declare readonly observerType?: Class<CellTraitObserver>;

  @Property({valueType: Hyperlink, value: null})
  get hyperlink(): Property<this, Hyperlink | null> {
    return Property.getter();
  }

  createCellController(): CellController {
    return new CellController();
  }
}
