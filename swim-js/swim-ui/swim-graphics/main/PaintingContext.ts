// Copyright 2015-2024 Nstream, inc.
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

import type {DrawingContext} from "./DrawingContext";

/** @public */
export type PaintingFillRule = "nonzero" | "evenodd";

/** @public */
export interface PaintingContext extends DrawingContext {
  globalAlpha: number;
  globalCompositeOperation: string;

  fillStyle: string | CanvasGradient | CanvasPattern;
  strokeStyle: string | CanvasGradient | CanvasPattern;

  lineWidth: number;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
  miterLimit: number;

  lineDashOffset: number;
  getLineDash(): number[];
  setLineDash(segments: number[]): void;

  beginPath(): void;
  fill(fillRule?: PaintingFillRule): void;
  stroke(): void;
}
