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

import type {HtmlView} from "@swim/dom";
import type {ControllerObserver, ControllerFastener} from "@swim/controller";
import type {ColLayout} from "../layout/ColLayout";
import type {ColView} from "../col/ColView";
import type {ColTrait} from "../col/ColTrait";
import type {ColController} from "../col/ColController";
import type {HeaderView} from "./HeaderView";
import type {HeaderTrait} from "./HeaderTrait";
import type {HeaderController} from "./HeaderController";

export interface HeaderControllerObserver<C extends HeaderController = HeaderController> extends ControllerObserver<C> {
  controllerWillSetHeaderTrait?(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null, controller: C): void;

  controllerDidSetHeaderTrait?(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null, controller: C): void;

  controllerWillSetHeaderView?(newHeaderView: HeaderView | null, oldHeaderView: HeaderView | null, controller: C): void;

  controllerDidSetHeaderView?(newHeaderView: HeaderView | null, oldHeaderView: HeaderView | null, controller: C): void;

  controllerWillSetCol?(newColController: ColController | null, oldColController: ColController | null, colFastener: ControllerFastener<C, ColController>): void;

  controllerDidSetCol?(newColController: ColController | null, oldColController: ColController | null, colFastener: ControllerFastener<C, ColController>): void;

  controllerWillSetColTrait?(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, colFastener: ControllerFastener<C, ColController>): void;

  controllerDidSetColTrait?(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, colFastener: ControllerFastener<C, ColController>): void;

  controllerWillSetColView?(newColView: ColView | null, oldColView: ColView | null, colFastener: ControllerFastener<C, ColController>): void;

  controllerDidSetColView?(newColView: ColView | null, oldColView: ColView | null, colFastener: ControllerFastener<C, ColController>): void;

  controllerWillSetColLayout?(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, colFastener: ControllerFastener<C, ColController>): void;

  controllerDidSetColLayout?(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, colFastener: ControllerFastener<C, ColController>): void;

  controllerWillSetColLabelView?(newColLabelView: HtmlView | null, oldColLabelView: HtmlView | null, colFastener: ControllerFastener<C, ColController>): void;

  controllerDidSetColLabelView?(newColLabelView: HtmlView | null, oldColLabelView: HtmlView | null, colFastener: ControllerFastener<C, ColController>): void;
}
