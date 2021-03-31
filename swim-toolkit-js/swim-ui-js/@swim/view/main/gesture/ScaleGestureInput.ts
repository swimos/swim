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

import type {GestureInputType} from "./GestureInput";
import {MomentumGestureInput} from "./MomentumGestureInput";

export class ScaleGestureInput<X, Y> extends MomentumGestureInput {
  xCoord: X | undefined;
  yCoord: Y | undefined;
  disableX: boolean;
  disableY: boolean;

  constructor(inputId: string, inputType: GestureInputType, isPrimary: boolean,
              x: number, y: number, t: number) {
    super(inputId, inputType, isPrimary, x, y, t);
    this.xCoord = void 0;
    this.yCoord = void 0;
    this.disableX = false;
    this.disableY = false;
  }
}
