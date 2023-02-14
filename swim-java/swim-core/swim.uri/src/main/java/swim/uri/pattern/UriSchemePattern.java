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
import swim.annotations.Internal;
import swim.uri.Uri;
import swim.uri.UriAuthority;
import swim.uri.UriFragment;
import swim.uri.UriPath;
import swim.uri.UriPattern;
import swim.uri.UriQuery;
import swim.uri.UriScheme;

@Internal
public abstract class UriSchemePattern extends UriPattern {

  abstract Map<String, String> unapply(UriScheme scheme, UriAuthority authority,
                                       UriPath path, UriQuery query, UriFragment fragment,
                                       Map<String, String> args);

  @Override
  public Map<String, String> unapply(Uri uri, Map<String, String> args) {
    return this.unapply(uri.scheme(), uri.authority(), uri.path(), uri.query(), uri.fragment(), args);
  }

  abstract boolean matches(UriScheme scheme, UriAuthority authority, UriPath path,
                           UriQuery query, UriFragment fragment);

  @Override
  public boolean matches(Uri uri) {
    return this.matches(uri.scheme(), uri.authority(), uri.path(), uri.query(), uri.fragment());
  }

  public static UriSchemePattern compile(Uri pattern, UriScheme scheme, UriAuthority authority,
                                         UriPath path, UriQuery query, UriFragment fragment) {
    if (scheme.isDefined()) {
      return new UriSchemeLiteral(scheme, UriAuthorityPattern.compile(pattern, authority, path, query, fragment));
    } else {
      return UriAuthorityPattern.compile(pattern, authority, path, query, fragment);
    }
  }

}
