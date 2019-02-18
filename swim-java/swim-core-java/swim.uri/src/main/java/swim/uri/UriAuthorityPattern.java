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

abstract class UriAuthorityPattern extends UriSchemePattern {
  abstract HashTrieMap<String, String> unapply(UriAuthority authority, UriPath path,
                                               UriQuery query, UriFragment fragment,
                                               HashTrieMap<String, String> args);

  @Override
  HashTrieMap<String, String> unapply(UriScheme scheme, UriAuthority authority,
                                      UriPath path, UriQuery query, UriFragment fragment,
                                      HashTrieMap<String, String> args) {
    return unapply(authority, path, query, fragment, args);
  }

  abstract boolean matches(UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment);

  @Override
  boolean matches(UriScheme scheme, UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment) {
    if (!scheme.isDefined()) {
      return matches(authority, path, query, fragment);
    } else {
      return false;
    }
  }

  static UriAuthorityPattern compile(Uri pattern, UriAuthority authority, UriPath path,
                                     UriQuery query, UriFragment fragment) {
    if (authority.isDefined()) {
      return new UriAuthorityLiteral(authority, UriPathPattern.compile(pattern, path, query, fragment));
    } else {
      return UriPathPattern.compile(pattern, path, query, fragment);
    }
  }
}
