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
import {Recon} from "@swim/recon";
import {TestProcessor} from "../TestProcessor";

export class ConvertDirectiveSpec extends Spec {
  @Test
  processConvertDirectives(exam: Exam): void {
    const processor = new TestProcessor();
    const model = Recon.parse("@convert(html) {\n"
                            + "  @html\n"
                            + "}\n");
    const result = processor.evaluate(model);
    exam.equal(result.stringValue(), "<html></html>");
  }

  @Test
  processConvertIncludeDirectives(exam: Exam): void {
    const processor = new TestProcessor();
    processor.addInput("input.recon", Recon.parse("@html\n"));
    const model = Recon.parse("@convert(html) @include(\"input.recon\")\n");
    const result = processor.evaluate(model);
    exam.equal(result.stringValue(), "<html></html>");
  }

  @Test
  processConvertTemplateDirectives(exam: Exam): void {
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
    const model = Recon.parse("@convert(html) @template(\"template.recon\") {\n"
                            + "  title: Title\n"
                            + "  @h1 $title\n"
                            + "}\n");
    const result = processor.evaluate(model);
    exam.equal(result.stringValue(), "<html><head><title>Title</title></head><body><h1>Title</h1></body></html>");
  }
}
