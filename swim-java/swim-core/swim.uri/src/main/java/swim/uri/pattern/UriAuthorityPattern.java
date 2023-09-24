// Copyright 2015-2023 Nstream, inc.
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
import swim.annotations.Internal;
import swim.uri.Uri;
import swim.uri.UriAuthority;
import swim.uri.UriFragment;
import swim.uri.UriPath;
import swim.uri.UriQuery;
import swim.uri.UriScheme;

@Internal
public abstract class UriAuthorityPattern extends UriSchemePattern {

  abstract Map<String, String> unapply(UriAuthority authority, UriPath path,
                                       UriQuery query, UriFragment fragment,
                                       Map<String, String> args);

  @Override
  Map<String, String> unapply(UriScheme scheme, UriAuthority authority,
                              UriPath path, UriQuery query, UriFragment fragment,
                              Map<String, String> args) {
    return this.unapply(authority, path, query, fragment, args);
  }

  abstract boolean matches(UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment);

  @Override
  boolean matches(UriScheme scheme, UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment) {
    if (scheme.isDefined()) {
      return false;
    }
    return this.matches(authority, path, query, fragment);
  }

  public static UriAuthorityPattern compile(Uri pattern, UriAuthority authority, UriPath path,
                                            UriQuery query, UriFragment fragment) {
    final UriPathPattern pathPattern = UriPathPattern.compile(pattern, path, query, fragment);
    if (!authority.isDefined()) {
      return pathPattern;
    }
    return new UriAuthorityLiteral(authority, pathPattern);
  }

}
