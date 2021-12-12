// Copyright 2015-2021 Swim.inc
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
import {Text} from "@swim/structure";
import {Uri} from "@swim/uri";
import {
  Envelope,
  CommandMessage,
  LinkRequest,
  LinkedResponse,
} from "@swim/warp";
import {Downlink, WarpClient} from "@swim/client";
import type {MockServer} from "../MockServer";
import {ClientExam} from "../ClientExam";

export class EventDownlinkSpec extends Spec {
  override createExam(report: Report, name: string, options: TestOptions): ClientExam {
    return new ClientExam(report, this, name, options);
  }

  @Test
  eventDownlinkReconnect(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof LinkRequest) {
          server.send(LinkedResponse.create(envelope.node, envelope.lane));
        }
      };
      let linkCount = 0;
      client.downlink()
        .hostUri(server.hostUri)
        .nodeUri("house/kitchen")
        .laneUri("light")
        .didLink(function (downlink: Downlink): void {
          linkCount += 1;
          if (linkCount === 1) {
            exam.comment("connected");
            server.close();
          } else if (linkCount === 2) {
            downlink.keepLinked(false);
            exam.comment("reconnected");
            resolve();
          }
        })
        .open();
    });
  }

  @Test
  eventDownlinkOffline(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof LinkRequest) {
          server.send(LinkedResponse.create(envelope.node, envelope.lane));
        }
      };
      let linkCount = 0;
      client.downlink()
        .hostUri(server.hostUri)
        .nodeUri("house/kitchen")
        .laneUri("light")
        .didLink(function (downlink: Downlink): void {
          linkCount += 1;
          if (linkCount === 1) {
            exam.comment("online");
            client.setOnline(false);
            server.close();
          } else if (linkCount === 2) {
            downlink.keepLinked(false);
            exam.comment("back online");
            resolve();
          }
        })
        .didDisconnect(function (downlink: Downlink): void {
          exam.comment("offline");
          exam.equal(linkCount, 1);
          client.setOnline(true);
        })
        .open();
    }, void 0, new WarpClient({keepOnline: false}));
  }

  @Test
  eventDownlinkCommand(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof CommandMessage) {
          exam.equal(envelope.node, Uri.parse("house/kitchen"));
          exam.equal(envelope.lane, Uri.parse("light"));
          exam.equal(envelope.body, Text.from("on"));
          resolve();
        }
      };
      const downlink = client.downlink()
        .hostUri(server.hostUri)
        .nodeUri("house/kitchen")
        .laneUri("light")
        .keepLinked(false)
        .open();
      downlink.command("on");
    });
  }
}
