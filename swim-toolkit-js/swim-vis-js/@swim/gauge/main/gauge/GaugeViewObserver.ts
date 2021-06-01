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

import type {View, ViewObserver} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import type {DialView} from "../dial/DialView";
import type {GaugeView} from "./GaugeView";

export interface GaugeViewObserver<V extends GaugeView = GaugeView> extends ViewObserver<V> {
  viewWillSetGaugeTitle?(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null, view: V): void;

  viewDidSetGaugeTitle?(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null, view: V): void;

  viewWillSetDial?(newDialView: DialView | null, oldDialView: DialView | null, targetView: View | null, view: V): void;

  viewDidSetDial?(newDialView: DialView | null, oldDialView: DialView | null, targetView: View | null, view: V): void;
}
