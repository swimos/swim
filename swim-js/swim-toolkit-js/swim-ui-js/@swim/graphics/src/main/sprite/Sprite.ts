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

import type {R2Box} from "@swim/math";
import type {CanvasContext} from "../canvas/CanvasContext";
import type {CanvasRenderer} from "../canvas/CanvasRenderer";
import type {SpriteSheet} from "./SpriteSheet";

/** @public */
export class Sprite {
  /** @internal */
  constructor(sheet: SpriteSheet, rowIndex: number, colIndex: number) {
    this.sheet = sheet;
    this.rowIndex = rowIndex;
    this.colIndex = colIndex;
  }

  /** @internal */
  readonly sheet: SpriteSheet;

  /** @internal */
  readonly rowIndex: number;

  /** @internal */
  readonly colIndex: number;

  get width(): number {
    return this.sheet.spriteWidth;
  }

  get height(): number {
    return this.sheet.spriteHeight;
  }

  get pixelRatio(): number {
    return this.sheet.pixelRatio;
  }

  getRenderer(): CanvasRenderer {
    return this.sheet.getSpriteRenderer(this.rowIndex, this.colIndex);
  }

  clear(): void {
    return this.sheet.clearSprite(this.rowIndex, this.colIndex);
  }

  draw(context: CanvasContext, frame: R2Box): void {
    this.sheet.drawSprite(context, frame, this.rowIndex, this.colIndex);
  }

  release(): void {
    this.sheet.releaseSprite(this);
  }
}
