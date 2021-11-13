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
  controllerWillAttachColView?(colView: ColView, controller: C): void;

  controllerDidDetachColView?(colView: ColView, controller: C): void;

  controllerWillAttachColTrait?(colTrait: ColTrait, controller: C): void;

  controllerDidDetachColTrait?(colTrait: ColTrait, controller: C): void;

  controllerWillSetColLayout?(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, controller: C): void;

  controllerDidSetColLayout?(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, controller: C): void;

  controllerWillAttachColLabelView?(colLabelView: HtmlView, controller: C): void;

  controllerDidDetachColLabelView?(colLabelView: HtmlView, controller: C): void;
}
