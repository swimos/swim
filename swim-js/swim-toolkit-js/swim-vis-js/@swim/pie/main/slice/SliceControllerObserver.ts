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
import type {ControllerObserver} from "@swim/controller";
import type {SliceView} from "./SliceView";
import type {SliceTrait} from "./SliceTrait";
import type {SliceController} from "./SliceController";

export interface SliceControllerObserver<C extends SliceController = SliceController> extends ControllerObserver<C> {
  controllerWillSetSliceTrait?(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null, controller: C): void;

  controllerDidSetSliceTrait?(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null, controller: C): void;

  controllerWillSetSliceView?(newSliceView: SliceView | null, oldSliceView: SliceView | null, controller: C): void;

  controllerDidSetSliceView?(newSliceView: SliceView | null, oldSliceView: SliceView | null, controller: C): void;

  controllerWillSetSliceValue?(newValue: number, oldValue: number, controller: C): void;

  controllerDidSetSliceValue?(newValue: number, oldValue: number, controller: C): void;

  controllerWillSetSliceLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, controller: C): void;

  controllerDidSetSliceLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, controller: C): void;

  controllerWillSetSliceLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, controller: C): void;

  controllerDidSetSliceLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, controller: C): void;
}
