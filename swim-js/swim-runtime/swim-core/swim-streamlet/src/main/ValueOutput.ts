// Copyright 2015-2022 Swim.inc
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

import type {Mutable} from "@swim/util";
import {AbstractInlet} from "./AbstractInlet";

/** @public */
export class ValueOutput<I> extends AbstractInlet<I> {
  constructor(state?: I) {
    super();
    this.state = state;
  }

  /** @internal */
  readonly state: I | undefined;

  get(): I | undefined {
    return this.state;
  }

  protected override onRecohereOutput(version: number): void {
    const input = this.input;
    if (input !== null) {
      (this as Mutable<this>).state = input.get();
    }
  }
}
