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

import {Lazy} from "@swim/util";
import type {Sprite} from "./Sprite";
import {SpriteSheet} from "./SpriteSheet";

/** @public */
export class SpriteService {
  constructor(canvasWidth?: number, canvasHeight?: number, pixelRatio?: number,
              minSizeClass?: number, maxSizeClass?: number) {
    if (pixelRatio === void 0) {
      pixelRatio = window.devicePixelRatio || 1;
    }
    if (canvasWidth === void 0) {
      canvasWidth = Math.floor(SpriteService.TextureWidth / pixelRatio);
    }
    if (canvasHeight === void 0) {
      canvasHeight = Math.floor(SpriteService.TextureHeight / pixelRatio);
    }
    if (maxSizeClass === void 0) {
      maxSizeClass = Math.floor(Math.log2(Math.min(canvasWidth, canvasHeight) / 4));
    }
    if (minSizeClass === void 0) {
      minSizeClass = Math.min(4, maxSizeClass);
    }
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.minSizeClass = minSizeClass;
    this.maxSizeClass = maxSizeClass;
    this.pixelRatio = pixelRatio;

    const slabCount = maxSizeClass - minSizeClass + 1;
    const slabs = new Array<SpriteSheet | null>(slabCount);
    for (let i = 0; i < slabCount; i += 1) {
      slabs[i] = null;
    }
    this.slabs = slabs;
  }

  readonly canvasWidth: number;

  readonly canvasHeight: number;

  readonly pixelRatio: number;

  readonly minSizeClass: number;

  readonly maxSizeClass: number;

  readonly slabs: ReadonlyArray<SpriteSheet | null>;

  /** @internal */
  protected createSlab(sizeClass: number): SpriteSheet {
    const spriteSize = 1 << sizeClass;
    return new SpriteSheet(spriteSize, spriteSize, this.canvasWidth, this.canvasHeight, this.pixelRatio);
  }

  /** @internal */
  getFreeSlab(sizeClass: number): SpriteSheet | null {
    sizeClass = Math.max(this.minSizeClass, sizeClass);
    if (sizeClass <= this.maxSizeClass) {
      const index = sizeClass - this.minSizeClass;
      const slabs = this.slabs as Array<SpriteSheet | null>;
      let slab: SpriteSheet | null = slabs[index]!;
      if (slab === null) {
        slab = this.createSlab(sizeClass);
        slabs[index] = slab;
      } else if (slab.freeCount === 0) {
        let freeSlab = SpriteSheet.acquireNextFreeSheet(slab);
        if (freeSlab === null) {
          freeSlab = this.createSlab(sizeClass);
        }
        freeSlab.nextSheet = slab;
        slab = freeSlab;
        slabs[index] = slab;
      }
      return slab;
    }
    return null;
  }

  /** @internal */
  protected createSheet(width: number, height: number): SpriteSheet {
    return new SpriteSheet(width, height, width, height, this.pixelRatio);
  }

  /** @internal */
  getFreeSheet(width: number, height: number): SpriteSheet {
    const widthClass = Math.ceil(Math.log2(width));
    const heightClass = Math.ceil(Math.log2(height));
    const sizeClass = Math.max(widthClass, heightClass);
    let sheet = this.getFreeSlab(sizeClass);
    if (sheet === null) {
      sheet = this.createSheet(width, height);
    }
    return sheet;
  }

  acquireSprite(width: number, height: number): Sprite {
    const sheet = this.getFreeSheet(width, height);
    const sprite = sheet.acquireSprite()!;
    // assert(sprite !== null);
    return sprite;
  }

  @Lazy
  static global(): SpriteService {
    return new SpriteService();
  }

  /** @internal */
  static readonly TextureWidth: number = 512;
  /** @internal */
  static readonly TextureHeight: number = 512;
}
