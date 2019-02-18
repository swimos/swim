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
export class GetSelectorWriter<I, V> extends Writer {
  private readonly _recon: ReconWriter<I, V>;
  private readonly _key: V;
  private readonly _then: V;
  private readonly _part: Writer | undefined;
  private readonly _step: number | undefined;

  constructor(recon: ReconWriter<I, V>, key: V, then: V, part?: Writer, step?: number) {
    super();
    this._recon = recon;
    this._key = key;
    this._then = then;
    this._part = part;
    this._step = step;
  }

  pull(output: Output): Writer {
    return GetSelectorWriter.write(output, this._recon, this._key, this._then, this._part, this._step);
  }

  static sizeOf<I, V>(recon: ReconWriter<I, V>, key: V, then: V): number {
    let size = 1; // '$' | '.'
    if (recon.isRecord(recon.item(key))) {
      size += 1; // '{'
      size += recon.sizeOfBlockValue(key);
      size += 1; // '}'
    } else {
      size += recon.sizeOfValue(key);
    }
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
    if (step === 3) {
      if (recon.isRecord(recon.item(key))) {
        if (output.isCont()) {
          output = output.write(123/*'{'*/);
          step = 4;
        }
      } else {
        step = 4;
      }
    }
    if (step === 4) {
      if (!part) {
        if (recon.isRecord(recon.item(key))) {
          part = recon.writeBlockValue(key, output);
        } else {
          part = recon.writeValue(key, output);
        }
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
    if (step === 5) {
      if (recon.isRecord(recon.item(key))) {
        if (output.isCont()) {
          output = output.write(125/*'}'*/);
          step = 6;
        }
      } else {
        step = 6;
      }
    }
    if (step === 6) {
      return recon.writeThen(then, output);
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new GetSelectorWriter<I, V>(recon, key, then, part, step);
  }

  static writeThen<I, V>(output: Output, recon: ReconWriter<I, V>, key: V, then: V): Writer {
    return GetSelectorWriter.write(output, recon, key, then, void 0, 2);
  }
}
