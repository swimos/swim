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

package swim.server;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.SwimAgent;
import swim.api.SwimContext;
import swim.api.SwimRoute;
import swim.api.agent.Agent;
import swim.api.agent.AgentType;
import swim.api.auth.Authenticated;
import swim.api.auth.Authenticator;
import swim.api.auth.Credentials;
import swim.api.auth.Identity;
import swim.api.downlink.Downlink;
import swim.api.plane.Plane;
import swim.api.plane.PlaneContext;
import swim.api.plane.PlaneException;
import swim.api.policy.PlanePolicy;
import swim.api.policy.Policy;
import swim.api.policy.PolicyDirective;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.concurrent.Theater;
import swim.io.ServiceRef;
import swim.io.http.HttpEndpoint;
import swim.io.warp.WarpSettings;
import swim.linker.AgentTypeDef;
import swim.linker.AuthDef;
import swim.linker.AuthenticatorContext;
import swim.linker.HttpServiceDef;
import swim.linker.HttpsServiceDef;
import swim.linker.PlaneDef;
import swim.linker.ServiceDef;
import swim.linker.WarpServiceDef;
import swim.recon.Recon;
import swim.remote.RemoteHostClient;
import swim.runtime.AbstractTierBinding;
import swim.runtime.HostBinding;
import swim.runtime.HttpBinding;
import swim.runtime.LaneBinding;
import swim.runtime.LinkBinding;
import swim.runtime.MeshBinding;
import swim.runtime.NodeBinding;
import swim.runtime.PartBinding;
import swim.runtime.PushRequest;
import swim.runtime.RootBinding;
import swim.runtime.RootContext;
import swim.runtime.TierContext;
import swim.runtime.agent.AgentClass;
import swim.runtime.agent.AgentModel;
import swim.runtime.router.HostTable;
import swim.runtime.router.MeshTable;
import swim.runtime.router.PartTable;
import swim.store.StoreBinding;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriMapper;
import swim.uri.UriPattern;

public class ServerPlane extends AbstractTierBinding implements RootContext, PlaneContext, AuthenticatorContext {
  protected final Theater stage;

  protected final StoreBinding store;

  protected final HttpEndpoint endpoint;

  protected final RootBinding root;

  protected Plane plane;

  protected WarpSettings warpSettings;

  volatile PlanePolicy policy;

  volatile FingerTrieSeq<Authenticator> authenticators;

  volatile HashTrieMap<String, AgentType<?>> agentTypes;

  volatile UriMapper<AgentType<?>> agentRoutes;

  public ServerPlane(Theater stage, StoreBinding store, HttpEndpoint endpoint, RootBinding root) {
    this.stage = stage;
    this.store = store;
    this.endpoint = endpoint;
    this.root = root;
    this.authenticators = FingerTrieSeq.empty();
    this.agentTypes = HashTrieMap.empty();
    this.agentRoutes = UriMapper.empty();
  }

  @Override
  public TierContext tierContext() {
    return this;
  }

  @Override
  public Uri meshUri() {
    return Uri.empty();
  }

  @Override
  public Policy policy() {
    return this.policy;
  }

  @Override
  public Schedule schedule() {
    return this.stage;
  }

  @Override
  public final Stage stage() {
    return this.stage;
  }

  @Override
  public StoreBinding store() {
    return this.store;
  }

  public HttpEndpoint endpoint() {
    return this.endpoint;
  }

  public RootBinding root() {
    return this.root;
  }

  public Plane getPlane() {
    return this.plane;
  }

  public void setPlane(Plane plane) {
    this.plane = plane;
  }

  public WarpSettings warpSettings() {
    return this.warpSettings;
  }

  public void setWarpSettings(WarpSettings warpSettings) {
    this.warpSettings = warpSettings;
  }

  public void materialize(Class<? extends Plane> planeClass) {
    materialize(planeClass, null);
  }

  @SuppressWarnings("unchecked")
  public ServerPlane materialize(PlaneDef planeDef) {
    try {
      final Class<? extends Plane> planeClass = (Class<? extends Plane>) Class.forName(planeDef.className());
      return materialize(planeClass, planeDef);
    } catch (ClassNotFoundException cause) {
      throw new PlaneException(cause);
    }
  }

