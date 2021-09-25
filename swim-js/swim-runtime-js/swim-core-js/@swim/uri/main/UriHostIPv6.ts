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

import type {Output} from "@swim/codec";
import {Uri} from "./Uri";
import {UriHost} from "./UriHost";

/** @hidden */
export class UriHostIPv6 extends UriHost {
  /** @hidden */
  constructor(address: string) {
    super();
    this.address = address;
  }

  override readonly address: string;

  override get ipv6(): string {
    return this.address;
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("UriHost").write(46/*'.'*/).write("ipv6")
                   .write(40/*'('*/).debug(this.address).write(41/*')'*/);
    return output;
  }

  override display<T>(output: Output<T>): Output<T> {
    output = output.write(91/*'['*/);
    output = Uri.writeHostLiteral(output, this.address);
    output = output.write(93/*']'*/);
    return output;
  }

  override toString(): string {
    return "[" + this.address + "]";
  }
}
