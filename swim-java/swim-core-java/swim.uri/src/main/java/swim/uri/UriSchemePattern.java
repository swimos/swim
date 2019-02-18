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

abstract class UriSchemePattern extends UriPattern {
  abstract HashTrieMap<String, String> unapply(UriScheme scheme, UriAuthority authority,
                                               UriPath path, UriQuery query, UriFragment fragment,
                                               HashTrieMap<String, String> args);

  @Override
  public HashTrieMap<String, String> unapply(Uri uri, HashTrieMap<String, String> args) {
    return unapply(uri.scheme(), uri.authority(), uri.path(), uri.query(), uri.fragment(), args);
  }

  abstract boolean matches(UriScheme scheme, UriAuthority authority, UriPath path,
                           UriQuery query, UriFragment fragment);

  @Override
  public boolean matches(Uri uri) {
    return matches(uri.scheme(), uri.authority(), uri.path(), uri.query(), uri.fragment());
  }

  static UriSchemePattern compile(Uri pattern, UriScheme scheme, UriAuthority authority,
                                  UriPath path, UriQuery query, UriFragment fragment) {
    if (scheme.isDefined()) {
      return new UriSchemeLiteral(scheme, UriAuthorityPattern.compile(pattern, authority,
                                                                      path, query, fragment));
    } else {
      return UriAuthorityPattern.compile(pattern, authority, path, query, fragment);
    }
  }
}
