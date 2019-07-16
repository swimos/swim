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

final class UriPathLiteral extends UriPathPattern {
  final String component;
  final UriPathPattern rest;

  UriPathLiteral(String component, UriPathPattern rest) {
    this.component = component;
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
  Uri apply(UriScheme scheme, UriAuthority authority, UriPathBuilder path, String[] args, int index) {
    path.add(this.component);
    return this.rest.apply(scheme, authority, path, args, index);
  }

  @Override
  HashTrieMap<String, String> unapply(UriPath path, UriQuery query, UriFragment fragment,
                                      HashTrieMap<String, String> args) {
    if (!path.isEmpty() && this.component.equals(path.head())) {
      return this.rest.unapply(path.tail(), query, fragment, args);
    } else {
      return args;
    }
  }

  @Override
  boolean matches(UriPath path, UriQuery query, UriFragment fragment) {
    if (!path.isEmpty() && this.component.equals(path.head())) {
      return this.rest.matches(path.tail(), query, fragment);
    } else {
      return false;
    }
  }
}
