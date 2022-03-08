// Copyright 2015-2022 Swim.inc
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

import type {Item} from "@swim/structure";
import {Processor} from "@swim/macro";

export class TestProcessor extends Processor {
  constructor() {
    super();
    this.inputs = {};
    this.outputs = {};
  }

  readonly inputs: {readonly [path: string]: Item | undefined};

  getInput(path: string): Item | null {
    const input = this.inputs[path];
    return input !== void 0 ? input : null;
  }

  addInput(path: string, input: Item): void {
    const inputs = this.inputs as {[path: string]: Item | undefined};
    inputs[path] = input;
  }

  removeInput(path: string): void {
    const inputs = this.inputs as {[path: string]: Item | undefined};
    delete inputs[path];
  }

  override includeFile(path: string, type?: string): Item {
    const input = this.getInput(path);
    if (input !== null) {
      return input;
    } else {
      return super.includeFile(path, type);
    }
  }

  readonly outputs: {readonly [path: string]: string | undefined};

  getOutput(path: string): string | null {
    const output = this.outputs[path];
    return output !== void 0 ? output : null;
  }

  addOutput(path: string, output: string): void {
    const outputs = this.outputs as {[path: string]: string | undefined};
    outputs[path] = output;
  }

  removeOutput(path: string): void {
    const outputs = this.outputs as {[path: string]: string | undefined};
    delete outputs[path];
  }

  override exportFile(path: string, output: string): void {
    this.addOutput(path, output);
  }
}
