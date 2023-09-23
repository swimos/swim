// Copyright 2015-2023 Nstream, inc.
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

import type {TestOptions} from "@swim/unit";
import {Test} from "@swim/unit";
import {Suite} from "@swim/unit";
import type {Report} from "@swim/unit";
import {Text} from "@swim/structure";
import {Uri} from "@swim/uri";
import type {Envelope} from "@swim/warp";
import {CommandMessage} from "@swim/warp";
import {LinkRequest} from "@swim/warp";
import {LinkedResponse} from "@swim/warp";
import {WarpClient} from "@swim/client";
import type {MockServer} from "./MockServer";
import {ClientExam} from "./ClientExam";

export class EventDownlinkSpec extends Suite {
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
      client.downlink({
        hostUri: server.hostUri,
        nodeUri: "house/kitchen",
        laneUri: "light",
        didLink(): void {
          linkCount += 1;
          if (linkCount === 1) {
            exam.comment("connected");
            server.close();
          } else if (linkCount === 2) {
            this.relink(false);
            exam.comment("reconnected");
            resolve();
          }
        },
      }).open();
    });
  }

  @Test
  eventDownlinkOffline(exam: ClientExam): Promise<void> {
    const client = new WarpClient();
    client.online.set(true);
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof LinkRequest) {
          server.send(LinkedResponse.create(envelope.node, envelope.lane));
        }
      };
      let linkCount = 0;
      client.downlink({
        hostUri: server.hostUri,
        nodeUri: "house/kitchen",
        laneUri: "light",
        didLink(): void {
          linkCount += 1;
          if (linkCount === 1) {
            exam.comment("online");
            client.online.set(false);
            server.close();
          } else if (linkCount === 2) {
            this.relink(false);
            exam.comment("back online");
            resolve();
          }
        },
        didDisconnect(): void {
          exam.comment("offline");
          exam.equal(linkCount, 1);
          client.online.set(true);
        },
      }).open();
    }, void 0, client);
  }

  @Test
  eventDownlinkCommand(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof CommandMessage) {
          exam.equal(envelope.node, Uri.parse("/house/kitchen"));
          exam.equal(envelope.lane, Uri.parse("light"));
          exam.equal(envelope.body, Text.from("on"));
          resolve();
        }
      };
      const downlink = client.downlink({
        hostUri: server.hostUri,
        nodeUri: "house/kitchen",
        laneUri: "light",
        relinks: false,
      }).open();
      downlink.command("on");
    });
  }
}
