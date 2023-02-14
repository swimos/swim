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
import swim.uri.UriPathBuilder;
import swim.uri.UriQuery;
import swim.uri.UriScheme;

@Internal
public abstract class UriPathPattern extends UriAuthorityPattern {

  Uri apply(UriScheme scheme, UriAuthority authority, UriPathBuilder path, String[] args, int index) {
    return this.apply(scheme, authority, path.build(), args, index);
  }

  @Override
  public Uri apply(UriScheme scheme, UriAuthority authority, String[] args, int index) {
    return this.apply(scheme, authority, new UriPathBuilder(), args, index);
  }

  abstract Map<String, String> unapply(UriPath path, UriQuery query, UriFragment fragment,
                                       Map<String, String> args);

  @Override
  Map<String, String> unapply(UriAuthority authority, UriPath path, UriQuery query,
                              UriFragment fragment, Map<String, String> args) {
    return this.unapply(path, query, fragment, args);
  }

  abstract boolean matches(UriPath path, UriQuery query, UriFragment fragment);

  @Override
  boolean matches(UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment) {
    if (!authority.isDefined()) {
      return this.matches(path, query, fragment);
    } else {
      return false;
    }
  }

  public static UriPathPattern compile(Uri pattern, UriPath path, UriQuery query, UriFragment fragment) {
    if (!path.isEmpty()) {
      final String component = path.head();
      if (!component.isEmpty() && component.charAt(0) == ':') {
        return new UriPathVariable(component.substring(1), UriPathPattern.compile(pattern, path.tail(), query, fragment));
      } else {
        return new UriPathLiteral(component, UriPathPattern.compile(pattern, path.tail(), query, fragment));
      }
    } else {
      return UriQueryPattern.compile(pattern, query, fragment);
    }
  }

}
