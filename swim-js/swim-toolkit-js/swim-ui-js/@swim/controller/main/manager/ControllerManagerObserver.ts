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

import type {Controller} from "../Controller";
import type {ControllerManager} from "./ControllerManager";

export type ControllerManagerObserverType<CM extends ControllerManager> =
  CM extends {readonly controllerManagerObservers: ReadonlyArray<infer CMO>} ? CMO : never;

export interface ControllerManagerObserver<C extends Controller = Controller, CM extends ControllerManager<C> = ControllerManager<C>> {
  controllerManagerWillAttach?(controllerManager: CM): void;

  controllerManagerDidAttach?(controllerManager: CM): void;

  controllerManagerWillDetach?(controllerManager: CM): void;

  controllerManagerDidDetach?(controllerManager: CM): void;

  controllerManagerWillInsertRootController?(rootController: C, controllerManager: CM): void;

  controllerManagerDidInsertRootController?(rootController: C, controllerManager: CM): void;

  controllerManagerWillRemoveRootController?(rootController: C, controllerManager: CM): void;

  controllerManagerDidRemoveRootController?(rootController: C, controllerManager: CM): void;
}
