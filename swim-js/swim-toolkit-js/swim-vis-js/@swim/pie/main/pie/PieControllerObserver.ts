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

import type {GraphicsView} from "@swim/graphics";
import type {ControllerObserver, ControllerFastener} from "@swim/controller";
import type {SliceView} from "../slice/SliceView";
import type {SliceTrait} from "../slice/SliceTrait";
import type {SliceController} from "../slice/SliceController";
import type {PieView} from "./PieView";
import type {PieTrait} from "./PieTrait";
import type {PieController} from "./PieController";

export interface PieControllerObserver<C extends PieController = PieController> extends ControllerObserver<C> {
  controllerWillSetPieTrait?(newPieTrait: PieTrait | null, oldPieTrait: PieTrait | null, controller: C): void;

  controllerDidSetPieTrait?(newPieTrait: PieTrait | null, oldPieTrait: PieTrait | null, controller: C): void;

  controllerWillSetPieView?(newPieView: PieView | null, oldPieView: PieView | null, controller: C): void;

  controllerDidSetPieView?(newPieView: PieView | null, oldPieView: PieView | null, controller: C): void;

  controllerWillSetPieTitleView?(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null, controller: C): void;

  controllerDidSetPieTitleView?(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null, controller: C): void;

  controllerWillSetSlice?(newSliceController: SliceController | null, oldSliceController: SliceController | null, sliceFastener: ControllerFastener<C, SliceController>): void;

  controllerDidSetSlice?(newSliceController: SliceController | null, oldSliceController: SliceController | null, sliceFastener: ControllerFastener<C, SliceController>): void;

  controllerWillSetSliceTrait?(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null, sliceFastener: ControllerFastener<C, SliceController>): void;

  controllerDidSetSliceTrait?(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null, sliceFastener: ControllerFastener<C, SliceController>): void;

  controllerWillSetSliceView?(newSliceView: SliceView | null, oldSliceView: SliceView | null, sliceFastener: ControllerFastener<C, SliceController>): void;

  controllerDidSetSliceView?(newSliceView: SliceView | null, oldSliceView: SliceView | null, sliceFastener: ControllerFastener<C, SliceController>): void;

  controllerWillSetSliceValue?(newValue: number, oldValue: number, sliceFastener: ControllerFastener<C, SliceController>): void;

  controllerDidSetSliceValue?(newValue: number, oldValue: number, sliceFastener: ControllerFastener<C, SliceController>): void;

  controllerWillSetSliceLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, sliceFastener: ControllerFastener<C, SliceController>): void;

  controllerDidSetSliceLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, sliceFastener: ControllerFastener<C, SliceController>): void;

  controllerWillSetSliceLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, sliceFastener: ControllerFastener<C, SliceController>): void;

  controllerDidSetSliceLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, sliceFastener: ControllerFastener<C, SliceController>): void;
}
