// Copyright 2015-2023 Swim.inc
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
import type {HtmlView} from "@swim/dom";
import type {Graphics} from "@swim/graphics";
import type {ControllerObserver} from "@swim/controller";
import type {ToolLayout} from "../layout/ToolLayout";
import type {BarLayout} from "../layout/BarLayout";
import type {ToolView} from "../tool/ToolView";
import type {ToolController} from "../tool/ToolController";
import type {BarView} from "./BarView";
import type {BarController} from "./BarController";

/** @public */
export interface BarControllerObserver<C extends BarController = BarController> extends ControllerObserver<C> {
  controllerWillAttachBarView?(barView: BarView, controller: C): void;

  controllerDidDetachBarView?(barView: BarView, controller: C): void;

  controllerDidSetBarLayout?(barLayout: BarLayout | null, controller: C): void;

  controllerWillAttachTool?(toolController: ToolController, controller: C): void;

  controllerDidDetachTool?(toolController: ToolController, controller: C): void;

  controllerWillAttachToolView?(toolView: ToolView, toolController: ToolController, controller: C): void;

  controllerDidDetachToolView?(toolView: ToolView, toolController: ToolController, controller: C): void;

  controllerDidSetToolLayout?(toolLayout: ToolLayout | null, toolController: ToolController, controller: C): void;

  controllerWillAttachToolContentView?(toolContentView: HtmlView, toolController: ToolController, controller: C): void;

  controllerDidDetachToolContentView?(toolContentView: HtmlView, toolController: ToolController, controller: C): void;

  controllerDidSetToolIcon?(toolIcon: Graphics | null, toolController: ToolController, controller: C): void;

  controllerDidUpdateSearchTool?(query: string, inputView: HtmlView, toolController: ToolController, controller: C): void;

  controllerDidSubmitSearchTool?(query: string, inputView: HtmlView, toolController: ToolController, controller: C): void;

  controllerDidCancelSearchTool?(inputView: HtmlView, toolController: ToolController, controller: C): void;

  controllerDidPressToolView?(input: PositionGestureInput, event: Event | null, toolController: ToolController, controller: C): void;

  controllerDidLongPressToolView?(input: PositionGestureInput, toolController: ToolController, controller: C): void;
}