  public ServerPlane materialize(Class<? extends Plane> planeClass, PlaneDef planeDef) {
    try {
      return materializeContextConstructor(planeClass, planeClass.getDeclaredConstructor(PlaneContext.class), planeDef);
    } catch (NoSuchMethodException e) {
      try {
        return materializeNoArgConstructor(planeClass, planeClass.getDeclaredConstructor(), planeDef);
      } catch (NoSuchMethodException cause) {
        throw new PlaneException(cause);
      }
    }
  }

  ServerPlane materializeContextConstructor(Class<? extends Plane> planeClass,
                                            Constructor<? extends Plane> constructor, PlaneDef planeDef) {
    SwimContext.setPlaneContext(this);
    try {
      final Plane plane = constructor.newInstance(this);
      SwimContext.clear();
      this.plane = plane;
      materializeAuthDefs(this, plane, planeDef);
      reflectAgentTypeFields(planeClass, this, plane, planeDef);
      materializeAgentTypeDefs(this, plane, planeDef);
      return this;
    } catch (ReflectiveOperationException cause) {
      throw new PlaneException(cause);
    }
  }

  ServerPlane materializeNoArgConstructor(Class<? extends Plane> planeClass,
                                          Constructor<? extends Plane> constructor, PlaneDef planeDef) {
    SwimContext.setPlaneContext(this);
    try {
      final Plane plane = constructor.newInstance();
      SwimContext.clear();
      this.plane = plane;
      materializeAuthDefs(this, plane, planeDef);
      reflectAgentTypeFields(planeClass, this, plane, planeDef);
      materializeAgentTypeDefs(this, plane, planeDef);
      return this;
    } catch (ReflectiveOperationException cause) {
      throw new PlaneException(cause);
    }
  }

  public ServiceRef bind(ServiceDef serviceDef) {
    if (serviceDef instanceof HttpServiceDef) {
      return bind((HttpServiceDef) serviceDef);
    } else if (serviceDef instanceof HttpsServiceDef) {
      return bind((HttpsServiceDef) serviceDef);
    } else {
      throw new IllegalArgumentException(Recon.toString(serviceDef.toValue()));
    }
  }

  ServiceRef bind(HttpServiceDef serviceDef) {
    final WarpSettings warpSettings = serviceDef.warpSettings();
    final ServerPlaneHttpService service = new ServerPlaneHttpService(this, serviceDef);
    return this.endpoint.bindHttp(serviceDef.address(), serviceDef.port(), service, warpSettings.httpSettings());
  }

  ServiceRef bind(HttpsServiceDef serviceDef) {
    final WarpSettings warpSettings = serviceDef.warpSettings();
    final ServerPlaneHttpService service = new ServerPlaneHttpService(this, serviceDef);
    return this.endpoint.bindHttps(serviceDef.address(), serviceDef.port(), service, warpSettings.httpSettings());
  }

  public ServiceRef bind(String address, int port) {
    return bind(address, port, WarpSettings.standard());
  }

  public ServiceRef bind(String address, int port, WarpSettings warpSettings) {
    final WarpServiceDef serviceDef;
    if (warpSettings.tlsSettings() != null) {
      serviceDef = new HttpsServiceDef(address, port, null, null, warpSettings);
    } else {
      serviceDef = new HttpServiceDef(address, port, null, null, warpSettings);
    }
    final ServerPlaneHttpService service = new ServerPlaneHttpService(this, serviceDef);
    return this.endpoint.bindHttp(address, port, service, warpSettings.httpSettings());
  }

  @Override
  public PlanePolicy planePolicy() {
    return this.policy;
  }

  @Override
  public void setPlanePolicy(PlanePolicy policy) {
    this.policy = policy;
  }

  @Override
  public FingerTrieSeq<Authenticator> authenticators() {
    return this.authenticators;
  }

  @Override
  public void setAuthenticators(FingerTrieSeq<Authenticator> authenticators) {
    AUTHENTICATORS.set(this, authenticators);
  }

  @Override
  public void addAuthenticator(Authenticator authenticator) {
    FingerTrieSeq<Authenticator> oldAuthenticators;
    FingerTrieSeq<Authenticator> newAuthenticators;
    do {
      oldAuthenticators = this.authenticators;
      newAuthenticators = oldAuthenticators.appended(authenticator);
    } while (!AUTHENTICATORS.compareAndSet(this, oldAuthenticators, newAuthenticators));
  }

