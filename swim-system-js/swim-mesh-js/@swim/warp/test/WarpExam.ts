// Copyright 2015-2019 SWIM.AI inc.
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

import {Unicode} from "@swim/codec";
import {TestException, TestOptions, Spec, Proof, Report, ExamStatus, Exam} from "@swim/unit";
import {Envelope} from "@swim/warp";

export class WarpExam extends Exam {
  constructor(report: Report, spec: Spec, name: string,
              options: TestOptions, status?: ExamStatus) {
    super(report, spec, name, options, status);
  }

  parses(recon: string, envelope: Envelope): void {
    const actual = Envelope.parseRecon(recon);
    if (envelope.equals(actual)) {
      this.proove(Proof.valid("parses"));
    } else {
      const message = Unicode.stringOutput();
      message.write("when parsing ").debug(recon);
      this.proove(Proof.refuted(actual, "equals", envelope, message.bind()));
      throw new TestException(message.bind());
    }
  }

  writes(envelope: Envelope, recon: string): void {
    const actual = envelope.toRecon();
    if (actual === recon) {
      this.proove(Proof.valid("writes"));
    } else {
      const message = Unicode.stringOutput();
      message.write("when writing ").debug(envelope);
      this.proove(Proof.refuted(actual, "equals", recon, message.bind()));
    }
  }
}
