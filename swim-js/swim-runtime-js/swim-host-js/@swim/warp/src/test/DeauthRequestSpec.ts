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
import {Attr, Record} from "@swim/structure";
import {DeauthRequest} from "@swim/warp";
import {WarpExam} from "./WarpExam";

export class DeauthRequestSpec extends Spec {
  override createExam(report: Report, name: string, options: TestOptions): WarpExam {
    return new WarpExam(report, this, name, options);
  }

  @Test
  parseDeauth(exam: WarpExam): void {
    exam.parses("@deauth", DeauthRequest.create());
  }

  @Test
  parseDeauthWithBody(exam: WarpExam): void {
    exam.parses("@deauth@test", DeauthRequest.create(Record.of(Attr.of("test"))));
  }

  @Test
  writeDeauth(exam: WarpExam): void {
    exam.writes(DeauthRequest.create(), "@deauth");
  }

  @Test
  writeDeauthWithBody(exam: WarpExam): void {
    exam.writes(DeauthRequest.create(Record.of(Attr.of("test"))), "@deauth@test");
  }
}
