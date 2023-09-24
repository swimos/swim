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
import swim.uri.Uri;
import swim.uri.UriAuthority;
import swim.uri.UriFragment;
import swim.uri.UriPath;
import swim.uri.UriQuery;
import swim.uri.UriScheme;

final class UriLiteral extends TerminalUriPattern {

  final Uri uri;

  UriLiteral(Uri uri) {
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
  public Uri apply(UriScheme scheme, UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment, String[] args, int index) {
    if (index < args.length) {
      throw new IllegalArgumentException("applied " + index + " of " + args.length + " interpolation arguments");
    }
    return Uri.of(scheme, authority, path, query, fragment);
  }

  @Override
  Map<String, String> unapply(Map<String, String> args) {
    return args;
  }

  @Override
  boolean matches() {
    return true;
  }

}
