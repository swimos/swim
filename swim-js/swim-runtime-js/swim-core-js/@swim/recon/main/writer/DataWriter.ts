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

import {Output, WriterException, Writer, Base64} from "@swim/codec";

/** @hidden */
export class DataWriter extends Writer {
  private readonly array: Uint8Array;
  private readonly part: Writer | undefined;
  private readonly step: number | undefined;

  constructor(array: Uint8Array, part?: Writer, step?: number) {
    super();
    this.array = array;
    this.part = part;
    this.step = step;
  }

  override pull(output: Output): Writer {
    return DataWriter.write(output, this.array, this.part, this.step);
  }

  static sizeOf(length: number): number {
    return 1 + ((Math.floor(length * 4 / 3) + 3) & ~3);
  }

  static write(output: Output, array: Uint8Array, part?: Writer,
               step: number = 1): Writer {
    if (step === 1 && output.isCont()) {
      output = output.write(37/*'%'*/);
      step = 2;
    }
    if (step === 2) {
      if (part === void 0) {
        part = Base64.standard().writeUint8Array(output, array);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = void 0;
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
    return new DataWriter(array, part, step);
  }
}
