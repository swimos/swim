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
import type {ColTraitObserver} from "./ColTrait";
import {ColTrait} from "./ColTrait";
import type {ColController} from "./ColController";
import {TextColController} from "./"; // forward import

/** @public */
export interface TextColTraitObserver<T extends TextColTrait = TextColTrait> extends ColTraitObserver<T> {
  traitDidSetLabel?(label: string | undefined, trait: T): void;
}

/** @public */
export class TextColTrait extends ColTrait {
  declare readonly observerType?: Class<TextColTraitObserver>;

  @Property({
    valueType: String,
    didSetValue(label: string | undefined): void {
      this.owner.callObservers("traitDidSetLabel", label, this.owner);
    },
  })
  readonly label!: Property<this, string | undefined>;

  override createColController(): ColController {
    return new TextColController();
  }
}
