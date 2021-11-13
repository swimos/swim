// Copyright 2015-2021 Swim Inc.
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
import {AbstractMapInlet} from "@swim/streamlet";
import {
  Envelope,
  EventMessage,
  LinkedResponse,
  SyncRequest,
  SyncedResponse,
} from "@swim/warp";
import {MapDownlinkRecord, WarpClient} from "@swim/client";
import type {MockServer} from "../MockServer";
import {ClientExam} from "../ClientExam";

export class MapDownlinkRecordSpec extends Spec {
  override createExam(report: Report, name: string, options: TestOptions): ClientExam {
    return new ClientExam(report, this, name, options);
  }

  @Test
  mapDownlinkRecordRemoteUpdate(exam: ClientExam): Promise<void> {
    return exam.mockServer((server: MockServer, client: WarpClient, resolve: () => void): void => {
      server.onEnvelope = function (envelope: Envelope): void {
        if (envelope instanceof SyncRequest) {
          server.send(LinkedResponse.create(envelope.node, envelope.lane));
          const header = Record.of(Slot.of("key", "the"));
          server.send(EventMessage.create(envelope.node, envelope.lane,
                      Attr.of("update", header).concat("definite article")));
          server.send(SyncedResponse.create(envelope.node, envelope.lane));
        }
      };
      const downlink = client.downlinkMap()
        .hostUri(server.hostUri)
        .nodeUri("dictionary/english")
        .laneUri("definitions")
        .keepLinked(false)
        .open();
      const record = new MapDownlinkRecord(downlink);

      class StateOutput extends AbstractMapInlet<Value, Value, Record> {
        override didRecohereOutputKey(key: Value, version: number): void {
          const state = this.input!.get()!;
          exam.equal(key, Text.from("the"));
          exam.equal(state.get(Text.from("the")), Text.from("definite article"));
        }
        override didRecohereOutput(version: number): void {
          const state = this.input!.get()!;
          exam.equal(state, Record.of(Slot.of("the", "definite article")));
          resolve();
        }
      }
      const state = new StateOutput();
      state.bindInput(record);
    });
  }
}
