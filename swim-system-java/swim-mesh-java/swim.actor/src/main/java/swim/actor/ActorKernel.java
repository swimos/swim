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

package swim.actor;

import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.agent.AgentDef;
import swim.api.auth.Authenticator;
import swim.api.auth.AuthenticatorDef;
import swim.api.plane.PlaneDef;
import swim.api.plane.PlaneException;
import swim.api.plane.PlaneFactory;
import swim.api.space.Space;
import swim.api.space.SpaceDef;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;
import swim.concurrent.StageDef;
import swim.kernel.KernelContext;
import swim.kernel.KernelProxy;
import swim.runtime.EdgeAddress;
import swim.runtime.HostDef;
import swim.runtime.LaneDef;
import swim.runtime.LogDef;
import swim.runtime.MeshDef;
import swim.runtime.NodeDef;
import swim.runtime.PartDef;
import swim.runtime.PartPredicate;
import swim.runtime.PolicyDef;
import swim.store.StoreDef;
import swim.structure.Item;
import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriMapper;
import swim.uri.UriPattern;

public class ActorKernel extends KernelProxy {
  final double kernelPriority;
  volatile HashTrieMap<String, ActorSpace> spaces;

  public ActorKernel(double kernelPriority) {
    this.kernelPriority = kernelPriority;
    this.spaces = HashTrieMap.empty();
  }

  public ActorKernel() {
    this(KERNEL_PRIORITY);
  }

  @Override
  public final double kernelPriority() {
    return this.kernelPriority;
  }

  @Override
  public SpaceDef defineSpace(Item spaceConfig) {
    final SpaceDef spaceDef = defineActorSpace(spaceConfig);
    return spaceDef != null ? spaceDef : super.defineSpace(spaceConfig);
  }

  public ActorSpaceDef defineActorSpace(Item spaceConfig) {
    final Value value = spaceConfig.toValue();
    final Value header = value.getAttr("fabric");
    if (header.isDefined()) {
      final String fabricProvider = header.get("provider").stringValue(null);
      if (fabricProvider == null || ActorKernel.class.getName().equals(fabricProvider)) {
        final KernelContext kernel = kernelWrapper().unwrapKernel(KernelContext.class);
        final String spaceName = spaceConfig.key().stringValue(null);
        FingerTrieSeq<PlaneDef> planeDefs = FingerTrieSeq.empty();
        HashTrieMap<String, AuthenticatorDef> authenticatorDefs = HashTrieMap.empty();
        HashTrieMap<Uri, MeshDef> meshDefs = HashTrieMap.empty();
        HashTrieMap<Value, PartDef> partDefs = HashTrieMap.empty();
        UriMapper<HostDef> hostDefs = UriMapper.empty();
        UriMapper<NodeDef> nodeDefs = UriMapper.empty();
        UriMapper<LaneDef> laneDefs = UriMapper.empty();
        LogDef logDef = null;
        PolicyDef policyDef = null;
        StageDef stageDef = null;
        StoreDef storeDef = null;
        for (int i = 0, n = value.length(); i < n; i += 1) {
          final Item item = value.getItem(i);
          final PlaneDef planeDef = kernel.definePlane(item);
          if (planeDef != null) {
            planeDefs = planeDefs.appended(planeDef);
            continue;
          }
          final AuthenticatorDef authenticatorDef = kernel.defineAuthenticator(item);
          if (authenticatorDef != null) {
            authenticatorDefs = authenticatorDefs.updated(authenticatorDef.authenticatorName(), authenticatorDef);
            continue;
          }
          final MeshDef meshDef = kernel.defineMesh(item);
          if (meshDef != null) {
            meshDefs = meshDefs.updated(meshDef.meshUri(), meshDef);
            continue;
          }
          final PartDef partDef = kernel.definePart(item);
          if (partDef != null) {
            partDefs = partDefs.updated(partDef.partKey(), partDef);
            continue;
          }
          final HostDef hostDef = kernel.defineHost(item);
          if (hostDef != null) {
            hostDefs = hostDefs.updated(hostDef.hostPattern(), hostDef);
            continue;
          }
          final NodeDef nodeDef = kernel.defineNode(item);
          if (nodeDef != null) {
            nodeDefs = nodeDefs.updated(nodeDef.nodePattern(), nodeDef);
            continue;
          }
          final LaneDef laneDef = kernel.defineLane(item);
          if (laneDef != null) {
            laneDefs = laneDefs.updated(laneDef.lanePattern(), laneDef);
            continue;
          }
          final LogDef newLogDef = kernel.defineLog(item);
          if (newLogDef != null) {
            logDef = newLogDef;
            continue;
          }
          final PolicyDef newPolicyDef = kernel.definePolicy(item);
          if (newPolicyDef != null) {
            policyDef = newPolicyDef;
            continue;
          }
          final StageDef newStageDef = kernel.defineStage(item);
          if (newStageDef != null) {
            stageDef = newStageDef;
            continue;
          }
          final StoreDef newStoreDef = kernel.defineStore(item);
          if (newStoreDef != null) {
            storeDef = newStoreDef;
            continue;
          }
        }
        return new ActorSpaceDef(spaceName, planeDefs, authenticatorDefs, meshDefs,
                                 partDefs, hostDefs, nodeDefs, laneDefs,
                                 logDef, policyDef, stageDef, storeDef);
      }
    }
    return null;
  }

