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

package swim.api.policy;

import swim.api.Downlink;
import swim.api.Lane;
import swim.api.Uplink;
import swim.api.agent.Agent;
import swim.api.agent.AgentRoute;
import swim.api.auth.Identity;
import swim.http.HttpMessage;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.uri.Uri;
import swim.warp.CommandMessage;
import swim.warp.Envelope;
import swim.warp.EventMessage;
import swim.warp.LinkRequest;
import swim.warp.SyncRequest;

public class AbstractPolicy implements Policy, PlanePolicy, AgentRoutePolicy, AgentPolicy, LanePolicy, UplinkPolicy, DownlinkPolicy {
  @Override
  public AgentRoutePolicy agentRoutePolicy(AgentRoute<?> agentRoute) {
    return this;
  }

  @Override
  public AgentPolicy agentPolicy(Agent agent) {
    return this;
  }

  @Override
  public LanePolicy lanePolicy(Lane lane) {
    return this;
  }

  @Override
  public UplinkPolicy uplinkPolicy(Uplink uplink) {
    return this;
  }

  @Override
  public DownlinkPolicy downlinkPolicy(Downlink downlink) {
    return this;
  }

  @Override
  public PolicyDirective<Object> canConnect(Uri requestUri) {
    return allow();
  }

  @Override
  public PolicyDirective<LinkRequest> canLink(LinkRequest request, Identity identity) {
    return authorize(request, identity);
  }

  @Override
  public PolicyDirective<SyncRequest> canSync(SyncRequest request, Identity identity) {
    return authorize(request, identity);
  }

  @Override
  public PolicyDirective<EventMessage> canUplink(EventMessage message, Identity identity) {
    return authorize(message, identity);
  }

  @Override
  public PolicyDirective<CommandMessage> canDownlink(CommandMessage message, Identity identity) {
    return authorize(message, identity);
  }

  @Override
  public PolicyDirective<HttpMessage<?>> canRequest(HttpRequest<?> request) {
    return allow();
  }

  @Override
  public PolicyDirective<HttpResponse<?>> canRespond(HttpRequest<?> request, HttpResponse<?> response) {
    return allow();
  }

  protected <T> PolicyDirective<T> authorize(Envelope envelope, Identity identity) {
    return allow();
  }

  public <T> PolicyDirective<T> allow(T value) {
    return PolicyDirective.allow(value);
  }

  public <T> PolicyDirective<T> allow() {
    return PolicyDirective.allow();
  }

  public <T> PolicyDirective<T> deny(Object reason) {
    return PolicyDirective.deny(this, reason);
  }

  public <T> PolicyDirective<T> deny() {
    return PolicyDirective.deny(this);
  }

  public <T> PolicyDirective<T> forbid(Object reason) {
    return PolicyDirective.forbid(this, reason);
  }

  public <T> PolicyDirective<T> forbid() {
    return PolicyDirective.forbid(this);
  }
}
