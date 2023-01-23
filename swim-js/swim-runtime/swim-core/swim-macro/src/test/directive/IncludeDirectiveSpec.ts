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

import {Spec, Test, Exam} from "@swim/unit";
import {Recon} from "@swim/recon";
import {Processor} from "@swim/macro";

export class IncludeDirectiveSpec extends Spec {
  @Test
  processIncludeDirectives(exam: Exam): void {
    const processor = new Processor();
    const model = Recon.parse("a: 1, b: @include('src/test/foo.recon'), c: $title, @include('src/test/bar.recon')");
    const params = Recon.parse("title: 3");
    const result = processor.evaluate(model, params);
    exam.equal(result, Recon.parse("{a:1,b:@foo,c:3,@bar}"));
  }
}
