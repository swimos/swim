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

import {R2Box, Transform} from "@swim/math";
import {Sprite} from "./Sprite";
import type {CanvasContext} from "../canvas/CanvasContext";
import {CanvasRenderer} from "../"; // forward import

export class SpriteSheet {
  constructor(spriteWidth: number, spriteHeight: number,
              canvasWidth: number, canvasHeight: number, pixelRatio: number) {
    const rowCount = Math.floor(canvasHeight / spriteHeight);
    const colCount = Math.floor(canvasWidth / spriteWidth);
    const spriteCount = rowCount * colCount;
    const sprites = new Array<Sprite>(spriteCount);
    const freeSprites = new Array<Sprite>(spriteCount);

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth * pixelRatio;
    canvas.height = canvasHeight * pixelRatio;
    canvas.style.width = canvasWidth + "px";
    canvas.style.height = canvasHeight + "px";
    const context = canvas.getContext("2d")!
    const renderer = new CanvasRenderer(context, Transform.identity(), pixelRatio);

    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
    this.sprites = sprites;
    this.freeSprites = freeSprites;
    this.canvas = canvas;
    this.renderer = renderer;
    this.nextSheet = null;

    this.createSprites(sprites, rowCount, colCount);

    for (let k = 0; k < spriteCount; k += 1) {
      freeSprites[k] = sprites[spriteCount - k - 1]!;
    }
  }

  protected createSprites(sprites: Sprite[], rowCount: number, colCount: number): void {
    let k = 0;
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      for (let colIndex = 0; colIndex < colCount; colIndex += 1) {
        const sprite = this.createSprite(rowIndex, colIndex);
        sprites[k] = sprite;
        k += 1;
      }
    }
  }

  protected createSprite(rowIndex: number, colIndex: number): Sprite {
    return new Sprite(this, rowIndex, colIndex);
  }

  readonly spriteWidth: number;

  readonly spriteHeight: number;

  readonly sprites: ReadonlyArray<Sprite>;

  /** @internal */
  readonly freeSprites: Sprite[];

  readonly canvas: HTMLCanvasElement;

  readonly renderer: CanvasRenderer;

  /** @internal */
  nextSheet: SpriteSheet | null;

  get pixelRatio(): number {
    return this.renderer.pixelRatio;
  }

  get canvasWidth(): number {
    return this.canvas.width / this.pixelRatio;
  }

  get canvasHeight(): number {
    return this.canvas.height / this.pixelRatio;
  }

  get rowCount(): number {
    return Math.floor(this.canvasHeight / this.spriteHeight);
  }

  get colCount(): number {
    return Math.floor(this.canvasWidth / this.spriteWidth);
  }

  get spriteCount(): number {
    return this.rowCount * this.colCount;
  }

  get freeCount(): number {
    return this.freeSprites.length;
  }

  /** @internal */
  static acquireNextFreeSheet(sheet: SpriteSheet): SpriteSheet | null {
    do {
      const nextSheet = sheet.nextSheet;
      if (nextSheet === null) {
        return null;
      } else if (nextSheet.freeCount !== 0) {
        sheet.nextSheet = nextSheet.nextSheet;
        nextSheet.nextSheet = null;
        return nextSheet;
      } else {
        sheet = nextSheet;
      }
    } while (true);
  }

  acquireSprite(): Sprite | null {
    const sprite = this.freeSprites.pop();
    return sprite !== void 0 ? sprite : null;
  }

  /** @internal */
  releaseSprite(sprite: Sprite): void {
    // assert(sprite.sheet === this);
    // assert(this.freeSprites.indexOf(sprite) < 0);
    this.clearSprite(sprite.rowIndex, sprite.colIndex);
    this.freeSprites.push(sprite);
  }

  /** @internal */
  clearSprite(rowIndex: number, colIndex: number): void {
    const renderer = this.getSpriteRenderer(rowIndex, colIndex);
    renderer.context.clearRect(0, 0, this.spriteWidth, this.spriteHeight);
  }

  /** @internal */
  getSpriteRenderer(rowIndex: number, colIndex: number): CanvasRenderer {
    const renderer = this.renderer;
    const context = renderer.context;
    const pixelRatio = renderer.pixelRatio;
    const dx = rowIndex * this.spriteWidth * pixelRatio;
    const dy = colIndex * this.spriteHeight * pixelRatio;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, dx, dy);
    renderer.setTransform(Transform.affine(pixelRatio, 0, 0, pixelRatio, dx, dy));
    return renderer;
  }

  /** @internal */
  drawSprite(context: CanvasContext, frame: R2Box, rowIndex: number, colIndex: number): void {
    const spritePixelRatio = this.renderer.pixelRatio;
    const spriteWidth = this.spriteWidth * spritePixelRatio;
    const spriteHeight = this.spriteHeight * spritePixelRatio;
    const spriteX = rowIndex * spriteWidth;
    const spriteY = colIndex * spriteHeight;
    context.drawImage(this.canvas, spriteX, spriteY, spriteWidth, spriteHeight,
                      frame.x, frame.y, this.spriteWidth, this.spriteHeight);
  }
}
