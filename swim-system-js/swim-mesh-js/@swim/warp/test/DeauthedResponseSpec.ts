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
import {DeauthedResponse} from "@swim/warp";
import {WarpExam} from "./WarpExam";

export class DeauthedResponseSpec extends Spec {
  createExam(report: Report, name: string, options: TestOptions): WarpExam {
    return new WarpExam(report, this, name, options);
  }

  @Test
  parseDeauthed(exam: WarpExam): void {
    exam.parses("@deauthed", DeauthedResponse.create());
  }

  @Test
  parseDeauthedWithBody(exam: WarpExam): void {
    exam.parses("@deauthed@test", DeauthedResponse.create(Record.of(Attr.of("test"))));
  }

  @Test
  writeDeauthed(exam: WarpExam): void {
    exam.writes(DeauthedResponse.create(), "@deauthed");
  }

  @Test
  writeDeauthedWithBody(exam: WarpExam): void {
    exam.writes(DeauthedResponse.create(Record.of(Attr.of("test"))), "@deauthed@test");
  }
}
