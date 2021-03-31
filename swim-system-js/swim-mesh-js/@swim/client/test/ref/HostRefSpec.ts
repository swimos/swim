// Copyright 2015-2020 Swim inc.
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

export class HostRefSpec extends Spec {
  createExam(report: Report, name: string, options: TestOptions): ClientExam {
    return new ClientExam(report, this, name, options);
  }

  @Test
  clientHostRef(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      const hostRef = client.hostRef(server.hostUri);
      exam.equal(hostRef.hostUri, server.hostUri);
      resolve();
    });
  }

  @Test
  hostRefDidConnect(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      const hostRef = client.hostRef(server.hostUri)
        .didConnect(function (host: Host): void {
          exam.comment("didConnect");
          exam.equal(host.hostUri, server.hostUri);
          exam.true(hostRef.isConnected());
          resolve();
        });
      hostRef.downlink().nodeUri("/").laneUri("connect").keepLinked(false).open();
    });
  }

  @Test
  hostRefDidDisconnect(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      const hostRef = client.hostRef(server.hostUri)
        .didConnect(function (host: Host): void {
          exam.comment("didConnect");
          server.close();
        })
        .didDisconnect(function (host: Host): void {
          exam.comment("didDisconnect");
          exam.equal(host.hostUri, server.hostUri);
          exam.false(hostRef.isConnected());
          resolve();
        });
      hostRef.downlink().nodeUri("/").laneUri("connect").keepLinked(false).open();
    });
  }

  @Test
  hostRefDidAuthenticate(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof AuthRequest) {
          exam.equal(envelope.body, Record.of(Slot.of("key", 1234)));
          server.send(AuthedResponse.create(Record.of(Slot.of("id", 5678))));
        }
      };
      const hostRef = client.hostRef(server.hostUri)
        .didAuthenticate(function (body: Value, host: Host): void {
          exam.comment("didAuthenticate");
          exam.equal(host.hostUri, server.hostUri);
          exam.equal(body, Record.of(Slot.of("id", 5678)));
          resolve();
        });
      hostRef.authenticate(Record.of(Slot.of("key", 1234)));
      hostRef.downlink().nodeUri("/").laneUri("connect").keepLinked(false).open();
    });
  }

  @Test
  hostRefDidDeauthenticate(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof AuthRequest) {
          exam.equal(envelope.body, Record.of(Slot.of("key", 1234)));
          server.send(DeauthedResponse.create(Record.of(Attr.of("denied"))));
        }
      };
      const hostRef = client.hostRef(server.hostUri)
        .didAuthenticate(function (body: Value, host: Host) {
          exam.fail("didAuthenticate");
        })
        .didDeauthenticate(function (body: Value, host: Host) {
          exam.comment("didDeauthenticate");
          exam.equal(host.hostUri, server.hostUri);
          exam.equal(body, Record.of(Attr.of("denied")));
          resolve();
        });
      hostRef.authenticate(Record.of(Slot.of("key", 1234)));
      hostRef.downlink().nodeUri("/").laneUri("connect").keepLinked(false).open();
    });
  }

  @Test
  hostRefDownlink(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        exam.instanceOf(envelope, LinkRequest);
        exam.equal(envelope.node, Uri.parse("house/kitchen"));
        exam.equal(envelope.lane, Uri.parse("light"));
        server.send(LinkedResponse.create(envelope.node, envelope.lane));
        server.send(EventMessage.create(envelope.node, envelope.lane, "on"));
      };
      const hostRef = client.hostRef(server.hostUri);
      hostRef.downlink().nodeUri("house/kitchen").laneUri("light").keepLinked(false)
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
  hostRefCommand(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        exam.instanceOf(envelope, CommandMessage);
        exam.equal(envelope.node, Uri.parse("house/kitchen"));
        exam.equal(envelope.lane, Uri.parse("light"));
        exam.equal(envelope.body, Text.from("on"));
        resolve();
      };
      const hostRef = client.hostRef(server.hostUri);
      hostRef.command("house/kitchen", "light", "on");
    });
  }

  @Test
  hostRefClose(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof LinkRequest) {
          server.send(LinkedResponse.create(envelope.node, envelope.lane));
        }
      };
      const hostRef = client.hostRef(server.hostUri);
      let linkCount = 0;
      let closeCount = 0;
      function didLink(): void {
        linkCount += 1;
        exam.comment("link " + linkCount);
        if (linkCount === 2) {
          hostRef.close();
        }
      }
      function didClose(): void {
        closeCount += 1;
        exam.comment("close " + closeCount);
        if (closeCount === 2) {
          resolve();
        }
      }
      hostRef.downlink().nodeUri("house/kitchen").laneUri("light").keepLinked(false)
             .didLink(didLink).didClose(didClose).open();
      hostRef.downlink().nodeUri("house/garage").laneUri("light").keepLinked(false)
             .didLink(didLink).didClose(didClose).open();
    });
  }
}
