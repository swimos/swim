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

import {AbstractOutlet} from "./AbstractOutlet";

export class ValueInput<O> extends AbstractOutlet<O> {
  constructor(state?: O) {
    super();
    Object.defineProperty(this, "state", {
      value: state,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  readonly state!: O | undefined;

  override get(): O | undefined {
    return this.state;
  }

  set(newState: O | undefined): O | undefined {
    const oldState = this.state;
    if (oldState !== newState) {
      Object.defineProperty(this, "state", {
        value: newState,
        enumerable: true,
        configurable: true,
      });
      this.decohereInput();
    }
    return oldState;
  }
}