  @Override
  public <S extends Agent> AgentType<S> agentClass(Class<? extends S> agentClass) {
    return AgentClass.apply(agentClass);
  }

  @Override
  public boolean hasAgentType(String name) {
    return this.agentTypes.containsKey(name);
  }

  @SuppressWarnings("unchecked")
  @Override
  public <S extends Agent> AgentType<S> getAgentType(String name) {
    return (AgentType<S>) this.agentTypes.get(name);
  }

  @Override
  public void addAgentType(String name, AgentType<?> agentType) {
    HashTrieMap<String, AgentType<?>> oldAgentTypes;
    HashTrieMap<String, AgentType<?>> newAgentTypes;
    do {
      oldAgentTypes = this.agentTypes;
      newAgentTypes = oldAgentTypes.updated(name, agentType);
    } while (oldAgentTypes != newAgentTypes && !AGENT_TYPES.compareAndSet(this, oldAgentTypes, newAgentTypes));
  }

  @Override
  public void removeAgentType(String name) {
    HashTrieMap<String, AgentType<?>> oldAgentTypes;
    HashTrieMap<String, AgentType<?>> newAgentTypes;
    do {
      oldAgentTypes = this.agentTypes;
      newAgentTypes = oldAgentTypes.removed(name);
    } while (oldAgentTypes != newAgentTypes && !AGENT_TYPES.compareAndSet(this, oldAgentTypes, newAgentTypes));
  }

  @SuppressWarnings("unchecked")
  @Override
  public <S extends Agent> AgentType<S> getAgentRoute(Uri nodeUri) {
    return (AgentType<S>) this.agentRoutes.get(nodeUri);
  }

  @Override
  public void addAgentRoute(UriPattern pattern, AgentType<?> agentType) {
    UriMapper<AgentType<?>> oldAgentRoutes;
    UriMapper<AgentType<?>> newAgentRoutes;
    do {
      oldAgentRoutes = this.agentRoutes;
      newAgentRoutes = oldAgentRoutes.updated(pattern, agentType);
    } while (oldAgentRoutes != newAgentRoutes && !AGENT_ROUTES.compareAndSet(this, oldAgentRoutes, newAgentRoutes));
  }

  @Override
  public void addAgentRoute(String pattern, AgentType<?> agentType) {
    addAgentRoute(UriPattern.parse(pattern), agentType);
  }

  @Override
  public void removeAgentRoute(UriPattern pattern) {
    UriMapper<AgentType<?>> oldAgentRoutes;
    UriMapper<AgentType<?>> newAgentRoutes;
    do {
      oldAgentRoutes = this.agentRoutes;
      newAgentRoutes = oldAgentRoutes.removed(pattern);
    } while (oldAgentRoutes != newAgentRoutes && !AGENT_ROUTES.compareAndSet(this, oldAgentRoutes, newAgentRoutes));
  }

  @Override
  public MeshBinding createMesh(Uri meshUri) {
    return new MeshTable();
  }

  @Override
  public MeshBinding injectMesh(Uri meshUri, MeshBinding mesh) {
    return mesh;
  }

  @Override
  public PartBinding createPart(Uri meshUri, Value partKey) {
    return new PartTable();
  }

  @Override
  public PartBinding injectPart(Uri meshUri, Value partKey, PartBinding part) {
    if (!meshUri.isDefined()) {
      final Value partStoreName = Record.create(1).slot("part", partKey);
      final StoreBinding partStore = this.store.storeContext().openStore(partStoreName);
      part = new ServerPart(part, partStore);
    }
    return part;
  }

  @Override
  public HostBinding createHost(Uri meshUri, Value partKey, Uri hostUri) {
    if ("swim".equals(partKey.stringValue())) {
      return new HostTable();
    } else {
      return new RemoteHostClient(hostUri, this.endpoint, this.warpSettings);
    }
  }

  @Override
  public HostBinding injectHost(Uri meshUri, Value partKey, Uri hostUri, HostBinding host) {
    return host;
  }

  @Override
  public NodeBinding createNode(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri) {
    final AgentType<?> agentType = this.agentRoutes.get(nodeUri);
    if (agentType != null) {
      final Value props = agentType.props(nodeUri);
      return new AgentModel(agentType, props);
    } else {
      return null;
    }
  }

