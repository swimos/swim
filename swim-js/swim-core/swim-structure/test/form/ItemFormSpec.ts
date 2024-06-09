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
import {Slot} from "@swim/structure";
import {Value} from "@swim/structure";
import {Num} from "@swim/structure";
import {Text} from "@swim/structure";
import {Form} from "@swim/structure";

export class ItemFormSpec extends Suite {
  @Test
  moldValuesToValues(exam: Exam): void {
    exam.equal(Form.forItem().mold(Num.from(42)), Num.from(42));
    exam.equal(Form.forItem().mold(Num.from(2.5)), Num.from(2.5));
    exam.equal(Form.forItem().mold(Text.from("test")), Text.from("test"));
    exam.equal(Form.forItem().mold(Value.extant()), Value.extant());
    exam.equal(Form.forItem().mold(Value.absent()), Value.absent());
  }

  @Test
  moldFieldsToFields(exam: Exam): void {
    exam.equal(Form.forItem().mold(Attr.of("a", 1)), Attr.of("a", 1));
    exam.equal(Form.forItem().mold(Slot.of("a", 1)), Slot.of("a", 1));
  }

  @Test
  castValuesToValues(exam: Exam): void {
    exam.equal(Form.forItem().cast(Num.from(42)), Num.from(42));
    exam.equal(Form.forItem().cast(Num.from(2.5)), Num.from(2.5));
    exam.equal(Form.forItem().cast(Text.from("test")), Text.from("test"));
    exam.equal(Form.forItem().cast(Value.extant()), Value.extant());
    exam.equal(Form.forItem().cast(Value.absent()), Value.absent());
  }

  @Test
  castFieldsToFields(exam: Exam): void {
    exam.equal(Form.forItem().cast(Attr.of("a", 1)), Attr.of("a", 1));
    exam.equal(Form.forItem().cast(Slot.of("a", 1)), Slot.of("a", 1));
  }
}
