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
import {Spec} from "./Spec";
import {Proof} from "./Proof";
import {Exam} from "./Exam";
import {Report} from "./Report";

/**
 * Unit test `Report` that prints its results to the console.
 */
export class ConsoleReport extends Report {
  /** @hidden */
  _outputSettings: OutputSettings;
  /** @hidden */
  _testDepth: number;
  /** @hidden */
  _passCount: number;
  /** @hidden */
  _failCount: number;

  constructor(outputSettings?: OutputSettings) {
    super();
    if (outputSettings === void 0) {
      outputSettings = OutputSettings.styled();
    }
    this._outputSettings = outputSettings;
    this._testDepth = 0;
    this._passCount = 0;
    this._failCount = 0;
  }

  willRunSpec(spec: Spec): void {
    let output = Unicode.stringOutput(this._outputSettings);
    if (this._testDepth > 0) {
      OutputStyle.cyanBold(output);
      for (let i = 0; i < this._testDepth - 1; i += 1) {
        output = output.write(124/*'|'*/).write(32/*' '*/).write(32/*' '*/);
      }
      output = output.write(124/*'|'*/).write(45/*'-'*/).write(32/*' '*/);
      OutputStyle.reset(output);
    }
    OutputStyle.bold(output);
    output = output.write(spec.name());
    OutputStyle.reset(output);
    console.log(output.toString());

    this._testDepth += 1;
  }

  willRunTest(spec: Spec, exam: Exam): void {
    let output = Unicode.stringOutput(this._outputSettings);
    OutputStyle.cyanBold(output);
    for (let i = 0; i < this._testDepth - 1; i += 1) {
      output = output.write(124/*'|'*/).write(32/*' '*/).write(32/*' '*/);
    }
    output = output.write(124/*'|'*/).write(45/*'-'*/).write(32/*' '*/);
    OutputStyle.reset(output);
    output = output.write(exam.name());
    console.log(output.toString());
  }

  onProof(spec: Spec, exam: Exam, proof: Proof): void {
    if (proof.isValid()) {
      this._passCount += 1;
    } else {
      this._failCount += 1;
    }
    let output = Unicode.stringOutput(this._outputSettings);
    OutputStyle.cyanBold(output);
    for (let i = 0; i < this._testDepth; i += 1) {
      output = output.write(124/*'|'*/).write(32/*' '*/).write(32/*' '*/);
    }
    OutputStyle.reset(output);
    output.display(proof);
    console.log(output.toString());
  }

  onComment(spec: Spec, exam: Exam, message: string): void {
    let output = Unicode.stringOutput(this._outputSettings);
    OutputStyle.cyanBold(output);
    for (let i = 0; i < this._testDepth; i += 1) {
      output = output.write(124/*'|'*/).write(32/*' '*/).write(32/*' '*/);
    }
    OutputStyle.reset(output);
    OutputStyle.gray(output);
    output.display(message);
    OutputStyle.reset(output);
    console.log(output.toString());
  }

  didRunSpec(spec: Spec): void {
    this._testDepth -= 1;
    if (this._testDepth === 0) {
      let output = Unicode.stringOutput(this._outputSettings);
      if (this._failCount === 0) {
        OutputStyle.greenBold(output);
        output = output.write("success");
        OutputStyle.reset(output);
      } else {
        OutputStyle.redBold(output);
        output = output.write("failure");
        OutputStyle.reset(output);
      }
      output = output.write(58/*':'*/);
      if (this._passCount !== 0) {
        output = output.write(32/*' '*/);
        output = output.display(this._passCount);
        output = output.write(32/*' '*/);
        output = output.write(this._passCount !== 1 ? "exams" : "exam");
        output = output.write(32/*' '*/);
        if (this._failCount === 0) {
          OutputStyle.green(output);
        }
        output = output.write("passed");
        if (this._failCount === 0) {
          OutputStyle.reset(output);
        }
      }
      if (this._failCount !== 0) {
        if (this._passCount !== 0) {
          output = output.write(59/*';'*/);
        }
        output = output.write(32/*' '*/);
        output = output.display(this._failCount);
        output = output.write(32/*' '*/);
        output = output.write(this._failCount !== 1 ? "exams" : "exam");
        output = output.write(32/*' '*/);
        OutputStyle.red(output);
        output = output.write("failed");
        OutputStyle.reset(output);
      }
      console.log(output.toString());
    }
  }
}
