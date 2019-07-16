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

abstract class UriTerminalPattern extends UriFragmentPattern {
  abstract HashTrieMap<String, String> unapply(HashTrieMap<String, String> args);

  @Override
  HashTrieMap<String, String> unapply(UriFragment fragment, HashTrieMap<String, String> args) {
    return unapply(args);
  }

  abstract boolean matches();

  @Override
  boolean matches(UriFragment fragment) {
    if (!fragment.isDefined()) {
      return matches();
    } else {
      return false;
    }
  }

  static UriTerminalPattern compile(Uri pattern) {
    return new UriConstantPattern(pattern);
  }
}
