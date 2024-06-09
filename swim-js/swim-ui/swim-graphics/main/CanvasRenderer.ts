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

import type {Mutable} from "@swim/util";
import type {Transform} from "@swim/math";
import {PaintingRenderer} from "./PaintingRenderer";
import type {CanvasContext} from "./CanvasContext";

/** @public */
export class CanvasRenderer extends PaintingRenderer {
  constructor(context: CanvasContext, transform: Transform, pixelRatio: number) {
    super();
    this.context = context;
    this.transform = transform;
    this.pixelRatio = pixelRatio;
  }

  override readonly context: CanvasContext;

  override readonly transform: Transform;

  setTransform(transform: Transform): void {
    (this as Mutable<this>).transform = transform;
  }

  override readonly pixelRatio: number;
}
