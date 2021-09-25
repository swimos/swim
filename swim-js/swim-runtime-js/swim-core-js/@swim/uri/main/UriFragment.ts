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

import {Lazy, HashCode, Compare, Mutable, Strings, HashGenCacheMap} from "@swim/util";
import {Output, Format, Debug, Display} from "@swim/codec";
import {Uri} from "./Uri";

export type AnyUriFragment = UriFragment | string;

export class UriFragment implements HashCode, Compare, Debug, Display {
  /** @hidden */
  constructor(identifier: string | undefined) {
    this.identifier = identifier;
    this.stringValue = void 0;
  }

  isDefined(): boolean {
    return this.identifier !== void 0;
  }

  readonly identifier: string | undefined;

  toAny(): string | undefined {
    return this.identifier;
  }

  compareTo(that: UriFragment): number {
    if (that instanceof UriFragment) {
      return this.toString().localeCompare(that.toString());
    }
    return NaN;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UriFragment) {
      return this.identifier === that.identifier;
    }
    return false;
  }

  hashCode(): number {
    return Strings.hash(this.identifier);
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("UriFragment").write(46/*'.'*/);
    if (this.isDefined()) {
      output = output.write("parse").write(40/*'('*/).write(34/*'"'*/)
                     .display(this).write(34/*'"'*/).write(41/*')'*/);
    } else {
      output = output.write("undefined").write(40/*'('*/).write(41/*')'*/);
    }
    return output;
  }

  display<T>(output: Output<T>): Output<T> {
    const stringValue = this.stringValue
    if (stringValue !== void 0) {
      output = output.write(stringValue);
    } else if (this.identifier !== void 0) {
      output = Uri.writeFragment(output, this.identifier);
    }
    return output;
  }

  /** @hidden */
  readonly stringValue: string | undefined;

  toString(): string {
    let stringValue = this.stringValue;
    if (stringValue === void 0) {
      stringValue = Format.display(this);
      (this as Mutable<this>).stringValue = stringValue;
    }
    return stringValue;
  }

  @Lazy
  static undefined(): UriFragment {
    return new UriFragment(void 0);
  }

  static create(identifier: string | undefined): UriFragment {
    if (identifier !== void 0) {
      const cache = UriFragment.cache;
      const fragment = cache.get(identifier);
      if (fragment !== void 0) {
        return fragment;
      } else {
        return cache.put(identifier, new UriFragment(identifier));
      }
    } else {
      return UriFragment.undefined();
    }
  }

  static fromAny(value: AnyUriFragment | null | undefined): UriFragment {
    if (value === void 0 || value === null) {
      return UriFragment.undefined();
    } else if (value instanceof UriFragment) {
      return value;
    } else if (typeof value === "string") {
      return UriFragment.parse(value);
    } else {
      throw new TypeError("" + value);
    }
  }

  static parse(fragmentPart: string): UriFragment {
    return Uri.standardParser.parseFragmentString(fragmentPart);
  }

  /** @hidden */
  @Lazy
  static get cache(): HashGenCacheMap<string, UriFragment> {
    const cacheSize = 32;
    return new HashGenCacheMap<string, UriFragment>(cacheSize);
  }
}
