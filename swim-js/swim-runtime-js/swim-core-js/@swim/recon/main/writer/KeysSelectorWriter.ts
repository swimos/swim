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

import {Output, WriterException, Writer} from "@swim/codec";
import type {ReconWriter} from "./ReconWriter";

/** @hidden */
export class KeysSelectorWriter<I, V> extends Writer {
  private readonly recon: ReconWriter<I, V>;
  private readonly then: V;
  private readonly step: number | undefined;

  constructor(recon: ReconWriter<I, V>, then: V, step?: number) {
    super();
    this.recon = recon;
    this.then = then;
    this.step = step;
  }

  override pull(output: Output): Writer {
    return KeysSelectorWriter.write(output, this.recon, this.then, this.step);
  }

  static sizeOf<I, V>(recon: ReconWriter<I, V>, then: V): number {
    let size = 3; // ('$' | '.') '*' ':'
    size += recon.sizeOfThen(then);
    return size;
  }

  static write<I, V>(output: Output, recon: ReconWriter<I, V>, then: V,
                     step: number = 1): Writer {
    if (step === 1 && output.isCont()) {
      output = output.write(36/*'$'*/);
      step = 3;
    } else if (step === 2 && output.isCont()) {
      output = output.write(46/*'.'*/);
      step = 3;
    }
    if (step === 3 && output.isCont()) {
      output = output.write(42/*'*'*/);
      step = 4;
    }
    if (step === 4 && output.isCont()) {
      output = output.write(58/*':'*/);
      return recon.writeThen(output, then);
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new KeysSelectorWriter<I, V>(recon, then, step);
  }

  static writeThen<I, V>(output: Output, recon: ReconWriter<I, V>, then: V): Writer {
    return KeysSelectorWriter.write(output, recon, then, 2);
  }
}
