// Copyright 2015-2023 Swim.inc
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
import {Value} from "@swim/structure";
import type {Uri} from "@swim/uri";
import type {EventMessage} from "@swim/warp";
import {WarpDownlinkModel} from "./WarpDownlinkModel";
import type {ValueDownlink} from "./ValueDownlink";
import type {WarpHost} from "../host/WarpHost";

/** @internal */
export class ValueDownlinkModel extends WarpDownlinkModel {
  constructor(hostUri: Uri, nodeUri: Uri, laneUri: Uri,
              prio: number, rate: number, body: Value, state: Value | null) {
    super(hostUri, nodeUri, laneUri, prio, rate, body);
    if (state === null) {
      state = Value.absent();
    }
    this.state = state;
  }

  override readonly views!: ReadonlyArray<ValueDownlink<unknown>>;

  /** @internal */
  readonly state: Value;

  get(): Value {
    return this.state;
  }

  set(newValue: Value): void {
    newValue = this.valueWillSet(newValue);
    const oldValue = this.state;
    this.setState(newValue);
    this.valueDidSet(newValue, oldValue);
    this.command(newValue);
  }

  setState(state: Value): void {
    (this as Mutable<this>).state = state;
  }

  override onEventMessage(message: EventMessage, host: WarpHost): void {
    super.onEventMessage(message, host);
    this.onSetEvent(message.body);
  }

  protected onSetEvent(newValue: Value): void {
    newValue = this.valueWillSet(newValue);
    const oldValue = this.state;
    this.setState(newValue);
    this.valueDidSet(newValue, oldValue);
  }

  protected valueWillSet(newValue: Value): Value {
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      newValue = views[i]!.valueWillSet(newValue);
    }
    return newValue;
  }

  protected valueDidSet(newValue: Value, oldValue: Value): void {
    const views = this.views;
    for (let i = 0, n = views.length; i < n; i += 1) {
      views[i]!.valueDidSet(newValue, oldValue);
    }
  }
}
