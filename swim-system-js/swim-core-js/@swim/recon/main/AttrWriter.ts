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

import {Output, WriterException, Writer} from "@swim/codec";
import {ReconWriter} from "./ReconWriter";

/** @hidden */
export class AttrWriter<I, V> extends Writer {
  private readonly _recon: ReconWriter<I, V>;
  private readonly _key: V;
  private readonly _value: V;
  private readonly _part: Writer | undefined;
  private readonly _step: number | undefined;

  constructor(recon: ReconWriter<I, V>, key: V, value: V, part?: Writer, step?: number) {
    super();
    this._recon = recon;
    this._key = key;
    this._value = value;
    this._part = part;
    this._step = step;
  }

  pull(output: Output): Writer {
    return AttrWriter.write(output, this._recon, this._key, this._value, this._part, this._step);
  }

  static sizeOf<I, V>(recon: ReconWriter<I, V>, key: V, value: V): number {
    let size = 0;
    size += 1; // '@'
    size += recon.sizeOfValue(key);
    if (!recon.isExtant(recon.item(value))) {
      size += 1; // '(';
      size += recon.sizeOfBlockValue(value);
      size += 1; // ')';
    }
    return size;
  }

  static write<I, V>(output: Output, recon: ReconWriter<I, V>, key: V, value: V,
                     part?: Writer, step: number = 1): Writer {
    if (step === 1 && output.isCont()) {
      output = output.write(64/*'@'*/);
      step = 2;
    }
    if (step === 2) {
      if (!part) {
        part = recon.writeValue(key, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = void 0;
        if (recon.isExtant(recon.item(value))) {
          return Writer.done();
        } else {
          step = 3;
        }
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step === 3 && output.isCont()) {
      output = output.write(40/*'('*/);
      step = 4;
    }
    if (step === 4) {
      if (!part) {
        part = recon.writeBlockValue(value, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = void 0;
        step = 5;
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step === 5 && output.isCont()) {
      output = output.write(41/*')'*/);
      return Writer.done();
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new AttrWriter<I, V>(recon, key, value, part, step);
  }
}
