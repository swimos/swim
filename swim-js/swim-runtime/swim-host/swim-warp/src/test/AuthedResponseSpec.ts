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
import {AuthedResponse} from "@swim/warp";
import {WarpExam} from "./WarpExam";

export class AuthedResponseSpec extends Spec {
  override createExam(report: Report, name: string, options: TestOptions): WarpExam {
    return new WarpExam(report, this, name, options);
  }

  @Test
  parseAuthed(exam: WarpExam): void {
    exam.parses("@authed", AuthedResponse.create());
  }

  @Test
  parseAuthedWithBody(exam: WarpExam): void {
    exam.parses("@authed@test", AuthedResponse.create(Record.of(Attr.of("test"))));
  }

  @Test
  writeAuthed(exam: WarpExam): void {
    exam.writes(AuthedResponse.create(), "@authed");
  }

  @Test
  writeAuthedWithBody(exam: WarpExam): void {
    exam.writes(AuthedResponse.create(Record.of(Attr.of("test"))), "@authed@test");
  }
}
