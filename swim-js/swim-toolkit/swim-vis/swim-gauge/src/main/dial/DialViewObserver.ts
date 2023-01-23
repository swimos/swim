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

import type {ViewObserver} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import type {DialView} from "./DialView";

/** @public */
export interface DialViewObserver<V extends DialView = DialView> extends ViewObserver<V> {
  viewDidSetValue?(value: number, view: V): void;

  viewDidSetLimit?(limit: number, view: V): void;

  viewWillAttachLabel?(labelView: GraphicsView, view: V): void;

  viewDidDetachLabel?(labelView: GraphicsView, view: V): void;

  viewWillAttachLegend?(legendView: GraphicsView, view: V): void;

  viewDidDetachLegend?(legendView: GraphicsView, view: V): void;
}
