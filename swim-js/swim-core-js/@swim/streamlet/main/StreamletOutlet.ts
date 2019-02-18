// Copyright 2015-2019 SWIM.AI inc.
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
 * An `Outlet` that invalidates a parameterized `Streamlet` whenever the
 * `Outlet` is invalidated, and which gets its state from the parameterized
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
    if (streamlet.getOutput) {
      return streamlet.getOutput(this);
    }
    return void 0;
  }

  protected willInvalidateInput(): void {
    const streamlet = this._streamlet as GenericStreamlet<unknown, O>;
    if (streamlet.willInvalidateOutlet) {
      streamlet.willInvalidateOutlet(this);
    }
  }

  protected didInvalidateInput(): void {
    const streamlet = this._streamlet as GenericStreamlet<unknown, O>;
    if (streamlet.didInvalidateOutlet) {
      streamlet.didInvalidateOutlet(this);
    } else {
      streamlet.invalidate();
    }
  }

  protected willReconcileInput(version: number): void {
    const streamlet = this._streamlet as GenericStreamlet<unknown, O>;
    if (streamlet.willReconcileOutlet) {
      streamlet.willReconcileOutlet(this, version);
    }
  }

  protected didReconcileInput(version: number): void {
    const streamlet = this._streamlet as GenericStreamlet<unknown, O>;
    if (streamlet.didReconcileOutlet) {
      streamlet.didReconcileOutlet(this, version);
    }
  }
}
