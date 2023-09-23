// Copyright 2015-2023 Nstream, inc.
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

import type {Output} from "@swim/codec";
import {WriterException} from "@swim/codec";
import {Writer} from "@swim/codec";
import type {ReconWriter} from "./ReconWriter";

/** @internal */
export class SlotWriter<I, V> extends Writer {
  private readonly recon: ReconWriter<I, V>;
  private readonly key: V;
  private readonly value: V;
  private readonly part: Writer | undefined;
  private readonly step: number | undefined;

  constructor(recon: ReconWriter<I, V>, key: V, value: V, part?: Writer, step?: number) {
    super();
    this.recon = recon;
    this.key = key;
    this.value = value;
    this.part = part;
    this.step = step;
  }

  override pull(output: Output): Writer {
    return SlotWriter.write(output, this.recon, this.key, this.value, this.part, this.step);
  }

  static sizeOf<I, V>(recon: ReconWriter<I, V>, key: V, value: V): number {
    let size = 0;
    size += recon.sizeOfValue(key);
    size += 1; // ':'
    if (!recon.isExtant(recon.item(value))) {
      size += recon.sizeOfValue(value);
    }
    return size;
  }

  static write<I, V>(output: Output, recon: ReconWriter<I, V>, key: V, value: V,
                     part?: Writer, step: number = 1): Writer {
    if (step === 1) {
      if (part === void 0) {
        part = recon.writeValue(output, key);
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
      output = output.write(58/*':'*/);
      if (recon.isExtant(recon.item(value))) {
        return Writer.end();
      } else {
        step = 3;
      }
    }
    if (step === 3) {
      if (part === void 0) {
        part = recon.writeValue(output, value);
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
    return new SlotWriter<I, V>(recon, key, value, part, step);
  }
}
