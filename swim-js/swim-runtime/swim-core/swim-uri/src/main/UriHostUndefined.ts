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

import type {Output} from "@swim/codec";
import {UriHost} from "./UriHost";

/** @internal */
export class UriHostUndefined extends UriHost {
  /** @internal */
  constructor() {
    super();
  }

  override isDefined(): boolean {
    return false;
  }

  override get address(): string {
    return "";
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("UriHost").write(46/*'.'*/).write("undefined")
                   .write(40/*'('*/).write(41/*')'*/);
    return output;
  }

  override display<T>(output: Output<T>): Output<T> {
    return output; // blank
  }

  override toString(): string {
    return "";
  }
}
