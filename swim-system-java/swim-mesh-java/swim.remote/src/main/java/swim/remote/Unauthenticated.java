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

package swim.remote;

import swim.api.auth.Identity;
import swim.api.store.Store;
import swim.structure.Value;
import swim.uri.Uri;

public class Unauthenticated implements Identity {
  final Uri requestUri;
  final Uri fromUri;
  final Value subject;

  public Unauthenticated(Uri requestUri, Uri fromUri, Value subject) {
    this.requestUri = requestUri;
    this.fromUri = fromUri;
    this.subject = subject;
  }

  @Override
  public boolean isAuthenticated() {
    return false;
  }

  @Override
  public Uri requestUri() {
    return this.requestUri;
  }

  @Override
  public Uri fromUri() {
    return this.fromUri;
  }

  @Override
  public Value subject() {
    return this.subject;
  }

  @Override
  public Store data() {
    throw new UnsupportedOperationException(); // TODO
  }

  @Override
  public Store session() {
    throw new UnsupportedOperationException(); // TODO
  }
}