  public ServerPart getServerPart(Value partKey) {
    final PartBinding partBinding = this.root.getNetwork().getPart(partKey);
    if (partBinding != null) {
      return partBinding.unwrapPart(ServerPart.class);
    }
    return null;
  }

  @Override
  public NodeBinding injectNode(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    final ServerPart part = getServerPart(partKey);
    if (part == null) {
      return node;
    }

    final AgentType<?> agentType = getAgentRoute(nodeUri);
    final PlanePolicy planePolicy = this.policy;
    final Policy nodePolicy = planePolicy != null ? planePolicy.agentTypePolicy(agentType) : null;

    final Value nodeStoreName = Record.create(2).slot("part", partKey).slot("node", nodeUri.toString());
    final StoreBinding nodeStore = this.store.storeContext().openStore(nodeStoreName);

    return new ServerNode(node, nodeStore, nodePolicy);
  }

  @Override
  public LaneBinding injectLane(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri, LaneBinding lane) {
    final AgentType<?> agentType = getAgentRoute(nodeUri);
    final PlanePolicy planePolicy = this.policy;
    final Policy nodePolicy = planePolicy != null ? planePolicy.agentTypePolicy(agentType) : null;
    return new ServerLane(lane, nodePolicy);
  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    final FingerTrieSeq<Authenticator> authenticators = this.authenticators;
    if (authenticators != null) {
      for (int i = 0, n = authenticators.size(); i < n; i += 1) {
        final Authenticator authenticator = authenticators.get(i);
        final PolicyDirective<Identity> directive = authenticator.authenticate(credentials);
        if (directive != null) {
          return directive;
        }
      }
      return PolicyDirective.forbid();
    } else {
      return PolicyDirective.<Identity>allow(new Authenticated(
        credentials.requestUri(), credentials.fromUri(), Value.absent()));
    }
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.root.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.root.openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    // nop
  }

  @Override
  public void httpDownlink(HttpBinding http) {
    this.root.httpDownlink(http);
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.root.pushDown(pushRequest);
  }

  @Override
  public void trace(Object message) {
    // nop
  }

  @Override
  public void debug(Object message) {
    // nop
  }

  @Override
  public void info(Object message) {
    // nop
  }

  @Override
  public void warn(Object message) {
    // nop
  }

  @Override
  public void error(Object message) {
    // nop
  }

  @Override
  public void willOpen() {
    this.stage.start();
    this.root.open();
  }

  @Override
  public void didOpen() {
    // nop
  }

  @Override
  public void willLoad() {
    this.root.load();
  }

  @Override
  public void didLoad() {
    // nop
  }

  @Override
  public void willStart() {
    if (this.plane != null) {
      this.plane.willStart();
    }
    this.root.start();
    this.endpoint.start();
  }

  @Override
  public void didStart() {
    if (this.plane != null) {
      this.plane.didStart();
    }
  }

  @Override
  public void willStop() {
    if (this.plane != null) {
      this.plane.willStop();
    }
    this.endpoint.stop();
    this.root.stop();
  }

  @Override
  public void didStop() {
    if (this.plane != null) {
      this.plane.didStop();
    }
  }

  @Override
  public void willUnload() {
    this.root.unload();
    this.store.close();
  }

  @Override
  public void didUnload() {
    // nop
  }

  @Override
  public void willClose() {
    if (this.plane != null) {
      this.plane.willClose();
    }
    this.root.close();
  }

  @Override
  public void didClose() {
    if (this.plane != null) {
      this.plane.didClose();
    }
    this.store.close();
    this.stage.stop();
  }

