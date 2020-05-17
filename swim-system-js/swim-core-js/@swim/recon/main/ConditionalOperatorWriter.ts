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

import {Output, WriterException, Writer} from "@swim/codec";
import {ReconWriter} from "./ReconWriter";

/** @hidden */
export class ConditionalOperatorWriter<I, V> extends Writer {
  private readonly _recon: ReconWriter<I, V>;
  private readonly _ifTerm: I;
  private readonly _thenTerm: I;
  private readonly _elseTerm: I;
  private readonly _precedence: number;
  private readonly _part: Writer | undefined;
  private readonly _step: number | undefined;

  constructor(recon: ReconWriter<I, V>, ifTerm: I, thenTerm: I, elseTerm: I,
              precedence: number, part?: Writer, step?: number) {
    super();
    this._recon = recon;
    this._ifTerm = ifTerm;
    this._thenTerm = thenTerm;
    this._elseTerm = elseTerm;
    this._precedence = precedence;
    this._part = part;
    this._step = step;
  }

  pull(output: Output): Writer {
    return ConditionalOperatorWriter.write(output, this._recon, this._ifTerm, this._thenTerm,
                                           this._elseTerm, this._precedence, this._part, this._step);
  }

  static sizeOf<I, V>(recon: ReconWriter<I, V>, ifTerm: I, thenTerm: I,
                      elseTerm: I, precedence: number): number {
    let size = 0;
    if (recon.precedence(ifTerm) > 0 && recon.precedence(ifTerm) <= precedence) {
      size += 1; // '('
      size += recon.sizeOfItem(ifTerm);
      size += 1; // ')'
    } else {
      size += recon.sizeOfItem(ifTerm);
    }
    size += 3; // " ? "
    size += recon.sizeOfItem(thenTerm);
    size += 3; // " : "
    size += recon.sizeOfItem(elseTerm);
    return size;
  }

  static write<I, V>(output: Output, recon: ReconWriter<I, V>, ifTerm: I, thenTerm: I, elseTerm: I,
                     precedence: number, part?: Writer, step: number = 1): Writer {
    if (step === 1) {
      if (recon.precedence(ifTerm) > 0 && recon.precedence(ifTerm) <= precedence) {
        if (output.isCont()) {
          output = output.write(40/*'('*/);
          step = 2;
        }
      } else {
        step = 2;
      }
    }
    if (step === 2) {
      if (part === void 0) {
        part = recon.writeItem(ifTerm, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = void 0;
        step = 3;
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step === 3) {
      if (recon.precedence(ifTerm) > 0 && recon.precedence(ifTerm) <= precedence) {
        if (output.isCont()) {
          output = output.write(41/*')'*/);
          step = 4;
        }
      } else {
        step = 4;
      }
    }
    if (step === 4 && output.isCont()) {
      output = output.write(32/*' '*/);
      step = 5;
    }
    if (step === 5 && output.isCont()) {
      output = output.write(63/*'?'*/);
      step = 6;
    }
    if (step === 6 && output.isCont()) {
      output = output.write(32/*' '*/);
      step = 7;
    }
    if (step === 7) {
      if (part === void 0) {
        part = recon.writeItem(thenTerm, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = void 0;
        step = 8;
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step === 8 && output.isCont()) {
      output = output.write(32/*' '*/);
      step = 9;
    }
    if (step === 9 && output.isCont()) {
      output = output.write(58/*':'*/);
      step = 10;
    }
    if (step === 10 && output.isCont()) {
      output = output.write(32/*' '*/);
      step = 11;
    }
    if (step === 11) {
      if (part === void 0) {
        part = recon.writeItem(elseTerm, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        return Writer.done();
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new ConditionalOperatorWriter<I, V>(recon, ifTerm, thenTerm, elseTerm,
                                               precedence, part, step);
  }
}
