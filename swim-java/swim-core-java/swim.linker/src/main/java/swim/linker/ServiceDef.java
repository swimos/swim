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

package swim.linker;

import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriAuthority;
import swim.uri.UriHost;
import swim.uri.UriPort;
import swim.uri.UriScheme;

public abstract class ServiceDef {
  protected Uri uri;

  public abstract UriScheme scheme();

  public abstract String address();

  public abstract int port();

  public UriAuthority authority() {
    return UriAuthority.from(UriHost.parse(address()), UriPort.from(port()));
  }

  public Uri uri() {
    if (this.uri == null) {
      this.uri = Uri.from(scheme(), authority());
    }
    return this.uri;
  }

  public abstract Value toValue();
}
