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

import {Transform} from "@swim/math";
import {PaintingRenderer} from "../painting/PaintingRenderer";
import type {SvgContext} from "./SvgContext";

/** @public */
export class SvgRenderer extends PaintingRenderer {
  constructor(context: SvgContext) {
    super();
    this.context = context;
  }

  override readonly context: SvgContext;

  override get transform(): Transform {
    return Transform.identity();
  }

  override get pixelRatio(): number {
    return 1;
  }
}