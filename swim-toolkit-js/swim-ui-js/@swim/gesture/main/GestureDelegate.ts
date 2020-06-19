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

import {GestureInput} from "./GestureInput";

export interface GestureDelegate {
  willStartHovering?(): void;

  didStartHovering?(): void;

  willStopHovering?(): void;

  didStopHovering?(): void;

  willBeginHover?(input: GestureInput, event: Event | null): void;

  didBeginHover?(input: GestureInput, event: Event | null): void;

  willEndHover?(input: GestureInput, event: Event | null): void;

  didEndHover?(input: GestureInput, event: Event | null): void;

  willStartPressing?(): void;

  didStartPressing?(): void;

  willStopPressing?(): void;

  didStopPressing?(): void;

  willBeginPress?(input: GestureInput, event: Event | null): void;

  didBeginPress?(input: GestureInput, event: Event | null): void;

  willHoldPress?(input: GestureInput): void;

  didHoldPress?(input: GestureInput): void;

  willMovePress?(input: GestureInput, event: Event | null): void;

  didMovePress?(input: GestureInput, event: Event | null): void;

  willEndPress?(input: GestureInput, event: Event | null): void;

  didEndPress?(input: GestureInput, event: Event | null): void;

  willCancelPress?(input: GestureInput, event: Event | null): void;

  didCancelPress?(input: GestureInput, event: Event | null): void;

  willPress?(input: GestureInput, event: Event | null): void;

  didPress?(input: GestureInput, event: Event | null): void;
}
