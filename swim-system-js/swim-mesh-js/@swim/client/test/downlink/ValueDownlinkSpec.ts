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
import {AnyValue, Value, Text} from "@swim/structure";
import {
  Envelope,
  EventMessage,
  CommandMessage,
  LinkedResponse,
  SyncRequest,
  SyncedResponse,
} from "@swim/warp";
import {Uri} from "@swim/uri";
import {ValueDownlink, WarpClient} from "@swim/client";
import {MockServer} from "../MockServer";
import {ClientExam} from "../ClientExam";

export class ValueDownlinkSpec extends Spec {
  createExam(report: Report, name: string, options: TestOptions): ClientExam {
    return new ClientExam(report, this, name, options);
  }

  @Test
  valueDownlinkSet(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof CommandMessage) {
          exam.equal(envelope.node(), Uri.parse("house/kitchen"));
          exam.equal(envelope.lane(), Uri.parse("light"));
          exam.equal(envelope.body(), Text.from("on"));
          resolve();
        }
      };
      const downlink = client.downlinkValue()
        .hostUri(server.hostUri())
        .nodeUri("house/kitchen")
        .laneUri("light")
        .keepLinked(false)
        .open();
      exam.equal(downlink.get(), Value.absent());
      downlink.set("on");
      exam.equal(downlink.get(), Text.from("on"));
    });
  }

  @Test
  valueDownlinkRemoteSet(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof SyncRequest) {
          server.send(LinkedResponse.of(envelope.node(), envelope.lane()));
          server.send(EventMessage.of(envelope.node(), envelope.lane(), Text.from('on')));
          server.send(SyncedResponse.of(envelope.node(), envelope.lane()));
        }
      };
      client.downlinkValue()
        .hostUri(server.hostUri())
        .nodeUri("house/kitchen")
        .laneUri("light")
        .keepLinked(false)
        .willSet(function (newValue: Value, downlink: ValueDownlink<Value, AnyValue>): void {
          exam.comment("willSet");
          exam.equal(newValue, Text.from("on"));
          exam.equal(downlink.get(), Value.absent());
        })
        .didSet(function (newValue: Value, oldValue: Value, downlink: ValueDownlink<Value, AnyValue>): void {
          exam.comment("didSet");
          exam.equal(newValue, Text.from("on"));
          exam.equal(oldValue, Value.absent());
          exam.equal(downlink.get(), Text.from("on"));
          resolve();
        })
        .open();
    });
  }
}