  @Override
  public Space openSpace(SpaceDef spaceDef) {
    if (spaceDef instanceof ActorSpaceDef) {
      return openActorSpace((ActorSpaceDef) spaceDef);
    } else {
      return super.openSpace(spaceDef);
    }
  }

  public ActorSpace openActorSpace(ActorSpaceDef spaceDef) {
    final String spaceName = spaceDef.spaceName;
    ActorSpace space = null;
    do {
      final HashTrieMap<String, ActorSpace> oldSpaces = this.spaces;
      final ActorSpace oldSpace = oldSpaces.get(spaceName);
      if (oldSpace == null) {
        if (space == null) {
          space = createActorSpace(spaceName, spaceDef);
        }
        final HashTrieMap<String, ActorSpace> newSpaces = oldSpaces.updated(spaceName, space);
        if (SPACES.compareAndSet(this, oldSpaces, newSpaces)) {
          if (isStarted()) {
            space.start();
          }
          break;
        }
      } else {
        space = oldSpace;
        break;
      }
    } while (true);
    return space;
  }

  protected ActorSpace createActorSpace(String spaceName, ActorSpaceDef spaceDef) {
    final KernelContext kernel = kernelWrapper().unwrapKernel(KernelContext.class);
    final EdgeAddress edgeAddress = new EdgeAddress(spaceName);
    final ActorSpace space = new ActorSpace(edgeAddress, spaceDef, kernel);
    createAuthenticators(space, spaceDef);
    createPlanes(space, spaceDef);
    return space;
  }

  protected void createAuthenticators(ActorSpace space, ActorSpaceDef spaceDef) {
    for (AuthenticatorDef authenticatorDef : spaceDef.authenticatorDefs()) {
      if (space.getAuthenticator(authenticatorDef.authenticatorName()) == null) {
        createAuthenticator(space, authenticatorDef);
      }
    }
  }

  protected void createAuthenticator(ActorSpace space, AuthenticatorDef authenticatorDef) {
    final KernelContext kernel = kernelWrapper().unwrapKernel(KernelContext.class);
    Authenticator authenticator = kernel.createAuthenticator(authenticatorDef, null);
    if (authenticator != null) {
      authenticator = kernel.injectAuthenticator(authenticator);
    }
    if (authenticator != null) {
      space.addAuthenticator(authenticatorDef.authenticatorName(), authenticator);
    }
  }

  protected void createPlanes(ActorSpace space, ActorSpaceDef spaceDef) {
    for (PlaneDef planeDef : spaceDef.planeDefs()) {
      if (space.getPlane(planeDef.planeName()) == null) {
        createPlane(space, planeDef);
      }
    }
  }

  protected void createPlane(ActorSpace space, PlaneDef planeDef) {
    final KernelContext kernel = kernelWrapper().unwrapKernel(KernelContext.class);
    final PlaneFactory<?> planeFactory = kernel.createPlaneFactory(planeDef, null);
    if (planeFactory != null) {
      space.openPlane(planeDef.planeName(), planeFactory);
    } else {
      throw new PlaneException("No factory for plane: " + planeDef.planeName());
    }
  }

  @Override
  public Space getSpace(String spaceName) {
    Space space = getActorSpace(spaceName);
    if (space == null) {
      space = super.getSpace(spaceName);
    }
    return space;
  }

  public ActorSpace getActorSpace(String spaceName) {
    return this.spaces.get(spaceName);
  }

  @Override
  public MeshDef defineMesh(Item meshConfig) {
    final MeshDef meshDef = defineActorMesh(meshConfig);
    return meshDef != null ? meshDef : super.defineMesh(meshConfig);
  }

