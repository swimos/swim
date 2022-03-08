// Copyright 2015-2022 Swim.inc
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
import {Recon} from "@swim/recon";
import {TestProcessor} from "../TestProcessor";

export class ExportDirectiveSpec extends Spec {
  @Test
  processExportDirectives(exam: Exam): void {
    const processor = new TestProcessor();
    const model = Recon.parse("@export(\"test.html\") \"<html/>\"\n");
    processor.evaluate(model);
    exam.equal(processor.getOutput("test.html"), "<html/>");
  }

  @Test
  processExportConvertDirectives(exam: Exam): void {
    const processor = new TestProcessor();
    const model = Recon.parse("@export(\"test.html\") @convert(html) {\n"
                            + "  @html\n"
                            + "}\n");
    processor.evaluate(model);
    exam.equal(processor.getOutput("test.html"), "<html></html>");
  }

  @Test
  processExportImplicitConvertDirectives(exam: Exam): void {
    const processor = new TestProcessor();
    const model = Recon.parse("@export(\"test.html\") {\n"
                            + "  @html\n"
                            + "}\n");
    processor.evaluate(model);
    exam.equal(processor.getOutput("test.html"), "<html></html>");
  }

  @Test
  processExportConvertTemplateDirectives(exam: Exam): void {
    const processor = new TestProcessor();
    processor.addInput("template.recon",
                       Recon.parse("@html {\n"
                                 + "  @head {\n"
                                 + "    @title $title\n"
                                 + "  }\n"
                                 + "  @body {\n"
                                 + "    $model\n"
                                 + "  }\n"
                                 + "}\n"));
    const model = Recon.parse("@export(\"test.html\") @convert(html) @template(\"template.recon\") {\n"
                            + "  title: Title\n"
                            + "  @h1 $title\n"
                            + "}\n");
    processor.evaluate(model);
    exam.equal(processor.getOutput("test.html"), "<html><head><title>Title</title></head><body><h1>Title</h1></body></html>");
  }

  @Test
  processExportImplicitConvertTemplateDirectives(exam: Exam): void {
    const processor = new TestProcessor();
    processor.addInput("template.recon",
                       Recon.parse("@html {\n"
                                 + "  @head {\n"
                                 + "    @title $title\n"
                                 + "  }\n"
                                 + "  @body {\n"
                                 + "    $model\n"
                                 + "  }\n"
                                 + "}\n"));
    const model = Recon.parse("@export(\"test.html\") @template(\"template.recon\") {\n"
                            + "  title: Title\n"
                            + "  @h1 $title\n"
                            + "}\n");
    processor.evaluate(model);
    exam.equal(processor.getOutput("test.html"), "<html><head><title>Title</title></head><body><h1>Title</h1></body></html>");
  }
}
