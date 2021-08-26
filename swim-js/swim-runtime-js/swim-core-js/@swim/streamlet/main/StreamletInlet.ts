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

import type {Streamlet} from "./Streamlet";
import type {GenericStreamlet} from "./GenericStreamlet";
import {AbstractInlet} from "./AbstractInlet";

/**
 * An `Inlet` that decoheres a parameterized `Streamlet` whenever the `Inlet`
 * decoheres, and that recoheres the parameterized `Streamlet` whenever the
 * `Inlet` recoheres.
 */
export class StreamletInlet<I> extends AbstractInlet<I> {
  constructor(streamlet: Streamlet<I, unknown>) {
    super();
    Object.defineProperty(this, "streamlet", {
      value: streamlet,
      enumerable: true,
    });
  }

  readonly streamlet!: Streamlet<I, unknown>;

  protected override willDecohereOutput(): void {
    const streamlet = this.streamlet as GenericStreamlet<I, unknown>;
    if (streamlet.willDecohereInlet !== void 0) {
      streamlet.willDecohereInlet(this);
    }
  }

  protected override didDecohereOutput(): void {
    const streamlet = this.streamlet as GenericStreamlet<I, unknown>;
    if (streamlet.didDecohereInlet !== void 0) {
      streamlet.didDecohereInlet(this);
    } else {
      streamlet.decohere();
    }
  }

  protected override willRecohereOutput(version: number): void {
    const streamlet = this.streamlet as GenericStreamlet<I, unknown>;
    if (streamlet.willRecohereInlet !== void 0) {
      streamlet.willRecohereInlet(this, version);
    }
  }

  protected override didRecohereOutput(version: number): void {
    const streamlet = this.streamlet as GenericStreamlet<I, unknown>;
    if (streamlet.didRecohereInlet !== void 0) {
      streamlet.didRecohereInlet(this, version);
    } else {
      streamlet.recohere(version);
    }
  }
}
