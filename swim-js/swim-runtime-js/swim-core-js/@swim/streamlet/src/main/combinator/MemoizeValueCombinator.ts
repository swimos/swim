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

import type {Mutable} from "@swim/util";
import type {Outlet} from "../Outlet";
import {AbstractInoutlet} from "../AbstractInoutlet";

/** @public */
export class MemoizeValueCombinator<IO> extends AbstractInoutlet<IO, IO> {
  constructor() {
    super();
    this.state = void 0;
  }

  /** @internal */
  readonly state: IO | undefined;

  override get(): IO | undefined {
    return this.state;
  }

  protected override onRecohere(version: number): void {
    const input = this.input;
    if (input !== null) {
      (this as Mutable<this>).state = input.get();
    }
  }

  override memoize(): Outlet<IO> {
    return this;
  }
}
