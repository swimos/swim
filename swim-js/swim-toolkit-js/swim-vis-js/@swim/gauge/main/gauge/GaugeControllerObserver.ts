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
import type {ControllerObserver, ControllerFastener} from "@swim/controller";
import type {DialView} from "../dial/DialView";
import type {DialTrait} from "../dial/DialTrait";
import type {DialController} from "../dial/DialController";
import type {GaugeView} from "./GaugeView";
import type {GaugeTrait} from "./GaugeTrait";
import type {GaugeController} from "./GaugeController";

export interface GaugeControllerObserver<C extends GaugeController = GaugeController> extends ControllerObserver<C> {
  controllerWillSetGaugeTrait?(newGaugeTrait: GaugeTrait | null, oldGaugeTrait: GaugeTrait | null, controller: C): void;

  controllerDidSetGaugeTrait?(newGaugeTrait: GaugeTrait | null, oldGaugeTrait: GaugeTrait | null, controller: C): void;

  controllerWillSetGaugeView?(newGaugeView: GaugeView | null, oldGaugeView: GaugeView | null, controller: C): void;

  controllerDidSetGaugeView?(newGaugeView: GaugeView | null, oldGaugeView: GaugeView | null, controller: C): void;

  controllerWillSetGaugeTitleView?(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null, controller: C): void;

  controllerDidSetGaugeTitleView?(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null, controller: C): void;

  controllerWillSetDial?(newDialController: DialController | null, oldDialController: DialController | null, dialFastener: ControllerFastener<C, DialController>): void;

  controllerDidSetDial?(newDialController: DialController | null, oldDialController: DialController | null, dialFastener: ControllerFastener<C, DialController>): void;

  controllerWillSetDialTrait?(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null, dialFastener: ControllerFastener<C, DialController>): void;

  controllerDidSetDialTrait?(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null, dialFastener: ControllerFastener<C, DialController>): void;

  controllerWillSetDialView?(newDialView: DialView | null, oldDialView: DialView | null, dialFastener: ControllerFastener<C, DialController>): void;

  controllerDidSetDialView?(newDialView: DialView | null, oldDialView: DialView | null, dialFastener: ControllerFastener<C, DialController>): void;

  controllerWillSetDialValue?(newValue: number, oldValue: number, dialFastener: ControllerFastener<C, DialController>): void;

  controllerDidSetDialValue?(newValue: number, oldValue: number, dialFastener: ControllerFastener<C, DialController>): void;

  controllerWillSetDialLimit?(newLimit: number, oldLimit: number, dialFastener: ControllerFastener<C, DialController>): void;

  controllerDidSetDialLimit?(newLimit: number, oldLimit: number, dialFastener: ControllerFastener<C, DialController>): void;

  controllerWillSetDialLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, dialFastener: ControllerFastener<C, DialController>): void;

  controllerDidSetDialLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, dialFastener: ControllerFastener<C, DialController>): void;

  controllerWillSetDialLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, dialFastener: ControllerFastener<C, DialController>): void;

  controllerDidSetDialLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, dialFastener: ControllerFastener<C, DialController>): void;
}
