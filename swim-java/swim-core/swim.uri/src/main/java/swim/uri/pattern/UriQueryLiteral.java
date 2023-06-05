// Copyright 2015-2022 Swim.inc
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

package swim.uri.pattern;

import java.util.Map;
import swim.uri.Uri;
import swim.uri.UriAuthority;
import swim.uri.UriFragment;
import swim.uri.UriPath;
import swim.uri.UriQuery;
import swim.uri.UriScheme;

final class UriQueryLiteral extends UriQueryPattern {

  final UriQuery query;
  final UriFragmentPattern rest;

  UriQueryLiteral(UriQuery query, UriFragmentPattern rest) {
    this.query = query;
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
  public Uri apply(UriScheme scheme, UriAuthority authority, UriPath path, String[] args, int index) {
    return this.rest.apply(scheme, authority, path, this.query, args, index);
  }

  @Override
  Map<String, String> unapply(UriQuery query, UriFragment fragment, Map<String, String> args) {
    return this.rest.unapply(fragment, args);
  }

  @Override
  boolean matches(UriQuery query, UriFragment fragment) {
    if (!this.query.equals(query)) {
      return false;
    }
    return this.rest.matches(fragment);
  }

}
