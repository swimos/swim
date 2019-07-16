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

import swim.api.auth.Identity;
import swim.http.HttpMessage;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.warp.CommandMessage;
import swim.warp.EventMessage;
import swim.warp.LinkRequest;
import swim.warp.SyncRequest;

public interface Policy extends HttpPolicy {
  PolicyDirective<LinkRequest> canLink(LinkRequest request, Identity identity);

  PolicyDirective<SyncRequest> canSync(SyncRequest request, Identity identity);

  PolicyDirective<EventMessage> canUplink(EventMessage message, Identity identity);

  PolicyDirective<CommandMessage> canDownlink(CommandMessage message, Identity identity);

  PolicyDirective<HttpMessage<?>> canRequest(HttpRequest<?> request);

  PolicyDirective<HttpResponse<?>> canRespond(HttpRequest<?> request, HttpResponse<?> response);
}
