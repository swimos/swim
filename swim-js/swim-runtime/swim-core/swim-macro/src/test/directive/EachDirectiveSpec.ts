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

export class EachDirectiveSpec extends Spec {
  @Test
  processEachDirectives(exam: Exam): void {
    const processor = new Processor();
    const model = Recon.parse("@each(x: $xs, y: $ys) {@div[item {$x}-{$y}]}");
    const params = Recon.parse("xs: {1, 2, 3}; ys: {4, 5, 6}");
    const result = processor.evaluate(model, params);
    exam.equal(result, Recon.parse("@div[item {1}-{4}]\n"
                                 + "@div[item {1}-{5}]\n"
                                 + "@div[item {1}-{6}]\n"
                                 + "@div[item {2}-{4}]\n"
                                 + "@div[item {2}-{5}]\n"
                                 + "@div[item {2}-{6}]\n"
                                 + "@div[item {3}-{4}]\n"
                                 + "@div[item {3}-{5}]\n"
                                 + "@div[item {3}-{6}]\n"));
  }
}
