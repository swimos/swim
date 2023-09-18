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

package swim.system;

import swim.api.auth.Identity;
import swim.concurrent.Cont;
import swim.uri.Uri;

public class Push<M> {

  final Uri meshUri;
  final Uri hostUri;
  final Uri nodeUri;
  final Uri laneUri;
  final float prio;
  final Identity identity;
  final M message;
  final Cont<M> cont;

  public Push(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri, float prio,
              Identity identity, M message, Cont<M> cont) {
    this.meshUri = meshUri;
    this.hostUri = hostUri;
    this.nodeUri = nodeUri;
    this.laneUri = laneUri;
    this.prio = prio;
    this.identity = identity;
    this.message = message;
    this.cont = cont;
  }

  public final Uri meshUri() {
    return this.meshUri;
  }

  public Push<M> meshUri(Uri meshUri) {
    return this.copy(meshUri, this.hostUri, this.nodeUri, this.laneUri,
                     this.prio, this.identity, this.message, this.cont);
  }

  public final Uri hostUri() {
    return this.hostUri;
  }

  public Push<M> hostUri(Uri hostUri) {
    return this.copy(this.meshUri, hostUri, this.nodeUri, this.laneUri,
                     this.prio, this.identity, this.message, this.cont);
  }

  public final Uri nodeUri() {
    return this.nodeUri;
  }

  public Push<M> nodeUri(Uri nodeUri) {
    return this.copy(this.meshUri, this.hostUri, nodeUri, this.laneUri,
                     this.prio, this.identity, this.message, this.cont);
  }

  public final Uri laneUri() {
    return this.laneUri;
  }

  public Push<M> laneUri(Uri laneUri) {
    return this.copy(this.meshUri, this.hostUri, this.nodeUri, laneUri,
                     this.prio, this.identity, this.message, this.cont);
  }

  public final float prio() {
    return this.prio;
  }

  public Push<M> prio(float prio) {
    return this.copy(this.meshUri, this.hostUri, this.nodeUri, this.laneUri,
                     prio, this.identity, this.message, this.cont);
  }

  public final Identity identity() {
    return this.identity;
  }

  public M message() {
    return this.message;
  }

  public Cont<M> cont() {
    return this.cont;
  }

  protected <M> Push<M> copy(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri, float prio,
                             Identity identity, M message, Cont<M> cont) {
    return new Push<M>(meshUri, hostUri, nodeUri, laneUri, prio, identity, message, cont);
  }

  public void bind() {
    if (this.cont != null) {
      try {
        this.cont.bind(this.message);
      } catch (Throwable error) {
        if (Cont.isNonFatal(error)) {
          this.cont.trap(error);
        } else {
          throw error;
        }
      }
    }
  }

  public void trap(Throwable error) {
    if (this.cont != null) {
      this.cont.trap(error);
    }
  }

}
