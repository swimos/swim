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

declare global {
  interface String {
    codePointAt(index: number): number | undefined;
    offsetByCodePoints(index: number, count: number): number;
  }
}

import "./String";

export {Comparable} from "./Comparable";
export {Equals} from "./Equals";
export {HashCode} from "./HashCode";

export {ByteOrder, NativeOrder} from "./ByteOrder";

export {Random} from "./Random";

export {Murmur3} from "./Murmur3";

export {Objects} from "./Objects";

export {FromAny, ToAny} from "./Any";

export {Iterator} from "./Iterator";
export {Cursor} from "./Cursor";
export {CursorEmpty} from "./CursorEmpty";
export {CursorUnary} from "./CursorUnary";
export {CursorArray} from "./CursorArray";

export {Builder} from "./Builder";
export {PairBuilder} from "./PairBuilder";

export {Map} from "./Map";
export {OrderedMap} from "./OrderedMap";
export {ReducedMap} from "./ReducedMap";

export {AssertException} from "./AssertException";
export {Assert, assert} from "./Assert";

export {Severity} from "./Severity";

export {HashGenCacheMap} from "./HashGenCacheMap";
export {HashGenCacheSet} from "./HashGenCacheSet";
