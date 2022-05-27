// Copyright 2015-2022 Swim.inc
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

export class NodeRefSpec extends Spec {
  override createExam(report: Report, name: string, options: TestOptions): ClientExam {
    return new ClientExam(report, this, name, options);
  }

  @Test
  clientNodeRef(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      const node1 = client.nodeRef(server.hostUri, "house/kitchen");
      exam.equal(node1.hostUri(), server.hostUri);
      exam.equal(node1.nodeUri(), Uri.parse("house/kitchen"));
      const node2 = client.nodeRef(server.resolve("house/kitchen"));
      exam.equal(node2.hostUri(), server.hostUri);
      exam.equal(node2.nodeUri(), Uri.parse("house/kitchen"));
      resolve();
    });
  }

  @Test
  hostRefNodeRef(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      const hostRef = client.hostRef(server.hostUri);
      const nodeRef = hostRef.nodeRef("house/kitchen");
      exam.equal(nodeRef.hostUri(), server.hostUri);
      exam.equal(nodeRef.nodeUri(), Uri.parse("house/kitchen"));
      resolve();
    });
  }

  @Test
  nodeRefDownlink(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        exam.instanceOf(envelope, LinkRequest);
        exam.equal(envelope.node, Uri.parse("house/kitchen"));
        exam.equal(envelope.lane, Uri.parse("light"));
        server.send(LinkedResponse.create(envelope.node, envelope.lane));
        server.send(EventMessage.create(envelope.node, envelope.lane, Text.from("on")));
      };
      const nodeRef = client.nodeRef(server.hostUri, "house/kitchen");
      nodeRef.downlink({
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
  nodeRefCommand(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        exam.instanceOf(envelope, CommandMessage);
        exam.equal(envelope.node, Uri.parse("house/kitchen"));
        exam.equal(envelope.lane, Uri.parse("light"));
        exam.equal(envelope.body, Text.from("on"));
        resolve();
      };
      const nodeRef = client.nodeRef(server.hostUri, "house/kitchen");
      nodeRef.command("light", "on");
    });
  }

  //@Test
  //nodeRefClose(exam: ClientExam): Promise<void> {
  //  return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
  //    server.onEnvelope = function (envelope: Envelope): void {
  //      if (envelope instanceof LinkRequest) {
  //        server.send(LinkedResponse.create(envelope.node, envelope.lane));
  //      }
  //    };
  //    const nodeRef = client.nodeRef(server.hostUri, "house/kitchen");
  //    let linkCount = 0;
  //    let closeCount = 0;
  //    function didLink(): void {
  //      linkCount += 1;
  //      exam.comment("link " + linkCount);
  //      if (linkCount === 2) {
  //        nodeRef.close();
  //      }
  //    }
  //    function didClose(): void {
  //      closeCount += 1;
  //      exam.comment("close " + closeCount);
  //      if (closeCount === 2) {
  //        resolve();
  //      }
  //    }
  //    nodeRef.downlink({
  //      laneUri: "light",
  //      relinks: false,
  //      didLink,
  //      didClose,
  //    }).open();
  //    nodeRef.downlink({
  //      laneUri: "power",
  //      relinks: false,
  //      didLink,
  //      didClose,
  //    }).open();
  //  });
  //}
}
