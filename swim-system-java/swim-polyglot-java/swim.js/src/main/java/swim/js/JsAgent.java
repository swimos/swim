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

import swim.api.agent.Agent;
import swim.api.agent.AgentContext;
import swim.dynamic.GuestWrapper;
import swim.vm.js.JsBridge;
import swim.vm.js.JsModule;

public class JsAgent implements Agent, GuestWrapper {
  protected final AgentContext agentContext;
  protected final JsBridge bridge;
  protected final JsModule module;
  protected final Object guest;

  public JsAgent(AgentContext agentContext, JsBridge bridge,
                 JsModule module, Object guest) {
    this.agentContext = agentContext;
    this.bridge = bridge;
    this.module = module;
    this.guest = guest;
  }

  @Override
  public final AgentContext agentContext() {
    return this.agentContext;
  }

  public final JsBridge bridge() {
    return this.bridge;
  }

  public final JsModule module() {
    return this.module;
  }

  @Override
  public final Object unwrap() {
    return this.guest;
  }

  @Override
  public void willOpen() {
    if (this.bridge.guestCanInvokeMember(this.guest, "willOpen")) {
      this.bridge.guestInvokeMember(this.guest, "willOpen");
    }
  }

  @Override
  public void didOpen() {
    if (this.bridge.guestCanInvokeMember(this.guest, "didOpen")) {
      this.bridge.guestInvokeMember(this.guest, "didOpen");
    }
  }

  @Override
  public void willLoad() {
    if (this.bridge.guestCanInvokeMember(this.guest, "willLoad")) {
      this.bridge.guestInvokeMember(this.guest, "willLoad");
    }
  }

  @Override
  public void didLoad() {
    if (this.bridge.guestCanInvokeMember(this.guest, "didLoad")) {
      this.bridge.guestInvokeMember(this.guest, "didLoad");
    }
  }

  @Override
  public void willStart() {
    if (this.bridge.guestCanInvokeMember(this.guest, "willStart")) {
      this.bridge.guestInvokeMember(this.guest, "willStart");
    }
  }

  @Override
  public void didStart() {
    if (this.bridge.guestCanInvokeMember(this.guest, "didStart")) {
      this.bridge.guestInvokeMember(this.guest, "didStart");
    }
  }

  @Override
  public void willStop() {
    if (this.bridge.guestCanInvokeMember(this.guest, "willStop")) {
      this.bridge.guestInvokeMember(this.guest, "willStop");
    }
  }

  @Override
  public void didStop() {
    if (this.bridge.guestCanInvokeMember(this.guest, "didStop")) {
      this.bridge.guestInvokeMember(this.guest, "didStop");
    }
  }

  @Override
  public void willUnload() {
    if (this.bridge.guestCanInvokeMember(this.guest, "willUnload")) {
      this.bridge.guestInvokeMember(this.guest, "willUnload");
    }
  }

  @Override
  public void didUnload() {
    if (this.bridge.guestCanInvokeMember(this.guest, "didUnload")) {
      this.bridge.guestInvokeMember(this.guest, "didUnload");
    }
  }

  @Override
  public void willClose() {
    if (this.bridge.guestCanInvokeMember(this.guest, "willClose")) {
      this.bridge.guestInvokeMember(this.guest, "willClose");
    }
  }

  @Override
  public void didClose() {
    if (this.bridge.guestCanInvokeMember(this.guest, "didClose")) {
      this.bridge.guestInvokeMember(this.guest, "didClose");
    }
  }

  @Override
  public void didFail(Throwable error) {
    if (this.bridge.guestCanInvokeMember(this.guest, "didFail")) {
      this.bridge.guestInvokeMember(this.guest, "didFail", error);
    } else {
      error.printStackTrace();
    }
  }
}
