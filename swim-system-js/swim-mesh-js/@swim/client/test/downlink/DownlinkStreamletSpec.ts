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

import {Map} from "@swim/util";
import {TestOptions, Test, Spec, Report} from "@swim/unit";
import {Attr, Slot, Value, Record, Text} from "@swim/structure";
import {Outlet, AbstractInlet, ValueInput} from "@swim/streamlet";
import {RecordScope} from "@swim/dataflow";
import {
  Envelope,
  EventMessage,
  LinkedResponse,
  SyncRequest,
  SyncedResponse,
} from "@swim/warp";
import {DownlinkStreamlet, WarpClient} from "@swim/client";
import {MockServer} from "../MockServer";
import {ClientExam} from "../ClientExam";

export class DownlinkStreamletSpec extends Spec {
  createExam(report: Report, name: string, options: TestOptions): ClientExam {
    return new ClientExam(report, this, name, options);
  }

  @Test
  bindValueDownlinkStreamlet(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof SyncRequest) {
          server.send(LinkedResponse.of(envelope.node(), envelope.lane()));
          server.send(EventMessage.of(envelope.node(), envelope.lane(), Text.from('on')));
          server.send(SyncedResponse.of(envelope.node(), envelope.lane()));
        }
      };
      const hostUri = new ValueInput(Text.from(server.hostUri().toString()));
      const nodeUri = new ValueInput(Text.from("house/kitchen"));
      const laneUri = new ValueInput(Text.from("light"));
      const type = new ValueInput(Text.from("value"));
      const streamlet = new DownlinkStreamlet();
      streamlet.warp = client;
      streamlet.bindInput("hostUri", hostUri);
      streamlet.bindInput("nodeUri", nodeUri);
      streamlet.bindInput("laneUri", laneUri);
      streamlet.bindInput("type", type);
      streamlet.reconcile(0);
      streamlet.downlink!.keepLinked(false);

      class StateOutput extends AbstractInlet<Value> {
        didReconcileOutput(version: number): void {
          const state = this._input!.get()!;
          exam.equal(state, Text.from("on"));
          resolve();
        }
      }
      const state = new StateOutput();
      state.bindInput(streamlet.state as Outlet<Value>);
    });
  }

  @Test
  bindMapDownlinkStreamlet(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof SyncRequest) {
          server.send(LinkedResponse.of(envelope.node(), envelope.lane()));
          const header = Record.of(Slot.of("key", "the"));
          server.send(EventMessage.of(envelope.node(), envelope.lane(),
                      Attr.of("update", header).concat("definite article")));
          server.send(SyncedResponse.of(envelope.node(), envelope.lane()));
        }
      };
      const hostUri = new ValueInput(Text.from(server.hostUri().toString()));
      const nodeUri = new ValueInput(Text.from("dictionary/english"));
      const laneUri = new ValueInput(Text.from("definitions"));
      const type = new ValueInput(Text.from("map"));
      const streamlet = new DownlinkStreamlet();
      streamlet.warp = client;
      streamlet.bindInput("hostUri", hostUri);
      streamlet.bindInput("nodeUri", nodeUri);
      streamlet.bindInput("laneUri", laneUri);
      streamlet.bindInput("type", type);
      streamlet.reconcile(0);
      streamlet.downlink!.keepLinked(false);

      class StateOutput extends AbstractInlet<Map<Value, Value>> {
        didReconcileOutput(version: number): void {
          const state = this._input!.get()!;
          exam.equal(state.get(Text.from("the")), Text.from("definite article"));
          resolve();
        }
      }
      const state = new StateOutput();
      state.bindInput(streamlet.state as Outlet<Map<Value, Value>>);
    });
  }

  @Test
  compiledValueDownlinkStreamlet(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof SyncRequest) {
          server.send(LinkedResponse.of(envelope.node(), envelope.lane()));
          server.send(EventMessage.of(envelope.node(), envelope.lane(), Text.from('on')));
          server.send(SyncedResponse.of(envelope.node(), envelope.lane()));
        }
      };
      const streamlet = new DownlinkStreamlet();
      streamlet.warp = client;
      const record = RecordScope.of(Slot.of("hostUri", server.hostUri().toString()),
                                    Slot.of("nodeUri", "house/kitchen"),
                                    Slot.of("laneUri", "light"),
                                    Slot.of("type", "value"),
                                    Slot.of("data", streamlet));
      record.reconcileInput(0);
      streamlet.downlink!.keepLinked(false);

      class StateOutput extends AbstractInlet<Value> {
        didReconcileOutput(version: number): void {
          const state = this._input!.get()!;
          exam.equal(state, Text.from("on"));
          resolve();
        }
      }
      const state = new StateOutput();
      state.bindInput(streamlet.state as Outlet<Value>);
    });
  }

  @Test
  compileMapDownlinkStreamlet(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof SyncRequest) {
          server.send(LinkedResponse.of(envelope.node(), envelope.lane()));
          const header = Record.of(Slot.of("key", "the"));
          server.send(EventMessage.of(envelope.node(), envelope.lane(),
                      Attr.of("update", header).concat("definite article")));
          server.send(SyncedResponse.of(envelope.node(), envelope.lane()));
        }
      };
      const streamlet = new DownlinkStreamlet();
      streamlet.warp = client;
      const record = RecordScope.of(Slot.of("hostUri", server.hostUri().toString()),
                                    Slot.of("nodeUri", "dictionary/english"),
                                    Slot.of("laneUri", "definitions"),
                                    Slot.of("type", "map"),
                                    Slot.of("data", streamlet));
      record.reconcileInput(0);
      streamlet.downlink!.keepLinked(false);

      class StateOutput extends AbstractInlet<Map<Value, Value>> {
        didReconcileOutput(version: number): void {
          const state = this._input!.get()!;
          exam.equal(state.get(Text.from("the")), Text.from("definite article"));
          resolve();
        }
      }
      const state = new StateOutput();
      state.bindInput(streamlet.state as Outlet<Map<Value, Value>>);
    });
  }

  @Test
  transmuteValueDownlinkStreamlet(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof SyncRequest) {
          server.send(LinkedResponse.of(envelope.node(), envelope.lane()));
          server.send(EventMessage.of(envelope.node(), envelope.lane(), Text.from('on')));
          server.send(SyncedResponse.of(envelope.node(), envelope.lane()));
        }
      };
      const record = RecordScope.of(Slot.of("hostUri", server.hostUri().toString()),
                                    Slot.of("nodeUri", "house/kitchen"),
                                    Slot.of("data", Record.of(Attr.of("link"),
                                                              Slot.of("laneUri", "light"),
                                                              Slot.of("type", "value"))));
      record.transmute(DownlinkStreamlet.transmuter(client));
      record.reconcileInput(0);
      const streamlet = record.get("data") as DownlinkStreamlet;
      streamlet.downlink!.keepLinked(false);

      class StateOutput extends AbstractInlet<Value> {
        didReconcileOutput(version: number): void {
          const state = this._input!.get()!;
          exam.equal(state, Text.from("on"));
          resolve();
        }
      }
      const state = new StateOutput();
      state.bindInput(streamlet.state as Outlet<Value>);
    });
  }

  @Test
  transmuteMapDownlinkStreamlet(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof SyncRequest) {
          server.send(LinkedResponse.of(envelope.node(), envelope.lane()));
          const header = Record.of(Slot.of("key", "the"));
          server.send(EventMessage.of(envelope.node(), envelope.lane(),
                      Attr.of("update", header).concat("definite article")));
          server.send(SyncedResponse.of(envelope.node(), envelope.lane()));
        }
      };
      const record = RecordScope.of(Slot.of("hostUri", server.hostUri().toString()),
                                    Slot.of("nodeUri", "dictionary/english"),
                                    Slot.of("data", Record.of(Attr.of("link"),
                                                              Slot.of("laneUri", "definitions"),
                                                              Slot.of("type", "map"))));
      record.transmute(DownlinkStreamlet.transmuter(client));
      record.reconcileInput(0);
      const streamlet = record.get("data") as DownlinkStreamlet;
      streamlet.downlink!.keepLinked(false);

      class StateOutput extends AbstractInlet<Map<Value, Value>> {
        didReconcileOutput(version: number): void {
          const state = this._input!.get()!;
          exam.equal(state.get(Text.from("the")), Text.from("definite article"));
          resolve();
        }
      }
      const state = new StateOutput();
      state.bindInput(streamlet.state as Outlet<Map<Value, Value>>);
    });
  }
}
