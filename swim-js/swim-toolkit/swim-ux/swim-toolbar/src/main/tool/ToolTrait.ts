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
import {Trait} from "@swim/model";
import {AnyToolLayout, ToolLayout} from "../layout/ToolLayout";
import type {ToolTraitObserver} from "./ToolTraitObserver";

/** @public */
export class ToolTrait extends Trait {
  override readonly observerType?: Class<ToolTraitObserver>;

  @Property<ToolTrait, ToolLayout | null, AnyToolLayout | null>({
    type: ToolLayout,
    value: null,
    willSetValue(newLayout: ToolLayout | null, oldLayout: ToolLayout | null): void {
      this.owner.callObservers("traitWillSetLayout", newLayout, oldLayout, this.owner);
    },
    didSetValue(newLayout: ToolLayout | null, oldLayout: ToolLayout | null): void {
      this.owner.callObservers("traitDidSetLayout", newLayout, oldLayout, this.owner);
    },
  })
  readonly layout!: Property<this, ToolLayout | null, AnyToolLayout | null>;
}
