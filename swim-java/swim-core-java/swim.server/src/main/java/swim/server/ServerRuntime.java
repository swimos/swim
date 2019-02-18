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

import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.plane.Plane;
import swim.api.plane.PlaneException;
import swim.api.router.Router;
import swim.collections.HashTrieMap;
import swim.concurrent.Theater;
import swim.io.ServiceRef;
import swim.io.TlsSettings;
import swim.io.http.HttpEndpoint;
import swim.io.warp.WarpSettings;
import swim.linker.PlaneDef;
import swim.linker.ServerDef;
import swim.linker.ServerLinker;
import swim.linker.ServiceDef;
import swim.linker.StoreDef;
import swim.linker.WarpServiceDef;
import swim.recon.Recon;
import swim.runtime.HostBinding;
import swim.runtime.MeshBinding;
import swim.runtime.PartBinding;
import swim.runtime.RootBinding;
import swim.runtime.RouterContext;
import swim.runtime.router.TableRouter;
import swim.store.Storage;
import swim.store.StorageLoader;
import swim.store.mem.MemStorage;
import swim.uri.Uri;

public class ServerRuntime implements ServerLinker {
  volatile HashTrieMap<String, ServerPlane> planes;
  ServerShutdownHook shutdownHook;
  RouterContext router;

  public ServerRuntime() {
    this.planes = HashTrieMap.empty();
    this.router = new TableRouter(); // TODO: remove; always require setRouter?
  }

  @Override
  public final RouterContext router() {
    return this.router;
  }

  @Override
  public void setRouter(Router router) {
    if (router instanceof RouterContext) {
      this.router = (RouterContext) router;
    } else {
      throw new IllegalArgumentException(router.toString());
    }
  }

  public HashTrieMap<String, ServerPlane> planes() {
    return this.planes;
  }

  @Override
  public Plane getPlane(String name) {
    final ServerPlane plane = this.planes.get(name);
    if (plane != null) {
      return plane.getPlane();
    } else {
      return null;
    }
  }

  @Override
  public ServerRuntime materialize(ServerDef serverDef) {
    return materialize(getClass().getClassLoader(), serverDef);
  }

  public ServerRuntime materialize(ClassLoader loader, ServerDef serverDef) {
    final StoreDef storeDef = serverDef.storeDef();
    for (PlaneDef planeDef : serverDef.planeDefs().values()) {
      materializePlane(loader, planeDef, storeDef);
    }
    for (ServiceDef serviceDef : serverDef.serviceDefs().values()) {
      bind(serviceDef);
    }
    return this;
  }

  @SuppressWarnings("unchecked")
  public ServerPlane materializePlane(ClassLoader loader, PlaneDef planeDef, StoreDef storeDef) {
    try {
      return materializePlane(planeDef.name(),
        (Class<? extends Plane>) Class.forName(planeDef.className(), true, loader),
        planeDef, storeDef);
    } catch (ClassNotFoundException cause) {
      throw new PlaneException(cause);
    }
  }


  public ServerPlane materializePlane(String name, Class<? extends Plane> planeClass) {
    return materializePlane(name, planeClass, null, new StoreDef(null));
  }

  public ServerPlane materializePlane(String name, Class<? extends Plane> planeClass, StoreDef storeDef) {
    return materializePlane(name, planeClass, null, storeDef);
  }

  public ServerPlane materializePlane(String name, Class<? extends Plane> planeClass, PlaneDef planeDef, StoreDef storeDef) {
    final Theater stage = new Theater();
    final RootBinding root = this.router.createRoot();
    final ServerPlane planeContext = new ServerPlane(stage, new HttpEndpoint(stage), root);

    root.setRootContext(planeContext);
    planeContext.setWarpSettings(planeDef != null
        ? planeDef.warpSettings()
        : WarpSettings.standard().tlsSettings(TlsSettings.standard()));
    Storage storage = StorageLoader.loadStorage();
    if (storage == null) {
      storage = new MemStorage();
    }
    storage.init(planeContext, storeDef.settings());
    planeContext.setStoreDef(storeDef);
    planeContext.setStorage(storage);
    materializeImplicitMesh(planeContext);
    planeContext.materialize(planeClass, planeDef);
    addPlane(name, planeContext);

    return planeContext;
  }

