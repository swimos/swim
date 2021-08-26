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
import {Slot, Value, Record, Num, Text, Form} from "@swim/structure";

export class AnyFormSpec extends Spec {
  @Test
  moldPrimitivesToValues(exam: Exam): void {
    exam.equal(Form.forAny().mold(42), Num.from(42));
    exam.equal(Form.forAny().mold(2.5), Num.from(2.5));
    exam.equal(Form.forAny().mold("test"), Text.from("test"));
    exam.equal(Form.forAny().mold(null), Value.extant());
    exam.equal(Form.forAny().mold(void 0), Value.absent());
    exam.equal(Form.forAny().mold([1, 2, 3]), Record.of(1, 2, 3));
    exam.equal(Form.forAny().mold({a: 1, b: 2}), Record.of(Slot.of("a", 1), Slot.of("b", 2)));
  }

  @Test
  castValuesToPrimitives(exam: Exam): void {
    exam.equal(Form.forAny().cast(Num.from(42)), 42);
    exam.equal(Form.forAny().cast(Num.from(2.5)), 2.5);
    exam.equal(Form.forAny().cast(Text.from("test")), "test");
    exam.equal(Form.forAny().cast(Value.extant()), null);
    exam.equal(Form.forAny().cast(Value.absent()), void 0);
    exam.equal(Form.forAny().cast(Record.of(1, 2, 3)), [1, 2, 3]);
    exam.equal(Form.forAny().cast(Record.of(Slot.of("a", 1), Slot.of("b", 2))), {a: 1, b: 2});
  }
}
