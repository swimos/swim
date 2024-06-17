// Copyright 2015-2024 Nstream, inc.
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

import type {Exam} from "@swim/unit";
import {Test} from "@swim/unit";
import {Suite} from "@swim/unit";
import {Length} from "@swim/math";
import {Angle} from "@swim/math";
import {Transform} from "@swim/math";
import {AffineTransform} from "@swim/math";
import {DateTime} from "@swim/time";
import {Font} from "@swim/style";
import {Color} from "@swim/style";
import {LinearGradient} from "@swim/style";
import {StyleValue} from "@swim/style";

export class StyleValueSpec extends Suite {
  @Test
  parseDates(exam: Exam): void {
    exam.equal(StyleValue.parse("2020-01-01T00:00:00.000Z"), DateTime.fromLike({year: 2020}));
  }

  @Test
  parseAngles(exam: Exam): void {
    exam.equal(StyleValue.parse("45deg"), Angle.deg(45));
  }

  @Test
  parseLengths(exam: Exam): void {
    exam.equal(StyleValue.parse("32px"), Length.px(32));
  }

  @Test
  parseColors(exam: Exam): void {
    exam.equal(StyleValue.parse("transparent"), Color.transparent());
    exam.equal(StyleValue.parse("black"), Color.black());
    exam.equal(StyleValue.parse("white"), Color.white());
    exam.equal(StyleValue.parse("#000"), Color.black());
    exam.equal(StyleValue.parse("#fff"), Color.white());
    exam.equal(StyleValue.parse("#000000"), Color.black());
    exam.equal(StyleValue.parse("#ffffff"), Color.white());
    exam.equal(StyleValue.parse("#00000000"), Color.transparent());
    exam.equal(StyleValue.parse("#000000ff"), Color.black());
    exam.equal(StyleValue.parse("#ffffffff"), Color.white());
    exam.equal(StyleValue.parse("rgb(0,0,0)"), Color.black());
    exam.equal(StyleValue.parse("rgba(0 0 0/0)"), Color.transparent());
    exam.equal(StyleValue.parse("hsl(270,60%,70%)"), Color.hsl(270, 0.6, 0.7));
    exam.equal(StyleValue.parse("hsla(270 60% 50%/.15)"), Color.hsl(270, 0.6, 0.5, 0.15));
  }

