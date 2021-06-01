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

import type {AnyTiming, ContinuousScale} from "@swim/mapping";
import type {MomentumGestureDelegate} from "./MomentumGestureDelegate";
import type {ScaleGestureInput} from "./ScaleGestureInput";

export interface ScaleGestureDelegate<X, Y> extends MomentumGestureDelegate {
  /**
   * Returns the minimum radial distance between input positions, in pixels.
   * Used to avoid scale gesture singularities.
   */
  distanceMin?(): number;

  preserveAspectRatio?(): boolean;

  xGestures?(): boolean;

  yGestures?(): boolean;

  xScale?(): ContinuousScale<X, number> | null;
  xScale?(xScale: ContinuousScale<X, number> | null, timing?: AnyTiming | boolean): unknown;

  yScale?(): ContinuousScale<Y, number> | null;
  yScale?(yScale: ContinuousScale<Y, number> | null, timing?: AnyTiming | boolean): unknown;

  willBeginHover?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  didBeginHover?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  willEndHover?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  didEndHover?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  willBeginPress?(input: ScaleGestureInput<X, Y>, event: Event | null): boolean | void;

  didBeginPress?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  willMovePress?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  didMovePress?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  willEndPress?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  didEndPress?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  willCancelPress?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  didCancelPress?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  willPress?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  didPress?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  willLongPress?(input: ScaleGestureInput<X, Y>): void;

  didLongPress?(input: ScaleGestureInput<X, Y>): void;

  willBeginCoast?(input: ScaleGestureInput<X, Y>, event: Event | null): boolean | void;

  didBeginCoast?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  willEndCoast?(input: ScaleGestureInput<X, Y>, event: Event | null): void;

  didEndCoast?(input: ScaleGestureInput<X, Y>, event: Event | null): void;
}
