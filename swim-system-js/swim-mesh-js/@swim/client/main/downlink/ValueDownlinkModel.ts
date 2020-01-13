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

import {Value} from "@swim/structure";
import {Uri} from "@swim/uri";
import {EventMessage} from "@swim/warp";
import {Host} from "../host/Host";
import {DownlinkContext} from "./DownlinkContext";
import {DownlinkModel} from "./DownlinkModel";
import {DownlinkType} from "./Downlink";
import {ValueDownlink} from "./ValueDownlink";

/** @hidden */
export class ValueDownlinkModel extends DownlinkModel {
  /** @hidden */
  _views: ValueDownlink<unknown>[];
  /** @hidden */
  _state: Value;

  constructor(context: DownlinkContext, hostUri: Uri, nodeUri: Uri, laneUri: Uri,
              prio?: number, rate?: number, body?: Value, state: Value = Value.absent()) {
    super(context, hostUri, nodeUri, laneUri, prio, rate, body);
    this._state = state;
  }

  type(): DownlinkType {
    return "value";
  }

  get(): Value {
    return this._state;
  }

  set(newValue: Value): void {
    newValue = this.valueWillSet(newValue);
    const oldValue = this._state;
    this.setState(newValue);
    this.valueDidSet(newValue, oldValue);
    this.command(newValue);
  }

  setState(state: Value): void {
    this._state = state;
  }

  onEventMessage(message: EventMessage, host: Host): void {
    super.onEventMessage(message, host);
    this.onSetEvent(message.body());
  }

  protected onSetEvent(newValue: Value): void {
    newValue = this.valueWillSet(newValue);
    const oldValue = this._state;
    this.setState(newValue);
    this.valueDidSet(newValue, oldValue);
  }

  protected valueWillSet(newValue: Value): Value {
    for (let i = 0; i < this._views.length; i += 1) {
      newValue = this._views[i].valueWillSet(newValue);
    }
    return newValue;
  }

  protected valueDidSet(newValue: Value, oldValue: Value): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].valueDidSet(newValue, oldValue);
    }
  }
}
