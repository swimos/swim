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

import type {ComponentObserver} from "@swim/component";
import type {Controller} from "./Controller";

/** @public */
export interface ControllerObserver<C extends Controller = Controller> extends ComponentObserver<C> {
  controllerWillAttachParent?(parent: Controller, controller: C): void;

  controllerDidAttachParent?(parent: Controller, controller: C): void;

  controllerWillDetachParent?(parent: Controller, controller: C): void;

  controllerDidDetachParent?(parent: Controller, controller: C): void;

  controllerWillInsertChild?(child: Controller, target: Controller | null, controller: C): void;

  controllerDidInsertChild?(child: Controller, target: Controller | null, controller: C): void;

  controllerWillRemoveChild?(child: Controller, controller: C): void;

  controllerDidRemoveChild?(child: Controller, controller: C): void;

  controllerWillReinsertChild?(child: Controller, target: Controller | null, controller: C): void;

  controllerDidReinsertChild?(child: Controller, target: Controller | null, controller: C): void;

  controllerWillMount?(controller: Controller): void;

  controllerDidMount?(controller: Controller): void;

  controllerWillUnmount?(controller: Controller): void;

  controllerDidUnmount?(controller: Controller): void;

  controllerWillResolve?(controller: C): void;

  controllerDidResolve?(controller: C): void;

  controllerWillGenerate?(controller: C): void;

  controllerDidGenerate?(controller: C): void;

  controllerWillAssemble?(controller: C): void;

  controllerDidAssemble?(controller: C): void;

  controllerWillRevise?(controller: C): void;

  controllerDidRevise?(controller: C): void;

  controllerWillCompute?(controller: C): void;

  controllerDidCompute?(controller: C): void;

  controllerWillStartConsuming?(controller: C): void;

  controllerDidStartConsuming?(controller: C): void;

  controllerWillStopConsuming?(controller: C): void;

  controllerDidStopConsuming?(controller: C): void;
}
