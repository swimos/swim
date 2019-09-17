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

package swim.js;

import org.graalvm.polyglot.Context;
import swim.api.agent.AbstractAgentRoute;
import swim.api.agent.AgentContext;
import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriPath;
import swim.vm.js.JsBridge;
import swim.vm.js.JsModule;
import swim.vm.js.JsModuleSystem;

public class JsAgentFactory extends AbstractAgentRoute<JsAgent> {
  protected final JsKernel jsKernel;
  protected final UriPath basePath;
  protected final JsAgentDef agentDef;

  public JsAgentFactory(JsKernel jsKernel, UriPath basePath, JsAgentDef agentDef) {
    this.jsKernel = jsKernel;
    this.basePath = basePath;
    this.agentDef = agentDef;
  }

  public final JsKernel jsKernel() {
    return this.jsKernel;
  }

  public final UriPath basePath() {
    return this.basePath;
  }

  public final JsAgentDef agentDef() {
    return this.agentDef;
  }

  protected Context createAgentJsContext(AgentContext agentContext) {
    return Context.newBuilder("js")
        .engine(this.jsKernel.jsEngine())
        // TODO: .in(...)
        // TODO: .out(...)
        // TODO: .err(...)
        // TODO: .logHandler(...)
        // TODO: .fileSystem(...)
        // TODO: .processHandler(...)
        // TODO: .serverTransport(...)
        .build();
  }

  protected JsBridge createAgentJsBridge(AgentContext agentContext, Context jsContext) {
    return new JsBridge(this.jsKernel.jsRuntime(), jsContext);
  }

  protected JsModuleSystem createAgentModuleSystem(AgentContext agentContext, Context jsContext, JsBridge jsBridge) {
    return new JsModuleSystem(jsContext, jsBridge);
  }

  protected JsModule requireAgentModule(AgentContext agentContext, JsModuleSystem moduleSystem) {
    return moduleSystem.requireModule(basePath(), this.agentDef.modulePath());
  }

  protected org.graalvm.polyglot.Value createGuestAgent(AgentContext agentContext, JsBridge jsBridge, JsModule agentModule) {
    final Object guestAgentContext = jsBridge.hostToGuest(agentContext);
    final org.graalvm.polyglot.Value agentExports = agentModule.moduleExports();
    final org.graalvm.polyglot.Value guestAgent;
    if (agentExports.canInstantiate()) {
      guestAgent = agentExports.newInstance(guestAgentContext);
    } else {
      guestAgent = agentExports;
      if (guestAgent.hasMembers()) {
        guestAgent.putMember("context", guestAgentContext);
      }
    }
    return guestAgent;
  }

  @Override
  public JsAgent createAgent(AgentContext agentContext) {
    final Context jsContext = createAgentJsContext(agentContext);
    final JsBridge jsBridge = createAgentJsBridge(agentContext, jsContext);
    final JsModuleSystem moduleSystem = createAgentModuleSystem(agentContext, jsContext, jsBridge);
    final JsModule module = requireAgentModule(agentContext, moduleSystem);
    final org.graalvm.polyglot.Value guest = createGuestAgent(agentContext, jsBridge, module);
    return new JsAgent(agentContext, jsBridge, module, guest);
  }

  @Override
  public Value id(Uri nodeUri) {
    return this.agentDef.id();
  }
}
