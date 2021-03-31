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

import type {WatchFieldsFunction} from "../function";
import {WatchFieldsOperator} from "./WatchFieldsOperator";

export class WatchFieldsCombinator<K, V, O> extends WatchFieldsOperator<K, V, O> {
  constructor(func: WatchFieldsFunction<K, V>) {
    super();
    Object.defineProperty(this, "func", {
      value: func,
      enumerable: true,
    });
  }

  /** @hidden */
  declare readonly func: WatchFieldsFunction<K, V>;

  evaluate(key: K, value: V | undefined): void {
    if (value !== void 0) {
      const func = this.func;
      return func(key, value);
    }
  }
}
