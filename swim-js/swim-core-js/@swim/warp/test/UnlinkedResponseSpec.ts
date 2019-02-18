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
import {UnlinkedResponse} from "@swim/warp";
import {WarpExam} from "./WarpExam";

export class UnlinkedResponseSpec extends Spec {
  createExam(report: Report, name: string, options: TestOptions): WarpExam {
    return new WarpExam(report, this, name, options);
  }

  @Test
  parseUnlinkedWithNamedHeaders(exam: WarpExam): void {
    exam.parses("@unlinked(node: node_uri, lane: lane_uri)",
                UnlinkedResponse.of("node_uri", "lane_uri"));
  }

  @Test
  parseUnlinkedWithPositionalHeaders(exam: WarpExam): void {
    exam.parses("@unlinked(node_uri, lane_uri)",
                UnlinkedResponse.of("node_uri", "lane_uri"));
  }

  @Test
  parseUnlinkedWithBody(exam: WarpExam): void {
    exam.parses("@unlinked(node_uri, lane_uri)@test",
                UnlinkedResponse.of("node_uri", "lane_uri", Record.of(Attr.of("test"))));
  }

  @Test
  writeUnlinked(exam: WarpExam): void {
    exam.writes(UnlinkedResponse.of("node_uri", "lane_uri"),
                "@unlinked(node:node_uri,lane:lane_uri)");
  }

  @Test
  writeUnlinkedWithBody(exam: WarpExam): void {
    exam.writes(UnlinkedResponse.of("node_uri", "lane_uri", Record.of(Attr.of("test"))),
                "@unlinked(node:node_uri,lane:lane_uri)@test");
  }
}
