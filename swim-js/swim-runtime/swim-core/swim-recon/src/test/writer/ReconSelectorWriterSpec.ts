// Copyright 2015-2022 Swim.inc
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

export class ReconSelectorWriterSpec extends Spec {
  override createExam(report: Report, name: string, options: TestOptions): ReconExam {
    return new ReconExam(report, this, name, options);
  }

  @Test
  writeIdentitySelector(exam: ReconExam): void {
    exam.writes(Selector.identity(), "");
  }

  @Test
  writeGetSelector(exam: ReconExam): void {
    exam.writes(Selector.get("a"), "$a");
    exam.writes(Selector.get("test"), "$test");
    exam.writes(Selector.get("a b"), "$\"a b\"");
    exam.writes(Selector.get(Num.from(42)), "$42");
    exam.writes(Selector.get(Record.empty()), "${{}}");
    exam.writes(Selector.get(Record.of(1, 2)), "${1,2}");
    exam.writes(Selector.get(Record.of(Attr.of("test"))), "${@test}");
  }
  @Test
  writeGetAttrSelector(exam: ReconExam): void {
    exam.writes(Selector.getAttr("test"), "$@test");
  }

  @Test
  writeGetItemSelector(exam: ReconExam): void {
    exam.writes(Selector.getItem(0), "$#0");
  }

  @Test
  writePathSelector(exam: ReconExam): void {
    exam.writes(Selector.get("a").get("b"), "$a.b");
    exam.writes(Selector.get("a").get("b").get("c"), "$a.b.c");
    exam.writes(Selector.get("a").get(Num.from(1)), "$a.1");
    exam.writes(Selector.get("a").getItem(1), "$a#1");
    exam.writes(Selector.getAttr("foo").getAttr("bar"), "$@foo.@bar");
    exam.writes(Selector.get(Record.of(Attr.of("foo"))).get(Record.of(Attr.of("bar"))), "${@foo}.{@bar}");
  }

  @Test
  writeKeysSelector(exam: ReconExam): void {
    exam.writes(Selector.keys(), "$*:");
  }

  @Test
  writeValuesSelector(exam: ReconExam): void {
    exam.writes(Selector.values(), "$:*");
  }

  @Test
  writeChildrenSelector(exam: ReconExam): void {
    exam.writes(Selector.children(), "$*");
  }

  @Test
  writeDescendantsSelector(exam: ReconExam): void {
    exam.writes(Selector.descendants(), "$**");
  }

  @Test
  writeKeysGetSelector(exam: ReconExam): void {
    exam.writes(Selector.keys().get("a"), "$*:.a");
  }

  @Test
  writeGetKeysSelector(exam: ReconExam): void {
    exam.writes(Selector.get("a").keys(), "$a.*:");
  }

  @Test
  writeValuesGetSelector(exam: ReconExam): void {
    exam.writes(Selector.values().get("a"), "$:*.a");
  }

  @Test
  writeGetValuesSelector(exam: ReconExam): void {
    exam.writes(Selector.get("a").values(), "$a.:*");
  }

  @Test
  writeChildrenGetSelector(exam: ReconExam): void {
    exam.writes(Selector.children().get("a"), "$*.a");
  }

  @Test
  writeGetChildrenSelector(exam: ReconExam): void {
    exam.writes(Selector.get("a").children(), "$a.*");
  }

  @Test
  writeDescendantsGetSelector(exam: ReconExam): void {
    exam.writes(Selector.descendants().get("a"), "$**.a");
  }

  @Test
  writeGetDescendantsSelector(exam: ReconExam): void {
    exam.writes(Selector.get("a").descendants(), "$a.**");
  }

  @Test
  writeGetChildrenGetSelector(exam: ReconExam): void {
    exam.writes(Selector.get("a").children().get("b"), "$a.*.b");
    exam.writes(Selector.get("a").children().get("b").children().get("c"), "$a.*.b.*.c");
  }

  @Test
  writeGetDescendantsGetSelector(exam: ReconExam): void {
    exam.writes(Selector.get("a").descendants().get("b"), "$a.**.b");
    exam.writes(Selector.get("a").descendants().get("b").descendants().get("c"), "$a.**.b.**.c");
  }

  @Test
  writeKeysGetAttrSelector(exam: ReconExam): void {
    exam.writes(Selector.keys().getAttr("test"), "$*:.@test");
  }

  @Test
  writeGetAttrKeysSelector(exam: ReconExam): void {
    exam.writes(Selector.getAttr("test").keys(), "$@test.*:");
  }

  @Test
  writeValuesGetAttrSelector(exam: ReconExam): void {
    exam.writes(Selector.values().getAttr("test"), "$:*.@test");
  }

