// Copyright 2015-2021 Swim inc.
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

import type {Outlet} from "../Outlet";
import {AbstractInoutlet} from "../AbstractInoutlet";

export class MemoizeValueCombinator<IO> extends AbstractInoutlet<IO, IO> {
  constructor() {
    super();
    Object.defineProperty(this, "state", {
      value: void 0,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  readonly state!: IO | undefined;

  override get(): IO | undefined {
    return this.state;
  }

  protected override onRecohere(version: number): void {
    const input = this.input;
    if (input !== null) {
      Object.defineProperty(this, "state", {
        value: input.get(),
        enumerable: true,
        configurable: true,
      });
    }
  }

  override memoize(): Outlet<IO> {
    return this;
  }
}
