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

import {GestureInputType} from "./GestureInput";
import {PositionGestureInput} from "./PositionGestureInput";

export class MomentumGestureInput extends PositionGestureInput {
  vx: number;
  vy: number;
  ax: number;
  ay: number;

  /** @hidden */
  readonly path: {x: number; y: number; t: number;}[];
  coasting: boolean;

  constructor(inputId: string, inputType: GestureInputType, isPrimary: boolean,
              x: number, y: number, t: number) {
    super(inputId, inputType, isPrimary, x, y, t);
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.path = [];
    this.coasting = false;
  }

  /** @hidden */
  updatePosition(hysteresis: number): void {
    const path = this.path;
    const x = this.x;
    const y = this.y;
    const t = this.t;
    path.push({x, y, t});
    while (path.length > 1 && t - path[0].t > hysteresis) {
      path.shift();
    }
  }

  /** @hidden */
  deriveVelocity(vMax: number): void {
    const p0 = this.path[0];
    const p1 = this.path[this.path.length - 1];
    if (p1 !== void 0 && p1 !== p0) {
      const dt = p1.t - p0.t;
      let vx: number;
      let vy: number;
      if (dt !== 0) {
        vx = (p1.x - p0.x) / dt;
        vy = (p1.y - p0.y) / dt;
        const v2 = vx * vx + vy * vy;
        const vMax2 = vMax * vMax;
        if (vMax2 < v2) {
          const v = Math.sqrt(v2);
          vx = vx * vMax / v;
          vy = vy * vMax / v;
        }
      } else {
        vx = 0;
        vy = 0;
      }
      this.vx = vx;
      this.vy = vy;
    } else if (p0 !== void 0) {
      this.vx = 0;
      this.vy = 0;
    }
  }

  /** @hidden */
  integrateVelocity(t: number): void {
    const dt = t - this.t;
    if (dt !== 0) {
      let vx = this.vx + this.ax * dt;
      let x: number;
      if (vx < 0 === this.vx < 0) {
        x = this.x + this.vx * dt + 0.5 * (this.ax * dt * dt);
      } else {
        x = this.x - (this.vx * this.vx) / (2 * this.ax);
        vx = 0;
        this.ax = 0;
      }

      let vy = this.vy + this.ay * dt;
      let y: number;
      if (vy < 0 === this.vy < 0) {
        y = this.y + this.vy * dt + 0.5 * (this.ay * dt * dt);
      } else {
        y = this.y - (this.vy * this.vy) / (2 * this.ay);
        vy = 0;
        this.ay = 0;
      }

      this.dx = x - this.x;
      this.dy = y - this.y;
      this.dt = dt;
      this.x = x;
      this.y = y;
      this.t = t;
      this.vx = vx;
      this.vy = vy;
    }
  }
}
