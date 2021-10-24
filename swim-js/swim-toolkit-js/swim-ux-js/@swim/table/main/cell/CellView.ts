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

import type {Class} from "@swim/util";
import {Affinity} from "@swim/fastener";
import type {PositionGestureInput} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {CellViewObserver} from "./CellViewObserver";

export class CellView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initCell();
  }

  protected initCell(): void {
    this.addClass("cell");
    this.overflowX.setState("hidden", Affinity.Intrinsic);
    this.overflowY.setState("hidden", Affinity.Intrinsic);
  }

  override readonly observerType?: Class<CellViewObserver>;

  onPress(input: PositionGestureInput, event: Event | null): void {
    // hook
  }

  didPress(input: PositionGestureInput, event: Event | null): void {
    this.callObservers("viewDidPress", input, event, this);
  }

  onLongPress(input: PositionGestureInput): void {
    // hook
  }

  didLongPress(input: PositionGestureInput): void {
    this.callObservers("viewDidLongPress", input, this);
  }
}
