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

import {Spec, Test, Exam} from "@swim/unit";
import {Attr, Slot, Record, Num, Text, Form} from "@swim/structure";

export class NumberFormSpec extends Spec {
  @Test
  moldDoublesToNums(exam: Exam): void {
    exam.equal(Form.forNumber().mold(2.5), Num.from(2.5));
  }

  @Test
  castNumsToDoubles(exam: Exam): void {
    exam.equal(Form.forNumber().cast(Num.from(42)), 42);
    exam.equal(Form.forNumber().cast(Num.from(-1)), -1);
    exam.equal(Form.forNumber().cast(Num.from(2.5)), 2.5);
  }

  @Test
  castStringsToDoubles(exam: Exam): void {
    exam.equal(Form.forNumber().cast(Text.from("42")), 42);
    exam.equal(Form.forNumber().cast(Text.from("-1")), -1);
  }

  @Test
  castFieldsToDoubles(exam: Exam): void {
    exam.equal(Form.forNumber().cast(Attr.of("a", 42)), 42);
    exam.equal(Form.forNumber().cast(Slot.of("a", -1)), -1);
    exam.equal(Form.forNumber().cast(Attr.of("a", "42")), 42);
    exam.equal(Form.forNumber().cast(Slot.of("a", "-1")), -1);
  }

  @Test
  castAttributedNumsToDoubles(exam: Exam): void {
    exam.equal(Form.forNumber().cast(Record.of(Attr.of("test"), 42)), 42);
  }
}
