// Copyright 2015-2020 SWIM.AI inc.
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
import {MapValueFunction} from "../function";
import {MapValueOperator} from "./MapValueOperator";

export class MapValueCombinator<I, O> extends MapValueOperator<I, O> {
  /** @hidden */
  protected readonly _func: MapValueFunction<I, O>;

  constructor(func: MapValueFunction<I, O>) {
    super();
    this._func = func;
  }

  evaluate(value: I | undefined): O | undefined {
    if (value !== void 0) {
      return this._func(value);
    } else {
      return void 0;
    }
  }
}
Outlet.MapValueCombinator = MapValueCombinator;
