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

final class UriConstantPattern extends UriTerminalPattern {
  final Uri uri;

  UriConstantPattern(Uri uri) {
    this.uri = uri;
  }

  @Override
  public boolean isUri() {
    return true;
  }

  @Override
  public Uri toUri() {
    return this.uri;
  }

  @Override
  Uri apply(UriScheme scheme, UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment, String[] args, int index) {
    if (index < args.length) {
      throw new IllegalArgumentException("applied " + index + " of " + args.length + " interpolation arguments");
    }
    return new Uri(scheme, authority, path, query, fragment);
  }

  @Override
  HashTrieMap<String, String> unapply(HashTrieMap<String, String> args) {
    return args;
  }

  @Override
  boolean matches() {
    return true;
  }
}
