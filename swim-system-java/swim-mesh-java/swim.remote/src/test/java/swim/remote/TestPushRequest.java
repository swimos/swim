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
import swim.runtime.PushRequest;
import swim.uri.Uri;
import swim.uri.UriFragment;
import swim.uri.UriPath;
import swim.uri.UriQuery;
import swim.warp.Envelope;

public class TestPushRequest implements PushRequest {
  protected final Uri meshUri;
  protected final Envelope envelope;
  protected final float prio;

  public TestPushRequest(Uri meshUri, Envelope envelope, float prio) {
    this.meshUri = meshUri;
    this.envelope = envelope;
    this.prio = prio;
  }

  public TestPushRequest(Envelope envelope, float prio) {
    this(Uri.empty(), envelope, prio);
  }

  public TestPushRequest(Envelope envelope) {
    this(Uri.empty(), envelope, 0.0f);
  }

  @Override
  public Uri meshUri() {
    return meshUri;
  }

  @Override
  public Uri hostUri() {
    final Uri nodeUri = envelope.nodeUri();
    return Uri.from(nodeUri.scheme(), nodeUri.authority(), UriPath.empty(),
        UriQuery.undefined(), UriFragment.undefined());
  }

  @Override
  public Uri nodeUri() {
    return envelope.nodeUri();
  }

  @Override
  public Identity identity() {
    return null;
  }

  @Override
  public Envelope envelope() {
    return envelope;
  }

  @Override
  public float prio() {
    return prio;
  }

  @Override
  public void didDeliver() {
  }

  @Override
  public void didDecline() {
  }
}
