// Copyright 2015-2020 SWIM.AI inc.
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
import {Color} from "@swim/color";

export class ColorParserSpec extends Spec {
  @Test
  parseNamedColors(exam: Exam): void {
    exam.equal(Color.parse("transparent"), Color.transparent());
    exam.equal(Color.parse("black"), Color.black());
    exam.equal(Color.parse("white"), Color.white());
  }

  @Test
  parseHex3Colors(exam: Exam): void {
    exam.equal(Color.parse("#000"), Color.black());
    exam.equal(Color.parse("#fff"), Color.white());
  }

  @Test
  parseHex6Colors(exam: Exam): void {
    exam.equal(Color.parse("#000000"), Color.black());
    exam.equal(Color.parse("#ffffff"), Color.white());
  }

  @Test
  parseHex8Colors(exam: Exam): void {
    exam.equal(Color.parse("#00000000"), Color.transparent());
    exam.equal(Color.parse("#000000ff"), Color.black());
    exam.equal(Color.parse("#ffffffff"), Color.white());
  }

  @Test
  parseRgbColors(exam: Exam): void {
    exam.equal(Color.parse("rgb(0,0,0)"), Color.black());
    exam.equal(Color.parse("rgb(0 0 0)"), Color.black());
    exam.equal(Color.parse("rgb  (  0  ,  0  ,  0  )"), Color.black());

    exam.equal(Color.parse("rgb(255,255,255)"), Color.white());
    exam.equal(Color.parse("rgb(255 255 255)"), Color.white());
    exam.equal(Color.parse("rgb  (  255  ,  255  ,  255  )"), Color.white());

    exam.equal(Color.parse("rgb(0%,0%,0%)"), Color.black());
    exam.equal(Color.parse("rgb(0% 0% 0%)"), Color.black());
    exam.equal(Color.parse("rgb  (  0%  ,  0%  ,  0%  )"), Color.black());

    exam.equal(Color.parse("rgb(100%,100%,100%)"), Color.white());
    exam.equal(Color.parse("rgb(100% 100% 100%)"), Color.white());
    exam.equal(Color.parse("rgb  (  100%  ,  100%  ,  100%  )"), Color.white());
  }

  @Test
  parseRgbaColors(exam: Exam): void {
    exam.equal(Color.parse("rgba(0,0,0,0)"), Color.transparent());
    exam.equal(Color.parse("rgba(0 0 0/0)"), Color.transparent());
    exam.equal(Color.parse("rgba  (  0  ,  0  ,  0  ,  0  )"), Color.transparent());
    exam.equal(Color.parse("rgba  (  0  0  0  /  0  )"), Color.transparent());

    exam.equal(Color.parse("rgba(0,0,0,1)"), Color.black());
    exam.equal(Color.parse("rgba(0 0 0/1)"), Color.black());
    exam.equal(Color.parse("rgba  (  0  ,  0  ,  0  ,  1  )"), Color.black());
    exam.equal(Color.parse("rgba  (  0  0  0  /  1  )"), Color.black());

    exam.equal(Color.parse("rgba(255,255,255,1)"), Color.white());
    exam.equal(Color.parse("rgba(255 255 255/1)"), Color.white());
    exam.equal(Color.parse("rgba  (  255  ,  255  ,  255  ,  1  )"), Color.white());
    exam.equal(Color.parse("rgba  (  255  255  255  /  1  )"), Color.white());

    exam.equal(Color.parse("rgba(0%,0%,0%,0%)"), Color.transparent());
    exam.equal(Color.parse("rgba(0% 0% 0%/0%)"), Color.transparent());
    exam.equal(Color.parse("rgba  (  0%  ,  0%  ,  0%  ,  0%  )"), Color.transparent());
    exam.equal(Color.parse("rgba  (  0%  0%  0%  /  0%  )"), Color.transparent());

    exam.equal(Color.parse("rgba(0%,0%,0%,100%)"), Color.black());
    exam.equal(Color.parse("rgba(0% 0% 0%/100%)"), Color.black());
    exam.equal(Color.parse("rgba  (  0%  ,  0%  ,  0%  ,  100%  )"), Color.black());
    exam.equal(Color.parse("rgba  (  0%  0%  0%  /  100%  )"), Color.black());

    exam.equal(Color.parse("rgba(100%,100%,100%,100%)"), Color.white());
    exam.equal(Color.parse("rgba(100% 100% 100%/100%)"), Color.white());
    exam.equal(Color.parse("rgba  (  100%  ,  100%  ,  100%  ,  100%  )"), Color.white());
    exam.equal(Color.parse("rgba  (  100%  100%  100%  /  100%  )"), Color.white());
  }

  @Test
  parseHslColors(exam: Exam): void {
    exam.equal(Color.parse("hsl(270,60%,70%)"), Color.hsl(270, 0.6, 0.7));
    exam.equal(Color.parse("hsl(270 60% 70%)"), Color.hsl(270, 0.6, 0.7));
    exam.equal(Color.parse("hsl  (  270  ,  60%  ,  70%  )"), Color.hsl(270, 0.6, 0.7));

    exam.equal(Color.parse("hsl(.75turn,60%,70%)"), Color.hsl(270, 0.6, 0.7));
    exam.equal(Color.parse("hsl(.75turn 60% 70%)"), Color.hsl(270, 0.6, 0.7));
    exam.equal(Color.parse("hsl  (  .75turn  ,  60%  ,  70%  )"), Color.hsl(270, 0.6, 0.7));
  }

  @Test
  parseHslaColors(exam: Exam): void {
    exam.equal(Color.parse("hsla(270,60%,50%,.15)"), Color.hsl(270, 0.6, 0.5, 0.15));
    exam.equal(Color.parse("hsla(270 60% 50%/.15)"), Color.hsl(270, 0.6, 0.5, 0.15));
    exam.equal(Color.parse("hsla  (  270  ,  60%  ,  50%  ,  .15  )"), Color.hsl(270, 0.6, 0.5, 0.15));
    exam.equal(Color.parse("hsla  (  270  60%  50%  /  .15  )"), Color.hsl(270, 0.6, 0.5, 0.15));

    exam.equal(Color.parse("hsla(270,60%,50%,15%)"), Color.hsl(270, 0.6, 0.5, 0.15));
    exam.equal(Color.parse("hsla(270 60% 50%/15%)"), Color.hsl(270, 0.6, 0.5, 0.15));
    exam.equal(Color.parse("hsla  (  270  ,  60%  ,  50%  ,  15%  )"), Color.hsl(270, 0.6, 0.5, 0.15));
    exam.equal(Color.parse("hsla  (  270  60%  50%  /  15%  )"), Color.hsl(270, 0.6, 0.5, 0.15));
  }
}
