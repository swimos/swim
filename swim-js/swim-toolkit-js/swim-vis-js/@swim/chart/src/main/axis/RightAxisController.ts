// Copyright 2015-2021 Swim Inc.
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

import type {MemberFastenerClass} from "@swim/fastener";
import {TraitViewRef} from "@swim/controller";
import {RightAxisTrait} from "./RightAxisTrait";
import {RightAxisView} from "./RightAxisView";
import {AxisController} from "./AxisController";

/** @public */
export class RightAxisController<Y = unknown> extends AxisController<Y> {
  @TraitViewRef<RightAxisController<Y>, RightAxisTrait<Y>, RightAxisView<Y>>({
    extends: true,
    traitType: RightAxisTrait,
    viewType: RightAxisView,
  })
  override readonly axis!: TraitViewRef<this, RightAxisTrait<Y>, RightAxisView<Y>>;
  static override readonly axis: MemberFastenerClass<RightAxisController, "axis">;
}
