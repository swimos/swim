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

import {View, PositionGestureInput} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {CellViewObserver} from "./CellViewObserver";

export class CellView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initCell();
  }

  protected initCell(): void {
    this.addClass("cell");
    this.overflowX.setState("hidden", View.Intrinsic);
    this.overflowY.setState("hidden", View.Intrinsic);
  }

  override readonly viewObservers!: ReadonlyArray<CellViewObserver>;

  didPress(input: PositionGestureInput, event: Event | null): void {
    if (!input.defaultPrevented) {
      const viewObservers = this.viewObservers;
      for (let i = 0, n = viewObservers.length; i < n; i += 1) {
        const viewObserver = viewObservers[i]!;
        if (viewObserver.viewDidPress !== void 0) {
          viewObserver.viewDidPress(input, event, this);
        }
      }
    }
  }

  didLongPress(input: PositionGestureInput): void {
    if (!input.defaultPrevented) {
      const viewObservers = this.viewObservers;
      for (let i = 0, n = viewObservers.length; i < n; i += 1) {
        const viewObserver = viewObservers[i]!;
        if (viewObserver.viewDidLongPress !== void 0) {
          viewObserver.viewDidLongPress(input, this);
        }
      }
    }
  }
}
