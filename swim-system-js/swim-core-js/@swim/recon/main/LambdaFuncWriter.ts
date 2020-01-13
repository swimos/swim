// Copyright 2015-2020 SWIM.AI inc.
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
import {ReconWriter} from "./ReconWriter";

/** @hidden */
export class LambdaFuncWriter<I, V> extends Writer {
  private readonly _recon: ReconWriter<I, V>;
  private readonly _bindings: V;
  private readonly _template: V;
  private readonly _part: Writer | undefined;
  private readonly _step: number | undefined;

  constructor(recon: ReconWriter<I, V>, bindings: V, template: V,
              part?: Writer, step?: number) {
    super();
    this._recon = recon;
    this._bindings = bindings;
    this._template = template;
    this._part = part;
    this._step = step;
  }

  pull(output: Output): Writer {
    return LambdaFuncWriter.write(output, this._recon, this._bindings, this._template,
                                  this._part, this._step);
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
      if (!part) {
        part = recon.writePrimary(bindings, output);
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
      if (part == null) {
        part = recon.writeValue(template, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        return Writer.done();
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
