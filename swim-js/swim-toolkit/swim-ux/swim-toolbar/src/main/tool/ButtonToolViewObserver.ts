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

import type {PositionGestureInput} from "@swim/view";
import type {Graphics} from "@swim/graphics";
import type {ToolViewObserver} from "./ToolViewObserver";
import type {ButtonToolView} from "./ButtonToolView";

/** @public */
export interface ButtonToolViewObserver<V extends ButtonToolView = ButtonToolView> extends ToolViewObserver<V> {
  viewWillSetGraphics?(newGraphics: Graphics | null, oldGraphics: Graphics | null, view: V): void;

  viewDidSetGraphics?(newGraphics: Graphics | null, oldGraphics: Graphics | null, view: V): void;

  viewDidPress?(input: PositionGestureInput, event: Event | null, view: V): void;

  viewDidLongPress?(input: PositionGestureInput, view: V): void;
}
