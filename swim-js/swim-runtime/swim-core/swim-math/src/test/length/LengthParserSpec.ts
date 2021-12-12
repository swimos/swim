// Copyright 2015-2021 Swim.inc
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
import {Length} from "@swim/math";

export class LengthParserSpec extends Spec {
  @Test
  parsePxLengths(exam: Exam): void {
    exam.equal(Length.parse("0px"), Length.px(0));
    exam.equal(Length.parse("1px"), Length.px(1));
    exam.equal(Length.parse("15px"), Length.px(15));
    exam.equal(Length.parse("0.5px"), Length.px(0.5));
  }

  @Test
  parseEmLengths(exam: Exam): void {
    exam.equal(Length.parse("0em"), Length.em(0));
    exam.equal(Length.parse("1em"), Length.em(1));
    exam.equal(Length.parse("15em"), Length.em(15));
    exam.equal(Length.parse("0.5em"), Length.em(0.5));
  }

  @Test
  parseRemLengths(exam: Exam): void {
    exam.equal(Length.parse("0rem"), Length.rem(0));
    exam.equal(Length.parse("1rem"), Length.rem(1));
    exam.equal(Length.parse("15rem"), Length.rem(15));
    exam.equal(Length.parse("0.5rem"), Length.rem(0.5));
  }

  @Test
  parsePctLengths(exam: Exam): void {
    exam.equal(Length.parse("0%"), Length.pct(0));
    exam.equal(Length.parse("50%"), Length.pct(50));
    exam.equal(Length.parse("100%"), Length.pct(100));
    exam.equal(Length.parse("99.9%"), Length.pct(99.9));
  }

  @Test
  parseUnitlessLengths(exam: Exam): void {
    exam.equal(Length.parse("0"), Length.unitless(0));
    exam.equal(Length.parse("1"), Length.unitless(1));
    exam.equal(Length.parse("15"), Length.unitless(15));
    exam.equal(Length.parse("0.5"), Length.unitless(0.5));
  }
}
