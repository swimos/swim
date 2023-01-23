// Copyright 2015-2023 Swim.inc
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
import {HtmlConverter} from "@swim/macro";

export class HtmlConverterSpec extends Spec {
  @Test
  convertDoctype(exam: Exam): void {
    const converter = new HtmlConverter();
    const model = Recon.parse("@doctype(html)\n"
                            + "@html\n");
    const result = converter.convert(Unicode.stringOutput(), model);
    exam.equal(result, "<!DOCTYPE html><html></html>");
  }

  @Test
  convertEmptyElement(exam: Exam): void {
    const converter = new HtmlConverter();
    const model = Recon.parse("@html\n");
    const result = converter.convert(Unicode.stringOutput(), model);
    exam.equal(result, "<html></html>");
  }

  @Test
  convertNonEmptyElements(exam: Exam): void {
    const converter = new HtmlConverter();
    const model = Recon.parse("@html {\n"
                            + "  @head {\n"
                            + "  }\n"
                            + "  @body {\n"
                            + "  }\n"
                            + "}\n");
    const result = converter.convert(Unicode.stringOutput(), model);
    exam.equal(result, "<html><head></head><body></body></html>");
  }

  @Test
  convertEmptyElementAttributes(exam: Exam): void {
    const converter = new HtmlConverter();
    const model = Recon.parse("@html(lang: en)\n");
    const result = converter.convert(Unicode.stringOutput(), model);
    exam.equal(result, "<html lang=\"en\"></html>");
  }

  @Test
  convertNonEmptyElementAttributes(exam: Exam): void {
    const converter = new HtmlConverter();
    const model = Recon.parse("@html(lang: en) {\n"
                            + "  @head\n"
                            + "  @body(id: root, class: \"root-class\") {\n"
                            + "    @div\n"
                            + "  }\n"
                            + "}\n");
    const result = converter.convert(Unicode.stringOutput(), model);
    exam.equal(result, "<html lang=\"en\"><head></head><body id=\"root\" class=\"root-class\"><div></div></body></html>");
  }

  @Test
  convertElementsWithTextChildren(exam: Exam): void {
    const converter = new HtmlConverter();
    const model = Recon.parse("@html {\n"
                            + "  @head {\n"
                            + "    @title \"Test\"\n"
                            + "  }\n"
                            + "  @body {\n"
                            + "  }\n"
                            + "}\n");
    const result = converter.convert(Unicode.stringOutput(), model);
    exam.equal(result, "<html><head><title>Test</title></head><body></body></html>");
  }

  @Test
  convertElementsWithInterspersedTextChildren(exam: Exam): void {
    const converter = new HtmlConverter();
    const model = Recon.parse("@html {\n"
                            + "  @body {\n"
                            + "    @h1 \"Greetings\"\n"
                            + "    @p[Hello, @em[world]!]\n"
                            + "  }\n"
                            + "}\n");
    const result = converter.convert(Unicode.stringOutput(), model);
    exam.equal(result, "<html><body><h1>Greetings</h1><p>Hello, <em>world</em>!</p></body></html>");
  }
}
