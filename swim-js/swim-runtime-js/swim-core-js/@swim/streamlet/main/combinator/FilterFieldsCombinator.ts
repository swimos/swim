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

import type {FilterFieldsFunction} from "../function";
import {FilterFieldsOperator} from "./FilterFieldsOperator";

export class FilterFieldsCombinator<K, V, I> extends FilterFieldsOperator<K, V, I> {
  constructor(func: FilterFieldsFunction<K, V>) {
    super();
    this.func = func;
  }

  /** @internal */
  readonly func: FilterFieldsFunction<K, V>;

  override evaluate(key: K, value: V): boolean {
    const func = this.func;
    return func(key, value);
  }
}
