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

import type {GraphicsView} from "@swim/graphics";
import type {ControllerObserver} from "@swim/controller";
import type {SliceView} from "./SliceView";
import type {SliceTrait} from "./SliceTrait";
import type {SliceController} from "./SliceController";

/** @public */
export interface SliceControllerObserver<C extends SliceController = SliceController> extends ControllerObserver<C> {
  controllerWillAttachSliceTrait?(sliceTrait: SliceTrait, controller: C): void;

  controllerDidDetachSliceTrait?(sliceTrait: SliceTrait, controller: C): void;

  controllerWillAttachSliceView?(sliceView: SliceView, controller: C): void;

  controllerDidDetachSliceView?(sliceView: SliceView, controller: C): void;

  controllerWillSetSliceValue?(newValue: number, oldValue: number, controller: C): void;

  controllerDidSetSliceValue?(newValue: number, oldValue: number, controller: C): void;

  controllerWillAttachSliceLabelView?(labelView: GraphicsView, controller: C): void;

  controllerDidDetachSliceLabelView?(labelView: GraphicsView, controller: C): void;

  controllerWillAttachSliceLegendView?(legendView: GraphicsView, controller: C): void;

  controllerDidDetachSliceLegendView?(legendView: GraphicsView, controller: C): void;
}
