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

import {Spec, Test, Exam} from "@swim/unit";
import {CurveR2, SplineR2} from "@swim/math";

export class SplineR2BuilderSpec extends Spec {
  @Test
  buildLinearSplines(exam: Exam): void {
    const builder = SplineR2.builder();
    builder.moveTo(0, 1);
    builder.lineTo(1, 0);
    const spline = builder.bind();
    exam.equal(spline, SplineR2.open(CurveR2.linear(0, 1, 1, 0)));
  }

  @Test
  buildQuadraticSplines(exam: Exam): void {
    const builder = SplineR2.builder();
    builder.moveTo(0, 1);
    builder.quadraticCurveTo(0, 0, 1, 0);
    const spline = builder.bind();
    exam.equal(spline, SplineR2.open(CurveR2.quadratic(0, 1, 0, 0, 1, 0)));
  }

  @Test
  buildCubicSplines(exam: Exam): void {
    const builder = SplineR2.builder();
    builder.moveTo(-1, 0);
    builder.bezierCurveTo(-0.5, 1, 0.5, 1, 1, 0);
    const spline = builder.bind();
    exam.equal(spline, SplineR2.open(CurveR2.cubic(-1, 0, -0.5, 1, 0.5, 1, 1, 0)));
  }
}
