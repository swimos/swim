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
import swim.uri.UriFragment;
import swim.uri.UriPath;
import swim.uri.UriQuery;

@Internal
public abstract class UriQueryPattern extends UriPathPattern {

  abstract Map<String, String> unapply(UriQuery query, UriFragment fragment,
                                       Map<String, String> args);

  @Override
  Map<String, String> unapply(UriPath path, UriQuery query, UriFragment fragment,
                              Map<String, String> args) {
    return this.unapply(query, fragment, args);
  }

  abstract boolean matches(UriQuery query, UriFragment fragment);

  @Override
  boolean matches(UriPath path, UriQuery query, UriFragment fragment) {
    if (!path.isEmpty()) {
      return false;
    }
    return this.matches(query, fragment);
  }

  public static UriQueryPattern compile(Uri pattern, UriQuery query, UriFragment fragment) {
    final UriFragmentPattern fragmentPattern = UriFragmentPattern.compile(pattern, fragment);
    if (!query.isDefined()) {
      return fragmentPattern;
    }
    return new UriQueryLiteral(query, fragmentPattern);
  }

}
