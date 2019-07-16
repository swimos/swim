// Copyright 2015-2019 SWIM.AI inc.
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
import {Attr, Value, Record, Text, Num, Selector} from "@swim/structure";
import {ReconExam} from "./ReconExam";

export class ReconFuncParserSpec extends Spec {
  createExam(report: Report, name: string, options: TestOptions): ReconExam {
    return new ReconExam(report, this, name, options);
  }

  @Test
  parseFreeLambdaFunc(exam: ReconExam): void {
    exam.parses("() => 0", Value.extant().lambda(Num.from(0)));
  }

  @Test
  parseValueBindingConstantLambdaFunc(exam: ReconExam): void {
    exam.parses("x => 0", Text.from("x").lambda(Num.from(0)));
  }

  @Test
  parseValueBindingSelectorLambdaFunc(exam: ReconExam): void {
    exam.parses("x => $x", Text.from("x").lambda(Selector.get("x")));
  }

  @Test
  parseValueBindingBlockLambdaFunc(exam: ReconExam): void {
    exam.parses("x => {$x + $x}", Text.from("x").lambda(Record.of(Selector.get("x").plus(Selector.get("x")))));
  }

  @Test
  parseParamBindingConstantLambdaFunc(exam: ReconExam): void {
    exam.parses("(x) => 0", Text.from("x").lambda(Num.from(0)));
  }

  @Test
  parseParamBindingSelectorLambdaFunc(exam: ReconExam): void {
    exam.parses("(x) => $x", Text.from("x").lambda(Selector.get("x")));
  }

  @Test
  parseParamBindingBlockLambdaFunc(exam: ReconExam): void {
    exam.parses("(x) => {$x + $x}", Text.from("x").lambda(Record.of(Selector.get("x").plus(Selector.get("x")))));
  }

  @Test
  parseParamsBindingConstantLambdaFunc(exam: ReconExam): void {
    exam.parses("(x, y) => 0", Record.of("x", "y").lambda(Num.from(0)));
  }

  @Test
  parseParamsBindingSelectorLambdaFunc(exam: ReconExam): void {
    exam.parses("(x, y) => $x + $y", Record.of("x", "y").lambda(Selector.get("x").plus(Selector.get("y"))));
  }

  @Test
  parseParamsBindingRecordLambdaFunc(exam: ReconExam): void {
    exam.parses("(x, y) => {$x + $y}", Record.of("x", "y").lambda(Record.of(Selector.get("x").plus(Selector.get("y")))));
  }

  @Test
  parsePrefixAttributedValueBindingSelectorLambdaFunc(exam: ReconExam): void {
    exam.parses("@pure x => $x", Record.of(Attr.of("pure"), "x").lambda(Selector.get("x")));
  }

  @Test
  parsePrefixAttributedParamBindingSelectorLambdaFunc(exam: ReconExam): void {
    exam.parses("@pure (x) => $x", Record.of(Attr.of("pure"), "x").lambda(Selector.get("x")));
  }

  @Test
  parsePrefixAttributedParamsBindingSelectorLambdaFunc(exam: ReconExam): void {
    exam.parses("@pure (x, y) => $x + $y", Record.of(Attr.of("pure"), "x", "y").lambda(Selector.get("x").plus(Selector.get("y"))));
  }

  @Test
  parsePostfixAttributedValueBindingSelectorLambdaFunc(exam: ReconExam): void {
    exam.parses("x @pure => $x", Record.of("x", Attr.of("pure")).lambda(Selector.get("x")));
  }
}
