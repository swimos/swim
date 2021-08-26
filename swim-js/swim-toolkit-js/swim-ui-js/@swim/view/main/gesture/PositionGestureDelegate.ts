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

import type {GestureDelegate} from "./GestureDelegate";
import type {PositionGestureInput} from "./PositionGestureInput";

export interface PositionGestureDelegate extends GestureDelegate {
  willStartHovering?(): void;

  didStartHovering?(): void;

  willStopHovering?(): void;

  didStopHovering?(): void;

  willBeginHover?(input: PositionGestureInput, event: Event | null): void;

  didBeginHover?(input: PositionGestureInput, event: Event | null): void;

  willEndHover?(input: PositionGestureInput, event: Event | null): void;

  didEndHover?(input: PositionGestureInput, event: Event | null): void;

  willStartPressing?(): void;

  didStartPressing?(): void;

  willStopPressing?(): void;

  didStopPressing?(): void;

  willBeginPress?(input: PositionGestureInput, event: Event | null): boolean | void;

  didBeginPress?(input: PositionGestureInput, event: Event | null): void;

  willMovePress?(input: PositionGestureInput, event: Event | null): void;

  didMovePress?(input: PositionGestureInput, event: Event | null): void;

  willEndPress?(input: PositionGestureInput, event: Event | null): void;

  didEndPress?(input: PositionGestureInput, event: Event | null): void;

  willCancelPress?(input: PositionGestureInput, event: Event | null): void;

  didCancelPress?(input: PositionGestureInput, event: Event | null): void;

  willPress?(input: PositionGestureInput, event: Event | null): void;

  didPress?(input: PositionGestureInput, event: Event | null): void;

  willLongPress?(input: PositionGestureInput): void;

  didLongPress?(input: PositionGestureInput): void;
}
