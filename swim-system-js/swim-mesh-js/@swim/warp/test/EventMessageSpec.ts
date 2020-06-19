// Copyright 2015-2020 Swim inc.
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
import {EventMessage} from "@swim/warp";
import {WarpExam} from "./WarpExam";

export class EventMessageSpec extends Spec {
  createExam(report: Report, name: string, options: TestOptions): WarpExam {
    return new WarpExam(report, this, name, options);
  }

  @Test
  parseEventWithNamedHeaders(exam: WarpExam): void {
    exam.parses("@event(node: node_uri, lane: lane_uri)",
                EventMessage.of("node_uri", "lane_uri"));
  }

  @Test
  parseEventWithPositionalHeaders(exam: WarpExam): void {
    exam.parses("@event(node_uri, lane_uri)",
                EventMessage.of("node_uri", "lane_uri"));
  }

  @Test
  parseEventWithBody(exam: WarpExam): void {
    exam.parses("@event(node_uri, lane_uri)@test",
                EventMessage.of("node_uri", "lane_uri", Record.of(Attr.of("test"))));
  }

  @Test
  writeEvent(exam: WarpExam): void {
    exam.writes(EventMessage.of("node/uri", "lane_uri"),
                "@event(node:\"node/uri\",lane:lane_uri)");
  }

  @Test
  writeEventWithBody(exam: WarpExam): void {
    exam.writes(EventMessage.of("node/uri", "lane_uri", Record.of(Attr.of("test"))),
                "@event(node:\"node/uri\",lane:lane_uri)@test");
  }
}
