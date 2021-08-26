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

import {ReduceFieldsOperator} from "./ReduceFieldsOperator";

export class ReduceFieldsCombinator<K, V, I, O> extends ReduceFieldsOperator<K, V, I, O> {
  constructor(identity: O, accumulator: (result: O, element: V) => O,
              combiner: (result: O, result2: O) => O) {
    super();
    Object.defineProperty(this, "identity", {
      value: identity,
      enumerable: true,
    });
    Object.defineProperty(this, "accumulator", {
      value: accumulator,
      enumerable: true,
    });
    Object.defineProperty(this, "combiner", {
      value: combiner,
      enumerable: true,
    });
  }

  override get(): O {
    return this.state.reduced(this.identity, this.accumulator, this.combiner);
  }

  override readonly identity!: O;

  /** @hidden */
  readonly accumulator!: (result: O, element: V) => O;

  override accumulate(result: O, value: V): O {
    const accumulator = this.accumulator;
    return accumulator(result, value);
  }

  /** @hidden */
  readonly combiner!: (result: O, result2: O) => O;

  override combine(result: O, value: O): O {
    const combiner = this.combiner;
    return combiner(result, value);
  }
}
