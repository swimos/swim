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

import type {MapFieldValuesFunction} from "../function";
import {MapFieldValuesOperator} from "./MapFieldValuesOperator";

export class MapFieldValuesCombinator<K, VI, VO, I> extends MapFieldValuesOperator<K, VI, VO, I> {
  constructor(func: MapFieldValuesFunction<K, VI, VO> ) {
    super();
    Object.defineProperty(this, "func", {
      value: func,
      enumerable: true,
    });
  }

  /** @hidden */
  readonly func!: MapFieldValuesFunction<K, VI, VO>;

  override evaluate(key: K, value: VI | undefined): VO | undefined {
    if (value !== void 0) {
      const func = this.func;
      return func(key, value);
    } else {
      return void 0;
    }
  }
}
