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

import type {GraphicsView} from "@swim/graphics";
import type {ControllerObserver} from "@swim/controller";
import type {DialView} from "./DialView";
import type {DialTrait} from "./DialTrait";
import type {DialController} from "./DialController";

export interface DialControllerObserver<C extends DialController = DialController> extends ControllerObserver<C> {
  controllerWillAttachDialTrait?(dialTrait: DialTrait, controller: C): void;

  controllerDidDetachDialTrait?(dialTrait: DialTrait, controller: C): void;

  controllerWillAttachDialView?(dialView: DialView, controller: C): void;

  controllerDidDetachDialView?(dialView: DialView, controller: C): void;

  controllerWillSetDialValue?(newValue: number, oldValue: number, controller: C): void;

  controllerDidSetDialValue?(newValue: number, oldValue: number, controller: C): void;

  controllerWillSetDialLimit?(newLimit: number, oldLimit: number, controller: C): void;

  controllerDidSetDialLimit?(newLimit: number, oldLimit: number, controller: C): void;

  controllerWillAttachDialLabelView?(labelView: GraphicsView, controller: C): void;

  controllerDidDetachDialLabelView?(labelView: GraphicsView, controller: C): void;

  controllerWillAttachDialLegendView?(legendView: GraphicsView, controller: C): void;

  controllerDidDetachDialLegendView?(legendView: GraphicsView, controller: C): void;
}
