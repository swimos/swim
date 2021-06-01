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

import {TestOptions, Test, Spec, Report} from "@swim/unit";
import {Attr, Slot, Record, Num, Selector} from "@swim/structure";
import {ReconExam} from "../ReconExam";

export class ReconSelectorParserSpec extends Spec {
  override createExam(report: Report, name: string, options: TestOptions): ReconExam {
    return new ReconExam(report, this, name, options);
  }

  @Test
  parseGetSelector(exam: ReconExam): void {
    exam.parses("$a", Selector.get("a"));
    exam.parses("$test", Selector.get("test"));
    exam.parses("$\"a b\"", Selector.get("a b"));
    exam.parses("$42", Selector.get(Num.from(42)));
    exam.parses("${{}}", Selector.get(Record.empty()));
    exam.parses("${1,2}", Selector.get(Record.of(1, 2)));
    exam.parses("${@test}", Selector.get(Record.of(Attr.of("test"))));
  }

  @Test
  parseGetAttrSelector(exam: ReconExam): void {
    exam.parses("$@test", Selector.getAttr("test"));
  }

  @Test
  parseGetItemSelector(exam: ReconExam): void {
    exam.parses("$#0", Selector.getItem(0));
  }

  @Test
  parsePathSelector(exam: ReconExam): void {
    exam.parses("$a.b", Selector.get("a").get("b"));
    exam.parses("$a.b.c", Selector.get("a").get("b").get("c"));
    exam.parses("$a.1", Selector.get("a").get(Num.from(1)));
    exam.parses("$a#1", Selector.get("a").getItem(1));
    exam.parses("$@foo.@bar", Selector.getAttr("foo").getAttr("bar"));
    exam.parses("${@foo}.{@bar}", Selector.get(Record.of(Attr.of("foo"))).get(Record.of(Attr.of("bar"))));
  }

  @Test
  parseKeysSelector(exam: ReconExam): void {
    exam.parses("$*:", Selector.keys());
  }

  @Test
  parseValuesSelector(exam: ReconExam): void {
    exam.parses("$:*", Selector.values());
  }

  @Test
  parseChildrenSelector(exam: ReconExam): void {
    exam.parses("$*", Selector.children());
  }

  @Test
  parseDescendantsSelector(exam: ReconExam): void {
    exam.parses("$**", Selector.descendants());
  }

  @Test
  parseKeysGetSelector(exam: ReconExam): void {
    exam.parses("$*:.a", Selector.keys().get("a"));
  }

  @Test
  parseGetKeysSelector(exam: ReconExam): void {
    exam.parses("$a.*:", Selector.get("a").keys());
  }

  @Test
  parseValuesGetSelector(exam: ReconExam): void {
    exam.parses("$:*.a", Selector.values().get("a"));
  }

  @Test
  parseGetValuesSelector(exam: ReconExam): void {
    exam.parses("$a.:*", Selector.get("a").values());
  }

  @Test
  parseChildrenGetSelector(exam: ReconExam): void {
    exam.parses("$*.a", Selector.children().get("a"));
  }

  @Test
  parseGetChildrenSelector(exam: ReconExam): void {
    exam.parses("$a.*", Selector.get("a").children());
  }

  @Test
  parseDescendantsGetSelector(exam: ReconExam): void {
    exam.parses("$**.a", Selector.descendants().get("a"));
  }

  @Test
  parseGetDescendantsSelector(exam: ReconExam): void {
    exam.parses("$a.**", Selector.get("a").descendants());
  }

  @Test
  parseGetChildrenGetSelector(exam: ReconExam): void {
    exam.parses("$a.*.b", Selector.get("a").children().get("b"));
    exam.parses("$a.*.b.*.c", Selector.get("a").children().get("b").children().get("c"));
  }

  @Test
  parseGetDescendantsGetSelector(exam: ReconExam): void {
    exam.parses("$a.**.b", Selector.get("a").descendants().get("b"));
    exam.parses("$a.**.b.**.c", Selector.get("a").descendants().get("b").descendants().get("c"));
  }

  @Test
  parseKeysGetAttrSelector(exam: ReconExam): void {
    exam.parses("$*:.@test", Selector.keys().getAttr("test"));
  }

  @Test
  parseGetAttrKeysSelector(exam: ReconExam): void {
    exam.parses("$@test.*:", Selector.getAttr("test").keys());
  }

  @Test
  parseValuesGetAttrSelector(exam: ReconExam): void {
    exam.parses("$:*.@test", Selector.values().getAttr("test"));
  }

