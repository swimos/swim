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
import {Processor} from "@swim/macro";

export class HighlightDirectiveSpec extends Spec {
  @Test
  processHighlightDirectives(exam: Exam): void {
    const processor = new Processor();
    const model = Recon.parse("@pre @highlight(typescript) [export const test: string = \"testing\"]");
    const result = processor.evaluate(model);
    exam.equal(result, Recon.parse("@pre{\n"
                                 + "  @span(class: keyword) export\n"
                                 + "  \" \"\n"
                                 + "  @span(class: keyword) const\n"
                                 + "  \" test\"\n"
                                 + "  @span(class: operator) \":\"\n"
                                 + "  \" \"\n"
                                 + "  @span(class: builtin) string\n"
                                 + "  \" \"\n"
                                 + "  @span(class: operator) \"=\"\n"
                                 + "  \" \"\n"
                                 + "  @span(class: string) \"\\\"testing\\\"\"\n"
                                 + "}\n"));
  }

  @Test
  processConvertHighlightDirectives(exam: Exam): void {
    const processor = new Processor();
    const model = Recon.parse("@convert(html) @pre @highlight(typescript) [export const test: string = \"testing\"]");
    const result = processor.evaluate(model);
    exam.equal(result.stringValue(), "<pre>"
                                   + "<span class=\"keyword\">export</span>"
                                   + " "
                                   + "<span class=\"keyword\">const</span>"
                                   + " test"
                                   + "<span class=\"operator\">:</span>"
                                   + " "
                                   + "<span class=\"builtin\">string</span>"
                                   + " "
                                   + "<span class=\"operator\">=</span>"
                                   + " "
                                   + "<span class=\"string\">\"testing\"</span>"
                                   + "</pre>");
  }
}
