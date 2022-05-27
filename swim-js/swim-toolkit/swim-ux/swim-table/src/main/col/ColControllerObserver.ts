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

import type {ControllerObserver} from "@swim/controller";
import type {ColLayout} from "../layout/ColLayout";
import type {ColView} from "./ColView";
import type {ColTrait} from "./ColTrait";
import type {ColController} from "./ColController";

/** @public */
export interface ColControllerObserver<C extends ColController = ColController> extends ControllerObserver<C> {
  controllerWillAttachColTrait?(colTrait: ColTrait, controller: C): void;

  controllerDidDetachColTrait?(colTrait: ColTrait, controller: C): void;

  controllerWillAttachColView?(colView: ColView, controller: C): void;

  controllerDidDetachColView?(colView: ColView, controller: C): void;

  controllerDidSetColLayout?(colLayout: ColLayout | null, controller: C): void;
}
