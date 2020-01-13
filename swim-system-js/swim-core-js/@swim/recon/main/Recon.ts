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

import {Output, Parser, Writer, Unicode, Utf8} from "@swim/codec";
import {Item, Value, Data} from "@swim/structure";
import {ReconParser} from "./ReconParser";
import {ReconStructureParser} from "./ReconStructureParser";
import {ReconWriter} from "./ReconWriter";
import {ReconStructureWriter} from "./ReconStructureWriter";

/**
 * Factory for constructing Recon parsers and writers.
 */
export class Recon {
  private constructor() {
    // stub
  }

  /** @hidden */
  static isSpace(c: number): boolean {
    return c === 0x20 || c === 0x9;
  }

  /** @hidden */
  static isNewline(c: number): boolean {
    return c === 0xa || c === 0xd;
  }

  /** @hidden */
  static isWhitespace(c: number): boolean {
    return Recon.isSpace(c) || Recon.isNewline(c);
  }

  /** @hidden */
  static isIdentStartChar(c: number): boolean {
    return c >= 65/*'A'*/ && c <= 90/*'Z'*/
        || c === 95/*'_'*/
        || c >= 97/*'a'*/ && c <= 122/*'z'*/
        || c >= 0xc0 && c <= 0xd6
        || c >= 0xd8 && c <= 0xf6
        || c >= 0xf8 && c <= 0x2ff
        || c >= 0x370 && c <= 0x37d
        || c >= 0x37f && c <= 0x1fff
        || c >= 0x200c && c <= 0x200d
        || c >= 0x2070 && c <= 0x218f
        || c >= 0x2c00 && c <= 0x2fef
        || c >= 0x3001 && c <= 0xd7ff
        || c >= 0xf900 && c <= 0xfdcf
        || c >= 0xfdf0 && c <= 0xfffd
        || c >= 0x10000 && c <= 0xeffff;
  }

  /** @hidden */
  static isIdentChar(c: number): boolean {
    return c === 45/*'-'*/
        || c >= 48/*'0'*/ && c <= 57/*'9'*/
        || c >= 65/*'A'*/ && c <= 90/*'Z'*/
        || c === 95/*'_'*/
        || c >= 97/*'a'*/ && c <= 122/*'z'*/
        || c === 0xb7
        || c >= 0xc0 && c <= 0xd6
        || c >= 0xd8 && c <= 0xf6
        || c >= 0xf8 && c <= 0x37d
        || c >= 0x37f && c <= 0x1fff
        || c >= 0x200c && c <= 0x200d
        || c >= 0x203f && c <= 0x2040
        || c >= 0x2070 && c <= 0x218f
        || c >= 0x2c00 && c <= 0x2fef
        || c >= 0x3001 && c <= 0xd7ff
        || c >= 0xf900 && c <= 0xfdcf
        || c >= 0xfdf0 && c <= 0xfffd
        || c >= 0x10000 && c <= 0xeffff;
  }

  private static _structureParser: ReconParser<Item, Value>;
  private static _structureWriter: ReconWriter<Item, Value>;

  static structureParser(): ReconParser<Item, Value> {
    if (!Recon._structureParser) {
      Recon._structureParser = new ReconStructureParser();
    }
    return Recon._structureParser;
  }

  static structureWriter(): ReconWriter<Item, Value> {
    if (!Recon._structureWriter) {
      Recon._structureWriter = new ReconStructureWriter();
    }
    return Recon._structureWriter;
  }

  static parse(recon: string): Value {
    return Recon.structureParser().parseBlockString(recon);
  }

  static parser(): Parser<Value> {
    return Recon.structureParser().blockParser();
  }

  static sizeOf(item: Item): number {
    return Recon.structureWriter().sizeOfItem(item);
  }

  static sizeOfBlock(item: Item): number {
    return Recon.structureWriter().sizeOfBlockItem(item);
  }

  static write(item: Item, output: Output): Writer {
    return Recon.structureWriter().writeItem(item, output);
  }

  static writeBlock(item: Item, output: Output): Writer {
    return Recon.structureWriter().writeBlockItem(item, output);
  }

  static toString(item: Item): string {
    const output = Unicode.stringOutput();
    Recon.write(item, output);
    return output.bind();
  }

  static toBlockString(item: Item): string {
    const output = Unicode.stringOutput();
    Recon.writeBlock(item, output);
    return output.bind();
  }

  static toData(item: Item): Data {
    const output = Utf8.encodedOutput(Data.output());
    Recon.write(item, output);
    return output.bind();
  }

  static toBlockData(item: Item): Data {
    const output = Utf8.encodedOutput(Data.output());
    Recon.writeBlock(item, output);
    return output.bind();
  }
}

Item.prototype.toRecon = function (): string {
  return Recon.toString(this);
};

Item.prototype.toReconBlock = function (): string {
  return Recon.toBlockString(this);
};

Value.parseRecon = function (recon: string): Value {
  return Recon.parse(recon);
};
