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

import {Value} from "@swim/structure";
import type {Uri} from "@swim/uri";
import type {EventMessage} from "@swim/warp";
import type {Host} from "../host/Host";
import type {DownlinkContext} from "./DownlinkContext";
import {DownlinkModel} from "./DownlinkModel";
import type {DownlinkType} from "./Downlink";
import type {ValueDownlink} from "./ValueDownlink";

/** @hidden */
export class ValueDownlinkModel extends DownlinkModel {
  constructor(context: DownlinkContext, hostUri: Uri, nodeUri: Uri, laneUri: Uri,
              prio?: number, rate?: number, body?: Value, state: Value = Value.absent()) {
    super(context, hostUri, nodeUri, laneUri, prio, rate, body);
    Object.defineProperty(this, "state", {
      value: state,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly views!: ReadonlyArray<ValueDownlink<unknown>>;

  /** @hidden */
  readonly state!: Value;

  override get type(): DownlinkType {
    return "value";
  }

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
    Object.defineProperty(this, "state", {
      value: state,
      enumerable: true,
      configurable: true,
    });
  }

  override onEventMessage(message: EventMessage, host: Host): void {
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
