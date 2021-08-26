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
import {Angle} from "@swim/math";

export class AngleParserSpec extends Spec {
  @Test
  parseDegAngles(exam: Exam): void {
    exam.equal(Angle.parse("0deg"), Angle.deg(0));
    exam.equal(Angle.parse("1deg"), Angle.deg(1));
    exam.equal(Angle.parse("360deg"), Angle.deg(360));
    exam.equal(Angle.parse("0.5deg"), Angle.deg(0.5));
  }

  @Test
  parseRadAngles(exam: Exam): void {
    exam.equal(Angle.parse("0rad"), Angle.rad(0));
    exam.equal(Angle.parse("1rad"), Angle.rad(1));
    exam.equal(Angle.parse("3.14rad"), Angle.rad(3.14));
    exam.equal(Angle.parse("6.28rad"), Angle.rad(6.28));
  }

  @Test
  parseGradAngles(exam: Exam): void {
    exam.equal(Angle.parse("0grad"), Angle.grad(0));
    exam.equal(Angle.parse("1grad"), Angle.grad(1));
    exam.equal(Angle.parse("400grad"), Angle.grad(400));
    exam.equal(Angle.parse("0.5grad"), Angle.grad(0.5));
  }

  @Test
  parseTurnAngles(exam: Exam): void {
    exam.equal(Angle.parse("0turn"), Angle.turn(0));
    exam.equal(Angle.parse("1turn"), Angle.turn(1));
    exam.equal(Angle.parse("0.5turn"), Angle.turn(0.5));
  }
}
