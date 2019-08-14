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

import {TestOptions, Test, Spec, Report} from "@swim/unit";
import {BTree} from "@swim/collections";
import {Attr, Slot, AnyValue, Value, Record, Text} from "@swim/structure";
import {
  Envelope,
  EventMessage,
  CommandMessage,
  LinkedResponse,
  SyncRequest,
  SyncedResponse,
} from "@swim/warp";
import {Uri} from "@swim/uri";
import {MapDownlink, WarpClient} from "@swim/client";
import {MockServer} from "../MockServer";
import {ClientExam} from "../ClientExam";

export class MapDownlinkSpec extends Spec {
  createExam(report: Report, name: string, options: TestOptions): ClientExam {
    return new ClientExam(report, this, name, options);
  }

  @Test
  mapDownlinkUpdate(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof CommandMessage) {
          exam.equal(envelope.node(), Uri.parse("dictionary/english"));
          exam.equal(envelope.lane(), Uri.parse("definitions"));
          const header = Record.of(Slot.of("key", "the"));
          exam.equal(envelope.body(), Attr.of("update", header).concat("definite article"));
          resolve();
        }
      };
      const downlink = client.downlinkMap()
        .hostUri(server.hostUri())
        .nodeUri("dictionary/english")
        .laneUri("definitions")
        .keepLinked(false)
        .open();
      exam.equal(downlink.size, 0);
      exam.equal(downlink.get("the"), Value.absent());
      downlink.set("the", "definite article");
      exam.equal(downlink.size, 1);
      exam.equal(downlink.get("the"), Text.from("definite article"));
    });
  }

  @Test
  mapDownlinkRemoteUpdate(exam: ClientExam): Promise<void> {
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
      client.downlinkMap()
        .hostUri(server.hostUri())
        .nodeUri("dictionary/english")
        .laneUri("definitions")
        .keepLinked(false)
        .willUpdate(function (key: Value, newValue: Value, downlink: MapDownlink<Value, Value, AnyValue, AnyValue>): void {
          exam.comment("willUpdate");
          exam.equal(key, Text.from("the"));
          exam.equal(newValue, Text.from("definite article"));
          exam.equal(downlink.size, 0);
          exam.equal(downlink.get("the"), Value.absent());
        })
        .didUpdate(function (key: Value, newValue: Value, oldValue: Value, downlink: MapDownlink<Value, Value, AnyValue, AnyValue>): void {
          exam.comment("didUpdate");
          exam.equal(key, Text.from("the"));
          exam.equal(newValue, Text.from("definite article"));
          exam.equal(oldValue, Value.absent());
          exam.equal(downlink.size, 1);
          exam.equal(downlink.get("the"), Text.from("definite article"));
          resolve();
        })
        .open();
    });
  }

  @Test
  mapDownlinkRemove(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof CommandMessage) {
          exam.equal(envelope.node(), Uri.parse("dictionary/english"));
          exam.equal(envelope.lane(), Uri.parse("definitions"));
          const header = Record.of(Slot.of("key", "the"));
          exam.equal(envelope.body(), Record.of(Attr.of("remove", header)));
          resolve();
        }
      };
      const downlink = client.downlinkMap()
        .hostUri(server.hostUri())
        .nodeUri("dictionary/english")
        .laneUri("definitions")
        .keepLinked(false)
        .initialState(new BTree<Value, Value>().set(Text.from("the"), Text.from("definite article")))
        .open();
      exam.equal(downlink.size, 1);
      exam.equal(downlink.get("the"), Text.from("definite article"));
      downlink.delete("the");
      exam.equal(downlink.size, 0);
      exam.equal(downlink.get("the"), Value.absent());
    });
  }

  @Test
  mapDownlinkRemoteRemove(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof SyncRequest) {
          server.send(LinkedResponse.of(envelope.node(), envelope.lane()));
          const header = Record.of(Slot.of("key", "the"));
          server.send(EventMessage.of(envelope.node(), envelope.lane(), Record.of(Attr.of("remove", header))));
          server.send(SyncedResponse.of(envelope.node(), envelope.lane()));
        }
      };
      client.downlinkMap()
        .hostUri(server.hostUri())
        .nodeUri("dictionary/english")
        .laneUri("definitions")
        .keepLinked(false)
        .willRemove(function (key: Value, downlink: MapDownlink<Value, Value, AnyValue, AnyValue>): void {
          exam.comment("willRemove");
          exam.equal(key, Text.from("the"));
          exam.equal(downlink.size, 1);
          exam.equal(downlink.get("the"), Text.from("definite article"));
        })
        .didRemove(function (key: Value, oldValue: Value, downlink: MapDownlink<Value, Value, AnyValue, AnyValue>): void {
          exam.comment("didRemove");
          exam.equal(key, Text.from("the"));
          exam.equal(oldValue, Text.from("definite article"));
          exam.equal(downlink.size, 0);
          exam.equal(downlink.get("the"), Value.absent());
          resolve();
        })
        .initialState(new BTree<Value, Value>().set(Text.from("the"), Text.from("definite article")))
        .open();
    });
  }

  @Test
  mapDownlinkClear(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof CommandMessage) {
          exam.equal(envelope.node(), Uri.parse("dictionary/english"));
          exam.equal(envelope.lane(), Uri.parse("definitions"));
          exam.equal(envelope.body(), Record.of(Attr.of("clear")));
          resolve();
        }
      };
      const downlink = client.downlinkMap()
        .hostUri(server.hostUri())
        .nodeUri("dictionary/english")
        .laneUri("definitions")
        .keepLinked(false)
        .initialState(new BTree<Value, Value>().set(Text.from("a"), Text.from("indefinite article"))
                                               .set(Text.from("the"), Text.from("definite article")))
        .open();
      exam.equal(downlink.size, 2);
      exam.equal(downlink.get("a"), Text.from("indefinite article"));
      exam.equal(downlink.get("the"), Text.from("definite article"));
      downlink.clear();
      exam.equal(downlink.size, 0);
      exam.equal(downlink.get("a"), Value.absent());
      exam.equal(downlink.get("the"), Value.absent());
    });
  }

  @Test
  mapDownlinkRemoteClear(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof SyncRequest) {
          server.send(LinkedResponse.of(envelope.node(), envelope.lane()));
          server.send(EventMessage.of(envelope.node(), envelope.lane(), Record.of(Attr.of("clear"))));
          server.send(SyncedResponse.of(envelope.node(), envelope.lane()));
        }
      };
      client.downlinkMap()
        .hostUri(server.hostUri())
        .nodeUri("dictionary/english")
        .laneUri("definitions")
        .keepLinked(false)
        .willClear(function (downlink: MapDownlink<Value, Value, AnyValue, AnyValue>): void {
          exam.comment("willClear");
          exam.equal(downlink.size, 2);
          exam.equal(downlink.get("a"), Text.from("indefinite article"));
          exam.equal(downlink.get("the"), Text.from("definite article"));
        })
        .didClear(function (downlink: MapDownlink<Value, Value, AnyValue, AnyValue>): void {
          exam.comment("didClear");
          exam.equal(downlink.size, 0);
          exam.equal(downlink.get("a"), Value.absent());
          exam.equal(downlink.get("the"), Value.absent());
          resolve();
        })
        .initialState(new BTree<Value, Value>().set(Text.from("a"), Text.from("indefinite article"))
                                               .set(Text.from("the"), Text.from("definite article")))
        .open();
    });
  }
}
