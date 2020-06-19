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

import {Streamlet} from "./Streamlet";
import {GenericStreamlet} from "./GenericStreamlet";
import {AbstractOutlet} from "./AbstractOutlet";

/**
 * An `Outlet` that decoheres a parameterized `Streamlet` whenever the
 * `Outlet` decoheres, and which gets its state from the parameterized
 * `Streamlet`.
 */
export class StreamletOutlet<O> extends AbstractOutlet<O> {
  /** @hidden */
  protected readonly _streamlet: Streamlet<unknown, O>;

  constructor(streamlet: Streamlet<unknown, O>) {
    super();
    this._streamlet = streamlet;
  }

  streamlet(): Streamlet<unknown, O> {
    return this._streamlet;
  }

  get(): O | undefined {
    const streamlet = this._streamlet as GenericStreamlet<unknown, O>;
    if (streamlet.getOutput !== void 0) {
      return streamlet.getOutput(this);
    }
    return void 0;
  }

  protected willDecohereInput(): void {
    const streamlet = this._streamlet as GenericStreamlet<unknown, O>;
    if (streamlet.willDecohereOutlet !== void 0) {
      streamlet.willDecohereOutlet(this);
    }
  }

  protected didDecohereInput(): void {
    const streamlet = this._streamlet as GenericStreamlet<unknown, O>;
    if (streamlet.didDecohereOutlet !== void 0) {
      streamlet.didDecohereOutlet(this);
    } else {
      streamlet.decohere();
    }
  }

  protected willRecohereInput(version: number): void {
    const streamlet = this._streamlet as GenericStreamlet<unknown, O>;
    if (streamlet.willRecohereOutlet !== void 0) {
      streamlet.willRecohereOutlet(this, version);
    }
  }

  protected didRecohereInput(version: number): void {
    const streamlet = this._streamlet as GenericStreamlet<unknown, O>;
    if (streamlet.didRecohereOutlet !== void 0) {
      streamlet.didRecohereOutlet(this, version);
    }
  }
}
