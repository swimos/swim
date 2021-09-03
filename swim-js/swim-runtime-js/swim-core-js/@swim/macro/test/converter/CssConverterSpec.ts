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

import {Unicode} from "@swim/codec";
import {Spec, Test, Exam} from "@swim/unit";
import {Recon} from "@swim/recon";
import {CssConverter} from "@swim/macro";

export class CssConverterSpec extends Spec {
  @Test
  convertEmptyRules(exam: Exam): void {
    const converter = new CssConverter();
    const model = Recon.parse("@rule(\".test\") {\n"
                            + "}\n");
    const result = converter.convert(Unicode.stringOutput(), model);
    exam.equal(result, "");
  }

  @Test
  convertNonEmptyRules(exam: Exam): void {
    const converter = new CssConverter();
    const model = Recon.parse("@rule(\".test\") {\n"
                            + "  color: \"#000\"\n"
                            + "  background-color: \"#fff\"\n"
                            + "}\n");
    const result = converter.convert(Unicode.stringOutput(), model);
    exam.equal(result, ".test {\n"
                     + "color: #000;\n"
                     + "background-color: #fff;\n"
                     + "}\n");
  }

  @Test
  convertMultiSelectorRules(exam: Exam): void {
    const converter = new CssConverter();
    const model = Recon.parse("@rule(html, head) {\n"
                            + "  background-color: \"#fff\"\n"
                            + "}\n");
    const result = converter.convert(Unicode.stringOutput(), model);
    exam.equal(result, "html,\n"
                     + "head {\n"
                     + "background-color: #fff;\n"
                     + "}\n");
  }

  @Test
  convertNestedRules(exam: Exam): void {
    const converter = new CssConverter();
    const model = Recon.parse("@rule(\".a\", \".b\") {\n"
                            + "  @rule(\".x\", \".y\") {\n"
                            + "    color: \"#000\"\n"
                            + "  }\n"
                            + "}\n");
    const result = converter.convert(Unicode.stringOutput(), model);
    exam.equal(result, ".a .x,\n"
                     + ".a .y,\n"
                     + ".b .x,\n"
                     + ".b .y {\n"
                     + "color: #000;\n"
                     + "}\n");
  }

  @Test
  convertInterspersedNestedRules(exam: Exam): void {
    const converter = new CssConverter();
    const model = Recon.parse("@rule(\".a\", \".b\") {\n"
                            + "  background-color: \"#fff\"\n"
                            + "  @rule(\".x\", \".y\") {\n"
                            + "    color: \"#000\"\n"
                            + "  }\n"
                            + "  color: \"#888\"\n"
                            + "}\n");
    const result = converter.convert(Unicode.stringOutput(), model);
    exam.equal(result, ".a,\n"
                     + ".b {\n"
                     + "background-color: #fff;\n"
                     + "}\n"
                     + ".a .x,\n"
                     + ".a .y,\n"
                     + ".b .x,\n"
                     + ".b .y {\n"
                     + "color: #000;\n"
                     + "}\n"
                     + ".a,\n"
                     + ".b {\n"
                     + "color: #888;\n"
                     + "}\n");
  }

  @Test
  convertMediaQueries(exam: Exam): void {
    const converter = new CssConverter();
    const model = Recon.parse("@media(screen) {\n"
                            + "  @rule(\"#test\") {\n"
                            + "    color: \"#000\"\n"
                            + "    background-color: \"#fff\"\n"
                            + "  }\n"
                            + "}\n");
    const result = converter.convert(Unicode.stringOutput(), model);
    exam.equal(result, "@media screen {\n"
                     + "#test {\n"
                     + "color: #000;\n"
                     + "background-color: #fff;\n"
                     + "}\n"
                     + "}\n");
  }

  @Test
  convertMediaAndQueries(exam: Exam): void {
    const converter = new CssConverter();
    const model = Recon.parse("@media(@and{min-width: 400, min-height: 800})\n");
    const result = converter.convert(Unicode.stringOutput(), model);
    exam.equal(result, "@media (min-width: 400px) and (min-height: 800px) {\n"
                     + "}\n");
  }

  @Test
  convertMediaNotQueries(exam: Exam): void {
    const converter = new CssConverter();
    const model = Recon.parse("@media(@not{@and{screen, color}})\n");
    const result = converter.convert(Unicode.stringOutput(), model);
    exam.equal(result, "@media not (screen and color) {\n"
                     + "}\n");
  }

  @Test
  convertMultiMediaQueries(exam: Exam): void {
    const converter = new CssConverter();
    const model = Recon.parse("@media(@and{min-width: 400, min-height: 800}, screen)\n");
    const result = converter.convert(Unicode.stringOutput(), model);
    exam.equal(result, "@media (min-width: 400px) and (min-height: 800px), screen {\n"
                     + "}\n");
  }
}
