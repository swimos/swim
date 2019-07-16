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
import {Attr, Record} from "@swim/structure";
import {LinkRequest} from "@swim/warp";
import {WarpExam} from "./WarpExam";

export class LinkRequestSpec extends Spec {
  createExam(report: Report, name: string, options: TestOptions): WarpExam {
    return new WarpExam(report, this, name, options);
  }

  @Test
  parseLinkWithNamedHeaders(exam: WarpExam): void {
    exam.parses("@link(node: node_uri, lane: lane_uri, prio: 0.5, rate: 1.0)",
                LinkRequest.of("node_uri", "lane_uri", 0.5, 1.0));
  }

  @Test
  parseLinkWithPositionalHeaders(exam: WarpExam): void {
    exam.parses("@link(node_uri, lane_uri)",
                LinkRequest.of("node_uri", "lane_uri", 0.0, 0.0));
  }

  @Test
  parseLinkWithBody(exam: WarpExam): void {
    exam.parses("@link(node_uri, lane_uri)@test",
                LinkRequest.of("node_uri", "lane_uri", 0.0, 0.0, Record.of(Attr.of("test"))));
  }

  @Test
  writeLink(exam: WarpExam): void {
    exam.writes(LinkRequest.of("node_uri", "lane_uri", 0.0, 0.0),
                "@link(node:node_uri,lane:lane_uri)");
  }

  @Test
  writeLinkWithPrio(exam: WarpExam): void {
    exam.writes(LinkRequest.of("node_uri", "lane_uri", 0.5, 0.0),
                "@link(node:node_uri,lane:lane_uri,prio:0.5)");
  }

  @Test
  writeLinkWithRate(exam: WarpExam): void {
    exam.writes(LinkRequest.of("node_uri", "lane_uri", 0.0, 1.0),
                "@link(node:node_uri,lane:lane_uri,rate:1)");
  }

  @Test
  writeLinkWithPrioAndRate(exam: WarpExam): void {
    exam.writes(LinkRequest.of("node_uri", "lane_uri", 0.5, 1.0),
                "@link(node:node_uri,lane:lane_uri,prio:0.5,rate:1)");
  }

  @Test
  writeLinkWithBody(exam: WarpExam): void {
    exam.writes(LinkRequest.of("node_uri", "lane_uri", 0.0, 0.0, Record.of(Attr.of("test"))),
                "@link(node:node_uri,lane:lane_uri)@test");
  }
}
