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

final class UriAuthorityLiteral extends UriAuthorityPattern {
  final UriAuthority authority;
  final UriPathPattern rest;

  UriAuthorityLiteral(UriAuthority authority, UriPathPattern rest) {
    this.authority = authority;
    this.rest = rest;
  }

  @Override
  public boolean isUri() {
    return this.rest.isUri();
  }

  @Override
  public Uri toUri() {
    return this.rest.toUri();
  }

  @Override
  Uri apply(UriScheme scheme, String[] args, int index) {
    return this.rest.apply(scheme, this.authority, args, index);
  }

  @Override
  HashTrieMap<String, String> unapply(UriAuthority authority, UriPath path, UriQuery query,
                                      UriFragment fragment, HashTrieMap<String, String> args) {
    if (this.authority.equals(authority)) {
      return this.rest.unapply(path, query, fragment, args);
    } else {
      return args;
    }
  }

  @Override
  boolean matches(UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment) {
    if (this.authority.equals(authority)) {
      return this.rest.matches(path, query, fragment);
    } else {
      return false;
    }
  }
}
