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

import {Map} from "@swim/util";
import {Value, Form} from "@swim/structure";
import {Outlet, Inoutlet, StreamletScope, Out, Inout} from "@swim/streamlet";
import {AbstractRecordStreamlet, Transmuter} from "@swim/dataflow";
import {DownlinkType, Downlink} from "./Downlink";
import {ValueDownlink} from "./ValueDownlink";
import {DownlinkRecord} from "./DownlinkRecord";
import {MapDownlinkRecord} from "./MapDownlinkRecord";
import {DownlinkTransmuter} from "./DownlinkTransmuter";
import {SwimRef} from "../SwimRef";
import {client} from "..";

export class DownlinkStreamlet extends AbstractRecordStreamlet {
  swim: SwimRef | undefined;
  downlink: Downlink | undefined;
  /** @hidden */
  downlinkRecord: DownlinkRecord | undefined;
  /** @hidden */
  inputHostUri: string | undefined;
  /** @hidden */
  inputNodeUri: string | undefined;
  /** @hidden */
  inputLaneUri: string | undefined;
  /** @hidden */
  inputPrio: number | undefined;
  /** @hidden */
  inputRate: number | undefined;
  /** @hidden */
  inputBody: Value | undefined;
  /** @hidden */
  inputType: DownlinkType | undefined;

  constructor(swim?: SwimRef, scope?: StreamletScope<Value> | null) {
    super(scope);
    this.swim = swim;
  }

  @Inout
  hostUri: Inoutlet<Value> = this.inoutlet();

  @Inout
  nodeUri: Inoutlet<Value> = this.inoutlet();

  @Inout
  laneUri: Inoutlet<Value> = this.inoutlet();

  @Inout
  prio: Inoutlet<Value> = this.inoutlet();

  @Inout
  rate: Inoutlet<Value> = this.inoutlet();

  @Inout("body")
  bodyValue: Inoutlet<Value> = this.inoutlet();

  @Inout
  type: Inoutlet<Value> = this.inoutlet();

  @Out
  state: Outlet<Value | Map<Value, Value>>;

  getOutput(outlet: Outlet<Value> | string): Value | undefined {
    outlet = this.outlet(outlet)!;
    if (outlet === this.state) {
      if (this.downlink instanceof ValueDownlink) {
        return this.downlink.get();
      } else if (this.downlinkRecord) {
        return this.downlinkRecord;
      }
    }
    return void 0;
  }

  protected onReconcile(version: number): void {
    const hostUri = this.castInput(this.hostUri, Form.forString());
    const nodeUri = this.castInput(this.nodeUri, Form.forString());
    const laneUri = this.castInput(this.laneUri, Form.forString());
    const prio = this.castInput(this.prio, Form.forNumber(), 0);
    const rate = this.castInput(this.rate, Form.forNumber(), 0);
    const body = this.getInput(this.bodyValue);
    const type = this.castInput(this.type, Form.forString(), void 0) as DownlinkType | undefined;
    if (hostUri !== this.inputHostUri || nodeUri !== this.inputNodeUri || laneUri !== this.inputLaneUri
        || prio !== this.inputPrio || rate !== this.inputRate
        || (body === void 0 ? this.inputBody !== void 0 : !body.equals(this.inputBody))
        || type !== this.inputType) {
      if (this.downlink) {
        this.downlink.close();
        this.downlink = void 0;
        this.downlinkRecord = void 0;
      }
      this.inputHostUri = hostUri;
      this.inputNodeUri = nodeUri;
      this.inputLaneUri = laneUri;
      this.inputPrio = prio;
      this.inputRate = rate;
      this.inputBody = body;
      this.inputType = type;
      const swim = this.swim || client;
      if (type === "map") {
        let downlink = swim.downlinkMap();
        if (hostUri !== void 0) {
          downlink = downlink.hostUri(hostUri);
        }
        if (nodeUri !== void 0) {
          downlink = downlink.nodeUri(nodeUri);
        }
        if (laneUri !== void 0) {
          downlink = downlink.laneUri(laneUri);
        }
        if (prio !== 0) {
          downlink = downlink.prio(prio);
        }
        if (rate !== 0) {
          downlink = downlink.rate(rate);
        }
        if (body !== void 0) {
          downlink = downlink.body(body);
        }
        downlink = downlink.open();
        this.state = downlink;
        this.downlink = downlink;
        this.downlinkRecord = new MapDownlinkRecord(downlink);
      } else if (type === "value") {
        let downlink = swim.downlinkValue();
        if (hostUri !== void 0) {
          downlink = downlink.hostUri(hostUri);
        }
        if (nodeUri !== void 0) {
          downlink = downlink.nodeUri(nodeUri);
        }
        if (laneUri !== void 0) {
          downlink = downlink.laneUri(laneUri);
        }
        if (prio !== void 0) {
          downlink = downlink.prio(prio);
        }
        if (rate !== void 0) {
          downlink = downlink.rate(rate);
        }
        if (body !== void 0) {
          downlink = downlink.body(body);
        }
        downlink = downlink.open();
        this.state = downlink;
        this.downlink = downlink;
      }
    }
  }

  private static _transmuter: DownlinkTransmuter | undefined;

  static transmuter(swim?: SwimRef): Transmuter {
    if (swim === void 0) {
      if (!DownlinkStreamlet._transmuter) {
        DownlinkStreamlet._transmuter = new DownlinkTransmuter();
      }
      return DownlinkStreamlet._transmuter;
    } else {
      return new DownlinkTransmuter(swim);
    }
  }
}
