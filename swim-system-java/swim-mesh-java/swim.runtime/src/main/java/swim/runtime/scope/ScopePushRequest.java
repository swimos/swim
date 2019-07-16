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

package swim.runtime.scope;

import swim.api.auth.Identity;
import swim.runtime.PushRequest;
import swim.uri.Uri;
import swim.warp.Envelope;

public class ScopePushRequest implements PushRequest {
  final Uri meshUri;
  final Uri hostUri;
  final Identity identity;
  final Envelope envelope;
  final float prio;

  public ScopePushRequest(Uri meshUri, Uri hostUri, Identity identity, Envelope envelope, float prio) {
    this.meshUri = meshUri;
    this.hostUri = hostUri;
    this.identity = identity;
    this.envelope = envelope;
    this.prio = prio;
  }

  @Override
  public Uri meshUri() {
    return this.meshUri;
  }

  @Override
  public Uri hostUri() {
    return this.hostUri;
  }

  @Override
  public Uri nodeUri() {
    return this.envelope.nodeUri();
  }

  @Override
  public float prio() {
    return this.prio;
  }

  @Override
  public Identity identity() {
    return this.identity;
  }

  @Override
  public Envelope envelope() {
    return this.envelope;
  }

  @Override
  public void didDeliver() {
    // nop
  }

  @Override
  public void didDecline() {
    // nop
  }
}
