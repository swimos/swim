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

import type {PositionGestureDelegate} from "./PositionGestureDelegate";
import type {MomentumGestureInput} from "./MomentumGestureInput";

export interface MomentumGestureDelegate extends PositionGestureDelegate {
  /**
   * Returns the time delta for velocity derivation, in milliseconds.
   */
  hysteresis?(): number;

  /**
   * Returns the magnitude of the deceleration on coasting input points,
   * in pixels/millisecond^2.  An acceleration of zero disables coasting.
   */
  acceleration?(): number;

  /**
   * Returns the maximum magnitude of the velocity of coasting input points,
   * in pixels/millisecond.
   */
  velocityMax?(): number;

  willBeginHover?(input: MomentumGestureInput, event: Event | null): void;

  didBeginHover?(input: MomentumGestureInput, event: Event | null): void;

  willEndHover?(input: MomentumGestureInput, event: Event | null): void;

  didEndHover?(input: MomentumGestureInput, event: Event | null): void;

  willStartInteracting?(): void;

  didStartInteracting?(): void;

  willStopInteracting?(): void;

  didStopInteracting?(): void;

  willBeginPress?(input: MomentumGestureInput, event: Event | null): boolean | void;

  didBeginPress?(input: MomentumGestureInput, event: Event | null): void;

  willMovePress?(input: MomentumGestureInput, event: Event | null): void;

  didMovePress?(input: MomentumGestureInput, event: Event | null): void;

  willEndPress?(input: MomentumGestureInput, event: Event | null): void;

  didEndPress?(input: MomentumGestureInput, event: Event | null): void;

  willCancelPress?(input: MomentumGestureInput, event: Event | null): void;

  didCancelPress?(input: MomentumGestureInput, event: Event | null): void;

  willPress?(input: MomentumGestureInput, event: Event | null): void;

  didPress?(input: MomentumGestureInput, event: Event | null): void;

  willLongPress?(input: MomentumGestureInput): void;

  didLongPress?(input: MomentumGestureInput): void;

  willStartCoasting?(): void;

  didStartCoasting?(): void;

  willStopCoasting?(): void;

  didStopCoasting?(): void;

  willBeginCoast?(input: MomentumGestureInput, event: Event | null): boolean | void;

  didBeginCoast?(input: MomentumGestureInput, event: Event | null): void;

  willEndCoast?(input: MomentumGestureInput, event: Event | null): void;

  didEndCoast?(input: MomentumGestureInput, event: Event | null): void;

  willCoast?(): void;

  didCoast?(): void;
}
