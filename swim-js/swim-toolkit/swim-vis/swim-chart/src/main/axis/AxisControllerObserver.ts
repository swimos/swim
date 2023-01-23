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

import type {ControllerObserver} from "@swim/controller";
import type {AxisView} from "./AxisView";
import type {AxisTrait} from "./AxisTrait";
import type {AxisController} from "./AxisController";

/** @public */
export interface AxisControllerObserver<D = unknown, C extends AxisController<D> = AxisController<D>> extends ControllerObserver<C> {
  controllerWillAttachAxisTrait?(axisTrait: AxisTrait<D>, controller: C): void;

  controllerDidDetachAxisTrait?(axisTrait: AxisTrait<D>, controller: C): void;

  controllerWillAttachAxisView?(axisView: AxisView<D>, controller: C): void;

  controllerDidDetachAxisView?(axisView: AxisView<D>, controller: C): void;
}