  public void materializeImplicitMesh(ServerPlane planeContext) {
    final MeshBinding network = planeContext.root.openMesh(Uri.empty(), this.router.createMesh());

    planeContext.root.setNetwork(network);

    final PartBinding gateway = network.openGateway();
    final HostBinding hostBinding = gateway.openHost(Uri.empty(), this.router.createHost());
    gateway.setMaster(hostBinding);
  }
  
  public void addPlane(String name, ServerPlane plane) {
    HashTrieMap<String, ServerPlane> oldPlanes;
    HashTrieMap<String, ServerPlane> newPlanes;

    do {
      oldPlanes = this.planes;
      newPlanes = oldPlanes.updated(name, plane);
    } while (oldPlanes != newPlanes && !PLANES.compareAndSet(this, oldPlanes, newPlanes));

    if (this.shutdownHook != null) {
      plane.start();
    }
  }

  public void removePlane(String name) {
    HashTrieMap<String, ServerPlane> oldPlanes;
    HashTrieMap<String, ServerPlane> newPlanes;
    ServerPlane oldPlane;

    do {
      oldPlanes = this.planes;
      oldPlane = oldPlanes.get(name);

      if (oldPlane != null) {
        newPlanes = oldPlanes.removed(name);
      } else {
        break;
      }
    } while (!PLANES.compareAndSet(this, oldPlanes, newPlanes));

    if (oldPlane != null) {
      oldPlane.close();
    }
  }

  public ServiceRef bind(ServiceDef serviceDef) {
    if (serviceDef instanceof WarpServiceDef) {
      return bind((WarpServiceDef) serviceDef);
    } else {
      throw new IllegalArgumentException(Recon.toString(serviceDef.toValue()));
    }
  }

  ServiceRef bind(WarpServiceDef serviceDef) {
    final String name = serviceDef.planeName();
    final ServerPlane plane = this.planes.get(name);

    if (plane == null) {
      throw new PlaneException("Invalid service: " + Recon.toString(serviceDef.toValue()));
    }

    return plane.bind(serviceDef);
  }

  @Override
  public void start() {
    if (this.shutdownHook != null) {
      return;
    }

    this.shutdownHook = new ServerShutdownHook(this);

    Runtime.getRuntime().addShutdownHook(this.shutdownHook);

    for (ServerPlane plane : this.planes.values()) {
      plane.start();
    }
  }

  @Override
  public void stop() {
    if (this.shutdownHook == null) {
      return;
    }

    if (Thread.currentThread() != this.shutdownHook) {
      Runtime.getRuntime().removeShutdownHook(this.shutdownHook);
    }

    this.shutdownHook = null;

    for (ServerPlane plane : this.planes.values()) {
      plane.close();
    }
  }

  public void run() {
    start();

    final ServerShutdownHook shutdownHook = this.shutdownHook;

    while (shutdownHook.isAlive()) {
      try {
        shutdownHook.join();
      } catch (InterruptedException swallow) {
        // nop
      }
    }
  }

  @Override
  public void trace(Object message) {
    // TODO
  }

  @Override
  public void debug(Object message) {
    // TODO
  }

  @Override
  public void info(Object message) {
    // TODO
  }

  @Override
  public void warn(Object message) {
    // TODO
  }

  @Override
  public void error(Object message) {
    // TODO
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<ServerRuntime, HashTrieMap<String, ServerPlane>> PLANES =
      AtomicReferenceFieldUpdater.newUpdater(ServerRuntime.class, (Class<HashTrieMap<String, ServerPlane>>) (Class<?>) HashTrieMap.class, "planes");
}

final class ServerShutdownHook extends Thread {
  final ServerRuntime server;

  ServerShutdownHook(ServerRuntime server) {
    this.server = server;
  }

  @Override
  public void run() {
    this.server.stop();
  }
}
