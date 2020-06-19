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

import {MapOutlet} from "../MapOutlet";
import {FilterFieldsFunction} from "../function";
import {FilterFieldsOperator} from "./FilterFieldsOperator";

export class FilterFieldsCombinator<K, V, I> extends FilterFieldsOperator<K, V, I> {
  /** @hidden */
  protected readonly _func: FilterFieldsFunction<K, V>;

  constructor(func: FilterFieldsFunction<K, V>) {
    super();
    this._func = func;
  }

  evaluate(key: K, value: V): boolean {
    return this._func(key, value);
  }
}
MapOutlet.FilterFieldsCombinator = FilterFieldsCombinator;
