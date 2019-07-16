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

import java.io.File;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import org.graalvm.polyglot.Engine;
import swim.api.agent.AgentRoute;
import swim.api.plane.PlaneFactory;
import swim.dynamic.api.SwimApi;
import swim.dynamic.java.JavaBase;
import swim.dynamic.observable.SwimObservable;
import swim.dynamic.structure.SwimStructure;
import swim.kernel.AgentRouteDef;
import swim.kernel.KernelProxy;
import swim.kernel.PlaneDef;
import swim.structure.Item;
import swim.structure.Value;
import swim.uri.UriPath;
import swim.uri.UriPattern;
import swim.vm.js.JsCachedModuleResolver;
import swim.vm.js.JsHostRuntime;
import swim.vm.js.JsModuleResolver;
import swim.vm.js.JsNodeModuleResolver;
import swim.vm.js.JsRuntime;

public class JsKernel extends KernelProxy {
  final double kernelPriority;
  volatile Engine jsEngine;
  volatile JsRuntime jsRuntime;
  volatile UriPath rootPath;

  public JsKernel(double kernelPriority) {
    this.kernelPriority = kernelPriority;
  }

  public JsKernel() {
    this(KERNEL_PRIORITY);
  }

  @Override
  public final double kernelPriority() {
    return this.kernelPriority;
  }

  protected Engine createJsEngine() {
    // TODO: configure from moduleConfig
    return Engine.newBuilder()
        .build();
  }

  protected JsModuleResolver createJsModuleResolver() {
    // TODO: configure module resolution strategy
    JsModuleResolver moduleResolver = new JsNodeModuleResolver(rootPath());
    // TODO: configure source cache
    moduleResolver = new JsCachedModuleResolver(moduleResolver);
    return moduleResolver;
  }

  protected JsRuntime createJsRuntime() {
    final JsModuleResolver moduleResolver = createJsModuleResolver();
    final JsHostRuntime runtime = new JsHostRuntime(moduleResolver);

    runtime.addHostLibrary(JavaBase.LIBRARY);

    runtime.addHostLibrary(SwimStructure.LIBRARY);
    runtime.addHostModule("@swim/structure", SwimStructure.LIBRARY);

    runtime.addHostLibrary(SwimObservable.LIBRARY);
    runtime.addHostModule("@swim/observable", SwimObservable.LIBRARY);

    runtime.addHostLibrary(SwimApi.LIBRARY);
    runtime.addHostModule("@swim/api", SwimApi.LIBRARY);

    return runtime;
  }

  protected UriPath createRootPath() {
    return UriPath.parse(new File("").getAbsolutePath().replace('\\', '/'));
  }

  public final Engine jsEngine() {
    Engine jsEngine;
    Engine newJsEngine = null;
    do {
      final Engine oldJsEngine = this.jsEngine;
      if (oldJsEngine != null) {
        jsEngine = oldJsEngine;
        if (newJsEngine != null) {
          // Lost creation race.
          newJsEngine.close();
          newJsEngine = null;
        }
      } else {
        if (newJsEngine == null) {
          newJsEngine = createJsEngine();
        }
        if (JS_ENGINE.compareAndSet(this, oldJsEngine, newJsEngine)) {
          jsEngine = newJsEngine;
        } else {
          continue;
        }
      }
      break;
    } while (true);
    return jsEngine;
  }

  public final JsRuntime jsRuntime() {
    JsRuntime jsRuntime;
    JsRuntime newJsRuntime = null;
    do {
      final JsRuntime oldJsRuntime = this.jsRuntime;
      if (oldJsRuntime != null) {
        jsRuntime = oldJsRuntime;
        if (newJsRuntime != null) {
          // Lost creation race.
          newJsRuntime = null;
        }
      } else {
        if (newJsRuntime == null) {
          newJsRuntime = createJsRuntime();
        }
        if (JS_RUNTIME.compareAndSet(this, oldJsRuntime, newJsRuntime)) {
          jsRuntime = newJsRuntime;
        } else {
          continue;
        }
      }
      break;
    } while (true);
    return jsRuntime;
  }

  public final UriPath rootPath() {
    UriPath rootPath;
    UriPath newRootPath = null;
    do {
      final UriPath oldRootPath = this.rootPath;
      if (oldRootPath != null) {
        rootPath = oldRootPath;
        if (newRootPath != null) {
          // Lost creation race.
          newRootPath = null;
        }
      } else {
        if (newRootPath == null) {
          newRootPath = createRootPath();
        }
        if (ROOT_PATH.compareAndSet(this, oldRootPath, newRootPath)) {
          rootPath = newRootPath;
        } else {
          continue;
        }
      }
      break;
    } while (true);
    return rootPath;
  }

