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
import {LinkedResponse} from "@swim/warp";
import {WarpExam} from "./WarpExam";

export class LinkedResponseSpec extends Spec {
  override createExam(report: Report, name: string, options: TestOptions): WarpExam {
    return new WarpExam(report, this, name, options);
  }

  @Test
  parseLinkedWithNamedHeaders(exam: WarpExam): void {
    exam.parses("@linked(node: node_uri, lane: lane_uri, prio: 0.5, rate: 1.0)",
                LinkedResponse.create("node_uri", "lane_uri", 0.5, 1.0));
  }

  @Test
  parseLinkedWithPositionalHeaders(exam: WarpExam): void {
    exam.parses("@linked(node_uri, lane_uri)",
                LinkedResponse.create("node_uri", "lane_uri", 0.0, 0.0));
  }

  @Test
  parseLinkedWithBody(exam: WarpExam): void {
    exam.parses("@linked(node_uri, lane_uri)@test",
                LinkedResponse.create("node_uri", "lane_uri", 0.0, 0.0, Record.of(Attr.of("test"))));
  }

  @Test
  writeLinked(exam: WarpExam): void {
    exam.writes(LinkedResponse.create("node_uri", "lane_uri", 0.0, 0.0),
                "@linked(node:node_uri,lane:lane_uri)");
  }

  @Test
  writeLinkedWithPrio(exam: WarpExam): void {
    exam.writes(LinkedResponse.create("node_uri", "lane_uri", 0.5, 0.0),
                "@linked(node:node_uri,lane:lane_uri,prio:0.5)");
  }

  @Test
  writeLinkedWithRate(exam: WarpExam): void {
    exam.writes(LinkedResponse.create("node_uri", "lane_uri", 0.0, 1.0),
                "@linked(node:node_uri,lane:lane_uri,rate:1)");
  }

  @Test
  writeLinkedWithPrioAndRate(exam: WarpExam): void {
    exam.writes(LinkedResponse.create("node_uri", "lane_uri", 0.5, 1.0),
                "@linked(node:node_uri,lane:lane_uri,prio:0.5,rate:1)");
  }

  @Test
  writeLinkedWithBody(exam: WarpExam): void {
    exam.writes(LinkedResponse.create("node_uri", "lane_uri", 0.0, 0.0, Record.of(Attr.of("test"))),
                "@linked(node:node_uri,lane:lane_uri)@test");
  }
}