  public ActorMeshDef defineActorMesh(Item meshConfig) {
    final Value value = meshConfig.toValue();
    final Value header = value.getAttr("mesh");
    if (header.isDefined()) {
      final String fabricProvider = header.get("provider").stringValue(null);
      if (fabricProvider == null || ActorKernel.class.getName().equals(fabricProvider)) {
        final KernelContext kernel = kernelWrapper().unwrapKernel(KernelContext.class);
        Uri meshUri = Uri.empty();
        HashTrieMap<Value, PartDef> partDefs = HashTrieMap.empty();
        UriMapper<HostDef> hostDefs = UriMapper.empty();
        UriMapper<NodeDef> nodeDefs = UriMapper.empty();
        UriMapper<LaneDef> laneDefs = UriMapper.empty();
        LogDef logDef = null;
        PolicyDef policyDef = null;
        StageDef stageDef = null;
        StoreDef storeDef = null;
        for (int i = 0, n = value.length(); i < n; i += 1) {
          final Item item = value.getItem(i);
          if (item.keyEquals("uri")) {
            meshUri = item.toValue().cast(Uri.form(), meshUri);
            continue;
          }
          final PartDef partDef = kernel.definePart(item);
          if (partDef != null) {
            partDefs = partDefs.updated(partDef.partKey(), partDef);
            continue;
          }
          final HostDef hostDef = kernel.defineHost(item);
          if (hostDef != null) {
            hostDefs = hostDefs.updated(hostDef.hostPattern(), hostDef);
            continue;
          }
          final NodeDef nodeDef = kernel.defineNode(item);
          if (nodeDef != null) {
            nodeDefs = nodeDefs.updated(nodeDef.nodePattern(), nodeDef);
            continue;
          }
          final LaneDef laneDef = kernel.defineLane(item);
          if (laneDef != null) {
            laneDefs = laneDefs.updated(laneDef.lanePattern(), laneDef);
            continue;
          }
          final LogDef newLogDef = kernel.defineLog(item);
          if (newLogDef != null) {
            logDef = newLogDef;
            continue;
          }
          final PolicyDef newPolicyDef = kernel.definePolicy(item);
          if (newPolicyDef != null) {
            policyDef = newPolicyDef;
            continue;
          }
          final StageDef newStageDef = kernel.defineStage(item);
          if (newStageDef != null) {
            stageDef = newStageDef;
            continue;
          }
          final StoreDef newStoreDef = kernel.defineStore(item);
          if (newStoreDef != null) {
            storeDef = newStoreDef;
            continue;
          }
        }
        return new ActorMeshDef(meshUri, partDefs, hostDefs, nodeDefs, laneDefs,
                                logDef, policyDef, stageDef, storeDef);
      }
    }
    return null;
  }

  @Override
  public PartDef definePart(Item partConfig) {
    final PartDef partDef = defineActorPart(partConfig);
    return partDef != null ? partDef : super.definePart(partConfig);
  }

  public ActorPartDef defineActorPart(Item partConfig) {
    final Value value = partConfig.toValue();
    final Value header = value.getAttr("part");
    if (header.isDefined()) {
      final String fabricProvider = header.get("provider").stringValue(null);
      if (fabricProvider == null || ActorKernel.class.getName().equals(fabricProvider)) {
        final KernelContext kernel = kernelWrapper().unwrapKernel(KernelContext.class);
        Value partKey = Value.extant();
        PartPredicate predicate = PartPredicate.any();
        boolean isGateway = false;
        UriMapper<HostDef> hostDefs = UriMapper.empty();
        UriMapper<NodeDef> nodeDefs = UriMapper.empty();
        UriMapper<LaneDef> laneDefs = UriMapper.empty();
        LogDef logDef = null;
        PolicyDef policyDef = null;
        StageDef stageDef = null;
        StoreDef storeDef = null;
        for (int i = 0, n = value.length(); i < n; i += 1) {
          final Item item = value.getItem(i);
          if (item.keyEquals("key")) {
            partKey = item.toValue();
            continue;
          }
          if (item.keyEquals("predicate")) {
            predicate = PartPredicate.fromValue(item.toValue());
            continue;
          }
          if (item.keyEquals("isGateway")) {
            isGateway = item.toValue().booleanValue(isGateway);
            continue;
          }
          final HostDef hostDef = kernel.defineHost(item);
          if (hostDef != null) {
            hostDefs = hostDefs.updated(hostDef.hostPattern(), hostDef);
            continue;
          }
          final NodeDef nodeDef = kernel.defineNode(item);
          if (nodeDef != null) {
            nodeDefs = nodeDefs.updated(nodeDef.nodePattern(), nodeDef);
            continue;
          }
          final LaneDef laneDef = kernel.defineLane(item);
          if (laneDef != null) {
            laneDefs = laneDefs.updated(laneDef.lanePattern(), laneDef);
            continue;
          }
          final LogDef newLogDef = kernel.defineLog(item);
          if (newLogDef != null) {
            logDef = newLogDef;
            continue;
          }
          final PolicyDef newPolicyDef = kernel.definePolicy(item);
          if (newPolicyDef != null) {
            policyDef = newPolicyDef;
            continue;
          }
          final StageDef newStageDef = kernel.defineStage(item);
          if (newStageDef != null) {
            stageDef = newStageDef;
            continue;
          }
          final StoreDef newStoreDef = kernel.defineStore(item);
          if (newStoreDef != null) {
            storeDef = newStoreDef;
            continue;
          }
        }
        return new ActorPartDef(partKey, predicate, isGateway, hostDefs, nodeDefs,
                               laneDefs, logDef, policyDef, stageDef, storeDef);
      }
    }
    return null;
  }

