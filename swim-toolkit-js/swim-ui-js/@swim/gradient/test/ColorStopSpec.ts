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
import {Interpolator} from "@swim/interpolate";
import {ColorStop} from "@swim/gradient";

export class ColorStopSpec extends Spec {
  @Test
  parseColorStops(exam: Exam): void {
    exam.equal(ColorStop.parse("#ffffff"),
               ColorStop.create("#ffffff"));
    exam.equal(ColorStop.parse("#ffffff 75%"),
               ColorStop.create("#ffffff", 75));
    exam.equal(ColorStop.parse("25% #ffffff"),
               ColorStop.create("#ffffff", 25));
  }

  @Test
  parseColorStopHints(exam: Exam): void {
    exam.equal(ColorStop.parseHint("50%, #ffffff"),
               ColorStop.create("#ffffff", null, 50));
    exam.equal(ColorStop.parseHint("25%, #ffffff 75%"),
               ColorStop.create("#ffffff", 75, 25));
    exam.equal(ColorStop.parseHint("40%, 60% #ffffff"),
               ColorStop.create("#ffffff", 60, 40));
  }

  @Test
  failToParseInvalidColorStops(exam: Exam): void {
    exam.throws(() => {
      ColorStop.parse("25% #ffffff 75%");
    }, Error);
    exam.throws(() => {
      ColorStop.parse("50%, #ffffff");
    }, Error);
    exam.throws(() => {
      ColorStop.parse("50%, 25% #ffffff 75%");
    }, Error);
  }

  @Test
  failToParseInvalidColorStopHints(exam: Exam): void {
    exam.throws(() => {
      ColorStop.parseHint("50%, 25% #ffffff 75%");
    }, Error);
    exam.throws(() => {
      ColorStop.parseHint("50% 25% #ffffff");
    }, Error);
  }

  @Test
  writeColorStops(exam: Exam): void {
    exam.equal(ColorStop.create("#ffffff").toString(), "#ffffff");
    exam.equal(ColorStop.create("#ffffff", 75).toString(), "#ffffff 75%");
  }

  @Test
  writeColorStopHints(exam: Exam): void {
    exam.equal(ColorStop.create("#ffffff", null, 50).toString(), "50%, #ffffff");
    exam.equal(ColorStop.create("#ffffff", 75, 25).toString(), "25%, #ffffff 75%");
  }

  @Test
  parseColorStopLists(exam: Exam): void {
    exam.equal(ColorStop.parseList("#ffffff"),
               [ColorStop.create("#ffffff")]);
    exam.equal(ColorStop.parseList("#000000, #ffffff"),
               [ColorStop.create("#000000"), ColorStop.create("#ffffff")]);
    exam.equal(ColorStop.parseList("#000000 33%, #ffffff 67%"),
               [ColorStop.create("#000000", 33), ColorStop.create("#ffffff", 67)]);
    exam.equal(ColorStop.parseList("33% #000000, 67% #ffffff"),
               [ColorStop.create("#000000", 33), ColorStop.create("#ffffff", 67)]);
  }

  @Test
  parseColorStopListsWithHints(exam: Exam): void {
    exam.equal(ColorStop.parseList("#ffffff"),
               [ColorStop.create("#ffffff")]);
    exam.equal(ColorStop.parseList("#000000, 50%, #ffffff"),
               [ColorStop.create("#000000"), ColorStop.create("#ffffff", null, 50)]);
    exam.equal(ColorStop.parseList("#000000 25%, 50%, #ffffff 75%"),
               [ColorStop.create("#000000", 25), ColorStop.create("#ffffff", 75, 50)]);
    exam.equal(ColorStop.parseList("25% #000000, 50%, 75% #ffffff"),
               [ColorStop.create("#000000", 25), ColorStop.create("#ffffff", 75, 50)]);
  }

  @Test
  failToParseInvalidColorStopLists(exam: Exam): void {
    exam.throws(() => {
      ColorStop.parseList("25%, #ffffff");
    }, Error);
  }

  @Test
  interpolateColorStops(exam: Exam): void {
    exam.equal(Interpolator.between(ColorStop.create("#000000"),
                                    ColorStop.create("#888888"))
                           .interpolate(0.5),
               ColorStop.create("#444444"));
    exam.equal(Interpolator.between(ColorStop.create("#000000", 25),
                                    ColorStop.create("#888888", 75))
                           .interpolate(0.5),
               ColorStop.create("#444444", 50));
    exam.equal(Interpolator.between(ColorStop.create("#000000", 25, 10),
                                    ColorStop.create("#888888", 75, 30))
                           .interpolate(0.5),
               ColorStop.create("#444444", 50, 20));
  }
}
