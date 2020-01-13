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
import {Length} from "@swim/length";
import {Font} from "@swim/font";

export class FontWriterSpec extends Spec {
  @Test
  writerSingleFontFamilies(exam: Exam): void {
    exam.equal(Font.family("serif").toString(), "serif");
    exam.equal(Font.family("sans-serif").toString(), "sans-serif");
  }

  @Test
  writeMultipleFontFamilies(exam: Exam): void {
    exam.equal(Font.family(["Menlo", "monospace"]).toString(), "Menlo, monospace");
  }

  @Test
  writeSingleQuotedFontFamilies(exam: Exam): void {
    exam.equal(Font.family("Open Sans").toString(), "\"Open Sans\"");
  }

  @Test
  parseMultipleQuotedFontFamilies(exam: Exam): void {
    exam.equal(Font.family(["Orbitron", "Open Sans"]).toString(), "Orbitron, \"Open Sans\"");
  }

  @Test
  writeFontSizes(exam: Exam): void {
    exam.equal(Font.family("sans-serif").size(Length.px(12)).toString(), "12px sans-serif");
  }

  @Test
  writeLineHeights(exam: Exam): void {
    exam.equal(Font.family("sans-serif").size(Length.px(12)).height(Length.px(16)).toString(), "12px/16px sans-serif");
  }

  @Test
  writeFontStyles(exam: Exam): void {
    exam.equal(Font.family("sans-serif").style("normal").toString(), "normal sans-serif");
    exam.equal(Font.family("sans-serif").style("italic").toString(), "italic sans-serif");
    exam.equal(Font.family("sans-serif").style("oblique").toString(), "oblique sans-serif");
  }

  @Test
  writeFontVariants(exam: Exam): void {
    exam.equal(Font.family("sans-serif").variant("small-caps").toString(), "small-caps sans-serif");
  }

  @Test
  writeFontWeights(exam: Exam): void {
    exam.equal(Font.family("sans-serif").weight("bold").toString(), "bold sans-serif");
    exam.equal(Font.family("sans-serif").weight("bolder").toString(), "bolder sans-serif");
    exam.equal(Font.family("sans-serif").weight("lighter").toString(), "lighter sans-serif");

    exam.equal(Font.family("sans-serif").weight("100").toString(), "100 sans-serif");
    exam.equal(Font.family("sans-serif").weight("200").toString(), "200 sans-serif");
    exam.equal(Font.family("sans-serif").weight("300").toString(), "300 sans-serif");
    exam.equal(Font.family("sans-serif").weight("400").toString(), "400 sans-serif");
    exam.equal(Font.family("sans-serif").weight("500").toString(), "500 sans-serif");
    exam.equal(Font.family("sans-serif").weight("600").toString(), "600 sans-serif");
    exam.equal(Font.family("sans-serif").weight("700").toString(), "700 sans-serif");
    exam.equal(Font.family("sans-serif").weight("800").toString(), "800 sans-serif");
    exam.equal(Font.family("sans-serif").weight("900").toString(), "900 sans-serif");
  }

  @Test
  writeFontStretches(exam: Exam): void {
    exam.equal(Font.family("sans-serif").stretch("ultra-condensed").toString(), "ultra-condensed sans-serif");
    exam.equal(Font.family("sans-serif").stretch("extra-condensed").toString(), "extra-condensed sans-serif");
    exam.equal(Font.family("sans-serif").stretch("semi-condensed").toString(), "semi-condensed sans-serif");
    exam.equal(Font.family("sans-serif").stretch("condensed").toString(), "condensed sans-serif");
    exam.equal(Font.family("sans-serif").stretch("expanded").toString(), "expanded sans-serif");
    exam.equal(Font.family("sans-serif").stretch("semi-expanded").toString(), "semi-expanded sans-serif");
    exam.equal(Font.family("sans-serif").stretch("extra-expanded").toString(), "extra-expanded sans-serif");
    exam.equal(Font.family("sans-serif").stretch("ultra-expanded").toString(), "ultra-expanded sans-serif");
  }

  @Test
  parseFonts(exam: Exam): void {
    exam.equal(Font.family(["Open Sans", "sans-serif"]).style("normal").variant("normal")
                   .weight("normal").stretch("normal").size(Length.px(12)).height("normal").toString(),
               "normal normal normal normal 12px/normal \"Open Sans\", sans-serif");
    exam.equal(Font.family(["Open Sans", "sans-serif"]).style("italic").variant("small-caps")
                   .weight("bold").stretch("expanded").size(Length.px(12)).height(Length.px(16)).toString(),
               "italic small-caps bold expanded 12px/16px \"Open Sans\", sans-serif");
  }
}
