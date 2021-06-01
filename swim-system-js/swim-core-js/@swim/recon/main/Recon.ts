// Copyright 2015-2021 Swim inc.
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
import type {ReconParser} from "./parser/ReconParser";
import {ReconStructureParser} from "./"; // forward import
import type {ReconWriter} from "./writer/ReconWriter";
import {ReconStructureWriter} from "./"; // forward import

/**
 * Factory for constructing Recon parsers and writers.
 */
export const Recon = {} as {
  structureParser(): ReconParser<Item, Value>;

  structureWriter(): ReconWriter<Item, Value>;

  parse(recon: string): Value;

  parser(): Parser<Value>;

  sizeOf(item: Item): number;

  sizeOfBlock(item: Item): number;

  write(item: Item, output: Output): Writer;

  writeBlock(item: Item, output: Output): Writer;

  toString(item: Item): string;

  toBlockString(item: Item): string;

  toData(item: Item): Data;

  toBlockData(item: Item): Data;

  /** @hidden */
  isSpace(c: number): boolean;

  /** @hidden */
  isNewline(c: number): boolean;

  /** @hidden */
  isWhitespace(c: number): boolean;

  /** @hidden */
  isIdentStartChar(c: number): boolean;

  /** @hidden */
  isIdentChar(c: number): boolean;
};

Object.defineProperty(Recon, "structureParser", {
  value: function (): ReconStructureParser {
    const structureParser = new ReconStructureParser();
    Object.defineProperty(Recon, "structureParser", {
      value: function(): ReconStructureParser {
        return structureParser;
      },
      enumerable: true,
      configurable: true,
    });
    return structureParser;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(Recon, "structureWriter", {
  value: function(): ReconStructureWriter {
    const structureWriter = new ReconStructureWriter();
    Object.defineProperty(Recon, "structureWriter", {
      value: function (): ReconStructureWriter {
        return structureWriter;
      },
      enumerable: true,
      configurable: true,
    });
    return structureWriter;
  },
  enumerable: true,
  configurable: true,
});

Recon.parse = function (recon: string): Value {
  return Recon.structureParser().parseBlockString(recon);
};

Recon.parser = function (): Parser<Value> {
  return Recon.structureParser().blockParser();
};

Recon.sizeOf = function (item: Item): number {
  return Recon.structureWriter().sizeOfItem(item);
};

Recon.sizeOfBlock = function (item: Item): number {
  return Recon.structureWriter().sizeOfBlockItem(item);
};

Recon.write = function (item: Item, output: Output): Writer {
  return Recon.structureWriter().writeItem(item, output);
};

Recon.writeBlock = function (item: Item, output: Output): Writer {
  return Recon.structureWriter().writeBlockItem(item, output);
};

Recon.toString = function (item: Item): string {
  const output = Unicode.stringOutput();
  Recon.write(item, output);
  return output.bind();
};

Recon.toBlockString = function (item: Item): string {
  const output = Unicode.stringOutput();
  Recon.writeBlock(item, output);
  return output.bind();
};

Recon.toData = function (item: Item): Data {
  const output = Utf8.encodedOutput(Data.output());
  Recon.write(item, output);
  return output.bind();
};

Recon.toBlockData = function (item: Item): Data {
  const output = Utf8.encodedOutput(Data.output());
  Recon.writeBlock(item, output);
  return output.bind();
};

Recon.isSpace = function (c: number): boolean {
  return c === 0x20 || c === 0x9;
};

Recon.isNewline = function (c: number): boolean {
  return c === 0xa || c === 0xd;
};

Recon.isWhitespace = function (c: number): boolean {
  return Recon.isSpace(c) || Recon.isNewline(c);
};

Recon.isIdentStartChar = function (c: number): boolean {
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
};

Recon.isIdentChar = function (c: number): boolean {
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
};

Item.prototype.toRecon = function (this: Item): string {
  return Recon.toString(this);
};

Item.prototype.toReconBlock = function (this: Item): string {
  return Recon.toBlockString(this);
};

Value.parseRecon = function (recon: string): Value {
  return Recon.parse(recon);
};
