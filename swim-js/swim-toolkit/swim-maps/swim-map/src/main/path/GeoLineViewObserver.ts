// Copyright 2015-2021 Swim.inc
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

import type {Length} from "@swim/math";
import type {Color} from "@swim/style";
import type {GeoPathViewObserver} from "./GeoPathViewObserver";
import type {GeoLineView} from "./GeoLineView";

/** @public */
export interface GeoLineViewObserver<V extends GeoLineView = GeoLineView> extends GeoPathViewObserver<V> {
  viewWillSetStroke?(newStroke: Color | null, oldStroke: Color | null, view: V): void;

  viewDidSetStroke?(newStroke: Color | null, oldStroke: Color | null, view: V): void;

  viewWillSetStrokeWidth?(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, view: V): void;

  viewDidSetStrokeWidth?(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, view: V): void;
}
