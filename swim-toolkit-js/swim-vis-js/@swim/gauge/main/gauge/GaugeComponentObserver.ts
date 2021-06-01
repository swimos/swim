// Copyright 2015-2021 Swim inc.
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
  componentWillSetGaugeTrait?(newGaugeTrait: GaugeTrait | null, oldGaugeTrait: GaugeTrait | null, component: C): void;

  componentDidSetGaugeTrait?(newGaugeTrait: GaugeTrait | null, oldGaugeTrait: GaugeTrait | null, component: C): void;

  componentWillSetGaugeView?(newGaugeView: GaugeView | null, oldGaugeView: GaugeView | null, component: C): void;

  componentDidSetGaugeView?(newGaugeView: GaugeView | null, oldGaugeView: GaugeView | null, component: C): void;

  componentWillSetGaugeTitleView?(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null, component: C): void;

  componentWillSetGaugeTitleView?(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null, component: C): void;

  componentWillSetDial?(newDialComponent: DialComponent | null, oldDialComponent: DialComponent | null, dialFastener: ComponentFastener<C, DialComponent>): void;

  componentDidSetDial?(newDialComponent: DialComponent | null, oldDialComponent: DialComponent | null, dialFastener: ComponentFastener<C, DialComponent>): void;

  componentWillSetDialTrait?(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null, dialFastener: ComponentFastener<C, DialComponent>): void;

  componentDidSetDialTrait?(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null, dialFastener: ComponentFastener<C, DialComponent>): void;

  componentWillSetDialView?(newDialView: DialView | null, oldDialView: DialView | null, dialFastener: ComponentFastener<C, DialComponent>): void;

  componentDidSetDialView?(newDialView: DialView | null, oldDialView: DialView | null, dialFastener: ComponentFastener<C, DialComponent>): void;

  componentWillSetDialValue?(newValue: number, oldValue: number, dialFastener: ComponentFastener<C, DialComponent>): void;

  componentDidSetDialValue?(newValue: number, oldValue: number, dialFastener: ComponentFastener<C, DialComponent>): void;

  componentWillSetDialLimit?(newLimit: number, oldLimit: number, dialFastener: ComponentFastener<C, DialComponent>): void;

  componentDidSetDialLimit?(newLimit: number, oldLimit: number, dialFastener: ComponentFastener<C, DialComponent>): void;

  componentWillSetDialLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, dialFastener: ComponentFastener<C, DialComponent>): void;

  componentDidSetDialLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, dialFastener: ComponentFastener<C, DialComponent>): void;

  componentWillSetDialLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, dialFastener: ComponentFastener<C, DialComponent>): void;

  componentDidSetDialLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, dialFastener: ComponentFastener<C, DialComponent>): void;
}
