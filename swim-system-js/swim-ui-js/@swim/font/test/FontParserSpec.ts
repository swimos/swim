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

import {Spec, Test, Exam} from "@swim/unit";
import {Length} from "@swim/length";
import {Font} from "@swim/font";

export class FontParserSpec extends Spec {
  @Test
  parseSingleFontFamilies(exam: Exam): void {
    exam.equal(Font.parse("serif"), Font.family("serif"));
    exam.equal(Font.parse("  serif  "), Font.family("serif"));

    exam.equal(Font.parse("sans-serif"), Font.family("sans-serif"));
    exam.equal(Font.parse("  sans-serif  "), Font.family("sans-serif"));
  }

  @Test
  parseMultipleFontFamilies(exam: Exam): void {
    exam.equal(Font.parse("Menlo,monospace"), Font.family(["Menlo", "monospace"]));
    exam.equal(Font.parse("  Menlo  ,  monospace  "), Font.family(["Menlo", "monospace"]));
  }

  @Test
  parseSingleQuotedFontFamilies(exam: Exam): void {
    exam.equal(Font.parse("\"Open Sans\""), Font.family("Open Sans"));
    exam.equal(Font.parse("  \"Open Sans\"  "), Font.family("Open Sans"));

    exam.equal(Font.parse("'Open Sans'"), Font.family("Open Sans"));
    exam.equal(Font.parse("  'Open Sans'  "), Font.family("Open Sans"));
  }

  @Test
  parseMultipleQuotedFontFamilies(exam: Exam): void {
    exam.equal(Font.parse("\"Orbitron\",\"Open Sans\""), Font.family(["Orbitron", "Open Sans"]));
    exam.equal(Font.parse("  \"Orbitron\"  ,  \"Open Sans\"  "), Font.family(["Orbitron", "Open Sans"]));

    exam.equal(Font.parse("'Orbitron','Open Sans'"), Font.family(["Orbitron", "Open Sans"]));
    exam.equal(Font.parse("  'Orbitron'  ,  'Open Sans'  "), Font.family(["Orbitron", "Open Sans"]));
  }

  @Test
  parseFontStyles(exam: Exam): void {
    exam.equal(Font.parse("normal sans-serif"), Font.family("sans-serif").style("normal"));
    exam.equal(Font.parse("  normal  sans-serif  "), Font.family("sans-serif").style("normal"));

    exam.equal(Font.parse("italic sans-serif"), Font.family("sans-serif").style("italic"));
    exam.equal(Font.parse("  italic  sans-serif  "), Font.family("sans-serif").style("italic"));

    exam.equal(Font.parse("oblique sans-serif"), Font.family("sans-serif").style("oblique"));
    exam.equal(Font.parse("  oblique  sans-serif  "), Font.family("sans-serif").style("oblique"));
  }

  @Test
  parseFontVariants(exam: Exam): void {
    exam.equal(Font.parse("small-caps sans-serif"), Font.family("sans-serif").variant("small-caps"));
    exam.equal(Font.parse("  small-caps  sans-serif  "), Font.family("sans-serif").variant("small-caps"));
  }

  @Test
  parseFontWeights(exam: Exam): void {
    exam.equal(Font.parse("bold sans-serif"), Font.family("sans-serif").weight("bold"));
    exam.equal(Font.parse("  bold  sans-serif  "), Font.family("sans-serif").weight("bold"));

    exam.equal(Font.parse("bolder sans-serif"), Font.family("sans-serif").weight("bolder"));
    exam.equal(Font.parse("  bolder  sans-serif  "), Font.family("sans-serif").weight("bolder"));

    exam.equal(Font.parse("lighter sans-serif"), Font.family("sans-serif").weight("lighter"));
    exam.equal(Font.parse("  lighter  sans-serif  "), Font.family("sans-serif").weight("lighter"));

    exam.equal(Font.parse("100 sans-serif"), Font.family("sans-serif").weight("100"));
    exam.equal(Font.parse("200 sans-serif"), Font.family("sans-serif").weight("200"));
    exam.equal(Font.parse("300 sans-serif"), Font.family("sans-serif").weight("300"));
    exam.equal(Font.parse("400 sans-serif"), Font.family("sans-serif").weight("400"));
    exam.equal(Font.parse("500 sans-serif"), Font.family("sans-serif").weight("500"));
    exam.equal(Font.parse("600 sans-serif"), Font.family("sans-serif").weight("600"));
    exam.equal(Font.parse("700 sans-serif"), Font.family("sans-serif").weight("700"));
    exam.equal(Font.parse("800 sans-serif"), Font.family("sans-serif").weight("800"));
    exam.equal(Font.parse("900 sans-serif"), Font.family("sans-serif").weight("900"));
  }

