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
import {AbstractOutlet} from "./AbstractOutlet";

/**
 * An `Outlet` that decoheres a parameterized `Streamlet` whenever the
 * `Outlet` decoheres, and which gets its state from the parameterized
 * `Streamlet`.
 */
export class StreamletOutlet<O> extends AbstractOutlet<O> {
  constructor(streamlet: Streamlet<unknown, O>) {
    super();
    this.streamlet = streamlet;
  }

  readonly streamlet: Streamlet<unknown, O>;

  override get(): O | undefined {
    const streamlet = this.streamlet as GenericStreamlet<unknown, O>;
    if (streamlet.getOutput !== void 0) {
      return streamlet.getOutput(this);
    } else {
      return void 0;
    }
  }

  protected override willDecohereInput(): void {
    const streamlet = this.streamlet as GenericStreamlet<unknown, O>;
    if (streamlet.willDecohereOutlet !== void 0) {
      streamlet.willDecohereOutlet(this);
    }
  }

  protected override didDecohereInput(): void {
    const streamlet = this.streamlet as GenericStreamlet<unknown, O>;
    if (streamlet.didDecohereOutlet !== void 0) {
      streamlet.didDecohereOutlet(this);
    } else {
      streamlet.decohere();
    }
  }

  protected override willRecohereInput(version: number): void {
    const streamlet = this.streamlet as GenericStreamlet<unknown, O>;
    if (streamlet.willRecohereOutlet !== void 0) {
      streamlet.willRecohereOutlet(this, version);
    }
  }

  protected override didRecohereInput(version: number): void {
    const streamlet = this.streamlet as GenericStreamlet<unknown, O>;
    if (streamlet.didRecohereOutlet !== void 0) {
      streamlet.didRecohereOutlet(this, version);
    }
  }
}
