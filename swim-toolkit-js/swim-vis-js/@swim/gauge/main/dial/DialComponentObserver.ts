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
import type {ComponentObserver} from "@swim/component";
import type {DialView} from "./DialView";
import type {DialTrait} from "./DialTrait";
import type {DialComponent} from "./DialComponent";

export interface DialComponentObserver<C extends DialComponent = DialComponent> extends ComponentObserver<C> {
  dialWillSetTrait?(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null, component: C): void;

  dialDidSetTrait?(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null, component: C): void;

  dialWillSetView?(newDialView: DialView | null, oldDialView: DialView | null, component: C): void;

  dialDidSetView?(newDialView: DialView | null, oldDialView: DialView | null, component: C): void;

  dialWillSetViewValue?(newValue: number, oldValue: number, component: C): void;

  dialDidSetViewValue?(newValue: number, oldValue: number, component: C): void;

  dialWillSetViewLimit?(newLimit: number, oldLimit: number, component: C): void;

  dialDidSetViewLimit?(newLimit: number, oldLimit: number, component: C): void;

  dialWillSetLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, component: C): void;

  dialDidSetLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, component: C): void;

  dialWillSetLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, component: C): void;

  dialDidSetLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, component: C): void;
}
