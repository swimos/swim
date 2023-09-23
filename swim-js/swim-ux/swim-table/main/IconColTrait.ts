// Copyright 2015-2023 Nstream, inc.
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
import {Graphics} from "@swim/graphics";
import type {ColTraitObserver} from "./ColTrait";
import {ColTrait} from "./ColTrait";
import type {ColController} from "./ColController";
import {IconColController} from "./"; // forward import

/** @public */
export interface IconColTraitObserver<T extends IconColTrait = IconColTrait> extends ColTraitObserver<T> {
  traitDidSetIcon?(icon: Graphics | null, trait: T): void;
}

/** @public */
export class IconColTrait extends ColTrait {
  declare readonly observerType?: Class<IconColTraitObserver>;

  @Property({
    valueType: Graphics,
    value: null,
    didSetValue(icon: Graphics | null): void {
      this.owner.callObservers("traitDidSetIcon", icon, this.owner);
    },
  })
  readonly icon!: Property<this, Graphics | null>;

  override createColController(): ColController {
    return new IconColController();
  }
}
