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

import type {GraphicsView} from "@swim/graphics";
import type {ControllerObserver} from "@swim/controller";
import type {DialView} from "../dial/DialView";
import type {DialTrait} from "../dial/DialTrait";
import type {DialController} from "../dial/DialController";
import type {GaugeView} from "./GaugeView";
import type {GaugeTrait} from "./GaugeTrait";
import type {GaugeController} from "./GaugeController";

/** @public */
export interface GaugeControllerObserver<C extends GaugeController = GaugeController> extends ControllerObserver<C> {
  controllerWillAttachGaugeTrait?(gaugeTrait: GaugeTrait, controller: C): void;

  controllerDidDetachGaugeTrait?(gaugeTrait: GaugeTrait, controller: C): void;

  controllerWillAttachGaugeView?(gaugeView: GaugeView, controller: C): void;

  controllerDidDetachGaugeView?(gaugeView: GaugeView | null, controller: C): void;

  controllerWillAttachGaugeTitleView?(titleView: GraphicsView, controller: C): void;

  controllerDidDetachGaugeTitleView?(titleView: GraphicsView, controller: C): void;

  controllerWillAttachDial?(dialController: DialController, controller: C): void;

  controllerDidDetachDial?(dialController: DialController, controller: C): void;

  controllerWillAttachDialTrait?(dialTrait: DialTrait, dialController: DialController, controller: C): void;

  controllerDidDetachDialTrait?(dialTrait: DialTrait, dialController: DialController, controller: C): void;

  controllerWillAttachDialView?(dialView: DialView, dialController: DialController, controller: C): void;

  controllerDidDetachDialView?(dialView: DialView, dialController: DialController, controller: C): void;

  controllerDidSetDialValue?(value: number, dialController: DialController, controller: C): void;

  controllerDidSetDialLimit?(limit: number, dialController: DialController, controller: C): void;

  controllerWillAttachDialLabelView?(labelView: GraphicsView, dialController: DialController, controller: C): void;

  controllerDidDetachDialLabelView?(labelView: GraphicsView, dialController: DialController, controller: C): void;

  controllerWillAttachDialLegendView?(legendView: GraphicsView, dialController: DialController, controller: C): void;

  controllerDidDetachDialLegendView?(legendView: GraphicsView, dialController: DialController, controller: C): void;
}
