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

import {TestOptions, Test, Spec, Report} from "@swim/unit";
import {Attr, Slot, Value, Record, Text} from "@swim/structure";
import {Uri} from "@swim/uri";
import {
  Envelope,
  EventMessage,
  CommandMessage,
  LinkRequest,
  LinkedResponse,
  UnlinkRequest,
  UnlinkedResponse,
  AuthRequest,
  AuthedResponse,
  DeauthedResponse,
} from "@swim/warp";
import {WarpHost, WarpClient} from "@swim/client";
import type {MockServer} from "../MockServer";
import {ClientExam} from "../ClientExam";

export class WarpClientSpec extends Spec {
  override createExam(report: Report, name: string, options: TestOptions): ClientExam {
    return new ClientExam(report, this, name, options);
  }

  @Test
  clientDidConnect(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      client.observe({
        clientDidConnect(host: WarpHost): void {
          exam.comment("clientDidConnect");
          exam.equal(host.hostUri, server.hostUri);
          resolve();
        },
      });
      client.command(server.hostUri, "/", "connect");
    });
  }

  @Test
  clientDidDisconnect(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      client.observe({
        clientDidConnect(host: WarpHost): void {
          exam.comment("clientDidConnect");
          host.close();
        },
        clientDidDisconnect(host: WarpHost): void {
          exam.comment("clientDidDisconnect");
          exam.equal(host.hostUri, server.hostUri);
          resolve();
        },
      });
      client.command(server.hostUri, "/", "connect");
    });
  }

  @Test
  clientDisconnectIdle(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      let t0 = 0;
      const idleTimeout = 500;
      client.idleTimeout.setValue(idleTimeout);
      client.observe({
        clientDidConnect(host: WarpHost): void {
          exam.comment("clientDidConnect");
          t0 = performance.now();
        },
        clientDidDisconnect(host: WarpHost): void {
          const dt = Math.round(performance.now() - t0);
          exam.comment("clientDidDisconnect after " + dt + "ms");
          exam.equal(host.hostUri, server.hostUri);
          exam.greaterThan(dt, idleTimeout);
          resolve();
        },
      });
      client.command(server.hostUri, "/", "connect");
    });
  }

  @Test
  clientDidAuthenticate(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        exam.instanceOf(envelope, AuthRequest);
        exam.equal(envelope.body, Record.of(Slot.of("key", 1234)));
        server.send(AuthedResponse.create(Record.of(Slot.of("id", 5678))));
      };
      client.observe({
        clientDidAuthenticate(body: Value, host: WarpHost): void {
          exam.comment("clientDidAuthenticate");
          exam.equal(host.hostUri, server.hostUri);
          exam.equal(body, Record.of(Slot.of("id", 5678)));
          resolve();
        },
      });
      client.authenticate(server.hostUri, Record.of(Slot.of("key", 1234)));
    });
  }

  @Test
  clientDidDeauthenticate(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        exam.instanceOf(envelope, AuthRequest);
        exam.equal(envelope.body, Record.of(Slot.of("key", 1234)));
        server.send(DeauthedResponse.create(Record.of(Attr.of("denied"))));
      };
      client.observe({
        clientDidAuthenticate(body: Value, host: WarpHost): void {
          exam.fail("clientDidAuthenticate");
        },
        clientDidDeauthenticate(body: Value, host: WarpHost): void {
          exam.comment("clientDidDeauthenticate");
          exam.equal(host.hostUri, server.hostUri);
          exam.equal(body, Record.of(Attr.of("denied")));
          resolve();
        },
      });
      client.authenticate(server.hostUri, Record.of(Slot.of("key", 1234)));
    });
  }

  @Test
  clientDownlink(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        exam.instanceOf(envelope, LinkRequest);
        exam.equal(envelope.node, Uri.parse("house/kitchen"));
        exam.equal(envelope.lane, Uri.parse("light"));
        server.send(LinkedResponse.create(envelope.node, envelope.lane));
        server.send(EventMessage.create(envelope.node, envelope.lane, "on"));
      };
      client.downlink({
        hostUri: server.hostUri,
        nodeUri: "house/kitchen",
        laneUri: "light",
        relinks: false,
        willLink(): void {
          exam.comment("willLink");
        },
        didLink(): void {
          exam.comment("didLink");
        },
        onEvent(body: Value): void {
          exam.comment("onEvent");
          exam.equal(body, Text.from("on"));
          resolve();
        },
      }).open();
    });
  }

  @Test
  clientConcurrentlyRelink(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof LinkRequest) {
          exam.equal(envelope.node, Uri.parse("house/kitchen"));
          exam.equal(envelope.lane, Uri.parse("light"));
          server.send(LinkedResponse.create(envelope.node, envelope.lane));
          server.send(EventMessage.create(envelope.node, envelope.lane, "on"));
        } else if (envelope instanceof UnlinkRequest) {
          exam.equal(envelope.node, Uri.parse("house/kitchen"));
          exam.equal(envelope.lane, Uri.parse("light"));
          server.send(UnlinkedResponse.create(envelope.node, envelope.lane));
        }
      };
      const downlinkA = client.downlink({
        hostUri: server.hostUri,
        nodeUri: "house/kitchen",
        laneUri: "light",
        willLink(): void {
          exam.comment("A willLink");
        },
        didLink(): void {
          exam.comment("A didLink");
        },
        onEvent(body: Value): void {
          exam.comment("A onEvent");
          exam.equal(body, Text.from("on"));
          downlinkA.close();
          downlinkB.open();
        },
      });
      const downlinkB = client.downlink({
        hostUri: server.hostUri,
        nodeUri: "house/kitchen",
        laneUri: "light",
        relinks: false,
        willLink(): void {
          exam.comment("B willLink");
        },
        didLink(): void {
          exam.comment("B didLink");
        },
        onEvent(body: Value): void {
          exam.comment("B onEvent");
          exam.equal(body, Text.from("on"));
          resolve();
        },
      });
      downlinkA.open();
    }, void 0, new WarpClient().unlinkDelay(-1));
  }

  @Test
  clientCommand(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        exam.instanceOf(envelope, CommandMessage);
        exam.equal(envelope.node, Uri.parse("house/kitchen"));
        exam.equal(envelope.lane, Uri.parse("light"));
        exam.equal(envelope.body, Text.from("on"));
        resolve();
      };
      client.command(server.hostUri, "house/kitchen", "light", "on");
    });
  }
}
