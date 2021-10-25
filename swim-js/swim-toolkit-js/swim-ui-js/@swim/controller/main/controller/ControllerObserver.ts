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

import type {HierarchyObserver} from "@swim/fastener";
import type {ControllerContextType, Controller} from "./Controller";

export interface ControllerObserver<C extends Controller = Controller> extends HierarchyObserver<C> {
  controllerWillSetParent?(newParent: Controller | null, oldParent: Controller | null, controller: C): void;

  controllerDidSetParent?(newParent: Controller | null, oldParent: Controller | null, controller: C): void;

  controllerWillInsertChild?(child: Controller, target: Controller | null, controller: C): void;

  controllerDidInsertChild?(child: Controller, target: Controller | null, controller: C): void;

  controllerWillRemoveChild?(child: Controller, controller: C): void;

  controllerDidRemoveChild?(child: Controller, controller: C): void;

  controllerWillMount?(controller: Controller): void;

  controllerDidMount?(controller: Controller): void;

  controllerWillUnmount?(controller: Controller): void;

  controllerDidUnmount?(controller: Controller): void;

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