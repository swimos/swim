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

import {Arrays, Values} from "@swim/util";
import {Input, ParserException, Parser, Unicode, Utf8, Binary} from "@swim/codec";
import {TestException, TestOptions, Spec, Proof, Report, Exam} from "@swim/unit";
import {Item, Value} from "@swim/structure";
import {Recon} from "@swim/recon";

export class ReconExam extends Exam {
  constructor(report: Report, spec: Spec, name: string, options: TestOptions) {
    super(report, spec, name, options);
  }

  parsed<O>(actual: O, expected: O, a: string, b: string, part: number): void {
    if (!Values.equal(actual, expected)) {
      const message = Unicode.stringOutput();
      message.write("when parsing part ").debug(part)
          .write(" of ").debug(a).write(", ").debug(b);
      this.proove(Proof.refuted(actual, "parsed", expected, message.bind()));
      throw new TestException(message.bind());
    }
  }

  parseFailed(cause: Error, a: string, b: string, part: number): void {
    const message = Unicode.stringOutput();
    message.write("failed to parse part ").debug(part)
        .write(" of ").debug(a).write(", ").debug(b).write(": ").write(cause.toString());
    this.proove(Proof.error(cause, message.bind()));
    throw new TestException(message.bind());
  }

  parses(actual: string, expected: Value): void;
  parses<O>(iteratee: Parser<O>, input: string, expected: O): void;
  parses<O>(iteratee: Parser<O> | string, input: string | Value, expected?: O): void {
    if (arguments.length === 2) {
      const actual = iteratee as string;
      const expected = input as Value;
      this.parses(Recon.structureParser().blockParser(), actual, expected);
      this.parses(Recon.structureParser().blockParser(), " " + actual + " ", expected);
    } else {
      for (let i = 0, n = input.length; i <= n; i += 1) {
        const a = (input as string).substring(0, i);
        const b = (input as string).substring(i, n);

        let parser = (iteratee as Parser<O>).feed(Unicode.stringInput(a).asPart(true));
        if (parser.isDone()) {
          this.parsed(parser.bind(), expected, a, b, 0);
        } else if (parser.isError()) {
          this.parseFailed(parser.trap(), a, b, 0);
        }

        parser = parser.feed(Unicode.stringInput(b).asPart(true));
        if (parser.isDone()) {
          this.parsed(parser.bind(), expected, a, b, 1);
        } else if (parser.isError()) {
          this.parseFailed(parser.trap(), a, b, 1);
        }

        parser = parser.feed(Input.done());
        if (parser.isDone()) {
          this.parsed(parser.bind(), expected, a, b, 2);
        } else if (parser.isError()) {
          this.parseFailed(parser.trap(), a, b, 2);
        } else {
          const message = Unicode.stringOutput();
          message.write("failed to completely parse ").debug(a).write(", ").debug(b);
          this.proove(Proof.invalid("parses", message.bind()));
          throw new TestException(message.bind());
        }
      }
      this.proove(Proof.valid("parses"));
    }
  }

  parseFails(recon: string): void {
    this.throws(function () {
      Value.parseRecon(recon);
    }, ParserException);
  }

  writes(item: Item, expected: Uint8Array | string): void {
    if (typeof expected === "string") {
      const output = Utf8.encodedOutput(Binary.output());
      Unicode.writeString(output, expected);
      expected = output.bind();
    }
    const size = Recon.structureWriter().sizeOfItem(item);
    const n = expected.length;
    if (size !== n) {
      this.fail("expected " + n + " bytes, but found " + size + " bytes: " + Recon.toString(item));
    }
    for (let i = 0; i <= n; i += 1) {
      const actual = new Uint8Array(n);
      let buffer = Binary.outputBuffer(actual);
      buffer = buffer.withLimit(i);
      let writer = Recon.write(Utf8.decodedOutput(buffer).asPart(true), item);
      buffer = buffer.withLimit(buffer.capacity);
      writer = writer.pull(Utf8.decodedOutput(buffer).asPart(false));
      if (writer.isDone()) {
        if (!Arrays.equal(actual, expected)) {
          this.proove(Proof.refuted(actual, "writes", expected));
          throw new TestException();
        }
      } else if (writer.isError()) {
        this.proove(Proof.error(writer.trap()));
        throw new TestException();
      } else {
        this.proove(Proof.invalid("writes"));
        throw new TestException();
      }
    }
    this.proove(Proof.valid("writes"));
  }

  writesBlock(item: Item, expected: Uint8Array | string): void {
    if (typeof expected === "string") {
      const output = Utf8.encodedOutput(Binary.output());
      Unicode.writeString(output, expected);
      expected = output.bind();
    }
    const size = Recon.structureWriter().sizeOfBlockItem(item);
    const n = expected.length;
    if (size !== n) {
      this.fail("expected " + n + " bytes, but found " + size + " bytes: " + Recon.toBlockString(item));
    }
    for (let i = 0; i <= n; i += 1) {
      const actual = new Uint8Array(n);
      let buffer = Binary.outputBuffer(actual);
      buffer = buffer.withLimit(i);
      let writer = Recon.writeBlock(Utf8.decodedOutput(buffer).asPart(true), item);
      buffer = buffer.withLimit(buffer.capacity);
      writer = writer.pull(Utf8.decodedOutput(buffer).asPart(false));
      if (writer.isDone()) {
        if (!Arrays.equal(actual, expected)) {
          this.proove(Proof.refuted(actual, "writes", expected));
          throw new TestException();
        }
      } else if (writer.isError()) {
        this.proove(Proof.error(writer.trap()));
      } else {
        this.proove(Proof.invalid("writes"));
        throw new TestException();
      }
    }
    this.proove(Proof.valid("writes"));
  }
}
