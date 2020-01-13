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

import {Streamlet} from "./Streamlet";
import {GenericStreamlet} from "./GenericStreamlet";
import {AbstractInlet} from "./AbstractInlet";

/**
 * An `Inlet` that invalidates a parameterized `Streamlet` whenever the `Inlet`
 * is invalidated, and that updates the parameterized `Streamlet` whenever the
 * `Inlet` updates.
 */
export class StreamletInlet<I> extends AbstractInlet<I> {
  /** @hidden */
  protected readonly _streamlet: Streamlet<I, unknown>;

  constructor(streamlet: Streamlet<I, unknown>) {
    super();
    this._streamlet = streamlet;
  }

  streamlet(): Streamlet<I, unknown> {
    return this._streamlet;
  }

  protected willInvalidateOutput(): void {
    const streamlet = this._streamlet as GenericStreamlet<I, unknown>;
    if (streamlet.willInvalidateInlet) {
      streamlet.willInvalidateInlet(this);
    }
  }

  protected didInvalidateOutput(): void {
    const streamlet = this._streamlet as GenericStreamlet<I, unknown>;
    if (streamlet.didInvalidateInlet) {
      streamlet.didInvalidateInlet(this);
    } else {
      streamlet.invalidate();
    }
  }

  protected willReconcileOutput(version: number): void {
    const streamlet = this._streamlet as GenericStreamlet<I, unknown>;
    if (streamlet.willReconcileInlet) {
      streamlet.willReconcileInlet(this, version);
    }
  }

  protected didReconcileOutput(version: number): void {
    const streamlet = this._streamlet as GenericStreamlet<I, unknown>;
    if (streamlet.didReconcileInlet) {
      streamlet.didReconcileInlet(this, version);
    } else {
      streamlet.reconcile(version);
    }
  }
}
