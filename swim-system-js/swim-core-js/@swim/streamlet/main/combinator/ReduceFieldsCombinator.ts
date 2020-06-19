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
import {ReduceFieldsOperator} from "./ReduceFieldsOperator";

export class ReduceFieldsCombinator<K, V, I, O> extends ReduceFieldsOperator<K, V, I, O> {
  /** @hidden */
  protected readonly _identity: O;
  /** @hidden */
  protected readonly _accumulator: (result: O, element: V) => O;
  /** @hidden */
  protected readonly _combiner: (result: O, result2: O) => O;

  constructor(identity: O, accumulator: (result: O, element: V) => O,
              combiner: (result: O, result2: O) => O) {
    super();
    this._identity = identity;
    this._accumulator = accumulator;
    this._combiner = combiner;
  }

  get(): O {
    return this._state.reduced(this._identity, this._accumulator, this._combiner);
  }

  identity(): O {
    return this._identity;
  }

  accumulate(result: O, value: V): O {
    return this._accumulator(result, value);
  }

  combine(result: O, value: O): O {
    return this._combiner(result, value);
  }
}
MapOutlet.ReduceFieldsCombinator = ReduceFieldsCombinator;
