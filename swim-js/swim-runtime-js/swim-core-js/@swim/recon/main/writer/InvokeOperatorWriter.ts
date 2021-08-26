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
export class InvokeOperatorWriter<I, V> extends Writer {
  private readonly recon: ReconWriter<I, V>;
  private readonly func: V;
  private readonly args: V;
  private readonly part: Writer | undefined;
  private readonly step: number | undefined;

  constructor(recon: ReconWriter<I, V>, func: V, args: V, part?: Writer, step?: number) {
    super();
    this.recon = recon;
    this.func = func;
    this.args = args;
    this.part = part;
    this.step = step;
  }

  override pull(output: Output): Writer {
    return InvokeOperatorWriter.write(output, this.recon, this.func, this.args,
                                      this.part, this.step);
  }

  static sizeOf<I, V>(recon: ReconWriter<I, V>, func: V, args: V): number {
    let size = 0;
    size += recon.sizeOfValue(func);
    size += 1; // '('
    size += recon.sizeOfBlockValue(args);
    size += 1; // ')'
    return size;
  }

  static write<I, V>(output: Output, recon: ReconWriter<I, V>, func: V, args: V,
                     part?: Writer, step: number = 1): Writer {
    if (step === 1) {
      if (part === void 0) {
        part = recon.writeValue(func, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = void 0;
        step = 2;
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step === 2 && output.isCont()) {
      output = output.write(40/*'('*/);
      step = 3;
    }
    if (step === 3) {
      if (part === void 0) {
        part = recon.writeBlockValue(args, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = void 0;
        step = 4;
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step === 4 && output.isCont()) {
      output = output.write(41/*')'*/);
      return Writer.end();
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new InvokeOperatorWriter<I, V>(recon, func, args, part, step);
  }
}