  @Test
  writeGetAttrValuesSelector(exam: ReconExam): void {
    exam.writes(Selector.getAttr("test").values(), "$@test.:*");
  }

  @Test
  writeChildrenGetAttrSelector(exam: ReconExam): void {
    exam.writes(Selector.children().getAttr("test"), "$*.@test");
  }

  @Test
  writeGetAttrChildrenSelector(exam: ReconExam): void {
    exam.writes(Selector.getAttr("test").children(), "$@test.*");
  }

  @Test
  writeDescendantsGetAttrSelector(exam: ReconExam): void {
    exam.writes(Selector.descendants().getAttr("test"), "$**.@test");
  }

  @Test
  writeGetAttrDescendantsSelector(exam: ReconExam): void {
    exam.writes(Selector.getAttr("test").descendants(), "$@test.**");
  }

  @Test
  writeKeysGetItemSelector(exam: ReconExam): void {
    exam.writes(Selector.keys().getItem(0), "$*:#0");
  }

  @Test
  writeGetItemKeysSelector(exam: ReconExam): void {
    exam.writes(Selector.getItem(0).keys(), "$#0.*:");
  }

  @Test
  writeValuesGetItemSelector(exam: ReconExam): void {
    exam.writes(Selector.values().getItem(0), "$:*#0");
  }

  @Test
  writeGetItemValuesSelector(exam: ReconExam): void {
    exam.writes(Selector.getItem(0).values(), "$#0.:*");
  }

  @Test
  writeChildrenGetItemSelector(exam: ReconExam): void {
    exam.writes(Selector.children().getItem(0), "$*#0");
  }

  @Test
  writeGetItemChildrenSelector(exam: ReconExam): void {
    exam.writes(Selector.getItem(0).children(), "$#0.*");
  }

  @Test
  writeDescendantsGetItemSelector(exam: ReconExam): void {
    exam.writes(Selector.descendants().getItem(0), "$**#0");
  }

  @Test
  writeGetItemDescendantsSelector(exam: ReconExam): void {
    exam.writes(Selector.getItem(0).descendants(), "$#0.**");
  }

  @Test
  writeFilter(exam: ReconExam): void {
    exam.writes(Selector.get("a").filter(), "$[$a]");
    exam.writes(Selector.get(Num.from(1)).filter(), "$[$1]");
    exam.writes(Selector.getItem(1).filter(), "$[$#1]");
    exam.writes(Selector.getAttr("test").filter(), "$[$@test]");
  }

  @Test
  writeGetFilter(exam: ReconExam): void {
    exam.writes(Selector.get("a").filter(Selector.get("b")), "$a[$b]");
  }

  @Test
  writeGetFilterGetSelector(exam: ReconExam): void {
    exam.writes(Selector.get("a").filter(Selector.get("b")).get("c"), "$a[$b].c");
  }

  @Test
  writeGetAttrFilter(exam: ReconExam): void {
    exam.writes(Selector.getAttr("foo").filter(Selector.get("b")), "$@foo[$b]");
  }

  @Test
  writeGetAttrFilterGetAttrSelector(exam: ReconExam): void {
    exam.writes(Selector.getAttr("foo").filter(Selector.get("b")).getAttr("bar"), "$@foo[$b].@bar");
  }

  @Test
  writeGetItemFilter(exam: ReconExam): void {
    exam.writes(Selector.getItem(0).filter(Selector.get("b")), "$#0[$b]");
  }

  @Test
  writeGetItemFilterGetItemSelector(exam: ReconExam): void {
    exam.writes(Selector.getItem(0).filter(Selector.get("b")).getItem(1), "$#0[$b]#1");
  }

  @Test
  writeKeysFilter(exam: ReconExam): void {
    exam.writes(Selector.keys().filter(Selector.get("a")), "$*:[$a]");
  }

  @Test
  writeValuesFilter(exam: ReconExam): void {
    exam.writes(Selector.values().filter(Selector.get("a")), "$:*[$a]");
  }

  @Test
  writeChildrenFilter(exam: ReconExam): void {
    exam.writes(Selector.children().filter(Selector.get("a")), "$*[$a]");
  }

  @Test
  writeDescendantsFilter(exam: ReconExam): void {
    exam.writes(Selector.descendants().filter(Selector.get("a")), "$**[$a]");
  }

  @Test
  writeRecordsWithSelectors(exam: ReconExam): void {
    exam.writes(Record.of(Slot.of("a", Selector.get("foo")), Slot.of("b", Selector.get("bar"))), "{a:$foo,b:$bar}");
  }
}
