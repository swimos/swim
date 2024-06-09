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

import {Output} from "@swim/codec";
import type {Parser} from "@swim/codec";
import type {Writer} from "@swim/codec";
import {Unicode} from "@swim/codec";
import {Utf8} from "@swim/codec";
import {Item} from "@swim/structure";
import {Value} from "@swim/structure";
import {Data} from "@swim/structure";
import type {ReconParser} from "./parser/ReconParser";
import {ReconStructureParser} from "./"; // forward import
import type {ReconWriter} from "./writer/ReconWriter";
import {ReconStructureWriter} from "./"; // forward import

/**
 * Factory for constructing Recon parsers and writers.
 * @public
 */
export const Recon = (function () {
  const Recon = {} as {
    structureParser(): ReconParser<Item, Value>;

    structureWriter(): ReconWriter<Item, Value>;

    parse(recon: string): Value;

    parser(): Parser<Value>;

    sizeOf(item: Item): number;

    sizeOfBlock(item: Item): number;

    write(output: Output, item: Item): Writer;

    writeBlock(output: Output, item: Item): Writer;

    toString(item: Item): string;

    toBlockString(item: Item): string;

    toData(item: Item): Data;

    toBlockData(item: Item): Data;

    /** @internal */
    isSpace(c: number): boolean;

    /** @internal */
    isNewline(c: number): boolean;

    /** @internal */
    isWhitespace(c: number): boolean;

    /** @internal */
    isIdentStartChar(c: number): boolean;

    /** @internal */
    isIdentChar(c: number): boolean;
  };

  Object.defineProperty(Recon, "structureParser", {
    value: function (): ReconStructureParser {
      const structureParser = new ReconStructureParser();
      Object.defineProperty(Recon, "structureParser", {
        value: function (): ReconStructureParser {
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
    value: function (): ReconStructureWriter {
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

  Recon.write = function (output: Output, item: Item): Writer {
    return Recon.structureWriter().writeItem(output, item);
  };

  Recon.writeBlock = function (output: Output, item: Item): Writer {
    return Recon.structureWriter().writeBlockItem(output, item);
  };

  Recon.toString = function (item: Item): string {
    let output = Unicode.stringOutput();
    const writer = Recon.write(output, item);
    if (!writer.isDone()) {
      output = Output.error(writer.trap());
    }
    return output.bind();
  };

  Recon.toBlockString = function (item: Item): string {
    let output = Unicode.stringOutput();
    const writer = Recon.writeBlock(output, item);
    if (!writer.isDone()) {
      output = Output.error(writer.trap());
    }
    return output.bind();
  };

  Recon.toData = function (item: Item): Data {
    let output = Utf8.encodedOutput(Data.output());
    const writer = Recon.write(output, item);
    if (!writer.isDone()) {
      output = Output.error(writer.trap());
    }
    return output.bind();
  };

  Recon.toBlockData = function (item: Item): Data {
    let output = Utf8.encodedOutput(Data.output());
    const writer = Recon.writeBlock(output, item);
    if (!writer.isDone()) {
      output = Output.error(writer.trap());
    }
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

  return Recon;
})();

Value.parseRecon = function (recon: string): Value {
  return Recon.parse(recon);
};
