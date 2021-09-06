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
  controllerWillSetDialTrait?(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null, controller: C): void;

  controllerDidSetDialTrait?(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null, controller: C): void;

  controllerWillSetDialView?(newDialView: DialView | null, oldDialView: DialView | null, controller: C): void;

  controllerDidSetDialView?(newDialView: DialView | null, oldDialView: DialView | null, controller: C): void;

  controllerWillSetDialValue?(newValue: number, oldValue: number, controller: C): void;

  controllerDidSetDialValue?(newValue: number, oldValue: number, controller: C): void;

  controllerWillSetDialLimit?(newLimit: number, oldLimit: number, controller: C): void;

  controllerDidSetDialLimit?(newLimit: number, oldLimit: number, controller: C): void;

  controllerWillSetDialLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, controller: C): void;

  controllerDidSetDialLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, controller: C): void;

  controllerWillSetDialLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, controller: C): void;

  controllerDidSetDialLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, controller: C): void;
}
