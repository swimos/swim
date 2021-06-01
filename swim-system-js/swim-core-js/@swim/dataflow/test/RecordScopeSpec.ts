// Copyright 2015-2021 Swim inc.
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
import {Slot, Value, Record, Selector} from "@swim/structure";
import {RecordScope} from "@swim/dataflow";

export class RecordScopeSpec extends Spec {
  @Test
  compileGetSelectorFields(exam: Exam): void {
    const y = Selector.get("x");
    const scope = RecordScope.of(Slot.of("y", y), Slot.of("x", 2));
    exam.equal(scope.get("x").numberValue(), 2);
    exam.equal(scope.get("y"), Value.extant());

    scope.recohereInput(0);
    exam.equal(scope.get("x").numberValue(), 2);
    exam.equal(scope.get("y").numberValue(), 2);

    scope.set("x", 4);
    exam.equal(scope.get("x").numberValue(), 4);
    exam.equal(scope.get("y").numberValue(), 2);

    scope.recohereInput(1);
    exam.equal(scope.get("x").numberValue(), 4);
    exam.equal(scope.get("y").numberValue(), 4);
  }

  @Test
  compileOuterScopeGetSelectorFields(exam: Exam): void {
    const x = Record.of(Slot.of("y", Selector.get("z")));
    const scope = RecordScope.of(Slot.of("x", x), Slot.of("z", 2));
    exam.equal(scope.get("x"), Record.of(Slot.of("y")));
    exam.equal(scope.get("z").numberValue(), 2);

    scope.recohereInput(0);
    exam.equal(scope.get("x"), Record.of(Slot.of("y", 2)));
    exam.equal(scope.get("z").numberValue(), 2);

    scope.set("z", 4);
    exam.equal(scope.get("x"), Record.of(Slot.of("y", 2)));
    exam.equal(scope.get("z").numberValue(), 4);

    scope.recohereInput(1);
    exam.equal(scope.get("x"), Record.of(Slot.of("y", 4)));
    exam.equal(scope.get("z").numberValue(), 4);
  }

  @Test
  compileNestedGetSelectorFields(exam: Exam): void {
    const z = Selector.get("x").get("y");
    const scope = RecordScope.of(Slot.of("z", z), Slot.of("x", Record.of(Slot.of("a", 0), Slot.of("y", 2))));
    exam.equal(scope.get("x"), Record.of(Slot.of("a", 0), Slot.of("y", 2)));
    exam.equal(scope.get("z"), Value.extant());

    scope.recohereInput(0);
    exam.equal(scope.get("x"), Record.of(Slot.of("a", 0), Slot.of("y", 2)));
    exam.equal(scope.get("z").numberValue(), 2);

    (scope.get("x") as Record).set("y", 4);
    exam.equal(scope.get("x"), Record.of(Slot.of("a", 0), Slot.of("y", 4)));
    exam.equal(scope.get("z").numberValue(), 2);

    scope.recohereInput(1);
    exam.equal(scope.get("x"), Record.of(Slot.of("a", 0), Slot.of("y", 4)));
    exam.equal(scope.get("z").numberValue(), 4);
  }

  @Test
  compileDynamicGetSelectorFields(exam: Exam): void {
    const y = Selector.get(Selector.get("x"));
    const scope = RecordScope.of(Slot.of("a", 2), Slot.of("b", 4), Slot.of("x", "a"), Slot.of("y", y));
    exam.equal(scope.get("x").stringValue(), "a");
    exam.equal(scope.get("y"), Value.extant());

    scope.recohereInput(0);
    exam.equal(scope.get("x").stringValue(), "a");
    exam.equal(scope.get("y").numberValue(), 2);

    scope.set("x", "b");
    exam.equal(scope.get("x").stringValue(), "b");
    exam.equal(scope.get("y").numberValue(), 2);

    scope.recohereInput(1);
    exam.equal(scope.get("x").stringValue(), "b");
    exam.equal(scope.get("y").numberValue(), 4);
  }

  @Test
  compileConditionalOperators(exam: Exam): void {
    const z = Selector.get("x").conditional(Selector.get("y"), Selector.get("w"));
    const scope = RecordScope.of(Slot.of("x", true), Slot.of("z", z), Slot.of("y", 3), Slot.of("w", 5));
    exam.equal(scope.get("z"), Value.extant());

    scope.recohereInput(0);
    exam.equal(scope.get("z").numberValue(), 3);

    scope.set("x", false);
    exam.equal(scope.get("z").numberValue(), 3);

    scope.recohereInput(1);
    exam.equal(scope.get("z").numberValue(), 5);

    scope.set("w", 7);
    exam.equal(scope.get("z").numberValue(), 5);

    scope.recohereInput(2);
    exam.equal(scope.get("z").numberValue(), 7);
  }

  @Test
  compileBinaryOperators(exam: Exam): void {
    const z = Selector.get("x").plus(Selector.get("y"));
    const scope = RecordScope.of(Slot.of("x", 2), Slot.of("z", z), Slot.of("y", 3));
    exam.equal(scope.get("z"), Value.extant());

    scope.recohereInput(0);
    exam.equal(scope.get("z").numberValue(), 5);

    scope.set("x", 7);
    exam.equal(scope.get("z").numberValue(), 5);

    scope.recohereInput(1);
    exam.equal(scope.get("z").numberValue(), 10);

    scope.set("y", 11);
    exam.equal(scope.get("z").numberValue(), 10);

    scope.recohereInput(2);
    exam.equal(scope.get("z").numberValue(), 18);
  }

  @Test
  compileUnaryOperators(exam: Exam): void {
    const z = Selector.get("x").negative();
    const scope = RecordScope.of(Slot.of("x", 2), Slot.of("z", z));
    exam.equal(scope.get("z"), Value.extant());

    scope.recohereInput(0);
    exam.equal(scope.get("z").numberValue(), -2);

    scope.set("x", 3);
    exam.equal(scope.get("z").numberValue(), -2);

    scope.recohereInput(1);
    exam.equal(scope.get("z").numberValue(), -3);
  }

  @Test
  compileInvokeOperators(exam: Exam): void {
    const y = Selector.get("math").get("floor").invoke(Selector.get("x"));
    const scope = RecordScope.of(Slot.of("y", y), Slot.of("x", 2.1));
    exam.equal(scope.get("x").numberValue(), 2.1);
    exam.equal(scope.get("y"), Value.extant());

    scope.recohereInput(0);
    exam.equal(scope.get("x").numberValue(), 2.1);
    exam.equal(scope.get("y").numberValue(), 2.0);

    scope.set("x", 3.14);
    exam.equal(scope.get("x").numberValue(), 3.14);
    exam.equal(scope.get("y").numberValue(), 2.0);

    scope.recohereInput(1);
    exam.equal(scope.get("x").numberValue(), 3.14);
    exam.equal(scope.get("y").numberValue(), 3.0);
  }
}
