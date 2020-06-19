// Copyright 2015-2020 Swim inc.
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

export class ReconFuncWriterSpec extends Spec {
  createExam(report: Report, name: string, options: TestOptions): ReconExam {
    return new ReconExam(report, this, name, options);
  }

  @Test
  writeFreeLambdaFunc(exam: ReconExam): void {
    exam.writes(Value.extant().lambda(Num.from(0)), "() => 0");
  }

  @Test
  writeValueBindingConstantLambdaFunc(exam: ReconExam): void {
    exam.writes(Text.from("x").lambda(Num.from(0)), "x => 0");
  }

  @Test
  writeValueBindingSelectorLambdaFunc(exam: ReconExam): void {
    exam.writes(Text.from("x").lambda(Selector.get("x")), "x => $x");
  }

  @Test
  writeValueBindingBlockLambdaFunc(exam: ReconExam): void {
    exam.writes(Text.from("x").lambda(Record.of(Selector.get("x").plus(Selector.get("x")))), "x => {$x + $x}");
  }

  @Test
  writeParamBindingConstantLambdaFunc(exam: ReconExam): void {
    exam.writes(Record.of("x").lambda(Num.from(0)), "(x) => 0");
  }

  @Test
  writeParamBindingSelectorLambdaFunc(exam: ReconExam): void {
    exam.writes(Record.of("x").lambda(Selector.get("x")), "(x) => $x");
  }

  @Test
  writeParamBindingBlockLambdaFunc(exam: ReconExam): void {
    exam.writes(Record.of("x").lambda(Record.of(Selector.get("x").plus(Selector.get("x")))), "(x) => {$x + $x}");
  }

  @Test
  writeParamsBindingConstantLambdaFunc(exam: ReconExam): void {
    exam.writes(Record.of("x", "y").lambda(Num.from(0)), "(x,y) => 0");
  }

  @Test
  writeParamsBindingSelectorLambdaFunc(exam: ReconExam): void {
    exam.writes(Record.of("x", "y").lambda(Selector.get("x").plus(Selector.get("y"))), "(x,y) => $x + $y");
  }

  @Test
  writeParamsBindingRecordLambdaFunc(exam: ReconExam): void {
    exam.writes(Record.of("x", "y").lambda(Record.of(Selector.get("x").plus(Selector.get("y")))), "(x,y) => {$x + $y}");
  }

  @Test
  writePrefixAttributedValueBindingSelectorLambdaFunc(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("pure"), "x").lambda(Selector.get("x")), "@pure x => $x");
  }

  @Test
  writePrefixAttributedParamBindingSelectorLambdaFunc(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("pure"), Record.of("x")).lambda(Selector.get("x")), "@pure ({x}) => $x");
  }

  @Test
  writePrefixAttributedParamsBindingSelectorLambdaFunc(exam: ReconExam): void {
    exam.writes(Record.of(Attr.of("pure"), "x", "y").lambda(Selector.get("x").plus(Selector.get("y"))), "@pure (x,y) => $x + $y");
  }

  @Test
  writePostfixAttributedValueBindingSelectorLambdaFunc(exam: ReconExam): void {
    exam.writes(Record.of("x", Attr.of("pure")).lambda(Selector.get("x")), "x@pure => $x");
  }
}
