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

import {Comparable, HashCode, Murmur3, HashGenCacheMap} from "@swim/util";
import {Output, Format, Debug, Display} from "@swim/codec";
import {Uri} from "./Uri";

export type AnyUriFragment = UriFragment | string;

export class UriFragment implements Comparable<UriFragment>, HashCode, Debug, Display {
  /** @hidden */
  readonly _identifier: string | null;
  /** @hidden */
  _string?: string;

  /** @hidden */
  constructor(identifier: string | null) {
    this._identifier = identifier;
  }

  isDefined(): boolean {
    return this._identifier !== null;
  }

  identifier(): string | null {
    return this._identifier;
  }

  toAny(): string | undefined {
    return this._identifier !== null ? this._identifier : void 0;
  }

  compareTo(that: UriFragment): 0 | 1 | -1 {
    const order = this.toString().localeCompare(that.toString());
    return order < 0 ? -1 : order > 0 ? 1 : 0;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UriFragment) {
      return this._identifier === that._identifier;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.hash(this._identifier);
  }

  debug(output: Output): void {
    output = output.write("UriFragment").write(46/*'.'*/);
    if (this.isDefined()) {
      output = output.write("parse").write(40/*'('*/).write(34/*'"'*/).display(this).write(34/*'"'*/).write(41/*')'*/);
    } else {
      output = output.write("undefined").write(40/*'('*/).write(41/*')'*/);
    }
  }

  display(output: Output): void {
    if (this._string !== void 0) {
      output = output.write(this._string);
    } else if (this._identifier !== null) {
      Uri.writeFragment(this._identifier, output);
    }
  }

  toString(): string {
    if (this._string == null) {
      this._string = Format.display(this);
    }
    return this._string;
  }

  private static _undefined?: UriFragment;

  private static _cache?: HashGenCacheMap<string, UriFragment>;

  static undefined(): UriFragment {
    if (UriFragment._undefined === void 0) {
      UriFragment._undefined = new UriFragment(null);
    }
    return UriFragment._undefined;
  }

  static from(identifier: string | null): UriFragment {
    if (identifier !== null) {
      const cache = UriFragment.cache();
      const fragment = cache.get(identifier);
      if (fragment) {
        return fragment;
      } else {
        return cache.put(identifier, new UriFragment(identifier));
      }
    } else {
      return UriFragment.undefined();
    }
  }

  static fromAny(fragment: AnyUriFragment | null | undefined): UriFragment {
    if (fragment === null || fragment === void 0) {
      return UriFragment.undefined();
    } else if (fragment instanceof UriFragment) {
      return fragment;
    } else if (typeof fragment === "string") {
      return UriFragment.parse(fragment);
    } else {
      throw new TypeError("" + fragment);
    }
  }

  static parse(string: string): UriFragment {
    return Uri.standardParser().parseFragmentString(string);
  }

  /** @hidden */
  static cache(): HashGenCacheMap<string, UriFragment> {
    if (UriFragment._cache === void 0) {
      const cacheSize = 32;
      UriFragment._cache = new HashGenCacheMap<string, UriFragment>(cacheSize);
    }
    return UriFragment._cache;
  }
}
Uri.Fragment = UriFragment;
