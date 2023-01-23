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

import type {Domain, ContinuousScale} from "@swim/util";
import type {GraphicsViewObserver} from "@swim/graphics";
import type {ScaledXView} from "./ScaledXView";

/** @public */
export interface ScaledXViewObserver<X = unknown, V extends ScaledXView<X> = ScaledXView<X>> extends GraphicsViewObserver<V> {
  viewDidSetXScale?(xScale: ContinuousScale<X, number> | null, view: V): void;

  viewDidSetXRangePadding?(xRangePadding: readonly [number, number], view: V): void;

  viewDidSetXDataDomain?(xDataDomain: Domain<X> | null, view: V): void;
}
