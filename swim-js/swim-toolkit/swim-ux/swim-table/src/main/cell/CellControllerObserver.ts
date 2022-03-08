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
import type {ControllerObserver} from "@swim/controller";
import type {CellView} from "./CellView";
import type {CellTrait} from "./CellTrait";
import type {CellController} from "./CellController";

/** @public */
export interface CellControllerObserver<C extends CellController = CellController> extends ControllerObserver<C> {
  controllerWillAttachCellTrait?(cellTrait: CellTrait, controller: C): void;

  controllerDidDetachCellTrait?(cellTrait: CellTrait, controller: C): void;

  controllerWillAttachCellView?(cellView: CellView, controller: C): void;

  controllerDidDetachCellView?(cellView: CellView, controller: C): void;

  controllerDidPressCellView?(input: PositionGestureInput, event: Event | null, cellView: CellView, controller: C): void;

  controllerDidLongPressCellView?(input: PositionGestureInput, cellView: CellView, controller: C): void;
}
