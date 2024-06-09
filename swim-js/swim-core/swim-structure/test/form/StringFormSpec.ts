// Copyright 2015-2024 Nstream, inc.
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

import type {Exam} from "@swim/unit";
import {Test} from "@swim/unit";
import {Suite} from "@swim/unit";
import {Attr} from "@swim/structure";
import {Record} from "@swim/structure";
import {Num} from "@swim/structure";
import {Text} from "@swim/structure";
import {Form} from "@swim/structure";

export class StringFormSpec extends Suite {
  @Test
  moldStrings(exam: Exam): void {
    exam.equal(Form.forString().mold("test"), Text.from("test"));
  }

  @Test
  castTextToStrings(exam: Exam): void {
    exam.equal(Form.forString().cast(Text.from("test")), "test");
  }

  @Test
  castNumsToStrings(exam: Exam): void {
    exam.equal(Form.forString().cast(Num.from(42)), "42");
  }

  @Test
  castAttributedStringsToStrings(exam: Exam): void {
    exam.equal(Form.forString().cast(Record.of(Attr.of("test"), "foo")), "foo");
  }
}
