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

import {TestOptions, Test, Spec, Report} from "@swim/unit";
import {STree} from "@swim/collections";
import {Attr, Slot, AnyValue, Value, Record, Data, Text} from "@swim/structure";
import {Uri} from "@swim/uri";
import {
  Envelope,
  EventMessage,
  CommandMessage,
  LinkedResponse,
  SyncRequest,
  SyncedResponse,
} from "@swim/warp";
import type {ListDownlink, WarpClient} from "@swim/client";
import type {MockServer} from "../MockServer";
import {ClientExam} from "../ClientExam";

export class ListDownlinkSpec extends Spec {
  override createExam(report: Report, name: string, options: TestOptions): ClientExam {
    return new ClientExam(report, this, name, options);
  }

  @Test
  listDownlinkInsert(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof CommandMessage) {
          exam.equal(envelope.node, Uri.parse("todo"));
          exam.equal(envelope.lane, Uri.parse("list"));
          const header = Record.of(Slot.of("key", Data.fromBase64("Az+0")), Slot.of("index", 0));
          exam.equal(envelope.body, Attr.of("update", header).concat("test"));
          resolve();
        }
      };
      const downlink = client.downlinkList()
        .hostUri(server.hostUri)
        .nodeUri("todo")
        .laneUri("list")
        .keepLinked(false)
        .open();
      exam.equal(downlink.length, 0);
      exam.equal(downlink.get(0), Value.absent());
      exam.equal(downlink.getEntry(0), void 0);
      downlink.insert(0, "test", Data.fromBase64("Az+0"));
      exam.equal(downlink.length, 1);
      exam.equal(downlink.get(0), Text.from("test"));
      exam.equal((downlink.getEntry(0)!)[0], Data.fromBase64("Az+0"));
      exam.equal((downlink.getEntry(0)!)[1], Text.from("test"));
    });
  }

  @Test
  listDownlinkRemoteInsert(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof SyncRequest) {
          server.send(LinkedResponse.create(envelope.node, envelope.lane));
          const header = Record.of(Slot.of("key", Data.fromBase64("Az+0")), Slot.of("index", 0));
          server.send(EventMessage.create(envelope.node, envelope.lane,
                      Attr.of("update", header).concat("test")));
          server.send(SyncedResponse.create(envelope.node, envelope.lane));
        }
      };
      client.downlinkList()
        .hostUri(server.hostUri)
        .nodeUri("todo")
        .laneUri("list")
        .keepLinked(false)
        .willUpdate(function (index: number, newValue: Value, downlink: ListDownlink<Value, AnyValue>): void {
          exam.comment("willUpdate");
          exam.equal(index, 0);
          exam.equal(newValue, Text.from("test"));
          exam.equal(downlink.length, 0);
          exam.equal(downlink.get(0), Value.absent());
          exam.equal(downlink.getEntry(0), void 0);
        })
        .didUpdate(function (index: number, newValue: Value, oldValue: Value, downlink: ListDownlink<Value, AnyValue>): void {
          exam.comment("didUpdate");
          exam.equal(index, 0);
          exam.equal(newValue, Text.from("test"));
          exam.equal(oldValue, Value.absent());
          exam.equal(downlink.length, 1);
          exam.equal(downlink.get(0), Text.from("test"));
          exam.equal((downlink.getEntry(0)!)[0], Data.fromBase64("Az+0"));
          exam.equal((downlink.getEntry(0)!)[1], Text.from("test"));
          resolve();
        })
        .open();
    });
  }

  @Test
  listDownlinkUpdate(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof CommandMessage) {
          exam.equal(envelope.node, Uri.parse("todo"));
          exam.equal(envelope.lane, Uri.parse("list"));
          const header = Record.of(Slot.of("key", Data.fromBase64("Az+0")), Slot.of("index", 0));
          exam.equal(envelope.body, Attr.of("update", header).concat("retest"));
          resolve();
        }
      };
      const downlink = client.downlinkList()
        .hostUri(server.hostUri)
        .nodeUri("todo")
        .laneUri("list")
        .keepLinked(false)
        .initialState(new STree<Value, Value>().insert(0, Text.from("test"), Data.fromBase64("Az+0")))
        .open();
      exam.equal(downlink.length, 1);
      exam.equal(downlink.get(0), Text.from("test"));
      exam.equal((downlink.getEntry(0)!)[0], Data.fromBase64("Az+0"));
      exam.equal((downlink.getEntry(0)!)[1], Text.from("test"));
      downlink.set(0, "retest");
      exam.equal(downlink.length, 1);
      exam.equal(downlink.get(0), Text.from("retest"));
      exam.equal((downlink.getEntry(0)!)[0], Data.fromBase64("Az+0"));
      exam.equal((downlink.getEntry(0)!)[1], Text.from("retest"));
    });
  }

  @Test
  listDownlinkRemoteUpdate(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof SyncRequest) {
          server.send(LinkedResponse.create(envelope.node, envelope.lane));
          const header = Record.of(Slot.of("key", Data.fromBase64("Az+0")), Slot.of("index", 0));
          server.send(EventMessage.create(envelope.node, envelope.lane,
                      Attr.of("update", header).concat("retest")));
          server.send(SyncedResponse.create(envelope.node, envelope.lane));
        }
      };
      client.downlinkList()
        .hostUri(server.hostUri)
        .nodeUri("todo")
        .laneUri("list")
        .keepLinked(false)
        .willUpdate(function (index: number, newValue: Value, downlink: ListDownlink<Value, AnyValue>): void {
          exam.comment("willUpdate");
          exam.equal(index, 0);
          exam.equal(newValue, Text.from("retest"));
          exam.equal(downlink.length, 1);
          exam.equal(downlink.get(0), Text.from("test"));
          exam.equal((downlink.getEntry(0)!)[0], Data.fromBase64("Az+0"));
          exam.equal((downlink.getEntry(0)!)[1], Text.from("test"));
        })
        .didUpdate(function (index: number, newValue: Value, oldValue: Value, downlink: ListDownlink<Value, AnyValue>): void {
          exam.comment("didUpdate");
          exam.equal(index, 0);
          exam.equal(newValue, Text.from("retest"));
          exam.equal(oldValue, Text.from("test"));
          exam.equal(downlink.length, 1);
          exam.equal(downlink.get(0), Text.from("retest"));
          exam.equal((downlink.getEntry(0)!)[0], Data.fromBase64("Az+0"));
          exam.equal((downlink.getEntry(0)!)[1], Text.from("retest"));
          resolve();
        })
        .initialState(new STree<Value, Value>().insert(0, Text.from("test"), Data.fromBase64("Az+0")))
        .open();
    });
  }

  @Test
  listDownlinkRemove(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof CommandMessage) {
          exam.equal(envelope.node, Uri.parse("todo"));
          exam.equal(envelope.lane, Uri.parse("list"));
          const header = Record.of(Slot.of("key", Data.fromBase64("Az+0")), Slot.of("index", 0));
          exam.equal(envelope.body, Record.of(Attr.of("remove", header)));
          resolve();
        }
      };
      const downlink = client.downlinkList()
        .hostUri(server.hostUri)
        .nodeUri("todo")
        .laneUri("list")
        .keepLinked(false)
        .initialState(new STree<Value, Value>().insert(0, Text.from("test"), Data.fromBase64("Az+0")))
        .open();
      exam.equal(downlink.length, 1);
      exam.equal(downlink.get(0), Text.from("test"));
      exam.equal((downlink.getEntry(0)!)[0], Data.fromBase64("Az+0"));
      exam.equal((downlink.getEntry(0)!)[1], Text.from("test"));
      downlink.remove(0);
      exam.equal(downlink.length, 0);
      exam.equal(downlink.get(0), Value.absent());
      exam.equal(downlink.getEntry(0), void 0);
    });
  }

  @Test
  listDownlinkRemoteRemove(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof SyncRequest) {
          server.send(LinkedResponse.create(envelope.node, envelope.lane));
          const header = Record.of(Slot.of("key", Data.fromBase64("Az+0")), Slot.of("index", 0));
          server.send(EventMessage.create(envelope.node, envelope.lane,
                      Record.of(Attr.of("remove", header))));
          server.send(SyncedResponse.create(envelope.node, envelope.lane));
        }
      };
      client.downlinkList()
        .hostUri(server.hostUri)
        .nodeUri("todo")
        .laneUri("list")
        .keepLinked(false)
        .willRemove(function (index: number, downlink: ListDownlink<Value, AnyValue>): void {
          exam.comment("willRemove");
          exam.equal(index, 0);
          exam.equal(downlink.length, 1);
          exam.equal(downlink.get(0), Text.from("test"));
          exam.equal((downlink.getEntry(0)!)[0], Data.fromBase64("Az+0"));
          exam.equal((downlink.getEntry(0)!)[1], Text.from("test"));
        })
        .didRemove(function (index: number, oldValue: Value, downlink: ListDownlink<Value, AnyValue>): void {
          exam.comment("didRemove");
          exam.equal(index, 0);
          exam.equal(downlink.length, 0);
          exam.equal(oldValue, Text.from("test"));
          exam.equal(downlink.get(0), Value.absent());
          exam.equal(downlink.getEntry(0), void 0);
          resolve();
        })
        .initialState(new STree<Value, Value>().insert(0, Text.from("test"), Data.fromBase64("Az+0")))
        .open();
    });
  }

  @Test
  listDownlinkMove(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof CommandMessage) {
          exam.equal(envelope.node, Uri.parse("todo"));
          exam.equal(envelope.lane, Uri.parse("list"));
          const header = Record.of(Slot.of("key", Data.fromBase64("Az+0")), Slot.of("from", 0), Slot.of("to", 2));
          exam.equal(envelope.body, Record.of(Attr.of("move", header)));
          resolve();
        }
      };
      const downlink = client.downlinkList()
        .hostUri(server.hostUri)
        .nodeUri("todo")
        .laneUri("list")
        .keepLinked(false)
        .initialState(new STree<Value, Value>().insert(0, Text.from("a"), Data.fromBase64("Az+0"))
                                               .insert(1, Text.from("b"), Data.fromBase64("Az+1"))
                                               .insert(2, Text.from("c"), Data.fromBase64("Az+2")))
        .open();
      downlink.move(0, 2);
      exam.equal(downlink.length, 3);
      exam.equal(downlink.get(0), Text.from("b"));
      exam.equal((downlink.getEntry(0)!)[0], Data.fromBase64("Az+1"));
      exam.equal((downlink.getEntry(0)!)[1], Text.from("b"));
      exam.equal(downlink.get(1), Text.from("c"));
      exam.equal((downlink.getEntry(1)!)[0], Data.fromBase64("Az+2"));
      exam.equal((downlink.getEntry(1)!)[1], Text.from("c"));
      exam.equal(downlink.get(2), Text.from("a"));
      exam.equal((downlink.getEntry(2)!)[0], Data.fromBase64("Az+0"));
      exam.equal((downlink.getEntry(2)!)[1], Text.from("a"));
    });
  }

  @Test
  listDownlinkRemoteMove(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof SyncRequest) {
          server.send(LinkedResponse.create(envelope.node, envelope.lane));
          const header = Record.of(Slot.of("key", Data.fromBase64("Az+0")), Slot.of("from", 0), Slot.of("to", 2));
          server.send(EventMessage.create(envelope.node, envelope.lane,
                      Record.of(Attr.of("move", header))));
          server.send(SyncedResponse.create(envelope.node, envelope.lane));
        }
      };
      client.downlinkList()
        .hostUri(server.hostUri)
        .nodeUri("todo")
        .laneUri("list")
        .keepLinked(false)
        .willMove(function (fromIndex: number, toIndex: number, value: Value, downlink: ListDownlink<Value, AnyValue>) {
          exam.comment("willMove");
          exam.equal(downlink.length, 3);
          exam.equal(downlink.get(0), Text.from("a"));
          exam.equal((downlink.getEntry(0)!)[0], Data.fromBase64("Az+0"));
          exam.equal((downlink.getEntry(0)!)[1], Text.from("a"));
          exam.equal(downlink.get(1), Text.from("b"));
          exam.equal((downlink.getEntry(1)!)[0], Data.fromBase64("Az+1"));
          exam.equal((downlink.getEntry(1)!)[1], Text.from("b"));
          exam.equal(downlink.get(2), Text.from("c"));
          exam.equal((downlink.getEntry(2)!)[0], Data.fromBase64("Az+2"));
          exam.equal((downlink.getEntry(2)!)[1], Text.from("c"));
        })
        .didMove(function (fromIndex: number, toIndex: number, value: Value, downlink: ListDownlink<Value, AnyValue>) {
          exam.comment("didMove");
          exam.equal(downlink.length, 3);
          exam.equal(downlink.get(0), Text.from("b"));
          exam.equal((downlink.getEntry(0)!)[0], Data.fromBase64("Az+1"));
          exam.equal((downlink.getEntry(0)!)[1], Text.from("b"));
          exam.equal(downlink.get(1), Text.from("c"));
          exam.equal((downlink.getEntry(1)!)[0], Data.fromBase64("Az+2"));
          exam.equal((downlink.getEntry(1)!)[1], Text.from("c"));
          exam.equal(downlink.get(2), Text.from("a"));
          exam.equal((downlink.getEntry(2)!)[0], Data.fromBase64("Az+0"));
          exam.equal((downlink.getEntry(2)!)[1], Text.from("a"));
          resolve();
        })
        .initialState(new STree<Value, Value>().insert(0, Text.from("a"), Data.fromBase64("Az+0"))
                                               .insert(1, Text.from("b"), Data.fromBase64("Az+1"))
                                               .insert(2, Text.from("c"), Data.fromBase64("Az+2")))
        .open();
    });
  }

  @Test
  listDownlinkClear(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof CommandMessage) {
          exam.equal(envelope.node, Uri.parse("todo"));
          exam.equal(envelope.lane, Uri.parse("list"));
          exam.equal(envelope.body, Record.of(Attr.of("clear")));
          resolve();
        }
      };
      const downlink = client.downlinkList()
        .hostUri(server.hostUri)
        .nodeUri("todo")
        .laneUri("list")
        .keepLinked(false)
        .initialState(new STree<Value, Value>().insert(0, Text.from("a"), Data.fromBase64("Az+0"))
                                               .insert(1, Text.from("b"), Data.fromBase64("Az+1")))
        .open();
      downlink.clear();
      exam.equal(downlink.length, 0);
      exam.equal(downlink.get(0), Value.absent());
      exam.equal(downlink.getEntry(0), void 0);
      exam.equal(downlink.get(1), Value.absent());
      exam.equal(downlink.getEntry(1), void 0);
    });
  }

  @Test
  listDownlinkRemoteClear(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof SyncRequest) {
          server.send(LinkedResponse.create(envelope.node, envelope.lane));
          server.send(EventMessage.create(envelope.node, envelope.lane, Record.of(Attr.of("clear"))));
          server.send(SyncedResponse.create(envelope.node, envelope.lane));
        }
      };
      client.downlinkList()
        .hostUri(server.hostUri)
        .nodeUri("todo")
        .laneUri("list")
        .keepLinked(false)
        .willClear(function (downlink: ListDownlink<Value, AnyValue>): void {
          exam.comment("willClear");
          exam.equal(downlink.length, 2);
          exam.equal(downlink.get(0), Text.from("a"));
          exam.equal((downlink.getEntry(0)!)[0], Data.fromBase64("Az+0"));
          exam.equal((downlink.getEntry(0)!)[1], Text.from("a"));
          exam.equal(downlink.get(1), Text.from("b"));
          exam.equal((downlink.getEntry(1)!)[0], Data.fromBase64("Az+1"));
          exam.equal((downlink.getEntry(1)!)[1], Text.from("b"));
        })
        .didClear(function (downlink: ListDownlink<Value, AnyValue>): void {
          exam.comment("didClear");
          exam.equal(downlink.length, 0);
          exam.equal(downlink.get(0), Value.absent());
          exam.equal(downlink.getEntry(0), void 0);
          exam.equal(downlink.get(1), Value.absent());
          exam.equal(downlink.getEntry(1), void 0);
          resolve();
        })
        .initialState(new STree<Value, Value>().insert(0, Text.from("a"), Data.fromBase64("Az+0"))
                                               .insert(1, Text.from("b"), Data.fromBase64("Az+1")))
        .open();
    });
  }
}
