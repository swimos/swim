// Copyright 2015-2022 Swim.inc
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

/** @public */
export interface R2CurveContext {
  moveTo(x: number, y: number): void;

  lineTo(x: number, y: number): void;

  quadraticCurveTo(x1: number, y1: number, x: number, y: number): void;

  bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): void;

  arcTo(x1: number, y1: number, x2: number, y2: number, r: number): void;

  arc(cx: number, cy: number, r: number, a0: number, a1: number, ccw?: boolean): void;

  ellipse(cx: number, cy: number, rx: number, ry: number, phi: number, a0: number, a1: number, ccw?: boolean): void;
}
