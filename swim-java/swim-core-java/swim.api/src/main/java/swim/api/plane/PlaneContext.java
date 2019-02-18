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

package swim.api.plane;

import swim.api.agent.Agent;
import swim.api.agent.AgentType;
import swim.api.auth.Authenticator;
import swim.api.policy.PlanePolicy;
import swim.api.ref.SwimRef;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.uri.Uri;
import swim.uri.UriPattern;
import swim.util.Log;

public interface PlaneContext extends SwimRef, Log {
  Schedule schedule();

  Stage stage();

  PlanePolicy planePolicy();

  void setPlanePolicy(PlanePolicy policy);

  FingerTrieSeq<Authenticator> authenticators();

  void setAuthenticators(FingerTrieSeq<Authenticator> authenticators);

  void addAuthenticator(Authenticator authenticator);

  <A extends Agent> AgentType<A> agentClass(Class<? extends A> agentClass);

  boolean hasAgentType(String name);

  <A extends Agent> AgentType<A> getAgentType(String name);

  void addAgentType(String name, AgentType<?> agentType);

  void removeAgentType(String name);

  <A extends Agent> AgentType<A> getAgentRoute(Uri nodeUri);

  void addAgentRoute(UriPattern pattern, AgentType<?> agentType);

  void addAgentRoute(String pattern, AgentType<?> agentType);

  void removeAgentRoute(UriPattern pattern);
}
