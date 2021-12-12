// Copyright 2015-2021 Swim.inc
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

export class DefineDirectiveSpec extends Spec {
  @Test
  processDefineDirectives(exam: Exam): void {
    const processor = new Processor();
    const model = Recon.parse("@define(list) {\n"
                            + "  @ul @each(item: $model) {\n"
                            + "    @li $item\n"
                            + "  }\n"
                            + "}\n"
                            + "\n"
                            + "@list {\n"
                            + "  [Hello, @em[list]!]\n"
                            + "  'Another item'\n"
                            + "  'One more'\n"
                            + "}\n");
    const params = Recon.parse("xs: {1, 2, 3}; ys: {4, 5, 6}");
    const result = processor.evaluate(model, params);
    exam.equal(result, Recon.parse("{\n"
                                 + "  @ul {\n"
                                 + "    @li {[Hello, @em[list]!]}\n"
                                 + "    @li \"Another item\"\n"
                                 + "    @li \"One more\"\n"
                                 + "  }\n"
                                 + "}\n"));
  }
}
