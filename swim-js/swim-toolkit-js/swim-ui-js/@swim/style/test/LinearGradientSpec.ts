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
import {LinearGradient} from "@swim/style";

export class LinearGradientSpec extends Spec {
  @Test
  parseLinearGradientAngles(exam: Exam): void {
    exam.equal(LinearGradient.parseAngle("0"), Angle.deg(0));
    exam.equal(LinearGradient.parseAngle("90deg"), Angle.deg(90));
  }

  @Test
  parseLinearGradientSideAngles(exam: Exam): void {
    exam.equal(LinearGradient.parseAngle("to left"), "left");
    exam.equal(LinearGradient.parseAngle("to right"), "right");
    exam.equal(LinearGradient.parseAngle("to top"), "top");
    exam.equal(LinearGradient.parseAngle("to bottom"), "bottom");
  }

  @Test
  parseLinearGradientCornerAngles(exam: Exam): void {
    exam.equal(LinearGradient.parseAngle("to top left"), ["top", "left"]);
    exam.equal(LinearGradient.parseAngle("to left top"), ["left", "top"]);
    exam.equal(LinearGradient.parseAngle("to bottom left"), ["bottom", "left"]);
    exam.equal(LinearGradient.parseAngle("to left bottom"), ["left", "bottom"]);
    exam.equal(LinearGradient.parseAngle("to top right"), ["top", "right"]);
    exam.equal(LinearGradient.parseAngle("to right top"), ["right", "top"]);
    exam.equal(LinearGradient.parseAngle("to bottom right"), ["bottom", "right"]);
    exam.equal(LinearGradient.parseAngle("to right bottom"), ["right", "bottom"]);
  }

  @Test
  failToParseInvalidLinearGradientCornerAngles(exam: Exam): void {
    exam.throws(() => {
      LinearGradient.parseAngle("left left");
    }, Error);
    exam.throws(() => {
      LinearGradient.parseAngle("right right");
    }, Error);
    exam.throws(() => {
      LinearGradient.parseAngle("top top");
    }, Error);
    exam.throws(() => {
      LinearGradient.parseAngle("bottom bottom");
    }, Error);
  }

  @Test
  parseLinearGradients(exam: Exam): void {
    exam.equal(LinearGradient.parse("linear-gradient(0, #000000, #ffffff)"),
               LinearGradient.create(0, "#000000", "#ffffff"));
    exam.equal(LinearGradient.parse("linear-gradient(to right, #000000 33%, #ffffff 67%)"),
               LinearGradient.create("right", ["#000000", 33], ["#ffffff", 67]));
    exam.equal(LinearGradient.parse("linear-gradient(to bottom left, #000000 33%, 50%, #ffffff 67%)"),
               LinearGradient.create(["bottom", "left"], "#000000 33%", "50%, #ffffff 67%"));
  }

  @Test
  writeLinearGradients(exam: Exam): void {
    exam.equal(LinearGradient.create(45, "#000000", "#ffffff").toString(),
               "linear-gradient(45deg, #000000, #ffffff)");
    exam.equal(LinearGradient.create("right", ["#000000", 33], ["#ffffff", 67]).toString(),
               "linear-gradient(to right, #000000 33%, #ffffff 67%)");
    exam.equal(LinearGradient.create(["bottom", "left"], "#000000 33%", "50%, #ffffff 67%").toString(),
               "linear-gradient(to bottom left, #000000 33%, 50%, #ffffff 67%)");
  }

  @Test
  interpolateLinearGradients(exam: Exam): void {
    exam.equal(LinearGradient.create(0, "#000000", "#888888").interpolateTo(
               LinearGradient.create(90, "#222222", "#444444"))(0.5),
               LinearGradient.create(45, "#111111", "#666666"));
    exam.equal(LinearGradient.create(0, ["#000000", 20], ["#888888", 80]).interpolateTo(
               LinearGradient.create(90, ["#222222", 40], ["#444444", 60]))(0.5),
               LinearGradient.create(45, "#111111 30%", "#666666 70%"));
    exam.equal(LinearGradient.create(0, "#000000 20%", "40%, #888888 80%").interpolateTo(
               LinearGradient.create(90, "#222222 40%", "50%, #444444 60%"))(0.5),
               LinearGradient.create(45, "#111111 30%", "45%, #666666 70%"));
  }
}
