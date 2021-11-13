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

import {Numbers, Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import {Item} from "../Item";
import {Func} from "./Func";

export abstract class BridgeFunc extends Func {
  override get typeOrder(): number {
    return 51;
  }

  override compareTo(that: unknown): number {
    if (that instanceof BridgeFunc) {
      return Constructors.compare(this.constructor, that.constructor);
    } else if (that instanceof Item) {
      return Numbers.compare(this.typeOrder, that.typeOrder);
    }
    return NaN;
  }

  override equivalentTo(that: unknown): boolean {
    return this === that;
  }

  override equals(that: unknown): boolean {
    return this === that;
  }

  override hashCode(): number {
    return Constructors.hash(this.constructor);
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write(this.constructor.name);
    return output;
  }
}