  @Test
  parseFontStretches(exam: Exam): void {
    exam.equal(Font.parse("ultra-condensed sans-serif"), Font.family("sans-serif").stretch("ultra-condensed"));
    exam.equal(Font.parse("  ultra-condensed  sans-serif  "), Font.family("sans-serif").stretch("ultra-condensed"));

    exam.equal(Font.parse("extra-condensed sans-serif"), Font.family("sans-serif").stretch("extra-condensed"));
    exam.equal(Font.parse("  extra-condensed  sans-serif  "), Font.family("sans-serif").stretch("extra-condensed"));

    exam.equal(Font.parse("semi-condensed sans-serif"), Font.family("sans-serif").stretch("semi-condensed"));
    exam.equal(Font.parse("  semi-condensed  sans-serif  "), Font.family("sans-serif").stretch("semi-condensed"));

    exam.equal(Font.parse("condensed sans-serif"), Font.family("sans-serif").stretch("condensed"));
    exam.equal(Font.parse("  condensed  sans-serif  "), Font.family("sans-serif").stretch("condensed"));

    exam.equal(Font.parse("expanded sans-serif"), Font.family("sans-serif").stretch("expanded"));
    exam.equal(Font.parse("  expanded  sans-serif  "), Font.family("sans-serif").stretch("expanded"));

    exam.equal(Font.parse("semi-expanded sans-serif"), Font.family("sans-serif").stretch("semi-expanded"));
    exam.equal(Font.parse("  semi-expanded  sans-serif  "), Font.family("sans-serif").stretch("semi-expanded"));

    exam.equal(Font.parse("extra-expanded sans-serif"), Font.family("sans-serif").stretch("extra-expanded"));
    exam.equal(Font.parse("  extra-expanded  sans-serif  "), Font.family("sans-serif").stretch("extra-expanded"));

    exam.equal(Font.parse("ultra-expanded sans-serif"), Font.family("sans-serif").stretch("ultra-expanded"));
    exam.equal(Font.parse("  ultra-expanded  sans-serif  "), Font.family("sans-serif").stretch("ultra-expanded"));
  }

  @Test
  parseFontSizes(exam: Exam): void {
    exam.equal(Font.parse("12px sans-serif"), Font.family("sans-serif").size(Length.px(12)));
    exam.equal(Font.parse("  12px  sans-serif  "), Font.family("sans-serif").size(Length.px(12)));
  }

  @Test
  parseLineHeights(exam: Exam): void {
    exam.equal(Font.parse("12px/16px sans-serif"), Font.family("sans-serif").size(Length.px(12)).height(Length.px(16)));
    exam.equal(Font.parse("  12px  /  16px  sans-serif  "), Font.family("sans-serif").size(Length.px(12)).height(Length.px(16)));

    exam.equal(Font.parse("12px/normal sans-serif"), Font.family("sans-serif").size(Length.px(12)).height("normal"));
    exam.equal(Font.parse("  12px  /  normal  sans-serif  "), Font.family("sans-serif").size(Length.px(12)).height("normal"));
  }

  @Test
  parseFonts(exam: Exam): void {
    exam.equal(Font.parse("normal normal normal normal 12px/normal \"Open Sans\", sans-serif"),
               Font.family(["Open Sans", "sans-serif"]).style("normal").variant("normal")
                   .weight("normal").stretch("normal").size(Length.px(12)).height("normal"));
    exam.equal(Font.parse("italic small-caps bold expanded 12px/16px \"Open Sans\", sans-serif"),
               Font.family(["Open Sans", "sans-serif"]).style("italic").variant("small-caps")
                   .weight("bold").stretch("expanded").size(Length.px(12)).height(Length.px(16)));
    exam.equal(Font.parse("  italic  small-caps  bold  expanded  12px/normal  \"Open Sans\"  ,  sans-serif"),
               Font.family(["Open Sans", "sans-serif"]).style("italic").variant("small-caps")
                   .weight("bold").stretch("expanded").size(Length.px(12)).height("normal"));
  }
}
