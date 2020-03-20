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

import {AbstractInlet} from "./AbstractInlet";

export class ValueOutput<I> extends AbstractInlet<I> {
  /** @hidden */
  protected _state: I | undefined;

  constructor(state?: I) {
    super();
    this._state = state;
  }

  get(): I | undefined {
    return this._state;
  }

  protected onRecohereOutput(version: number): void {
    if (this._input !== null) {
      this._state = this._input.get();
    }
  }
}
