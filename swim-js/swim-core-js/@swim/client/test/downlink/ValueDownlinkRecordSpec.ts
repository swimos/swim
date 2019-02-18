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
import {Value, Record, Text} from "@swim/structure";
import {AbstractInlet} from "@swim/streamlet";
import {
  Envelope,
  EventMessage,
  LinkedResponse,
  SyncRequest,
  SyncedResponse,
} from "@swim/warp";
import {ValueDownlinkRecord, SwimClient} from "@swim/client";
import {MockServer} from "../MockServer";
import {ClientExam} from "../ClientExam";

export class ValueDownlinkRecordSpec extends Spec {
  createExam(report: Report, name: string, options: TestOptions): ClientExam {
    return new ClientExam(report, this, name, options);
  }

  @Test
  valueDownlinkRemoteSet(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: SwimClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof SyncRequest) {
          server.send(LinkedResponse.of(envelope.node(), envelope.lane()));
          server.send(EventMessage.of(envelope.node(), envelope.lane(), Text.from('on')));
          server.send(SyncedResponse.of(envelope.node(), envelope.lane()));
        }
      };
      const downlink = client.downlinkValue()
        .hostUri(server.hostUri())
        .nodeUri("house/kitchen")
        .laneUri("light")
        .keepLinked(false)
        .open();
      const record = new ValueDownlinkRecord(downlink);

      class StateOutput extends AbstractInlet<Value> {
        didReconcileOutput(version: number): void {
          const state = this._input!.get()!;
          exam.equal(state, Record.of("on"));
          resolve();
        }
      }
      const state = new StateOutput();
      state.bindInput(record);
    });
  }
}
