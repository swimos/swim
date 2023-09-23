// Copyright 2015-2023 Nstream, inc.
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

import type {TestOptions} from "@swim/unit";
import {Test} from "@swim/unit";
import {Suite} from "@swim/unit";
import type {Report} from "@swim/unit";
import {Attr} from "@swim/structure";
import {Record} from "@swim/structure";
import {UnlinkRequest} from "@swim/warp";
import {WarpExam} from "./WarpExam";

export class UnlinkRequestSpec extends Suite {
  override createExam(report: Report, name: string, options: TestOptions): WarpExam {
    return new WarpExam(report, this, name, options);
  }

  @Test
  parseUnlinkWithNamedHeaders(exam: WarpExam): void {
    exam.parses("@unlink(node: node_uri, lane: lane_uri)",
                UnlinkRequest.create("node_uri", "lane_uri"));
  }

  @Test
  parseUnlinkWithPositionalHeaders(exam: WarpExam): void {
    exam.parses("@unlink(node_uri, lane_uri)",
                UnlinkRequest.create("node_uri", "lane_uri"));
  }

  @Test
  parseUnlinkWithBody(exam: WarpExam): void {
    exam.parses("@unlink(node_uri, lane_uri)@test",
                UnlinkRequest.create("node_uri", "lane_uri", Record.of(Attr.of("test"))));
  }

  @Test
  writeUnlink(exam: WarpExam): void {
    exam.writes(UnlinkRequest.create("node_uri", "lane_uri"),
                "@unlink(node:node_uri,lane:lane_uri)");
  }

  @Test
  writeUnlinkWithBody(exam: WarpExam): void {
    exam.writes(UnlinkRequest.create("node_uri", "lane_uri", Record.of(Attr.of("test"))),
                "@unlink(node:node_uri,lane:lane_uri)@test");
  }
}