  @Test
  parseFonts(exam: Exam): void {
    exam.equal(StyleValue.parse("normal sans-serif"), Font.family("sans-serif").withStyle("normal"));
    exam.equal(StyleValue.parse("italic sans-serif"), Font.family("sans-serif").withStyle("italic"));
    exam.equal(StyleValue.parse("oblique sans-serif"), Font.family("sans-serif").withStyle("oblique"));

    exam.equal(StyleValue.parse("small-caps sans-serif"), Font.family("sans-serif").withVariant("small-caps"));

    exam.equal(StyleValue.parse("bold sans-serif"), Font.family("sans-serif").withWeight("bold"));
    exam.equal(StyleValue.parse("bolder sans-serif"), Font.family("sans-serif").withWeight("bolder"));
    exam.equal(StyleValue.parse("lighter sans-serif"), Font.family("sans-serif").withWeight("lighter"));
    exam.equal(StyleValue.parse("100 sans-serif"), Font.family("sans-serif").withWeight("100"));
    exam.equal(StyleValue.parse("200 sans-serif"), Font.family("sans-serif").withWeight("200"));
    exam.equal(StyleValue.parse("300 sans-serif"), Font.family("sans-serif").withWeight("300"));
    exam.equal(StyleValue.parse("400 sans-serif"), Font.family("sans-serif").withWeight("400"));
    exam.equal(StyleValue.parse("500 sans-serif"), Font.family("sans-serif").withWeight("500"));
    exam.equal(StyleValue.parse("600 sans-serif"), Font.family("sans-serif").withWeight("600"));
    exam.equal(StyleValue.parse("700 sans-serif"), Font.family("sans-serif").withWeight("700"));
    exam.equal(StyleValue.parse("800 sans-serif"), Font.family("sans-serif").withWeight("800"));
    exam.equal(StyleValue.parse("900 sans-serif"), Font.family("sans-serif").withWeight("900"));

    exam.equal(StyleValue.parse("ultra-condensed sans-serif"), Font.family("sans-serif").withStretch("ultra-condensed"));
    exam.equal(StyleValue.parse("extra-condensed sans-serif"), Font.family("sans-serif").withStretch("extra-condensed"));
    exam.equal(StyleValue.parse("semi-condensed sans-serif"), Font.family("sans-serif").withStretch("semi-condensed"));
    exam.equal(StyleValue.parse("condensed sans-serif"), Font.family("sans-serif").withStretch("condensed"));
    exam.equal(StyleValue.parse("expanded sans-serif"), Font.family("sans-serif").withStretch("expanded"));
    exam.equal(StyleValue.parse("semi-expanded sans-serif"), Font.family("sans-serif").withStretch("semi-expanded"));
    exam.equal(StyleValue.parse("extra-expanded sans-serif"), Font.family("sans-serif").withStretch("extra-expanded"));
    exam.equal(StyleValue.parse("ultra-expanded sans-serif"), Font.family("sans-serif").withStretch("ultra-expanded"));

    exam.equal(StyleValue.parse("12px sans-serif"), Font.family("sans-serif").withSize(Length.px(12)));

    exam.equal(StyleValue.parse("12px/16px sans-serif"), Font.family("sans-serif").withSize(Length.px(12)).withHeight(Length.px(16)));
    exam.equal(StyleValue.parse("12px/normal sans-serif"), Font.family("sans-serif").withSize(Length.px(12)).withHeight("normal"));

    exam.equal(StyleValue.parse("normal normal normal normal 12px/normal \"Open Sans\", sans-serif"),
               Font.family(["Open Sans", "sans-serif"]).withStyle("normal").withVariant("normal")
                   .withWeight("normal").withStretch("normal").withSize(Length.px(12)).withHeight("normal"));
    exam.equal(StyleValue.parse("italic small-caps bold expanded 12px/16px \"Open Sans\", sans-serif"),
               Font.family(["Open Sans", "sans-serif"]).withStyle("italic").withVariant("small-caps")
                   .withWeight("bold").withStretch("expanded").withSize(Length.px(12)).withHeight(Length.px(16)));
  }

  @Test
  parseLinearGradients(exam: Exam): void {
    exam.equal(StyleValue.parse("linear-gradient(0, #000000, #ffffff)"),
               LinearGradient.create(0, "#000000", "#ffffff"));
    exam.equal(StyleValue.parse("linear-gradient(to right, #000000 33%, #ffffff 67%)"),
               LinearGradient.create("right", "#000000 33%", "#ffffff 67%"));
    exam.equal(StyleValue.parse("linear-gradient(to bottom left, #000000 33%, 50%, #ffffff 67%)"),
               LinearGradient.create(["bottom", "left"], "#000000 33%", "50%, #ffffff 67%"));
  }

  @Test
  parseTransforms(exam: Exam): void {
    exam.equal(StyleValue.parse("none"), Transform.identity());
    exam.equal(StyleValue.parse("translateX(2)"), Transform.translateX(2));
    exam.equal(StyleValue.parse("translateY(3)"), Transform.translateY(3));
    exam.equal(StyleValue.parse("translate(5,7)"), Transform.translate(5, 7));
    exam.equal(StyleValue.parse("translate3d(5,7,0)"), Transform.translate(5, 7));
    exam.equal(StyleValue.parse("scaleX(2)"), Transform.scaleX(2));
    exam.equal(StyleValue.parse("scaleY(3)"), Transform.scaleY(3));
    exam.equal(StyleValue.parse("scale(5,7)"), Transform.scale(5, 7));
    exam.equal(StyleValue.parse("rotate(45)"), Transform.rotate(45));
    exam.equal(StyleValue.parse("skewX(30)"), Transform.skewX(30));
    exam.equal(StyleValue.parse("skewY(60)"), Transform.skewY(60));
    exam.equal(StyleValue.parse("skew(30,60)"), Transform.skew(30, 60));
    exam.equal(StyleValue.parse("matrix(1,0,0,1,0,0)"), AffineTransform.identity());
  }
}
