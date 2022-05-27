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
import {Animator} from "@swim/component";
import {ConstraintProperty} from "@swim/constraint";
import {AnyLength, Length} from "@swim/math";
import {View} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {ToolViewObserver} from "./ToolViewObserver";

/** @public */
export class ToolView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initTool();
  }

  protected initTool(): void {
    this.addClass("tool");
  }

  override readonly observerType?: Class<ToolViewObserver>;

  @Animator({valueType: Number, value: 0.5, updateFlags: View.NeedsLayout})
  readonly xAlign!: Animator<this, number>;

  @ConstraintProperty({valueType: Length, value: null})
  readonly effectiveWidth!: ConstraintProperty<this, Length | null, AnyLength | null>;
}
