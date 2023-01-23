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
import {Attr, Record} from "@swim/structure";
import {SyncRequest} from "@swim/warp";
import {WarpExam} from "./WarpExam";

export class SyncRequestSpec extends Spec {
  override createExam(report: Report, name: string, options: TestOptions): WarpExam {
    return new WarpExam(report, this, name, options);
  }

  @Test
  parseSyncWithNamedHeaders(exam: WarpExam): void {
    exam.parses("@sync(node: node_uri, lane: lane_uri, prio: 0.5, rate: 1.0)",
                SyncRequest.create("node_uri", "lane_uri", 0.5, 1.0));
  }

  @Test
  parseSyncWithPositionalHeaders(exam: WarpExam): void {
    exam.parses("@sync(node_uri, lane_uri, prio: 0.5)",
                SyncRequest.create("node_uri", "lane_uri", 0.5, 0.0));
  }

  @Test
  parseSyncWithBody(exam: WarpExam): void {
    exam.parses("@sync(node_uri, lane_uri)@test",
                SyncRequest.create("node_uri", "lane_uri", 0.0, 0.0, Record.of(Attr.of("test"))));
  }

  @Test
  writeSync(exam: WarpExam): void {
    exam.writes(SyncRequest.create("node_uri", "lane_uri", 0.0, 0.0),
                "@sync(node:node_uri,lane:lane_uri)");
  }

  @Test
  writeSyncWithPrio(exam: WarpExam): void {
    exam.writes(SyncRequest.create("node_uri", "lane_uri", 0.5, 0.0),
                "@sync(node:node_uri,lane:lane_uri,prio:0.5)");
  }

  @Test
  writeSyncWithRate(exam: WarpExam): void {
    exam.writes(SyncRequest.create("node_uri", "lane_uri", 0.0, 1.0),
                "@sync(node:node_uri,lane:lane_uri,rate:1)");
  }

  @Test
  writeSyncWithPrioAndRate(exam: WarpExam): void {
    exam.writes(SyncRequest.create("node_uri", "lane_uri", 0.5, 1.0),
                "@sync(node:node_uri,lane:lane_uri,prio:0.5,rate:1)");
  }

  @Test
  writeSyncWithBody(exam: WarpExam): void {
    exam.writes(SyncRequest.create("node_uri", "lane_uri", 0.0, 0.0, Record.of(Attr.of("test"))),
                "@sync(node:node_uri,lane:lane_uri)@test");
  }
}
