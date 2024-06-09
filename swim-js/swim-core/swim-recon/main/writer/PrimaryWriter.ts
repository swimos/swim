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

import type {Cursor} from "@swim/util";
import type {Output} from "@swim/codec";
import {WriterException} from "@swim/codec";
import {Writer} from "@swim/codec";
import type {ReconWriter} from "./ReconWriter";

/** @internal */
export class PrimaryWriter<I, V> extends Writer {
  private readonly recon: ReconWriter<I, V>;
  private readonly items: Cursor<I>;
  private readonly inParens: boolean | undefined;
  private readonly first: boolean | undefined;
  private readonly item: I | undefined;
  private readonly next: I | undefined;
  private readonly part: Writer | undefined;
  private readonly step: number | undefined;

  constructor(recon: ReconWriter<I, V>, items: Cursor<I>, inParens?: boolean,
              first?: boolean, item?: I, next?: I, part?: Writer, step?: number) {
    super();
    this.recon = recon;
    this.items = items;
    this.inParens = inParens;
    this.first = first;
    this.item = item;
    this.next = next;
    this.part = part;
    this.step = step;
  }

  override pull(output: Output): Writer {
    return PrimaryWriter.write(output, this.recon, this.items, this.inParens, this.first,
                               this.item, this.next, this.part, this.step);
  }

  static sizeOf<I, V>(recon: ReconWriter<I, V>, items: Cursor<I>): number {
    let size = 0;
    let inParens = false;
    let first = true;
    let next: I | undefined;
    while (next !== void 0 || items.hasNext()) {
      let item: I | undefined;
      if (next === void 0) {
        item = items.next().value as I;
      } else {
        item = next;
        next = void 0;
      }
      if (items.hasNext()) {
        next = items.next().value as I;
      }
      if (!inParens && !first) {
        size += 1; // ' '
      }
      if (recon.isAttr(item)) {
        if (inParens) {
          size += 1; // ')'
          inParens = false;
        }
        size += recon.sizeOfItem(item);
        first = false;
      } else if (inParens) {
        if (!first) {
          size += 1; // ','
        } else {
          first = false;
        }
        size += recon.sizeOfBlockItem(item);
      } else if (recon.isValue(item) && !recon.isRecord(item)
             && (!first && next === void 0 || next !== void 0 && recon.isAttr(next))) {
        size += recon.sizeOfItem(item);
      } else {
        size += 1; // '('
        size += recon.sizeOfItem(item);
        inParens = true;
        first = false;
      }
    }
    if (inParens) {
      size += 1; // ')'
    }
    return size;
  }

  static write<I, V>(output: Output, recon: ReconWriter<I, V>, items: Cursor<I>,
                     inParens: boolean = false, first: boolean = true, item?: I,
                     next?: I, part?: Writer, step: number = 1): Writer {
    do {
      if (step === 1) {
        if (next === void 0 && !items.hasNext()) {
          step = 5;
          break;
        } else {
          if (next === void 0) {
            item = items.next().value!;
          } else {
            item = next;
            next = void 0;
          }
          if (items.hasNext()) {
            next = items.next().value!;
          }
          step = 2;
        }
      }
      if (step === 2 && output.isCont()) {
        if (!inParens && !first) {
          output = output.write(32/*' '*/);
        }
        step = 3;
      }
      if (step === 3 && output.isCont()) {
        if (recon.isAttr(item!)) {
          if (inParens) {
            output = output.write(41/*')'*/);
            inParens = false;
          }
          part = recon.writeItem(output, item!);
          first = false;
          step = 4;
        } else if (inParens) {
          if (!first) {
            output = output.write(44/*','*/);
          } else {
            first = false;
          }
          part = recon.writeBlockItem(output, item!);
          step = 4;
        } else if (recon.isValue(item!) && !recon.isRecord(item!)
               && (!first && next === void 0 || next !== void 0 && recon.isAttr(next))) {
          part = recon.writeItem(output, item!);
          step = 4;
        } else {
          output = output.write(40/*'('*/);
          part = recon.writeItem(output, item!);
          inParens = true;
          first = false;
          step = 4;
        }
      }
      if (step === 4) {
        part = part!.pull(output);
        if (part.isDone()) {
          part = void 0;
          step = 1;
          continue;
        } else if (part.isError()) {
          return part.asError();
        }
      }
      break;
    } while (true);
    if (step === 5) {
      if (inParens) {
        if (output.isCont()) {
          output = output.write(41/*')'*/);
          return Writer.end();
        }
      } else {
        return Writer.end();
      }
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new PrimaryWriter<I, V>(recon, items, inParens, first, item, next, part, step);
  }
}
