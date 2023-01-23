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

import type {Length} from "@swim/math";
import type {Color} from "@swim/style";
import type {GraphicsView, GraphicsViewObserver} from "@swim/graphics";
import type {DataPointView} from "./DataPointView";

/** @public */
export interface DataPointViewObserver<X = unknown, Y = unknown, V extends DataPointView<X, Y> = DataPointView<X, Y>> extends GraphicsViewObserver<V> {
  viewDidSetX?(x: X | undefined, view: V): void;

  viewDidSetY?(y: Y | undefined, view: V): void;

  viewDidSetY2?(y2: Y | undefined, view: V): void;

  viewDidSetRadius?(radius: Length | null, view: V): void;

  viewDidSetColor?(color: Color | null, view: V): void;

  viewDidSetOpacity?(opacity: number | undefined, view: V): void;

  viewWillAttachLabel?(labelView: GraphicsView, view: V): void;

  viewDidDetachLabel?(labelView: GraphicsView | null, view: V): void;
}
