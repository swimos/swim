// Copyright 2015-2020 Swim inc.
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

import {OutputSettings, OutputStyle, Unicode} from "@swim/codec";
import type {Spec} from "./Spec";
import type {Proof} from "./Proof";
import {Report} from "./Report";
import type {Exam} from "./Exam";

/**
 * Unit test `Report` that prints its results to the console.
 */
export class ConsoleReport extends Report {
  /** @hidden */
  outputSettings: OutputSettings;
  /** @hidden */
  testDepth: number;
  /** @hidden */
  passCount: number;
  /** @hidden */
  failCount: number;

  constructor(outputSettings?: OutputSettings) {
    super();
    if (outputSettings === void 0) {
      outputSettings = OutputSettings.styled();
    }
    this.outputSettings = outputSettings;
    this.testDepth = 0;
    this.passCount = 0;
    this.failCount = 0;
  }

  willRunSpec(spec: Spec): void {
    let output = Unicode.stringOutput(this.outputSettings);
    if (this.testDepth > 0) {
      OutputStyle.cyanBold(output);
      for (let i = 0; i < this.testDepth - 1; i += 1) {
        output = output.write(124/*'|'*/).write(32/*' '*/).write(32/*' '*/);
      }
      output = output.write(124/*'|'*/).write(45/*'-'*/).write(32/*' '*/);
      OutputStyle.reset(output);
    }
    OutputStyle.bold(output);
    output = output.write(spec.name);
    OutputStyle.reset(output);
    console.log(output.toString());

    this.testDepth += 1;
  }

  willRunTest(spec: Spec, exam: Exam): void {
    let output = Unicode.stringOutput(this.outputSettings);
    OutputStyle.cyanBold(output);
    for (let i = 0; i < this.testDepth - 1; i += 1) {
      output = output.write(124/*'|'*/).write(32/*' '*/).write(32/*' '*/);
    }
    output = output.write(124/*'|'*/).write(45/*'-'*/).write(32/*' '*/);
    OutputStyle.reset(output);
    output = output.write(exam.name);
    console.log(output.toString());
  }

  onProof(spec: Spec, exam: Exam, proof: Proof): void {
    if (proof.isValid()) {
      this.passCount += 1;
    } else {
      this.failCount += 1;
    }
    let output = Unicode.stringOutput(this.outputSettings);
    OutputStyle.cyanBold(output);
    for (let i = 0; i < this.testDepth; i += 1) {
      output = output.write(124/*'|'*/).write(32/*' '*/).write(32/*' '*/);
    }
    OutputStyle.reset(output);
    output.display(proof);
    console.log(output.toString());
  }

  onComment(spec: Spec, exam: Exam, message: string): void {
    let output = Unicode.stringOutput(this.outputSettings);
    OutputStyle.cyanBold(output);
    for (let i = 0; i < this.testDepth; i += 1) {
      output = output.write(124/*'|'*/).write(32/*' '*/).write(32/*' '*/);
    }
    OutputStyle.reset(output);
    OutputStyle.gray(output);
    output.display(message);
    OutputStyle.reset(output);
    console.log(output.toString());
  }

  didRunSpec(spec: Spec): void {
    this.testDepth -= 1;
    if (this.testDepth === 0) {
      let output = Unicode.stringOutput(this.outputSettings);
      if (this.failCount === 0) {
        OutputStyle.greenBold(output);
        output = output.write("success");
        OutputStyle.reset(output);
      } else {
        OutputStyle.redBold(output);
        output = output.write("failure");
        OutputStyle.reset(output);
      }
      output = output.write(58/*':'*/);
      if (this.passCount !== 0) {
        output = output.write(32/*' '*/);
        output = output.display(this.passCount);
        output = output.write(32/*' '*/);
        output = output.write(this.passCount !== 1 ? "exams" : "exam");
        output = output.write(32/*' '*/);
        if (this.failCount === 0) {
          OutputStyle.green(output);
        }
        output = output.write("passed");
        if (this.failCount === 0) {
          OutputStyle.reset(output);
        }
      }
      if (this.failCount !== 0) {
        if (this.passCount !== 0) {
          output = output.write(59/*';'*/);
        }
        output = output.write(32/*' '*/);
        output = output.display(this.failCount);
        output = output.write(32/*' '*/);
        output = output.write(this.failCount !== 1 ? "exams" : "exam");
        output = output.write(32/*' '*/);
        OutputStyle.red(output);
        output = output.write("failed");
        OutputStyle.reset(output);
      }
      console.log(output.toString());
    }
  }
}
