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

import {Output, WriterException, Writer} from "@swim/codec";
import type {ReconWriter} from "./ReconWriter";

/** @hidden */
export class GetAttrSelectorWriter<I, V> extends Writer {
  private readonly recon: ReconWriter<I, V>;
  private readonly key: V;
  private readonly then: V;
  private readonly part: Writer | undefined;
  private readonly step: number | undefined;

  constructor(recon: ReconWriter<I, V>, key: V, then: V, part?: Writer, step?: number) {
    super();
    this.recon  = recon;
    this.key = key;
    this.then = then;
    this.part = part;
    this.step = step;
  }

  override pull(output: Output): Writer {
    return GetAttrSelectorWriter.write(output, this.recon, this.key, this.then,
                                       this.part, this.step);
  }

  static sizeOf<I, V>(recon: ReconWriter<I, V>, key: V, then: V): number {
    let size = 2; // ('$' | '.') '@'
    size += recon.sizeOfValue(key);
    size += recon.sizeOfThen(then);
    return size;
  }

  static write<I, V>(output: Output, recon: ReconWriter<I, V>, key: V, then: V,
                     part?: Writer, step: number = 1): Writer {
    if (step === 1 && output.isCont()) {
      output = output.write(36/*'$'*/);
      step = 3;
    } else if (step === 2 && output.isCont()) {
      output = output.write(46/*'.'*/);
      step = 3;
    }
    if (step === 3 && output.isCont()) {
      output = output.write(64/*'@'*/);
      step = 4;
    }
    if (step === 4) {
      if (part === void 0) {
        part = recon.writeValue(key, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        return recon.writeThen(then, output);
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new GetAttrSelectorWriter<I, V>(recon, key, then, part, step);
  }

  static writeThen<I, V>(output: Output, recon: ReconWriter<I, V>, key: V, then: V): Writer {
    return GetAttrSelectorWriter.write(output, recon, key, then, void 0, 2);
  }
}
