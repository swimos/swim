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
import {BTree} from "@swim/collections";
import {MapInput, MapOutput} from "@swim/streamlet";

export class FilterFieldsOperatorSpec extends Spec {
  @Test
  applyFilterFieldsCombinatorAfterPut(exam: Exam): void {
    const input = new MapInput<string, number>();
    const output = new MapOutput<string, number>();
    const isEven = input.filter((key: string, value: number) => value % 2 === 0);
    output.bindInput(isEven);

    input.set("two", 2);
    input.recohereInput(0); // recohere forward
    exam.equal(output.get(), new BTree().updated("two", 2));

    input.set("three", 3);
    input.recohereInput(1); // recohere forward
    exam.equal(output.get(), new BTree().updated("two", 2));

    input.set("three", 4);
    output.recohereOutput(1); // recohere backward
    exam.equal(output.get(), new BTree().updated("two", 2).updated("three", 4));

    input.set("two", 3);
    output.recohereOutput(1); // recohere backward
    exam.equal(output.get(), new BTree().updated("three", 4));
  }
}
