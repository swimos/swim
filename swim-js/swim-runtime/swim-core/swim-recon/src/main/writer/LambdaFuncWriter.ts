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

import {Output, WriterException, Writer} from "@swim/codec";
import type {ReconWriter} from "./ReconWriter";

/** @internal */
export class LambdaFuncWriter<I, V> extends Writer {
  private readonly recon: ReconWriter<I, V>;
  private readonly bindings: V;
  private readonly template: V;
  private readonly part: Writer | undefined;
  private readonly step: number | undefined;

  constructor(recon: ReconWriter<I, V>, bindings: V, template: V,
              part?: Writer, step?: number) {
    super();
    this.recon = recon;
    this.bindings = bindings;
    this.template = template;
    this.part = part;
    this.step = step;
  }

  override pull(output: Output): Writer {
    return LambdaFuncWriter.write(output, this.recon, this.bindings, this.template,
                                  this.part, this.step);
  }

  static sizeOf<I, V>(recon: ReconWriter<I, V>, bindings: V, template: V): number {
    let size = 0;
    size += recon.sizeOfPrimary(bindings);
    size += 4; // " => "
    size += recon.sizeOfValue(template);
    return size;
  }

  static write<I, V>(output: Output, recon: ReconWriter<I, V>, bindings: V, template: V,
                     part?: Writer, step: number = 1): Writer {
    if (step === 1) {
      if (part === void 0) {
        part = recon.writePrimary(output, bindings);
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
      output = output.write(32/*' '*/);
      step = 3;
    }
    if (step === 3 && output.isCont()) {
      output = output.write(61/*'='*/);
      step = 4;
    }
    if (step === 4 && output.isCont()) {
      output = output.write(62/*'>'*/);
      step = 5;
    }
    if (step === 5 && output.isCont()) {
      output = output.write(32/*' '*/);
      step = 6;
    }
    if (step === 6) {
      if (part === void 0) {
        part = recon.writeValue(output, template);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        return Writer.end();
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new LambdaFuncWriter<I, V>(recon, bindings, template, part, step);
  }
}
