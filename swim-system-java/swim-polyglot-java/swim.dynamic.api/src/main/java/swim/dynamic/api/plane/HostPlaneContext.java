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

package swim.dynamic.api.plane;

import swim.api.agent.AgentRoute;
import swim.api.auth.Authenticator;
import swim.api.plane.PlaneContext;
import swim.api.policy.PlanePolicy;
import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;
import swim.dynamic.api.agent.GuestAgentRoute;
import swim.dynamic.java.lang.HostObject;
import swim.uri.Uri;
import swim.uri.UriPattern;

public final class HostPlaneContext {
  private HostPlaneContext() {
    // static
  }

  public static final HostObjectType<PlaneContext> TYPE;

  static {
    final JavaHostObjectType<PlaneContext> type = new JavaHostObjectType<>(PlaneContext.class);
    TYPE = type;
    type.inheritType(HostObject.TYPE); // FIXME: remove once any other base type is inherited
    // FIXME: type.inheritType(HostSwimRef.TYPE);
    // FIXME: type.inheritType(HostLog.TYPE);
    type.addMember(new HostPlaneContextSchedule());
    type.addMember(new HostPlaneContextStage());
    type.addMember(new HostPlaneContextPolicy());
    type.addMember(new HostPlaneContextSetPolicy());
    type.addMember(new HostPlaneContextGetAuthenticator());
    type.addMember(new HostPlaneContextAddAuthenticator());
    type.addMember(new HostPlaneContextGetAgentFactory());
    type.addMember(new HostPlaneContextGetAgentRoute());
    type.addMember(new HostPlaneContextAddAgentRoute());
    type.addMember(new HostPlaneContextRemoveAgentRoute());
  }
}

final class HostPlaneContextSchedule implements HostMethod<PlaneContext> {
  @Override
  public String key() {
    return "schedule";
  }

  @Override
  public Object invoke(Bridge bridge, PlaneContext planeContext, Object... arguments) {
    return planeContext.schedule();
  }
}

final class HostPlaneContextStage implements HostMethod<PlaneContext> {
  @Override
  public String key() {
    return "stage";
  }

  @Override
  public Object invoke(Bridge bridge, PlaneContext planeContext, Object... arguments) {
    return planeContext.stage();
  }
}

final class HostPlaneContextPolicy implements HostMethod<PlaneContext> {
  @Override
  public String key() {
    return "policy";
  }

  @Override
  public Object invoke(Bridge bridge, PlaneContext planeContext, Object... arguments) {
    return planeContext.policy();
  }
}

final class HostPlaneContextSetPolicy implements HostMethod<PlaneContext> {
  @Override
  public String key() {
    return "setPolicy";
  }

  @Override
  public Object invoke(Bridge bridge, PlaneContext planeContext, Object... arguments) {
    final Object policy = arguments[0];
    // TODO: convert guest policy to host PlanePolicy.
    planeContext.setPolicy((PlanePolicy) policy);
    return null;
  }
}

final class HostPlaneContextGetAuthenticator implements HostMethod<PlaneContext> {
  @Override
  public String key() {
    return "getAuthenticator";
  }

  @Override
  public Object invoke(Bridge bridge, PlaneContext planeContext, Object... arguments) {
    final Object authenticatorName = arguments[0];
    return planeContext.getAuthenticator((String) authenticatorName);
  }
}

final class HostPlaneContextAddAuthenticator implements HostMethod<PlaneContext> {
  @Override
  public String key() {
    return "addAuthenticator";
  }

  @Override
  public Object invoke(Bridge bridge, PlaneContext planeContext, Object... arguments) {
    final Object authenticatorName = arguments[1];
    final Object authenticator = arguments[1];
    // TODO: convert guest authenticator to host Authenticator.
    planeContext.addAuthenticator((String) authenticatorName, (Authenticator) authenticator);
    return null;
  }
}

final class HostPlaneContextGetAgentFactory implements HostMethod<PlaneContext> {
  @Override
  public String key() {
    return "getAgentFactory";
  }

  @Override
  public Object invoke(Bridge bridge, PlaneContext planeContext, Object... arguments) {
    Object nodeUri = arguments[0];
    if (nodeUri instanceof String) {
      nodeUri = Uri.parse((String) nodeUri);
    }
    return planeContext.getAgentFactory((Uri) nodeUri);
  }
}

final class HostPlaneContextGetAgentRoute implements HostMethod<PlaneContext> {
  @Override
  public String key() {
    return "getAgentRoute";
  }

  @Override
  public Object invoke(Bridge bridge, PlaneContext planeContext, Object... arguments) {
    final Object routeName = arguments[0];
    return planeContext.getAgentRoute((String) routeName);
  }
}

final class HostPlaneContextAddAgentRoute implements HostMethod<PlaneContext> {
  @Override
  public String key() {
    return "addAgentRoute";
  }

  @Override
  public Object invoke(Bridge bridge, PlaneContext planeContext, Object... arguments) {
    final Object routeName = arguments[0];
    Object pattern = arguments[1];
    if (pattern == null) {
      throw new NullPointerException();
    }
    if (pattern instanceof String) {
      pattern = UriPattern.parse((String) pattern);
    }
    Object agentRoute = arguments[2];
    if (agentRoute == null) {
      throw new NullPointerException();
    }
    if (!(agentRoute instanceof AgentRoute<?>)) {
      agentRoute = new GuestAgentRoute(bridge, agentRoute);
    }
    planeContext.addAgentRoute((String) routeName, (UriPattern) pattern, (AgentRoute<?>) agentRoute);
    return null;
  }
}

final class HostPlaneContextRemoveAgentRoute implements HostMethod<PlaneContext> {
  @Override
  public String key() {
    return "removeAgentRoute";
  }

  @Override
  public Object invoke(Bridge bridge, PlaneContext planeContext, Object... arguments) {
    final Object routeName = arguments[0];
    planeContext.removeAgentRoute((String) routeName);
    return null;
  }
}
