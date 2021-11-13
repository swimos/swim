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
import type {ColView} from "../col/ColView";
import type {ColTrait} from "../col/ColTrait";
import type {ColController} from "../col/ColController";
import type {HeaderView} from "./HeaderView";
import type {HeaderTrait} from "./HeaderTrait";
import type {HeaderController} from "./HeaderController";

export interface HeaderControllerObserver<C extends HeaderController = HeaderController> extends ControllerObserver<C> {
  controllerWillAttachHeaderTrait?(headerTrait: HeaderTrait, controller: C): void;

  controllerDidDetachHeaderTrait?(headerTrait: HeaderTrait, controller: C): void;

  controllerWillAttachHeaderView?(headerView: HeaderView, controller: C): void;

  controllerDidDetachHeaderView?(headerView: HeaderView, controller: C): void;

  controllerWillAttachCol?(colController: ColController, controller: C): void;

  controllerDidDetachCol?(colController: ColController, controller: C): void;

  controllerWillAttachColTrait?(colTrait: ColTrait, colController: ColController, controller: C): void;

  controllerDidDetachColTrait?(colTrait: ColTrait, colController: ColController, controller: C): void;

  controllerWillAttachColView?(colView: ColView, colController: ColController, controller: C): void;

  controllerDidDetachColView?(colView: ColView, colController: ColController, controller: C): void;

  controllerWillSetColLayout?(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, colController: ColController, controller: C): void;

  controllerDidSetColLayout?(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, colController: ColController, controller: C): void;

  controllerWillAttachColLabelView?(colLabelView: HtmlView, colController: ColController, controller: C): void;

  controllerDidDetachColLabelView?(colLabelView: HtmlView, colController: ColController, controller: C): void;
}
