// Copyright 2015-2024 Nstream, inc.
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

import {Strings} from "@swim/util";
import type {Output} from "@swim/codec";
import {WriterException} from "@swim/codec";
import {Writer} from "@swim/codec";
import {Utf8} from "@swim/codec";
import {Recon} from "../Recon";

/** @internal */
export class IdentWriter extends Writer {
  private readonly ident: string;
  private readonly index: number | undefined;

  constructor(ident: string, index?: number) {
    super();
    this.ident = ident;
    this.index = index;
  }

  override pull(output: Output): Writer {
    return IdentWriter.write(output, this.ident, this.index);
  }

  static sizeOf(ident: string): number {
    return Utf8.sizeOf(ident);
  }

  static write(output: Output, ident: string, index: number = 0): Writer {
    let c: number | undefined;
    const length = ident.length;
    if (length === 0) {
      return Writer.error(new WriterException("empty identifier"));
    }
    if (index === 0 && output.isCont()) {
      c = ident.codePointAt(0);
      if (c === void 0) {
        c = ident.charCodeAt(0);
      }
      if (Recon.isIdentStartChar(c)) {
        output = output.write(c);
        index = Strings.offsetByCodePoints(ident, 0, 1);
      }
    }
    while (index < length && output.isCont()) {
      c = ident.codePointAt(index);
      if (c === void 0) {
        c = ident.charCodeAt(index);
      }
      if (Recon.isIdentChar(c)) {
        output = output.write(c);
        index = Strings.offsetByCodePoints(ident, index, 1);
      } else {
        return Writer.error(new WriterException("invalid identifier"));
      }
    }
    if (index >= length) {
      return Writer.end();
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new IdentWriter(ident, index);
  }
}
