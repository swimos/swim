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

import type {ViewObserver} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import type {DialView} from "./DialView";

export interface DialViewObserver<V extends DialView = DialView> extends ViewObserver<V> {
  viewWillSetDialValue?(newValue: number, oldValue: number, view: V): void;

  viewDidSetDialValue?(newValue: number, oldValue: number, view: V): void;

  viewWillSetDialLimit?(newLimit: number, oldLimit: number, view: V): void;

  viewDidSetDialLimit?(newLimit: number, oldLimit: number, view: V): void;

  viewWillSetDialLabel?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, view: V): void;

  viewDidSetDialLabel?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, view: V): void;

  viewWillSetDialLegend?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, view: V): void;

  viewDidSetDialLegend?(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null, view: V): void;
}
