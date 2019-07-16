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

abstract class UriQueryPattern extends UriPathPattern {
  abstract HashTrieMap<String, String> unapply(UriQuery query, UriFragment fragment,
                                               HashTrieMap<String, String> args);

  @Override
  HashTrieMap<String, String> unapply(UriPath path, UriQuery query, UriFragment fragment,
                                      HashTrieMap<String, String> args) {
    return unapply(query, fragment, args);
  }

  abstract boolean matches(UriQuery query, UriFragment fragment);

  @Override
  boolean matches(UriPath path, UriQuery query, UriFragment fragment) {
    if (path.isEmpty()) {
      return matches(query, fragment);
    } else {
      return false;
    }
  }

  static UriQueryPattern compile(Uri pattern, UriQuery query, UriFragment fragment) {
    if (query.isDefined()) {
      return new UriQueryLiteral(query, UriFragmentPattern.compile(pattern, fragment));
    } else {
      return UriFragmentPattern.compile(pattern, fragment);
    }
  }
}
