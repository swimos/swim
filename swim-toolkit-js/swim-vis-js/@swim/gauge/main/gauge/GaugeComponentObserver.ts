// Copyright 2015-2020 Swim inc.
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
import type {ComponentObserver, ComponentFastener} from "@swim/component";
import type {DialView} from "../dial/DialView";
import type {DialTrait} from "../dial/DialTrait";
import type {DialComponent} from "../dial/DialComponent";
import type {GaugeView} from "./GaugeView";
import type {GaugeTrait} from "./GaugeTrait";
import type {GaugeComponent} from "./GaugeComponent";

export interface GaugeComponentObserver<C extends GaugeComponent = GaugeComponent> extends ComponentObserver<C> {
  gaugeWillSetTrait?(newGaugeTrait: GaugeTrait | null, oldGaugeTrait: GaugeTrait | null, component: C): void;

  gaugeDidSetTrait?(newGaugeTrait: GaugeTrait | null, oldGaugeTrait: GaugeTrait | null, component: C): void;

  gaugeWillSetView?(newGaugeView: GaugeView | null, oldGaugeView: GaugeView | null, component: C): void;

  gaugeDidSetView?(newGaugeView: GaugeView | null, oldGaugeView: GaugeView | null, component: C): void;

  gaugeWillSetTitleView?(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null, component: C): void;

  gaugeDidSetTitleView?(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null, component: C): void;

  gaugeWillSetDial?(newDialComponent: DialComponent | null, oldDialComponent: DialComponent | null, dialFastener: ComponentFastener<C, DialComponent>): void;

  gaugeDidSetDial?(newDialComponent: DialComponent | null, oldDialComponent: DialComponent | null, dialFastener: ComponentFastener<C, DialComponent>): void;

  gaugeWillSetDialTrait?(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null, dialFastener: ComponentFastener<C, DialComponent>): void;

  gaugeDidSetDialTrait?(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null, dialFastener: ComponentFastener<C, DialComponent>): void;

  gaugeWillSetDialView?(newDialView: DialView | null, oldDialView: DialView | null, dialFastener: ComponentFastener<C, DialComponent>): void;

  gaugeDidSetDialView?(newDialView: DialView | null, oldDialView: DialView | null, dialFastener: ComponentFastener<C, DialComponent>): void;

  gaugeWillSetDialViewValue?(newValue: number, oldValue: number, dialFastener: ComponentFastener<C, DialComponent>): void;

  gaugeDidSetDialViewValue?(newValue: number, oldValue: number, dialFastener: ComponentFastener<C, DialComponent>): void;

  gaugeWillSetDialViewLimit?(newLimit: number, oldLimit: number, dialFastener: ComponentFastener<C, DialComponent>): void;

  gaugeDidSetDialViewLimit?(newLimit: number, oldLimit: number, dialFastener: ComponentFastener<C, DialComponent>): void;

  gaugeWillSetDialLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, dialFastener: ComponentFastener<C, DialComponent>): void;

  gaugeDidSetDialLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, dialFastener: ComponentFastener<C, DialComponent>): void;

  gaugeWillSetDialLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, dialFastener: ComponentFastener<C, DialComponent>): void;

  gaugeDidSetDialLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, dialFastener: ComponentFastener<C, DialComponent>): void;
}
