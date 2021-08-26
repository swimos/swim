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

export type GestureInputType = "mouse" | "wheel" | "touch" | "pen" | "unknown";

export class GestureInput {
  readonly inputId: string;
  inputType: GestureInputType;
  isPrimary: boolean;

  target: EventTarget | null;
  button: number;
  buttons: number;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;

  width: number;
  height: number;
  tiltX: number;
  tiltY: number;
  twist: number;
  pressure: number;
  tangentialPressure: number;

  x0: number;
  y0: number;
  t0: number;
  dx: number;
  dy: number;
  dt: number;
  x: number;
  y: number;
  t: number;

  detail: unknown;

  defaultPrevented: boolean;

  constructor(inputId: string, inputType: GestureInputType, isPrimary: boolean,
              x: number, y: number, t: number) {
    this.inputId = inputId;
    this.inputType = inputType;
    this.isPrimary = isPrimary;

    this.target = null;
    this.button = 0;
    this.buttons = 0;
    this.altKey = false;
    this.ctrlKey = false;
    this.metaKey = false;
    this.shiftKey = false;

    this.width = 0;
    this.height = 0;
    this.tiltX = 0;
    this.tiltY = 0;
    this.twist = 0;
    this.pressure = 0;
    this.tangentialPressure = 0;

    this.x0 = x;
    this.y0 = y;
    this.t0 = t;
    this.dx = 0;
    this.dy = 0;
    this.dt = 0;
    this.x = x;
    this.y = y;
    this.t = t;

    this.detail = void 0;

    this.defaultPrevented = false;
  }

  preventDefault(): void {
    this.defaultPrevented = true;
  }
}
