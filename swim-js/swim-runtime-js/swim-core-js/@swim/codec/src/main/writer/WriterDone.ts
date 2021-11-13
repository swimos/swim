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

import type {Output} from "../output/Output";
import {Writer} from "./Writer";

/** @internal */
export class WriterDone<O> extends Writer<unknown, O> {
  /** @internal */
  readonly value!: O;

  constructor(value: O) {
    super();
    Object.defineProperty(this, "value", {
      value: value,
      enumerable: true,
    });
  }

  override isCont(): boolean {
    return false;
  }

  override isDone(): boolean {
    return true;
  }

  override pull(output: Output): Writer<unknown, O> {
    return this;
  }

  override bind(): O {
    return this.value;
  }

  override asDone<I2>(): Writer<I2, O> {
    return this;
  }

  override andThen<O2>(that: Writer<unknown, O2>): Writer<unknown, O2> {
    return that;
  }
}
