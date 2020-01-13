// Copyright 2015-2020 SWIM.AI inc.
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
import {Slot, Value, Record, Num, Text, Selector} from "@swim/structure";

export class LambdaFuncSpec extends Spec {
  @Test
  evaluateIdentityLambda(exam: Exam): void {
    const scope = Record.of(Slot.of("f", Text.from("x").lambda(
        Selector.get("x"))));
    exam.equal(Selector.get("f").invoke(Num.from(3)).evaluate(scope),
        Num.from(3));
    exam.equal(Selector.get("f").invoke(Text.from("test")).evaluate(scope),
        Text.from("test"));
  }

  @Test
  evaluateUnaryLambda(exam: Exam): void {
    const scope = Record.of(Slot.of("f", Text.from("x").lambda(
        Selector.get("x").plus(Num.from(1)))));
    exam.equal(Selector.get("f").invoke(Num.from(3)).evaluate(scope),
        Num.from(4));
    exam.equal(Selector.get("f").invoke(Num.from(0)).evaluate(scope),
        Num.from(1));
  }

  @Test
  evaluateBinaryLambda(exam: Exam): void {
    const scope = Record.of(Slot.of("f", Record.of("x", "y").lambda(
        Selector.get("x").plus(Selector.get("y")))));
    exam.equal(Selector.get("f").invoke(Record.of(3, 5)).evaluate(scope),
        Num.from(8));
    exam.equal(Selector.get("f").invoke(Record.of("a", "b")).evaluate(scope),
        Text.from("ab"));
  }

  @Test
  evaluateLambdaWithDefaultBindings(exam: Exam): void {
    const scope = Record.of(Slot.of("f", Record.of(Slot.of("x", 1), Slot.of("y", 1)).lambda(
        Selector.get("x").plus(Selector.get("y")))));
    exam.equal(Selector.get("f").invoke(Record.of(3, 5)).evaluate(scope),
        Num.from(8));
    exam.equal(Selector.get("f").invoke(Num.from(3)).evaluate(scope),
        Num.from(4));
    exam.equal(Selector.get("f").invoke(Value.extant()).evaluate(scope),
        Num.from(2));
  }
}
