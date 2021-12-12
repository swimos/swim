// Copyright 2015-2021 Swim.inc
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
import {CommandMessage} from "@swim/warp";
import {WarpExam} from "./WarpExam";

export class CommandMessageSpec extends Spec {
  override createExam(report: Report, name: string, options: TestOptions): WarpExam {
    return new WarpExam(report, this, name, options);
  }

  @Test
  parseCommandWithNamedHeaders(exam: WarpExam): void {
    exam.parses("@command(node: node_uri, lane: lane_uri)",
                CommandMessage.create("node_uri", "lane_uri"));
  }

  @Test
  parseCommandWithPositionalHeaders(exam: WarpExam): void {
    exam.parses("@command(node_uri, lane_uri)",
                CommandMessage.create("node_uri", "lane_uri"));
  }

  @Test
  parseCommandWithBody(exam: WarpExam): void {
    exam.parses("@command(node_uri, lane_uri)@test",
                CommandMessage.create("node_uri", "lane_uri", Record.of(Attr.of("test"))));
  }

  @Test
  writeCommand(exam: WarpExam): void {
    exam.writes(CommandMessage.create("node_uri", "lane_uri"),
                "@command(node:node_uri,lane:lane_uri)");
  }

  @Test
  writeCommandWithBody(exam: WarpExam): void {
    exam.writes(CommandMessage.create("node_uri", "lane_uri", Record.of(Attr.of("test"))),
                "@command(node:node_uri,lane:lane_uri)@test");
  }
}