  @Override
  public void didFail(Throwable error) {
    if (this.plane != null) {
      this.plane.didFail(error);
    }
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<ServerPlane, FingerTrieSeq<Authenticator>> AUTHENTICATORS =
      AtomicReferenceFieldUpdater.newUpdater(ServerPlane.class, (Class<FingerTrieSeq<Authenticator>>) (Class<?>) FingerTrieSeq.class, "authenticators");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<ServerPlane, HashTrieMap<String, AgentType<?>>> AGENT_TYPES =
      AtomicReferenceFieldUpdater.newUpdater(ServerPlane.class, (Class<HashTrieMap<String, AgentType<?>>>) (Class<?>) HashTrieMap.class, "agentTypes");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<ServerPlane, UriMapper<AgentType<?>>> AGENT_ROUTES =
      AtomicReferenceFieldUpdater.newUpdater(ServerPlane.class, (Class<UriMapper<AgentType<?>>>) (Class<?>) UriMapper.class, "agentRoutes");

  static void materializeAuthDefs(ServerPlane planeContext, Plane plane, PlaneDef planeDef) {
    if (planeDef == null) {
      return;
    }
    for (AuthDef authDef : planeDef.authDefs()) {
      materializeAuthDef(planeContext, plane, authDef);
    }
  }

  static void materializeAuthDef(ServerPlane planeContext, Plane plane, AuthDef authDef) {
    authDef.setContext(planeContext);
    planeContext.addAuthenticator(authDef);
  }

  static void materializeAgentTypeDefs(PlaneContext planeContext, Plane plane, PlaneDef planeDef) {
    if (planeDef == null) {
      return;
    }
    for (AgentTypeDef agentTypeDef : planeDef.agentTypeDefs().values()) {
      if (!planeContext.hasAgentType(agentTypeDef.name())) {
        materializeAgentTypeDef(planeContext, plane, agentTypeDef);
      }
    }
  }

  @SuppressWarnings("unchecked")
  static void materializeAgentTypeDef(PlaneContext planeContext, Plane plane, AgentTypeDef agentTypeDef) {
    try {
      final Class<? extends Agent> agentClass = (Class<? extends Agent>) Class.forName(agentTypeDef.className());
      final AgentType<?> agentType = AgentClass.apply(agentClass);
      planeContext.addAgentType(agentTypeDef.name(), agentType);

      UriPattern route = agentTypeDef.route();
      if (route == null) {
        final SwimRoute swimRoute = agentClass.getAnnotation(SwimRoute.class);
        if (swimRoute != null) {
          route = UriPattern.parse(swimRoute.value());
          if (agentTypeDef != null) {
            agentTypeDef = agentTypeDef.route(route);
          }
        }
      }
      if (route != null) {
        planeContext.addAgentRoute(route, agentType);
      }

      agentType.setAgentTypeContext(agentTypeDef);
    } catch (ClassNotFoundException cause) {
      throw new PlaneException(cause);
    }
  }

  static void reflectAgentTypeFields(Class<?> type, PlaneContext planeContext, Plane plane, PlaneDef planeDef) {
    if (type == null) {
      return;
    }
    reflectAgentTypeFields(type.getSuperclass(), planeContext, plane, planeDef);
    final Field[] fields = type.getDeclaredFields();
    for (Field field : fields) {
      if (AgentType.class.isAssignableFrom(field.getType())) {
        field.setAccessible(true);
        reflectAgentTypeField(field, planeContext, plane, planeDef);
      }
    }
  }

  static void reflectAgentTypeField(Field field, PlaneContext planeContext, Plane plane, PlaneDef planeDef) {
    try {
      final AgentType<?> agentType = (AgentType) field.get(plane);
      final Class<?> agentClass = agentType.type();

      String name = null;
      SwimAgent swimAgent = field.getAnnotation(SwimAgent.class);
      if (swimAgent == null) {
        swimAgent = agentClass.getAnnotation(SwimAgent.class);
      }
      if (swimAgent != null) {
        name = swimAgent.name();
      }
      if (name == null || name.length() == 0) {
        name = agentClass.getName();
      }
      planeContext.addAgentType(name, agentType);

      AgentTypeDef agentTypeDef = planeDef != null ? planeDef.getAgentTypeDef(name) : null;

      UriPattern route = agentTypeDef != null ? agentTypeDef.route() : null;
      if (route == null) {
        SwimRoute swimRoute = field.getAnnotation(SwimRoute.class);
        if (swimRoute == null) {
          swimRoute = agentClass.getAnnotation(SwimRoute.class);
        }
        if (swimRoute != null) {
          route = UriPattern.parse(swimRoute.value());
          if (agentTypeDef != null) {
            agentTypeDef = agentTypeDef.route(route);
          }
        }
      }
      if (route != null) {
        planeContext.addAgentRoute(route, agentType);
      }

      if (agentTypeDef == null) {
        agentTypeDef = new AgentTypeDef(name, route, agentClass.getName());
      }
      agentType.setAgentTypeContext(agentTypeDef);
    } catch (IllegalAccessException cause) {
      throw new PlaneException(cause);
    }
  }
}
