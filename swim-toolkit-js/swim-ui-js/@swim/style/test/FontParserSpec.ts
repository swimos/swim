// Copyright 2015-2021 Swim inc.
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
import {Font} from "@swim/style";

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
    exam.equal(Font.parse("normal sans-serif"), Font.family("sans-serif").withStyle("normal"));
    exam.equal(Font.parse("  normal  sans-serif  "), Font.family("sans-serif").withStyle("normal"));

    exam.equal(Font.parse("italic sans-serif"), Font.family("sans-serif").withStyle("italic"));
    exam.equal(Font.parse("  italic  sans-serif  "), Font.family("sans-serif").withStyle("italic"));

    exam.equal(Font.parse("oblique sans-serif"), Font.family("sans-serif").withStyle("oblique"));
    exam.equal(Font.parse("  oblique  sans-serif  "), Font.family("sans-serif").withStyle("oblique"));
  }

  @Test
  parseFontVariants(exam: Exam): void {
    exam.equal(Font.parse("small-caps sans-serif"), Font.family("sans-serif").withVariant("small-caps"));
    exam.equal(Font.parse("  small-caps  sans-serif  "), Font.family("sans-serif").withVariant("small-caps"));
  }

  @Test
  parseFontWeights(exam: Exam): void {
    exam.equal(Font.parse("bold sans-serif"), Font.family("sans-serif").withWeight("bold"));
    exam.equal(Font.parse("  bold  sans-serif  "), Font.family("sans-serif").withWeight("bold"));

    exam.equal(Font.parse("bolder sans-serif"), Font.family("sans-serif").withWeight("bolder"));
    exam.equal(Font.parse("  bolder  sans-serif  "), Font.family("sans-serif").withWeight("bolder"));

    exam.equal(Font.parse("lighter sans-serif"), Font.family("sans-serif").withWeight("lighter"));
    exam.equal(Font.parse("  lighter  sans-serif  "), Font.family("sans-serif").withWeight("lighter"));

    exam.equal(Font.parse("100 sans-serif"), Font.family("sans-serif").withWeight("100"));
    exam.equal(Font.parse("200 sans-serif"), Font.family("sans-serif").withWeight("200"));
    exam.equal(Font.parse("300 sans-serif"), Font.family("sans-serif").withWeight("300"));
    exam.equal(Font.parse("400 sans-serif"), Font.family("sans-serif").withWeight("400"));
    exam.equal(Font.parse("500 sans-serif"), Font.family("sans-serif").withWeight("500"));
    exam.equal(Font.parse("600 sans-serif"), Font.family("sans-serif").withWeight("600"));
    exam.equal(Font.parse("700 sans-serif"), Font.family("sans-serif").withWeight("700"));
    exam.equal(Font.parse("800 sans-serif"), Font.family("sans-serif").withWeight("800"));
    exam.equal(Font.parse("900 sans-serif"), Font.family("sans-serif").withWeight("900"));
  }

  @Test
  parseFontStretches(exam: Exam): void {
    exam.equal(Font.parse("ultra-condensed sans-serif"), Font.family("sans-serif").withStretch("ultra-condensed"));
    exam.equal(Font.parse("  ultra-condensed  sans-serif  "), Font.family("sans-serif").withStretch("ultra-condensed"));

    exam.equal(Font.parse("extra-condensed sans-serif"), Font.family("sans-serif").withStretch("extra-condensed"));
    exam.equal(Font.parse("  extra-condensed  sans-serif  "), Font.family("sans-serif").withStretch("extra-condensed"));

    exam.equal(Font.parse("semi-condensed sans-serif"), Font.family("sans-serif").withStretch("semi-condensed"));
    exam.equal(Font.parse("  semi-condensed  sans-serif  "), Font.family("sans-serif").withStretch("semi-condensed"));

    exam.equal(Font.parse("condensed sans-serif"), Font.family("sans-serif").withStretch("condensed"));
    exam.equal(Font.parse("  condensed  sans-serif  "), Font.family("sans-serif").withStretch("condensed"));

    exam.equal(Font.parse("expanded sans-serif"), Font.family("sans-serif").withStretch("expanded"));
    exam.equal(Font.parse("  expanded  sans-serif  "), Font.family("sans-serif").withStretch("expanded"));

    exam.equal(Font.parse("semi-expanded sans-serif"), Font.family("sans-serif").withStretch("semi-expanded"));
    exam.equal(Font.parse("  semi-expanded  sans-serif  "), Font.family("sans-serif").withStretch("semi-expanded"));

    exam.equal(Font.parse("extra-expanded sans-serif"), Font.family("sans-serif").withStretch("extra-expanded"));
    exam.equal(Font.parse("  extra-expanded  sans-serif  "), Font.family("sans-serif").withStretch("extra-expanded"));

    exam.equal(Font.parse("ultra-expanded sans-serif"), Font.family("sans-serif").withStretch("ultra-expanded"));
    exam.equal(Font.parse("  ultra-expanded  sans-serif  "), Font.family("sans-serif").withStretch("ultra-expanded"));
  }

  @Test
  parseFontSizes(exam: Exam): void {
    exam.equal(Font.parse("12px sans-serif"), Font.family("sans-serif").withSize(Length.px(12)));
    exam.equal(Font.parse("  12px  sans-serif  "), Font.family("sans-serif").withSize(Length.px(12)));
  }

  @Test
  parseLineHeights(exam: Exam): void {
    exam.equal(Font.parse("12px/16px sans-serif"), Font.family("sans-serif").withSize(Length.px(12)).withHeight(Length.px(16)));
    exam.equal(Font.parse("  12px  /  16px  sans-serif  "), Font.family("sans-serif").withSize(Length.px(12)).withHeight(Length.px(16)));

    exam.equal(Font.parse("12px/normal sans-serif"), Font.family("sans-serif").withSize(Length.px(12)).withHeight("normal"));
    exam.equal(Font.parse("  12px  /  normal  sans-serif  "), Font.family("sans-serif").withSize(Length.px(12)).withHeight("normal"));
  }

  @Test
  parseFonts(exam: Exam): void {
    exam.equal(Font.parse("normal normal normal normal 12px/normal \"Open Sans\", sans-serif"),
               Font.family(["Open Sans", "sans-serif"]).withStyle("normal").withVariant("normal")
                   .withWeight("normal").withStretch("normal").withSize(Length.px(12)).withHeight("normal"));
    exam.equal(Font.parse("italic small-caps bold expanded 12px/16px \"Open Sans\", sans-serif"),
               Font.family(["Open Sans", "sans-serif"]).withStyle("italic").withVariant("small-caps")
                   .withWeight("bold").withStretch("expanded").withSize(Length.px(12)).withHeight(Length.px(16)));
    exam.equal(Font.parse("  italic  small-caps  bold  expanded  12px/normal  \"Open Sans\"  ,  sans-serif"),
               Font.family(["Open Sans", "sans-serif"]).withStyle("italic").withVariant("small-caps")
                   .withWeight("bold").withStretch("expanded").withSize(Length.px(12)).withHeight("normal"));
  }
}
