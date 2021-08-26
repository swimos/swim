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

import {GraphicsRenderer} from "../graphics/GraphicsRenderer";
import type {WebGLContext} from "./WebGLContext";

export class WebGLRenderer extends GraphicsRenderer {
  constructor(context: WebGLContext, pixelRatio?: number) {
    super();
    Object.defineProperty(this, "context", {
      value: context,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "pixelRatio", {
      value: pixelRatio !== void 0 ? pixelRatio : window.devicePixelRatio || 1,
      enumerable: true,
      configurable: true,
    });
  }

  readonly context!: WebGLContext;

  readonly pixelRatio!: number;
}
