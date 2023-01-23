// Copyright 2015-2023 Swim.inc
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
import type {Item} from "@swim/structure";
import {Recon} from "@swim/recon";
import {Converter} from "./Converter";

/** @public */
export class ReconConverter extends Converter {
  override convert<O>(output: Output<O>, model: Item): O {
    const writer = Recon.writeBlock(output, model);
    if (writer.isError()) {
      output = Output.error(writer.trap());
    }
    return output.bind();
  }
}
