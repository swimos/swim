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
import type {ComponentObserver} from "@swim/component";
import type {DialView} from "./DialView";
import type {DialTrait} from "./DialTrait";
import type {DialComponent} from "./DialComponent";

export interface DialComponentObserver<C extends DialComponent = DialComponent> extends ComponentObserver<C> {
  componentWillSetDialTrait?(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null, component: C): void;

  componentDidSetDialTrait?(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null, component: C): void;

  componentWillSetDialView?(newDialView: DialView | null, oldDialView: DialView | null, component: C): void;

  componentDidSetDialView?(newDialView: DialView | null, oldDialView: DialView | null, component: C): void;

  componentWillSetDialValue?(newValue: number, oldValue: number, component: C): void;

  componentDidSetDialValue?(newValue: number, oldValue: number, component: C): void;

  componentWillSetDialLimit?(newLimit: number, oldLimit: number, component: C): void;

  componentDidSetDialLimit?(newLimit: number, oldLimit: number, component: C): void;

  componentWillSetDialLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, component: C): void;

  componentDidSetDialLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, component: C): void;

  componentWillSetDialLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, component: C): void;

  componentDidSetDialLegendView?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, component: C): void;
}
