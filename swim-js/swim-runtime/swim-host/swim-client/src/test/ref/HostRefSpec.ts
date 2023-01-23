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
import {Value, Text} from "@swim/structure";
import {Uri} from "@swim/uri";
import {Envelope, EventMessage, CommandMessage, LinkRequest, LinkedResponse} from "@swim/warp";
import type {WarpClient} from "@swim/client";
import type {MockServer} from "../MockServer";
import {ClientExam} from "../ClientExam";

export class HostRefSpec extends Spec {
  override createExam(report: Report, name: string, options: TestOptions): ClientExam {
    return new ClientExam(report, this, name, options);
  }

  @Test
  clientHostRef(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      const hostRef = client.hostRef(server.hostUri);
      exam.equal(hostRef.hostUri(), server.hostUri);
      resolve();
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
      hostRef.downlink({
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
          exam.equal(body, Text.from("on"));
          resolve();
        },
      }).open();
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

  //@Test
  //hostRefClose(exam: ClientExam): Promise<void> {
  //  return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
  //    server.onEnvelope = function (envelope: Envelope): void {
  //      if (envelope instanceof LinkRequest) {
  //        server.send(LinkedResponse.create(envelope.node, envelope.lane));
  //      }
  //    };
  //    const hostRef = client.hostRef(server.hostUri);
  //    let linkCount = 0;
  //    let closeCount = 0;
  //    function didLink(): void {
  //      linkCount += 1;
  //      exam.comment("link " + linkCount);
  //      if (linkCount === 2) {
  //        hostRef.close();
  //      }
  //    }
  //    function didClose(): void {
  //      closeCount += 1;
  //      exam.comment("close " + closeCount);
  //      if (closeCount === 2) {
  //        resolve();
  //      }
  //    }
  //    hostRef.downlink({
  //      nodeUri: "house/kitchen",
  //      laneUri: "light",
  //      relinks: false,
  //      didLink,
  //      didClose,
  //    }).open();
  //    hostRef.downlink({
  //      nodeUri: "house/garage",
  //      laneUri: "light",
  //      relinks: false,
  //      didLink,
  //      didClose,
  //    }).open();
  //  });
  //}
}