  @Override
  public HostDef defineHost(Item hostConfig) {
    final HostDef hostDef = defineActorHost(hostConfig);
    return hostDef != null ? hostDef : super.defineHost(hostConfig);
  }

  public ActorHostDef defineActorHost(Item hostConfig) {
    final Value value = hostConfig.toValue();
    final Value header = value.getAttr("host");
    if (header.isDefined()) {
      final String fabricProvider = header.get("provider").stringValue(null);
      if (fabricProvider == null || ActorKernel.class.getName().equals(fabricProvider)) {
        final KernelContext kernel = kernelWrapper().unwrapKernel(KernelContext.class);
        UriPattern hostPattern = UriPattern.empty();
        boolean isPrimary = false;
        boolean isReplica = false;
        UriMapper<NodeDef> nodeDefs = UriMapper.empty();
        UriMapper<LaneDef> laneDefs = UriMapper.empty();
        LogDef logDef = null;
        PolicyDef policyDef = null;
        StageDef stageDef = null;
        StoreDef storeDef = null;
        for (int i = 0, n = value.length(); i < n; i += 1) {
          final Item item = value.getItem(i);
          if (item.keyEquals("uri") || item.keyEquals("pattern")) {
            hostPattern = item.toValue().cast(UriPattern.form(), hostPattern);
            continue;
          }
          if (item.keyEquals("primary") || item.keyEquals("isPrimary")) {
            isPrimary = item.toValue().booleanValue(isPrimary);
            continue;
          }
          if (item.keyEquals("replica") || item.keyEquals("isReplica")) {
            isReplica = item.toValue().booleanValue(isReplica);
            continue;
          }
          final NodeDef nodeDef = kernel.defineNode(item);
          if (nodeDef != null) {
            nodeDefs = nodeDefs.updated(nodeDef.nodePattern(), nodeDef);
            continue;
          }
          final LaneDef laneDef = kernel.defineLane(item);
          if (laneDef != null) {
            laneDefs = laneDefs.updated(laneDef.lanePattern(), laneDef);
            continue;
          }
          final LogDef newLogDef = kernel.defineLog(item);
          if (newLogDef != null) {
            logDef = newLogDef;
            continue;
          }
          final PolicyDef newPolicyDef = kernel.definePolicy(item);
          if (newPolicyDef != null) {
            policyDef = newPolicyDef;
            continue;
          }
          final StageDef newStageDef = kernel.defineStage(item);
          if (newStageDef != null) {
            stageDef = newStageDef;
            continue;
          }
          final StoreDef newStoreDef = kernel.defineStore(item);
          if (newStoreDef != null) {
            storeDef = newStoreDef;
            continue;
          }
        }
        return new ActorHostDef(hostPattern, isPrimary, isReplica, nodeDefs,
                                laneDefs, logDef, policyDef, stageDef, storeDef);
      }
    }
    return null;
  }

  @Override
  public NodeDef defineNode(Item nodeConfig) {
    final NodeDef nodeDef = defineActorNode(nodeConfig);
    return nodeDef != null ? nodeDef : super.defineNode(nodeConfig);
  }

