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
import type {PositionGestureInput} from "@swim/view";
import type {HtmlViewObserver} from "@swim/dom";
import {HtmlView} from "@swim/dom";

/** @public */
export interface ColViewObserver<V extends ColView = ColView> extends HtmlViewObserver<V> {
  viewDidPress?(input: PositionGestureInput, event: Event | null, view: V): void;

  viewDidLongPress?(input: PositionGestureInput, view: V): void;
}

/** @public */
export class ColView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initCol();
  }

  protected initCol(): void {
    this.setIntrinsic<ColView>({
      classList: ["col"],
      style: {
        overflow: "hidden",
      },
    });
  }

  declare readonly observerType?: Class<ColViewObserver>;

  didPress(input: PositionGestureInput, event: Event | null): void {
    this.callObservers("viewDidPress", input, event, this);
  }

  didLongPress(input: PositionGestureInput): void {
    this.callObservers("viewDidLongPress", input, this);
  }
}
