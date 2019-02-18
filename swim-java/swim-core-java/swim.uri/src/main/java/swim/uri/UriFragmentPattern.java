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

package swim.uri;

import swim.collections.HashTrieMap;

abstract class UriFragmentPattern extends UriQueryPattern {
  abstract HashTrieMap<String, String> unapply(UriFragment fragment, HashTrieMap<String, String> args);

  @Override
  HashTrieMap<String, String> unapply(UriQuery query, UriFragment fragment, HashTrieMap<String, String> args) {
    return unapply(fragment, args);
  }

  abstract boolean matches(UriFragment fragment);

  @Override
  boolean matches(UriQuery query, UriFragment fragment) {
    if (!query.isDefined()) {
      return matches(fragment);
    } else {
      return false;
    }
  }

  static UriFragmentPattern compile(Uri pattern, UriFragment fragment) {
    if (fragment.isDefined()) {
      return new UriFragmentLiteral(fragment, UriTerminalPattern.compile(pattern));
    } else {
      return UriTerminalPattern.compile(pattern);
    }
  }
}
