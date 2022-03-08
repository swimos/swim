// Copyright 2015-2022 Swim.inc
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

import type {Map} from "@swim/util";
import {Value, Form} from "@swim/structure";
import {Outlet, Inoutlet, StreamletScope, Out, Inout} from "@swim/streamlet";
import {AbstractRecordStreamlet, Reifier} from "@swim/dataflow";
import type {DownlinkType, Downlink} from "./Downlink";
import {ValueDownlink} from "./ValueDownlink";
import type {DownlinkRecord} from "./DownlinkRecord";
import {MapDownlinkRecord} from "./MapDownlinkRecord";
import {DownlinkReifier} from "./DownlinkReifier";
import type {WarpRef} from "../ref/WarpRef";
import {client} from "../"; // forward import

/** @public */
export class DownlinkStreamlet extends AbstractRecordStreamlet {
  constructor(warp: WarpRef | null = null, scope?: StreamletScope<Value> | null) {
    super(scope);
    this.warp = warp;
    this.downlink = null;
    this.downlinkRecord = null;

    this.inputHostUri = void 0;
    this.inputNodeUri = void 0;
    this.inputLaneUri = void 0;
    this.inputPrio = void 0;
    this.inputRate = void 0;
    this.inputBody = void 0;
    this.inputType = void 0;
  }

  warp: WarpRef | null;

  downlink: Downlink | null;

  /** @internal */
  downlinkRecord: DownlinkRecord | null;

  /** @internal */
  inputHostUri: string | undefined;
  /** @internal */
  inputNodeUri: string | undefined;
  /** @internal */
  inputLaneUri: string | undefined;
  /** @internal */
  inputPrio: number | undefined;
  /** @internal */
  inputRate: number | undefined;
  /** @internal */
  inputBody: Value | undefined;
  /** @internal */
  inputType: DownlinkType | undefined;

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
  state: Outlet<Value | Map<Value, Value>> = this.outlet();

  override getOutput(outlet: Outlet<Value> | string): Value | undefined {
    outlet = this.outlet(outlet)!;
    if (outlet === this.state) {
      if (this.downlink instanceof ValueDownlink) {
        return this.downlink.get();
      } else if (this.downlinkRecord !== null) {
        return this.downlinkRecord;
      }
    }
    return void 0;
  }

  protected override onRecohere(version: number): void {
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
      if (this.downlink !== null) {
        this.downlink.close();
        this.downlink = null;
        this.downlinkRecord = null;
      }
      this.inputHostUri = hostUri;
      this.inputNodeUri = nodeUri;
      this.inputLaneUri = laneUri;
      this.inputPrio = prio;
      this.inputRate = rate;
      this.inputBody = body;
      this.inputType = type;
      const warp = this.warp ?? client;
      if (type === "map") {
        let downlink = warp.downlinkMap();
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
        let downlink = warp.downlinkValue();
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

  private static _reifier?: DownlinkReifier;
  /** @beta */
  static reifier(warp?: WarpRef): Reifier {
    if (warp === void 0) {
      if (DownlinkStreamlet._reifier === void 0) {
        DownlinkStreamlet._reifier = new DownlinkReifier();
      }
      return DownlinkStreamlet._reifier;
    } else {
      return new DownlinkReifier(warp);
    }
  }
}
