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

import type {Output} from "../output/Output";
import {Writer} from "./Writer";

/** @hidden */
export class WriterSequence<O> extends Writer<never, O> {
  /** @hidden */
  readonly head!: Writer<unknown, unknown>;
  /** @hidden */
  readonly tail!: Writer<unknown, O>;

  constructor(head: Writer<unknown, unknown>, tail: Writer<unknown, O>) {
    super();
    Object.defineProperty(this, "head", {
      value: head,
      enumerable: true,
    });
    Object.defineProperty(this, "tail", {
      value: tail,
      enumerable: true,
    });
  }

  override pull(output: Output): Writer<never, O> {
    let head = this.head;
    if (head.isCont()) {
      head = head.pull(output);
    }
    if (head.isError()) {
      return head.asError();
    } else if (head.isDone()) {
      return this.tail.pull(output);
    } else {
      return new WriterSequence(head, this.tail);
    }
  }
}
