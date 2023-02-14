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

final class UriSchemeLiteral extends UriSchemePattern {

  final UriScheme scheme;
  final UriAuthorityPattern rest;

  UriSchemeLiteral(UriScheme scheme, UriAuthorityPattern rest) {
    this.scheme = scheme;
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
  public Uri apply(String[] args, int index) {
    return this.rest.apply(this.scheme, args, index);
  }

  @Override
  Map<String, String> unapply(UriScheme scheme, UriAuthority authority,
                              UriPath path, UriQuery query, UriFragment fragment,
                              Map<String, String> args) {
    if (this.scheme.equals(scheme)) {
      return this.rest.unapply(authority, path, query, fragment, args);
    } else {
      return args;
    }
  }

  @Override
  boolean matches(UriScheme scheme, UriAuthority authority, UriPath path,
                  UriQuery query, UriFragment fragment) {
    if (this.scheme.equals(scheme)) {
      return this.rest.matches(authority, path, query, fragment);
    } else {
      return false;
    }
  }

}
