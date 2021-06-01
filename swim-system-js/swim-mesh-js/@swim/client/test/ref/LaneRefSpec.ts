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

import {TestOptions, Test, Spec, Report} from "@swim/unit";
import {Attr, Slot, Value, Record, Text} from "@swim/structure";
import {Uri} from "@swim/uri";
import {
  Envelope,
  EventMessage,
  CommandMessage,
  LinkRequest,
  LinkedResponse,
  AuthRequest,
  AuthedResponse,
  DeauthedResponse,
} from "@swim/warp";
import type {Host, WarpClient} from "@swim/client";
import type {MockServer} from "../MockServer";
import {ClientExam} from "../ClientExam";

export class LaneRefSpec extends Spec {
  override createExam(report: Report, name: string, options: TestOptions): ClientExam {
    return new ClientExam(report, this, name, options);
  }

  @Test
  clientLaneRef(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      const laneRef1 = client.laneRef(server.hostUri, "house/kitchen", "light");
      exam.equal(laneRef1.hostUri, server.hostUri);
      exam.equal(laneRef1.nodeUri, Uri.parse("house/kitchen"));
      exam.equal(laneRef1.laneUri, Uri.parse("light"));
      const laneRef2 = client.laneRef(server.resolve("house/kitchen"), "light");
      exam.equal(laneRef2.hostUri, server.hostUri);
      exam.equal(laneRef2.nodeUri, Uri.parse("house/kitchen"));
      exam.equal(laneRef2.laneUri, Uri.parse("light"));
      resolve();
    });
  }

  @Test
  hostRefLaneRef(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      const hostRef = client.hostRef(server.hostUri);
      const laneRef = hostRef.laneRef("house/kitchen", "light");
      exam.equal(laneRef.hostUri, server.hostUri);
      exam.equal(laneRef.nodeUri, Uri.parse("house/kitchen"));
      exam.equal(laneRef.laneUri, Uri.parse("light"));
      resolve();
    });
  }

  @Test
  nodeRefLaneRef(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      const nodeRef = client.nodeRef(server.hostUri, "house/kitchen");
      const laneRef = nodeRef.laneRef("light");
      exam.equal(laneRef.hostUri, server.hostUri);
      exam.equal(laneRef.nodeUri, Uri.parse("house/kitchen"));
      exam.equal(laneRef.laneUri, Uri.parse("light"));
      resolve();
    });
  }

  @Test
  laneRefDidConnect(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      const laneRef = client.laneRef(server.hostUri, "/", "connect")
        .didConnect(function (host: Host): void {
          exam.comment("didConnect");
          exam.equal(host.hostUri, server.hostUri);
          exam.true(laneRef.isConnected());
          resolve();
        });
      laneRef.downlink().keepLinked(false).open();
    });
  }

  @Test
  laneRefDidDisconnect(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      const laneRef = client.laneRef(server.hostUri, "/", "connect")
        .didConnect(function (host: Host): void {
          exam.comment("didConnect");
          server.close();
        })
        .didDisconnect(function (host: Host): void {
          exam.comment("didDisconnect");
          exam.false(laneRef.isConnected());
          resolve();
        });
      laneRef.downlink().keepLinked(false).open();
    });
  }

  @Test
  laneRefDidAuthenticate(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof AuthRequest) {
          exam.equal(envelope.body, Record.of(Slot.of("key", 1234)));
          server.send(new AuthedResponse(Record.of(Slot.of("id", 5678))));
        }
      };
      const laneRef = client.laneRef(server.hostUri, "/", "connect")
        .didAuthenticate(function (body: Value, host: Host): void {
          exam.comment("didAuthenticate");
          exam.equal(host.hostUri, server.hostUri);
          exam.equal(body, Record.of(Slot.of("id", 5678)));
          resolve();
        });
      laneRef.authenticate(Record.of(Slot.of("key", 1234)));
      laneRef.downlink().keepLinked(false).open();
    });
  }

  @Test
  laneRefDidDeauthenticate(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof AuthRequest) {
          exam.equal(envelope.body, Record.of(Slot.of("key", 1234)));
          server.send(DeauthedResponse.create(Record.of(Attr.of("denied"))));
        }
      };
      const laneRef = client.laneRef(server.hostUri, "/", "connect")
        .didAuthenticate(function (body: Value, host: Host): void {
          exam.fail("didAuthenticate");
        })
        .didDeauthenticate(function (body: Value, host: Host): void {
          exam.comment("didDeauthenticate");
          exam.equal(host.hostUri, server.hostUri);
          exam.equal(body, Record.of(Attr.of("denied")));
          resolve();
        });
      laneRef.authenticate(Record.of(Slot.of("key", 1234)));
      laneRef.downlink().keepLinked(false).open();
    });
  }

  @Test
  laneRefDownlink(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        exam.instanceOf(envelope, LinkRequest);
        exam.equal(envelope.node, Uri.parse("house/kitchen"));
        exam.equal(envelope.lane, Uri.parse("light"));
        server.send(LinkedResponse.create(envelope.node, envelope.lane));
        server.send(EventMessage.create(envelope.node, envelope.lane, Text.from("on")));
      };
      const laneRef = client.laneRef(server.hostUri, "house/kitchen", "light");
      laneRef.downlink().keepLinked(false)
        .willLink(function (): void {
          exam.comment("willLink");
        })
        .didLink(function (): void {
          exam.comment("didLink");
        })
        .onEvent(function (body: Value): void {
          exam.equal(body, Text.from("on"));
          resolve();
        })
        .open();
    });
  }

  @Test
  laneRefCommand(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        exam.instanceOf(envelope, CommandMessage);
        exam.equal(envelope.node, Uri.parse("house/kitchen"));
        exam.equal(envelope.lane, Uri.parse("light"));
        exam.equal(envelope.body, Text.from("on"));
        resolve();
      };
      const laneRef = client.laneRef(server.hostUri, "house/kitchen", "light");
      laneRef.command("on");
    });
  }

  @Test
  laneRefClose(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof LinkRequest) {
          server.send(LinkedResponse.create(envelope.node, envelope.lane));
        }
      };
      const laneRef = client.laneRef(server.hostUri, "house/kitchen", "light");
      let linkCount = 0;
      let closeCount = 0;
      function didLink(): void {
        linkCount += 1;
        exam.comment("link " + linkCount);
        if (linkCount === 2) {
          laneRef.close();
        }
      }
      function didClose(): void {
        closeCount += 1;
        exam.comment("close " + closeCount);
        if (closeCount === 2) {
          resolve();
        }
      }
      laneRef.downlink().keepLinked(false)
             .didLink(didLink).didClose(didClose).open();
      laneRef.downlink().keepLinked(false)
             .didLink(didLink).didClose(didClose).open();
    });
  }
}
