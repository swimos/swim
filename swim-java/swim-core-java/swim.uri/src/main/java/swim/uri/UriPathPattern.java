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

abstract class UriPathPattern extends UriAuthorityPattern {
  Uri apply(UriScheme scheme, UriAuthority authority, UriPathBuilder path, String[] args, int index) {
    return apply(scheme, authority, path.bind(), args, index);
  }

  @Override
  Uri apply(UriScheme scheme, UriAuthority authority, String[] args, int index) {
    return apply(scheme, authority, new UriPathBuilder(), args, index);
  }

  abstract HashTrieMap<String, String> unapply(UriPath path, UriQuery query, UriFragment fragment,
                                               HashTrieMap<String, String> args);

  @Override
  HashTrieMap<String, String> unapply(UriAuthority authority, UriPath path, UriQuery query,
                                      UriFragment fragment, HashTrieMap<String, String> args) {
    return unapply(path, query, fragment, args);
  }

  abstract boolean matches(UriPath path, UriQuery query, UriFragment fragment);

  @Override
  boolean matches(UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment) {
    if (!authority.isDefined()) {
      return matches(path, query, fragment);
    } else {
      return false;
    }
  }

  static UriPathPattern compile(Uri pattern, UriPath path, UriQuery query, UriFragment fragment) {
    if (!path.isEmpty()) {
      final String component = path.head();
      if (!component.isEmpty() && component.charAt(0) == ':') {
        return new UriPathVariable(component.substring(1), compile(pattern, path.tail(), query, fragment));
      } else {
        return new UriPathLiteral(component, compile(pattern, path.tail(), query, fragment));
      }
    } else {
      return UriQueryPattern.compile(pattern, query, fragment);
    }
  }
}
