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

import {GestureInputType, GestureInput} from "./GestureInput";

export class PositionGestureInput extends GestureInput {
  hovering: boolean;
  pressing: boolean;
  holdTimer: number;
  holdDelay: number;

  constructor(inputId: string, inputType: GestureInputType, isPrimary: boolean,
              x: number, y: number, t: number) {
    super(inputId, inputType, isPrimary, x, y, t);
    this.hovering = false;
    this.pressing = false;
    this.holdTimer = 0;
    this.holdDelay = 400;
  }

  isRunaway(): boolean {
    const dx = this.x - this.x0;
    const dy = this.y - this.y0;
    const dt = this.t - this.t0;
    return this.inputType !== "mouse" && dt < 100
        && dx * dx + dy * dy > 10 * 10;
  }

  setHoldTimer(f: () => void): void {
    if (this.holdDelay !== 0) {
      this.clearHoldTimer();
      this.holdTimer = setTimeout(f, this.holdDelay) as any;
    }
  }

  clearHoldTimer(): void {
    if (this.holdTimer !== 0) {
      clearTimeout(this.holdTimer);
      this.holdTimer = 0;
    }
  }
}
