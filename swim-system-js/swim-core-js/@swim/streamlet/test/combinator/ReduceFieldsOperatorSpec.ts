// Copyright 2015-2020 Swim inc.
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
import {ValueOutput, MapInput} from "@swim/streamlet";

export class ReduceFieldsOperatorSpec extends Spec {
  @Test
  applyReduceFieldsCombinatorAfterSet(exam: Exam): void {
    const input = new MapInput<string, number>();
    const output = new ValueOutput<number>();
    const sum = input.reduce(0, (result: number, value: number): number => result + value,
                             (result: number, value: number): number => result + value);
    output.bindInput(sum);

    input.set("two", 2);
    input.recohereInput(0); // recohere forward
    exam.equal(output.get(), 2);

    input.set("three", 3);
    output.recohereOutput(1); // recohere backward
    exam.equal(output.get(), 5);
  }
}