  @Test
  parseGetAttrValuesSelector(exam: ReconExam): void {
    exam.parses("$@test.:*", Selector.getAttr("test").values());
  }

  @Test
  parseChildrenGetAttrSelector(exam: ReconExam): void {
    exam.parses("$*.@test", Selector.children().getAttr("test"));
  }

  @Test
  parseGetAttrChildrenSelector(exam: ReconExam): void {
    exam.parses("$@test.*", Selector.getAttr("test").children());
  }

  @Test
  parseDescendantsGetAttrSelector(exam: ReconExam): void {
    exam.parses("$**.@test", Selector.descendants().getAttr("test"));
  }

  @Test
  parseGetAttrDescendantsSelector(exam: ReconExam): void {
    exam.parses("$@test.**", Selector.getAttr("test").descendants());
  }

  @Test
  parseKeysGetItemSelector(exam: ReconExam): void {
    exam.parses("$*:#0", Selector.keys().getItem(0));
  }

  @Test
  parseGetItemKeysSelector(exam: ReconExam): void {
    exam.parses("$#0.*:", Selector.getItem(0).keys());
  }

  @Test
  parseValuesGetItemSelector(exam: ReconExam): void {
    exam.parses("$:*#0", Selector.values().getItem(0));
  }

  @Test
  parseGetItemValuesSelector(exam: ReconExam): void {
    exam.parses("$#0.:*", Selector.getItem(0).values());
  }

  @Test
  parseChildrenGetItemSelector(exam: ReconExam): void {
    exam.parses("$*#0", Selector.children().getItem(0));
  }

  @Test
  parseGetItemChildrenSelector(exam: ReconExam): void {
    exam.parses("$#0.*", Selector.getItem(0).children());
  }

  @Test
  parseDescendantsGetItemSelector(exam: ReconExam): void {
    exam.parses("$**#0", Selector.descendants().getItem(0));
  }

  @Test
  parseGetItemDescendantsSelector(exam: ReconExam): void {
    exam.parses("$#0.**", Selector.getItem(0).descendants());
  }

  @Test
  parseFilter(exam: ReconExam): void {
    exam.parses("$[$a]", Selector.get("a").filter());
    exam.parses("$[$1]", Selector.get(Num.from(1)).filter());
    exam.parses("$[$#1]", Selector.getItem(1).filter());
    exam.parses("$[$@test]", Selector.getAttr("test").filter());
  }

  @Test
  parseGetFilter(exam: ReconExam): void {
    exam.parses("$a[$b]", Selector.get("a").filter(Selector.get("b")));
  }

  @Test
  parseGetFilterGetSelector(exam: ReconExam): void {
    exam.parses("$a[$b].c", Selector.get("a").filter(Selector.get("b")).get("c"));
  }

  @Test
  parseGetAttrFilter(exam: ReconExam): void {
    exam.parses("$@foo[$b]", Selector.getAttr("foo").filter(Selector.get("b")));
  }

  @Test
  parseGetAttrFilterGetAttrSelector(exam: ReconExam): void {
    exam.parses("$@foo[$b].@bar", Selector.getAttr("foo").filter(Selector.get("b")).getAttr("bar"));
  }

  @Test
  parseGetItemFilter(exam: ReconExam): void {
    exam.parses("$#0[$b]", Selector.getItem(0).filter(Selector.get("b")));
  }

  @Test
  parseGetItemFilterGetItemSelector(exam: ReconExam): void {
    exam.parses("$#0[$b]#1", Selector.getItem(0).filter(Selector.get("b")).getItem(1));
  }

  @Test
  parseKeysFilter(exam: ReconExam): void {
    exam.parses("$*:[$a]", Selector.keys().filter(Selector.get("a")));
  }

  @Test
  parseValuesFilter(exam: ReconExam): void {
    exam.parses("$:*[$a]", Selector.values().filter(Selector.get("a")));
  }

  @Test
  parseChildrenFilter(exam: ReconExam): void {
    exam.parses("$*[$a]", Selector.children().filter(Selector.get("a")));
  }

  @Test
  parseDescendantsFilter(exam: ReconExam): void {
    exam.parses("$**[$a]", Selector.descendants().filter(Selector.get("a")));
  }

  @Test
  parseRecordsWithSelectors(exam: ReconExam): void {
    exam.parses("{a: $foo, b: $bar}", Record.of(Slot.of("a", Selector.get("foo")), Slot.of("b", Selector.get("bar"))));
  }
}
