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

import {Spec, Test, Exam} from "@swim/unit";
import {Attr, Slot, Value, Num, Text, Form} from "@swim/structure";

export class ValueFormSpec extends Spec {
  @Test
  moldValuesToValues(exam: Exam): void {
    exam.equal(Form.forValue().mold(Num.from(42)), Num.from(42));
    exam.equal(Form.forValue().mold(Num.from(2.5)), Num.from(2.5));
    exam.equal(Form.forValue().mold(Text.from("test")), Text.from("test"));
    exam.equal(Form.forValue().mold(Value.extant()), Value.extant());
    exam.equal(Form.forValue().mold(Value.absent()), Value.absent());
  }

  @Test
  castValuesToValues(exam: Exam): void {
    exam.equal(Form.forValue().cast(Num.from(42)), Num.from(42));
    exam.equal(Form.forValue().cast(Num.from(2.5)), Num.from(2.5));
    exam.equal(Form.forValue().cast(Text.from("test")), Text.from("test"));
    exam.equal(Form.forValue().cast(Value.extant()), Value.extant());
    exam.equal(Form.forValue().cast(Value.absent()), Value.absent());
  }

  @Test
  castFieldsToValues(exam: Exam): void {
    exam.equal(Form.forValue().cast(Attr.of("a", 1)), Num.from(1));
    exam.equal(Form.forValue().cast(Slot.of("a", 1)), Num.from(1));
  }
}