  public void setRootPath(UriPath rootPath) {
    ROOT_PATH.set(this, rootPath);
  }

  @Override
  public PlaneDef definePlane(Item planeConfig) {
    final PlaneDef planeDef = defineJsPlane(planeConfig);
    return planeDef != null ? planeDef : super.definePlane(planeConfig);
  }

  public JsPlaneDef defineJsPlane(Item planeConfig) {
    final Value value = planeConfig.toValue();
    final Value header = value.getAttr("plane");
    if (header.isDefined()) {
      final UriPath planeModulePath = header.get("js").cast(UriPath.pathForm());
      if (planeModulePath != null) {
        final String planeName = planeConfig.key().stringValue(planeModulePath.toString());
        return new JsPlaneDef(planeName, planeModulePath);
      }
    }
    return null;
  }

  @Override
  public PlaneFactory<?> createPlaneFactory(PlaneDef planeDef, ClassLoader classLoader) {
    if (planeDef instanceof JsPlaneDef) {
      return createJsPlaneFactory((JsPlaneDef) planeDef);
    } else {
      return super.createPlaneFactory(planeDef, classLoader);
    }
  }

  public JsPlaneFactory createJsPlaneFactory(JsPlaneDef planeDef) {
    return new JsPlaneFactory(this, rootPath(), planeDef);
  }

  @Override
  public AgentRouteDef defineAgentRoute(Item agentRouteConfig) {
    final AgentRouteDef agentRouteDef = defineJsAgentRoute(agentRouteConfig);
    return agentRouteDef != null ? agentRouteDef : super.defineAgentRoute(agentRouteConfig);
  }

  public JsAgentRouteDef defineJsAgentRoute(Item agentRouteConfig) {
    final Value value = agentRouteConfig.toValue();
    final Value header = value.getAttr("route");
    if (header.isDefined()) {
      final String agentProvider = header.get("provider").stringValue(null);
      final UriPath agentModulePath = value.get("jsMain").cast(UriPath.pathForm());
      if (agentProvider != null && JsKernel.class.getName().equals(agentProvider)
          || agentProvider == null && agentModulePath != null) {
        final String routeName = agentRouteConfig.key().stringValue(agentModulePath.toString());
        final UriPattern pattern = value.get("pattern").cast(UriPattern.form());
        return new JsAgentRouteDef(routeName, agentModulePath, pattern);
      }
    }
    return null;
  }

  @Override
  public AgentRoute<?> createAgentRoute(AgentRouteDef agentRouteDef, ClassLoader classLoader) {
    if (agentRouteDef instanceof JsAgentRouteDef) {
      return createJsAgentRoute((JsAgentRouteDef) agentRouteDef);
    } else {
      return super.createAgentRoute(agentRouteDef, classLoader);
    }
  }

  public JsAgentFactory createJsAgentRoute(JsAgentRouteDef agentRouteDef) {
    return new JsAgentFactory(this, rootPath(), agentRouteDef);
  }

  private static final double KERNEL_PRIORITY = 1.75;

  public static JsKernel fromValue(Value moduleConfig) {
    final Value header = moduleConfig.getAttr("kernel");
    final String kernelClassName = header.get("class").stringValue(null);
    if (kernelClassName == null || JsKernel.class.getName().equals(kernelClassName)) {
      final double kernelPriority = header.get("priority").doubleValue(KERNEL_PRIORITY);
      return new JsKernel(kernelPriority);
    }
    return null;
  }

  static final AtomicReferenceFieldUpdater<JsKernel, Engine> JS_ENGINE =
      AtomicReferenceFieldUpdater.newUpdater(JsKernel.class, Engine.class, "jsEngine");

  static final AtomicReferenceFieldUpdater<JsKernel, JsRuntime> JS_RUNTIME =
      AtomicReferenceFieldUpdater.newUpdater(JsKernel.class, JsRuntime.class, "jsRuntime");

  static final AtomicReferenceFieldUpdater<JsKernel, UriPath> ROOT_PATH =
      AtomicReferenceFieldUpdater.newUpdater(JsKernel.class, UriPath.class, "rootPath");
}
