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

import {Outlet} from "../Outlet";
import {WatchValueFunction} from "../function";
import {WatchValueOperator} from "./WatchValueOperator";

export class WatchValueCombinator<I> extends WatchValueOperator<I> {
  /** @hidden */
  protected readonly _func: WatchValueFunction<I>;

  constructor(func: WatchValueFunction<I>) {
    super();
    this._func = func;
  }

  evaluate(value: I | undefined): void {
    if (value !== void 0) {
      return this._func(value);
    }
  }
}
Outlet.WatchValueCombinator = WatchValueCombinator;
