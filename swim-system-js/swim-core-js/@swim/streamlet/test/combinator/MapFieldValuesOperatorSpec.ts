// Copyright 2015-2019 SWIM.AI inc.
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
import {ValueOutput, MapInput, MapOutput} from "@swim/streamlet";

export class MapFieldValuesOperatorSpec extends Spec {
  @Test
  applyMapFieldValuesCombinatorAfterSet(exam: Exam): void {
    const input = new MapInput<string, number>();
    const output = new MapOutput<string, number>();
    const square = input.map((key: string, value: number): number => value * value);
    output.bindInput(square);

    input.set("two", 2);
    input.reconcileInput(0); // reconcile forward
    exam.equal(output.get(), new BTree().updated("two", 4));

    input.set("three", 3);
    output.reconcileOutput(1); // reconcile backward
    exam.equal(output.get(), new BTree().updated("two", 4).updated("three", 9));
  }

  @Test
  applyMapKeyCombinatorAfterSet(exam: Exam): void {
    const input = new MapInput<string, number>();
    const output = new ValueOutput<number>();
    const square = input.outlet("number").map((value: number): number => value * value);
    output.bindInput(square);

    input.set("number", 2);
    input.reconcileInput(0); // reconcile forward
    exam.equal(output.get(), 4);

    input.set("other", 3);
    input.reconcileInput(0); // reconcile forward
    exam.equal(output.get(), 4); // updating other key has no effect

    input.set("number", 4);
    output.reconcileOutput(1); // reconcile backward
    exam.equal(output.get(), 16);
  }

  @Test
  applyMapKeyCombinatorAfterMapFieldValuesCombinator(exam: Exam): void {
    const input = new MapInput<string, number>();
    const output = new ValueOutput<number>();
    const squarePlus1 = input.map((key: string, value: number): number => value * value)
                             .outlet("number").map((value: number): number => value + 1);
    output.bindInput(squarePlus1);

    input.set("number", 2);
    input.reconcileInput(0); // reconcile forward
    exam.equal(output.get(), 5);

    input.set("other", 3);
    input.reconcileInput(0); // reconcile forward
    exam.equal(output.get(), 5); // updating other key has no effect

    input.set("number", 4);
    output.reconcileOutput(1); // reconcile backward
    exam.equal(output.get(), 17);
  }
}
