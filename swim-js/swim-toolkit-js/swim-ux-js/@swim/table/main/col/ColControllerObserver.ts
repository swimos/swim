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
import type {ControllerObserver} from "@swim/controller";
import type {ColLayout} from "../layout/ColLayout";
import type {ColView} from "./ColView";
import type {ColTrait} from "./ColTrait";
import type {ColController} from "./ColController";

export interface ColControllerObserver<C extends ColController = ColController> extends ControllerObserver<C> {
  controllerWillSetColView?(newColView: ColView | null, oldColView: ColView | null, controller: C): void;

  controllerDidSetColView?(newColView: ColView | null, oldColView: ColView | null, controller: C): void;

  controllerWillSetColTrait?(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, controller: C): void;

  controllerDidSetColTrait?(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, controller: C): void;

  controllerWillSetColLayout?(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, controller: C): void;

  controllerDidSetColLayout?(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, controller: C): void;

  controllerWillSetColHeaderView?(newColHeaderView: HtmlView | null, oldColHeaderView: HtmlView | null, controller: C): void;

  controllerDidSetColHeaderView?(newColHeaderView: HtmlView | null, oldColHeaderView: HtmlView | null, controller: C): void;
}
