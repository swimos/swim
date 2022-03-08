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

import type {Graphics} from "@swim/graphics";
import type {CellControllerObserver} from "./CellControllerObserver";
import type {IconCellView} from "./IconCellView";
import type {IconCellTrait} from "./IconCellTrait";
import type {IconCellController} from "./IconCellController";

/** @public */
export interface IconCellControllerObserver<C extends IconCellController = IconCellController> extends CellControllerObserver<C> {
  controllerWillAttachCellTrait?(cellTrait: IconCellTrait, controller: C): void;

  controllerDidDetachCellTrait?(cellTrait: IconCellTrait, controller: C): void;

  controllerWillAttachCellView?(cellView: IconCellView, controller: C): void;

  controllerDidDetachCellView?(cellView: IconCellView, controller: C): void;

  controllerWillSetCellIcon?(newCellIcon: Graphics | null, oldCellIcon: Graphics | null, controller: C): void;

  controllerDidSetCellIcon?(newCellIcon: Graphics | null, oldCellIcon: Graphics | null, controller: C): void;
}