  public ActorNodeDef defineActorNode(Item nodeConfig) {
    final Value value = nodeConfig.toValue();
    final Value header = value.getAttr("node");
    if (header.isDefined()) {
      final String fabricProvider = header.get("provider").stringValue(null);
      if (fabricProvider == null || ActorKernel.class.getName().equals(fabricProvider)) {
        final KernelContext kernel = kernelWrapper().unwrapKernel(KernelContext.class);
        UriPattern nodePattern = null;
        FingerTrieSeq<AgentDef> agentDefs = FingerTrieSeq.empty();
        UriMapper<LaneDef> laneDefs = UriMapper.empty();
        LogDef logDef = null;
        PolicyDef policyDef = null;
        StageDef stageDef = null;
        StoreDef storeDef = null;
        for (int i = 0, n = value.length(); i < n; i += 1) {
          final Item item = value.getItem(i);
          if (item.keyEquals("uri") || item.keyEquals("pattern")) {
            nodePattern = item.toValue().cast(UriPattern.form(), nodePattern);
            continue;
          }
          final AgentDef agentDef = kernel.defineAgent(item);
          if (agentDef != null) {
            agentDefs = agentDefs.appended(agentDef);
            continue;
          }
          final LaneDef laneDef = kernel.defineLane(item);
          if (laneDef != null) {
            laneDefs = laneDefs.updated(laneDef.lanePattern(), laneDef);
            continue;
          }
          final LogDef newLogDef = kernel.defineLog(item);
          if (newLogDef != null) {
            logDef = newLogDef;
            continue;
          }
          final PolicyDef newPolicyDef = kernel.definePolicy(item);
          if (newPolicyDef != null) {
            policyDef = newPolicyDef;
            continue;
          }
          final StageDef newStageDef = kernel.defineStage(item);
          if (newStageDef != null) {
            stageDef = newStageDef;
            continue;
          }
          final StoreDef newStoreDef = kernel.defineStore(item);
          if (newStoreDef != null) {
            storeDef = newStoreDef;
            continue;
          }
        }
        if (nodePattern != null) {
          return new ActorNodeDef(nodePattern, agentDefs, laneDefs,
                                  logDef, policyDef, stageDef, storeDef);
        }
      }
    }
    return null;
  }

  @Override
  public LaneDef defineLane(Item laneConfig) {
    final LaneDef laneDef = defineActorLane(laneConfig);
    return laneDef != null ? laneDef : super.defineLane(laneConfig);
  }

  public ActorLaneDef defineActorLane(Item laneConfig) {
    final Value value = laneConfig.toValue();
    final Value header = value.getAttr("lane");
    if (header.isDefined()) {
      final String fabricProvider = header.get("provider").stringValue(null);
      if (fabricProvider == null || ActorKernel.class.getName().equals(fabricProvider)) {
        final KernelContext kernel = kernelWrapper().unwrapKernel(KernelContext.class);
        final String laneType = header.get("type").stringValue(null);
        UriPattern lanePattern = null;
        LogDef logDef = null;
        PolicyDef policyDef = null;
        StageDef stageDef = null;
        StoreDef storeDef = null;
        for (int i = 0, n = value.length(); i < n; i += 1) {
          final Item item = value.getItem(i);
          if (item.keyEquals("uri") || item.keyEquals("pattern")) {
            lanePattern = item.toValue().cast(UriPattern.form(), lanePattern);
            continue;
          }
          final LogDef newLogDef = kernel.defineLog(item);
          if (newLogDef != null) {
            logDef = newLogDef;
            continue;
          }
          final PolicyDef newPolicyDef = kernel.definePolicy(item);
          if (newPolicyDef != null) {
            policyDef = newPolicyDef;
            continue;
          }
          final StageDef newStageDef = kernel.defineStage(item);
          if (newStageDef != null) {
            stageDef = newStageDef;
            continue;
          }
          final StoreDef newStoreDef = kernel.defineStore(item);
          if (newStoreDef != null) {
            storeDef = newStoreDef;
            continue;
          }
        }
        if (lanePattern != null) {
          return new ActorLaneDef(lanePattern, laneType, logDef, policyDef, stageDef, storeDef);
        }
      }
    }
    return null;
  }

  @Override
  public void didStart() {
    for (ActorSpace space : this.spaces.values()) {
      space.start();
    }
  }

  @Override
  public void willStop() {
    for (ActorSpace space : this.spaces.values()) {
      space.stop();
    }
  }

  private static final double KERNEL_PRIORITY = 1.0;

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<ActorKernel, HashTrieMap<String, ActorSpace>> SPACES =
      AtomicReferenceFieldUpdater.newUpdater(ActorKernel.class, (Class<HashTrieMap<String, ActorSpace>>) (Class<?>) HashTrieMap.class, "spaces");

  public static ActorKernel fromValue(Value moduleConfig) {
    final Value header = moduleConfig.getAttr("kernel");
    final String kernelClassName = header.get("class").stringValue(null);
    if (kernelClassName == null || ActorKernel.class.getName().equals(kernelClassName)) {
      final double kernelPriority = header.get("priority").doubleValue(KERNEL_PRIORITY);
      return new ActorKernel(kernelPriority);
    }
    return null;
  }
}
