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
import type {SliceView} from "../slice/SliceView";
import type {SliceTrait} from "../slice/SliceTrait";
import type {SliceController} from "../slice/SliceController";
import type {PieView} from "./PieView";
import type {PieTrait} from "./PieTrait";
import type {PieController} from "./PieController";

/** @public */
export interface PieControllerObserver<C extends PieController = PieController> extends ControllerObserver<C> {
  controllerWillAttachPieTrait?(pieTrait: PieTrait, controller: C): void;

  controllerDidDetachPieTrait?(pieTrait: PieTrait, controller: C): void;

  controllerWillAttachPieView?(pieView: PieView, controller: C): void;

  controllerDidDetachPieView?(pieView: PieView, controller: C): void;

  controllerWillAttachPieTitleView?(titleView: GraphicsView, controller: C): void;

  controllerDidDetachPieTitleView?(titleView: GraphicsView, controller: C): void;

  controllerWillAttachSlice?(sliceController: SliceController, controller: C): void;

  controllerDidDetachSlice?(sliceController: SliceController, controller: C): void;

  controllerWillAttachSliceTrait?(sliceTrait: SliceTrait, sliceController: SliceController, controller: C): void;

  controllerDidDetachSliceTrait?(sliceTrait: SliceTrait, sliceController: SliceController, controller: C): void;

  controllerWillAttachSliceView?(sliceView: SliceView, sliceController: SliceController, controller: C): void;

  controllerDidDetachSliceView?(sliceView: SliceView, sliceController: SliceController, controller: C): void;

  controllerWillSetSliceValue?(newValue: number, oldValue: number, sliceController: SliceController, controller: C): void;

  controllerDidSetSliceValue?(newValue: number, oldValue: number, sliceController: SliceController, controller: C): void;

  controllerWillAttachSliceLabelView?(labelView: GraphicsView, sliceController: SliceController, controller: C): void;

  controllerDidDetachSliceLabelView?(labelView: GraphicsView, sliceController: SliceController, controller: C): void;

  controllerWillAttachSliceLegendView?(legendView: GraphicsView, sliceController: SliceController, controller: C): void;

  controllerDidDetachSliceLegendView?(legendView: GraphicsView, sliceController: SliceController, controller: C): void;
}
