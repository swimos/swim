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

@Internal
public abstract class TerminalUriPattern extends UriFragmentPattern {

  abstract Map<String, String> unapply(Map<String, String> args);

  @Override
  Map<String, String> unapply(UriFragment fragment, Map<String, String> args) {
    return this.unapply(args);
  }

  abstract boolean matches();

  @Override
  boolean matches(UriFragment fragment) {
    if (fragment.isDefined()) {
      return false;
    }
    return this.matches();
  }

  public static TerminalUriPattern compile(Uri pattern) {
    return new UriLiteral(pattern);
  }

}
