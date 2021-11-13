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
import {Value} from "@swim/structure";
import {Recon} from "@swim/recon";
import {Processor} from "@swim/macro";

export class IfDirectiveSpec extends Spec {
  @Test
  processTruthyIfDirectives(exam: Exam): void {
    const processor = new Processor();
    const model = Recon.parse("@if($predicate) yes");
    const params = Recon.parse("predicate: true");
    const result = processor.evaluate(model, params);
    exam.equal(result, Recon.parse("yes"));
  }

  @Test
  processFalseyIfDirectives(exam: Exam): void {
    const processor = new Processor();
    const model = Recon.parse("@if($predicate) yes");
    const params = Recon.parse("predicate: false");
    const result = processor.evaluate(model, params);
    exam.equal(result, Value.absent());
  }

  @Test
  processTruthyIfElseDirectives(exam: Exam): void {
    const processor = new Processor();
    const model = Recon.parse("@if($predicate) yes @else no");
    const params = Recon.parse("predicate: true");
    const result = processor.evaluate(model, params);
    exam.equal(result, Recon.parse("yes"));
  }

  @Test
  processFalseyIfElseDirectives(exam: Exam): void {
    const processor = new Processor();
    const model = Recon.parse("@if($predicate) yes @else no");
    const params = Recon.parse("predicate: false");
    const result = processor.evaluate(model, params);
    exam.equal(result, Recon.parse("no"));
  }

  @Test
  processTruthyCompoundIfDirectives(exam: Exam): void {
    const processor = new Processor();
    const model = Recon.parse("@if($predicate) {1, 2}");
    const params = Recon.parse("predicate: true");
    const result = processor.evaluate(model, params);
    exam.equal(result, Recon.parse("1, 2"));
  }

  @Test
  processFalseyCompoundIfDirectives(exam: Exam): void {
    const processor = new Processor();
    const model = Recon.parse("@if($predicate) {1, 2}");
    const params = Recon.parse("predicate: false");
    const result = processor.evaluate(model, params);
    exam.equal(result, Value.absent());
  }

  @Test
  processTruthyCompoundIfElseDirectives(exam: Exam): void {
    const processor = new Processor();
    const model = Recon.parse("@if($predicate) {1, 2, 3} @else {4, 5, 6}");
    const params = Recon.parse("predicate: true");
    const result = processor.evaluate(model, params);
    exam.equal(result, Recon.parse("1, 2, 3"));
  }

  @Test
  processFalseyCompoundIfElseDirectives(exam: Exam): void {
    const processor = new Processor();
    const model = Recon.parse("@if($predicate) {1, 2, 3} @else {4, 5, 6}");
    const params = Recon.parse("predicate: false");
    const result = processor.evaluate(model, params);
    exam.equal(result, Recon.parse("4, 5, 6"));
  }

  @Test
  processTruthyElseIfDirectives(exam: Exam): void {
    const processor = new Processor();
    const model = Recon.parse("@if($x) a @else @if($y) b @else c");
    const params = Recon.parse("x: false, y: true");
    const result = processor.evaluate(model, params);
    exam.equal(result, Recon.parse("b"));
  }

  @Test
  processFalseyElseIfDirectives(exam: Exam): void {
    const processor = new Processor();
    const model = Recon.parse("@if($x) a @else @if($y) b @else c");
    const params = Recon.parse("x: false, y: false");
    const result = processor.evaluate(model, params);
    exam.equal(result, Recon.parse("c"));
  }
}
