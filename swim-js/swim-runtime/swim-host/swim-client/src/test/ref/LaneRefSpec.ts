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

export class LaneRefSpec extends Spec {
  override createExam(report: Report, name: string, options: TestOptions): ClientExam {
    return new ClientExam(report, this, name, options);
  }

  @Test
  clientLaneRef(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      const laneRef1 = client.laneRef(server.hostUri, "house/kitchen", "light");
      exam.equal(laneRef1.hostUri(), server.hostUri);
      exam.equal(laneRef1.nodeUri(), Uri.parse("house/kitchen"));
      exam.equal(laneRef1.laneUri(), Uri.parse("light"));
      const laneRef2 = client.laneRef(server.resolve("house/kitchen"), "light");
      exam.equal(laneRef2.hostUri(), server.hostUri);
      exam.equal(laneRef2.nodeUri(), Uri.parse("house/kitchen"));
      exam.equal(laneRef2.laneUri(), Uri.parse("light"));
      resolve();
    });
  }

  @Test
  hostRefLaneRef(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      const hostRef = client.hostRef(server.hostUri);
      const laneRef = hostRef.laneRef("house/kitchen", "light");
      exam.equal(laneRef.hostUri(), server.hostUri);
      exam.equal(laneRef.nodeUri(), Uri.parse("house/kitchen"));
      exam.equal(laneRef.laneUri(), Uri.parse("light"));
      resolve();
    });
  }

  @Test
  nodeRefLaneRef(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      const nodeRef = client.nodeRef(server.hostUri, "house/kitchen");
      const laneRef = nodeRef.laneRef("light");
      exam.equal(laneRef.hostUri(), server.hostUri);
      exam.equal(laneRef.nodeUri(), Uri.parse("house/kitchen"));
      exam.equal(laneRef.laneUri(), Uri.parse("light"));
      resolve();
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
      laneRef.downlink({
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

  //@Test
  //laneRefClose(exam: ClientExam): Promise<void> {
  //  return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
  //    server.onEnvelope = function (envelope: Envelope): void {
  //      if (envelope instanceof LinkRequest) {
  //        server.send(LinkedResponse.create(envelope.node, envelope.lane));
  //      }
  //    };
  //    const laneRef = client.laneRef(server.hostUri, "house/kitchen", "light");
  //    let linkCount = 0;
  //    let closeCount = 0;
  //    function didLink(): void {
  //      linkCount += 1;
  //      exam.comment("link " + linkCount);
  //      if (linkCount === 2) {
  //        laneRef.close();
  //      }
  //    }
  //    function didClose(): void {
  //      closeCount += 1;
  //      exam.comment("close " + closeCount);
  //      if (closeCount === 2) {
  //        resolve();
  //      }
  //    }
  //    laneRef.downlink({
  //      relinks: false,
  //      didLink,
  //      didClose,
  //    }).open();
  //    laneRef.downlink({
  //      relinks: false,
  //      didLink,
  //      didClose,
  //    }).open();
  //  });
  //}
}
