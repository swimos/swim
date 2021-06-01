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
import {Recon} from "@swim/recon";
import {TestProcessor} from "../TestProcessor";

export class TemplateDirectiveSpec extends Spec {
  @Test
  processTemplateDirectives(exam: Exam): void {
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
    const model = Recon.parse("@template(\"template.recon\") {\n"
                            + "  title: Title\n"
                            + "  @h1 $title\n"
                            + "}\n");
    const result = processor.evaluate(model);
    exam.equal(result, Recon.parse("@html {\n"
                                 + "  @head {\n"
                                 + "    @title Title\n"
                                 + "  }\n"
                                 + "  @body {\n"
                                 + "   {@h1 Title}\n"
                                 + "  }\n"
                                 + "}\n"));
  }
}
