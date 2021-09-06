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

import type {ControllerContextType} from "./ControllerContext";
import type {Controller} from "./Controller";

export type ControllerObserverType<C extends Controller> =
  C extends {readonly controllerObservers: ReadonlyArray<infer CO>} ? CO : never;

export interface ControllerObserver<C extends Controller = Controller> {
  controllerWillSetParentController?(newParentController: Controller | null, oldParentController: Controller | null, controller: C): void;

  controllerDidSetParentController?(newParentController: Controller | null, oldParentController: Controller | null, controller: C): void;

  controllerWillInsertChildController?(childController: Controller, targetController: Controller | null, controller: C): void;

  controllerDidInsertChildController?(childController: Controller, targetController: Controller | null, controller: C): void;

  controllerWillRemoveChildController?(childController: Controller, controller: C): void;

  controllerDidRemoveChildController?(childController: Controller, controller: C): void;

  controllerWillMount?(controller: Controller): void;

  controllerDidMount?(controller: Controller): void;

  controllerWillUnmount?(controller: Controller): void;

  controllerDidUnmount?(controller: Controller): void;

  controllerWillPower?(controller: Controller): void;

  controllerDidPower?(controller: Controller): void;

  controllerWillUnpower?(controller: Controller): void;

  controllerDidUnpower?(controller: Controller): void;

  controllerWillResolve?(controllerContext: ControllerContextType<C>, controller: C): void;

  controllerDidResolve?(controllerContext: ControllerContextType<C>, controller: C): void;

  controllerWillGenerate?(controllerContext: ControllerContextType<C>, controller: C): void;

  controllerDidGenerate?(controllerContext: ControllerContextType<C>, controller: C): void;

  controllerWillAssemble?(controllerContext: ControllerContextType<C>, controller: C): void;

  controllerDidAssemble?(controllerContext: ControllerContextType<C>, controller: C): void;

  controllerWillRevise?(controllerContext: ControllerContextType<C>, controller: C): void;

  controllerDidRevise?(controllerContext: ControllerContextType<C>, controller: C): void;

  controllerWillCompute?(controllerContext: ControllerContextType<C>, controller: C): void;

  controllerDidCompute?(controllerContext: ControllerContextType<C>, controller: C): void;
}
